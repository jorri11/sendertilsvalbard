import Database from 'better-sqlite3';
import { normalizeCategories } from '$lib/categories';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type Company = {
  id: number;
  name: string;
  website: string | null;
  ships_to_svalbard: 0 | 1;
  vat_refund: 0 | 1;
  shipping_methods: string | null;
  categories: string | null;
  notes: string | null;
  source_url: string | null;
  status: string;
  updated_at: string;
  created_at: string;
};

export type Submission = {
  id: number;
  company_id: number | null;
  submission_type: 'new_company' | 'change_request';
  company_name: string;
  website: string | null;
  ships_to_svalbard: 0 | 1;
  vat_refund: 0 | 1;
  shipping_methods: string | null;
  categories: string | null;
  notes: string | null;
  contact_email: string | null;
  source_url: string | null;
  status: string;
  created_at: string;
};

export type User = {
  id: number;
  email: string;
  password_hash: string;
  is_superuser: 0 | 1;
  created_at: string;
};

type CompanyFilters = {
  q?: string;
  category?: string;
};

type CompanyParams = {
  q?: string;
  category?: string;
};

const dbPath = resolve(process.env.DB_PATH ?? 'data/svalbard.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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

const submissionColumns = db.prepare('PRAGMA table_info(submissions)').all() as { name: string }[];
const submissionColumnNames = new Set(submissionColumns.map((column) => column.name));

if (!submissionColumnNames.has('company_id')) {
  db.exec('ALTER TABLE submissions ADD COLUMN company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL');
}

if (!submissionColumnNames.has('submission_type')) {
  db.exec("ALTER TABLE submissions ADD COLUMN submission_type TEXT NOT NULL DEFAULT 'new_company'");
}

const userColumns = db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
const userColumnNames = new Set(userColumns.map((column) => column.name));

if (!userColumnNames.has('is_superuser')) {
  db.exec('ALTER TABLE users ADD COLUMN is_superuser INTEGER NOT NULL DEFAULT 0');
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

export function listCompanies({ q = '', category = '' }: CompanyFilters = {}): Company[] {
  const filters = ["status = 'published'"];
  const params: CompanyParams = {};

  if (q) {
    filters.push('(name LIKE @q OR notes LIKE @q OR categories LIKE @q)');
    params.q = `%${q}%`;
  }

  if (category) {
    filters.push('categories LIKE @category');
    params.category = `%${category}%`;
  }

  return db
    .prepare(
      `SELECT * FROM companies
       WHERE ${filters.join(' AND ')}
       ORDER BY ships_to_svalbard DESC, vat_refund DESC, name ASC`
    )
    .all(params) as Company[];
}

export function companyCategories(): string[] {
  const rows = db
    .prepare("SELECT categories FROM companies WHERE status = 'published' AND categories IS NOT NULL")
    .all() as Pick<Company, 'categories'>[];
  return [...new Set(rows.flatMap((row) => String(row.categories).split(',').map((item) => item.trim()).filter(Boolean)))].sort();
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
    db.prepare(
      `UPDATE companies
       SET name = @name, website = @website, ships_to_svalbard = @ships_to_svalbard,
           vat_refund = @vat_refund, shipping_methods = @shipping_methods,
           categories = @categories, notes = @notes, source_url = @source_url,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ).run({ ...data, id });
    return Number(id);
  }

  const result = db.prepare(
    `INSERT INTO companies
      (name, website, ships_to_svalbard, vat_refund, shipping_methods, categories, notes, source_url)
     VALUES
      (@name, @website, @ships_to_svalbard, @vat_refund, @shipping_methods, @categories, @notes, @source_url)`
  ).run(data);
  return Number(result.lastInsertRowid);
}
