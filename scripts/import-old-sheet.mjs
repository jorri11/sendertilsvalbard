import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (quoted && char === '"' && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (!quoted && char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (!quoted && char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (char !== '\r') field += char;
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function normalizeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function marked(value) {
  return Boolean(value?.trim());
}

function cleanName(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function websiteFromName(name) {
  const candidate = name.split(' - ')[0]?.trim().replace(/\/$/, '') ?? '';
  if (/^https?:\/\//i.test(candidate) || /^www\./i.test(candidate)) return normalizeUrl(candidate);
  if (/^[a-z0-9æøå.-]+\.[a-z]{2,}(\/.*)?$/i.test(candidate)) return normalizeUrl(candidate);
  return '';
}

function buildNotes(row) {
  const notes = [row[6]?.trim(), 'Importert fra google sheets'];
  return notes.filter(Boolean).join('\n');
}

function mapRows(rows) {
  return rows
    .slice(1)
    .map((row) => {
      const name = cleanName(row[0] ?? '');
      const directVat = marked(row[3]);

      return {
        name,
        website: websiteFromName(name),
        shipsToSvalbard: marked(row[1]) ? 1 : 0,
        vatRefund: directVat ? 1 : 0,
        notes: buildNotes(row)
      };
    })
    .filter((row) => row.name);
}

const csvPath = process.argv[2] ?? 'scripts/old-sheet.csv';
const dbPath = resolve(process.env.DB_PATH ?? 'data/svalbard.sqlite');

mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
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
`);

const rows = mapRows(parseCsv(readFileSync(csvPath, 'utf8')));

const existingByName = db.prepare('SELECT id FROM companies WHERE lower(name) = lower(?)');
const update = db.prepare(
  `UPDATE companies
   SET website = @website,
       ships_to_svalbard = @shipsToSvalbard,
       vat_refund = @vatRefund,
       shipping_methods = '',
       categories = '',
       notes = @notes,
       source_url = '',
       status = 'published',
       updated_at = CURRENT_TIMESTAMP
   WHERE id = @id`
);
const insert = db.prepare(
  `INSERT INTO companies
    (name, website, ships_to_svalbard, vat_refund, shipping_methods, categories, notes, source_url, status)
   VALUES
    (@name, @website, @shipsToSvalbard, @vatRefund, '', '', @notes, '', 'published')`
);

const result = db.transaction((importRows) => {
  let inserted = 0;
  let updated = 0;

  for (const row of importRows) {
    const existing = existingByName.get(row.name);
    if (existing) {
      update.run({ ...row, id: existing.id });
      updated += 1;
    } else {
      insert.run(row);
      inserted += 1;
    }
  }

  return { inserted, updated };
})(rows);

console.log(`Imported ${rows.length} rows from ${csvPath}`);
console.log(`Database: ${dbPath}`);
console.log(`Inserted: ${result.inserted}`);
console.log(`Updated: ${result.updated}`);
