import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, serviceRole);

async function cleanupDuplicateRoutes() {
  console.log("🧹 Cleaning up duplicate routes...\n");

  // Get all routes
  const { data: routes, error } = await supabase
    .from("routes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  if (!routes || routes.length === 0) {
    console.log("No routes found.");
    return;
  }

  console.log(`Found ${routes.length} total routes`);

  // Group routes by name
  const routesByName = new Map<string, any[]>();
  for (const route of routes) {
    const existing = routesByName.get(route.name) || [];
    existing.push(route);
    routesByName.set(route.name, existing);
  }

  let deletedCount = 0;

  // For each group, keep the first one and delete the rest
  for (const [name, duplicates] of routesByName.entries()) {
    if (duplicates.length > 1) {
      console.log(`\n📍 Found ${duplicates.length} copies of "${name}"`);
      
      // Keep the first one (oldest)
      const toKeep = duplicates[0];
      const toDelete = duplicates.slice(1);

      console.log(`  ✓ Keeping: ${toKeep.id} (created ${toKeep.created_at})`);

      // Delete the duplicates
      for (const route of toDelete) {
        // First, delete associated services
        const { error: servicesError } = await supabase
          .from("services")
          .delete()
          .eq("route_id", route.id);

        if (servicesError) {
          console.warn(`  ⚠ Warning: Could not delete services for route ${route.id}`);
        }

        // Then delete the route
        const { error: deleteError } = await supabase
          .from("routes")
          .delete()
          .eq("id", route.id);

        if (deleteError) {
          console.warn(`  ⚠ Warning: Could not delete route ${route.id}:`, deleteError.message);
        } else {
          console.log(`  ✗ Deleted: ${route.id} (created ${route.created_at})`);
          deletedCount++;
        }
      }
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Deleted ${deletedCount} duplicate routes`);
  console.log(`   Remaining: ${routes.length - deletedCount} unique routes`);
}

async function cleanupOrphanedServices() {
  console.log("\n🧹 Cleaning up orphaned services...\n");

  // Get services without valid routes
  const { data: services, error } = await supabase
    .from("services")
    .select("id, route_id, title");

  if (error) {
    throw error;
  }

  if (!services || services.length === 0) {
    console.log("No services found.");
    return;
  }

  let orphanedCount = 0;

  for (const service of services) {
    if (!service.route_id) {
      const { error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", service.id);

      if (!deleteError) {
        console.log(`✗ Deleted orphaned service: ${service.title}`);
        orphanedCount++;
      }
    }
  }

  console.log(`\n✅ Deleted ${orphanedCount} orphaned services`);
}

async function run() {
  try {
    await cleanupDuplicateRoutes();
    await cleanupOrphanedServices();
    
    console.log("\n🎉 Database cleanup completed successfully!");
    console.log("   Visit /explore to see the clean route list");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    throw error;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
