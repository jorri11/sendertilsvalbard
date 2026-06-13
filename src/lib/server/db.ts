import { normalizeCategories } from '$lib/categories';
import { env } from '$env/dynamic/private';
import { and, asc, desc, eq, isNotNull, like, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
	adminRequests,
	companies,
	sessions,
	submissions,
	users,
} from './db/schema.js';

export type Company = typeof companies.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type User = typeof users.$inferSelect;
export type AdminRequest = typeof adminRequests.$inferSelect;

type CompanyFilters = {
	q?: string;
	category?: string;
};

const dbPath = resolve(env.DATABASE_URL ?? process.env.DB_PATH ?? 'data/svalbard.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });

const client = new Database(dbPath);
client.pragma('journal_mode = WAL');
client.pragma('foreign_keys = ON');

client.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    website TEXT,
    ships_to_svalbard INTEGER NOT NULL DEFAULT 0,
    vat_refund INTEGER NOT NULL DEFAULT 0,
    shipping_methods TEXT,
    categories TEXT,
    notes TEXT,
    source_url TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    submission_type TEXT NOT NULL DEFAULT 'new_company',
    company_name TEXT NOT NULL,
    website TEXT,
    ships_to_svalbard INTEGER NOT NULL DEFAULT 0,
    vat_refund INTEGER NOT NULL DEFAULT 0,
    shipping_methods TEXT,
    categories TEXT,
    notes TEXT,
    contact_email TEXT,
    source_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_superuser INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const submissionColumns = client.prepare('PRAGMA table_info(submissions)').all() as { name: string }[];
const submissionColumnNames = new Set(submissionColumns.map((column) => column.name));

if (!submissionColumnNames.has('company_id')) {
	client.exec('ALTER TABLE submissions ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL');
}

if (!submissionColumnNames.has('submission_type')) {
	client.exec("ALTER TABLE submissions ADD COLUMN submission_type TEXT NOT NULL DEFAULT 'new_company'");
}

const userColumns = client.prepare('PRAGMA table_info(users)').all() as { name: string }[];
const userColumnNames = new Set(userColumns.map((column) => column.name));

if (!userColumnNames.has('is_superuser')) {
	client.exec('ALTER TABLE users ADD COLUMN is_superuser INTEGER NOT NULL DEFAULT 0');
}

export const db = drizzle(client, { schema: { adminRequests, companies, sessions, submissions, users } });

export function normalizeUrl(value: FormDataEntryValue | null): string {
	const raw = String(value ?? '').trim();
	if (!raw) return '';
	if (/^https?:\/\//i.test(raw)) return raw;
	return `https://${raw}`;
}

export function normalizeBoolean(value: FormDataEntryValue | boolean | null): 0 | 1 {
	return value === 'on' || value === 'true' || value === true ? 1 : 0;
}

export function listCompanies({ q = '', category = '' }: CompanyFilters = {}): Company[] {
	const conditions = [eq(companies.status, 'published')];

	if (q) {
		const search = `%${q}%`;
		conditions.push(sql`(${companies.name} LIKE ${search} OR ${companies.notes} LIKE ${search} OR ${companies.categories} LIKE ${search})`);
	}

	if (category) {
		conditions.push(like(companies.categories, `%${category}%`));
	}

	return db
		.select()
		.from(companies)
		.where(and(...conditions))
		.orderBy(desc(companies.ships_to_svalbard), desc(companies.vat_refund), asc(companies.name))
		.all();
}

export function companyCategories(): string[] {
	const rows = db
		.select({ categories: companies.categories })
		.from(companies)
		.where(and(eq(companies.status, 'published'), isNotNull(companies.categories)))
		.all();

	return [...new Set(rows.flatMap((row) => String(row.categories).split(',').map((item) => item.trim()).filter(Boolean)))].sort();
}

export function listAdminCompanies(): Company[] {
	return db.select().from(companies).orderBy(desc(companies.updated_at), asc(companies.name)).all();
}

export function getCompanyById(id: number): Company | undefined {
	return db.select().from(companies).where(eq(companies.id, id)).get();
}

export function getPublishedCompanyById(id: number): Company | undefined {
	return db.select().from(companies).where(and(eq(companies.id, id), eq(companies.status, 'published'))).get();
}

export function createSubmissionFromForm(form: FormData, options: { companyId?: number; submissionType?: Submission['submission_type'] } = {}): number {
	const result = db
		.insert(submissions)
		.values({
			company_id: options.companyId ?? null,
			submission_type: options.submissionType ?? 'new_company',
			company_name: String(form.get('company_name') ?? form.get('name') ?? '').trim(),
			website: normalizeUrl(form.get('website')),
			ships_to_svalbard: normalizeBoolean(form.get('ships_to_svalbard')),
			vat_refund: normalizeBoolean(form.get('vat_refund')),
			shipping_methods: String(form.get('shipping_methods') ?? '').trim(),
			categories: normalizeCategories(form.getAll('categories')),
			notes: String(form.get('notes') ?? '').trim(),
			contact_email: String(form.get('contact_email') ?? '').trim(),
			source_url: normalizeUrl(form.get('source_url'))
		})
		.run();

	return Number(result.lastInsertRowid);
}

export function listPendingSubmissions(): (Submission & { current_company_name: string | null })[] {
	return db
		.select({
			id: submissions.id,
			company_id: submissions.company_id,
			submission_type: submissions.submission_type,
			company_name: submissions.company_name,
			website: submissions.website,
			ships_to_svalbard: submissions.ships_to_svalbard,
			vat_refund: submissions.vat_refund,
			shipping_methods: submissions.shipping_methods,
			categories: submissions.categories,
			notes: submissions.notes,
			contact_email: submissions.contact_email,
			source_url: submissions.source_url,
			status: submissions.status,
			created_at: submissions.created_at,
			current_company_name: companies.name
		})
		.from(submissions)
		.leftJoin(companies, eq(companies.id, submissions.company_id))
		.where(eq(submissions.status, 'pending'))
		.orderBy(asc(submissions.created_at))
		.all();
}

export function getPendingSubmissionById(id: number): Submission | undefined {
	return db
		.select({
			id: submissions.id,
			company_id: submissions.company_id,
			submission_type: submissions.submission_type,
			company_name: submissions.company_name,
			website: submissions.website,
			ships_to_svalbard: submissions.ships_to_svalbard,
			vat_refund: submissions.vat_refund,
			shipping_methods: submissions.shipping_methods,
			categories: submissions.categories,
			notes: submissions.notes,
			contact_email: submissions.contact_email,
			source_url: submissions.source_url,
			status: submissions.status,
			created_at: submissions.created_at
		})
		.from(submissions)
		.where(and(eq(submissions.id, id), eq(submissions.status, 'pending')))
		.get();
}

export function markSubmissionApproved(id: number): void {
	db.update(submissions).set({ status: 'approved' }).where(eq(submissions.id, id)).run();
}

export function markSubmissionRejected(id: number): void {
	db.update(submissions).set({ status: 'rejected' }).where(eq(submissions.id, id)).run();
}

export function listUsers(): Pick<User, 'id' | 'email' | 'is_superuser' | 'created_at'>[] {
	return db.select({ id: users.id, email: users.email, is_superuser: users.is_superuser, created_at: users.created_at }).from(users).orderBy(desc(users.created_at)).all();
}

export function getUserByEmail(email: string): User | undefined {
	return db.select().from(users).where(eq(users.email, email)).get();
}

export function getFirstUser(): Pick<User, 'id'> | undefined {
	return db.select({ id: users.id }).from(users).orderBy(asc(users.id)).get();
}

export function listPendingAdminRequests(): Pick<AdminRequest, 'id' | 'email' | 'message' | 'created_at'>[] {
	return db.select({ id: adminRequests.id, email: adminRequests.email, message: adminRequests.message, created_at: adminRequests.created_at }).from(adminRequests).where(eq(adminRequests.status, 'pending')).orderBy(asc(adminRequests.created_at)).all();
}

export function getPendingAdminRequest(id: number): Pick<AdminRequest, 'id' | 'email'> | undefined {
	return db.select({ id: adminRequests.id, email: adminRequests.email }).from(adminRequests).where(and(eq(adminRequests.id, id), eq(adminRequests.status, 'pending'))).get();
}

export function countPendingAdminRequests(): number {
	const row = db.select({ count: sql<number>`count(*)` }).from(adminRequests).where(eq(adminRequests.status, 'pending')).get();
	return row?.count ?? 0;
}

export function createAdminRequest(email: string, message: string): void {
	db.insert(adminRequests).values({ email, message }).run();
}

export function markAdminRequestApproved(id: number): void {
	db.update(adminRequests).set({ status: 'approved' }).where(eq(adminRequests.id, id)).run();
}

export function markAdminRequestDenied(id: number): void {
	db.update(adminRequests).set({ status: 'denied' }).where(and(eq(adminRequests.id, id), eq(adminRequests.status, 'pending'))).run();
}

export function upsertCompanyFromForm(form: FormData, id?: number): number {
	const data = {
		name: String(form.get('name') ?? '').trim(),
		website: normalizeUrl(form.get('website')),
		ships_to_svalbard: normalizeBoolean(form.get('ships_to_svalbard')),
		vat_refund: normalizeBoolean(form.get('vat_refund')),
		shipping_methods: String(form.get('shipping_methods') ?? '').trim(),
		categories: normalizeCategories(form.getAll('categories')),
		notes: String(form.get('notes') ?? '').trim(),
		source_url: normalizeUrl(form.get('source_url'))
	};

	if (!data.name) {
		throw new Error('Company name is required.');
	}

	if (id) {
		db.update(companies)
			.set({
				...data,
				updated_at: sql`CURRENT_TIMESTAMP`
			})
			.where(eq(companies.id, id))
			.run();
		return Number(id);
	}

	const result = db.insert(companies).values(data).run();
	return Number(result.lastInsertRowid);
}
