/**
 * Notification Service
 * Provides centralized notification management with different types and priorities
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  priority?: NotificationPriority;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  private toast: any = null;

  setToastInstance(toastInstance: any) {
    this.toast = toastInstance;
  }

  private showNotification(
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ) {
    if (!this.toast) {
      // Fallback to console if toast not initialized
      console.log(`[${type.toUpperCase()}] ${message}`);
      return;
    }

    const { title, description, duration = 4000, priority = 'medium', action } = options;

    const config: any = {
      duration: priority === 'high' ? 6000 : duration,
      description: description || title,
    };

    if (action) {
      config.action = {
        label: action.label,
        onClick: action.onClick,
      };
    }

    switch (type) {
      case 'success':
        this.toast.success(title || message, config);
        break;
      case 'error':
        this.toast.error(title || message, config);
        break;
      case 'warning':
        this.toast.warning(title || message, config);
        break;
      case 'info':
        this.toast.info(title || message, config);
        break;
      case 'loading':
        return this.toast.loading(title || message, config);
      default:
        this.toast(title || message, config);
    }
  }

  success(message: string, options?: NotificationOptions) {
    this.showNotification('success', message, options);
  }

  error(message: string, options?: NotificationOptions) {
    this.showNotification('error', message, options);
  }

  warning(message: string, options?: NotificationOptions) {
    this.showNotification('warning', message, options);
  }

  info(message: string, options?: NotificationOptions) {
    this.showNotification('info', message, options);
  }

  loading(message: string, options?: NotificationOptions) {
    return this.showNotification('loading', message, options);
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) {
    if (!this.toast) {
      return promise;
    }

    return this.toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  }

  dismiss(toastId?: number | string | 'all') {
    if (!this.toast || !this.toast.dismiss) {
      return;
    }
    if (toastId === 'all' || toastId === undefined) {
      // Dismiss all toasts
      this.toast.dismiss();
    } else {
      // Dismiss specific toast
      this.toast.dismiss(toastId);
    }
  }
}

export const notifications = new NotificationService();

