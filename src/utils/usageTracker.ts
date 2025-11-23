/**
 * Usage Tracker Service
 * Tracks user usage and enforces quotas to prevent bulk misuse
 */

export interface UsageQuota {
  daily: number;
  monthly: number;
  perAction: number;
}

export interface UsageStats {
  today: number;
  thisMonth: number;
  lastAction: number;
  quota: UsageQuota;
}

class UsageTracker {
  private storageKey = 'adiology_usage_stats';
  private quotas: Map<string, UsageQuota> = new Map([
    ['keyword-generation', { daily: 100, monthly: 2000, perAction: 500 }],
    ['csv-export', { daily: 50, monthly: 1000, perAction: 1 }],
    ['ad-creation', { daily: 200, monthly: 5000, perAction: 25 }],
    ['campaign-creation', { daily: 20, monthly: 500, perAction: 1 }],
  ]);

  private getStorageKey(action: string): string {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM
    return `${this.storageKey}_${action}_${today}_${month}`;
  }

  /**
   * Track usage of an action
   */
  trackUsage(action: string, amount: number = 1): { allowed: boolean; stats: UsageStats; message?: string } {
    const quota = this.quotas.get(action);
    if (!quota) {
      return {
        allowed: true,
        stats: {
          today: 0,
          thisMonth: 0,
          lastAction: 0,
          quota: { daily: Infinity, monthly: Infinity, perAction: Infinity },
        },
      };
    }

    const storageKey = this.getStorageKey(action);
    const stored = localStorage.getItem(storageKey);
    const stats: UsageStats = stored
      ? JSON.parse(stored)
      : {
          today: 0,
          thisMonth: 0,
          lastAction: 0,
          quota,
        };

    // Check per-action limit
    if (amount > quota.perAction) {
      return {
        allowed: false,
        stats,
        message: `Bulk operation limit exceeded. Maximum ${quota.perAction} items per operation. Please split your request into smaller batches.`,
      };
    }

    // Check daily limit
    if (stats.today + amount > quota.daily) {
      return {
        allowed: false,
        stats,
        message: `Daily limit reached. You've used ${stats.today} of ${quota.daily} ${action} operations today. Please try again tomorrow or contact support for higher limits.`,
      };
    }

    // Check monthly limit
    if (stats.thisMonth + amount > quota.monthly) {
      return {
        allowed: false,
        stats,
        message: `Monthly limit reached. You've used ${stats.thisMonth} of ${quota.monthly} ${action} operations this month. Please upgrade your plan or contact support.`,
      };
    }

    // Update stats
    stats.today += amount;
    stats.thisMonth += amount;
    stats.lastAction = Date.now();
    localStorage.setItem(storageKey, JSON.stringify(stats));

    return {
      allowed: true,
      stats,
    };
  }

  /**
   * Get current usage stats
   */
  getUsage(action: string): UsageStats | null {
    const quota = this.quotas.get(action);
    if (!quota) return null;

    const storageKey = this.getStorageKey(action);
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return {
        today: 0,
        thisMonth: 0,
        lastAction: 0,
        quota,
      };
    }

    return JSON.parse(stored);
  }

  /**
   * Reset usage (admin function)
   */
  resetUsage(action: string) {
    const today = new Date().toISOString().split('T')[0];
    const month = new Date().toISOString().substring(0, 7);
    const storageKey = `${this.storageKey}_${action}_${today}_${month}`;
    localStorage.removeItem(storageKey);
  }

  /**
   * Check if user is approaching limits
   */
  checkWarnings(action: string): string | null {
    const stats = this.getUsage(action);
    if (!stats) return null;

    const { today, thisMonth, quota } = stats;
    const dailyPercent = (today / quota.daily) * 100;
    const monthlyPercent = (thisMonth / quota.monthly) * 100;

    if (dailyPercent >= 90) {
      return `⚠️ You've used ${today} of ${quota.daily} daily ${action} operations (${Math.round(dailyPercent)}%). Please use resources wisely.`;
    }

    if (monthlyPercent >= 90) {
      return `⚠️ You've used ${thisMonth} of ${quota.monthly} monthly ${action} operations (${Math.round(monthlyPercent)}%). Consider upgrading your plan.`;
    }

    if (dailyPercent >= 75) {
      return `ℹ️ You've used ${today} of ${quota.daily} daily ${action} operations. ${quota.daily - today} remaining today.`;
    }

    return null;
  }
}

export const usageTracker = new UsageTracker();

