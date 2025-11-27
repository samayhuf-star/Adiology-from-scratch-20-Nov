import { projectId, publicAnonKey } from './supabase/info';
import { captureError } from './errorTracking';

// Base URL for API calls
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6757d0ca`;

export const api = {
  // Health check to verify server availability
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      return response.ok;
    } catch (e) {
      captureError(e instanceof Error ? e : new Error('Health check failed'), {
        module: 'api',
        action: 'healthCheck',
      });
      return false;
    }
  },

  async post(endpoint: string, body: any) {
    // Check if projectId exists
    if (!projectId || projectId === 'undefined') {
      throw new Error('Project ID not configured');
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage += `: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (e) {
      // Silently fail for expected server unavailability (Make.com endpoints)
      // The calling code will handle fallback to localStorage
      if (e instanceof TypeError && e.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach server');
      }
      // Only capture non-404 errors to reduce noise
      if (e instanceof Error && !e.message.includes('404')) {
        captureError(e, {
          module: 'api',
          action: 'post',
          metadata: { endpoint },
        });
      }
      throw e;
    }
  },

  async get(endpoint: string) {
    // Check if projectId exists
    if (!projectId || projectId === 'undefined') {
      throw new Error('Project ID not configured');
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage += `: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (e) {
      // Silently fail for expected server unavailability (Make.com endpoints)
      // The calling code will handle fallback to localStorage
      if (e instanceof TypeError && e.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach server');
      }
      // Only capture non-404 errors to reduce noise
      if (e instanceof Error && !e.message.includes('404')) {
        captureError(e, {
          module: 'api',
          action: 'get',
          metadata: { endpoint },
        });
      }
      throw e;
    }
  }
};