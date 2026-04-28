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

// Nepal Trekking Routes Data
const ROUTES = [
  {
    name: "Everest Base Camp Trek",
    description: "The iconic trek to the base of the world's highest mountain. Experience Sherpa culture, stunning mountain views, and the thrill of reaching 5,364m.",
    difficulty: "challenging",
    duration_days: 14,
    region: "Everest",
    max_altitude_meters: 5364,
  },
  {
    name: "Annapurna Circuit",
    description: "One of the world's greatest treks, circling the Annapurna massif through diverse landscapes from subtropical forests to high alpine terrain.",
    difficulty: "challenging",
    duration_days: 18,
    region: "Annapurna",
    max_altitude_meters: 5416,
  },
  {
    name: "Poon Hill Trek",
    description: "Short and scenic trek perfect for beginners. Witness spectacular sunrise views over Annapurna and Dhaulagiri ranges.",
    difficulty: "easy",
    duration_days: 4,
    region: "Annapurna",
    max_altitude_meters: 3210,
  },
  {
    name: "Langtang Valley Trek",
    description: "Beautiful valley trek close to Kathmandu, offering stunning mountain views, Tamang culture, and diverse landscapes.",
    difficulty: "moderate",
    duration_days: 8,
    region: "Langtang",
    max_altitude_meters: 4984,
  },
  {
    name: "Manaslu Circuit Trek",
    description: "Off-the-beaten-path trek around the eighth highest mountain in the world. Remote villages and pristine mountain scenery.",
    difficulty: "challenging",
    duration_days: 16,
    region: "Manaslu",
    max_altitude_meters: 5160,
  },
  {
    name: "Upper Mustang Trek",
    description: "Journey to the ancient forbidden kingdom of Lo. Unique Tibetan culture, dramatic desert landscapes, and ancient monasteries.",
    difficulty: "moderate",
    duration_days: 12,
    region: "Mustang",
    max_altitude_meters: 3840,
  },
  {
    name: "Gokyo Lakes Trek",
    description: "Alternative Everest region trek featuring turquoise glacial lakes and panoramic views from Gokyo Ri (5,357m).",
    difficulty: "challenging",
    duration_days: 12,
    region: "Everest",
    max_altitude_meters: 5357,
  },
  {
    name: "Annapurna Base Camp Trek",
    description: "Trek into the heart of the Annapurna sanctuary, surrounded by towering peaks. Diverse landscapes and rich cultural experiences.",
    difficulty: "moderate",
    duration_days: 10,
    region: "Annapurna",
    max_altitude_meters: 4130,
  },
];

// Places/Checkpoints
const PLACES = [
  { name: "Lukla", region: "Everest", latitude: 27.6869, longitude: 86.7294, description: "Gateway to Everest, famous for its challenging airport" },
  { name: "Namche Bazaar", region: "Everest", latitude: 27.8047, longitude: 86.7132, description: "Sherpa capital and major trading hub" },
  { name: "Tengboche", region: "Everest", latitude: 27.8356, longitude: 86.7645, description: "Famous monastery with stunning Everest views" },
  { name: "Everest Base Camp", region: "Everest", latitude: 28.0026, longitude: 86.8528, description: "Base camp of Mount Everest" },
  { name: "Pokhara", region: "Annapurna", latitude: 28.2096, longitude: 83.9856, description: "Beautiful lakeside city, gateway to Annapurna" },
  { name: "Poon Hill", region: "Annapurna", latitude: 28.4008, longitude: 83.6847, description: "Famous sunrise viewpoint" },
  { name: "Annapurna Base Camp", region: "Annapurna", latitude: 28.5294, longitude: 83.8731, description: "Base camp in the Annapurna sanctuary" },
  { name: "Manang", region: "Annapurna", latitude: 28.6639, longitude: 84.0189, description: "High altitude village on Annapurna Circuit" },
  { name: "Thorong La Pass", region: "Annapurna", latitude: 28.7833, longitude: 83.9333, description: "Highest point of Annapurna Circuit at 5,416m" },
  { name: "Kyanjin Gompa", region: "Langtang", latitude: 28.2103, longitude: 85.5667, description: "Buddhist monastery in Langtang Valley" },
  { name: "Gokyo Lakes", region: "Everest", latitude: 27.9600, longitude: 86.6900, description: "Series of turquoise glacial lakes" },
  { name: "Lo Manthang", region: "Mustang", latitude: 29.1833, longitude: 83.9833, description: "Ancient walled capital of Upper Mustang" },
];

async function getOrCreateUser() {
  const existing = await supabase.from("users").select("id").limit(1).maybeSingle();
  if (existing.data?.id) return existing.data.id as string;

  const email = `guide_${Date.now()}@tourchain.local`;
  const password = `GuidePass_${Math.random().toString(16).slice(2)}aA1!`;
  const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  
  if (created.error || !created.data.user) {
    throw created.error ?? new Error("Failed to create auth user");
  }

  const authUserId = created.data.user.id;
  const userInsert = await supabase
    .from("users")
    .insert({ id: authUserId, email, display_name: "Nepal Trek Guide", role: "guide" })
    .select("id")
    .single();

  if (userInsert.error) throw userInsert.error;
  return userInsert.data.id as string;
}

async function createGuides(userId: string, count: number = 3) {
  const guideData = [
    { years_experience: 10, bio: "Experienced Everest region guide with 10 years of trekking experience." },
    { years_experience: 8, bio: "Annapurna specialist with 8 years guiding international trekkers." },
    { years_experience: 12, bio: "Senior mountain guide with 12 years experience across all major Nepal treks." },
  ];

  const guides = [];
  for (let i = 0; i < Math.min(count, guideData.length); i++) {
    const guideId = crypto.randomUUID();
    const guide = {
      id: guideId,
      user_id: userId,
      is_verified: true,
      years_experience: guideData[i].years_experience,
      bio: guideData[i].bio,
      languages: ['English', 'Nepali', 'Hindi'],
      specialties: ['Mountain Trekking', 'Cultural Tours', 'High Altitude'],
    };

    const inserted = await supabase.from("guides").insert(guide).select("id").single();
    if (inserted.error) {
      console.warn(`Failed to create guide ${i + 1}:`, inserted.error.message);
      continue;
    }
    guides.push(inserted.data.id as string);
    console.log(`✓ Created guide ${i + 1} (${guideData[i].years_experience} years exp)`);
  }

  return guides;
}

async function createRoutes() {
  const routeIds: string[] = [];
  
  for (const route of ROUTES) {
    const routeId = crypto.randomUUID();
    const routeData = { id: routeId, ...route };

    const inserted = await supabase.from("routes").insert(routeData).select("id").single();
    if (inserted.error) {
      console.warn(`Failed to create route ${route.name}:`, inserted.error.message);
      continue;
    }
    routeIds.push(inserted.data.id as string);
    console.log(`✓ Created route: ${route.name}`);
  }

  return routeIds;
}

async function createServices(guideIds: string[], routeIds: string[]) {
  const serviceTypes = [
    { title: "Budget Trek Package", priceMultiplier: 1, description: "Basic trekking package with experienced guide" },
    { title: "Standard Trek Package", priceMultiplier: 1.5, description: "Comfortable trekking with quality accommodations" },
    { title: "Premium Trek Package", priceMultiplier: 2, description: "Luxury trekking experience with premium services" },
  ];

  const basePrices: Record<string, number> = {
    easy: 350,
    moderate: 800,
    challenging: 1200,
    extreme: 1500,
  };

  let serviceCount = 0;

  for (const routeId of routeIds) {
    // Get route details to determine base price
    const routeData = await supabase.from("routes").select("*").eq("id", routeId).single();
    if (routeData.error) continue;

    const basePrice = basePrices[routeData.data.difficulty as string] || 500;
    const guideId = guideIds[serviceCount % guideIds.length];

    // Create 1-2 services per route
    const numServices = routeData.data.difficulty === "easy" ? 1 : 2;
    
    for (let i = 0; i < numServices; i++) {
      const serviceType = serviceTypes[i];
      const serviceId = crypto.randomUUID();
      const price = Math.round(basePrice * serviceType.priceMultiplier);

      const service = {
        id: serviceId,
        guide_id: guideId,
        route_id: routeId,
        title: serviceType.title,
        description: serviceType.description,
        price_usd: price,
      };

      const inserted = await supabase.from("services").insert(service).select("id").single();
      if (inserted.error) {
        console.warn(`Failed to create service:`, inserted.error.message);
        continue;
      }
      serviceCount++;
      console.log(`✓ Created service: ${serviceType.title} for route (${price} USD)`);
    }
  }

  return serviceCount;
}

async function createPlaces() {
  let placeCount = 0;

  for (const place of PLACES) {
    const placeId = crypto.randomUUID();
    const placeData = { id: placeId, ...place, category: "checkpoint" };

    const inserted = await supabase.from("places").insert(placeData).select("id").single();
    if (inserted.error) {
      console.warn(`Failed to create place ${place.name}:`, inserted.error.message);
      continue;
    }
    placeCount++;
    console.log(`✓ Created place: ${place.name}`);
  }

  return placeCount;
}

async function run() {
  console.log("🌄 Starting Nepal Trek Data Seeding...\n");

  try {
    console.log("📝 Creating user and guides...");
    const userId = await getOrCreateUser();
    const guideIds = await createGuides(userId, 3);
    console.log(`✓ Created ${guideIds.length} guides\n`);

    console.log("🗺️  Creating trekking routes...");
    const routeIds = await createRoutes();
    console.log(`✓ Created ${routeIds.length} routes\n`);

    console.log("💼 Creating guide services...");
    const serviceCount = await createServices(guideIds, routeIds);
    console.log(`✓ Created ${serviceCount} services\n`);

    console.log("📍 Creating places and checkpoints...");
    const placeCount = await createPlaces();
    console.log(`✓ Created ${placeCount} places\n`);

    console.log("✅ Seeding completed successfully!");
    console.log(`\nSummary:`);
    console.log(`  - ${guideIds.length} guides`);
    console.log(`  - ${routeIds.length} routes`);
    console.log(`  - ${serviceCount} services`);
    console.log(`  - ${placeCount} places`);
    console.log(`\n🚀 Visit /explore to see all the routes!`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
