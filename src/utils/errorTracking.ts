/**
 * Error Tracking Utility
 * 
 * This module provides centralized error tracking functionality.
 * Currently uses console logging, but can be extended to integrate
 * with Sentry, LogRocket, or other error tracking services.
 */

interface ErrorContext {
  userId?: string;
  module?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private initialized = false;
  private sentryDsn: string | null = null;

  /**
   * Initialize error tracking
   */
  init() {
    if (this.initialized) return;

    // Check for Sentry DSN
    this.sentryDsn = import.meta.env.VITE_SENTRY_DSN || null;

    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          module: 'global',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason)),
          {
            module: 'promise',
            metadata: {
              reason: event.reason,
            },
          }
        );
      });
    }

    this.initialized = true;
    console.log('✅ Error tracking initialized');
  }

  /**
   * Capture an error
   */
  captureError(error: Error | string, context?: ErrorContext) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const timestamp = new Date().toISOString();

    // Log to console
    console.error('🚨 Error Captured:', {
      message: errorObj.message,
      stack: errorObj.stack,
      context,
      timestamp,
    });

    // Use production logger
    productionLogger.trackError(errorObj, context);

    // TODO: Integrate with Sentry
    // if (this.sentryDsn) {
    //   Sentry.captureException(errorObj, {
    //     tags: {
    //       module: context?.module || 'unknown',
    //       action: context?.action || 'unknown',
    //     },
    //     user: context?.userId ? { id: context.userId } : undefined,
    //     extra: context?.metadata,
    //   });
    // }

    // TODO: Send to backend logging service
    // this.sendToBackend({
    //   error: errorObj.message,
    //   stack: errorObj.stack,
    //   context,
    //   timestamp,
    // });
  }

  /**
   * Capture a warning
   */
  captureWarning(message: string, context?: ErrorContext) {
    const timestamp = new Date().toISOString();

    console.warn('⚠️ Warning:', {
      message,
      context,
      timestamp,
    });

    // TODO: Integrate with Sentry
    // if (this.sentryDsn) {
    //   Sentry.captureMessage(message, {
    //     level: 'warning',
    //     tags: {
    //       module: context?.module || 'unknown',
    //     },
    //   });
    // }
  }

  /**
   * Capture an info message
   */
  captureInfo(message: string, context?: ErrorContext) {
    const timestamp = new Date().toISOString();

    console.info('ℹ️ Info:', {
      message,
      context,
      timestamp,
    });
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string) {
    // TODO: Set Sentry user context
    // if (this.sentryDsn) {
    //   Sentry.setUser({
    //     id: userId,
    //     email,
    //   });
    // }
  }

  /**
   * Clear user context
   */
  clearUser() {
    // TODO: Clear Sentry user context
    // if (this.sentryDsn) {
    //   Sentry.setUser(null);
    // }
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Initialize on import
if (typeof window !== 'undefined') {
  errorTracker.init();
}

// Helper functions for easy usage
export const captureError = (error: Error | string, context?: ErrorContext) => {
  errorTracker.captureError(error, context);
};

export const captureWarning = (message: string, context?: ErrorContext) => {
  errorTracker.captureWarning(message, context);
};

export const captureInfo = (message: string, context?: ErrorContext) => {
  errorTracker.captureInfo(message, context);
};

