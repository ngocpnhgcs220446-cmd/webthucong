export function formatCurrency(amount, currency = 'VND') {
  const normalizedCurrency = String(currency || 'VND').toUpperCase();
  
  return new Intl.NumberFormat(
    normalizedCurrency === 'VND' ? 'vi-VN' : 'en-US',
    {
      style: 'currency',
      currency: normalizedCurrency,
      maximumFractionDigits: normalizedCurrency === 'VND' ? 0 : 2,
    }
  ).format(Number(amount || 0));
}
