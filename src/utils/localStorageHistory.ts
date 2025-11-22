// Local storage fallback for history when server is unavailable

const STORAGE_KEY = 'adiology-campaign-history';

export interface HistoryItem {
  id: string;
  type: string;
  name: string;
  data: any;
  timestamp: string;
}

export const localStorageHistory = {
  // Save an item to local storage
  async save(type: string, name: string, data: any): Promise<void> {
    try {
      const history = this.getAll();
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        type,
        name,
        data,
        timestamp: new Date().toISOString()
      };
      
      history.push(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      console.log('✅ Saved to local storage:', newItem.id);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw error;
    }
  },

  // Get all history items
  getAll(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return [];
    }
  },

  // Delete an item by ID
  async delete(id: string): Promise<void> {
    try {
      const history = this.getAll();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log('✅ Deleted from local storage:', id);
    } catch (error) {
      console.error('Failed to delete from localStorage:', error);
      throw error;
    }
  },

  // Get items by type
  getByType(type: string): HistoryItem[] {
    return this.getAll().filter(item => item.type === type);
  },

  // Clear all history
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
