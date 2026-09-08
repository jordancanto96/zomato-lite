import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import path from "node:path";

const sql = neon(process.env.DATABASE_URL);

const schemaPath = path.join(process.cwd(), "db", "schema.sql");
console.log("Applying", schemaPath, "...");
const schema = readFileSync(schemaPath, "utf8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const statement of statements) {
  console.log(">", statement.slice(0, 60).replace(/\s+/g, " "), "...");
  await sql.query(statement);
}

const restaurants = await sql.query("SELECT * FROM restaurants;");
console.log("\nrestaurants:");
console.table(restaurants);

const reviews = await sql.query("SELECT * FROM reviews ORDER BY created_at;");
console.log("\nreviews:");
console.table(reviews);