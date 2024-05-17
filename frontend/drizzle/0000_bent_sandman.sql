CREATE TABLE IF NOT EXISTS "labels" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"color" varchar,
	"project_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"slug" varchar NOT NULL,
	"markdown" varchar,
	"summary" varchar NOT NULL,
	"type" varchar NOT NULL,
	"impact" integer,
	"sort_order" integer,
	"status" integer NOT NULL,
	"project_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar NOT NULL,
	"assigned_by" varchar,
	"assigned_at" timestamp,
	"modified_at" timestamp,
	"modified_by" varchar
);
