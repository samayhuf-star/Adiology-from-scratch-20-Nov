import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, Check, ChevronRight, Download, FileText, Globe, 
  Layout, Layers, MapPin, Mail, Hash, TrendingUp, Zap, 
  Phone, Repeat, Search, Sparkles, Edit3, Trash2, Save, RefreshCw, Clock,
  CheckCircle2, AlertCircle, ShieldCheck, AlertTriangle, Plus, Link2, Eye, 
  DollarSign, Smartphone, MessageSquare, Building2, FileText as FormIcon, 
  Tag, Image as ImageIcon, Gift, Target, Brain, Split, Map, Funnel, 
  Users, TrendingDown, Network, Filter, Info
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
import { api } from '../utils/api';
import { projectId } from '../utils/supabase/info';

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

export const CampaignBuilder2 = ({ initialData }: { initialData?: any }) => {
  // Wizard State
  const [step, setStep] = useState(1);
  const [structureType, setStructureType] = useState<StructureType | null>(null);
  
  // Generate default campaign name with date and time
  const generateDefaultCampaignName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/:/g, '-');
    return `Search Campaign ${dateStr} ${timeStr}`;
  };
  
  // Step 1: Setup
  const [campaignName, setCampaignName] = useState(generateDefaultCampaignName());
  const [matchTypes, setMatchTypes] = useState({ broad: true, phrase: true, exact: true });
  const [url, setUrl] = useState('https://example.com');
  
  // Step 2: Keywords
  const [seedKeywords, setSeedKeywords] = useState('');
  // Default negative keywords (comma-separated)
  const DEFAULT_NEGATIVE_KEYWORDS = 'cheap, discount, reviews, job, headquater, apply, free, best, company, information, when, why, where, how, career, hiring, scam, feedback';
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
  const ALL_AD_GROUPS_VALUE = 'ALL_AD_GROUPS';
  const [selectedAdGroup, setSelectedAdGroup] = useState(ALL_AD_GROUPS_VALUE);
  const [selectedAdIds, setSelectedAdIds] = useState<number[]>([]);
  const [editingAdId, setEditingAdId] = useState<number | null>(null);
  
  // Helper to get dynamic ad groups based on structure
  const getDynamicAdGroups = useCallback(() => {
    if (!selectedKeywords || selectedKeywords.length === 0) return [];
    if (!structureType) return [];
    
    switch (structureType) {
      case 'skag':
        return selectedKeywords.slice(0, 20).map(kw => ({
          name: kw,
          keywords: [kw]
        }));
      case 'stag':
      case 'stag_plus':
      case 'ngram':
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
      case 'intent':
        const intentGroupsList: Array<{ name: string; keywords: string[] }> = [];
        if (selectedIntents.includes('high_intent') && intentGroups.high_intent.length > 0) {
          intentGroupsList.push({ name: 'High Intent', keywords: intentGroups.high_intent });
        }
        if (selectedIntents.includes('research') && intentGroups.research.length > 0) {
          intentGroupsList.push({ name: 'Research', keywords: intentGroups.research });
        }
        if (selectedIntents.includes('brand') && intentGroups.brand.length > 0) {
          intentGroupsList.push({ name: 'Brand', keywords: intentGroups.brand });
        }
        if (selectedIntents.includes('competitor') && intentGroups.competitor.length > 0) {
          intentGroupsList.push({ name: 'Competitor', keywords: intentGroups.competitor });
        }
        return intentGroupsList;
      case 'alpha_beta':
        return [
          { name: 'Alpha Winners', keywords: alphaKeywords },
          { name: 'Beta Discovery', keywords: betaKeywords }
        ].filter(g => g.keywords.length > 0);
      case 'funnel':
        return [
          { name: 'TOF', keywords: funnelGroups.tof },
          { name: 'MOF', keywords: funnelGroups.mof },
          { name: 'BOF', keywords: funnelGroups.bof }
        ].filter(g => g.keywords.length > 0);
      case 'brand_split':
        return [
          { name: 'Brand', keywords: brandKeywords },
          { name: 'Non-Brand', keywords: nonBrandKeywords }
        ].filter(g => g.keywords.length > 0);
      case 'competitor':
        return competitorKeywords.length > 0 ? [{ name: 'Competitor', keywords: competitorKeywords }] : [];
      case 'match_type':
        return [
          { name: 'Broad Match', keywords: selectedKeywords },
          { name: 'Phrase Match', keywords: selectedKeywords },
          { name: 'Exact Match', keywords: selectedKeywords }
        ];
      default:
        // Mix or default
        const mixGroups: any[] = [];
        selectedKeywords.slice(0, 5).forEach(kw => {
          mixGroups.push({ name: kw, keywords: [kw] });
        });
        const remaining = selectedKeywords.slice(5);
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
  
  // Step 4: Geo
  const [targetCountry, setTargetCountry] = useState('United States');
  const [geoType, setGeoType] = useState('STANDARD');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedZips, setSelectedZips] = useState<string[]>([]);
  
  // Step 5: Review
  const [reviewData, setReviewData] = useState<any>(null);
  
  // Step 6: Validate
  const [validationResults, setValidationResults] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setCampaignName(initialData.campaignName || generateDefaultCampaignName());
      setStructureType(initialData.structureType || null);
      setUrl(initialData.url || 'https://example.com');
      setNegativeKeywords(initialData.negativeKeywords || DEFAULT_NEGATIVE_KEYWORDS);
      setSelectedKeywords(initialData.selectedKeywords || []);
      setGeneratedAds(initialData.generatedAds || []);
    }
  }, [initialData]);

  // Step Indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 space-x-2 sm:space-x-4">
      {[
        { num: 1, label: 'Setup' },
        { num: 2, label: 'Keywords' },
        { num: 3, label: 'Ads & Extensions' },
        { num: 4, label: 'Geo Target' },
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

  // Step 1: Setup with Structure Selection
  const renderStep1 = () => {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Campaign Setup</h2>
          <p className="text-slate-600">Choose your campaign structure and configure basic settings</p>
        </div>

        {/* Campaign Name */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Campaign Name</CardTitle>
            <CardDescription>Give your campaign a descriptive name</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g., Summer Sale Campaign 2025"
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Structure Selection */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Select Campaign Structure</CardTitle>
            <CardDescription>Choose the structure that best fits your campaign goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STRUCTURE_TYPES.map((structure) => {
                const Icon = structure.icon;
                const isSelected = structureType === structure.id;
                return (
                  <Card
                    key={structure.id}
                    onClick={() => setStructureType(structure.id)}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected 
                        ? 'border-2 border-indigo-500 bg-indigo-50' 
                        : 'border border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1">{structure.name}</h3>
                          <p className="text-xs text-slate-600">{structure.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Match Types */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Match Types</CardTitle>
            <CardDescription>Select which match types to include</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="broad"
                  checked={matchTypes.broad}
                  onCheckedChange={(checked) => setMatchTypes({ ...matchTypes, broad: !!checked })}
                />
                <Label htmlFor="broad" className="cursor-pointer">Broad Match</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phrase"
                  checked={matchTypes.phrase}
                  onCheckedChange={(checked) => setMatchTypes({ ...matchTypes, phrase: !!checked })}
                />
                <Label htmlFor="phrase" className="cursor-pointer">Phrase Match</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exact"
                  checked={matchTypes.exact}
                  onCheckedChange={(checked) => setMatchTypes({ ...matchTypes, exact: !!checked })}
                />
                <Label htmlFor="exact" className="cursor-pointer">Exact Match</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landing Page URL */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Landing Page URL</CardTitle>
            <CardDescription>Where should your ads direct users?</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end">
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
              if (!url) {
                notifications.warning('Please enter a landing page URL', { title: 'URL Required' });
                return;
              }
              setStep(2);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next: Keywords <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
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
      <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seed Keywords</CardTitle>
              <CardDescription>Enter your seed keywords (one per line)</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Fill with test seed keywords
                setSeedKeywords('call airline\nairline number\nairline phone number\ncall united number\nunited airlines phone\nairline customer service');
              }}
              className="gap-2"
            >
              <Info className="w-4 h-4" />
              Fill Info
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={seedKeywords}
            onChange={(e) => setSeedKeywords(e.target.value)}
            placeholder="Call airline&#10;airline number&#10;call united number"
            rows={6}
            className="font-mono text-sm"
          />
          
          {/* Negative Keywords Input */}
          <div className="mt-4">
            <Label className="text-sm font-semibold text-slate-700 mb-2 block">
              Negative Keywords (comma-separated)
            </Label>
            <Input
              value={negativeKeywords}
              onChange={(e) => setNegativeKeywords(e.target.value)}
              placeholder="cheap, discount, reviews, job, free..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Keywords containing these terms will be excluded from generation. Separate with commas.
            </p>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={async () => {
                if (!seedKeywords.trim()) {
                  notifications.warning('Please enter seed keywords', { title: 'Seed Keywords Required' });
                  return;
                }

                setIsGeneratingKeywords(true);
                let loadingToastId: number | string | undefined;
                
                try {
                  loadingToastId = notifications.loading('Generating keywords with AI...', {
                    title: 'AI Keyword Generation',
                    description: 'This may take a few moments. Please wait...',
                  });
                } catch (e) {
                  console.log('Could not show loading toast:', e);
                }

                try {
                  let keywords: any[] = [];

                  // Parse negative keywords (comma or newline separated)
                  const negativeList = negativeKeywords
                    .split(/[,\n]/)
                    .map(n => n.trim().toLowerCase())
                    .filter(Boolean);
                  
                  // Always try fallback first due to CORS issues
                  // Generate enhanced mock keywords based on seed keywords (300-600 keywords)
                  const seedList = seedKeywords.split('\n').filter(k => k.trim());
                  const mockKeywords: any[] = [];
                  
                  // Expanded variation lists for generating 300-600 keywords
                  // Call/Lead focused prefixes
                  const prefixes = [
                    'call', 'contact', 'phone', 'reach', 'get', 'find', 'hire', 'book',
                    'best', 'top', 'professional', 'expert', 'certified', 'licensed', 
                    'trusted', 'reliable', 'local', 'nearby', 'fast', 'quick', 'easy',
                    'affordable', 'quality', 'premium', 'experienced', 'free consultation',
                    'get quote', 'request quote', 'schedule', 'book now', 'call now'
                  ];
                  
                  // Call/Lead focused suffixes
                  const suffixes = [
                    'call', 'contact', 'phone', 'call now', 'contact us', 'get quote',
                    'free consultation', 'schedule', 'book', 'appointment', 'near me',
                    'service', 'company', 'provider', 'expert', 'professional',
                    'get started', 'sign up', 'apply now', 'request info', 'learn more',
                    'pricing', 'quotes', 'rates', 'cost', 'price', 'options', 'solutions'
                  ];
                  
                  // Call/Lead Intent Keywords - Optimized for conversions
                  const callLeadIntents = [
                    'call', 'contact', 'reach', 'phone', 'call now', 'contact us', 'get quote',
                    'request quote', 'free consultation', 'schedule', 'book', 'appointment',
                    'speak with', 'talk to', 'connect with', 'reach out', 'get in touch',
                    'call today', 'call now', 'phone number', 'contact number', 'call us',
                    'hire', 'book now', 'schedule now', 'get started', 'sign up', 'register',
                    'apply', 'apply now', 'get quote now', 'request info', 'get info',
                    'learn more', 'find out more', 'get help', 'need help', 'want to know'
                  ];
                  
                  const intents = callLeadIntents; // Use call/lead focused intents
                  
                  const locations = [
                    'near me', 'local', 'nearby', 'in my area', 'close to me', 'nearby me',
                    'in city', 'in town', 'in state', 'in region', 'in area', 'in location'
                  ];
                  
                  seedList.forEach((seed, seedIdx) => {
                    const cleanSeed = seed.trim().toLowerCase();
                    let keywordCounter = 0;
                    
                    // Add the seed keyword itself (if not in negatives)
                    if (!negativeList.some(n => cleanSeed.includes(n))) {
                      mockKeywords.push({
                        id: `kw-${seedIdx}-${keywordCounter++}`,
                        text: seed.trim(),
                        volume: 'High',
                        cpc: '$2.50',
                        type: 'Seed'
                      });
                    }
                    
                    // Generate prefix + seed combinations (~50)
                    prefixes.forEach((prefix, pIdx) => {
                      const keyword = `${prefix} ${cleanSeed}`;
                      if (!negativeList.some(n => keyword.includes(n))) {
                        mockKeywords.push({
                          id: `kw-${seedIdx}-${keywordCounter++}`,
                          text: keyword,
                          volume: ['High', 'Medium', 'Low'][pIdx % 3],
                          cpc: ['$2.50', '$1.80', '$1.20'][pIdx % 3],
                          type: ['Exact', 'Phrase', 'Broad'][pIdx % 3]
                        });
                      }
                    });
                    
                    // Generate seed + suffix combinations (~50)
                    suffixes.forEach((suffix, sIdx) => {
                      const keyword = `${cleanSeed} ${suffix}`;
                      if (!negativeList.some(n => keyword.includes(n))) {
                        mockKeywords.push({
                          id: `kw-${seedIdx}-${keywordCounter++}`,
                          text: keyword,
                          volume: ['High', 'Medium', 'Low'][sIdx % 3],
                          cpc: ['$2.50', '$1.80', '$1.20'][sIdx % 3],
                          type: ['Exact', 'Phrase', 'Broad'][sIdx % 3]
                        });
                      }
                    });
                    
                    // Generate intent + seed combinations (~20)
                    intents.forEach((intent, iIdx) => {
                      const keyword = `${intent} ${cleanSeed}`;
                      if (!negativeList.some(n => keyword.includes(n))) {
                        mockKeywords.push({
                          id: `kw-${seedIdx}-${keywordCounter++}`,
                          text: keyword,
                          volume: 'High',
                          cpc: '$3.50',
                          type: 'Exact'
                        });
                      }
                    });
                    
                    // Generate prefix + seed + suffix combinations (~100)
                    for (let i = 0; i < 100; i++) {
                      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
                      const keyword = `${prefix} ${cleanSeed} ${suffix}`;
                      if (!negativeList.some(n => keyword.includes(n))) {
                        mockKeywords.push({
                          id: `kw-${seedIdx}-${keywordCounter++}`,
                          text: keyword,
                          volume: ['High', 'Medium', 'Low'][i % 3],
                          cpc: ['$2.50', '$1.80', '$1.20'][i % 3],
                          type: ['Exact', 'Phrase', 'Broad'][i % 3]
                        });
                      }
                    }
                    
                    // Generate seed + location combinations (~30)
                    locations.forEach((loc, lIdx) => {
                      const keyword = `${cleanSeed} ${loc}`;
                      if (!negativeList.some(n => keyword.includes(n))) {
                        mockKeywords.push({
                          id: `kw-${seedIdx}-${keywordCounter++}`,
                          text: keyword,
                          volume: 'Medium',
                          cpc: '$4.20',
                          type: 'Local'
                        });
                      }
                    });
                  });
                  
                  // Ensure we have 300-600 keywords
                  if (mockKeywords.length < 300) {
                    const needed = 300 - mockKeywords.length;
                    for (let i = 0; i < needed; i++) {
                      const base = mockKeywords[i % mockKeywords.length];
                      const variation = `${base.text} ${i}`;
                      if (!negativeList.some(n => variation.includes(n))) {
                        mockKeywords.push({
                          id: `kw-extra-${i}`,
                          text: variation,
                          volume: base.volume,
                          cpc: base.cpc,
                          type: base.type
                        });
                      }
                    }
                  }
                  
                  // Limit to 600 max
                  if (mockKeywords.length > 600) {
                    mockKeywords.splice(600);
                  }
                  
                  // Try API call, but don't fail if it doesn't work
                  if (projectId) {
                    try {
                      console.log("Attempting AI keyword generation...");
                      const data = await api.post('/generate-keywords', {
                        seeds: seedKeywords,
                        negatives: negativeKeywords,
                        count: 500, // Request 300-600 keywords
                        intent: 'call_lead', // Specify call/lead intent
                        instructions: 'Generate keywords optimized for phone calls and lead generation. Focus on high-intent keywords that indicate users want to contact, call, get quotes, schedule appointments, or request information. Prioritize action-oriented keywords like "call", "contact", "get quote", "schedule", "book", "hire", etc.'
                      });

                      if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
                        console.log("AI generation successful:", data.keywords.length, "keywords");
                        // Filter out keywords containing negative keywords
                        const filteredKeywords = data.keywords.filter((k: any) => {
                          const keywordText = (k.text || k.id || '').toLowerCase();
                          return !negativeList.some(neg => keywordText.includes(neg));
                        });
                        keywords = filteredKeywords.length > 0 ? filteredKeywords : mockKeywords;
                      } else {
                        console.log("No keywords from API, using mock generation");
                        keywords = mockKeywords;
                      }
                    } catch (apiError: any) {
                      console.log('ℹ️ API unavailable (CORS or network issue) - using enhanced local generation', apiError);
                      // Use mock keywords as fallback
                      keywords = mockKeywords;
                    }
                  } else {
                    console.warn("Project ID is missing, using mock generation");
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    keywords = mockKeywords;
                  }

                  // Final filter: Remove any keywords containing negative keywords
                  const finalKeywords = keywords.filter((k: any) => {
                    const keywordText = (k.text || k.id || '').toLowerCase();
                    return !negativeList.some(neg => keywordText.includes(neg));
                  });

                  setGeneratedKeywords(finalKeywords);
                  
                  // Auto-select all generated keywords by default
                  const allKeywordIds = finalKeywords.map(k => k.text || k.id);
                  setSelectedKeywords(allKeywordIds);
                  
                  // Extract keyword texts for structure-specific grouping
                  const keywordTexts = keywords.map(k => k.text || k.id);
                  
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
                  
                  // Dismiss loading toast
                  if (loadingToastId) {
                    try {
                      notifications.dismiss(loadingToastId);
                    } catch (e) {
                      console.log('Could not dismiss loading toast:', e);
                    }
                  }
                  
                  notifications.success(`Generated ${keywords.length} keywords successfully`, {
                    title: 'Keywords Generated',
                    description: `Found ${keywords.length} keyword suggestions. Review and select the ones you want to use.`,
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
                  
                  // Dismiss loading toast
                  if (loadingToastId) {
                    try {
                      notifications.dismiss(loadingToastId);
                    } catch (e) {
                      console.log('Could not dismiss loading toast:', e);
                    }
                  }
                  
                  notifications.info(`Generated ${mockKeywords.length} keywords using local generation`, {
                    title: 'Keywords Generated (Offline Mode)',
                    description: 'Using local generation. Some features may be limited.',
                  });
                } finally {
                  setIsGeneratingKeywords(false);
                }
              }}
              disabled={!seedKeywords.trim() || isGeneratingKeywords}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {isGeneratingKeywords ? (
                <><RefreshCw className="w-5 h-5 mr-2 animate-spin"/> Generating...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2"/> Generate Keywords</>
              )}
            </Button>
          </div>
          
          {/* Display Generated Keywords */}
          {generatedKeywords.length > 0 && (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl mt-4">
              <CardHeader>
                <CardTitle>Generated Keywords ({generatedKeywords.length})</CardTitle>
                <CardDescription>Select keywords to include in your campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedKeywords.length === generatedKeywords.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const allKeywords = generatedKeywords.map(k => k.text || k.id);
                          setSelectedKeywords(allKeywords);
                        } else {
                          setSelectedKeywords([]);
                        }
                      }}
                    />
                    <Label className="font-semibold">Select All</Label>
                  </div>
                  <Badge variant="outline">{selectedKeywords.length} selected</Badge>
                </div>
                <ScrollArea className="h-64 border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {generatedKeywords.map((keyword) => {
                      const keywordText = keyword.text || keyword.id;
                      const isSelected = selectedKeywords.includes(keywordText);
                      return (
                        <div
                          key={keyword.id || keywordText}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-indigo-50 border-2 border-indigo-500' 
                              : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedKeywords(selectedKeywords.filter(k => k !== keywordText));
                            } else {
                              setSelectedKeywords([...selectedKeywords, keywordText]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedKeywords([...selectedKeywords, keywordText]);
                              } else {
                                setSelectedKeywords(selectedKeywords.filter(k => k !== keywordText));
                              }
                            }}
                          />
                          <Label className="cursor-pointer flex-1">{keywordText}</Label>
                          {keyword.volume && (
                            <Badge variant="secondary" className="text-xs">{keyword.volume}</Badge>
                          )}
                        </div>
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
          // Standard keyword selection
          return (
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Select Keywords</CardTitle>
                <CardDescription>Choose keywords for your campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <KeywordPlannerSelectable
                  initialData={{
                    seedKeywords,
                    negativeKeywords,
                    selectedKeywords
                  }}
                  onKeywordsSelected={(keywords) => setSelectedKeywords(keywords)}
                />
              </CardContent>
            </Card>
          );

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
                    <div className="text-center py-8 text-slate-500">
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
                    <div className="text-center py-8 text-slate-500">
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
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Keywords</h2>
          <p className="text-slate-600">Generate and organize keywords based on your structure: {STRUCTURE_TYPES.find(s => s.id === structureType)?.name}</p>
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
                notifications.warning('Please generate and select at least one keyword', { 
                  title: 'Keywords Required',
                  description: 'You need to select keywords before proceeding to the next step.'
                });
                return;
              }
              setStep(3);
            }}
            disabled={selectedKeywords.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Ads & Extensions <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 3: Ads & Extensions (Structure-based templates)
  // Generate ads based on structure - moved outside renderStep3 to avoid closure issues
  const generateAdsForStructure = useCallback(() => {
    if (!structureType || selectedKeywords.length === 0) {
      // Fallback: create at least one default ad
      const defaultAd = {
        id: Date.now(),
        type: 'rsa',
        headline1: `${selectedKeywords[0] || 'Your Service'} - Best Deals`,
        headline2: 'Shop Now & Save',
        headline3: 'Fast Delivery',
        description1: `Looking for ${selectedKeywords[0] || 'your service'}? We offer competitive prices.`,
        description2: 'Get started today!',
        finalUrl: url
      };
      setGeneratedAds([defaultAd]);
      return;
    }

      const baseAds: any[] = [];
      const mainKeyword = selectedKeywords[0] || 'your service';

      switch (structureType) {
        case 'alpha_beta':
          // Alpha: Hyper-specific, Beta: Broader
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `${mainKeyword} - Exact Match Solution`,
            headline2: 'Precision Targeting',
            headline3: 'Optimized Performance',
            description1: `Get the exact ${mainKeyword} solution you need.`,
            description2: 'Tailored for high-converting searches.',
            finalUrl: url
          });
          baseAds.push({
            id: 2,
            type: 'rsa',
            headline1: `Best ${mainKeyword} Options`,
            headline2: 'Compare & Choose',
            headline3: 'Multiple Solutions',
            description1: `Explore various ${mainKeyword} options.`,
            description2: 'Find the perfect fit for your needs.',
            finalUrl: url
          });
          break;

        case 'intent':
          // Intent-matched templates
          if (selectedIntents.includes('high_intent')) {
            baseAds.push({
              id: 1,
              type: 'rsa',
              headline1: `Need ${mainKeyword} Now?`,
              headline2: 'Immediate Solutions',
              headline3: 'Fast Response',
              description1: `Get ${mainKeyword} immediately.`,
              description2: 'Quick and reliable service.',
              finalUrl: url
            });
          }
          if (selectedIntents.includes('research')) {
            baseAds.push({
              id: 2,
              type: 'rsa',
              headline1: `Affordable ${mainKeyword} Info`,
              headline2: 'Compare Prices',
              headline3: 'Research Options',
              description1: `Learn about ${mainKeyword} pricing.`,
              description2: 'Make informed decisions.',
              finalUrl: url
            });
          }
          break;

        case 'competitor':
          // Competitor-avoiding ads
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `Better Than Your Current Provider`,
            headline2: 'Superior Solutions',
            headline3: 'Proven Results',
            description1: 'Switch to a better solution.',
            description2: 'Experience the difference.',
            finalUrl: url
          });
          break;

        case 'funnel':
          // Funnel-based ads
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `Learn About ${mainKeyword}`,
            headline2: 'Educational Resources',
            headline3: 'Expert Guides',
            description1: `Discover everything about ${mainKeyword}.`,
            description2: 'Start your journey here.',
            finalUrl: url
          });
          baseAds.push({
            id: 2,
            type: 'rsa',
            headline1: `Get ${mainKeyword} Today`,
            headline2: 'Call to Action',
            headline3: 'Limited Time Offer',
            description1: `Act now and get ${mainKeyword}.`,
            description2: 'Don\'t miss out!',
            finalUrl: url
          });
          break;

        default:
          // Standard RSA ads
          baseAds.push({
            id: 1,
            type: 'rsa',
            headline1: `${mainKeyword} - Best Deals`,
            headline2: 'Shop Now & Save',
            headline3: 'Fast Delivery',
            description1: `Looking for ${mainKeyword}? We offer competitive prices.`,
            description2: 'Get started today!',
            finalUrl: url
          });
      }

      // Ensure at least one ad is generated (fallback for cases where baseAds might be empty)
      if (baseAds.length === 0) {
        baseAds.push({
          id: Date.now(),
          type: 'rsa',
          headline1: `${mainKeyword} - Best Deals`,
          headline2: 'Shop Now & Save',
          headline3: 'Fast Delivery',
          description1: `Looking for ${mainKeyword}? We offer competitive prices.`,
          description2: 'Get started today!',
          finalUrl: url
        });
      }

      setGeneratedAds(baseAds);
  }, [structureType, selectedKeywords.length, url, selectedIntents]);

  // Generate ads when step 3 is reached
  useEffect(() => {
    if (step === 3) {
      if (!structureType) {
        return; // Will show error message in renderStep3
      }
      if (selectedKeywords.length === 0) {
        return; // Will show error message in renderStep3
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
    setEditingAdId(null);
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

  const createNewAd = (type: 'rsa' | 'dki' | 'callonly' | 'snippet' | 'callout' | 'call' | 'sitelink' | 'price' | 'app' | 'location' | 'message' | 'leadform' | 'promotion' | 'image') => {
    const isExtension = ['snippet', 'callout', 'call', 'sitelink', 'price', 'app', 'location', 'message', 'leadform', 'promotion', 'image'].includes(type);
    const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
    
    if (isExtension && !hasRegularAds) {
      notifications.info('Creating a default ad first, then adding your extension', {
        title: 'Ad Required',
        description: 'Extensions require at least one ad. A DKI ad will be created automatically.',
      });
      
      const dynamicAdGroups = getDynamicAdGroups();
      const currentGroup = dynamicAdGroups.length > 0 ? dynamicAdGroups[0] : null;
      const baseUrl = url || 'www.example.com';
      const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);
      const mainKeyword = currentGroup?.keywords?.[0] || selectedKeywords[0] || 'your service';
      
      const dkiAd: any = {
        id: Date.now(),
        type: 'dki',
        adGroup: selectedAdGroup === ALL_AD_GROUPS_VALUE ? ALL_AD_GROUPS_VALUE : selectedAdGroup,
        headline1: `{KeyWord:${mainKeyword}} - Official Site`,
        headline2: 'Best {KeyWord:' + mainKeyword + '} Deals',
        headline3: 'Order {KeyWord:' + mainKeyword + '} Online',
        description1: `Find quality {KeyWord:${mainKeyword}} at great prices. Shop our selection today.`,
        description2: `Get your {KeyWord:${mainKeyword}} with fast shipping and expert support.`,
        finalUrl: formattedUrl,
        path1: 'keyword',
        path2: 'deals'
      };
      
      setGeneratedAds(prev => [...prev, dkiAd]);
      
      if (selectedAdGroup === ALL_AD_GROUPS_VALUE && selectedAdIds.length < 3) {
        setSelectedAdIds(prev => [...prev, dkiAd.id]);
      }
    }

    const dynamicAdGroups = getDynamicAdGroups();
    const currentGroup = dynamicAdGroups.find(g => g.name === selectedAdGroup) || dynamicAdGroups[0];
    const mainKeyword = currentGroup?.keywords[0] || selectedKeywords[0] || 'your service';
    
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
          { text: 'Shop Now', description: 'Browse our collection', url: formattedUrl + '/shop' },
          { text: 'About Us', description: 'Learn more about us', url: formattedUrl + '/about' },
          { text: 'Contact', description: 'Get in touch', url: formattedUrl + '/contact' },
          { text: 'Support', description: 'Customer support', url: formattedUrl + '/support' }
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
    const hasRegularAds = generatedAds.some(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
    if (!hasRegularAds) {
      notifications.warning('Create at least one ad first', {
        title: 'Ad Required',
        description: 'You need at least one ad (RSA, DKI, or Call Only) before adding extensions.',
      });
      return;
    }
    setShowExtensionDialog(true);
  };

  const [showExtensionDialog, setShowExtensionDialog] = useState(false);
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  
  const extensionTypes = [
    { id: 'callout', label: 'Callout Extension', description: 'Highlight key benefits' },
    { id: 'sitelink', label: 'Sitelink Extension', description: 'Add links to important pages' },
    { id: 'call', label: 'Call Extension', description: 'Add phone number' },
    { id: 'snippet', label: 'Snippet Extension', description: 'Show structured information' },
    { id: 'price', label: 'Price Extension', description: 'Display pricing' },
    { id: 'location', label: 'Location Extension', description: 'Show business location' },
    { id: 'message', label: 'Message Extension', description: 'Enable messaging' },
    { id: 'promotion', label: 'Promotion Extension', description: 'Show special offers' },
  ];

  const handleConfirmAIExtensions = () => {
    if (selectedExtensions.length === 0) {
      notifications.warning('Please select at least one extension', {
        title: 'No Extensions Selected',
      });
      return;
    }

    const dynamicAdGroups = getDynamicAdGroups();
    const currentGroup = dynamicAdGroups.find(g => g.name === selectedAdGroup) || dynamicAdGroups[0];
    const mainKeyword = currentGroup?.keywords[0] || selectedKeywords[0] || 'your service';
    const baseUrl = url || 'www.example.com';
    const formattedUrl = baseUrl.match(/^https?:\/\//i) ? baseUrl : (baseUrl.startsWith('www.') ? `https://${baseUrl}` : `https://${baseUrl}`);

    const newExtensions: any[] = [];

    selectedExtensions.forEach(extType => {
      const extId = Date.now() + Math.random();
      let extension: any = {
        id: extId,
        extensionType: extType,
        adGroup: selectedAdGroup
      };

      if (extType === 'callout') {
        extension.callouts = [
          `Free ${mainKeyword} Consultation`,
          '24/7 Expert Support',
          'Best Price Guarantee',
          'Fast & Reliable Service'
        ];
      } else if (extType === 'sitelink') {
        extension.sitelinks = [
          { text: `Shop ${mainKeyword}`, description: 'Browse our collection', url: `${formattedUrl}/shop` },
          { text: 'About Us', description: 'Learn more about us', url: `${formattedUrl}/about` },
          { text: 'Contact', description: 'Get in touch', url: `${formattedUrl}/contact` },
          { text: 'Support', description: 'Customer support', url: `${formattedUrl}/support` }
        ];
      } else if (extType === 'call') {
        extension.phone = '(555) 123-4567';
        extension.callTrackingEnabled = true;
      } else if (extType === 'snippet') {
        extension.header = 'Services';
        extension.values = currentGroup?.keywords.slice(0, 4) || [mainKeyword, 'Expert Service', 'Quality Products', 'Fast Delivery'];
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
        extension.promotionDescription = `Get 20% off ${mainKeyword}`;
        extension.occasion = 'SALE';
        extension.startDate = new Date().toISOString().split('T')[0];
        extension.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      newExtensions.push(extension);
    });

    const firstAd = generatedAds.find(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
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
    
    notifications.success(`Generated ${selectedExtensions.length} AI extensions`, {
      title: 'Extensions Created',
      description: 'Your AI-generated extensions have been added and will appear in ad previews.',
    });
  };

  const renderStep3 = () => {
    if (!structureType) {
      return (
        <div className="max-w-7xl mx-auto p-8 text-center">
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
        <div className="max-w-7xl mx-auto p-8 text-center">
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
                
                {/* Extension Buttons */}
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-2 font-semibold">EXTENSIONS</p>
                  <Button 
                    onClick={() => createNewAd('snippet')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> SNIPPET EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('callout')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> CALLOUT EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('sitelink')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> SITELINK EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('call')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> CALL EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('price')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> PRICE EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('app')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> APP EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('location')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> LOCATION EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('message')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> MESSAGE EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('leadform')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> LEAD FORM EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('promotion')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> PROMOTION EXTENSION
                  </Button>
                  <Button 
                    onClick={() => createNewAd('image')}
                    disabled={selectedKeywords.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    <Plus className="mr-2 w-5 h-5" /> IMAGE EXTENSION
                  </Button>
                </div>
                
                {/* AI Extension Generator */}
                <div className="pt-2 border-t border-slate-200">
                  <Button 
                    onClick={handleGenerateAIExtensions}
                    disabled={selectedKeywords.length === 0 || !hasRegularAds}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
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
            <Button variant="ghost" onClick={() => setStep(2)}>
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
              <Button onClick={handleConfirmAIExtensions} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                Generate {selectedExtensions.length > 0 ? `${selectedExtensions.length} ` : ''}Extensions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  // Step 4: Geo Targeting (Dynamic based on structure)
  const renderStep4 = () => {
    const isGeoSegmented = structureType === 'geo';
    
    // Calculate number of campaigns for GEO-Segmented structure
    const getCampaignCount = () => {
      if (!isGeoSegmented) return 1;
      if (geoType === 'STATE' && selectedStates.length > 0) return selectedStates.length;
      if (geoType === 'CITY' && selectedCities.length > 0) return selectedCities.length;
      if (geoType === 'ZIP' && selectedZips.length > 0) return selectedZips.length;
      return 0;
    };

    const campaignCount = getCampaignCount();
    const geoUnitName = geoType === 'STATE' ? 'states' : geoType === 'CITY' ? 'cities' : geoType === 'ZIP' ? 'ZIPs' : 'locations';
    const geoUnitCount = geoType === 'STATE' ? selectedStates.length : geoType === 'CITY' ? selectedCities.length : geoType === 'ZIP' ? selectedZips.length : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Geo Targeting</h2>
          <p className="text-slate-600">Select target locations</p>
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
                  {campaignCount > 0 && (
                    <p className="text-sm text-indigo-700 mt-2">
                      {geoUnitCount} {geoUnitName} = {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Target Country</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={targetCountry} onValueChange={setTargetCountry}>
              <SelectTrigger className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Geo Type Selection */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Geo Segmentation Type</CardTitle>
            <CardDescription>Choose how to segment your geo targeting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'STANDARD', label: 'Standard', icon: Hash },
                { id: 'STATE', label: 'States', icon: MapPin },
                { id: 'CITY', label: 'Cities', icon: Layout },
                { id: 'ZIP', label: 'ZIPs', icon: Mail }
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = geoType === type.id;
                return (
                  <Card
                    key={type.id}
                    onClick={() => setGeoType(type.id as any)}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected 
                        ? 'border-2 border-indigo-500 bg-indigo-50' 
                        : 'border border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {type.label}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Geo Selection based on type */}
        {geoType === 'STATE' && (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Select States</CardTitle>
              <CardDescription>Choose states to target (each state = 1 campaign for GEO-Segmented)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {['California', 'Texas', 'Florida', 'New York', 'Illinois'].map((state) => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox
                      id={`state-${state}`}
                      checked={selectedStates.includes(state)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStates([...selectedStates, state]);
                        } else {
                          setSelectedStates(selectedStates.filter(s => s !== state));
                        }
                      }}
                    />
                    <Label htmlFor={`state-${state}`} className="cursor-pointer">{state}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {geoType === 'CITY' && (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Select Cities</CardTitle>
              <CardDescription>Choose cities to target (each city = 1 campaign for GEO-Segmented)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'].map((city) => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${city}`}
                      checked={selectedCities.includes(city)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCities([...selectedCities, city]);
                        } else {
                          setSelectedCities(selectedCities.filter(c => c !== city));
                        }
                      }}
                    />
                    <Label htmlFor={`city-${city}`} className="cursor-pointer">{city}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {geoType === 'ZIP' && (
          <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Select ZIP Codes</CardTitle>
              <CardDescription>Enter ZIP codes (each ZIP = 1 campaign for GEO-Segmented)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={selectedZips.join('\n')}
                onChange={(e) => {
                  const zips = e.target.value.split('\n').filter(z => z.trim());
                  setSelectedZips(zips);
                }}
                placeholder="10001&#10;10002&#10;10003"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                Enter one ZIP code per line. {selectedZips.length > 0 && `${selectedZips.length} ZIP${selectedZips.length !== 1 ? 's' : ''} = ${selectedZips.length} campaign${selectedZips.length !== 1 ? 's' : ''}`}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(3)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => setStep(5)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next: Review <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 5: Review
  const renderStep5 = () => {
    // Calculate number of campaigns
    const getCampaignCount = () => {
      if (structureType === 'geo') {
        if (geoType === 'STATE') return selectedStates.length || 1;
        if (geoType === 'CITY') return selectedCities.length || 1;
        if (geoType === 'ZIP') return selectedZips.length || 1;
        return 1;
      }
      return 1; // Single campaign for other structures
    };

    // Calculate number of ad groups
    const getAdGroupCount = () => {
      if (!structureType) return 0;
      
      switch (structureType) {
        case 'skag':
          return selectedKeywords.length;
        case 'stag':
        case 'mix':
          // Estimate: group keywords into ~5-10 groups
          return Math.ceil(selectedKeywords.length / 5);
        case 'stag_plus':
        case 'ngram':
          return Object.keys(smartClusters).length || Math.ceil(selectedKeywords.length / 5);
        case 'intent':
          return selectedIntents.length;
        case 'alpha_beta':
          return 2; // Alpha and Beta
        case 'match_type':
          return Object.values(matchTypes).filter(Boolean).length;
        case 'geo':
          return getCampaignCount(); // 1 ad group per campaign
        case 'funnel':
          return Object.keys(funnelGroups).filter(k => funnelGroups[k].length > 0).length;
        case 'brand_split':
          return 2; // Brand and Non-Brand
        case 'competitor':
          return competitorKeywords.length > 0 ? 1 : 0;
        default:
          return Math.ceil(selectedKeywords.length / 5);
      }
    };

    const campaignCount = getCampaignCount();
    const adGroupCount = getAdGroupCount();
    const structureName = STRUCTURE_TYPES.find(s => s.id === structureType)?.name || 'Not Selected';

    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Review Campaign</h2>
          <p className="text-slate-600">Review your campaign configuration</p>
        </div>

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-xs text-slate-500 uppercase tracking-wide">Number of Campaigns</Label>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{campaignCount}</p>
                {structureType === 'geo' && (
                  <p className="text-xs text-slate-500 mt-1">
                    {geoType === 'STATE' && selectedStates.length > 0 && `${selectedStates.length} states`}
                    {geoType === 'CITY' && selectedCities.length > 0 && `${selectedCities.length} cities`}
                    {geoType === 'ZIP' && selectedZips.length > 0 && `${selectedZips.length} ZIPs`}
                  </p>
                )}
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-xs text-slate-500 uppercase tracking-wide">Number of Ad Groups</Label>
                <p className="text-3xl font-bold text-purple-600 mt-2">{adGroupCount}</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <Label className="text-xs text-slate-500 uppercase tracking-wide">Structure Type</Label>
                <p className="text-xl font-semibold text-slate-800 mt-2">{structureName}</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Additional Details */}
            <div className="space-y-3">
              <div>
                <Label className="font-semibold text-slate-700">Campaign Name:</Label>
                <p className="text-slate-600">{campaignName || 'Not set'}</p>
              </div>
              <div>
                <Label className="font-semibold text-slate-700">Keywords:</Label>
                <p className="text-slate-600">{selectedKeywords.length} selected</p>
              </div>
              <div>
                <Label className="font-semibold text-slate-700">Ads:</Label>
                <p className="text-slate-600">{generatedAds.length} generated</p>
              </div>
              <div>
                <Label className="font-semibold text-slate-700">Target Country:</Label>
                <p className="text-slate-600">{targetCountry}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(4)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => setStep(6)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          >
            Next: Validate <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  // Step 6: Validate
  const renderStep6 = () => {
    const handleExportCSV = () => {
      if (!structureType || !campaignName || selectedKeywords.length === 0) {
        notifications.warning('Please complete all required fields', { title: 'Incomplete Campaign' });
        return;
      }

      // Prepare settings for structure generation
      const settings: StructureSettings = {
        structureType,
        campaignName,
        keywords: selectedKeywords,
        matchTypes,
        url,
        negativeKeywords: negativeKeywords.split('\n').filter(k => k.trim()),
        geoType,
        selectedStates,
        selectedCities,
        selectedZips,
        targetCountry,
        ads: generatedAds
          .filter(ad => ad.type !== 'extension') // Filter out standalone extensions
          .map(ad => ({
            type: ad.type || 'rsa',
            headline1: ad.headline1,
            headline2: ad.headline2,
            headline3: ad.headline3,
            headline4: ad.headline4,
            headline5: ad.headline5,
            description1: ad.description1,
            description2: ad.description2,
            final_url: ad.finalUrl || url,
            path1: ad.path1,
            path2: ad.path2,
            extensions: ad.extensions || [] // Include extensions attached to ads
          })),
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
      
      // Export to CSV
      const filename = `${campaignName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      exportCampaignToCSV(structure, filename);
      
      notifications.success('Campaign exported successfully!', { 
        title: 'Export Complete',
        description: `Generated ${structure.campaigns.length} campaign(s) with ${structure.campaigns.reduce((sum, c) => sum + c.adgroups.length, 0)} ad group(s)`
      });
    };

    // Validation checks
    const validations = [
      { check: !!campaignName, message: 'Campaign name is valid' },
      { check: !!structureType, message: 'Structure selected' },
      { check: selectedKeywords.length > 0, message: 'Keywords configured' },
      { check: generatedAds.length > 0, message: 'Ads generated' },
      { check: !!url, message: 'Landing page URL configured' }
    ];

    const allValid = validations.every(v => v.check);

    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Validate Campaign</h2>
          <p className="text-slate-600">Validate your campaign before export</p>
        </div>

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validations.map((validation, idx) => (
                <div key={idx} className={`flex items-center gap-2 ${validation.check ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.check ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{validation.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep(5)}>
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleExportCSV}
            disabled={!allValid}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-2 w-5 h-5" />
            Export CSV
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      {renderStepIndicator()}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
    </div>
  );
};

