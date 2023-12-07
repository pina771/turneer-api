import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.DB_CONNECTION as string);
export const db = drizzle(queryClient);
