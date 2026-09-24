// Formatting utilities for gaming platform
class FormattingService {
  defaultLocale: string;
  defaultCurrency: string;
  defaultTimezone: string;

  constructor() {
    this.defaultLocale = 'en-US';
    this.defaultCurrency = 'USD';
    this.defaultTimezone = 'UTC';
  }

  // Currency formatting
  formatCurrency(amount, currency = this.defaultCurrency, locale = this.defaultLocale) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.warn('Currency formatting error:', error);
      return `${currency} ${this.formatNumber(amount, 2)}`;
    }
  }

  // Number formatting
  formatNumber(number, decimals = 0, locale = this.defaultLocale) {
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(number);
    } catch (error) {
      console.warn('Number formatting error:', error);
      return Number(number).toFixed(decimals);
    }
  }

  // Percentage formatting
  formatPercentage(value, decimals = 1, locale = this.defaultLocale) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100);
    } catch (error) {
      console.warn('Percentage formatting error:', error);
      return `${this.formatNumber(value, decimals)}%`;
    }
  }

  // Large number formatting (K, M, B)
  formatLargeNumber(number, decimals = 1) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.log10(Math.abs(number)) / 3 | 0;
    
    if (tier === 0) return this.formatNumber(number, decimals);
    
    const suffix = suffixes[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = number / scale;
    
    return this.formatNumber(scaled, decimals) + suffix;
  }

  // Date and time formatting
  formatDate(date, format = 'short', locale = this.defaultLocale) {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    try {
      const options = this.getDateFormatOptions(format);
      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return dateObj.toLocaleDateString();
    }
  }

  formatTime(date, format = 'short', locale = this.defaultLocale) {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }

    try {
      const options = this.getTimeFormatOptions(format);
      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    } catch (error) {
      console.warn('Time formatting error:', error);
      return dateObj.toLocaleTimeString();
    }
  }

  formatDateTime(date, format = 'short', locale = this.defaultLocale) {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid DateTime';
    }

    try {
      const options = this.getDateTimeFormatOptions(format);
      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    } catch (error) {
      console.warn('DateTime formatting error:', error);
      return dateObj.toLocaleString();
    }
  }

  // Relative time formatting
  formatRelativeTime(date, locale = this.defaultLocale) {
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      const intervals = [
        { unit: 'year', seconds: 31536000 },
        { unit: 'month', seconds: 2592000 },
        { unit: 'week', seconds: 604800 },
        { unit: 'day', seconds: 86400 },
        { unit: 'hour', seconds: 3600 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 }
      ];

      for (const interval of intervals) {
        const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
        if (count >= 1) {
          return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit as Intl.RelativeTimeFormatUnit);
        }
      }

      return rtf.format(0, 'second');
    } catch (error) {
      console.warn('Relative time formatting error:', error);
      return this.formatDateTime(date);
    }
  }

  // Duration formatting
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  // File size formatting
  formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

  // Phone number formatting
  formatPhoneNumber(phoneNumber, format = 'international') {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (format === 'us' && cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (format === 'us' && cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (format === 'international') {
      // Basic international formatting
      if (cleaned.length > 10) {
        return `+${cleaned.slice(0, -10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
      }
    }

    return phoneNumber; // Return original if can't format
  }

  // Credit card formatting
  formatCreditCard(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19); // Max 16 digits + 3 spaces
  }

  // Mask sensitive data
  maskCreditCard(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return cardNumber;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return this.formatCreditCard(masked + lastFour);
  }

  maskEmail(email) {
    const [username, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedUsername = username.length > 2 
      ? username[0] + '*'.repeat(username.length - 2) + username.slice(-1)
      : username;
    
    return `${maskedUsername}@${domain}`;
  }

  maskPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return phoneNumber;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return this.formatPhoneNumber(masked + lastFour);
  }

  // Gaming-specific formatting
  formatBetAmount(amount, currency = this.defaultCurrency) {
    return this.formatCurrency(amount, currency);
  }

  formatWinAmount(amount, currency = this.defaultCurrency) {
    const formatted = this.formatCurrency(amount, currency);
    return amount > 0 ? `+${formatted}` : formatted;
  }

  formatOdds(odds, format = 'decimal') {
    switch (format) {
      case 'decimal':
        return this.formatNumber(odds, 2);
      case 'fractional':
        return this.decimalToFractional(odds);
      case 'american':
        return this.decimalToAmerican(odds);
      default:
        return this.formatNumber(odds, 2);
    }
  }

  formatRTP(rtp) {
    return this.formatPercentage(rtp, 2);
  }

  formatVolatility(volatility) {
    const levels = {
      1: 'Very Low',
      2: 'Low',
      3: 'Medium',
      4: 'High',
      5: 'Very High'
    };
    return levels[volatility] || 'Unknown';
  }

  formatVIPLevel(level) {
    const levels = {
      0: 'Bronze',
      1: 'Silver',
      2: 'Gold',
      3: 'Platinum',
      4: 'Diamond',
      5: 'VIP'
    };
    return levels[level] || `Level ${level}`;
  }

  formatGameStatus(status) {
    const statuses = {
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Under Maintenance',
      coming_soon: 'Coming Soon',
      deprecated: 'Deprecated'
    };
    return statuses[status] || status;
  }

  formatTransactionStatus(status) {
    const statuses = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return statuses[status] || status;
  }

  formatUserStatus(status) {
    const statuses = {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      banned: 'Banned',
      pending_verification: 'Pending Verification',
      verified: 'Verified'
    };
    return statuses[status] || status;
  }

  // Text formatting
  truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  capitalizeFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  capitalizeWords(text) {
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  camelToTitle(camelCase) {
    return camelCase
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Helper methods for date formatting
  getDateFormatOptions(format) {
    const options = {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      medium: { year: 'numeric', month: 'long', day: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      numeric: { year: 'numeric', month: '2-digit', day: '2-digit' }
    };
    return options[format] || options.short;
  }

  getTimeFormatOptions(format) {
    const options = {
      short: { hour: '2-digit', minute: '2-digit' },
      medium: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
      long: { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }
    };
    return options[format] || options.short;
  }

  getDateTimeFormatOptions(format) {
    const dateOptions = this.getDateFormatOptions(format);
    const timeOptions = this.getTimeFormatOptions(format);
    return { ...dateOptions, ...timeOptions };
  }

  // Odds conversion helpers
  decimalToFractional(decimal) {
    const fraction = decimal - 1;
    const gcd = this.greatestCommonDivisor(fraction * 100, 100);
    const numerator = (fraction * 100) / gcd;
    const denominator = 100 / gcd;
    return `${numerator}/${denominator}`;
  }

  decimalToAmerican(decimal) {
    if (decimal >= 2) {
      return `+${Math.round((decimal - 1) * 100)}`;
    } else {
      return `-${Math.round(100 / (decimal - 1))}`;
    }
  }

  greatestCommonDivisor(a, b) {
    return b === 0 ? a : this.greatestCommonDivisor(b, a % b);
  }

  // Color formatting
  formatHexColor(color) {
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    return color.toUpperCase();
  }

  // List formatting
  formatList(items, locale = this.defaultLocale) {
    try {
      // Intl.ListFormat isn't in the lib.es2020 typings this project targets; cast to keep the
      // existing runtime behavior (supported in all real browsers/Node versions this app runs on).
      const formatter = new (Intl as any).ListFormat(locale, { style: 'long', type: 'conjunction' });
      return formatter.format(items);
    } catch (error) {
      console.warn('List formatting error:', error);
      return items.join(', ');
    }
  }
}

// Create and export singleton instance
const formattingService = new FormattingService();
export default formattingService;

// Export class for custom instances
export { FormattingService }; 