import { createClient } from "@/lib/supabase/server";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return jsonError(500, "missing_env", "Supabase is not configured");
  }

  const body = await request.json();
  const { email } = body;

  // Validate email
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return jsonError(400, "invalid_email", "Please provide a valid email address");
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return jsonError(400, "already_registered", "This email is already on the waitlist");
  }

  // Add to waitlist
  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase() });

  if (error) {
    console.error("Waitlist error:", error);
    return jsonError(500, "db_error", "Failed to join waitlist");
  }

  // Get total count
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return jsonOk({ 
    message: "Successfully joined the waitlist!",
    count: count || 0
  }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return jsonError(500, "missing_env", "Supabase is not configured");
  }

  // Get waitlist count (public)
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return jsonOk({ count: count || 0 });
}
