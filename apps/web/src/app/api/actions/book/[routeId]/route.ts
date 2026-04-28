import { createClient } from "@/lib/supabase/server";
import { 
  PublicKey, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection
} from "@solana/web3.js";

// Solana Actions CORS headers
const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-Action-Version": "2.0",
  "X-Blockchain-Ids": "solana:devnet",
};

export async function GET(
  request: Request,
  { params }: { params: { routeId: string } }
) {
  const supabase = await createClient();
  
  // Fetch route details
  const { data: route } = await supabase
    .from("routes")
    .select(`
      *,
      services (
        id,
        title,
        price_usd,
        description
      )
    `)
    .eq("id", params.routeId)
    .eq("is_active", true)
    .single();

  if (!route) {
    return Response.json(
      { error: "Route not found" }, 
      { status: 404, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const service = route.services?.[0];
  if (!service) {
    return Response.json(
      { error: "No services available for this route" },
      { status: 404, headers: ACTIONS_CORS_HEADERS }
    );
  }

  const priceSOL = (service.price_usd / 100).toFixed(2); // Assuming 1 SOL = $100

  const response = {
    type: "action",
    icon: `${process.env.NEXT_PUBLIC_APP_URL || "https://tourchain.com"}/images/himalaya_bg.png`,
    title: `Book ${route.name}`,
    description: `${route.duration_days} days • $${service.price_usd} • ${route.difficulty}\n\n${route.description || "Experience the adventure of a lifetime in Nepal's Himalayas."}`,
    label: "Book Trek",
    links: {
      actions: [
        {
          label: `Book for ${priceSOL} SOL`,
          href: `/api/actions/book/${params.routeId}?serviceId=${service.id}&amount=${priceSOL}`,
        },
      ],
    },
  };

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(
  request: Request,
  { params }: { params: { routeId: string } }
) {
  try {
    const body = await request.json();
    const { account } = body; // User's wallet address
    
    if (!account) {
      return Response.json(
        { error: "Account address required" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const url = new URL(request.url);
    const serviceId = url.searchParams.get("serviceId");
    const amountSOL = parseFloat(url.searchParams.get("amount") || "0");

    if (!serviceId || !amountSOL) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const supabase = await createClient();
    
    // Fetch service and guide info
    const { data: service } = await supabase
      .from("services")
      .select(`
        *,
        guides (
          user_id,
          users (
            wallet_address
          )
        )
      `)
      .eq("id", serviceId)
      .single();

    if (!service) {
      return Response.json(
        { error: "Service not found" },
        { status: 404, headers: ACTIONS_CORS_HEADERS }
      );
    }

    // Get guide wallet (fallback to a default if not set)
    const guideWallet = service.guides?.users?.wallet_address || "11111111111111111111111111111111";

    // Create transaction
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com"
    );
    
    const userPubkey = new PublicKey(account);
    const guidePubkey = new PublicKey(guideWallet);
    
    // For Blinks demo, we'll create a simple transfer transaction
    // In production, this would call your escrow program
    const transaction = new Transaction();
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: guidePubkey,
        lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
      })
    );

    // Set recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    // Serialize transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const response = {
      transaction: serializedTransaction.toString("base64"),
      message: `Booking ${service.title} for ${amountSOL} SOL`,
    };

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
  } catch (error: any) {
    console.error("Blinks error:", error);
    return Response.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return Response.json(null, { headers: ACTIONS_CORS_HEADERS });
}
