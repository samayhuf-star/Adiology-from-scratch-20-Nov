/**
 * Google Ads Editor CSV Exporter
 * 
 * Exports campaigns in Google Ads Editor format with Row Type column
 * Format: Row Type, Campaign, AdGroup, Keyword, Match Type, Ad Type, etc.
 * 
 * This format is compatible with Google Ads Editor import functionality
 */

import Papa from 'papaparse';
import { CampaignStructure, Campaign, AdGroup, Ad } from './campaignStructureGenerator';

// Google Ads Editor CSV Headers (with Row Type)
export const GOOGLE_ADS_EDITOR_HEADERS = [
  'Row Type',
  'Campaign',
  'Campaign ID',
  'Campaign Status',
  'Campaign Type',
  'Campaign Budget',
  'Budget Type',
  'Bidding Strategy Type',
  'Start Date',
  'End Date',
  'Location Type',
  'Location Code',
  'AdGroup',
  'AdGroup Status',
  'Default Max CPC',
  'Keyword',
  'Match Type',
  'Keyword Status',
  'Keyword Max CPC',
  'Keyword Final URL',
  'Ad Type',
  'Ad Status',
  'Headline 1',
  'Headline 2',
  'Headline 3',
  'Headline 4',
  'Headline 5',
  'Headline 6',
  'Headline 7',
  'Headline 8',
  'Headline 9',
  'Headline 10',
  'Headline 11',
  'Headline 12',
  'Headline 13',
  'Headline 14',
  'Headline 15',
  'Description 1',
  'Description 2',
  'Description 3',
  'Description 4',
  'Final URL',
  'Final Mobile URL',
  'Path1',
  'Path2',
  'Tracking Template',
  'Custom Parameters',
  'Asset Type',
  'Asset Name',
  'Asset URL',
  'Negative Keyword',
  'Operation',
];

export interface CSVRow {
  [key: string]: string | number | null | undefined;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rows: CSVRow[];
}

/**
 * Get match type from keyword format
 */
function getMatchType(keyword: string): string {
  if (!keyword) return 'BROAD';
  const trimmed = keyword.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return 'EXACT';
  } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return 'PHRASE';
  } else if (trimmed.startsWith('-[') && trimmed.endsWith(']')) {
    return 'NEGATIVE_EXACT';
  } else if (trimmed.startsWith('-"') && trimmed.endsWith('"')) {
    return 'NEGATIVE_PHRASE';
  } else if (trimmed.startsWith('-')) {
    return 'NEGATIVE_BROAD';
  }
  return 'BROAD';
}

/**
 * Clean keyword text (remove brackets/quotes)
 */
function cleanKeywordText(keyword: string): string {
  if (!keyword) return '';
  return keyword
    .replace(/^\[|\]$/g, '') // Remove exact match brackets
    .replace(/^"|"$/g, '') // Remove phrase quotes
    .replace(/^-\[|-\]$/g, '') // Remove negative exact brackets
    .replace(/^-"|-"$/g, '') // Remove negative phrase quotes
    .replace(/^-/g, '') // Remove negative prefix
    .trim();
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(date: string | null | undefined): boolean {
  if (!date || date.trim() === '') return true; // Empty dates are allowed
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validate URL format
 */
function isValidURL(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') return false;
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Convert campaign structure to Google Ads Editor CSV rows
 */
export function campaignStructureToCSVRows(structure: CampaignStructure): CSVRow[] {
  const rows: CSVRow[] = [];

  if (!structure || !structure.campaigns || structure.campaigns.length === 0) {
    return rows;
  }

  structure.campaigns.forEach((campaign) => {
    // Campaign row
    const campaignRow: CSVRow = {
      'Row Type': 'CAMPAIGN',
      'Campaign': campaign.campaign_name || '',
      'Campaign Status': 'ENABLED',
      'Campaign Type': 'SEARCH',
      'Campaign Budget': (campaign as any).budget?.toString() || '',
      'Budget Type': (campaign as any).budget_type || 'DAILY',
      'Bidding Strategy Type': (campaign as any).bidding_strategy || 'MANUAL_CPC',
      'Start Date': (campaign as any).start_date || '',
      'End Date': (campaign as any).end_date || '',
      'Location Type': (campaign as any).location_type || 'COUNTRY',
      'Location Code': (campaign as any).location_code || 'US',
      'Operation': 'NEW',
    };
    rows.push(campaignRow);

    // Process ad groups
    if (campaign.adgroups && campaign.adgroups.length > 0) {
      campaign.adgroups.forEach((adGroup) => {
        // Ad Group row
        const adGroupRow: CSVRow = {
          'Row Type': 'ADGROUP',
          'Campaign': campaign.campaign_name || '',
              'AdGroup': adGroup.adgroup_name || '',
              'AdGroup Status': 'ENABLED',
              'Default Max CPC': (adGroup as any).default_max_cpc?.toString() || '',
              'Operation': 'NEW',
        };
        rows.push(adGroupRow);

        // Keywords
        if (adGroup.keywords && adGroup.keywords.length > 0) {
          adGroup.keywords.forEach((keyword) => {
            const keywordText = typeof keyword === 'string' ? keyword : (keyword as any).keyword || keyword;
            const matchType = typeof keyword === 'string' ? getMatchType(keywordText) : ((keyword as any).matchType || getMatchType(keywordText));
            const cleanedKeyword = cleanKeywordText(keywordText);

            const keywordRow: CSVRow = {
              'Row Type': 'KEYWORD',
              'Campaign': campaign.campaign_name || '',
              'AdGroup': adGroup.adgroup_name || '',
              'Keyword': cleanedKeyword,
              'Match Type': matchType.toUpperCase(),
              'Keyword Status': 'ENABLED',
              'Keyword Max CPC': typeof keyword === 'object' && (keyword as any).maxCPC ? (keyword as any).maxCPC.toString() : '',
              'Keyword Final URL': typeof keyword === 'object' && (keyword as any).finalURL ? (keyword as any).finalURL : '',
              'Operation': 'NEW',
            };
            rows.push(keywordRow);
          });
        }

        // Ads
        if (adGroup.ads && adGroup.ads.length > 0) {
          adGroup.ads.forEach((ad) => {
            const adRow: CSVRow = {
              'Row Type': 'AD',
              'Campaign': campaign.campaign_name || '',
              'AdGroup': adGroup.adgroup_name || '',
              'Ad Type': ad.type === 'rsa' ? 'RESPONSIVE_SEARCH_AD' : 
                        ad.type === 'dki' ? 'RESPONSIVE_SEARCH_AD' :
                        ad.type === 'callonly' ? 'CALL_ONLY_AD' : 'RESPONSIVE_SEARCH_AD',
              'Ad Status': 'ENABLED',
              'Headline 1': ad.headline1 || '',
              'Headline 2': ad.headline2 || '',
              'Headline 3': ad.headline3 || '',
              'Headline 4': ad.headline4 || '',
              'Headline 5': ad.headline5 || '',
              'Headline 6': ad.headline6 || '',
              'Headline 7': ad.headline7 || '',
              'Headline 8': ad.headline8 || '',
              'Headline 9': ad.headline9 || '',
              'Headline 10': ad.headline10 || '',
              'Headline 11': ad.headline11 || '',
              'Headline 12': ad.headline12 || '',
              'Headline 13': ad.headline13 || '',
              'Headline 14': ad.headline14 || '',
              'Headline 15': ad.headline15 || '',
              'Description 1': ad.description1 || '',
              'Description 2': ad.description2 || '',
              'Description 3': ad.description3 || '',
              'Description 4': ad.description4 || '',
              'Final URL': ad.final_url || '',
              'Final Mobile URL': (ad as any).final_mobile_url || '',
              'Path1': ad.path1 || '',
              'Path2': ad.path2 || '',
              'Tracking Template': (ad as any).tracking_template || '',
              'Custom Parameters': (ad as any).custom_parameters || '',
              'Operation': 'NEW',
            };
            rows.push(adRow);
          });
        }

        // Negative Keywords
        if (adGroup.negative_keywords && adGroup.negative_keywords.length > 0) {
          adGroup.negative_keywords.forEach((negativeKeyword) => {
            const keywordText = typeof negativeKeyword === 'string' ? negativeKeyword : (negativeKeyword as any).keyword || negativeKeyword;
            const matchType = typeof negativeKeyword === 'string' ? getMatchType(keywordText) : ((negativeKeyword as any).matchType || getMatchType(keywordText));
            const cleanedKeyword = cleanKeywordText(keywordText);

            const negativeRow: CSVRow = {
              'Row Type': 'NEGATIVE_KEYWORD',
              'Campaign': campaign.campaign_name || '',
              'AdGroup': adGroup.adgroup_name || '',
              'Negative Keyword': cleanedKeyword,
              'Match Type': matchType.toUpperCase(),
              'Operation': 'NEW',
            };
            rows.push(negativeRow);
          });
        }
      });
    }
  });

  return rows;
}

/**
 * Validate CSV rows before export
 */
export function validateCSVRows(rows: CSVRow[]): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rows.length === 0) {
    errors.push('No rows to export');
    return { isValid: false, errors, warnings, rows: [] };
  }

  const campaignNames = new Set<string>();
  const adGroupMap = new Map<string, Set<string>>(); // campaign -> ad groups

  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const rowType = (row['Row Type'] || '').toString().toUpperCase();

    // Validate Row Type
    if (!rowType) {
      errors.push(`Row ${rowNum}: Missing Row Type`);
      return;
    }

    const validRowTypes = ['CAMPAIGN', 'ADGROUP', 'KEYWORD', 'AD', 'NEGATIVE_KEYWORD', 'ASSET', 'LOCATION'];
    if (!validRowTypes.includes(rowType)) {
      errors.push(`Row ${rowNum}: Invalid Row Type "${rowType}"`);
    }

    // Campaign validation
    if (rowType === 'CAMPAIGN') {
      const campaignName = (row['Campaign'] || '').toString().trim();
      if (!campaignName) {
        errors.push(`Row ${rowNum}: Campaign name is required`);
      } else {
        campaignNames.add(campaignName);
      }

      const startDate = (row['Start Date'] || '').toString();
      if (startDate && !isValidDate(startDate)) {
        errors.push(`Row ${rowNum}: Start Date must be in YYYY-MM-DD format`);
      }

      const endDate = (row['End Date'] || '').toString();
      if (endDate && !isValidDate(endDate)) {
        errors.push(`Row ${rowNum}: End Date must be in YYYY-MM-DD format`);
      }

      const budget = (row['Campaign Budget'] || '').toString();
      if (budget && isNaN(parseFloat(budget))) {
        errors.push(`Row ${rowNum}: Campaign Budget must be a number`);
      }
    }

    // Ad Group validation
    if (rowType === 'ADGROUP') {
      const campaignName = (row['Campaign'] || '').toString().trim();
      const adGroupName = (row['AdGroup'] || '').toString().trim();

      if (!campaignName) {
        errors.push(`Row ${rowNum}: Campaign name is required for Ad Group`);
      }
      if (!adGroupName) {
        errors.push(`Row ${rowNum}: Ad Group name is required`);
      } else {
        if (!adGroupMap.has(campaignName)) {
          adGroupMap.set(campaignName, new Set());
        }
        adGroupMap.get(campaignName)!.add(adGroupName);
      }

      const maxCPC = (row['Default Max CPC'] || '').toString();
      if (maxCPC && isNaN(parseFloat(maxCPC))) {
        errors.push(`Row ${rowNum}: Default Max CPC must be a number`);
      }
    }

    // Keyword validation
    if (rowType === 'KEYWORD') {
      const campaignName = (row['Campaign'] || '').toString().trim();
      const adGroupName = (row['AdGroup'] || '').toString().trim();
      const keyword = (row['Keyword'] || '').toString().trim();
      const matchType = (row['Match Type'] || '').toString().toUpperCase();

      if (!campaignName) {
        errors.push(`Row ${rowNum}: Campaign name is required for Keyword`);
      }
      if (!adGroupName) {
        errors.push(`Row ${rowNum}: Ad Group name is required for Keyword`);
      }
      if (!keyword) {
        errors.push(`Row ${rowNum}: Keyword text is required`);
      }

      const validMatchTypes = ['BROAD', 'PHRASE', 'EXACT'];
      if (matchType && !validMatchTypes.includes(matchType)) {
        errors.push(`Row ${rowNum}: Invalid Match Type "${matchType}"`);
      }

      const maxCPC = (row['Keyword Max CPC'] || '').toString();
      if (maxCPC && isNaN(parseFloat(maxCPC))) {
        errors.push(`Row ${rowNum}: Keyword Max CPC must be a number`);
      }

      const finalURL = (row['Keyword Final URL'] || '').toString();
      if (finalURL && !isValidURL(finalURL)) {
        errors.push(`Row ${rowNum}: Keyword Final URL must be a valid URL`);
      }
    }

    // Ad validation
    if (rowType === 'AD') {
      const campaignName = (row['Campaign'] || '').toString().trim();
      const adGroupName = (row['AdGroup'] || '').toString().trim();
      const adType = (row['Ad Type'] || '').toString().toUpperCase();
      const finalURL = (row['Final URL'] || '').toString();

      if (!campaignName) {
        errors.push(`Row ${rowNum}: Campaign name is required for Ad`);
      }
      if (!adGroupName) {
        errors.push(`Row ${rowNum}: Ad Group name is required for Ad`);
      }

      const validAdTypes = ['RESPONSIVE_SEARCH_AD', 'EXPANDED_TEXT_AD', 'CALL_ONLY_AD'];
      if (adType && !validAdTypes.includes(adType)) {
        warnings.push(`Row ${rowNum}: Ad Type "${adType}" may not be recognized`);
      }

      if (!finalURL) {
        errors.push(`Row ${rowNum}: Final URL is required for Ad`);
      } else if (!isValidURL(finalURL)) {
        errors.push(`Row ${rowNum}: Final URL must be a valid URL (http:// or https://)`);
      }

      // Validate headlines for RSA
      if (adType === 'RESPONSIVE_SEARCH_AD') {
        const headlines = [
          row['Headline 1'], row['Headline 2'], row['Headline 3'],
          row['Headline 4'], row['Headline 5'], row['Headline 6'],
        ].filter(h => h && h.toString().trim());

        if (headlines.length < 3) {
          errors.push(`Row ${rowNum}: Responsive Search Ads require at least 3 headlines`);
        }

        // Check headline length
        for (let i = 1; i <= 15; i++) {
          const headline = (row[`Headline ${i}`] || '').toString();
          if (headline && headline.length > 30) {
            errors.push(`Row ${rowNum}: Headline ${i} exceeds 30 characters (${headline.length} chars)`);
          }
        }

        // Validate descriptions
        const descriptions = [
          row['Description 1'], row['Description 2'], row['Description 3'], row['Description 4'],
        ].filter(d => d && d.toString().trim());

        if (descriptions.length < 2) {
          errors.push(`Row ${rowNum}: Responsive Search Ads require at least 2 descriptions`);
        }

        // Check description length
        for (let i = 1; i <= 4; i++) {
          const description = (row[`Description ${i}`] || '').toString();
          if (description && description.length > 90) {
            errors.push(`Row ${rowNum}: Description ${i} exceeds 90 characters (${description.length} chars)`);
          }
        }
      }
    }

    // Negative Keyword validation
    if (rowType === 'NEGATIVE_KEYWORD') {
      const campaignName = (row['Campaign'] || '').toString().trim();
      const negativeKeyword = (row['Negative Keyword'] || '').toString().trim();
      const matchType = (row['Match Type'] || '').toString().toUpperCase();

      if (!campaignName) {
        errors.push(`Row ${rowNum}: Campaign name is required for Negative Keyword`);
      }
      if (!negativeKeyword) {
        errors.push(`Row ${rowNum}: Negative Keyword text is required`);
      }

      const validMatchTypes = ['NEGATIVE_BROAD', 'NEGATIVE_PHRASE', 'NEGATIVE_EXACT'];
      if (matchType && !validMatchTypes.includes(matchType)) {
        errors.push(`Row ${rowNum}: Invalid Match Type for Negative Keyword "${matchType}"`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rows,
  };
}

/**
 * Export campaign structure to CSV file with validation
 */
export async function exportCampaignToGoogleAdsEditorCSV(
  structure: CampaignStructure,
  filename: string = 'google_ads_export.csv'
): Promise<CSVValidationResult> {
  // Convert structure to CSV rows
  const rows = campaignStructureToCSVRows(structure);

  // Validate rows (but don't block export for non-critical errors)
  const validation = validateCSVRows(rows);

  // Only throw for critical errors that would make the CSV unusable
  if (!validation.isValid && validation.errors.length > 0) {
    const criticalErrors = validation.errors.filter(err => 
      err.includes('No rows to export') || 
      err.includes('Missing Row Type') ||
      err.includes('Campaign name is required')
    );
    
    if (criticalErrors.length > 0) {
      throw new Error(`CSV validation failed:\n${criticalErrors.join('\n')}`);
    }
    
    // Log non-critical errors as warnings but continue export
    if (validation.errors.length > criticalErrors.length) {
      console.warn('CSV validation warnings (export will continue):', 
        validation.errors.filter(err => !criticalErrors.includes(err)).join('\n'));
    }
  }

  // Generate CSV content using PapaParse
  const csv = Papa.unparse(rows, {
    columns: GOOGLE_ADS_EDITOR_HEADERS,
    header: true,
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return validation;
}

/**
 * Export keywords to CSV (for Keyword Mixer, Keyword Planner)
 */
export function exportKeywordsToCSV(
  keywords: Array<string | { keyword: string; matchType?: string; maxCPC?: number }>,
  campaignName: string = 'Keyword Campaign',
  adGroupName: string = 'All Keywords',
  filename: string = 'keywords_export.csv'
): CSVValidationResult {
  const rows: CSVRow[] = [];

  // Campaign row
  rows.push({
    'Row Type': 'CAMPAIGN',
    'Campaign': campaignName,
    'Campaign Status': 'ENABLED',
    'Campaign Type': 'SEARCH',
    'Operation': 'NEW',
  });

  // Ad Group row
  rows.push({
    'Row Type': 'ADGROUP',
    'Campaign': campaignName,
    'AdGroup': adGroupName,
    'AdGroup Status': 'ENABLED',
    'Operation': 'NEW',
  });

  // Keyword rows
  keywords.forEach((keyword) => {
    const keywordText = typeof keyword === 'string' ? keyword : keyword.keyword || '';
    const matchType = typeof keyword === 'string' ? getMatchType(keywordText) : (keyword.matchType || getMatchType(keywordText));
    const cleanedKeyword = cleanKeywordText(keywordText);

    rows.push({
      'Row Type': 'KEYWORD',
      'Campaign': campaignName,
      'AdGroup': adGroupName,
      'Keyword': cleanedKeyword,
      'Match Type': matchType.toUpperCase(),
      'Keyword Status': 'ENABLED',
      'Keyword Max CPC': typeof keyword === 'object' && keyword.maxCPC ? keyword.maxCPC.toString() : '',
      'Operation': 'NEW',
    });
  });

  // Validate
  const validation = validateCSVRows(rows);

  if (!validation.isValid) {
    throw new Error(`CSV validation failed:\n${validation.errors.join('\n')}`);
  }

  // Generate CSV
  const csv = Papa.unparse(rows, {
    columns: GOOGLE_ADS_EDITOR_HEADERS,
    header: true,
  });

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return validation;
}

/**
 * Export negative keywords to CSV
 */
export function exportNegativeKeywordsToCSV(
  negativeKeywords: Array<string | { keyword: string; matchType?: string }>,
  campaignName: string = 'Negative Keywords Campaign',
  adGroupName: string = 'All Ad Groups',
  filename: string = 'negative_keywords_export.csv'
): CSVValidationResult {
  const rows: CSVRow[] = [];

  // Campaign row
  rows.push({
    'Row Type': 'CAMPAIGN',
    'Campaign': campaignName,
    'Campaign Status': 'ENABLED',
    'Campaign Type': 'SEARCH',
    'Operation': 'NEW',
  });

  // Ad Group row
  rows.push({
    'Row Type': 'ADGROUP',
    'Campaign': campaignName,
    'AdGroup': adGroupName,
    'AdGroup Status': 'ENABLED',
    'Operation': 'NEW',
  });

  // Negative Keyword rows
  negativeKeywords.forEach((keyword) => {
    const keywordText = typeof keyword === 'string' ? keyword : keyword.keyword || '';
    const matchType = typeof keyword === 'string' ? getMatchType(keywordText) : (keyword.matchType || getMatchType(keywordText));
    const cleanedKeyword = cleanKeywordText(keywordText);

    rows.push({
      'Row Type': 'NEGATIVE_KEYWORD',
      'Campaign': campaignName,
      'AdGroup': adGroupName,
      'Negative Keyword': cleanedKeyword,
      'Match Type': matchType.toUpperCase(),
      'Operation': 'NEW',
    });
  });

  // Validate
  const validation = validateCSVRows(rows);

  if (!validation.isValid) {
    throw new Error(`CSV validation failed:\n${validation.errors.join('\n')}`);
  }

  // Generate CSV
  const csv = Papa.unparse(rows, {
    columns: GOOGLE_ADS_EDITOR_HEADERS,
    header: true,
  });

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return validation;
}

