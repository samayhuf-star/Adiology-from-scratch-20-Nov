/**
 * CSV Exporter for Google Ads Editor
 * Converts campaign structure to Google Ads Editor CSV format
 * 
 * Google Ads Editor CSV Format Requirements:
 * - Each row must have a clear Row Type (Campaign, Ad group, Keyword, Ad, etc.)
 * - Match types must be capitalized: "Broad", "Phrase", "Exact", "Negative"
 * - Location targeting uses numeric IDs, not names
 * - Separate rows for different entity types
 * - All required columns must be present
 */

import { CampaignStructure, Campaign, AdGroup, Ad } from './campaignStructureGenerator';

export interface CSVRow {
  Campaign: string;
  'Campaign Type': string;
  'Ad Group': string;
  'Row Type': string;
  Status: string;
  'Keyword': string;
  'Match Type': string;
  'Final URL': string;
  'Headline 1': string;
  'Headline 2': string;
  'Headline 3': string;
  'Headline 4': string;
  'Headline 5': string;
  'Headline 6': string;
  'Headline 7': string;
  'Headline 8': string;
  'Headline 9': string;
  'Headline 10': string;
  'Headline 11': string;
  'Headline 12': string;
  'Headline 13': string;
  'Headline 14': string;
  'Headline 15': string;
  'Description 1': string;
  'Description 2': string;
  'Description 3': string;
  'Description 4': string;
  'Path 1': string;
  'Path 2': string;
  'Asset Type': string;
  'Link Text': string;
  'Description Line 1': string;
  'Description Line 2': string;
  'Phone Number': string;
  'Country Code': string;
  'Location Target': string;
  'Negative Keyword': string;
}

/**
 * Convert campaign structure to CSV rows
 * Google Ads Editor requires separate rows for different entity types
 */
export function structureToCSV(structure: CampaignStructure): CSVRow[] {
  const rows: CSVRow[] = [];

  structure.campaigns.forEach((campaign) => {
    campaign.adgroups.forEach((adGroup) => {
      // IMPORTANT: Google Ads Editor infers Ad Groups from context
      // We don't create explicit Ad Group rows to avoid "Ambiguous row type" errors
      
      // Create rows for each keyword FIRST (before ads)
      adGroup.keywords.forEach((keyword) => {
        const matchType = getMatchType(keyword);
        const cleanKeyword = cleanKeywordText(keyword);
        
        // Create keyword row
        rows.push(createKeywordRow(campaign, adGroup, cleanKeyword, matchType));
      });

      // Create rows for each ad AFTER keywords
      const ads = adGroup.ads.length > 0 ? adGroup.ads : [getDefaultAd(campaign)];
      
      ads.forEach((ad) => {
        // Create ad row
        rows.push(createAdRow(campaign, adGroup, ad));
        
        // Create extension rows if ad has extensions
        if (ad.extensions && Array.isArray(ad.extensions)) {
          ad.extensions.forEach((ext: any) => {
            const extensionRows = createExtensionRows(campaign, adGroup, ext);
            rows.push(...extensionRows);
          });
        }
      });

      // Create negative keyword rows LAST
      if (adGroup.negative_keywords && adGroup.negative_keywords.length > 0) {
        adGroup.negative_keywords.forEach((negativeKw) => {
          rows.push(createNegativeKeywordRow(campaign, adGroup, negativeKw));
        });
      }
    });
  });

  return rows;
}

/**
 * Create a Keyword row
 */
function createKeywordRow(
  campaign: Campaign,
  adGroup: AdGroup,
  keyword: string,
  matchType: string
): CSVRow {
  const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Keyword', 'Active');
  row.Keyword = keyword;
  row['Match Type'] = matchType;
  // Get final URL from first ad in the ad group
  const firstAd = adGroup.ads && adGroup.ads.length > 0 ? adGroup.ads[0] : null;
  if (firstAd) {
    let finalUrl = firstAd.final_url || '';
    if (firstAd.path1) {
      finalUrl = finalUrl.replace(/\/$/, '') + '/' + firstAd.path1.replace(/^\//, '');
    }
    row['Final URL'] = finalUrl;
  }
  return row;
}

/**
 * Create an Ad row (Responsive Search Ad)
 */
function createAdRow(campaign: Campaign, adGroup: AdGroup, ad: Ad): CSVRow {
  const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Ad', 'Active');
  
  // Build final URL with paths
  let finalUrl = ad.final_url || '';
  if (ad.path1) {
    finalUrl = finalUrl.replace(/\/$/, '') + '/' + ad.path1.replace(/^\//, '');
  }
  if (ad.path2) {
    finalUrl = finalUrl.replace(/\/$/, '') + '/' + ad.path2.replace(/^\//, '');
  }
  
  row['Final URL'] = finalUrl;
  row['Headline 1'] = ad.headline1 || '';
  row['Headline 2'] = ad.headline2 || '';
  row['Headline 3'] = ad.headline3 || '';
  row['Headline 4'] = ad.headline4 || '';
  row['Headline 5'] = ad.headline5 || '';
  row['Description 1'] = ad.description1 || '';
  row['Description 2'] = ad.description2 || '';
  row['Path 1'] = ad.path1 || '';
  row['Path 2'] = ad.path2 || '';
  
  // Add location target if available
  if (adGroup.location_target) {
    row['Location Target'] = adGroup.location_target;
  }
  
  return row;
}

/**
 * Create extension rows based on extension type
 */
function createExtensionRows(campaign: Campaign, adGroup: AdGroup, ext: any): CSVRow[] {
  const rows: CSVRow[] = [];
  const baseRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Ad extension', 'Active');
  
  switch (ext.extensionType) {
    case 'sitelink':
      if (ext.links && Array.isArray(ext.links)) {
        ext.links.forEach((link: any) => {
          const row = { ...baseRow };
          row['Asset Type'] = 'Sitelink';
          row['Link Text'] = link.text || '';
          row['Description Line 1'] = link.description || '';
          row['Final URL'] = link.url || ext.finalUrl || '';
          rows.push(row);
        });
      }
      break;
      
    case 'call':
      const callRow = { ...baseRow };
      callRow['Asset Type'] = 'Call';
      callRow['Phone Number'] = ext.phone || '';
      callRow['Country Code'] = ext.countryCode || 'US';
      rows.push(callRow);
      break;
      
    case 'callout':
      if (ext.values && Array.isArray(ext.values)) {
        ext.values.forEach((value: string) => {
          const row = { ...baseRow };
          row['Asset Type'] = 'Callout';
          row['Link Text'] = value;
          rows.push(row);
        });
      }
      break;
      
    case 'snippet':
      if (ext.values && Array.isArray(ext.values)) {
        ext.values.forEach((value: string) => {
          const row = { ...baseRow };
          row['Asset Type'] = 'Snippet';
          row['Link Text'] = value;
          row['Description Line 1'] = ext.header || '';
          rows.push(row);
        });
      }
      break;
      
    case 'price':
      const priceRow = { ...baseRow };
      priceRow['Asset Type'] = 'Price';
      priceRow['Link Text'] = `${ext.priceQualifier || 'From'} ${ext.price || ''} ${ext.unit || ''}`;
      rows.push(priceRow);
      break;
      
    case 'app':
      const appRow = { ...baseRow };
      appRow['Asset Type'] = 'App';
      appRow['Link Text'] = ext.appLinkText || '';
      appRow['Final URL'] = ext.appFinalUrl || '';
      rows.push(appRow);
      break;
      
    case 'location':
      const locationRow = { ...baseRow };
      locationRow['Asset Type'] = 'Location';
      locationRow['Link Text'] = ext.businessName || '';
      locationRow['Description Line 1'] = `${ext.addressLine1 || ''}, ${ext.city || ''}, ${ext.state || ''} ${ext.postalCode || ''}`;
      locationRow['Phone Number'] = ext.phone || '';
      locationRow['Country Code'] = ext.country || 'US';
      rows.push(locationRow);
      break;
      
    case 'message':
      const messageRow = { ...baseRow };
      messageRow['Asset Type'] = 'Message';
      messageRow['Link Text'] = ext.messageText || '';
      messageRow['Phone Number'] = ext.phone || '';
      rows.push(messageRow);
      break;
      
    case 'leadform':
      const leadFormRow = { ...baseRow };
      leadFormRow['Asset Type'] = 'Lead form';
      leadFormRow['Link Text'] = ext.formName || '';
      leadFormRow['Description Line 1'] = ext.formDescription || '';
      rows.push(leadFormRow);
      break;
      
    case 'promotion':
      const promotionRow = { ...baseRow };
      promotionRow['Asset Type'] = 'Promotion';
      promotionRow['Link Text'] = ext.promotionText || '';
      promotionRow['Description Line 1'] = ext.promotionDescription || '';
      rows.push(promotionRow);
      break;
      
    case 'image':
      const imageRow = { ...baseRow };
      imageRow['Asset Type'] = 'Image';
      imageRow['Link Text'] = ext.imageName || '';
      imageRow['Description Line 1'] = ext.imageAltText || '';
      rows.push(imageRow);
      break;
  }
  
  return rows;
}

/**
 * Create a negative keyword row
 */
function createNegativeKeywordRow(
  campaign: Campaign,
  adGroup: AdGroup,
  negativeKw: string
): CSVRow {
  const cleanNegative = cleanKeywordText(negativeKw);
  const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Keyword', 'Active');
  row.Keyword = cleanNegative;
  row['Match Type'] = 'Negative';
  row['Negative Keyword'] = 'Yes';
  return row;
}

/**
 * Create an empty row with basic structure
 */
function createEmptyRow(
  campaignName: string,
  adGroupName: string,
  rowType: string,
  status: string = 'Active'
): CSVRow {
  return {
    Campaign: campaignName,
    'Campaign Type': 'Search',
    'Ad Group': adGroupName,
    'Row Type': rowType,
    Status: status,
    'Keyword': '',
    'Match Type': '',
    'Final URL': '',
    'Headline 1': '',
    'Headline 2': '',
    'Headline 3': '',
    'Headline 4': '',
    'Headline 5': '',
    'Headline 6': '',
    'Headline 7': '',
    'Headline 8': '',
    'Headline 9': '',
    'Headline 10': '',
    'Headline 11': '',
    'Headline 12': '',
    'Headline 13': '',
    'Headline 14': '',
    'Headline 15': '',
    'Description 1': '',
    'Description 2': '',
    'Description 3': '',
    'Description 4': '',
    'Path 1': '',
    'Path 2': '',
    'Asset Type': '',
    'Link Text': '',
    'Description Line 1': '',
    'Description Line 2': '',
    'Phone Number': '',
    'Country Code': '',
    'Location Target': '',
    'Negative Keyword': ''
  };
}

/**
 * Get match type from keyword format
 * Google Ads Editor requires capitalized match types
 */
function getMatchType(keyword: string): string {
  const trimmed = keyword.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return 'Exact';
  } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return 'Phrase';
  }
  return 'Broad';
}

/**
 * Clean keyword text (remove brackets/quotes for display)
 */
function cleanKeywordText(keyword: string): string {
  return keyword.replace(/^\[|\]$|^"|"$/g, '').trim();
}

/**
 * Get default ad if none exist
 */
function getDefaultAd(campaign: Campaign): Ad {
  return {
    type: 'rsa',
    headline1: 'Default Headline',
    description1: 'Default Description',
    final_url: ''
  };
}

/**
 * Convert CSV rows to CSV string with proper encoding
 */
export function rowsToCSVString(rows: CSVRow[]): string {
  if (rows.length === 0) return '';

  // Get headers in correct order
  const headers: (keyof CSVRow)[] = [
    'Campaign',
    'Campaign Type',
    'Ad Group',
    'Row Type',
    'Status',
    'Keyword',
    'Match Type',
    'Final URL',
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
    'Path 1',
    'Path 2',
    'Asset Type',
    'Link Text',
    'Description Line 1',
    'Description Line 2',
    'Phone Number',
    'Country Code',
    'Location Target',
    'Negative Keyword'
  ];

  // Create CSV content
  const csvLines: string[] = [];
  
  // Add BOM for UTF-8 encoding (helps Excel recognize UTF-8)
  csvLines.push('\ufeff');
  
  // Add header row
  csvLines.push(headers.map(h => escapeCSV(h)).join(','));

  // Add data rows
  rows.forEach((row) => {
    csvLines.push(headers.map(header => escapeCSV(row[header] || '')).join(','));
  });

  return csvLines.join('\r\n'); // Use \r\n for Windows compatibility
}

/**
 * Export campaign structure to CSV file
 */
export function exportCampaignToCSV(structure: CampaignStructure, filename: string = 'campaign_export.csv'): void {
  // Validate structure
  if (!structure || !structure.campaigns || structure.campaigns.length === 0) {
    throw new Error('Invalid campaign structure: No campaigns found');
  }

  // Generate CSV rows
  const rows = structureToCSV(structure);
  
  if (rows.length === 0) {
    throw new Error('No data to export');
  }

  // Convert to CSV string
  const csvContent = rowsToCSVString(rows);
  
  // Create blob with UTF-8 encoding
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV value
 * Handles commas, quotes, and newlines properly
 */
function escapeCSV(value: string | undefined | null): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If value contains comma, quote, newline, or carriage return, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}
