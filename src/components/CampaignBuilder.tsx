import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, Check, ChevronRight, ChevronDown, ChevronUp, Download, FileText, Globe, 
  Layout, Layers, MapPin, Mail, Hash, TrendingUp, Zap, 
  Phone, Repeat, Search, Sparkles, Edit3, Trash2, Save, RefreshCw, Clock,
  CheckCircle2, AlertCircle, ShieldCheck, AlertTriangle, Plus, Link2, Eye, 
  DollarSign, Smartphone, MessageSquare, Building2, FileText as FormIcon, 
  Tag, Image as ImageIcon, Gift, Upload, FileCheck, X
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
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { api } from '../utils/api';
import { generateKeywords as generateKeywordsFromGoogleAds } from '../utils/api/googleAds';
import { historyService } from '../utils/historyService';
import { KeywordPlanner } from './KeywordPlanner';
import { KeywordPlannerSelectable } from './KeywordPlannerSelectable';
import { LiveAdPreview } from './LiveAdPreview';
// import { CompactAdBuilder } from './CompactAdBuilder'; // Not used - using custom renderStep3 instead
import { notifications } from '../utils/notifications';
import { rateLimiter } from '../utils/rateLimiter';
import { usageTracker } from '../utils/usageTracker';
import { inputValidator } from '../utils/inputValidator';
import { adHistoryManager, type AdHistoryState } from '../utils/adHistory';
import { 
    generateAds, 
    detectUserIntent,
    type AdGenerationInput,
    type ResponsiveSearchAd,
    type ExpandedTextAd,
    type CallOnlyAd
} from '../utils/googleAdGenerator';
// Old CSV exporter imports removed - using new googleAdsCSVGenerator instead
import { generateGoogleAdsCSV, validateRows } from '../utils/googleAdsCSVGenerator';
import Papa from 'papaparse';
import { AutoFillButton } from './AutoFillButton';
import { generateCSVWithBackend } from '../utils/csvExportBackend';
import { generateCampaignName, generateSeedKeywords, generateNegativeKeywords, generateURL, generateLocationInput } from '../utils/autoFill';
import {
    validateURL,
    CANONICAL_HEADERS,
    type CSVRow,
    type CSVValidationResult,
} from '../utils/csvGeneratorV4';

// --- Constants & Mock Data ---

const GEO_SEGMENTATION = [
  { id: 'SKAG', name: 'SKAG', icon: Zap, description: 'Single Keyword Ad Group' },
  { id: 'STAG', name: 'STAG', icon: TrendingUp, description: 'Single Theme Ad Group' },
  { id: 'MIX', name: 'Mix', icon: Layers, description: 'Hybrid Structure' },
];

const GEO_OPTIONS = [
  { id: 'STANDARD', name: 'Standard', icon: Hash },
  { id: 'STATE', name: 'States', icon: MapPin },
  { id: 'CITY', name: 'Cities', icon: Layout },
  { id: 'ZIP', name: 'ZIPs', icon: Mail },
];

const MATCH_TYPES = [
    { id: 'broad', label: 'Broad Match', example: 'keyword' },
    { id: 'phrase', label: 'Phrase Match', example: '"keyword"' },
    { id: 'exact', label: 'Exact Match', example: '[keyword]' },
];

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
        "Wichita, KS", "Cleveland, OH", "Tampa, FL", "Bakersfield, CA", "Aurora, CO",
        "Honolulu, HI", "Anaheim, CA", "Santa Ana, CA", "St. Louis, MO", "Corpus Christi, TX",
        "Riverside, CA", "Lexington, KY", "Pittsburgh, PA", "Anchorage, AK", "Stockton, CA",
        "Cincinnati, OH", "St. Paul, MN", "Toledo, OH", "Greensboro, NC", "Newark, NJ",
        "Plano, TX", "Henderson, NV", "Lincoln, NE", "Buffalo, NY", "Jersey City, NJ",
        "Chula Vista, CA", "Fort Wayne, IN", "Orlando, FL", "St. Petersburg, FL", "Chandler, AZ",
        "Laredo, TX", "Norfolk, VA", "Durham, NC", "Madison, WI", "Lubbock, TX",
        "Irvine, CA", "Winston-Salem, NC", "Glendale, AZ", "Garland, TX", "Hialeah, FL",
        "Reno, NV", "Chesapeake, VA", "Gilbert, AZ", "Baton Rouge, LA", "Irving, TX",
        "Scottsdale, AZ", "North Las Vegas, NV", "Fremont, CA", "Boise, ID", "Richmond, VA",
        "Spokane, WA", "Birmingham, AL", "Rochester, NY", "Des Moines, IA", "Modesto, CA",
        "Fayetteville, NC", "Tacoma, WA", "Oxnard, CA", "Fontana, CA", "Columbus, GA",
        "Montgomery, AL", "Moreno Valley, CA", "Shreveport, LA", "Aurora, IL", "Yonkers, NY",
        "Akron, OH", "Huntington Beach, CA", "Little Rock, AR", "Amarillo, TX", "Glendale, CA",
        "Grand Rapids, MI", "Salt Lake City, UT", "Tallahassee, FL", "Huntsville, AL", "Grand Prairie, TX",
        "Knoxville, TN", "Worcester, MA", "Newport News, VA", "Brownsville, TX", "Overland Park, KS",
        "Santa Clarita, CA", "Providence, RI", "Garden Grove, CA", "Chattanooga, TN", "Oceanside, CA",
        "Jackson, MS", "Fort Lauderdale, FL", "Santa Rosa, CA", "Rancho Cucamonga, CA", "Port St. Lucie, FL",
        "Tempe, AZ", "Ontario, CA", "Vancouver, WA", "Sioux Falls, SD", "Springfield, MO",
        "Peoria, AZ", "Pembroke Pines, FL", "Elk Grove, CA", "Salem, OR", "Lancaster, CA",
        "Corona, CA", "Eugene, OR", "Palmdale, CA", "Salinas, CA", "Springfield, MA",
        "Pasadena, TX", "Fort Collins, CO", "Hayward, CA", "Pomona, CA", "Cary, NC",
        "Rockford, IL", "Alexandria, VA", "Escondido, CA", "McKinney, TX", "Kansas City, KS",
        "Joliet, IL", "Sunnyvale, CA", "Torrance, CA", "Bridgeport, CT", "Lakewood, CO",
        "Hollywood, FL", "Paterson, NJ", "Naperville, IL", "Syracuse, NY", "Mesquite, TX",
        "Dayton, OH", "Savannah, GA", "Clarksville, TN", "Orange, CA", "Pasadena, CA",
        "Fullerton, CA", "Killeen, TX", "Frisco, TX", "Hampton, VA", "McAllen, TX",
        "Warren, MI", "Bellevue, WA", "West Valley City, UT", "Columbia, SC", "Olathe, KS",
        "Sterling Heights, MI", "New Haven, CT", "Miramar, FL", "Waco, TX", "Thousand Oaks, CA",
        "Cedar Rapids, IA", "Charleston, SC", "Visalia, CA", "Topeka, KS", "Elizabeth, NJ",
        "Gainesville, FL", "Thornton, CO", "Roseville, CA", "Carrollton, TX", "Coral Springs, FL",
        "Stamford, CT", "Simi Valley, CA", "Concord, CA", "Hartford, CT", "Kent, WA",
        "Lafayette, LA", "Midland, TX", "Surprise, AZ", "Denton, TX", "Victorville, CA",
        "Evansville, IN", "Santa Clara, CA", "Abilene, TX", "Athens, GA", "Vallejo, CA",
        "Allentown, PA", "Norman, OK", "Beaumont, TX", "Independence, MO", "Murfreesboro, TN",
        "Ann Arbor, MI", "Berkeley, CA", "Provo, UT", "El Monte, CA", "Lansing, MI",
        "Fargo, ND", "Downey, CA", "Costa Mesa, CA", "Wilmington, NC", "Arvada, CO",
        "Inglewood, CA", "Miami Gardens, FL", "Carlsbad, CA", "Westminster, CO", "Rochester, MN",
        "Odessa, TX", "Manchester, NH", "Elgin, IL", "West Jordan, UT", "Round Rock, TX",
        "Clearwater, FL", "Waterbury, CT", "Gresham, OR", "Fairfield, CA", "Billings, MT",
        "Lowell, MA", "San Buenaventura, CA", "Pueblo, CO", "High Point, NC", "West Covina, CA",
        "Richmond, CA", "Murrieta, CA", "Cambridge, MA", "Antioch, CA", "Temecula, CA",
        "Norwalk, CA", "Centennial, CO", "Everett, WA", "Palm Bay, FL", "Wichita Falls, TX",
        "Green Bay, WI", "Daly City, CA", "Burbank, CA", "Richardson, TX", "Pompano Beach, FL",
        "North Charleston, SC", "Broken Arrow, OK", "Boulder, CO", "West Palm Beach, FL", "Santa Maria, CA",
        "El Cajon, CA", "Davenport, IA", "Rialto, CA", "Las Cruces, NM", "San Mateo, CA",
        "Lewisville, TX", "South Bend, IN", "Lakeland, FL", "Erie, PA", "Tyler, TX",
        "Pearland, TX", "College Station, TX", "Kenosha, WI", "Sandy Springs, GA", "Clovis, CA",
        "Flint, MI", "Roanoke, VA", "Albany, NY", "Jurupa Valley, CA", "Compton, CA",
        "San Angelo, TX", "Hillsboro, OR", "Lawton, OK", "Renton, WA", "Vista, CA",
        "Davie, FL", "Greeley, CO", "Mission Viejo, CA", "Portsmouth, VA", "Dearborn, MI",
        "South Gate, CA", "Tuscaloosa, AL", "Livonia, MI", "New Bedford, MA", "Vacaville, CA",
        "Brockton, MA", "Roswell, GA", "Beaverton, OR", "Quincy, MA", "Sparks, NV",
        "Yakima, WA", "Lee's Summit, MO", "Federal Way, WA", "Carson, CA", "Santa Monica, CA",
        "Hesperia, CA", "Allen, TX", "Rio Rancho, NM", "Yuma, AZ", "Westminster, CA",
        "Orem, UT", "Lynn, MA", "Redding, CA", "Spokane Valley, WA", "Miami Beach, FL",
        "League City, TX", "Lawrence, KS", "Santa Barbara, CA", "Plantation, FL", "Sandy, UT",
        "Bend, OR", "Hillsboro, OR", "Southaven, MS", "Boca Raton, FL", "Cape Coral, FL",
        "Boulder, CO", "Greenville, SC", "Waco, TX", "Dothan, AL", "San Luis Obispo, CA",
        "Bellingham, WA", "Prescott, AZ", "Flagstaff, AZ", "Asheville, NC", "Fort Myers, FL",
        "Santa Fe, NM", "Eugene, OR", "Olympia, WA", "Eau Claire, WI", "Bismarck, ND",
        "Rapid City, SD", "Fargo, ND", "Grand Forks, ND", "Sioux Falls, SD", "Rochester, MN",
        "Duluth, MN", "St. Cloud, MN", "Mankato, MN", "Winona, MN", "Moorhead, MN"
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
        "Swaffham Prior", "Reach", "Upware", "Wicken", "Soham",
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

// --- Helper Functions ---

const generateMockKeywords = (seeds: string, negatives: string) => {
    // Split seeds by newlines first
    let seedList = seeds.split('\n').filter(s => s.trim());
    
    // Auto-split long seeds (>40 chars) into individual keywords
    // This handles cases where user pastes long phrases
    const processedSeeds: string[] = [];
    seedList.forEach(seed => {
        const trimmed = seed.trim();
        if (trimmed.length > 40) {
            // Split by common delimiters and extract meaningful keywords
            const words = trimmed.split(/[\s,;]+/).filter(w => w.length > 2);
            
            // Remove consecutive duplicates
            const uniqueWords: string[] = [];
            words.forEach(word => {
                if (uniqueWords.length === 0 || uniqueWords[uniqueWords.length - 1].toLowerCase() !== word.toLowerCase()) {
                    uniqueWords.push(word);
                }
            });
            
            // Create 2-3 word phrases from the words
            for (let i = 0; i < uniqueWords.length; i++) {
                if (i + 1 < uniqueWords.length) {
                    processedSeeds.push(`${uniqueWords[i]} ${uniqueWords[i + 1]}`);
                }
                if (i + 2 < uniqueWords.length) {
                    processedSeeds.push(`${uniqueWords[i]} ${uniqueWords[i + 1]} ${uniqueWords[i + 2]}`);
                }
            }
        } else {
            processedSeeds.push(trimmed);
        }
    });
    
    seedList = [...new Set(processedSeeds)]; // Remove duplicates
    const negativeList = negatives.split('\n').filter(n => n.trim());
    
    // --- Mock Expansion Data ---
    const prefixes = [
        "best", "cheap", "affordable", "top rated", "local", "24/7", "emergency", 
        "fast", "reliable", "trusted", "discount", "premium", "luxury", "budget", 
        "online", "mobile", "professional", "expert", "certified", "licensed"
    ];
    
    const suffixes = [
        "near me", "services", "company", "experts", "consultants", "agency", 
        "prices", "rates", "reviews", "quote", "estimate", "cost", 
        "specialists", "solutions", "firm", "packages", "deals", "contractors"
    ];
    
    const locations = [
        "NYC", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", 
        "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
        "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", 
        "Seattle", "Denver", "Washington", "Boston", "El Paso", "Nashville", 
        "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", 
        "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa"
    ];

    const intents = [
        "buy", "hire", "find", "book", "reserve", "contact", "call", "get"
    ];

    let results: any[] = [];
    let idCounter = 0;

    // --- Generation Logic ---
    seedList.forEach((seed) => {
        const cleanSeed = seed.toLowerCase().trim();

        // 1. Seed Only
        results.push({ id: `k-${idCounter++}`, text: cleanSeed, volume: 'High', cpc: '$2.50', type: 'Seed' });

        // 2. Prefix + Seed (20 variants) - Only if result is reasonable length
        prefixes.forEach(prefix => {
            const keyword = `${prefix} ${cleanSeed}`;
            if (keyword.length <= 50) {
                results.push({ id: `k-${idCounter++}`, text: keyword, volume: 'Medium', cpc: '$3.10', type: 'Phrase' });
            }
        });

        // 3. Seed + Suffix (18 variants) - Only if result is reasonable length
        suffixes.forEach(suffix => {
            const keyword = `${cleanSeed} ${suffix}`;
            if (keyword.length <= 50) {
                results.push({ id: `k-${idCounter++}`, text: keyword, volume: 'High', cpc: '$2.80', type: 'Phrase' });
            }
        });

        // 4. Prefix + Seed + Suffix (360 potential variants -> Limit to ~50 random)
        for (let i = 0; i < 50; i++) {
            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const s = suffixes[Math.floor(Math.random() * suffixes.length)];
            const keyword = `${p} ${cleanSeed} ${s}`;
            if (keyword.length <= 60) {
                results.push({ id: `k-${idCounter++}`, text: keyword, volume: 'Low', cpc: '$1.50', type: 'Broad' });
            }
        }

        // 5. Intent + Seed (8 variants) - Only if result is reasonable length
        intents.forEach(intent => {
            const keyword = `${intent} ${cleanSeed}`;
            if (keyword.length <= 50) {
                results.push({ id: `k-${idCounter++}`, text: keyword, volume: 'High', cpc: '$3.50', type: 'Exact' });
            }
        });

        // 6. Seed + Location (35 variants) - Only if result is reasonable length
        locations.forEach(loc => {
            const keyword = `${cleanSeed} ${loc}`;
            if (keyword.length <= 50) {
                results.push({ id: `k-${idCounter++}`, text: keyword, volume: 'Medium', cpc: '$4.20', type: 'Local' });
            }
        });

        // 7. Prefix + Seed + Location (Limit to ~50 random)
        for (let i = 0; i < 50; i++) {
            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const l = locations[Math.floor(Math.random() * locations.length)];
            const keyword = `${p} ${cleanSeed} ${l}`;
            if (keyword.length <= 60) {
                results.push({ id: `k-${idCounter++}`, text: keyword, volume: 'Medium', cpc: '$3.90', type: 'Local' });
            }
        }
    });

    // Filter out negatives
    results = results.filter(r => !negativeList.some(n => r.text.includes(n)));

    // Bug_17: Remove duplicate keywords by text (case-insensitive)
    const seenTexts = new Set<string>();
    results = results.filter(kw => {
        const normalizedText = kw.text.toLowerCase().trim();
        if (seenTexts.has(normalizedText)) {
            return false; // Duplicate, skip
        }
        seenTexts.add(normalizedText);
        return true; // Unique, keep
    });

    // Ensure constraints: 500 <= Count <= 1000
    // If less than 500, duplicate with slight variation
    if (results.length < 500) {
        const needed = 500 - results.length;
        for (let i = 0; i < needed; i++) {
            const base = results[i % results.length];
            results.push({ 
                id: `k-${idCounter++}`, 
                text: `${base.text} today`, 
                volume: base.volume, 
                cpc: base.cpc, 
                type: 'Expanded' 
            });
        }
    }

    // Add natural variation: target 500-1000, but vary the actual count to avoid looking like demo data
    // Use a range of 550-950 to make it look more natural
    if (results.length > 950) {
        const variation = Math.floor(Math.random() * 400); // 0-400 variation
        const finalCount = 550 + variation; // Range: 550-950
        results = results.slice(0, Math.min(results.length, finalCount));
    } else if (results.length < 500) {
        // Keep the existing logic for minimum
        const needed = 500 - results.length;
        for (let i = 0; i < needed; i++) {
            const base = results[i % results.length];
            results.push({
                ...base,
                id: `k-${idCounter++}`,
                text: `${base.text} variant`,
                volume: 'Low',
                cpc: '$1.20'
            });
        }
    }

    // Shuffle results for "AI" feel
    results = results.sort(() => Math.random() - 0.5);

    return results;
};

// Bug_17: Helper function to remove duplicate keywords by text (case-insensitive)
const removeDuplicateKeywords = (keywords: any[]): any[] => {
    const seenTexts = new Map<string, any>();
    
    keywords.forEach(kw => {
        const normalizedText = (kw.text || '').toLowerCase().trim();
        if (normalizedText && !seenTexts.has(normalizedText)) {
            seenTexts.set(normalizedText, kw);
        }
    });
    
    return Array.from(seenTexts.values());
};

export const CampaignBuilder = ({ initialData }: { initialData?: any }) => {
    // --- State ---
    const [step, setStep] = useState(1);
    
    // Step 1: Structure
    const [structure, setStructure] = useState('SKAG');
    const [geo, setGeo] = useState('ZIP');
    const [matchTypes, setMatchTypes] = useState({ broad: true, phrase: true, exact: true });
    const [url, setUrl] = useState('');
    const [urlError, setUrlError] = useState('');
    const [campaignNameError, setCampaignNameError] = useState('');

    // Step 2: Keywords
    const [seedKeywords, setSeedKeywords] = useState('Call airline\nairline number\ncall united. number\ndelta phone number');
    const [negativeKeywords, setNegativeKeywords] = useState('cheap\ndiscount\nreviews\njob\nheadquater\napply\nfree\nbest\ncompany\ninformation\nwhen\nwhy\nwhere\nhow\ninformation\ncareer \nhiring\nscam\nHow\nWhen\nWhy\nWhere\nCareer\nJob\nReview\nFeedback\nInformation'); 
    const [generatedKeywords, setGeneratedKeywords] = useState<any[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
    const [keywordFilter, setKeywordFilter] = useState('');

    // Step 3: Ads
    const [ads, setAds] = useState({
        rsa: { headline1: '', headline2: '', headline3: '', description1: '', description2: '' },
        dki: { 
            headline1: '{Keyword:Service}', 
            headline2: '', 
            headline3: '', 
            description1: '', 
            description2: '',
            path1: '',
            path2: '' 
        },
        call: { 
            phone: '', 
            businessName: '', 
            headline1: '', 
            headline2: '', 
            description1: '', 
            description2: ''
        }
    });
    const [enabledAdTypes, setEnabledAdTypes] = useState<string[]>(['rsa', 'dki', 'call']);
    const ALL_AD_GROUPS_VALUE = 'ALL_AD_GROUPS';
    const [selectedAdGroup, setSelectedAdGroup] = useState(ALL_AD_GROUPS_VALUE);
    const [selectedAdIds, setSelectedAdIds] = useState<number[]>([]); // Track selected ads for ALL AD GROUPS mode
    const [activeBuilderTab, setActiveBuilderTab] = useState<'builder' | 'history'>('builder');
    const [selectedPreviewAdId, setSelectedPreviewAdId] = useState<number | null>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [lastActionDescription, setLastActionDescription] = useState<string | null>(null);
    
    // Ads state - MUST be declared before functions that use it
    const [generatedAds, setGeneratedAds] = useState<any[]>([]);
    const [editingAdId, setEditingAdId] = useState<number | null>(null);
    const [editingStarted, setEditingStarted] = useState<Set<number>>(new Set());
    const [history, setHistory] = useState<any[]>([]);
    const [searchHistory, setSearchHistory] = useState('');
    
    // State for editing in review page
    const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
    const [editingGroupKeywords, setEditingGroupKeywords] = useState<string | null>(null);
    const [editingGroupNegatives, setEditingGroupNegatives] = useState<string | null>(null);
    const [tempGroupName, setTempGroupName] = useState('');
    const [tempKeywords, setTempKeywords] = useState('');
    const [tempNegatives, setTempNegatives] = useState('');

    // Helper function to clean keyword for use as ad group name
    const cleanKeywordForAdGroupName = (keyword: string): string => {
        if (!keyword) return 'Ad Group';
        
        // Remove match type formatting: [keyword], "keyword", etc.
        let cleaned = keyword.trim();
        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
            cleaned = cleaned.slice(1, -1);
        } else if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1);
        }
        
        // Remove special characters that might cause issues
        cleaned = cleaned.replace(/[^\w\s-]/g, ' ').trim();
        
        // Truncate to max 50 characters (Google Ads limit is 255, but we keep it shorter for readability)
        if (cleaned.length > 50) {
            cleaned = cleaned.substring(0, 47) + '...';
        }
        
        // If empty after cleaning, use default
        if (!cleaned || cleaned.length === 0) {
            return 'Ad Group';
        }
        
        return cleaned;
    };

    // Generate dynamic ad groups based on structure and selected keywords
    // MUST be defined early to avoid "Cannot access before initialization" errors
    const getDynamicAdGroups = useCallback(() => {
        try {
            if (!selectedKeywords || selectedKeywords.length === 0) return [];
            if (!structure) return [];
            
            // Ensure selectedKeywords is an array
            const keywords = Array.isArray(selectedKeywords) ? selectedKeywords : [];
            if (keywords.length === 0) return [];
            
            type AdGroup = { name: string; keywords: string[] };
            
            if (structure === 'SKAG') {
                // Each keyword is its own ad group
                return keywords.slice(0, 20).map(kw => {
                    const keywordStr = typeof kw === 'string' ? kw : String(kw || '');
                    const cleanedName = cleanKeywordForAdGroupName(keywordStr);
                    return {
                        name: cleanedName,
                        keywords: [keywordStr]
                    };
                });
            } else if (structure === 'STAG') {
                // Group keywords thematically (simplified grouping)
                const groupSize = Math.max(3, Math.ceil(keywords.length / 5));
                const groups: AdGroup[] = [];
                for (let i = 0; i < keywords.length; i += groupSize) {
                    const groupKeywords = keywords.slice(i, i + groupSize).map(kw => typeof kw === 'string' ? kw : String(kw || ''));
                    groups.push({
                        name: `Ad Group ${groups.length + 1}`,
                        keywords: groupKeywords
                    });
                }
                return groups.slice(0, 10);
            } else {
                // Mix: Some SKAG, some STAG
                const groups: AdGroup[] = [];
                // First 5 as SKAG
                keywords.slice(0, 5).forEach(kw => {
                    const keywordStr = typeof kw === 'string' ? kw : String(kw || '');
                    const cleanedName = cleanKeywordForAdGroupName(keywordStr);
                    groups.push({
                        name: cleanedName,
                        keywords: [keywordStr]
                    });
                });
                // Rest grouped
                const remaining = keywords.slice(5);
                if (remaining.length > 0) {
                    const groupSize = Math.max(3, Math.ceil(remaining.length / 3));
                    for (let i = 0; i < remaining.length; i += groupSize) {
                        const groupKeywords = remaining.slice(i, i + groupSize).map(kw => typeof kw === 'string' ? kw : String(kw || ''));
                        groups.push({
                            name: `Mixed Group ${groups.length - 4}`,
                            keywords: groupKeywords
                        });
                    }
                }
                return groups.slice(0, 10);
            }
        } catch (error) {
            console.error('Error generating dynamic ad groups:', error);
            console.error('selectedKeywords:', selectedKeywords);
            console.error('structure:', structure);
            // Return a default ad group to prevent crash
            return [{
                name: 'Default Ad Group',
                keywords: Array.isArray(selectedKeywords) && selectedKeywords.length > 0 
                    ? selectedKeywords.slice(0, 10).map(kw => typeof kw === 'string' ? kw : String(kw || ''))
                    : []
            }];
        }
    }, [selectedKeywords, structure]);

    // Helper function to get current ad state (deep copy to maintain CSV structure)
    const getCurrentAdState = (): AdHistoryState => ({
        generatedAds: JSON.parse(JSON.stringify(generatedAds)), // Deep copy for CSV compatibility
        selectedAdIds: [...selectedAdIds],
        selectedPreviewAdId,
        timestamp: Date.now(),
    });

    // Helper function to save state before action
    const saveStateBeforeAction = (actionType: 'create' | 'delete' | 'edit' | 'duplicate', adId?: number, description?: string) => {
        const currentState = getCurrentAdState();
        adHistoryManager.saveState(actionType, currentState, adId, description);
        updateUndoRedoState();
    };

    // Update undo/redo button states
    const updateUndoRedoState = () => {
        setCanUndo(adHistoryManager.canUndo());
        setCanRedo(adHistoryManager.canRedo());
        setLastActionDescription(adHistoryManager.getLastActionDescription());
    };

    // Undo function - restores previous state while maintaining CSV structure
    const handleUndo = () => {
        const previousState = adHistoryManager.undo();
        if (previousState) {
            // Restore state - this maintains CSV export structure
            setGeneratedAds(previousState.generatedAds);
            setSelectedAdIds(previousState.selectedAdIds);
            setSelectedPreviewAdId(previousState.selectedPreviewAdId);
            setEditingAdId(null); // Clear any active editing
            setEditingStarted(new Set()); // Clear editing tracking
            updateUndoRedoState();
            
            notifications.success('Action undone', {
                title: 'Undo Successful',
                description: lastActionDescription || 'Last action has been undone. Your CSV export structure remains intact.',
            });
        } else {
            notifications.warning('Nothing to undo', {
                title: 'No Actions',
                description: 'There are no previous actions to undo.',
            });
        }
    };

    // Redo function - simplified for now (can be enhanced later)
    const handleRedo = () => {
        if (!adHistoryManager.canRedo()) {
            notifications.warning('Nothing to redo', {
                title: 'No Actions',
                description: 'There are no actions to redo.',
            });
            return;
        }
        
        // For now, just show info - redo requires storing forward states
        notifications.info('Redo functionality', {
            title: 'Redo',
            description: 'Redo is coming soon. Use Undo to revert changes step by step.',
        });
    };

    // Initialize undo/redo state
    useEffect(() => {
        updateUndoRedoState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatedAds.length, selectedAdIds.length, selectedPreviewAdId]);

    // Keyboard shortcut for undo (Ctrl+Z / Cmd+Z) - only active on Step 3
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle in Step 3 (Ads Creation) and not when typing in inputs
            if (step === 3 && (e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                const target = e.target as HTMLElement;
                // Don't trigger if user is typing in an input/textarea
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.contentEditable !== 'true') {
                    e.preventDefault();
                    if (canUndo) {
                        handleUndo();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, canUndo]);

    // Step 4: Geo Targeting
    const [targetCountry, setTargetCountry] = useState('United States');
    const [targetType, setTargetType] = useState('ZIP');
    const [manualGeoInput, setManualGeoInput] = useState('');
    const [zipPreset, setZipPreset] = useState<string | null>(null);
    const [cityPreset, setCityPreset] = useState<string | null>(null);
    const [statePreset, setStatePreset] = useState<string | null>(null);

    // Step 5: Review & Success
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [campaignName, setCampaignName] = useState('My Campaign');
    const [activeView, setActiveView] = useState<'builder' | 'saved'>('builder');
    const [savedCampaigns, setSavedCampaigns] = useState<any[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    // Step 6: CSV Generation
    const [csvGenerated, setCsvGenerated] = useState(false);
    const [csvContent, setCsvContent] = useState<string>('');
    const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
    const [csvValidation, setCsvValidation] = useState<{ fatalErrors: any[]; warnings: any[] } | null>(null);

    // Step 7: CSV Validation
    const [uploadedCsvFile, setUploadedCsvFile] = useState<File | null>(null);
    const [csvValidationResults, setCsvValidationResults] = useState<any>(null);
    const [isValidatingCsv, setIsValidatingCsv] = useState(false);
    const [expandedValidationStats, setExpandedValidationStats] = useState<Set<string>>(new Set());

    // Initialize campaign name with default date/time format
    useEffect(() => {
        if (!initialData) {
            const now = new Date();
            const day = now.getDate();
            const month = now.toLocaleString('en-US', { month: 'short' });
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, '0');
            const defaultName = `Search Campaign-${day}${month}-${displayHours}:${displayMinutes} ${ampm}`;
            setCampaignName(defaultName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // --- Load Initial Data ---
    useEffect(() => {
        if (initialData) {
            // Bug_58, Bug_59, Bug_70: Load all required data from initialData
            setStructure(initialData.structure || 'SKAG');
            setGeo(initialData.geo || 'ZIP');
            setMatchTypes(initialData.matchTypes || { broad: true, phrase: true, exact: true });
            setUrl(initialData.url || '');
            setSeedKeywords(initialData.seedKeywords || '');
            setNegativeKeywords(initialData.negativeKeywords || '');
            setGeneratedKeywords(initialData.generatedKeywords || []);
            setSelectedKeywords(initialData.selectedKeywords || []);
            setAds(initialData.ads || ads);
            setEnabledAdTypes(initialData.enabledAdTypes || ['rsa', 'dki', 'call']);
            setTargetCountry(initialData.targetCountry || 'United States');
            setTargetType(initialData.targetType || 'ZIP');
            setManualGeoInput(initialData.manualGeoInput || '');
            setZipPreset(initialData.zipPreset || null);
            setCityPreset(initialData.cityPreset || null);
            setStatePreset(initialData.statePreset || null);
            setCampaignName(initialData.name || 'Restored Campaign');
            // Load generatedAds if provided
            if (initialData.generatedAds && Array.isArray(initialData.generatedAds)) {
                setGeneratedAds(initialData.generatedAds);
            }
            // Jump to review step if loaded, otherwise start at step 1
            if (initialData.step) setStep(initialData.step);
        }
    }, [initialData]);

    // Keep ALL AD GROUPS selected by default, don't auto-switch
    // useEffect removed - we want to stay on ALL AD GROUPS by default

    const saveToHistory = async () => {
        // Bug_55: Validate campaign name - check if it's only blank spaces
        const trimmedName = campaignName.trim();
        if (!trimmedName) {
            setCampaignNameError('Campaign name is required');
            notifications.error('Campaign name cannot be empty or contain only blank spaces', {
                title: 'Validation Error',
                description: 'Please enter a valid campaign name.',
            });
            return;
        }
        setCampaignNameError('');
        
        // Use date/time as default name if campaign name is empty (shouldn't happen after validation, but keeping for safety)
        const nameToSave = trimmedName || `Campaign ${new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        })}`;
        
        // Update campaign name if it was empty
        if (!trimmedName) {
            setCampaignName(nameToSave);
        }

        setIsSaving(true);
        try {
            const campaignData = {
                step, 
                structure, 
                geo, 
                matchTypes, 
                url,
                seedKeywords, 
                negativeKeywords, 
                generatedKeywords, 
                selectedKeywords,
                ads, 
                enabledAdTypes, 
                targetCountry, 
                targetType, 
                manualGeoInput, 
                zipPreset,
                cityPreset,
                statePreset,
                generatedAds,
                name: nameToSave,
                isDraft: step < 6 // Mark as draft if not completed
            };

            await historyService.save('campaign', nameToSave, campaignData);
            
            // Refresh saved campaigns list
            await loadSavedCampaigns();
            
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 3000);
        } catch (error) {
            console.error("Save failed", error);
            notifications.error('Failed to save campaign. Please try again.', {
                title: 'Save Failed',
                description: 'There was an error saving your campaign. Please check your connection and try again.',
                priority: 'high',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const loadSavedCampaigns = async () => {
        setLoadingCampaigns(true);
        try {
            const allHistory = await historyService.getAll();
            // Filter only campaign type
            const campaigns = allHistory.filter(item => item.type === 'campaign');
            // Sort by timestamp (newest first)
            campaigns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setSavedCampaigns(campaigns);
        } catch (error) {
            console.error("Failed to load campaigns", error);
            // Fallback to localStorage - check the unified history storage
            try {
                const localData = localStorage.getItem('google-ads-history');
                if (localData) {
                    const allHistory = JSON.parse(localData);
                    const campaigns = allHistory.filter((item: any) => item.type === 'campaign');
                    campaigns.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    setSavedCampaigns(campaigns);
                }
            } catch (e) {
                console.error("Failed to load from localStorage", e);
            }
        } finally {
            setLoadingCampaigns(false);
        }
    };

    useEffect(() => {
        if (activeView === 'saved') {
            loadSavedCampaigns();
        }
    }, [activeView]);

    const handleLoadCampaign = (campaignData: any) => {
        // Load campaign data into the builder
        if (campaignData.data) {
            const data = campaignData.data;
            if (data.step) setStep(data.step);
            if (data.structure) setStructure(data.structure);
            if (data.geo) setGeo(data.geo);
            if (data.matchTypes) setMatchTypes(data.matchTypes);
            if (data.url) setUrl(data.url);
            if (data.seedKeywords) setSeedKeywords(data.seedKeywords);
            if (data.negativeKeywords) setNegativeKeywords(data.negativeKeywords);
            if (data.selectedKeywords) setSelectedKeywords(data.selectedKeywords);
            if (data.generatedAds) setGeneratedAds(data.generatedAds);
            if (data.targetCountry) setTargetCountry(data.targetCountry);
            if (data.targetType) setTargetType(data.targetType);
            if (data.manualGeoInput) setManualGeoInput(data.manualGeoInput);
            if (data.zipPreset !== undefined) setZipPreset(data.zipPreset);
            if (data.cityPreset !== undefined) setCityPreset(data.cityPreset);
            if (data.statePreset !== undefined) setStatePreset(data.statePreset);
            if (data.name) setCampaignName(data.name);
        }
        // Switch to builder view
        setActiveView('builder');
    };

    // --- Handlers ---

    const handleGenerateKeywords = async () => {
        // Input validation
        if (!seedKeywords.trim()) {
            notifications.warning('Please enter seed keywords to generate suggestions', {
                title: 'Missing Keywords',
                description: 'Enter at least one seed keyword to start generation.',
            });
            return;
        }

        // Validate keywords input
        const keywordValidation = inputValidator.validateKeywords(seedKeywords, 1, 50);
        if (!keywordValidation.valid) {
            notifications.error(keywordValidation.message || 'Invalid keywords', {
                title: 'Validation Error',
            });
            return;
        }

        // Check rate limit
        const rateLimit = await rateLimiter.checkLimit('keyword-generation');
        if (!rateLimit.allowed) {
            notifications.error(rateLimit.message || 'Rate limit exceeded', {
                title: 'Too Many Requests',
                description: 'Please wait before generating more keywords to prevent platform abuse.',
                priority: 'high',
            });
            return;
        }

        // Check usage quota
        const usage = await usageTracker.trackUsage('keyword-generation', 1);
        if (!usage.allowed) {
            notifications.error(usage.message || 'Usage limit exceeded', {
                title: 'Daily Limit Reached',
                description: 'You have reached your daily keyword generation limit. Please try again tomorrow or contact support.',
                priority: 'high',
            });
            return;
        }

        // Show warning if approaching limits
        const warning = await usageTracker.checkWarnings('keyword-generation');
        if (warning) {
            notifications.warning(warning, {
                title: 'Usage Warning',
            });
        }

        // Show loading notification
        const loadingToast = notifications.loading('Generating keywords...', {
            title: 'AI Keyword Generation',
            description: 'This may take a few moments. Please wait...',
        });

        setIsGeneratingKeywords(true);
        
        try {
        if (!projectId) {
             console.warn("Project ID is missing, using mock generation");
             // Use mock generation immediately
             // Generate immediately without delay for faster response
                 const mockKeywords = generateMockKeywords(seedKeywords, negativeKeywords);
                 // Bug_17: Remove duplicates by text (case-insensitive) before setting state
                 const deduplicatedKeywords = removeDuplicateKeywords(mockKeywords);
                 setGeneratedKeywords(deduplicatedKeywords);
                 setSelectedKeywords(deduplicatedKeywords.map((k: any) => k.id));
                 setIsGeneratingKeywords(false);
                 // Always dismiss loading toast
                 if (loadingToast && typeof loadingToast === 'function') {
                     loadingToast();
                 }
                    notifications.success(`Generated ${mockKeywords.length} keywords successfully`, {
                        title: 'Keywords Generated',
                        description: `Found ${mockKeywords.length} keyword suggestions based on your seed keywords.`,
                    });
             return;
        }

            console.log("Attempting Google Ads API keyword generation...");
            // Use Google Ads API with AI fallback
            const seedKeywordsArray = seedKeywords.split(',').map(k => k.trim()).filter(Boolean);
            const data = await generateKeywordsFromGoogleAds({
                seedKeywords: seedKeywordsArray,
                negativeKeywords: negativeKeywords.split(',').map(k => k.trim()).filter(Boolean),
                maxResults: 500
            });

            if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
                console.log("Google Ads API generation successful:", data.keywords.length, "keywords");                                                                     
                // Bug_17: Remove duplicates by text (case-insensitive) before setting state
                const deduplicatedKeywords = removeDuplicateKeywords(data.keywords);
                setGeneratedKeywords(deduplicatedKeywords);
                setSelectedKeywords(deduplicatedKeywords.map((k: any) => k.id));
                setIsGeneratingKeywords(false);
                // Always dismiss loading toast
                if (loadingToast && typeof loadingToast === 'function') {
                    loadingToast();
                }
                notifications.success(`Generated ${data.keywords.length} keywords successfully`, {
                    title: 'Keywords Generated',
                    description: `Google Ads API found ${data.keywords.length} keyword suggestions. Review and select the ones you want to use.`,                           
                });
            } else {
                throw new Error("No keywords returned from Google Ads API");
            }
        } catch (error) {
            console.log('ℹ️ Backend unavailable - using local fallback generation');
            // Fallback to mock generation
            const mockKeywords = generateMockKeywords(seedKeywords, negativeKeywords);
            // Bug_17: Remove duplicates by text (case-insensitive) before setting state
            const deduplicatedKeywords = removeDuplicateKeywords(mockKeywords);
            setGeneratedKeywords(deduplicatedKeywords);
            setSelectedKeywords(deduplicatedKeywords.map((k: any) => k.id));
            setIsGeneratingKeywords(false);
            // Always dismiss loading toast
            if (loadingToast && typeof loadingToast === 'function') {
                loadingToast();
            }
            notifications.info(`Generated ${mockKeywords.length} keywords using local generation`, {
                title: 'Keywords Generated (Offline Mode)',
                description: 'Using local generation. Some features may be limited.',
            });
        } finally {
            // Ensure loading state is always reset, even if something goes wrong
            setIsGeneratingKeywords(false);
            // Double-check: dismiss loading toast in finally block as well
            if (loadingToast && typeof loadingToast === 'function') {
                try {
                    loadingToast();
                } catch (e) {
                    console.warn('Error dismissing loading toast:', e);
                }
            }
        }
    };

    const handleNextStep = () => {
        if (step >= 6) return; // Don't go beyond step 6
        
        // Bug_18: Validate URL before proceeding from step 1
        if (step === 1) {
            const urlValue = url.trim();
            if (!urlValue) {
                setUrlError('Landing page URL is required');
                return;
            }
            if (!urlValue.match(/^https?:\/\/.+/i)) {
                setUrlError('Please enter a valid URL starting with http:// or https://');
                return;
            }
            setUrlError('');
        }
        
        const nextStep = step + 1;
        
        // Handle step-specific logic BEFORE incrementing
        if (step === 1) {
            // Moving from Step 1 to Step 2 - validation already done above
        } else if (step === 2) {
            // Validate selected keywords before proceeding
            if (!selectedKeywords || !Array.isArray(selectedKeywords) || selectedKeywords.length === 0) {
                notifications.error('Please select at least one keyword before proceeding', {
                    title: 'No Keywords Selected',
                    description: 'You must select keywords in Step 2 before creating ads.'
                });
                return;
            }
            
            // Validate that keywords are valid strings
            const validKeywords = selectedKeywords.filter(kw => kw && (typeof kw === 'string' || String(kw).trim().length > 0));
            if (validKeywords.length === 0) {
                notifications.error('Selected keywords are invalid. Please generate and select keywords again.', {
                    title: 'Invalid Keywords',
                    description: 'The selected keywords could not be processed. Please go back and regenerate keywords.'
                });
                return;
            }
            
            // Log selected keywords for campaign creation
            console.log(`✅ Proceeding to Ad Creation with ${validKeywords.length} selected keywords:`, validKeywords);
            console.log(`📊 Campaign Structure: ${structure}, Geo: ${geo}`);
            console.log(`🎯 Match Types:`, matchTypes);
            
            // Pre-fill ads based on URL/Keywords
            setAds(prev => ({
                ...prev,
                rsa: {
                    headline1: 'Best Service In Town',
                    headline2: 'Affordable & Reliable',
                    headline3: 'Call Us Today',
                    description1: 'We offer top-notch services with guaranteed satisfaction.',
                    description2: 'Visit our website to learn more about our offers.'
                },
                dki: {
                    headline1: '{Keyword:Service}',
                    headline2: 'Official Site',
                    headline3: 'Best Prices Online',
                    description1: 'Looking for {Keyword:Service}? We provide professional {Keyword:Service} with 100% satisfaction.',
                    description2: 'Get a free quote for {Keyword:Service} today. Expert team ready to help.',
                    path1: 'services',
                    path2: 'offers'
                },
                call: {
                    phone: '(555) 123-4567',
                    businessName: 'My Business',
                    headline1: 'Emergency Services',
                    headline2: 'Open 24/7',
                    description1: 'Call now for immediate assistance. We are available 24 hours a day.',
                    description2: 'Fast response times and affordable rates. Licensed and insured.'
                }
            }));
        } else if (step === 4) {
            // Trigger validation on entering step 5
            setValidationStatus('idle');
            runValidation();
        }
        
        // Increment step only once - wrap in try-catch to prevent crashes
        try {
        setStep(nextStep);
        
        // Bug_56: Scroll to top when navigating to next step
        window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error transitioning to next step:', error);
            notifications.error('Failed to proceed to next step', {
                title: 'Navigation Error',
                description: 'An error occurred while moving to the next step. Please try again.',
                priority: 'high'
            });
        }
    };

    const runValidation = () => {
        setValidationStatus('validating');
        setIsValidating(true);
        setTimeout(() => {
            setIsValidating(false);
            setValidationStatus('success');
        }, 2500);
    };

    const handleSaveCampaign = async () => {
        // Bug_55: Validate campaign name before saving
        const trimmedName = campaignName.trim();
        if (!trimmedName) {
            setCampaignNameError('Campaign name is required');
            notifications.error('Campaign name cannot be empty or contain only blank spaces', {
                title: 'Validation Error',
                description: 'Please enter a valid campaign name.',
            });
            return;
        }
        setCampaignNameError('');
        
        await saveToHistory();
        notifications.success('Campaign saved successfully', {
            title: 'Campaign Saved',
            description: `Your campaign "${trimmedName || 'Untitled Campaign'}" has been saved. You can access it from the History tab.`,
        });
    };

    const handleSaveDraft = async () => {
        await saveToHistory();
        notifications.info('Draft saved', {
            title: 'Draft Saved',
            description: 'Your campaign progress has been saved as a draft. Continue working on it anytime.',
        });
    };

    // Convert campaign data to CSV rows for validation and export
    // Old CSV functions removed - using new googleAdsCSVGenerator instead
    // const convertToCSVRows removed
    // const validateCSV removed  
    // const generateCSV removed
    
    // Placeholder to maintain line numbers - old functions removed
    const _oldCSVFunctionsRemoved = () => {
        const rows: CSVRow[] = [];
        const adGroups = getDynamicAdGroups();
        const campaignNameValue = campaignName || 'Campaign 1';
        const baseUrl = formatURL(url || 'www.example.com');
        const validAds = generatedAds.filter(ad => 
            ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'
        );
        
        // Convert keywords
        adGroups.forEach(group => {
            group.keywords.forEach(keyword => {
                const matchType = normalizeMatchType(getMatchType(keyword)) || 'Broad';
                const keywordText = extractKeywordText(keyword);
                
                rows.push({
                    [CANONICAL_HEADERS.CAMPAIGN]: campaignNameValue,
                    [CANONICAL_HEADERS.AD_GROUP]: group.name,
                    [CANONICAL_HEADERS.ROW_TYPE]: 'keyword',
                    [CANONICAL_HEADERS.STATUS]: 'Active',
                    [CANONICAL_HEADERS.KEYWORD]: keywordText,
                    [CANONICAL_HEADERS.MATCH_TYPE]: matchType,
                });
            });
        });
        
        // Convert ads
        adGroups.forEach(group => {
            const groupAds = validAds.filter(ad => 
                (ad.adGroup === group.name || ad.adGroup === ALL_AD_GROUPS_VALUE) && 
                (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly')
            );
            
            groupAds.forEach(ad => {
                let finalUrl = formatURL(ad.finalUrl || url || baseUrl);
                const urlValidation = validateURL(finalUrl);
                if (urlValidation.fixed) {
                    finalUrl = urlValidation.fixed;
                }
            
            if (ad.type === 'rsa' || ad.type === 'dki') {
                    rows.push({
                        [CANONICAL_HEADERS.CAMPAIGN]: campaignNameValue,
                        [CANONICAL_HEADERS.AD_GROUP]: group.name,
                        [CANONICAL_HEADERS.ROW_TYPE]: 'ad',
                        [CANONICAL_HEADERS.STATUS]: 'Active',
                        [CANONICAL_HEADERS.AD_TYPE]: 'Responsive Search Ad',
                        [CANONICAL_HEADERS.FINAL_URL]: finalUrl,
                        [CANONICAL_HEADERS.HEADLINE_1]: ad.headline1 || '',
                        [CANONICAL_HEADERS.HEADLINE_2]: ad.headline2 || '',
                        [CANONICAL_HEADERS.HEADLINE_3]: ad.headline3 || '',
                        [CANONICAL_HEADERS.HEADLINE_4]: ad.headline4 || '',
                        [CANONICAL_HEADERS.HEADLINE_5]: ad.headline5 || '',
                        [CANONICAL_HEADERS.DESCRIPTION_1]: ad.description1 || '',
                        [CANONICAL_HEADERS.DESCRIPTION_2]: ad.description2 || '',
                        [CANONICAL_HEADERS.PATH_1]: ad.path1 || '',
                        [CANONICAL_HEADERS.PATH_2]: ad.path2 || '',
                    });
                } else if (ad.type === 'callonly') {
                    rows.push({
                        [CANONICAL_HEADERS.CAMPAIGN]: campaignNameValue,
                        [CANONICAL_HEADERS.AD_GROUP]: group.name,
                        [CANONICAL_HEADERS.ROW_TYPE]: 'ad',
                        [CANONICAL_HEADERS.STATUS]: 'Active',
                        [CANONICAL_HEADERS.AD_TYPE]: 'Call-only Ad',
                        [CANONICAL_HEADERS.FINAL_URL]: finalUrl,
                        [CANONICAL_HEADERS.HEADLINE_1]: ad.headline1 || '',
                        [CANONICAL_HEADERS.HEADLINE_2]: ad.headline2 || '',
                        [CANONICAL_HEADERS.DESCRIPTION_1]: ad.description1 || '',
                        [CANONICAL_HEADERS.DESCRIPTION_2]: ad.description2 || '',
                        [CANONICAL_HEADERS.PHONE_NUMBER]: ad.phone || '',
                        [CANONICAL_HEADERS.COUNTRY_CODE]: 'US',
                    });
                }
            });
            
            // Convert extensions
            const groupExtensions = generatedAds.filter(ad => 
                (ad.adGroup === group.name || ad.adGroup === ALL_AD_GROUPS_VALUE) && 
                ad.extensionType
            );
            
            groupExtensions.forEach(ext => {
                if (ext.extensionType === 'sitelink') {
                    if (Array.isArray(ext.sitelinks)) {
                        ext.sitelinks.forEach((sitelink: any) => {
                            if (sitelink && sitelink.text) {
                                rows.push({
                                    [CANONICAL_HEADERS.CAMPAIGN]: campaignNameValue,
                                    [CANONICAL_HEADERS.AD_GROUP]: group.name,
                                    [CANONICAL_HEADERS.ROW_TYPE]: 'sitelink',
                                    [CANONICAL_HEADERS.STATUS]: 'Active',
                                    [CANONICAL_HEADERS.FINAL_URL]: formatURL(sitelink.url || url || baseUrl),
                                    [CANONICAL_HEADERS.ASSET_TYPE]: 'Sitelink',
                                    [CANONICAL_HEADERS.LINK_TEXT]: sitelink.text || '',
                                    [CANONICAL_HEADERS.DESCRIPTION_LINE_1]: sitelink.description || '',
                                });
                            }
                        });
                    }
                } else if (ext.extensionType === 'call') {
                    rows.push({
                        [CANONICAL_HEADERS.CAMPAIGN]: campaignNameValue,
                        [CANONICAL_HEADERS.AD_GROUP]: group.name,
                        [CANONICAL_HEADERS.ROW_TYPE]: 'call',
                        [CANONICAL_HEADERS.STATUS]: 'Active',
                        [CANONICAL_HEADERS.ASSET_TYPE]: 'Call',
                        [CANONICAL_HEADERS.PHONE_NUMBER]: ext.phone || '',
                        [CANONICAL_HEADERS.COUNTRY_CODE]: 'US',
                    });
                } else if (ext.extensionType === 'callout') {
                    if (Array.isArray(ext.callouts)) {
                        ext.callouts.forEach((callout: any) => {
                            if (callout && callout.text) {
                                rows.push({
                                    [CANONICAL_HEADERS.CAMPAIGN]: campaignNameValue,
                                    [CANONICAL_HEADERS.AD_GROUP]: group.name,
                                    [CANONICAL_HEADERS.ROW_TYPE]: 'callout',
                                    [CANONICAL_HEADERS.STATUS]: 'Active',
                                    [CANONICAL_HEADERS.ASSET_TYPE]: 'Callout',
                                    [CANONICAL_HEADERS.CALLOUT_TEXT]: callout.text || '',
                                });
                            }
                        });
                    }
                } else if (ext.extensionType === 'snippet') {
                    if (ext.header && Array.isArray(ext.values)) {
                        rows.push({
                            [CANONICAL_HEADERS.CAMPAIGN]: campaignNameValue,
                            [CANONICAL_HEADERS.AD_GROUP]: group.name,
                            [CANONICAL_HEADERS.ROW_TYPE]: 'structured snippet',
                            [CANONICAL_HEADERS.STATUS]: 'Active',
                            [CANONICAL_HEADERS.ASSET_TYPE]: 'Structured Snippet',
                            [CANONICAL_HEADERS.HEADER]: ext.header || '',
                            [CANONICAL_HEADERS.VALUES]: ext.values.join(', ') || '',
                        });
                    }
                }
            });
        });
        
        return rows;
    };

    // DEPRECATED: Old CSV validation - replaced with googleAdsCSVGenerator validation
    const validateCSV_DEPRECATED = (): { valid: boolean; errors: string[]; warnings: string[] } => {
        const adGroups = getDynamicAdGroups();
        const validAds = generatedAds.filter(ad => 
            ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'
        );
        
        // Basic structural checks first
        if (adGroups.length === 0) {
            return {
                valid: false,
                errors: ['No ad groups found. Please create at least one ad group.'],
                warnings: []
            };
        }
        
        if (selectedKeywords.length === 0) {
            return {
                valid: false,
                errors: ['No keywords found. Please add keywords to your campaign.'],
                warnings: []
            };
        }
        
        if (validAds.length === 0) {
            return {
                valid: false,
                errors: ['No ads found. Please create at least one ad.'],
                warnings: []
            };
        }
        
        // Convert to CSV rows and validate using comprehensive validation
        const csvRows = convertToCSVRows();
        const headers = Object.values(CANONICAL_HEADERS);
        const validation = validateCSVRows(csvRows, headers);
        
        // Convert validation errors/warnings to string format for backward compatibility
        const errors = validation.errors.map(err => 
            `ROW ${err.row}: ${err.message}`
        );
        const warnings = [
            ...validation.warnings.map(warn => 
                `ROW ${warn.row}: ${warn.message}${warn.suggestion ? ` — ${warn.suggestion}` : ''}`
            ),
            // Add additional warnings
            ...adGroups.filter(group => {
                const groupAds = validAds.filter(ad => 
                    ad.adGroup === group.name || ad.adGroup === ALL_AD_GROUPS_VALUE
                );
                return groupAds.length === 0;
            }).map(group => `Ad group "${group.name}" has no ads.`)
        ];
        
        return {
            valid: validation.valid,
            errors,
            warnings
        };
    };

    // Helper function to escape CSV values
    const escapeCSV = (value: string | null | undefined): string => {
        if (!value) return '';
        const str = String(value);
        // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Helper function to format URL
    const formatURL = (urlValue: string | null | undefined): string => {
        if (!urlValue) return '';
        let formatted = String(urlValue).trim();
        if (!formatted.match(/^https?:\/\//i)) {
            formatted = formatted.startsWith('www.') ? `https://${formatted}` : `https://${formatted}`;
        }
        return formatted;
    };

    const generateCSV = async () => {
        // Check rate limit
        const rateLimit = await rateLimiter.checkLimit('csv-export');
        if (!rateLimit.allowed) {
            notifications.error(rateLimit.message || 'Rate limit exceeded', {
                title: 'Too Many Exports',
                description: 'Please wait before exporting again to prevent platform abuse.',
                priority: 'high',
            });
            return;
        }

        // Check usage quota
        const usage = await usageTracker.trackUsage('csv-export', 1);
        if (!usage.allowed) {
            notifications.error(usage.message || 'Usage limit exceeded', {
                title: 'Daily Limit Reached',
                description: 'You have reached your daily export limit. Please try again tomorrow.',
                priority: 'high',
            });
            return;
        }

        // Validate before generating (safety check - validation should already be done before calling this)
        const validation = validateCSV();
        
        if (!validation.valid) {
            // Don't show notification here - it should have been shown before calling generateCSV
            // Just return silently to prevent duplicate error messages
            return;
        }
        
        // Warnings are handled before calling this function, so we can proceed silently
        
        const adGroups = getDynamicAdGroups();
        const campaignNameValue = campaignName || 'Campaign 1';
        const baseUrl = formatURL(url || 'www.example.com');
        
        // Prepare location targeting for backend
        const locationTargeting: any = {
            locations: []
        };
        
        // Add country
        if (targetCountry) {
            locationTargeting.locations.push({
                type: 'COUNTRY',
                code: targetCountry
            });
        }
        
        // Parse manual geo input based on target type
        if (manualGeoInput && manualGeoInput.trim()) {
            const locations = manualGeoInput.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
            locations.forEach(loc => {
                locationTargeting.locations.push({
                    type: targetType.toUpperCase(),
                    code: loc
                });
            });
        }
        
        // Use new backend CSV export
        try {
            await generateCSVWithBackend(
                campaignNameValue,
                adGroups.map(group => ({
                    name: group.name,
                    keywords: group.keywords || [],
                    negativeKeywords: negativeKeywords.split('\n').filter(k => k.trim())
                })),
                generatedAds.filter(ad => 
                    (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly')
                ),
                locationTargeting.locations.length > 0 ? locationTargeting : undefined,
                undefined, // budget
                'MANUAL_CPC', // bidding strategy
                negativeKeywords,
                ALL_AD_GROUPS_VALUE
            );
            return; // Exit early - generateCSVWithBackend handles everything
        } catch (error) {
            console.error('Backend CSV export failed, falling back to local generation:', error);
            // Fall through to local generation below
        }
        
        // Google Ads Editor compatible CSV format - all required columns
        // Following Google Ads Editor import format guidelines
        const headers = [
            "Campaign", "Ad Group", "Row Type", "Status",
            "Keywords", "Match Types", 
            "Final URL", "Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5",
            "Headline 6", "Headline 7", "Headline 8", "Headline 9", "Headline 10", "Headline 11",
            "Headline 12", "Headline 13", "Headline 14", "Headline 15",
            "Description 1", "Description 2", "Description 3", "Description 4",
            "Path 1", "Path 2",
            "Asset Type", "Link Text", "Description Line 1", "Description Line 2",
            "Phone Number", "Country Code",
            "Callout Text", "Header", "Values",
            "Location", "Location Target", "Target Type", "Bid Adjustment", "Is Exclusion"
        ];
        
        const rows: string[] = [];
        
        // Process each ad group
        adGroups.forEach(group => {
            // Get ads for this group: either ads specifically for this group OR ads for ALL AD GROUPS
            const groupAds = generatedAds.filter(ad => 
                (ad.adGroup === group.name || ad.adGroup === ALL_AD_GROUPS_VALUE) && 
                (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly')
            );
            
            // Export Keywords as separate rows
                group.keywords.forEach(keyword => {
                    const matchType = getMatchType(keyword);
                    const keywordText = keyword.replace(/^\[|\]$|^"|"$/g, ''); // Remove brackets/quotes
                
                const keywordRow: string[] = [
                    escapeCSV(campaignNameValue),  // 1. Campaign
                    escapeCSV(group.name),         // 2. Ad Group (singular per Google Ads format)
                    'keyword',                     // 3. Row Type
                    'Active',                      // 4. Status
                    escapeCSV(keywordText),        // 5. Keyword
                    matchType,                     // 6. Match Type
                    '',                            // 7. Final URL (empty for keyword rows)
                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // 8-22. Headlines 1-15 (15 empties)
                    '', '', '', '',                // 23-26. Descriptions 1-4 (4 empties)
                    '', '',                        // 27-28. Paths 1-2 (2 empties)
                    '', '', '', '',                // 29-32. Asset fields (4 empties)
                    '', '',                        // 33-34. Phone fields (2 empties)
                    '', '', '',                    // 35-37. Asset text fields (Callout Text, Header, Values)
                    '', '', '', '', ''             // 38-42. Location fields (Location, Location Target, Target Type, Bid Adjustment, Is Exclusion) - 5 fields
                ];
                rows.push(keywordRow.join(','));
            });
            
            // Export Ads as separate rows (Row Type: "ad") - only export valid ads with required fields
            groupAds.forEach(ad => {
                // Ensure Final URL is properly formatted first
                let finalUrl = formatURL(ad.finalUrl || url || baseUrl);
                if (!finalUrl || !finalUrl.match(/^https?:\/\//i)) {
                    // Fallback to baseUrl if ad.finalUrl is invalid
                    finalUrl = baseUrl;
                }
                
                // Validate required fields before exporting
                if (ad.type === 'rsa' || ad.type === 'dki') {
                    const hasRequiredFields = 
                        ad.headline1 && ad.headline1.trim() &&
                        ad.headline2 && ad.headline2.trim() &&
                        (ad.headline3 && ad.headline3.trim() || ad.headline2 && ad.headline2.trim()) &&
                        ad.description1 && ad.description1.trim() &&
                        ad.description2 && ad.description2.trim() &&
                        finalUrl && finalUrl.match(/^https?:\/\//i);
                    
                    if (!hasRequiredFields) {
                        console.warn(`Skipping RSA/DKI ad in "${group.name}" - missing required fields`);
                        return; // Skip this ad
                    }
                } else if (ad.type === 'callonly') {
                    const hasRequiredFields = 
                        ad.headline1 && ad.headline1.trim() &&
                        ad.headline2 && ad.headline2.trim() &&
                        (ad.headline3 && ad.headline3.trim() || ad.headline2 && ad.headline2.trim()) &&
                        ad.description1 && ad.description1.trim() &&
                        ad.description2 && ad.description2.trim() &&
                        finalUrl && finalUrl.match(/^https?:\/\//i);
                    
                    if (!hasRequiredFields) {
                        console.warn(`Skipping call-only ad in "${group.name}" - missing required fields`);
                        return; // Skip this ad
                    }
                }
                
                if (ad.type === 'rsa' || ad.type === 'dki') {
                    // Ensure all required fields are present
                    const headline1 = (ad.headline1 || '').trim();
                    const headline2 = (ad.headline2 || '').trim();
                    const headline3 = (ad.headline3 || headline2 || headline1 || '').trim(); // Fallback to headline2 or headline1
                    const description1 = (ad.description1 || '').trim();
                    const description2 = (ad.description2 || '').trim();
                    
                    // Skip if missing critical required fields
                    if (!headline1 || !headline2 || !headline3 || !description1 || !description2 || !finalUrl) {
                        console.warn(`Skipping ad in "${group.name}" - missing required fields`);
                        return;
                    }
                    
                    const adRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'ad',                                            // Row Type
                        'Active',                                        // Status
                        '',                                              // Keyword (empty for ad rows)
                        '',                                              // Match Type (empty for ad rows)
                        escapeCSV(finalUrl),                            // Final URL (required)
                        escapeCSV(headline1),                            // Headline 1 (required)
                        escapeCSV(headline2),                            // Headline 2 (required)
                        escapeCSV(headline3),                            // Headline 3 (required)
                        escapeCSV(ad.headline4 || ''),                  // Headline 4
                        escapeCSV(ad.headline5 || ''),                  // Headline 5
                        '', '', '', '', '', '', '', '', '', '', '', '', // Headlines 6-15 (empty)
                        escapeCSV(description1),                         // Description 1 (required)
                        escapeCSV(description2),                         // Description 2 (required)
                        escapeCSV(ad.description3 || ''),                // Description 3
                        escapeCSV(ad.description4 || ''),               // Description 4
                        escapeCSV(ad.path1 || ''),                      // Path 1
                        escapeCSV(ad.path2 || ''),                      // Path 2
                        '', '', '', '',                                 // Asset fields (empty)
                        '', '',                                         // Phone fields (empty)
                        '', '', '',                                     // Asset text fields (empty) - 3 fields
                        '', '', '', '', ''                              // Location fields (empty) - 5 fields
                    ];
                    rows.push(adRow.join(','));
                } else if (ad.type === 'callonly') {
                    // Call-only ads still use Row Type "ad" but need all required ad fields
                    // Ensure all required fields are present
                    const headline1 = (ad.headline1 || '').trim();
                    const headline2 = (ad.headline2 || '').trim();
                    const headline3 = (ad.headline3 || headline2 || headline1 || '').trim(); // Fallback to headline2 or headline1
                    const description1 = (ad.description1 || '').trim();
                    const description2 = (ad.description2 || '').trim();
                    
                    // Skip if missing critical required fields
                    if (!headline1 || !headline2 || !headline3 || !description1 || !description2 || !finalUrl) {
                        console.warn(`Skipping call-only ad in "${group.name}" - missing required fields`);
                        return;
                    }
                    
                    // Call-only ads still use Row Type "ad" but need all required ad fields
                    const adRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'ad',                                            // Row Type
                        'Active',                                        // Status
                        '',                                              // Keyword (empty for ad rows)
                        '',                                              // Match Type (empty for ad rows)
                        escapeCSV(finalUrl),                            // Final URL (required for ad)
                        escapeCSV(headline1),                            // Headline 1 (required)
                        escapeCSV(headline2),                            // Headline 2 (required)
                        escapeCSV(headline3),                            // Headline 3 (required for ad)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines 4-15 (empty)
                        escapeCSV(description1),                         // Description 1 (required)
                        escapeCSV(description2),                         // Description 2 (required)
                        '',                                              // Description 3 (empty)
                        '',                                              // Description 4 (empty)
                        '',                                              // Path 1 (empty)
                        '',                                              // Path 2 (empty)
                        '', '', '', '',                                 // Asset fields (empty)
                        '', '',                                          // Phone fields (empty - phone goes in call extension)
                        '', '', '',                                     // Asset text fields (empty) - 3 fields
                        '', '', '', '', ''                              // Location fields (empty) - 5 fields
                    ];
                    rows.push(adRow.join(','));
                    
                    // For call-only ads, also create a call extension row with the phone number
                    if (ad.phone && ad.phone.trim()) {
                        const callExtensionRow: string[] = [
                            escapeCSV(campaignNameValue),                // Campaign
                            escapeCSV(group.name),                      // Ad Group
                            'call',                                      // Row Type
                            'Active',                                    // Status
                            '', '',                                      // Keyword fields (empty)
                            '',                                          // Final URL (empty for call)
                            '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                            '', '', '', '',                              // Descriptions (empty)
                            '', '',                                      // Paths (empty)
                            'Call',                                      // Asset Type
                            '', '', '',                                  // Sitelink fields (empty)
                            escapeCSV(ad.phone.trim()),                  // Phone Number (required)
                            'US',                                        // Country Code (required)
                            '', '', '',                                  // Asset text fields (empty)
                            '', '', '', '', ''                           // Location fields (empty)
                        ];
                        rows.push(callExtensionRow.join(','));
                    }
                }
            });
            
            // Export Extensions as separate rows
            // Include extensions for this group OR extensions for ALL AD GROUPS
            const groupExtensions = generatedAds.filter(ad => 
                (ad.adGroup === group.name || ad.adGroup === ALL_AD_GROUPS_VALUE) && 
                ad.extensionType
            );
            
            groupExtensions.forEach(ext => {
                if (ext.extensionType === 'sitelink') {
                    // Each sitelink is a separate row
                    if (Array.isArray(ext.sitelinks)) {
                        ext.sitelinks.forEach((sitelink: any) => {
                            if (sitelink && sitelink.text) {
                                const sitelinkRow: string[] = [
                                    escapeCSV(campaignNameValue),        // Campaign
                                    escapeCSV(group.name),              // Ad Group (singular per Google Ads format)
                                    'sitelink',                          // Row Type
                                    'Active',                            // Status
                                    '', '',                              // Keyword fields (empty)
                                    escapeCSV(formatURL(sitelink.url || url || baseUrl)), // Final URL
                                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                                    '', '', '', '',                      // Descriptions (empty)
                                    '', '',                              // Paths (empty)
                                    'Sitelink',                          // Asset Type
                                    escapeCSV(sitelink.text || ''),      // Link Text
                                    escapeCSV(sitelink.description || ''), // Description Line 1
                                    '',                                  // Description Line 2
                                    '', '',                              // Phone fields (empty)
                                    '', '', '',                          // Asset text fields (empty) - 3 fields
                                    '', '', '', '', ''                   // Location fields (empty) - 5 fields
                                ];
                                rows.push(sitelinkRow.join(','));
                            }
                        });
                    }
                } else if (ext.extensionType === 'call') {
                    const callRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'call',                                          // Row Type
                        'Active',                                        // Status
                        '', '',                                          // Keyword fields (empty)
                        '',                                              // Final URL (empty for call)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                        '', '', '', '',                                  // Descriptions (empty)
                        '', '',                                          // Paths (empty)
                        'Call',                                          // Asset Type
                        '', '', '',                                      // Sitelink fields (empty)
                        escapeCSV(ext.phone || ''),                     // Phone Number
                        escapeCSV(ext.callTrackingEnabled ? 'US' : 'US'), // Country Code
                        '', '', '',                                     // Asset text fields (empty) - 3 fields
                        '', '', '', '', ''                              // Location fields (empty) - 5 fields
                    ];
                    rows.push(callRow.join(','));
                } else if (ext.extensionType === 'callout') {
                    // Each callout is a separate row
                    if (Array.isArray(ext.callouts)) {
                        ext.callouts.forEach((callout: string) => {
                            if (callout && callout.trim()) {
                                const calloutRow: string[] = [
                                    escapeCSV(campaignNameValue),        // Campaign
                                    escapeCSV(group.name),              // Ad Group (singular per Google Ads format)
                                    'callout',                           // Row Type
                                    'Active',                            // Status
                                    '', '',                              // Keyword fields (empty)
                                    '',                                  // Final URL (empty)
                                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                                    '', '', '', '',                      // Descriptions (empty)
                                    '', '',                              // Paths (empty)
                                    'Callout',                           // Asset Type
                                    '', '', '',                          // Sitelink fields (empty)
                                    '', '',                              // Phone fields (empty)
                                    escapeCSV(callout),                 // Callout Text
                                    '', '',                              // Header, Values (empty)
                                    '', '', '', '', ''                   // Location fields (empty)
                                ];
                                rows.push(calloutRow.join(','));
                            }
                        });
                    }
                } else if (ext.extensionType === 'snippet') {
                    // Structured snippet - one row per header/value combination
                    if (ext.header && Array.isArray(ext.values)) {
                        ext.values.forEach((value: string) => {
                            if (value && value.trim()) {
                                const snippetRow: string[] = [
                                    escapeCSV(campaignNameValue),        // Campaign
                                    escapeCSV(group.name),              // Ad Group (singular per Google Ads format)
                                    'structured snippet',               // Row Type
                                    'Active',                            // Status
                                    '', '',                              // Keyword fields (empty)
                                    '',                                  // Final URL (empty)
                                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                                    '', '', '', '',                      // Descriptions (empty)
                                    '', '',                              // Paths (empty)
                                    'Structured Snippet',               // Asset Type
                                    '', '', '',                          // Sitelink fields (empty)
                                    '', '',                              // Phone fields (empty)
                                    '',                                  // Callout Text (empty)
                                    escapeCSV(ext.header || ''),        // Header
                                    escapeCSV(value),                   // Values
                                    '', '', '', '', ''                   // Location fields (empty)
                                ];
                                rows.push(snippetRow.join(','));
                            }
                        });
                    }
                } else if (ext.extensionType === 'price') {
                    // Price extensions are typically managed at campaign level in Google Ads
                    // Export as asset with price information in description or custom field
                    const priceRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'price',                                         // Row Type
                        'Active',                                        // Status
                        '', '',                                          // Keyword fields (empty)
                        '',                                              // Final URL (empty)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                        escapeCSV(`${ext.priceQualifier || 'From'} ${ext.price || ''} ${ext.currency || 'USD'} ${ext.unit || ''}`), // Description 1 (price info)
                        '', '', '',                                      // Descriptions 2-4 (empty)
                        '', '',                                          // Paths (empty)
                        'Price',                                         // Asset Type
                        '', '', '',                                      // Sitelink fields (empty)
                        '', '',                                          // Phone fields (empty)
                        '', '', '',                                      // Asset text fields (empty)
                        '', '', '', '', ''                               // Location fields (empty)
                    ];
                    rows.push(priceRow.join(','));
                } else if (ext.extensionType === 'promotion') {
                    const promotionRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'promotion',                                      // Row Type
                        'Active',                                        // Status
                        '', '',                                          // Keyword fields (empty)
                        '',                                              // Final URL (empty)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                        '', '', '', '',                                  // Descriptions (empty)
                        '', '',                                          // Paths (empty)
                        'Promotion',                                     // Asset Type
                        '', '', '',                                      // Sitelink fields (empty)
                        '', '',                                          // Phone fields (empty)
                        escapeCSV(ext.promotionText || ''),            // Callout Text (using for promotion text)
                        '', '',                                          // Header, Values (empty)
                        '', '', '', '', ''                               // Location fields (empty)
                    ];
                    rows.push(promotionRow.join(','));
                } else if (ext.extensionType === 'message') {
                    const messageRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'message',                                       // Row Type
                        'Active',                                        // Status
                        '', '',                                          // Keyword fields (empty)
                        '',                                              // Final URL (empty)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                        '', '', '', '',                                  // Descriptions (empty)
                        '', '',                                          // Paths (empty)
                        'Message',                                       // Asset Type
                        '', '', '',                                      // Sitelink fields (empty)
                        escapeCSV(ext.phone || ''),                     // Phone Number
                        'US',                                            // Country Code
                        escapeCSV(ext.messageText || ''),              // Callout Text (using for message text)
                        '', '',                                          // Header, Values (empty)
                        '', '', '', '', ''                               // Location fields (empty)
                    ];
                    rows.push(messageRow.join(','));
                } else if (ext.extensionType === 'leadform') {
                    const leadformRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'leadform',                                      // Row Type
                        'Active',                                        // Status
                        '', '',                                          // Keyword fields (empty)
                        '',                                              // Final URL (empty)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                        '', '', '', '',                                  // Descriptions (empty)
                        '', '',                                          // Paths (empty)
                        'Lead Form',                                     // Asset Type
                        '', '', '',                                      // Sitelink fields (empty)
                        '', '',                                          // Phone fields (empty)
                        escapeCSV(ext.formName || ''),                  // Callout Text (using for form name)
                        '', '',                                          // Header, Values (empty)
                        '', '', '', '', ''                               // Location fields (empty)
                    ];
                    rows.push(leadformRow.join(','));
                } else if (ext.extensionType === 'location') {
                    // Location extension - business location info
                    // Note: Location extensions are typically managed separately in Google Ads
                    // Export basic location info
                    const locationExtRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group (singular per Google Ads format)
                        'location extension',                            // Row Type
                        'Active',                                        // Status
                        '', '',                                          // Keyword fields (empty)
                        '',                                              // Final URL (empty)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                        '', '', '', '',                                  // Descriptions (empty)
                        '', '',                                          // Paths (empty)
                        'Location Extension',                            // Asset Type
                        '', '', '',                                      // Sitelink fields (empty)
                        escapeCSV(ext.phone || ''),                     // Phone Number
                        'US',                                            // Country Code
                        '', '', '',                                      // Asset text fields (empty)
                        escapeCSV(ext.businessName || ext.addressLine1 || ext.city || ''), // Location
                        escapeCSV(`${ext.addressLine1 || ''}, ${ext.city || ''}, ${ext.state || ''} ${ext.postalCode || ''}`), // Location Target
                        'Business Location',                             // Target Type
                        '',                                              // Bid Adjustment
                        ''                                               // Is Exclusion
                    ];
                    rows.push(locationExtRow.join(','));
                }
            });
        });
        
        // Export Location Targeting Rows (Row Type: "location")
        // These are campaign-level location targets, not location extensions
        if (manualGeoInput && manualGeoInput.trim()) {
            const locations = manualGeoInput.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
            const targetTypeName = targetType === 'ZIP' ? 'Postal Code' : targetType === 'CITY' ? 'City' : targetType === 'STATE' ? 'State' : 'Location of interest';
            
            locations.forEach(location => {
                const locationRow: string[] = [
                    escapeCSV(campaignNameValue),                        // Campaign
                    '',                                                  // Ad Group (empty for campaign-level location targeting)
                    'location',                                          // Row Type
                    'Active',                                            // Status
                    '', '',                                              // Keyword fields (empty)
                    '',                                                  // Final URL (empty)
                    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                    '', '', '', '',                                      // Descriptions (empty)
                    '', '',                                              // Paths (empty)
                    '', '', '', '',                                      // Asset fields (empty)
                    '', '',                                              // Phone fields (empty)
                    '', '', '',                                          // Asset text fields (empty)
                    escapeCSV(location),                                 // Location
                    escapeCSV(location),                                 // Location Target
                    escapeCSV(targetTypeName),                           // Target Type
                    '',                                                  // Bid Adjustment (empty)
                    ''                                                   // Is Exclusion (empty, default is inclusion)
                ];
                rows.push(locationRow.join(','));
            });
        } else if (zipPreset || cityPreset || statePreset) {
            // For presets, we still need to export at least one location row indicating the targeting type
            const presetType = zipPreset ? 'Postal Code' : cityPreset ? 'City' : 'State';
            const presetCount = zipPreset ? parseInt(zipPreset.replace(/\D/g, '')) || 0 :
                               cityPreset ? (cityPreset === '0' ? 0 : parseInt(cityPreset.replace(/\D/g, '')) || 0) :
                               parseInt(statePreset?.replace(/\D/g, '') || '0') || 0;
            
            const locationRow: string[] = [
                escapeCSV(campaignNameValue),                            // Campaign
                '',                                                      // Ad Group (empty for campaign-level)
                'location',                                              // Row Type
                'Active',                                                // Status
                '', '',                                                  // Keyword fields (empty)
                '',                                                      // Final URL (empty)
                '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                '', '', '', '',                                          // Descriptions (empty)
                '', '',                                                  // Paths (empty)
                '', '', '', '',                                          // Asset fields (empty)
                '', '',                                                  // Phone fields (empty)
                '', '', '',                                              // Asset text fields (empty)
                escapeCSV(`${targetCountry || 'United States'} - ${presetCount} ${presetType}s`), // Location
                escapeCSV(`${targetCountry || 'United States'}`),       // Location Target
                escapeCSV(presetType),                                   // Target Type
                '',                                                      // Bid Adjustment
                ''                                                       // Is Exclusion
            ];
            rows.push(locationRow.join(','));
        } else if (targetCountry) {
            // At minimum, export the country as a location target
            const locationRow: string[] = [
                escapeCSV(campaignNameValue),                            // Campaign
                '',                                                      // Ad Group (empty for campaign-level)
                'location',                                              // Row Type
                'Active',                                                // Status
                '', '',                                                  // Keyword fields (empty)
                '',                                                      // Final URL (empty)
                '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines (empty)
                '', '', '', '',                                          // Descriptions (empty)
                '', '',                                                  // Paths (empty)
                '', '', '', '',                                          // Asset fields (empty)
                '', '',                                                  // Phone fields (empty)
                '', '', '',                                              // Asset text fields (empty)
                escapeCSV(targetCountry),                               // Location
                escapeCSV(targetCountry),                               // Location Target
                'Country',                                                // Target Type
                '',                                                      // Bid Adjustment
                ''                                                       // Is Exclusion
            ];
            rows.push(locationRow.join(','));
        }
        
        // Validate all rows have the correct number of fields (42)
        const headerCount = headers.length;
        const validatedRows = rows.filter(row => {
            // Count fields in row (handling CSV escaping)
            const fieldCount = (row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []).length;
            if (fieldCount !== headerCount) {
                console.warn(`Row has ${fieldCount} fields, expected ${headerCount}. Row: ${row.substring(0, 100)}...`);
                return false;
            }
            return true;
        });
        
        if (validatedRows.length !== rows.length) {
            console.warn(`Filtered out ${rows.length - validatedRows.length} invalid rows`);
        }
        
        // Combine headers and rows
        const csvContent = [headers.join(','), ...validatedRows].join('\n');
        
        // Create and download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${campaignNameValue.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        // Log success
        console.log(`✅ CSV exported successfully: ${validatedRows.length} rows, ${headerCount} columns`);
    };
    
    const getMatchType = (keyword: string): string => {
        if (keyword.startsWith('[') && keyword.endsWith(']')) return 'Exact';
        if (keyword.startsWith('"') && keyword.endsWith('"')) return 'Phrase';
        return 'Broad';
    };

    const applyZipPreset = (count: string) => {
        setZipPreset(count);
        setManualGeoInput(`[Auto-Generated List of Top ${count} ZIP Codes based on Population/Income]`);
    };

    // --- Render Steps ---

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between max-w-6xl mx-auto mb-12 px-4">
            {[
                { num: 1, label: 'Structure' },
                { num: 2, label: 'Keywords' },
                { num: 3, label: 'Ads' },
                { num: 4, label: 'Geo' },
                { num: 5, label: 'Review' },
                { num: 6, label: 'Validate' }
            ].map((s, idx) => (
                <div key={s.num} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                        step >= s.num 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
                            : 'bg-slate-100 text-slate-400'
                    }`}>
                        {s.num}
                    </div>
                    <span className={`ml-3 font-medium hidden sm:block ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>
                        {s.label}
                    </span>
                    {idx < 5 && (
                        <div className={`w-6 sm:w-12 h-1 mx-2 sm:mx-3 rounded-full ${step > s.num ? 'bg-indigo-200' : 'bg-slate-100'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    // Step 1: Structure & Settings
    const renderStep1 = () => {
        // Safety check: ensure all required state variables exist
        if (typeof campaignName === 'undefined' || typeof structure === 'undefined' || typeof geo === 'undefined') {
            console.error('CampaignBuilder: Missing required state variables', { campaignName, structure, geo });
            return (
                <div className="max-w-5xl mx-auto p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Initialization Error</h2>
                    <p className="text-slate-600">Please refresh the page to reload the component.</p>
                </div>
            );
        }

        // Safety check: ensure GEO_SEGMENTATION and GEO_OPTIONS are defined
        if (!Array.isArray(GEO_SEGMENTATION) || !Array.isArray(GEO_OPTIONS)) {
            console.error('CampaignBuilder: GEO_SEGMENTATION or GEO_OPTIONS is not an array', { GEO_SEGMENTATION, GEO_OPTIONS });
            return (
                <div className="max-w-5xl mx-auto p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Configuration Error</h2>
                    <p className="text-slate-600">Please refresh the page to reload the component.</p>
                </div>
            );
        }

        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Campaign Name */}
                <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Campaign Name
                        </CardTitle>
                        <CardDescription>Give your campaign a name to easily identify it later</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Input
                                value={campaignName || ''}
                                onChange={(e) => {
                                    setCampaignName(e.target.value);
                                    // Clear validation error when user starts typing
                                    if (campaignNameError) setCampaignNameError('');
                                }}
                                placeholder="Enter campaign name"
                                className={`text-lg py-6 bg-white border-slate-300 focus:border-indigo-500 ${campaignNameError ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                        </div>
                        {campaignNameError && (
                            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {campaignNameError}
                            </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                            This name will be used when saving and exporting your campaign
                        </p>
                    </CardContent>
                </Card>

                {/* Structure & Geo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-2 border-purple-200/60 bg-gradient-to-br from-purple-50/80 to-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-purple-600"/> Base Structure</CardTitle>
                            <CardDescription>Choose your campaign structure</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            {GEO_SEGMENTATION.map(item => {
                                const IconComponent = item.icon;
                                if (!IconComponent) {
                                    console.warn('CampaignBuilder: Missing icon for GEO_SEGMENTATION item', item);
                                    return null;
                                }
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setStructure(item.id)}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                                            structure === item.id 
                                            ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200' 
                                            : 'border-purple-200 hover:border-purple-300 bg-white hover:bg-purple-50'
                                        }`}
                                    >
                                        <IconComponent className={`w-6 h-6 ${structure === item.id ? 'text-white' : 'text-purple-600'}`} />
                                        <span className="font-semibold text-sm">{item.name}</span>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-600"/> Geo Strategy</CardTitle>
                            <CardDescription>Select geographic targeting</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-4 gap-3">
                            {GEO_OPTIONS.map(item => {
                                const IconComponent = item.icon;
                                if (!IconComponent) {
                                    console.warn('CampaignBuilder: Missing icon for GEO_OPTIONS item', item);
                                    return null;
                                }
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setGeo(item.id)}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                                            geo === item.id 
                                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200' 
                                            : 'border-emerald-200 hover:border-emerald-300 bg-white hover:bg-emerald-50'
                                        }`}
                                    >
                                        <IconComponent className={`w-5 h-5 ${geo === item.id ? 'text-white' : 'text-emerald-600'}`} />
                                        <span className="font-semibold text-xs">{item.name}</span>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

            {/* Match Type & URL */}
            <Card className="border-2 border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        Campaign Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Horizontal Match Types */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-600" />
                            Match Types
                        </Label>
                        <p className="text-sm text-slate-600">Select which keyword match types to include in your campaign</p>
                        <div className="flex flex-wrap items-center gap-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200/50">
                            {/* Broad Match */}
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-all">
                                <input 
                                    type="checkbox"
                                    id="match-type-broad"
                                    checked={matchTypes.broad}
                                    onChange={(e) => {
                                        setMatchTypes(prev => ({
                                            ...prev,
                                            broad: e.target.checked
                                        }));
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                                />
                                <Label 
                                    htmlFor="match-type-broad"
                                    className="cursor-pointer font-medium text-slate-700 select-none"
                                >
                                    Broad Match <span className="text-blue-500 font-mono text-xs ml-1">keyword</span>
                                </Label>
                            </div>

                            {/* Phrase Match */}
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-all">
                                <input 
                                    type="checkbox"
                                    id="match-type-phrase"
                                    checked={matchTypes.phrase}
                                    onChange={(e) => {
                                        setMatchTypes(prev => ({
                                            ...prev,
                                            phrase: e.target.checked
                                        }));
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                                />
                                <Label 
                                    htmlFor="match-type-phrase"
                                    className="cursor-pointer font-medium text-slate-700 select-none"
                                >
                                    Phrase Match <span className="text-blue-500 font-mono text-xs ml-1">&quot;keyword&quot;</span>
                                </Label>
                            </div>

                            {/* Exact Match */}
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg hover:shadow-md transition-all">
                                <input 
                                    type="checkbox"
                                    id="match-type-exact"
                                    checked={matchTypes.exact}
                                    onChange={(e) => {
                                        setMatchTypes(prev => ({
                                            ...prev,
                                            exact: e.target.checked
                                        }));
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                                />
                                <Label 
                                    htmlFor="match-type-exact"
                                    className="cursor-pointer font-medium text-slate-700 select-none"
                                >
                                    Exact Match <span className="text-blue-500 font-mono text-xs ml-1">[keyword]</span>
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-3">
                        <Label htmlFor="url" className="text-base">Landing Page URL</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input 
                                id="url"
                                placeholder="https://www.example.com/landing-page" 
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    // Clear validation error when user starts typing
                                    if (urlError) setUrlError('');
                                }}
                                onBlur={(e) => {
                                    // Bug_18: Validate URL on blur
                                    const urlValue = e.target.value.trim();
                                    if (urlValue && !urlValue.match(/^https?:\/\/.+/i)) {
                                        setUrlError('Please enter a valid URL starting with http:// or https://');
                                    } else {
                                        setUrlError('');
                                    }
                                }}
                                className={`pl-10 pr-4 py-6 text-lg bg-white ${urlError ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                        </div>
                        {urlError && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {urlError}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button 
                    size="lg"
                    onClick={handleNextStep}
                    disabled={!url}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-lg shadow-indigo-200"
                >
                    Next Step <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );

    // Step 2: Keyword Planning - Using selectable KeywordPlanner component
    const renderStep2 = () => {
        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Use the selectable KeywordPlanner component */}
                <KeywordPlannerSelectable 
                    initialData={{
                        seedKeywords,
                        negativeKeywords,
                        matchTypes
                    }}
                    onKeywordsSelected={(keywords) => {
                        // Ensure keywords are always strings and valid
                        const validKeywords = Array.isArray(keywords) 
                            ? keywords.map(kw => typeof kw === 'string' ? kw : String(kw || '')).filter(Boolean)
                            : [];
                        setSelectedKeywords(validKeywords);
                    }}
                    selectedKeywords={selectedKeywords}
                    onNegativeKeywordsChange={(newNegativeKeywords) => setNegativeKeywords(newNegativeKeywords)}
                />
                
                <div className="flex justify-between pt-6 border-t border-slate-200">
                    <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800">
                        Back to Structure
                    </Button>
                    <Button 
                        size="lg" 
                        onClick={handleNextStep}
                        disabled={selectedKeywords.length === 0}
                        className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue to Ads ({selectedKeywords.length} keywords selected) <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    };

    // Old Step 2 code removed - replaced with KeywordPlanner component above
    const renderStep2Old = () => {
        const filteredKeywords = generatedKeywords.filter(kw => 
            kw.text.toLowerCase().includes(keywordFilter.toLowerCase())
        );

        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 hidden">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Left Panel: Strategy & Inputs */}
                    <div className="w-full lg:w-1/3 space-y-6">
                         <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-indigo-600"/> Keyword Strategy
                            </h2>
                            <p className="text-slate-500">Define your core topics and exclusions to generate high-relevance keywords.</p>
                        </div>

                        <Card className="border-indigo-100 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Search className="w-4 h-4 text-indigo-500"/> Seed Keywords
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea 
                                    placeholder="e.g. plumber near me&#10;emergency plumbing&#10;cheap plumber" 
                                    className="min-h-[200px] bg-slate-50/50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm resize-none"
                                    value={seedKeywords}
                                    onChange={(e) => setSeedKeywords(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3"/> Enter 3-5 main topics for best results.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                                    <ShieldCheck className="w-4 h-4 text-slate-500"/> Negative Keywords
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea 
                                    placeholder="e.g. free, job, career..." 
                                    className="min-h-[100px] bg-slate-50/50 border-slate-200 font-mono text-sm resize-none"
                                    value={negativeKeywords}
                                    onChange={(e) => setNegativeKeywords(e.target.value)}
                                />
                            </CardContent>
                        </Card>

                        <Button 
                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5" 
                            onClick={handleGenerateKeywords}
                            disabled={isGeneratingKeywords || !seedKeywords.trim()}
                        >
                            {isGeneratingKeywords ? (
                                <><RefreshCw className="w-5 h-5 mr-2 animate-spin"/> AI Generating...</>
                            ) : (
                                <><Sparkles className="w-5 h-5 mr-2"/> Generate Suggestions</>
                            )}
                        </Button>
                    </div>

                    {/* Right Panel: Results */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Generated Opportunities</h2>
                                <p className="text-slate-500">Select the keywords you want to add to your campaign.</p>
                            </div>
                            {generatedKeywords.length > 0 && (
                                <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
                                    <span className="text-sm font-semibold text-slate-600">Selected:</span>
                                    <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 text-base px-3">
                                        {selectedKeywords.length}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl min-h-[600px] flex flex-col overflow-hidden">
                             {generatedKeywords.length > 0 ? (
                                <>
                                    <div className="p-4 border-b border-slate-100 bg-white/50 flex gap-4 items-center">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                                            <Input 
                                                placeholder="Filter keywords..." 
                                                value={keywordFilter}
                                                onChange={(e) => setKeywordFilter(e.target.value)}
                                                className="pl-9 bg-white border-slate-200"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="font-medium text-slate-900">{filteredKeywords.length}</span> results
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-hidden">
                                        <ScrollArea className="h-[540px]">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                                                    <TableRow className="hover:bg-slate-50 border-slate-200">
                                                        <TableHead className="w-12 pl-4">
                                                            <Checkbox 
                                                                checked={filteredKeywords.length > 0 && filteredKeywords.every(k => selectedKeywords.includes(k.id))}
                                                                onCheckedChange={(c) => {
                                                                    if (c) {
                                                                        const newSelected = [...new Set([...selectedKeywords, ...filteredKeywords.map(k => k.id)])];
                                                                        setSelectedKeywords(newSelected);
                                                                    } else {
                                                                        const toRemove = filteredKeywords.map(k => k.id);
                                                                        setSelectedKeywords(selectedKeywords.filter(id => !toRemove.includes(id)));
                                                                    }
                                                                }}
                                                            />
                                                        </TableHead>
                                                        <TableHead>Keyword</TableHead>
                                                        <TableHead>Search Vol</TableHead>
                                                        <TableHead>CPC</TableHead>
                                                        <TableHead>Intent</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredKeywords.map((kw) => (
                                                        <TableRow key={kw.id} className={`
                                                            hover:bg-indigo-50/60 transition-colors cursor-pointer
                                                            ${selectedKeywords.includes(kw.id) ? 'bg-indigo-50/30' : ''}
                                                        `}
                                                        onClick={() => {
                                                            if (selectedKeywords.includes(kw.id)) {
                                                                setSelectedKeywords(selectedKeywords.filter(id => id !== kw.id));
                                                            } else {
                                                                setSelectedKeywords([...selectedKeywords, kw.id]);
                                                            }
                                                        }}
                                                        >
                                                            <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                                                                <Checkbox 
                                                                    checked={selectedKeywords.includes(kw.id)}
                                                                    onCheckedChange={(c) => {
                                                                        if (c) setSelectedKeywords([...selectedKeywords, kw.id]);
                                                                        else setSelectedKeywords(selectedKeywords.filter(id => id !== kw.id));
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-medium text-slate-700">{kw.text}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className={`
                                                                    ${kw.volume === 'High' ? 'bg-green-100 text-green-700 border-green-200' : 
                                                                      kw.volume === 'Medium' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                                                                      'bg-slate-100 text-slate-600 border-slate-200'} font-normal border
                                                                `}>
                                                                    {kw.volume}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-slate-600 font-mono text-xs">{kw.cpc}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-500 font-normal">
                                                                    {kw.type}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {filteredKeywords.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                                                                No keywords found matching "{keywordFilter}"
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 bg-slate-50/50">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 animate-pulse">
                                        <Sparkles className="w-10 h-10 text-indigo-300"/>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-600 mb-2">AI Keyword Generator</h3>
                                    <p className="text-center max-w-md text-slate-500">
                                        Enter your seed keywords on the left and let our AI generate high-intent keyword opportunities for your campaign.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-200">
                    <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800">
                        Back to Structure
                    </Button>
                    <Button 
                        size="lg" 
                        onClick={handleNextStep}
                        disabled={selectedKeywords.length === 0}
                        className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl disabled:opacity-50 disabled:shadow-none"
                    >
                        Continue to Ads <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        );
    }; // End of old renderStep2Old - keeping this hidden for reference

    // Step 3: Ad Creation
    const handleEditAd = (ad: any) => {
        // Toggle edit mode - if already editing this ad, cancel edit
        if (editingAdId === ad.id) {
            setEditingAdId(null);
        } else {
            setEditingAdId(ad.id);
        }
    };
    
    const handleSaveAd = (adId: number) => {
        // Bug_77c: Validate required fields before saving
        const ad = generatedAds.find(a => a.id === adId);
        if (!ad) {
            notifications.error('Ad not found', {
                title: 'Error',
                description: 'The ad you are trying to save could not be found.',
            });
            return;
        }

        // Validate required fields based on ad type
        const errors: string[] = [];
        
        if (ad.type === 'rsa' || ad.type === 'dki') {
            // RSA/DKI requires at least 3 headlines and 2 descriptions
            if (!ad.headline1 || ad.headline1.trim() === '') {
                errors.push('Headline 1 is required');
            }
            if (!ad.headline2 || ad.headline2.trim() === '') {
                errors.push('Headline 2 is required');
            }
            if (!ad.headline3 || ad.headline3.trim() === '') {
                errors.push('Headline 3 is required');
            }
            if (!ad.description1 || ad.description1.trim() === '') {
                errors.push('Description 1 is required');
            }
            if (!ad.description2 || ad.description2.trim() === '') {
                errors.push('Description 2 is required');
            }
            if (!ad.finalUrl || ad.finalUrl.trim() === '') {
                errors.push('Final URL is required');
            }
        } else if (ad.type === 'callonly') {
            if (!ad.headline1 || ad.headline1.trim() === '') {
                errors.push('Headline 1 is required');
            }
            if (!ad.headline2 || ad.headline2.trim() === '') {
                errors.push('Headline 2 is required');
            }
            if (!ad.description1 || ad.description1.trim() === '') {
                errors.push('Description 1 is required');
            }
            if (!ad.description2 || ad.description2.trim() === '') {
                errors.push('Description 2 is required');
            }
            if (!ad.phone || ad.phone.trim() === '') {
                errors.push('Phone number is required');
            }
            if (!ad.businessName || ad.businessName.trim() === '') {
                errors.push('Business name is required');
            }
        }

        if (errors.length > 0) {
            notifications.error(`Please fill in all required fields:\n\n${errors.join('\n')}`, {
                title: 'Validation Error',
                description: 'All required fields must be filled before saving.',
                priority: 'high',
            });
            return;
        }

        // Save state when finishing edit if we started editing this ad
        if (ad && editingStarted.has(adId)) {
            saveStateBeforeAction('edit', adId, `Saved changes to ${ad.type || 'ad'} #${adId}`);
            setEditingStarted(new Set([...editingStarted].filter(id => id !== adId)));
        }
        setEditingAdId(null);
        // Ad is already updated in state through inline editing
        updateUndoRedoState();
        
        // Bug_21: Show success confirmation popup
        notifications.success('Changes saved successfully', {
            title: 'Ad Updated',
            description: 'Your ad changes have been saved.',
        });
    };
    
    const handleCancelEdit = () => {
        // If we cancel editing, we might want to undo the changes
        // For now, just clear the editing state
        const adId = editingAdId;
        if (adId && editingStarted.has(adId)) {
            // Cancel editing - remove from started tracking
            setEditingStarted(new Set([...editingStarted].filter(id => id !== adId)));
        }
        setEditingAdId(null);
    };
    
    const updateAdField = (adId: number, field: string, value: any) => {
        setGeneratedAds(generatedAds.map(ad => 
            ad.id === adId ? { ...ad, [field]: value } : ad
        ));
    };
    
    const handleDuplicateAd = (ad: any) => {
        // Save state before duplication for undo
        saveStateBeforeAction('duplicate', ad.id, `Duplicated ${ad.type || 'ad'} #${ad.id}`);
        
        const newAd = { ...ad, id: Date.now() };
        setGeneratedAds([...generatedAds, newAd]);
        
        updateUndoRedoState();
        
        notifications.success('Ad duplicated successfully', {
            title: 'Ad Duplicated',
            description: 'A copy of the ad has been created. You can edit it as needed.',
        });
    };
    
    // Generate AI-powered extensions
    const handleGenerateAIExtensions = async () => {
        const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
        if (!hasRegularAds) {
            notifications.warning('Create at least one ad first', {
                title: 'Ad Required',
                description: 'You need at least one ad (RSA, DKI, or Call Only) before adding extensions.',
            });
            return;
        }

        // Show dialog to select extensions
        setShowExtensionDialog(true);
    };

    const [showExtensionDialog, setShowExtensionDialog] = useState(false);
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
    
    // Google Search Ads compatible extensions only
    const extensionTypes = [
        { id: 'callout', label: 'Callout Extension', description: 'Highlight key benefits' },
        { id: 'sitelink', label: 'Sitelink Extension', description: 'Add links to important pages' },
        { id: 'call', label: 'Call Extension', description: 'Add phone number' },
        { id: 'snippet', label: 'Structured Snippet Extension', description: 'Show structured information' },
        { id: 'price', label: 'Price Extension', description: 'Display pricing' },
        { id: 'location', label: 'Location Extension', description: 'Show business location' },
        { id: 'message', label: 'Message Extension', description: 'Enable messaging' },
        { id: 'promotion', label: 'Promotion Extension', description: 'Show special offers' },
        { id: 'leadform', label: 'Lead Form Extension', description: 'Add lead form' },
    ];

    const handleConfirmAIExtensions = async () => {
        if (selectedExtensions.length === 0) {
            notifications.warning('Please select at least one extension', {
                title: 'No Extensions Selected',
            });
            return;
        }

        const currentDynamicAdGroups = getDynamicAdGroups();
        const currentGroup = currentDynamicAdGroups.find(g => g.name === selectedAdGroup) || currentDynamicAdGroups[0];
        const keywords = currentGroup?.keywords || selectedKeywords || [];
        const baseUrl = url || 'www.example.com';
        const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);

        // Get ad context for better extension generation
        const firstAd = generatedAds.find(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
        const adHeadline = firstAd?.headline1 || '';
        const adDescription = firstAd?.description1 || '';

        // Show loading notification
        const loadingToast = notifications.loading('Generating AI extensions...', {
            title: 'AI Generation',
            description: 'Creating unique extensions based on your keywords and ad content.'
        });

        try {
            const response = await api.post('/generate-extensions', {
                keywords: keywords.slice(0, 10).map((k: string) => k.replace(/^\[|\]$|^"|"$/g, '')),
                extensionTypes: selectedExtensions,
                adHeadline,
                adDescription,
                baseUrl: formattedUrl
            });

            if (response.extensions && Array.isArray(response.extensions)) {
                const newExtensions: any[] = response.extensions.map((extData: any) => {
                    const extId = Date.now() + Math.random() * 1000;
                    let extension: any = {
                        id: extId,
                        extensionType: extData.extensionType,
                        adGroup: selectedAdGroup,
                        ...extData.data
                    };

                    // Ensure URLs are properly formatted for sitelinks
                    if (extension.sitelinks && Array.isArray(extension.sitelinks)) {
                        extension.sitelinks = extension.sitelinks.map((link: any) => ({
                            ...link,
                            url: link.url || `${formattedUrl}/${link.text?.toLowerCase().replace(/\s+/g, '-') || 'page'}`
                        }));
                    }

                    return extension;
                });

                // Attach extensions to the first regular ad
                if (firstAd) {
                    const updatedAds = generatedAds.map(ad => {
                        if (ad.id === firstAd.id) {
                            return {
                                ...ad,
                                extensions: [...(ad.extensions || []), ...newExtensions]
                            };
                        }
                        return ad;
                    });
                    setGeneratedAds(updatedAds);
                } else {
                    // If no ad exists, add extensions as standalone items
                    setGeneratedAds([...generatedAds, ...newExtensions]);
                }

                setShowExtensionDialog(false);
                setSelectedExtensions([]);
                
                if (loadingToast) loadingToast();
                notifications.success(`Generated ${newExtensions.length} unique AI extensions`, {
                    title: 'Extensions Created',
                    description: 'Your AI-generated extensions have been added and will appear in ad previews.',
                });
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error: any) {
            console.log('ℹ️ Backend unavailable - using fallback extension generation');
            
            if (loadingToast) loadingToast();
            
            // Fallback to basic generation with more variety
            const mainKeyword = keywords[0]?.replace(/^\[|\]$|^"|"$/g, '') || 'your service';
            const newExtensions: any[] = [];

            selectedExtensions.forEach((extType, index) => {
                const extId = Date.now() + Math.random() * 1000 + index;
                let extension: any = {
                    id: extId,
                    extensionType: extType,
                    adGroup: selectedAdGroup
                };

                // Generate varied fallback content
                if (extType === 'callout') {
                    const calloutVariations = [
                        [`Expert ${mainKeyword} Service`, 'Licensed Professionals', '24/7 Available', 'Free Estimate'],
                        [`Professional ${mainKeyword}`, 'Trusted & Reliable', 'Same Day Service', 'Quality Guaranteed'],
                        [`Certified ${mainKeyword}`, 'Fast Response Time', 'Satisfaction Guaranteed', 'Emergency Service']
                    ];
                    extension.callouts = calloutVariations[index % calloutVariations.length];
                } else if (extType === 'sitelink') {
                    const sitelinkVariations = [
                        [
                            { text: `${mainKeyword} Services`, description: 'Professional service options', url: `${formattedUrl}/services` },
                            { text: 'Get Quote', description: 'Request a free estimate', url: `${formattedUrl}/quote` },
                            { text: 'Contact Us', description: 'Speak with our team', url: `${formattedUrl}/contact` },
                            { text: 'About', description: 'Learn about our company', url: `${formattedUrl}/about` }
                        ],
                        [
                            { text: 'Our Services', description: 'View all service offerings', url: `${formattedUrl}/services` },
                            { text: 'Schedule Service', description: 'Book an appointment', url: `${formattedUrl}/schedule` },
                            { text: 'Customer Support', description: 'Get help and support', url: `${formattedUrl}/support` },
                            { text: 'Resources', description: 'Helpful information', url: `${formattedUrl}/resources` }
                        ]
                    ];
                    extension.sitelinks = sitelinkVariations[index % sitelinkVariations.length];
                } else if (extType === 'call') {
                    extension.phone = '(555) 123-4567';
                    extension.callTrackingEnabled = true;
                } else if (extType === 'snippet') {
                    const snippetVariations = [
                        { header: 'Services', values: keywords.slice(0, 4).map((k: string) => k.replace(/^\[|\]$|^"|"$/g, '')) },
                        { header: 'What We Offer', values: [mainKeyword, 'Expert Service', 'Quality Work', 'Fast Response'] },
                        { header: 'Benefits', values: ['Licensed', 'Insured', 'Experienced', 'Reliable'] }
                    ];
                    const snippet = snippetVariations[index % snippetVariations.length];
                    extension.header = snippet.header;
                    extension.values = snippet.values;
                } else if (extType === 'price') {
                    extension.priceQualifier = 'From';
                    extension.price = '$99';
                    extension.currency = 'USD';
                    extension.unit = 'per service';
                    extension.description = 'Competitive pricing';
                } else if (extType === 'location') {
                    extension.businessName = 'Your Business Name';
                    extension.addressLine1 = '123 Main St';
                    extension.city = 'City';
                    extension.state = 'State';
                    extension.postalCode = '12345';
                    extension.phone = '(555) 123-4567';
                } else if (extType === 'message') {
                    extension.messageText = `Message us about ${mainKeyword}`;
                    extension.businessName = 'Your Business';
                    extension.phone = '(555) 123-4567';
                } else if (extType === 'promotion') {
                    extension.promotionText = 'Special Offer';
                    extension.promotionDescription = `Free consultation for ${mainKeyword}`;
                    extension.occasion = 'PROMOTION';
                    extension.startDate = new Date().toISOString().split('T')[0];
                    extension.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                }

                newExtensions.push(extension);
            });

            // Attach extensions to the first regular ad
            if (firstAd) {
                const updatedAds = generatedAds.map(ad => {
                    if (ad.id === firstAd.id) {
                        return {
                            ...ad,
                            extensions: [...(ad.extensions || []), ...newExtensions]
                        };
                    }
                    return ad;
                });
                setGeneratedAds(updatedAds);
            } else {
                setGeneratedAds([...generatedAds, ...newExtensions]);
            }

            setShowExtensionDialog(false);
            setSelectedExtensions([]);
            
            notifications.info(`Generated ${newExtensions.length} extensions (offline mode)`, {
                title: 'Extensions Created',
                description: 'Using fallback generation. Some variety may be limited.',
            });
        }
    };
    
    const handleDeleteAd = (adId: number) => {
        const adToDelete = generatedAds.find(a => a.id === adId);
        
        // Save state before deletion for undo
        saveStateBeforeAction('delete', adId, `Deleted ${adToDelete?.type || 'ad'} #${adId}`);
        
        setGeneratedAds(generatedAds.filter(a => a.id !== adId));
        
        // Remove from selected ads if it was selected
        if (selectedAdIds.includes(adId)) {
            setSelectedAdIds(selectedAdIds.filter(id => id !== adId));
        }
        
        // Update preview if deleted ad was being previewed
        if (selectedPreviewAdId === adId) {
            const remainingAds = generatedAds.filter(a => a.id !== adId);
            setSelectedPreviewAdId(remainingAds.length > 0 ? remainingAds[0].id : null);
        }
        
        updateUndoRedoState();
        
        notifications.success('Ad deleted successfully', {
            title: 'Ad Removed',
            description: adToDelete ? `The ${adToDelete.type || 'ad'} has been removed from your campaign. Use Undo to restore it.` : 'Ad has been removed.',
        });
    };
    
    
    const createNewAd = async (type: 'rsa' | 'dki' | 'callonly' | 'snippet' | 'callout' | 'call' | 'sitelink' | 'price' | 'app' | 'location' | 'message' | 'leadform' | 'promotion' | 'image') => {
        // Bug_77a: Optimize performance - show loading state immediately
        const loadingNotification = notifications.info('Creating ad...', {
            title: 'Processing',
            description: 'Please wait while we create your ad.',
        });
        
        // Check if this is an extension type
        const isExtension = ['snippet', 'callout', 'call', 'sitelink', 'price', 'app', 'location', 'message', 'leadform', 'promotion', 'image'].includes(type);
        
        // Check if we have any regular ads (rsa, dki, callonly)
        const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
        
        // If trying to create extension without an ad, create a DKI ad first
        if (isExtension && !hasRegularAds) {
            notifications.info('Creating a DKI ad first, then adding your extension', {
                title: 'Ad Required',
                description: 'Extensions require at least one ad. A DKI ad will be created automatically.',
            });
            
            // Create DKI ad directly (bypassing the extension check)
            // Get the current ad group context
            const currentDynamicAdGroups = getDynamicAdGroups();
            const allGroups = currentDynamicAdGroups.length > 0 ? currentDynamicAdGroups : adGroups.map(name => ({ name, keywords: [] }));
            if (allGroups.length === 0) {
                notifications.warning('No ad groups available. Please create ad groups first by selecting keywords.', {
                    title: 'No Ad Groups',
                    description: 'Select keywords in Step 2 to create ad groups before adding ads.',
                });
                return;
            }
            
            const baseUrl = url || 'www.example.com';
            const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);
            const mainKeyword = allGroups[0]?.keywords?.[0] || 'your service';
            
            // Use new comprehensive ad generation logic for DKI ad
            const intent = detectUserIntent([mainKeyword], 'Services');
            const industry = intent === 'product' ? 'Products' : 'Services';
            
            let matchType: 'broad' | 'phrase' | 'exact' = 'phrase';
            if (matchTypes.exact) matchType = 'exact';
            else if (matchTypes.phrase) matchType = 'phrase';
            else if (matchTypes.broad) matchType = 'broad';
            
            let campaignStructure: 'SKAG' | 'STAG' | 'IBAG' | 'Alpha-Beta' = 'STAG';
            if (structure === 'SKAG') campaignStructure = 'SKAG';
            else if (structure === 'STAG') campaignStructure = 'STAG';
            
            const input: AdGenerationInput = {
                keywords: [mainKeyword],
                industry: industry,
                businessName: 'Your Business',
                baseUrl: formattedUrl,
                adType: 'RSA', // Generate as RSA first, then convert to DKI
                filters: {
                    matchType: matchType,
                    campaignStructure: campaignStructure,
                }
            };
            
            const generatedAd = generateAds(input) as ResponsiveSearchAd;
            const mainKeywordTitle = mainKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            // Convert to DKI format
            const dkiHeadlines = generatedAd.headlines.slice(0, 3).map(h => {
                const keywordLower = mainKeyword.toLowerCase();
                const headlineLower = h.toLowerCase();
                if (headlineLower.includes(keywordLower)) {
                    const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    return h.replace(regex, `{Keyword:${mainKeywordTitle}}`).substring(0, 30);
                }
                return `{Keyword:${mainKeywordTitle}} - ${h}`.substring(0, 30);
            });
            
            const dkiDescriptions = generatedAd.descriptions.slice(0, 2).map(d => {
                const keywordLower = mainKeyword.toLowerCase();
                const descLower = d.toLowerCase();
                if (descLower.includes(keywordLower)) {
                    const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                    return d.replace(regex, `{Keyword:${mainKeywordTitle}}`).substring(0, 90);
                }
                return d.substring(0, 90);
            });
            
            const dkiAd: any = {
                id: Date.now(),
                type: 'dki',
                adGroup: selectedAdGroup === ALL_AD_GROUPS_VALUE ? ALL_AD_GROUPS_VALUE : selectedAdGroup,
                headline1: dkiHeadlines[0] || '',
                headline2: dkiHeadlines[1] || '',
                headline3: dkiHeadlines[2] || '',
                description1: dkiDescriptions[0] || '',
                description2: dkiDescriptions[1] || '',
                finalUrl: generatedAd.finalUrl || formattedUrl,
                path1: generatedAd.displayPath[0] || 'keyword',
                path2: generatedAd.displayPath[1] || 'deals'
            };
            
            // Save state before creating DKI ad
            saveStateBeforeAction('create', dkiAd.id, `Created DKI ad and ${type} extension`);
            
            // Add DKI ad to generatedAds immediately
            setGeneratedAds(prev => [...prev, dkiAd]);
            
            // Add to selectedAdIds if ALL AD GROUPS mode
            if (selectedAdGroup === ALL_AD_GROUPS_VALUE && selectedAdIds.length < 3) {
                setSelectedAdIds(prev => [...prev, dkiAd.id]);
            }
            
            updateUndoRedoState();
            
            notifications.success('DKI ad created automatically', {
                title: 'Ad Created',
                description: 'A DKI ad was created first. Your extension will be added next.',
            });
            
            // Continue with extension creation - the function will proceed and create the extension
            // The extension will be added to state below, and since we've already added the DKI ad,
            // both will be visible to the user
        }
        
        // Bug_77a: Optimize performance - check rate limit and usage in parallel
        const [rateLimit, usage] = await Promise.all([
            rateLimiter.checkLimit('ad-creation'),
            usageTracker.trackUsage('ad-creation', 1)
        ]);
        
        if (!rateLimit.allowed) {
            notifications.error(rateLimit.message || 'Rate limit exceeded', {
                title: 'Too Many Requests',
                description: 'Please wait before creating more ads to prevent platform abuse.',
                priority: 'high',
            });
            return;
        }

        if (!usage.allowed) {
            notifications.error(usage.message || 'Usage limit exceeded', {
                title: 'Daily Limit Reached',
                description: 'You have reached your daily ad creation limit. Please try again tomorrow.',
                priority: 'high',
            });
            return;
        }

        // Check ads limit per ad group (max 3 ads per group)
        const regularAds = generatedAds.filter(ad => 
            ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'
        );
        
        // Bug_20: Check limit once and show only one validation message
        if (type === 'rsa' || type === 'dki' || type === 'callonly') {
            if (selectedAdGroup === ALL_AD_GROUPS_VALUE) {
                // For ALL AD GROUPS mode, check selectedAdIds
                if (selectedAdIds.length >= 3) {
                    const adTypeName = type === 'rsa' ? 'Responsive Search Ad' : type === 'dki' ? 'DKI Text Ad' : 'Call Only Ad';
                    notifications.error(`Maximum limit reached: You can select up to 3 ads for all ad groups.`, {
                        title: 'Ad Limit Reached',
                        description: `You cannot create more ${adTypeName}s. Please remove an ad from selection before adding another. Maximum 3 ads allowed per ad group.`,
                        priority: 'high',
                    });
                    return;
            }
            } else {
                // For specific group mode, check ads in that group
                const groupAds = regularAds.filter(ad => ad.adGroup === selectedAdGroup);
                if (groupAds.length >= 3) {
                    const adTypeName = type === 'rsa' ? 'Responsive Search Ad' : type === 'dki' ? 'DKI Text Ad' : 'Call Only Ad';
                    notifications.error(`Maximum limit reached: You can create up to 3 ads per ad group.`, {
                        title: 'Ad Limit Reached',
                        description: `The selected ad group already has ${groupAds.length} ads. You cannot create more ${adTypeName}s. Please delete an ad or select another group.`,
                        priority: 'high',
                    });
                    return;
                }
            }
        }
        
        // Handle "ALL AD GROUPS" selection - create ad for each ad group
        if (selectedAdGroup === ALL_AD_GROUPS_VALUE) {
            const currentDynamicAdGroups = getDynamicAdGroups();
            const allGroups = currentDynamicAdGroups.length > 0 ? currentDynamicAdGroups : adGroups.map(name => ({ name, keywords: [] }));
            
            if (allGroups.length === 0) {
                notifications.warning('No ad groups available. Please create ad groups first by selecting keywords.', {
                    title: 'No Ad Groups',
                    description: 'Select keywords in Step 2 to create ad groups before adding ads.',
                });
                return;
            }
            
            // For ALL AD GROUPS mode, we create ONE ad that applies to all groups (not one per group)
            // Check if we've already reached the 3-ad limit
            if (type === 'rsa' || type === 'dki' || type === 'callonly') {
                if (selectedAdIds.length >= 3) {
                    notifications.error(`Cannot create more ads: Maximum 3 ads allowed for all ad groups.`, {
                        title: 'Limit Exceeded',
                        description: `You already have ${selectedAdIds.length} ads selected. Remove one to add another.`,
                        priority: 'high',
                    });
                    return;
                }
            }
            
            // For ALL AD GROUPS mode, create ONE ad (not one per group)
            // This single ad will be applied to all ad groups
            const newAds: any[] = [];
            const baseUrl = url || 'www.example.com';
            const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);
            
            // Create just ONE ad that will be added to all groups
            // (Don't loop through all groups - create one ad only)
            // Get a representative keyword from any group (use first group's first keyword)
            const mainKeyword = allGroups[0]?.keywords?.[0] || 'your service';
                let baseAd: any = {
                    id: Date.now(),
                    type: type,
                    adGroup: ALL_AD_GROUPS_VALUE // Mark as ALL_AD_GROUPS ad
                };
                
                // Use new comprehensive ad generation logic
                if (type === 'rsa' || type === 'dki' || type === 'callonly') {
                    // Detect intent and industry
                    const intent = detectUserIntent([mainKeyword], 'Services');
                    const industry = intent === 'product' ? 'Products' : 'Services';
                    
                    // Determine match type from state
                    let matchType: 'broad' | 'phrase' | 'exact' = 'phrase';
                    if (matchTypes.exact) matchType = 'exact';
                    else if (matchTypes.phrase) matchType = 'phrase';
                    else if (matchTypes.broad) matchType = 'broad';
                    
                    // Determine campaign structure
                    let campaignStructure: 'SKAG' | 'STAG' | 'IBAG' | 'Alpha-Beta' = 'STAG';
                    if (structure === 'SKAG') campaignStructure = 'SKAG';
                    else if (structure === 'STAG') campaignStructure = 'STAG';
                    else campaignStructure = 'STAG';
                    
                    // Create input for ad generator
                    const input: AdGenerationInput = {
                        keywords: [mainKeyword],
                        industry: industry,
                        businessName: 'Your Business',
                        baseUrl: formattedUrl,
                        adType: type === 'rsa' ? 'RSA' : type === 'dki' ? 'RSA' : 'CALL_ONLY',
                        filters: {
                            matchType: matchType,
                            campaignStructure: campaignStructure,
                        }
                    };
                    
                    // Generate ad
                if (type === 'rsa') {
                        const generatedAd = generateAds(input) as ResponsiveSearchAd;
                    baseAd = {
                        ...baseAd,
                            headline1: generatedAd.headlines[0] || '',
                            headline2: generatedAd.headlines[1] || '',
                            headline3: generatedAd.headlines[2] || '',
                            headline4: generatedAd.headlines[3] || '',
                            headline5: generatedAd.headlines[4] || '',
                            description1: generatedAd.descriptions[0] || '',
                            description2: generatedAd.descriptions[1] || '',
                            finalUrl: generatedAd.finalUrl || formattedUrl,
                            path1: generatedAd.displayPath[0] || 'shop',
                            path2: generatedAd.displayPath[1] || 'now'
                    };
                } else if (type === 'dki') {
                        // Generate RSA first, then convert to DKI format
                        const generatedAd = generateAds(input) as ResponsiveSearchAd;
                        const mainKeywordTitle = mainKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        
                        // Convert headlines to DKI format
                        const dkiHeadlines = generatedAd.headlines.slice(0, 3).map(h => {
                            const keywordLower = mainKeyword.toLowerCase();
                            const headlineLower = h.toLowerCase();
                            if (headlineLower.includes(keywordLower)) {
                                const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                return h.replace(regex, `{Keyword:${mainKeywordTitle}}`).substring(0, 30);
                            }
                            return `{Keyword:${mainKeywordTitle}} - ${h}`.substring(0, 30);
                        });
                        
                        // Convert descriptions to DKI format
                        const dkiDescriptions = generatedAd.descriptions.slice(0, 2).map(d => {
                            const keywordLower = mainKeyword.toLowerCase();
                            const descLower = d.toLowerCase();
                            if (descLower.includes(keywordLower)) {
                                const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                return d.replace(regex, `{Keyword:${mainKeywordTitle}}`).substring(0, 90);
                            }
                            return d.substring(0, 90);
                        });
                        
                    baseAd = {
                        ...baseAd,
                            headline1: dkiHeadlines[0] || '',
                            headline2: dkiHeadlines[1] || '',
                            headline3: dkiHeadlines[2] || '',
                            description1: dkiDescriptions[0] || '',
                            description2: dkiDescriptions[1] || '',
                            finalUrl: generatedAd.finalUrl || formattedUrl,
                            path1: generatedAd.displayPath[0] || 'keyword',
                            path2: generatedAd.displayPath[1] || 'deals'
                    };
                } else if (type === 'callonly') {
                        const generatedAd = generateAds(input) as CallOnlyAd;
                    baseAd = {
                        ...baseAd,
                            headline1: generatedAd.headline1 || '',
                            headline2: generatedAd.headline2 || '',
                            description1: generatedAd.description1 || '',
                            description2: generatedAd.description2 || '',
                            phone: generatedAd.phoneNumber || '(555) 123-4567',
                            businessName: generatedAd.businessName || 'Your Business',
                            finalUrl: generatedAd.verificationUrl || formattedUrl
                    };
                    }
                } else if (type === 'snippet') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'snippet',
                        header: 'Types',
                        values: allGroups[0]?.keywords?.slice(0, 4) || ['Option 1', 'Option 2', 'Option 3']
                    };
                } else if (type === 'callout') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'callout',
                        callouts: ['Free Shipping', '24/7 Support', 'Best Price Guarantee', 'Expert Installation']
                    };
                } else if (type === 'call') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'call',
                        phone: '(555) 123-4567',
                        callTrackingEnabled: false,
                        callOnly: false
                    };
                } else if (type === 'sitelink') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'sitelink',
                        sitelinks: [
                            { text: 'Shop Now', description: 'Browse our collection', url: url || 'www.example.com/shop' },
                            { text: 'About Us', description: 'Learn more about us', url: url || 'www.example.com/about' },
                            { text: 'Contact', description: 'Get in touch', url: url || 'www.example.com/contact' },
                            { text: 'Support', description: 'Customer support', url: url || 'www.example.com/support' }
                        ]
                    };
                } else if (type === 'price') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'price',
                        type: 'SERVICES',
                        priceQualifier: 'From',
                        price: '$99',
                        currency: 'USD',
                        unit: 'per service',
                        description: 'Starting price'
                    };
                } else if (type === 'app') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'app',
                        appStore: 'GOOGLE_PLAY',
                        appId: 'com.example.app',
                        appLinkText: 'Download Now',
                        appFinalUrl: 'https://play.google.com/store/apps/details?id=com.example.app'
                    };
                } else if (type === 'location') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'location',
                        businessName: 'Your Business Name',
                        addressLine1: '123 Main St',
                        addressLine2: '',
                        city: 'City',
                        state: 'State',
                        postalCode: '12345',
                        country: 'United States',
                        phone: '(555) 123-4567'
                    };
                } else if (type === 'message') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'message',
                        messageText: 'Message us for quick answers',
                        businessName: 'Your Business',
                        phone: '(555) 123-4567'
                    };
                } else if (type === 'leadform') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'leadform',
                        formName: 'Get Started',
                        formDescription: 'Fill out this form to get in touch',
                        formType: 'CONTACT',
                        formUrl: formattedUrl,
                        privacyPolicyUrl: formattedUrl + '/privacy'
                    };
                } else if (type === 'promotion') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'promotion',
                        promotionText: 'Special Offer',
                        promotionDescription: 'Get 20% off your first order',
                        occasion: 'SALE',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    };
                } else if (type === 'image') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'image',
                        imageUrl: 'https://via.placeholder.com/1200x628',
                        imageAltText: 'Product Image',
                        imageName: 'Product Showcase',
                        landscapeLogoImageUrl: 'https://via.placeholder.com/600x314'
                    };
            }
            
            newAds.push(baseAd);
            
            // Add the single ad
            if (newAds.length > 0) {
                const newAd = newAds[0];
                setGeneratedAds([...generatedAds, newAd]);
                
                // Add to selectedAdIds if it's a regular ad (not extension)
                if ((type === 'rsa' || type === 'dki' || type === 'callonly') && selectedAdIds.length < 3) {
                    setSelectedAdIds([...selectedAdIds, newAd.id]);
                }
                
                // Success notification
                const adTypeName = type === 'rsa' ? 'Responsive Search Ad' : type === 'dki' ? 'DKI Text Ad' : type === 'callonly' ? 'Call Only Ad' : type;
                notifications.success(`Created ${adTypeName} for all ad groups`, {
                    title: 'Ad Created Successfully',
                    description: `This ad will be added to all ${allGroups.length} ad groups automatically.`,
                });
            }
            return;
        }
        
        const currentDynamicAdGroups = getDynamicAdGroups();
        const currentGroup = currentDynamicAdGroups.find(g => g.name === selectedAdGroup) || currentDynamicAdGroups[0];
        const mainKeyword = currentGroup?.keywords[0] || 'your service';
        
        let newAd: any = {
            id: Date.now(),
            type: type,
            adGroup: selectedAdGroup
        };

        // Format URL properly
        const baseUrl = url || 'www.example.com';
        const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);

        // Use new comprehensive ad generation logic
        if (type === 'rsa' || type === 'dki' || type === 'callonly') {
            // Detect intent and industry
            const intent = detectUserIntent([mainKeyword], 'Services');
            const industry = intent === 'product' ? 'Products' : 'Services';
            
            // Determine match type from state
            let matchType: 'broad' | 'phrase' | 'exact' = 'phrase';
            if (matchTypes.exact) matchType = 'exact';
            else if (matchTypes.phrase) matchType = 'phrase';
            else if (matchTypes.broad) matchType = 'broad';
            
            // Determine campaign structure
            let campaignStructure: 'SKAG' | 'STAG' | 'IBAG' | 'Alpha-Beta' = 'STAG';
            if (structure === 'SKAG') campaignStructure = 'SKAG';
            else if (structure === 'STAG') campaignStructure = 'STAG';
            else campaignStructure = 'STAG';
            
            // Create input for ad generator
            const input: AdGenerationInput = {
                keywords: [mainKeyword],
                industry: industry,
                businessName: 'Your Business',
                baseUrl: formattedUrl,
                adType: type === 'rsa' ? 'RSA' : type === 'dki' ? 'RSA' : 'CALL_ONLY', // DKI uses RSA generation then converts
                filters: {
                    matchType: matchType,
                    campaignStructure: campaignStructure,
                }
            };
            
            // Generate ad
        if (type === 'rsa') {
                const generatedAd = generateAds(input) as ResponsiveSearchAd;
            newAd = {
                ...newAd,
                    headline1: generatedAd.headlines[0] || '',
                    headline2: generatedAd.headlines[1] || '',
                    headline3: generatedAd.headlines[2] || '',
                    headline4: generatedAd.headlines[3] || '',
                    headline5: generatedAd.headlines[4] || '',
                    description1: generatedAd.descriptions[0] || '',
                    description2: generatedAd.descriptions[1] || '',
                    finalUrl: generatedAd.finalUrl || formattedUrl,
                    path1: generatedAd.displayPath[0] || 'shop',
                    path2: generatedAd.displayPath[1] || 'now'
            };
        } else if (type === 'dki') {
                // Generate RSA first, then convert to DKI format
                const generatedAd = generateAds(input) as ResponsiveSearchAd;
                const mainKeywordTitle = mainKeyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                // Convert headlines to DKI format
                const dkiHeadlines = generatedAd.headlines.slice(0, 3).map(h => {
                    const keywordLower = mainKeyword.toLowerCase();
                    const headlineLower = h.toLowerCase();
                    if (headlineLower.includes(keywordLower)) {
                        const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                        return h.replace(regex, `{Keyword:${mainKeywordTitle}}`).substring(0, 30);
                    }
                    return `{Keyword:${mainKeywordTitle}} - ${h}`.substring(0, 30);
                });
                
                // Convert descriptions to DKI format
                const dkiDescriptions = generatedAd.descriptions.slice(0, 2).map(d => {
                    const keywordLower = mainKeyword.toLowerCase();
                    const descLower = d.toLowerCase();
                    if (descLower.includes(keywordLower)) {
                        const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                        return d.replace(regex, `{Keyword:${mainKeywordTitle}}`).substring(0, 90);
                    }
                    return d.substring(0, 90);
                });
                
            newAd = {
                ...newAd,
                    headline1: dkiHeadlines[0] || '',
                    headline2: dkiHeadlines[1] || '',
                    headline3: dkiHeadlines[2] || '',
                    description1: dkiDescriptions[0] || '',
                    description2: dkiDescriptions[1] || '',
                    finalUrl: generatedAd.finalUrl || formattedUrl,
                    path1: generatedAd.displayPath[0] || 'keyword',
                    path2: generatedAd.displayPath[1] || 'deals'
            };
        } else if (type === 'callonly') {
                const generatedAd = generateAds(input) as CallOnlyAd;
            newAd = {
                ...newAd,
                    headline1: generatedAd.headline1 || '',
                    headline2: generatedAd.headline2 || '',
                    description1: generatedAd.description1 || '',
                    description2: generatedAd.description2 || '',
                    phone: generatedAd.phoneNumber || '(555) 123-4567',
                    businessName: generatedAd.businessName || 'Your Business',
                    finalUrl: generatedAd.verificationUrl || formattedUrl
            };
            }
        } else if (type === 'snippet') {
            newAd = {
                ...newAd,
                extensionType: 'snippet',
                header: 'Types',
                values: currentGroup?.keywords.slice(0, 4) || ['Option 1', 'Option 2', 'Option 3']
            };
        } else if (type === 'callout') {
            newAd = {
                ...newAd,
                extensionType: 'callout',
                callouts: ['Free Shipping', '24/7 Support', 'Best Price Guarantee', 'Expert Installation']
            };
        } else if (type === 'call') {
            newAd = {
                ...newAd,
                extensionType: 'call',
                phone: '(555) 123-4567',
                callTrackingEnabled: false,
                callOnly: false
            };
        } else if (type === 'sitelink') {
            newAd = {
                ...newAd,
                extensionType: 'sitelink',
                sitelinks: [
                    { text: 'Shop Now', description: 'Browse our collection', url: url || 'www.example.com/shop' },
                    { text: 'About Us', description: 'Learn more about us', url: url || 'www.example.com/about' },
                    { text: 'Contact', description: 'Get in touch', url: url || 'www.example.com/contact' },
                    { text: 'Support', description: 'Customer support', url: url || 'www.example.com/support' }
                ]
            };
        } else if (type === 'price') {
            newAd = {
                ...newAd,
                extensionType: 'price',
                type: 'SERVICES',
                priceQualifier: 'From',
                price: '$99',
                currency: 'USD',
                unit: 'per service',
                description: 'Starting price'
            };
        } else if (type === 'app') {
            newAd = {
                ...newAd,
                extensionType: 'app',
                appStore: 'GOOGLE_PLAY',
                appId: 'com.example.app',
                appLinkText: 'Download Now',
                appFinalUrl: 'https://play.google.com/store/apps/details?id=com.example.app'
            };
        } else if (type === 'location') {
            newAd = {
                ...newAd,
                extensionType: 'location',
                businessName: 'Your Business Name',
                addressLine1: '123 Main St',
                addressLine2: '',
                city: 'City',
                state: 'State',
                postalCode: '12345',
                country: 'United States',
                phone: '(555) 123-4567'
            };
        } else if (type === 'message') {
            newAd = {
                ...newAd,
                extensionType: 'message',
                messageText: 'Message us for quick answers',
                businessName: 'Your Business',
                phone: '(555) 123-4567'
            };
        } else if (type === 'leadform') {
            newAd = {
                ...newAd,
                extensionType: 'leadform',
                formName: 'Get Started',
                formDescription: 'Fill out this form to get in touch',
                formType: 'CONTACT',
                formUrl: formattedUrl,
                privacyPolicyUrl: formattedUrl + '/privacy'
            };
        } else if (type === 'promotion') {
            newAd = {
                ...newAd,
                extensionType: 'promotion',
                promotionText: 'Special Offer',
                promotionDescription: 'Get 20% off your first order',
                occasion: 'SALE',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
        } else if (type === 'image') {
            newAd = {
                ...newAd,
                extensionType: 'image',
                imageUrl: 'https://via.placeholder.com/1200x628',
                imageAltText: 'Product Image',
                imageName: 'Product Showcase',
                landscapeLogoImageUrl: 'https://via.placeholder.com/600x314'
            };
        }

        setGeneratedAds([...generatedAds, newAd]);
        
        // Success notification
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
            description: `Your ${adTypeName} has been added to "${selectedAdGroup}". You can edit it in the ad list.`,
        });
        
        // If ALL AD GROUPS is selected and we haven't reached max 3 ads, and this is an ad (not extension), add to selected ads
        if (selectedAdGroup === ALL_AD_GROUPS_VALUE && selectedAdIds.length < 3 && (type === 'rsa' || type === 'dki' || type === 'callonly')) {
            setSelectedAdIds([...selectedAdIds, newAd.id]);
        }
    };
    
    const adGroups = ['Refrigerators', 'Ovens', 'Microwaves'];
    
    const renderStep3 = () => {
        // Safely get dynamic ad groups with error handling
        let dynamicAdGroups: Array<{ name: string; keywords: string[] }> = [];
        let adGroupList: string[] = adGroups;
        
        try {
            dynamicAdGroups = getDynamicAdGroups();
            if (dynamicAdGroups && dynamicAdGroups.length > 0) {
                adGroupList = dynamicAdGroups.map(g => g.name).filter(Boolean);
            }
        } catch (error) {
            console.error('Error getting dynamic ad groups in renderStep3:', error);
            console.error('selectedKeywords:', selectedKeywords);
            notifications.warning('Could not load ad groups. Using default groups.', {
                title: 'Ad Groups Error',
                description: 'There was an issue loading ad groups. You can still create ads.'
            });
            // Use default ad groups as fallback
            adGroupList = adGroups;
        }
        
        // Filter ads for the selected ad group
        const filteredAds = selectedAdGroup === ALL_AD_GROUPS_VALUE 
            ? generatedAds.filter(ad => selectedAdIds.includes(ad.id))
            : generatedAds.filter(ad => ad.adGroup === selectedAdGroup || !ad.adGroup);
        
        // Calculate total ads (excluding extensions for the counter)
        const totalAds = filteredAds.filter(ad => !ad.extensionType).length;
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
        
        // Format headline for display - show all headlines
        const formatHeadline = (ad: any) => {
            if (ad.type === 'rsa' || ad.type === 'dki') {
                // Collect all headlines (RSA can have up to 15, DKI typically 3-5)
                const headlines = [
                    ad.headline1,
                    ad.headline2,
                    ad.headline3,
                    ad.headline4,
                    ad.headline5,
                    ad.headline6,
                    ad.headline7,
                    ad.headline8,
                    ad.headline9,
                    ad.headline10,
                    ad.headline11,
                    ad.headline12,
                    ad.headline13,
                    ad.headline14,
                    ad.headline15
                ].filter(Boolean);
                return headlines.length > 0 ? headlines.join(' | ') : 'No headlines';
            } else if (ad.type === 'callonly') {
                return ad.headline1 || 'Call Only Ad';
            }
            return ad.headline1 || 'Ad';
        };
        
        // Format description for display - show all descriptions
        const formatDescription = (ad: any) => {
            if (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly') {
                // Collect all descriptions (RSA can have up to 4)
                const descs = [
                    ad.description1,
                    ad.description2,
                    ad.description3,
                    ad.description4
                ].filter(Boolean);
                return descs.length > 0 ? descs.join(' ') : 'No description';
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
                                <span className={`text-lg font-bold ${totalAds >= maxAds ? 'text-green-600' : 'text-indigo-600'}`}>
                                    {totalAds} / {maxAds}
                                </span>
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
                    </div>
                </div>
                
                    {/* Right Panel - Ad Cards */}
                <div className="lg:col-span-2 space-y-4">
                        {filteredAds.map((ad: any) => {
                            const headline = formatHeadline(ad);
                            const displayUrl = formatDisplayUrl(ad);
                            const description = formatDescription(ad);
                            
                            return (
                                <div key={ad.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow min-h-[200px]">
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
                                    <div className="mb-4 min-h-[120px]">
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
                                                        {ad.sitelinks.slice(0, 4).map((sl: any, idx: number) => {
                                                            const sitelinkUrl = sl.url || ad.finalUrl || url || 'https://www.example.com';
                                                            const formattedUrl = sitelinkUrl.match(/^https?:\/\//i) ? sitelinkUrl : `https://${sitelinkUrl}`;
                                                            return (
                                                                <div key={idx} className="text-xs">
                                                                    <a 
                                                                        href={formattedUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 font-semibold hover:text-blue-800 hover:underline cursor-pointer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {sl.text}
                                                                    </a>
                                                                    {sl.description && <span className="text-slate-600 ml-1">- {sl.description}</span>}
                                                                </div>
                                                            );
                                                        })}
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
                                            <LiveAdPreview ad={ad} />
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
                {/* Bug_67: Fix back button to go to previous step */}
                <Button variant="ghost" onClick={() => step > 1 && setStep(step - 1)}>
                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                    Back
                </Button>
                    <Button 
                        size="lg" 
                            onClick={() => setStep(4)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    >
                            Next Step <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
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
                        {extensionTypes.map((ext) => (
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
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-200 hover:border-indigo-300'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        checked={selectedExtensions.includes(ext.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedExtensions([...selectedExtensions, ext.id]);
                                            } else {
                                                setSelectedExtensions(selectedExtensions.filter(e => e !== ext.id));
                                            }
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-slate-800">{ext.label}</div>
                                        <div className="text-sm text-slate-600 mt-1">{ext.description}</div>
        </div>
                                </div>
                            </div>
                        ))}
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
    
    const renderStep4 = () => (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Geo Targeting Configuration</h2>
                <p className="text-slate-500">Select the specific locations where your ads will be shown.</p>
            </div>

            <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl">
                <CardContent className="p-8 space-y-8">
                    
                    {/* Country Selector */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-600"/> Target Country
                        </Label>
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
                            <SelectTrigger className="w-full text-lg py-6 bg-white/80">
                                <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map(country => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="bg-slate-200" />

                    {/* Location Detail */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600"/> Specific Locations
                        </Label>
                        
                        <Tabs value={targetType} onValueChange={setTargetType} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="CITY">Cities</TabsTrigger>
                                <TabsTrigger value="ZIP">Zip Codes</TabsTrigger>
                                <TabsTrigger value="STATE">States/Provinces</TabsTrigger>
                            </TabsList>

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
                                            className="flex-1"
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
                                        className="flex-1 border-dashed"
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
                                                setManualGeoInput(cities.join(', '));
                                            }}
                                            className="flex-1 min-w-[120px]"
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
                                        className="flex-1 border-dashed"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Manual Entry
                                    </Button>
                                </div>
                                <Textarea 
                                    placeholder="Enter cities manually (comma-separated, e.g., New York, NY, Los Angeles, CA, Chicago, IL)..."
                                    value={manualGeoInput}
                                    onChange={(e) => {
                                        setManualGeoInput(e.target.value);
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
                                                setManualGeoInput(states.join(', '));
                                            }}
                                            className="flex-1 min-w-[120px]"
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
                                        className="flex-1 border-dashed"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Manual Entry
                                    </Button>
                                </div>
                                <Textarea 
                                    placeholder="Enter states/provinces manually (comma-separated, e.g., California, New York, Texas, Florida)..."
                                    value={manualGeoInput}
                                    onChange={(e) => {
                                        setManualGeoInput(e.target.value);
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
                {/* Bug_67: Fix back button to go to previous step */}
                <Button variant="ghost" onClick={() => step > 1 && setStep(step - 1)}>Back</Button>
                <Button 
                    size="lg" 
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                >
                    Review Campaign <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );

    // Ensure we have ads for all ad groups when entering Step 5 - ensure same number of ads per group
    useEffect(() => {
        if (step === 5) {
            const reviewAdGroups = getDynamicAdGroups();
            if (reviewAdGroups.length > 0) {
                // Find the maximum number of ads in any ad group
                let maxAdsPerGroup = 0;
                reviewAdGroups.forEach(group => {
                    const groupAds = generatedAds.filter(ad => ad.adGroup === group.name);
                    if (groupAds.length > maxAdsPerGroup) {
                        maxAdsPerGroup = groupAds.length;
                    }
                });
                
                // If no ads exist at all, default to 3 ads per group
                if (maxAdsPerGroup === 0) {
                    maxAdsPerGroup = 3;
                }
                
                // Ensure all groups have the same number of ads
                const newAds: any[] = [];
                reviewAdGroups.forEach(group => {
                    const groupAds = generatedAds.filter(ad => ad.adGroup === group.name);
                    const adsNeeded = maxAdsPerGroup - groupAds.length;
                    
                    if (adsNeeded > 0) {
                        const mainKeyword = group.keywords[0] || 'your service';
                        const keywordText = mainKeyword.replace(/^\[|\]$|^"|"$/g, ''); // Remove brackets/quotes
                        
                        // Detect if keyword is service-based
                        const serviceKeywords = ['plumber', 'plumbing', 'carpenter', 'carpentry', 'electrician', 'electric', 
                            'contractor', 'handyman', 'roofer', 'roofing', 'painter', 'painting', 'mechanic', 'repair',
                            'lawyer', 'attorney', 'doctor', 'dentist', 'accountant', 'consultant', 'therapist', 'coach',
                            'service', 'services', 'installation', 'maintenance', 'cleaning', 'landscaping',
                            'hvac', 'heating', 'cooling', 'tutoring', 'training', 'coaching', 'consulting', 'call',
                            'contact', 'phone', 'number', 'emergency', '24/7', 'near me', 'local'];
                        const keywordLower = keywordText.toLowerCase();
                        const isServiceBased = serviceKeywords.some(sk => keywordLower.includes(sk));
                        
                        // Create multiple ads for this group to match the max
                        for (let i = 0; i < adsNeeded; i++) {
                            const adTypes = ['rsa', 'dki', 'callonly'].filter(type => enabledAdTypes.includes(type));
                            const adType = adTypes[i % adTypes.length] || (enabledAdTypes.includes('rsa') ? 'rsa' : enabledAdTypes.includes('dki') ? 'dki' : 'callonly');
                            
                            // Format URL properly
                            const baseUrl = url || 'www.example.com';
                            const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);
                            
                            let defaultAd: any = {
                                id: Date.now() + Math.random() * 1000 + Math.random() * 100 + i,
                                type: adType,
                                adGroup: group.name,
                                finalUrl: formattedUrl,
                                path1: isServiceBased ? 'service' : 'shop',
                                path2: isServiceBased ? 'quote' : 'now'
                            };
                            
                            if (adType === 'rsa') {
                                if (isServiceBased) {
                                    defaultAd = {
                                        ...defaultAd,
                                        headline1: `${keywordText} - Expert Service`,
                                        headline2: i === 0 ? 'Licensed Professionals' : i === 1 ? 'Available 24/7' : 'Free Estimate',
                                        headline3: i === 0 ? 'Same Day Service' : i === 1 ? 'Trusted & Reliable' : 'Quality Work Guaranteed',
                                        description1: `Looking for ${keywordText}? We offer professional service and expert quality.`,
                                        description2: `Get your ${keywordText} today with fast response and satisfaction guaranteed.`,
                                        finalUrl: formattedUrl
                                    };
                                } else {
                                    defaultAd = {
                                        ...defaultAd,
                                        headline1: `${keywordText} - Best Deals`,
                                        headline2: 'Shop Now & Save',
                                        headline3: i === 0 ? 'Fast Delivery Available' : i === 1 ? 'Free Shipping' : '24/7 Support',
                                        description1: `Looking for ${keywordText}? We offer competitive prices and excellent service.`,
                                        description2: `Get your ${keywordText} today with free shipping on orders over $50.`,
                                        finalUrl: formattedUrl
                                    };
                                }
                            } else if (adType === 'dki') {
                                if (isServiceBased) {
                                    defaultAd = {
                                        ...defaultAd,
                                        headline1: `{Keyword:${keywordText}} - Expert Service`,
                                        headline2: `Professional {Keyword:${keywordText}}`,
                                        headline3: i === 0 ? `24/7 {Keyword:${keywordText}}` : `Trusted {Keyword:${keywordText}}`,
                                        description1: `Expert {Keyword:${keywordText}} service. Licensed professionals ready to help.`,
                                        description2: `Get quality {Keyword:${keywordText}} with fast response and satisfaction guaranteed.`,
                                        finalUrl: formattedUrl
                                    };
                                } else {
                                    defaultAd = {
                                        ...defaultAd,
                                        headline1: `{Keyword:${keywordText}} - Official Site`,
                                        headline2: `Best {Keyword:${keywordText}} Deals`,
                                        headline3: i === 0 ? `Order {Keyword:${keywordText}} Online` : `Shop {Keyword:${keywordText}} Now`,
                                        description1: `Find quality {Keyword:${keywordText}} at great prices. Shop our selection today.`,
                                        description2: `Get your {Keyword:${keywordText}} with fast shipping and expert support.`,
                                        finalUrl: formattedUrl
                                    };
                                }
                            } else if (adType === 'callonly') {
                                defaultAd = {
                                    ...defaultAd,
                                    headline1: `Call for ${keywordText}`,
                                    headline2: i === 0 ? 'Available 24/7 - Speak to Expert' : 'Get Expert Advice Now',
                                    description1: isServiceBased 
                                        ? `Need ${keywordText}? Call us now for expert service and free estimate.`
                                        : `Need ${keywordText}? Call us now for expert advice and the best pricing.`,
                                    description2: 'Get immediate assistance. Our specialists are ready to help!',
                                    phone: '(555) 123-4567',
                                    businessName: 'Your Business',
                                    finalUrl: formattedUrl
                                };
                            }
                            
                            newAds.push(defaultAd);
                        }
                    }
                });
                
                if (newAds.length > 0) {
                    setGeneratedAds(prev => [...prev, ...newAds]);
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    // Step 5: Detailed Review - shows all ad groups with editable content
    const renderStep5 = () => {
        // Use dynamicAdGroups to get proper ad groups based on structure
        const reviewAdGroups = getDynamicAdGroups();
        
        // Calculate stats based on actual data
        const totalAdGroups = reviewAdGroups.length;
        const totalKeywords = selectedKeywords.length;
        const totalAds = generatedAds.length;
        const totalNegatives = negativeKeywords.split('\n').filter(n => n.trim()).length;

        // Helper to clean and format keyword display
        const formatKeywordDisplay = (keyword: string) => {
            // Remove match type brackets/quotes for base text
            let cleanKeyword = keyword;
            if (keyword.startsWith('[') && keyword.endsWith(']')) {
                cleanKeyword = keyword.slice(1, -1);
            } else if (keyword.startsWith('"') && keyword.endsWith('"')) {
                cleanKeyword = keyword.slice(1, -1);
            }
            
            // If keyword is too long (> 60 chars), truncate it
            if (cleanKeyword.length > 60) {
                cleanKeyword = cleanKeyword.substring(0, 57) + '...';
            }
            
            // Re-add match type formatting
            if (keyword.startsWith('[') && keyword.endsWith(']')) {
                return `[${cleanKeyword}]`;
            } else if (keyword.startsWith('"') && keyword.endsWith('"')) {
                return `"${cleanKeyword}"`;
            }
            return cleanKeyword;
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
                // Update in dynamic groups would require state management - for now just update ads
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
                // Update keywords - this would require updating selectedKeywords and regrouping
                // For now, we'll just update the display
            }
            setEditingGroupKeywords(null);
        };

        const handleEditNegatives = (groupName: string, negatives: string[]) => {
            setEditingGroupNegatives(groupName);
            setTempNegatives(negatives.join(', '));
        };

        const handleSaveNegatives = () => {
            if (tempNegatives.trim()) {
                setNegativeKeywords(tempNegatives.split(',').map(n => n.trim()).filter(Boolean).join('\n'));
            }
            setEditingGroupNegatives(null);
        };

        return (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-indigo-600">{totalAdGroups}</div>
                            <div className="text-xs text-slate-600 mt-1">Ad Groups</div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-purple-600">{totalKeywords}</div>
                            <div className="text-xs text-slate-600 mt-1">Keywords</div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600">{totalAds}</div>
                            <div className="text-xs text-slate-600 mt-1">Ads</div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-green-600">{totalNegatives}</div>
                            <div className="text-xs text-slate-600 mt-1">Negative Keywords</div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-orange-600">
                                {(() => {
                                    let locCount = 0;
                                    if (zipPreset) {
                                        const presetNumber = parseInt(zipPreset.replace(/\D/g, '')) || 0;
                                        locCount = presetNumber;
                                    } else if (cityPreset) {
                                        if (cityPreset === '0') {
                                            const locations = manualGeoInput.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
                                            locCount = locations.length;
                                        } else {
                                            const presetNumber = parseInt(cityPreset.replace(/\D/g, '')) || 0;
                                            locCount = presetNumber;
                                        }
                                    } else if (statePreset) {
                                        const presetNumber = parseInt(statePreset.replace(/\D/g, '')) || 0;
                                        locCount = presetNumber;
                                    } else if (manualGeoInput && manualGeoInput.trim()) {
                                        const locations = manualGeoInput.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
                                        locCount = locations.length;
                                    } else {
                                        locCount = 1; // Country only
                                    }
                                    return locCount;
                                })()}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                                {targetType === 'ZIP' ? 'ZIP Codes' : targetType === 'CITY' ? 'Cities' : targetType === 'STATE' ? 'States' : 'Locations'}
                            </div>
                            {targetCountry && (
                                <div className="text-[10px] text-slate-500 mt-0.5">{targetCountry}</div>
                            )}
                            {manualGeoInput && manualGeoInput.trim() && !zipPreset && !cityPreset && !statePreset && (
                                <div className="text-[10px] text-slate-500 mt-1 max-w-full truncate" title={manualGeoInput.split(',').slice(0, 5).join(', ')}>
                                    {manualGeoInput.split(',').slice(0, 3).map(loc => loc.trim()).filter(Boolean).join(', ')}
                                    {manualGeoInput.split(',').length > 3 ? '...' : ''}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Success Banner */}
                <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-2 border-emerald-300 rounded-xl p-5 shadow-lg">
                    <div className="flex items-start gap-3">
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
                </div>

                {/* Review Table - Show All Groups */}
                <Card className="border-indigo-200/60 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                                    <TableHead className="font-bold text-white w-[180px] py-4">AD GROUP</TableHead>
                                    <TableHead className="font-bold text-white w-[300px] max-w-[300px] py-4">ADS & EXTENSIONS</TableHead>
                                    <TableHead className="font-bold text-white w-[240px] py-4">KEYWORDS</TableHead>
                                    <TableHead className="font-bold text-white w-[180px] py-4">NEGATIVES</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviewAdGroups.map((group, idx) => {
                                    const groupAds = generatedAds.filter(ad => ad.adGroup === group.name);
                                    const allNegatives = negativeKeywords.split('\n').filter(n => n.trim());
                                    
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
                                            <TableCell className="align-top py-6 max-w-[300px]">
                                                {groupAds.length > 0 ? (
                                                    <div className="space-y-3 max-w-[300px]">
                                                        {groupAds.map((ad, adIdx) => (
                                                            <div key={ad.id || adIdx} className="space-y-2 text-sm border-b border-indigo-200/50 pb-3 last:border-0 last:pb-0 bg-gradient-to-r from-purple-50/30 to-indigo-50/30 p-3 rounded-lg max-w-full overflow-hidden">
                                                        <div className="flex items-start gap-2 max-w-full">
                                                            <div className="flex-1 min-w-0 max-w-[260px]">
                                                                        {(ad.type === 'rsa' || ad.type === 'dki') && (
                                                                            <>
                                                                <div className="text-indigo-700 font-semibold hover:text-purple-700 hover:underline cursor-pointer transition-colors overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.5em' }}>
                                                                                    {ad.headline1} {ad.headline2 && `| ${ad.headline2}`} {ad.headline3 && `| ${ad.headline3}`}
                                                                </div>
                                                                <div className="text-emerald-600 font-medium text-xs mt-1 truncate" title={`${ad.finalUrl || url || 'www.example.com'}/${ad.path1 || ''}/${ad.path2 || ''}`}>
                                                                                    {ad.finalUrl || url || 'www.example.com'}/{ad.path1 || ''}/{ad.path2 || ''}
                                                                </div>
                                                                                <div className="text-slate-700 text-xs mt-1.5 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.5em' }}>
                                                                                    {ad.description1}
                                                                </div>
                                                                                {ad.description2 && (
                                                                                    <div className="text-slate-600 text-xs mt-1 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.5em' }}>
                                                                                        {ad.description2}
                                                            </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {ad.type === 'callonly' && (
                                                                            <>
                                                                                <div className="text-indigo-700 font-bold overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.5em' }}>
                                                                                    {ad.headline1}
                                                                                </div>
                                                                                {ad.headline2 && (
                                                                                    <div className="text-purple-600 text-xs mt-1 font-medium truncate">
                                                                                        {ad.headline2}
                                                                                    </div>
                                                                                )}
                                                                                <div className="text-slate-700 text-xs mt-1.5 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.5em' }}>
                                                                                    {ad.description1}
                                                                                </div>
                                                                                {ad.description2 && (
                                                                                    <div className="text-slate-600 text-xs mt-1 leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.5em' }}>
                                                                                        {ad.description2}
                                                                                    </div>
                                                                                )}
                                                                                <div className="text-emerald-600 font-bold text-xs mt-2 flex items-center gap-1 truncate">
                                                                                    <Phone className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{ad.phone} • {ad.businessName}</span>
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
                                                        {group.keywords.slice(0, 10).map((kw, kidx) => {
                                                            // Remove match type brackets for raw keyword
                                                            let rawKeyword = kw;
                                                            if (kw.startsWith('[') && kw.endsWith(']')) {
                                                                rawKeyword = kw.slice(1, -1);
                                                            } else if (kw.startsWith('"') && kw.endsWith('"')) {
                                                                rawKeyword = kw.slice(1, -1);
                                                            }
                                                            const isTruncated = rawKeyword.length > 60;
                                                            
                                                            return (
                                                                <div 
                                                                    key={kidx} 
                                                                    className="flex items-center justify-between text-xs bg-purple-50/50 px-2 py-1.5 rounded-md border border-purple-100 hover:bg-purple-100/70 transition-colors"
                                                                    title={isTruncated ? rawKeyword : undefined}
                                                                >
                                                                    <span className="text-purple-900 font-mono font-medium truncate max-w-[180px]">
                                                                        {formatKeywordDisplay(kw)}
                                                                    </span>
                                                                    <Badge variant="outline" className={`ml-2 text-xs flex-shrink-0 ${
                                                                        getMatchTypeDisplay(kw) === 'Exact' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                                                        getMatchTypeDisplay(kw) === 'Phrase' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                                                        'bg-amber-100 text-amber-700 border-amber-300'
                                                                    }`}>
                                                                        {getMatchTypeDisplay(kw)}
                                                                    </Badge>
                                                                </div>
                                                            );
                                                        })}
                                                        {group.keywords.length > 10 && (
                                                            <div className="text-xs text-slate-500 italic px-2">
                                                                +{group.keywords.length - 10} more keywords...
                                                            </div>
                                                        )}
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
                                                                onClick={handleSaveNegatives}
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
                                                        <button 
                                                            onClick={() => handleEditNegatives(group.name, allNegatives)}
                                                            className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline mt-2 flex items-center gap-1"
                                                        >
                                                        Edit negatives
                                                    </button>
                                                </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                        {/* Bug_67: Fix back button to go to previous step */}
                        <Button variant="ghost" onClick={() => step > 1 && setStep(step - 1)}>
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
                        size="lg" 
                        onClick={() => setStep(6)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    >
                        Next - Generate CSV
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        );
    };

    // Helper function to convert campaign data to CSV format
    const convertCampaignToCSVFormat = () => {
        const adGroups = getDynamicAdGroups();
        
        // Build locations array
        const locations: any[] = [];
        if (targetCountry) {
            locations.push({ type: 'COUNTRY', value: targetCountry });
        }
        
        // Add location targeting based on type
        if (targetType === 'ZIP' && manualGeoInput) {
            const zipCodes = manualGeoInput.split(',').map(z => z.trim()).filter(Boolean);
            zipCodes.forEach(zip => {
                locations.push({ type: 'ZIP', value: zip });
            });
        } else if (targetType === 'CITY' && manualGeoInput) {
            const cities = manualGeoInput.split(',').map(c => c.trim()).filter(Boolean);
            cities.forEach(city => {
                locations.push({ type: 'CITY', value: city });
            });
        } else if (targetType === 'STATE' && manualGeoInput) {
            const states = manualGeoInput.split(',').map(s => s.trim()).filter(Boolean);
            states.forEach(state => {
                locations.push({ type: 'STATE', value: state });
            });
        }

        // Build negative keywords array
        const negatives = negativeKeywords.split('\n')
            .map(n => n.trim())
            .filter(Boolean)
            .map(n => ({
                text: n.replace(/^\[|\]$/g, '').replace(/^"|"$/g, ''),
                matchType: n.startsWith('[') ? 'EXACT' : n.startsWith('"') ? 'PHRASE' : 'PHRASE'
            }));

        // Build ad groups with keywords and ads
        const csvAdGroups = adGroups.map(ag => {
            // Get keywords for this ad group
            const groupKeywords = ag.keywords.map((kw: string) => {
                const cleanKw = kw.replace(/^\[|\]$/g, '').replace(/^"|"$/g, '');
                let matchType = 'PHRASE';
                if (kw.startsWith('[') && kw.endsWith(']')) matchType = 'EXACT';
                else if (kw.startsWith('"') && kw.endsWith('"')) matchType = 'PHRASE';
                else matchType = 'BROAD';
                
                return {
                    phrase: cleanKw,
                    matchType: matchType,
                    operation: 'NEW'
                };
            });

            // Get ads for this ad group
            const groupAds = generatedAds
                .filter(ad => ad.adGroup === ag.name)
                .map(ad => {
                    const adData: any = {
                        type: ad.type || 'RESPONSIVE_SEARCH_AD',
                        finalUrl: url || ad.finalUrl || '',
                        operation: 'NEW'
                    };

                    // Extract headlines and descriptions
                    if (ad.headlines && Array.isArray(ad.headlines)) {
                        adData.headlines = ad.headlines;
                    } else if (ad.headline) {
                        adData.headlines = [ad.headline];
                    }

                    if (ad.descriptions && Array.isArray(ad.descriptions)) {
                        adData.descriptions = ad.descriptions;
                    } else if (ad.description) {
                        adData.descriptions = [ad.description];
                    }

                    if (ad.id) adData.id = ad.id;

                    return adData;
                });

            return {
                name: ag.name,
                status: 'ENABLED',
                defaultBid: '',
                operation: 'NEW',
                keywords: groupKeywords,
                ads: groupAds,
                negatives: negatives
            };
        });

        return [{
            name: campaignName,
            campaign: campaignName,
            type: 'SEARCH',
            status: 'ENABLED',
            budget: '',
            operation: 'NEW',
            adGroups: csvAdGroups,
            negatives: negatives,
            locations: locations
        }];
    };

    // Step 6: Generate CSV
    const renderStep6 = () => {
        const handleGenerateCSV = async () => {
            setIsGeneratingCSV(true);
            try {
                const campaigns = convertCampaignToCSVFormat();
                const result = generateGoogleAdsCSV(campaigns);
                
                setCsvContent(result.csv);
                setCsvValidation(result.validation);
                setCsvGenerated(true);
                
                // Download CSV
                const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `${campaignName.replace(/\s+/g, '_')}_google_ads.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                notifications.success('CSV generated successfully!', {
                    title: 'CSV Generated',
                    description: 'Your Google Ads CSV file has been generated and downloaded.'
                });
            } catch (error: any) {
                console.error('CSV generation error:', error);
                notifications.error('Failed to generate CSV', {
                    title: 'CSV Generation Failed',
                    description: error.message || 'An error occurred while generating the CSV file.'
                });
            } finally {
                setIsGeneratingCSV(false);
            }
        };

        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                        <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Generate CSV</h2>
                    <p className="text-slate-500 mt-2">Generate a Google Ads Editor-compatible CSV file</p>
                </div>

                {!csvGenerated ? (
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-8">
                            <div className="text-center space-y-6">
                                <p className="text-slate-600">
                                    Click the button below to generate your CSV file. The file will be validated and formatted for Google Ads Editor import.
                                </p>
                                <Button
                                    onClick={handleGenerateCSV}
                                    disabled={isGeneratingCSV}
                                    size="lg"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
                                >
                                    {isGeneratingCSV ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            Generating CSV...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5 mr-2" />
                                            Generate CSV
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-green-200/60 bg-green-50/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-8">
                            <div className="text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                                <h3 className="text-2xl font-bold text-green-900">CSV Generated Successfully!</h3>
                                <p className="text-slate-600">
                                    Your CSV file has been generated and downloaded. You can now validate it or proceed to import it into Google Ads Editor.
                                </p>
                                
                                {csvValidation && csvValidation.warnings.length > 0 && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                                            {csvValidation.warnings.length} warning(s) found. Review them before importing.
                                        </p>
                            </div>
                                )}

                                <div className="flex gap-4 justify-center mt-6">
                                    <Button
                                        onClick={() => {
                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                            const link = document.createElement('a');
                                            const url = URL.createObjectURL(blob);
                                            link.setAttribute('href', url);
                                            link.setAttribute('download', `${campaignName.replace(/\s+/g, '_')}_google_ads.csv`);
                                            link.style.visibility = 'hidden';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        variant="outline"
                                        className="px-6"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Again
                                    </Button>
                                    <Button
                                        onClick={() => setStep(7)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                                    >
                                        Validate Your CSV
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                )}

                <div className="flex justify-between pt-6 border-t border-slate-200">
                    <Button variant="ghost" onClick={() => setStep(5)} className="text-slate-500 hover:text-slate-800">
                        Back to Review
                    </Button>
                    {csvGenerated && (
                    <Button 
                        size="lg" 
                            onClick={() => setStep(7)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                        >
                            Validate CSV <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    )}
                </div>
            </div>
        );
    };

    // Step 7: Validate CSV
    const renderStep7 = () => {
        const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                setUploadedCsvFile(file);
            }
        };

        const handleValidateCSV = async () => {
            if (!uploadedCsvFile) {
                notifications.warning('Please upload a CSV file first', {
                    title: 'No File Selected'
                                });
                                return;
                            }
                            
            setIsValidatingCsv(true);
            try {
                const text = await uploadedCsvFile.text();
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                
                const rows: any[] = [];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                        const row: any = {};
                        headers.forEach((header, idx) => {
                            row[header] = values[idx] || '';
                        });
                        rows.push(row);
                    }
                }

                const validation = validateRows(rows);
                setCsvValidationResults({
                    rows: rows,
                    headers: headers,
                    validation: validation,
                    totalRows: rows.length
                });

                if (validation.fatalErrors.length === 0) {
                    notifications.success('CSV validation completed', {
                        title: 'Validation Successful',
                        description: 'Your CSV file is ready for Google Ads Editor import.'
                    });
                } else {
                    notifications.error('CSV validation found errors', {
                        title: 'Validation Failed',
                        description: `${validation.fatalErrors.length} fatal error(s) found. Please review and fix them.`
                    });
                }
            } catch (error: any) {
                console.error('CSV validation error:', error);
                notifications.error('Failed to validate CSV', {
                    title: 'Validation Error',
                    description: error.message || 'An error occurred while validating the CSV file.'
                });
            } finally {
                setIsValidatingCsv(false);
            }
        };

        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                        <FileCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Validate Your CSV</h2>
                    <p className="text-slate-500 mt-2">Upload and validate your CSV file for Google Ads Editor compatibility</p>
                </div>

                <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="csv-upload" className="text-base font-semibold mb-2 block">
                                    Upload CSV File
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="flex-1"
                                    />
                        <Button 
                                        onClick={handleValidateCSV}
                                        disabled={!uploadedCsvFile || isValidatingCsv}
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        {isValidatingCsv ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Validating...
                                            </>
                                        ) : (
                                            <>
                                                <FileCheck className="w-4 h-4 mr-2" />
                                                Validate
                                            </>
                                        )}
                        </Button>
                    </div>
                                {uploadedCsvFile && (
                                    <p className="text-sm text-slate-600 mt-2">
                                        Selected: {uploadedCsvFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {csvValidationResults && (
                    <>
                        {/* Validation Statistics Summary */}
                        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                            <CardHeader>
                                <CardTitle>Validation Statistics</CardTitle>
                                <CardDescription>
                                    Click on any row to expand and see details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {/* Errors Row */}
                                    <div 
                                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                                        onClick={() => {
                                            const newExpanded = new Set(expandedValidationStats);
                                            if (newExpanded.has('errors')) {
                                                newExpanded.delete('errors');
                                            } else {
                                                newExpanded.add('errors');
                                            }
                                            setExpandedValidationStats(newExpanded);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            <span className="font-medium">Errors</span>
                                            <span className="text-red-600 font-bold">{csvValidationResults.validation.fatalErrors.length}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">
                                                {expandedValidationStats.has('errors') ? 'Click to collapse' : 'Click to expand'}
                                            </span>
                                            {expandedValidationStats.has('errors') ? (
                                                <ChevronUp className="w-4 h-4 text-slate-600" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-600" />
                                            )}
                                        </div>
                                    </div>
                                    {expandedValidationStats.has('errors') && csvValidationResults.validation.fatalErrors.length > 0 && (
                                        <div className="ml-8 mt-2 space-y-2 max-h-60 overflow-y-auto">
                                            {csvValidationResults.validation.fatalErrors.map((error: any, idx: number) => (
                                                <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                                                    <span className="font-medium text-red-800">
                                                        Row {error.rowIndex + 1} • {error.errors.join(', ')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Warnings Row */}
                                    <div 
                                        className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                                        onClick={() => {
                                            const newExpanded = new Set(expandedValidationStats);
                                            if (newExpanded.has('warnings')) {
                                                newExpanded.delete('warnings');
                                            } else {
                                                newExpanded.add('warnings');
                                            }
                                            setExpandedValidationStats(newExpanded);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                            <span className="font-medium">Warnings</span>
                                            <span className="text-yellow-600 font-bold">{csvValidationResults.validation.warnings.length}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">
                                                {expandedValidationStats.has('warnings') ? 'Click to collapse' : 'Click to expand'}
                                            </span>
                                            {expandedValidationStats.has('warnings') ? (
                                                <ChevronUp className="w-4 h-4 text-slate-600" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-600" />
                                            )}
                                        </div>
                                    </div>
                                    {expandedValidationStats.has('warnings') && csvValidationResults.validation.warnings.length > 0 && (
                                        <div className="ml-8 mt-2 space-y-2 max-h-60 overflow-y-auto">
                                            {csvValidationResults.validation.warnings.map((warning: any, idx: number) => (
                                                <div key={idx} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                                    <span className="font-medium text-yellow-800">
                                                        {warning.rowIndex !== undefined ? `Row ${warning.rowIndex + 1} • ` : ''}
                                                        {warning.msg}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Total Rows Row */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <span className="font-medium">Total Rows</span>
                                            <span className="text-blue-600 font-bold">{csvValidationResults.totalRows}</span>
                                        </div>
                                        <span className="text-sm text-slate-600">Rows parsed from CSV</span>
                                    </div>
                                </div>

                                {/* Export Errors & Warnings Button */}
                                {(csvValidationResults.validation.fatalErrors.length > 0 || csvValidationResults.validation.warnings.length > 0) && (
                                    <div className="mt-4 pt-4 border-t">
                                        <Button
                                            onClick={() => {
                                                // Get all rows with errors or warnings
                                                const errorRowIndices = new Set(
                                                    csvValidationResults.validation.fatalErrors
                                                        .map((e: any) => e.rowIndex)
                                                        .filter((idx: number) => idx !== undefined)
                                                );
                                                const warningRowIndices = new Set(
                                                    csvValidationResults.validation.warnings
                                                        .map((w: any) => w.rowIndex)
                                                        .filter((idx: number) => idx !== undefined)
                                                );
                                                const allProblemIndices = new Set([...errorRowIndices, ...warningRowIndices]);

                                                if (allProblemIndices.size === 0) {
                                                    notifications.info('No row-level errors or warnings found.', {
                                                        title: 'No Row Problems'
                                                    });
                                                    return;
                                                }

                                                // Filter rows to only include those with problems
                                                const problemRows = csvValidationResults.rows.filter((_: any, idx: number) => 
                                                    allProblemIndices.has(idx)
                                                );

                                                if (problemRows.length === 0) {
                                                    notifications.warning('No rows with errors found.', {
                                                        title: 'No Error Rows'
                                                    });
                                                    return;
                                                }

                                                // Add Problems column
                                                const allHeaders = csvValidationResults.headers;
                                                const enhancedHeaders = [...allHeaders, 'Problems'];
                                                const enhancedRows = problemRows.map((row: any, idx: number) => {
                                                    const originalIdx = csvValidationResults.rows.indexOf(row);
                                                    const rowErrors = csvValidationResults.validation.fatalErrors
                                                        .filter((e: any) => e.rowIndex === originalIdx)
                                                        .map((e: any) => `ERROR: ${e.errors.join(', ')}`)
                                                        .join('; ');
                                                    const rowWarnings = csvValidationResults.validation.warnings
                                                        .filter((w: any) => w.rowIndex === originalIdx)
                                                        .map((w: any) => `WARNING: ${w.msg}`)
                                                        .join('; ');
                                                    const problems = [rowErrors, rowWarnings].filter(p => p).join('; ');
                                                    return [...allHeaders.map((h: string) => row[h] || ''), problems];
                                                });

                                                const csv = Papa.unparse({ 
                                                    fields: enhancedHeaders, 
                                                    data: enhancedRows
                                                });
                                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                const errorCount = csvValidationResults.validation.fatalErrors.length;
                                                const warningCount = csvValidationResults.validation.warnings.length;
                                                link.download = `google-ads-errors-warnings-${errorCount}E-${warningCount}W-${new Date().toISOString().split('T')[0]}.csv`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                URL.revokeObjectURL(url);
                                                
                                                notifications.success(`Exported ${problemRows.length} row(s) with ${errorCount} error(s) and ${warningCount} warning(s).`, {
                                                    title: 'Errors & Warnings Exported',
                                                    description: `File: ${link.download}`
                                                });
                                            }}
                                            variant="outline"
                                            className="w-full border-red-300 text-red-700 hover:bg-red-50"
                                        >
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Export Errors & Warnings to CSV
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detailed Results Card (Collapsible) */}
                        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl mt-4">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Detailed Validation Results</CardTitle>
                                        <CardDescription>
                                            Column-by-column validation report
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newExpanded = new Set(expandedValidationStats);
                                            if (newExpanded.has('details')) {
                                                newExpanded.delete('details');
                                            } else {
                                                newExpanded.add('details');
                                            }
                                            setExpandedValidationStats(newExpanded);
                                        }}
                                    >
                                        {expandedValidationStats.has('details') ? (
                                            <>
                                                <ChevronUp className="w-4 h-4 mr-2" />
                                                Collapse
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4 mr-2" />
                                                Expand
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            {expandedValidationStats.has('details') && (
                                <CardContent>
                                    <div className="space-y-4">

                                {csvValidationResults.validation.fatalErrors.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-red-600 mb-3">Fatal Errors</h3>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {csvValidationResults.validation.fatalErrors.map((error: any, idx: number) => (
                                                <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                                                    <div className="text-sm font-medium text-red-800">
                                                        Row {error.rowIndex + 1}: {error.errors.join(', ')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {csvValidationResults.validation.warnings.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-yellow-600 mb-3">Warnings</h3>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {csvValidationResults.validation.warnings.map((warning: any, idx: number) => (
                                                <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                                    <div className="text-sm font-medium text-yellow-800">
                                                        {warning.rowIndex !== undefined ? `Row ${warning.rowIndex + 1}: ` : ''}
                                                        {warning.msg}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {csvValidationResults.validation.fatalErrors.length === 0 && csvValidationResults.validation.warnings.length === 0 && (
                                    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                        <h3 className="font-semibold text-green-800 mb-2">All Validations Passed!</h3>
                                        <p className="text-sm text-green-700">
                                            Your CSV file is ready for Google Ads Editor import.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <h3 className="font-semibold text-slate-800 mb-3">Column Details</h3>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Column Name</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Details</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {csvValidationResults.headers.map((header: string, idx: number) => {
                                                    const hasErrors = csvValidationResults.validation.fatalErrors.some(
                                                        (e: any) => e.rowIndex !== undefined
                                                    );
                                                    const hasWarnings = csvValidationResults.validation.warnings.some(
                                                        (w: any) => w.rowIndex !== undefined
                                                    );
                                                    
                                                    return (
                                                        <TableRow key={idx}>
                                                            <TableCell className="font-medium">{header}</TableCell>
                                                            <TableCell>
                                                                {hasErrors ? (
                                                                    <Badge variant="destructive">Error</Badge>
                                                                ) : hasWarnings ? (
                                                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Warning</Badge>
                                                                ) : (
                                                                    <Badge className="bg-green-100 text-green-800">OK</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-slate-600">
                                                                {hasErrors || hasWarnings ? 'Review required' : 'Valid'}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-between pt-6 border-t border-slate-200">
                    <Button variant="ghost" onClick={() => setStep(6)} className="text-slate-500 hover:text-slate-800">
                        Back to Generate CSV
                    </Button>
                </div>
            </div>
        );
    };

    // Old Step 6 removed - replaced with new Step 6 (Generate CSV) and Step 7 (Validate CSV)

    // Render Saved Campaigns View
    const renderSavedCampaigns = () => {
        return (
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Saved Campaigns</h2>
                        <p className="text-slate-500 mt-1">View and manage your campaign history</p>
                    </div>
                    <Button
                        onClick={() => loadSavedCampaigns()}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {loadingCampaigns ? (
                    <div className="text-center py-12">
                        <div className="text-slate-500">Loading campaigns...</div>
                    </div>
                ) : savedCampaigns.length === 0 ? (
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-12 text-center">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No saved campaigns yet</h3>
                            <p className="text-slate-500 mb-4">Start building a campaign and save it to see it here.</p>
                            <Button onClick={() => setActiveView('builder')}>
                                Create New Campaign
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedCampaigns.map((campaign) => {
                            const isDraft = campaign.data?.isDraft || campaign.data?.step < 6;
                            const date = new Date(campaign.timestamp);
                            const formattedDate = date.toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <Card key={campaign.id} className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-1">{campaign.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formattedDate}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={isDraft ? "outline" : "default"} className={isDraft ? "border-yellow-500 text-yellow-700" : ""}>
                                                {isDraft ? 'Draft' : 'Complete'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-slate-500">Structure:</span>
                                                    <span className="ml-2 font-medium">{campaign.data?.structure || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Step:</span>
                                                    <span className="ml-2 font-medium">{campaign.data?.step || 1}/6</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Keywords:</span>
                                                    <span className="ml-2 font-medium">{campaign.data?.selectedKeywords?.length || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Ads:</span>
                                                    <span className="ml-2 font-medium">{campaign.data?.generatedAds?.length || 0}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    onClick={() => handleLoadCampaign(campaign)}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    size="sm"
                                                >
                                                    <ArrowRight className="w-4 h-4 mr-2" />
                                                    Load
                                                </Button>
                                                <Button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to delete this campaign?')) {
                                                            try {
                                                                await historyService.deleteHistory(campaign.id);
                                                                await loadSavedCampaigns();
                                                            } catch (error) {
                                                                console.error("Failed to delete", error);
                                                                notifications.error('Failed to delete campaign. Please try again.', {
                                                                    title: 'Delete Failed'
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // Main render based on step
    return (
        <div className="min-h-screen relative">
            {/* Auto Fill Button */}
            <AutoFillButton onAutoFill={handleAutoFill} />
            
            {/* Tabs at Top Right */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-end mb-2">
                        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'builder' | 'saved')} className="w-auto">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="builder">Campaign Builder</TabsTrigger>
                                <TabsTrigger value="saved">Saved Campaigns</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            {activeView === 'saved' ? (
                renderSavedCampaigns()
            ) : (
                <>
            {/* Progress Steps */}
                    <div className="sticky top-[73px] z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: 'Setup', icon: Layout },
                            { num: 2, label: 'Keywords', icon: Search },
                            { num: 3, label: 'Ads & Ext.', icon: FileText },
                            { num: 4, label: 'Geo Target', icon: Globe },
                            { num: 5, label: 'Review', icon: CheckCircle2 },
                            { num: 6, label: 'Generate CSV', icon: Download },
                            { num: 7, label: 'Validate CSV', icon: FileCheck }
                        ].map(({ num, label, icon: Icon }, idx, arr) => (
                            <React.Fragment key={num}>
                                <div 
                                    className={`flex items-center gap-3 cursor-pointer transition-all ${
                                        step === num ? 'scale-110' : 'opacity-60 hover:opacity-100'
                                    }`}
                                    onClick={() => num < step && setStep(num)}
                                >
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                                        step === num 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                            : step > num
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'bg-white border-slate-300 text-slate-400'
                                    }`}>
                                        {step > num ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`hidden sm:block font-medium ${
                                        step === num ? 'text-indigo-600' : 'text-slate-600'
                                    }`}>
                                        {label}
                                    </span>
                                </div>
                                {idx < arr.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${
                                        step > num ? 'bg-green-500' : 'bg-slate-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="py-12">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                {step === 6 && renderStep6()}
                {step === 7 && renderStep7()}
            </div>

                    {/* Success Modal */}
                    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    Campaign Saved Successfully!
                                </DialogTitle>
                                <DialogDescription>
                                    Your campaign "{campaignName}" has been saved to your saved campaigns. You can access it from the Saved Campaigns tab.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button 
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        setActiveView('saved');
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    View Saved Campaigns
                                </Button>
                                <Button 
                                    onClick={() => setShowSuccessModal(false)}
                                    variant="outline"
                                >
                                    OK
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}

export default CampaignBuilder;