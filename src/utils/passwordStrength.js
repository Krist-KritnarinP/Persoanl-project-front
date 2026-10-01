/** A transparent length guide, not a guarantee against guessed or reused passwords. */
export function getPasswordStrength(password) {
  if (!password || password.length < 8) return 0;
  if (/(.)\1{3,}/u.test(password) || /password|123456|qwerty|abcdef|admin|letmein/i.test(password)) return 1;
  if (password.length >= 16) return 3;
  if (password.length >= 12) return 2;
  return 1;
}
