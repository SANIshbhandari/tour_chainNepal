import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return jsonError(500, "missing_env", "Supabase not configured");
  }

  const body = await request.json();
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string") {
    return jsonError(400, "invalid_input", "Please provide a valid prompt");
  }

  // Fetch all routes for context
  const { data: routes, error: routesError } = await supabase
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
    .eq("is_active", true);

  if (routesError) {
    console.error("Failed to fetch routes:", routesError);
    return jsonError(500, "db_error", "Failed to fetch routes");
  }

  // Simple AI-like logic (without OpenAI for now - can be added later)
  // Parse user intent from prompt
  const promptLower = prompt.toLowerCase();
  
  // Extract preferences
  const wantsBudget = promptLower.includes("budget") || promptLower.includes("cheap") || promptLower.includes("affordable");
  const wantsLuxury = promptLower.includes("luxury") || promptLower.includes("premium") || promptLower.includes("expensive");
  const wantsEasy = promptLower.includes("easy") || promptLower.includes("beginner") || promptLower.includes("relaxed");
  const wantsChallenge = promptLower.includes("challenge") || promptLower.includes("difficult") || promptLower.includes("hard") || promptLower.includes("adventure");
  const wantsShort = promptLower.includes("short") || promptLower.includes("quick") || promptLower.includes("few days");
  const wantsLong = promptLower.includes("long") || promptLower.includes("extended") || promptLower.includes("weeks");
  
  // Extract duration if mentioned
  const durationMatch = prompt.match(/(\d+)\s*(day|week)/i);
  const requestedDays = durationMatch ? 
    (durationMatch[2].toLowerCase() === "week" ? parseInt(durationMatch[1]) * 7 : parseInt(durationMatch[1])) 
    : null;
  
  // Extract budget if mentioned
  const budgetMatch = prompt.match(/\$?(\d+)/);
  const maxBudget = budgetMatch ? parseInt(budgetMatch[1]) : null;

  // Score and filter routes
  const scoredRoutes = routes.map(route => {
    let score = 0;
    const service = route.services?.[0];
    const price = service?.price_usd || 0;
    
    // Duration matching
    if (requestedDays) {
      const daysDiff = Math.abs(route.duration_days - requestedDays);
      score += Math.max(0, 10 - daysDiff); // Closer to requested days = higher score
    }
    
    // Budget matching
    if (maxBudget && price <= maxBudget) {
      score += 10;
    }
    if (wantsBudget && price < 1500) {
      score += 8;
    }
    if (wantsLuxury && price > 2000) {
      score += 8;
    }
    
    // Difficulty matching
    if (wantsEasy && route.difficulty === "easy") {
      score += 10;
    }
    if (wantsChallenge && (route.difficulty === "challenging" || route.difficulty === "hard")) {
      score += 10;
    }
    
    // Duration preferences
    if (wantsShort && route.duration_days <= 7) {
      score += 8;
    }
    if (wantsLong && route.duration_days >= 14) {
      score += 8;
    }
    
    // Popular routes get a small boost
    if (route.name.includes("Everest") || route.name.includes("Annapurna")) {
      score += 3;
    }
    
    return { ...route, score, service };
  });

  // Sort by score and take top 3
  const topRoutes = scoredRoutes
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Generate recommendations
  const recommendations = topRoutes.map(route => {
    const pros = [];
    const cons = [];
    
    // Generate pros
    if (route.difficulty === "easy") {
      pros.push("Suitable for beginners");
    } else if (route.difficulty === "challenging") {
      pros.push("Rewarding challenge for experienced trekkers");
    }
    
    if (route.duration_days <= 7) {
      pros.push("Perfect for limited time");
    } else if (route.duration_days >= 14) {
      pros.push("Comprehensive experience");
    }
    
    if (route.service?.price_usd && route.service.price_usd < 1500) {
      pros.push("Budget-friendly option");
    }
    
    if (route.name.includes("Everest")) {
      pros.push("Iconic Everest views");
    } else if (route.name.includes("Annapurna")) {
      pros.push("Diverse landscapes and culture");
    }
    
    pros.push("Experienced local guides");
    
    // Generate cons
    if (route.difficulty === "challenging") {
      cons.push("Requires good physical fitness");
    }
    
    if (route.duration_days >= 14) {
      cons.push("Significant time commitment");
    }
    
    if (route.service?.price_usd && route.service.price_usd > 2000) {
      cons.push("Higher price point");
    }
    
    if (route.max_altitude && route.max_altitude > 4000) {
      cons.push("High altitude - acclimatization needed");
    } else {
      cons.push("Weather dependent");
    }
    
    // Generate reason
    let reason = `This ${route.duration_days}-day ${route.difficulty} trek `;
    
    if (wantsBudget && route.service?.price_usd && route.service.price_usd < 1500) {
      reason += "fits your budget perfectly ";
    } else if (wantsChallenge && route.difficulty === "challenging") {
      reason += "offers the adventure you're looking for ";
    } else if (requestedDays && Math.abs(route.duration_days - requestedDays) <= 2) {
      reason += "matches your timeframe ";
    } else {
      reason += "is a great choice ";
    }
    
    reason += `and showcases the best of ${route.region}.`;
    
    return {
      routeId: route.id,
      name: route.name,
      reason,
      pros: pros.slice(0, 4),
      cons: cons.slice(0, 3),
      duration: route.duration_days,
      difficulty: route.difficulty,
      price: route.service?.price_usd || 0,
    };
  });

  // Generate practical tips
  const tips = [
    "Book at least 2-3 months in advance for peak season (March-May, September-November).",
    "Ensure you have comprehensive travel insurance covering high-altitude trekking.",
    "Start physical training 6-8 weeks before your trek for the best experience.",
    "Pack layers - mountain weather can change quickly!",
  ].join(" ");

  return jsonOk({
    recommendations,
    tips,
    matchedPreferences: {
      budget: wantsBudget || wantsLuxury,
      difficulty: wantsEasy || wantsChallenge,
      duration: wantsShort || wantsLong || !!requestedDays,
    },
  });
}
