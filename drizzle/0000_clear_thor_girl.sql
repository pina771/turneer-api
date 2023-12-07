CREATE TABLE IF NOT EXISTS "federated_credentials" (
	"credential_id" text NOT NULL,
	"provider" varchar(16) NOT NULL,
	"email" text,
	CONSTRAINT federated_credentials_credential_id_provider PRIMARY KEY("credential_id","provider")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" varchar(32) NOT NULL,
	"lastName" varchar(32) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "federated_credentials" ADD CONSTRAINT "federated_credentials_email_users_email_fk" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
