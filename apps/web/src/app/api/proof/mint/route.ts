import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/response";
import { ProofMintInput } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return jsonError(500, "missing_env", "Supabase env is not configured");
  }

  const parsed = ProofMintInput.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError(400, "validation_error", "Invalid proof mint payload", parsed.error.flatten());
  }
  const body = parsed.data;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonError(401, "unauthorized", "You must be logged in to mint a proof");
  }

  // Verify the booking belongs to the user
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, tourist_id, route_id, status")
    .eq("id", body.bookingId)
    .single();

  if (bookingError || !booking) {
    return jsonError(404, "not_found", "Booking not found");
  }

  if (booking.tourist_id !== user.id) {
    return jsonError(403, "forbidden", "This booking does not belong to you");
  }

  // Check if all checkpoints are completed
  if (booking.route_id) {
    const { data: checkpoints } = await supabase
      .from("route_checkpoints")
      .select("place_id")
      .eq("route_id", booking.route_id);

    const { data: checkins } = await supabase
      .from("check_ins")
      .select("place_id")
      .eq("booking_id", body.bookingId)
      .eq("verified", true);

    const totalCheckpoints = checkpoints?.length || 0;
    const completedCheckpoints = checkins?.length || 0;

    if (totalCheckpoints > 0 && completedCheckpoints < totalCheckpoints) {
      return jsonError(400, "incomplete_trek", `You must complete all checkpoints first (${completedCheckpoints}/${totalCheckpoints})`);
    }
  }

  // Check if proof already exists
  const { data: existingProof } = await supabase
    .from("completion_proofs")
    .select("id")
    .eq("booking_id", body.bookingId)
    .maybeSingle();

  if (existingProof) {
    return jsonError(400, "already_minted", "Completion proof already exists for this booking");
  }

  // Create the proof (in production, this would mint an actual NFT on Solana)
  const fakeMintAddress = `PROOF${Date.now()}${Math.random().toString(36).substring(7)}`;
  const { data, error } = await supabase
    .from("completion_proofs")
    .insert({
      booking_id: body.bookingId,
      user_id: user.id,
      route_id: booking.route_id,
      nft_mint_address: fakeMintAddress,
      metadata_uri: body.uri,
    })
    .select("id,nft_mint_address,metadata_uri,created_at")
    .single();

  if (error) {
    return jsonError(500, "db_error", error.message);
  }

  // Update booking status to completed
  await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", body.bookingId);

  return jsonOk({ proof: data }, { status: 201 });
}
