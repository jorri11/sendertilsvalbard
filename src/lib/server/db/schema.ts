import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const companies = sqliteTable('companies', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	website: text('website'),
	ships_to_svalbard: integer('ships_to_svalbard').notNull().default(0),
	vat_refund: integer('vat_refund').notNull().default(0),
	shipping_methods: text('shipping_methods'),
	categories: text('categories'),
	notes: text('notes'),
	source_url: text('source_url'),
	status: text('status').notNull().default('published'),
	updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
	created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const submissions = sqliteTable('submissions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	company_id: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
	submission_type: text('submission_type').notNull().default('new_company'),
	company_name: text('company_name').notNull(),
	website: text('website'),
	ships_to_svalbard: integer('ships_to_svalbard').notNull().default(0),
	vat_refund: integer('vat_refund').notNull().default(0),
	shipping_methods: text('shipping_methods'),
	categories: text('categories'),
	notes: text('notes'),
	source_url: text('source_url'),
	status: text('status').notNull().default('pending'),
	created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	password_hash: text('password_hash').notNull(),
	is_superuser: integer('is_superuser').notNull().default(0),
	created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	user_id: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires_at: text('expires_at').notNull(),
	created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const adminRequests = sqliteTable('admin_requests', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull(),
	message: text('message'),
	status: text('status').notNull().default('pending'),
	created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
