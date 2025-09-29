// Domain blocking service
const BLOCKED_DOMAINS = [
  'gmail.com',
  'yahoo.com', 
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'tempmail.org',
  '10minutemail.com',
  'guerrillamail.com',
  // Add more domains as needed
];

const ALLOWED_DOMAINS = [
  // Whitelist specific domains if needed
  'albertinvent.com',
  'example-client.com'
];

export const domainBlockingService = {
  isEmailAllowed(email: string): { allowed: boolean; reason?: string } {
    const domain = email.toLowerCase().split('@')[1];
    
    if (!domain) {
      return { allowed: false, reason: 'Invalid email format' };
    }

    // Check whitelist first (if using whitelist approach)
    if (ALLOWED_DOMAINS.length > 0 && !ALLOWED_DOMAINS.includes(domain)) {
      return { 
        allowed: false, 
        reason: 'Please use your corporate email address' 
      };
    }

    // Check blocklist
    if (BLOCKED_DOMAINS.includes(domain)) {
      return { 
        allowed: false, 
        reason: 'Personal email addresses are not allowed. Please use your corporate email.' 
      };
    }

    // Additional checks
    if (this.isDisposableEmail(domain)) {
      return { 
        allowed: false, 
        reason: 'Temporary email addresses are not allowed' 
      };
    }

    return { allowed: true };
  },

  isDisposableEmail(domain: string): boolean {
    // Common patterns for disposable email services
    const disposablePatterns = [
      /temp.*mail/i,
      /\d+.*mail/i,
      /mail.*temp/i,
      /throwaway/i,
      /disposable/i
    ];

    return disposablePatterns.some(pattern => pattern.test(domain));
  },

  getDomainFromEmail(email: string): string {
    return email.toLowerCase().split('@')[1] || '';
  }
};