import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { usuario } from "./src/schema/index";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL no configurada");

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

await db
  .insert(usuario)
  .values({
    nombre: "Rafael Gomero",
    email: "gomerorafael121@gmail.com",
    rol: "admin",
    activo: "1",
  })
  .onConflictDoNothing();

console.log("✓ Usuario admin creado: gomerorafael121@gmail.com");
await client.end();
