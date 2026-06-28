/**
 * Validation utility functions
 */

/**
 * Validates a password against several strength rules.
 * 
 * @param {string} password The password to validate
 * @returns {object} Object containing boolean flags for each rule and an overall isValid flag
 */
export function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  // Special characters explicitly listed in requirements
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  };
}
