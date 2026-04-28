use anchor_lang::prelude::*;

declare_id!("EsmThaTZhHLviAJFbpgaSTr6eCgUFGcSiboMRzb9JF6Z");

#[program]
pub mod tourchain_escrow {
    use super::*;

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        amount: u64,
        milestones: u8,
        created_at: i64,
    ) -> Result<()> {
        require!((1..=10).contains(&milestones), EscrowError::InvalidMilestones);
        let escrow = &mut ctx.accounts.escrow;

        escrow.tourist = ctx.accounts.tourist.key();
        escrow.guide = ctx.accounts.guide.key();
        escrow.admin = ctx.accounts.admin.key();
        escrow.amount = amount;
        escrow.released = 0;
        escrow.milestones = milestones;
        escrow.milestones_completed = 0;
        escrow.status = BookingStatus::Funded;
        escrow.created_at = created_at;
        escrow.dispute_deadline = created_at
            .checked_add(48 * 60 * 60)
            .ok_or(EscrowError::Overflow)?;
        escrow.bump = ctx.bumps.escrow;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.tourist.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_ctx, amount)?;

        emit!(EscrowCreated {
            escrow: escrow.key(),
            tourist: escrow.tourist,
            guide: escrow.guide,
            amount,
        });

        Ok(())
    }

    pub fn activate(ctx: Context<GuideAction>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == BookingStatus::Funded, EscrowError::InvalidStatus);
        escrow.status = BookingStatus::Active;
        emit!(EscrowActivated { escrow: escrow.key() });
        Ok(())
    }

    pub fn release_milestone(ctx: Context<ReleaseMilestone>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == BookingStatus::Active, EscrowError::InvalidStatus);
        require!(
            escrow.milestones_completed < escrow.milestones,
            EscrowError::InvalidStatus
        );

        let per_milestone = per_milestone_amount(escrow.amount, escrow.milestones)?;
        release_lamports(
            &ctx.accounts.vault.to_account_info(),
            &ctx.accounts.guide.to_account_info(),
            per_milestone,
        )?;
        escrow.released = escrow
            .released
            .checked_add(per_milestone)
            .ok_or(EscrowError::Overflow)?;
        escrow.milestones_completed = escrow
            .milestones_completed
            .checked_add(1)
            .ok_or(EscrowError::Overflow)?;

        emit!(MilestoneReleased {
            escrow: escrow.key(),
            amount: per_milestone,
            milestones_completed: escrow.milestones_completed,
        });
        Ok(())
    }

    pub fn complete_booking(ctx: Context<ReleaseMilestone>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == BookingStatus::Active, EscrowError::InvalidStatus);
        let remaining = escrow
            .amount
            .checked_sub(escrow.released)
            .ok_or(EscrowError::Overflow)?;
        if remaining > 0 {
            release_lamports(
                &ctx.accounts.vault.to_account_info(),
                &ctx.accounts.guide.to_account_info(),
                remaining,
            )?;
        }
        escrow.released = escrow.amount;
        escrow.milestones_completed = escrow.milestones;
        escrow.status = BookingStatus::Completed;
        emit!(BookingCompleted {
            escrow: escrow.key(),
            amount: remaining,
        });
        Ok(())
    }

    pub fn cancel_booking(ctx: Context<CancelBooking>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == BookingStatus::Funded, EscrowError::InvalidStatus);
        let remaining = escrow
            .amount
            .checked_sub(escrow.released)
            .ok_or(EscrowError::Overflow)?;
        release_lamports(
            &ctx.accounts.vault.to_account_info(),
            &ctx.accounts.tourist.to_account_info(),
            remaining,
        )?;
        escrow.status = BookingStatus::Cancelled;
        emit!(BookingCancelled {
            escrow: escrow.key(),
            amount: remaining,
        });
        Ok(())
    }

    pub fn open_dispute(ctx: Context<OpenDispute>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            matches!(escrow.status, BookingStatus::Active | BookingStatus::Funded),
            EscrowError::InvalidStatus
        );
        require!(
            ctx.accounts.actor.key() == escrow.tourist || ctx.accounts.actor.key() == escrow.guide,
            EscrowError::UnauthorizedParticipant
        );
        escrow.status = BookingStatus::Disputed;
        emit!(DisputeOpened { escrow: escrow.key() });
        Ok(())
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        tourist_refund_bps: u16,
    ) -> Result<()> {
        require!(tourist_refund_bps <= 10_000, EscrowError::DisputeBpsOutOfRange);
        let escrow = &mut ctx.accounts.escrow;
        require!(escrow.status == BookingStatus::Disputed, EscrowError::InvalidStatus);
        require_keys_eq!(escrow.admin, ctx.accounts.admin.key(), EscrowError::UnauthorizedAdmin);
        require_keys_eq!(escrow.tourist, ctx.accounts.tourist.key(), EscrowError::UnauthorizedParticipant);
        require_keys_eq!(escrow.guide, ctx.accounts.guide.key(), EscrowError::UnauthorizedParticipant);

        let remaining = escrow
            .amount
            .checked_sub(escrow.released)
            .ok_or(EscrowError::Overflow)?;
        let (to_tourist, to_guide) = dispute_split(remaining, tourist_refund_bps)?;

        if to_tourist > 0 {
            release_lamports(
                &ctx.accounts.vault.to_account_info(),
                &ctx.accounts.tourist.to_account_info(),
                to_tourist,
            )?;
        }
        if to_guide > 0 {
            release_lamports(
                &ctx.accounts.vault.to_account_info(),
                &ctx.accounts.guide.to_account_info(),
                to_guide,
            )?;
        }

        escrow.released = escrow.amount;
        escrow.status = BookingStatus::Refunded;
        emit!(DisputeResolved {
            escrow: escrow.key(),
            tourist_amount: to_tourist,
            guide_amount: to_guide,
        });

        Ok(())
    }
}

fn release_lamports(vault: &AccountInfo, recipient: &AccountInfo, amount: u64) -> Result<()> {
    let vault_lamports = vault.lamports();
    require!(vault_lamports >= amount, EscrowError::InsufficientVault);
    **vault.try_borrow_mut_lamports()? -= amount;
    **recipient.try_borrow_mut_lamports()? += amount;
    Ok(())
}

fn per_milestone_amount(amount: u64, milestones: u8) -> Result<u64> {
    require!(milestones > 0, EscrowError::InvalidMilestones);
    amount
        .checked_div(milestones as u64)
        .ok_or_else(|| error!(EscrowError::Overflow))
}

fn dispute_split(remaining: u64, tourist_refund_bps: u16) -> Result<(u64, u64)> {
    require!(tourist_refund_bps <= 10_000, EscrowError::DisputeBpsOutOfRange);
    let to_tourist = remaining
        .checked_mul(tourist_refund_bps as u64)
        .ok_or_else(|| error!(EscrowError::Overflow))?
        .checked_div(10_000)
        .ok_or_else(|| error!(EscrowError::Overflow))?;
    let to_guide = remaining
        .checked_sub(to_tourist)
        .ok_or_else(|| error!(EscrowError::Overflow))?;
    Ok((to_tourist, to_guide))
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BookingStatus {
    Funded,
    Active,
    Completed,
    Disputed,
    Refunded,
    Cancelled,
}

#[account]
pub struct BookingEscrow {
    pub tourist: Pubkey,
    pub guide: Pubkey,
    pub admin: Pubkey,
    pub amount: u64,
    pub released: u64,
    pub milestones: u8,
    pub milestones_completed: u8,
    pub status: BookingStatus,
    pub created_at: i64,
    pub dispute_deadline: i64,
    pub bump: u8,
}

impl BookingEscrow {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 1 + 8 + 8 + 1;
}

#[derive(Accounts)]
#[instruction(_amount: u64, _milestones: u8, created_at: i64)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = tourist,
        space = BookingEscrow::LEN,
        seeds = [b"escrow", tourist.key().as_ref(), guide.key().as_ref(), &created_at.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, BookingEscrow>,
    /// CHECK: vault account receives lamports and has checked seed derivation.
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,
    /// CHECK: participant wallet.
    pub guide: UncheckedAccount<'info>,
    /// CHECK: admin wallet saved in escrow.
    pub admin: UncheckedAccount<'info>,
    #[account(mut)]
    pub tourist: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GuideAction<'info> {
    #[account(mut, has_one = guide)]
    pub escrow: Account<'info, BookingEscrow>,
    pub guide: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleaseMilestone<'info> {
    #[account(mut, has_one = tourist, has_one = guide)]
    pub escrow: Account<'info, BookingEscrow>,
    /// CHECK: seed checked PDA holding lamports.
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub tourist: Signer<'info>,
    /// CHECK: recipient wallet for released funds.
    #[account(mut)]
    pub guide: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelBooking<'info> {
    #[account(mut, has_one = tourist)]
    pub escrow: Account<'info, BookingEscrow>,
    /// CHECK: seed checked PDA holding lamports.
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub tourist: Signer<'info>,
}

#[derive(Accounts)]
pub struct OpenDispute<'info> {
    #[account(mut)]
    pub escrow: Account<'info, BookingEscrow>,
    pub actor: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub escrow: Account<'info, BookingEscrow>,
    /// CHECK: seed-checked PDA vault holding lamports.
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,
    /// CHECK: tourist wallet; key verified against escrow.tourist via require_keys_eq!.
    #[account(mut)]
    pub tourist: UncheckedAccount<'info>,
    /// CHECK: guide wallet; key verified against escrow.guide via require_keys_eq!.
    #[account(mut)]
    pub guide: UncheckedAccount<'info>,
    pub admin: Signer<'info>,
}

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub tourist: Pubkey,
    pub guide: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowActivated {
    pub escrow: Pubkey,
}

#[event]
pub struct MilestoneReleased {
    pub escrow: Pubkey,
    pub amount: u64,
    pub milestones_completed: u8,
}

#[event]
pub struct BookingCompleted {
    pub escrow: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BookingCancelled {
    pub escrow: Pubkey,
    pub amount: u64,
}

#[event]
pub struct DisputeOpened {
    pub escrow: Pubkey,
}

#[event]
pub struct DisputeResolved {
    pub escrow: Pubkey,
    pub tourist_amount: u64,
    pub guide_amount: u64,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid status")]
    InvalidStatus,
    #[msg("Invalid milestones")]
    InvalidMilestones,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unauthorized admin")]
    UnauthorizedAdmin,
    #[msg("Dispute bps out of range")]
    DisputeBpsOutOfRange,
    #[msg("Insufficient vault balance")]
    InsufficientVault,
    #[msg("Unauthorized participant")]
    UnauthorizedParticipant,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn per_milestone_happy_path() {
        let amount = per_milestone_amount(1_000_000, 4).expect("should divide cleanly");
        assert_eq!(amount, 250_000);
    }

    #[test]
    fn per_milestone_rejects_zero() {
        assert!(per_milestone_amount(1_000, 0).is_err());
    }

    #[test]
    fn dispute_split_happy_path() {
        let (tourist, guide) = dispute_split(1_000_000, 2_500).expect("split should succeed");
        assert_eq!(tourist, 250_000);
        assert_eq!(guide, 750_000);
    }

    #[test]
    fn dispute_split_rejects_large_bps() {
        assert!(dispute_split(10_000, 10_001).is_err());
    }
}
