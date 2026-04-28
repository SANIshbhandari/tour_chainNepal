import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingServices() {
  console.log("🔧 Adding services for routes without services...\n");

  // Get all routes
  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("id, name");

  if (routesError) {
    console.error("❌ Error fetching routes:", routesError);
    return;
  }

  // Get all services
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("route_id");

  if (servicesError) {
    console.error("❌ Error fetching services:", servicesError);
    return;
  }

  // Get all guides
  const { data: guides, error: guidesError } = await supabase
    .from("guides")
    .select("id");

  if (guidesError || !guides || guides.length === 0) {
    console.error("❌ No guides found");
    return;
  }

  // Find routes without services
  const routeIdsWithServices = new Set(services?.map((s) => s.route_id).filter(Boolean));
  const routesWithoutServices = routes?.filter((r) => !routeIdsWithServices.has(r.id)) || [];

  console.log(`Found ${routesWithoutServices.length} routes without services:`);
  routesWithoutServices.forEach((r) => console.log(`  - ${r.name}`));

  if (routesWithoutServices.length === 0) {
    console.log("\n✅ All routes already have services!");
    return;
  }

  // Add services for each route
  const newServices = [];
  for (const route of routesWithoutServices) {
    // Use first guide for simplicity
    const guideId = guides[0].id;

    newServices.push(
      {
        guide_id: guideId,
        route_id: route.id,
        title: `Budget ${route.name} Package`,
        description: "Budget-friendly trek with experienced guide",
        price_usd: 800,
        max_group_size: 8,
        includes: ["Guide", "Permits", "Basic accommodation"],
        is_active: true,
      },
      {
        guide_id: guideId,
        route_id: route.id,
        title: `Standard ${route.name} Package`,
        description: "Standard package with guide and porter support",
        price_usd: 1200,
        max_group_size: 6,
        includes: ["Guide", "Porter", "Permits", "Accommodation", "Meals"],
        is_active: true,
      }
    );
  }

  console.log(`\nCreating ${newServices.length} new services...`);

  const { error: insertError } = await supabase.from("services").insert(newServices);

  if (insertError) {
    console.error("❌ Error creating services:", insertError);
    return;
  }

  console.log(`✅ Successfully created ${newServices.length} services!`);
}

addMissingServices().catch(console.error);
