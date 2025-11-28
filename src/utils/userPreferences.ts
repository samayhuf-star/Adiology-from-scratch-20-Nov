/**
 * User Preferences Utility
 * Stores user-specific preferences in localStorage
 */

export interface UserPreferences {
  spacing: number; // Spacing multiplier (0.75, 1.0, 1.25, 1.5, 1.75, 2.0)
  fontSize: number; // Font size multiplier (0.875, 1.0, 1.125, 1.25, 1.375, 1.5)
  colorTheme: 'default' | 'blue' | 'green'; // Color theme option
}

const DEFAULT_PREFERENCES: UserPreferences = {
  spacing: 1.0,
  fontSize: 1.0,
  colorTheme: 'default'
};

const STORAGE_KEY = 'user_preferences';

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Save user preferences to localStorage
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    applyUserPreferences(updated);
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
}

/**
 * Apply user preferences to the DOM
 */
export function applyUserPreferences(prefs: UserPreferences): void {
  const root = document.documentElement;
  
  // Apply spacing
  root.style.setProperty('--user-spacing-multiplier', prefs.spacing.toString());
  
  // Apply font size
  root.style.setProperty('--user-font-size-multiplier', prefs.fontSize.toString());
  
  // Apply color theme
  root.setAttribute('data-color-theme', prefs.colorTheme);
  
  // Remove other theme classes
  root.classList.remove('theme-default', 'theme-blue', 'theme-green');
  root.classList.add(`theme-${prefs.colorTheme}`);
}

/**
 * Initialize preferences on app load
 */
export function initializeUserPreferences(): void {
  const prefs = getUserPreferences();
  applyUserPreferences(prefs);
}

/**
 * Get spacing value with multiplier applied
 */
export function getSpacing(baseValue: number): string {
  const prefs = getUserPreferences();
  return `${baseValue * prefs.spacing}rem`;
}

/**
 * Get font size with multiplier applied
 */
export function getFontSize(baseSize: number): string {
  const prefs = getUserPreferences();
  return `${baseSize * prefs.fontSize}rem`;
}

