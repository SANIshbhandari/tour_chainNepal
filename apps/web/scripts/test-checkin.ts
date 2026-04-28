import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCheckin() {
  // Get your booking ID from command line or use the one you provided
  const bookingId = process.argv[2] || "f7f626bc-8178-45c2-9a3b-92988c3d2b65";
  
  console.log(`🧪 Creating test check-in for booking: ${bookingId}\n`);

  // Get the booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, tourist_id")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    console.error("❌ Booking not found");
    return;
  }

  // Get route checkpoints
  const { data: checkpoints, error: checkpointsError } = await supabase
    .from("route_checkpoints")
    .select(`
      id,
      sequence_order,
      place:places(id, name, latitude, longitude)
    `)
    .eq("route_id", "f02e51d7-6a6c-4569-a036-5ca479ab6db5")
    .order("sequence_order");

  if (checkpointsError || !checkpoints || checkpoints.length === 0) {
    console.error("❌ No checkpoints found");
    return;
  }

  // Get existing check-ins
  const { data: existingCheckins } = await supabase
    .from("check_ins")
    .select("place_id")
    .eq("booking_id", bookingId);

  const checkedInPlaces = new Set(existingCheckins?.map((c) => c.place_id) || []);

  // Find first unchecked checkpoint
  const nextCheckpoint = checkpoints.find((cp: any) => !checkedInPlaces.has(cp.place.id));

  if (!nextCheckpoint) {
    console.log("✅ All checkpoints already checked in!");
    return;
  }

  const place = nextCheckpoint.place as any;
  console.log(`📍 Checking in at: ${place.name}`);
  console.log(`   Coordinates: ${place.latitude}, ${place.longitude}`);

  // Create check-in
  const { data: checkin, error: checkinError } = await supabase
    .from("check_ins")
    .insert({
      booking_id: bookingId,
      user_id: booking.tourist_id,
      place_id: place.id,
      method: "gps",
      latitude: place.latitude,
      longitude: place.longitude,
      verified: true,
    })
    .select()
    .single();

  if (checkinError) {
    console.error("❌ Error creating check-in:", checkinError);
    return;
  }

  console.log(`\n✅ Check-in successful!`);
  console.log(`   Progress: ${checkedInPlaces.size + 1}/${checkpoints.length}`);
  console.log(`\n💡 Refresh your Active Trek page to see the update!`);
  console.log(`   Run this script again to check in at the next checkpoint.`);
}

testCheckin().catch(console.error);
