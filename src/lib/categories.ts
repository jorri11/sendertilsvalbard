export const companyCategories = [
  'Apotek og helse',
  'Barn og baby',
  'Bil og motor',
  'Bøker og media',
  'Bygg og verktøy',
  'Dyr',
  'Elektronikk',
  'Foto og lyd',
  'Friluft og sport',
  'Garn og hobby',
  'Hjem og interiør',
  'Klær og sko',
  'Kosmetikk og velvære',
  'Mat og drikke',
  'Musikk',
  'Reise og opplevelser',
  'Spill og leker',
  'Voksen',
  'Annet'
] as const;

export type CompanyCategory = (typeof companyCategories)[number];

export function normalizeCategories(values: FormDataEntryValue[]): string {
  const allowed = new Set<string>(companyCategories);
  return values
    .map((value) => String(value).trim())
    .filter((value, index, all) => allowed.has(value) && all.indexOf(value) === index)
    .join(', ');
}

export function selectedCategories(value: string | null | undefined): string[] {
  return String(value ?? '')
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);
}
