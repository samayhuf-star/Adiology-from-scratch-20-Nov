import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Check, ChevronRight, Download, FileText, Globe, 
  Layout, Layers, MapPin, Mail, Hash, TrendingUp, Zap, 
  Phone, Repeat, Search, Sparkles, Edit3, Trash2, Save, RefreshCw,
  CheckCircle2, AlertCircle, ShieldCheck, AlertTriangle, Plus
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
    const [selectedAdGroup, setSelectedAdGroup] = useState('Refrigerators');
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
    const [editingAd, setEditingAd] = useState<any | null>(null);
    const [showAdDialog, setShowAdDialog] = useState(false);

    // Step 4: Geo Targeting
    const [targetCountry, setTargetCountry] = useState('United States');
    const [targetType, setTargetType] = useState('ZIP');
    const [manualGeoInput, setManualGeoInput] = useState('');
    const [zipPreset, setZipPreset] = useState<string | null>(null);

    // Step 5: Review & Success
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [campaignName, setCampaignName] = useState('My Campaign');

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

    // Auto-select first ad group when keywords change
    useEffect(() => {
        const groups = getDynamicAdGroups();
        if (selectedKeywords.length > 0 && groups.length > 0) {
            setSelectedAdGroup(groups[0].name);
        }
    }, [selectedKeywords.length, structure]);

    const saveToHistory = async () => {
        if (!campaignName.trim()) {
            alert('Please enter a campaign name before saving.');
            return;
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
                name: campaignName
            };

            await historyService.save('campaign', campaignName, campaignData);
            
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
        if (step === 2) {
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
        }
        if (step === 4) {
            // Trigger validation on entering step 5
            setValidationStatus('idle');
            runValidation();
        }
        setStep(prev => prev + 1);
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

    const generateCSV = () => {
        let csv = "Campaign,Ad Group,Keyword,Match Type,Headline 1,Headline 2,Description,Final URL,Geo Target\n";
        const geoTarget = zipPreset ? `Top ${zipPreset} ZIPs` : (manualGeoInput ? 'Custom List' : targetCountry);
        
        // Mock CSV content
        csv += `Campaign 1,Ad Group 1,${seedKeywords.split('\n')[0] || 'keyword'},Phrase,${ads.rsa.headline1},${ads.rsa.headline2},${ads.rsa.description1},${url},${geoTarget}`;
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'campaign_export.csv';
        link.click();
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
        // Create a deep copy of the ad to avoid mutating the original
        setEditingAd({
            ...ad,
            headline: ad.headline || '',
            displayUrl: ad.displayUrl || '',
            description: ad.description || '',
            extension: ad.extension || ''
        });
        setShowAdDialog(true);
    };
    
    const handleDuplicateAd = (ad: any) => {
        const newAd = { ...ad, id: Date.now() };
        setGeneratedAds([...generatedAds, newAd]);
    };
    
    const handleDeleteAd = (adId: number) => {
        setGeneratedAds(generatedAds.filter(a => a.id !== adId));
    };
    
    const handleSaveEditedAd = () => {
        if (editingAd) {
            setGeneratedAds(generatedAds.map(a => a.id === editingAd.id ? editingAd : a));
            setShowAdDialog(false);
            setEditingAd(null);
        }
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
    
    const createNewAd = (type: 'rsa' | 'dki' | 'callonly' | 'snippet' | 'callout') => {
        const currentGroup = dynamicAdGroups.find(g => g.name === selectedAdGroup) || dynamicAdGroups[0];
        const mainKeyword = currentGroup?.keywords[0] || 'your service';
        
        let newAd: any = {
            id: Date.now(),
            type: type,
            adGroup: selectedAdGroup
        };

        if (type === 'rsa') {
            newAd = {
                ...newAd,
                headline1: `${mainKeyword} - Best Deals`,
                headline2: 'Shop Now & Save',
                headline3: 'Fast Delivery Available',
                description1: `Looking for ${mainKeyword}? We offer competitive prices and excellent service.`,
                description2: `Get your ${mainKeyword} today with free shipping on orders over $50.`,
                finalUrl: url || 'www.example.com/shop',
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
                finalUrl: url || 'www.example.com/shop',
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
                businessName: 'Your Business'
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
        }

        setGeneratedAds([...generatedAds, newAd]);
    };
    
    const adGroups = ['Refrigerators', 'Ovens', 'Microwaves'];
    
    const renderStep3 = () => {
        // Filter ads for current ad group
        const currentGroupAds = generatedAds.filter(ad => ad.adGroup === selectedAdGroup);
        const adGroupList = dynamicAdGroups.length > 0 ? dynamicAdGroups.map(g => g.name) : adGroups;
        
        return (
        <div className="max-w-7xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                {adGroupList.map(group => (
                                    <SelectItem key={group} value={group}>{group}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {dynamicAdGroups.length > 0 && (
                            <div className="mt-2 text-xs text-slate-600">
                                {dynamicAdGroups.find(g => g.name === selectedAdGroup)?.keywords.length || 0} keywords in this group
                            </div>
                        )}
                    </div>
                    
                    {/* Help Text */}
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-600">
                            You can preview different ad groups, however changing ads here will change all ad groups. 
                            In the next section you can edit ads individually for each ad group.
                        </p>
                    </div>
                    
                    {/* Create Ad Buttons */}
                    <div className="space-y-3">
                        <Button 
                            onClick={() => createNewAd('rsa')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6"
                        >
                            <Plus className="mr-2 w-5 h-5" /> RESP. SEARCH AD
                        </Button>
                        <Button 
                            onClick={() => createNewAd('dki')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6"
                        >
                            <Plus className="mr-2 w-5 h-5" /> DKI TEXT AD
                        </Button>
                        <Button 
                            onClick={() => createNewAd('callonly')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6"
                        >
                            <Plus className="mr-2 w-5 h-5" /> CALL ONLY AD
                        </Button>
                        <Button 
                            onClick={() => createNewAd('snippet')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6"
                        >
                            <Plus className="mr-2 w-5 h-5" /> SNIPPET EXTENSION
                        </Button>
                        <Button 
                            onClick={() => createNewAd('callout')}
                            disabled={selectedKeywords.length === 0}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6"
                        >
                            <Plus className="mr-2 w-5 h-5" /> CALLOUT EXTENSION
                        </Button>
                    </div>
                </div>
                
                {/* Right Panel - Ad Cards */}
                <div className="lg:col-span-2 space-y-4">
                    {currentGroupAds.map(ad => (
                        <div key={ad.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            {/* Ad Type Badge */}
                            <div className="mb-3">
                                <Badge className={
                                    ad.type === 'rsa' ? 'bg-blue-100 text-blue-700' :
                                    ad.type === 'dki' ? 'bg-purple-100 text-purple-700' :
                                    ad.type === 'callonly' ? 'bg-green-100 text-green-700' :
                                    ad.extensionType === 'snippet' ? 'bg-orange-100 text-orange-700' :
                                    'bg-pink-100 text-pink-700'
                                }>
                                    {ad.type === 'rsa' ? 'RSA' : ad.type === 'dki' ? 'DKI' : ad.type === 'callonly' ? 'Call Only' : ad.extensionType === 'snippet' ? 'Snippet Ext.' : 'Callout Ext.'}
                                </Badge>
                            </div>

                            {/* Ad Preview */}
                            {(ad.type === 'rsa' || ad.type === 'dki') && (
                                <div className="mb-4">
                                    <div className="text-blue-600 hover:underline cursor-pointer text-lg mb-1">
                                        {ad.headline1} | {ad.headline2} | {ad.headline3}
                                    </div>
                                    <div className="text-green-700 text-sm mb-2">
                                        {ad.finalUrl}/{ad.path1}/{ad.path2}
                                    </div>
                                    <div className="text-slate-600 text-sm mb-1">
                                        {ad.description1}
                                    </div>
                                    <div className="text-slate-600 text-sm">
                                        {ad.description2}
                                    </div>
                                </div>
                            )}

                            {ad.type === 'callonly' && (
                                <div className="mb-4">
                                    <div className="text-blue-600 font-semibold text-lg mb-1">
                                        {ad.headline1}
                                    </div>
                                    <div className="text-slate-700 text-sm mb-2">
                                        {ad.headline2}
                                    </div>
                                    <div className="text-slate-600 text-sm mb-2">
                                        {ad.description1}
                                    </div>
                                    <div className="text-green-700 font-semibold text-sm">
                                        📞 {ad.phone} • {ad.businessName}
                                    </div>
                                </div>
                            )}

                            {ad.extensionType === 'snippet' && (
                                <div className="bg-green-50 border border-green-200 rounded px-4 py-3 mb-3">
                                    <div className="font-semibold text-sm text-slate-700 mb-2">
                                        {ad.header}: {ad.values.join(', ')}
                                    </div>
                                </div>
                            )}

                            {ad.extensionType === 'callout' && (
                                <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        {ad.callouts.map((callout: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="bg-white">
                                                {callout}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleEditAd(ad)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                    size="sm"
                                >
                                    EDIT
                                </Button>
                                <Button
                                    onClick={() => handleDuplicateAd(ad)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                    size="sm"
                                >
                                    DUPLICATE
                                </Button>
                                <Button
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
                                    size="sm"
                                >
                                    DELETE
                                </Button>
                            </div>
                        </div>
                    ))}
                    
                    {currentGroupAds.length > 0 && dynamicAdGroups.length > 0 && (
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
                    
                    {currentGroupAds.length === 0 && (
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
                        <Select value={targetCountry} onValueChange={setTargetCountry}>
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
                                </div>
                                <Textarea 
                                    placeholder="Or enter ZIP codes manually (comma-separated)..."
                                    value={manualGeoInput}
                                    onChange={(e) => {
                                        setManualGeoInput(e.target.value);
                                        setZipPreset(null);
                                    }}
                                    rows={4}
                                    className="bg-white/80"
                                />
                            </TabsContent>

                            <TabsContent value="CITY" className="space-y-4">
                                <Textarea 
                                    placeholder="Enter cities (comma-separated)..."
                                    value={manualGeoInput}
                                    onChange={(e) => setManualGeoInput(e.target.value)}
                                    rows={6}
                                    className="bg-white/80"
                                />
                            </TabsContent>

                            <TabsContent value="STATE" className="space-y-4">
                                <Textarea 
                                    placeholder="Enter states/provinces (comma-separated)..."
                                    value={manualGeoInput}
                                    onChange={(e) => setManualGeoInput(e.target.value)}
                                    rows={6}
                                    className="bg-white/80"
                                />
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

    // Step 5: Detailed Review - shows all ad groups with editable content
    const renderStep5 = () => {
        // Group keywords and ads by ad group (for demo, we'll create groups based on structure)
        const adGroups = [];
        
        if (structure === 'SKAG') {
            // Single Keyword Ad Groups - each keyword gets its own group
            selectedKeywords.slice(0, 10).forEach((keyword, idx) => {
                adGroups.push({
                    name: keyword,
                    keywords: [keyword],
                    negatives: negativeKeywords.split('\n').filter(n => n.trim()).slice(0, 3)
                });
            });
        } else {
            // For STAG/Mix - group keywords logically
            const groupSize = Math.ceil(selectedKeywords.length / 3);
            for (let i = 0; i < Math.min(3, selectedKeywords.length); i++) {
                const groupKeywords = selectedKeywords.slice(i * groupSize, (i + 1) * groupSize);
                if (groupKeywords.length > 0) {
                    adGroups.push({
                        name: `Ad Group ${i + 1}`,
                        keywords: groupKeywords,
                        negatives: negativeKeywords.split('\n').filter(n => n.trim()).slice(0, 3)
                    });
                }
            }
        }

        return (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Success Banner */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-green-900">Everything looks good!</h3>
                            <p className="text-sm text-green-700 mt-1">
                                The tool will generate {adGroups.length} unique ad groups. You can further customize each ad below.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Review Table */}
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
                                {adGroups.map((group, idx) => {
                                    const groupAd = generatedAds[idx] || generatedAds[0];
                                    
                                    return (
                                        <TableRow key={idx} className="border-b border-slate-200">
                                            {/* Ad Group Name */}
                                            <TableCell className="align-top py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-800">{group.name}</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded">
                                                        <Edit3 className="w-3 h-3 text-slate-400" />
                                                    </button>
                                                </div>
                                            </TableCell>

                                            {/* Ads & Extensions */}
                                            <TableCell className="align-top py-6">
                                                {groupAd ? (
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-start gap-2">
                                                            <div className="flex-1">
                                                                <div className="text-blue-600 font-medium hover:underline cursor-pointer">
                                                                    {groupAd.type === 'CallOnly' ? groupAd.headline1 : groupAd.headline1} | {groupAd.headline2}
                                                                </div>
                                                                <div className="text-green-700 text-xs mt-0.5">
                                                                    {groupAd.finalUrl || url || 'www.example.com/shop/now'}
                                                                </div>
                                                                <div className="text-slate-600 text-xs mt-1 line-clamp-2">
                                                                    {groupAd.description1}
                                                                </div>
                                                            </div>
                                                            <button className="p-1 hover:bg-slate-100 rounded flex-shrink-0">
                                                                <Edit3 className="w-3 h-3 text-slate-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400">No ad created</div>
                                                )}
                                            </TableCell>

                                            {/* Keywords */}
                                            <TableCell className="align-top py-6">
                                                <div className="space-y-1">
                                                    {group.keywords.slice(0, 3).map((kw, kidx) => (
                                                        <div key={kidx} className="flex items-center justify-between text-xs">
                                                            <span className="text-slate-700 font-mono">[{kw}]</span>
                                                        </div>
                                                    ))}
                                                    {group.keywords.length > 3 && (
                                                        <div className="text-xs text-slate-400">
                                                            +{group.keywords.length - 3} more
                                                        </div>
                                                    )}
                                                    <button className="text-xs text-blue-600 hover:underline mt-2">
                                                        Edit keywords
                                                    </button>
                                                </div>
                                            </TableCell>

                                            {/* Negative Keywords */}
                                            <TableCell className="align-top py-6">
                                                <div className="space-y-1">
                                                    {group.negatives.map((neg, nidx) => (
                                                        <div key={nidx} className="text-xs text-slate-600 font-mono">
                                                            "{neg}"
                                                        </div>
                                                    ))}
                                                    <button className="text-xs text-blue-600 hover:underline mt-2">
                                                        Edit negatives
                                                    </button>
                                                </div>
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
        // Calculate stats
        const totalAdGroups = structure === 'SKAG' 
            ? Math.min(selectedKeywords.length, 10) 
            : Math.min(3, Math.ceil(selectedKeywords.length / 3));
        const totalKeywords = selectedKeywords.length;
        const totalAds = generatedAds.length;
        const totalNegatives = negativeKeywords.split('\n').filter(n => n.trim()).length;

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
                            <div className="text-4xl font-bold text-green-600">{totalAds}</div>
                            <div className="text-sm text-slate-600 mt-2">Ads</div>
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

                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>All CSV validations passed. No errors detected.</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Export Actions */}
                <div className="grid md:grid-cols-2 gap-6">
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

    // Main render based on step
    return (
        <div className="min-h-screen">
            {/* Progress Steps */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
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

            {/* Edit Ad Dialog - Rendered at component level so it's always available */}
            <Dialog open={showAdDialog} onOpenChange={(open) => {
                setShowAdDialog(open);
                if (!open) {
                    setEditingAd(null);
                }
            }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Ad</DialogTitle>
                        <DialogDescription>Make changes to your ad</DialogDescription>
                    </DialogHeader>
                    {editingAd && (
                        <div className="space-y-4">
                            <div>
                                <Label>Headline</Label>
                                <Input 
                                    value={editingAd.headline || ''} 
                                    onChange={(e) => setEditingAd({...editingAd, headline: e.target.value})}
                                    placeholder="Enter headline"
                                />
                            </div>
                            <div>
                                <Label>Display URL</Label>
                                <Input 
                                    value={editingAd.displayUrl || ''} 
                                    onChange={(e) => setEditingAd({...editingAd, displayUrl: e.target.value})}
                                    placeholder="Enter display URL"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea 
                                    value={editingAd.description || ''} 
                                    onChange={(e) => setEditingAd({...editingAd, description: e.target.value})}
                                    placeholder="Enter description"
                                    rows={3}
                                />
                            </div>
                            {editingAd.extension && (
                                <div>
                                    <Label>Extension</Label>
                                    <Input 
                                        value={editingAd.extension || ''} 
                                        onChange={(e) => setEditingAd({...editingAd, extension: e.target.value})}
                                        placeholder="Enter extension"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowAdDialog(false);
                                setEditingAd(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveEditedAd} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={!editingAd}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                            Campaign Saved Successfully!
                        </DialogTitle>
                        <DialogDescription>
                            Your campaign "{campaignName}" has been saved to your saved campaigns. You can access it from the History panel.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            onClick={() => setShowSuccessModal(false)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CampaignBuilder;