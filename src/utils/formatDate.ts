export const formatDate = (date?: string) => {
  if (!date) return 'Not set';
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
};

export const todayDateInput = () => new Date().toISOString().slice(0, 10);
