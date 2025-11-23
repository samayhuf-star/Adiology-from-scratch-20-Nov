import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, ChevronRight, Download, FileText, Globe, 
  Layout, Layers, MapPin, Mail, Hash, TrendingUp, Zap, 
  Phone, Repeat, Search, Sparkles, Edit3, Trash2, Save, RefreshCw, Clock,
  CheckCircle2, AlertCircle, ShieldCheck, AlertTriangle, Plus, Link2, 
  DollarSign, Smartphone, MessageSquare, Building2, FileText as FormIcon, 
  Tag, Image as ImageIcon, Gift
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
import { historyService } from '../utils/historyService';
import { KeywordPlanner } from './KeywordPlanner';
import { KeywordPlannerSelectable } from './KeywordPlannerSelectable';
import { LiveAdPreview } from './LiveAdPreview';
import { CompactAdBuilder } from './CompactAdBuilder';

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
    const seedList = seeds.split('\n').filter(s => s.trim());
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

        // 2. Prefix + Seed (20 variants)
        prefixes.forEach(prefix => {
            results.push({ id: `k-${idCounter++}`, text: `${prefix} ${cleanSeed}`, volume: 'Medium', cpc: '$3.10', type: 'Phrase' });
        });

        // 3. Seed + Suffix (18 variants)
        suffixes.forEach(suffix => {
            results.push({ id: `k-${idCounter++}`, text: `${cleanSeed} ${suffix}`, volume: 'High', cpc: '$2.80', type: 'Phrase' });
        });

        // 4. Prefix + Seed + Suffix (360 potential variants -> Limit to ~50 random)
        for (let i = 0; i < 50; i++) {
            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const s = suffixes[Math.floor(Math.random() * suffixes.length)];
            results.push({ id: `k-${idCounter++}`, text: `${p} ${cleanSeed} ${s}`, volume: 'Low', cpc: '$1.50', type: 'Broad' });
        }

        // 5. Intent + Seed (8 variants)
        intents.forEach(intent => {
            results.push({ id: `k-${idCounter++}`, text: `${intent} ${cleanSeed}`, volume: 'High', cpc: '$3.50', type: 'Exact' });
        });

        // 6. Seed + Location (35 variants)
        locations.forEach(loc => {
            results.push({ id: `k-${idCounter++}`, text: `${cleanSeed} ${loc}`, volume: 'Medium', cpc: '$4.20', type: 'Local' });
        });

        // 7. Prefix + Seed + Location (Limit to ~50 random)
        for (let i = 0; i < 50; i++) {
            const p = prefixes[Math.floor(Math.random() * prefixes.length)];
            const l = locations[Math.floor(Math.random() * locations.length)];
            results.push({ id: `k-${idCounter++}`, text: `${p} ${cleanSeed} ${l}`, volume: 'Medium', cpc: '$3.90', type: 'Local' });
        }
    });

    // Filter out negatives
    results = results.filter(r => !negativeList.some(n => r.text.includes(n)));

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

    // If more than 1000, slice
    if (results.length > 1000) {
        results = results.slice(0, 1000);
    }

    // Shuffle results for "AI" feel
    results = results.sort(() => Math.random() - 0.5);

    return results;
};

export const CampaignBuilder = ({ initialData }: { initialData?: any }) => {
    // --- State ---
    const [step, setStep] = useState(1);
    
    // Step 1: Structure
    const [structure, setStructure] = useState('SKAG');
    const [geo, setGeo] = useState('ZIP');
    const [matchTypes, setMatchTypes] = useState({ broad: true, phrase: true, exact: true });
    const [url, setUrl] = useState('');

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
    const [generatedAds, setGeneratedAds] = useState<any[]>([
        {
            id: 1,
            headline: 'New Refrigerators | Online Store | Free Delivery',
            displayUrl: 'www.appliances.com/shop/now',
            description: 'Buy online new refrigerators. Vast collection of new refrigerators.',
            extension: '20% OFF Today | Spring Sales',
            extensionUrl: 'www.appliances.com/shop/now',
            extensionDescription: 'Vast collection of new refrigerators. High quality new refrigerators available in stock.',
            type: 'rsa'
        },
        {
            id: 2,
            headline: 'Call 123 456 789 | New Refrigerators | Online Store',
            displayUrl: 'books.com',
            description: 'Acme Book Shop - Get a quote for new refrigerators. Call to learn about new refrigerators.',
            type: 'call'
        },
        {
            id: 3,
            headline: '20% OFF Today | Spring Sales',
            displayUrl: 'www.appliances.com/shop/now',
            description: 'High quality new refrigerators available in stock. Many new refrigerators available.',
            extension: '20% OFF Today | Spring Sales',
            type: 'rsa'
        }
    ]);
    const [editingAdId, setEditingAdId] = useState<number | null>(null);

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
            setCampaignName(initialData.name || 'Restored Campaign');
            // Jump to review step if loaded
            if (initialData.step) setStep(initialData.step);
        }
    }, [initialData]);

    // Keep ALL AD GROUPS selected by default, don't auto-switch
    // useEffect removed - we want to stay on ALL AD GROUPS by default

    const saveToHistory = async () => {
        // Use date/time as default name if campaign name is empty
        const nameToSave = campaignName.trim() || `Campaign ${new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        })}`;
        
        // Update campaign name if it was empty
        if (!campaignName.trim()) {
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
            alert('Failed to save campaign. Please try again.');
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
            if (data.name) setCampaignName(data.name);
        }
        // Switch to builder view
        setActiveView('builder');
    };

    // --- Handlers ---

    const handleGenerateKeywords = async () => {
        if (!seedKeywords.trim()) return;
        
        if (!projectId) {
             console.warn("Project ID is missing, using mock generation");
             // Use mock generation immediately
             setIsGeneratingKeywords(true);
             setTimeout(() => {
                 const mockKeywords = generateMockKeywords(seedKeywords, negativeKeywords);
                 setGeneratedKeywords(mockKeywords);
                 setSelectedKeywords(mockKeywords.map((k: any) => k.id));
                 setIsGeneratingKeywords(false);
             }, 1500);
             return;
        }

        setIsGeneratingKeywords(true);
        
        try {
            console.log("Attempting AI keyword generation...");
            // Using the explicit path which matches the route defined in the server
            const data = await api.post('/generate-keywords', {
                seeds: seedKeywords,
                negatives: negativeKeywords
            });

            if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
                console.log("AI generation successful:", data.keywords.length, "keywords");
                setGeneratedKeywords(data.keywords);
                setSelectedKeywords(data.keywords.map((k: any) => k.id));
            } else {
                throw new Error("No keywords returned from AI");
            }
        } catch (error) {
            console.log('ℹ️ Backend unavailable - using local fallback generation');
            // Fallback to mock generation
            const mockKeywords = generateMockKeywords(seedKeywords, negativeKeywords);
            setGeneratedKeywords(mockKeywords);
            setSelectedKeywords(mockKeywords.map((k: any) => k.id));
        } finally {
            setIsGeneratingKeywords(false);
        }
    };

    const handleNextStep = () => {
        if (step >= 6) return; // Don't go beyond step 6
        
        const nextStep = step + 1;
        
        // Handle step-specific logic BEFORE incrementing
        if (step === 1) {
            // Moving from Step 1 to Step 2 - nothing special needed
        } else if (step === 2) {
            // Log selected keywords for campaign creation
            console.log(`✅ Proceeding to Ad Creation with ${selectedKeywords.length} selected keywords:`, selectedKeywords);
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
        
        // Increment step only once
        setStep(nextStep);
    };

    const runValidation = () => {
        setValidationStatus('validating');
        setIsValidating(true);
        setTimeout(() => {
            setIsValidating(false);
            setValidationStatus('success');
        }, 2500);
    };

    const handleSaveCampaign = () => {
        saveToHistory();
    };

    const handleSaveDraft = () => {
        saveToHistory();
    };

    // Validate CSV for Google Ads Editor compatibility
    const validateCSV = (): { valid: boolean; errors: string[]; warnings: string[] } => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const adGroups = getDynamicAdGroups();
        
        // Check if we have ad groups
        if (adGroups.length === 0) {
            errors.push('No ad groups found. Please create at least one ad group.');
        }
        
        // Check if we have keywords
        if (selectedKeywords.length === 0) {
            errors.push('No keywords found. Please add keywords to your campaign.');
        }
        
        // Check if we have ads
        if (generatedAds.length === 0) {
            errors.push('No ads found. Please create at least one ad.');
        }
        
        // Check if all ad groups have ads
        adGroups.forEach(group => {
            const groupAds = generatedAds.filter(ad => ad.adGroup === group.name);
            if (groupAds.length === 0) {
                warnings.push(`Ad group "${group.name}" has no ads.`);
            }
        });
        
        // Check required ad fields and auto-fix URLs
        const adsToFix: Array<{ index: number; finalUrl: string }> = [];
        const adsByGroup: { [key: string]: any[] } = {};
        
        // Group ads by ad group for better error reporting
        generatedAds.forEach((ad, idx) => {
            const groupName = ad.adGroup || 'Unknown';
            if (!adsByGroup[groupName]) {
                adsByGroup[groupName] = [];
            }
            adsByGroup[groupName].push({ ...ad, _index: idx });
        });
        
        generatedAds.forEach((ad, idx) => {
            const groupName = ad.adGroup || 'Unknown Group';
            const adNumber = adsByGroup[groupName]?.findIndex((a: any) => a.id === ad.id) + 1 || idx + 1;
            
            if (ad.type === 'rsa' || ad.type === 'dki') {
                // RSA/DKI requires at least 3 headlines and 2 descriptions
                const missingHeadlines: string[] = [];
                if (!ad.headline1 || ad.headline1.trim() === '') missingHeadlines.push('Headline 1');
                if (!ad.headline2 || ad.headline2.trim() === '') missingHeadlines.push('Headline 2');
                if (!ad.headline3 || ad.headline3.trim() === '') missingHeadlines.push('Headline 3');
                
                if (missingHeadlines.length > 0) {
                    errors.push(`Ad ${adNumber} in "${groupName}" is missing required headlines: ${missingHeadlines.join(', ')}. RSA/DKI ads require at least 3 headlines.`);
                }
                
                const missingDescriptions: string[] = [];
                if (!ad.description1 || ad.description1.trim() === '') missingDescriptions.push('Description 1');
                if (!ad.description2 || ad.description2.trim() === '') missingDescriptions.push('Description 2');
                
                if (missingDescriptions.length > 0) {
                    errors.push(`Ad ${adNumber} in "${groupName}" is missing required descriptions: ${missingDescriptions.join(', ')}. RSA/DKI ads require at least 2 descriptions.`);
                }
                
                if (!ad.finalUrl || ad.finalUrl.trim() === '') {
                    errors.push(`Ad ${adNumber} in "${groupName}" is missing Final URL.`);
                } else if (!ad.finalUrl.match(/^https?:\/\//i)) {
                    // Auto-fix URL format if missing protocol
                    const fixedUrl = ad.finalUrl.startsWith('www.') ? `https://${ad.finalUrl}` : `https://${ad.finalUrl}`;
                    adsToFix.push({ index: idx, finalUrl: fixedUrl });
                }
            }
            if (ad.type === 'callonly') {
                const missingHeadlines: string[] = [];
                if (!ad.headline1 || ad.headline1.trim() === '') missingHeadlines.push('Headline 1');
                if (!ad.headline2 || ad.headline2.trim() === '') missingHeadlines.push('Headline 2');
                
                if (missingHeadlines.length > 0) {
                    errors.push(`Call-only ad ${adNumber} in "${groupName}" is missing required headlines: ${missingHeadlines.join(', ')}.`);
                }
                
                const missingDescriptions: string[] = [];
                if (!ad.description1 || ad.description1.trim() === '') missingDescriptions.push('Description 1');
                if (!ad.description2 || ad.description2.trim() === '') missingDescriptions.push('Description 2');
                
                if (missingDescriptions.length > 0) {
                    errors.push(`Call-only ad ${adNumber} in "${groupName}" is missing required descriptions: ${missingDescriptions.join(', ')}.`);
                }
                
                if (!ad.phone || ad.phone.trim() === '') {
                    errors.push(`Call-only ad ${adNumber} in "${groupName}" is missing phone number.`);
                }
                if (!ad.businessName || ad.businessName.trim() === '') {
                    errors.push(`Call-only ad ${adNumber} in "${groupName}" is missing business name.`);
                }
                if (ad.finalUrl && !ad.finalUrl.match(/^https?:\/\//i)) {
                    // Auto-fix URL format if missing protocol
                    const fixedUrl = ad.finalUrl.startsWith('www.') ? `https://${ad.finalUrl}` : `https://${ad.finalUrl}`;
                    adsToFix.push({ index: idx, finalUrl: fixedUrl });
                }
            }
        });
        
        // Auto-fix URLs that don't start with http:// or https://
        if (adsToFix.length > 0) {
            setGeneratedAds(prev => prev.map((ad, idx) => {
                const fix = adsToFix.find(f => f.index === idx);
                if (fix) {
                    return { ...ad, finalUrl: fix.finalUrl };
                }
                return ad;
            }));
        }
        
        return {
            valid: errors.length === 0,
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

    const generateCSV = () => {
        // Validate before generating
        const validation = validateCSV();
        
        if (!validation.valid) {
            alert(`CSV validation failed:\n\n${validation.errors.join('\n')}\n\nPlease fix these issues before exporting.`);
            return;
        }
        
        if (validation.warnings.length > 0) {
            const proceed = confirm(`CSV validation warnings:\n\n${validation.warnings.join('\n')}\n\nDo you want to continue anyway?`);
            if (!proceed) return;
        }
        
        const adGroups = getDynamicAdGroups();
        const campaignNameValue = campaignName || 'Campaign 1';
        const baseUrl = formatURL(url || 'www.example.com');
        
        // Google Ads Editor compatible CSV format - all required columns
        const headers = [
            "Campaign", "Ad Group", "Row Type", "Status",
            "Keyword", "Match Type", 
            "Final URL", "Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5",
            "Headline 6", "Headline 7", "Headline 8", "Headline 9", "Headline 10", "Headline 11",
            "Headline 12", "Headline 13", "Headline 14", "Headline 15",
            "Description 1", "Description 2", "Description 3", "Description 4",
            "Path 1", "Path 2",
            "Asset Type", "Link Text", "Description Line 1", "Description Line 2",
            "Phone Number", "Country Code",
            "Location", "Bid Adjustment", "Is Exclusion"
        ];
        
        const rows: string[] = [];
        
        // Process each ad group
        adGroups.forEach(group => {
            const groupAds = generatedAds.filter(ad => ad.adGroup === group.name && (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'));
            
            // Export Keywords as separate rows
                group.keywords.forEach(keyword => {
                    const matchType = getMatchType(keyword);
                    const keywordText = keyword.replace(/^\[|\]$|^"|"$/g, ''); // Remove brackets/quotes
                
                const keywordRow: string[] = [
                    escapeCSV(campaignNameValue),  // 1. Campaign
                    escapeCSV(group.name),         // 2. Ad Group
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
                    '', '', ''                     // 35-37. Location fields (3 empties)
                ];
                rows.push(keywordRow.join(','));
            });
            
            // Export Ads as separate rows (Row Type: "ad") - only export valid ads with required fields
            groupAds.forEach(ad => {
                // Skip ads missing required fields (validation should catch these, but double-check)
                        if (ad.type === 'rsa' || ad.type === 'dki') {
                    if (!ad.headline1 || !ad.headline2 || !ad.headline3 || !ad.description1 || !ad.description2) {
                        console.warn(`Skipping ad in "${group.name}" - missing required fields`);
                        return; // Skip this ad
                    }
                        } else if (ad.type === 'callonly') {
                    if (!ad.headline1 || !ad.headline2 || !ad.description1 || !ad.description2) {
                        console.warn(`Skipping call-only ad in "${group.name}" - missing required fields`);
                        return; // Skip this ad
                    }
                }
                
                let finalUrl = formatURL(ad.finalUrl || url || baseUrl);
                
                if (ad.type === 'rsa' || ad.type === 'dki') {
                    const adRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group
                        'ad',                                            // Row Type
                        'Active',                                        // Status
                        '',                                              // Keyword (empty for ad rows)
                        '',                                              // Match Type (empty for ad rows)
                        escapeCSV(finalUrl),                            // Final URL
                        escapeCSV(ad.headline1 || ''),                  // Headline 1
                        escapeCSV(ad.headline2 || ''),                  // Headline 2
                        escapeCSV(ad.headline3 || ''),                  // Headline 3
                        escapeCSV(ad.headline4 || ''),                  // Headline 4
                        escapeCSV(ad.headline5 || ''),                  // Headline 5
                        '', '', '', '', '', '', '', '', '', '', '', '', // Headlines 6-15 (empty)
                        escapeCSV(ad.description1 || ''),               // Description 1
                        escapeCSV(ad.description2 || ''),               // Description 2
                        escapeCSV(ad.description3 || ''),               // Description 3
                        escapeCSV(ad.description4 || ''),               // Description 4
                        escapeCSV(ad.path1 || ''),                      // Path 1
                        escapeCSV(ad.path2 || ''),                      // Path 2
                        '', '', '', '',                                 // Asset fields (empty)
                        '', '',                                         // Phone fields (empty)
                        '', '', ''                                      // Location fields (empty)
                    ];
                    rows.push(adRow.join(','));
                } else if (ad.type === 'callonly') {
                    const adRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group
                        'ad',                                            // Row Type
                        'Active',                                        // Status
                        '',                                              // Keyword (empty for ad rows)
                        '',                                              // Match Type (empty for ad rows)
                        escapeCSV(finalUrl),                            // Final URL
                        escapeCSV(ad.headline1 || ''),                  // Headline 1
                        escapeCSV(ad.headline2 || ''),                  // Headline 2
                        '',                                              // Headline 3 (call-only doesn't need 3rd headline)
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', // Headlines 4-15 (empty)
                        escapeCSV(ad.description1 || ''),               // Description 1
                        escapeCSV(ad.description2 || ''),               // Description 2
                        '',                                              // Description 3 (empty)
                        '',                                              // Description 4 (empty)
                        '',                                              // Path 1 (empty)
                        '',                                              // Path 2 (empty)
                        '', '', '', '',                                 // Asset fields (empty)
                        escapeCSV(ad.phone || ''),                      // Phone Number
                        'US',                                            // Country Code (default)
                        '', '', ''                                      // Location fields (empty)
                    ];
                    rows.push(adRow.join(','));
                }
            });
            
            // Export Extensions as separate rows
            const groupExtensions = generatedAds.filter(ad => ad.adGroup === group.name && ad.extensionType);
            
            groupExtensions.forEach(ext => {
                if (ext.extensionType === 'sitelink') {
                    // Each sitelink is a separate row
                    if (Array.isArray(ext.sitelinks)) {
                        ext.sitelinks.forEach((sitelink: any) => {
                            if (sitelink && sitelink.text) {
                                const sitelinkRow: string[] = [
                                    escapeCSV(campaignNameValue),        // Campaign
                                    escapeCSV(group.name),              // Ad Group
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
                                    '', '', ''                           // Location fields (empty)
                                ];
                                rows.push(sitelinkRow.join(','));
                            }
                        });
                    }
                } else if (ext.extensionType === 'call') {
                    const callRow: string[] = [
                        escapeCSV(campaignNameValue),                    // Campaign
                        escapeCSV(group.name),                          // Ad Group
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
                        'US',                                            // Country Code (default)
                        '', '', ''                                      // Location fields (empty)
                    ];
                    rows.push(callRow.join(','));
                }
                // Note: Other extension types (callout, snippet, etc.) are typically asset-level and 
                // handled differently in Google Ads Editor - may need separate handling
            });
        });
        
        // Combine headers and rows
        const csvContent = [headers.join(','), ...rows].join('\n');
        
        // Create and download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${campaignNameValue.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
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
    const renderStep1 = () => (
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
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            placeholder="Enter campaign name"
                            className="text-lg py-6 bg-white border-slate-300 focus:border-indigo-500"
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        This name will be used when saving and exporting your campaign
                    </p>
                </CardContent>
            </Card>

            {/* Structure & Geo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-600"/> Base Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        {GEO_SEGMENTATION.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setStructure(item.id)}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                    structure === item.id 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                    : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                                }`}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="font-semibold text-sm">{item.name}</span>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-600"/> Geo Strategy</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-4 gap-3">
                        {GEO_OPTIONS.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setGeo(item.id)}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                    geo === item.id 
                                    ? 'border-green-600 bg-green-50 text-green-700' 
                                    : 'border-slate-200 hover:border-green-200 hover:bg-slate-50'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-semibold text-xs">{item.name}</span>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Match Type & URL */}
            <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl">
                <CardHeader>
                    <CardTitle>Campaign Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Horizontal Match Types */}
                    <div className="space-y-3">
                        <Label className="text-base">Match Types</Label>
                        <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                            {MATCH_TYPES.map(type => (
                                <div key={type.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={type.id} 
                                        checked={matchTypes[type.id as keyof typeof matchTypes]}
                                        onCheckedChange={(c) => setMatchTypes(prev => ({ ...prev, [type.id]: !!c }))}
                                    />
                                    <Label htmlFor={type.id} className="cursor-pointer font-medium">
                                        {type.label} <span className="text-slate-400 font-normal text-xs ml-1">{type.example}</span>
                                    </Label>
                                </div>
                            ))}
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
                                onChange={(e) => setUrl(e.target.value)}
                                className="pl-10 py-6 text-lg bg-white"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button 
                    size="lg"
                    onClick={handleNextStep}
                    disabled={!url}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 shadow-lg shadow-indigo-200"
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
                    onKeywordsSelected={(keywords) => setSelectedKeywords(keywords)}
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
                            className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5" 
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
        setEditingAdId(null);
        // Ad is already updated in state through inline editing
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
        const newAd = { ...ad, id: Date.now() };
        setGeneratedAds([...generatedAds, newAd]);
    };
    
    const handleDeleteAd = (adId: number) => {
        setGeneratedAds(generatedAds.filter(a => a.id !== adId));
    };
    
    // Generate dynamic ad groups based on structure and selected keywords
    const getDynamicAdGroups = () => {
        if (selectedKeywords.length === 0) return [];
        
        if (structure === 'SKAG') {
            // Each keyword is its own ad group
            return selectedKeywords.slice(0, 20).map(kw => ({
                name: kw,
                keywords: [kw]
            }));
        } else if (structure === 'STAG') {
            // Group keywords thematically (simplified grouping)
            const groupSize = Math.max(3, Math.ceil(selectedKeywords.length / 5));
            const groups = [];
            for (let i = 0; i < selectedKeywords.length; i += groupSize) {
                const groupKeywords = selectedKeywords.slice(i, i + groupSize);
                groups.push({
                    name: `Ad Group ${groups.length + 1}`,
                    keywords: groupKeywords
                });
            }
            return groups.slice(0, 10);
        } else {
            // Mix: Some SKAG, some STAG
            const groups = [];
            // First 5 as SKAG
            selectedKeywords.slice(0, 5).forEach(kw => {
                groups.push({
                    name: kw,
                    keywords: [kw]
                });
            });
            // Rest grouped
            const remaining = selectedKeywords.slice(5);
            if (remaining.length > 0) {
                const groupSize = Math.max(3, Math.ceil(remaining.length / 3));
                for (let i = 0; i < remaining.length; i += groupSize) {
                    const groupKeywords = remaining.slice(i, i + groupSize);
                    groups.push({
                        name: `Mixed Group ${groups.length - 4}`,
                        keywords: groupKeywords
                    });
                }
            }
            return groups.slice(0, 10);
        }
    };

    const dynamicAdGroups = getDynamicAdGroups();
    const ALL_AD_GROUPS_VALUE = 'ALL_AD_GROUPS';
    
    const createNewAd = (type: 'rsa' | 'dki' | 'callonly' | 'snippet' | 'callout' | 'call' | 'sitelink' | 'price' | 'app' | 'location' | 'message' | 'leadform' | 'promotion' | 'image') => {
        // Check total ads limit (25 max, excluding snippets and callouts)
        const regularAds = generatedAds.filter(ad => 
            ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'
        );
        
        if (type === 'rsa' || type === 'dki' || type === 'callonly') {
            if (regularAds.length >= 25) {
                alert('Maximum limit reached: You can create up to 25 ads total (combining RSA, DKI, and Call Only ads). Please delete some ads before creating new ones.');
                return;
            }
        }
        
        // Handle "ALL AD GROUPS" selection - create ad for each ad group
        if (selectedAdGroup === ALL_AD_GROUPS_VALUE) {
            const allGroups = dynamicAdGroups.length > 0 ? dynamicAdGroups : adGroups.map(name => ({ name, keywords: [] }));
            
            if (allGroups.length === 0) {
                alert('No ad groups available. Please create ad groups first by selecting keywords.');
                return;
            }
            
            // Check if creating ads for all groups would exceed the limit
            if (type === 'rsa' || type === 'dki' || type === 'callonly') {
                const adsToCreate = allGroups.length;
                if (regularAds.length + adsToCreate > 25) {
                    alert(`Cannot create ads for all groups: This would create ${adsToCreate} ads, exceeding the limit of 25 total ads. Currently have ${regularAds.length} ads, would need ${regularAds.length + adsToCreate} total.`);
                    return;
                }
            }
            
            const newAds: any[] = [];
            const baseUrl = url || 'www.example.com';
            const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);
            
            allGroups.forEach((group, index) => {
                const mainKeyword = group.keywords?.[0] || 'your service';
                let baseAd: any = {
                    id: Date.now() + index,
                    type: type,
                    adGroup: group.name
                };
                
                // Create ad based on type
                if (type === 'rsa') {
                    baseAd = {
                        ...baseAd,
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
                    baseAd = {
                        ...baseAd,
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
                    baseAd = {
                        ...baseAd,
                        headline1: `Call for ${mainKeyword}`,
                        headline2: 'Available 24/7 - Speak to Expert',
                        description1: `Need ${mainKeyword}? Call us now for expert advice and the best pricing.`,
                        description2: 'Get immediate assistance. Our specialists are ready to help!',
                        phone: '(555) 123-4567',
                        businessName: 'Your Business',
                        finalUrl: formattedUrl
                    };
                } else if (type === 'snippet') {
                    baseAd = {
                        ...baseAd,
                        extensionType: 'snippet',
                        header: 'Types',
                        values: group.keywords?.slice(0, 4) || ['Option 1', 'Option 2', 'Option 3']
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
            });
            
            setGeneratedAds([...generatedAds, ...newAds]);
            return;
        }
        
        const currentGroup = dynamicAdGroups.find(g => g.name === selectedAdGroup) || dynamicAdGroups[0];
        const mainKeyword = currentGroup?.keywords[0] || 'your service';
        
        let newAd: any = {
            id: Date.now(),
            type: type,
            adGroup: selectedAdGroup
        };

        // Format URL properly
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
        
        // If ALL AD GROUPS is selected and we haven't reached max 3 ads, and this is an ad (not extension), add to selected ads
        if (selectedAdGroup === ALL_AD_GROUPS_VALUE && selectedAdIds.length < 3 && (type === 'rsa' || type === 'dki' || type === 'callonly')) {
            setSelectedAdIds([...selectedAdIds, newAd.id]);
        }
    };
    
    const adGroups = ['Refrigerators', 'Ovens', 'Microwaves'];
    
    const [activeBuilderTab, setActiveBuilderTab] = useState<'builder' | 'history'>('builder');
    const [selectedPreviewAdId, setSelectedPreviewAdId] = useState<number | null>(null);
    
    const renderStep3 = () => {
        // Filter ads based on selection
        // When ALL AD GROUPS is selected, show only selected ads (max 3)
        // Only show actual ads (rsa, dki, callonly), not extensions
        const baseAds = generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
        const extensions = generatedAds.filter(ad => ad.extensionType);
        
        const currentGroupAds = selectedAdGroup === ALL_AD_GROUPS_VALUE 
            ? baseAds.filter(ad => selectedAdIds.includes(ad.id)) // Show only selected ads
            : baseAds.filter(ad => ad.adGroup === selectedAdGroup);
        
        // Attach extensions to their corresponding ads
        const adsWithExtensions = currentGroupAds.map(ad => {
            // Find extensions that belong to this ad's group, or if ALL AD GROUPS mode, attach to all selected ads
            const adExtensions = extensions.filter(ext => {
                if (selectedAdGroup === ALL_AD_GROUPS_VALUE) {
                    // In ALL AD GROUPS mode, extensions apply to all selected ads
                    return selectedAdIds.includes(ad.id);
                } else {
                    // In specific group mode, extensions apply to ads in that group
                    return ext.adGroup === ad.adGroup || !ext.adGroup;
                }
            });
            return { ...ad, extensions: adExtensions };
        });
        const adGroupList = dynamicAdGroups.length > 0 ? dynamicAdGroups.map(g => g.name) : adGroups;
        const extensionsList = generatedAds.filter(ad => ad.extensionType);
        
        // Use compact builder for better UX
        const useCompactBuilder = true;
        
        if (useCompactBuilder) {
            return (
                <div className="w-full h-full p-4">
                    <CompactAdBuilder
                        selectedKeywords={selectedKeywords}
                        selectedAdGroup={selectedAdGroup}
                        onAdGroupChange={setSelectedAdGroup}
                        adGroups={adGroupList}
                        generatedAds={generatedAds}
                        extensions={extensionsList}
                        onCreateAd={createNewAd}
                        onUpdateAd={updateAdField}
                        onDeleteAd={handleDeleteAd}
                        onDuplicateAd={handleDuplicateAd}
                        selectedAdIds={selectedAdIds}
                        ALL_AD_GROUPS_VALUE={ALL_AD_GROUPS_VALUE}
                    />
                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <Button variant="ghost" onClick={() => setStep(2)}>
                            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                            Back
                        </Button>
                        <Button 
                            size="lg" 
                            onClick={handleNextStep}
                            disabled={generatedAds.length === 0}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg disabled:opacity-50"
                        >
                            Continue to Geo Targeting
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            );
        }
        
        return (
        <div className="max-w-[1920px] mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Campaign Info Panel */}
            {selectedKeywords.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Campaign Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-semibold text-slate-600">Structure:</span>
                            <span className="ml-2 text-slate-800">{structure}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-600">Geo Segmentation:</span>
                            <span className="ml-2 text-slate-800">{geo}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-600">Selected Keywords:</span>
                            <span className="ml-2 text-indigo-700 font-bold">{selectedKeywords.length}</span>
                        </div>
                    </div>
                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            View selected keywords ({selectedKeywords.length})
                        </summary>
                        <div className="mt-3 p-4 bg-white rounded-lg border border-indigo-100 max-h-40 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono text-slate-600">
                                {selectedKeywords.slice(0, 50).map((kw, idx) => (
                                    <div key={idx} className="truncate">{kw}</div>
                                ))}
                                {selectedKeywords.length > 50 && (
                                    <div className="text-indigo-600 font-semibold">
                                        +{selectedKeywords.length - 50} more...
                                    </div>
                                )}
                            </div>
                        </div>
                    </details>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Ad Creation Tools */}
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
                        {selectedAdGroup === ALL_AD_GROUPS_VALUE ? (
                            <div className="mt-2 text-xs text-slate-600 font-semibold">
                                Showing all ads from all ad groups ({adGroupList.length} groups)
                            </div>
                        ) : dynamicAdGroups.length > 0 && (
                            <div className="mt-2 text-xs text-slate-600">
                                {dynamicAdGroups.find(g => g.name === selectedAdGroup)?.keywords.length || 0} keywords in this group
                            </div>
                        )}
                    </div>
                    
                    {/* Help Text */}
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-600">
                        {selectedAdGroup === ALL_AD_GROUPS_VALUE ? (
                            <>
                                <strong>ALL AD GROUPS selected:</strong> Ads created here will be added to all ad groups. You can select up to 3 ads (shown on the right). Each ad will be applied to all ad groups.
                                {selectedAdIds.length > 0 && (
                                    <span className="block mt-2 text-xs">
                                        Currently showing {selectedAdIds.length} of {selectedAdIds.length >= 3 ? '3 (max)' : '3'} selected ads
                                    </span>
                                )}
                            </>
                        ) : (
                                <>
                            You can preview different ad groups, however changing ads here will change all ad groups. 
                            In the next section you can edit ads individually for each ad group.
                                </>
                            )}
                        </p>
                    </div>
                    
                    {/* Create Ad Buttons */}
                    <div className="space-y-3">
                        {/* Total Ads Counter */}
                        <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                            {selectedAdGroup === ALL_AD_GROUPS_VALUE ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">Selected Ads:</span>
                                        <span className={`text-lg font-bold ${selectedAdIds.length >= 3 ? 'text-green-600' : 'text-indigo-600'}`}>
                                            {selectedAdIds.length} / 3
                                        </span>
                                    </div>
                                    {selectedAdIds.length >= 3 && (
                                        <p className="text-xs text-slate-600 mt-1">Maximum 3 ads for all ad groups. Remove an ad to add another.</p>
                                    )}
                                    {selectedAdIds.length < 3 && (
                                        <p className="text-xs text-slate-600 mt-1">Create ads below. They will appear in all ad groups.</p>
                                    )}
                                </>
                            ) : (
                                <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">Total Ads:</span>
                                <span className={`text-lg font-bold ${generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly').length >= 25 ? 'text-red-600' : 'text-indigo-600'}`}>
                                    {generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly').length} / 25
                                </span>
                            </div>
                            {generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly').length >= 25 && (
                                <p className="text-xs text-red-600 mt-1">Maximum limit reached. Delete ads to create new ones.</p>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <Button 
                            onClick={() => createNewAd('rsa')}
                            disabled={
                                selectedKeywords.length === 0 || 
                                (selectedAdGroup === ALL_AD_GROUPS_VALUE ? selectedAdIds.length >= 3 : generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly').length >= 25)
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="mr-2 w-5 h-5" /> RESP. SEARCH AD
                        </Button>
                        <Button 
                            onClick={() => createNewAd('dki')}
                            disabled={
                                selectedKeywords.length === 0 || 
                                (selectedAdGroup === ALL_AD_GROUPS_VALUE ? selectedAdIds.length >= 3 : generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly').length >= 25)
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="mr-2 w-5 h-5" /> DKI TEXT AD
                        </Button>
                        <Button 
                            onClick={() => createNewAd('callonly')}
                            disabled={
                                selectedKeywords.length === 0 || 
                                (selectedAdGroup === ALL_AD_GROUPS_VALUE ? selectedAdIds.length >= 3 : generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly').length >= 25)
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="mr-2 w-5 h-5" /> CALL ONLY AD
                        </Button>
                        <Button 
                            onClick={() => createNewAd('snippet')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white justify-start py-6 border-2 border-indigo-600"
                        >
                            <Plus className="mr-2 w-5 h-5" /> SNIPPET EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('callout')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white justify-start py-6 border-2 border-indigo-600"
                        >
                            <Plus className="mr-2 w-5 h-5" /> CALLOUT EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('leadform')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white justify-start py-6 border-2 border-indigo-600"
                        >
                            <FormIcon className="mr-2 w-5 h-5" /> LEAD FORM EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('promotion')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white justify-start py-6 border-2 border-indigo-600"
                        >
                            <Tag className="mr-2 w-5 h-5" /> PROMOTION EXTENSION
                        </Button>
                        
                        {/* Separator */}
                        <div className="my-4 border-t border-slate-300"></div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">More Extensions</div>
                        
                        <Button 
                            onClick={() => createNewAd('call')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start py-6 border-2 border-blue-600"
                        >
                            <Phone className="mr-2 w-5 h-5" /> CALL EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('sitelink')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start py-6 border-2 border-blue-600"
                        >
                            <Link2 className="mr-2 w-5 h-5" /> SITELINK EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('price')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start py-6 border-2 border-blue-600"
                        >
                            <DollarSign className="mr-2 w-5 h-5" /> PRICE EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('app')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start py-6 border-2 border-blue-600"
                        >
                            <Smartphone className="mr-2 w-5 h-5" /> APP EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('location')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start py-6 border-2 border-blue-600"
                        >
                            <MapPin className="mr-2 w-5 h-5" /> LOCATION EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('message')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start py-6 border-2 border-blue-600"
                        >
                            <MessageSquare className="mr-2 w-5 h-5" /> MESSAGE EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('image')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start py-6 border-2 border-blue-600"
                        >
                            <ImageIcon className="mr-2 w-5 h-5" /> IMAGE EXTENSION
                        </Button>
                    </div>
                </div>
                
                {/* Right Panel - Ad Cards */}
                <div className="lg:col-span-2 space-y-4">
                    {adsWithExtensions.map((ad: any) => {
                        const adExtensions = ad.extensions || [];
                        return (
                        <div key={ad.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            {/* Ad Group Badge (shown when ALL AD GROUPS is selected) */}
                            {selectedAdGroup === ALL_AD_GROUPS_VALUE && ad.adGroup && (
                                <div className="mb-2">
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300 text-xs">
                                        Ad Group: {ad.adGroup}
                                    </Badge>
                                </div>
                            )}
                            {/* Ad Type Badge */}
                            <div className="mb-3">
                                <Badge className={
                                    ad.type === 'rsa' ? 'bg-blue-100 text-blue-700' :
                                    ad.type === 'dki' ? 'bg-purple-100 text-purple-700' :
                                    ad.type === 'callonly' ? 'bg-green-100 text-green-700' :
                                    ad.extensionType === 'snippet' ? 'bg-orange-100 text-orange-700' :
                                    ad.extensionType === 'callout' ? 'bg-pink-100 text-pink-700' :
                                    ad.extensionType === 'call' ? 'bg-teal-100 text-teal-700' :
                                    ad.extensionType === 'sitelink' ? 'bg-cyan-100 text-cyan-700' :
                                    ad.extensionType === 'price' ? 'bg-yellow-100 text-yellow-700' :
                                    ad.extensionType === 'app' ? 'bg-indigo-100 text-indigo-700' :
                                    ad.extensionType === 'location' ? 'bg-red-100 text-red-700' :
                                    ad.extensionType === 'message' ? 'bg-violet-100 text-violet-700' :
                                    ad.extensionType === 'leadform' ? 'bg-emerald-100 text-emerald-700' :
                                    ad.extensionType === 'promotion' ? 'bg-rose-100 text-rose-700' :
                                    ad.extensionType === 'image' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                                }>
                                    {ad.type === 'rsa' ? 'RSA' : 
                                     ad.type === 'dki' ? 'DKI' : 
                                     ad.type === 'callonly' ? 'Call Only' : 
                                     ad.extensionType === 'snippet' ? 'Structured Snippet' :
                                     ad.extensionType === 'callout' ? 'Callout' :
                                     ad.extensionType === 'call' ? 'Call Extension' :
                                     ad.extensionType === 'sitelink' ? 'Sitelink' :
                                     ad.extensionType === 'price' ? 'Price' :
                                     ad.extensionType === 'app' ? 'App' :
                                     ad.extensionType === 'location' ? 'Location' :
                                     ad.extensionType === 'message' ? 'Message' :
                                     ad.extensionType === 'leadform' ? 'Lead Form' :
                                     ad.extensionType === 'promotion' ? 'Promotion' :
                                     ad.extensionType === 'image' ? 'Image' :
                                     'Extension'}
                                </Badge>
                            </div>

                            {/* Inline Edit Mode or Preview */}
                            {editingAdId === ad.id ? (
                                // Inline Edit Form
                                <div className="mb-4 space-y-4 p-4 bg-slate-50 rounded-lg border-2 border-indigo-300">
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
                                    
                                    {/* Extension Editing Forms */}
                                    {ad.extensionType === 'snippet' && (
                                        <>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Header *</Label>
                                                    <Input
                                                        value={ad.header || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'header', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="e.g., Types, Brands, Styles"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Values (one per line) *</Label>
                                                    <Textarea
                                                        value={Array.isArray(ad.values) ? ad.values.join('\n') : ''}
                                                        onChange={(e) => updateAdField(ad.id, 'values', e.target.value.split('\n').filter(v => v.trim()))}
                                                        className="mt-1"
                                                        placeholder="Value 1&#10;Value 2&#10;Value 3"
                                                        rows={4}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Enter one value per line (up to 10 values)</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'callout' && (
                                        <>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Callouts (one per line) *</Label>
                                                    <Textarea
                                                        value={Array.isArray(ad.callouts) ? ad.callouts.join('\n') : ''}
                                                        onChange={(e) => updateAdField(ad.id, 'callouts', e.target.value.split('\n').filter(c => c.trim()))}
                                                        className="mt-1"
                                                        placeholder="Free Shipping&#10;24/7 Support&#10;Best Price Guarantee"
                                                        rows={4}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Enter one callout per line (up to 4 callouts, max 25 characters each)</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'call' && (
                                        <>
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
                                                    <Label className="text-xs font-semibold text-slate-700">Call Tracking</Label>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={ad.callTrackingEnabled || false}
                                                            onChange={(e) => updateAdField(ad.id, 'callTrackingEnabled', e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        <Label className="text-xs text-slate-600">Enable call tracking</Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'sitelink' && (
                                        <>
                                            <div className="space-y-4">
                                                <Label className="text-xs font-semibold text-slate-700">Sitelinks (up to 4) *</Label>
                                                {Array.isArray(ad.sitelinks) && ad.sitelinks.map((sitelink: any, idx: number) => (
                                                    <div key={idx} className="p-3 border border-slate-200 rounded-lg space-y-2">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                            <Input
                                                                value={sitelink.text || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...ad.sitelinks];
                                                                    updated[idx] = { ...updated[idx], text: e.target.value };
                                                                    updateAdField(ad.id, 'sitelinks', updated);
                                                                }}
                                                                placeholder="Link text (max 25 chars)"
                                                                className="text-sm"
                                                            />
                                                            <Input
                                                                value={sitelink.description || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...ad.sitelinks];
                                                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                                                    updateAdField(ad.id, 'sitelinks', updated);
                                                                }}
                                                                placeholder="Description (max 35 chars)"
                                                                className="text-sm"
                                                            />
                                                            <Input
                                                                value={sitelink.url || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...ad.sitelinks];
                                                                    updated[idx] = { ...updated[idx], url: e.target.value };
                                                                    updateAdField(ad.id, 'sitelinks', updated);
                                                                }}
                                                                placeholder="URL"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (Array.isArray(ad.sitelinks) && ad.sitelinks.length < 4) {
                                                            const updated = [...ad.sitelinks, { text: '', description: '', url: url || '' }];
                                                            updateAdField(ad.id, 'sitelinks', updated);
                                                        }
                                                    }}
                                                    disabled={!Array.isArray(ad.sitelinks) || ad.sitelinks.length >= 4}
                                                    className="w-full"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" /> Add Sitelink
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'price' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Type *</Label>
                                                    <Select
                                                        value={ad.type || 'SERVICES'}
                                                        onValueChange={(value) => updateAdField(ad.id, 'type', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="SERVICES">Services</SelectItem>
                                                            <SelectItem value="BRAND">Brand</SelectItem>
                                                            <SelectItem value="EVENT">Event</SelectItem>
                                                            <SelectItem value="LOCATION">Location</SelectItem>
                                                            <SelectItem value="NEIGHBORHOOD">Neighborhood</SelectItem>
                                                            <SelectItem value="PRODUCT">Product</SelectItem>
                                                            <SelectItem value="PRODUCT_TIER">Product Tier</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Price Qualifier</Label>
                                                    <Input
                                                        value={ad.priceQualifier || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'priceQualifier', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="e.g., From, Up to"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Price *</Label>
                                                    <Input
                                                        value={ad.price || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'price', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="$99"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Currency</Label>
                                                    <Select
                                                        value={ad.currency || 'USD'}
                                                        onValueChange={(value) => updateAdField(ad.id, 'currency', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="USD">USD</SelectItem>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="GBP">GBP</SelectItem>
                                                            <SelectItem value="CAD">CAD</SelectItem>
                                                            <SelectItem value="AUD">AUD</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Unit</Label>
                                                    <Input
                                                        value={ad.unit || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'unit', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="e.g., per service, per hour"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Description</Label>
                                                    <Input
                                                        value={ad.description || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'description', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Description of the price"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'app' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">App Store *</Label>
                                                    <Select
                                                        value={ad.appStore || 'GOOGLE_PLAY'}
                                                        onValueChange={(value) => updateAdField(ad.id, 'appStore', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="GOOGLE_PLAY">Google Play</SelectItem>
                                                            <SelectItem value="APPLE_APP_STORE">Apple App Store</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">App ID *</Label>
                                                    <Input
                                                        value={ad.appId || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'appId', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="com.example.app"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Link Text</Label>
                                                    <Input
                                                        value={ad.appLinkText || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'appLinkText', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Download Now"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Final URL</Label>
                                                    <Input
                                                        value={ad.appFinalUrl || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'appFinalUrl', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="https://play.google.com/store/apps/..."
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'location' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Business Name *</Label>
                                                    <Input
                                                        value={ad.businessName || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'businessName', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Your Business Name"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                                                    <Input
                                                        value={ad.phone || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'phone', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="(555) 123-4567"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Address Line 1 *</Label>
                                                    <Input
                                                        value={ad.addressLine1 || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'addressLine1', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="123 Main St"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Address Line 2</Label>
                                                    <Input
                                                        value={ad.addressLine2 || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'addressLine2', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Suite 100"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">City *</Label>
                                                    <Input
                                                        value={ad.city || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'city', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="City"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">State *</Label>
                                                    <Input
                                                        value={ad.state || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'state', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="State"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Postal Code *</Label>
                                                    <Input
                                                        value={ad.postalCode || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'postalCode', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="12345"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Country *</Label>
                                                    <Input
                                                        value={ad.country || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'country', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="United States"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'message' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Message Text *</Label>
                                                    <Input
                                                        value={ad.messageText || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'messageText', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Message us for quick answers"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Max 25 characters</p>
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
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                                                    <Input
                                                        value={ad.phone || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'phone', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="(555) 123-4567"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'leadform' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Form Name *</Label>
                                                    <Input
                                                        value={ad.formName || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'formName', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Get Started"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Form Type *</Label>
                                                    <Select
                                                        value={ad.formType || 'CONTACT'}
                                                        onValueChange={(value) => updateAdField(ad.id, 'formType', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="CONTACT">Contact</SelectItem>
                                                            <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                                                            <SelectItem value="SIGNUP">Signup</SelectItem>
                                                            <SelectItem value="BOOKING">Booking</SelectItem>
                                                            <SelectItem value="SURVEY">Survey</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Form Description</Label>
                                                    <Textarea
                                                        value={ad.formDescription || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'formDescription', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Fill out this form to get in touch"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Form URL *</Label>
                                                    <Input
                                                        value={ad.formUrl || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'formUrl', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="https://example.com/form"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Privacy Policy URL *</Label>
                                                    <Input
                                                        value={ad.privacyPolicyUrl || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'privacyPolicyUrl', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="https://example.com/privacy"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'promotion' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Promotion Text *</Label>
                                                    <Input
                                                        value={ad.promotionText || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'promotionText', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Special Offer"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Max 15 characters</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Occasion *</Label>
                                                    <Select
                                                        value={ad.occasion || 'SALE'}
                                                        onValueChange={(value) => updateAdField(ad.id, 'occasion', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="SALE">Sale</SelectItem>
                                                            <SelectItem value="SPECIAL_OFFER">Special Offer</SelectItem>
                                                            <SelectItem value="NEW">New</SelectItem>
                                                            <SelectItem value="CLEARANCE">Clearance</SelectItem>
                                                            <SelectItem value="GIFT">Gift</SelectItem>
                                                            <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                                            <SelectItem value="NO_SALE">No Sale</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Promotion Description</Label>
                                                    <Input
                                                        value={ad.promotionDescription || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'promotionDescription', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Get 20% off your first order"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Max 35 characters</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Start Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={ad.startDate || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'startDate', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">End Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={ad.endDate || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'endDate', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {ad.extensionType === 'image' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Image URL *</Label>
                                                    <Input
                                                        value={ad.imageUrl || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'imageUrl', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Recommended: 1200x628px</p>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-slate-700">Landscape Logo Image URL</Label>
                                                    <Input
                                                        value={ad.landscapeLogoImageUrl || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'landscapeLogoImageUrl', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="https://example.com/logo.jpg"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">Recommended: 600x314px</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Image Name *</Label>
                                                    <Input
                                                        value={ad.imageName || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'imageName', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Product Showcase"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label className="text-xs font-semibold text-slate-700">Alt Text</Label>
                                                    <Input
                                                        value={ad.imageAltText || ''}
                                                        onChange={(e) => updateAdField(ad.id, 'imageAltText', e.target.value)}
                                                        className="mt-1"
                                                        placeholder="Description of the image"
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
                            ) : (
                                // Preview Mode
                                <>
                            {(ad.type === 'rsa' || ad.type === 'dki') && (
                                <div className="mb-4">
                                    <div className="text-blue-600 hover:underline cursor-pointer text-lg mb-1">
                                        {ad.headline1} | {ad.headline2} | {ad.headline3}
                                                {ad.headline4 && ` | ${ad.headline4}`}
                                                {ad.headline5 && ` | ${ad.headline5}`}
                                    </div>
                                    <div className="text-green-700 text-sm mb-2">
                                        {ad.finalUrl}/{ad.path1}/{ad.path2}
                                    </div>
                                    <div className="text-slate-600 text-sm mb-1">
                                        {ad.description1}
                                    </div>
                                            {ad.description2 && (
                                    <div className="text-slate-600 text-sm">
                                        {ad.description2}
                                    </div>
                                            )}
                                    
                                    {/* Show extensions integrated into the ad preview */}
                                    {adExtensions && adExtensions.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                                            {adExtensions.map((ext: any, idx: number) => (
                                                <div key={idx}>
                                                    {ext.extensionType === 'callout' && Array.isArray(ext.callouts) && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {ext.callouts.map((callout: string, cIdx: number) => (
                                                                <Badge key={cIdx} variant="outline" className="bg-slate-50 text-slate-700 text-xs border-slate-300">
                                                                    {callout}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {ext.extensionType === 'snippet' && (
                                                        <div className="text-xs text-slate-600 mt-2">
                                                            <span className="font-semibold">{ext.header}:</span> {Array.isArray(ext.values) ? ext.values.join(', ') : ''}
                                                        </div>
                                                    )}
                                                    {ext.extensionType === 'sitelink' && Array.isArray(ext.sitelinks) && (
                                                        <div className="space-y-1 mt-2">
                                                            {ext.sitelinks.slice(0, 4).map((sitelink: any, sIdx: number) => (
                                                                <div key={sIdx} className="text-xs text-blue-600 hover:underline">
                                                                    {sitelink.text || 'Link'}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {ext.extensionType === 'call' && ext.phone && (
                                                        <div className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {ext.phone}
                                                        </div>
                                                    )}
                                                    {ext.extensionType === 'price' && (
                                                        <div className="text-xs text-slate-700 mt-2 font-semibold">
                                                            {ext.priceQualifier && `${ext.priceQualifier} `}{ext.price || '$99'} {ext.unit || ''}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                            )}
                                </div>
                            )}

                            {ad.type === 'callonly' && (
                                <div className="mb-4">
                                    <div className="text-blue-600 font-semibold text-lg mb-1">
                                        {ad.headline1}
                                    </div>
                                            {ad.headline2 && (
                                    <div className="text-slate-700 text-sm mb-2">
                                        {ad.headline2}
                                    </div>
                                            )}
                                    <div className="text-slate-600 text-sm mb-2">
                                        {ad.description1}
                                    </div>
                                            {ad.description2 && (
                                                <div className="text-slate-600 text-sm mb-2">
                                                    {ad.description2}
                                                </div>
                                            )}
                                    <div className="text-green-700 font-semibold text-sm">
                                        📞 {ad.phone} • {ad.businessName}
                                    </div>
                                    
                                    {/* Show extensions integrated into the call-only ad preview */}
                                    {adExtensions && adExtensions.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                                            {adExtensions.map((ext: any, idx: number) => (
                                                <div key={idx}>
                                                    {ext.extensionType === 'callout' && Array.isArray(ext.callouts) && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {ext.callouts.map((callout: string, cIdx: number) => (
                                                                <Badge key={cIdx} variant="outline" className="bg-slate-50 text-slate-700 text-xs border-slate-300">
                                                                    {callout}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {ext.extensionType === 'snippet' && (
                                                        <div className="text-xs text-slate-600 mt-2">
                                                            <span className="font-semibold">{ext.header}:</span> {Array.isArray(ext.values) ? ext.values.join(', ') : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                    )}
                                </>
                            )}
                                <div className="bg-green-50 border border-green-200 rounded px-4 py-3 mb-3">
                                    <div className="font-semibold text-sm text-slate-700 mb-2">
                                        {ad.header}: {ad.values.join(', ')}
                                    </div>
                                </div>
                            )}

                            {ad.extensionType === 'callout' && (
                                <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(ad.callouts) && ad.callouts.map((callout: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="bg-white">
                                                {callout}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'call' && (
                                <div className="bg-teal-50 border border-teal-200 rounded px-4 py-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-teal-700" />
                                        <span className="font-semibold text-sm text-slate-700">{ad.phone || '(555) 123-4567'}</span>
                                        {ad.callTrackingEnabled && (
                                            <Badge variant="outline" className="text-xs bg-white">Call Tracking Enabled</Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'sitelink' && (
                                <div className="bg-cyan-50 border border-cyan-200 rounded px-4 py-3 mb-3">
                                    <div className="space-y-2">
                                        {Array.isArray(ad.sitelinks) && ad.sitelinks.map((sitelink: any, idx: number) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <Link2 className="w-4 h-4 text-cyan-700 mt-0.5" />
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-700">{sitelink.text || 'Link Text'}</div>
                                                    {sitelink.description && (
                                                        <div className="text-xs text-slate-600">{sitelink.description}</div>
                                                    )}
                                                    {sitelink.url && (
                                                        <div className="text-xs text-cyan-600">{sitelink.url}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'price' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded px-4 py-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-yellow-700" />
                                        <span className="font-semibold text-sm text-slate-700">
                                            {ad.priceQualifier && `${ad.priceQualifier} `}
                                            {ad.price || '$99'} {ad.unit && ad.unit}
                                        </span>
                                        {ad.description && (
                                            <span className="text-xs text-slate-600 ml-2">- {ad.description}</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'app' && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded px-4 py-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-indigo-700" />
                                        <div>
                                            <div className="font-semibold text-sm text-slate-700">
                                                {ad.appLinkText || 'Download Now'} - {ad.appStore === 'GOOGLE_PLAY' ? 'Google Play' : 'App Store'}
                                            </div>
                                            {ad.appId && (
                                                <div className="text-xs text-slate-600">App ID: {ad.appId}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'location' && (
                                <div className="bg-red-50 border border-red-200 rounded px-4 py-3 mb-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-red-700" />
                                            <span className="font-semibold text-sm text-slate-700">{ad.businessName || 'Business Name'}</span>
                                        </div>
                                        <div className="text-xs text-slate-600 ml-6">
                                            {ad.addressLine1 && `${ad.addressLine1}`}
                                            {ad.addressLine2 && `, ${ad.addressLine2}`}
                                            {ad.city && `, ${ad.city}`}
                                            {ad.state && `, ${ad.state}`}
                                            {ad.postalCode && ` ${ad.postalCode}`}
                                        </div>
                                        {ad.phone && (
                                            <div className="text-xs text-slate-600 ml-6 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {ad.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'message' && (
                                <div className="bg-violet-50 border border-violet-200 rounded px-4 py-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-violet-700" />
                                        <div>
                                            <div className="font-semibold text-sm text-slate-700">{ad.messageText || 'Message us for quick answers'}</div>
                                            <div className="text-xs text-slate-600">{ad.businessName || 'Business'} • {ad.phone || '(555) 123-4567'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'leadform' && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded px-4 py-3 mb-3">
                                    <div className="flex items-start gap-2">
                                        <FormIcon className="w-4 h-4 text-emerald-700 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm text-slate-700">{ad.formName || 'Get Started'}</div>
                                            {ad.formDescription && (
                                                <div className="text-xs text-slate-600 mt-1">{ad.formDescription}</div>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs bg-white">
                                                    {ad.formType === 'CONTACT' ? 'Contact' :
                                                     ad.formType === 'LEAD_GENERATION' ? 'Lead Generation' :
                                                     ad.formType === 'SIGNUP' ? 'Signup' :
                                                     ad.formType === 'BOOKING' ? 'Booking' :
                                                     ad.formType === 'SURVEY' ? 'Survey' : 'Form'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'promotion' && (
                                <div className="bg-rose-50 border border-rose-200 rounded px-4 py-3 mb-3">
                                    <div className="flex items-start gap-2">
                                        <Tag className="w-4 h-4 text-rose-700 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm text-slate-700">{ad.promotionText || 'Special Offer'}</div>
                                            {ad.promotionDescription && (
                                                <div className="text-xs text-slate-600 mt-1">{ad.promotionDescription}</div>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs bg-white">
                                                    {ad.occasion === 'SALE' ? 'Sale' :
                                                     ad.occasion === 'SPECIAL_OFFER' ? 'Special Offer' :
                                                     ad.occasion === 'NEW' ? 'New' :
                                                     ad.occasion === 'CLEARANCE' ? 'Clearance' :
                                                     ad.occasion === 'GIFT' ? 'Gift' :
                                                     ad.occasion === 'HOLIDAY' ? 'Holiday' : 'Promotion'}
                                                </Badge>
                                                {ad.startDate && ad.endDate && (
                                                    <span className="text-xs text-slate-600">
                                                        {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {ad.extensionType === 'image' && (
                                <div className="bg-amber-50 border border-amber-200 rounded px-4 py-3 mb-3">
                                    <div className="flex items-start gap-2">
                                        <ImageIcon className="w-4 h-4 text-amber-700 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm text-slate-700">{ad.imageName || 'Product Showcase'}</div>
                                            {ad.imageAltText && (
                                                <div className="text-xs text-slate-600 mt-1">{ad.imageAltText}</div>
                                            )}
                                            {ad.imageUrl && (
                                                <div className="mt-2">
                                                    <div className="text-xs text-amber-600 break-all">{ad.imageUrl}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {editingAdId !== ad.id && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleEditAd(ad)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                    size="sm"
                                >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                    EDIT
                                </Button>
                                <Button
                                    onClick={() => handleDuplicateAd(ad)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                    size="sm"
                                >
                                        <Repeat className="w-4 h-4 mr-2" />
                                    DUPLICATE
                                </Button>
                                <Button
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                                    size="sm"
                                >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    DELETE
                                </Button>
                            </div>
                            )}
                        </div>
                        );
                    })}
                    
                    {adsWithExtensions.length > 0 && dynamicAdGroups.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-slate-700">
                                <strong>Ad Group:</strong> {selectedAdGroup} 
                                <span className="ml-3 text-slate-600">
                                    ({dynamicAdGroups.find(g => g.name === selectedAdGroup)?.keywords.length || 0} keywords)
                                </span>
                            </p>
                            <p className="text-xs text-slate-600 mt-2">
                                Keywords: {dynamicAdGroups.find(g => g.name === selectedAdGroup)?.keywords.slice(0, 5).join(', ')}
                                {(dynamicAdGroups.find(g => g.name === selectedAdGroup)?.keywords.length || 0) > 5 && '...'}
                            </p>
                        </div>
                    )}
                    
                    {adsWithExtensions.length === 0 && (
                        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-12 text-center">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium mb-2">No ads created for "{selectedAdGroup}"</p>
                            <p className="text-sm text-slate-400">Click a button on the left to create your first ad for this ad group.</p>
                        </div>
                    )}
                    
                    {selectedKeywords.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                            <p className="text-yellow-800 font-medium">No keywords selected</p>
                            <p className="text-sm text-yellow-700 mt-2">Please go back to Step 2 and select keywords first.</p>
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
                <div className="flex items-center gap-3">
                    {generatedAds.length === 0 && selectedKeywords.length > 0 && (
                        <p className="text-sm text-slate-500 italic">Create at least one ad to continue</p>
                    )}
                    <Button 
                        size="lg" 
                        onClick={handleNextStep}
                        disabled={generatedAds.length === 0}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg disabled:opacity-50"
                    >
                        Continue to Geo Targeting
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
        );
    };
    
    // Step 4: Geo Targeting (New Step)
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
                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
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

    // State for editing in review page
    const [editingGroupName, setEditingGroupName] = useState<string | null>(null);
    const [editingGroupKeywords, setEditingGroupKeywords] = useState<string | null>(null);
    const [editingGroupNegatives, setEditingGroupNegatives] = useState<string | null>(null);
    const [tempGroupName, setTempGroupName] = useState('');
    const [tempKeywords, setTempKeywords] = useState('');
    const [tempNegatives, setTempNegatives] = useState('');

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
                                path1: 'shop',
                                path2: 'now'
                            };
                            
                            if (adType === 'rsa') {
                                defaultAd = {
                                    ...defaultAd,
                                    headline1: `${keywordText} - Best Deals`,
                                    headline2: 'Shop Now & Save',
                                    headline3: i === 0 ? 'Fast Delivery Available' : i === 1 ? 'Free Shipping' : '24/7 Support',
                                    description1: `Looking for ${keywordText}? We offer competitive prices and excellent service.`,
                                    description2: `Get your ${keywordText} today with free shipping on orders over $50.`,
                                    finalUrl: formattedUrl
                                };
                            } else if (adType === 'dki') {
                                defaultAd = {
                                    ...defaultAd,
                                    headline1: `{KeyWord:${keywordText}} - Official Site`,
                                    headline2: `Best {KeyWord:${keywordText}} Deals`,
                                    headline3: i === 0 ? `Order {KeyWord:${keywordText}} Online` : `Shop {KeyWord:${keywordText}} Now`,
                                    description1: `Find quality {KeyWord:${keywordText}} at great prices. Shop our selection today.`,
                                    description2: `Get your {KeyWord:${keywordText}} with fast shipping and expert support.`,
                                    finalUrl: formattedUrl
                                };
                            } else if (adType === 'callonly') {
                                defaultAd = {
                                    ...defaultAd,
                                    headline1: `Call for ${keywordText}`,
                                    headline2: i === 0 ? 'Available 24/7 - Speak to Expert' : 'Get Expert Advice Now',
                                    description1: `Need ${keywordText}? Call us now for expert advice and the best pricing.`,
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </div>

                {/* Success Banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-green-900">Everything looks good!</h3>
                            <p className="text-sm text-green-700 mt-1">
                                Review and customize your {totalAdGroups} ad groups below. All groups have ads created.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Review Table - Show All Groups */}
                <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="font-bold text-slate-700 w-[180px]">AD GROUP</TableHead>
                                    <TableHead className="font-bold text-slate-700 w-[320px]">ADS & EXTENSIONS</TableHead>
                                    <TableHead className="font-bold text-slate-700 w-[240px]">KEYWORDS</TableHead>
                                    <TableHead className="font-bold text-slate-700 w-[180px]">NEGATIVES</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviewAdGroups.map((group, idx) => {
                                    const groupAds = generatedAds.filter(ad => ad.adGroup === group.name);
                                    const allNegatives = negativeKeywords.split('\n').filter(n => n.trim());
                                    
                                    return (
                                        <TableRow key={idx} className="border-b border-slate-200">
                                            {/* Ad Group Name */}
                                            <TableCell className="align-top py-6">
                                                {editingGroupName === group.name ? (
                                                    <div className="space-y-2">
                                                        <Input
                                                            value={tempGroupName}
                                                            onChange={(e) => setTempGroupName(e.target.value)}
                                                            className="text-sm"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSaveGroupName(group.name)}
                                                                className="h-7 text-xs"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingGroupName(null)}
                                                                className="h-7 text-xs"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-800">{group.name}</span>
                                                        <button 
                                                            onClick={() => handleEditGroupName(group.name)}
                                                            className="p-1 hover:bg-slate-100 rounded"
                                                        >
                                                        <Edit3 className="w-3 h-3 text-slate-400" />
                                                    </button>
                                                </div>
                                                )}
                                            </TableCell>

                                            {/* Ads & Extensions - Show All Ads for This Group */}
                                            <TableCell className="align-top py-6">
                                                {groupAds.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {groupAds.map((ad, adIdx) => (
                                                            <div key={ad.id || adIdx} className="space-y-2 text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                                        <div className="flex items-start gap-2">
                                                            <div className="flex-1">
                                                                        {(ad.type === 'rsa' || ad.type === 'dki') && (
                                                                            <>
                                                                <div className="text-blue-600 font-medium hover:underline cursor-pointer">
                                                                                    {ad.headline1} {ad.headline2 && `| ${ad.headline2}`} {ad.headline3 && `| ${ad.headline3}`}
                                                                </div>
                                                                <div className="text-green-700 text-xs mt-0.5">
                                                                                    {ad.finalUrl || url || 'www.example.com'}/{ad.path1 || ''}/{ad.path2 || ''}
                                                                </div>
                                                                                <div className="text-slate-600 text-xs mt-1">
                                                                                    {ad.description1}
                                                                </div>
                                                                                {ad.description2 && (
                                                                                    <div className="text-slate-600 text-xs mt-0.5">
                                                                                        {ad.description2}
                                                            </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {ad.type === 'callonly' && (
                                                                            <>
                                                                                <div className="text-blue-600 font-semibold">
                                                                                    {ad.headline1}
                                                                                </div>
                                                                                {ad.headline2 && (
                                                                                    <div className="text-slate-700 text-xs mt-0.5">
                                                                                        {ad.headline2}
                                                                                    </div>
                                                                                )}
                                                                                <div className="text-slate-600 text-xs mt-1">
                                                                                    {ad.description1}
                                                                                </div>
                                                                                {ad.description2 && (
                                                                                    <div className="text-slate-600 text-xs mt-0.5">
                                                                                        {ad.description2}
                                                                                    </div>
                                                                                )}
                                                                                <div className="text-green-700 font-semibold text-xs mt-1">
                                                                                    📞 {ad.phone} • {ad.businessName}
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
                                                                        className="p-1 hover:bg-slate-100 rounded flex-shrink-0"
                                                                        title="Edit ad"
                                                                    >
                                                                <Edit3 className="w-3 h-3 text-slate-400" />
                                                            </button>
                                                        </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400">
                                                        No ad created. <button 
                                                            onClick={() => {
                                                                setSelectedAdGroup(group.name);
                                                                setStep(3);
                                                            }}
                                                            className="text-blue-600 hover:underline"
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
                                                            className="text-xs"
                                                            rows={4}
                                                            placeholder="Enter keywords (comma-separated)"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSaveKeywords(group.name)}
                                                                className="h-7 text-xs"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingGroupKeywords(null)}
                                                                className="h-7 text-xs"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                <div className="space-y-1">
                                                        {group.keywords.map((kw, kidx) => (
                                                        <div key={kidx} className="flex items-center justify-between text-xs">
                                                                <span className="text-slate-700 font-mono">
                                                                    {formatKeywordDisplay(kw)}
                                                                </span>
                                                                <Badge variant="outline" className="ml-2 text-xs">
                                                                    {getMatchTypeDisplay(kw)}
                                                                </Badge>
                                                        </div>
                                                    ))}
                                                        <button 
                                                            onClick={() => handleEditKeywords(group.name, group.keywords)}
                                                            className="text-xs text-blue-600 hover:underline mt-2"
                                                        >
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
                                                <div className="space-y-1">
                                                        {allNegatives.slice(0, 5).map((neg, nidx) => (
                                                        <div key={nidx} className="text-xs text-slate-600 font-mono">
                                                            "{neg}"
                                                        </div>
                                                    ))}
                                                        {allNegatives.length > 5 && (
                                                            <div className="text-xs text-slate-400">
                                                                +{allNegatives.length - 5} more
                                                            </div>
                                                        )}
                                                        <button 
                                                            onClick={() => handleEditNegatives(group.name, allNegatives)}
                                                            className="text-xs text-blue-600 hover:underline mt-2"
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
                        size="lg" 
                        onClick={() => setStep(6)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    >
                        Next - Validate Campaign
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        );
    };

    // Step 6: Validation & Export
    const renderStep6 = () => {
        // Calculate stats using dynamicAdGroups
        const adGroupsForStats = getDynamicAdGroups();
        const totalAdGroups = adGroupsForStats.length;
        const totalKeywords = selectedKeywords.length;
        const totalAds = generatedAds.length;
        const totalNegatives = negativeKeywords.split('\n').filter(n => n.trim()).length;
        
        // Calculate number of locations
        let totalLocations = 0;
        if (manualGeoInput && manualGeoInput.trim()) {
            // Count comma-separated locations
            const locations = manualGeoInput.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
            totalLocations = locations.length;
        } else if (zipPreset) {
            // If ZIP preset is selected, use the preset number
            const presetNumber = parseInt(zipPreset.replace(/\D/g, '')) || 0;
            totalLocations = presetNumber;
        } else if (cityPreset) {
            // If city preset is selected, use the preset number
            const presetNumber = parseInt(cityPreset.replace(/\D/g, '')) || 0;
            totalLocations = presetNumber;
        } else {
            // Default to 1 if only country is selected
            totalLocations = 1;
        }

        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Campaign Validated Successfully!</h2>
                    <p className="text-slate-500 mt-2">Your campaign is ready to export and implement</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-6 text-center">
                            <div className="text-4xl font-bold text-indigo-600">1</div>
                            <div className="text-sm text-slate-600 mt-2">Campaign</div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-6 text-center">
                            <div className="text-4xl font-bold text-purple-600">{totalAdGroups}</div>
                            <div className="text-sm text-slate-600 mt-2">Ad Groups</div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-6 text-center">
                            <div className="text-4xl font-bold text-blue-600">{totalKeywords}</div>
                            <div className="text-sm text-slate-600 mt-2">Keywords</div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-6 text-center">
                            <div className="text-4xl font-bold text-green-600">{totalLocations}</div>
                            <div className="text-sm text-slate-600 mt-2">Locations</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaign Summary */}
                <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            Validation Summary
                        </CardTitle>
                        <CardDescription>All checks passed - ready for export</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-500">Campaign Name</Label>
                                <Input 
                                    value={campaignName} 
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="Enter campaign name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500">Structure</Label>
                                <p className="font-medium text-slate-800 py-2">{GEO_SEGMENTATION.find(s => s.id === structure)?.name}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-500">Target Location</Label>
                                <p className="font-medium text-slate-800 py-2">{targetCountry} ({targetType})</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                <span>Click "Validate CSV" below to check all parameters before exporting.</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => {
                            const validation = validateCSV();
                            if (validation.valid) {
                                if (validation.warnings.length > 0) {
                                    alert(`✅ CSV Validation Passed!\n\nWarnings:\n${validation.warnings.join('\n')}\n\nYou can proceed with export.`);
                                } else {
                                    alert('✅ CSV Validation Passed! All checks passed. Ready for Google Ads Editor import.');
                                }
                            } else {
                                alert(`❌ CSV Validation Failed!\n\nErrors:\n${validation.errors.join('\n')}\n\nWarnings:\n${validation.warnings.join('\n')}\n\nPlease fix these issues before exporting.`);
                            }
                        }}
                        className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-lg py-6"
                    >
                        <ShieldCheck className="mr-2 w-5 h-5" />
                        Validate CSV
                    </Button>
                    <Button 
                        size="lg" 
                        onClick={() => generateCSV()}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg py-6"
                    >
                        <Download className="mr-2 w-5 h-5" />
                        Download CSV for Google Ads Editor
                    </Button>
                    <Button 
                        variant="outline"
                        size="lg" 
                        onClick={() => handleSaveDraft()}
                        className="py-6"
                    >
                        <Save className="mr-2 w-5 h-5" />
                        Save to Saved Campaigns
                    </Button>
                </div>

                {/* Next Actions */}
                <div className="flex justify-between items-center pt-4">
                    <Button variant="ghost" onClick={() => setStep(5)}>
                        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                        Back to Review
                    </Button>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setStep(1);
                                setCampaignName('');
                                setSelectedKeywords([]);
                                setGeneratedAds([]);
                            }}
                        >
                            <Plus className="mr-2 w-4 h-4" />
                            Create Another Campaign
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

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
                                                                alert('Failed to delete campaign. Please try again.');
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
        <div className="min-h-screen">
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
                            { num: 6, label: 'Validate', icon: ShieldCheck }
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