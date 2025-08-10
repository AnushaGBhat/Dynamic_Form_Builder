import { ValidationRules } from '../types/formTypes';

export function validateValue(value: any, rules?: ValidationRules) {
  const errors: string[] = [];
  if (!rules) return errors;

  const v = value ?? '';

  if (rules.required) {
    if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) {
      errors.push('This field is required');
      return errors;
    }
  }
  if (rules.minLength && typeof v === 'string') {
    if (v.length < rules.minLength) errors.push(`Minimum length is ${rules.minLength}`);
  }
  if (rules.maxLength && typeof v === 'string') {
    if (v.length > rules.maxLength) errors.push(`Maximum length is ${rules.maxLength}`);
  }
  if (rules.email && typeof v === 'string') {
    const re = /^\S+@\S+\.\S+$/;
    if (!re.test(v)) errors.push('Invalid email format');
  }
  if (rules.passwordRule && typeof v === 'string') {
    if (v.length < 8) errors.push('Password must be at least 8 characters');
    if (!/\d/.test(v)) errors.push('Password must contain at least one number');
  }

  return errors;
}
