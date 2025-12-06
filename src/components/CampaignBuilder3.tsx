import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Globe, Link2, Sparkles, Brain, 
  Hash, MapPin, FileText, Download, AlertCircle, CheckCircle2,
  Loader2, Search, Filter, X, Plus, Edit3, Trash2, Save,
  Target, Zap, Layers, TrendingUp, Building2, ShoppingBag,
  Phone, Mail, Calendar, Clock, Eye, FileSpreadsheet, Copy,
  MessageSquare, Gift, Image as ImageIcon, DollarSign, MapPin as MapPinIcon,
  Star, RefreshCw, Smartphone, Megaphone, FolderOpen
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { notifications } from '../utils/notifications';
import { extractLandingPageContent, type LandingPageExtractionResult } from '../utils/campaignIntelligence/landingPageExtractor';
import { mapGoalToIntent } from '../utils/campaignIntelligence/intentClassifier';
import { type IntentResult, IntentId } from '../utils/campaignIntelligence/schemas';
import { generateCampaignStructure, type StructureSettings } from '../utils/campaignStructureGenerator';
import { generateKeywords as generateKeywordsUtil } from '../utils/keywordGenerator';
import {
  generateAds as generateAdsUtility, 
  detectUserIntent,
  type AdGenerationInput,
  type ResponsiveSearchAd,
  type ExpandedTextAd,
  type CallOnlyAd
} from '../utils/googleAdGenerator';
import { exportCampaignToCSVV3, validateCSVBeforeExport } from '../utils/csvGeneratorV3';
import { exportCampaignToGoogleAdsEditorCSV, campaignStructureToCSVRows, GOOGLE_ADS_EDITOR_HEADERS } from '../utils/googleAdsEditorCSVExporter';
import { validateAndFixAds, formatValidationReport } from '../utils/adValidationUtils';
import Papa from 'papaparse';
import { historyService } from '../utils/historyService';
import { generateCSVWithBackend } from '../utils/csvExportBackend';
import type { CampaignStructure } from '../utils/campaignStructureGenerator';
import { api } from '../utils/api';
import { AutoFillButton } from './AutoFillButton';
import { 
  generateURL, 
  generateCampaignName, 
  generateSeedKeywords, 
  generateNegativeKeywords,
  generateLocationInput 
} from '../utils/autoFill';

// Campaign Structure Types (12 structures)
const CAMPAIGN_STRUCTURES = [
  { id: 'skag', name: 'SKAG', description: 'Single Keyword Ad Group', icon: Target },
  { id: 'stag', name: 'STAG', description: 'Single Theme Ad Group', icon: Layers },
  { id: 'mix', name: 'Mix', description: 'Hybrid Structure', icon: TrendingUp },
  { id: 'stag_plus', name: 'STAG+', description: 'Smart Grouping with ML', icon: Brain },
  { id: 'intent', name: 'Intent-Based', description: 'Group by Intent', icon: Target },
  { id: 'alpha_beta', name: 'Alpha-Beta', description: 'Winners & Discovery', icon: Zap },
  { id: 'match_type', name: 'Match-Type Split', description: 'Separate by Match Type', icon: Filter },
  { id: 'geo', name: 'GEO-Segmented', description: 'One Campaign per Geo', icon: MapPin },
  { id: 'funnel', name: 'Funnel-Based', description: 'TOF/MOF/BOF', icon: TrendingUp },
  { id: 'brand_split', name: 'Brand Split', description: 'Brand vs Non-Brand', icon: Building2 },
  { id: 'competitor', name: 'Competitor', description: 'Competitor Campaigns', icon: Target },
  { id: 'ngram', name: 'N-Gram Clusters', description: 'Smart Clustering', icon: Brain },
];

// Match Types
const MATCH_TYPES = [
  { id: 'broad', label: 'Broad Match', example: 'keyword' },
  { id: 'phrase', label: 'Phrase Match', example: '"keyword"' },
  { id: 'exact', label: 'Exact Match', example: '[keyword]' },
];

// Keyword Types for filtering
const KEYWORD_TYPES = [
  { id: 'broad', label: 'Broad Match' },
  { id: 'phrase', label: 'Phrase Match' },
  { id: 'exact', label: 'Exact Match' },
  { id: 'negative', label: 'Negative Keywords' },
];

// Default negative keywords (15-20 keywords as specified)
const DEFAULT_NEGATIVE_KEYWORDS = [
  'cheap',
  'discount',
  'cost',
  'reviews',
  'job',
  'apply',
  'information',
  'company',
  'free',
  'best',
  'providers',
  'office',
  'headquater',
  'brand',
];

// Location Presets - Top locations
const LOCATION_PRESETS = {
  countries: [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
    'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Sweden', 'Norway',
    'Denmark', 'Finland', 'Poland', 'Austria', 'Ireland', 'Portugal', 'Greece'
  ],
  states: [
    'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania',
    'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
    'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
    'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama',
    'Louisiana', 'Kentucky', 'Oregon', 'Oklahoma', 'Connecticut', 'Utah'
  ],
  cities: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle',
    'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
    'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque',
    'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa', 'Atlanta', 'Omaha', 'Raleigh',
    'Miami', 'Long Beach', 'Virginia Beach', 'Oakland', 'Minneapolis', 'Tulsa', 'Tampa',
    'Arlington', 'New Orleans', 'Wichita', 'Cleveland'
  ],
  zipCodes: (() => {
    // Top 5000 most common US ZIP codes (major metropolitan areas)
    const majorMetros = [
      // NYC area
      ...Array.from({ length: 200 }, (_, i) => String(10001 + i).padStart(5, '0')),
      // LA area
      ...Array.from({ length: 300 }, (_, i) => String(90001 + i).padStart(5, '0')),
      // Chicago area
      ...Array.from({ length: 250 }, (_, i) => String(60601 + i).padStart(5, '0')),
      // Houston area
      ...Array.from({ length: 200 }, (_, i) => String(77001 + i).padStart(5, '0')),
      // Phoenix area
      ...Array.from({ length: 150 }, (_, i) => String(85001 + i).padStart(5, '0')),
      // Philadelphia area
      ...Array.from({ length: 200 }, (_, i) => String(19101 + i).padStart(5, '0')),
      // San Antonio
      ...Array.from({ length: 100 }, (_, i) => String(78201 + i).padStart(5, '0')),
      // San Diego
      ...Array.from({ length: 150 }, (_, i) => String(92101 + i).padStart(5, '0')),
      // Dallas
      ...Array.from({ length: 150 }, (_, i) => String(75201 + i).padStart(5, '0')),
      // San Jose
      ...Array.from({ length: 100 }, (_, i) => String(95101 + i).padStart(5, '0')),
      // Austin
      ...Array.from({ length: 100 }, (_, i) => String(78701 + i).padStart(5, '0')),
      // Jacksonville
      ...Array.from({ length: 100 }, (_, i) => String(32201 + i).padStart(5, '0')),
      // Fort Worth
      ...Array.from({ length: 100 }, (_, i) => String(76101 + i).padStart(5, '0')),
      // Columbus
      ...Array.from({ length: 100 }, (_, i) => String(43201 + i).padStart(5, '0')),
      // Charlotte
      ...Array.from({ length: 100 }, (_, i) => String(28201 + i).padStart(5, '0')),
      // San Francisco
      ...Array.from({ length: 100 }, (_, i) => String(94101 + i).padStart(5, '0')),
      // Indianapolis
      ...Array.from({ length: 100 }, (_, i) => String(46201 + i).padStart(5, '0')),
      // Seattle
      ...Array.from({ length: 100 }, (_, i) => String(98101 + i).padStart(5, '0')),
      // Denver
      ...Array.from({ length: 100 }, (_, i) => String(80201 + i).padStart(5, '0')),
      // Washington DC
      ...Array.from({ length: 100 }, (_, i) => String(20001 + i).padStart(5, '0')),
      // Boston
      ...Array.from({ length: 100 }, (_, i) => String(2101 + i).padStart(5, '0')),
      // El Paso
      ...Array.from({ length: 50 }, (_, i) => String(79901 + i).padStart(5, '0')),
      // Nashville
      ...Array.from({ length: 50 }, (_, i) => String(37201 + i).padStart(5, '0')),
      // Detroit
      ...Array.from({ length: 100 }, (_, i) => String(48201 + i).padStart(5, '0')),
      // Oklahoma City
      ...Array.from({ length: 50 }, (_, i) => String(73101 + i).padStart(5, '0')),
      // Portland
      ...Array.from({ length: 50 }, (_, i) => String(97201 + i).padStart(5, '0')),
      // Las Vegas
      ...Array.from({ length: 100 }, (_, i) => String(89101 + i).padStart(5, '0')),
      // Memphis
      ...Array.from({ length: 50 }, (_, i) => String(38101 + i).padStart(5, '0')),
      // Louisville
      ...Array.from({ length: 50 }, (_, i) => String(40201 + i).padStart(5, '0')),
      // Baltimore
      ...Array.from({ length: 100 }, (_, i) => String(21201 + i).padStart(5, '0')),
      // Milwaukee
      ...Array.from({ length: 50 }, (_, i) => String(53201 + i).padStart(5, '0')),
      // Albuquerque
      ...Array.from({ length: 50 }, (_, i) => String(87101 + i).padStart(5, '0')),
      // Tucson
      ...Array.from({ length: 50 }, (_, i) => String(85701 + i).padStart(5, '0')),
      // Fresno
      ...Array.from({ length: 50 }, (_, i) => String(93701 + i).padStart(5, '0')),
      // Sacramento
      ...Array.from({ length: 50 }, (_, i) => String(95814 + i).padStart(5, '0')),
      // Kansas City
      ...Array.from({ length: 50 }, (_, i) => String(64101 + i).padStart(5, '0')),
      // Mesa
      ...Array.from({ length: 50 }, (_, i) => String(85201 + i).padStart(5, '0')),
      // Atlanta
      ...Array.from({ length: 100 }, (_, i) => String(30301 + i).padStart(5, '0')),
      // Omaha
      ...Array.from({ length: 50 }, (_, i) => String(68101 + i).padStart(5, '0')),
      // Raleigh
      ...Array.from({ length: 50 }, (_, i) => String(27601 + i).padStart(5, '0')),
      // Miami
      ...Array.from({ length: 100 }, (_, i) => String(33101 + i).padStart(5, '0')),
      // Long Beach
      ...Array.from({ length: 50 }, (_, i) => String(90801 + i).padStart(5, '0')),
      // Virginia Beach
      ...Array.from({ length: 50 }, (_, i) => String(23451 + i).padStart(5, '0')),
      // Oakland
      ...Array.from({ length: 50 }, (_, i) => String(94601 + i).padStart(5, '0')),
      // Minneapolis
      ...Array.from({ length: 50 }, (_, i) => String(55401 + i).padStart(5, '0')),
      // Tulsa
      ...Array.from({ length: 50 }, (_, i) => String(74101 + i).padStart(5, '0')),
      // Tampa
      ...Array.from({ length: 50 }, (_, i) => String(33601 + i).padStart(5, '0')),
      // Arlington
      ...Array.from({ length: 50 }, (_, i) => String(76001 + i).padStart(5, '0')),
      // New Orleans
      ...Array.from({ length: 50 }, (_, i) => String(70112 + i).padStart(5, '0')),
      // Wichita
      ...Array.from({ length: 50 }, (_, i) => String(67201 + i).padStart(5, '0')),
      // Cleveland
      ...Array.from({ length: 100 }, (_, i) => String(44101 + i).padStart(5, '0')),
    ];
    // Remove duplicates and limit to 5000
    return [...new Set(majorMetros)].slice(0, 5000);
  })(),
};

interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
}

interface CampaignData {
  url: string;
  campaignName: string;
  intent: IntentResult | null;
  vertical: string | null;
  cta: string | null;
  selectedStructure: string | null;
  structureRankings: { id: string; score: number }[];
  seedKeywords: string[];
  negativeKeywords: string[];
  generatedKeywords: any[];
  selectedKeywords: any[];
  keywordTypes: { [key: string]: boolean };
  ads: any[];
  adTypes: string[];
  extensions: any[];
  adGroups: AdGroup[];
  selectedAdGroup: string | null;
  targetCountry: string;
  locations: {
    countries: string[];
    states: string[];
    cities: string[];
    zipCodes: string[];
  };
  csvData: any;
  csvErrors: any[];
}

interface CampaignBuilder3Props {
  initialData?: any;
}

export const CampaignBuilder3: React.FC<CampaignBuilder3Props> = ({ initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignSaved, setCampaignSaved] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState({ countries: '', states: '', cities: '', zipCodes: '' });
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [adGenerationKeyword, setAdGenerationKeyword] = useState('');
  const [campaignData, setCampaignData] = useState<CampaignData>({
    url: '',
    campaignName: '',
    intent: null,
    vertical: null,
    cta: null,
    selectedStructure: null,
    structureRankings: [],
    seedKeywords: ['plumber number', 'contact plumber', 'plumbing near me', '24/7 plumber'],
    negativeKeywords: [...DEFAULT_NEGATIVE_KEYWORDS], // Initialize with default negative keywords
    generatedKeywords: [],
    selectedKeywords: [],
    keywordTypes: { broad: true, phrase: true, exact: true, negative: true }, // Show negative keywords by default
    ads: [],
    adTypes: ['rsa', 'dki'],
    extensions: [],
    adGroups: [],
    selectedAdGroup: 'ALL_AD_GROUPS',
    targetCountry: 'United States',
    locations: { countries: [], states: [], cities: [], zipCodes: [] },
    csvData: null,
    csvErrors: [],
  });

  // Handle initial data from Keyword Planner
  useEffect(() => {
    if (initialData && initialData.selectedKeywords && initialData.selectedKeywords.length > 0) {
      // Process keywords from Keyword Planner
      const keywords = initialData.selectedKeywords.map((kw: string) => {
        // Clean keyword text (remove match type formatting for storage)
        let cleanKw = kw.trim();
        if (cleanKw.startsWith('[') && cleanKw.endsWith(']')) {
          cleanKw = cleanKw.slice(1, -1);
        } else if (cleanKw.startsWith('"') && cleanKw.endsWith('"')) {
          cleanKw = cleanKw.slice(1, -1);
        }
        return {
          text: cleanKw,
          formatted: kw, // Keep original format
          matchType: kw.startsWith('[') ? 'exact' : kw.startsWith('"') ? 'phrase' : 'broad'
        };
      });

      // Extract seed keywords from the first few keywords if not provided
      const seedKws = initialData.seedKeywords 
        ? (typeof initialData.seedKeywords === 'string' 
            ? initialData.seedKeywords.split(',').map((s: string) => s.trim()).filter(Boolean)
            : initialData.seedKeywords)
        : keywords.slice(0, 5).map((k: any) => k.text);

      setCampaignData(prev => ({
        ...prev,
        selectedKeywords: keywords,
        generatedKeywords: keywords,
        seedKeywords: seedKws,
        negativeKeywords: initialData.negativeKeywords 
          ? (typeof initialData.negativeKeywords === 'string' 
              ? initialData.negativeKeywords.split('\n').map((s: string) => s.trim()).filter(Boolean)
              : initialData.negativeKeywords)
          : prev.negativeKeywords,
        // Set a default URL if not provided (required for campaign)
        url: prev.url || 'https://example.com',
        // Generate campaign name from seed keywords if not set
        campaignName: prev.campaignName || (seedKws.length > 0 
          ? `${seedKws[0].replace(/[^a-z0-9]/gi, ' ').trim()} Campaign`
          : 'Campaign')
      }));

      // Skip to step 3 (Ads Generation) since keywords are already provided
      setCurrentStep(3);
      
      notifications.success('Keywords loaded from Keyword Planner', {
        title: 'Keywords Ready',
        description: `${keywords.length} keywords loaded. Proceeding to ads generation.`
      });
    }
  }, [initialData]);

  // Generate default campaign name: Search-date-time
  useEffect(() => {
    if (!campaignData.campaignName && campaignData.url) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);
      setCampaignData(prev => ({
        ...prev,
        campaignName: `Search-${dateStr}-${timeStr}`
      }));
    }
  }, [campaignData.url]);

  // Auto-populate seed keywords when step 3 is reached if they're empty
  useEffect(() => {
    if (currentStep === 3 && campaignData.seedKeywords.length === 0) {
      setCampaignData(prev => ({
        ...prev,
        seedKeywords: ['plumber number', 'contact plumber', 'plumbing near me', '24/7 plumber']
      }));
    }
  }, [currentStep]);

  // Step 1: URL Input & AI Analysis
  const handleUrlSubmit = async () => {
    if (!campaignData.url || !campaignData.url.trim()) {
      notifications.error('Please enter a valid URL', { title: 'URL Required' });
      return;
    }

    setLoading(true);
    try {
      // Extract landing page content (may fail due to CSP - that's OK)
      let landingData: LandingPageExtractionResult;
      try {
        landingData = await extractLandingPageContent(campaignData.url || '');
      } catch (extractError: any) {
        // If extraction fails (e.g., CSP violation), use fallback
        console.warn('Landing page extraction failed, using fallback:', extractError);
        const extractDomain = (url: string): string => {
          if (!url || typeof url !== 'string') return 'example.com';
          try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
          } catch {
            return url.split('/')[0].replace(/^https?:\/\//, '').replace(/^www\./, '') || 'example.com';
          }
        };
        landingData = {
          domain: extractDomain(campaignData.url || 'example.com'),
          title: null,
          h1: null,
          metaDescription: null,
          services: [],
          phones: [],
          emails: [],
          hours: null,
          addresses: [],
          schemas: {},
          page_text_tokens: [],
          extractionMethod: 'fallback',
          extractedAt: new Date().toISOString(),
        };
      }
      
      // Detect intent, CTA, and vertical (with null checks)
      const intentResult = mapGoalToIntent(
        (landingData?.title || landingData?.h1 || '').trim(),
        landingData || {} as any,
        landingData?.phones?.[0] || ''
      );

      // Determine vertical from content
      const vertical = detectVertical(landingData);
      
      // Determine CTA
      const cta = detectCTA(landingData);

      // Generate seed keywords (3-4 keywords)
      const seedKeywords = await generateSeedKeywords(landingData, intentResult);

      setCampaignData(prev => ({
        ...prev,
        intent: intentResult,
        vertical,
        cta,
        seedKeywords,
      }));

      // Auto-select best campaign structures
      const rankings = rankCampaignStructures(intentResult, vertical);
      setCampaignData(prev => ({
        ...prev,
        structureRankings: rankings,
        selectedStructure: rankings[0]?.id || 'skag',
      }));

      notifications.success('URL analyzed successfully', {
        title: 'Analysis Complete',
        description: `Detected: ${intentResult.intentLabel} intent, ${vertical} vertical`
      });

      setCurrentStep(2);
    } catch (error) {
      console.error('URL analysis error:', error);
      notifications.error('Failed to analyze URL', {
        title: 'Analysis Error',
        description: 'Please check the URL and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Campaign Structure Selection
  const handleStructureSelect = (structureId: string) => {
    setCampaignData(prev => ({ ...prev, selectedStructure: structureId }));
  };

  const handleNextFromStructure = () => {
    if (!campaignData.selectedStructure) {
      notifications.error('Please select a campaign structure', { title: 'Structure Required' });
      return;
    }
    setCurrentStep(3);
  };

  // Step 3: Keywords Generation
  const handleGenerateKeywords = async () => {
    if (campaignData.seedKeywords.length === 0) {
      notifications.error('Please provide seed keywords', { title: 'Seed Keywords Required' });
      return;
    }

    setLoading(true);
    try {
      // Use local autocomplete-based keyword generator directly
      // This ensures we always use the new autocomplete patterns
      console.log('Using autocomplete-based keyword generator');
      console.log('Seed keywords:', campaignData.seedKeywords);
      console.log('Negative keywords:', campaignData.negativeKeywords);
      
      const seedKeywordsString = campaignData.seedKeywords.join('\n');
      const negativeKeywordsString = campaignData.negativeKeywords.join('\n');
      
      console.log('Calling generateKeywordsUtil with:', {
        seedKeywords: seedKeywordsString,
        negativeKeywords: negativeKeywordsString,
        maxKeywords: 710,
        minKeywords: 410
      });
      
      const localKeywords = generateKeywordsUtil({
        seedKeywords: seedKeywordsString,
        negativeKeywords: negativeKeywordsString,
          vertical: campaignData.vertical || 'default',
        intentResult: campaignData.intent,
        landingPageData: campaignData.landingPageData,
        maxKeywords: 710,
        minKeywords: 410,
      });

      console.log('Generated keywords from utility:', localKeywords.length, localKeywords.slice(0, 10));

      if (!localKeywords || localKeywords.length === 0) {
        throw new Error('Keyword generator returned no keywords. Please check your seed keywords.');
      }

      // If we got very few keywords, something went wrong - generate more variations
      if (localKeywords.length < 50) {
        console.warn('Keyword generator returned only', localKeywords.length, 'keywords. Generating additional variations...');
        
        // Generate additional variations manually
        const additionalKeywords: any[] = [];
        const seedList = campaignData.seedKeywords.filter(s => s.trim().length >= 2);
        const negativeList = campaignData.negativeKeywords.map(n => n.trim().toLowerCase()).filter(Boolean);
        
        seedList.forEach((seed, seedIdx) => {
          const cleanSeed = seed.trim().toLowerCase();
          if (negativeList.some(neg => cleanSeed.includes(neg))) return;
          
          // Generate many variations per seed
          const variations = [
            `${cleanSeed} near me`,
            `best ${cleanSeed}`,
            `top ${cleanSeed}`,
            `cheap ${cleanSeed}`,
            `24/7 ${cleanSeed}`,
            `emergency ${cleanSeed}`,
            `${cleanSeed} cost`,
            `${cleanSeed} price`,
            `${cleanSeed} services`,
            `${cleanSeed} company`,
            `professional ${cleanSeed}`,
            `licensed ${cleanSeed}`,
            `same day ${cleanSeed}`,
            `${cleanSeed} repair`,
            `${cleanSeed} replacement`,
            `how to ${cleanSeed}`,
            `what is ${cleanSeed}`,
            `where to ${cleanSeed}`,
            `best ${cleanSeed} near me`,
            `top ${cleanSeed} near me`,
            `24/7 ${cleanSeed} near me`,
            `emergency ${cleanSeed} near me`,
            `${cleanSeed} services near me`,
            `${cleanSeed} cost near me`,
            `${cleanSeed} price near me`,
            `best ${cleanSeed} cost`,
            `top ${cleanSeed} services`,
            `same day ${cleanSeed} repair`,
            `${cleanSeed} repair cost`,
            `${cleanSeed} replacement cost`,
          ];
          
          variations.forEach((variation, varIdx) => {
            if (additionalKeywords.length >= 500) return;
            if (negativeList.some(neg => variation.includes(neg))) return;
            if (localKeywords.some(k => k.text.toLowerCase() === variation.toLowerCase())) return;
            if (additionalKeywords.some(k => k.text.toLowerCase() === variation.toLowerCase())) return;
            
            additionalKeywords.push({
              id: `kw-manual-${seedIdx}-${varIdx}`,
              text: variation,
              volume: 'Medium',
              cpc: '$2.50',
              type: 'Generated',
              matchType: 'BROAD'
            });
          });
        });
        
        console.log('Generated', additionalKeywords.length, 'additional keyword variations');
        localKeywords.push(...additionalKeywords);
      }

      const generated = localKeywords.map((kw, index) => ({
          id: kw.id || `kw-${Date.now()}-${index}`,
          text: kw.text,
          keyword: kw.text,
        matchType: (kw.matchType || 'BROAD').toLowerCase(),
          volume: kw.volume || 'Medium',
          cpc: kw.cpc || '$2.50',
          type: kw.type || 'Generated',
        }));

      console.log('Mapped keywords:', generated.length);

      // Generate 410-710 keywords (random range as specified)
      const targetCount = Math.floor(Math.random() * 300) + 410;
      const finalKeywords = generated.slice(0, Math.min(generated.length, targetCount));
      
      console.log('Final keywords before filtering:', finalKeywords.length);

      // Filter out keywords that match negative keywords
      const negativeList = campaignData.negativeKeywords.map(n => n.trim().toLowerCase()).filter(Boolean);
      console.log('Negative keywords list:', negativeList);
      
      const filteredByNegatives = finalKeywords.filter((kw: any) => {
        const keywordText = (kw.text || kw.keyword || '').toLowerCase();
        const shouldExclude = negativeList.some(neg => keywordText.includes(neg));
        return !shouldExclude;
      });
      
      console.log('Keywords after negative filtering:', filteredByNegatives.length);

      // Apply match types based on selected keyword types
      const formattedKeywords: any[] = [];
      filteredByNegatives.forEach((kw: any) => {
        // Extract base text (remove match type formatting if present)
        let baseText = kw.text || kw.keyword || '';
        baseText = baseText.replace(/^["\[\]]|["\[\]]$/g, '').trim();
        
        // Skip if base text contains negative keywords
        const baseTextLower = baseText.toLowerCase();
        if (negativeList.some(neg => baseTextLower.includes(neg))) {
          return; // Skip this keyword
        }
        
        if (campaignData.keywordTypes.broad) {
          formattedKeywords.push({
            ...kw,
            id: `${kw.id}-broad`,
            text: baseText,
            keyword: baseText,
            matchType: 'broad',
          });
        }
        
        if (campaignData.keywordTypes.phrase) {
          formattedKeywords.push({
            ...kw,
            id: `${kw.id}-phrase`,
            text: `"${baseText}"`,
            keyword: `"${baseText}"`,
            matchType: 'phrase',
          });
        }
        
        if (campaignData.keywordTypes.exact) {
          formattedKeywords.push({
            ...kw,
            id: `${kw.id}-exact`,
            text: `[${baseText}]`,
            keyword: `[${baseText}]`,
            matchType: 'exact',
          });
        }
      });

      // Shuffle for variety
      const shuffled = [...formattedKeywords].sort(() => Math.random() - 0.5);
      
      console.log('Final formatted keywords count:', shuffled.length);
      console.log('Sample keywords:', shuffled.slice(0, 10).map(k => k.text));

      if (shuffled.length === 0) {
        throw new Error('No keywords were generated after formatting. Please check your seed keywords and match type selections.');
      }

      // Generate ad groups based on campaign structure
      const adGroups = generateAdGroupsFromKeywords(shuffled, campaignData.selectedStructure || 'skag');

      setCampaignData(prev => ({
        ...prev,
        generatedKeywords: shuffled,
        selectedKeywords: shuffled, // Auto-select all by default
        adGroups: adGroups,
      }));
      
      // Auto-save draft
      await autoSaveDraft();

      notifications.success(`Generated ${shuffled.length} keywords`, {
        title: 'Keywords Generated',
        description: `Successfully generated ${shuffled.length} keywords using autocomplete patterns`
      });
    } catch (error) {
      console.error('Keyword generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Fallback: Use seed keywords as manual keywords
      if (campaignData.seedKeywords.length > 0) {
        const seedKeywordsAsKeywords = createKeywordsFromSeeds(campaignData.seedKeywords);
        
        setCampaignData(prev => ({
          ...prev,
          generatedKeywords: seedKeywordsAsKeywords,
          selectedKeywords: seedKeywordsAsKeywords,
        }));

        notifications.warning('Using seed keywords as manual keywords', {
          title: 'Generation Failed',
          description: `Keyword generation failed. Using ${seedKeywordsAsKeywords.length} seed keywords instead. You can proceed to the next step.`
        });
      } else {
        notifications.error('Failed to generate keywords', {
          title: 'Generation Error',
          description: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create keywords from seed keywords
  const createKeywordsFromSeeds = (seeds: string[]): any[] => {
    const keywords: any[] = [];
    const timestamp = Date.now();

    seeds.forEach((seed, seedIndex) => {
      const baseText = seed.trim();
      if (!baseText || baseText.length < 3) return;

      // Apply match types based on selected keyword types
      if (campaignData.keywordTypes.broad) {
        keywords.push({
          id: `seed-${timestamp}-${seedIndex}-broad`,
          text: baseText,
          keyword: baseText,
          matchType: 'broad',
          volume: 'Medium',
          cpc: '$2.50',
          type: 'Seed Keyword',
        });
      }
      
      if (campaignData.keywordTypes.phrase) {
        keywords.push({
          id: `seed-${timestamp}-${seedIndex}-phrase`,
          text: `"${baseText}"`,
          keyword: `"${baseText}"`,
          matchType: 'phrase',
          volume: 'Medium',
          cpc: '$2.50',
          type: 'Seed Keyword',
        });
      }
      
      if (campaignData.keywordTypes.exact) {
        keywords.push({
          id: `seed-${timestamp}-${seedIndex}-exact`,
          text: `[${baseText}]`,
          keyword: `[${baseText}]`,
          matchType: 'exact',
          volume: 'Medium',
          cpc: '$2.50',
          type: 'Seed Keyword',
        });
      }
    });

    return keywords;
  };

  const handleKeywordTypeToggle = (type: string) => {
    setCampaignData(prev => ({
      ...prev,
      keywordTypes: {
        ...prev.keywordTypes,
        [type]: !prev.keywordTypes[type],
      }
    }));
  };

  // Filter keywords based on selected types and negative keywords
  const negativeList = campaignData.negativeKeywords.map(n => n.trim().toLowerCase()).filter(Boolean);
  const filteredKeywords = campaignData.generatedKeywords.filter(kw => {
    // Filter by match type
    if (kw.matchType === 'broad' && !campaignData.keywordTypes.broad) return false;
    if (kw.matchType === 'phrase' && !campaignData.keywordTypes.phrase) return false;
    if (kw.matchType === 'exact' && !campaignData.keywordTypes.exact) return false;
    if (kw.isNegative && !campaignData.keywordTypes.negative) return false;
    
    // Filter out keywords containing negative keywords
    const keywordText = (kw.text || kw.keyword || '').toLowerCase();
    if (negativeList.some(neg => keywordText.includes(neg))) return false;
    
    return true;
  });

  // Auto-fill functions for each step
  const handleAutoFillStep1 = () => {
    const randomUrl = generateURL();
    const randomName = generateCampaignName();
    setCampaignData(prev => ({
      ...prev,
      url: randomUrl,
      campaignName: randomName,
    }));
    notifications.success('Step 1 auto-filled', { title: 'Auto Fill Complete' });
  };

  const handleAutoFillStep2 = () => {
    const randomStructure = CAMPAIGN_STRUCTURES[Math.floor(Math.random() * CAMPAIGN_STRUCTURES.length)];
    setCampaignData(prev => ({
      ...prev,
      selectedStructure: randomStructure.id,
    }));
    notifications.success('Step 2 auto-filled', { title: 'Auto Fill Complete' });
  };

  const handleAutoFillStep3 = () => {
    // Use default plumber keywords
    const seedKeywords = ['plumber number', 'contact plumber', 'plumbing near me', '24/7 plumber'];
    const negativeKeywords = generateNegativeKeywords().split('\n').filter(k => k.trim());
    setCampaignData(prev => ({
      ...prev,
      seedKeywords: seedKeywords,
      negativeKeywords: [...DEFAULT_NEGATIVE_KEYWORDS, ...negativeKeywords],
    }));
    notifications.success('Step 3 auto-filled', { title: 'Auto Fill Complete' });
  };

  // Fill Info button handler - adds 3-4 keywords each time
  const handleFillInfoKeywords = () => {
    // Pool of diverse keywords to choose from
    const keywordPool = [
      'plumber near me', 'emergency plumbing', 'drain cleaning', 'water heater repair',
      'airline number', 'contact airline', 'delta phone', 'united customer service',
      'electrician', 'hvac repair', 'roofing services', 'landscaping',
      'locksmith', 'appliance repair', 'handyman', 'carpet cleaning',
      'pest control', 'tree service', 'window cleaning', 'moving company',
      'auto repair', 'dentist', 'lawyer', 'accountant',
      'web design', 'seo services', 'marketing agency', 'it support'
    ];
    
    // Randomly select 3-4 keywords
    const count = Math.floor(Math.random() * 2) + 3; // 3 or 4
    const shuffled = [...keywordPool].sort(() => 0.5 - Math.random());
    const newKeywords = shuffled.slice(0, count);
    
    // Add to existing keywords (avoid duplicates)
    setCampaignData(prev => {
      const existing = prev.seedKeywords || [];
      const combined = [...existing, ...newKeywords];
      // Remove duplicates
      const unique = Array.from(new Set(combined.map(k => k.toLowerCase().trim())))
        .map(lower => {
          // Find original case from combined array
          return combined.find(k => k.toLowerCase().trim() === lower) || lower;
        });
      
      return {
        ...prev,
        seedKeywords: unique
      };
    });
    
    notifications.success(`Added ${count} keywords`, {
      title: 'Keywords Added',
      description: `Added: ${newKeywords.join(', ')}`
    });
  };

  const handleAutoFillStep5 = () => {
    const randomCountry = LOCATION_PRESETS.countries[Math.floor(Math.random() * LOCATION_PRESETS.countries.length)];
    const randomCities = LOCATION_PRESETS.cities.slice(0, Math.floor(Math.random() * 20) + 5);
    const randomZips = LOCATION_PRESETS.zipCodes.slice(0, Math.floor(Math.random() * 50) + 10);
    
    setCampaignData(prev => ({
      ...prev,
      targetCountry: randomCountry,
      locations: {
        ...prev.locations,
        cities: randomCities,
        zipCodes: randomZips,
      },
    }));
    notifications.success('Step 5 auto-filled', { title: 'Auto Fill Complete' });
  };

  // Auto-save draft functionality
  const autoSaveDraft = async () => {
    try {
      if (campaignData.campaignName || campaignData.url) {
        await historyService.save('campaign', campaignData.campaignName || 'Draft Campaign', {
          name: campaignData.campaignName || 'Draft Campaign',
          url: campaignData.url,
          structure: campaignData.selectedStructure || 'skag',
          keywords: campaignData.selectedKeywords,
          ads: campaignData.ads,
          locations: campaignData.locations,
          intent: campaignData.intent,
          vertical: campaignData.vertical,
          cta: campaignData.cta,
          negativeKeywords: campaignData.negativeKeywords,
          adGroups: campaignData.adGroups,
          createdAt: new Date().toISOString(),
        }, 'draft');
      }
    } catch (error) {
      // Only log unexpected errors - "Item not found" is now handled gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Item not found') && !errorMessage.includes('not found')) {
        console.error('Auto-save failed:', error);
      }
      // Don't show error to user for auto-save failures
    }
  };

  // Generate ad groups based on campaign structure
  const generateAdGroupsFromKeywords = (keywords: any[], structureType: string): AdGroup[] => {
    const groups: AdGroup[] = [];
    
    if (structureType === 'skag') {
      // SKAG: One ad group per keyword (limit to 20)
      keywords.slice(0, 20).forEach((kw, idx) => {
        const baseText = (kw.text || kw.keyword || '').replace(/^["\[\]]|["\[\]]$/g, '').trim();
        groups.push({
          id: `ag-${idx + 1}`,
          name: baseText.substring(0, 50) || `Ad Group ${idx + 1}`,
          keywords: [baseText],
        });
      });
    } else if (structureType === 'stag') {
      // STAG: Group by theme (first word)
      const themeGroups: { [key: string]: string[] } = {};
      keywords.forEach(kw => {
        const baseText = (kw.text || kw.keyword || '').replace(/^["\[\]]|["\[\]]$/g, '').trim();
        const firstWord = baseText.split(' ')[0]?.toLowerCase() || 'general';
        if (!themeGroups[firstWord]) {
          themeGroups[firstWord] = [];
        }
        if (!themeGroups[firstWord].includes(baseText)) {
          themeGroups[firstWord].push(baseText);
        }
      });
      
      Object.entries(themeGroups).slice(0, 10).forEach(([theme, kwList], idx) => {
        groups.push({
          id: `ag-${idx + 1}`,
          name: `Ad Group ${idx + 1} - ${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
          keywords: kwList.slice(0, 20),
        });
      });
    } else {
      // Default: Create 5-10 ad groups
      const groupSize = Math.ceil(keywords.length / 8);
      for (let i = 0; i < 8 && i * groupSize < keywords.length; i++) {
        const groupKeywords = keywords.slice(i * groupSize, (i + 1) * groupSize)
          .map(kw => (kw.text || kw.keyword || '').replace(/^["\[\]]|["\[\]]$/g, '').trim())
          .filter(Boolean);
        if (groupKeywords.length > 0) {
          groups.push({
            id: `ag-${i + 1}`,
            name: `Ad Group ${i + 1}`,
            keywords: groupKeywords,
          });
        }
      }
    }
    
    return groups;
  };

  // Step 4: Ads Generation - Generate 3 ads (RSA, DKI, Call)
  const handleGenerateAds = async () => {
    if (campaignData.selectedKeywords.length === 0) {
      notifications.error('Please select keywords first', { title: 'Keywords Required' });
      return;
    }

    setLoading(true);
    try {
      const keywordTexts = campaignData.selectedKeywords.map(k => k.text || k.keyword || k).slice(0, 10);
      const ads: any[] = [];

      // Extract business name from campaign name or URL
      let businessName = campaignData.campaignName || 'Your Business';
      if (businessName.length > 25) {
        businessName = businessName.split(' ')[0] || businessName.substring(0, 25);
      }
      
      // Extract domain name from URL for better business name
      if (campaignData.url) {
        try {
          const urlObj = new URL(campaignData.url.startsWith('http') ? campaignData.url : `https://${campaignData.url}`);
          const hostname = urlObj.hostname.replace('www.', '');
          const domainName = hostname.split('.')[0];
          if (domainName && domainName.length > 2 && domainName.length <= 25) {
            businessName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
          }
        } catch (e) {
          // If URL parsing fails, use campaign name
        }
      }
      
      // Determine industry from keywords if vertical is not set
      let industry = campaignData.vertical || 'general';
      if (industry === 'general' && keywordTexts.length > 0) {
        const firstKeyword = keywordTexts[0].toLowerCase();
        if (firstKeyword.includes('plumb') || firstKeyword.includes('plumber')) industry = 'plumbing';
        else if (firstKeyword.includes('electric') || firstKeyword.includes('electrician')) industry = 'electrical';
        else if (firstKeyword.includes('hvac') || firstKeyword.includes('heating') || firstKeyword.includes('cooling')) industry = 'hvac';
        else if (firstKeyword.includes('roof') || firstKeyword.includes('roofing')) industry = 'roofing';
        else if (firstKeyword.includes('airline') || firstKeyword.includes('flight')) industry = 'travel';
        else if (firstKeyword.includes('lawyer') || firstKeyword.includes('legal')) industry = 'legal';
        else if (firstKeyword.includes('dentist') || firstKeyword.includes('dental')) industry = 'dental';
        else if (firstKeyword.includes('doctor') || firstKeyword.includes('medical')) industry = 'medical';
        else if (firstKeyword.includes('restaurant') || firstKeyword.includes('food')) industry = 'food';
        else if (firstKeyword.includes('hotel') || firstKeyword.includes('travel')) industry = 'travel';
        else {
          industry = firstKeyword.split(' ')[0] || 'general';
        }
      }

      // Always generate 3 ads: RSA, DKI, and Call
      const adTypesToGenerate = ['rsa', 'dki', 'call'];
      
      for (const adType of adTypesToGenerate) {
        try {
          const adInput: AdGenerationInput = {
            keywords: keywordTexts,
            baseUrl: campaignData.url || undefined,
            adType: adType === 'rsa' ? 'RSA' : adType === 'dki' ? 'ETA' : 'CALL_ONLY',
            industry: industry,
            businessName: businessName,
            location: campaignData.locations?.cities?.[0] || campaignData.locations?.states?.[0] || undefined,
            filters: {
              matchType: campaignData.keywordTypes.phrase ? 'phrase' : campaignData.keywordTypes.exact ? 'exact' : 'broad',
              campaignStructure: (campaignData.selectedStructure?.toUpperCase() || 'SKAG') as 'SKAG' | 'STAG' | 'IBAG' | 'Alpha-Beta',
              uniqueSellingPoints: [],
              callToAction: campaignData.cta || undefined,
            },
          };

          const ad = generateAdsUtility(adInput);
          
          // Convert to our ad format
          if (adType === 'rsa' && 'headlines' in ad) {
            const rsa = ad as ResponsiveSearchAd;
            ads.push({
              id: `ad-${Date.now()}-${Math.random()}`,
              type: 'rsa',
              adType: 'RSA',
              headlines: rsa.headlines || [],
              descriptions: rsa.descriptions || [],
              displayPath: rsa.displayPath || [],
              finalUrl: rsa.finalUrl || campaignData.url || '',
              selected: false,
              extensions: [],
            });
          } else if (adType === 'dki' && 'headline1' in ad) {
            const dki = ad as ExpandedTextAd;
            ads.push({
              id: `ad-${Date.now()}-${Math.random()}`,
              type: 'dki',
              adType: 'DKI',
              headline1: dki.headline1 || '',
              headline2: dki.headline2 || '',
              headline3: dki.headline3 || '',
              description1: dki.description1 || '',
              description2: dki.description2 || '',
              displayPath: dki.displayPath || [],
              finalUrl: dki.finalUrl || campaignData.url || '',
              selected: false,
              extensions: [],
            });
          } else if (adType === 'call' && 'phoneNumber' in ad) {
            const call = ad as CallOnlyAd;
            ads.push({
              id: `ad-${Date.now()}-${Math.random()}`,
              type: 'call',
              adType: 'CallOnly',
              headline1: call.headline1 || '',
              headline2: call.headline2 || '',
              description1: call.description1 || '',
              description2: call.description2 || '',
              phoneNumber: call.phoneNumber || '',
              businessName: call.businessName || businessName,
              finalUrl: call.verificationUrl || campaignData.url || '',
              selected: false,
              extensions: [],
            });
          }
        } catch (adError) {
          console.error(`Error generating ${adType} ad:`, adError);
          // Continue with other ad types
        }
      }
      
      setCampaignData(prev => ({
        ...prev,
        ads: ads,
        adTypes: adTypesToGenerate, // Update ad types to match generated ads
      }));
      // Mark that ads have been auto-generated
      setHasAutoGeneratedAds(true);

      notifications.success(`Generated ${ads.length} ads successfully`, {
        title: 'Ads Generated',
        description: 'RSA, DKI, and Call ads have been created for all ad groups.'
      });
      
      // Auto-save draft
      await autoSaveDraft();
    } catch (error) {
      console.error('Ad generation error:', error);
      notifications.error('Failed to generate ads', {
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a single ad of specified type (only if under 3 ads total)
  const handleAddNewAd = async (adType: 'rsa' | 'dki' | 'call') => {
    // Check if we already have 3 ads
    if (campaignData.ads.length >= 3) {
      notifications.warning('Maximum 3 ads allowed per ad group', {
        title: 'Limit Reached',
        description: 'You can only have 3 ads. Please delete an existing ad to add a new one.'
      });
      return;
    }

    // Check if this ad type already exists
    const existingAdType = campaignData.ads.find(ad => 
      (ad.type === adType) || 
      (adType === 'rsa' && ad.adType === 'RSA') ||
      (adType === 'dki' && ad.adType === 'DKI') ||
      (adType === 'call' && (ad.adType === 'CallOnly' || ad.type === 'call'))
    );

    if (existingAdType) {
      notifications.info(`A ${adType.toUpperCase()} ad already exists. Maximum 3 ads allowed.`, {
        title: 'Ad Type Exists'
      });
      return;
    }

    if (campaignData.selectedKeywords.length === 0) {
      notifications.error('Please select keywords first', { title: 'Keywords Required' });
      return;
    }

    setLoading(true);
    try {
      const keywordTexts = campaignData.selectedKeywords.map(k => k.text || k.keyword || k).slice(0, 10);
      
      // Extract business name from campaign name or URL
      let businessName = campaignData.campaignName || 'Your Business';
      // If campaign name is too long, extract first meaningful part
      if (businessName.length > 25) {
        businessName = businessName.split(' ')[0] || businessName.substring(0, 25);
      }
      
      // Extract domain name from URL for better business name
      if (campaignData.url) {
        try {
          const urlObj = new URL(campaignData.url.startsWith('http') ? campaignData.url : `https://${campaignData.url}`);
          const hostname = urlObj.hostname.replace('www.', '');
          const domainName = hostname.split('.')[0];
          if (domainName && domainName.length > 2 && domainName.length <= 25) {
            // Capitalize first letter
            businessName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
          }
        } catch (e) {
          // If URL parsing fails, use campaign name
        }
      }
      
      // Determine industry from keywords if vertical is not set
      let industry = campaignData.vertical || 'general';
      if (industry === 'general' && keywordTexts.length > 0) {
        // Try to extract industry from keywords
        const firstKeyword = keywordTexts[0].toLowerCase();
        if (firstKeyword.includes('plumb') || firstKeyword.includes('plumber')) industry = 'plumbing';
        else if (firstKeyword.includes('electric') || firstKeyword.includes('electrician')) industry = 'electrical';
        else if (firstKeyword.includes('hvac') || firstKeyword.includes('heating') || firstKeyword.includes('cooling')) industry = 'hvac';
        else if (firstKeyword.includes('roof') || firstKeyword.includes('roofing')) industry = 'roofing';
        else if (firstKeyword.includes('airline') || firstKeyword.includes('flight')) industry = 'travel';
        else if (firstKeyword.includes('lawyer') || firstKeyword.includes('legal')) industry = 'legal';
        else if (firstKeyword.includes('dentist') || firstKeyword.includes('dental')) industry = 'dental';
        else if (firstKeyword.includes('doctor') || firstKeyword.includes('medical')) industry = 'medical';
        else if (firstKeyword.includes('restaurant') || firstKeyword.includes('food')) industry = 'food';
        else if (firstKeyword.includes('hotel') || firstKeyword.includes('travel')) industry = 'travel';
        else {
          // Use first keyword as industry hint
          industry = firstKeyword.split(' ')[0] || 'general';
        }
      }
      
      const adInput: AdGenerationInput = {
        keywords: keywordTexts,
        baseUrl: campaignData.url || undefined, // Always use campaign URL
        adType: adType === 'rsa' ? 'RSA' : adType === 'dki' ? 'ETA' : 'CALL_ONLY',
        industry: industry,
        businessName: businessName,
        location: campaignData.locations?.cities?.[0] || campaignData.locations?.states?.[0] || undefined,
        filters: {
          matchType: campaignData.keywordTypes.phrase ? 'phrase' : campaignData.keywordTypes.exact ? 'exact' : 'broad',
          campaignStructure: (campaignData.selectedStructure?.toUpperCase() || 'STAG') as 'SKAG' | 'STAG' | 'IBAG' | 'Alpha-Beta',
          uniqueSellingPoints: [],
          callToAction: campaignData.cta || undefined,
        },
      };

      const ad = generateAdsUtility(adInput);
      
      // Convert to our ad format
      let newAd: any = null;
      
      if (adType === 'rsa' && 'headlines' in ad) {
        const rsa = ad as ResponsiveSearchAd;
        newAd = {
          id: `ad-${Date.now()}-${Math.random()}`,
          type: 'rsa',
          adType: 'RSA',
          headlines: rsa.headlines || [],
          descriptions: rsa.descriptions || [],
          displayPath: rsa.displayPath || [],
          finalUrl: rsa.finalUrl || campaignData.url || '',
          selected: false,
          extensions: [],
        };
      } else if (adType === 'dki' && 'headline1' in ad) {
        const dki = ad as ExpandedTextAd;
        newAd = {
          id: `ad-${Date.now()}-${Math.random()}`,
          type: 'dki',
          adType: 'DKI',
          headline1: dki.headline1 || '',
          headline2: dki.headline2 || '',
          headline3: dki.headline3 || '',
          description1: dki.description1 || '',
          description2: dki.description2 || '',
          displayPath: dki.displayPath || [],
          finalUrl: dki.finalUrl || campaignData.url,
          selected: false,
          extensions: [],
        };
      } else if (adType === 'call' && 'phoneNumber' in ad) {
        const call = ad as CallOnlyAd;
        newAd = {
          id: `ad-${Date.now()}-${Math.random()}`,
          type: 'call',
          adType: 'CallOnly',
          headline1: call.headline1 || '',
          headline2: call.headline2 || '',
          description1: call.description1 || '',
          description2: call.description2 || '',
          phoneNumber: call.phoneNumber || '',
          businessName: call.businessName || businessName,
          finalUrl: call.verificationUrl || campaignData.url || '',
          selected: false,
          extensions: [],
        };
      }

      if (newAd) {
        setCampaignData(prev => ({
            ...prev,
          ads: [...prev.ads, newAd],
        }));

        notifications.success(`${adType.toUpperCase()} ad added successfully`, {
          title: 'Ad Added',
          description: `${campaignData.ads.length + 1} / 3 ads created`
        });
        
        // Auto-save draft
        await autoSaveDraft();
      } else {
        throw new Error(`Failed to generate ${adType} ad`);
      }
    } catch (error) {
      console.error(`Error generating ${adType} ad:`, error);
      notifications.error(`Failed to generate ${adType.toUpperCase()} ad`, {
        title: 'Generation Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAd = (adId: string) => {
    // Toggle edit mode - if already editing this ad, cancel edit
    if (editingAdId === adId) {
      setEditingAdId(null);
    } else {
      setEditingAdId(adId);
    }
  };

  const updateAdField = (adId: string, field: string, value: any) => {
    // Apply Google Ads character limits
    let processedValue = value;
    if (field.startsWith('headline')) {
      // Headlines: max 30 characters
      if (typeof value === 'string' && value.length > 30) {
        processedValue = value.substring(0, 30);
        notifications.warning(`Headline truncated to 30 characters (Google Ads limit)`, {
          title: 'Character Limit',
          description: 'Headlines must be 30 characters or less.',
          duration: 3000
        });
      }
    } else if (field.startsWith('description')) {
      // Descriptions: max 90 characters
      if (typeof value === 'string' && value.length > 90) {
        processedValue = value.substring(0, 90);
        notifications.warning(`Description truncated to 90 characters (Google Ads limit)`, {
          title: 'Character Limit',
          description: 'Descriptions must be 90 characters or less.',
          duration: 3000
        });
      }
    } else if (field === 'path1' || field === 'path2' || (field === 'displayPath' && Array.isArray(value))) {
      // Paths: max 15 characters
      if (field === 'displayPath' && Array.isArray(value)) {
        processedValue = value.map((path: string) => 
          typeof path === 'string' && path.length > 15 ? path.substring(0, 15) : path
        );
      } else if (typeof value === 'string' && value.length > 15) {
        processedValue = value.substring(0, 15);
        notifications.warning(`Path truncated to 15 characters (Google Ads limit)`, {
          title: 'Character Limit',
          description: 'Display URL paths must be 15 characters or less.',
          duration: 3000
        });
      }
    } else if (field === 'headlines' && Array.isArray(value)) {
      // RSA headlines array: each headline max 30 characters
      processedValue = value.map((h: string) => 
        typeof h === 'string' && h.length > 30 ? h.substring(0, 30) : h
      );
    } else if (field === 'descriptions' && Array.isArray(value)) {
      // RSA descriptions array: each description max 90 characters
      processedValue = value.map((d: string) => 
        typeof d === 'string' && d.length > 90 ? d.substring(0, 90) : d
      );
    }
    
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.map(ad => 
        ad.id === adId ? { ...ad, [field]: processedValue } : ad
      )
    }));
  };

  const handleSaveAd = (adId: string) => {
    const ad = campaignData.ads.find(a => a.id === adId);
    if (!ad) {
      notifications.error('Ad not found', {
        title: 'Error',
        description: 'The ad you are trying to save could not be found.',
      });
      return;
    }

    // Validate required fields and Google Ads character limits
    const errors: string[] = [];
    
    if (ad.type === 'rsa' || ad.adType === 'RSA') {
      // RSA validation
      if (ad.headlines && Array.isArray(ad.headlines)) {
        ad.headlines.forEach((headline, idx) => {
          if (headline && headline.length > 30) {
            errors.push(`Headline ${idx + 1} exceeds 30 characters (${headline.length}/30)`);
          }
        });
      }
      if (ad.descriptions && Array.isArray(ad.descriptions)) {
        ad.descriptions.forEach((desc, idx) => {
          if (desc && desc.length > 90) {
            errors.push(`Description ${idx + 1} exceeds 90 characters (${desc.length}/90)`);
          }
        });
      }
    } else if (ad.type === 'dki' || ad.adType === 'DKI') {
      // DKI validation
      if (!ad.headline1 || ad.headline1.trim() === '') {
        errors.push('Headline 1 is required');
      } else if (ad.headline1.length > 30) {
        errors.push(`Headline 1 exceeds 30 characters (${ad.headline1.length}/30)`);
      }
      if (!ad.headline2 || ad.headline2.trim() === '') {
        errors.push('Headline 2 is required');
      } else if (ad.headline2.length > 30) {
        errors.push(`Headline 2 exceeds 30 characters (${ad.headline2.length}/30)`);
      }
      if (ad.headline3 && ad.headline3.length > 30) {
        errors.push(`Headline 3 exceeds 30 characters (${ad.headline3.length}/30)`);
      }
      if (!ad.description1 || ad.description1.trim() === '') {
        errors.push('Description 1 is required');
      } else if (ad.description1.length > 90) {
        errors.push(`Description 1 exceeds 90 characters (${ad.description1.length}/90)`);
      }
      if (ad.description2 && ad.description2.length > 90) {
        errors.push(`Description 2 exceeds 90 characters (${ad.description2.length}/90)`);
      }
    } else if (ad.type === 'call' || ad.adType === 'CallOnly') {
      // Call-Only validation
      if (!ad.headline1 || ad.headline1.trim() === '') {
        errors.push('Headline 1 is required');
      } else if (ad.headline1.length > 30) {
        errors.push(`Headline 1 exceeds 30 characters (${ad.headline1.length}/30)`);
      }
      if (!ad.headline2 || ad.headline2.trim() === '') {
        errors.push('Headline 2 is required');
      } else if (ad.headline2.length > 30) {
        errors.push(`Headline 2 exceeds 30 characters (${ad.headline2.length}/30)`);
      }
      if (!ad.description1 || ad.description1.trim() === '') {
        errors.push('Description 1 is required');
      } else if (ad.description1.length > 90) {
        errors.push(`Description 1 exceeds 90 characters (${ad.description1.length}/90)`);
      }
      if (!ad.description2 || ad.description2.trim() === '') {
        errors.push('Description 2 is required');
      } else if (ad.description2.length > 90) {
        errors.push(`Description 2 exceeds 90 characters (${ad.description2.length}/90)`);
      }
      if (!ad.phoneNumber || ad.phoneNumber.trim() === '') {
        errors.push('Phone number is required');
      }
      if (!ad.businessName || ad.businessName.trim() === '') {
        errors.push('Business name is required');
      }
    }

    if (errors.length > 0) {
      notifications.error(`Please fix the following errors:\n\n${errors.join('\n')}`, {
        title: 'Validation Error',
        description: 'All fields must comply with Google Ads character limits.',
        priority: 'high',
      });
      return;
    }

    setEditingAdId(null);
    notifications.success('Changes saved successfully', {
      title: 'Ad Updated',
      description: 'Your ad changes have been saved.',
    });
  };

  const handleCancelEdit = () => {
    setEditingAdId(null);
  };

  const handleDuplicateAd = (adId: string) => {
    const adToDuplicate = campaignData.ads.find(ad => ad.id === adId);
    if (!adToDuplicate) {
      notifications.error('Ad not found', { title: 'Error' });
      return;
    }

    if (campaignData.ads.length >= 3) {
      notifications.warning('Maximum 3 ads allowed', { title: 'Limit Reached' });
      return;
    }

    const duplicatedAd = {
      ...adToDuplicate,
      id: `ad-${Date.now()}-${Math.random()}`,
      extensions: adToDuplicate.extensions ? [...adToDuplicate.extensions] : [],
    };

    setCampaignData(prev => ({
      ...prev,
      ads: [...prev.ads, duplicatedAd],
    }));

    notifications.success('Ad duplicated', { title: 'Duplicated' });
  };

  const handleDeleteAd = (adId: string) => {
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.filter(ad => ad.id !== adId),
    }));
    notifications.success('Ad deleted', { title: 'Deleted' });
  };

  const handleToggleAdSelection = (adId: string) => {
    setCampaignData(prev => ({
      ...prev,
      ads: prev.ads.map(ad => 
        ad.id === adId ? { ...ad, selected: !ad.selected } : ad
      ),
    }));
  };

  const handleAddExtension = (adId: string, extensionType: string) => {
    setCampaignData(prev => ({
        ...prev,
        ads: prev.ads.map(ad => {
          if (ad.id === adId) {
          const currentExtensions = Array.isArray(ad.extensions) ? ad.extensions : [];
          const extensionExists = currentExtensions.some(ext => ext.type === extensionType);
          if (extensionExists) {
            return ad; // Don't add duplicate
          }
          
          // Create extension with proper structure based on type
          const newExtension: any = {
            id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: extensionType,
            extensionType: extensionType,
            label: extensionType.charAt(0).toUpperCase() + extensionType.slice(1).replace(/([A-Z])/g, ' $1'),
          };
          
          // Add type-specific default values
          switch (extensionType) {
            case 'snippet':
              newExtension.header = 'Types';
              newExtension.values = ['Service 1', 'Service 2', 'Service 3'];
              newExtension.text = `Types: ${newExtension.values.join(', ')}`;
              break;
            case 'callout':
              newExtension.callouts = ['24/7 Support', 'Free Consultation', 'Expert Service'];
              newExtension.text = newExtension.callouts.join(', ');
              break;
            case 'sitelink':
              newExtension.sitelinks = [
                { text: 'Contact Us', description: 'Get in touch', url: campaignData.url || '' },
                { text: 'Services', description: 'Our services', url: campaignData.url || '' }
              ];
              newExtension.text = newExtension.sitelinks.map((sl: any) => sl.text).join(', ');
              break;
            case 'call':
              newExtension.phone = '(555) 123-4567';
              newExtension.phoneNumber = '(555) 123-4567';
              newExtension.countryCode = 'US';
              newExtension.text = newExtension.phone;
              break;
            case 'price':
              newExtension.priceQualifier = 'From';
              newExtension.price = '$99';
              newExtension.currency = 'USD';
              newExtension.unit = 'per service';
              newExtension.text = `${newExtension.priceQualifier} ${newExtension.price} ${newExtension.unit}`;
              break;
            default:
              newExtension.text = newExtension.label;
          }
        return {
            ...ad,
            extensions: [...currentExtensions, newExtension],
          };
        }
        return ad;
      }),
    }));
  };

  const handleRemoveExtension = (adId: string, extensionId: string) => {
    setCampaignData(prev => ({
        ...prev,
        ads: prev.ads.map(ad => {
          if (ad.id === adId) {
            return {
              ...ad,
            extensions: (ad.extensions || []).filter(ext => ext.id !== extensionId),
            };
          }
          return ad;
        }),
    }));
    notifications.success('Extension removed', { title: 'Removed' });
  };

  const handleAddExtensionToAllAds = (extensionType: string) => {
    if (campaignData.ads.length === 0) {
      notifications.warning('Please create at least one ad before adding extensions', {
        title: 'No Ads Found'
      });
      return;
    }

    setCampaignData(prev => {
      const updatedAds = prev.ads.map((ad, index) => {
        // Ensure extensions array exists
        const currentExtensions = Array.isArray(ad.extensions) ? ad.extensions : [];
        
        // Check if this extension type already exists for this ad
        const extensionExists = currentExtensions.some(ext => ext.type === extensionType);
        if (extensionExists) {
          // Extension already exists, don't add duplicate
          return ad;
        }
        
        // Create unique extension ID
        const extensionId = `ext-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create extension with proper structure based on type
        const newExtension: any = {
          id: extensionId,
          type: extensionType,
          extensionType: extensionType,
          label: extensionType.charAt(0).toUpperCase() + extensionType.slice(1).replace(/([A-Z])/g, ' $1'),
        };
        
        // Add type-specific default values
        switch (extensionType) {
          case 'snippet':
            newExtension.header = 'Types';
            newExtension.values = ['Service 1', 'Service 2', 'Service 3'];
            newExtension.text = `Types: ${newExtension.values.join(', ')}`;
            break;
          case 'callout':
            newExtension.callouts = ['24/7 Support', 'Free Consultation', 'Expert Service'];
            newExtension.text = newExtension.callouts.join(', ');
            break;
          case 'sitelink':
            newExtension.sitelinks = [
              { text: 'Contact Us', description: 'Get in touch', url: campaignData.url || '' },
              { text: 'Services', description: 'Our services', url: campaignData.url || '' }
            ];
            newExtension.text = newExtension.sitelinks.map((sl: any) => sl.text).join(', ');
            break;
          case 'call':
            newExtension.phone = '(555) 123-4567';
            newExtension.phoneNumber = '(555) 123-4567';
            newExtension.countryCode = 'US';
            newExtension.text = newExtension.phone;
            break;
          case 'price':
            newExtension.priceQualifier = 'From';
            newExtension.price = '$99';
            newExtension.currency = 'USD';
            newExtension.unit = 'per service';
            newExtension.text = `${newExtension.priceQualifier} ${newExtension.price} ${newExtension.unit}`;
            break;
          default:
            newExtension.text = newExtension.label;
        }
        
        return {
          ...ad,
          extensions: [...currentExtensions, newExtension],
        };
      });
      
        return {
        ...prev,
        ads: updatedAds,
      };
    });

    // Get extension label for notification
    const extensionLabel = extensionType.charAt(0).toUpperCase() + extensionType.slice(1).replace(/([A-Z])/g, ' $1');
    notifications.success(`Added ${extensionLabel} extension to all ${campaignData.ads.length} ad(s)`, {
      title: 'Extension Added'
    });
  };


  // Step 6: CSV Generation & Validation
  const handleGenerateCSV = async () => {
    setLoading(true);
    try {
      // Use new backend CSV export
      const adGroups = campaignData.adGroups || [];
      const locationTargeting = {
        locations: [
          ...(campaignData.locations.countries.map((c: string) => ({ type: 'COUNTRY', code: c }))),
          ...(campaignData.locations.states.map((s: string) => ({ type: 'STATE', code: s }))),
          ...(campaignData.locations.cities.map((c: string) => ({ type: 'CITY', code: c }))),
          ...(campaignData.locations.zipCodes.map((z: string) => ({ type: 'ZIP', code: z })))
        ].filter(loc => loc.code)
      };

      try {
        const result = await generateCSVWithBackend(
          campaignData.campaignName || 'Campaign 1',
          adGroups.map((group: any) => ({
            name: group.name,
            keywords: group.keywords || [],
            negativeKeywords: group.negativeKeywords || []
          })),
          campaignData.ads || [],
          locationTargeting.locations.length > 0 ? locationTargeting : undefined,
          undefined, // budget
          'MANUAL_CPC', // bidding strategy
          campaignData.negativeKeywords?.join('\n'),
          'ALL_AD_GROUPS'
        );
        
        // Check if this is an async export (large file)
        if (result && typeof result === 'object' && (result as any).async === true) {
          // Save campaign with job_id for later retrieval
          const asyncResult = result as { async: boolean; job_id: string; estimated_rows: number; message: string };
          try {
            await historyService.save('campaign', campaignData.campaignName || 'Campaign 1', {
              name: campaignData.campaignName,
              url: campaignData.url,
              structure: campaignData.selectedStructure || 'skag',
              keywords: campaignData.selectedKeywords,
              ads: campaignData.ads,
              locations: campaignData.locations,
              intent: campaignData.intent,
              vertical: campaignData.vertical,
              cta: campaignData.cta,
              negativeKeywords: campaignData.negativeKeywords,
              adGroups: campaignData.adGroups,
              csvExportJobId: asyncResult.job_id,
              csvExportStatus: 'processing',
              csvExportEstimatedRows: asyncResult.estimated_rows,
              createdAt: new Date().toISOString(),
            }, 'completed');
            
            notifications.success('Campaign saved. CSV will be ready in 2 minutes.', {
              title: 'Campaign Saved',
              description: 'Check your saved campaigns in 2 minutes to download the CSV file.',
              duration: 10000
            });
          } catch (saveError) {
            console.error('Failed to save campaign with job_id:', saveError);
          }
          return; // Exit early - async export in progress
        }
        
        // Backend export succeeded - no need to update local state
        return; // Exit early - backend export handled everything
      } catch (backendError) {
        console.warn('Backend CSV export failed, using local generation:', backendError);
        // Fall through to local generation below
      }

      // Fallback to local generation using Google Ads Editor format
      // Validate and fix ads before conversion
      const { ads: validatedAds, report: validationReport } = validateAndFixAds(campaignData.ads);
      
      // Show validation report if ads were fixed
      if (validationReport.fixed > 0) {
        const reportText = formatValidationReport(validationReport);
        console.log('Ad validation report:', reportText);
        notifications.info(`Auto-fixed ${validationReport.fixed} ad(s)`, {
          title: 'Ads Validated',
          description: `Ensured all ads meet Google Ads requirements. Check console for details.`,
          duration: 5000
        });
      }
      
      // Build structure directly from campaignData (don't regenerate ad groups)
      const convertedAds = validatedAds.map((ad: any) => {
        const convertedAd: any = {
          type: ad.type === 'rsa' ? 'rsa' : ad.type === 'dki' ? 'dki' : 'callonly',
          final_url: ad.finalUrl || campaignData.url || '',
          path1: (ad.displayPath && Array.isArray(ad.displayPath) ? ad.displayPath[0] : '') || '',
          path2: (ad.displayPath && Array.isArray(ad.displayPath) ? ad.displayPath[1] : '') || '',
        };
        
        // Convert headlines array to individual headline fields (RSA can have up to 15)
        if (ad.headlines && Array.isArray(ad.headlines)) {
          ad.headlines.forEach((headline: string, idx: number) => {
            if (idx < 15 && headline && headline.trim()) {
              convertedAd[`headline${idx + 1}`] = headline.trim().substring(0, 30);
            }
          });
        } else {
          // Fallback to individual headline fields
          if (ad.headline1) convertedAd.headline1 = ad.headline1.trim().substring(0, 30);
          if (ad.headline2) convertedAd.headline2 = ad.headline2.trim().substring(0, 30);
          if (ad.headline3) convertedAd.headline3 = ad.headline3.trim().substring(0, 30);
          if (ad.headline4) convertedAd.headline4 = ad.headline4.trim().substring(0, 30);
          if (ad.headline5) convertedAd.headline5 = ad.headline5.trim().substring(0, 30);
        }
        
        // Convert descriptions array to individual description fields (RSA can have up to 4)
        if (ad.descriptions && Array.isArray(ad.descriptions)) {
          ad.descriptions.forEach((description: string, idx: number) => {
            if (idx < 4 && description && description.trim()) {
              convertedAd[`description${idx + 1}`] = description.trim().substring(0, 90);
            }
          });
        } else {
          // Fallback to individual description fields
          if (ad.description1) convertedAd.description1 = ad.description1.trim().substring(0, 90);
          if (ad.description2) convertedAd.description2 = ad.description2.trim().substring(0, 90);
          if (ad.description3) convertedAd.description3 = ad.description3.trim().substring(0, 90);
          if (ad.description4) convertedAd.description4 = ad.description4.trim().substring(0, 90);
        }
        
        // Ads are already validated and fixed by validateAndFixAds above
        // Just ensure fields are properly mapped (validation already ensured minimums)
        
        // Add extensions if present
        if (ad.extensions && Array.isArray(ad.extensions)) {
          convertedAd.extensions = ad.extensions;
        }
        
        return convertedAd;
      });

      // Build CampaignStructure directly from campaignData (use existing adGroups)
      // Keywords should already have match type formatting (brackets for exact, quotes for phrase)
      
      // Ensure we have at least one ad group
      let adGroupsToUse = campaignData.adGroups || [];
      if (adGroupsToUse.length === 0) {
        // Create a default ad group if none exist
        adGroupsToUse = [{
          name: 'Default Ad Group',
          keywords: campaignData.selectedKeywords || [],
          negativeKeywords: campaignData.negativeKeywords || []
        }];
      }
      
      const structure: CampaignStructure = {
        campaigns: [{
          campaign_name: campaignData.campaignName || 'Campaign 1',
          adgroups: adGroupsToUse.map((group: any) => ({
            adgroup_name: group.name || 'Default Ad Group',
            keywords: (group.keywords || []).map((kw: any) => {
              // Extract keyword text - preserve match type formatting
              if (typeof kw === 'string') return kw;
              // Return formatted keyword (already has brackets/quotes if match type was applied)
              return kw.text || kw.keyword || String(kw);
            }).filter((kw: string) => kw && kw.trim().length > 0), // Filter out empty keywords
            match_types: [], // Match types are encoded in keyword format
            ads: convertedAds.length > 0 ? convertedAds : [{
              type: 'rsa' as const,
              headline1: 'Professional Service',
              headline2: 'Expert Solutions',
              headline3: 'Quality Guaranteed',
              description1: 'Get professional service you can trust.',
              description2: 'Contact us today for expert assistance.',
              final_url: campaignData.url || 'https://example.com',
              path1: '',
              path2: ''
            }], // Ensure at least one ad exists
            negative_keywords: (group.negativeKeywords || campaignData.negativeKeywords || []).map((neg: any) => {
              // Ensure negative keywords have proper format
              if (typeof neg === 'string') {
                return neg.startsWith('-') ? neg : `-${neg}`;
              }
              const negText = neg.text || neg.keyword || String(neg);
              return negText.startsWith('-') ? negText : `-${negText}`;
            }).filter((neg: string) => neg && neg.trim().length > 0), // Filter out empty negative keywords
          })),
          states: campaignData.locations.states || [],
          cities: campaignData.locations.cities || [],
          zip_codes: campaignData.locations.zipCodes || [],
          targetCountry: campaignData.targetCountry || 'United States', // Default to United States
          budget: '100', // Default budget
          budget_type: 'Daily',
          bidding_strategy: 'Manual CPC',
          start_date: '',
          end_date: '',
          location_type: 'COUNTRY',
          location_code: campaignData.targetCountry === 'United States' ? 'US' : (campaignData.targetCountry || 'US').substring(0, 2).toUpperCase(),
        } as any]
      };

      // Validate structure before generating CSV
      if (!structure || !structure.campaigns || structure.campaigns.length === 0) {
        notifications.error('Invalid campaign structure', {

          title: 'Export Error',
          description: 'Campaign structure is invalid. Please ensure you have at least one ad group and campaign name.',
          duration: 10000
        });
        return;
      }
      
      const campaign = structure.campaigns[0];
      if (!campaign.campaign_name || campaign.campaign_name.trim().length === 0) {
        notifications.error('Campaign name is required', {
          title: 'Export Error',
          description: 'Please set a campaign name before generating CSV.',
          duration: 10000
        });
        return;
      }
      
      if (!campaign.adgroups || campaign.adgroups.length === 0) {
        notifications.error('At least one ad group is required', {
          title: 'Export Error',
          description: 'Please create at least one ad group before generating CSV.',
          duration: 10000
        });
        return;
      }
      
      // Generate CSV content without downloading
      const rows = campaignStructureToCSVRows(structure);
      
      // Debug: Log first few rows to check Type column
      if (rows.length > 0) {
        console.log('First 3 CSV rows:', rows.slice(0, 3).map(r => ({ Type: r['Type'], Campaign: r['Campaign'], 'Ad group': r['Ad group'] })));
      }
      
      // Generate CSV content using PapaParse with exact master sheet format
      // Use exact headers in order, CRLF line endings, and UTF-8 BOM
      const csv = Papa.unparse(rows, {
        columns: GOOGLE_ADS_EDITOR_HEADERS, // Exact header order from master sheet
        header: true,
        newline: '\r\n', // CRLF line endings per master sheet
      });
      
      // Store CSV data in state (don't download yet)
      // Add BOM for Excel compatibility
      const csvWithBOM = '\uFEFF' + csv;
      setCampaignData(prev => ({
        ...prev,
        csvData: csvWithBOM,
        csvErrors: [],
      }));
      
      notifications.success('CSV generated successfully!', {
        title: 'CSV Ready',
        description: `Your campaign "${campaignData.campaignName}" CSV is ready. Click "Download CSV" to export.`
        });
    } catch (error) {
      console.error('CSV generation error:', error);
      notifications.error('Failed to generate CSV', {
        title: 'Generation Error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate export statistics from CSV rows
  const getExportStatistics = () => {
    if (!campaignData.csvData) return null;
    
    try {
      // Parse the CSV data to get statistics
      const csvText = campaignData.csvData.replace(/^\uFEFF/, ''); // Remove BOM
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      
      if (!parsed.data || parsed.data.length === 0) return null;

      const rows = parsed.data as any[];
      
      const stats = {
        campaigns: new Set(rows.map(r => r['Campaign']).filter(Boolean)).size,
        adGroups: new Set(rows.map(r => r['Ad group']).filter(Boolean)).size,
        keywords: rows.filter(r => r['Type'] === 'Keyword').length,
        negativeKeywords: rows.filter(r => r['Type'] === 'Negative keyword').length,
        ads: rows.filter(r => r['Type'] === 'Responsive search ad' || r['Type'] === 'Ad').length,
        extensions: rows.filter(r => ['Sitelink', 'Callout', 'Snippet', 'Price'].includes(r['Type'] || '')).length,
        locations: campaignData.locations.cities.length + campaignData.locations.states.length + campaignData.locations.zipCodes.length + (campaignData.locations.countries.length > 0 ? 1 : 0),
        totalRows: rows.length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error calculating export statistics:', error);
      return null;
    }
  };

  const handleDownloadCSV = () => {
    if (!campaignData.csvData) {
      notifications.warning('CSV not generated yet', {
        title: 'No CSV Data',
        description: 'Please generate CSV first before downloading.'
      });
      return;
    }
    
    // Show export brief dialog
    setShowExportDialog(true);
  };

  const confirmDownloadCSV = () => {
    if (!campaignData.csvData) return;
    
    const filename = `${(campaignData.campaignName || 'campaign').replace(/[^a-z0-9]/gi, '_')}_google_ads_editor_${new Date().toISOString().split('T')[0]}.csv`;
    const blob = new Blob([campaignData.csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowExportDialog(false);
    
    // Redirect to dashboard
    setTimeout(() => {
      const event = new CustomEvent('navigate', { detail: { tab: 'dashboard' } });
      window.dispatchEvent(event);
      if (window.location.hash) {
        window.location.hash = '#dashboard';
      }
    }, 1000);
  };

  const handleSaveCampaign = async () => {
    setLoading(true);
    try {
      // Generate CSV first
      await handleGenerateCSV();

      await historyService.save('campaign', campaignData.campaignName, {
        name: campaignData.campaignName,
        url: campaignData.url,
        structure: campaignData.selectedStructure || 'stag',
        keywords: campaignData.selectedKeywords,
        ads: campaignData.ads,
        locations: campaignData.locations,
        intent: campaignData.intent,
        vertical: campaignData.vertical,
        cta: campaignData.cta,
        negativeKeywords: campaignData.negativeKeywords,
        adGroups: campaignData.adGroups,
        csvData: campaignData.csvData,
        createdAt: new Date().toISOString(),
      }, 'completed');

      setCampaignSaved(true);
      setCurrentStep(8); // Show success screen
    } catch (error) {
      console.error('Save error:', error);
      notifications.error('Failed to save campaign', {
        title: 'Save Error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render functions for each step
  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Enter Your Website URL</h2>
        <p className="text-slate-600">AI will analyze your website to identify intent, CTA, and vertical</p>
        </div>
        <AutoFillButton onAutoFill={handleAutoFillStep1} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Website URL</CardTitle>
          <CardDescription>Enter the landing page URL for your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="url"
              placeholder="https://www.example.com"
              value={campaignData.url}
              onChange={(e) => setCampaignData(prev => ({ ...prev, url: e.target.value }))}
              className="flex-1"
            />
            <Button onClick={handleUrlSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {campaignData.intent && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Intent</Label>
              <p className="text-slate-600">{campaignData.intent.intentLabel}</p>
            </div>
            {campaignData.vertical && (
              <div>
                <Label className="text-sm font-semibold">Vertical</Label>
                <p className="text-slate-600">{campaignData.vertical}</p>
              </div>
            )}
            {campaignData.cta && (
              <div>
                <Label className="text-sm font-semibold">CTA</Label>
                <p className="text-slate-600">{campaignData.cta}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-semibold">Campaign Name</Label>
              <Input
                value={campaignData.campaignName}
                onChange={(e) => setCampaignData(prev => ({ ...prev, campaignName: e.target.value }))}
                placeholder="Search-date-time"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Select Campaign Structure</h2>
        <p className="text-slate-600">AI has ranked the best structures for your vertical. Choose the one that fits your needs.</p>
        </div>
        <AutoFillButton onAutoFill={handleAutoFillStep2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {CAMPAIGN_STRUCTURES.map((structure, idx) => {
          const ranking = campaignData.structureRankings.findIndex(r => r.id === structure.id);
          const isRecommended = ranking === 0 || ranking === 1 || ranking === 2;
          const rankLabel = ranking === 0 ? 'Best' : ranking === 1 ? '2nd Best' : ranking === 2 ? '3rd Best' : null;
          const isSelected = campaignData.selectedStructure === structure.id;
          const Icon = structure.icon;

          return (
            <Card
              key={structure.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-indigo-500 bg-indigo-50'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleStructureSelect(structure.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-lg">{structure.name}</CardTitle>
                  </div>
                  {isRecommended && rankLabel && (
                    <Badge variant={ranking === 0 ? 'default' : 'secondary'}>
                      {rankLabel}
                    </Badge>
                  )}
                </div>
                <CardDescription>{structure.description}</CardDescription>
              </CardHeader>
              {isSelected && (
                <CardContent>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Keywords Planner</h2>
        <p className="text-slate-600">Generate 410-710 keywords based on your seed keywords and campaign structure</p>
        </div>
        <AutoFillButton onAutoFill={handleAutoFillStep3} />
      </div>

      <Card className="mb-6">
            <CardHeader>
              <CardTitle>Seed Keywords</CardTitle>
              <CardDescription>AI-suggested seed keywords based on your URL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {campaignData.seedKeywords.map((kw, idx) => {
                  const keywordText = typeof kw === 'string' ? kw : (kw?.text || kw?.keyword || String(kw || ''));
                  return (
                    <Badge key={idx} variant="secondary">{keywordText}</Badge>
                  );
                })}
              </div>
              <div className="flex gap-2 mb-2">
              <Textarea
                placeholder="Enter additional seed keywords (one per line)"
                value={campaignData.seedKeywords.join('\n')}
                onChange={(e) => setCampaignData(prev => ({
                  ...prev,
                  seedKeywords: e.target.value.split('\n').filter(k => k.trim())
                }))}
                rows={4}
                  className="flex-1"
                />
                <Button 
                  onClick={handleFillInfoKeywords}
                  variant="outline"
                  className="h-auto px-4 bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700"
                  title="Add 3-4 sample keywords"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Fill Info
                </Button>
              </div>
          <Button onClick={handleGenerateKeywords} disabled={loading} className="mt-4">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Keywords
              </Button>
            </CardContent>
          </Card>

      <Card className="mb-6">
            <CardHeader>
              <CardTitle>Negative Keywords</CardTitle>
              <CardDescription>These keywords will be excluded from generated keywords. You can add or update them.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <Input
                  placeholder="Enter negative keywords (comma-separated, e.g., cheap, discount, cost)"
                  value={campaignData.negativeKeywords.filter(n => !DEFAULT_NEGATIVE_KEYWORDS.includes(n)).join(', ')}
                  onChange={(e) => {
                    const userNegatives = e.target.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
                    // Ensure default negative keywords are always included
                    const combined = [...DEFAULT_NEGATIVE_KEYWORDS, ...userNegatives];
                    setCampaignData(prev => ({
                      ...prev,
                      negativeKeywords: combined
                    }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const userNegatives = input.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
                      const combined = [...DEFAULT_NEGATIVE_KEYWORDS, ...userNegatives];
                      setCampaignData(prev => ({
                        ...prev,
                        negativeKeywords: combined
                      }));
                      input.value = '';
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {campaignData.negativeKeywords.map((neg, idx) => {
                  const isDefault = DEFAULT_NEGATIVE_KEYWORDS.includes(neg);
                  return (
                    <Badge 
                      key={idx} 
                      variant="destructive"
                      className={isDefault ? "cursor-not-allowed opacity-90" : "cursor-pointer hover:opacity-80"}
                      onClick={() => {
                        // Only allow removal of non-default keywords
                        if (!isDefault) {
                          const updated = campaignData.negativeKeywords.filter((_, i) => i !== idx);
                          setCampaignData(prev => ({
                            ...prev,
                            negativeKeywords: updated
                          }));
                        }
                      }}
                    >
                      {neg}
                      {!isDefault && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Default negative keywords (highlighted in red) are always kept. You can add more or remove custom ones. These {campaignData.negativeKeywords.length} negative keywords will always be excluded when generating keywords.
              </p>
            </CardContent>
          </Card>

          {campaignData.generatedKeywords.length > 0 && (
        <>
          <Card className="mb-6">
              <CardHeader>
                <CardTitle>Keyword Type Filters</CardTitle>
                <CardDescription>Toggle keyword types to filter the list</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex gap-4">
                  {KEYWORD_TYPES.map(type => (
                    <div key={type.id} className="flex items-center gap-2">
                      <Checkbox
                        id={type.id}
                        checked={campaignData.keywordTypes[type.id] || false}
                        onCheckedChange={() => handleKeywordTypeToggle(type.id)}
                      />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          <Card className="mb-6">
              <CardHeader>
                <CardTitle>Generated Keywords ({filteredKeywords.length})</CardTitle>
                <CardDescription>Keywords organized by campaign structure: {campaignData.selectedStructure?.toUpperCase() || 'SKAG'}</CardDescription>
              </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                    {filteredKeywords.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <p>No keywords match your filters.</p>
                        <p className="text-xs mt-2">Try adjusting keyword type filters or negative keywords.</p>
                      </div>
                    ) : (
                      filteredKeywords.map((kw, idx) => {
                        const keywordText = typeof kw === 'string' ? kw : (kw?.text || kw?.keyword || String(kw || ''));
                        return (
                          <div key={kw?.id || idx} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{keywordText}</span>
                            {kw?.matchType && (
                              <Badge variant="outline">{kw.matchType}</Badge>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
        </>
      )}
    </div>
  );

  const renderStep4 = () => {
    const allAdGroups = ['ALL_AD_GROUPS', ...campaignData.adGroups.map(ag => ag.name)];
    const displayAds = campaignData.ads.length > 0 ? campaignData.ads : [];
    const extensionTypes = [
      { id: 'snippet', label: 'SNIPPET EXTENSION', icon: FileText },
      { id: 'callout', label: 'CALLOUT EXTENSION', icon: MessageSquare },
      { id: 'sitelink', label: 'SITELINK EXTENSION', icon: Link2 },
      { id: 'call', label: 'CALL EXTENSION', icon: Phone },
      { id: 'price', label: 'PRICE EXTENSION', icon: DollarSign },
      { id: 'app', label: 'APP EXTENSION', icon: Smartphone },
      { id: 'location', label: 'LOCATION EXTENSION', icon: MapPinIcon },
      { id: 'message', label: 'MESSAGE EXTENSION', icon: MessageSquare },
      { id: 'leadform', label: 'LEAD FORM EXTENSION', icon: FileText },
      { id: 'promotion', label: 'PROMOTION EXTENSION', icon: Gift },
      { id: 'image', label: 'IMAGE EXTENSION', icon: ImageIcon },
    ];

    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-end">
          <AutoFillButton onAutoFill={() => {
            if (campaignData.selectedKeywords.length === 0) {
              handleAutoFillStep3();
            }
            // Ads are now created manually by clicking ad type buttons
          }} />
        </div>

        {/* Step 1: Enter Keyword Box - At the Top */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Keyword</CardTitle>
            <CardDescription>Enter a keyword to generate ads for</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter keyword (e.g., plumber near me)"
              value={adGenerationKeyword}
              onChange={(e) => setAdGenerationKeyword(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Step 2: URL Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Landing Page URL</CardTitle>
            <CardDescription>Enter the URL where users will land when they click your ad</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="url"
              placeholder="https://www.example.com/landing-page"
              value={campaignData.url}
              onChange={(e) => setCampaignData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Step 3: Ad Type and Mode Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ad Type & Mode</CardTitle>
            <CardDescription>Choose your ad type and generation mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Select Ad Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant={campaignData.adTypes.includes('rsa') ? "default" : "outline"}
                    className="w-full py-6"
                    onClick={() => {
                      const adTypes = campaignData.adTypes.includes('rsa')
                        ? campaignData.adTypes.filter(t => t !== 'rsa')
                        : [...campaignData.adTypes.filter(t => t !== 'rsa'), 'rsa'];
                      setCampaignData(prev => ({ ...prev, adTypes }));
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Responsive Search Ad (RSA)
                  </Button>
                  <Button
                    variant={campaignData.adTypes.includes('dki') ? "default" : "outline"}
                    className="w-full py-6"
                    onClick={() => {
                      const adTypes = campaignData.adTypes.includes('dki')
                        ? campaignData.adTypes.filter(t => t !== 'dki')
                        : [...campaignData.adTypes.filter(t => t !== 'dki'), 'dki'];
                      setCampaignData(prev => ({ ...prev, adTypes }));
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    DKI Text Ad
                  </Button>
                  <Button
                    variant={campaignData.adTypes.includes('call') ? "default" : "outline"}
                    className="w-full py-6"
                    onClick={() => {
                      const adTypes = campaignData.adTypes.includes('call')
                        ? campaignData.adTypes.filter(t => t !== 'call')
                        : [...campaignData.adTypes.filter(t => t !== 'call'), 'call'];
                      setCampaignData(prev => ({ ...prev, adTypes }));
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Only Ad
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Generation Mode</Label>
                <Select
                  value="auto"
                  onValueChange={(value) => {
                    // Mode selection can be extended later
                    console.log('Mode selected:', value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select generation mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Generate (Recommended)</SelectItem>
                    <SelectItem value="manual">Manual Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Generate Ads Button */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Button
              onClick={() => {
                if (!adGenerationKeyword.trim()) {
                  notifications.error('Please enter a keyword', { title: 'Keyword Required' });
                  return;
                }
                // Temporarily add keyword to selectedKeywords for ad generation
                const tempKeyword = {
                  id: `temp-${Date.now()}`,
                  text: adGenerationKeyword.trim(),
                  keyword: adGenerationKeyword.trim(),
                };
                setCampaignData(prev => ({
                  ...prev,
                  selectedKeywords: prev.selectedKeywords.length > 0 ? prev.selectedKeywords : [tempKeyword]
                }));
                // Generate ads after a short delay to ensure state is updated
                setTimeout(() => {
                  handleGenerateAds();
                }, 100);
              }}
              disabled={loading || !campaignData.url || !adGenerationKeyword.trim() || campaignData.adTypes.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Ads...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Ads
                </>
              )}
            </Button>
            {(!campaignData.url || !adGenerationKeyword.trim() || campaignData.adTypes.length === 0) && (
              <p className="text-sm text-slate-500 mt-2 text-center">
                {!campaignData.url && 'Please enter a URL. '}
                {!adGenerationKeyword.trim() && 'Please enter a keyword. '}
                {campaignData.adTypes.length === 0 && 'Please select at least one ad type.'}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Ad Group Selector */}
            <Card>
              <CardContent className="p-4">
                <Select 
                  value={campaignData.selectedAdGroup || 'ALL_AD_GROUPS'} 
                  onValueChange={(value) => setCampaignData(prev => ({ ...prev, selectedAdGroup: value }))}
                >
                  <SelectTrigger className="w-full bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAdGroups.map(group => (
                      <SelectItem key={group} value={group}>
                        {group === 'ALL_AD_GROUPS' ? 'ALL AD GROUPS' : group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Info Text */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-slate-600">
                  You can preview different ad groups, however changing ads here will change all ad groups. 
                  In the next section you can edit ads individually for each ad group.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <span>Total Ads:</span>
                  {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="font-semibold">{displayAds.length} / 3</span>
                  )}
          </div>
        </CardContent>
      </Card>

            {/* Ad Type Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAddNewAd('rsa')}
                disabled={loading || campaignData.ads.length >= 3 || campaignData.ads.some(ad => ad.type === 'rsa' || ad.adType === 'RSA')}
              >
                    <Plus className="mr-2 w-5 h-5" /> RESP. SEARCH AD
              </Button>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAddNewAd('dki')}
                disabled={loading || campaignData.ads.length >= 3 || campaignData.ads.some(ad => ad.type === 'dki' || ad.adType === 'DKI')}
              >
                    <Plus className="mr-2 w-5 h-5" /> DKI TEXT AD
              </Button>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAddNewAd('call')}
                disabled={loading || campaignData.ads.length >= 3 || campaignData.ads.some(ad => ad.type === 'call' || ad.adType === 'CallOnly')}
              >
                    <Plus className="mr-2 w-5 h-5" /> CALL ONLY AD
              </Button>
            </div>

            {/* Extensions Section */}
        <Card>
          <CardHeader>
                <CardTitle className="text-sm">EXTENSIONS</CardTitle>
          </CardHeader>
              <CardContent className="space-y-2">
                {extensionTypes.map(ext => {
                  const Icon = ext.icon;
                  return (
                    <Button
                      key={ext.id}
                      variant="outline"
                      className="w-full justify-start border-purple-200 hover:bg-purple-50"
                      onClick={() => handleAddExtensionToAllAds(ext.id)}
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      <Icon className="mr-2 w-4 h-4" />
                      {ext.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
                        </div>

          {/* Right Content - Ads Display */}
          <div className="lg:col-span-3 space-y-4">
            {displayAds.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Ads Created Yet</h3>
                  <p className="text-slate-500 mb-4">Click on an ad type button on the left to create an ad (Maximum 3 ads allowed)</p>
                </CardContent>
              </Card>
            ) : (
              displayAds.map((ad) => (
                <Card key={ad.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="text-xs">
                        {ad.type?.toUpperCase() || ad.adType || 'RSA'}
                      </Badge>
                        <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditAd(ad.id)} className="text-green-600 hover:text-green-700">
                          <Edit3 className="w-4 h-4 mr-1" />
                          EDIT
                          </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDuplicateAd(ad.id)} className="text-purple-600 hover:text-purple-700">
                          <Copy className="w-4 h-4 mr-1" />
                          DUPLICATE
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAd(ad.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-1" />
                          DELETE
                          </Button>
                        </div>
                      </div>
                      
                      {/* RSA Ad Display */}
                      {ad.type === 'rsa' && ad.headlines && (
                      <div className="space-y-3">
                          <div>
                          <Label className="text-xs text-slate-500 mb-2 block">Headlines / Paths</Label>
                          <div className="flex flex-wrap gap-2">
                              {ad.headlines.slice(0, 5).map((h, i) => (
                              <span key={i} className="text-sm text-slate-700">{h}</span>
                              ))}
                            {ad.displayPath && ad.displayPath.length > 0 && (
                              <span className="text-sm text-slate-500">| {ad.displayPath.join(' | ')}</span>
                              )}
                            </div>
                          </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Display URL</Label>
                          <p className="text-xs text-blue-600 break-all">{ad.finalUrl || campaignData.url}</p>
                          </div>
                          {ad.descriptions && ad.descriptions.length > 0 && (
                            <div>
                            <Label className="text-xs text-slate-500 mb-1 block">Descriptions</Label>
                            {ad.descriptions.slice(0, 2).map((desc, i) => (
                              <p key={i} className="text-sm text-slate-600 mb-1">{desc}</p>
                            ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* DKI Ad Display */}
                      {(ad.type === 'dki' || ad.adType === 'DKI') && (
                      <div className="space-y-3">
                          {ad.headline1 && <p className="font-semibold text-sm">{ad.headline1}</p>}
                          {ad.headline2 && <p className="font-semibold text-sm">{ad.headline2}</p>}
                        {ad.headline3 && <p className="font-semibold text-sm">{ad.headline3}</p>}
                          {ad.description1 && <p className="text-sm text-slate-600">{ad.description1}</p>}
                        {ad.description2 && <p className="text-sm text-slate-600">{ad.description2}</p>}
                          {ad.finalUrl && (
                            <p className="text-xs text-blue-600">{ad.finalUrl}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Call-Only Ad Display */}
                      {(ad.type === 'call' || ad.adType === 'CallOnly') && (
                      <div className="space-y-3">
                          {ad.headline1 && <p className="font-semibold text-sm">{ad.headline1}</p>}
                        {ad.headline2 && <p className="font-semibold text-sm">{ad.headline2}</p>}
                          {ad.phoneNumber && (
                            <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-green-600" />
                            <span className="text-lg font-medium">{ad.phoneNumber}</span>
                            </div>
                          )}
                          {ad.description1 && <p className="text-sm text-slate-600">{ad.description1}</p>}
                        {ad.description2 && <p className="text-sm text-slate-600">{ad.description2}</p>}
                        </div>
                      )}
                      
                    {/* Extensions Display */}
                        {ad.extensions && ad.extensions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <Label className="text-xs text-slate-500 mb-2 block">Extensions</Label>
                        <div className="space-y-2">
                            {ad.extensions.map((ext: any) => {
                              // Get extension display text based on type
                              let displayText = ext.text || ext.label || ext.type;
                              
                              if (ext.type === 'snippet' && ext.header && ext.values) {
                                displayText = `${ext.header}: ${ext.values.join(', ')}`;
                              } else if (ext.type === 'callout' && ext.callouts && Array.isArray(ext.callouts)) {
                                displayText = ext.callouts.join(', ');
                              } else if (ext.type === 'sitelink' && ext.sitelinks && Array.isArray(ext.sitelinks)) {
                                displayText = ext.sitelinks.map((sl: any) => sl.text || sl.linkText || 'Sitelink').join(', ');
                              } else if (ext.type === 'call' && (ext.phone || ext.phoneNumber)) {
                                displayText = ext.phone || ext.phoneNumber;
                              } else if (ext.type === 'price' && ext.price) {
                                displayText = `${ext.priceQualifier || 'From'} ${ext.price} ${ext.unit || ''}`.trim();
                              }
                              
                              return (
                                <div key={ext.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                  <div className="flex items-center gap-3 flex-1">
                                    {ext.type === 'snippet' && <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                                    {ext.type === 'callout' && <MessageSquare className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                                    {ext.type === 'sitelink' && <Link2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                                    {ext.type === 'call' && <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                    {ext.type === 'price' && <DollarSign className="w-4 h-4 text-yellow-600 flex-shrink-0" />}
                                    {ext.type === 'app' && <Smartphone className="w-4 h-4 text-cyan-600 flex-shrink-0" />}
                                    {ext.type === 'location' && <MapPinIcon className="w-4 h-4 text-red-600 flex-shrink-0" />}
                                    {ext.type === 'message' && <MessageSquare className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                                    {ext.type === 'leadform' && <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                                    {ext.type === 'promotion' && <Gift className="w-4 h-4 text-pink-600 flex-shrink-0" />}
                                    {ext.type === 'image' && <ImageIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">
                                        {ext.label || ext.type.charAt(0).toUpperCase() + ext.type.slice(1).replace(/([A-Z])/g, ' $1')}
                                      </span>
                                      <span className="text-sm text-slate-700 font-medium block truncate">
                                        {displayText}
                                </span>
                                    </div>
                          </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveExtension(ad.id, ext.id)}
                                    className="text-red-600 hover:text-red-700 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                      </div>
                              );
                            })}
              </div>
                      </div>
                    )}

                    {/* Edit Form - shown when editing */}
                    {editingAdId === ad.id && (
                      <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                        {/* RSA Edit Form */}
                        {(ad.type === 'rsa' || ad.adType === 'RSA') && (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700 mb-2 block">Headlines (max 30 chars each)</Label>
                                <div className="space-y-2">
                                  {(ad.headlines || []).slice(0, 15).map((headline: string, idx: number) => (
                                    <div key={idx}>
                                      <div className="flex items-center justify-between mb-1">
                                        <Label className="text-xs text-slate-600">Headline {idx + 1}</Label>
                                        <span className={`text-xs ${(headline?.length || 0) > 30 ? 'text-red-600 font-semibold' : (headline?.length || 0) > 25 ? 'text-amber-600' : 'text-slate-500'}`}>
                                          {(headline?.length || 0)}/30
                                        </span>
                                      </div>
                                      <Input
                                        value={headline || ''}
                                        onChange={(e) => {
                                          const newHeadlines = [...(ad.headlines || [])];
                                          newHeadlines[idx] = e.target.value;
                                          updateAdField(ad.id, 'headlines', newHeadlines);
                                        }}
                                        className={`${(headline?.length || 0) > 30 ? 'border-red-500 focus:border-red-500' : ''}`}
                                        maxLength={30}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700 mb-2 block">Descriptions (max 90 chars each)</Label>
                                <div className="space-y-2">
                                  {(ad.descriptions || []).slice(0, 4).map((desc: string, idx: number) => (
                                    <div key={idx}>
                                      <div className="flex items-center justify-between mb-1">
                                        <Label className="text-xs text-slate-600">Description {idx + 1}</Label>
                                        <span className={`text-xs ${(desc?.length || 0) > 90 ? 'text-red-600 font-semibold' : (desc?.length || 0) > 80 ? 'text-amber-600' : 'text-slate-500'}`}>
                                          {(desc?.length || 0)}/90
                                        </span>
                                      </div>
                                      <Textarea
                                        value={desc || ''}
                                        onChange={(e) => {
                                          const newDescriptions = [...(ad.descriptions || [])];
                                          newDescriptions[idx] = e.target.value;
                                          updateAdField(ad.id, 'descriptions', newDescriptions);
                                        }}
                                        className={`${(desc?.length || 0) > 90 ? 'border-red-500 focus:border-red-500' : ''}`}
                                        rows={2}
                                        maxLength={90}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700 mb-2 block">Final URL</Label>
                                <Input
                                  value={ad.finalUrl || ''}
                                  onChange={(e) => updateAdField(ad.id, 'finalUrl', e.target.value)}
                                  placeholder="https://www.example.com"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* DKI Edit Form */}
                        {(ad.type === 'dki' || ad.adType === 'DKI') && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Headline 1 *</Label>
                                  <span className={`text-xs ${(ad.headline1?.length || 0) > 30 ? 'text-red-600 font-semibold' : (ad.headline1?.length || 0) > 25 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.headline1?.length || 0)}/30
                                  </span>
                                </div>
                                <Input
                                  value={ad.headline1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline1', e.target.value)}
                                  className={`${(ad.headline1?.length || 0) > 30 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter headline 1"
                                  maxLength={30}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Headline 2 *</Label>
                                  <span className={`text-xs ${(ad.headline2?.length || 0) > 30 ? 'text-red-600 font-semibold' : (ad.headline2?.length || 0) > 25 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.headline2?.length || 0)}/30
                                  </span>
                                </div>
                                <Input
                                  value={ad.headline2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline2', e.target.value)}
                                  className={`${(ad.headline2?.length || 0) > 30 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter headline 2"
                                  maxLength={30}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Headline 3</Label>
                                  <span className={`text-xs ${(ad.headline3?.length || 0) > 30 ? 'text-red-600 font-semibold' : (ad.headline3?.length || 0) > 25 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.headline3?.length || 0)}/30
                                  </span>
                                </div>
                                <Input
                                  value={ad.headline3 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline3', e.target.value)}
                                  className={`${(ad.headline3?.length || 0) > 30 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter headline 3"
                                  maxLength={30}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Description 1 *</Label>
                                  <span className={`text-xs ${(ad.description1?.length || 0) > 90 ? 'text-red-600 font-semibold' : (ad.description1?.length || 0) > 80 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.description1?.length || 0)}/90
                                  </span>
                                </div>
                                <Textarea
                                  value={ad.description1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description1', e.target.value)}
                                  className={`${(ad.description1?.length || 0) > 90 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter description 1"
                                  rows={2}
                                  maxLength={90}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Description 2</Label>
                                  <span className={`text-xs ${(ad.description2?.length || 0) > 90 ? 'text-red-600 font-semibold' : (ad.description2?.length || 0) > 80 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.description2?.length || 0)}/90
                                  </span>
                                </div>
                                <Textarea
                                  value={ad.description2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description2', e.target.value)}
                                  className={`${(ad.description2?.length || 0) > 90 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter description 2"
                                  rows={2}
                                  maxLength={90}
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs font-semibold text-slate-700">Final URL *</Label>
                              <Input
                                value={ad.finalUrl || ''}
                                onChange={(e) => updateAdField(ad.id, 'finalUrl', e.target.value)}
                                placeholder="https://www.example.com"
                              />
                            </div>
                          </>
                        )}

                        {/* Call-Only Edit Form */}
                        {(ad.type === 'call' || ad.adType === 'CallOnly') && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Headline 1 *</Label>
                                  <span className={`text-xs ${(ad.headline1?.length || 0) > 30 ? 'text-red-600 font-semibold' : (ad.headline1?.length || 0) > 25 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.headline1?.length || 0)}/30
                                  </span>
                                </div>
                                <Input
                                  value={ad.headline1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline1', e.target.value)}
                                  className={`${(ad.headline1?.length || 0) > 30 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter headline 1"
                                  maxLength={30}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Headline 2 *</Label>
                                  <span className={`text-xs ${(ad.headline2?.length || 0) > 30 ? 'text-red-600 font-semibold' : (ad.headline2?.length || 0) > 25 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.headline2?.length || 0)}/30
                                  </span>
                                </div>
                                <Input
                                  value={ad.headline2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'headline2', e.target.value)}
                                  className={`${(ad.headline2?.length || 0) > 30 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter headline 2"
                                  maxLength={30}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Description 1 *</Label>
                                  <span className={`text-xs ${(ad.description1?.length || 0) > 90 ? 'text-red-600 font-semibold' : (ad.description1?.length || 0) > 80 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.description1?.length || 0)}/90
                                  </span>
                                </div>
                                <Textarea
                                  value={ad.description1 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description1', e.target.value)}
                                  className={`${(ad.description1?.length || 0) > 90 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter description 1"
                                  rows={2}
                                  maxLength={90}
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs font-semibold text-slate-700">Description 2 *</Label>
                                  <span className={`text-xs ${(ad.description2?.length || 0) > 90 ? 'text-red-600 font-semibold' : (ad.description2?.length || 0) > 80 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {(ad.description2?.length || 0)}/90
                                  </span>
                                </div>
                                <Textarea
                                  value={ad.description2 || ''}
                                  onChange={(e) => updateAdField(ad.id, 'description2', e.target.value)}
                                  className={`${(ad.description2?.length || 0) > 90 ? 'border-red-500 focus:border-red-500' : ''}`}
                                  placeholder="Enter description 2"
                                  rows={2}
                                  maxLength={90}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                                <Input
                                  value={ad.phoneNumber || ''}
                                  onChange={(e) => updateAdField(ad.id, 'phoneNumber', e.target.value)}
                                  placeholder="(555) 123-4567"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold text-slate-700">Business Name *</Label>
                                <Input
                                  value={ad.businessName || ''}
                                  onChange={(e) => updateAdField(ad.id, 'businessName', e.target.value)}
                                  placeholder="Your Business"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex gap-2 pt-4 border-t border-slate-300">
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
          </CardContent>
        </Card>
              ))
      )}
          </div>
        </div>
    </div>
  );
  };

  const renderStep5 = () => {
    // Check if any specific locations are selected
    const hasSpecificLocations = 
      campaignData.locations.cities.length > 0 ||
      campaignData.locations.states.length > 0 ||
      campaignData.locations.zipCodes.length > 0;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Geo Target</h2>
            <p className="text-slate-600">Select the country where your ads will be shown.</p>
          </div>
          <AutoFillButton onAutoFill={handleAutoFillStep5} />
        </div>

        <div className="space-y-6">
          {/* Target Country */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <CardTitle>Target Country</CardTitle>
              </div>
              <CardDescription>
                Select the country where you want your ads to be displayed. All users within this country will see your ads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={campaignData.targetCountry} 
                onValueChange={(value) => {
                  setCampaignData(prev => ({ ...prev, targetCountry: value }));
                  autoSaveDraft();
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_PRESETS.countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

