# Console Errors Analysis - Menu Options Testing

## Overview
This document contains potential console errors and issues found by analyzing the codebase for all menu options.

## Menu Options to Test

### Main Menu Items:
1. **Dashboard** (`dashboard`)
2. **Campaigns** (parent menu)
   - Campaign Builder (`builder-2`)
   - Campaign Presets (`campaign-presets`)
   - Campaign History (`campaign-history`)
3. **Web Templates** (`website-templates`)
4. **Keywords** (parent menu)
   - Keyword Planner (`keyword-planner`)
   - Keyword Mixer (`keyword-mixer`)
   - Negative Keywords (`negative-keywords`)
   - Keyword Generator v3.0 (`keyword-generator-v3`)
   - Saved Lists (`keyword-saved-lists`)
5. **Ads Builder** (`ads-builder`)
6. **CSV Validator** (`csv-validator-3`)
7. **CSV Export** (`google-ads-csv-export`)
8. **Settings** (`settings`)
9. **Support & Help** (`support-help`)

## Potential Issues Found in Code Analysis

### 1. **App.tsx** - Main Application
- **Line 179**: `notifications.success()` - `notifications` is an array, not an object with methods
- **Line 144**: Invalid tab ID warnings may appear in console
- **Line 323, 341**: Error handling in auth initialization may log errors
- **Line 422**: Profile fetch warnings for permission errors

### 2. **Dashboard.tsx**
- **Line 262**: Missing `published_websites` table errors (gracefully handled but may log warnings)
- **Line 278**: Error fetching user resources may log errors

### 3. **CampaignBuilder2.tsx**
- Multiple `useEffect` hooks that may cause issues if dependencies are incorrect
- API calls that may fail and log errors

### 4. **CSVValidator3.tsx**
- File parsing errors may occur
- CSV validation errors

### 5. **AdsBuilder.tsx**
- API calls for ad generation may fail
- State management issues

### 6. **KeywordPlanner.tsx**
- Keyword generation API calls
- History service errors

### 7. **BillingPanel.tsx**
- **Line 55**: Fallback to Supabase when API unavailable (logs info)
- Stripe integration errors
- Subscription status fetch errors

### 8. **HistoryPanel.tsx**
- **Line 52**: Fallback to local storage (logs info)
- **Line 58**: Error logging for failed history loads

### 9. **SettingsPanel.tsx**
- User preferences save/load errors
- API call failures

### 10. **SupportHelpCombined.tsx**
- Support ticket submission errors
- Help content loading errors

## Common Error Patterns

### 1. **API Unavailable Errors**
Many components have fallback logic when API is unavailable:
- `BillingPanel.tsx` - Falls back to Supabase
- `HistoryPanel.tsx` - Falls back to localStorage
- These log info messages but don't cause errors

### 2. **Missing Table Errors**
- `published_websites` table may not exist
- Gracefully handled in `Dashboard.tsx` but may log warnings

### 3. **Auth Errors**
- Profile fetch timeouts
- Permission errors (PGRST205)
- These are handled but may log warnings

### 4. **Type Errors**
- `notifications.success()` called on array instead of object
- Potential undefined/null access issues

## How to Run Tests

1. Start the dev server:
```bash
npm run dev
```

2. Navigate to the app with bypass:
```
http://localhost:3000/?bypass=adiology2025dev
```

3. Open browser DevTools (F12) and go to Console tab

4. Click through each menu option and note any:
   - Red errors
   - Yellow warnings
   - Info messages that shouldn't be there

5. Or run the automated test script:
```bash
node test-all-menu-options.js
```

This will generate a `menu-test-report.json` file with all console logs and errors.

## Expected Console Output

### Normal/Expected Logs:
- `✅ Error tracking initialized` - Normal
- `ℹ️ Using Supabase user profile data (API unavailable)` - Expected fallback
- `ℹ️ Loading history from local storage (API unavailable)` - Expected fallback

### Errors to Fix:
- Any red errors in console
- Warnings about invalid tab IDs
- API call failures (if API should be available)
- Type errors
- Undefined/null access errors

## Next Steps

1. Run the test script or manually test each menu option
2. Collect all console errors
3. Fix errors one by one
4. Re-test to ensure fixes work

