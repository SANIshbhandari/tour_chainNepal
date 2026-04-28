import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  console.log("🔍 Checking database data...\n");

  // Check services
  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, guide_id, route_id, title, price_usd");

  if (servicesError) {
    console.error("❌ Error fetching services:", servicesError);
  } else {
    console.log(`📋 Services (${services.length}):`);
    services.forEach((s) => {
      console.log(`  - ${s.title}`);
      console.log(`    ID: ${s.id}`);
      console.log(`    Guide ID: ${s.guide_id} (type: ${typeof s.guide_id})`);
      console.log(`    Route ID: ${s.route_id}`);
      console.log(`    Price: $${s.price_usd}`);
    });
  }

  // Check guides
  const { data: guides, error: guidesError } = await supabase
    .from("guides")
    .select("id, user_id");

  if (guidesError) {
    console.error("❌ Error fetching guides:", guidesError);
  } else {
    console.log(`\n👨‍🏫 Guides (${guides.length}):`);
    guides.forEach((g) => {
      console.log(`  - Guide ID: ${g.id}`);
      console.log(`    User ID: ${g.user_id}`);
    });
  }

  // Check routes
  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("id, name");

  if (routesError) {
    console.error("❌ Error fetching routes:", routesError);
  } else {
    console.log(`\n🗺️  Routes (${routes.length}):`);
    routes.forEach((r) => {
      console.log(`  - ${r.name} (${r.id})`);
    });
  }

  // Check users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, email, role");

  if (usersError) {
    console.error("❌ Error fetching users:", usersError);
  } else {
    console.log(`\n👤 Users (${users.length}):`);
    users.forEach((u) => {
      console.log(`  - ${u.email} (${u.role})`);
      console.log(`    ID: ${u.id}`);
    });
  }
}

checkData().catch(console.error);
