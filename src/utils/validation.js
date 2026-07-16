export function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function validateRequiredFields(data, requiredFields) {
  const errors = {};
  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      errors[field] = 'This field is required';
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}
