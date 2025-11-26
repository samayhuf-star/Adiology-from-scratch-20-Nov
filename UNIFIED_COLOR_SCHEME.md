# Unified Color Scheme - Adiology Dashboard

## Overview
This document describes the unified 3-color palette applied across the entire Adiology Dashboard to ensure visual consistency.

## Color Palette

### Primary Color: **Indigo**
- **Main**: `indigo-600` (#4F46E5)
- **Light**: `indigo-50` to `indigo-500`
- **Dark**: `indigo-700` to `indigo-900`
- **Usage**: Main brand color, primary buttons, active states, menu highlights

### Secondary Color: **Purple**
- **Main**: `purple-600` (#9333EA)
- **Light**: `purple-50` to `purple-500`
- **Dark**: `purple-700` to `purple-900`
- **Usage**: Accents, secondary elements, gradients (paired with Indigo)

### Tertiary Color: **Cyan**
- **Main**: `cyan-600` (#06B6D4)
- **Light**: `cyan-50` to `cyan-500`
- **Dark**: `cyan-700` to `cyan-900`
- **Usage**: Success states, complementary accents, highlights

### Neutral Colors: **Slate**
- **Range**: `slate-50` to `slate-900`
- **Usage**: Backgrounds, text, borders, inactive states

## Implementation

### 1. **Global Background**
```tsx
// Updated from: from-slate-50 via-blue-50 to-indigo-50
// Updated to: from-indigo-50 via-purple-50 to-cyan-50
<div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50">
```

### 2. **Sidebar & Navigation**
```tsx
// Logo gradient
<div className="bg-gradient-to-br from-indigo-600 to-purple-600">

// Active menu item
<button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300/40">

// Hover state
<button className="hover:bg-indigo-50">
```

### 3. **Buttons**
```tsx
// Primary button
<Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">

// Secondary button
<Button className="bg-purple-600 hover:bg-purple-700">

// Tertiary/Accent button
<Button className="bg-cyan-600 hover:bg-cyan-700">
```

### 4. **Cards**
```tsx
// Primary card background
<Card className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">

// Accent card background
<Card className="bg-gradient-to-br from-white via-cyan-50/20 to-indigo-50/20">
```

### 5. **Badges**
```tsx
// Primary badge
<Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">

// Secondary badge
<Badge className="bg-purple-100 text-purple-700 border-purple-300">

// Tertiary badge
<Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">
```

### 6. **Text Colors**
```tsx
// Headings
<h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">

// Primary text
<p className="text-indigo-600">

// Secondary text
<p className="text-purple-600">

// Tertiary text
<p className="text-cyan-600">
```

### 7. **Borders**
```tsx
// Primary borders
<div className="border-indigo-200 hover:border-indigo-300">

// Secondary borders
<div className="border-purple-200">

// Tertiary borders
<div className="border-cyan-200">
```

### 8. **Focus States**
```tsx
// Input focus
<input className="focus:border-indigo-400 focus:ring-indigo-400">

// Button focus
<button className="focus:ring-2 focus:ring-indigo-400/50">
```

## Updated Files

### Core Application
- ✅ `src/App.tsx` - Main app, sidebar, navigation, header
- ✅ `src/utils/colorScheme.ts` - Color scheme constants
- ✅ `src/index.css` - Global CSS utilities

### Components (To be updated)
- ⏳ `src/components/Dashboard.tsx`
- ⏳ `src/components/CampaignBuilder2.tsx`
- ⏳ `src/components/CampaignPresets.tsx`
- ⏳ `src/components/WebsiteTemplates.tsx`
- ⏳ `src/components/KeywordPlanner.tsx`
- ⏳ `src/components/KeywordMixer.tsx`
- ⏳ `src/components/AdsBuilder.tsx`
- ⏳ `src/components/HistoryPanel.tsx`
- ⏳ `src/components/SettingsPanel.tsx`
- ⏳ `src/components/Auth.tsx`
- ⏳ `src/components/HomePage.tsx`

## Color Scheme Utility Classes

The `src/utils/colorScheme.ts` file exports pre-configured class names:

```typescript
import { COLOR_CLASSES } from './utils/colorScheme';

// Use in components
<div className={COLOR_CLASSES.primaryGradient}>
<button className={COLOR_CLASSES.primaryButton}>
<Badge className={COLOR_CLASSES.primaryBadge}>
```

## CSS Utility Classes

Global CSS classes are available in `src/index.css`:

- `.theme-gradient-primary` - Indigo to purple gradient
- `.theme-gradient-text` - Gradient text effect
- `.theme-button-primary` - Primary button style
- `.theme-card-primary` - Primary card background
- `.theme-badge-primary` - Primary badge style
- `.theme-text-primary` - Indigo text color
- `.theme-border-primary` - Indigo border color
- `.theme-bg-primary-light` - Light indigo background

## Migration Guide

### Replacing Colors in Existing Components

1. **Blue colors** → Replace with **Indigo**
   - `from-blue-600` → `from-indigo-600`
   - `bg-blue-50` → `bg-indigo-50`
   - `text-blue-600` → `text-indigo-600`
   - `border-blue-200` → `border-indigo-200`

2. **Emerald/Teal colors** → Replace with **Cyan** or **Purple**
   - `from-emerald-600` → `from-cyan-600` (for accents)
   - `bg-teal-50` → `bg-cyan-50`
   - `text-emerald-600` → `text-cyan-600`

3. **Other colors** (Amber, Orange, Red, Pink) → Replace with **Indigo/Purple/Cyan**
   - Success states → Use `cyan-*`
   - Warning/Info → Use `purple-*`
   - Highlights → Use `indigo-*`

### Example Replacement

**Before:**
```tsx
<div className="bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">
  <h2 className="text-blue-900">Title</h2>
  <Badge className="bg-teal-100 text-teal-700 border-teal-300">
    Tag
  </Badge>
</div>
```

**After:**
```tsx
<div className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
  <h2 className="text-indigo-900">Title</h2>
  <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">
    Tag
  </Badge>
</div>
```

## Benefits

1. **Visual Consistency** - Same colors across all pages and components
2. **Brand Identity** - Cohesive look and feel with Indigo/Purple/Cyan palette
3. **Easier Maintenance** - Centralized color definitions
4. **Better UX** - Predictable color meanings (e.g., cyan = success)
5. **Theme Support** - Easy to extend with dark mode or custom themes

## Next Steps

1. Update remaining components to use unified color scheme
2. Test all pages for visual consistency
3. Verify accessibility (contrast ratios)
4. Document any component-specific color variations

---

**Last Updated**: November 26, 2025  
**Version**: 1.0  
**Status**: In Progress

