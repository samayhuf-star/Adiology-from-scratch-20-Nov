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
      // Try server first
      const response = await api.post('/history/save', { type, name, data, status });
      console.log(`✅ Saved to server as ${status}`);
      return response.id || crypto.randomUUID();
    } catch (error) {
      console.log('⚠️ Server unavailable, using localStorage fallback');
      // Fallback to localStorage
      await localStorageHistory.save(type, name, data, status);
      // Get the last item's ID (the one we just saved)
      const items = localStorageHistory.getAll();
      return items[items.length - 1]?.id || crypto.randomUUID();
    }
  },

  /**
   * Update an existing item (for drafts)
   */
  async update(id: string, data: any, name?: string): Promise<void> {
    try {
      // Try server first
      await api.post('/history/update', { id, data, name });
      console.log('✅ Updated on server');
    } catch (error) {
      console.log('⚠️ Server unavailable, using localStorage fallback');
      // Fallback to localStorage
      await localStorageHistory.update(id, data, name);
    }
  },

  /**
   * Mark a draft as completed
   */
  async markAsCompleted(id: string): Promise<void> {
    try {
      // Try server first
      await api.post('/history/mark-completed', { id });
      console.log('✅ Marked as completed on server');
    } catch (error) {
      console.log('⚠️ Server unavailable, using localStorage fallback');
      // Fallback to localStorage
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
      console.log('✅ Loaded from server');
      return response.items || [];
    } catch (error) {
      console.log('⚠️ Server unavailable, using localStorage fallback');
      // Fallback to localStorage
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
      console.log('✅ Deleted from server');
    } catch (error) {
      console.log('⚠️ Server unavailable, using localStorage fallback');
      // Fallback to localStorage
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