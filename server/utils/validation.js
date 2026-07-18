export const normalizePhone = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '').slice(0, 15);
};

export const validatePhone = (value, required = false) => {
  if (!value) return required ? 'Phone number is required' : null;
  const phoneRegex = /^\d{8,15}$/;
  if (!phoneRegex.test(value)) return 'Phone number must contain 8 to 15 digits';
  return null;
};

export const normalizeName = (value) => {
  if (!value) return '';
  return String(value).trim().replace(/\s+/g, ' ');
};

export const validateName = (value, required = false) => {
  if (!value) return required ? 'Name is required' : null;
  const nameRegex = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u;
  if (!nameRegex.test(value) || value.length < 2 || value.length > 100) {
    return 'Name must be 2-100 characters and contain only letters, spaces, apostrophes, and hyphens';
  }
  return null;
};

export const normalizeEmail = (value) => {
  if (!value) return '';
  return String(value).trim().toLowerCase();
};

export const validateEmail = (value, required = false) => {
  if (!value) return required ? 'Email is required' : null;
  if (value.length > 254) return 'Email is too long';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return 'Enter a valid email address';
  return null;
};

export const validateInteger = (value, min, max, required = false) => {
  if (value === null || value === undefined || value === '') {
    return required ? 'This field is required' : null;
  }
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) {
    return `Must be a whole number between ${min} and ${max}`;
  }
  return null;
};

export const validateAmount = (value, min, max, required = false) => {
  if (value === null || value === undefined || value === '') {
    return required ? 'Amount is required' : null;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) {
    return `Enter a valid amount between ${min} and ${max}`;
  }
  return null;
};

export const getLocalDateString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

export const validateDateString = (value, allowPast = false, required = false) => {
  if (!value) return required ? 'Date is required' : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Date must be in YYYY-MM-DD format';
  
  if (!allowPast) {
    const today = getLocalDateString();
    if (value < today) return 'Date cannot be in the past';
  }
  return null;
};

export const validateTime = (value, required = false) => {
  if (!value) return required ? 'Time is required' : null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return 'Time must be in HH:mm format';
  return null;
};

export const isValidHttpUrl = (value, required = false) => {
  if (!value) return required ? 'URL is required' : null;
  try {
    const url = new URL(String(value).trim());
    if (!['http:', 'https:'].includes(url.protocol)) return 'URL must start with http:// or https://';
    if (value.length > 2048) return 'URL is too long';
    return null;
  } catch {
    return 'Invalid URL format';
  }
};

export const createSlug = (value) => {
  if (!value) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const parseBoolean = (value) => {
  if (value === true || value === 'true' || value === 1) return true;
  if (value === false || value === 'false' || value === 0) return false;
  return null;
};

export const validateText = (value, maxLength, required = false) => {
  const normalized = String(value || '').trim();
  if (!normalized) return required ? 'This field is required' : null;
  if (normalized.length > maxLength) return `Must be less than ${maxLength} characters`;
  return null;
};
