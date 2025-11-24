/**
 * Rate Limiter Service
 * Prevents abuse and bulk misuse of the platform
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  action: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

class RateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();
  private defaultLimits: Map<string, RateLimitConfig> = new Map([
    ['keyword-generation', { maxRequests: 10, windowMs: 60000, action: 'Generate keywords' }],
    ['csv-export', { maxRequests: 20, windowMs: 60000, action: 'Export CSV' }],
    ['ad-creation', { maxRequests: 50, windowMs: 60000, action: 'Create ads' }],
    ['campaign-creation', { maxRequests: 5, windowMs: 300000, action: 'Create campaigns' }],
    ['api-call', { maxRequests: 100, windowMs: 60000, action: 'API calls' }],
  ]);

  /**
   * Check if user has a paid plan
   */
  private isPaidUser(): boolean {
    try {
      const authUser = localStorage.getItem('auth_user');
      const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
      
      if (authUser) {
        const user = JSON.parse(authUser);
        const userData = savedUsers.find((u: any) => u.email === user.email);
        
        const plan = userData?.plan || user.plan || 'Free';
        return plan !== 'Free' && plan !== null && plan !== undefined;
      }
    } catch (e) {
      console.error('Error checking user plan:', e);
    }
    return false;
  }

  /**
   * Get rate limit config (higher limits for paid users)
   */
  private getConfig(key: string, customConfig?: RateLimitConfig): RateLimitConfig | undefined {
    const config = customConfig || this.defaultLimits.get(key);
    
    // Paid users get 10x rate limits or no limits
    if (config && this.isPaidUser()) {
      return {
        ...config,
        maxRequests: Infinity, // Unlimited for paid users
      };
    }
    
    return config;
  }

  /**
   * Check if an action is allowed based on rate limits
   */
  checkLimit(
    key: string,
    customConfig?: RateLimitConfig
  ): RateLimitResult {
    const config = this.getConfig(key, customConfig);
    
    if (!config) {
      // No limit configured, allow
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now(),
      };
    }

    // Paid users bypass rate limits
    if (this.isPaidUser() && config.maxRequests === Infinity) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now(),
      };
    }

    const now = Date.now();
    const limitKey = `${key}_${Math.floor(now / config.windowMs)}`;
    const current = this.limits.get(limitKey);

    if (!current || current.resetTime < now) {
      // New window or expired, reset
      const resetTime = now + config.windowMs;
      this.limits.set(limitKey, {
        count: 1,
        resetTime,
      });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    }

    if (current.count >= config.maxRequests) {
      // Limit exceeded
      const resetIn = Math.ceil((current.resetTime - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        message: `Rate limit exceeded. You can ${config.action} again in ${resetIn} second${resetIn > 1 ? 's' : ''}. Please wait to avoid platform abuse.`,
      };
    }

    // Increment count
    current.count++;
    this.limits.set(limitKey, current);

    return {
      allowed: true,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  /**
   * Reset limits for a specific key (admin function)
   */
  resetLimit(key: string) {
    const keysToDelete: string[] = [];
    this.limits.forEach((_, limitKey) => {
      if (limitKey.startsWith(key)) {
        keysToDelete.push(limitKey);
      }
    });
    keysToDelete.forEach(k => this.limits.delete(k));
  }

  /**
   * Get current usage stats
   */
  getUsage(key: string): { used: number; limit: number; resetTime: number } | null {
    const config = this.defaultLimits.get(key);
    if (!config) return null;

    const now = Date.now();
    const limitKey = `${key}_${Math.floor(now / config.windowMs)}`;
    const current = this.limits.get(limitKey);

    if (!current || current.resetTime < now) {
      return { used: 0, limit: config.maxRequests, resetTime: now + config.windowMs };
    }

    return {
      used: current.count,
      limit: config.maxRequests,
      resetTime: current.resetTime,
    };
  }
}

export const rateLimiter = new RateLimiter();

