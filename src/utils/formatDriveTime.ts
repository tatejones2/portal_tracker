export const formatDriveTime = (value?: string) => {
  if (!value) return 'Unknown';
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'unknown') return 'Unknown';

  const existingFormat = trimmed.match(/^(\d+):([0-5]\d)\s*hrs?$/i);
  if (existingFormat) return `${Number(existingFormat[1])}:${existingFormat[2]} hrs`;

  const normalized = trimmed
    .replace(/\bapprox(?:\.|imately)?\b/gi, '')
    .replace(/\bestimated\b/gi, '')
    .replace(/\babout\b/gi, '')
    .trim();

  const hourMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  const minuteMatch = normalized.match(/(\d+)\s*(?:minutes?|mins?|m)\b/i);

  if (hourMatch) {
    const rawHours = Number(hourMatch[1]);
    const wholeHours = Math.floor(rawHours);
    const decimalMinutes = Math.round((rawHours - wholeHours) * 60);
    const minutes = minuteMatch ? Number(minuteMatch[1]) : decimalMinutes;
    return `${wholeHours}:${String(minutes).padStart(2, '0')} hrs`;
  }

  const minutesOnly = normalized.match(/^(\d+)\s*(?:minutes?|mins?|m)\b/i);
  if (minutesOnly) {
    const totalMinutes = Number(minutesOnly[1]);
    return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, '0')} hrs`;
  }

  return normalized;
};
