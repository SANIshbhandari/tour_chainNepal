import { PublicKey } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { getProvider, getProgram } from "./anchor";
import reputationIdl from "./idl/tourchain_reputation.json";

const REPUTATION_PROGRAM_ID = process.env.NEXT_PUBLIC_REPUTATION_PROGRAM_ID ?? "2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy";

export function getGuidePda(guideWallet: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("guide"), guideWallet.toBuffer()],
    new PublicKey(REPUTATION_PROGRAM_ID),
  );
}

export async function fetchGuideReputation(wallet: WalletContextState) {
  if (!wallet.publicKey) return null;
  try {
    const provider = getProvider(wallet);
    const program = getProgram(reputationIdl as Parameters<typeof getProgram>[0], REPUTATION_PROGRAM_ID, provider);
    const [pda] = getGuidePda(wallet.publicKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account = await (program.account as any).guideReputation.fetchNullable(pda);
    return account;
  } catch {
    return null;
  }
}
