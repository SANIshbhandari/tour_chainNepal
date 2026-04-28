import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCheckpoints() {
  console.log("🗺️  Adding checkpoints to routes...\n");

  // Get Annapurna Base Camp Trek route
  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("id, name")
    .eq("name", "Annapurna Base Camp Trek")
    .single();

  if (routesError || !routes) {
    console.error("❌ Route not found");
    return;
  }

  console.log(`Found route: ${routes.name} (${routes.id})`);

  // Define checkpoints for Annapurna Base Camp Trek
  const checkpointData = [
    { name: "Nayapul", lat: 28.3949, lng: 83.7794, altitude: 1070, category: "trailhead" },
    { name: "Tikhedhunga", lat: 28.3897, lng: 83.7142, altitude: 1577, category: "village" },
    { name: "Ghorepani", lat: 28.3967, lng: 83.7044, altitude: 2874, category: "village" },
    { name: "Poon Hill", lat: 28.3967, lng: 83.6944, altitude: 3210, category: "viewpoint" },
    { name: "Tadapani", lat: 28.3633, lng: 83.7133, altitude: 2630, category: "village" },
    { name: "Chhomrong", lat: 28.3583, lng: 83.7917, altitude: 2170, category: "village" },
    { name: "Bamboo", lat: 28.3333, lng: 83.8167, altitude: 2310, category: "checkpoint" },
    { name: "Deurali", lat: 28.3167, lng: 83.8333, altitude: 3230, category: "checkpoint" },
    { name: "Machapuchare Base Camp", lat: 28.3000, lng: 83.8500, altitude: 3700, category: "checkpoint" },
    { name: "Annapurna Base Camp", lat: 28.2917, lng: 83.8583, altitude: 4130, category: "summit" },
  ];

  // Create places first
  const places = [];
  for (const cp of checkpointData) {
    const { data: place, error } = await supabase
      .from("places")
      .insert({
        name: cp.name,
        description: `Checkpoint on Annapurna Base Camp Trek`,
        category: cp.category,
        latitude: cp.lat,
        longitude: cp.lng,
        altitude_meters: cp.altitude,
        region: "Annapurna",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating place ${cp.name}:`, error.message);
    } else {
      places.push(place);
      console.log(`✓ Created place: ${cp.name}`);
    }
  }

  // Create route checkpoints
  const routeCheckpoints = places.map((place, index) => ({
    route_id: routes.id,
    place_id: place.id,
    sequence_order: index + 1,
    is_required: true,
  }));

  const { error: checkpointsError } = await supabase
    .from("route_checkpoints")
    .insert(routeCheckpoints);

  if (checkpointsError) {
    console.error("❌ Error creating route checkpoints:", checkpointsError);
    return;
  }

  console.log(`\n✅ Successfully added ${places.length} checkpoints to ${routes.name}!`);
  console.log("\n📍 Checkpoints:");
  places.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} (${p.altitude_meters}m)`);
  });
}

addCheckpoints().catch(console.error);
