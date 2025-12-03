# Logic Summary: Campaign Builder, Ads Builder & Keywords

## 1. CAMPAIGN BUILDER LOGIC (CampaignBuilder2.tsx)

### Main Flow:
1. **Step 1: Setup**
   - User selects campaign structure (SKAG, STAG, MIX, etc.)
   - Configures geo segmentation (Country/State/City/ZIP)
   - Sets match types (Broad, Phrase, Exact)
   - Enters landing page URL
   - Campaign name auto-generated: `Search Campaign YYYY-MM-DD HH-MM`

2. **Step 2: Keywords**
   - Uses `KeywordPlannerSelectable` component
   - Calls Python API: `api.post('/generate-keywords', { seeds, negatives })`
   - API returns keywords array
   - Applies match type formatting (broad, phrase, exact)
   - User selects keywords via checkboxes
   - Keywords organized by campaign structure

3. **Step 3: Ads & Extensions**
   - Uses `AdsBuilder` component logic
   - Generates ads based on selected keywords
   - Supports RSA, DKI, and Call-Only ads
   - User can add extensions (sitelinks, callouts, etc.)

4. **Step 4: Geo Targeting**
   - Location selection with presets
   - Supports countries, states, cities, ZIP codes

5. **Step 5: Review & Export**
   - Generates campaign structure using `generateCampaignStructure()`
   - Exports to CSV using `exportCampaignToCSVV3()`
   - Validates before export

### Key Functions:
- `generateCampaignStructure()` - Creates campaign structure based on selected type
- `exportCampaignToCSVV3()` - Exports campaign to CSV format
- `validateCSVBeforeExport()` - Validates campaign before export

---

## 2. ADS BUILDER LOGIC (AdsBuilder.tsx)

### Main Flow:

1. **Input Collection**
   - Base URL (landing page)
   - Keywords (single or multiple ad groups)
   - Ad types selection (RSA, DKI, Call-Only)
   - Ad quantities per type

2. **Ad Generation Process**

```typescript
const generateAds = async () => {
  // For each ad group:
  for (const group of groupsToProcess) {
    const keywords = group.keywords.split(/[,\n;]+/).map(k => k.trim());
    
    // Generate RSA Ads
    if (rsaPerGroup > 0) {
      const response = await api.post('/generate-ads', {
        keywords,
        adType: 'RSA',
        count: rsaPerGroup,
        groupName: group.name,
        baseUrl: baseUrl,
        systemPrompt: GOOGLE_ADS_SYSTEM_PROMPT
      });
      // Fallback to local generation if API fails
    }
    
    // Generate DKI Ads
    if (dkiPerGroup > 0) {
      const response = await api.post('/generate-ads', {
        keywords,
        adType: 'DKI',
        count: dkiPerGroup,
        // ... same pattern
      });
    }
    
    // Generate Call-Only Ads
    if (callOnlyPerGroup > 0) {
      const response = await api.post('/generate-ads', {
        keywords,
        adType: 'CallOnly',
        count: callOnlyPerGroup,
        // ... same pattern
      });
    }
  }
}
```

3. **Fallback Generation**
   - If Python API fails, uses local `generateAdsUtility()` function
   - Converts RSA/DKI/CallOnly formats to `GeneratedAd` format
   - Validates ad structure before adding

4. **Ad Format Conversion**
   - RSA: `{ headlines: [], descriptions: [] }` → `{ headline1, headline2, ..., description1, ... }`
   - DKI: Converts keywords to `{KeyWord:Default Text}` format
   - Call-Only: Includes phone number and business name

### Key Functions:
- `generateAds()` - Main ad generation function
- `generateFallbackRSA()` - Local RSA generation fallback
- `generateFallbackDKI()` - Local DKI generation fallback
- `generateFallbackCallOnly()` - Local Call-Only generation fallback
- `convertRSAToGeneratedAd()` - Converts RSA format to display format
- `convertRSAToDKI()` - Converts RSA to DKI format

### System Prompt:
Uses `GOOGLE_ADS_SYSTEM_PROMPT` with rules for:
- DKI syntax: `{KeyWord:Default Text}`
- RSA requirements: 10+ headlines, 4+ descriptions
- Grouping rules for single/multiple ad groups
- URL generation rules
- Validation rules

---

## 3. KEYWORDS GENERATION LOGIC

### A. Python API (Primary Method)
**Endpoint:** `/generate-keywords`

**Request:**
```typescript
{
  seeds: string[],      // Array of seed keywords
  negatives: string[]   // Array of negative keywords
}
```

**Response:**
```typescript
{
  keywords: Array<{
    text: string,       // or keyword: string
    matchType?: string,
    volume?: string,
    cpc?: string
  }>
}
```

**Used in:**
- `KeywordPlannerSelectable.tsx` - Line 121
- `CampaignBuilder3.tsx` - Line 339 (updated)

### B. Local JavaScript Fallback (keywordGenerator.ts)

**Function:** `generateKeywords(options: KeywordGenerationOptions)`

**Logic Flow:**

1. **Parse Inputs**
   - Seed keywords (newline-separated)
   - Negative keywords (comma/newline-separated)
   - Vertical configuration (for modifiers)

2. **Get Vertical Modifiers**
   - Uses `getVerticalConfig(vertical)` for industry-specific modifiers
   - Service tokens, keyword modifiers, emergency modifiers

3. **Generate Variations**

```typescript
// For each seed keyword:
for (const seed of seedList) {
  // 1. Add seed as-is
  mockKeywords.push({ text: seed, type: 'Seed' });
  
  // 2. Prefix + Seed combinations
  for (const prefix of prefixes) {
    mockKeywords.push({ text: `${prefix} ${seed}` });
  }
  
  // 3. Seed + Suffix combinations
  for (const suffix of suffixes) {
    mockKeywords.push({ text: `${seed} ${suffix}` });
  }
  
  // 4. Prefix + Seed + Suffix combinations
  for (const prefix of prefixes) {
    for (const suffix of suffixes) {
      mockKeywords.push({ text: `${prefix} ${seed} ${suffix}` });
    }
  }
  
  // 5. Intent + Seed combinations
  for (const intent of intents) {
    mockKeywords.push({ text: `${intent} ${seed}` });
  }
  
  // 6. Seed + Location combinations
  for (const location of locations) {
    mockKeywords.push({ text: `${seed} ${location}` });
  }
}
```

4. **Modifiers Used:**
   - **Prefixes:** call, contact, best, top, professional, expert, 24/7, emergency, etc.
   - **Suffixes:** near me, service, company, phone, call now, get quote, etc.
   - **Intents:** call, contact, hire, find, book, get, etc.
   - **Locations:** near me, local, nearby, in my area, etc.

5. **Filtering:**
   - Removes duplicates (case-insensitive)
   - Filters out negative keywords
   - Limits word count (2-5 words typically)
   - Limits total count (minKeywords to maxKeywords)

6. **Output:**
   - Returns array of `GeneratedKeyword[]` with:
     - `id`: Unique identifier
     - `text`: Keyword text
     - `volume`: High/Medium/Low
     - `cpc`: Estimated CPC
     - `type`: Seed/Exact/Phrase/Broad/Local

### C. Google Ads API (Attempted, Falls Back)
**File:** `src/utils/api/googleAds.ts`

- Tries Google Ads API first (blocked by CORS)
- Falls back to AI (Gemini) generation
- Final fallback to basic variations

---

## 4. CAMPAIGN STRUCTURE GENERATION (campaignStructureGenerator.ts)

### Main Function:
```typescript
generateCampaignStructure(keywords: string[], settings: StructureSettings): CampaignStructure
```

### Structure Types:

1. **SKAG (Single Keyword Ad Group)**
   - One ad group per keyword
   - Max 20 keywords
   - Each keyword gets all match types

2. **STAG (Single Theme Ad Group)**
   - Groups keywords by first word (thematic)
   - Max 10 groups
   - Keywords grouped thematically

3. **MIX (Hybrid)**
   - First 5 keywords as SKAG
   - Rest grouped thematically (STAG)

4. **STAG+ (Smart Grouping)**
   - Uses ML/N-gram clustering
   - Smart clusters based on keyword similarity

5. **Intent-Based**
   - Groups by intent: High Intent, Research, Brand, Competitor
   - Uses `intentGroups` from settings

6. **Alpha-Beta**
   - Alpha: Winning keywords
   - Beta: Discovery keywords

7. **Match-Type Split**
   - Separate ad groups by match type
   - Broad Match group, Phrase Match group, Exact Match group

8. **GEO-Segmented**
   - One campaign per geo unit
   - Separate campaigns for states/cities/ZIPs

9. **Funnel-Based**
   - TOF (Top of Funnel)
   - MOF (Middle of Funnel)
   - BOF (Bottom of Funnel)

10. **Brand Split**
    - Brand keywords group
    - Non-brand keywords group

11. **Competitor**
    - Competitor keyword campaigns

12. **N-Gram Clusters**
    - Smart clustering using N-gram analysis

---

## 5. KEY DIFFERENCES: Builder 2.0 vs Builder 3.0

### Builder 2.0:
- Uses `KeywordPlannerSelectable` component
- Manual keyword selection
- Step-by-step wizard
- Uses local keyword generation as fallback

### Builder 3.0:
- **AI-powered URL analysis** (Step 1)
  - Extracts intent, CTA, vertical from URL
  - Auto-generates seed keywords
  - Auto-selects best campaign structures
  
- **Python API for keywords** (Step 3)
  - Uses `/generate-keywords` endpoint
  - Generates 410-710 keywords
  - Live filtering by match type
  
- **Enhanced ad generation** (Step 4)
  - Uses same Python API as AdsBuilder
  - Live ad selection/editing
  - Extension support
  
- **Location presets** (Step 5)
  - Top 50 cities, Top 30 states, Top 5000 ZIPs
  - Multiple selection with search

---

## 6. API ENDPOINTS USED

### Keyword Generation:
- **Endpoint:** `POST /generate-keywords`
- **Request:** `{ seeds: string[], negatives: string[] }`
- **Response:** `{ keywords: Array<{ text, matchType, volume, cpc }> }`

### Ad Generation:
- **Endpoint:** `POST /generate-ads`
- **Request:** 
  ```typescript
  {
    keywords: string[],
    adType: 'RSA' | 'DKI' | 'CallOnly',
    count: number,
    groupName: string,
    baseUrl: string,
    systemPrompt: string
  }
  ```
- **Response:** `{ ads: Array<AdObject> }`

---

## 7. FALLBACK LOGIC

### Keywords:
1. Try Python API (`/generate-keywords`)
2. Fallback to local `generateKeywords()` function
3. Uses vertical templates and modifiers

### Ads:
1. Try Python API (`/generate-ads`)
2. Fallback to `generateAdsFallback()` (Python fallback)
3. Final fallback to `generateAdsUtility()` (local JavaScript)

---

## 8. DATA FLOW

### Campaign Builder 2.0:
```
User Input → Keyword Generation (API) → Keyword Selection → 
Ad Generation (API) → Campaign Structure → CSV Export
```

### Builder 3.0:
```
URL Input → AI Analysis → Structure Selection → 
Keyword Generation (API) → Ad Generation (API) → 
Location Selection → CSV Generation → Save Campaign
```

---

## 9. KEY UTILITIES

### `generateKeywords()` (keywordGenerator.ts)
- Local JavaScript keyword generation
- Uses vertical templates
- Generates 410-630 keywords by default
- Applies prefixes, suffixes, intents, locations

### `generateCampaignStructure()` (campaignStructureGenerator.ts)
- Creates campaign structure based on type
- Organizes keywords into ad groups
- Applies match types
- Adds location targeting

### `generateAds()` (googleAdGenerator.ts)
- Local JavaScript ad generation
- Supports RSA, ETA (DKI), Call-Only
- Intent-based ad copy generation
- Validates ad format

### `exportCampaignToCSVV3()` (csvGeneratorV3.ts)
- Converts campaign structure to CSV
- Validates before export
- Google Ads Editor compatible format

