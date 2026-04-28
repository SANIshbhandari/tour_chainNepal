import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupAuthTrigger() {
  console.log("🔧 Setting up auth user trigger...\n");

  // Step 1: Create the function
  console.log("1. Creating handle_new_user function...");
  const createFunctionSQL = `
    create or replace function public.handle_new_user()
    returns trigger
    language plpgsql
    security definer set search_path = public
    as $$
    begin
      insert into public.users (id, email, display_name, role)
      values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'role', 'tourist')
      )
      on conflict (id) do nothing;
      return new;
    end;
    $$;
  `;

  const { error: funcError } = await supabase.rpc("exec_sql" as any, { sql: createFunctionSQL } as any);
  if (funcError) {
    console.log("   Note: Function creation via RPC not available, will use SQL Editor");
  } else {
    console.log("   ✓ Function created");
  }

  // Step 2: Create the trigger
  console.log("2. Creating trigger...");
  const createTriggerSQL = `
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  `;

  const { error: triggerError } = await supabase.rpc("exec_sql" as any, { sql: createTriggerSQL } as any);
  if (triggerError) {
    console.log("   Note: Trigger creation via RPC not available");
  } else {
    console.log("   ✓ Trigger created");
  }

  // Step 3: Backfill existing users
  console.log("3. Backfilling existing auth users...");
  
  // Get all auth users (this requires service role)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("   ❌ Error fetching auth users:", authError.message);
    return;
  }

  console.log(`   Found ${authUsers.users.length} auth users`);

  // Check which users don't have profiles
  const { data: existingUsers, error: usersError } = await supabase
    .from("users")
    .select("id");

  if (usersError) {
    console.error("   ❌ Error fetching existing users:", usersError.message);
    return;
  }

  const existingUserIds = new Set(existingUsers?.map((u) => u.id) || []);
  const usersToCreate = authUsers.users.filter((u) => !existingUserIds.has(u.id));

  console.log(`   ${usersToCreate.length} users need profiles`);

  if (usersToCreate.length > 0) {
    const newUsers = usersToCreate.map((authUser) => ({
      id: authUser.id,
      email: authUser.email || null,
      display_name: authUser.user_metadata?.display_name || authUser.email?.split("@")[0] || "User",
      role: authUser.user_metadata?.role || "tourist",
    }));

    const { error: insertError } = await supabase.from("users").insert(newUsers);

    if (insertError) {
      console.error("   ❌ Error creating user profiles:", insertError.message);
      console.error("   Details:", insertError);
    } else {
      console.log(`   ✓ Created ${newUsers.length} user profiles`);
    }
  }

  console.log("\n✅ Setup complete!");
  console.log("\nNext steps:");
  console.log("1. If you see RPC errors above, you need to run the SQL manually:");
  console.log("   - Go to Supabase Dashboard > SQL Editor");
  console.log("   - Run the contents of: supabase/migrations/0005_auth_user_trigger.sql");
  console.log("2. Try booking again - users should now have profiles automatically");
}

setupAuthTrigger().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
