import {
	pgTable,
	primaryKey,
	serial,
	text,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	email: text("email").unique().notNull(),
	firstName: varchar("firstName", { length: 32 }).notNull(),
	lastName: varchar("lastName", { length: 32 }).notNull(),
});

export const credentials = pgTable(
	"federated_credentials",
	{
		credentialId: text("credential_id").notNull(),
		provider: varchar("provider", { length: 16 }).notNull(),
		email: text("email").references(() => users.email),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.credentialId, table.provider] }),
		};
	},
);

export type Credentials = typeof credentials.$inferSelect;
export type InsertCredentials = typeof credentials.$inferInsert;
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
