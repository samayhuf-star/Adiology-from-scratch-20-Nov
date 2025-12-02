# Google Ads Builder "Bible" (System Context)

**Purpose:** This document serves as the absolute source of truth for creating, validating, and structuring Google Ads entities. All code generation must strictly adhere to these limits and hierarchies.

## 1. Entity Hierarchy & Limits

The Google Ads structure follows a strict parent-child relationship.

| Entity | Parent | Limit Per Parent | Global Limit (Per Account) |
|--------|--------|------------------|---------------------------|
| Account | N/A | N/A | N/A |
| Campaign | Account | N/A | 10,000 (Active + Paused) |
| Ad Group | Campaign | 20,000 | N/A |
| Ad (RSA) | Ad Group | 3 (Enabled) | N/A |
| Keyword | Ad Group | 20,000 (Targeting items) | 5 Million (Keywords + Negatives) |
| Negative Keyword | Campaign / List | 10,000 per Campaign | 20 Lists per Account (5k kw/list) |

## 2. Validation Rules (Strict)

### A. Campaigns

**Naming:** Must be unique within the account. Max 256 characters.

**Bidding Strategies:**

- **Search Network:** Target CPA, Target ROAS, Maximize Clicks, Maximize Conversions, Manual CPC.
- **Display Network:** Viewable CPM (vCPM), Manual CPC, Target CPA.
- **Video:** CPV (Cost Per View), Target CPM.

**Geo Targeting:**

- Must use Criteria IDs (not strings like "New York").
- Example: New York City = 1023191.
- Radius Targeting: Minimum 1km / 1 mile.

### B. Ad Groups

**Naming:** Must be unique within the Campaign. Max 255 characters.

**Types:** Standard (Search), Display, Video, Shopping.

**Validation:** Cannot mix "Display" ads and "Search" keywords in the same ad group effectively (usually separated by campaign type).

### C. Keywords (Positive)

**Match Types:**

- **Broad:** `keyword` (No punctuation). Triggers on loose variations.
- **Phrase:** `"keyword"` (Quotes). Triggers on phrase inside query.
- **Exact:** `[keyword]` (Brackets). Triggers on exact meaning.

**Limit:** Max 80 characters per keyword text.

**Conflict:** Do not add the same keyword text with the same match type in the same ad group.

### D. Negative Keywords (CRITICAL DIFFERENCE)

**Note to Builder:** Negative match types work differently than positive ones. They do not match close variants (misspellings, plurals).

- **Negative Broad:** Blocks query only if all words are present (in any order).
- **Negative Phrase:** Blocks query if exact phrase is present in exact order.
- **Negative Exact:** Blocks query only if it matches the keyword exactly, with no extra words.

**Rule:** To block "running shoes", you likely need to block "running shoe" (singular) separately.

### E. Ads: Responsive Search Ads (RSA)

**Headlines:**

- Minimum: 3
- Maximum: 15
- Length: 30 characters max.

**Descriptions:**

- Minimum: 2
- Maximum: 4
- Length: 90 characters max.

**Paths (Display URL):**

- Path 1: 15 chars.
- Path 2: 15 chars.

**Asset Pinning:** You can pin headlines to Position 1, 2, or 3.

**Warning:** Pinning reduces ad strength (Quality Score).

## 3. Targeting Data (Geo & Demographics)

### Geo-Targeting (The "Geo Targets" Dataset)

Developers must use the official Google GeoTargets.csv dataset.

**Column Structure:** CriteriaID, Name, CanonicalName, ParentID, CountryCode, TargetType.

**Lookup Logic:**

1. User inputs "Paris".
2. System must query DB: `SELECT * FROM GeoTargets WHERE Name LIKE 'Paris%'`.
3. User selects "Paris, France" -> System captures ID 1009318.
4. User selects "Paris, Texas" -> System captures ID 1026956.

**Targeting Modes:**

- Location of Presence (People in the location).
- Location of Interest (People searching for the location).

### Demographics

**Age Ranges:** 18-24, 25-34, 35-44, 45-54, 55-64, 65+, Unknown.

**Gender:** Male, Female, Unknown.

## 4. Common API Errors to Handle

The builder must pre-validate to avoid these API errors:

**POLICY_FINDING:** The ad text contains restricted words (e.g., "Botox", "Casino", Trademarks).

- **Action:** Warn user before submission.

**DUPLICATE_RESOURCE:** Trying to create an entity that already exists.

- **Action:** Check existing names before mutate calls.

**STRING_TOO_LONG:** Headlines > 30 chars.

- **Action:** Hard character limit on input fields.

**URL_INVALID:** Final URL returns 404 or is malformed.

- **Action:** Ping URL to verify 200 OK status before ad creation.

**RESOURCE_LIMIT_EXCEEDED:** User hit the 10,000 campaign limit.

## 5. Builder Best Practices (Logic for AI)

**SKAGs are Dead:** Do not recommend "Single Keyword Ad Groups" (SKAGs). Recommend STAGs (Single Theme Ad Groups).

- **Logic:** Group 5-20 keywords that share the same specific intent and landing page.

**Ad Strength:** Always aim for "Good" or "Excellent" ad strength.

- **Requirement:** Include keywords in headlines. Use distinct headlines (don't repeat the same phrase).

**Negative Lists:** Always recommend creating a "Master Negative List" (e.g., "Free", "Cheap", "Jobs", "Nude") and applying it to all campaigns at the account level.

## 6. Ad Assets (Extensions) Rules

**Global Logic for AI:**

- **Hierarchy:** Assets can be applied at Account, Campaign, or Ad Group levels.
- **Override Rule:** Lower levels override higher levels. (e.g., A Sitelink at the Ad Group level will prevent Account level Sitelinks from showing for that specific ad group).
- **Min/Max:** Most assets require a minimum number to serve (e.g., 2 Sitelinks).

### A. Sitelink Assets

**Purpose:** Deep links to specific pages (e.g., "Contact Us", "Pricing").

**Validation:**

- **Link Text:** Max 25 chars.
- **Description Line 1:** Max 35 chars.
- **Description Line 2:** Max 35 chars.
- **Final URL:** Must be unique (cannot be the same as the Ad's Final URL).

**Limits:** Min 2 to serve. Max 20 per entity.

### B. Callout Assets

**Purpose:** Non-clickable text highlights (e.g., "24/7 Support", "Free Shipping").

**Validation:**

- **Text:** Max 25 chars.
- **Prohibited:** No punctuation at the start of the text. No repetition of words found in the ad headline.

**Limits:** Min 2 to serve. Max 20 per entity.

### C. Structured Snippets

**Purpose:** Specific lists of services/products.

**Validation:**

- **Header:** Must be selected from a fixed Google list. Users cannot create custom headers.
- **Valid Headers:** Amenities, Brands, Courses, Degree programs, Destinations, Featured hotels, Insurance coverage, Models, Neighborhoods, Service catalog, Shows, Styles, Types.
- **Values:** Max 25 chars per value.

**Limits:** Min 3 values per header. Max 10 values.

### D. Image Assets

**Purpose:** Visuals displayed next to search ads.

**Specs:**

- **Square (1:1):** Min 300x300. Max 5MB.
- **Landscape (1.91:1):** Min 600x314. Max 5MB.
- **File Types:** JPG, PNG, Static GIF.
- **Restrictions:** No logos overlaying the image. No text overlays.

### E. Call Assets

**Purpose:** Click-to-call phone number.

**Validation:**

- **Verification (Strict 2025 Rule):** Phone number must be verified.
- **Display Logic:** Must match the country code of the targeting.
- **Unverified Numbers:** Will be disapproved immediately.

### F. Lead Form Assets

**Purpose:** Collect leads directly on Google Search.

**Structure:**

- **Headline:** Max 30 chars.
- **Business Name:** Max 25 chars.
- **Description:** Max 200 chars.
- **Questions:** Select from predefined list (Name, Email, Phone, Zip, etc.). Max 10 questions.
- **Background Image:** 1200x628 (1.91:1).
- **Privacy Policy URL:** Mandatory.
- **Submission Message:** Headline (30), Description (200).

### G. Price Assets

**Purpose:** Show pricing cards for services/products.

**Validation:**

- **Header:** Max 25 chars.
- **Description:** Max 25 chars.
- **Price:** Number + Currency Code (USD, EUR, etc.).
- **Units:** No units, Per hour, Per day, Per week, Per month, Per year, Per night.

**Limits:** Min 3 items required. Max 8 items.

### H. Promotion Assets

**Purpose:** Highlight a sale (e.g., "Summer Sale").

**Validation:**

- **Promotion Type:** Monetary discount ($10 off) OR Percent discount (20% off).
- **Item:** Max 20 chars (e.g., "All Shoes").
- **Occasion (Optional):** Selected from fixed list (Christmas, Black Friday, etc.).
- **Promotion Code (Optional):** Max 15 chars.
- **Dates:** Start Date and End Date are optional but recommended.

## 7. Targeting Rules (The "Who" and "Where")

### A. Geo-Targeting (Locations)

- **API Field:** `criterion_id` (Integer).
- **Lookup:** Do not pass string names ("New York"). You must pass ID 1023191.

**Radius Targeting:**

- **Format:** 20 miles or 20 km.
- **Min radius:** 1.0 (mi/km).
- **Max radius:** 500.0 (mi/km).

### B. Languages

- **Logic:** Google Ads does not target "Browser Language," it targets "Interface Language."
- **Default:** If not specified, defaults to "All Languages."
- **Format:** Use Language IDs (e.g., English = 1000, Spanish = 1003).

### C. Devices

- **Categories:** Desktop, Mobile, Tablet, TV Screens.
- **Bid Modifiers:** Range from -100% (Turn off) to +900%.
- **Example:** To disable Tablets, set modifier to -100.

---

## How to use this with Cursor

1. **Create the file:** Save the text above as `google_ads_rules.md`.
2. **Add to .cursorrules:** Add the following line to your `.cursorrules` file:

```
Always reference google_ads_rules.md when writing code related to Google Ads validation, schema, or API calls. Ensure all constraints (character limits, entity counts) are enforced in the frontend Zod schemas.
```

This will make Cursor "smart" about Google Ads immediately, preventing it from hallucinating incorrect limits (like saying headlines are 50 chars) or invalid structures.

