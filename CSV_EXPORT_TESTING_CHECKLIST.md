# CSV Export Testing Checklist

## Pre-Testing Setup

1. **Start Backend Server**
   ```bash
   cd backend
   python3 ad_generator_api.py
   # Server should start on http://localhost:8000
   # Note: On macOS, use 'python3' instead of 'python'
   ```

2. **Verify Endpoint**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status": "healthy", "service": "ad_generator_fallback"}
   ```

3. **Update Frontend API Base URL**
   - Ensure `API_BASE` in `src/utils/api.ts` points to your backend
   - For local: `http://localhost:8000`
   - For production: Your Supabase Edge Function URL

---

## Test Cases

### ✅ Test 1: Basic Campaign Export

**Steps:**
1. Create a campaign with:
   - Campaign name: "Test Campaign"
   - 1 ad group: "Test Ad Group"
   - 3 keywords: "plumber", "electrician", "hvac"
   - 2 ads (RSA) with headlines and descriptions
   - Final URL: "https://example.com"

2. Click "Export CSV"

**Expected Results:**
- ✅ CSV downloads successfully
- ✅ Filename: `Test_Campaign_YYYYMMDD.csv`
- ✅ File opens in Google Ads Editor without errors
- ✅ All rows import successfully

**Validation:**
- Open CSV in text editor
- Check first line has UTF-8 BOM (should start with `ï»¿Row Type`)
- Check line endings are CRLF (`\r\n`)
- Verify headers match `GOOGLE_ADS_EDITOR_HEADERS` exactly

---

### ✅ Test 2: Field Length Validation

**Steps:**
1. Create an ad with:
   - Headline 1: "This is a very long headline that exceeds thirty characters" (60 chars)
   - Description 1: "This is a very long description that exceeds ninety characters and should be truncated automatically by the system" (120 chars)
   - Path 1: "verylongpathname" (18 chars)

2. Export CSV

**Expected Results:**
- ✅ Headline truncated to 30 chars (with "...")
- ✅ Description truncated to 90 chars (with "...")
- ✅ Path truncated to 15 chars
- ✅ Warning notification shows truncation details
- ✅ CSV still exports successfully

**Validation:**
- Check CSV file - fields should be within limits
- Check browser console for truncation warnings

---

### ✅ Test 3: Validation Error Handling

**Steps:**
1. Create an ad with:
   - Missing Final URL
   - Only 1 headline (RSA requires 3+)
   - Only 1 description (RSA requires 2+)

2. Attempt to export

**Expected Results:**
- ❌ Export fails with validation errors
- ✅ Error notification shows:
   - "Final URL is required for ads"
   - "At least 3 headlines are required"
   - "At least 2 descriptions are required"
- ✅ CSV file is NOT generated
- ✅ User can see exactly what to fix

**Validation:**
- Check notification shows all errors
- No CSV file should be downloaded
- Errors should be specific and actionable

---

### ✅ Test 4: Special Characters & Encoding

**Steps:**
1. Create campaign with:
   - Campaign name: "Testé Campaign — 2024"
   - Headline: "Plumber près de moi"
   - Description: "Service de plomberie professionnel ✓"
   - Keywords: "plumber", "électricien", "hvac"

2. Export CSV

**Expected Results:**
- ✅ UTF-8 BOM present in file
- ✅ Special characters display correctly in Google Ads Editor
- ✅ Accents, emojis, and symbols preserved
- ✅ No encoding errors

**Validation:**
- Open CSV in Notepad++ (shows encoding)
- Verify UTF-8-BOM encoding
- Import into Google Ads Editor - check characters display correctly

---

### ✅ Test 5: Multiple Ad Groups & Keywords

**Steps:**
1. Create campaign with:
   - 3 ad groups
   - 10 keywords per group (mix of broad, phrase, exact)
   - 2 ads per group
   - Negative keywords

2. Export CSV

**Expected Results:**
- ✅ All ad groups exported
- ✅ All keywords exported with correct match types
- ✅ Negative keywords in separate rows
- ✅ Row count matches expected (1 campaign + 3 adgroups + 30 keywords + 6 ads + negatives)

**Validation:**
- Count rows in CSV
- Verify row order: CAMPAIGN → ADGROUP → KEYWORD → AD → NEGATIVE_KEYWORD
- Check match types are correct (BROAD, PHRASE, EXACT)

---

### ✅ Test 6: Location Targeting

**Steps:**
1. Create campaign with:
   - Country: "United States"
   - Cities: ["New York", "Los Angeles", "Chicago"]
   - States: ["California", "Texas"]

2. Export CSV

**Expected Results:**
- ✅ Location rows added to CSV
- ✅ Location Type: CITY, STATE, COUNTRY
- ✅ Location Code matches input
- ✅ All locations in separate rows

**Validation:**
- Check CSV for LOCATION row type
- Verify location codes are correct
- Import into Google Ads Editor - locations should be recognized

---

### ✅ Test 7: Large Campaign (Performance)

**Steps:**
1. Create campaign with:
   - 10 ad groups
   - 50 keywords per group (500 total)
   - 3 ads per group (30 total)

2. Export CSV

**Expected Results:**
- ✅ Export completes within 5 seconds
- ✅ All rows exported correctly
- ✅ No timeout errors
- ✅ CSV file size reasonable (< 1MB for this size)

**Validation:**
- Check export time in browser console
- Verify file size
- Open in Google Ads Editor - should import without issues

---

### ✅ Test 8: Network Error Handling

**Steps:**
1. Stop backend server
2. Attempt to export CSV

**Expected Results:**
- ⚠️ Warning notification: "Backend unavailable, using local CSV generation"
- ✅ Falls back to local generation (if implemented)
- ✅ User informed of fallback mode

**Validation:**
- Check notification message
- Verify fallback behavior works
- Restart server and verify normal export works

---

## HAR Capture Instructions

### Capture Export Request

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Filter: XHR or Fetch**
4. **Perform CSV export**
5. **Right-click on `/export-csv` request**
6. **Select "Save all as HAR with content"**
7. **Save file for debugging**

### Expected Request Format

```json
{
  "campaign_name": "Test Campaign",
  "ad_groups": [
    {
      "name": "Ad Group 1",
      "keywords": ["plumber", "electrician"],
      "ads": [
        {
          "type": "rsa",
          "headline1": "Professional Plumber",
          "headline2": "Expert Service",
          "headline3": "Licensed & Insured",
          "description1": "Professional plumbing services...",
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

### Expected Response (Success)

**Headers:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="Test_Campaign_20241201.csv"
```

**Body:**
- UTF-8 BOM (`ï»¿`)
- CRLF line endings
- Proper CSV formatting

### Expected Response (Validation Error)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "success": false,
  "validation_errors": [
    {
      "field": "Final URL",
      "message": "Final URL is required for ads",
      "severity": "error",
      "row_index": null
    }
  ],
  "warnings": [],
  "row_count": 5,
  "message": "Export failed: 1 validation error(s)"
}
```

---

## Expected CSV Headers (First Row)

When you open the CSV file, the first row should be:

```
Row Type,Campaign,Campaign ID,Campaign Status,Campaign Type,Campaign Budget,Budget Type,Bidding Strategy Type,Start Date,End Date,Location Type,Location Code,AdGroup,AdGroup Status,Default Max CPC,Keyword,Match Type,Keyword Status,Keyword Max CPC,Keyword Final URL,Ad Type,Ad Status,Headline 1,Headline 2,Headline 3,Headline 4,Headline 5,Headline 6,Headline 7,Headline 8,Headline 9,Headline 10,Headline 11,Headline 12,Headline 13,Headline 14,Headline 15,Description 1,Description 2,Description 3,Description 4,Final URL,Final Mobile URL,Path1,Path2,Tracking Template,Custom Parameters,Asset Type,Asset Name,Asset URL,Negative Keyword,Operation
```

**Verification:**
- Count commas: Should be 50 commas (51 fields)
- Check "Row Type" is first column
- Check "Operation" is last column
- Verify no extra or missing columns

---

## Google Ads Editor Import Test

### Final Validation Step

1. **Open Google Ads Editor**
2. **File → Import**
3. **Select exported CSV file**
4. **Click "Import"**

**Expected Results:**
- ✅ No import errors
- ✅ All campaigns, ad groups, keywords, and ads imported
- ✅ All data matches what was exported
- ✅ No warnings about invalid formats

**If Import Fails:**
- Check Google Ads Editor error log
- Compare error with validation errors from backend
- Verify CSV format matches Google's documentation

---

## Troubleshooting

### Issue: CSV won't download

**Check:**
- Browser console for JavaScript errors
- Network tab for failed requests
- Backend server logs for errors
- CORS headers in response

### Issue: Validation errors but data looks correct

**Check:**
- Field lengths (headlines ≤30, descriptions ≤90)
- Required fields present (Final URL, headlines, descriptions)
- Data types (numbers for budgets, URLs for final URLs)

### Issue: Special characters display incorrectly

**Check:**
- UTF-8 BOM present in file (first 3 bytes: EF BB BF)
- File encoding is UTF-8
- Google Ads Editor encoding settings

### Issue: Import fails in Google Ads Editor

**Check:**
- Header order matches exactly
- Row Type values are correct (CAMPAIGN, ADGROUP, KEYWORD, AD)
- Match types are uppercase (BROAD, PHRASE, EXACT)
- No empty required fields

---

## Success Criteria

✅ All 8 test cases pass
✅ CSV imports successfully into Google Ads Editor
✅ No validation errors for valid campaigns
✅ Clear error messages for invalid campaigns
✅ Performance acceptable (< 5s for large campaigns)
✅ Special characters handled correctly
✅ Field length limits enforced
✅ Proper CSV formatting (BOM, CRLF, quoting)

---

## Next Steps After Testing

1. **Deploy to Production**
   - Update API_BASE in frontend
   - Deploy backend to Supabase Edge Function or server
   - Test with production data

2. **Monitor**
   - Track export success rate
   - Monitor validation error frequency
   - Collect user feedback

3. **Optimize**
   - Cache validation results
   - Optimize large campaign exports
   - Add progress indicators for long exports

