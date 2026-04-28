import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase env is not configured" }, { status: 500 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      serviceId?: string;
      guideWallet?: string;
      amount?: number;
      milestones?: number;
    };

    if (!body.serviceId || !body.guideWallet || !body.amount || !body.milestones) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch user's wallet address
    const { data: profile } = await supabase
      .from("users")
      .select("wallet_address")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.wallet_address) {
      return NextResponse.json({ error: "Wallet not linked" }, { status: 400 });
    }

    // Calculate escrow PDA
    const createdAt = Date.now();
    const createdAtBytes = Buffer.alloc(8);
    createdAtBytes.writeBigInt64LE(BigInt(createdAt));

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        new PublicKey(profile.wallet_address).toBuffer(),
        new PublicKey(body.guideWallet).toBuffer(),
        createdAtBytes,
      ],
      new PublicKey(publicEnv.NEXT_PUBLIC_ESCROW_PROGRAM_ID)
    );

    return NextResponse.json({
      escrowPda: escrowPda.toString(),
      touristWallet: profile.wallet_address,
      guideWallet: body.guideWallet,
      amount: body.amount,
      milestones: body.milestones,
      createdAt,
    });
  } catch (error) {
    console.error("Booking prepare error:", error);
    return NextResponse.json({ error: "Failed to prepare booking" }, { status: 500 });
  }
}
