import { Config } from "drizzle-kit";
export default {
	schema: "./src/services/db/schemas/*.ts",
	out: "./drizzle",
	dbCredentials: {
		connectionString: process.env.DB_CONNECTION as string,
	},
} satisfies Config;
