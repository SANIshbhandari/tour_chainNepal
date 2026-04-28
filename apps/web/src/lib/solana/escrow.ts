import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { getProvider, getProgram } from "./anchor";
import escrowIdl from "./idl/tourchain_escrow.json";

const ESCROW_PROGRAM_ID = process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID ?? "EsmThaTZhHLviAJFbpgaSTr6eCgUFGcSiboMRzb9JF6Z";

export function getEscrowPda(tourist: PublicKey, guide: PublicKey, createdAt: number) {
  // Convert timestamp to 8-byte buffer (little-endian)
  const createdAtBytes = new Uint8Array(8);
  const view = new DataView(createdAtBytes.buffer);
  view.setBigInt64(0, BigInt(createdAt), true); // true = little-endian
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), tourist.toBuffer(), guide.toBuffer(), Buffer.from(createdAtBytes)],
    new PublicKey(ESCROW_PROGRAM_ID),
  );
}

export function getVaultPda(escrowPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), escrowPubkey.toBuffer()],
    new PublicKey(ESCROW_PROGRAM_ID),
  );
}

export async function createEscrow(
  wallet: WalletContextState,
  args: { guideAddress: string; adminAddress: string; amountLamports: number; milestones: number; createdAt: number },
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  const provider = getProvider(wallet);
  const program = getProgram(escrowIdl as Parameters<typeof getProgram>[0], ESCROW_PROGRAM_ID, provider);

  const tourist = wallet.publicKey;
  const guide = new PublicKey(args.guideAddress);
  const admin = new PublicKey(args.adminAddress);
  const [escrow] = getEscrowPda(tourist, guide, args.createdAt);
  const [vault] = getVaultPda(escrow);

  const tx = await program.methods
    .createEscrow(new BN(args.amountLamports), args.milestones, new BN(args.createdAt))
    .accounts({
      escrow,
      vault,
      guide,
      admin,
      tourist,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function releaseMilestone(
  wallet: WalletContextState,
  args: { escrowAddress: string; guideAddress: string },
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  const provider = getProvider(wallet);
  const program = getProgram(escrowIdl as Parameters<typeof getProgram>[0], ESCROW_PROGRAM_ID, provider);

  const escrow = new PublicKey(args.escrowAddress);
  const [vault] = getVaultPda(escrow);

  const tx = await program.methods
    .releaseMilestone()
    .accounts({
      escrow,
      vault,
      tourist: wallet.publicKey,
      guide: new PublicKey(args.guideAddress),
    })
    .rpc();

  return tx;
}

export async function completeBooking(
  wallet: WalletContextState,
  args: { escrowAddress: string; guideAddress: string },
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  const provider = getProvider(wallet);
  const program = getProgram(escrowIdl as Parameters<typeof getProgram>[0], ESCROW_PROGRAM_ID, provider);

  const escrow = new PublicKey(args.escrowAddress);
  const [vault] = getVaultPda(escrow);

  const tx = await program.methods
    .completeBooking()
    .accounts({
      escrow,
      vault,
      tourist: wallet.publicKey,
      guide: new PublicKey(args.guideAddress),
    })
    .rpc();

  return tx;
}

export async function cancelBooking(
  wallet: WalletContextState,
  args: { escrowAddress: string },
) {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  const provider = getProvider(wallet);
  const program = getProgram(escrowIdl as Parameters<typeof getProgram>[0], ESCROW_PROGRAM_ID, provider);

  const escrow = new PublicKey(args.escrowAddress);
  const [vault] = getVaultPda(escrow);

  const tx = await program.methods
    .cancelBooking()
    .accounts({
      escrow,
      vault,
      tourist: wallet.publicKey,
    })
    .rpc();

  return tx;
}
