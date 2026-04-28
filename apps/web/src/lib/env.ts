import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SOLANA_CLUSTER: z.enum(["devnet", "testnet", "mainnet-beta"]).default("devnet"),
  NEXT_PUBLIC_SOLANA_RPC: z.string().url().default("https://api.devnet.solana.com"),
  NEXT_PUBLIC_REPUTATION_PROGRAM_ID: z.string().default("2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy"),
  NEXT_PUBLIC_ESCROW_PROGRAM_ID: z.string().default("EsmThaTZhHLviAJFbpgaSTr6eCgUFGcSiboMRzb9JF6Z"),
  NEXT_PUBLIC_PROOF_PROGRAM_ID: z.string().default("3PfgspqxmvAh3FXUMGRPexBV7neXwLkKTPnv3gRWvPjm"),
  NEXT_PUBLIC_MERKLE_TREE: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SOLANA_PLATFORM_KEYPAIR: z.string().optional(),
});

function parsePublicEnv() {
  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SOLANA_CLUSTER: process.env.NEXT_PUBLIC_SOLANA_CLUSTER,
    NEXT_PUBLIC_SOLANA_RPC: process.env.NEXT_PUBLIC_SOLANA_RPC,
    NEXT_PUBLIC_REPUTATION_PROGRAM_ID: process.env.NEXT_PUBLIC_REPUTATION_PROGRAM_ID,
    NEXT_PUBLIC_ESCROW_PROGRAM_ID: process.env.NEXT_PUBLIC_ESCROW_PROGRAM_ID,
    NEXT_PUBLIC_PROOF_PROGRAM_ID: process.env.NEXT_PUBLIC_PROOF_PROGRAM_ID,
    NEXT_PUBLIC_MERKLE_TREE: process.env.NEXT_PUBLIC_MERKLE_TREE,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing required environment variables: ${missing}`);
  }

  return result.data;
}

function parseServerEnv() {
  if (typeof window !== "undefined") return null;
  const result = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SOLANA_PLATFORM_KEYPAIR: process.env.SOLANA_PLATFORM_KEYPAIR,
  });

  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Missing required server environment variables: ${missing}`);
  }

  return result.data;
}

export const publicEnv = parsePublicEnv();
export const serverEnv = parseServerEnv();
