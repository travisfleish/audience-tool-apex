/** First sentence only — mobile hero uses a shorter subhead than desktop. */
export function getMobileHeroSubhead(subtitle: string | undefined): string {
  if (!subtitle) return '';

  const periodSpace = subtitle.indexOf('. ');
  if (periodSpace === -1) return subtitle;

  return subtitle.slice(0, periodSpace + 1);
}
