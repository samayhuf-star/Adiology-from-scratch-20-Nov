/**
 * Production Logger
 * Centralized logging for production environment
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

class ProductionLogger {
  private isProduction = !import.meta.env.DEV;
  private sessionId = this.generateSessionId();

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    try {
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        const user = JSON.parse(authUser);
        return user.email || user.id;
      }
    } catch (e) {
      // Ignore errors
    }
    return undefined;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.getUserId(),
      sessionId: this.sessionId,
    };
  }

  private log(entry: LogEntry) {
    // In production, send to logging service
    if (this.isProduction) {
      // TODO: Send to your logging service (e.g., Sentry, LogRocket, etc.)
      // Example:
      // fetch('/api/logs', {
      //   method: 'POST',
      //   body: JSON.stringify(entry),
      // }).catch(() => {});
    }

    // Always log to console in development
    if (!this.isProduction) {
      const { level, message, context } = entry;
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}]`, message, context || '');
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry('info', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(this.createLogEntry('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    this.log(this.createLogEntry('error', message, errorContext));
  }

  debug(message: string, context?: Record<string, any>) {
    if (!this.isProduction) {
      this.log(this.createLogEntry('debug', message, context));
    }
  }

  // Track user actions
  trackAction(action: string, properties?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      action,
      ...properties,
    });
  }

  // Track feature usage
  trackFeature(feature: string, properties?: Record<string, any>) {
    this.info(`Feature used: ${feature}`, {
      feature,
      ...properties,
    });
  }

  // Track errors with context
  trackError(error: Error | unknown, context?: Record<string, any>) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    this.error(message, error, context);
  }
}

export const productionLogger = new ProductionLogger();

