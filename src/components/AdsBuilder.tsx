import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Trash2, Download, FileSpreadsheet, Copy, CheckSquare, Square, Zap, Globe, Settings, Eye, Link2, Phone, Tag, MessageSquare, Building2, FileText, Image as ImageIcon, DollarSign, MapPin, Smartphone, Gift, AlertCircle, Search, Filter, X, ChevronDown, SlidersHorizontal, BarChart3, BarChart, TrendingUp, FileText as FileTextIcon, MoreVertical, Save, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LiveAdPreview } from './LiveAdPreview';
import { api } from '../utils/api';
import { notifications } from '../utils/notifications';
import { 
    generateAds as generateAdsUtility, 
    detectUserIntent,
    type AdGenerationInput,
    type ResponsiveSearchAd,
    type ExpandedTextAd,
    type CallOnlyAd
} from '../utils/googleAdGenerator';

// Google Ads Generation System Prompt
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

interface AdGroup {
    id: string;
    name: string;
    keywords: string;
}

interface Extension {
    id: string;
    // Google Search Ads compatible extensions only
    extensionType: 'callout' | 'sitelink' | 'call' | 'snippet' | 'price' | 'location' | 'message' | 'leadform' | 'promotion';
    [key: string]: any;
}

interface GeneratedAd {
    id: string;
    groupName: string;
    adType: 'RSA' | 'DKI' | 'CallOnly';
    headline1?: string;
    headline2?: string;
    headline3?: string;
    headline4?: string;
    headline5?: string;
    description1?: string;
    description2?: string;
    path1?: string;
    path2?: string;
    finalUrl?: string;
    phoneNumber?: string;
    businessName?: string;
    selected: boolean;
    extensions?: Extension[];
    type?: 'rsa' | 'dki' | 'callonly';
}

type FillInfoPreset = {
    baseUrl: string;
    paths: string[];
    singleKeywords: string[];
    adGroups: {
        name: string;
        keywords: string[];
    }[];
};

const AD_FILL_INFO_PRESETS: FillInfoPreset[] = [
    {
        baseUrl: 'https://www.flyzenclaims.com',
        paths: ['claims', 'support', 'vip-clients', ''],
        singleKeywords: [
            'airline refund assistance',
            'flight voucher support',
            'delayed flight compensation',
            'airline hotline booking',
            '24/7 airline agents',
            'same day flight change help'
        ],
        adGroups: [
            {
                name: 'Flight Claims',
                keywords: [
                    'flight refund help',
                    'airline claim desk',
                    'flight voucher redemption',
                    'delay compensation',
                    'cancelled flight hotline',
                    'lost baggage claim support'
                ]
            },
            {
                name: 'Hotline Support',
                keywords: [
                    'speak to airline agent',
                    'emergency flight changes',
                    'priority boarding help',
                    'airline concierge desk',
                    'flight customer hotline'
                ]
            },
            {
                name: 'VIP Flyers',
                keywords: [
                    'vip airline desk',
                    'concierge flight team',
                    'elite travel assistance',
                    'airport lounge booking',
                    'premium flight perks'
                ]
            }
        ]
    },
    {
        baseUrl: 'https://www.rapidplumbpros.com',
        paths: ['book-now', 'emergency', 'services', 'quote'],
        singleKeywords: [
            'emergency plumber',
            'water heater repair',
            'burst pipe repair',
            'licensed plumbing company',
            'same day leak detection'
        ],
        adGroups: [
            {
                name: 'Emergency Crew',
                keywords: [
                    '24 7 plumber hotline',
                    'weekend plumbing service',
                    'emergency leak repair',
                    'after hours plumber',
                    'rapid sewer backup fix'
                ]
            },
            {
                name: 'Water Heaters',
                keywords: [
                    'tankless install experts',
                    'water heater replacement',
                    'gas water heater repair',
                    'electric water heater service'
                ]
            },
            {
                name: 'Drain Team',
                keywords: [
                    'hydro jetting specials',
                    'clogged drain service',
                    'camera drain inspection',
                    'rooter service near me'
                ]
            }
        ]
    },
    {
        baseUrl: 'https://www.guardiancloudsec.com',
        paths: ['audits', 'zero-trust', 'demo', 'enterprise'],
        singleKeywords: [
            'managed soc services',
            'cloud security monitoring',
            'zero trust assessment',
            'cybersecurity operations center',
            'threat response automation'
        ],
        adGroups: [
            {
                name: 'SOC Monitoring',
                keywords: [
                    '24 7 soc desk',
                    'outsourced cyber team',
                    'managed detection response',
                    'cloud breach monitoring'
                ]
            },
            {
                name: 'Zero Trust',
                keywords: [
                    'zero trust roadmap',
                    'identity segmentation audit',
                    'sase deployment team',
                    'micro segmentation experts'
                ]
            },
            {
                name: 'Compliance',
                keywords: [
                    'soc 2 gap assessment',
                    'hipaa cloud audit',
                    'pci readiness service',
                    'iso 27001 consultants'
                ]
            }
        ]
    }
];

const getRandomItem = <T,>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
};

const formatKeywordList = (keywords: string[], min = 3, max = 5) => {
    if (keywords.length === 0) return '';
    const pool = [...keywords].sort(() => Math.random() - 0.5);
    const safeMin = Math.min(min, pool.length);
    const safeMax = Math.max(safeMin, Math.min(max, pool.length));
    const count = safeMin === safeMax
        ? safeMin
        : Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
    return pool.slice(0, count || pool.length).join(', ');
};

const normalizeUrlWithSlug = (baseUrl: string, slug: string) => {
    const sanitizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    if (!slug) {
        return sanitizedBase;
    }
    return `${sanitizedBase}/${slug}`;
};

export const AdsBuilder = () => {
    const [mode, setMode] = useState<'single' | 'multiple'>('single');
    const [singleKeywords, setSingleKeywords] = useState('');
    const [adGroups, setAdGroups] = useState<AdGroup[]>([
        { id: '1', name: 'Group 1', keywords: '' }
    ]);
    
    const [baseUrl, setBaseUrl] = useState('https://www.example.com');
    const [urlError, setUrlError] = useState('');
    
    // Ad type selection with dropdown (single selection)
    const [selectedAdType, setSelectedAdType] = useState<string>('rsa'); // 'rsa' | 'dki' | 'callOnly' | 'all'
    
    // Ad config - generates proper number of ads per group per specifications
    // RSA: 3-5 per group, DKI: 2-5 per group, Call-Only: 1 per group
    const getAdConfig = () => {
        if (selectedAdType === 'all') {
            return { rsaCount: 3, dkiCount: 3, callOnlyCount: 1 };
        } else if (selectedAdType === 'rsa') {
            return { rsaCount: 3, dkiCount: 0, callOnlyCount: 0 };
        } else if (selectedAdType === 'dki') {
            return { rsaCount: 0, dkiCount: 3, callOnlyCount: 0 };
        } else {
            return { rsaCount: 0, dkiCount: 0, callOnlyCount: 1 };
        }
    };
    
    const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);
    const [showExtensionDialog, setShowExtensionDialog] = useState(false);
    const [selectedAdForExtension, setSelectedAdForExtension] = useState<string | null>(null);
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
    
    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAdType, setFilterAdType] = useState<string>('all');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showConfigSidebar, setShowConfigSidebar] = useState(true);
    
    // Google Search Ads compatible extensions only
    const extensionTypes = [
        { id: 'callout', label: 'Callout Extension', icon: Tag, description: 'Highlight key benefits', color: 'purple' },
        { id: 'sitelink', label: 'Sitelink Extension', icon: Link2, description: 'Add links to important pages', color: 'blue' },
        { id: 'call', label: 'Call Extension', icon: Phone, description: 'Add phone number', color: 'green' },
        { id: 'snippet', label: 'Structured Snippet Extension', icon: FileText, description: 'Show structured information', color: 'indigo' },
        { id: 'price', label: 'Price Extension', icon: DollarSign, description: 'Display pricing', color: 'emerald' },
        { id: 'location', label: 'Location Extension', icon: MapPin, description: 'Show business location', color: 'red' },
        { id: 'message', label: 'Message Extension', icon: MessageSquare, description: 'Enable messaging', color: 'purple' },
        { id: 'promotion', label: 'Promotion Extension', icon: Gift, description: 'Show special offers', color: 'orange' },
        { id: 'leadform', label: 'Lead Form Extension', icon: Building2, description: 'Add lead form', color: 'blue' },
    ];

    const addAdGroup = () => {
        const newId = (adGroups.length + 1).toString();
        setAdGroups([...adGroups, { 
            id: newId, 
            name: `Group ${newId}`, 
            keywords: '' 
        }]);
    };

    const removeAdGroup = (id: string) => {
        if (adGroups.length > 1) {
            // Bug_23: Renumber groups after deletion (Group 2 becomes Group 1, etc.)
            const filteredGroups = adGroups.filter(group => group.id !== id);
            const renumberedGroups = filteredGroups.map((group, index) => ({
                ...group,
                name: `Group ${index + 1}`
            }));
            setAdGroups(renumberedGroups);
        }
    };

    const updateAdGroup = (id: string, field: 'name' | 'keywords', value: string) => {
        setAdGroups(adGroups.map(group => 
            group.id === id ? { ...group, [field]: value } : group
        ));
    };

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
        // Remove negative keyword prefix
        if (clean.startsWith('-')) {
            clean = clean.slice(1);
        }
        clean = clean.trim();
        
        // Convert to Title Case (capitalize each word)
        return clean.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Helper: Generate SEO-friendly URL from keyword
    const generateKeywordUrl = (baseUrl: string, keyword: string): string => {
        const cleanBase = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        const urlSafeKeyword = keyword
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
        
        return `${cleanBase}/${urlSafeKeyword}`;
    };

    // Helper: Validate DKI syntax
    const validateDKISyntax = (text: string): boolean => {
        // Check for correct {KeyWord:Default Text} format
        const dkiPattern = /\{KeyWord:[^}]+\}/g;
        const matches = text.match(dkiPattern);
        if (!matches) return true; // No DKI found, that's fine
        
        // Check each match is valid
        return matches.every(match => {
            // Should not have spaces inside braces before colon
            if (match.includes(' {') || match.includes('} ')) return false;
            // Should have KeyWord (capital K and W)
            if (!match.includes('KeyWord:')) return false;
            // Should not have nested braces
            const openBraces = (match.match(/\{/g) || []).length;
            const closeBraces = (match.match(/\}/g) || []).length;
            return openBraces === 1 && closeBraces === 1;
        });
    };

    const generateAds = async () => {
        // Bug_27: Validate URL before generating
        const urlValue = baseUrl.trim();
        if (urlValue && !urlValue.match(/^https?:\/\/.+/i)) {
            setUrlError('Please enter a valid URL starting with http:// or https://');
            notifications.warning('Please enter a valid URL', {
                title: 'Invalid URL',
                description: 'The landing page URL must start with http:// or https://'
            });
            return;
        }
        setUrlError('');

        // Bug_33: Validate that no group fields are blank in multiple mode
        if (mode === 'multiple') {
            const blankGroups = adGroups.filter(g => !g.keywords.trim());
            if (blankGroups.length > 0) {
                const groupNames = blankGroups.map(g => g.name).join(', ');
                notifications.warning(`Please enter keywords for all groups. The following groups are blank: ${groupNames}`, {
                    title: 'Blank Group Fields',
                    description: 'All groups must have keywords before generating ads.'
                });
                return;
            }
        }

        // Bug_33: Validate single mode has keywords
        if (mode === 'single' && !singleKeywords.trim()) {
            notifications.warning('Please enter keywords', {
                title: 'Keywords Required',
                description: 'You must enter keywords before generating ads.'
            });
            return;
        }

        setIsGenerating(true);
        try {
            const groupsToProcess = mode === 'single' 
                ? [{ id: '1', name: 'Group 1', keywords: singleKeywords }]
                : adGroups.filter(g => g.keywords.trim());

            if (groupsToProcess.length === 0 || groupsToProcess.every(g => !g.keywords.trim())) {
                notifications.warning('Please enter keywords for at least one group', {
                    title: 'Keywords Required'
                });
                setIsGenerating(false);
                return;
            }

            // Get ad config based on selected ad type
            const currentAdConfig = getAdConfig();
            
            // Calculate total ads that will be generated
            // For proper generation: RSA = 3 per group, DKI = 3 per group, Call-Only = 1 per group
            const rsaPerGroup = currentAdConfig.rsaCount;
            const dkiPerGroup = currentAdConfig.dkiCount;
            const callOnlyPerGroup = currentAdConfig.callOnlyCount;
            const totalAdsPerGroup = rsaPerGroup + dkiPerGroup + callOnlyPerGroup;
            const totalAdsToGenerate = totalAdsPerGroup * groupsToProcess.length;

            // Limit total ads to 25
            if (totalAdsToGenerate > 25) {
                notifications.warning(`Total ads cannot exceed 25. You're trying to generate ${totalAdsToGenerate} ads (${groupsToProcess.length} groups × ${totalAdsPerGroup} ads per group). Please reduce the quantities or number of groups.`, {
                    title: 'Too Many Ads'
                });
                setIsGenerating(false);
                return;
            }

            const allGeneratedAds: GeneratedAd[] = [];

            for (const group of groupsToProcess) {
                // Split by comma, newline, or semicolon to handle different input formats
                const keywords = group.keywords
                    .split(/[,\n;]+/)
                    .map(k => k.trim())
                    .filter(Boolean);
                
                // Debug: Log keywords array
                console.log('Processing keywords for group:', group.name);
                console.log('Keywords array:', keywords);
                console.log('Number of keywords:', keywords.length);
                
                if (keywords.length === 0) {
                    console.warn('No keywords found after splitting for group:', group.name);
                    continue;
                }
                
                // Generate RSA Ads (3 per group)
                if (rsaPerGroup > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'RSA',
                            count: rsaPerGroup,
                            groupName: group.name,
                            baseUrl: baseUrl,
                            systemPrompt: GOOGLE_ADS_SYSTEM_PROMPT
                        });

                        if (response && response.ads && Array.isArray(response.ads) && response.ads.length > 0) {
                            response.ads.forEach((ad: any) => {
                                // Validate ad structure before adding
                                if (ad && (ad.headline1 || ad.headlines)) {
                                    allGeneratedAds.push({
                                        id: crypto.randomUUID(),
                                        groupName: group.name,
                                        adType: 'RSA',
                                        type: 'rsa',
                                        ...ad,
                                        selected: false,
                                        extensions: []
                                    });
                                }
                            });
                        } else {
                            // If response doesn't have valid ads, use fallback
                            throw new Error('Invalid response structure');
                        }
                    } catch (error) {
                        console.log('API unavailable or invalid response, using fallback for RSA');
                        // Fallback RSA generation (3 ads per group)
                        try {
                            for (let i = 0; i < rsaPerGroup; i++) {
                                allGeneratedAds.push(generateFallbackRSA(group.name, keywords, i, baseUrl));
                            }
                        } catch (fallbackError) {
                            console.error('Fallback generation failed:', fallbackError);
                            // Continue to next ad type instead of breaking the entire generation
                        }
                    }
                }

                // Generate DKI Ads (3 per group)
                if (dkiPerGroup > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'DKI',
                            count: dkiPerGroup,
                            groupName: group.name,
                            baseUrl: baseUrl,
                            systemPrompt: GOOGLE_ADS_SYSTEM_PROMPT
                        });

                        if (response && response.ads && Array.isArray(response.ads) && response.ads.length > 0) {
                            response.ads.forEach((ad: any) => {
                                // Validate ad structure before adding
                                if (ad && (ad.headline1 || ad.headlines)) {
                                    allGeneratedAds.push({
                                        id: crypto.randomUUID(),
                                        groupName: group.name,
                                        adType: 'DKI',
                                        type: 'dki',
                                        ...ad,
                                        selected: false,
                                        extensions: []
                                    });
                                }
                            });
                        } else {
                            // If response doesn't have valid ads, use fallback
                            throw new Error('Invalid response structure');
                        }
                    } catch (error) {
                        console.log('API unavailable or invalid response, using fallback for DKI');
                        // Fallback DKI generation (3 ads per group)
                        try {
                            for (let i = 0; i < dkiPerGroup; i++) {
                                allGeneratedAds.push(generateFallbackDKI(group.name, keywords, i, baseUrl));
                            }
                        } catch (fallbackError) {
                            console.error('Fallback generation failed:', fallbackError);
                            // Continue to next ad type instead of breaking the entire generation
                        }
                    }
                }

                // Generate Call Only Ads
                if (callOnlyPerGroup > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'CallOnly',
                            count: callOnlyPerGroup,
                            groupName: group.name,
                            baseUrl: baseUrl,
                            systemPrompt: GOOGLE_ADS_SYSTEM_PROMPT
                        });

                        if (response && response.ads && Array.isArray(response.ads) && response.ads.length > 0) {
                            response.ads.forEach((ad: any) => {
                                // Validate ad structure before adding
                                if (ad && (ad.phoneNumber || ad.phone || ad.businessName)) {
                                    allGeneratedAds.push({
                                        id: crypto.randomUUID(),
                                        groupName: group.name,
                                        adType: 'CallOnly',
                                        type: 'callonly',
                                        phone: ad.phoneNumber || ad.phone || '',
                                        businessName: ad.businessName || '',
                                        ...ad,
                                        selected: false,
                                        extensions: []
                                    });
                                }
                            });
                        } else {
                            // If response doesn't have valid ads, use fallback
                            throw new Error('Invalid response structure');
                        }
                    } catch (error) {
                        console.log('API unavailable or invalid response, using fallback for Call Only');
                        // Fallback Call Only generation
                        try {
                            for (let i = 0; i < callOnlyPerGroup; i++) {
                                allGeneratedAds.push(generateFallbackCallOnly(group.name, keywords, i, baseUrl));
                            }
                        } catch (fallbackError) {
                            console.error('Fallback generation failed:', fallbackError);
                            // Continue to next ad type instead of breaking the entire generation
                        }
                    }
                }
            }

            // Only set ads if we have at least one generated ad
            if (allGeneratedAds.length > 0) {
                setGeneratedAds(allGeneratedAds);
                setSelectedAds([]);
                notifications.success(`Successfully generated ${allGeneratedAds.length} ad(s)`, {
                    title: 'Ads Generated',
                    duration: 3000
                });
            } else {
                // If no ads were generated, show an error
                notifications.error('Failed to generate ads. Please check your inputs and try again.', {
                    title: 'Generation Failed',
                    description: 'No ads could be generated. Please verify your keywords and URL are valid.'
                });
            }
        } catch (error) {
            console.error('Generation error:', error);
            // Show error notification (only once per generation attempt)
            notifications.error('Failed to generate ads. Please try again.', {
                title: 'Generation Failed'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Helper function to convert new ad generator output to GeneratedAd format
    const convertRSAToGeneratedAd = (rsa: ResponsiveSearchAd, groupName: string, baseUrl: string): GeneratedAd => {
        // Validate that rsa has the required structure
        if (!rsa || !rsa.headlines || !Array.isArray(rsa.headlines)) {
            console.error('Invalid RSA structure:', rsa);
            // Return a safe fallback ad
            return {
                id: crypto.randomUUID(),
                groupName,
                adType: 'RSA',
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
                finalUrl: baseUrl || 'https://www.example.com',
                selected: false,
                extensions: []
            };
        }
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'RSA',
            type: 'rsa',
            headline1: rsa.headlines[0] || '',
            headline2: rsa.headlines[1] || '',
            headline3: rsa.headlines[2] || '',
            headline4: rsa.headlines[3] || '',
            headline5: rsa.headlines[4] || '',
            description1: (rsa.descriptions && rsa.descriptions[0]) || '',
            description2: (rsa.descriptions && rsa.descriptions[1]) || '',
            path1: (rsa.displayPath && rsa.displayPath[0]) || '',
            path2: (rsa.displayPath && rsa.displayPath[1]) || '',
            finalUrl: rsa.finalUrl || baseUrl || 'https://www.example.com',
            selected: false,
            extensions: []
        };
    };

    const generateFallbackRSA = (groupName: string, keywords: string[], index: number, baseUrl: string): GeneratedAd => {
        try {
            // Use the new comprehensive ad generation logic
            const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
            
            // Extract industry from keyword or use default
            // Try to detect industry from keyword, default to 'Services'
            const intent = detectUserIntent([selectedKeyword], 'Services');
            const industry = intent === 'product' ? 'Products' : 'Services';
            
            // Create input for ad generator
            const input: AdGenerationInput = {
                keywords: [selectedKeyword],
                industry: industry,
                businessName: 'Your Business', // Default, can be enhanced later
                baseUrl: baseUrl,
                adType: 'RSA',
                filters: {
                    matchType: 'phrase', // Default match type
                    campaignStructure: 'STAG', // Default structure
                }
            };
            
            // Generate ad using new logic
            const generatedAd = generateAdsUtility(input) as ResponsiveSearchAd;
            
            // Validate the generated ad before converting
            if (!generatedAd || !generatedAd.headlines || !Array.isArray(generatedAd.headlines)) {
                console.error('Generated ad has invalid structure, using safe fallback');
                return convertRSAToGeneratedAd({ headlines: [], descriptions: [], displayPath: [], finalUrl: baseUrl }, groupName, baseUrl);
            }
            
            // Convert to GeneratedAd format
            return convertRSAToGeneratedAd(generatedAd, groupName, baseUrl);
        } catch (error) {
            console.error('Error in generateFallbackRSA:', error);
            // Return a safe fallback ad
            return convertRSAToGeneratedAd({ headlines: [], descriptions: [], displayPath: [], finalUrl: baseUrl }, groupName, baseUrl);
        }
    };

    // Helper to convert RSA to DKI format (DKI uses same structure but with {KeyWord:} syntax)
    const convertRSAToDKI = (rsa: ResponsiveSearchAd, groupName: string, baseUrl: string, keyword: string): GeneratedAd => {
        // Validate that rsa has the required structure
        if (!rsa || !rsa.headlines || !Array.isArray(rsa.headlines)) {
            console.error('Invalid RSA structure in convertRSAToDKI:', rsa);
            const mainKeyword = cleanAndTitleCaseKeyword(keyword);
            // Return a safe fallback DKI ad
            return {
                id: crypto.randomUUID(),
                groupName,
                adType: 'DKI',
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
                finalUrl: baseUrl || 'https://www.example.com',
                selected: false,
                extensions: []
            };
        }
        
        const mainKeyword = cleanAndTitleCaseKeyword(keyword);
        
        // Convert headlines to DKI format
        const dkiHeadlines = (rsa.headlines || []).slice(0, 5).map(h => {
            if (!h) return '';
            // Replace keyword with DKI syntax
            const keywordLower = keyword.toLowerCase();
            const headlineLower = h.toLowerCase();
            
            if (headlineLower.includes(keywordLower)) {
                // Replace keyword with DKI
                const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                return h.replace(regex, `{KeyWord:${mainKeyword}}`);
            } else {
                // Add DKI at the start
                return `{KeyWord:${mainKeyword}} - ${h}`.substring(0, 30);
            }
        });
        
        // Convert descriptions to DKI format
        const dkiDescriptions = (rsa.descriptions || []).slice(0, 2).map(d => {
            if (!d) return '';
            const keywordLower = keyword.toLowerCase();
            const descLower = d.toLowerCase();
            
            if (descLower.includes(keywordLower)) {
                const regex = new RegExp(keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                return d.replace(regex, `{KeyWord:${mainKeyword}}`).substring(0, 90);
            } else {
                return d.substring(0, 90);
            }
        });
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'DKI',
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
            finalUrl: rsa.finalUrl || baseUrl || 'https://www.example.com',
            selected: false,
            extensions: []
        };
    };

    const generateFallbackDKI = (groupName: string, keywords: string[], index: number, baseUrl: string): GeneratedAd => {
        // Use the new comprehensive ad generation logic
        const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
        
        // Extract industry from keyword
        const intent = detectUserIntent([selectedKeyword], 'Services');
        const industry = intent === 'product' ? 'Products' : 'Services';
        
        // Create input for ad generator (generate RSA first, then convert to DKI)
        const input: AdGenerationInput = {
            keywords: [selectedKeyword],
            industry: industry,
            businessName: 'Your Business',
            baseUrl: baseUrl,
            adType: 'RSA', // Generate as RSA first, then convert to DKI format
            filters: {
                matchType: 'phrase',
                campaignStructure: 'STAG',
            }
        };
        
        // Generate ad using new logic
        const generatedAd = generateAdsUtility(input) as ResponsiveSearchAd;
        
        // Validate the generated ad before converting
        if (!generatedAd || !generatedAd.headlines || !Array.isArray(generatedAd.headlines)) {
            console.error('Generated ad has invalid structure for DKI, using safe fallback');
            const mainKeyword = cleanAndTitleCaseKeyword(selectedKeyword);
            return {
                id: crypto.randomUUID(),
                groupName,
                adType: 'DKI',
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
                finalUrl: baseUrl || 'https://www.example.com',
                selected: false,
                extensions: []
            };
        }
        
        // Convert RSA to DKI format
        return convertRSAToDKI(generatedAd, groupName, baseUrl, selectedKeyword);
    };

    // Helper to convert Call-Only ad to GeneratedAd format
    const convertCallOnlyToGeneratedAd = (callAd: CallOnlyAd, groupName: string): GeneratedAd => {
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'CallOnly',
            type: 'callonly',
            headline1: callAd.headline1 || '',
            headline2: callAd.headline2 || '',
            description1: callAd.description1 || '',
            description2: callAd.description2 || '',
            phoneNumber: callAd.phoneNumber || '+1-800-123-4567',
            businessName: callAd.businessName || 'Your Business',
            finalUrl: callAd.verificationUrl || '',
            path1: callAd.displayPath[0] || '',
            path2: callAd.displayPath[1] || '',
            selected: false,
            extensions: []
        };
    };

    const generateFallbackCallOnly = (groupName: string, keywords: string[], index: number, baseUrl: string): GeneratedAd => {
        // Use the new comprehensive ad generation logic
        const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
        
        // Extract industry from keyword
        const intent = detectUserIntent([selectedKeyword], 'Services');
        const industry = intent === 'product' ? 'Products' : 'Services';
        
        // Create input for ad generator
        const input: AdGenerationInput = {
            keywords: [selectedKeyword],
            industry: industry,
            businessName: 'Your Business',
            baseUrl: baseUrl,
            adType: 'CALL_ONLY',
            filters: {
                matchType: 'phrase',
                campaignStructure: 'STAG',
            }
        };
        
        // Generate ad using new logic
        const generatedAd = generateAdsUtility(input) as CallOnlyAd;
        
        // Set phone number if not provided
        if (!generatedAd.phoneNumber) {
            generatedAd.phoneNumber = '+1-800-123-4567';
        }
        
        // Convert to GeneratedAd format
        return convertCallOnlyToGeneratedAd(generatedAd, groupName);
    };

    const toggleAdSelection = (adId: string) => {
        setSelectedAds(prev => 
            prev.includes(adId) ? prev.filter(id => id !== adId) : [...prev, adId]
        );
    };

    const selectAll = () => {
        if (selectedAds.length === generatedAds.length) {
            setSelectedAds([]);
        } else {
            setSelectedAds(generatedAds.map(ad => ad.id));
        }
    };

    const exportToCSV = async () => {
        if (selectedAds.length === 0) {
            notifications.warning('Please select at least one ad to export', {
                title: 'No Ads Selected'
            });
            return;
        }

        const adsToExport = generatedAds.filter(ad => selectedAds.includes(ad.id));
        
        try {
            const { exportCSVWithValidation, exportCampaignToCSVV3, adsToCampaignStructure } = await import('../utils/csvGeneratorV3');
            const filename = `google-ads-${new Date().toISOString().split('T')[0]}.csv`;
            
            // Get default final URL from first ad or base URL
            const defaultUrl = adsToExport[0]?.finalUrl || baseUrl || 'https://www.example.com';
            
            // Validate before exporting
            const validationResult = await exportCSVWithValidation(
                adsToExport,
                filename,
                'ads',
                {
                    campaignName: 'Ads Campaign',
                    finalUrl: defaultUrl
                }
            );
            
            // Check if validation passed
            if (!validationResult.isValid) {
                // Show validation errors - don't export
                notifications.error(
                    <div className="whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
                        {validationResult.errors?.join('\n') || 'Validation failed'}
                    </div>,
                    { 
                        title: '❌ CSV Validation Failed',
                        description: 'Please fix the errors above before exporting. These errors will prevent Google Ads Editor from importing your campaign.',
                        duration: 15000
                    }
                );
                return;
            }
            
            // Export the CSV if validation passed
            if (validationResult.structure) {
                exportCampaignToCSVV3(validationResult.structure, filename);
            } else {
                // Fallback: generate structure and export
                const structure = adsToCampaignStructure(adsToExport, 'Ads Campaign', defaultUrl);
                exportCampaignToCSVV3(structure, filename);
            }
            
            // Show warnings if any (but export was successful)
            if (validationResult.warnings && validationResult.warnings.length > 0) {
                notifications.warning(
                    <div className="whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
                        {validationResult.warnings.join('\n')}
                    </div>,
                    { 
                        title: '⚠️  CSV Validation Warnings',
                        description: 'Your ads have been exported, but consider fixing these warnings.',
                        duration: 10000
                    }
                );
            } else {
                // Show success message
                notifications.success(`Exported ${adsToExport.length} ad(s) to CSV`, {
                    title: 'Export Complete',
                    description: 'Your CSV file has been downloaded successfully.',
                    duration: 3000
                });
            }
        } catch (error: any) {
            console.error('Export error:', error);
            const errorMessage = error?.message || 'An unexpected error occurred during export';
            notifications.error(
                <div className="whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
                    {errorMessage}
                </div>,
                { 
                    title: '❌ Export Failed',
                    description: 'Please fix the errors and try again.',
                    duration: 15000
                }
            );
        }
    };

    const copyToClipboard = () => {
        if (selectedAds.length === 0) {
            notifications.warning('Please select at least one ad to copy', {
                title: 'No Ads Selected'
            });
            return;
        }

        const adsToExport = generatedAds.filter(ad => selectedAds.includes(ad.id));
        const text = adsToExport.map(ad => {
            if (ad.adType === 'CallOnly') {
                return `[${ad.groupName}] ${ad.adType}\nH1: ${ad.headline1}\nH2: ${ad.headline2}\nD1: ${ad.description1}\nD2: ${ad.description2}\nPhone: ${ad.phoneNumber}\nBusiness: ${ad.businessName}\n`;
            } else {
                return `[${ad.groupName}] ${ad.adType}\nH1: ${ad.headline1}\nH2: ${ad.headline2}\nH3: ${ad.headline3}\nD1: ${ad.description1}\nD2: ${ad.description2}\nURL: ${ad.finalUrl}\n`;
            }
        }).join('\n---\n\n');

        navigator.clipboard.writeText(text);
        notifications.success('Copied to clipboard!', {
            title: 'Copied'
        });
    };

    const handleAddExtensions = (adId: string) => {
        setSelectedAdForExtension(adId);
        const ad = generatedAds.find(a => a.id === adId);
        if (ad && ad.extensions) {
            setSelectedExtensions(ad.extensions.map((ext: Extension) => ext.extensionType));
        } else {
            setSelectedExtensions([]);
        }
        setShowExtensionDialog(true);
    };

    const handleConfirmExtensions = async () => {
        if (!selectedAdForExtension) return;

        const ad = generatedAds.find(a => a.id === selectedAdForExtension);
        if (!ad) return;

        // Get existing extension types to prevent duplicates
        const existingExtensionTypes = (ad.extensions || []).map((ext: Extension) => ext.extensionType);
        
        // Filter out extension types that already exist
        const newExtensionTypes = selectedExtensions.filter(extType => !existingExtensionTypes.includes(extType));
        
        if (newExtensionTypes.length === 0) {
            notifications.warning('All selected extensions are already added to this ad', {
                title: 'Extensions Already Added'
            });
            return;
        }

        // Extract keywords from ad group
        const adGroup = adGroups.find(g => g.name === ad.groupName);
        const keywords = adGroup?.keywords ? adGroup.keywords.split(',').map(k => k.trim()) : [];
        const adHeadline = ad.headline1 || '';
        const adDescription = ad.description1 || '';

        // Show loading notification
        const loadingToast = notifications.loading('Generating AI extensions...', {
            title: 'AI Generation',
            description: 'Creating unique extensions based on your ad content.'
        });

        try {
            const response = await api.post('/generate-extensions', {
                keywords: keywords.slice(0, 10).map((k: string) => k.replace(/^\[|\]$|^"|"$/g, '')),
                extensionTypes: newExtensionTypes,
                adHeadline,
                adDescription,
                baseUrl: baseUrl || 'www.example.com'
            });

            if (response.extensions && Array.isArray(response.extensions)) {
                const newExtensions: Extension[] = response.extensions.map((extData: any) => {
                    const extId = crypto.randomUUID();
                    let extension: Extension = {
                        id: extId,
                        extensionType: extData.extensionType as any,
                        ...extData.data
                    };

                    // Ensure URLs are properly formatted for sitelinks
                    if (extension.sitelinks && Array.isArray(extension.sitelinks)) {
                        extension.sitelinks = extension.sitelinks.map((link: any) => ({
                            ...link,
                            url: link.url || `${baseUrl || 'www.example.com'}/${link.text?.toLowerCase().replace(/\s+/g, '-') || 'page'}`
                        }));
                    }

                    return extension;
                });

                // Merge new extensions with existing ones
                setGeneratedAds(generatedAds.map(a => 
                    a.id === selectedAdForExtension 
                        ? { ...a, extensions: [...(a.extensions || []), ...newExtensions] }
                        : a
                ));

                setShowExtensionDialog(false);
                setSelectedAdForExtension(null);
                setSelectedExtensions([]);
                
                if (loadingToast) loadingToast();
                notifications.success(`Generated ${newExtensions.length} unique AI extensions`, {
                    title: 'Extensions Created',
                    description: 'Your AI-generated extensions have been added to the ad.',
                });
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error: any) {
            console.log('ℹ️ Backend unavailable - using fallback extension generation');
            
            if (loadingToast) loadingToast();
            
            // Fallback to basic generation with more variety
            const mainKeyword = ad?.headline1?.split(' ')[0] || 'service';
            const newExtensions: Extension[] = newExtensionTypes.map((extType, index) => {
                const extId = crypto.randomUUID();

                let extension: Extension = {
                    id: extId,
                    extensionType: extType as any,
                };

                // Generate varied fallback content
                const calloutVariations = [
                    [`Expert ${mainKeyword} Service`, 'Licensed Professionals', '24/7 Available', 'Free Estimate'],
                    [`Professional ${mainKeyword}`, 'Trusted & Reliable', 'Same Day Service', 'Quality Guaranteed'],
                    [`Certified ${mainKeyword}`, 'Fast Response Time', 'Satisfaction Guaranteed', 'Emergency Service']
                ];
                const sitelinkVariations = [
                    [
                        { text: `${mainKeyword} Services`, description: 'Professional service options', url: `${baseUrl}/services` },
                        { text: 'Get Quote', description: 'Request a free estimate', url: `${baseUrl}/quote` },
                        { text: 'Contact Us', description: 'Speak with our team', url: `${baseUrl}/contact` },
                        { text: 'About', description: 'Learn about our company', url: `${baseUrl}/about` }
                    ],
                    [
                        { text: 'Our Services', description: 'View all service offerings', url: `${baseUrl}/services` },
                        { text: 'Schedule Service', description: 'Book an appointment', url: `${baseUrl}/schedule` },
                        { text: 'Customer Support', description: 'Get help and support', url: `${baseUrl}/support` },
                        { text: 'Resources', description: 'Helpful information', url: `${baseUrl}/resources` }
                    ]
                ];

                switch (extType) {
                    case 'callout':
                        extension.callouts = calloutVariations[index % calloutVariations.length];
                        break;
                    case 'sitelink':
                        extension.sitelinks = sitelinkVariations[index % sitelinkVariations.length];
                        break;
                    case 'call':
                        extension.phone = '(555) 123-4567';
                        extension.callTrackingEnabled = true;
                        break;
                    case 'snippet':
                        extension.header = 'Services';
                        extension.values = keywords.length > 0 
                            ? keywords.slice(0, 4).map((k: string) => k.replace(/^\[|\]$|^"|"$/g, ''))
                            : [mainKeyword, 'Expert Service', 'Quality Work', 'Fast Response'];
                        break;
                    case 'price':
                        extension.priceQualifier = 'From';
                        extension.price = '$99';
                        extension.currency = 'USD';
                        extension.unit = 'per service';
                        extension.description = 'Competitive pricing';
                        break;
                    case 'location':
                        extension.businessName = 'Your Business Name';
                        extension.addressLine1 = '123 Main St';
                        extension.city = 'City';
                        extension.state = 'State';
                        extension.postalCode = '12345';
                        extension.phone = '(555) 123-4567';
                        break;
                    case 'message':
                        extension.messageText = `Message us about ${mainKeyword}`;
                        extension.businessName = 'Your Business';
                        extension.phone = '(555) 123-4567';
                        break;
                    case 'promotion':
                        extension.promotionText = 'Special Offer';
                        extension.promotionDescription = `Free consultation for ${mainKeyword}`;
                        extension.occasion = 'PROMOTION';
                        extension.startDate = new Date().toISOString().split('T')[0];
                        extension.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        break;
                    case 'leadform':
                        extension.formName = 'Get Started';
                        extension.formDescription = 'Fill out this form to get in touch';
                        extension.formType = 'CONTACT';
                        break;
                }

                return extension;
            });

            // Merge new extensions with existing ones
            setGeneratedAds(generatedAds.map(a => 
                a.id === selectedAdForExtension 
                    ? { ...a, extensions: [...(a.extensions || []), ...newExtensions] }
                    : a
            ));

            setShowExtensionDialog(false);
            setSelectedAdForExtension(null);
            setSelectedExtensions([]);
            
            notifications.info(`Generated ${newExtensions.length} extensions (offline mode)`, {
                title: 'Extensions Created',
                description: 'Using fallback generation. Some variety may be limited.',
            });
        }
    };

    const handleRemoveExtension = (adId: string, extensionId: string) => {
        setGeneratedAds(generatedAds.map(ad => 
            ad.id === adId 
                ? { ...ad, extensions: (ad.extensions || []).filter((ext: Extension) => ext.id !== extensionId) }
                : ad
        ));
    };

    // Filter and search logic
    const filteredAds = useMemo(() => {
        return generatedAds.filter(ad => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = 
                    ad.headline1?.toLowerCase().includes(query) ||
                    ad.headline2?.toLowerCase().includes(query) ||
                    ad.headline3?.toLowerCase().includes(query) ||
                    ad.description1?.toLowerCase().includes(query) ||
                    ad.description2?.toLowerCase().includes(query) ||
                    ad.groupName.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }
            
            // Ad type filter
            if (filterAdType !== 'all' && ad.adType !== filterAdType) return false;
            
            // Group filter
            if (filterGroup !== 'all' && ad.groupName !== filterGroup) return false;
            
            return true;
        });
    }, [generatedAds, searchQuery, filterAdType, filterGroup]);

    // Statistics
    const stats = useMemo(() => {
        const adTypes = generatedAds.reduce((acc, ad) => {
            acc[ad.adType] = (acc[ad.adType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const groups = [...new Set(generatedAds.map(ad => ad.groupName))];
        
        return {
            total: generatedAds.length,
            rsa: adTypes['RSA'] || 0,
            dki: adTypes['DKI'] || 0,
            callOnly: adTypes['CallOnly'] || 0,
            groups: groups.length,
            selected: selectedAds.length
        };
    }, [generatedAds, selectedAds]);

    // Unique groups for filter dropdown
    const uniqueGroups = useMemo(() => {
        return [...new Set(generatedAds.map(ad => ad.groupName))];
    }, [generatedAds]);

    const handleFillInfo = () => {
        const preset = getRandomItem(AD_FILL_INFO_PRESETS);
        if (!preset) return;

        const slug = getRandomItem(preset.paths) || '';
        const formattedGroups: AdGroup[] = preset.adGroups.map((group, index) => ({
            id: `${index + 1}`,
            name: group.name,
            keywords: formatKeywordList(group.keywords)
        }));

        setBaseUrl(normalizeUrlWithSlug(preset.baseUrl, slug));
        setSingleKeywords(formatKeywordList(preset.singleKeywords));
        setAdGroups(formattedGroups);
        setUrlError('');
    };

    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-5">
            {/* Header */}
            <div className="mb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold theme-gradient-text mb-1">
                            Ads Builder
                        </h1>
                        <p className="text-slate-600 text-xs">
                            Generate high-converting Google Ads with AI optimization
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFillInfo}
                        className="text-xs"
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Fill Info
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Single Form */}
                <div className="space-y-5">
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900">
                                Create Your Ads
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600">
                                Fill in the details below to generate your Google Ads
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* URL Input */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2.5">
                                    URL
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://www.example.com"
                                    value={baseUrl}
                                    onChange={(e) => {
                                        setBaseUrl(e.target.value);
                                        if (urlError) setUrlError('');
                                    }}
                                    onBlur={(e) => {
                                        const urlValue = e.target.value.trim();
                                        if (urlValue && !urlValue.match(/^https?:\/\/.+/i)) {
                                            setUrlError('Please enter a valid URL starting with http:// or https://');
                                        } else {
                                            setUrlError('');
                                        }
                                    }}
                                    className={`bg-white border-slate-300 focus:border-indigo-500 h-10 text-sm ${urlError ? 'border-red-500 focus:border-red-500' : ''}`}
                                />
                                {urlError && (
                                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {urlError}
                                    </p>
                                )}
                            </div>

                            {/* Ad Type Dropdown */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2.5">
                                    Type of Ads
                                </Label>
                                <Select value={selectedAdType} onValueChange={setSelectedAdType}>
                                    <SelectTrigger className="w-full h-10 text-sm">
                                        <SelectValue placeholder="Select ad type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rsa">Responsive Search Ads</SelectItem>
                                        <SelectItem value="dki">Dynamic Keyword Insertion (DKI)</SelectItem>
                                        <SelectItem value="callOnly">Call-Only Ads</SelectItem>
                                        <SelectItem value="all">All Types</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mode Selection */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2.5">
                                    Choose Your Mode
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant={mode === 'single' ? 'default' : 'outline'}
                                        onClick={() => setMode('single')}
                                        size="sm"
                                        className={`flex-1 ${mode === 'single' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        Single Ad Group
                                    </Button>
                                    <Button
                                        variant={mode === 'multiple' ? 'default' : 'outline'}
                                        onClick={() => setMode('multiple')}
                                        size="sm"
                                        className={`flex-1 ${mode === 'multiple' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        Multiple Ad Groups
                                    </Button>
                                </div>
                            </div>

                            {/* Keywords Input */}
                            {mode === 'single' ? (
                                <div>
                                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Enter Keywords (comma-separated)
                                    </Label>
                                    <Textarea
                                        placeholder="e.g., airline number, contact airline, delta phone number, customer service"
                                        value={singleKeywords}
                                        onChange={(e) => setSingleKeywords(e.target.value)}
                                        className="min-h-[120px] border-slate-300 text-sm"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Ad Groups & Keywords
                                    </Label>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                        {adGroups.map((group) => (
                                            <div key={group.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Input
                                                        value={group.name}
                                                        onChange={(e) => updateAdGroup(group.id, 'name', e.target.value)}
                                                        placeholder="Ad Group Name"
                                                        className="font-semibold max-w-[200px] h-8 text-xs"
                                                    />
                                                    {adGroups.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeAdGroup(group.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Textarea
                                                    placeholder="Enter keywords (comma-separated)"
                                                    value={group.keywords}
                                                    onChange={(e) => updateAdGroup(group.id, 'keywords', e.target.value)}
                                                    className="min-h-[80px] text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button
                                        onClick={addAdGroup}
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Ad Group
                                    </Button>
                                </div>
                            )}

                            {/* Generate Button */}
                            <Button
                                onClick={generateAds}
                                disabled={isGenerating}
                                className="w-full theme-button-primary py-3 text-base font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Ads...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Generate Ads
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Generated Ads Results */}
                <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-lg overflow-hidden lg:sticky lg:top-6 h-[calc(100vh-8rem)] flex flex-col">
                    <div className="bg-white p-3 border-b border-slate-300 flex-shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <CardTitle className="text-sm font-bold text-slate-900">
                                Generated Ads
                            </CardTitle>
                            {generatedAds.length > 0 && (
                                <div className="flex gap-1">
                                    <Button
                                        onClick={selectAll}
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-300 h-7 text-xs px-2"
                                    >
                                        {selectedAds.length === generatedAds.length ? (
                                            <><Square className="w-3 h-3 mr-1" /> All</>
                                        ) : (
                                            <><CheckSquare className="w-3 h-3 mr-1" /> All</>
                                        )}
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="border-slate-300 h-7 text-xs px-2">
                                                <Download className="w-3 h-3 mr-1" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={exportToCSV} disabled={selectedAds.length === 0}>
                                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                                CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={copyToClipboard} disabled={selectedAds.length === 0}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy to Clipboard
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                        
                        {/* Compact Statistics */}
                        {generatedAds.length > 0 && (
                            <div className="grid grid-cols-5 gap-1 mb-2">
                                <div className="bg-blue-50 border border-blue-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-blue-600 font-medium">Total</div>
                                    <div className="text-sm font-bold text-blue-700">{stats.total}</div>
                                </div>
                                <div className="bg-indigo-50 border border-indigo-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-indigo-600 font-medium">RSA</div>
                                    <div className="text-sm font-bold text-indigo-700">{stats.rsa}</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-purple-600 font-medium">DKI</div>
                                    <div className="text-sm font-bold text-purple-700">{stats.dki}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-green-600 font-medium">Call</div>
                                    <div className="text-sm font-bold text-green-700">{stats.callOnly}</div>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-orange-600 font-medium">Sel</div>
                                    <div className="text-sm font-bold text-orange-700">{stats.selected}</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Compact Search & Filters */}
                        {generatedAds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                <div className="flex-1 min-w-[120px] relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 z-10" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-7 text-xs"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <Select value={filterAdType} onValueChange={setFilterAdType}>
                                    <SelectTrigger className="w-[100px] h-7 text-xs">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="RSA">RSA</SelectItem>
                                        <SelectItem value="DKI">DKI</SelectItem>
                                        <SelectItem value="CallOnly">Call Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                {uniqueGroups.length > 0 && (
                                    <Select value={filterGroup} onValueChange={setFilterGroup}>
                                        <SelectTrigger className="w-[100px] h-7 text-xs">
                                            <SelectValue placeholder="Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Groups</SelectItem>
                                            {uniqueGroups.map(group => (
                                                <SelectItem key={group} value={group}>{group}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        )}
                    </div>
                    <CardContent className="p-3 flex-1 overflow-hidden flex flex-col">
                        {generatedAds.length > 0 && (
                            <div className="mb-2 px-2 py-1 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 rounded border border-indigo-200/50 text-center flex-shrink-0">
                                <p className="text-xs font-semibold text-slate-800">
                                    Showing {filteredAds.length} of {generatedAds.length} ads
                                    {selectedAds.length > 0 && (
                                        <span className="ml-2 text-indigo-600">
                                            • {selectedAds.length} selected
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                        {filteredAds.length > 0 ? (
                                filteredAds.map((ad) => {
                                    // Convert GeneratedAd to LiveAdPreview format
                                    const previewAd = {
                                        id: parseInt(ad.id) || Date.now(),
                                        type: (ad.type || (ad.adType === 'RSA' ? 'rsa' : ad.adType === 'DKI' ? 'dki' : 'callonly')) as 'rsa' | 'dki' | 'callonly',
                                        headline1: ad.headline1,
                                        headline2: ad.headline2,
                                        headline3: ad.headline3,
                                        headline4: ad.headline4,
                                        headline5: ad.headline5,
                                        description1: ad.description1,
                                        description2: ad.description2,
                                        finalUrl: ad.finalUrl || baseUrl,
                                        path1: ad.path1,
                                        path2: ad.path2,
                                        phone: ad.phone || ad.phoneNumber,
                                        businessName: ad.businessName,
                                        extensions: ad.extensions || []
                                    };

                                    return (
                                <div
                                    key={ad.id}
                                    className={`border rounded-lg p-2.5 transition-all ${
                                        selectedAds.includes(ad.id)
                                            ? 'border-indigo-400 bg-indigo-50/50 shadow-sm'
                                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <Checkbox
                                            checked={selectedAds.includes(ad.id)}
                                            onCheckedChange={() => toggleAdSelection(ad.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5">
                                                    {ad.groupName}
                                                </Badge>
                                                <Badge 
                                                    variant="outline"
                                                    className={`text-[10px] font-semibold px-1.5 py-0.5 ${
                                                        ad.adType === 'RSA' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                                        ad.adType === 'DKI' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                                                        'bg-green-100 text-green-700 border-green-300'
                                                    }`}
                                                >
                                                    {ad.adType}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddExtensions(ad.id);
                                                    }}
                                                    className="ml-auto text-[10px] h-6 border-purple-300 text-purple-700 hover:bg-purple-50 px-2"
                                                >
                                                    <Plus className="w-2.5 h-2.5 mr-0.5" />
                                                    Ext
                                                </Button>
                                            </div>

                                                    {/* Live Ad Preview */}
                                                    <LiveAdPreview 
                                                        ad={previewAd} 
                                                        onRemoveExtension={(extensionId) => handleRemoveExtension(ad.id, extensionId)}
                                                    />

                                            {/* Editable URL for RSA/DKI */}
                                            {(ad.adType === 'RSA' || ad.adType === 'DKI') && (
                                                <div className="mt-2 pt-2 border-t border-slate-200">
                                                    <Label className="text-[10px] font-semibold text-slate-700 mb-1 block">Final URL</Label>
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="url"
                                                            value={ad.finalUrl || baseUrl}
                                                            onChange={(e) => {
                                                                setGeneratedAds(generatedAds.map(a => 
                                                                    a.id === ad.id ? { ...a, finalUrl: e.target.value } : a
                                                                ));
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] h-6 text-green-700 border-green-200 focus:border-green-400 flex-1"
                                                            placeholder="Enter URL"
                                                        />
                                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">/{ad.path1}/{ad.path2}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                    );
                                })
                        ) : generatedAds.length > 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Filter className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-xs text-slate-600 font-medium mb-1">No ads match your filters</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterAdType('all');
                                            setFilterGroup('all');
                                        }}
                                        className="mt-2 h-7 text-xs"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium mb-1">No ads generated yet</p>
                                    <p className="text-[10px] text-slate-500">
                                        Configure settings and click "Generate"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Extension Selection Dialog */}
        <Dialog open={showExtensionDialog} onOpenChange={setShowExtensionDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            Add Extensions to Ad
                        </DialogTitle>
                        <DialogDescription>
                            Select extensions to add to your ad. These will appear in the live preview below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
                        {extensionTypes.map((ext) => {
                            const IconComponent = ext.icon;
                            const isSelected = selectedExtensions.includes(ext.id);
                            const ad = generatedAds.find(a => a.id === selectedAdForExtension);
                            const alreadyAdded = (ad?.extensions || []).some((e: Extension) => e.extensionType === ext.id);
                            return (
                                <div
                                    key={ext.id}
                                    className={`p-4 border-2 rounded-lg transition-all ${
                                        alreadyAdded
                                            ? 'border-slate-300 bg-slate-100 cursor-not-allowed opacity-60'
                                            : isSelected
                                                ? (ext.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                                                   ext.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                                                   ext.color === 'green' ? 'border-green-500 bg-green-50' :
                                                   ext.color === 'indigo' ? 'border-indigo-500 bg-indigo-50' :
                                                   ext.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                                                   ext.color === 'red' ? 'border-red-500 bg-red-50' :
                                                   ext.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                                                   ext.color === 'pink' ? 'border-pink-500 bg-pink-50' :
                                                   ext.color === 'cyan' ? 'border-cyan-500 bg-cyan-50' :
                                                   'border-purple-500 bg-purple-50')
                                                : 'border-slate-200 hover:border-indigo-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={alreadyAdded}
                                            onCheckedChange={(checked) => {
                                                if (!alreadyAdded) {
                                                    setSelectedExtensions(prev => {
                                                        if (checked) {
                                                            return prev.includes(ext.id) ? prev : [...prev, ext.id];
                                                        } else {
                                                            return prev.filter(e => e !== ext.id);
                                                        }
                                                    });
                                                }
                                            }}
                                            onClick={(e) => {
                                                // Prevent event bubbling to avoid double-toggling
                                                e.stopPropagation();
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconComponent className={`h-4 w-4 ${
                                                    ext.color === 'purple' ? 'text-purple-600' :
                                                    ext.color === 'blue' ? 'text-blue-600' :
                                                    ext.color === 'green' ? 'text-green-600' :
                                                    ext.color === 'indigo' ? 'text-indigo-600' :
                                                    ext.color === 'emerald' ? 'text-emerald-600' :
                                                    ext.color === 'red' ? 'text-red-600' :
                                                    ext.color === 'orange' ? 'text-orange-600' :
                                                    ext.color === 'pink' ? 'text-pink-600' :
                                                    ext.color === 'cyan' ? 'text-cyan-600' :
                                                    'text-purple-600'
                                                }`} />
                                                <div className="font-semibold text-slate-800">{ext.label}</div>
                                                {alreadyAdded && (
                                                    <Badge variant="outline" className="text-xs ml-auto bg-green-100 text-green-700 border-green-300">
                                                        Already Added
                                                    </Badge>
                                                )}
            </div>
                                            <div className="text-sm text-slate-600">{ext.description}</div>
                                        </div>
            </div>
        </div>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowExtensionDialog(false);
                            setSelectedAdForExtension(null);
                            setSelectedExtensions([]);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmExtensions} className="theme-button-primary">
                            Add {selectedExtensions.length > 0 ? `${selectedExtensions.length} ` : ''}Extension{selectedExtensions.length !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};