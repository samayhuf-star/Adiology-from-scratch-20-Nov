/**
 * Theme System for Adiology Dashboard
 * Provides multiple color schemes that users can select
 */

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryGradient: string;
    
    // Secondary colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    secondaryGradient: string;
    
    // Accent colors
    accent: string;
    accentLight: string;
    accentDark: string;
    
    // Background colors
    bgPrimary: string;
    bgSecondary: string;
    bgCard: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Border colors
    border: string;
    borderLight: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const themes: Record<string, Theme> = {
  // Theme 1: Purple Elegance (Default)
  purple: {
    id: 'purple',
    name: 'Purple Elegance',
    description: 'Classic purple and indigo combination',
    colors: {
      primary: 'indigo-600',
      primaryLight: 'indigo-50',
      primaryDark: 'indigo-700',
      primaryGradient: 'from-indigo-500 to-purple-600',
      
      secondary: 'purple-600',
      secondaryLight: 'purple-50',
      secondaryDark: 'purple-700',
      secondaryGradient: 'from-purple-500 to-pink-600',
      
      accent: 'pink-600',
      accentLight: 'pink-50',
      accentDark: 'pink-700',
      
      bgPrimary: 'slate-50',
      bgSecondary: 'white',
      bgCard: 'white/60',
      
      textPrimary: 'slate-900',
      textSecondary: 'slate-600',
      textMuted: 'slate-400',
      
      border: 'slate-200',
      borderLight: 'slate-100',
      
      success: 'green-600',
      warning: 'amber-600',
      error: 'red-600',
      info: 'blue-600',
    },
  },

  // Theme 2: Ocean Blue
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calming blue and cyan tones',
    colors: {
      primary: 'blue-600',
      primaryLight: 'blue-50',
      primaryDark: 'blue-700',
      primaryGradient: 'from-blue-500 to-cyan-600',
      
      secondary: 'cyan-600',
      secondaryLight: 'cyan-50',
      secondaryDark: 'cyan-700',
      secondaryGradient: 'from-cyan-500 to-teal-600',
      
      accent: 'teal-600',
      accentLight: 'teal-50',
      accentDark: 'teal-700',
      
      bgPrimary: 'blue-50',
      bgSecondary: 'white',
      bgCard: 'white/60',
      
      textPrimary: 'slate-900',
      textSecondary: 'slate-600',
      textMuted: 'slate-400',
      
      border: 'blue-200',
      borderLight: 'blue-100',
      
      success: 'emerald-600',
      warning: 'orange-600',
      error: 'rose-600',
      info: 'sky-600',
    },
  },

  // Theme 3: Forest Green
  forest: {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green and emerald shades',
    colors: {
      primary: 'emerald-600',
      primaryLight: 'emerald-50',
      primaryDark: 'emerald-700',
      primaryGradient: 'from-emerald-500 to-green-600',
      
      secondary: 'green-600',
      secondaryLight: 'green-50',
      secondaryDark: 'green-700',
      secondaryGradient: 'from-green-500 to-lime-600',
      
      accent: 'lime-600',
      accentLight: 'lime-50',
      accentDark: 'lime-700',
      
      bgPrimary: 'emerald-50',
      bgSecondary: 'white',
      bgCard: 'white/60',
      
      textPrimary: 'slate-900',
      textSecondary: 'slate-600',
      textMuted: 'slate-400',
      
      border: 'emerald-200',
      borderLight: 'emerald-100',
      
      success: 'green-600',
      warning: 'amber-600',
      error: 'red-600',
      info: 'teal-600',
    },
  },

  // Theme 4: Sunset Orange
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm orange and amber tones',
    colors: {
      primary: 'orange-600',
      primaryLight: 'orange-50',
      primaryDark: 'orange-700',
      primaryGradient: 'from-orange-500 to-red-600',
      
      secondary: 'amber-600',
      secondaryLight: 'amber-50',
      secondaryDark: 'amber-700',
      secondaryGradient: 'from-amber-500 to-orange-600',
      
      accent: 'red-600',
      accentLight: 'red-50',
      accentDark: 'red-700',
      
      bgPrimary: 'orange-50',
      bgSecondary: 'white',
      bgCard: 'white/60',
      
      textPrimary: 'slate-900',
      textSecondary: 'slate-600',
      textMuted: 'slate-400',
      
      border: 'orange-200',
      borderLight: 'orange-100',
      
      success: 'emerald-600',
      warning: 'yellow-600',
      error: 'red-600',
      info: 'blue-600',
    },
  },
};

export const defaultTheme = themes.purple;

// Helper function to get theme from localStorage
export function getStoredTheme(): Theme {
  try {
    const storedThemeId = localStorage.getItem('adiology-theme');
    if (storedThemeId && themes[storedThemeId]) {
      return themes[storedThemeId];
    }
  } catch (e) {
    console.error('Failed to load theme from localStorage:', e);
  }
  return defaultTheme;
}

// Helper function to save theme to localStorage
export function saveTheme(themeId: string): void {
  try {
    localStorage.setItem('adiology-theme', themeId);
  } catch (e) {
    console.error('Failed to save theme to localStorage:', e);
  }
}

// Helper function to get Tailwind classes for a theme
export function getThemeClasses(theme: Theme) {
  return {
    // Gradients
    primaryGradient: `bg-gradient-to-r ${theme.colors.primaryGradient}`,
    secondaryGradient: `bg-gradient-to-r ${theme.colors.secondaryGradient}`,
    
    // Backgrounds
    bgPrimary: `bg-${theme.colors.bgPrimary}`,
    bgSecondary: `bg-${theme.colors.bgSecondary}`,
    bgCard: `bg-${theme.colors.bgCard}`,
    
    // Text
    textPrimary: `text-${theme.colors.textPrimary}`,
    textSecondary: `text-${theme.colors.textSecondary}`,
    textMuted: `text-${theme.colors.textMuted}`,
    
    // Borders
    border: `border-${theme.colors.border}`,
    borderLight: `border-${theme.colors.borderLight}`,
    
    // Primary colors
    primary: `text-${theme.colors.primary}`,
    primaryBg: `bg-${theme.colors.primary}`,
    primaryBgLight: `bg-${theme.colors.primaryLight}`,
    primaryBorder: `border-${theme.colors.primary}`,
    
    // Secondary colors
    secondary: `text-${theme.colors.secondary}`,
    secondaryBg: `bg-${theme.colors.secondary}`,
    secondaryBgLight: `bg-${theme.colors.secondaryLight}`,
    secondaryBorder: `border-${theme.colors.secondary}`,
    
    // Status colors
    success: `text-${theme.colors.success}`,
    warning: `text-${theme.colors.warning}`,
    error: `text-${theme.colors.error}`,
    info: `text-${theme.colors.info}`,
  };
}

// Apply theme to DOM by setting data attribute
export function applyThemeToDOM(theme: Theme): void {
  // Set the theme ID as a data attribute on the html element
  document.documentElement.setAttribute('data-theme', theme.id);
  
  // Also set individual color classes for dynamic usage
  document.documentElement.classList.remove('theme-purple', 'theme-ocean', 'theme-forest', 'theme-sunset');
  document.documentElement.classList.add(`theme-${theme.id}`);
}

