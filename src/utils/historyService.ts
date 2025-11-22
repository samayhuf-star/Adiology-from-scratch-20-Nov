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
  async save(type: string, name: string, data: any): Promise<void> {
    try {
      // Try server first
      await api.post('/history/save', { type, name, data });
      console.log('✅ Saved to server');
    } catch (error) {
      console.log('⚠️ Server unavailable, using localStorage fallback');
      // Fallback to localStorage
      await localStorageHistory.save(type, name, data);
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