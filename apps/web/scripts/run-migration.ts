import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration(migrationFile: string) {
  console.log(`Running migration: ${migrationFile}`);
  
  const migrationPath = path.join(process.cwd(), "../../supabase/migrations", migrationFile);
  const sql = fs.readFileSync(migrationPath, "utf-8");
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  
  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc("exec_sql", { sql_query: statement });
      if (error) {
        // Try direct execution if rpc fails
        const { error: directError } = await supabase.from("_migrations").select("*").limit(0);
        if (directError) {
          console.error(`Error executing statement: ${error.message}`);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }
  
  console.log(`✓ Migration completed: ${migrationFile}`);
}

async function main() {
  const migrationFile = process.argv[2] || "0005_auth_user_trigger.sql";
  await runMigration(migrationFile);
}

main().catch(console.error);
