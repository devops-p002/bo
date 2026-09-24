// Validation utilities for gaming platform
class ValidationService {
  patterns: Record<string, RegExp>;
  messages: Record<string, string>;

  constructor() {
    this.patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s\-()]+$/,
      username: /^[a-zA-Z0-9_]{3,20}$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
      ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
      bankAccount: /^[0-9]{8,17}$/,
      currency: /^\d+(\.\d{1,2})?$/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      alphabetic: /^[a-zA-Z]+$/,
      numeric: /^[0-9]+$/,
      decimal: /^\d*\.?\d+$/,
      hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    };

    this.messages = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      username: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
      password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      url: 'Please enter a valid URL',
      ipAddress: 'Please enter a valid IP address',
      creditCard: 'Please enter a valid credit card number',
      bankAccount: 'Please enter a valid bank account number',
      currency: 'Please enter a valid amount',
      minLength: 'Must be at least {min} characters long',
      maxLength: 'Must be no more than {max} characters long',
      min: 'Must be at least {min}',
      max: 'Must be no more than {max}',
      range: 'Must be between {min} and {max}',
      match: 'Fields do not match',
      unique: 'This value already exists',
      custom: 'Invalid value'
    };
  }

  // Basic validation methods
  isRequired(value) {
    return value !== null && value !== undefined && value !== '';
  }

  isEmail(email) {
    return this.patterns.email.test(email);
  }

  isPhone(phone) {
    return this.patterns.phone.test(phone);
  }

  isUsername(username) {
    return this.patterns.username.test(username);
  }

  isPassword(password) {
    return this.patterns.password.test(password);
  }

  isUrl(url) {
    return this.patterns.url.test(url);
  }

  isIpAddress(ip) {
    return this.patterns.ipAddress.test(ip);
  }

  isCreditCard(cardNumber) {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    return this.patterns.creditCard.test(cleaned) && this.luhnCheck(cleaned);
  }

  isBankAccount(accountNumber) {
    return this.patterns.bankAccount.test(accountNumber);
  }

  isCurrency(amount) {
    return this.patterns.currency.test(amount);
  }

  isAlphanumeric(value) {
    return this.patterns.alphanumeric.test(value);
  }

  isAlphabetic(value) {
    return this.patterns.alphabetic.test(value);
  }

  isNumeric(value) {
    return this.patterns.numeric.test(value);
  }

  isDecimal(value) {
    return this.patterns.decimal.test(value);
  }

  isHexColor(color) {
    return this.patterns.hexColor.test(color);
  }

  isUuid(uuid) {
    return this.patterns.uuid.test(uuid);
  }

  // Length validations
  hasMinLength(value, min) {
    return value && value.length >= min;
  }

  hasMaxLength(value, max) {
    return !value || value.length <= max;
  }

  hasLengthBetween(value, min, max) {
    return value && value.length >= min && value.length <= max;
  }

  // Numeric validations
  isMin(value, min) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
  }

  isMax(value, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num <= max;
  }

  isBetween(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  // Date validations
  isDate(value) {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  isDateAfter(value, afterDate) {
    const date = new Date(value);
    const after = new Date(afterDate);
    return date > after;
  }

  isDateBefore(value, beforeDate) {
    const date = new Date(value);
    const before = new Date(beforeDate);
    return date < before;
  }

  isDateBetween(value, startDate, endDate) {
    const date = new Date(value);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  }

  isAge(birthDate, minAge, maxAge = null) {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? age - 1 
      : age;

    if (maxAge) {
      return actualAge >= minAge && actualAge <= maxAge;
    }
    return actualAge >= minAge;
  }

  // Gaming-specific validations
  isBetAmount(amount, minBet = 0.01, maxBet = 10000) {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= minBet && num <= maxBet;
  }

  isGameId(gameId) {
    return /^[a-zA-Z0-9_-]{3,50}$/.test(gameId);
  }

  isTransactionId(transactionId) {
    return /^[a-zA-Z0-9]{8,32}$/.test(transactionId);
  }

  isPlayerId(playerId) {
    return /^[a-zA-Z0-9_-]{3,30}$/.test(playerId);
  }

  isBonusCode(code) {
    return /^[A-Z0-9]{4,20}$/.test(code);
  }

  isVipLevel(level) {
    const num = parseInt(level);
    return !isNaN(num) && num >= 0 && num <= 10;
  }

  // File validations
  isFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  isFileSize(file, maxSizeInMB) {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  isImageFile(file) {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return this.isFileType(file, imageTypes);
  }

  isDocumentFile(file) {
    const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return this.isFileType(file, docTypes);
  }

  // Complex validations
  passwordStrength(password) {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('At least one lowercase letter');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('At least one uppercase letter');

    if (/\d/.test(password)) score += 1;
    else feedback.push('At least one number');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('At least one special character');

    const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];

    return {
      score,
      strength,
      feedback,
      isValid: score >= 4
    };
  }

  // Luhn algorithm for credit card validation
  luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Validate form data
  validateForm(data, rules) {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = data[field];
      const fieldErrors = [];

      fieldRules.forEach(rule => {
        const { type, params = [], message } = rule;
        let isFieldValid = true;

        switch (type) {
          case 'required':
            isFieldValid = this.isRequired(value);
            break;
          case 'email':
            isFieldValid = !value || this.isEmail(value);
            break;
          case 'phone':
            isFieldValid = !value || this.isPhone(value);
            break;
          case 'username':
            isFieldValid = !value || this.isUsername(value);
            break;
          case 'password':
            isFieldValid = !value || this.isPassword(value);
            break;
          case 'minLength':
            isFieldValid = !value || this.hasMinLength(value, params[0]);
            break;
          case 'maxLength':
            isFieldValid = !value || this.hasMaxLength(value, params[0]);
            break;
          case 'min':
            isFieldValid = !value || this.isMin(value, params[0]);
            break;
          case 'max':
            isFieldValid = !value || this.isMax(value, params[0]);
            break;
          case 'range':
            isFieldValid = !value || this.isBetween(value, params[0], params[1]);
            break;
          case 'match':
            isFieldValid = value === data[params[0]];
            break;
          case 'custom':
            isFieldValid = params[0](value, data);
            break;
          default:
            break;
        }

        if (!isFieldValid) {
          fieldErrors.push(message || this.getDefaultMessage(type, params));
          isValid = false;
        }
      });

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });

    return {
      isValid,
      errors
    };
  }

  // Get default error message
  getDefaultMessage(type, params = []) {
    let message = this.messages[type] || this.messages.custom;
    
    params.forEach((param, index) => {
      const placeholder = index === 0 ? '{min}' : index === 1 ? '{max}' : `{${index}}`;
      message = message.replace(placeholder, param);
    });

    return message;
  }

  // Sanitize input
  sanitize(value, type = 'string') {
    if (value === null || value === undefined) return '';

    switch (type) {
      case 'string':
        return String(value).trim();
      case 'email':
        return String(value).toLowerCase().trim();
      case 'phone':
        return String(value).replace(/[^\d+\-()\s]/g, '');
      case 'numeric':
        return String(value).replace(/[^\d]/g, '');
      case 'decimal':
        return String(value).replace(/[^\d.]/g, '');
      case 'alphanumeric':
        return String(value).replace(/[^a-zA-Z0-9]/g, '');
      case 'username':
        return String(value).toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
      default:
        return String(value).trim();
    }
  }

  // Escape HTML
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Validate and sanitize
  validateAndSanitize(data, rules) {
    const sanitized = {};
    
    // First sanitize
    Object.keys(data).forEach(field => {
      const rule = rules[field];
      const sanitizeType = rule?.sanitize || 'string';
      sanitized[field] = this.sanitize(data[field], sanitizeType);
    });

    // Then validate
    return {
      data: sanitized,
      ...this.validateForm(sanitized, rules)
    };
  }
}

// Create and export singleton instance
const validationService = new ValidationService();
export default validationService;

// Export class for custom instances
export { ValidationService }; 