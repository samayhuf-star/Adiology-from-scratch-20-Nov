# CSV Export Testing Guide

## Quick Start Testing

### 1. Start Backend Server

```bash
cd backend
source venv/bin/activate  # or: ./venv/bin/python3 ad_generator_api.py
python3 ad_generator_api.py
```

Server should start on `http://localhost:8000`

### 2. Test Backend Endpoint

Run the test script:
```bash
cd backend
python3 test_csv_export.py
```

Expected output:
- ✅ CSV Export Successful!
- ✅ UTF-8 BOM present
- ✅ CRLF line endings present
- CSV saved to `test_export.csv`

### 3. Test Frontend Integration

1. **Update API Base URL** (already done - uses localhost in development)
   - File: `src/utils/csvExportBackend.ts`
   - Automatically uses `http://localhost:8000` in development mode

2. **Start Frontend**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Test in Browser**
   - Navigate to Campaign Builder
   - Create a test campaign
   - Click "Export CSV"
   - Verify CSV downloads correctly

## Test Cases

### ✅ Test 1: Basic Campaign Export

**Setup:**
- Campaign name: "Test Campaign"
- 1 ad group: "Test Ad Group"
- 3 keywords: "plumber", "electrician", "hvac"
- 1 RSA ad with:
  - Headline 1: "Professional Plumber"
  - Headline 2: "Expert Service"
  - Headline 3: "Licensed & Insured"
  - Description 1: "Professional plumbing services you can trust."
  - Description 2: "Fast, reliable service available 24/7."
  - Final URL: "https://example.com"

**Expected:**
- CSV downloads successfully
- Filename: `Test_Campaign_YYYYMMDD.csv`
- File opens in Google Ads Editor without errors
- UTF-8 BOM present (first 3 bytes: EF BB BF)
- CRLF line endings (`\r\n`)
- Headers match Google Ads Editor format exactly

**Validation:**
```bash
# Check file encoding
file test_export.csv
# Should show: UTF-8 Unicode text

# Check BOM
head -c 3 test_export.csv | od -An -tx1
# Should show: ef bb bf

# Check line endings
file test_export.csv
# Should show: with CRLF line terminators
```

### ✅ Test 2: Field Length Validation

**Setup:**
Create an ad with:
- Headline 1: "This is a very long headline that exceeds thirty characters" (60 chars)
- Description 1: "This is a very long description that exceeds ninety characters and should be truncated automatically by the system" (120 chars)
- Path 1: "verylongpathname" (18 chars)

**Expected:**
- Headline truncated to 30 chars (with "...")
- Description truncated to 90 chars (with "...")
- Path truncated to 15 chars
- Warning notification shows truncation details
- CSV still exports successfully

**Validation:**
- Open CSV in text editor
- Verify headline is ≤ 30 chars
- Verify description is ≤ 90 chars
- Verify path is ≤ 15 chars

### ✅ Test 3: Validation Error Handling

**Setup:**
Create an ad with:
- Missing Final URL
- Only 1 headline (RSA requires 3+)
- Only 1 description (RSA requires 2+)

**Expected:**
- ❌ Export fails with validation errors
- Error notification shows:
  - "Final URL is required for ads"
  - "At least 3 headlines are required"
  - "At least 2 descriptions are required"
- CSV file is NOT generated
- User can see exactly what to fix

### ✅ Test 4: Special Characters & Encoding

**Setup:**
Create campaign with:
- Campaign name: "Testé Campaign — 2024"
- Headline: "Plumber près de moi"
- Description: "Service de plomberie professionnel ✓"
- Keywords: "plumber", "électricien", "hvac"

**Expected:**
- UTF-8 BOM present in file
- Special characters display correctly in Google Ads Editor
- Accents, emojis, and symbols preserved
- No encoding errors

### ✅ Test 5: Multiple Ad Groups & Keywords

**Setup:**
Create campaign with:
- 3 ad groups
- 10 keywords per group (mix of broad, phrase, exact)
- 2 ads per group
- Negative keywords

**Expected:**
- All ad groups exported
- All keywords exported with correct match types
- Negative keywords in separate rows
- Row count matches expected

### ✅ Test 6: Location Targeting

**Setup:**
Create campaign with:
- Country: "United States"
- Cities: ["New York", "Los Angeles", "Chicago"]
- States: ["California", "Texas"]

**Expected:**
- Location rows added to CSV
- Location Type: CITY, STATE, COUNTRY
- Location Code matches input
- All locations in separate rows

### ✅ Test 7: Network Error Handling

**Setup:**
1. Stop backend server
2. Attempt to export CSV

**Expected:**
- ⚠️ Warning notification: "Backend unavailable, using local CSV generation"
- Falls back to local generation (if implemented)
- User informed of fallback mode

## Troubleshooting

### Backend Server Won't Start

**Check:**
```bash
cd backend
python3 --version  # Should be 3.8+
source venv/bin/activate
pip install -r requirements.txt
python3 ad_generator_api.py
```

### CSV Won't Download

**Check:**
- Browser console for JavaScript errors
- Network tab for failed requests
- Backend server logs for errors
- CORS headers in response

### Validation Errors But Data Looks Correct

**Check:**
- Field lengths (headlines ≤30, descriptions ≤90)
- Required fields present (Final URL, headlines, descriptions)
- Data types (numbers for budgets, URLs for final URLs)

### Special Characters Display Incorrectly

**Check:**
- UTF-8 BOM present in file (first 3 bytes: EF BB BF)
- File encoding is UTF-8
- Google Ads Editor encoding settings

## Success Criteria

✅ All 7 test cases pass
✅ CSV imports successfully into Google Ads Editor
✅ No validation errors for valid campaigns
✅ Clear error messages for invalid campaigns
✅ Performance acceptable (< 5s for large campaigns)
✅ Special characters handled correctly
✅ Field length limits enforced
✅ Proper CSV formatting (BOM, CRLF, quoting)

