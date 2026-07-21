export function normalizeTaxonomy(s: string): string {
  let t = s.trim();
  t = t.replace(/\s*>\s*/g, ' > ');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

export function canonicalForCompare(s: string): string {
  let t = normalizeTaxonomy(s);
  t = t.replace(/\bGen Z\s*\(\s*18\+\s*\)/gi, 'Gen Z');
  t = t.replace(/\bGen Z(?!\s*\()/gi, 'Gen Z');
  t = t.replace(/Womens Sports/g, "Women's Sports");
  t = t.replace(/\s*\(\s*FOWS\s*\)/gi, '');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

/** CSV segment names that resolve to a different DB audience name. */
export const CSV_TO_DB_NAME_OVERRIDES: Record<string, string> = {
  'Genius Sports > Betting, Gaming & Wagering > Lottery > National Lottery':
    'Genius Sports > Betting, Gaming & Wagering > Lottery > National Lottery Players',
  'Retail Innovation Lab > Football > Flag Football > All Flag Football Fans':
    'Genius Sports > Football > Flag Football > All Flag Football Fans',
  'Genius Sports > Lifestyle > Lifestyle > Lacrosse':
    'Genius Sports > Lifestyle > Community > Lacrosse',
  'Genius Sports > Emerging Sports > Rugby > Blacks Fans':
    'Genius Sports > Emerging Sports > Rugby > All Blacks Fans',
};

export function resolveCsvSegmentToDbName(
  csvSegmentName: string,
  dbNamesByCanonical: Map<string, string>
): string | null {
  const normalizedCsv = normalizeTaxonomy(csvSegmentName);
  const override = CSV_TO_DB_NAME_OVERRIDES[normalizedCsv];
  if (override) {
    return override;
  }

  const canonical = canonicalForCompare(normalizedCsv).toLowerCase();
  return dbNamesByCanonical.get(canonical) ?? null;
}

export function buildDbNamesByCanonical(
  dbNames: Iterable<string>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const name of dbNames) {
    map.set(canonicalForCompare(name).toLowerCase(), normalizeTaxonomy(name));
  }
  return map;
}
