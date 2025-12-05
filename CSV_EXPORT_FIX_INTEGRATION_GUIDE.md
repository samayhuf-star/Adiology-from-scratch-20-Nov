# CSV Export Fix - Integration Guide

## 📦 What's Included

This fix pack addresses all 6 CSV generation issues identified in the analysis:

1. ✅ **Schema mapping** - Exact Google Ads Editor headers
2. ✅ **Field length validation** - Headlines ≤30, descriptions ≤90, paths ≤15
3. ✅ **Proper CSV library** - Python `csv` module with correct quoting
4. ✅ **UTF-8 BOM + CRLF** - Google Ads Editor compatible format
5. ✅ **Single validation layer** - Pydantic + CSV post-check
6. ✅ **Robust field counting** - `csv.reader` instead of regex

---

## 🚀 Quick Start

### Step 1: Backend Setup

1. **Copy the export module:**
   ```bash
   # Already created: backend/export_csv_fix.py
   ```

2. **Update FastAPI app:**
   ```bash
   # Already updated: backend/ad_generator_api.py
   # Added /export-csv endpoint
   ```

3. **Install dependencies** (if not already installed):
   ```bash
   pip install fastapi pydantic uvicorn
   ```

4. **Start server:**
   ```bash
   cd backend
   python3 ad_generator_api.py
   # Server runs on http://localhost:8000
   # Note: On macOS, use 'python3' instead of 'python'
   ```

### Step 2: Frontend Integration

1. **Update API base URL** in `src/utils/api.ts`:
   ```typescript
   // For local development
   const API_BASE = 'http://localhost:8000';
   
   // For production (Supabase Edge Function)
   const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6757d0ca`;
   ```

2. **Replace `generateCSV` function** in `src/components/CampaignBuilder.tsx`:

   **Find** (around line 1685):
   ```typescript
   const generateCSV = async () => {
     // ... existing code ...
   };
   ```

   **Replace with:**
   ```typescript
   import { generateCSVWithBackend } from '../utils/csvExportBackend';
   
   const generateCSV = async () => {
     const adGroups = getDynamicAdGroups();
     
     // Convert ads to ad group structure
     const adGroupsWithAds = adGroups.map(group => ({
       name: group.name,
       keywords: group.keywords || [],
       ads: generatedAds.filter(ad => 
         (ad.adGroup === group.name || ad.adGroup === ALL_AD_GROUPS_VALUE) &&
         (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly')
       ).map(ad => ({
         type: ad.type,
         headline1: ad.headline1 || '',
         headline2: ad.headline2 || '',
         headline3: ad.headline3 || '',
         headline4: ad.headline4 || '',
         headline5: ad.headline5 || '',
         description1: ad.description1 || '',
         description2: ad.description2 || '',
         description3: ad.description3 || '',
         description4: ad.description4 || '',
         finalUrl: ad.finalUrl || url || baseUrl,
         path1: ad.path1 || '',
         path2: ad.path2 || ''
       })),
       negativeKeywords: negativeKeywords.split('\n').filter(k => k.trim())
     }));
     
     // Location targeting
     const locationTargeting = {
       locations: [
         { type: 'COUNTRY', code: targetCountry || 'US' },
         ...(selectedCities.map(city => ({ type: 'CITY', code: city }))),
         ...(selectedStates.map(state => ({ type: 'STATE', code: state }))),
         ...(selectedZips.map(zip => ({ type: 'ZIP', code: zip })))
       ].filter(loc => loc.code)
     };
     
     await generateCSVWithBackend(
       campaignName || 'Campaign 1',
       adGroupsWithAds,
       locationTargeting,
       undefined, // budget
       'MANUAL_CPC' // bidding strategy
     );
   };
   ```

3. **Create CSV export utility** (`src/utils/csvExportBackend.ts`):
   ```typescript
   // Copy contents from frontend_csv_export_integration.ts
   // Rename file to csvExportBackend.ts
   ```

### Step 3: CSS Fixes

Add button styles to your global CSS or component:

```css
/* Copy from button_css_fixes.css */
```

Or add Tailwind classes directly to buttons:
```tsx
<Button className="py-2 px-4 text-sm h-10">
  Export CSV
</Button>
```

---

## 📋 File Structure

```
backend/
├── export_csv_fix.py          # ✅ CSV export module (NEW)
├── ad_generator_api.py         # ✅ Updated with /export-csv endpoint
└── ad_generator_fallback.py    # (existing)

src/
├── utils/
│   ├── csvExportBackend.ts     # ✅ Frontend integration (NEW - rename from frontend_csv_export_integration.ts)
│   └── api.ts                  # ⚠️ Update API_BASE if needed
└── components/
    └── CampaignBuilder.tsx     # ⚠️ Replace generateCSV function

styles/
└── button_css_fixes.css         # ✅ Button size fixes (NEW)
```

---

## 🔧 Configuration

### Backend Configuration

**For Local Development:**
```python
# backend/ad_generator_api.py
# Already configured for localhost:8000
```

**For Supabase Edge Function:**
1. Copy `export_csv_fix.py` to your Edge Function
2. Update imports in Edge Function handler
3. Deploy to Supabase

**For Production Server:**
1. Deploy `ad_generator_api.py` to your server
2. Update CORS origins in middleware
3. Set environment variables if needed

### Frontend Configuration

**API Base URL:**
```typescript
// src/utils/api.ts
const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8000';
```

**Environment Variables:**
```env
# .env.local
VITE_API_BASE=http://localhost:8000

# .env.production
VITE_API_BASE=https://your-supabase-project.supabase.co/functions/v1/make-server-6757d0ca
```

---

## 🧪 Testing

See `CSV_EXPORT_TESTING_CHECKLIST.md` for comprehensive testing guide.

**Quick Test:**
1. Start backend: `python backend/ad_generator_api.py`
2. Create a test campaign in Campaign Builder 1
3. Click "Export CSV"
4. Verify CSV downloads and opens in Google Ads Editor

---

## 📊 API Reference

### POST /export-csv

**Request:**
```json
{
  "campaign_name": "My Campaign",
  "ad_groups": [
    {
      "name": "Ad Group 1",
      "keywords": ["plumber", "electrician"],
      "ads": [
        {
          "type": "rsa",
          "headline1": "Professional Service",
          "headline2": "Expert Team",
          "headline3": "Licensed & Insured",
          "description1": "Professional services you can trust...",
          "description2": "Fast, reliable service...",
          "finalUrl": "https://example.com"
        }
      ],
      "negativeKeywords": ["free", "cheap"]
    }
  ],
  "location_targeting": {
    "locations": [
      {"type": "COUNTRY", "code": "US"},
      {"type": "CITY", "code": "New York"}
    ]
  },
  "budget": 100.0,
  "bidding_strategy": "MANUAL_CPC"
}
```

**Response (Success):**
- Content-Type: `text/csv; charset=utf-8`
- Headers: `Content-Disposition: attachment; filename="..."`
- Body: CSV file with UTF-8 BOM

**Response (Validation Error):**
```json
{
  "success": false,
  "validation_errors": [
    {
      "field": "Final URL",
      "message": "Final URL is required for ads",
      "severity": "error"
    }
  ],
  "warnings": [],
  "row_count": 0,
  "message": "Export failed: 1 validation error(s)"
}
```

---

## 🐛 Troubleshooting

### Backend Issues

**Import Error:**
```bash
# Make sure export_csv_fix.py is in the same directory
# Check Python path
python -c "import export_csv_fix; print('OK')"
```

**CORS Errors:**
```python
# Update CORS in ad_generator_api.py
allow_origins=["http://localhost:5173", "https://your-domain.com"]
```

### Frontend Issues

**Network Error:**
- Check API_BASE URL is correct
- Verify backend server is running
- Check browser console for CORS errors

**Validation Errors:**
- Check error messages in notification
- Verify ad data structure matches expected format
- Check field lengths (headlines ≤30, descriptions ≤90)

### CSV Import Issues

**Google Ads Editor Rejects CSV:**
- Verify UTF-8 BOM is present (first 3 bytes: EF BB BF)
- Check line endings are CRLF (`\r\n`)
- Verify headers match exactly
- Check for empty required fields

---

## ✅ Verification Checklist

- [ ] Backend server starts without errors
- [ ] `/export-csv` endpoint responds to POST requests
- [ ] Frontend calls backend API successfully
- [ ] CSV downloads with correct filename
- [ ] CSV opens in text editor - shows UTF-8 BOM
- [ ] CSV imports into Google Ads Editor without errors
- [ ] Validation errors show clear messages
- [ ] Field length truncation works (headlines, descriptions)
- [ ] Special characters display correctly
- [ ] Large campaigns export successfully

---

## 🚀 Deployment

### Supabase Edge Function

1. **Create Edge Function:**
   ```bash
   supabase functions new export-csv
   ```

2. **Copy files:**
   ```bash
   cp backend/export_csv_fix.py supabase/functions/export-csv/
   ```

3. **Update handler:**
   ```typescript
   // supabase/functions/export-csv/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   // Adapt Python code to Deno/TypeScript or use Python runtime
   ```

4. **Deploy:**
   ```bash
   supabase functions deploy export-csv
   ```

### Production Server

1. **Deploy backend:**
   ```bash
   # Use your deployment method (Docker, PM2, systemd, etc.)
   ```

2. **Update frontend API_BASE:**
   ```typescript
   const API_BASE = 'https://api.yourdomain.com';
   ```

3. **Test:**
   - Verify endpoint is accessible
   - Test CSV export from production frontend
   - Monitor error logs

---

## 📝 Next Steps

1. **Test locally** using the checklist
2. **Deploy to staging** and verify
3. **Monitor production** for errors
4. **Collect user feedback** on export quality
5. **Optimize** based on usage patterns

---

## 🆘 Support

If you encounter issues:

1. Check `CSV_EXPORT_TESTING_CHECKLIST.md` for common problems
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify HAR capture shows correct request/response
5. Compare CSV output with expected format

---

## 📚 Related Files

- `CSV_GENERATION_ISSUES_ANALYSIS.md` - Original analysis
- `CSV_EXPORT_TESTING_CHECKLIST.md` - Testing guide
- `backend/export_csv_fix.py` - Backend implementation
- `frontend_csv_export_integration.ts` - Frontend integration
- `button_css_fixes.css` - UI fixes

