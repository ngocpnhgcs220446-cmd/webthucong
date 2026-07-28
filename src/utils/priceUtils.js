export function parseProductPrice(value, currency) {
  const text = String(value ?? '').trim();
  if (!text) return NaN;

  const normalizedCurrency = String(currency || '').trim().toUpperCase();

  if (normalizedCurrency === 'VND') {
    const numericText = text.replace(/[^\d-]/g, '');
    const enteredThousands = Number(numericText);
    if (!Number.isFinite(enteredThousands)) return NaN;
    return enteredThousands * 1000;
  }

  const numericText = text.replace(/,/g, '').replace(/[^\d.-]/g, '');
  return Number(numericText);
}

export function productPriceToInput(storedPrice, currency) {
  const amount = Number(storedPrice);
  if (!Number.isFinite(amount)) return '';

  const normalizedCurrency = String(currency || '').trim().toUpperCase();

  if (normalizedCurrency === 'VND') {
    return String(amount / 1000);
  }

  return String(amount);
}

export function normalizeVndInput(value) {
  return String(value || '')
    .replace(/[^\d]/g, '')
    .replace(/^0+(?=\d)/, '');
}
