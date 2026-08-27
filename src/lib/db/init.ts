/**
 * One-off / re-runnable setup script — creates tables and seeds the first admin.
 * This runs OUTSIDE the Next.js server, so it loads .env itself via dotenv.
 *
 * Usage:  npx tsx src/lib/db/init.ts
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { pool, query } from "./pool";

async function run() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  console.log("Applying schema...");
  await pool.query(schemaSql);
  console.log("Schema applied.");

  const rows = await query<{ count: number }>(
    "SELECT COUNT(*)::int AS count FROM admins"
  );

  if (rows[0].count === 0) {
    const username = process.env.INITIAL_ADMIN_USERNAME || "admin";
    const password = process.env.INITIAL_ADMIN_PASSWORD || "changeme123";
    const hash = await bcrypt.hash(password, 10);
    await query("INSERT INTO admins (username, password_hash) VALUES ($1, $2)", [
      username,
      hash,
    ]);
    console.log(`Created initial admin "${username}". Treat this as a one-time bootstrap password.`);
  } else {
    console.log("Admin already exists, skipping seed.");
  }

  await pool.end();
}

run().catch((err) => {
  console.error("DB init failed:", err);
  process.exit(1);
});
