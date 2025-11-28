/**
 * Campaign Intelligence - Data Schemas
 * 
 * TypeScript interfaces for all campaign intelligence modules
 * 
 * TODO: Update with actual schemas from user specifications
 */

// ============================================================================
// Intent Classification
// ============================================================================

export type CampaignGoal = 'calls' | 'leads' | 'purchases' | 'traffic';
export type CampaignIntent = 'CALL_INTENT' | 'LEAD_INTENT' | 'TRAFFIC_INTENT' | 'PURCHASE_INTENT';
export type MatchType = 'exact' | 'phrase' | 'broad' | 'broad_modifier';

export interface IntentClassification {
  intent: CampaignIntent;
  suggestedMatchTypes: MatchType[];
  tone: 'urgent' | 'professional' | 'friendly' | 'authoritative';
  voice: string;
  confidence: number; // 0-1
}

// ============================================================================
// Landing Page Extraction
// ============================================================================

export interface LandingPageData {
  url: string;
  title: string | null;
  h1: string | null;
  metaDescription: string | null;
  services: string[];
  serviceAreas: string[];
  phoneNumbers: string[];
  businessHours: string | null;
  address: string | null;
  extractedAt: string;
  extractionMethod: 'crawl' | 'api' | 'manual';
}

// ============================================================================
// Vertical Templates
// ============================================================================

export type Vertical = 
  | 'electrician' 
  | 'plumber' 
  | 'hvac' 
  | 'roofer' 
  | 'painter'
  | 'lawyer'
  | 'dentist'
  | 'doctor'
  | 'restaurant'
  | 'auto_repair'
  | 'general';

export interface VerticalTemplate {
  vertical: Vertical;
  serviceTokens: string[];
  durationTokens: string[];
  priceTokens: string[];
  regulatoryFlags: string[];
  disclaimers: string[];
  adTemplates: AdTemplate[];
  keywordModifiers: string[];
}

export interface AdTemplate {
  id: string;
  headlinePatterns: string[];
  descriptionPatterns: string[];
  ctaPatterns: string[];
  pathPatterns: string[];
  intent: CampaignIntent[];
}

// ============================================================================
// Bid Suggestions
// ============================================================================

export interface BidSuggestion {
  keyword: string;
  matchType: MatchType;
  intent: CampaignIntent;
  suggestedCPC: number;
  suggestedCPCFormatted: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  baseCPCMultiplier: number;
}

export interface BidTier {
  matchType: MatchType;
  intent: CampaignIntent;
  multiplier: {
    min: number;
    max: number;
    default: number;
  };
}

// ============================================================================
// Policy & Safety
// ============================================================================

export interface PolicyCheck {
  passed: boolean;
  violations: PolicyViolation[];
  warnings: PolicyWarning[];
}

export interface PolicyViolation {
  type: 'prohibited_content' | 'trademark' | 'medical_claim' | 'weapon' | 'drug' | 'other';
  severity: 'critical' | 'high' | 'medium';
  message: string;
  field: string;
  value: string;
  suggestion?: string;
}

export interface PolicyWarning {
  type: 'disclaimer_missing' | 'regulatory_flag' | 'tone_mismatch' | 'other';
  message: string;
  field: string;
  value: string;
  suggestion?: string;
}

// ============================================================================
// Localization
// ============================================================================

export interface LocalizationConfig {
  geo: string; // Country code or region
  language: string; // ISO 639-1 code
  currency: string; // ISO 4217 code
  dateFormat: string;
  phoneFormat: string;
  timezone: string;
}

export interface LocalizedContent {
  original: string;
  localized: string;
  locale: string;
  confidence: number;
}

// ============================================================================
// Tracking
// ============================================================================

export interface TrackingConfig {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  dniEnabled: boolean;
  dniProvider?: 'callrail' | 'calltracking' | 'invoca' | 'custom';
  trackingNumber?: string;
  clickTrackingEnabled: boolean;
}

export interface TrackingParams {
  finalUrl: string;
  trackingUrl: string;
  utmParams: Record<string, string>;
  dniParams?: Record<string, string>;
}

// ============================================================================
// Device Defaults
// ============================================================================

export interface DeviceConfig {
  primaryDevice: 'mobile' | 'desktop' | 'tablet' | 'all';
  mobileOptimizations: MobileOptimizations;
  desktopOptimizations: DesktopOptimizations;
}

export interface MobileOptimizations {
  shorterHeadlines: boolean;
  callExtensions: boolean;
  clickToCall: boolean;
  simplifiedCTAs: boolean;
  maxHeadlineLength: number; // Typically 25-30 for mobile
}

export interface DesktopOptimizations {
  longerDescriptions: boolean;
  multipleCTAs: boolean;
  detailedBenefits: boolean;
  maxDescriptionLength: number; // Typically 90 for desktop
}

// ============================================================================
// Combined Campaign Intelligence
// ============================================================================

export interface CampaignIntelligence {
  intent: IntentClassification;
  landingPage: LandingPageData;
  vertical: VerticalTemplate | null;
  bidSuggestions: BidSuggestion[];
  policyCheck: PolicyCheck;
  localization: LocalizationConfig;
  tracking: TrackingConfig;
  deviceConfig: DeviceConfig;
  generatedAt: string;
}

