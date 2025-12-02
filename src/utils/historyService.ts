import { api } from './api';
import { localStorageHistory, HistoryItem } from './localStorageHistory';

/**
 * History service with automatic fallback to localStorage
 * Tries to use the backend server first, falls back to localStorage if unavailable
 */
export const historyService = {
  /**
   * Save a history item
   * Tries server first, falls back to localStorage
   */
  async save(type: string, name: string, data: any, status: 'draft' | 'completed' = 'completed'): Promise<string> {
    try {
      // Try server first with timeout handling
      const response = await api.post('/history/save', { type, name, data, status });
      return response.id || crypto.randomUUID();
    } catch (error: any) {
      // Silently fallback to localStorage (expected when server is not deployed or times out)
      const isExpectedError = 
        error?.name === 'TimeoutError' ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('Network error') ||
        error?.message?.includes('404') ||
        error?.message?.includes('fetch');
      
      if (isExpectedError) {
        // Expected error - fallback silently
        await localStorageHistory.save(type, name, data, status);
        // Get the last item's ID (the one we just saved)
        const items = localStorageHistory.getAll();
        return items[items.length - 1]?.id || crypto.randomUUID();
      } else {
        // Unexpected error - log but still fallback
        console.warn('Unexpected error in historyService.save, falling back to localStorage:', error);
        await localStorageHistory.save(type, name, data, status);
        const items = localStorageHistory.getAll();
        return items[items.length - 1]?.id || crypto.randomUUID();
      }
    }
  },

  /**
   * Update an existing item (for drafts)
   */
  async update(id: string, data: any, name?: string): Promise<void> {
    try {
      // Try server first with timeout handling
      await api.post('/history/update', { id, data, name });
    } catch (error: any) {
      // Silently fallback to localStorage (expected when server is not deployed or times out)
      // This includes timeout errors, network errors, and 404s
      const isExpectedError = 
        error?.name === 'TimeoutError' ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('Network error') ||
        error?.message?.includes('404') ||
        error?.message?.includes('fetch');
      
      if (isExpectedError) {
        // Expected error - fallback silently
        await localStorageHistory.update(id, data, name);
      } else {
        // Unexpected error - log but still fallback
        console.warn('Unexpected error in historyService.update, falling back to localStorage:', error);
        await localStorageHistory.update(id, data, name);
      }
    }
  },

  /**
   * Mark a draft as completed
   */
  async markAsCompleted(id: string): Promise<void> {
    try {
      // Try server first
      await api.post('/history/mark-completed', { id });
    } catch (error) {
      // Silently fallback to localStorage (expected when server is not deployed)
      await localStorageHistory.markAsCompleted(id);
    }
  },

  /**
   * Get all history items
   * Tries server first, falls back to localStorage
   */
  async getAll(): Promise<HistoryItem[]> {
    try {
      // Try server first
      const response = await api.get('/history/list');
      return response.items || [];
    } catch (error) {
      // Silently fallback to localStorage (expected when server is not deployed)
      return localStorageHistory.getAll();
    }
  },

  /**
   * Get history (alias for getAll that returns the expected format)
   */
  async getHistory(): Promise<{ history: HistoryItem[] }> {
    const items = await this.getAll();
    return { history: items };
  },

  /**
   * Delete a history item
   * Tries server first, falls back to localStorage
   */
  async delete(id: string): Promise<void> {
    try {
      // Try server first
      await api.post('/history/delete', { id });
    } catch (error) {
      // Silently fallback to localStorage (expected when server is not deployed)
      await localStorageHistory.delete(id);
    }
  },

  /**
   * Delete history (alias for delete)
   */
  async deleteHistory(id: string): Promise<void> {
    return this.delete(id);
  },

  /**
   * Get items by type
   */
  async getByType(type: string): Promise<HistoryItem[]> {
    const items = await this.getAll();
    return items.filter(item => item.type === type);
  }
};