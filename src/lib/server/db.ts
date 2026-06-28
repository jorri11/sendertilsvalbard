import { normalizeCategories } from '$lib/categories';
import { and, asc, desc, eq, gte, isNotNull, like, ne, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
	adminRequests,
	companies,
	pageviews,
	sessions,
	submissions,
	users,
} from './db/schema.js';

export type Company = typeof companies.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type User = typeof users.$inferSelect;
export type AdminRequest = typeof adminRequests.$inferSelect;
export type Pageview = typeof pageviews.$inferSelect;
export type PendingSubmission = Submission & {
	current_company_name: string | null;
	current_company_website: string | null;
	current_company_ships_to_svalbard: number | null;
	current_company_vat_refund: number | null;
	current_company_shipping_methods: string | null;
	current_company_categories: string | null;
	current_company_notes: string | null;
	current_company_source_url: string | null;
	possible_duplicate_company_id: number | null;
	possible_duplicate_company_name: string | null;
	possible_duplicate_company_website: string | null;
};

type CompanyFilters = {
	q?: string;
	category?: string;
};

export type PageviewInput = {
	path: string;
	referrerSource: string;
	deviceType: string;
};

export type PageviewSummary = {
	totalLast30Days: number;
	viewsToday: number;
	topPages: { path: string; views: number }[];
	dailyTotals: { date: string; views: number }[];
};

const dbPath = resolve(process.env.DATABASE_URL ?? process.env.DB_PATH ?? 'data/svalbard.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });

const client = new Database(dbPath);
client.pragma('journal_mode = WAL');
client.pragma('foreign_keys = ON');

export const db = drizzle(client, { schema: { adminRequests, companies, pageviews, sessions, submissions, users } });

let migrationsApplied = false;

export function migrateDatabase(): void {
	if (migrationsApplied) return;
	migrate(db, { migrationsFolder: resolve(process.cwd(), 'drizzle') });
	migrationsApplied = true;
}

export function normalizeUrl(value: FormDataEntryValue | null): string {
	const raw = String(value ?? '').trim();
	if (!raw) return '';
	if (/^https?:\/\//i.test(raw)) return raw;
	return `https://${raw}`;
}

export function normalizeBoolean(value: FormDataEntryValue | boolean | null): 0 | 1 {
	return value === 'on' || value === 'true' || value === true ? 1 : 0;
}

function normalizeCompanyName(value: string | null | undefined): string {
	return String(value ?? '')
		.toLowerCase()
		.replace(/&/g, 'og')
		.replace(/\b(as|asa|ab|aps|a\/s|ltd|limited|inc|gmbh)\b/g, '')
		.replace(/[^a-z0-9æøå]/g, '');
}

function normalizeHostname(value: string | null | undefined): string {
	const raw = String(value ?? '').trim();
	if (!raw) return '';

	try {
		return new URL(normalizeUrl(raw)).hostname.replace(/^www\./i, '').toLowerCase();
	} catch {
		return '';
	}
}

function localDateString(date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function daysAgo(days: number): string {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return localDateString(date);
}

function toNumber(value: number | string | null | undefined): number {
	return Number(value ?? 0);
}

export function recordPageview({ path, referrerSource, deviceType }: PageviewInput): void {
	db.insert(pageviews)
		.values({
			date: localDateString(),
			path,
			referrer_source: referrerSource,
			device_type: deviceType,
			views: 1
		})
		.onConflictDoUpdate({
			target: [
				pageviews.date,
				pageviews.path,
				pageviews.referrer_source,
				pageviews.device_type
			],
			set: {
				views: sql`${pageviews.views} + 1`,
				updated_at: sql`CURRENT_TIMESTAMP`
			}
		})
		.run();
}

export function getPageviewSummary(): PageviewSummary {
	const today = localDateString();
	const last30Days = daysAgo(29);
	const last14Days = daysAgo(13);
	const totalViews = sql<number>`coalesce(sum(${pageviews.views}), 0)`;
	const topPageViews = sql<number>`sum(${pageviews.views})`;

	const totals = db
		.select({
			totalLast30Days: totalViews,
			viewsToday: sql<number>`coalesce(sum(case when ${pageviews.date} = ${today} then ${pageviews.views} else 0 end), 0)`
		})
		.from(pageviews)
		.where(gte(pageviews.date, last30Days))
		.get();

	const topPages = db
		.select({
			path: pageviews.path,
			views: topPageViews
		})
		.from(pageviews)
		.where(gte(pageviews.date, last30Days))
		.groupBy(pageviews.path)
		.orderBy(desc(topPageViews))
		.limit(5)
		.all()
		.map((row) => ({
			path: row.path,
			views: toNumber(row.views)
		}));

	const dailyRows = db
		.select({
			date: pageviews.date,
			views: sql<number>`sum(${pageviews.views})`
		})
		.from(pageviews)
		.where(gte(pageviews.date, last14Days))
		.groupBy(pageviews.date)
		.orderBy(asc(pageviews.date))
		.all();

	const viewsByDate = new Map(dailyRows.map((row) => [row.date, toNumber(row.views)]));
	const dailyTotals = Array.from({ length: 14 }, (_, index) => {
		const date = daysAgo(13 - index);
		return {
			date,
			views: viewsByDate.get(date) ?? 0
		};
	});

	return {
		totalLast30Days: toNumber(totals?.totalLast30Days),
		viewsToday: toNumber(totals?.viewsToday),
		topPages,
		dailyTotals
	};
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
	return db.select().from(companies).where(ne(companies.status, 'deleted')).orderBy(desc(companies.updated_at), asc(companies.name)).all();
}

export function getCompanyById(id: number): Company | undefined {
	return db.select().from(companies).where(and(eq(companies.id, id), ne(companies.status, 'deleted'))).get();
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
			source_url: normalizeUrl(form.get('source_url'))
		})
		.run();

	return Number(result.lastInsertRowid);
}

export function listPendingSubmissions(): PendingSubmission[] {
	const rows = db
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
			source_url: submissions.source_url,
			status: submissions.status,
			created_at: submissions.created_at,
			current_company_name: companies.name,
			current_company_website: companies.website,
			current_company_ships_to_svalbard: companies.ships_to_svalbard,
			current_company_vat_refund: companies.vat_refund,
			current_company_shipping_methods: companies.shipping_methods,
			current_company_categories: companies.categories,
			current_company_notes: companies.notes,
			current_company_source_url: companies.source_url
		})
		.from(submissions)
		.leftJoin(companies, eq(companies.id, submissions.company_id))
		.where(eq(submissions.status, 'pending'))
		.orderBy(asc(submissions.created_at))
		.all();

	const existingCompanies = listAdminCompanies();

	return rows.map((submission) => {
		const suggestedName = normalizeCompanyName(submission.company_name);
		const suggestedHostname = normalizeHostname(submission.website);
		const duplicate = submission.submission_type === 'new_company'
			? existingCompanies.find((company) => {
				const sameName = suggestedName && suggestedName === normalizeCompanyName(company.name);
				const sameHostname = suggestedHostname && suggestedHostname === normalizeHostname(company.website);
				return sameName || sameHostname;
			})
			: undefined;

		return {
			...submission,
			possible_duplicate_company_id: duplicate?.id ?? null,
			possible_duplicate_company_name: duplicate?.name ?? null,
			possible_duplicate_company_website: duplicate?.website ?? null
		};
	});
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

export function markCompanyDeleted(id: number): void {
	db.update(companies)
		.set({
			status: 'deleted',
			updated_at: sql`CURRENT_TIMESTAMP`
		})
		.where(eq(companies.id, id))
		.run();
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
