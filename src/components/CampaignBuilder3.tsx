import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Globe, Link2, Sparkles, Brain, 
  Hash, MapPin, FileText, Download, AlertCircle, CheckCircle2,
  Loader2, Search, Filter, X, Plus, Edit3, Trash2, Save,
  Target, Zap, Layers, TrendingUp, Building2, ShoppingBag,
  Phone, Mail, Calendar, Clock, Eye, FileSpreadsheet, Copy,
  MessageSquare, Gift, Image as ImageIcon, DollarSign, MapPin as MapPinIcon,
  Star, RefreshCw, Smartphone
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
import { historyService } from '../utils/historyService';
import { generateCSVWithBackend } from '../utils/csvExportBackend';
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

export const CampaignBuilder3: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignSaved, setCampaignSaved] = useState(false);
  const [locationSearchTerm, setLocationSearchTerm] = useState({ countries: '', states: '', cities: '', zipCodes: '' });
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

  // Auto-generate ads when step 4 is reached if no ads exist and keywords are available
  useEffect(() => {
    if (currentStep === 4 && campaignData.ads.length === 0 && campaignData.selectedKeywords.length > 0 && !loading) {
      // Auto-generate ads when entering step 4
      handleGenerateAds();
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
        selectedStructure: rankings[0]?.id || 'stag',
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
      const adGroups = generateAdGroupsFromKeywords(shuffled, campaignData.selectedStructure || 'stag');

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
          structure: campaignData.selectedStructure || 'stag',
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

      // Always generate 3 ads: RSA, DKI, and Call
      const adTypesToGenerate = ['rsa', 'dki', 'call'];
      
      for (const adType of adTypesToGenerate) {
        try {
          const adInput: AdGenerationInput = {
            keywords: keywordTexts,
            baseUrl: campaignData.url,
            adType: adType === 'rsa' ? 'RSA' : adType === 'dki' ? 'ETA' : 'CALL_ONLY',
            industry: campaignData.vertical || 'general',
            businessName: 'Your Business',
            filters: {
              matchType: campaignData.keywordTypes.phrase ? 'phrase' : campaignData.keywordTypes.exact ? 'exact' : 'broad',
              campaignStructure: (campaignData.selectedStructure?.toUpperCase() || 'STAG') as 'SKAG' | 'STAG' | 'IBAG' | 'Alpha-Beta',
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
              finalUrl: rsa.finalUrl || campaignData.url,
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
              finalUrl: dki.finalUrl || campaignData.url,
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
              businessName: call.businessName || '',
              finalUrl: call.verificationUrl || campaignData.url,
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
      
      const adInput: AdGenerationInput = {
        keywords: keywordTexts,
        baseUrl: campaignData.url,
        adType: adType === 'rsa' ? 'RSA' : adType === 'dki' ? 'ETA' : 'CALL_ONLY',
        industry: campaignData.vertical || 'general',
        businessName: 'Your Business',
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
          finalUrl: rsa.finalUrl || campaignData.url,
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
          businessName: call.businessName || '',
          finalUrl: call.verificationUrl || campaignData.url,
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
    // TODO: Implement ad editing dialog
    notifications.info('Ad editing feature coming soon', { title: 'Edit Ad' });
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
              structure: campaignData.selectedStructure || 'stag',
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
        
        // If backend export succeeds, also update local state for compatibility
        const structure = generateCampaignStructure(
          campaignData.selectedKeywords.map(k => k.text || k.keyword || k),
          {
            structureType: campaignData.selectedStructure || 'stag',
            campaignName: campaignData.campaignName,
            keywords: campaignData.selectedKeywords.map(k => k.text || k.keyword || k),
            matchTypes: {
              broad: campaignData.keywordTypes.broad,
              phrase: campaignData.keywordTypes.phrase,
              exact: campaignData.keywordTypes.exact,
            },
            url: campaignData.url,
            ads: campaignData.ads,
            negativeKeywords: campaignData.negativeKeywords,
          } as StructureSettings
        );
        const csvData = await exportCampaignToCSVV3(structure);
        setCampaignData(prev => ({
          ...prev,
          csvData,
          csvErrors: [],
        }));
        return; // Exit early - backend export handled everything
      } catch (backendError) {
        console.warn('Backend CSV export failed, using local generation:', backendError);
        // Fall through to local generation below
      }

      // Fallback to local generation
      const structure = generateCampaignStructure(
        campaignData.selectedKeywords.map(k => k.text || k.keyword || k),
        {
          structureType: campaignData.selectedStructure || 'stag',
          campaignName: campaignData.campaignName,
          keywords: campaignData.selectedKeywords.map(k => k.text || k.keyword || k),
          matchTypes: {
            broad: campaignData.keywordTypes.broad,
            phrase: campaignData.keywordTypes.phrase,
            exact: campaignData.keywordTypes.exact,
          },
          url: campaignData.url,
          ads: campaignData.ads,
          negativeKeywords: campaignData.negativeKeywords, // Include negative keywords in structure
        } as StructureSettings
      );

      const validation = validateCSVBeforeExport(structure);
      
      if (validation.isValid) {
        const csvData = await exportCampaignToCSVV3(structure);
        setCampaignData(prev => ({
          ...prev,
          csvData,
          csvErrors: [],
        }));
        notifications.success('CSV generated successfully', {
          title: 'CSV Ready'
        });
      } else {
        setCampaignData(prev => ({
          ...prev,
          csvErrors: validation.errors || [],
        }));
        notifications.warning('CSV has validation errors', {
          title: 'Validation Issues',
          description: 'Please review and fix errors before exporting'
        });
      }
    } catch (error) {
      console.error('CSV generation error:', error);
      notifications.error('Failed to generate CSV', {
        title: 'Generation Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async () => {
    setLoading(true);
    try {
      // Generate CSV first
      await handleGenerateCSV();
      
      if (campaignData.csvErrors.length > 0) {
        notifications.warning('Please fix CSV errors before saving', {
          title: 'Validation Required',
          description: 'There are errors in the CSV that need to be fixed.'
        });
        setLoading(false);
        return;
      }

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
                {campaignData.seedKeywords.map((kw, idx) => (
                  <Badge key={idx} variant="secondary">{kw}</Badge>
                ))}
              </div>
              <Textarea
                placeholder="Enter additional seed keywords (one per line)"
                value={campaignData.seedKeywords.join('\n')}
                onChange={(e) => setCampaignData(prev => ({
                  ...prev,
                  seedKeywords: e.target.value.split('\n').filter(k => k.trim())
                }))}
                rows={4}
              />
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
                <CardDescription>Keywords organized by campaign structure: {campaignData.selectedStructure?.toUpperCase() || 'STAG'}</CardDescription>
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
                      filteredKeywords.map((kw, idx) => (
                      <div key={kw.id || idx} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{kw.text || kw.keyword || kw}</span>
                          {kw.matchType && (
                        <Badge variant="outline">{kw.matchType}</Badge>
                          )}
                        </div>
                      ))
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
    const hasSpecificLocations = 
      campaignData.locations.cities.length > 0 || 
      campaignData.locations.zipCodes.length > 0 || 
      campaignData.locations.states.length > 0;

    const handleCityPreset = (count: number) => {
      const cities = LOCATION_PRESETS.cities.slice(0, count);
      setCampaignData(prev => ({
          ...prev,
          locations: {
            ...prev.locations,
          cities: [...new Set([...prev.locations.cities, ...cities])],
        },
      }));
      autoSaveDraft();
    };

    const handleStatePreset = (count: number) => {
      const states = LOCATION_PRESETS.states.slice(0, count);
      setCampaignData(prev => ({
        ...prev,
        locations: {
          ...prev.locations,
          states: [...new Set([...prev.locations.states, ...states])],
        },
      }));
      autoSaveDraft();
    };

    const handleZipPreset = (count: number) => {
      const zips = LOCATION_PRESETS.zipCodes.slice(0, count);
      setCampaignData(prev => ({
        ...prev,
        locations: {
          ...prev.locations,
          zipCodes: [...new Set([...prev.locations.zipCodes, ...zips])],
        },
      }));
      autoSaveDraft();
    };

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Geo Target</h2>
            <p className="text-slate-600">Select the specific locations where your ads will be shown.</p>
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

          {/* Specific Locations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <CardTitle>Specific Locations</CardTitle>
              </div>
              <CardDescription>
                {!hasSpecificLocations 
                  ? 'Add specific cities, states, or ZIP codes to target, or leave empty to target the entire country.'
                  : `Targeting ${campaignData.locations.cities.length} cities, ${campaignData.locations.states.length} states, and ${campaignData.locations.zipCodes.length} ZIP codes.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* State Presets */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">States/Provinces</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button variant="outline" size="sm" onClick={() => handleStatePreset(10)}>
                      Top 10 States
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStatePreset(20)}>
                      Top 20 States
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStatePreset(LOCATION_PRESETS.states.length)}>
                      All States ({LOCATION_PRESETS.states.length})
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter states manually (comma-separated, e.g., California, Texas, New York)..."
                    value={campaignData.locations.states.join(', ')}
                    onChange={(e) => {
                      const states = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                      setCampaignData(prev => ({
                        ...prev,
                        locations: { ...prev.locations, states }
                      }));
                      autoSaveDraft();
                    }}
                    rows={2}
                  />
                  {campaignData.locations.states.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500">
                      {campaignData.locations.states.length} state(s) selected
                    </div>
                  )}
                </div>

                {/* City Presets */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Cities</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(20)}>
                      Top 20 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(50)}>
                      Top 50 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(100)}>
                      Top 100 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(200)}>
                      Top 200 Cities
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCityPreset(LOCATION_PRESETS.cities.length)}>
                      All Cities ({LOCATION_PRESETS.cities.length})
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter cities manually (comma-separated, e.g., New York, NY, Los Angeles, CA, Chicago, IL)..."
                    value={campaignData.locations.cities.join(', ')}
                    onChange={(e) => {
                      const cities = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                      setCampaignData(prev => ({
                        ...prev,
                        locations: { ...prev.locations, cities }
                      }));
                      autoSaveDraft();
                    }}
                    rows={3}
                  />
                  {campaignData.locations.cities.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500">
                      {campaignData.locations.cities.length} city/cities selected
                    </div>
                  )}
                </div>

                {/* ZIP Code Presets */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">ZIP Codes</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(1000)}>
                      1,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(5000)}>
                      5,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(10000)}>
                      10,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(15000)}>
                      15,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(30000)}>
                      30,000 ZIPs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleZipPreset(LOCATION_PRESETS.zipCodes.length)}>
                      All ZIPs ({LOCATION_PRESETS.zipCodes.length.toLocaleString()})
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter ZIP codes manually (comma-separated, e.g., 10001, 10002, 90210)..."
                    value={campaignData.locations.zipCodes.join(', ')}
                    onChange={(e) => {
                      const zips = e.target.value.split(',').map(z => z.trim()).filter(z => z);
                      setCampaignData(prev => ({
                        ...prev,
                        locations: { ...prev.locations, zipCodes: zips }
                      }));
                      autoSaveDraft();
                    }}
                    rows={3}
                  />
                  {campaignData.locations.zipCodes.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500">
                      {campaignData.locations.zipCodes.length.toLocaleString()} ZIP code(s) selected
                    </div>
                      )}
                    </div>

                {/* Summary when locations are selected */}
                {hasSpecificLocations && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 mb-1">Specific Location Targeting Active</h4>
                          <p className="text-sm text-blue-700">
                            Your campaign will target only the selected locations instead of the entire country.
                          </p>
                          <div className="mt-2 text-xs text-blue-600 space-y-1">
                            {campaignData.locations.states.length > 0 && (
                              <div>• {campaignData.locations.states.length} State(s)</div>
                            )}
                            {campaignData.locations.cities.length > 0 && (
                              <div>• {campaignData.locations.cities.length} City/Cities</div>
                            )}
                            {campaignData.locations.zipCodes.length > 0 && (
                              <div>• {campaignData.locations.zipCodes.length.toLocaleString()} ZIP Code(s)</div>
                            )}
                          </div>
                </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Info when no locations selected */}
                {!hasSpecificLocations && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800 mb-1">Whole Country Targeting</h4>
                          <p className="text-sm text-green-700">
                            Your campaign will target the entire <strong>{campaignData.targetCountry}</strong>. 
                            All cities, states, and regions within this country will be included.
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            To target specific locations only, use the preset buttons above or enter locations manually.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-end">
        <div className="text-sm text-slate-500 mr-4">Review step - no inputs to fill</div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Review Campaign</h2>
        <p className="text-slate-600">Review all ad groups, ads, keywords, and negative keywords before generating CSV</p>
      </div>

      <div className="space-y-6">
        {/* Ad Groups */}
          <Card>
            <CardHeader>
            <CardTitle>Ad Groups ({campaignData.adGroups.length})</CardTitle>
            <CardDescription>Ad groups organized by campaign structure: {campaignData.selectedStructure?.toUpperCase() || 'STAG'}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                {campaignData.adGroups.map((group, idx) => (
                  <div key={group.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {group.keywords.length} keywords
                        </p>
                      </div>
                      <Badge variant="outline">{idx + 1}</Badge>
                    </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        {/* Ads */}
          <Card>
            <CardHeader>
            <CardTitle>Ads ({campaignData.ads.length})</CardTitle>
            <CardDescription>All ads that will be used across ad groups</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
              <div className="space-y-3">
                {campaignData.ads.map((ad) => (
                  <div key={ad.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{ad.type?.toUpperCase() || ad.adType || 'RSA'}</Badge>
                      <span className="text-xs text-slate-500">
                        {ad.extensions?.length || 0} extensions
                      </span>
                    </div>
                    {ad.type === 'rsa' && ad.headlines && (
                      <p className="text-sm text-slate-700 mt-2">
                        {ad.headlines.slice(0, 3).join(' | ')}
                      </p>
                    )}
                    {(ad.type === 'dki' || ad.adType === 'DKI') && ad.headline1 && (
                      <p className="text-sm text-slate-700 mt-2">{ad.headline1}</p>
                    )}
                    {(ad.type === 'call' || ad.adType === 'CallOnly') && ad.headline1 && (
                      <p className="text-sm text-slate-700 mt-2">{ad.headline1}</p>
                    )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        {/* Keywords */}
          <Card>
            <CardHeader>
            <CardTitle>Keywords ({campaignData.selectedKeywords.length})</CardTitle>
            <CardDescription>All keywords selected for the campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
              <div className="flex flex-wrap gap-2">
                {campaignData.selectedKeywords.slice(0, 100).map((kw, idx) => (
                  <Badge key={kw.id || idx} variant="outline" className="text-xs">
                    {kw.text || kw.keyword || kw}
                  </Badge>
                ))}
                {campaignData.selectedKeywords.length > 100 && (
                  <Badge variant="secondary" className="text-xs">
                    +{campaignData.selectedKeywords.length - 100} more
                  </Badge>
                  )}
                </div>
              </ScrollArea>
          </CardContent>
        </Card>

        {/* Negative Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>Negative Keywords ({campaignData.negativeKeywords.length})</CardTitle>
            <CardDescription>Keywords that will be excluded from the campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {campaignData.negativeKeywords.map((neg, idx) => (
                <Badge 
                  key={idx} 
                  variant={DEFAULT_NEGATIVE_KEYWORDS.includes(neg) ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {neg}
                </Badge>
              ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

  // Helper function to get location count and type
  const getLocationCountAndType = () => {
    const { cities, zipCodes, states, countries } = campaignData.locations;
    
    if (cities.length > 0) {
      return { count: cities.length, type: 'Cities' };
    } else if (zipCodes.length > 0) {
      return { count: zipCodes.length, type: 'ZIP Codes' };
    } else if (states.length > 0) {
      return { count: states.length, type: 'States' };
    } else if (countries.length > 0) {
      return { count: countries.length, type: 'Countries' };
    } else {
      // Whole country targeting
      return { count: 1, type: 'Country' };
    }
  };

  const renderStep8 = () => {
    const locationInfo = getLocationCountAndType();
    const structureName = CAMPAIGN_STRUCTURES.find(s => s.id === campaignData.selectedStructure)?.name || 'STAG';
    const targetLocationText = locationInfo.count === 1 && locationInfo.type === 'Country'
      ? `${campaignData.targetCountry} (Nationwide)`
      : `${campaignData.targetCountry} (${locationInfo.type})`;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-2">Campaign Created Successfully!</h2>
          <p className="text-lg text-slate-600">Your campaign is ready to export and implement.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-indigo-600 mb-1">1</div>
              <div className="text-sm text-slate-600">Campaign</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{campaignData.adGroups.length}</div>
              <div className="text-sm text-slate-600">Ad Groups</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">{campaignData.selectedKeywords.length}</div>
              <div className="text-sm text-slate-600">Keywords</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">{locationInfo.count}</div>
              <div className="text-sm text-slate-600">Locations ({locationInfo.type})</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Campaign Summary</CardTitle>
            <CardDescription>All checks passed - ready for export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">Campaign Name</Label>
                <p className="text-sm font-medium text-slate-800 mt-1">{campaignData.campaignName}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Structure</Label>
                <p className="text-sm font-medium text-slate-800 mt-1">{structureName}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-slate-500">Target Location</Label>
                <p className="text-sm font-medium text-slate-800 mt-1">{targetLocationText}</p>
              </div>
            </div>
            {/* Cities Summary - Show if cities are selected */}
            {campaignData.locations.cities.length > 0 && (() => {
              const cityCount = campaignData.locations.cities.length;
              const presetCounts = [20, 50, 100, 200, LOCATION_PRESETS.cities.length];
              const isPreset = presetCounts.includes(cityCount);
              const presetLabel = cityCount === 20 ? 'Top 20 Cities' :
                                cityCount === 50 ? 'Top 50 Cities' :
                                cityCount === 100 ? 'Top 100 Cities' :
                                cityCount === 200 ? 'Top 200 Cities' :
                                cityCount === LOCATION_PRESETS.cities.length ? 'All Cities' : null;
              
              return (
                <div className="mt-4 pt-4 border-t">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {presetLabel || 'Custom Cities'}
                          </p>
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                            {cityCount} selected
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-slate-600 mb-2">Selected cities:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {campaignData.locations.cities.slice(0, 10).map((city, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-white text-slate-700 border-slate-300">
                                {city}
                              </Badge>
                            ))}
                            {cityCount > 10 && (
                              <Badge variant="secondary" className="text-xs bg-white text-slate-500 border-slate-300">
                                +{cityCount - 10} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Validation Complete</span>
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Your campaign is validated and ready to export. Click 'Download CSV' below to get your file.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(6)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Review
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Reset and start new campaign
              window.location.reload();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Another Campaign
          </Button>
          <Button
            onClick={() => {
              const blob = new Blob([campaignData.csvData], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${campaignData.campaignName || 'campaign'}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              
              // Redirect to dashboard
              setTimeout(() => {
                const event = new CustomEvent('navigate', { detail: { tab: 'dashboard' } });
                window.dispatchEvent(event);
                if (window.location.hash) {
                  window.location.hash = '#dashboard';
                }
              }, 1000);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Dispatch custom event for App.tsx to handle
              const event = new CustomEvent('navigate', { detail: { tab: 'dashboard' } });
              window.dispatchEvent(event);
              
              // Fallback: Update URL hash
              if (window.location.hash !== '#dashboard') {
                window.location.hash = '#dashboard';
              }
              
              // Additional fallback: Try direct navigation after a short delay
              setTimeout(() => {
                const event2 = new CustomEvent('navigate', { detail: { tab: 'dashboard' } });
                window.dispatchEvent(event2);
              }, 100);
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  };

  const renderStep7 = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-end">
        <div className="text-sm text-slate-500 mr-4">CSV generation step - no inputs to fill</div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">CSV Generation & Validation</h2>
        <p className="text-slate-600">Review your campaign CSV and fix any errors before exporting</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CSV Headers</CardTitle>
          <CardDescription>Brief overview of CSV structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Campaign', 'Ad Group', 'Row Type', 'Final URL', 'Headline 1', 'Description 1', 'Status'].map(header => (
              <Badge key={header} variant="outline">{header}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateCSV} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
            Generate CSV
          </Button>
        </CardContent>
      </Card>

      {campaignData.csvErrors.length > 0 && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {campaignData.csvErrors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {campaignData.csvData && campaignData.csvErrors.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-600">CSV Ready</CardTitle>
            </div>
            <CardDescription>Your CSV has been validated and is ready for export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button onClick={handleSaveCampaign} className="w-full" size="lg">
                <Star className="w-5 h-5 mr-2" />
              Save Campaign & Go to Dashboard
            </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const blob = new Blob([campaignData.csvData], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${campaignData.campaignName || 'campaign'}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Progress bar
  const steps = [
    { id: 1, label: 'URL Input' },
    { id: 2, label: 'Structure' },
    { id: 3, label: 'Keywords' },
    { id: 4, label: 'Ads & Extensions' },
    { id: 5, label: 'Geo Target' },
    { id: 6, label: 'Review' },
    { id: 7, label: 'CSV & Validate' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep === step.id ? 'text-indigo-600' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          <span className="text-sm text-slate-600">
            Step {currentStep} of {steps.length}
          </span>
            <Button
              onClick={() => {
                if (currentStep === 1) handleUrlSubmit();
                else if (currentStep === 2) handleNextFromStructure();
              else if (currentStep === 3) {
                if (campaignData.generatedKeywords.length === 0 && campaignData.seedKeywords.length > 0) {
                  const seedKeywordsAsKeywords = createKeywordsFromSeeds(campaignData.seedKeywords);
                  setCampaignData(prev => ({
                    ...prev,
                    generatedKeywords: seedKeywordsAsKeywords,
                    selectedKeywords: seedKeywordsAsKeywords,
                  }));
                }
                setCurrentStep(4);
              }
              else if (currentStep === 4) {
                if (campaignData.ads.length === 0) {
                  notifications.warning('Please generate ads first', { title: 'Ads Required' });
                  return;
                }
                setCurrentStep(5);
              }
              else if (currentStep === 5) {
                setCurrentStep(6);
                autoSaveDraft();
              }
              else if (currentStep === 6) {
                setCurrentStep(7);
                autoSaveDraft();
              }
              else if (currentStep === 7) {
                handleSaveCampaign();
              }
              else if (currentStep === 8) {
                // Success screen - no action needed
              }
              }}
              disabled={loading || currentStep === 8}
            size="sm"
            >
            {currentStep === 7 ? 'Save & Finish' : currentStep === 8 ? 'Download CSV' : 'Next Step'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

      {/* Content */}
      <div className="py-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
        {currentStep === 7 && renderStep7()}
        {currentStep === 8 && renderStep8()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between">
            <Button
              variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => {
              if (currentStep === 1) handleUrlSubmit();
              else if (currentStep === 2) handleNextFromStructure();
              else if (currentStep === 3) {
                if (campaignData.generatedKeywords.length === 0 && campaignData.seedKeywords.length > 0) {
                  const seedKeywordsAsKeywords = createKeywordsFromSeeds(campaignData.seedKeywords);
                  setCampaignData(prev => ({
                    ...prev,
                    generatedKeywords: seedKeywordsAsKeywords,
                    selectedKeywords: seedKeywordsAsKeywords,
                  }));
                }
                setCurrentStep(4);
              }
              else if (currentStep === 4) {
                if (campaignData.ads.length === 0) {
                  notifications.warning('Please generate ads first', { title: 'Ads Required' });
                  return;
                }
                setCurrentStep(5);
              }
              else if (currentStep === 5) {
                setCurrentStep(6);
                autoSaveDraft();
              }
              else if (currentStep === 6) {
                setCurrentStep(7);
                autoSaveDraft();
              }
              else if (currentStep === 7) {
                handleSaveCampaign();
              }
              else if (currentStep === 8) {
                // Success screen - no action needed
              }
            }}
            disabled={loading || currentStep === 8}
          >
            {currentStep === 7 ? 'Save & Finish' : currentStep === 8 ? 'Download CSV' : 'Next Step'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
    </div>
  );
};

// Helper functions
function detectVertical(landingData: LandingPageExtractionResult): string {
  const text = (landingData.title || '') + ' ' + (landingData.h1 || '') + ' ' + landingData.page_text_tokens.join(' ');
  const lowerText = text.toLowerCase();

  if (lowerText.includes('product') || lowerText.includes('shop') || lowerText.includes('buy') || lowerText.includes('cart')) {
    return 'E-commerce';
  }
  if (lowerText.includes('service') || lowerText.includes('consulting') || lowerText.includes('agency')) {
    return 'Services';
  }
  if (lowerText.includes('health') || lowerText.includes('medical') || lowerText.includes('doctor')) {
    return 'Healthcare';
  }
  if (lowerText.includes('law') || lowerText.includes('legal') || lowerText.includes('attorney')) {
    return 'Legal';
  }
  if (lowerText.includes('real estate') || lowerText.includes('property') || lowerText.includes('home')) {
    return 'Real Estate';
  }
  return 'General';
}

function detectCTA(landingData: LandingPageExtractionResult): string {
  const text = (landingData.title || '') + ' ' + (landingData.h1 || '') + ' ' + landingData.page_text_tokens.join(' ');
  const lowerText = text.toLowerCase();

  if (lowerText.includes('call') || lowerText.includes('phone') || landingData.phones?.length > 0) {
    return 'Call';
  }
  if (lowerText.includes('contact') || lowerText.includes('form') || lowerText.includes('quote')) {
    return 'Contact/Lead';
  }
  if (lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('order')) {
    return 'Purchase';
  }
  return 'Visit';
}

async function generateSeedKeywords(
  landingData: LandingPageExtractionResult,
  intent: IntentResult
): Promise<string[]> {
  // Use AI to generate 3-4 seed keywords
  const keywords: string[] = [];
  
  const mainTerms = [
    landingData.title,
    landingData.h1,
    ...landingData.services.slice(0, 2),
  ].filter(Boolean);

  mainTerms.forEach(term => {
    if (term && keywords.length < 4) {
      keywords.push(term.toLowerCase());
    }
  });

  // Add intent-based keywords
  if (intent.intentId === IntentId.CALL) {
    keywords.push(`${mainTerms[0]} near me`);
  } else if (intent.intentId === IntentId.LEAD) {
    keywords.push(`${mainTerms[0]} quote`);
  }

  return keywords.slice(0, 4);
}

function rankCampaignStructures(intent: IntentResult, vertical: string): { id: string; score: number }[] {
  // AI-based ranking logic
  const scores: { [key: string]: number } = {};

  // Base scores
  CAMPAIGN_STRUCTURES.forEach(struct => {
    scores[struct.id] = 0;
  });

  // Intent-based scoring
  if (intent.intentId === IntentId.CALL) {
    scores['skag'] += 3;
    scores['geo'] += 2;
    scores['intent'] += 2;
  } else if (intent.intentId === IntentId.LEAD) {
    scores['stag'] += 3;
    scores['funnel'] += 2;
    scores['intent'] += 2;
  } else {
    scores['stag'] += 3;
    scores['mix'] += 2;
    scores['stag_plus'] += 2;
  }

  // Vertical-based scoring
  if (vertical === 'E-commerce') {
    scores['brand_split'] += 2;
    scores['funnel'] += 2;
  } else if (vertical === 'Services') {
    scores['geo'] += 2;
    scores['intent'] += 2;
  }

  // Convert to ranked array
  return Object.entries(scores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}

function detectIsProduct(url: string, intent: IntentResult | null): boolean {
  // Simple detection - can be enhanced
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('shop') || lowerUrl.includes('product') || lowerUrl.includes('buy') || 
         (intent?.intentId === IntentId.PURCHASE);
}


