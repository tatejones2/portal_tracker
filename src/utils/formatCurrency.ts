export const formatCurrency = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};
