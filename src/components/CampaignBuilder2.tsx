import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, Check, ChevronRight, Download, FileText, Globe, 
  Layout, Layers, MapPin, Mail, Hash, TrendingUp, Zap, 
  Phone, Repeat, Search, Sparkles, Edit3, Trash2, Save, RefreshCw, Clock,
  CheckCircle2, AlertCircle, ShieldCheck, AlertTriangle, Plus, Link2, Eye, 
  DollarSign, Smartphone, MessageSquare, Building2, FileText as FormIcon, 
  Tag, Image as ImageIcon, Gift, Target, Brain, Split, Map, Funnel, 
  Users, TrendingDown, Network, Filter, Info, FolderOpen, Cog, Megaphone, MinusCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { KeywordPlannerSelectable } from './KeywordPlannerSelectable';
import { LiveAdPreview } from './LiveAdPreview';
import { notifications } from '../utils/notifications';
import { generateCampaignStructure, type StructureSettings } from '../utils/campaignStructureGenerator';
import { exportCampaignToCSV } from '../utils/csvExporter';
import { exportCampaignToCSVV3, validateCSVBeforeExport } from '../utils/csvGeneratorV3';
import { validateCampaignForExport, formatValidationErrors } from '../utils/csvValidator';
import { exportCampaignToGoogleAdsEditorCSV, validateCSVRows, campaignStructureToCSVRows } from '../utils/googleAdsEditorCSVExporter';
import { DEFAULT_SEED_KEYWORDS, DEFAULT_URL, DEFAULT_CAMPAIGN_NAME, DEFAULT_NEGATIVE_KEYWORDS } from '../utils/defaultExamples';
import { api } from '../utils/api';
import { projectId } from '../utils/supabase/info';
import { historyService } from '../utils/historyService';
import { useAutoSave } from '../hooks/useAutoSave';
// Campaign Intelligence imports
import { mapGoalToIntent, type IntentResult } from '../utils/campaignIntelligence/intentClassifier';
import { extractLandingPageContent, type LandingPageExtractionResult } from '../utils/campaignIntelligence/landingPageExtractor';
import { getVerticalConfig, getServiceTokens, getKeywordModifiers, getEmergencyModifiers } from '../utils/campaignIntelligence/verticalTemplates';
import { suggestBidCents, groupKeywordsToAdGroups } from '../utils/campaignIntelligence/bidSuggestions';
import type { MatchType } from '../utils/campaignIntelligence/schemas';
import { IntentId } from '../utils/campaignIntelligence/schemas';
import { runPolicyChecks } from '../utils/campaignIntelligence/policyChecks';
import { getDeviceConfig, formatDeviceBidModifiersForCSV } from '../utils/campaignIntelligence/deviceDefaults';
import { buildTrackingParams, generateUTMParams } from '../utils/campaignIntelligence/tracking';
import type { LandingExtraction } from '../utils/campaignIntelligence/schemas';
import { generateKeywords as generateKeywordsUtil } from '../utils/keywordGenerator';
import { 
  generateAds as generateAdsUtility, 
  detectUserIntent,
  type AdGenerationInput,
  type ResponsiveSearchAd,
  type ExpandedTextAd,
  type CallOnlyAd
} from '../utils/googleAdGenerator';

// Google Ads Generation System Prompt (same as AdsBuilder)
const GOOGLE_ADS_SYSTEM_PROMPT = `🟣 SYSTEM INSTRUCTION: GOOGLE ADS GENERATION RULES

You are the Google Ads Generator for Adiology.

You must generate ads using official Google Search Ads formatting, including:

Dynamic Keyword Insertion (DKI)
Responsive Search Ads (RSA)
Call Ads (if selected)
Single Ad Group mode
Multiple Ad Group mode

Your output must ALWAYS follow these rules.

🎯 1. DKI (Dynamic Keyword Insertion) Rules

Always use Google's correct DKI syntax:

{KeyWord:Default Text}

Examples (correct):

{KeyWord:Airline Number}
{KeyWord:Contact Airline}
{KeyWord:Plumber Near Me}

❌ Do NOT add spaces inside {KeyWord: ... }
❌ Do NOT break them across lines
❌ Do NOT add extra braces
❌ Do NOT use unsupported formats like {keyword:}, {Keyword:}, etc.

Headline Rules for DKI:
- Each headline should contain 1 DKI or 1 value-based benefit
- Max 30 characters recommended (no need to enforce exact count automatically but stay short)
- Headlines must look like:
  {KeyWord:Airline Number} - Official Site
  Buy {KeyWord:Airline Number}
  Top Rated {KeyWord:Airline Number}

Description Rules for DKI:
- Must include benefit + CTA
- Must NOT include more than 1–2 DKI per description
- Example:
  Find the right {KeyWord:Airline Number} instantly. Compare options & get support fast.
  Order your {KeyWord:Airline Number} today with 24/7 assistance.

🎯 2. RSA (Responsive Search Ads) Rules

Your output must contain:
- Headlines (10 minimum)
  - Mix of: keyword variations, benefits, credibility, speed/urgency, CTA headlines
  - Each headline <= 30 characters
  - No repeated exact same headline
- Descriptions (4 minimum)
  - <= 90 chars
  - Must be persuasive and unique
  - No repeating content
- DO NOT PIN headlines unless user requests

🎯 3. Grouping Rules

Single Ad Group Mode:
- All keywords belong to Group 1
- All ads generated should reference these same keywords

Multiple Ad Group Mode:
- Split keywords evenly across groups:
  - 1 keyword → Group 1
  - 2–3 keywords → Group 1, Group 2
  - 4+ keywords → Group 1, Group 2, Group 3...
- Max 10 keywords per group
- Naming Convention: Group 1, Group 2, Group 3, etc.
- Each group must have:
  - 3–5 RSA ads
  - 2–5 DKI ads
  - 2 descriptions per DKI ad
  - Final URL shared or customized based on keyword (if possible)

🎯 4. URL Rules

URL provided by user is ALWAYS the base URL.

If user enters: https://www.example.com

Then AI should generate SEO-friendly ad Final URLs:
- https://www.example.com/keyword/deals
- https://www.example.com/contact
- https://www.example.com/airline-number

BUT DO NOT include spaces, uppercase letters, or DKI in URLs.

🎯 5. Copy Structure

Each generated ad must follow this structure:

DKI Ad:
- Headlines (5 variations)
- Display path (path1, path2)
- Two short descriptions
- Final URL
- Clean formatting
- No blank lines between headlines
- No extra symbols

RSA Ad:
- 10–15 headlines
- 2–4 descriptions
- Final URL
- No line breaks inside headlines/descriptions

🎯 6. Output Formatting Rules (for your UI)

NEVER output as paragraphs — output as structured blocks.

Correct Format Example:

### Group 1 — DKI

Headlines:
1. {KeyWord:Airline Number} - Official Site
2. Buy {KeyWord:Airline Number} Online
3. Trusted {KeyWord:Airline Number} Service
4. {KeyWord:Airline Number} Hotline
5. Get {KeyWord:Airline Number} Help

Descriptions:
- Find the best {KeyWord:Airline Number}. Fast & reliable support.
- Contact our experts for 24/7 assistance.

Final URL:
https://www.example.com/airline-number

🎯 7. Keyword Rewriting Logic

For each keyword:
- Capitalize each word: airline number → Airline Number
- Use as DKI: {KeyWord:Airline Number}
- Create 2–4 variations:
  - Airline Number
  - Airline Hotline
  - Contact Airline Support

🎯 8. Validation Rules

Before returning ads:
✔ Check that DKI syntax is valid
✔ No headline exceeds reasonable length
✔ No broken URLs
✔ No duplicate headlines
✔ No broken braces { or }
✔ Descriptions remain readable
✔ No plagiarism or copyrighted content
✔ Output must match your UI layout

🎯 9. Output must be clean, structured, and UI-friendly.

No markdown tables, no extra commentary, no explanations — ONLY the ads.`;

// Geo Targeting Constants
const COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India"
];

// Top cities by income per capita (ranked highest to lowest)
const TOP_CITIES_BY_INCOME: Record<string, string[]> = {
    "United States": [
        "San Francisco, CA", "San Jose, CA", "Washington, DC", "Seattle, WA", "Boston, MA",
        "Arlington, VA", "Denver, CO", "Austin, TX", "New York, NY", "Minneapolis, MN",
        "Portland, OR", "Raleigh, NC", "Atlanta, GA", "Charlotte, NC", "San Diego, CA",
        "Dallas, TX", "Nashville, TN", "Phoenix, AZ", "Miami, FL", "Los Angeles, CA",
        "Chicago, IL", "Houston, TX", "Philadelphia, PA", "San Antonio, TX", "Jacksonville, FL",
        "Columbus, OH", "Fort Worth, TX", "Indianapolis, IN", "Las Vegas, NV", "Memphis, TN",
        "Louisville, KY", "Detroit, MI", "Oklahoma City, OK", "Milwaukee, WI", "Tucson, AZ",
        "Fresno, CA", "Sacramento, CA", "Kansas City, MO", "Mesa, AZ", "Virginia Beach, VA",
        "Omaha, NE", "Oakland, CA", "Tulsa, OK", "Tampa, FL", "New Orleans, LA",
        "Wichita, KS", "Cleveland, OH", "Bakersfield, CA", "Aurora, CO", "Honolulu, HI",
        "Anaheim, CA", "Santa Ana, CA", "St. Louis, MO", "Corpus Christi, TX", "Riverside, CA",
        "Lexington, KY", "Pittsburgh, PA", "Anchorage, AK", "Stockton, CA", "Cincinnati, OH",
        "St. Paul, MN", "Toledo, OH", "Greensboro, NC", "Newark, NJ", "Plano, TX",
        "Henderson, NV", "Lincoln, NE", "Buffalo, NY", "Jersey City, NJ", "Chula Vista, CA",
        "Fort Wayne, IN", "Orlando, FL", "St. Petersburg, FL", "Chandler, AZ", "Laredo, TX",
        "Norfolk, VA", "Durham, NC", "Madison, WI", "Lubbock, TX", "Irvine, CA",
        "Winston-Salem, NC", "Glendale, AZ", "Garland, TX", "Hialeah, FL", "Reno, NV",
        "Chesapeake, VA", "Gilbert, AZ", "Baton Rouge, LA", "Irving, TX", "Scottsdale, AZ",
        "North Las Vegas, NV", "Fremont, CA", "Boise, ID", "Richmond, VA", "Spokane, WA",
        "Birmingham, AL", "Rochester, NY", "Des Moines, IA", "Modesto, CA", "Fayetteville, NC",
        "Tacoma, WA", "Oxnard, CA", "Fontana, CA", "Columbus, GA", "Montgomery, AL",
        "Moreno Valley, CA", "Shreveport, LA", "Aurora, IL", "Yonkers, NY", "Akron, OH",
        "Huntington Beach, CA", "Little Rock, AR", "Amarillo, TX", "Glendale, CA", "Grand Rapids, MI",
        "Salt Lake City, UT", "Tallahassee, FL", "Huntsville, AL", "Grand Prairie, TX", "Knoxville, TN",
        "Worcester, MA", "Newport News, VA", "Brownsville, TX", "Overland Park, KS", "Santa Clarita, CA",
        "Providence, RI", "Garden Grove, CA", "Chattanooga, TN", "Oceanside, CA", "Jackson, MS",
        "Fort Lauderdale, FL", "Santa Rosa, CA", "Rancho Cucamonga, CA", "Port St. Lucie, FL", "Tempe, AZ",
        "Ontario, CA", "Vancouver, WA", "Sioux Falls, SD", "Springfield, MO", "Peoria, AZ",
        "Pembroke Pines, FL", "Elk Grove, CA", "Salem, OR", "Lancaster, CA", "Corona, CA",
        "Eugene, OR", "Palmdale, CA", "Salinas, CA", "Springfield, MA", "Pasadena, TX",
        "Fort Collins, CO", "Hayward, CA", "Pomona, CA", "Cary, NC", "Rockford, IL",
        "Alexandria, VA", "Escondido, CA", "McKinney, TX", "Kansas City, KS", "Joliet, IL",
        "Sunnyvale, CA", "Torrance, CA", "Bridgeport, CT", "Lakewood, CO", "Hollywood, FL",
        "Paterson, NJ", "Naperville, IL", "Syracuse, NY", "Mesquite, TX", "Dayton, OH",
        "Savannah, GA", "Clarksville, TN", "Orange, CA", "Pasadena, CA", "Fullerton, CA",
        "Killeen, TX", "Frisco, TX", "Hampton, VA", "McAllen, TX", "Warren, MI",
        "Bellevue, WA", "West Valley City, UT", "Columbia, SC", "Olathe, KS", "Sterling Heights, MI",
        "New Haven, CT", "Miramar, FL", "Waco, TX", "Thousand Oaks, CA", "Cedar Rapids, IA",
        "Charleston, SC", "Visalia, CA", "Topeka, KS", "Elizabeth, NJ", "Gainesville, FL",
        "Thornton, CO", "Roseville, CA", "Carrollton, TX", "Coral Springs, FL", "Stamford, CT",
        "Simi Valley, CA", "Concord, CA", "Hartford, CT", "Kent, WA", "Lafayette, LA",
        "Midland, TX", "Surprise, AZ", "Denton, TX", "Victorville, CA", "Evansville, IN",
        "Santa Clara, CA", "Abilene, TX", "Athens, GA", "Vallejo, CA", "Allentown, PA",
        "Norman, OK", "Beaumont, TX", "Independence, MO", "Murfreesboro, TN", "Ann Arbor, MI",
        "Berkeley, CA", "Provo, UT", "El Monte, CA", "Lansing, MI", "Fargo, ND",
        "Downey, CA", "Costa Mesa, CA", "Wilmington, NC", "Arvada, CO", "Inglewood, CA",
        "Miami Gardens, FL", "Carlsbad, CA", "Westminster, CO", "Rochester, MN", "Odessa, TX",
        "Manchester, NH", "Elgin, IL", "West Jordan, UT", "Round Rock, TX", "Clearwater, FL",
        "Waterbury, CT", "Gresham, OR", "Fairfield, CA", "Billings, MT", "Lowell, MA",
        "San Buenaventura, CA", "Pueblo, CO", "High Point, NC", "West Covina, CA", "Richmond, CA",
        "Murrieta, CA", "Cambridge, MA", "Antioch, CA", "Temecula, CA", "Norwalk, CA",
        "Centennial, CO", "Everett, WA", "Palm Bay, FL", "Wichita Falls, TX", "Green Bay, WI",
        "Daly City, CA", "Burbank, CA", "Richardson, TX", "Pompano Beach, FL", "North Charleston, SC",
        "Broken Arrow, OK", "Boulder, CO", "West Palm Beach, FL", "Santa Maria, CA", "El Cajon, CA",
        "Davenport, IA", "Rialto, CA", "Las Cruces, NM", "San Mateo, CA", "Lewisville, TX",
        "South Bend, IN", "Lakeland, FL", "Erie, PA", "Tyler, TX", "Pearland, TX",
        "College Station, TX", "Kenosha, WI", "Sandy Springs, GA", "Clovis, CA", "Flint, MI",
        "Roanoke, VA", "Albany, NY", "Jurupa Valley, CA", "Compton, CA", "San Angelo, TX",
        "Hillsboro, OR", "Lawton, OK", "Renton, WA", "Vista, CA", "Davie, FL",
        "Greeley, CO", "Mission Viejo, CA", "Portsmouth, VA", "Dearborn, MI", "South Gate, CA",
        "Tuscaloosa, AL", "Livonia, MI", "New Bedford, MA", "Vacaville, CA", "Brockton, MA",
        "Roswell, GA", "Beaverton, OR", "Quincy, MA", "Sparks, NV", "Yakima, WA",
        "Lee's Summit, MO", "Federal Way, WA", "Carson, CA", "Santa Monica, CA", "Hesperia, CA",
        "Allen, TX", "Rio Rancho, NM", "Yuma, AZ", "Westminster, CA", "Orem, UT",
        "Lynn, MA", "Redding, CA", "Spokane Valley, WA", "Miami Beach, FL", "League City, TX",
        "Lawrence, KS", "Santa Barbara, CA", "Plantation, FL", "Sandy, UT", "Bend, OR",
        "Hillsboro, OR", "Southaven, MS", "Boca Raton, FL", "Cape Coral, FL", "Boulder, CO",
        "Greenville, SC", "Waco, TX", "Dothan, AL", "San Luis Obispo, CA", "Bellingham, WA",
        "Prescott, AZ", "Flagstaff, AZ", "Asheville, NC", "Fort Myers, FL", "Santa Fe, NM",
        "Eugene, OR", "Olympia, WA", "Eau Claire, WI", "Bismarck, ND", "Rapid City, SD",
        "Fargo, ND", "Grand Forks, ND", "Sioux Falls, SD", "Rochester, MN", "Duluth, MN",
        "St. Cloud, MN", "Mankato, MN", "Winona, MN", "Moorhead, MN"
    ],
    "United Kingdom": [
        "London", "Edinburgh", "Manchester", "Birmingham", "Bristol",
        "Leeds", "Glasgow", "Liverpool", "Newcastle", "Sheffield",
        "Cardiff", "Belfast", "Nottingham", "Leicester", "Coventry",
        "Reading", "Southampton", "Portsmouth", "Brighton", "Oxford",
        "Cambridge", "York", "Norwich", "Exeter", "Bath",
        "Canterbury", "Durham", "St. Albans", "Winchester", "Truro",
        "Wells", "Ely", "Ripon", "Chichester", "Hereford",
        "Lichfield", "Salisbury", "Worcester", "Peterborough", "Gloucester",
        "Chelmsford", "Ipswich", "Colchester", "Norwich", "King's Lynn",
        "Great Yarmouth", "Lowestoft", "Bury St Edmunds", "Newmarket", "Thetford",
        "Diss", "Harleston", "Attleborough", "Watton", "Swaffham",
        "Fakenham", "Holt", "Cromer", "Sheringham", "Wells-next-the-Sea",
        "Hunstanton", "Downham Market", "Wisbech", "March", "Chatteris",
        "St. Ives", "Huntingdon", "St. Neots", "Biggleswade", "Sandy",
        "Potton", "Gamlingay", "Bourn", "Caxton", "Elsworth",
        "Conington", "Fenstanton", "Hilton", "Papworth Everard", "Sawston",
        "Duxford", "Linton", "Haverhill", "Clare", "Sudbury",
        "Long Melford", "Lavenham", "Bildeston", "Hadleigh", "Ipswich",
        "Woodbridge", "Felixstowe", "Framlingham", "Saxmundham", "Aldeburgh",
        "Southwold", "Lowestoft", "Beccles", "Bungay", "Halesworth",
        "Eye", "Debenham", "Stowmarket", "Needham Market", "Ipswich",
        "Colchester", "Maldon", "Witham", "Kelvedon", "Coggeshall",
        "Braintree", "Halstead", "Saffron Walden", "Thaxted", "Great Dunmow",
        "Bishop's Stortford", "Sawbridgeworth", "Harlow", "Epping", "Chigwell",
        "Loughton", "Waltham Abbey", "Cheshunt", "Hoddesdon", "Ware",
        "Hertford", "Welwyn Garden City", "Hatfield", "St. Albans", "Harpenden",
        "Redbourn", "Wheathampstead", "Kimpton", "Codicote", "Knebworth",
        "Stevenage", "Letchworth", "Baldock", "Royston", "Melbourn",
        "Meldreth", "Shepreth", "Foxton", "Barrington", "Haslingfield",
        "Comberton", "Barton", "Grantchester", "Trumpington", "Cambridge",
        "Milton", "Histon", "Impington", "Cottenham", "Waterbeach",
        "Landbeach", "Chittering", "Stretham", "Witcham", "Mepal",
        "Sutton", "Ely", "Littleport", "Pymore", "Soham",
        "Isleham", "Fordham", "Chippenham", "Snailwell", "Newmarket",
        "Moulton", "Kentford", "Gazeley", "Dalham", "Kirtling",
        "Cheveley", "Woodditton", "Stetchworth", "Dullingham", "Burwell",
        "Swaffham Prior", "Reach", "Upware", "Wicken", "Soham"
    ],
    "Canada": [
        "Toronto, ON", "Vancouver, BC", "Calgary, AB", "Montreal, QC", "Ottawa, ON",
        "Edmonton, AB", "Winnipeg, MB", "Quebec City, QC", "Hamilton, ON", "Kitchener, ON",
        "London, ON", "Victoria, BC", "Halifax, NS", "Oshawa, ON", "Windsor, ON",
        "Saskatoon, SK", "Regina, SK", "Sherbrooke, QC", "Kelowna, BC", "Barrie, ON",
        "Abbotsford, BC", "Sudbury, ON", "Kingston, ON", "Saguenay, QC", "Trois-Rivieres, QC",
        "Guelph, ON", "Cambridge, ON", "Thunder Bay, ON", "Saint John, NB", "Moncton, NB",
        "Brantford, ON", "Peterborough, ON", "Red Deer, AB", "Lethbridge, AB", "Nanaimo, BC",
        "Kamloops, BC", "Chilliwack, BC", "Prince George, BC", "Victoria, BC", "Surrey, BC",
        "Burnaby, BC", "Richmond, BC", "Coquitlam, BC", "Langley, BC", "Delta, BC",
        "New Westminster, BC", "North Vancouver, BC", "West Vancouver, BC", "Port Coquitlam, BC", "Maple Ridge, BC",
        "White Rock, BC", "Port Moody, BC", "Anmore, BC", "Belcarra, BC", "Bowen Island, BC",
        "Lions Bay, BC", "North Saanich, BC", "Oak Bay, BC", "Saanich, BC", "Esquimalt, BC",
        "View Royal, BC", "Colwood, BC", "Langford, BC", "Highlands, BC", "Metchosin, BC",
        "Sooke, BC", "Sidney, BC", "Central Saanich, BC", "North Cowichan, BC", "Duncan, BC",
        "Ladysmith, BC", "Parksville, BC", "Qualicum Beach, BC", "Courtenay, BC", "Comox, BC",
        "Campbell River, BC", "Port Alberni, BC", "Tofino, BC", "Ucluelet, BC", "Bamfield, BC",
        "Tahsis, BC", "Zeballos, BC", "Gold River, BC", "Sayward, BC", "Woss, BC",
        "Woss Lake, BC", "Telegraph Cove, BC", "Alert Bay, BC", "Sointula, BC", "Port McNeill, BC",
        "Port Hardy, BC", "Fort Rupert, BC", "Quatsino, BC", "Holberg, BC", "Winter Harbour, BC",
        "Coal Harbour, BC", "Port Alice, BC", "Kyuquot, BC", "Fair Harbour, BC", "Zeballos, BC",
        "Tahsis, BC", "Gold River, BC", "Sayward, BC", "Woss, BC", "Woss Lake, BC",
        "Telegraph Cove, BC", "Alert Bay, BC", "Sointula, BC", "Port McNeill, BC", "Port Hardy, BC",
        "Fort Rupert, BC", "Quatsino, BC", "Holberg, BC", "Winter Harbour, BC", "Coal Harbour, BC",
        "Port Alice, BC", "Kyuquot, BC", "Fair Harbour, BC", "Zeballos, BC", "Tahsis, BC",
        "Gold River, BC", "Sayward, BC", "Woss, BC", "Woss Lake, BC", "Telegraph Cove, BC"
    ],
    "Australia": [
        "Sydney, NSW", "Melbourne, VIC", "Brisbane, QLD", "Perth, WA", "Adelaide, SA",
        "Gold Coast, QLD", "Newcastle, NSW", "Canberra, ACT", "Sunshine Coast, QLD", "Wollongong, NSW",
        "Hobart, TAS", "Geelong, VIC", "Townsville, QLD", "Cairns, QLD", "Toowoomba, QLD",
        "Darwin, NT", "Ballarat, VIC", "Bendigo, VIC", "Albury, NSW", "Launceston, TAS",
        "Mackay, QLD", "Rockhampton, QLD", "Bunbury, WA", "Bundaberg, QLD", "Coffs Harbour, NSW",
        "Wagga Wagga, NSW", "Hervey Bay, QLD", "Port Macquarie, NSW", "Mildura, VIC", "Tamworth, NSW",
        "Orange, NSW", "Dubbo, NSW", "Shepparton, VIC", "Gladstone, QLD", "Nowra, NSW",
        "Warrnambool, VIC", "Mount Gambier, SA", "Kalgoorlie, WA", "Lismore, NSW", "Bathurst, NSW",
        "Geraldton, WA", "Whyalla, SA", "Broken Hill, NSW", "Mount Isa, QLD", "Alice Springs, NT",
        "Katherine, NT", "Darwin, NT", "Palmerston, NT", "Alice Springs, NT", "Katherine, NT",
        "Tennant Creek, NT", "Nhulunbuy, NT", "Yulara, NT", "Alyangula, NT", "Gove, NT",
        "Jabiru, NT", "Kununurra, WA", "Broome, WA", "Port Hedland, WA", "Karratha, WA",
        "Newman, WA", "Tom Price, WA", "Paraburdoo, WA", "Exmouth, WA", "Carnarvon, WA",
        "Denham, WA", "Shark Bay, WA", "Geraldton, WA", "Northampton, WA", "Morawa, WA",
        "Mullewa, WA", "Perenjori, WA", "Paynes Find, WA", "Mount Magnet, WA", "Cue, WA",
        "Meekatharra, WA", "Wiluna, WA", "Leinster, WA", "Laverton, WA", "Leonora, WA",
        "Menzie, WA", "Norseman, WA", "Esperance, WA", "Ravensthorpe, WA", "Hopetoun, WA",
        "Ongerup, WA", "Jerramungup, WA", "Gnowangerup, WA", "Katanning, WA", "Kojonup, WA",
        "Bridgetown, WA", "Manjimup, WA", "Pemberton, WA", "Northcliffe, WA", "Walpole, WA",
        "Denmark, WA", "Albany, WA", "Mount Barker, WA", "Kendenup, WA", "Cranbrook, WA",
        "Tambellup, WA", "Gnowangerup, WA", "Ongerup, WA", "Jerramungup, WA", "Ravensthorpe, WA",
        "Hopetoun, WA", "Esperance, WA", "Norseman, WA", "Menzie, WA", "Leonora, WA",
        "Laverton, WA", "Leinster, WA", "Wiluna, WA", "Meekatharra, WA", "Cue, WA",
        "Mount Magnet, WA", "Paynes Find, WA", "Perenjori, WA", "Mullewa, WA", "Morawa, WA",
        "Northampton, WA", "Geraldton, WA", "Shark Bay, WA", "Denham, WA", "Carnarvon, WA",
        "Exmouth, WA", "Paraburdoo, WA", "Tom Price, WA", "Newman, WA", "Karratha, WA",
        "Port Hedland, WA", "Broome, WA", "Kununurra, WA", "Jabiru, NT", "Gove, NT",
        "Alyangula, NT", "Yulara, NT", "Nhulunbuy, NT", "Tennant Creek, NT", "Katherine, NT",
        "Alice Springs, NT", "Palmerston, NT", "Darwin, NT", "Katherine, NT", "Alice Springs, NT"
    ],
    "Germany": [
        "Munich", "Stuttgart", "Hamburg", "Frankfurt", "Düsseldorf",
        "Berlin", "Cologne", "Dresden", "Leipzig", "Nuremberg",
        "Hannover", "Bremen", "Duisburg", "Essen", "Bochum",
        "Wuppertal", "Bielefeld", "Bonn", "Münster", "Karlsruhe",
        "Mannheim", "Augsburg", "Wiesbaden", "Gelsenkirchen", "Mönchengladbach",
        "Braunschweig", "Chemnitz", "Kiel", "Aachen", "Halle",
        "Magdeburg", "Freiburg", "Krefeld", "Lübeck", "Oberhausen",
        "Erfurt", "Mainz", "Rostock", "Kassel", "Hagen",
        "Hamm", "Saarbrücken", "Mülheim", "Potsdam", "Ludwigshafen",
        "Oldenburg", "Leverkusen", "Osnabrück", "Solingen", "Heidelberg",
        "Herne", "Neuss", "Darmstadt", "Paderborn", "Regensburg",
        "Ingolstadt", "Würzburg", "Fürth", "Wolfsburg", "Offenbach",
        "Ulm", "Heilbronn", "Pforzheim", "Göttingen", "Bottrop",
        "Trier", "Recklinghausen", "Reutlingen", "Bremerhaven", "Koblenz",
        "Bergisch Gladbach", "Jena", "Remscheid", "Erlangen", "Moers",
        "Siegen", "Hildesheim", "Salzgitter", "Cottbus", "Kaiserslautern",
        "Gütersloh", "Schwerin", "Witten", "Gera", "Iserlohn",
        "Lünen", "Düren", "Esslingen", "Marl", "Ratingen",
        "Tübingen", "Villingen-Schwenningen", "Konstanz", "Flensburg", "Minden",
        "Velbert", "Neumünster", "Delmenhorst", "Wilhelmshaven", "Viersen",
        "Gladbeck", "Dorsten", "Rheine", "Detmold", "Castrop-Rauxel",
        "Arnsberg", "Lüneburg", "Lippstadt", "Dinslaken", "Soest",
        "Neubrandenburg", "Dormagen", "Brandenburg", "Sindelfingen", "Aschaffenburg",
        "Neuwied", "Plauen", "Fulda", "Bergheim", "Schwäbisch Gmünd",
        "Landshut", "Rosenheim", "Frankenthal", "Stralsund", "Friedrichshafen",
        "Offenburg", "Suhl", "Görlitz", "Sankt Augustin", "Hürth",
        "Grevenbroich", "Unna", "Euskirchen", "Stolberg", "Hameln",
        "Meerbusch", "Gießen", "Sankt Ingbert", "Garbsen", "Bayreuth",
        "Weiden", "Lörrach", "Celle", "Kleve", "Homburg",
        "Neustadt", "Freising", "Lüdenscheid", "Eisenach", "Weimar",
        "Speyer", "Passau", "Ravensburg", "Kempten", "Goslar",
        "Willich", "Emden", "Bad Homburg", "Bad Salzuflen", "Langenfeld",
        "Greifswald", "Rastatt", "Tuttlingen", "Baden-Baden", "Weinheim",
        "Oberursel", "Bad Kreuznach", "Böblingen", "Starnberg", "Germering",
        "Fürstenfeldbruck", "Gauting", "Gröbenzell", "Olching", "Puchheim",
        "Eichenau", "Gilching", "Wörthsee", "Inning", "Seefeld",
        "Andechs", "Herrsching", "Steinebach", "Wessling", "Seeshaupt",
        "Bernried", "Tutzing", "Feldafing", "Pöcking", "Starnberg",
        "Percha", "Feldafing", "Tutzing", "Bernried", "Seeshaupt",
        "Wessling", "Steinebach", "Herrsching", "Andechs", "Seefeld",
        "Inning", "Wörthsee", "Gilching", "Eichenau", "Puchheim",
        "Olching", "Gröbenzell", "Gauting", "Fürstenfeldbruck", "Starnberg",
        "Böblingen", "Bad Kreuznach", "Oberursel", "Weinheim", "Baden-Baden",
        "Tuttlingen", "Rastatt", "Greifswald", "Langenfeld", "Bad Salzuflen",
        "Bad Homburg", "Emden", "Willich", "Goslar", "Kempten",
        "Ravensburg", "Passau", "Speyer", "Weimar", "Eisenach",
        "Lüdenscheid", "Freising", "Neustadt", "Homburg", "Kleve",
        "Celle", "Lörrach", "Bayreuth", "Garbsen", "Sankt Ingbert",
        "Gießen", "Meerbusch", "Hameln", "Stolberg", "Euskirchen",
        "Unna", "Grevenbroich", "Hürth", "Sankt Augustin", "Görlitz",
        "Suhl", "Offenburg", "Friedrichshafen", "Stralsund", "Frankenthal",
        "Rosenheim", "Landshut", "Schwäbisch Gmünd", "Bergheim", "Fulda",
        "Plauen", "Neuwied", "Aschaffenburg", "Sindelfingen", "Brandenburg",
        "Dormagen", "Neubrandenburg", "Soest", "Dinslaken", "Lippstadt",
        "Lüneburg", "Arnsberg", "Castrop-Rauxel", "Detmold", "Rheine",
        "Dorsten", "Gladbeck", "Viersen", "Wilhelmshaven", "Delmenhorst",
        "Neumünster", "Velbert", "Minden", "Flensburg", "Konstanz",
        "Villingen-Schwenningen", "Tübingen", "Ratingen", "Marl", "Esslingen",
        "Düren", "Lünen", "Iserlohn", "Gera", "Witten",
        "Schwerin", "Gütersloh", "Kaiserslautern", "Cottbus", "Salzgitter",
        "Hildesheim", "Siegen", "Moers", "Erlangen", "Remscheid",
        "Jena", "Bergisch Gladbach", "Koblenz", "Bremerhaven", "Reutlingen",
        "Recklinghausen", "Trier", "Bottrop", "Göttingen", "Pforzheim",
        "Heilbronn", "Ulm", "Offenbach", "Wolfsburg", "Fürth",
        "Würzburg", "Ingolstadt", "Regensburg", "Paderborn", "Darmstadt",
        "Neuss", "Herne", "Heidelberg", "Solingen", "Osnabrück",
        "Leverkusen", "Oldenburg", "Ludwigshafen", "Potsdam", "Mülheim",
        "Saarbrücken", "Hamm", "Hagen", "Kassel", "Rostock",
        "Mainz", "Erfurt", "Oberhausen", "Lübeck", "Krefeld",
        "Freiburg", "Magdeburg", "Halle", "Aachen", "Kiel",
        "Chemnitz", "Braunschweig", "Mönchengladbach", "Gelsenkirchen", "Wiesbaden",
        "Augsburg", "Mannheim", "Karlsruhe", "Münster", "Bonn",
        "Bielefeld", "Wuppertal", "Bochum", "Essen", "Duisburg",
        "Bremen", "Hannover", "Nuremberg", "Leipzig", "Dresden",
        "Cologne", "Berlin", "Düsseldorf", "Frankfurt", "Hamburg",
        "Stuttgart", "Munich"
    ],
    "France": [
        "Paris", "Lyon", "Marseille", "Toulouse", "Nice",
        "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
        "Rennes", "Reims", "Saint-Étienne", "Toulon", "Le Havre",
        "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne",
        "Saint-Denis", "Aix-en-Provence", "Clermont-Ferrand", "Brest", "Limoges",
        "Tours", "Amiens", "Perpignan", "Metz", "Besançon",
        "Boulogne-Billancourt", "Orléans", "Mulhouse", "Caen", "Rouen",
        "Nancy", "Argenteuil", "Montreuil", "Saint-Denis", "Roubaix",
        "Tourcoing", "Nanterre", "Avignon", "Créteil", "Dunkirk",
        "Poitiers", "Asnières-sur-Seine", "Courbevoie", "Vitry-sur-Seine", "Colombes",
        "Aulnay-sous-Bois", "La Rochelle", "Rueil-Malmaison", "Champigny-sur-Marne", "Antibes",
        "Bourges", "Cannes", "Calais", "Béziers", "Mérignac",
        "Saint-Maur-des-Fossés", "Drancy", "Massy", "Meaux", "Évry",
        "Noisy-le-Grand", "Pessac", "Valence", "Antony", "La Seyne-sur-Mer",
        "Clichy", "Vénissieux", "Troyes", "Montauban", "Pantin",
        "Neuilly-sur-Seine", "Niort", "Sarcelles", "Le Blanc-Mesnil", "Haguenau",
        "Cholet", "Cergy", "Bastia", "Bobigny", "Angoulême",
        "Laval", "Bayonne", "Brive-la-Gaillarde", "Cannes", "Annecy",
        "Lorient", "Thionville", "Chambéry", "Fréjus", "Villeneuve-d'Ascq",
        "Sète", "Arles", "Chartres", "Belfort", "Épinal",
        "Mâcon", "Auxerre", "Nevers", "Chalon-sur-Saône", "Vesoul",
        "Lons-le-Saunier", "Bourg-en-Bresse", "Montbéliard", "Valenciennes", "Douai",
        "Lens", "Arras", "Béthune", "Calais", "Boulogne-sur-Mer",
        "Dunkerque", "Saint-Omer", "Hazebrouck", "Aire-sur-la-Lys", "Bailleul",
        "Cassel", "Steenvoorde", "Wormhout", "Bergues", "Gravelines",
        "Grand-Fort-Philippe", "Petit-Fort-Philippe", "Oye-Plage", "Marck", "Coudekerque-Branche",
        "Téteghem", "Uxem", "Ghyvelde", "Leffrinckoucke", "Bray-Dunes",
        "Zuydcoote", "Ghyvelde", "Uxem", "Téteghem", "Coudekerque-Branche",
        "Marck", "Oye-Plage", "Petit-Fort-Philippe", "Grand-Fort-Philippe", "Gravelines",
        "Bergues", "Wormhout", "Steenvoorde", "Cassel", "Bailleul",
        "Aire-sur-la-Lys", "Hazebrouck", "Saint-Omer", "Dunkerque", "Boulogne-sur-Mer",
        "Calais", "Béthune", "Arras", "Lens", "Douai",
        "Valenciennes", "Montbéliard", "Bourg-en-Bresse", "Lons-le-Saunier", "Vesoul",
        "Chalon-sur-Saône", "Nevers", "Auxerre", "Mâcon", "Épinal",
        "Belfort", "Chartres", "Arles", "Sète", "Villeneuve-d'Ascq",
        "Fréjus", "Chambéry", "Thionville", "Lorient", "Annecy",
        "Cannes", "Brive-la-Gaillarde", "Bayonne", "Laval", "Angoulême",
        "Bobigny", "Bastia", "Cergy", "Cholet", "Haguenau",
        "Le Blanc-Mesnil", "Sarcelles", "Niort", "Neuilly-sur-Seine", "Pantin",
        "Montauban", "Troyes", "Vénissieux", "Clichy", "La Seyne-sur-Mer",
        "Antony", "Valence", "Pessac", "Noisy-le-Grand", "Évry",
        "Meaux", "Massy", "Drancy", "Saint-Maur-des-Fossés", "Mérignac",
        "Béziers", "Calais", "Cannes", "Bourges", "Antibes",
        "Champigny-sur-Marne", "Rueil-Malmaison", "La Rochelle", "Aulnay-sous-Bois", "Colombes",
        "Vitry-sur-Seine", "Courbevoie", "Asnières-sur-Seine", "Poitiers", "Dunkirk",
        "Créteil", "Avignon", "Nanterre", "Tourcoing", "Roubaix",
        "Saint-Denis", "Montreuil", "Argenteuil", "Nancy", "Rouen",
        "Caen", "Mulhouse", "Orléans", "Boulogne-Billancourt", "Besançon",
        "Metz", "Perpignan", "Amiens", "Tours", "Limoges",
        "Brest", "Clermont-Ferrand", "Aix-en-Provence", "Saint-Denis", "Villeurbanne",
        "Nîmes", "Angers", "Dijon", "Grenoble", "Le Havre",
        "Toulon", "Saint-Étienne", "Reims", "Rennes", "Lille",
        "Bordeaux", "Montpellier", "Strasbourg", "Nantes", "Nice",
        "Toulouse", "Marseille", "Lyon", "Paris"
    ],
    "India": [
        "Mumbai, Maharashtra", "Delhi", "Bangalore, Karnataka", "Hyderabad, Telangana", "Chennai, Tamil Nadu",
        "Kolkata, West Bengal", "Pune, Maharashtra", "Ahmedabad, Gujarat", "Jaipur, Rajasthan", "Surat, Gujarat",
        "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh", "Nagpur, Maharashtra", "Indore, Madhya Pradesh", "Thane, Maharashtra",
        "Bhopal, Madhya Pradesh", "Visakhapatnam, Andhra Pradesh", "Patna, Bihar", "Vadodara, Gujarat", "Ghaziabad, Uttar Pradesh",
        "Ludhiana, Punjab", "Agra, Uttar Pradesh", "Nashik, Maharashtra", "Faridabad, Haryana", "Meerut, Uttar Pradesh",
        "Rajkot, Gujarat", "Srinagar, Jammu and Kashmir", "Amritsar, Punjab", "Chandigarh", "Jabalpur, Madhya Pradesh",
        "Gwalior, Madhya Pradesh", "Jodhpur, Rajasthan", "Raipur, Chhattisgarh", "Allahabad, Uttar Pradesh", "Coimbatore, Tamil Nadu",
        "Vijayawada, Andhra Pradesh", "Jamshedpur, Jharkhand", "Madurai, Tamil Nadu", "Varanasi, Uttar Pradesh", "Srinagar, Jammu and Kashmir",
        "Aurangabad, Maharashtra", "Dhanbad, Jharkhand", "Amritsar, Punjab", "Navi Mumbai, Maharashtra", "Allahabad, Uttar Pradesh",
        "Ranchi, Jharkhand", "Howrah, West Bengal", "Jabalpur, Madhya Pradesh", "Gwalior, Madhya Pradesh", "Jodhpur, Rajasthan",
        "Raipur, Chhattisgarh", "Kota, Rajasthan", "Guwahati, Assam", "Chandigarh", "Solapur, Maharashtra",
        "Tiruchirappalli, Tamil Nadu", "Bareilly, Uttar Pradesh", "Moradabad, Uttar Pradesh", "Mysore, Karnataka", "Tiruppur, Tamil Nadu",
        "Gurgaon, Haryana", "Aligarh, Uttar Pradesh", "Jalandhar, Punjab", "Bhubaneswar, Odisha", "Salem, Tamil Nadu",
        "Warangal, Telangana", "Guntur, Andhra Pradesh", "Bhiwandi, Maharashtra", "Saharanpur, Uttar Pradesh", "Gorakhpur, Uttar Pradesh",
        "Bikaner, Rajasthan", "Amravati, Maharashtra", "Noida, Uttar Pradesh", "Jamshedpur, Jharkhand", "Bhilai, Chhattisgarh",
        "Cuttack, Odisha", "Firozabad, Uttar Pradesh", "Kochi, Kerala", "Nellore, Andhra Pradesh", "Bhavnagar, Gujarat",
        "Dehradun, Uttarakhand", "Durgapur, West Bengal", "Asansol, West Bengal", "Rourkela, Odisha", "Nanded, Maharashtra",
        "Kolhapur, Maharashtra", "Ajmer, Rajasthan", "Gulbarga, Karnataka", "Jamnagar, Gujarat", "Ujjain, Madhya Pradesh",
        "Loni, Uttar Pradesh", "Siliguri, West Bengal", "Jhansi, Uttar Pradesh", "Ulhasnagar, Maharashtra", "Jammu, Jammu and Kashmir",
        "Sangli-Miraj-Kupwad, Maharashtra", "Mangalore, Karnataka", "Erode, Tamil Nadu", "Belgaum, Karnataka", "Ambattur, Tamil Nadu",
        "Tirunelveli, Tamil Nadu", "Malegaon, Maharashtra", "Gaya, Bihar", "Jalgaon, Maharashtra", "Udaipur, Rajasthan",
        "Maheshtala, West Bengal", "Tirupati, Andhra Pradesh", "Davanagere, Karnataka", "Kozhikode, Kerala", "Akola, Maharashtra",
        "Kurnool, Andhra Pradesh", "Rajpur Sonarpur, West Bengal", "Bokaro Steel City, Jharkhand", "South Dumdum, West Bengal", "Bellary, Karnataka",
        "Patiala, Punjab", "Gopalpur, West Bengal", "Agartala, Tripura", "Bhagalpur, Bihar", "Muzaffarnagar, Uttar Pradesh",
        "Bhatpara, West Bengal", "Panihati, West Bengal", "Latur, Maharashtra", "Dhule, Maharashtra", "Rohtak, Haryana",
        "Korba, Chhattisgarh", "Bhilwara, Rajasthan", "Berhampur, Odisha", "Muzaffarpur, Bihar", "Ahmednagar, Maharashtra",
        "Mathura, Uttar Pradesh", "Kollam, Kerala", "Avadi, Tamil Nadu", "Kadapa, Andhra Pradesh", "Anantapur, Andhra Pradesh",
        "Kamarhati, West Bengal", "Sambalpur, Odisha", "Bilaspur, Chhattisgarh", "Shahjahanpur, Uttar Pradesh", "Satara, Maharashtra",
        "Bijapur, Karnataka", "Rampur, Uttar Pradesh", "Shimoga, Karnataka", "Chandrapur, Maharashtra", "Junagadh, Gujarat",
        "Thrissur, Kerala", "Alwar, Rajasthan", "Bardhaman, West Bengal", "Kulti, West Bengal", "Nizamabad, Telangana",
        "Parbhani, Maharashtra", "Tumkur, Karnataka", "Khammam, Telangana", "Ozhukarai, Puducherry", "Bihar Sharif, Bihar",
        "Panipat, Haryana", "Darbhanga, Bihar", "Bally, West Bengal", "Aizawl, Mizoram", "Dewas, Madhya Pradesh",
        "Ichalkaranji, Maharashtra", "Karnal, Haryana", "Bathinda, Punjab", "Jalna, Maharashtra", "Barasat, West Bengal",
        "Kirari Suleman Nagar, Delhi", "Purnia, Bihar", "Satna, Madhya Pradesh", "Mau, Uttar Pradesh", "Sonipat, Haryana",
        "Farrukhabad, Uttar Pradesh", "Sagar, Madhya Pradesh", "Rourkela, Odisha", "Durg, Chhattisgarh", "Imphal, Manipur",
        "Ratlam, Madhya Pradesh", "Hapur, Uttar Pradesh", "Arrah, Bihar", "Karimnagar, Telangana", "Anantnag, Jammu and Kashmir",
        "Etawah, Uttar Pradesh", "Ambarnath, Maharashtra", "North Dumdum, West Bengal", "Bharatpur, Rajasthan", "Begusarai, Bihar",
        "New Delhi", "Gandhinagar, Gujarat", "Baroda, Gujarat", "Kalyan-Dombivli, Maharashtra", "Udaipur, Rajasthan",
        "Mangalore, Karnataka", "Kozhikode, Kerala", "Nashik, Maharashtra", "Hubli-Dharwad, Karnataka", "Mysore, Karnataka",
        "Gulbarga, Karnataka", "Belgaum, Karnataka", "Davangere, Karnataka", "Bellary, Karnataka", "Bijapur, Karnataka",
        "Shimoga, Karnataka", "Tumkur, Karnataka", "Raichur, Karnataka", "Bidar, Karnataka", "Hassan, Karnataka",
        "Mandya, Karnataka", "Chitradurga, Karnataka", "Kolar, Karnataka", "Chamrajnagar, Karnataka", "Kodagu, Karnataka",
        "Udupi, Karnataka", "Dakshina Kannada, Karnataka", "Uttara Kannada, Karnataka", "Chikkamagaluru, Karnataka", "Chikkaballapur, Karnataka",
        "Ramanagara, Karnataka", "Bangalore Urban, Karnataka", "Bangalore Rural, Karnataka", "Tumakuru, Karnataka", "Chitradurga, Karnataka",
        "Davangere, Karnataka", "Shivamogga, Karnataka", "Haveri, Karnataka", "Gadag, Karnataka", "Bagalkot, Karnataka",
        "Vijayapura, Karnataka", "Kalaburagi, Karnataka", "Yadgir, Karnataka", "Raichur, Karnataka", "Koppal, Karnataka",
        "Ballari, Karnataka", "Vijayanagara, Karnataka", "Chamarajanagar, Karnataka", "Mysuru, Karnataka", "Mandya, Karnataka",
        "Hassan, Karnataka", "Chikkamagaluru, Karnataka", "Udupi, Karnataka", "Dakshina Kannada, Karnataka", "Uttara Kannada, Karnataka",
        "Chikkaballapur, Karnataka", "Kolar, Karnataka", "Ramanagara, Karnataka", "Bangalore Urban, Karnataka", "Bangalore Rural, Karnataka"
    ]
};

// Get top N cities by income per capita for a country
const getTopCitiesByIncome = (country: string, count: number): string[] => {
    const cities = TOP_CITIES_BY_INCOME[country] || TOP_CITIES_BY_INCOME["United States"];
    if (count === 0) return cities; // All cities
    return cities.slice(0, count);
};

// Top states/provinces by population (ranked highest to lowest)
const TOP_STATES_BY_POPULATION: Record<string, string[]> = {
    "United States": [
        "California", "Texas", "Florida", "New York", "Pennsylvania",
        "Illinois", "Ohio", "Georgia", "North Carolina", "Michigan",
        "New Jersey", "Virginia", "Washington", "Arizona", "Massachusetts",
        "Tennessee", "Indiana", "Missouri", "Maryland", "Wisconsin",
        "Colorado", "Minnesota", "South Carolina", "Alabama", "Louisiana",
        "Kentucky", "Oregon", "Oklahoma", "Connecticut", "Utah",
        "Iowa", "Nevada", "Arkansas", "Mississippi", "Kansas",
        "New Mexico", "Nebraska", "West Virginia", "Idaho", "Hawaii",
        "New Hampshire", "Maine", "Montana", "Rhode Island", "Delaware",
        "South Dakota", "North Dakota", "Alaska", "Vermont", "Wyoming",
        "District of Columbia"
    ],
    "United Kingdom": [
        "England", "Scotland", "Wales", "Northern Ireland"
    ],
    "Canada": [
        "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba",
        "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador",
        "Prince Edward Island", "Northwest Territories", "Yukon", "Nunavut"
    ],
    "Australia": [
        "New South Wales", "Victoria", "Queensland", "Western Australia",
        "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"
    ],
    "Germany": [
        "North Rhine-Westphalia", "Bavaria", "Baden-Württemberg", "Lower Saxony",
        "Hesse", "Saxony", "Rhineland-Palatinate", "Berlin", "Schleswig-Holstein",
        "Brandenburg", "Saxony-Anhalt", "Thuringia", "Hamburg", "Mecklenburg-Vorpommern",
        "Saarland", "Bremen"
    ],
    "France": [
        "Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie",
        "Hauts-de-France", "Grand Est", "Provence-Alpes-Côte d'Azur", "Pays de la Loire",
        "Normandy", "Brittany", "Bourgogne-Franche-Comté", "Centre-Val de Loire",
        "Corsica"
    ],
    "India": [
        "Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Madhya Pradesh",
        "Tamil Nadu", "Rajasthan", "Karnataka", "Gujarat", "Odisha",
        "Kerala", "Jharkhand", "Assam", "Punjab", "Chhattisgarh",
        "Haryana", "Delhi", "Jammu and Kashmir", "Uttarakhand", "Himachal Pradesh",
        "Tripura", "Meghalaya", "Manipur", "Nagaland", "Goa",
        "Arunachal Pradesh", "Mizoram", "Sikkim"
    ]
};

const getTopStatesByPopulation = (country: string, count: number): string[] => {
    const states = TOP_STATES_BY_POPULATION[country] || TOP_STATES_BY_POPULATION["United States"];
    if (count === 0) return states; // All states
    return states.slice(0, count);
};

// Structure Types
type StructureType = 
  | 'skag' 
  | 'stag' 
  | 'mix' 
  | 'stag_plus' 
  | 'intent' 
  | 'alpha_beta' 
  | 'match_type' 
  | 'geo' 
  | 'funnel' 
  | 'brand_split' 
  | 'competitor' 
  | 'ngram';

// Structure Definitions
const STRUCTURE_TYPES = [
  { id: 'skag' as StructureType, name: 'SKAG', icon: Zap, description: 'Single Keyword Ad Group - Maximum relevance' },
  { id: 'stag' as StructureType, name: 'STAG', icon: TrendingUp, description: 'Single Theme Ad Group - Balanced approach' },
  { id: 'mix' as StructureType, name: 'MIX', icon: Layers, description: 'Hybrid Structure - Best of both worlds' },
  { id: 'stag_plus' as StructureType, name: 'STAG+', icon: Brain, description: 'Smart Grouping - ML-powered themes' },
  { id: 'intent' as StructureType, name: 'IBAG', icon: Target, description: 'Intent-Based - High/Research/Brand/Competitor' },
  { id: 'alpha_beta' as StructureType, name: 'Alpha–Beta', icon: Split, description: 'Alpha winners, Beta discovery' },
  { id: 'match_type' as StructureType, name: 'Match-Type Split', icon: Filter, description: 'Broad/Phrase/Exact separation' },
  { id: 'geo' as StructureType, name: 'GEO-Segmented', icon: Map, description: 'Location-based segmentation' },
  { id: 'funnel' as StructureType, name: 'Funnel-Based', icon: Funnel, description: 'TOF/MOF/BOF intent grouping' },
  { id: 'brand_split' as StructureType, name: 'Brand vs Non-Brand', icon: Users, description: 'Brand and non-brand separation' },
  { id: 'competitor' as StructureType, name: 'Competitor Campaigns', icon: TrendingDown, description: 'Competitor brand queries' },
  { id: 'ngram' as StructureType, name: 'Smart Cluster', icon: Network, description: 'N-Gram ML clustering' },
];

// Fill Info Presets for random test data
type FillInfoPreset = {
  seedKeywords: string;
  negativeKeywords: string;
};

const FILL_INFO_PRESETS: FillInfoPreset[] = [
  {
    seedKeywords: 'call airline\nairline number\nairline phone number\ncall united number\nunited airlines phone\nairline customer service',
    negativeKeywords: 'free, cheap, diy, jobs, training, school, courses, salary, wholesale, parts, supplies'
  },
  {
    seedKeywords: 'emergency plumber\nwater heater repair\nslab leak detection\nlicensed plumbing company\nsame day plumber\nplumbing service near me',
    negativeKeywords: 'training, course, manual, parts, supplies, job, free, discount, review, how to, tutorial'
  },
  {
    seedKeywords: 'b2b saas security\nzero trust platform\nmanaged soc service\ncloud compliance audit\nendpoint hardening\ncybersecurity consulting',
    negativeKeywords: 'open source, github, template, internship, career, cheap, free download, wikipedia, student, learning'
  },
  {
    seedKeywords: 'tummy tuck specialist\nmommy makeover surgeon\nbody contouring center\nboard certified plastic surgeon\nliposuction revisions\ncosmetic surgery',
    negativeKeywords: 'before and after, cost, price, cheap, discount, review, reddit, forum, discussion, free consultation'
  },
  {
    seedKeywords: 'enterprise fleet tracking\ngps telematics platform\ndot compliance software\nvehicle camera monitoring\ndriver safety coaching\nfleet management',
    negativeKeywords: 'jobs, salary, complaint, cheap, diy, review, reddit, wiki, map, free trial, open source'
  },
  {
    seedKeywords: 'delta phone number\nunited airlines customer service\namerican airlines contact\nsouthwest airlines phone\njetblue customer service\nspirit airlines number',
    negativeKeywords: 'jobs, careers, hiring, apply, salary, complaint, review, reddit, forum, cheap tickets, discount'
  },
  {
    seedKeywords: 'roofing contractor\nroof repair service\nroof replacement company\nemergency roof repair\ncommercial roofing\nresidential roofing',
    negativeKeywords: 'training, course, manual, parts, supplies, job, free, discount, review, how to, diy, tutorial'
  },
  {
    seedKeywords: 'hvac repair service\nair conditioning repair\nheating system installation\nfurnace repair near me\nac unit replacement\nhvac maintenance',
    negativeKeywords: 'training, course, manual, parts, supplies, job, free, discount, review, how to, diy, tutorial'
  }
];

const pickRandomPreset = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

export const CampaignBuilder2 = ({ initialData }: { initialData?: any }) => {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'builder' | 'saved'>('builder');
  const [savedCampaigns, setSavedCampaigns] = useState<any[]>([]);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Wizard State
  const [step, setStep] = useState(1);
  
  // Initialize component
  useEffect(() => {
    setIsInitialized(true);
  }, []);
  const [structureType, setStructureType] = useState<StructureType | null>(null);
  
  // Generate default campaign name with date and time
  const generateDefaultCampaignName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/:/g, '-');
    return `Search Campaign ${dateStr} ${timeStr}`;
  };

  // Clean keyword - removes quotes, brackets, and match type syntax
  // Google Ads doesn't allow quotes in ad text
  const cleanKeyword = (keyword: string): string => {
    if (!keyword) return 'your service';
    
    let clean = keyword.trim();
    
    // Remove leading/trailing quotes
    if ((clean.startsWith('"') && clean.endsWith('"')) || 
        (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1);
    }
    
    // Remove brackets for exact match [keyword]
    if (clean.startsWith('[') && clean.endsWith(']')) {
      clean = clean.slice(1, -1);
    }
    
    // Remove negative keyword prefix
    if (clean.startsWith('-')) {
      clean = clean.slice(1);
    }
    
    return clean.trim() || 'your service';
  };

  // Clean keyword for DKI syntax - same as cleanKeyword but kept for clarity
  const cleanKeywordForDKI = cleanKeyword;
  
  // Step 1: Setup
  const [campaignName, setCampaignName] = useState(DEFAULT_CAMPAIGN_NAME);
  const [matchTypes, setMatchTypes] = useState({ broad: true, phrase: true, exact: true });
  const [adTypes, setAdTypes] = useState({ rsa: true, dki: true, call: true });
  const [url, setUrl] = useState(DEFAULT_URL);
  const [urlError, setUrlError] = useState<string>('');
  
  // Campaign Intelligence State
  const [userGoal, setUserGoal] = useState<string>('leads');
  const [selectedVertical, setSelectedVertical] = useState<string>('general');
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [landingPageData, setLandingPageData] = useState<LandingPageExtractionResult | null>(null);
  const [isExtractingLandingPage, setIsExtractingLandingPage] = useState(false);
  
  // Step 2: Keywords
  const [seedKeywords, setSeedKeywords] = useState(DEFAULT_SEED_KEYWORDS);
  const [negativeKeywords, setNegativeKeywords] = useState(DEFAULT_NEGATIVE_KEYWORDS);
  const [generatedKeywords, setGeneratedKeywords] = useState<any[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  
  // Step 2 Dynamic State (structure-specific)
  const [intentGroups, setIntentGroups] = useState<{ [key: string]: string[] }>({
    high_intent: [],
    research: [],
    brand: [],
    competitor: []
  });
  const [selectedIntents, setSelectedIntents] = useState<string[]>(['high_intent', 'research', 'brand']);
  const [alphaKeywords, setAlphaKeywords] = useState<string[]>([]);
  const [betaKeywords, setBetaKeywords] = useState<string[]>([]);
  const [funnelGroups, setFunnelGroups] = useState<{ [key: string]: string[] }>({
    tof: [],
    mof: [],
    bof: []
  });
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [nonBrandKeywords, setNonBrandKeywords] = useState<string[]>([]);
  const [competitorKeywords, setCompetitorKeywords] = useState<string[]>([]);
  const [smartClusters, setSmartClusters] = useState<{ [key: string]: string[] }>({});
  
  // Step 3: Ads
  const [ads, setAds] = useState<any[]>([]);
  const [generatedAds, setGeneratedAds] = useState<any[]>([]);
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const ALL_AD_GROUPS_VALUE = 'ALL_AD_GROUPS';
  const [selectedAdGroup, setSelectedAdGroup] = useState(ALL_AD_GROUPS_VALUE);
  const [selectedAdIds, setSelectedAdIds] = useState<number[]>([]);
  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  
  // Step 5: Review - Editing state
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
  const [editingGroupKeywords, setEditingGroupKeywords] = useState<string | null>(null);
  const [editingGroupNegatives, setEditingGroupNegatives] = useState<string | null>(null);
  const [tempGroupName, setTempGroupName] = useState('');
  const [tempKeywords, setTempKeywords] = useState('');
  const [tempNegatives, setTempNegatives] = useState('');
  // Bug_37: Store negative keywords per group
  const [groupNegativeKeywords, setGroupNegativeKeywords] = useState<{ [groupName: string]: string[] }>({});
  // Track which groups have expanded keywords view
  const [expandedKeywords, setExpandedKeywords] = useState<{ [groupName: string]: boolean }>({});
  // Preset ad groups - used when loading from preset
  const [presetAdGroups, setPresetAdGroups] = useState<Array<{ name: string; keywords: string[] }> | null>(null);
  
  // Helper function to apply match type formatting to keywords
  const applyMatchTypeFormatting = (keywords: string[]): string[] => {
    // Apply formatting: 70% phrase, 20% exact, 10% broad
    return keywords.map((kw, idx) => {
      const cleanKw = kw.replace(/^\[|\]$|^"|"$/g, '').trim(); // Remove existing formatting
      const rand = (idx * 37) % 100; // Deterministic pseudo-random
      if (rand < 70) {
        return `"${cleanKw}"`; // Phrase match
      } else if (rand < 90) {
        return `[${cleanKw}]`; // Exact match
      } else {
        return cleanKw; // Broad match
      }
    });
  };
  
  // Helper to get dynamic ad groups based on structure
  const getDynamicAdGroups = useCallback(() => {
    if (!selectedKeywords || selectedKeywords.length === 0) return [];
    if (!structureType) return [];
    
    // Apply match type formatting to all keywords
    const formattedKeywords = applyMatchTypeFormatting(selectedKeywords);
    
    switch (structureType) {
      case 'skag':
        return formattedKeywords.slice(0, 20).map(kw => ({
          name: kw.replace(/^\[|\]$|^"|"$/g, ''), // Use clean name for ad group
          keywords: [kw] // Use formatted keyword
        }));
      case 'stag':
      case 'stag_plus':
      case 'ngram':
        const groupSize = Math.max(3, Math.ceil(formattedKeywords.length / 5));
        const groups = [];
        for (let i = 0; i < formattedKeywords.length; i += groupSize) {
          const groupKeywords = formattedKeywords.slice(i, i + groupSize);
          groups.push({
            name: `Ad Group ${groups.length + 1}`,
            keywords: groupKeywords
          });
        }
        return groups.slice(0, 10);
      case 'intent':
        const intentGroupsList: Array<{ name: string; keywords: string[] }> = [];
        if (selectedIntents.includes('high_intent') && intentGroups.high_intent.length > 0) {
          intentGroupsList.push({ name: 'High Intent', keywords: applyMatchTypeFormatting(intentGroups.high_intent) });
        }
        if (selectedIntents.includes('research') && intentGroups.research.length > 0) {
          intentGroupsList.push({ name: 'Research', keywords: applyMatchTypeFormatting(intentGroups.research) });
        }
        if (selectedIntents.includes('brand') && intentGroups.brand.length > 0) {
          intentGroupsList.push({ name: 'Brand', keywords: applyMatchTypeFormatting(intentGroups.brand) });
        }
        if (selectedIntents.includes('competitor') && intentGroups.competitor.length > 0) {
          intentGroupsList.push({ name: 'Competitor', keywords: applyMatchTypeFormatting(intentGroups.competitor) });
        }
        return intentGroupsList;
      case 'alpha_beta':
        return [
          { name: 'Alpha Winners', keywords: applyMatchTypeFormatting(alphaKeywords) },
          { name: 'Beta Discovery', keywords: applyMatchTypeFormatting(betaKeywords) }
        ].filter(g => g.keywords.length > 0);
      case 'funnel':
        return [
          { name: 'TOF', keywords: applyMatchTypeFormatting(funnelGroups.tof) },
          { name: 'MOF', keywords: applyMatchTypeFormatting(funnelGroups.mof) },
          { name: 'BOF', keywords: applyMatchTypeFormatting(funnelGroups.bof) }
        ].filter(g => g.keywords.length > 0);
      case 'brand_split':
        return [
          { name: 'Brand', keywords: applyMatchTypeFormatting(brandKeywords) },
          { name: 'Non-Brand', keywords: applyMatchTypeFormatting(nonBrandKeywords) }
        ].filter(g => g.keywords.length > 0);
      case 'competitor':
        return competitorKeywords.length > 0 ? [{ name: 'Competitor', keywords: applyMatchTypeFormatting(competitorKeywords) }] : [];
      case 'match_type':
        // For match type structure, explicitly apply each match type
        const broadKeywords = selectedKeywords.map(kw => kw.replace(/^\[|\]$|^"|"$/g, ''));
        const phraseKeywords = selectedKeywords.map(kw => `"${kw.replace(/^\[|\]$|^"|"$/g, '')}"`);
        const exactKeywords = selectedKeywords.map(kw => `[${kw.replace(/^\[|\]$|^"|"$/g, '')}]`);
        return [
          { name: 'Broad Match', keywords: broadKeywords },
          { name: 'Phrase Match', keywords: phraseKeywords },
          { name: 'Exact Match', keywords: exactKeywords }
        ];
      default:
        // Mix or default
        const mixGroups: any[] = [];
        formattedKeywords.slice(0, 5).forEach(kw => {
          mixGroups.push({ 
            name: kw.replace(/^\[|\]$|^"|"$/g, ''), // Clean name
            keywords: [kw] // Formatted keyword
          });
        });
        const remaining = formattedKeywords.slice(5);
        if (remaining.length > 0) {
          const groupSize = Math.max(3, Math.ceil(remaining.length / 3));
          for (let i = 0; i < remaining.length; i += groupSize) {
            const groupKeywords = remaining.slice(i, i + groupSize);
            mixGroups.push({
              name: `Mixed Group ${mixGroups.length - 4}`,
              keywords: groupKeywords
            });
          }
        }
        return mixGroups.slice(0, 10);
    }
  }, [selectedKeywords, structureType, selectedIntents, intentGroups, alphaKeywords, betaKeywords, funnelGroups, brandKeywords, nonBrandKeywords, competitorKeywords]);
  
  // Step 4: Geo Targeting
  const [targetCountry, setTargetCountry] = useState('United States');
  const [targetType, setTargetType] = useState('COUNTRY');
  const [manualGeoInput, setManualGeoInput] = useState('');
  const [manualCityInput, setManualCityInput] = useState('');
  const [manualStateInput, setManualStateInput] = useState('');
  const [zipPreset, setZipPreset] = useState<string | null>(null);
  const [cityPreset, setCityPreset] = useState<string | null>(null);
  const [statePreset, setStatePreset] = useState<string | null>(null);
  const [geoType, setGeoType] = useState('STANDARD');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  
  // Step 5: Review
  const [reviewData, setReviewData] = useState<any>(null);
  
  // Step 6: Validate
  const [validationResults, setValidationResults] = useState<any>(null);

  // Auto-save hook - saves drafts automatically
  const { saveCompleted, clearDraft, currentDraftId } = useAutoSave({
    type: 'builder-2-campaign', // Changed from 'campaign' to 'builder-2-campaign' to match loadSavedCampaigns filter
    name: campaignName,
    data: {
      campaignName,
      structureType,
      step,
      url,
      matchTypes,
      adTypes,
      seedKeywords,
      negativeKeywords,
      selectedKeywords,
      generatedKeywords,
      generatedAds,
      ads,
      intentGroups,
      selectedIntents,
      alphaKeywords,
      betaKeywords,
      funnelGroups,
      brandKeywords,
      nonBrandKeywords,
      competitorKeywords,
      smartClusters,
      targetCountry,
      targetType,
      selectedStates,
      selectedCities,
      selectedZips,
      reviewData,
      validationResults,
      groupNegativeKeywords,
      geoType
    },
    enabled: Boolean(campaignName && (structureType || selectedKeywords.length > 0 || generatedAds.length > 0)),
    delay: 3000, // Save after 3 seconds of inactivity
    onSave: (draftId) => {
      console.log('✅ Draft auto-saved:', draftId);
    }
  });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setCampaignName(initialData.campaignName || initialData.name || generateDefaultCampaignName());
      setStructureType(initialData.structureType || (initialData.structure ? initialData.structure.toLowerCase() : null));
      setUrl(initialData.url || 'https://example.com');
      setMatchTypes(initialData.matchTypes || { broad: true, phrase: true, exact: true });
      setAdTypes(initialData.adTypes || { rsa: true, dki: true, call: true });
      setNegativeKeywords(initialData.negativeKeywords || DEFAULT_NEGATIVE_KEYWORDS);
      setSelectedKeywords(initialData.selectedKeywords || []);
      setGeneratedAds(initialData.generatedAds || []);
      
      // If preset has adGroupsWithKeywords, store them for the review page
      if (initialData.adGroupsWithKeywords && Array.isArray(initialData.adGroupsWithKeywords)) {
        setPresetAdGroups(initialData.adGroupsWithKeywords);
        // Extract all keywords from ad groups and ensure they're in selectedKeywords
        const allPresetKeywords = initialData.adGroupsWithKeywords.flatMap((group: any) => 
          group.keywords || []
        );
        // Merge with existing selectedKeywords, removing duplicates
        const uniqueKeywords = Array.from(new Set([...allPresetKeywords, ...(initialData.selectedKeywords || [])]));
        setSelectedKeywords(uniqueKeywords);
      } else {
        setPresetAdGroups(null);
      }
      
      // Navigate to review page (step 5) if preset data is loaded
      if (initialData.step === 5) {
        setStep(5);
      }
    }
  }, [initialData]);

  // Load saved campaigns on mount
  useEffect(() => {
    loadSavedCampaigns();
  }, []);

  // Note: Auto-save is now handled by the useAutoSave hook above

  // Load saved campaigns
  const loadSavedCampaigns = async () => {
    try {
      const allHistory = await historyService.getAll();
      const campaigns = allHistory.filter((item: any) => item.type === 'builder-2-campaign');
      // Sort by timestamp (newest first)
      campaigns.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setSavedCampaigns(campaigns);
    } catch (error) {
      console.error('Failed to load saved campaigns:', error);
    }
  };

  // Load a saved campaign
  const loadCampaign = (campaign: any) => {
    const data = campaign.data || campaign;
    setCampaignName(data.campaignName || generateDefaultCampaignName());
    setStructureType(data.structureType || null);
    setStep(data.step || 1);
    setUrl(data.url || 'https://example.com');
    setMatchTypes(data.matchTypes || { broad: true, phrase: true, exact: true });
    setAdTypes(data.adTypes || { rsa: true, dki: true, call: true });
    setSeedKeywords(data.seedKeywords || '');
    setNegativeKeywords(data.negativeKeywords || DEFAULT_NEGATIVE_KEYWORDS);
    setSelectedKeywords(data.selectedKeywords || []);
    setGeneratedKeywords(data.generatedKeywords || []);
    setGeneratedAds(data.generatedAds || []);
    setAds(data.ads || []);
    setIntentGroups(data.intentGroups || { high_intent: [], research: [], brand: [], competitor: [] });
    setSelectedIntents(data.selectedIntents || ['high_intent', 'research', 'brand']);
    setAlphaKeywords(data.alphaKeywords || []);
    setBetaKeywords(data.betaKeywords || []);
    setFunnelGroups(data.funnelGroups || { tof: [], mof: [], bof: [] });
    setBrandKeywords(data.brandKeywords || []);
    setNonBrandKeywords(data.nonBrandKeywords || []);
    setCompetitorKeywords(data.competitorKeywords || []);
    setSmartClusters(data.smartClusters || {});
    setTargetCountry(data.targetCountry || 'United States');
    setTargetType(data.targetType || 'ZIP');
    setSelectedStates(data.selectedStates || []);
    setSelectedCities(data.selectedCities || []);
    setSelectedZips(data.selectedZips || []);
    setReviewData(data.reviewData || null);
    setValidationResults(data.validationResults || null);
    setGroupNegativeKeywords(data.groupNegativeKeywords || {});
    setCurrentCampaignId(data.id || campaign.id || null);
    setActiveTab('builder');
    notifications.success('Campaign loaded successfully', {
      title: 'Campaign Loaded'
    });
  };

  // Delete a saved campaign
  const deleteCampaign = async (campaignId: string) => {
    try {
      await historyService.delete(campaignId);
      await loadSavedCampaigns();
      notifications.success('Campaign deleted', {
        title: 'Deleted'
      });
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      notifications.error('Failed to delete campaign', {
        title: 'Error'
      });
    }
  };

  // Step Indicator - Enhanced Design
  const renderStepIndicator = () => (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-2xl py-6 px-6 sm:px-8 mb-8 border-2 border-indigo-100/60 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4 overflow-x-auto pb-2">
        {[
          { num: 1, label: 'Setup', icon: Cog },
          { num: 2, label: 'Keywords', icon: Hash },
          { num: 3, label: 'Ads & Extensions', icon: Megaphone },
          { num: 4, label: 'Geo Target', icon: MapPin },
          { num: 5, label: 'Review', icon: Eye },
          { num: 6, label: 'Validate', icon: ShieldCheck }
        ].map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          
          return (
            <div key={s.num} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold text-base sm:text-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl shadow-indigo-300/50 scale-110 ring-4 ring-indigo-200' 
                    : isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200/50'
                    : 'bg-white text-slate-400 border-2 border-slate-300 shadow-sm'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>
                <span className={`mt-2 text-xs sm:text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'text-indigo-700' 
                    : isCompleted
                    ? 'text-green-700'
                    : 'text-slate-500'
                }`}>
                  {s.label}
                </span>
              </div>
              {idx < 5 && (
                <div className={`w-8 sm:w-16 md:w-20 h-1.5 mx-2 sm:mx-3 rounded-full transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm' 
                    : step === s.num
                    ? 'bg-gradient-to-r from-indigo-300 to-purple-300'
                    : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Step 1: Setup with Structure Selection
  const renderStep1 = () => {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
            <Cog className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Campaign Setup
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose your campaign structure and configure basic settings to get started
          </p>
        </div>

        {/* Campaign Name & URL - Enhanced Design */}
        <Card className="border-2 border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campaign-name" className="text-base font-bold mb-3 block text-indigo-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Campaign Name
              </Label>
              <Input
                id="campaign-name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Summer Sale Campaign 2025"
                className="h-12 text-base border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landing-url" className="text-base font-bold mb-3 block text-indigo-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-600" />
                Landing Page URL
              </Label>
              <div className="relative">
                <Input
                  id="landing-url"
                  value={url}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setUrl(newUrl);
                    // Validate URL format
                    if (newUrl.trim() && !newUrl.match(/^https?:\/\/.+/i)) {
                      setUrlError('Please enter a valid URL starting with http:// or https://');
                    } else {
                      setUrlError('');
                    }
                  }}
                  onBlur={async (e) => {
                    const urlValue = e.target.value.trim();
                    if (urlValue && !urlValue.match(/^https?:\/\/.+/i)) {
                      setUrlError('Please enter a valid URL starting with http:// or https://');
                    } else {
                      setUrlError('');
                      // Extract landing page content on valid URL
                      if (urlValue && urlValue.match(/^https?:\/\/.+/i)) {
                        setIsExtractingLandingPage(true);
                        try {
                          const extracted = await extractLandingPageContent(urlValue);
                          setLandingPageData(extracted);
                          // Re-classify intent if goal is set
                          if (userGoal && selectedVertical) {
                            const landingExtraction: LandingExtraction | null = {
                              domain: extracted.domain,
                              url: urlValue,
                              title: extracted.title || undefined,
                              h1: extracted.h1 || undefined,
                              description: extracted.metaDescription || undefined,
                              services: extracted.services,
                              phones: extracted.phones,
                              emails: extracted.emails,
                              hours: extracted.hours || undefined,
                              addresses: extracted.addresses,
                              structuredData: extracted.schemas,
                              tokens: extracted.page_text_tokens,
                            };
                            const intent = mapGoalToIntent(
                              userGoal,
                              landingExtraction,
                              extracted.phones[0]
                            );
                            setIntentResult(intent);
                          }
                        } catch (error) {
                          console.warn('Landing page extraction failed:', error);
                        } finally {
                          setIsExtractingLandingPage(false);
                        }
                      }
                    }
                  }}
                  placeholder="https://example.com"
                  className={`h-12 text-base border-2 rounded-xl transition-all ${
                    urlError 
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                  }`}
                />
                {isExtractingLandingPage && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                  </div>
                )}
              </div>
              {urlError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {urlError}
                </p>
              )}
              {landingPageData && !urlError && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Extracted: {landingPageData.services.length} services, {landingPageData.phones.length} phone(s)
                </div>
              )}
            </div>
            
            {/* Goal & Vertical Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-goal" className="text-base font-bold mb-3 block text-indigo-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Campaign Goal
                </Label>
                <Select
                  value={userGoal}
                  onValueChange={(value) => {
                    setUserGoal(value);
                    // Classify intent when goal changes
                    if (value && selectedVertical) {
                      const landingExtraction: LandingExtraction | null = landingPageData ? {
                        domain: landingPageData.domain,
                        url: url,
                        title: landingPageData.title || undefined,
                        h1: landingPageData.h1 || undefined,
                        description: landingPageData.metaDescription || undefined,
                        services: landingPageData.services,
                        phones: landingPageData.phones,
                        emails: landingPageData.emails,
                        hours: landingPageData.hours || undefined,
                        addresses: landingPageData.addresses,
                        structuredData: landingPageData.schemas,
                        tokens: landingPageData.page_text_tokens,
                      } : null;
                      
                      const intent = mapGoalToIntent(
                        value,
                        landingExtraction,
                        landingPageData?.phones[0]
                      );
                      setIntentResult(intent);
                    }
                  }}
                >
                  <SelectTrigger className="h-12 text-base border-2 border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select campaign goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calls">Get Phone Calls</SelectItem>
                    <SelectItem value="leads">Generate Leads</SelectItem>
                    <SelectItem value="traffic">Drive Website Traffic</SelectItem>
                    <SelectItem value="purchases">Drive Purchases</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="campaign-vertical" className="text-base font-bold mb-3 block text-indigo-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Industry/Vertical
                </Label>
                <Select
                  value={selectedVertical}
                  onValueChange={(value) => {
                    setSelectedVertical(value);
                    // Re-classify intent when vertical changes
                    if (userGoal && value) {
                      const landingExtraction: LandingExtraction | null = landingPageData ? {
                        domain: landingPageData.domain,
                        url: url,
                        title: landingPageData.title || undefined,
                        h1: landingPageData.h1 || undefined,
                        description: landingPageData.metaDescription || undefined,
                        services: landingPageData.services,
                        phones: landingPageData.phones,
                        emails: landingPageData.emails,
                        hours: landingPageData.hours || undefined,
                        addresses: landingPageData.addresses,
                        structuredData: landingPageData.schemas,
                        tokens: landingPageData.page_text_tokens,
                      } : null;
                      
                      const intent = mapGoalToIntent(
                        userGoal,
                        landingExtraction,
                        landingPageData?.phones[0]
                      );
                      setIntentResult(intent);
                    }
                  }}
                >
                  <SelectTrigger className="h-12 text-base border-2 border-indigo-200 focus:border-indigo-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrician">Electrician</SelectItem>
                    <SelectItem value="plumber">Plumber</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="dentist">Dentist</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="auto_repair">Auto Repair</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Intent Classification Result */}
            {intentResult && (
              <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300">
                        {intentResult.intentLabel}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                        {Math.round(intentResult.confidence * 100)}% confidence
                      </Badge>
                      {intentResult.persona && (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          {intentResult.persona}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Recommended device: <strong>{intentResult.recommendedDevice}</strong>
                    </p>
                    <p className="text-sm text-slate-600">
                      Primary KPIs: {intentResult.primaryKPIs.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Structure Selection - Enhanced Design */}
        <Card className="border-2 border-purple-200/80 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="pb-6 border-b-2 border-purple-100/60">
            <CardTitle className="text-2xl font-bold text-purple-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              Campaign Structure
            </CardTitle>
            <CardDescription className="text-base mt-2 text-purple-700">
              Choose the structure that best fits your campaign strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STRUCTURE_TYPES.map((structure) => {
                const Icon = structure.icon;
                const isSelected = structureType === structure.id;
                
                // Enhanced color schemes with gradients
                const colorSchemes: { [key: string]: { 
                  border: string; 
                  bg: string; 
                  iconBg: string; 
                  iconGradient: string;
                  iconColor: string; 
                  hoverBorder: string;
                  selectedRing: string;
                } } = {
                  skag: { 
                    border: 'border-blue-300', 
                    bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100/50',
                    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    iconGradient: 'from-blue-500 to-cyan-500',
                    iconColor: 'text-blue-700',
                    hoverBorder: 'hover:border-blue-400',
                    selectedRing: 'ring-4 ring-blue-200'
                  },
                  stag: { 
                    border: 'border-emerald-300', 
                    bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50',
                    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
                    iconGradient: 'from-emerald-500 to-teal-500',
                    iconColor: 'text-emerald-700',
                    hoverBorder: 'hover:border-emerald-400',
                    selectedRing: 'ring-4 ring-emerald-200'
                  },
                  mix: { 
                    border: 'border-purple-300', 
                    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100/50',
                    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
                    iconGradient: 'from-purple-500 to-pink-500',
                    iconColor: 'text-purple-700',
                    hoverBorder: 'hover:border-purple-400',
                    selectedRing: 'ring-4 ring-purple-200'
                  },
                  stag_plus: { 
                    border: 'border-amber-300', 
                    bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50',
                    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
                    iconGradient: 'from-amber-500 to-orange-500',
                    iconColor: 'text-amber-700',
                    hoverBorder: 'hover:border-amber-400',
                    selectedRing: 'ring-4 ring-amber-200'
                  },
                  intent: { 
                    border: 'border-rose-300', 
                    bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/50',
                    iconBg: 'bg-gradient-to-br from-rose-500 to-rose-600',
                    iconGradient: 'from-rose-500 to-pink-500',
                    iconColor: 'text-rose-700',
                    hoverBorder: 'hover:border-rose-400',
                    selectedRing: 'ring-4 ring-rose-200'
                  },
                  alpha_beta: { 
                    border: 'border-violet-300', 
                    bg: 'bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100/50',
                    iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
                    iconGradient: 'from-violet-500 to-purple-500',
                    iconColor: 'text-violet-700',
                    hoverBorder: 'hover:border-violet-400',
                    selectedRing: 'ring-4 ring-violet-200'
                  },
                  match_type: { 
                    border: 'border-indigo-300', 
                    bg: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/50',
                    iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
                    iconGradient: 'from-indigo-500 to-blue-500',
                    iconColor: 'text-indigo-700',
                    hoverBorder: 'hover:border-indigo-400',
                    selectedRing: 'ring-4 ring-indigo-200'
                  },
                  geo: { 
                    border: 'border-teal-300', 
                    bg: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100/50',
                    iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
                    iconGradient: 'from-teal-500 to-cyan-500',
                    iconColor: 'text-teal-700',
                    hoverBorder: 'hover:border-teal-400',
                    selectedRing: 'ring-4 ring-teal-200'
                  },
                  funnel: { 
                    border: 'border-cyan-300', 
                    bg: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-100/50',
                    iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
                    iconGradient: 'from-cyan-500 to-sky-500',
                    iconColor: 'text-cyan-700',
                    hoverBorder: 'hover:border-cyan-400',
                    selectedRing: 'ring-4 ring-cyan-200'
                  },
                  brand_split: { 
                    border: 'border-slate-300', 
                    bg: 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100/50',
                    iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
                    iconGradient: 'from-slate-500 to-gray-500',
                    iconColor: 'text-slate-700',
                    hoverBorder: 'hover:border-slate-400',
                    selectedRing: 'ring-4 ring-slate-200'
                  },
                  competitor: { 
                    border: 'border-red-300', 
                    bg: 'bg-gradient-to-br from-red-50 via-rose-50 to-red-100/50',
                    iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
                    iconGradient: 'from-red-500 to-rose-500',
                    iconColor: 'text-red-700',
                    hoverBorder: 'hover:border-red-400',
                    selectedRing: 'ring-4 ring-red-200'
                  },
                  ngram: { 
                    border: 'border-fuchsia-300', 
                    bg: 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-fuchsia-100/50',
                    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
                    iconGradient: 'from-fuchsia-500 to-pink-500',
                    iconColor: 'text-fuchsia-700',
                    hoverBorder: 'hover:border-fuchsia-400',
                    selectedRing: 'ring-4 ring-fuchsia-200'
                  },
                };
                
                const colors = colorSchemes[structure.id] || colorSchemes.skag;
                
                return (
                  <Card
                    key={structure.id}
                    onClick={() => setStructureType(structure.id)}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl ${
                      isSelected 
                        ? `border-2 ${colors.border} ${colors.bg} shadow-xl ${colors.selectedRing} scale-[1.02]` 
                        : `border-2 border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-80 hover:border-slate-300`
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl shadow-lg transition-all duration-300 ${
                          isSelected 
                            ? `${colors.iconBg} text-white scale-110` 
                            : `bg-slate-300 text-slate-500 opacity-50`
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-base mb-1.5 ${isSelected ? colors.iconColor : 'text-slate-500'}`}>
                            {structure.name}
                          </h3>
                          <p className={`text-sm leading-relaxed ${isSelected ? 'text-slate-700' : 'text-slate-400'}`}>
                            {structure.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className={`flex-shrink-0 ${colors.iconColor}`}>
                            <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Match Types - Enhanced Design */}
        <Card className="border-2 border-teal-200/80 bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="pb-6 border-b-2 border-teal-100/60">
            <CardTitle className="text-2xl font-bold text-teal-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              Match Types
            </CardTitle>
            <CardDescription className="text-base mt-2 text-teal-700">
              Select which keyword match types to include in your campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex flex-wrap gap-5">
              <label
                htmlFor="broad"
                onClick={(e) => {
                  e.preventDefault();
                  setMatchTypes(prev => ({ ...prev, broad: !prev.broad }));
                }}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group flex-1 min-w-[180px] ${
                  matchTypes.broad
                    ? 'bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 border-amber-500 shadow-lg scale-105'
                    : 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-amber-300 hover:border-amber-400 hover:shadow-lg hover:scale-105'
                }`}
              >
                <Checkbox
                  id="broad"
                  checked={matchTypes.broad}
                  onCheckedChange={(checked) => {
                    setMatchTypes(prev => ({ ...prev, broad: !!checked }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="border-amber-500 w-6 h-6 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-amber-500 data-[state=checked]:to-orange-600 data-[state=checked]:border-amber-600"
                />
                <span 
                  className={`font-bold text-base transition-colors cursor-pointer ${
                    matchTypes.broad 
                      ? 'text-amber-950' 
                      : 'text-amber-900 group-hover:text-amber-950'
                  }`}
                >
                  Broad Match
                </span>
              </label>
              <label
                htmlFor="phrase"
                onClick={(e) => {
                  e.preventDefault();
                  setMatchTypes(prev => ({ ...prev, phrase: !prev.phrase }));
                }}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group flex-1 min-w-[180px] ${
                  matchTypes.phrase
                    ? 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200 border-blue-500 shadow-lg scale-105'
                    : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 border-blue-300 hover:border-blue-400 hover:shadow-lg hover:scale-105'
                }`}
              >
                <Checkbox
                  id="phrase"
                  checked={matchTypes.phrase}
                  onCheckedChange={(checked) => {
                    setMatchTypes(prev => ({ ...prev, phrase: !!checked }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="border-blue-500 w-6 h-6 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-blue-500 data-[state=checked]:to-cyan-600 data-[state=checked]:border-blue-600"
                />
                <span 
                  className={`font-bold text-base transition-colors cursor-pointer ${
                    matchTypes.phrase 
                      ? 'text-blue-950' 
                      : 'text-blue-900 group-hover:text-blue-950'
                  }`}
                >
                  Phrase Match
                </span>
              </label>
              <label
                htmlFor="exact"
                onClick={(e) => {
                  e.preventDefault();
                  setMatchTypes(prev => ({ ...prev, exact: !prev.exact }));
                }}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group flex-1 min-w-[180px] ${
                  matchTypes.exact
                    ? 'bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200 border-emerald-500 shadow-lg scale-105'
                    : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-emerald-300 hover:border-emerald-400 hover:shadow-lg hover:scale-105'
                }`}
              >
                <Checkbox
                  id="exact"
                  checked={matchTypes.exact}
                  onCheckedChange={(checked) => {
                    setMatchTypes(prev => ({ ...prev, exact: !!checked }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="border-emerald-500 w-6 h-6 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-600 data-[state=checked]:border-emerald-600"
                />
                <span 
                  className={`font-bold text-base transition-colors cursor-pointer ${
                    matchTypes.exact 
                      ? 'text-emerald-950' 
                      : 'text-emerald-900 group-hover:text-emerald-950'
                  }`}
                >
                  Exact Match
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Navigation - Enhanced */}
        <div className="flex justify-end pt-6">
          <Button
            size="lg"
            onClick={() => {
              if (!campaignName) {
                notifications.warning('Please enter a campaign name', { title: 'Campaign Name Required' });
                return;
              }
              if (!structureType) {
                notifications.warning('Please select a campaign structure', { title: 'Structure Required' });
                return;
              }
              if (!url || !url.trim()) {
                notifications.warning('Please enter a landing page URL', { title: 'URL Required' });
                setUrlError('Please enter a landing page URL');
                return;
              }
              if (!url.match(/^https?:\/\/.+/i)) {
                notifications.error('Please enter a valid URL starting with http:// or https://', { title: 'Invalid URL' });
                setUrlError('Please enter a valid URL starting with http:// or https://');
                return;
              }
              setStep(2);
            }}
            className="bg-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-indigo-700 transition-all duration-300 px-8 py-6 text-lg font-bold h-auto"
          >
            Next: Keywords 
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Step Indicator at Bottom */}
        <div className="mt-10">
          {renderStepIndicator()}
        </div>
      </div>
    );
  };

  // Step 2: Keywords (Dynamic based on structure)
  const renderStep2 = () => {
    if (!structureType) {
      return <div>Please select a structure first</div>;
    }

    // Common keyword input section
    const commonKeywordSection = (
      <div className="space-y-6">
        {/* Seed Keywords Card */}
        <Card className="border-2 border-indigo-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-t-lg border-b border-indigo-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                    Seed Keywords
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600">
                    Enter your seed keywords (one per line)
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Randomly select a preset and fill both seed keywords and negative keywords
                  const preset = pickRandomPreset(FILL_INFO_PRESETS);
                  setSeedKeywords(preset.seedKeywords);
                  setNegativeKeywords(preset.negativeKeywords);
                  notifications.success('Random test data filled!', {
                    title: 'Fill Info',
                    description: 'Seed keywords and negative keywords have been populated with random test data.'
                  });
                }}
                className="gap-2 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-400 transition-all shadow-sm"
              >
                <Info className="w-4 h-4" />
                Fill Info
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <Textarea
                value={seedKeywords}
                onChange={(e) => setSeedKeywords(e.target.value)}
                placeholder="Call airline&#10;airline number&#10;call united number"
                rows={6}
                className="font-mono text-sm border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all shadow-sm hover:shadow-md"
              />
              <div className="flex items-start gap-2 p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Each keyword must be at least 3 characters long.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Negative Keywords Card */}
        <Card className="border-2 border-red-200/80 bg-gradient-to-br from-white via-red-50/20 to-orange-50/20 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4 bg-gradient-to-r from-red-50/50 to-orange-50/50 rounded-t-lg border-b border-red-100/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-2xl shadow-lg">
                <MinusCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent">
                  Negative Keywords
                </CardTitle>
                <CardDescription className="text-sm mt-1.5 text-slate-600">
                  Exclude keywords containing these terms
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Input
                value={negativeKeywords}
                onChange={(e) => setNegativeKeywords(e.target.value)}
                placeholder="cheap, discount, reviews, job, free..."
                className="font-mono text-sm border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-xl h-12 transition-all shadow-sm hover:shadow-md"
              />
              <div className="flex items-start gap-2 p-3 bg-red-50/50 border border-red-200/50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  Keywords containing these terms will be excluded. Separate with commas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="pt-2">
          <Button
            onClick={async () => {
                if (!seedKeywords.trim()) {
                  notifications.warning('Please enter seed keywords', { title: 'Seed Keywords Required' });
                  return;
                }

                // Bug_44: Validate minimum character length for keywords
                const seedList = seedKeywords.split('\n').filter(k => k.trim());
                const MIN_KEYWORD_LENGTH = 3;
                const invalidKeywords = seedList.filter(k => k.trim().length < MIN_KEYWORD_LENGTH);
                
                if (invalidKeywords.length > 0) {
                  notifications.error(
                    `Each keyword must be at least ${MIN_KEYWORD_LENGTH} characters long. Please check: ${invalidKeywords.slice(0, 3).join(', ')}${invalidKeywords.length > 3 ? '...' : ''}`,
                    { 
                      title: 'Invalid Keywords',
                      description: `Keywords must be at least ${MIN_KEYWORD_LENGTH} characters long.`
                    }
                  );
                  return;
                }

                setIsGeneratingKeywords(true);
                let loadingToastId: number | string | undefined;
                
                // Dismiss any existing toasts first to prevent stacking
                // Use notifications utility to dismiss all toasts
                try {
                  notifications.dismiss('all');
                } catch (e) {
                  console.log('Could not dismiss existing toasts:', e);
                }
                
                try {
                  loadingToastId = notifications.loading('Generating keywords...', {
                    title: 'Keyword Generation',
                    description: 'This may take a few moments. Please wait...',
                  });
                } catch (e) {
                  console.log('Could not show loading toast:', e);
                }

                // Use setTimeout to make generation async and allow UI updates
                setTimeout(async () => {
                  try {
                    // Use shared keyword generation utility
                    console.log("Using shared keyword generation utility");
                    
                    // Validate seed keywords
                    if (!seedKeywords || !seedKeywords.trim()) {
                      throw new Error('Seed keywords are required');
                    }
                    
                    // Calculate dynamic keyword range: 410-630 keywords
                    const seedList = seedKeywords.trim().split('\n').filter(k => k.trim());
                    // Target: 410-630 keywords based on seed count
                    // More seeds = more keywords, but always in the 410-630 range
                    const seedCount = Math.max(1, seedList.length);
                    const targetMin = 410;
                    const targetMax = 630;
                    // Scale slightly based on seed count, but keep in range
                    const baseMin = Math.min(targetMax, targetMin + (seedCount * 10));
                    const dynamicMinKeywords = Math.max(targetMin, Math.min(targetMax - 20, baseMin));
                    
                    const keywordsWithBids = generateKeywordsUtil({
                      seedKeywords: seedKeywords.trim(),
                      negativeKeywords: negativeKeywords || '',
                      vertical: selectedVertical || 'default',
                      intentResult,
                      landingPageData,
                      maxKeywords: targetMax, // 630 maximum
                      minKeywords: dynamicMinKeywords // 410-610 range
                    });
                    
                    // Validate that keywords were generated
                    if (!keywordsWithBids || !Array.isArray(keywordsWithBids) || keywordsWithBids.length === 0) {
                      throw new Error('No keywords generated');
                    }

                    // Keywords already have bid suggestions from the shared utility
                    setGeneratedKeywords(keywordsWithBids);
                    
                    // Auto-select all generated keywords by default
                    const allKeywordIds = keywordsWithBids.map(k => k.text || k.id);
                    setSelectedKeywords(allKeywordIds);
                    
                    // Extract keyword texts for structure-specific grouping
                    const keywordTexts = keywordsWithBids.map(k => k.text || k.id);
                    
                    // Populate structure-specific groups
                    if (structureType === 'intent') {
                      // Classify keywords by intent using AI-generated keywords
                      const highIntent = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return lower.includes('call') || lower.includes('buy') || lower.includes('get') || 
                               lower.includes('purchase') || lower.includes('order') || lower.includes('now');
                      });
                      const research = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return lower.includes('info') || lower.includes('compare') || lower.includes('best') ||
                               lower.includes('review') || lower.includes('guide') || lower.includes('how');
                      });
                      const brand = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return lower.includes('your') || lower.includes('company') || lower.includes('brand') ||
                               lower.includes('official');
                      });
                      const competitor = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return ['nextiva', 'hubspot', 'clickcease', 'semrush', 'competitor', 'alternative'].some(c => lower.includes(c));
                      });
                      setIntentGroups({ 
                        high_intent: highIntent, 
                        research, 
                        brand, 
                        competitor 
                      });
                      // Auto-select all intent groups that have keywords
                      const groupsWithKeywords = [];
                      if (highIntent.length > 0) groupsWithKeywords.push('high_intent');
                      if (research.length > 0) groupsWithKeywords.push('research');
                      if (brand.length > 0) groupsWithKeywords.push('brand');
                      if (competitor.length > 0) groupsWithKeywords.push('competitor');
                      if (groupsWithKeywords.length > 0) {
                        setSelectedIntents(groupsWithKeywords);
                      }
                    } else if (structureType === 'alpha_beta') {
                      // Split into beta (all keywords initially)
                      setBetaKeywords(keywordTexts);
                      setAlphaKeywords([]);
                    } else if (structureType === 'funnel') {
                      // Classify by funnel stage
                      const tof = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return lower.includes('what') || lower.includes('how') || lower.includes('info') ||
                               lower.includes('guide') || lower.includes('learn');
                      });
                      const mof = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return lower.includes('compare') || lower.includes('best') || lower.includes('review') ||
                               lower.includes('vs') || lower.includes('alternative');
                      });
                      const bof = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return lower.includes('buy') || lower.includes('call') || lower.includes('get') ||
                               lower.includes('purchase') || lower.includes('order');
                      });
                      setFunnelGroups({ tof, mof, bof });
                    } else if (structureType === 'brand_split') {
                      // Detect brand keywords
                      const brand = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return lower.includes('your') || lower.includes('company') || lower.includes('brand') ||
                               lower.includes('official');
                      });
                      const nonBrand = keywordTexts.filter(k => !brand.includes(k));
                      setBrandKeywords(brand);
                      setNonBrandKeywords(nonBrand);
                    } else if (structureType === 'competitor') {
                      // Detect competitor keywords
                      const competitors = keywordTexts.filter(k => {
                        const lower = k.toLowerCase();
                        return ['nextiva', 'hubspot', 'clickcease', 'semrush', 'competitor', 'alternative'].some(c => lower.includes(c));
                      });
                      setCompetitorKeywords(competitors);
                    } else if (structureType === 'stag_plus' || structureType === 'ngram') {
                      // Smart clustering - group by common words
                      const clusters: { [key: string]: string[] } = {};
                      keywordTexts.forEach(kw => {
                        const words = kw.toLowerCase().split(' ');
                        const clusterKey = words[0] || 'other';
                        if (!clusters[clusterKey]) {
                          clusters[clusterKey] = [];
                        }
                        clusters[clusterKey].push(kw);
                      });
                      setSmartClusters(clusters);
                    }
                    
                    // Dismiss loading toast and wait a bit before showing success
                    if (loadingToastId) {
                      try {
                        notifications.dismiss(loadingToastId);
                        // Small delay to ensure loading toast is fully dismissed
                        await new Promise(resolve => setTimeout(resolve, 100));
                      } catch (e) {
                        console.log('Could not dismiss loading toast:', e);
                      }
                    }
                    
                    // Clear loading state before showing success
                    setIsGeneratingKeywords(false);
                    
                    notifications.success(`Generated ${keywordsWithBids.length} keywords successfully`, {
                      title: 'Keywords Generated',
                      description: `Found ${keywordsWithBids.length} keyword suggestions. Review and select the ones you want to use.`,
                    });
                  } catch (error) {
                    console.log('ℹ️ Error during keyword generation - using fallback', error);
                    
                    // Final fallback: Basic mock keywords
                    const seedList = seedKeywords.split('\n').filter(k => k.trim());
                    const mockKeywords = seedList.map((k, i) => ({
                      id: `kw-${i}`,
                      text: k.trim(),
                      volume: 'High',
                      cpc: '$2.50',
                      type: 'Seed'
                    }));
                    
                    setGeneratedKeywords(mockKeywords);
                    
                    // Auto-select all generated keywords by default
                    const allMockKeywordIds = mockKeywords.map(k => k.text || k.id);
                    setSelectedKeywords(allMockKeywordIds);
                    
                    // Dismiss loading toast and wait a bit before showing error notification
                    if (loadingToastId) {
                      try {
                        notifications.dismiss(loadingToastId);
                        // Small delay to ensure loading toast is fully dismissed
                        await new Promise(resolve => setTimeout(resolve, 100));
                      } catch (e) {
                        console.log('Could not dismiss loading toast:', e);
                      }
                    }
                    
                    // Clear loading state before showing error notification
                    setIsGeneratingKeywords(false);
                    
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    if (errorMessage.includes('timeout')) {
                      notifications.warning(`Generated ${mockKeywords.length} keywords using local generation (API timed out)`, {
                        title: 'Keywords Generated (Timeout)',
                        description: 'API call timed out. Using local generation.',
                      });
                    } else {
                      notifications.info(`Generated ${mockKeywords.length} keywords using local generation`, {
                        title: 'Keywords Generated (Offline Mode)',
                        description: 'Using local generation. Some features may be limited.',
                      });
                    }
                  } finally {
                    // Always clear loading state as a safety net
                    setIsGeneratingKeywords(false);
                    
                    // Ensure loading toast is dismissed
                    if (loadingToastId) {
                      try {
                        notifications.dismiss(loadingToastId);
                      } catch (e) {
                        console.log('Could not dismiss loading toast in finally:', e);
                      }
                    }
                  }
                }, 0);
              }}
              disabled={!seedKeywords.trim() || isGeneratingKeywords}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 py-6 text-base font-semibold"
            >
              {isGeneratingKeywords ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin"/> Generating Keywords...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2"/> Generate Keywords</>
              )}
            </Button>
          </div>
          
          {/* Display Generated Keywords */}
          {generatedKeywords.length > 0 && (
            <Card className="border-indigo-200/60 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 backdrop-blur-xl shadow-2xl mt-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-indigo-900">Generated Keywords</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {generatedKeywords.length} keywords found • Select keywords to include in your campaign
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-200/50">
                  <Label 
                    htmlFor="select-all-keywords"
                    className="flex items-center gap-2 cursor-pointer font-semibold text-indigo-900"
                    onClick={(e) => {
                      // Prevent double-toggling when clicking directly on checkbox
                      if ((e.target as HTMLElement).closest('[data-slot="checkbox"]')) {
                        return;
                      }
                    }}
                  >
                    <Checkbox
                      id="select-all-keywords"
                      checked={generatedKeywords.length > 0 && selectedKeywords.length === generatedKeywords.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const allKeywords = generatedKeywords.map(k => k.text || k.id);
                          setSelectedKeywords(allKeywords);
                        } else {
                          setSelectedKeywords([]);
                        }
                      }}
                      className="h-5 w-5 border-indigo-400"
                    />
                    <span>Select All</span>
                  </Label>
                  <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 font-semibold">
                    {selectedKeywords.length} selected
                  </Badge>
                </div>
                <ScrollArea className="h-[400px] border-2 border-indigo-200/50 rounded-xl bg-white/50">
                    <div className="p-3 space-y-1">
                      {generatedKeywords.map((keyword) => {
                        const keywordText = keyword.text || keyword.id;
                        const keywordId = `keyword-${keyword.id || keywordText}`;
                        const isSelected = selectedKeywords.includes(keywordText);
                        const volumeColor = keyword.volume === 'High' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                          keyword.volume === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                          'bg-slate-100 text-slate-700 border-slate-300';
                        return (
                          <Label
                            key={keyword.id || keywordText}
                            htmlFor={keywordId}
                            onClick={(e) => {
                              // Prevent double-toggling when clicking directly on checkbox
                              if ((e.target as HTMLElement).closest('[data-slot="checkbox"]')) {
                                return;
                              }
                              // Toggle selection when clicking on label
                              setSelectedKeywords(prev => {
                                if (isSelected) {
                                  return prev.filter(k => k !== keywordText);
                                } else {
                                  return prev.includes(keywordText) ? prev : [...prev, keywordText];
                                }
                              });
                            }}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 shadow-sm' 
                                : 'hover:bg-slate-50 border-2 border-transparent hover:border-indigo-100'
                            }`}
                          >
                            <Checkbox
                              id={keywordId}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                setSelectedKeywords(prev => {
                                  if (checked) {
                                    return prev.includes(keywordText) ? prev : [...prev, keywordText];
                                  } else {
                                    return prev.filter(k => k !== keywordText);
                                  }
                                });
                              }}
                              className="h-4 w-4 flex-shrink-0 border-indigo-400"
                            />
                            <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {keywordText}
                            </span>
                            {keyword.suggestedBid && intentResult && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge className="bg-green-100 text-green-700 border-green-300 text-xs px-2 py-0.5 font-semibold">
                                  {keyword.suggestedBid}
                                </Badge>
                                <span className="text-xs text-slate-500" title={keyword.bidReason}>
                                  💡
                                </span>
                              </div>
                            )}
                            {keyword.volume && (
                              <Badge className={`text-xs px-2 py-0.5 font-semibold border ${volumeColor} flex-shrink-0`}>
                                {keyword.volume}
                              </Badge>
                            )}
                          </Label>
                        );
                      })}
                    </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );

    // Structure-specific UI
    const renderStructureSpecificUI = () => {
      switch (structureType) {
        case 'skag':
        case 'stag':
        case 'mix':
          // Standard keyword selection - no additional UI needed, keywords are shown in commonKeywordSection
          return null;

        case 'stag_plus':
          // Smart Grouping
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Smart Groups</CardTitle>
                <CardDescription>AI-powered keyword clustering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(smartClusters).length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-slate-500">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>Generate keywords to see smart clusters</p>
                    </div>
                  ) : (
                    Object.entries(smartClusters).map(([clusterName, keywords]) => (
                      <div key={clusterName} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-800 mb-2">{clusterName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((kw, idx) => (
                            <Badge key={idx} variant="secondary">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );

        case 'intent':
          // Intent-Based Groups
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Intent Groups</CardTitle>
                <CardDescription>Select which intent groups to include</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'high_intent', label: 'High Intent', color: 'green' },
                    { id: 'research', label: 'Research', color: 'blue' },
                    { id: 'brand', label: 'Brand', color: 'purple' },
                    { id: 'competitor', label: 'Competitor', color: 'red' }
                  ].map((intent) => {
                    const intentKeywords = intentGroups[intent.id] || [];
                    const selectedIntentKeywords = intentKeywords.filter(kw => selectedKeywords.includes(kw));
                    return (
                      <div key={intent.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedIntents.includes(intent.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedIntents([...selectedIntents, intent.id]);
                                  // Auto-select all keywords in this intent group
                                  const newSelected = [...selectedKeywords];
                                  intentKeywords.forEach(kw => {
                                    if (!newSelected.includes(kw)) {
                                      newSelected.push(kw);
                                    }
                                  });
                                  setSelectedKeywords(newSelected);
                                } else {
                                  setSelectedIntents(selectedIntents.filter(i => i !== intent.id));
                                  // Remove keywords from this intent group
                                  setSelectedKeywords(selectedKeywords.filter(kw => !intentKeywords.includes(kw)));
                                }
                              }}
                            />
                            <Label className="font-semibold">{intent.label}</Label>
                          </div>
                          <Badge variant="outline">{intentKeywords.length} keywords ({selectedIntentKeywords.length} selected)</Badge>
                        </div>
                        {selectedIntents.includes(intent.id) && intentKeywords.length > 0 && (
                          <div className="mt-3">
                            <ScrollArea className="h-32 border border-slate-200 rounded-lg p-2">
                              <div className="flex flex-wrap gap-2">
                                {intentKeywords.map((kw, idx) => {
                                  const isSelected = selectedKeywords.includes(kw);
                                  return (
                                    <Badge
                                      key={idx}
                                      variant={isSelected ? "default" : "secondary"}
                                      className={`cursor-pointer ${isSelected ? 'bg-indigo-600' : ''}`}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
                                        } else {
                                          setSelectedKeywords([...selectedKeywords, kw]);
                                        }
                                      }}
                                    >
                                      {kw}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );

        case 'alpha_beta':
          // Alpha-Beta Split
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Alpha-Beta Split</CardTitle>
                <CardDescription>Beta discovery and Alpha winners</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="beta" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="beta">Beta Discovery</TabsTrigger>
                    <TabsTrigger value="alpha">Alpha Winners</TabsTrigger>
                  </TabsList>
                  <TabsContent value="beta" className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {betaKeywords.length === 0 ? (
                        <p className="text-slate-500">Generate keywords to populate Beta</p>
                      ) : (
                        betaKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="alpha" className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {alphaKeywords.length === 0 ? (
                        <p className="text-slate-500">Promote winners from Beta to Alpha</p>
                      ) : (
                        alphaKeywords.map((kw, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-700">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );

        case 'match_type':
          // Match Type Split
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Match Type Split</CardTitle>
                <CardDescription>Keywords duplicated by match type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['broad', 'phrase', 'exact'].map((matchType) => (
                    <div key={matchType} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-semibold capitalize">{matchType} Match</Label>
                        <Badge variant="outline">{selectedKeywords.length} keywords</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedKeywords.slice(0, 10).map((kw, idx) => (
                          <Badge key={idx} variant="secondary">
                            {matchType === 'broad' ? kw : matchType === 'phrase' ? `"${kw}"` : `[${kw}]`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );

        case 'funnel':
          // Funnel-Based
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Funnel Groups</CardTitle>
                <CardDescription>TOF/MOF/BOF intent grouping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'tof', label: 'Top of Funnel (TOF)', color: 'blue' },
                    { id: 'mof', label: 'Middle of Funnel (MOF)', color: 'purple' },
                    { id: 'bof', label: 'Bottom of Funnel (BOF)', color: 'green' }
                  ].map((funnel) => (
                    <div key={funnel.id} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-800 mb-2">{funnel.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {funnelGroups[funnel.id]?.length === 0 ? (
                          <p className="text-slate-500 text-sm">Generate keywords to populate</p>
                        ) : (
                          funnelGroups[funnel.id]?.slice(0, 10).map((kw, idx) => (
                            <Badge key={idx} variant="secondary">{kw}</Badge>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );

        case 'brand_split':
          // Brand vs Non-Brand
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Brand vs Non-Brand</CardTitle>
                <CardDescription>Automatic brand detection and separation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Brand Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {brandKeywords.length === 0 ? (
                        <p className="text-slate-500 text-sm">No brand keywords detected</p>
                      ) : (
                        brandKeywords.map((kw, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-700">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Non-Brand Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {nonBrandKeywords.length === 0 ? (
                        <p className="text-slate-500 text-sm">Generate keywords to populate</p>
                      ) : (
                        nonBrandKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary">{kw}</Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );

        case 'competitor':
          // Competitor Campaigns
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Competitor Keywords</CardTitle>
                <CardDescription>Detected competitor brand queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {competitorKeywords.length === 0 ? (
                    <p className="text-slate-500">No competitor keywords detected. Generate keywords to detect competitors.</p>
                  ) : (
                    competitorKeywords.map((kw, idx) => (
                      <Badge key={idx} className="bg-red-100 text-red-700">{kw}</Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );

        case 'ngram':
          // N-Gram Smart Cluster
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Smart Clusters</CardTitle>
                <CardDescription>ML-powered N-gram clustering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(smartClusters).length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-slate-500">
                      <Network className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p>Generate keywords to see smart clusters</p>
                    </div>
                  ) : (
                    Object.entries(smartClusters).map(([clusterName, keywords]) => (
                      <div key={clusterName} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-800 mb-2">{clusterName}</h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((kw, idx) => (
                            <Badge key={idx} variant="secondary">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );

        default:
          return null;
      }
    };

    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
            <Hash className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Keyword Generator
          </h2>
          <p className="text-slate-600 text-sm">
            Generate and organize keywords based on your structure: <span className="font-semibold text-indigo-700">{STRUCTURE_TYPES.find(s => s.id === structureType)?.name}</span>
          </p>
        </div>

        {commonKeywordSection}
        {renderStructureSpecificUI()}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(1)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => {
              if (selectedKeywords.length === 0) {
                notifications.error('Please generate and select at least one keyword', { 
                  title: 'Keywords Required',
                  description: 'You must select keywords in Step 2 before proceeding to the next step.'
                });
                return;
              }
              setStep(3);
            }}
            disabled={selectedKeywords.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Ads & Extensions <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Step Indicator at Bottom */}
        <div className="mt-10">
          {renderStepIndicator()}
        </div>
      </div>
    );
  };

  // Step 3: Ads & Extensions (Structure-based templates)
  // Helper: Clean keyword and convert to title case
  const cleanAndTitleCaseKeyword = (keyword: string): string => {
    let clean = keyword.trim();
    // Remove quotes
    if ((clean.startsWith('"') && clean.endsWith('"')) || 
        (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1);
    }
    // Remove brackets for exact match
    if (clean.startsWith('[') && clean.endsWith(']')) {
      clean = clean.slice(1, -1);
    }
    // Remove negative prefix
    if (clean.startsWith('-')) {
      clean = clean.slice(1);
    }
    // Convert to title case
    return clean.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Helper function to convert RSA to GeneratedAd format
  const convertRSAToGeneratedAd = (rsa: ResponsiveSearchAd, groupName: string, baseUrl: string): any => {
    if (!rsa || !rsa.headlines || !Array.isArray(rsa.headlines)) {
      return {
        id: Date.now(),
        type: 'rsa',
        headline1: 'Get Started Today',
        headline2: 'Quality Service',
        headline3: 'Trusted Provider',
        headline4: '',
        headline5: '',
        description1: 'Experience the best service with our trusted team.',
        description2: 'Contact us now for more information.',
        path1: '',
        path2: '',
        finalUrl: baseUrl || url || 'https://www.example.com',
        adGroup: groupName
      };
    }
    
    return {
      id: Date.now() + Math.random(),
      type: 'rsa',
      headline1: rsa.headlines[0] || '',
      headline2: rsa.headlines[1] || '',
      headline3: rsa.headlines[2] || '',
      headline4: rsa.headlines[3] || '',
      headline5: rsa.headlines[4] || '',
      headline6: rsa.headlines[5] || '',
      headline7: rsa.headlines[6] || '',
      headline8: rsa.headlines[7] || '',
      headline9: rsa.headlines[8] || '',
      headline10: rsa.headlines[9] || '',
      headline11: rsa.headlines[10] || '',
      headline12: rsa.headlines[11] || '',
      headline13: rsa.headlines[12] || '',
      headline14: rsa.headlines[13] || '',
      headline15: rsa.headlines[14] || '',
      description1: (rsa.descriptions && rsa.descriptions[0]) || '',
      description2: (rsa.descriptions && rsa.descriptions[1]) || '',
      description3: (rsa.descriptions && rsa.descriptions[2]) || '',
      description4: (rsa.descriptions && rsa.descriptions[3]) || '',
      path1: (rsa.displayPath && rsa.displayPath[0]) || '',
      path2: (rsa.displayPath && rsa.displayPath[1]) || '',
      finalUrl: rsa.finalUrl || baseUrl || url || 'https://www.example.com',
      adGroup: groupName
    };
  };

  // Helper to convert RSA to DKI format
  const convertRSAToDKI = (rsa: ResponsiveSearchAd, groupName: string, baseUrl: string, keyword: string): any => {
    if (!rsa || !rsa.headlines || !Array.isArray(rsa.headlines)) {
      const mainKeyword = cleanAndTitleCaseKeyword(keyword);
      return {
        id: Date.now() + Math.random(),
        type: 'dki',
        headline1: `{KeyWord:${mainKeyword}} - Official Site`,
        headline2: `Buy {KeyWord:${mainKeyword}} Online`,
        headline3: `Trusted {KeyWord:${mainKeyword}} Service`,
        headline4: '',
        headline5: '',
        description1: `Find the best {KeyWord:${mainKeyword}}. Fast & reliable support.`,
        description2: 'Contact our experts for 24/7 assistance.',
        path1: '',
        path2: '',
        finalUrl: baseUrl || url || 'https://www.example.com',
        adGroup: groupName
      };
    }
    
    const mainKeyword = cleanAndTitleCaseKeyword(keyword);
    const keywordLower = keyword.toLowerCase();
    
    const dkiHeadlines = (rsa.headlines || []).slice(0, 5).map(h => {
      if (!h) return '';
      const headlineLower = h.toLowerCase();
      if (headlineLower.includes(keywordLower)) {
        const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return h.replace(regex, `{KeyWord:${mainKeyword}}`).substring(0, 30);
      } else {
        return `{KeyWord:${mainKeyword}} - ${h}`.substring(0, 30);
      }
    });
    
    const dkiDescriptions = (rsa.descriptions || []).slice(0, 2).map(d => {
      if (!d) return '';
      const descLower = d.toLowerCase();
      if (descLower.includes(keywordLower)) {
        const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return d.replace(regex, `{KeyWord:${mainKeyword}}`).substring(0, 90);
      } else {
        return d.substring(0, 90);
      }
    });
    
    return {
      id: Date.now() + Math.random(),
      type: 'dki',
      headline1: dkiHeadlines[0] || '',
      headline2: dkiHeadlines[1] || '',
      headline3: dkiHeadlines[2] || '',
      headline4: dkiHeadlines[3] || '',
      headline5: dkiHeadlines[4] || '',
      description1: dkiDescriptions[0] || '',
      description2: dkiDescriptions[1] || '',
      path1: (rsa.displayPath && rsa.displayPath[0]) || '',
      path2: (rsa.displayPath && rsa.displayPath[1]) || '',
      finalUrl: rsa.finalUrl || baseUrl || url || 'https://www.example.com',
      adGroup: groupName
    };
  };

  // Generate fallback RSA ad
  const generateFallbackRSA = (groupName: string, keywords: string[], index: number, baseUrl: string): any => {
    try {
      const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
      const intent = detectUserIntent([selectedKeyword], 'Services');
      const industry = intent === 'product' ? 'Products' : 'Services';
      
      const input: AdGenerationInput = {
        keywords: [selectedKeyword],
        industry: industry,
        businessName: campaignName || 'Your Business',
        baseUrl: baseUrl || url,
        adType: 'RSA',
        filters: {
          matchType: 'phrase',
          campaignStructure: 'STAG',
        }
      };
      
      const generatedAd = generateAdsUtility(input) as ResponsiveSearchAd;
      if (!generatedAd || !generatedAd.headlines || !Array.isArray(generatedAd.headlines)) {
        return convertRSAToGeneratedAd({ headlines: [], descriptions: [], displayPath: [], finalUrl: baseUrl || url }, groupName, baseUrl || url);
      }
      return convertRSAToGeneratedAd(generatedAd, groupName, baseUrl || url);
    } catch (error) {
      console.error('Error in generateFallbackRSA:', error);
      return convertRSAToGeneratedAd({ headlines: [], descriptions: [], displayPath: [], finalUrl: baseUrl || url }, groupName, baseUrl || url);
    }
  };

  // Generate fallback DKI ad
  const generateFallbackDKI = (groupName: string, keywords: string[], index: number, baseUrl: string): any => {
    try {
      const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
      const intent = detectUserIntent([selectedKeyword], 'Services');
      const industry = intent === 'product' ? 'Products' : 'Services';
      
      const input: AdGenerationInput = {
        keywords: [selectedKeyword],
        industry: industry,
        businessName: campaignName || 'Your Business',
        baseUrl: baseUrl || url,
        adType: 'RSA',
        filters: {
          matchType: 'phrase',
          campaignStructure: 'STAG',
        }
      };
      
      const generatedAd = generateAdsUtility(input) as ResponsiveSearchAd;
      if (!generatedAd || !generatedAd.headlines || !Array.isArray(generatedAd.headlines)) {
        const mainKeyword = cleanAndTitleCaseKeyword(selectedKeyword);
        return {
          id: Date.now() + Math.random(),
          type: 'dki',
          headline1: `{KeyWord:${mainKeyword}} - Official Site`,
          headline2: `Buy {KeyWord:${mainKeyword}} Online`,
          headline3: `Trusted {KeyWord:${mainKeyword}} Service`,
          headline4: '',
          headline5: '',
          description1: `Find the best {KeyWord:${mainKeyword}}. Fast & reliable support.`,
          description2: 'Contact our experts for 24/7 assistance.',
          path1: '',
          path2: '',
          finalUrl: baseUrl || url || 'https://www.example.com',
          adGroup: groupName
        };
      }
      return convertRSAToDKI(generatedAd, groupName, baseUrl || url, selectedKeyword);
    } catch (error) {
      console.error('Error in generateFallbackDKI:', error);
      const mainKeyword = cleanAndTitleCaseKeyword(keywords[0] || 'Product');
      return {
        id: Date.now() + Math.random(),
        type: 'dki',
        headline1: `{KeyWord:${mainKeyword}} - Official Site`,
        headline2: `Buy {KeyWord:${mainKeyword}} Online`,
        headline3: `Trusted {KeyWord:${mainKeyword}} Service`,
        headline4: '',
        headline5: '',
        description1: `Find the best {KeyWord:${mainKeyword}}. Fast & reliable support.`,
        description2: 'Contact our experts for 24/7 assistance.',
        path1: '',
        path2: '',
        finalUrl: baseUrl || url || 'https://www.example.com',
        adGroup: groupName
      };
    }
  };

  // Generate fallback Call-Only ad
  const generateFallbackCallOnly = (groupName: string, keywords: string[], index: number, baseUrl: string): any => {
    try {
      const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
      const intent = detectUserIntent([selectedKeyword], 'Services');
      const industry = intent === 'product' ? 'Products' : 'Services';
      
      const input: AdGenerationInput = {
        keywords: [selectedKeyword],
        industry: industry,
        businessName: campaignName || 'Your Business',
        baseUrl: baseUrl || url,
        adType: 'CALL_ONLY',
        filters: {
          matchType: 'phrase',
          campaignStructure: 'STAG',
        }
      };
      
      const generatedAd = generateAdsUtility(input) as CallOnlyAd;
      return {
        id: Date.now() + Math.random(),
        type: 'callonly',
        headline1: generatedAd.headline1 || '',
        headline2: generatedAd.headline2 || '',
        description1: generatedAd.description1 || '',
        description2: generatedAd.description2 || '',
        phoneNumber: generatedAd.phoneNumber || landingPageData?.phones[0] || '+1-800-123-4567',
        businessName: generatedAd.businessName || campaignName || 'Your Business',
        finalUrl: generatedAd.verificationUrl || baseUrl || url || 'https://www.example.com',
        path1: (generatedAd.displayPath && generatedAd.displayPath[0]) || '',
        path2: (generatedAd.displayPath && generatedAd.displayPath[1]) || '',
        adGroup: groupName
      };
    } catch (error) {
      console.error('Error in generateFallbackCallOnly:', error);
      return {
        id: Date.now() + Math.random(),
        type: 'callonly',
        headline1: 'Call Us Today',
        headline2: 'Expert Service Available',
        description1: 'Get immediate assistance from our team.',
        description2: 'Available 24/7 for your convenience.',
        phoneNumber: landingPageData?.phones[0] || '+1-800-123-4567',
        businessName: campaignName || 'Your Business',
        finalUrl: baseUrl || url || 'https://www.example.com',
        path1: '',
        path2: '',
        adGroup: groupName
      };
    }
  };

  // Generate ads based on structure using AI-powered generation
  const generateAdsForStructure = useCallback(async () => {
    if (!structureType || selectedKeywords.length === 0) {
      return;
    }

    setIsGeneratingAds(true);
    const baseUrl = url || DEFAULT_URL;
    const adGroups = getDynamicAdGroups();
    const allGeneratedAds: any[] = [];
    let adIdCounter = 1;
      
    // Default ad counts per group
    const rsaPerGroup = 2;
    const dkiPerGroup = 2;
    const callOnlyPerGroup = 1;

    for (const group of adGroups) {
      // Get keywords for this ad group
      const groupKeywords = group.keywords || [];
      if (groupKeywords.length === 0) continue;

      // Clean keywords (remove brackets, quotes, etc.)
      const cleanKeywords = groupKeywords.map(k => {
        let clean = k.trim();
        if (clean.startsWith('[') && clean.endsWith(']')) clean = clean.slice(1, -1);
        if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1);
        if (clean.startsWith('-')) clean = clean.slice(1);
        return clean.trim();
      }).filter(Boolean);

      if (cleanKeywords.length === 0) continue;

      // Generate RSA Ads
      for (let i = 0; i < rsaPerGroup; i++) {
        try {
          const response = await api.post('/generate-ads', {
            keywords: cleanKeywords,
            adType: 'RSA',
            count: 1,
            groupName: group.name,
            baseUrl: baseUrl,
            systemPrompt: GOOGLE_ADS_SYSTEM_PROMPT
          });

          if (response && response.ads && Array.isArray(response.ads) && response.ads.length > 0) {
            const ad = response.ads[0];
            if (ad && (ad.headline1 || ad.headlines)) {
              const convertedAd = convertRSAToGeneratedAd(
                ad.headlines ? { headlines: ad.headlines, descriptions: ad.descriptions || [], displayPath: ad.displayPath || [], finalUrl: ad.finalUrl || baseUrl } : 
                { headlines: [ad.headline1, ad.headline2, ad.headline3].filter(Boolean), descriptions: [ad.description1, ad.description2].filter(Boolean), displayPath: [ad.path1, ad.path2].filter(Boolean), finalUrl: ad.finalUrl || baseUrl },
                group.name,
                baseUrl
              );
              convertedAd.id = adIdCounter++;
              allGeneratedAds.push(convertedAd);
            }
          } else {
            throw new Error('Invalid response structure');
          }
        } catch (error) {
          console.log('API unavailable, using fallback for RSA');
          const fallbackAd = generateFallbackRSA(group.name, cleanKeywords, i, baseUrl);
          fallbackAd.id = adIdCounter++;
          allGeneratedAds.push(fallbackAd);
        }
      }

      // Generate DKI Ads
      for (let i = 0; i < dkiPerGroup; i++) {
        try {
          const response = await api.post('/generate-ads', {
            keywords: cleanKeywords,
            adType: 'DKI',
            count: 1,
            groupName: group.name,
            baseUrl: baseUrl,
            systemPrompt: GOOGLE_ADS_SYSTEM_PROMPT
          });

          if (response && response.ads && Array.isArray(response.ads) && response.ads.length > 0) {
            const ad = response.ads[0];
            if (ad && (ad.headline1 || ad.headlines)) {
              const rsaAd = ad.headlines ? 
                { headlines: ad.headlines, descriptions: ad.descriptions || [], displayPath: ad.displayPath || [], finalUrl: ad.finalUrl || baseUrl } :
                { headlines: [ad.headline1, ad.headline2, ad.headline3].filter(Boolean), descriptions: [ad.description1, ad.description2].filter(Boolean), displayPath: [ad.path1, ad.path2].filter(Boolean), finalUrl: ad.finalUrl || baseUrl };
              const convertedAd = convertRSAToDKI(rsaAd, group.name, baseUrl, cleanKeywords[i % cleanKeywords.length] || cleanKeywords[0]);
              convertedAd.id = adIdCounter++;
              allGeneratedAds.push(convertedAd);
            }
          } else {
            throw new Error('Invalid response structure');
          }
        } catch (error) {
          console.log('API unavailable, using fallback for DKI');
          const fallbackAd = generateFallbackDKI(group.name, cleanKeywords, i, baseUrl);
          fallbackAd.id = adIdCounter++;
          allGeneratedAds.push(fallbackAd);
        }
      }

      // Generate Call-Only Ads
      for (let i = 0; i < callOnlyPerGroup; i++) {
        try {
          const response = await api.post('/generate-ads', {
            keywords: cleanKeywords,
            adType: 'CallOnly',
            count: 1,
            groupName: group.name,
            baseUrl: baseUrl,
            systemPrompt: GOOGLE_ADS_SYSTEM_PROMPT
          });

          if (response && response.ads && Array.isArray(response.ads) && response.ads.length > 0) {
            const ad = response.ads[0];
            if (ad && (ad.phoneNumber || ad.phone || ad.businessName)) {
              const callAd = {
                id: adIdCounter++,
                type: 'callonly',
                headline1: ad.headline1 || '',
                headline2: ad.headline2 || '',
                description1: ad.description1 || '',
                description2: ad.description2 || '',
                phoneNumber: ad.phoneNumber || ad.phone || landingPageData?.phones[0] || '+1-800-123-4567',
                businessName: ad.businessName || campaignName || 'Your Business',
                finalUrl: ad.finalUrl || baseUrl,
                path1: ad.path1 || '',
                path2: ad.path2 || '',
                adGroup: group.name
              };
              allGeneratedAds.push(callAd);
            }
          } else {
            throw new Error('Invalid response structure');
          }
        } catch (error) {
          console.log('API unavailable, using fallback for Call Only');
          const fallbackAd = generateFallbackCallOnly(group.name, cleanKeywords, i, baseUrl);
          fallbackAd.id = adIdCounter++;
          allGeneratedAds.push(fallbackAd);
        }
      }
    }

      // Apply tracking parameters (UTM) to final URLs
    const adsWithTracking = allGeneratedAds.map(ad => {
        const utmParams = generateUTMParams({
          campaignId: campaignName,
          adGroupId: ad.adGroup || '',
          keyword: selectedKeywords[0] || '',
          source: 'google',
          medium: 'cpc',
        });
        
        const utmQueryString = Object.entries(utmParams)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join('&');
        
        const finalUrlWithTracking = ad.finalUrl 
          ? `${ad.finalUrl}${ad.finalUrl.includes('?') ? '&' : '?'}${utmQueryString}`
          : ad.finalUrl;
        
        return {
          ...ad,
          finalUrl: finalUrlWithTracking,
          intentId: intentResult?.intentId || '',
          persona: intentResult?.persona || '',
          suggestedBidReason: ad.suggestedBidCents ? `Bid: $${(ad.suggestedBidCents / 100).toFixed(2)}` : '',
          dniPhone: landingPageData?.phones[0] || '',
        locale: 'en-US',
          policyStatus: ad.policyStatus || 'ENABLED',
        };
      });
      
      setGeneratedAds(adsWithTracking);
    
    if (adsWithTracking.length > 0) {
      notifications.success(`Generated ${adsWithTracking.length} ad(s) for ${adGroups.length} ad group(s)`, {
        title: 'Ads Generated',
        duration: 3000
      });
    } else {
      notifications.warning('No ads were generated. Please check your keywords and try again.', {
        title: 'Generation Failed',
        duration: 5000
      });
    }
    setIsGeneratingAds(false);
  }, [structureType, selectedKeywords, url, getDynamicAdGroups, campaignName, intentResult, landingPageData]);

  // Generate ads when step 3 is reached
  useEffect(() => {
    if (step === 3) {
      if (!structureType) {
        return; // Will show error message in renderStep3
      }
      if (selectedKeywords.length === 0) {
        return; // Will show error message in renderStep3
      }
      // Reset selectedAdGroup when entering step 3 to ensure dropdown shows correct value
      const dynamicAdGroups = getDynamicAdGroups();
      if (dynamicAdGroups.length > 0 && (selectedAdGroup === ALL_AD_GROUPS_VALUE || !dynamicAdGroups.some(g => g.name === selectedAdGroup))) {
        // If current selection is invalid or doesn't exist, reset to ALL_AD_GROUPS_VALUE
        setSelectedAdGroup(ALL_AD_GROUPS_VALUE);
      }
      
      // Always generate ads when step 3 is reached with valid data
      generateAdsForStructure();
    }
  }, [step, structureType, selectedKeywords.length, generateAdsForStructure]);

  // Helper functions for ad management (matching Campaign Builder)
  const handleEditAd = (ad: any) => {
    if (editingAdId === ad.id) {
      setEditingAdId(null);
    } else {
      setEditingAdId(ad.id);
    }
  };

  const handleSaveAd = (adId: number) => {
    const ad = generatedAds.find(a => a.id === adId);
    if (!ad) return;
    
    // Google Ads validation rules
    const errors: string[] = [];
    
    if (ad.type === 'rsa' || ad.type === 'dki') {
      // Headline validation (30 characters max)
      if (ad.headline1 && ad.headline1.length > 30) {
        errors.push(`Headline 1 exceeds 30 characters (${ad.headline1.length}/30)`);
      }
      if (ad.headline2 && ad.headline2.length > 30) {
        errors.push(`Headline 2 exceeds 30 characters (${ad.headline2.length}/30)`);
      }
      if (ad.headline3 && ad.headline3.length > 30) {
        errors.push(`Headline 3 exceeds 30 characters (${ad.headline3.length}/30)`);
      }
      
      // Description validation (90 characters max)
      if (ad.description1 && ad.description1.length > 90) {
        errors.push(`Description 1 exceeds 90 characters (${ad.description1.length}/90)`);
      }
      if (ad.description2 && ad.description2.length > 90) {
        errors.push(`Description 2 exceeds 90 characters (${ad.description2.length}/90)`);
      }
      
      // Required fields
      if (!ad.headline1 || !ad.headline1.trim()) {
        errors.push('Headline 1 is required');
      }
      if (!ad.description1 || !ad.description1.trim()) {
        errors.push('Description 1 is required');
      }
      if (!ad.finalUrl || !ad.finalUrl.trim()) {
        errors.push('Final URL is required');
      }
    } else if (ad.type === 'callonly') {
      // Call-only ad validation
      if (ad.headline1 && ad.headline1.length > 30) {
        errors.push(`Headline 1 exceeds 30 characters (${ad.headline1.length}/30)`);
      }
      if (ad.headline2 && ad.headline2.length > 30) {
        errors.push(`Headline 2 exceeds 30 characters (${ad.headline2.length}/30)`);
      }
      if (ad.description1 && ad.description1.length > 90) {
        errors.push(`Description 1 exceeds 90 characters (${ad.description1.length}/90)`);
      }
      if (ad.description2 && ad.description2.length > 90) {
        errors.push(`Description 2 exceeds 90 characters (${ad.description2.length}/90)`);
      }
      if (!ad.phone || !ad.phone.trim()) {
        errors.push('Phone number is required for call-only ads');
      }
      if (!ad.businessName || !ad.businessName.trim()) {
        errors.push('Business name is required for call-only ads');
      }
    }
    
    // Display validation errors
    if (errors.length > 0) {
      notifications.error(
        <div className="space-y-2">
          <p className="font-bold text-red-900">⚠️ Google Ads Validation Failed</p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            {errors.map((error, idx) => (
              <li key={idx} className="text-red-800">{error}</li>
            ))}
          </ul>
          <p className="text-xs text-red-700 mt-2">Please fix these issues before saving.</p>
        </div>,
        {
          title: 'Invalid Ad Content',
          description: 'Your ad violates Google Ads policies or character limits.',
          duration: 8000,
        }
      );
      return; // Don't save if there are errors
    }
    
    // Save if validation passes
    setEditingAdId(null);
    notifications.success('Ad saved successfully', {
      title: 'Changes Saved',
      description: 'Your ad has been updated and is ready to export.',
    });
  };

  const handleCancelEdit = () => {
    setEditingAdId(null);
  };

  const updateAdField = (adId: number, field: string, value: any) => {
    setGeneratedAds(generatedAds.map(ad => 
      ad.id === adId ? { ...ad, [field]: value } : ad
    ));
  };

  const handleDuplicateAd = (ad: any) => {
    const newAd = { 
      ...ad, 
      id: Date.now() + Math.random() * 1000, // Ensure unique ID
      extensions: ad.extensions ? [...ad.extensions] : [] // Deep copy extensions
    };
    setGeneratedAds([...generatedAds, newAd]);
    setSelectedAdIds([...selectedAdIds, newAd.id]); // Auto-select the duplicated ad
    notifications.success('Ad duplicated successfully', {
      title: 'Ad Duplicated',
      description: 'A copy of the ad has been created. You can edit it as needed.',
    });
  };

  const handleDeleteAd = (adId: number) => {
    setGeneratedAds(generatedAds.filter(a => a.id !== adId));
    if (selectedAdIds.includes(adId)) {
      setSelectedAdIds(selectedAdIds.filter(id => id !== adId));
    }
    notifications.success('Ad deleted successfully', {
      title: 'Ad Removed',
      description: 'The ad has been removed from your campaign.',
    });
  };
  
  const handleRemoveExtension = (adId: number, extensionIndex: number) => {
    const updatedAds = generatedAds.map(ad => {
      if (ad.id === adId && ad.extensions) {
        const newExtensions = [...ad.extensions];
        newExtensions.splice(extensionIndex, 1);
        return { ...ad, extensions: newExtensions };
      }
      return ad;
    });
    setGeneratedAds(updatedAds);
    notifications.success('Extension removed', {
      title: 'Extension Deleted',
      description: 'The extension has been removed from this ad.',
    });
  };

  // Helper function to create extension object
  const createExtensionObject = (extType: string, currentGroup: any, formattedUrl: string, mainKeyword: string): any => {
    const extension: any = { extensionType: extType };
    
    switch (extType) {
      case 'snippet':
        extension.header = 'Types';
        extension.values = currentGroup?.keywords?.slice(0, 4) || ['Option 1', 'Option 2', 'Option 3'];
        break;
      case 'callout':
        extension.callouts = ['Free Shipping', '24/7 Support', 'Best Price Guarantee', 'Expert Installation'];
        break;
      case 'call':
        extension.phone = '(555) 123-4567';
        extension.phoneNumber = '(555) 123-4567';
        extension.countryCode = 'US';
        extension.country = 'US';
        extension.callTrackingEnabled = false;
        extension.callOnly = false;
        break;
      case 'sitelink':
        extension.sitelinks = [
          { text: 'Shop Now', description: 'Browse our collection', url: formattedUrl + '/shop' },
          { text: 'About Us', description: 'Learn more about us', url: formattedUrl + '/about' },
          { text: 'Contact', description: 'Get in touch', url: formattedUrl + '/contact' },
          { text: 'Support', description: 'Customer support', url: formattedUrl + '/support' }
        ];
        break;
      case 'price':
        extension.priceQualifier = 'From';
        extension.price = '$99';
        extension.currency = 'USD';
        extension.unit = 'per service';
        extension.description = 'Starting price';
        break;
      case 'app':
        extension.appStore = 'GOOGLE_PLAY';
        extension.appId = 'com.example.app';
        extension.appLinkText = 'Download Now';
        extension.appFinalUrl = 'https://play.google.com/store/apps/details?id=com.example.app';
        break;
      case 'location':
        extension.businessName = 'Your Business Name';
        extension.addressLine1 = '123 Main St';
        extension.city = 'City';
        extension.state = 'State';
        extension.postalCode = '12345';
        extension.country = 'United States';
        extension.phone = '(555) 123-4567';
        break;
      case 'message':
        extension.messageText = 'Message us for quick answers';
        extension.businessName = 'Your Business';
        extension.phone = '(555) 123-4567';
        break;
      case 'leadform':
        extension.formName = 'Get Started';
        extension.formDescription = 'Fill out this form to get in touch';
        extension.formType = 'CONTACT';
        extension.formUrl = formattedUrl;
        extension.privacyPolicyUrl = formattedUrl + '/privacy';
        break;
      case 'promotion':
        extension.promotionText = 'Special Offer';
        extension.promotionDescription = 'Get 20% off your first order';
        extension.occasion = 'SALE';
        extension.startDate = new Date().toISOString().split('T')[0];
        extension.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'image':
        extension.imageUrl = 'https://via.placeholder.com/1200x628';
        extension.imageAltText = 'Product Image';
        extension.imageName = 'Product Showcase';
        extension.landscapeLogoImageUrl = 'https://via.placeholder.com/600x314';
        break;
    }
    
    return extension;
  };

  const createNewAd = (type: 'rsa' | 'dki' | 'callonly' | 'snippet' | 'callout' | 'call' | 'sitelink' | 'price' | 'app' | 'location' | 'message' | 'leadform' | 'promotion' | 'image') => {
    const isExtension = ['snippet', 'callout', 'call', 'sitelink', 'price', 'app', 'location', 'message', 'leadform', 'promotion', 'image'].includes(type);
    const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
    
    // Validate keywords are selected
    if (selectedKeywords.length === 0) {
      notifications.error('Please select keywords first', {
        title: 'Keywords Required',
        description: 'You must select keywords in Step 2 before creating ads or extensions.',
      });
      return;
    }
    
    // Handle extensions - attach to existing ads
    if (isExtension) {
      if (!hasRegularAds) {
        notifications.error('Please create ads first', {
          title: 'Ads Required',
          description: 'You must create at least one ad (RSA, DKI, or Call-Only) before adding extensions. Extensions are attached to ads.',
        });
        return;
      }
      
      // If has regular ads, attach extension to all existing ads
      const dynamicAdGroups = getDynamicAdGroups();
      const baseUrl = url || 'www.example.com';
      const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);
      
      // Check if any ad already has this extension type
      const hasExtension = generatedAds.some(ad => 
        (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly') &&
        ad.extensions?.some((ext: any) => ext.extensionType === type)
      );
      
      if (hasExtension) {
        const extName = type === 'snippet' ? 'Snippet Extension' :
                       type === 'callout' ? 'Callout Extension' :
                       type === 'sitelink' ? 'Sitelink Extension' :
                       type === 'call' ? 'Call Extension' :
                       type === 'price' ? 'Price Extension' :
                       type === 'app' ? 'App Extension' :
                       type === 'location' ? 'Location Extension' :
                       type === 'message' ? 'Message Extension' :
                       type === 'leadform' ? 'Lead Form Extension' :
                       type === 'promotion' ? 'Promotion Extension' :
                       type === 'image' ? 'Image Extension' : 'Extension';
        
        notifications.warning(`${extName} already exists in ads`, {
          title: 'Duplicate Extension',
          description: `Each ad can only have one ${extName}. Please edit or remove the existing one first.`,
        });
        return;
      }
      
      const updatedAds = generatedAds.map(ad => {
        if (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly') {
          const currentGroup = dynamicAdGroups.find(g => g.name === ad.adGroup) || dynamicAdGroups[0];
          const rawKeyword = currentGroup?.keywords?.[0] || selectedKeywords[0] || 'your service';
          const mainKeyword = cleanKeyword(rawKeyword);
          const extension = createExtensionObject(type, currentGroup, formattedUrl, mainKeyword);
          return {
            ...ad,
            extensions: [...(ad.extensions || []), extension]
          };
        }
        return ad;
      });
      
      setGeneratedAds(updatedAds);
      
      const extName = type === 'snippet' ? 'Snippet Extension' :
                     type === 'callout' ? 'Callout Extension' :
                     type === 'sitelink' ? 'Sitelink Extension' :
                     type === 'call' ? 'Call Extension' :
                     type === 'price' ? 'Price Extension' :
                     type === 'app' ? 'App Extension' :
                     type === 'location' ? 'Location Extension' :
                     type === 'message' ? 'Message Extension' :
                     type === 'leadform' ? 'Lead Form Extension' :
                     type === 'promotion' ? 'Promotion Extension' :
                     type === 'image' ? 'Image Extension' : 'Extension';
      
      notifications.success(`${extName} added to all ads`, {
        title: 'Extension Added',
        description: `Your ${extName} has been attached to all ads.`,
      });
      return;
    }

    const dynamicAdGroups = getDynamicAdGroups();
    const currentGroup = dynamicAdGroups.find(g => g.name === selectedAdGroup) || dynamicAdGroups[0];
    const rawKeyword = currentGroup?.keywords[0] || selectedKeywords[0] || 'your service';
    // Clean keyword for ALL ad types - Google Ads doesn't allow quotes in ad text
    const mainKeyword = cleanKeyword(rawKeyword);
    
    let newAd: any = {
      id: Date.now(),
      type: type,
      adGroup: selectedAdGroup === ALL_AD_GROUPS_VALUE ? ALL_AD_GROUPS_VALUE : selectedAdGroup
    };

    const baseUrl = url || 'www.example.com';
    const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);

    if (type === 'rsa') {
      newAd = {
        ...newAd,
        headline1: `${mainKeyword} - Best Deals`,
        headline2: 'Shop Now & Save',
        headline3: 'Fast Delivery Available',
        description1: `Looking for ${mainKeyword}? We offer competitive prices and excellent service.`,
        description2: `Get your ${mainKeyword} today with free shipping on orders over $50.`,
        finalUrl: formattedUrl,
        path1: 'shop',
        path2: 'now'
      };
    } else if (type === 'dki') {
      newAd = {
        ...newAd,
        headline1: `{KeyWord:${mainKeyword}} - Official Site`,
        headline2: 'Best {KeyWord:' + mainKeyword + '} Deals',
        headline3: 'Order {KeyWord:' + mainKeyword + '} Online',
        description1: `Find quality {KeyWord:${mainKeyword}} at great prices. Shop our selection today.`,
        description2: `Get your {KeyWord:${mainKeyword}} with fast shipping and expert support.`,
        finalUrl: formattedUrl,
        path1: 'keyword',
        path2: 'deals'
      };
    } else if (type === 'callonly') {
      newAd = {
        ...newAd,
        headline1: `Call for ${mainKeyword}`,
        headline2: 'Available 24/7 - Speak to Expert',
        description1: `Need ${mainKeyword}? Call us now for expert advice and the best pricing.`,
        description2: 'Get immediate assistance. Our specialists are ready to help!',
        phone: '(555) 123-4567',
        businessName: 'Your Business',
        finalUrl: formattedUrl
      };
    }
    
    // Initialize extensions array for regular ads
    if (!newAd.extensions) {
      newAd.extensions = [];
    }

    setGeneratedAds([...generatedAds, newAd]);
    
    const adTypeName = type === 'rsa' ? 'Responsive Search Ad' : 
                      type === 'dki' ? 'DKI Text Ad' : 
                      type === 'callonly' ? 'Call Only Ad' : 
                      type === 'snippet' ? 'Snippet Extension' :
                      type === 'callout' ? 'Callout Extension' :
                      type === 'sitelink' ? 'Sitelink Extension' :
                      type === 'call' ? 'Call Extension' :
                      type === 'price' ? 'Price Extension' :
                      type === 'app' ? 'App Extension' :
                      type === 'location' ? 'Location Extension' :
                      type === 'message' ? 'Message Extension' :
                      type === 'leadform' ? 'Lead Form Extension' :
                      type === 'promotion' ? 'Promotion Extension' :
                      type === 'image' ? 'Image Extension' : type;
    notifications.success(`${adTypeName} created successfully`, {
      title: 'Ad Created',
      description: `Your ${adTypeName} has been added.`,
    });
    
    if (selectedAdGroup === ALL_AD_GROUPS_VALUE && selectedAdIds.length < 3 && (type === 'rsa' || type === 'dki' || type === 'callonly')) {
      setSelectedAdIds([...selectedAdIds, newAd.id]);
    }
  };

  const handleGenerateAIExtensions = async () => {
    if (selectedKeywords.length === 0) {
      notifications.error('Please select keywords first', {
        title: 'Keywords Required',
        description: 'You must select keywords in Step 2 before generating extensions.',
      });
      return;
    }
    
    const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
    if (!hasRegularAds) {
      notifications.error('Please create ads first', {
        title: 'Ads Required',
        description: 'You must create at least one ad (RSA, DKI, or Call-Only) before generating extensions. Extensions are attached to ads.',
      });
      return;
    }
    setShowExtensionDialog(true);
  };

  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  
  const extensionTypes = [
    { id: 'callout', label: 'Callout Extension', description: 'Highlight key benefits', icon: Tag, color: 'purple' },
    { id: 'sitelink', label: 'Sitelink Extension', description: 'Add links to important pages', icon: Link2, color: 'blue' },
    { id: 'call', label: 'Call Extension', description: 'Add phone number', icon: Phone, color: 'green' },
    { id: 'snippet', label: 'Snippet Extension', description: 'Show structured information', icon: FileText, color: 'indigo' },
    { id: 'price', label: 'Price Extension', description: 'Display pricing', icon: DollarSign, color: 'emerald' },
    { id: 'location', label: 'Location Extension', description: 'Show business location', icon: MapPin, color: 'red' },
    { id: 'message', label: 'Message Extension', description: 'Enable messaging', icon: MessageSquare, color: 'purple' },
    { id: 'promotion', label: 'Promotion Extension', description: 'Show special offers', icon: Gift, color: 'orange' },
    { id: 'image', label: 'Image Extension', description: 'Add images', icon: ImageIcon, color: 'pink' },
    { id: 'app', label: 'App Extension', description: 'Link to mobile app', icon: Smartphone, color: 'slate' },
  ];

  const handleConfirmAIExtensions = () => {
    if (selectedExtensions.length === 0) {
      notifications.error('Please select at least one extension', {
        title: 'No Extensions Selected',
        description: 'You must select at least one extension type to generate.',
      });
      return;
    }

    const dynamicAdGroups = getDynamicAdGroups();
    const baseUrl = url || 'www.example.com';
    const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);

    // Attach extensions to all existing ads
    const updatedAds = generatedAds.map(ad => {
      if (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly') {
        const currentGroup = dynamicAdGroups.find(g => g.name === ad.adGroup) || dynamicAdGroups[0];
        const rawKeyword = currentGroup?.keywords?.[0] || selectedKeywords[0] || 'your service';
        const mainKeyword = cleanKeyword(rawKeyword);
        
        const newExtensions = selectedExtensions.map(extType => 
          createExtensionObject(extType, currentGroup, formattedUrl, mainKeyword)
        );
        
        return {
          ...ad,
          extensions: [...(ad.extensions || []), ...newExtensions]
        };
      }
      return ad;
    });

    setGeneratedAds(updatedAds);
    setShowExtensionDialog(false);
    setSelectedExtensions([]);
    
    notifications.success(`Generated ${selectedExtensions.length} AI extensions`, {
      title: 'Extensions Created',
      description: 'Your AI-generated extensions have been added and will appear in ad previews.',
    });
  };

  const renderStep3 = () => {
    if (!structureType) {
      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-center w-full">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">Structure Not Selected</h3>
          <p className="text-slate-500 mb-4">Please go back and select a campaign structure first.</p>
          <Button onClick={() => setStep(1)} variant="outline">
            Go to Setup
          </Button>
        </div>
      );
    }

    if (selectedKeywords.length === 0) {
      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-center w-full">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No Keywords Selected</h3>
          <p className="text-slate-500 mb-4">Please go back and select keywords before creating ads.</p>
          <Button onClick={() => setStep(2)} variant="outline">
            Go to Keywords
          </Button>
        </div>
      );
    }

    const dynamicAdGroups = getDynamicAdGroups();
    const adGroupList = dynamicAdGroups.length > 0 ? dynamicAdGroups.map(g => g.name) : [];
    
    // Filter ads for the selected ad group
    // Filter ads for the selected ad group (only show regular ads, not extension-only objects)
    const filteredAds = selectedAdGroup === ALL_AD_GROUPS_VALUE 
      ? generatedAds.filter(ad => selectedAdIds.includes(ad.id) && (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'))
      : generatedAds.filter(ad => (ad.adGroup === selectedAdGroup || !ad.adGroup) && (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'));
    
    // Calculate total ads (only count regular ads)
    const totalAds = filteredAds.length;
    const maxAds = 25; // Maximum ads allowed
    
    // Format display URL for ads
    const formatDisplayUrl = (ad: any) => {
      if (ad.finalUrl) {
        const url = ad.finalUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
        const path1 = ad.path1 ? `/${ad.path1}` : '';
        const path2 = ad.path2 ? `/${ad.path2}` : '';
        return `https://${url}${path1}${path2}`;
      }
      return 'https://example.com';
    };
    
    // Format headline for display
    const formatHeadline = (ad: any) => {
      if (ad.type === 'rsa' || ad.type === 'dki') {
        const headlines = [
          ad.headline1,
          ad.headline2,
          ad.headline3,
          ad.headline4,
          ad.headline5
        ].filter(Boolean);
        return headlines.join(' | ');
      } else if (ad.type === 'callonly') {
        return ad.headline1 || 'Call Only Ad';
      }
      return ad.headline1 || 'Ad';
    };
    
    // Format description for display
    const formatDescription = (ad: any) => {
      if (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly') {
        const descs = [ad.description1, ad.description2].filter(Boolean);
        return descs.join(' ');
      }
      return ad.description1 || '';
    };
    
    // Check if we have regular ads
    const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');

    return (
      <>
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Ad Group Selector */}
              <div className="bg-slate-100 p-4 rounded-lg">
                <Select value={selectedAdGroup} onValueChange={setSelectedAdGroup}>
                  <SelectTrigger className="w-full bg-white border-slate-300">
                    <SelectValue placeholder="Select ad group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={ALL_AD_GROUPS_VALUE} value={ALL_AD_GROUPS_VALUE}>
                      ALL AD GROUPS
                    </SelectItem>
                    {adGroupList.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAdGroup !== ALL_AD_GROUPS_VALUE && dynamicAdGroups.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600">
                    {dynamicAdGroups.find(g => g.name === selectedAdGroup)?.keywords.length || 0} keywords in this group
                  </div>
                )}
              </div>
              
              {/* Info Card */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600">
                  You can preview different ad groups, however changing ads here will change all ad groups. 
                  In the next section you can edit ads individually for each ad group.
                </p>
              </div>
              
              {/* Total Ads Counter */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Total Ads:</span>
                  {isGeneratingAds ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      <span className="text-sm text-indigo-600">Generating...</span>
                    </div>
                  ) : (
                    <span className={`text-lg font-bold ${totalAds >= maxAds ? 'text-green-600' : 'text-indigo-600'}`}>
                      {totalAds} / {maxAds}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Create Ad Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => createNewAd('rsa')}
                  disabled={selectedKeywords.length === 0 || totalAds >= maxAds}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> RESP. SEARCH AD
                </Button>
                <Button 
                  onClick={() => createNewAd('dki')}
                  disabled={selectedKeywords.length === 0 || totalAds >= maxAds}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> DKI TEXT AD
                </Button>
                <Button 
                  onClick={() => createNewAd('callonly')}
                  disabled={selectedKeywords.length === 0 || totalAds >= maxAds}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  <Plus className="mr-2 w-5 h-5" /> CALL ONLY AD
                </Button>
                
                {/* Extension Buttons */}
                <div className="pt-2 border-t border-slate-300 bg-orange-50 rounded-lg p-3 -mx-2 border-2">
                  <p className="text-xs text-black mb-3 font-bold uppercase">EXTENSIONS</p>
                  <Button 
                    onClick={() => createNewAd('snippet')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> SNIPPET EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('callout')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> CALLOUT EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('sitelink')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> SITELINK EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('call')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> CALL EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('price')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> PRICE EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('app')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> APP EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('location')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> LOCATION EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('message')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> MESSAGE EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('leadform')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> LEAD FORM EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('promotion')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> PROMOTION EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('image')}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
                  >
                    <Plus className="mr-2 w-5 h-5" /> IMAGE EXTENSION
                  </Button>
                </div>
                
                {/* AI Extension Generator */}
                <div className="pt-2 border-t border-slate-200">
                  <Button 
                    onClick={handleGenerateAIExtensions}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Sparkles className="mr-2 w-5 h-5" /> GENERATE AI EXTENSIONS
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Ad Cards */}
            <div className="lg:col-span-2 space-y-4">
              {filteredAds.map((ad: any) => {
                const headline = formatHeadline(ad);
                const displayUrl = formatDisplayUrl(ad);
                const description = formatDescription(ad);
                
                return (
                  <div key={ad.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Badge - Top Left */}
                    <div className="mb-3">
                      <Badge className={
                        ad.type === 'rsa' ? 'bg-blue-100 text-blue-700 border-0' :
                        ad.type === 'dki' ? 'bg-purple-100 text-purple-700 border-0' :
                        ad.type === 'callonly' ? 'bg-green-100 text-green-700 border-0' :
                        'bg-slate-100 text-slate-700 border-0'
                      }>
                        {ad.type === 'rsa' ? 'RSA' : 
                         ad.type === 'dki' ? 'DKI' : 
                         ad.type === 'callonly' ? 'Call Only' : 
                         ad.extensionType ? ad.extensionType.charAt(0).toUpperCase() + ad.extensionType.slice(1) : 'Ad'}
                      </Badge>
                    </div>
                    
                    {/* Ad Preview with Extensions */}
                    <div className="mb-4">
                      {ad.extensionType ? (
                        // Show extension preview
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <Badge className="mb-2 bg-purple-100 text-purple-700">
                            {ad.extensionType.charAt(0).toUpperCase() + ad.extensionType.slice(1)} Extension
                          </Badge>
                          {ad.extensionType === 'callout' && ad.callouts && (
                            <div className="flex flex-wrap gap-1.5">
                              {ad.callouts.map((c: string, idx: number) => (
                                <span key={idx} className="text-xs text-slate-700 px-2 py-1 bg-white rounded border border-slate-200">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                          {ad.extensionType === 'sitelink' && ad.sitelinks && (
                            <div className="space-y-1">
                              {ad.sitelinks.slice(0, 4).map((sl: any, idx: number) => (
                                <div key={idx} className="text-xs">
                                  <span className="text-blue-600 font-semibold">{sl.text}</span>
                                  {sl.description && <span className="text-slate-600 ml-1">- {sl.description}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          {ad.extensionType === 'call' && ad.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-green-600" />
                              <span className="text-slate-700 font-semibold">{ad.phone}</span>
                            </div>
                          )}
                          {ad.extensionType === 'snippet' && (
                            <div className="text-sm">
                              <span className="font-semibold text-slate-700">{ad.header}:</span>
                              <span className="text-slate-600 ml-1">
                                {Array.isArray(ad.values) ? ad.values.slice(0, 3).join(', ') : ''}
                              </span>
                            </div>
                          )}
                          {ad.extensionType === 'price' && (
                            <div className="text-sm">
                              <span className="font-semibold text-slate-700">
                                {ad.priceQualifier} {ad.price} {ad.unit}
                              </span>
                              {ad.description && <span className="text-slate-600 ml-1">- {ad.description}</span>}
                            </div>
                          )}
                          {ad.extensionType === 'location' && (
                            <div className="text-sm">
                              <div className="font-semibold text-slate-700">{ad.businessName}</div>
                              <div className="text-slate-600 text-xs">
                                {[ad.addressLine1, ad.city, ad.state].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          )}
                          {ad.extensionType === 'message' && (
                            <div className="text-sm">
                              <div className="font-semibold text-slate-700">{ad.messageText}</div>
                              <div className="text-slate-600 text-xs">{ad.businessName} • {ad.phone}</div>
                            </div>
                          )}
                          {ad.extensionType === 'promotion' && (
                            <div className="text-sm">
                              <div className="font-semibold text-slate-700">{ad.promotionText}</div>
                              <div className="text-slate-600 text-xs">{ad.promotionDescription}</div>
                            </div>
                          )}
                          {ad.extensionType === 'image' && (
                            <div className="text-sm">
                              <div className="font-semibold text-slate-700">{ad.imageName}</div>
                              <div className="text-slate-600 text-xs">{ad.imageAltText}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Show regular ad preview with LiveAdPreview component
                        <LiveAdPreview 
                          ad={ad} 
                          onRemoveExtension={(extIndex) => handleRemoveExtension(ad.id, extIndex)}
                        />
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleEditAd(ad)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        EDIT
                      </Button>
                      <Button
                        onClick={() => handleDuplicateAd(ad)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        DUPLICATE
                      </Button>
                      <Button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        DELETE
                      </Button>
                    </div>

                    {/* Edit Form - shown when editing */}
                    {editingAdId === ad.id && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                        {(ad.type === 'rsa' || ad.type === 'dki') && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Headline 1 *</Label>
                                <Input
                                  value={ad.headline1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline1', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter headline 1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Headline 2 *</Label>
                                <Input
                                  value={ad.headline2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline2', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter headline 2"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Headline 3</Label>
                                <Input
                                  value={ad.headline3 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline3', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter headline 3"
                                />
                              </div>
                              {ad.type === 'rsa' && (
                                <>
                                  <div>
                                    <Label className="text-xs font-semibold text-slate-700">Headline 4</Label>
                                    <Input
                                      value={ad.headline4 || ''}
                                      onChange={(e) => updateAdField(ad.id, 'headline4', e.target.value)}
                                      className="mt-1"
                                      placeholder="Enter headline 4"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-semibold text-slate-700">Headline 5</Label>
                                    <Input
                                      value={ad.headline5 || ''}
                                      onChange={(e) => updateAdField(ad.id, 'headline5', e.target.value)}
                                      className="mt-1"
                                      placeholder="Enter headline 5"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Description 1 *</Label>
                                <Textarea
                                  value={ad.description1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description1', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter description 1"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Description 2</Label>
                                <Textarea
                                  value={ad.description2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description2', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter description 2"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Final URL *</Label>
                                <Input
                                  value={ad.finalUrl || ''}
                                  onChange={(e) => updateAdField(ad.id, 'finalUrl', e.target.value)}
                                  className="mt-1"
                                  placeholder="www.example.com"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Path 1</Label>
                                <Input
                                  value={ad.path1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'path1', e.target.value)}
                                  className="mt-1"
                                  placeholder="path1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Path 2</Label>
                                <Input
                                  value={ad.path2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'path2', e.target.value)}
                                  className="mt-1"
                                  placeholder="path2"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        
                        {ad.type === 'callonly' && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Headline 1 *</Label>
                                <Input
                                  value={ad.headline1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline1', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter headline 1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Headline 2</Label>
                                <Input
                                  value={ad.headline2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline2', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter headline 2"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Description 1 *</Label>
                                <Textarea
                                  value={ad.description1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description1', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter description 1"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Description 2</Label>
                                <Textarea
                                  value={ad.description2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description2', e.target.value)}
                                  className="mt-1"
                                  placeholder="Enter description 2"
                                  rows={2}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                                <Input
                                  value={ad.phone || ''}
                                  onChange={(e) => updateAdField(ad.id, 'phone', e.target.value)}
                                  className="mt-1"
                                  placeholder="(555) 123-4567"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Business Name *</Label>
                                <Input
                                  value={ad.businessName || ''}
                                  onChange={(e) => updateAdField(ad.id, 'businessName', e.target.value)}
                                  className="mt-1"
                                  placeholder="Your Business"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        
                        <div className="flex gap-2 pt-2 border-t border-slate-300">
                          <Button
                            onClick={() => handleSaveAd(ad.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredAds.length === 0 && (
                <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium mb-2">No ads created for "{selectedAdGroup}"</p>
                  <p className="text-sm text-slate-400">Click a button on the left to create your first ad for this ad group.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back
            </Button>
            <Button 
              size="lg" 
              onClick={() => {
                const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
                if (!hasRegularAds) {
                  notifications.error('Please create at least one ad first', {
                    title: 'Ads Required',
                    description: 'You must create at least one ad (RSA, DKI, or Call-Only) before proceeding to the next step.',
                  });
                  return;
                }
                setStep(4);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
            >
              Next Step <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Step Indicator at Bottom */}
          <div className="mt-10">
            {renderStepIndicator()}
          </div>
        </div>
        
        {/* Extension Selection Dialog */}
        <Dialog open={showExtensionDialog} onOpenChange={setShowExtensionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select Extensions to Generate</DialogTitle>
              <DialogDescription>
                Choose which extensions you want AI to generate. These will be automatically created and attached to your ads.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {extensionTypes.map((ext) => {
                const Icon = ext.icon || FileText;
                const iconBgClass = {
                  purple: 'bg-purple-50',
                  blue: 'bg-blue-50',
                  green: 'bg-green-50',
                  indigo: 'bg-indigo-50',
                  emerald: 'bg-emerald-50',
                  red: 'bg-red-50',
                  orange: 'bg-orange-50',
                  pink: 'bg-pink-50',
                  slate: 'bg-slate-50'
                }[ext.color] || 'bg-slate-50';
                const iconColorClass = {
                  purple: 'text-purple-600',
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  indigo: 'text-indigo-600',
                  emerald: 'text-emerald-600',
                  red: 'text-red-600',
                  orange: 'text-orange-600',
                  pink: 'text-pink-600',
                  slate: 'text-slate-600'
                }[ext.color] || 'text-slate-600';
                return (
                  <div
                    key={ext.id}
                    onClick={() => {
                      setSelectedExtensions(prev =>
                        prev.includes(ext.id)
                          ? prev.filter(e => e !== ext.id)
                          : [...prev, ext.id]
                      );
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedExtensions.includes(ext.id)
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-md'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedExtensions.includes(ext.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExtensions([...selectedExtensions, ext.id]);
                            } else {
                              setSelectedExtensions(selectedExtensions.filter(e => e !== ext.id));
                            }
                          }}
                          className="border-indigo-400"
                        />
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${iconBgClass} flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${iconColorClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base text-slate-800">{ext.label}</div>
                          <div className="text-sm text-slate-600 mt-1">{ext.description}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowExtensionDialog(false);
                setSelectedExtensions([]);
              }}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAIExtensions} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Generate {selectedExtensions.length > 0 ? `${selectedExtensions.length} ` : ''}Extensions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  // Step 4: Geo Targeting
  const renderStep4 = () => {
    const isGeoSegmented = structureType === 'geo';
    
    // Calculate number of campaigns for GEO-Segmented structure
    const getCampaignCount = () => {
      if (!isGeoSegmented) return 1;
      if (targetType === 'STATE' && manualGeoInput) {
        const states = manualGeoInput.split(',').filter(s => s.trim());
        return statePreset === '0' ? getTopStatesByPopulation(targetCountry, 0).length : states.length;
      }
      if (targetType === 'CITY' && manualGeoInput) {
        const cities = manualGeoInput.split(',').filter(c => c.trim());
        return cityPreset === '0' ? getTopCitiesByIncome(targetCountry, 0).length : cities.length;
      }
      if (targetType === 'ZIP' && manualGeoInput) {
        const zips = manualGeoInput.split(',').filter(z => z.trim());
        return zips.length;
      }
      return 0;
    };

    const campaignCount = getCampaignCount();
    const geoUnitName = targetType === 'STATE' ? 'states' : targetType === 'CITY' ? 'cities' : targetType === 'ZIP' ? 'ZIPs' : 'locations';
    let geoUnitCount = 0;
    if (targetType === 'STATE' && manualGeoInput) {
      geoUnitCount = manualGeoInput.split(',').filter(s => s.trim()).length;
    } else if (targetType === 'CITY' && manualGeoInput) {
      geoUnitCount = manualGeoInput.split(',').filter(c => c.trim()).length;
    } else if (targetType === 'ZIP' && manualGeoInput) {
      geoUnitCount = manualGeoInput.split(',').filter(z => z.trim()).length;
    }

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Enhanced Header with Gradient */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30 mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Geo Targeting Configuration
          </h2>
          <p className="text-slate-600 text-lg">Select the specific locations where your ads will be shown.</p>
        </div>

        {/* GEO-Segmented Structure Warning */}
        {isGeoSegmented && (
          <Card className="border-2 border-indigo-500 bg-indigo-50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-indigo-900 mb-2">GEO-Segmented Structure Selected</h3>
                  <p className="text-indigo-800 mb-3">
                    This structure creates multiple campaigns, not one.
                  </p>
                  {campaignCount > 0 ? (
                    <p className="text-lg font-bold text-indigo-900">
                      We will create <span className="text-indigo-600">{campaignCount}</span> campaign{campaignCount !== 1 ? 's' : ''}.
                    </p>
                  ) : (
                    <p className="text-indigo-700">
                      Select geo-units below to see campaign count.
                    </p>
                  )}
                  {campaignCount > 0 && geoUnitCount > 0 && (
                    <p className="text-sm text-indigo-700 mt-2">
                      {geoUnitCount} {geoUnitName} = {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            
            {/* Country Selector with Enhanced Design */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600"/>
                </div>
                <Label className="text-lg font-bold text-slate-800">Target Country</Label>
              </div>
              <Select value={targetCountry} onValueChange={(value) => {
                setTargetCountry(value);
                // Reset presets when country changes
                if (targetType === 'CITY' && cityPreset) {
                  setCityPreset(null);
                  setManualGeoInput('');
                }
                if (targetType === 'STATE' && statePreset) {
                  setStatePreset(null);
                  setManualGeoInput('');
                }
              }}>
                <SelectTrigger className="w-full text-lg py-7 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            {/* Location Detail with Enhanced Design */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600"/>
                </div>
                <Label className="text-lg font-bold text-slate-800">Specific Locations</Label>
              </div>
              
              <Tabs value={targetType} onValueChange={(value) => {
                setTargetType(value);
                // Bug_84: Clear manual input when switching tabs to keep city/state selection independent
                if (value === 'CITY') {
                  setManualGeoInput(manualCityInput);
                } else if (value === 'STATE') {
                  setManualGeoInput(manualStateInput);
                } else if (value === 'ZIP') {
                  // Keep manualGeoInput for ZIP
                } else {
                  setManualGeoInput('');
                }
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-slate-100 to-slate-50 p-1.5 rounded-xl shadow-inner">
                  <TabsTrigger 
                    value="COUNTRY" 
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 transition-all font-semibold rounded-lg"
                  >
                    Country
                  </TabsTrigger>
                  <TabsTrigger 
                    value="CITY"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all font-semibold rounded-lg"
                  >
                    Cities
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ZIP"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all font-semibold rounded-lg"
                  >
                    Zip Codes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="STATE"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 transition-all font-semibold rounded-lg"
                  >
                    States/Provinces
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="COUNTRY" className="space-y-4 mt-6">
                  <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    {/* Decorative gradient overlay */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 shadow-lg shadow-emerald-500/30">
                          <Globe className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-emerald-900 text-2xl">Whole Country Targeting</h3>
                          <p className="text-base text-emerald-700 mt-1">
                            Your campaign will target the entire country selected above
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide">Target Country:</p>
                            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mt-2">{targetCountry}</p>
                          </div>
                          <div className="bg-emerald-100 rounded-full p-3">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300 rounded-xl p-5 shadow-sm">
                        <p className="text-base text-emerald-900 flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span><strong className="font-bold">Nationwide Coverage:</strong> All cities, states, and regions within {targetCountry} will be included in your campaign targeting.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ZIP" className="space-y-4">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {['5000', '10000', '15000', '30000'].map(count => (
                      <Button 
                        key={count}
                        variant={zipPreset === count ? "default" : "outline"}
                        onClick={() => {
                          setZipPreset(count);
                          setManualGeoInput('');
                        }}
                        className={`flex-1 font-semibold ${
                          zipPreset === count 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
                            : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                        }`}
                      >
                        {count} ZIPs
                      </Button>
                    ))}
                    <Button 
                      variant={zipPreset === null && manualGeoInput ? "default" : "outline"}
                      onClick={() => {
                        setZipPreset(null);
                        if (!manualGeoInput) {
                          setManualGeoInput('');
                        }
                      }}
                      className={`flex-1 border-dashed font-semibold ${
                        zipPreset === null && manualGeoInput
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                          : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Enter ZIP codes manually (comma-separated, e.g., 10001, 10002, 90210)..."
                    value={manualGeoInput}
                    onChange={(e) => {
                      setManualGeoInput(e.target.value);
                      setZipPreset(null);
                    }}
                    rows={6}
                    className="bg-white/80"
                  />
                  {manualGeoInput && !zipPreset && (
                    <p className="text-xs text-slate-500">
                      Manual entry: {manualGeoInput.split(',').filter(z => z.trim()).length} ZIP code(s) entered
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="CITY" className="space-y-4">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {['20', '50', '100', '200', '0'].map(count => (
                      <Button 
                        key={count}
                        variant={cityPreset === count ? "default" : "outline"}
                        onClick={() => {
                          setCityPreset(count);
                          const cities = getTopCitiesByIncome(targetCountry, count === '0' ? 0 : parseInt(count));
                          const citiesStr = cities.join(', ');
                          setManualCityInput(citiesStr);
                          setManualGeoInput(citiesStr);
                        }}
                        className={`flex-1 min-w-[120px] font-semibold ${
                          cityPreset === count 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {count === '0' ? 'All Cities' : `Top ${count} Cities`}
                      </Button>
                    ))}
                    <Button 
                      variant={cityPreset === null && manualGeoInput ? "default" : "outline"}
                      onClick={() => {
                        setCityPreset(null);
                        if (!manualGeoInput) {
                          setManualGeoInput('');
                        }
                      }}
                      className={`flex-1 border-dashed font-semibold ${
                        cityPreset === null && manualGeoInput
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                          : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Enter cities manually (comma-separated, e.g., New York, NY, Los Angeles, CA, Chicago, IL)..."
                    value={targetType === 'CITY' ? manualGeoInput : manualCityInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setManualCityInput(value);
                      if (targetType === 'CITY') {
                        setManualGeoInput(value);
                      }
                      setCityPreset(null);
                    }}
                    rows={6}
                    className="bg-white/80"
                  />
                  {cityPreset && (
                    <p className="text-xs text-slate-500">
                      Showing {cityPreset === '0' ? 'all' : `top ${cityPreset}`} cities by income per capita for {targetCountry}
                    </p>
                  )}
                  {manualGeoInput && !cityPreset && (
                    <p className="text-xs text-slate-500">
                      Manual entry: {manualGeoInput.split(',').filter(c => c.trim()).length} city/cities entered
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="STATE" className="space-y-4">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {['10', '20', '30', '0'].map(count => (
                      <Button 
                        key={count}
                        variant={statePreset === count ? "default" : "outline"}
                        onClick={() => {
                          setStatePreset(count);
                          const states = getTopStatesByPopulation(targetCountry, count === '0' ? 0 : parseInt(count));
                          const statesStr = states.join(', ');
                          setManualStateInput(statesStr);
                          setManualGeoInput(statesStr);
                        }}
                        className={`flex-1 min-w-[120px] font-semibold ${
                          statePreset === count 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg' 
                            : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                        }`}
                      >
                        {count === '0' ? 'All States' : `Top ${count} States`}
                      </Button>
                    ))}
                    <Button 
                      variant={statePreset === null && manualGeoInput ? "default" : "outline"}
                      onClick={() => {
                        setStatePreset(null);
                        if (!manualGeoInput) {
                          setManualGeoInput('');
                        }
                      }}
                      className={`flex-1 border-dashed font-semibold ${
                        statePreset === null && manualGeoInput
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                          : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Entry
                    </Button>
                  </div>
                  <Textarea 
                    placeholder="Enter states/provinces manually (comma-separated, e.g., California, New York, Texas, Florida)..."
                    value={targetType === 'STATE' ? manualGeoInput : manualStateInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setManualStateInput(value);
                      if (targetType === 'STATE') {
                        setManualGeoInput(value);
                      }
                      setStatePreset(null);
                    }}
                    rows={6}
                    className="bg-white/80"
                  />
                  {statePreset && (
                    <p className="text-xs text-slate-500">
                      Showing {statePreset === '0' ? 'all' : `top ${statePreset}`} states/provinces by population for {targetCountry}
                    </p>
                  )}
                  {manualGeoInput && !statePreset && (
                    <p className="text-xs text-slate-500">
                      Manual entry: {manualGeoInput.split(',').filter(s => s.trim()).length} state(s)/province(s) entered
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
          <Button 
            size="lg" 
            onClick={() => {
              // Parse manualGeoInput into appropriate arrays before moving to next step
              if (targetType === 'STATE' && manualGeoInput) {
                const states = manualGeoInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
                setSelectedStates(states);
              } else if (targetType === 'CITY' && manualGeoInput) {
                const cities = manualGeoInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
                setSelectedCities(cities);
              } else if (targetType === 'ZIP' && manualGeoInput) {
                const zips = manualGeoInput.split(',').map(z => z.trim()).filter(z => z.length > 0);
                setSelectedZips(zips);
              }
              setStep(5);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            Review Campaign <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Step Indicator at Bottom */}
        <div className="mt-10">
          {renderStepIndicator()}
        </div>
      </div>
    );
  };

  // Step 5: Detailed Review - shows all ad groups with editable content
  const renderStep5 = () => {
    // Use preset ad groups if available (from preset), otherwise use dynamic ad groups
    let reviewAdGroups = presetAdGroups || getDynamicAdGroups();
    
    // Fallback: If no groups exist but we have keywords or ads, create a default structure
    if (reviewAdGroups.length === 0) {
      const formattedKeywords = applyMatchTypeFormatting(selectedKeywords);
      
      // First, try to create groups from unique ad groups in generatedAds
      const uniqueAdGroups = Array.from(new Set(generatedAds.map(ad => ad.adGroup).filter(Boolean))) as string[];
      
      if (uniqueAdGroups.length > 0) {
        // Use ad groups that already exist in generatedAds
        reviewAdGroups = uniqueAdGroups.map(adGroupName => {
          // Distribute keywords evenly across groups
          const keywordsPerGroup = Math.max(1, Math.ceil(formattedKeywords.length / uniqueAdGroups.length));
          const groupIndex = uniqueAdGroups.indexOf(adGroupName);
          const startIdx = groupIndex * keywordsPerGroup;
          const endIdx = Math.min(startIdx + keywordsPerGroup, formattedKeywords.length);
          const groupKeywords = formattedKeywords.slice(startIdx, endIdx);
          
          return {
            name: adGroupName,
            keywords: groupKeywords.length > 0 ? groupKeywords : formattedKeywords.slice(0, 1)
          };
        });
      } else if (generatedAds.length > 0 || formattedKeywords.length > 0) {
        // Create default groups based on keywords or ads
        if (formattedKeywords.length > 0) {
          const groupSize = Math.max(3, Math.ceil(formattedKeywords.length / 5));
          reviewAdGroups = [];
          for (let i = 0; i < formattedKeywords.length; i += groupSize) {
            reviewAdGroups.push({
              name: `Ad Group ${reviewAdGroups.length + 1}`,
              keywords: formattedKeywords.slice(i, i + groupSize)
            });
          }
        }
        
        // Ensure at least one group exists if we have ads
        if (reviewAdGroups.length === 0 && generatedAds.length > 0) {
          reviewAdGroups = [{
            name: 'Ad Group 1',
            keywords: formattedKeywords.length > 0 ? formattedKeywords.slice(0, 10) : ['default keyword']
          }];
        } else if (reviewAdGroups.length === 0 && formattedKeywords.length > 0) {
          // Last resort: single group with all keywords
          reviewAdGroups = [{
            name: 'Ad Group 1',
            keywords: formattedKeywords.slice(0, 20)
          }];
        }
      }
    }
    
    
    // Calculate stats based on actual data
    const totalAdGroups = reviewAdGroups.length;
    const totalKeywords = selectedKeywords.length;
    const totalAds = generatedAds.filter(ad => !ad.extensionType).length;
    const totalNegatives = negativeKeywords.split('\n').filter(n => n.trim()).length;

    // Helper to format keyword display (keywords already have match type formatting)
    const formatKeywordDisplay = (keyword: string) => {
      // Keywords are already formatted: broad=keyword, phrase="keyword", exact=[keyword]
      return keyword;
    };

    // Helper to get match type from keyword format
    const getMatchTypeDisplay = (keyword: string): string => {
      if (keyword.startsWith('[') && keyword.endsWith(']')) return 'Exact';
      if (keyword.startsWith('"') && keyword.endsWith('"')) return 'Phrase';
      return 'Broad';
    };

    const handleEditGroupName = (groupName: string) => {
      setEditingGroupName(groupName);
      setTempGroupName(groupName);
    };

    const handleSaveGroupName = (oldName: string) => {
      if (tempGroupName.trim()) {
        // Update ad group name in generatedAds
        setGeneratedAds(generatedAds.map(ad => 
          ad.adGroup === oldName ? { ...ad, adGroup: tempGroupName } : ad
        ));
      }
      setEditingGroupName(null);
    };

    const handleEditKeywords = (groupName: string, keywords: string[]) => {
      setEditingGroupKeywords(groupName);
      setTempKeywords(keywords.join(', '));
    };

    const handleSaveKeywords = (groupName: string) => {
      if (tempKeywords.trim()) {
        const newKeywords = tempKeywords.split(',').map(k => k.trim()).filter(Boolean);
        
        // Bug_36: Actually update the keywords
        // Get the current group to find which keywords to replace
        const currentGroup = reviewAdGroups.find(g => g.name === groupName);
        if (currentGroup) {
          // Remove old keywords from selectedKeywords
          const updatedKeywords = selectedKeywords.filter(kw => !currentGroup.keywords.includes(kw));
          // Add new keywords
          const finalKeywords = [...updatedKeywords, ...newKeywords];
          setSelectedKeywords(finalKeywords);
          
          // Update ads that belong to this group to reflect new keywords
          setGeneratedAds(prevAds => prevAds.map(ad => {
            if (ad.adGroup === groupName) {
              // Update ad content with new keywords if needed
              const rawKeyword = newKeywords[0] || currentGroup.keywords[0] || '';
              if (rawKeyword && ad.type === 'dki') {
                // Update DKI ad with new keyword (clean it first)
                const mainKeyword = cleanKeywordForDKI(rawKeyword);
                return {
                  ...ad,
                  headline1: `{KeyWord:${mainKeyword}} - Official Site`,
                  headline2: `Best {KeyWord:${mainKeyword}} Deals`,
                  headline3: `Order {KeyWord:${mainKeyword}} Online`,
                };
              }
            }
            return ad;
          }));
          
          notifications.success('Keywords updated successfully', {
            title: 'Keywords Saved',
            description: `Updated keywords for ${groupName}`,
          });
        }
      }
      setEditingGroupKeywords(null);
    };

    const handleEditNegatives = (groupName: string, negatives: string[]) => {
      setEditingGroupNegatives(groupName);
      setTempNegatives(negatives.join(', '));
    };

    const handleSaveNegatives = (groupName: string) => {
      if (tempNegatives.trim()) {
        // Bug_37: Save negative keywords per group instead of globally
        const newNegatives = tempNegatives.split(',').map(n => n.trim()).filter(Boolean);
        setGroupNegativeKeywords(prev => ({
          ...prev,
          [groupName]: newNegatives
        }));
        
        notifications.success('Negative keywords updated successfully', {
          title: 'Negative Keywords Saved',
          description: `Updated negative keywords for ${groupName}`,
        });
      }
      setEditingGroupNegatives(null);
    };

    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{totalAdGroups}</div>
              <div className="text-xs text-slate-600 mt-1">Ad Groups</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{totalKeywords}</div>
              <div className="text-xs text-slate-600 mt-1">Keywords</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalAds}</div>
              <div className="text-xs text-slate-600 mt-1">Ads</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{totalNegatives}</div>
              <div className="text-xs text-slate-600 mt-1">Negative Keywords</div>
            </CardContent>
          </Card>
        </div>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-2 border-emerald-300 rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-emerald-500 rounded-full p-2">
                <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 text-lg">Everything looks good!</h3>
                <p className="text-sm text-emerald-800 mt-1 font-medium">
                  Review and customize your {totalAdGroups} ad groups below. All groups have ads created.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                const validateButton = document.getElementById('validate-campaign-button');
                if (validateButton) {
                  validateButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              variant="outline"
              className="bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
            >
              <ChevronRight className="w-4 h-4 mr-2 rotate-90" />
              Click to go down
            </Button>
          </div>
        </div>

        {/* Review Table - Show All Groups */}
        <Card className="border-indigo-200/60 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                  <TableHead className="font-bold text-white w-[180px] py-4">AD GROUP</TableHead>
                  <TableHead className="font-bold text-white w-[320px] py-4">ADS & EXTENSIONS</TableHead>
                  <TableHead className="font-bold text-white w-[240px] py-4">KEYWORDS</TableHead>
                  <TableHead className="font-bold text-white w-[180px] py-4">NEGATIVES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewAdGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">No ad groups found</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {selectedKeywords.length === 0 
                              ? 'Please go back to Step 2 and generate/select keywords first.'
                              : generatedAds.length === 0
                              ? 'Please go back to Step 3 and create ads first.'
                              : 'Unable to organize your campaign data. Please check your settings.'}
                          </p>
                          <div className="flex gap-3 justify-center mt-4">
                            {selectedKeywords.length === 0 && (
                              <Button onClick={() => setStep(2)} variant="outline">
                                Go to Keywords Step
                              </Button>
                            )}
                            {selectedKeywords.length > 0 && generatedAds.length === 0 && (
                              <Button onClick={() => setStep(3)} variant="outline">
                                Go to Ads Step
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reviewAdGroups.map((group, idx) => {
                  // Match ads to group by name, or if no adGroup set, assign to first group or distribute
                  let groupAds = generatedAds.filter(ad => ad.adGroup === group.name && !ad.extensionType);
                  
                  // If no ads found for this group, try to match unassigned ads
                  if (groupAds.length === 0) {
                    const unassignedAds = generatedAds.filter(ad => 
                      (!ad.adGroup || ad.adGroup === 'ALL_AD_GROUPS' || ad.adGroup === '' || !ad.adGroup) && !ad.extensionType
                    );
                    if (unassignedAds.length > 0) {
                      // Distribute unassigned ads across groups
                      if (reviewAdGroups.length > 0) {
                        const adsPerGroup = Math.ceil(unassignedAds.length / reviewAdGroups.length);
                        const startIdx = idx * adsPerGroup;
                        const endIdx = Math.min(startIdx + adsPerGroup, unassignedAds.length);
                        groupAds = unassignedAds.slice(startIdx, endIdx);
                      } else {
                        // If we're the first/only group, show all unassigned ads
                        groupAds = unassignedAds;
                      }
                    }
                  }
                  
                  // If still no ads, check if there are ANY ads and show them in the first group
                  if (groupAds.length === 0 && idx === 0 && generatedAds.filter(ad => !ad.extensionType).length > 0) {
                    groupAds = generatedAds.filter(ad => !ad.extensionType).slice(0, 5); // Show first 5 ads
                  }
                  // Bug_37: Get negative keywords for this specific group, fallback to global if not set
                  const groupNegatives = groupNegativeKeywords[group.name] || negativeKeywords.split('\n').filter(n => n.trim());
                  const allNegatives = groupNegatives;
                  
                  return (
                    <TableRow key={idx} className={`border-b border-indigo-100/50 ${idx % 2 === 0 ? 'bg-white/60' : 'bg-indigo-50/40'} hover:bg-indigo-100/60 transition-colors`}>
                      {/* Ad Group Name */}
                      <TableCell className="align-top py-6">
                        {editingGroupName === group.name ? (
                          <div className="space-y-2">
                            <Input
                              value={tempGroupName}
                              onChange={(e) => setTempGroupName(e.target.value)}
                              className="text-sm border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveGroupName(group.name)}
                                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingGroupName(null)}
                                className="h-7 text-xs border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-indigo-900">{group.name}</span>
                            <button 
                              onClick={() => handleEditGroupName(group.name)}
                              className="p-1 hover:bg-indigo-100 rounded transition-colors"
                            >
                              <Edit3 className="w-3 h-3 text-indigo-500 hover:text-indigo-700" />
                            </button>
                          </div>
                        )}
                      </TableCell>

                      {/* Ads & Extensions - Show All Ads for This Group */}
                      <TableCell className="align-top py-6">
                        {groupAds.length > 0 ? (
                          <div className="space-y-3">
                            {groupAds.map((ad, adIdx) => (
                              <div key={ad.id || adIdx} className="space-y-2 text-sm border-b border-indigo-200/50 pb-3 last:border-0 last:pb-0 bg-gradient-to-r from-purple-50/30 to-indigo-50/30 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    {ad.type === 'rsa' && (
                                      <>
                                        <div className="text-indigo-700 font-semibold hover:text-purple-700 hover:underline cursor-pointer transition-colors">
                                          {ad.headline1} {ad.headline2 && `| ${ad.headline2}`} {ad.headline3 && `| ${ad.headline3}`}
                                        </div>
                                        <div className="text-emerald-600 font-medium text-xs mt-1">
                                          {ad.finalUrl || url || 'www.example.com'}/{ad.path1 || ''}/{ad.path2 || ''}
                                        </div>
                                        <div className="text-slate-700 text-xs mt-1.5 leading-relaxed">
                                          {ad.description1}
                                        </div>
                                        {ad.description2 && (
                                          <div className="text-slate-600 text-xs mt-1 leading-relaxed">
                                            {ad.description2}
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {ad.type === 'dki' && (
                                      <>
                                        <div className="text-purple-700 font-semibold hover:text-purple-800 hover:underline cursor-pointer transition-colors">
                                          {ad.headline1}
                                        </div>
                                        <div className="text-emerald-600 font-medium text-xs mt-1">
                                          {ad.finalUrl || url || 'www.example.com'}/{ad.path1 || ''}/{ad.path2 || ''}
                                        </div>
                                        <div className="text-slate-700 text-xs mt-1.5 leading-relaxed">
                                          {ad.description1}
                                        </div>
                                        {ad.description2 && (
                                          <div className="text-slate-600 text-xs mt-1 leading-relaxed">
                                            {ad.description2}
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {ad.type === 'callonly' && (
                                      <>
                                        <div className="text-indigo-700 font-bold">
                                          {ad.headline1}
                                        </div>
                                        {ad.headline2 && (
                                          <div className="text-purple-600 text-xs mt-1 font-medium">
                                            {ad.headline2}
                                          </div>
                                        )}
                                        <div className="text-slate-700 text-xs mt-1.5 leading-relaxed">
                                          {ad.description1}
                                        </div>
                                        {ad.description2 && (
                                          <div className="text-slate-600 text-xs mt-1 leading-relaxed">
                                            {ad.description2}
                                          </div>
                                        )}
                                        <div className="text-emerald-600 font-bold text-xs mt-2 flex items-center gap-1">
                                          <Phone className="w-3 h-3" /> {ad.phone} • {ad.businessName}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <button 
                                    onClick={() => {
                                      // Navigate to step 3 and select this ad group
                                      setSelectedAdGroup(group.name);
                                      setStep(3);
                                    }}
                                    className="p-1.5 hover:bg-indigo-100 rounded-md flex-shrink-0 transition-colors"
                                    title="Edit ad"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-indigo-500 hover:text-indigo-700" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                            No ad created. <button 
                              onClick={() => {
                                setSelectedAdGroup(group.name);
                                setStep(3);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline ml-1"
                            >
                              Create ad
                            </button>
                          </div>
                        )}
                      </TableCell>

                      {/* Keywords - Show All Keywords */}
                      <TableCell className="align-top py-6">
                        {editingGroupKeywords === group.name ? (
                          <div className="space-y-2">
                            <Textarea
                              value={tempKeywords}
                              onChange={(e) => setTempKeywords(e.target.value)}
                              className="text-xs border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                              rows={4}
                              placeholder="Enter keywords (comma-separated)"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveKeywords(group.name)}
                                className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingGroupKeywords(null)}
                                className="h-7 text-xs border-purple-300 text-purple-600 hover:bg-purple-50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(() => {
                              // Ensure we have keywords to display - use group keywords or fallback to all selected keywords
                              const keywordsToShow = group.keywords && group.keywords.length > 0 
                                ? group.keywords 
                                : applyMatchTypeFormatting(selectedKeywords);
                              const displayKeywords = expandedKeywords[group.name] 
                                ? keywordsToShow 
                                : keywordsToShow.slice(0, 10);
                              
                              if (displayKeywords.length === 0) {
                                return (
                                  <div className="text-xs text-slate-500 italic bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                    No keywords assigned
                                  </div>
                                );
                              }
                              
                              return (
                                <>
                                  {displayKeywords.map((kw, kidx) => (
                                    <div key={kidx} className="flex items-center justify-between text-xs bg-purple-50/50 px-2 py-1.5 rounded-md border border-purple-100">
                                      <span className="text-purple-900 font-mono font-medium">
                                        {formatKeywordDisplay(kw)}
                                      </span>
                                      <Badge variant="outline" className={`ml-2 text-xs ${
                                        getMatchTypeDisplay(kw) === 'Exact' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                        getMatchTypeDisplay(kw) === 'Phrase' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                        'bg-amber-100 text-amber-700 border-amber-300'
                                      }`}>
                                        {getMatchTypeDisplay(kw)}
                                      </Badge>
                                    </div>
                                  ))}
                                  {keywordsToShow.length > 10 && !expandedKeywords[group.name] && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setExpandedKeywords(prev => ({ ...prev, [group.name]: true }))}
                                      className="w-full h-7 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 mt-2"
                                    >
                                      <ChevronRight className="w-3 h-3 mr-1 rotate-90" />
                                      Show More ({keywordsToShow.length - 10} more keywords)
                                    </Button>
                                  )}
                                  {expandedKeywords[group.name] && keywordsToShow.length > 10 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setExpandedKeywords(prev => ({ ...prev, [group.name]: false }))}
                                      className="w-full h-7 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 mt-2"
                                    >
                                      <ChevronRight className="w-3 h-3 mr-1 -rotate-90" />
                                      Show Less
                                    </Button>
                                  )}
                                </>
                              );
                            })()}
                            <button 
                              onClick={() => handleEditKeywords(group.name, group.keywords)}
                              className="text-xs text-purple-600 hover:text-purple-700 font-semibold hover:underline mt-2 flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit keywords
                            </button>
                          </div>
                        )}
                      </TableCell>

                      {/* Negative Keywords */}
                      <TableCell className="align-top py-6">
                        {editingGroupNegatives === group.name ? (
                          <div className="space-y-2">
                            <Textarea
                              value={tempNegatives}
                              onChange={(e) => setTempNegatives(e.target.value)}
                              className="text-xs"
                              rows={4}
                              placeholder="Enter negative keywords (comma-separated)"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveNegatives(group.name)}
                                className="h-7 text-xs"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingGroupNegatives(null)}
                                className="h-7 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {allNegatives.length > 0 ? (
                              <>
                                {allNegatives.slice(0, 5).map((neg, nidx) => (
                                  <div key={nidx} className="text-xs text-red-700 font-mono bg-red-50/60 px-2 py-1 rounded border border-red-200">
                                    "{neg}"
                                  </div>
                                ))}
                                {allNegatives.length > 5 && (
                                  <div className="text-xs text-red-500 font-semibold bg-red-50/40 px-2 py-1 rounded border border-red-200">
                                    +{allNegatives.length - 5} more
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-xs text-slate-500 italic bg-slate-50 px-2 py-1 rounded border border-slate-200">
                                No negative keywords set
                              </div>
                            )}
                            <button 
                              onClick={() => handleEditNegatives(group.name, allNegatives)}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline mt-2 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              {allNegatives.length > 0 ? 'Edit negatives' : 'Add negatives'}
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(4)}>
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (confirm('Are you sure you want to reset? All progress will be lost.')) {
                  setStep(1);
                  setSelectedKeywords([]);
                  setGeneratedAds([]);
                }
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <Button 
            id="validate-campaign-button"
            size="lg" 
            onClick={() => setStep(6)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next - Validate Campaign
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Step Indicator at Bottom */}
        <div className="mt-10">
          {renderStepIndicator()}
        </div>
      </div>
    );
  };

  // Step 6: Final Success Screen
  const renderStep6 = () => {
    const handleExportCSV = async () => {
      if (!structureType) {
        notifications.error('Please select a campaign structure in Step 1', {
          title: 'Structure Required',
          description: 'You must choose a campaign structure (SKAG, STAG, or Mix) before exporting.',
        });
        return;
      }
      
      if (!campaignName || campaignName.trim() === '') {
        notifications.error('Please enter a campaign name in Step 1', {
          title: 'Campaign Name Required',
          description: 'A campaign name is required to export your campaign.',
        });
        return;
      }
      
      if (selectedKeywords.length === 0) {
        notifications.error('Please select keywords in Step 2', {
          title: 'Keywords Required',
          description: 'You must select at least one keyword before exporting your campaign.',
        });
        return;
      }
      
      const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
      if (!hasRegularAds) {
        notifications.error('Please create at least one ad in Step 3', {
          title: 'Ads Required',
          description: 'You must create at least one ad (RSA, DKI, or Call-Only) before exporting your campaign.',
        });
        return;
      }

      try {
        // Ensure URL is valid
        let validUrl = url || DEFAULT_URL;
        if (validUrl && !validUrl.match(/^https?:\/\//i)) {
          validUrl = 'https://' + validUrl;
        }
        if (!validUrl || validUrl.trim() === '') {
          notifications.error('Please provide a valid landing page URL in Step 1', { 
            title: 'Missing URL',
            description: 'A valid URL is required to export your campaign.'
          });
          return;
        }

        // Prepare ads with required fields - ensure all ads have final_url and meet Google Ads requirements
        const preparedAds = generatedAds
          .filter(ad => ad.type !== 'extension') // Filter out standalone extensions
          .map(ad => {
            // Ensure all required fields are present and valid
            const finalUrl = ad.finalUrl || ad.final_url || validUrl;
            
            // Validate final_url is not empty
            if (!finalUrl || finalUrl.trim() === '') {
              throw new Error('All ads must have a valid Final URL. Please ensure your landing page URL is set in Step 1.');
            }
            
            // Ensure headline1 exists and is within 30 chars
            let headline1 = ad.headline1 || 'Your Service Here';
            if (headline1.length > 30) {
              headline1 = headline1.substring(0, 30);
            }
            
            // Ensure description1 exists and is within 90 chars
            let description1 = ad.description1 || 'Get the best service today.';
            if (description1.length > 90) {
              description1 = description1.substring(0, 90);
            }
            
            // Truncate other headlines to 30 chars
            const truncateHeadline = (text: string) => text ? text.substring(0, 30) : '';
            const truncateDescription = (text: string) => text ? text.substring(0, 90) : '';
            const truncatePath = (text: string) => text ? text.substring(0, 15) : '';
            
            return {
              type: ad.type || 'rsa',
              headline1: headline1,
              headline2: truncateHeadline(ad.headline2 || ''),
              headline3: truncateHeadline(ad.headline3 || ''),
              headline4: truncateHeadline(ad.headline4 || ''),
              headline5: truncateHeadline(ad.headline5 || ''),
              description1: description1,
              description2: truncateDescription(ad.description2 || ''),
              final_url: finalUrl,
              path1: truncatePath(ad.path1 || ''),
              path2: truncatePath(ad.path2 || ''),
              extensions: ad.extensions || [] // Include extensions attached to ads
            };
          });

        // If no ads, create a default ad with valid URL
        const adsToUse = preparedAds.length > 0 ? preparedAds : [{
          type: 'rsa' as const,
          headline1: 'Your Service Here',
          description1: 'Get the best service today.',
          final_url: validUrl
        }];

        // Map targetType to geoType for structure generation
        const finalGeoType = targetType === 'COUNTRY' ? 'COUNTRY' : 
                             targetType === 'STATE' ? 'STATE' :
                             targetType === 'CITY' ? 'CITY' :
                             targetType === 'ZIP' ? 'ZIP' : geoType;
        
        // Parse location data from manualGeoInput if arrays are empty
        let finalSelectedStates = selectedStates;
        let finalSelectedCities = selectedCities;
        let finalSelectedZips = selectedZips;
        
        // If arrays are empty but manualGeoInput has data, parse it
        if (targetType === 'STATE' && finalSelectedStates.length === 0 && manualGeoInput) {
          finalSelectedStates = manualGeoInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
        } else if (targetType === 'CITY' && finalSelectedCities.length === 0 && manualGeoInput) {
          finalSelectedCities = manualGeoInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
        } else if (targetType === 'ZIP' && finalSelectedZips.length === 0 && manualGeoInput) {
          finalSelectedZips = manualGeoInput.split(',').map(z => z.trim()).filter(z => z.length > 0);
        }
        
        // Also check preset values if manual input is empty
        if (targetType === 'STATE' && finalSelectedStates.length === 0 && statePreset !== null) {
          finalSelectedStates = getTopStatesByPopulation(targetCountry, statePreset === '0' ? 0 : parseInt(statePreset));
        } else if (targetType === 'CITY' && finalSelectedCities.length === 0 && cityPreset !== null) {
          finalSelectedCities = getTopCitiesByIncome(targetCountry, cityPreset === '0' ? 0 : parseInt(cityPreset));
        }

        // Prepare settings for structure generation
        const settings: StructureSettings = {
          structureType,
          campaignName,
          keywords: selectedKeywords,
          matchTypes,
          url: validUrl,
          negativeKeywords: negativeKeywords.split('\n').filter(k => k.trim()),
          geoType: finalGeoType,
          selectedStates: finalSelectedStates,
          selectedCities: finalSelectedCities,
          selectedZips: finalSelectedZips,
          targetCountry,
          ads: adsToUse,
          intentGroups,
          selectedIntents,
          alphaKeywords,
          betaKeywords,
          funnelGroups,
          brandKeywords,
          nonBrandKeywords,
          competitorKeywords,
          smartClusters
        };

        // Generate campaign structure
        const structure = generateCampaignStructure(selectedKeywords, settings);
        
        // Validate CSV before export using comprehensive validators
        const validation = validateCSVBeforeExport(structure);
        const detailedValidation = validateCampaignForExport(structure);
        
        // Combine validation results - prioritize detailed validation errors
        const allErrors: string[] = [];
        const allWarnings: string[] = [];
        
        // Add errors from detailed validation (more comprehensive)
        if (detailedValidation.errors.length > 0) {
          detailedValidation.errors.forEach(err => {
            allErrors.push(err.message);
          });
        }
        
        // Add errors from V3 validation (if not already included)
        if (validation.errors.length > 0) {
          validation.errors.forEach(err => {
            if (!allErrors.some(e => e === err)) {
              allErrors.push(err);
            }
          });
        }
        
        // Add warnings from both validators
        if (detailedValidation.warnings.length > 0) {
          detailedValidation.warnings.forEach(warn => {
            allWarnings.push(warn.message);
          });
        }
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(warn => {
            if (!allWarnings.some(w => w === warn)) {
              allWarnings.push(warn);
            }
          });
        }
        
        // If any errors exist, block export
        if (allErrors.length > 0) {
          const errorMessage = allErrors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
          notifications.error(
            <div className="whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
              {errorMessage}
            </div>,
            { 
              title: '❌ CSV Validation Failed',
              description: 'Please fix the errors above before exporting. These errors will prevent Google Ads Editor from importing your campaign.',
              duration: 15000
            }
          );
          return;
        }
        
        // Show warnings if any (but still allow export)
        if (allWarnings.length > 0) {
          const warningMessage = allWarnings.map((warn, idx) => `${idx + 1}. ${warn}`).join('\n');
          notifications.warning(
            <div className="whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
              {warningMessage}
            </div>,
            { 
              title: '⚠️  CSV Validation Warnings',
              description: 'Your campaign will export, but consider fixing these warnings for better results.',
              duration: 10000
            }
          );
        }
        
        // Export to CSV using Google Ads Editor format with validation
        try {
          const filename = `${campaignName.replace(/[^a-z0-9]/gi, '_')}_google_ads_editor_${new Date().toISOString().split('T')[0]}.csv`;
          
          // Convert to CSV rows and validate
          const rows = campaignStructureToCSVRows(structure);
          const validation = validateCSVRows(rows);
          
          if (!validation.isValid) {
            const errorMessage = validation.errors.slice(0, 5).join('\n') + 
              (validation.errors.length > 5 ? `\n... and ${validation.errors.length - 5} more errors` : '');
            notifications.error('CSV validation failed', {
              title: '❌ Validation Errors',
              description: errorMessage,
              duration: 10000
            });
            return;
          }
          
          // Export with validation
          await exportCampaignToGoogleAdsEditorCSV(structure, filename);
          
          // Mark draft as completed (removes draft status in history)
          saveCompleted();
          
          const warningText = validation.warnings.length > 0 
            ? ` (${validation.warnings.length} warning${validation.warnings.length > 1 ? 's' : ''})`
            : '';
          
          notifications.success('Campaign exported successfully!', {
            title: '✅ Export Complete',
            description: `Your campaign "${campaignName}" has been exported to ${filename}${warningText}`,
            duration: 5000
          });
        } catch (error: any) {
          console.error('CSV export error:', error);
          notifications.error(
            error?.message || 'Failed to export campaign. Please try again.',
            { 
              title: '❌ Export Failed',
              description: 'There was an error exporting your campaign. Please check the console for details.',
              duration: 10000
            }
          );
          return;
        }
        
        // Bug_86: Save campaign to saved campaigns list after successful validation
        try {
          await historyService.save(
            'builder-2-campaign', // Changed from 'campaign' to 'builder-2-campaign' to match loadSavedCampaigns filter
            campaignName,
            {
              campaignName,
              structureType,
              step: 6,
              url,
              seedKeywords,
              negativeKeywords,
              selectedKeywords,
              generatedKeywords,
              generatedAds,
              targetCountry,
              targetType,
              manualGeoInput,
              selectedStates,
              selectedCities,
              selectedZips,
              geoType,
              matchTypes,
              adTypes,
              intentGroups,
              selectedIntents,
              alphaKeywords,
              betaKeywords,
              funnelGroups,
              brandKeywords,
              nonBrandKeywords,
              competitorKeywords,
              smartClusters,
              status: 'completed' // Add status field
            },
            'completed'
          );
          // Reload saved campaigns to show the newly saved one
          await loadSavedCampaigns();
        } catch (saveError) {
          console.error('Failed to save campaign:', saveError);
          // Don't block export if save fails
        }
        
        notifications.success('Campaign exported successfully!', { 
          title: '✅ Export Complete',
          description: `Generated ${structure.campaigns.length} campaign(s) with ${structure.campaigns.reduce((sum, c) => sum + c.adgroups.length, 0)} ad group(s). Ready for Google Ads Editor import.`
        });
      } catch (error) {
        console.error('Export error:', error);
        notifications.error(
          error instanceof Error ? error.message : 'An unexpected error occurred during export',
          { 
            title: '❌ Export Failed',
            description: 'Please try again or contact support if the issue persists.'
          }
        );
      }
    };

    // Calculate stats using dynamicAdGroups
    const reviewAdGroups = getDynamicAdGroups();
    const totalAdGroups = reviewAdGroups.length;
    const totalKeywords = selectedKeywords.length;
    const totalAds = generatedAds.filter(ad => !ad.extensionType).length;
    
    // Calculate number of locations
    let totalLocations = 0;
    if (structureType === 'geo') {
      if (targetType === 'STATE' && manualGeoInput) {
        const states = manualGeoInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
        totalLocations = statePreset === '0' ? getTopStatesByPopulation(targetCountry, 0).length : states.length;
      } else if (targetType === 'CITY' && manualGeoInput) {
        const cities = manualGeoInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
        totalLocations = cityPreset === '0' ? getTopCitiesByIncome(targetCountry, 0).length : cities.length;
      } else if (targetType === 'ZIP' && manualGeoInput) {
        const zips = manualGeoInput.split(',').map(z => z.trim()).filter(z => z.length > 0);
        totalLocations = zips.length;
      } else if (targetType === 'STATE' && selectedStates.length > 0) {
        totalLocations = selectedStates.length;
      } else if (targetType === 'CITY' && selectedCities.length > 0) {
        totalLocations = selectedCities.length;
      } else if (targetType === 'ZIP' && selectedZips.length > 0) {
        totalLocations = selectedZips.length;
      } else {
        totalLocations = 1; // Default to 1 if only country is selected
      }
    } else {
      totalLocations = 1; // Default to 1 for non-geo structures
    }

    // Get structure name
    const structureName = STRUCTURE_TYPES.find(s => s.id === structureType)?.name || 'Standard';

    return (
      <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-6xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Campaign Created Successfully!</h2>
            <p className="text-base text-slate-600">Your campaign is ready to export and implement</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-2 border-indigo-200/60 bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl sm:text-5xl font-bold text-indigo-600 mb-2">1</div>
                <div className="text-sm font-medium text-slate-700">Campaign</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200/60 bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">{totalAdGroups}</div>
                <div className="text-sm font-medium text-slate-700">Ad Groups</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-200/60 bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">{totalKeywords}</div>
                <div className="text-sm font-medium text-slate-700">Keywords</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200/60 bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">{totalLocations}</div>
                <div className="text-sm font-medium text-slate-700">Locations</div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Summary */}
          <Card className="border-2 border-slate-200 bg-white shadow-xl">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Campaign Summary</CardTitle>
                  <CardDescription className="text-sm mt-1">All checks passed - ready for export</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign Name</Label>
                  <Input 
                    value={campaignName} 
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Structure</Label>
                  <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                    <p className="font-semibold text-slate-900">{structureName}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Location</Label>
                  <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                    <p className="font-semibold text-slate-900">{targetCountry} {targetType !== 'COUNTRY' ? `(${targetType})` : ''}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Validation Complete</p>
                    <p className="text-sm text-slate-700">Your campaign is validated and ready to export. Click "Download CSV" below to get your file.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions - Centered */}
          <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 py-12 mt-12 border-t border-slate-200 pt-12">
            <Button 
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl py-1.5 px-4 w-full sm:w-auto text-sm font-semibold flex items-center justify-center gap-2 transition-all min-w-[140px]"
            >
              <Download className="w-3 h-3 flex-shrink-0" />
              <span>Download CSV for Google Ads Editor</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setActiveTab('saved')}
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-700 shadow-md hover:shadow-lg py-1.5 px-4 w-full sm:w-auto text-sm font-semibold flex items-center justify-center gap-2 transition-all min-w-[140px]"
            >
              <FolderOpen className="w-3 h-3 flex-shrink-0" />
              <span>View Saved Campaigns</span>
            </Button>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Button 
              variant="ghost" 
              onClick={() => setStep(5)} 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Review
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setCampaignName(generateDefaultCampaignName());
                  setSelectedKeywords([]);
                  setGeneratedAds([]);
                  setCurrentCampaignId(null);
                  setStructureType(null);
                }}
                className="text-sm font-medium border-slate-300 hover:bg-slate-50"
              >
                <Plus className="mr-2 w-4 h-4" />
                Create Another Campaign
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="text-sm font-medium border-slate-300 hover:bg-slate-50"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>

          {/* Step Indicator at Bottom */}
          <div className="mt-10">
            {renderStepIndicator()}
          </div>
        </div>
      </div>
    );
  };

  // Render Saved Campaigns view
  const renderSavedCampaigns = () => {
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'completed':
          return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
        case 'in_progress':
          return <Badge className="bg-blue-100 text-blue-700 border-blue-300">In Progress</Badge>;
        case 'started':
          return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Started</Badge>;
        default:
          return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Unknown</Badge>;
      }
    };

    const getStepLabel = (stepNum: number) => {
      const steps = ['Setup', 'Keywords', 'Ads & Extensions', 'Geo Target', 'Review', 'Validate'];
      return steps[stepNum - 1] || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Saved Campaigns
            </h1>
            <p className="text-slate-600">
              All your campaigns are automatically saved. Continue where you left off or start a new one.
            </p>
          </div>

          {savedCampaigns.length === 0 ? (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Saved Campaigns</h3>
                <p className="text-slate-500 mb-6">
                  Start creating a campaign and it will be automatically saved here.
                </p>
                <Button 
                  onClick={() => setActiveTab('builder')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCampaigns.map((campaign: any) => {
                const data = campaign.data || campaign;
                const status = data.status || 'started';
                const stepNum = data.step || 1;
                const timestamp = new Date(campaign.timestamp || data.timestamp);
                
                return (
                  <Card 
                    key={campaign.id} 
                    className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{campaign.name || data.campaignName || 'Unnamed Campaign'}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {timestamp.toLocaleString()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Structure:</span>
                          <span className="font-medium text-slate-700">
                            {STRUCTURE_TYPES.find(s => s.id === data.structureType)?.name || 'Not Selected'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Current Step:</span>
                          <span className="font-medium text-slate-700">{getStepLabel(stepNum)}</span>
                        </div>
                        {data.selectedKeywords && data.selectedKeywords.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Keywords:</span>
                            <span className="font-medium text-slate-700">{data.selectedKeywords.length}</span>
                          </div>
                        )}
                        {data.generatedAds && data.generatedAds.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Ads:</span>
                            <span className="font-medium text-slate-700">{data.generatedAds.length}</span>
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => loadCampaign(campaign)}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this campaign?')) {
                              deleteCampaign(campaign.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    if (!isInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 via-purple-50/30 to-indigo-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Campaign Builder...</p>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'saved') {
      return renderSavedCampaigns();
    }
    
    // Default to builder tab
    return (
      <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
        {(!step || (step < 1 || step > 6)) && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Initializing campaign builder...</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 via-purple-50/30 to-indigo-50">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'builder' | 'saved')} className="w-full">
        {/* Hidden tabs for functionality - user can still switch via code */}
        <div className="hidden">
          <TabsList className="w-full justify-start bg-transparent h-14 border-0 gap-2">
            <TabsTrigger value="builder">Campaign Builder</TabsTrigger>
            <TabsTrigger value="saved">Saved Campaigns</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="builder" className="mt-0">
          {renderContent()}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          {renderSavedCampaigns()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
