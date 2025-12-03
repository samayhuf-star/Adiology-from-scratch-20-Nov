import { projectId, publicAnonKey } from './supabase/info';
import { captureError } from './errorTracking';
import { loggingService } from './loggingService';

// Base URL for API calls
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6757d0ca`;

export const api = {
  // Health check to verify server availability
  async healthCheck() {
    try {
      loggingService.logProcessing('Health check started', { endpoint: '/health' });
      const response = await fetch(`${API_BASE}/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const isHealthy = response.ok;
      loggingService.logSystemEvent('Health check completed', { status: response.status, healthy: isHealthy });
      return isHealthy;
    } catch (e) {
      loggingService.addLog('error', 'API', 'Health check failed', { error: e instanceof Error ? e.message : String(e) });
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
      const error = new Error('Project ID not configured');
      loggingService.addLog('error', 'API', 'POST request failed: Project ID not configured', { endpoint });
      throw error;
    }

    try {
      loggingService.logTransaction('API', `POST ${endpoint}`, { endpoint, bodySize: JSON.stringify(body).length });
      
      // Create abort controller for timeout (30 seconds for auto-save operations, 60 for others)
      const timeoutMs = endpoint.includes('/history/update') || endpoint.includes('/history/save') ? 30000 : 60000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle 404s for expected missing endpoints (edge functions, tables)
          if (response.status === 404) {
            // Check if this is an expected endpoint (backend not deployed)
            const isExpectedEndpoint = 
              endpoint.includes('/history/') ||
              endpoint.includes('/generate-ads') ||
              endpoint.includes('/published_websites');
            
            if (isExpectedEndpoint) {
              // Log as warning instead of error
              loggingService.addLog('warning', 'API', `POST ${endpoint} → 404 (Expected fallback - backend not deployed)`, { 
                endpoint,
                note: 'This is expected when backend endpoints are not deployed. The app will use fallback mechanisms.'
              });
              const silentError = new Error('Request failed');
              silentError.name = 'NotFoundError';
              throw silentError;
            }
          }
          
          let errorMessage = 'Request failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage += `: ${response.statusText}`;
          }
          loggingService.addLog('error', 'API', `POST ${endpoint} failed: ${errorMessage}`, { 
            endpoint, 
            status: response.status,
            statusText: response.statusText 
          });
          throw new Error(errorMessage);
        }

        const data = await response.json();
        loggingService.logTransaction('API', `POST ${endpoint} succeeded`, { endpoint, status: response.status });
        return data;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle abort/timeout errors
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
          const timeoutError = new Error(`Request timeout after ${timeoutMs}ms`);
          timeoutError.name = 'TimeoutError';
          
          // For history operations, log as warning (expected fallback)
          if (endpoint.includes('/history/')) {
            loggingService.addLog('warning', 'API', `POST ${endpoint} timed out (falling back to localStorage)`, { 
              endpoint,
              timeout: timeoutMs
            });
          } else {
            loggingService.addLog('error', 'API', `POST ${endpoint} timed out`, { 
              endpoint,
              timeout: timeoutMs
            });
          }
          
          throw timeoutError;
        }
        
        // Re-throw other errors
        throw fetchError;
      }
    } catch (e) {
      // Check if this is a NotFoundError (expected 404) - already logged as warning above
      if (e instanceof Error && e.name === 'NotFoundError') {
        throw e;
      }
      
      // Silently fail for expected server unavailability (Make.com endpoints)
      // The calling code will handle fallback to localStorage
      if (e instanceof TypeError && e.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to reach server');
        loggingService.addLog('warning', 'API', `POST ${endpoint}: Network error (Expected fallback)`, { endpoint });
        throw networkError;
      }
      
      // Don't capture expected errors (404, network errors, or generic request failures)
      // These are expected when the server is unavailable
      const errorMessage = e instanceof Error ? e.message : String(e);
      const isExpectedError = 
        errorMessage.includes('404') ||
        errorMessage.includes('Network error') ||
        errorMessage.includes('Request failed') ||
        errorMessage.includes('fetch');
      
      // Only log as error if it's not an expected error
      if (!isExpectedError) {
        loggingService.addLog('error', 'API', `POST ${endpoint} error: ${errorMessage}`, { endpoint, error: errorMessage });
        captureError(e instanceof Error ? e : new Error(String(e)), {
          module: 'api',
          action: 'post',
          metadata: { endpoint },
        });
      } else {
        // Log expected errors as warnings
        loggingService.addLog('warning', 'API', `POST ${endpoint}: ${errorMessage} (Expected fallback)`, { endpoint });
      }
      throw e;
    }
  },

  async get(endpoint: string) {
    // Check if projectId exists
    if (!projectId || projectId === 'undefined') {
      const error = new Error('Project ID not configured');
      loggingService.addLog('error', 'API', 'GET request failed: Project ID not configured', { endpoint });
      throw error;
    }

    try {
      loggingService.logTransaction('API', `GET ${endpoint}`, { endpoint });
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        // Handle 404s for expected missing endpoints (edge functions, tables)
        if (response.status === 404) {
          // Check if this is an expected endpoint (backend not deployed)
          const isExpectedEndpoint = 
            endpoint.includes('/history/') ||
            endpoint.includes('/published_websites') ||
            endpoint.includes('/generate-ads');
          
          if (isExpectedEndpoint) {
            // Log as warning instead of error
            loggingService.addLog('warning', 'API', `GET ${endpoint} → 404 (Expected fallback - backend not deployed)`, { 
              endpoint,
              note: 'This is expected when backend endpoints are not deployed. The app will use fallback mechanisms.'
            });
            const silentError = new Error('Request failed');
            silentError.name = 'NotFoundError';
            throw silentError;
          }
        }
        
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage += `: ${response.statusText}`;
        }
        loggingService.addLog('error', 'API', `GET ${endpoint} failed: ${errorMessage}`, { 
          endpoint, 
          status: response.status,
          statusText: response.statusText 
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      loggingService.logTransaction('API', `GET ${endpoint} succeeded`, { endpoint, status: response.status });
      return data;
    } catch (e) {
      // Check if this is a NotFoundError (expected 404)
      if (e instanceof Error && e.name === 'NotFoundError') {
        // Already logged as warning above, just re-throw
        throw e;
      }
      
      // Silently fail for expected server unavailability (Make.com endpoints)
      // The calling code will handle fallback to localStorage
      if (e instanceof TypeError && e.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to reach server');
        loggingService.addLog('warning', 'API', `GET ${endpoint}: Network error (Expected fallback)`, { endpoint });
        throw networkError;
      }
      
      // Don't capture expected errors (404, network errors, or generic request failures)
      // These are expected when the server is unavailable
      const errorMessage = e instanceof Error ? e.message : String(e);
      const isExpectedError = 
        errorMessage.includes('404') ||
        errorMessage.includes('Network error') ||
        errorMessage.includes('Request failed') ||
        errorMessage.includes('fetch');
      
      // Only log as error if it's not an expected error
      if (!isExpectedError) {
        loggingService.addLog('error', 'API', `GET ${endpoint} error: ${errorMessage}`, { endpoint, error: errorMessage });
        captureError(e instanceof Error ? e : new Error(String(e)), {
          module: 'api',
          action: 'get',
          metadata: { endpoint },
        });
      } else {
        // Log expected errors as warnings
        loggingService.addLog('warning', 'API', `GET ${endpoint}: ${errorMessage} (Expected fallback)`, { endpoint });
      }
      throw e;
    }
  }
};