const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

function validatePort(port) {
  const num = parseInt(port, 10);
  if (isNaN(num)) return false;
  return num >= 1 && num <= 65535;
}

function validateStringLength(value, maxLen, fieldName) {
  if (value && typeof value === 'string' && value.length > maxLen) {
    return `${fieldName} must be ${maxLen} characters or fewer.`;
  }
  return null;
}

module.exports = { validateEmail, validatePassword, validatePort, validateStringLength };
