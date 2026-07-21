/** Formats an HTML date input value (YYYY-MM-DD) as MM-DD-YYYY for email display. */
export function formatFlightDateForEmail(isoDate: string): string {
  const trimmed = isoDate.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return trimmed;
  const [, year, month, day] = match;
  return `${month}-${day}-${year}`;
}

/** Builds the Flight Date email line: single date or "start – end" range. */
export function formatFlightDatesForEmail(start: string, end?: string | null): string {
  const formattedStart = formatFlightDateForEmail(start);
  const trimmedEnd = end?.trim();
  if (!trimmedEnd) return formattedStart;
  return `${formattedStart} – ${formatFlightDateForEmail(trimmedEnd)}`;
}
