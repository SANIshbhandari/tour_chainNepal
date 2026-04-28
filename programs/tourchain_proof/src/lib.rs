use anchor_lang::prelude::*;
use mpl_bubblegum::instructions::MintV1CpiBuilder;
use mpl_bubblegum::types::{Creator, MetadataArgs, TokenProgramVersion, TokenStandard};

declare_id!("3PfgspqxmvAh3FXUMGRPexBV7neXwLkKTPnv3gRWvPjm");

#[program]
pub mod tourchain_proof {
    use super::*;

    pub fn initialize_proof_authority(
        ctx: Context<InitializeProofAuthority>,
        merkle_tree: Pubkey,
    ) -> Result<()> {
        let authority = &mut ctx.accounts.proof_authority;
        authority.admin = ctx.accounts.admin.key();
        authority.merkle_tree = merkle_tree;
        authority.total_minted = 0;
        authority.bump = ctx.bumps.proof_authority;
        Ok(())
    }

    pub fn mint_completion_proof(
        ctx: Context<MintCompletionProof>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        require!(name.len() <= 32, ProofError::NameTooLong);
        require!(symbol.len() <= 10, ProofError::SymbolTooLong);
        require!(uri.len() <= 200, ProofError::UriTooLong);

        let authority = &ctx.accounts.proof_authority;
        require_keys_eq!(authority.admin, ctx.accounts.admin.key(), ProofError::UnauthorizedAdmin);
        require!(authority.merkle_tree != Pubkey::default(), ProofError::TreeNotInitialized);

        // Build metadata for the cNFT
        let metadata = MetadataArgs {
            name: name.clone(),
            symbol: symbol.clone(),
            uri: uri.clone(),
            seller_fee_basis_points: 0,
            primary_sale_happened: true,
            is_mutable: false,
            edition_nonce: None,
            token_standard: Some(TokenStandard::NonFungible),
            collection: None,
            uses: None,
            token_program_version: TokenProgramVersion::Original,
            creators: vec![Creator {
                address: authority.admin,
                verified: false,
                share: 100,
            }],
        };

        // CPI to Bubblegum to mint the cNFT
        let seeds = &[b"proof_authority".as_ref(), &[authority.bump]];
        let signer_seeds = &[&seeds[..]];

        MintV1CpiBuilder::new(&ctx.accounts.bubblegum_program.to_account_info())
            .tree_config(&ctx.accounts.tree_config.to_account_info())
            .leaf_owner(&ctx.accounts.recipient.to_account_info())
            .leaf_delegate(&ctx.accounts.recipient.to_account_info())
            .merkle_tree(&ctx.accounts.merkle_tree.to_account_info())
            .payer(&ctx.accounts.admin.to_account_info())
            .tree_creator_or_delegate(&ctx.accounts.proof_authority.to_account_info())
            .log_wrapper(&ctx.accounts.log_wrapper.to_account_info())
            .compression_program(&ctx.accounts.compression_program.to_account_info())
            .system_program(&ctx.accounts.system_program.to_account_info())
            .metadata(metadata)
            .invoke_signed(signer_seeds)?;

        let authority = &mut ctx.accounts.proof_authority;
        authority.total_minted = authority
            .total_minted
            .checked_add(1)
            .ok_or(ProofError::Overflow)?;

        emit!(CompletionProofMinted {
            admin: ctx.accounts.admin.key(),
            recipient: ctx.accounts.recipient.key(),
            merkle_tree: authority.merkle_tree,
            name,
            symbol,
            uri,
            total_minted: authority.total_minted,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProofAuthority<'info> {
    #[account(
        init,
        payer = admin,
        space = ProofAuthority::LEN,
        seeds = [b"proof_authority"],
        bump
    )]
    pub proof_authority: Account<'info, ProofAuthority>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintCompletionProof<'info> {
    #[account(
        mut,
        seeds = [b"proof_authority"],
        bump = proof_authority.bump
    )]
    pub proof_authority: Account<'info, ProofAuthority>,
    #[account(mut)]
    pub admin: Signer<'info>,
    /// CHECK: destination wallet for proof mint
    pub recipient: UncheckedAccount<'info>,
    /// CHECK: Bubblegum tree config PDA
    #[account(mut)]
    pub tree_config: UncheckedAccount<'info>,
    /// CHECK: Merkle tree account
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    /// CHECK: Bubblegum program
    pub bubblegum_program: UncheckedAccount<'info>,
    /// CHECK: SPL Account Compression program
    pub compression_program: UncheckedAccount<'info>,
    /// CHECK: SPL Noop program for logging
    pub log_wrapper: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ProofAuthority {
    pub admin: Pubkey,
    pub merkle_tree: Pubkey,
    pub total_minted: u64,
    pub bump: u8,
}

impl ProofAuthority {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1;
}

#[event]
pub struct CompletionProofMinted {
    pub admin: Pubkey,
    pub recipient: Pubkey,
    pub merkle_tree: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub total_minted: u64,
}

#[error_code]
pub enum ProofError {
    #[msg("Unauthorized admin")]
    UnauthorizedAdmin,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Symbol too long")]
    SymbolTooLong,
    #[msg("URI too long")]
    UriTooLong,
    #[msg("Merkle tree not initialized")]
    TreeNotInitialized,
    #[msg("Arithmetic overflow")]
    Overflow,
}
