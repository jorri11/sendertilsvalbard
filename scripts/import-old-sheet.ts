import { readFileSync } from 'node:fs';
import { db, normalizeUrl, type Company } from '../src/lib/server/db.js';

type ImportRow = {
  name: string;
  website: string;
  shipsToSvalbard: 0 | 1;
  vatRefund: 0 | 1;
  notes: string;
};

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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

function marked(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function websiteFromName(name: string): string {
  const candidate = name.split(' - ')[0]?.trim().replace(/\/$/, '') ?? '';
  if (/^https?:\/\//i.test(candidate) || /^www\./i.test(candidate)) return normalizeUrl(candidate);
  if (/^[a-z0-9æøå.-]+\.[a-z]{2,}(\/.*)?$/i.test(candidate)) return normalizeUrl(candidate);
  return '';
}

function buildNotes(row: string[]): string {
  const notes = [
    row[6]?.trim(),
    'Importert fra google sheets'
  ];

  return notes.filter(Boolean).join('\n');
}

function mapRows(rows: string[][]): ImportRow[] {
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

const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: pnpm tsx scripts/import-old-sheet.ts <path-to-csv>');
  process.exit(1);
}

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

const result = db.transaction((importRows: ImportRow[]) => {
  let inserted = 0;
  let updated = 0;

  for (const row of importRows) {
    const existing = existingByName.get(row.name) as Pick<Company, 'id'> | undefined;
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
console.log(`Inserted: ${result.inserted}`);
console.log(`Updated: ${result.updated}`);
