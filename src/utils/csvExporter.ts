/**
 * CSV Exporter for Google Ads Editor
 * Converts campaign structure to Google Ads Editor CSV format
 * 
 * Google Ads Editor CSV Format Requirements:
 * - Explicit Campaign rows (Row Type: "Campaign")
 * - Explicit Ad Group rows (Row Type: "Ad group")
 * - Keyword rows (Row Type: "Keyword")
 * - Ad rows (Row Type: "Ad")
 * - Location targeting rows (Row Type: "Location")
 * - Extension rows (Row Type: "Sitelink", "Call", etc.)
 * - Negative keyword rows (Row Type: "Keyword" with Negative Keyword = "Yes")
 * - Match types must be capitalized: "Broad", "Phrase", "Exact", "Negative"
 * - Location targeting uses location names or IDs
 * - Proper row ordering: Campaigns → Ad Groups → Keywords → Ads → Extensions → Locations → Negative Keywords
 */

import { CampaignStructure, Campaign, AdGroup, Ad } from './campaignStructureGenerator';

export interface CSVRow {
  Campaign: string;
  'Campaign Type': string;
  'Ad Groups': string; // Bug_46: Changed to plural
  'Row Type': string;
  Status: string;
  'Keywords': string; // Bug_46: Changed to plural
  'Match Types': string; // Bug_46: Changed to plural
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
  'Location': string;
  'Bid Adjustment': string;
  'Is Exclusion': string;
  'Negative Keyword': string;
}

/**
 * Convert campaign structure to CSV rows
 * Google Ads Editor requires explicit rows for each entity type in correct order
 */
export function structureToCSV(structure: CampaignStructure): CSVRow[] {
  const rows: CSVRow[] = [];
  const processedCampaigns = new Set<string>();
  const processedAdGroups = new Map<string, Set<string>>(); // campaign -> set of ad groups

  structure.campaigns.forEach((campaign) => {
    // 1. Create Campaign row (only once per campaign)
    if (!processedCampaigns.has(campaign.campaign_name)) {
      rows.push(createCampaignRow(campaign));
      processedCampaigns.add(campaign.campaign_name);
      processedAdGroups.set(campaign.campaign_name, new Set());
    }

    campaign.adgroups.forEach((adGroup) => {
      const adGroupSet = processedAdGroups.get(campaign.campaign_name)!;
      
      // 2. Create Ad Group row (only once per ad group)
      if (!adGroupSet.has(adGroup.adgroup_name)) {
        rows.push(createAdGroupRow(campaign, adGroup));
        adGroupSet.add(adGroup.adgroup_name);
      }

      // 3. Create Keyword rows FIRST (before ads)
      adGroup.keywords.forEach((keyword) => {
        const matchType = getMatchType(keyword);
        const cleanKeyword = cleanKeywordText(keyword);
        rows.push(createKeywordRow(campaign, adGroup, cleanKeyword, matchType));
      });

      // 4. Create Ad rows AFTER keywords
      const ads = adGroup.ads.length > 0 ? adGroup.ads : [getDefaultAd(campaign)];
      ads.forEach((ad) => {
        rows.push(createAdRow(campaign, adGroup, ad));
        
        // 5. Create Extension rows immediately after each ad
        if (ad.extensions && Array.isArray(ad.extensions)) {
          ad.extensions.forEach((ext: any) => {
            const extensionRows = createExtensionRows(campaign, adGroup, ext);
            rows.push(...extensionRows);
          });
        }
      });

      // 6. Create Location targeting rows (if location_target is set)
      if (adGroup.location_target) {
        const locationRows = createLocationRows(campaign, adGroup, adGroup.location_target);
        rows.push(...locationRows);
      }

      // 7. Create Negative Keyword rows LAST
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
 * Create a Campaign row
 */
function createCampaignRow(campaign: Campaign): CSVRow {
  const row = createEmptyRow(campaign.campaign_name, '', 'Campaign', 'Active');
  row['Campaign Type'] = 'Search';
  return row;
}

/**
 * Create an Ad Group row
 */
function createAdGroupRow(campaign: Campaign, adGroup: AdGroup): CSVRow {
  const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Ad group', 'Active');
  return row;
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
  row.Keywords = keyword; // Bug_46: Changed to plural
  row['Match Types'] = matchType; // Bug_46: Changed to plural
  // Get final URL from first ad in the ad group
  const firstAd = adGroup.ads && adGroup.ads.length > 0 ? adGroup.ads[0] : null;
  if (firstAd && firstAd.final_url) {
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
  
  return row;
}

/**
 * Create extension rows based on extension type
 */
function createExtensionRows(campaign: Campaign, adGroup: AdGroup, ext: any): CSVRow[] {
  const rows: CSVRow[] = [];
  
  switch (ext.extensionType || ext.type) {
    case 'sitelink':
      if (ext.links && Array.isArray(ext.links)) {
        ext.links.forEach((link: any) => {
          const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Sitelink', 'Active');
          row['Asset Type'] = 'Sitelink';
          row['Link Text'] = link.text || link.linkText || '';
          row['Description Line 1'] = link.description || link.descriptionLine1 || '';
          row['Description Line 2'] = link.descriptionLine2 || '';
          row['Final URL'] = link.url || link.finalUrl || ext.finalUrl || '';
          rows.push(row);
        });
      } else if (ext.text || ext.linkText) {
        // Single sitelink
        const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Sitelink', 'Active');
        row['Asset Type'] = 'Sitelink';
        row['Link Text'] = ext.text || ext.linkText || '';
        row['Description Line 1'] = ext.description || ext.descriptionLine1 || '';
        row['Description Line 2'] = ext.descriptionLine2 || '';
        row['Final URL'] = ext.url || ext.finalUrl || '';
        rows.push(row);
      }
      break;
      
    case 'call':
      const callRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Call', 'Active');
      callRow['Asset Type'] = 'Call';
      callRow['Phone Number'] = ext.phone || ext.phoneNumber || '';
      callRow['Country Code'] = ext.countryCode || ext.country || 'US';
      rows.push(callRow);
      break;
      
    case 'callout':
      if (ext.values && Array.isArray(ext.values)) {
        ext.values.forEach((value: string) => {
          const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Callout', 'Active');
          row['Asset Type'] = 'Callout';
          row['Link Text'] = value;
          rows.push(row);
        });
      } else if (ext.text || ext.value) {
        const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Callout', 'Active');
        row['Asset Type'] = 'Callout';
        row['Link Text'] = ext.text || ext.value || '';
        rows.push(row);
      }
      break;
      
    case 'snippet':
      if (ext.values && Array.isArray(ext.values)) {
        ext.values.forEach((value: string) => {
          const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Snippet', 'Active');
          row['Asset Type'] = 'Snippet';
          row['Link Text'] = value;
          row['Description Line 1'] = ext.header || ext.title || '';
          rows.push(row);
        });
      } else if (ext.text || ext.value) {
        const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Snippet', 'Active');
        row['Asset Type'] = 'Snippet';
        row['Link Text'] = ext.text || ext.value || '';
        row['Description Line 1'] = ext.header || ext.title || '';
        rows.push(row);
      }
      break;
      
    case 'price':
      const priceRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Price', 'Active');
      priceRow['Asset Type'] = 'Price';
      const priceText = `${ext.priceQualifier || ext.qualifier || 'From'} ${ext.price || ''} ${ext.unit || ''}`.trim();
      priceRow['Link Text'] = priceText;
      rows.push(priceRow);
      break;
      
    case 'app':
      const appRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'App', 'Active');
      appRow['Asset Type'] = 'App';
      appRow['Link Text'] = ext.appLinkText || ext.text || '';
      appRow['Final URL'] = ext.appFinalUrl || ext.url || '';
      rows.push(appRow);
      break;
      
    case 'location':
      const locationExtRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Location', 'Active');
      locationExtRow['Asset Type'] = 'Location';
      locationExtRow['Link Text'] = ext.businessName || ext.name || '';
      locationExtRow['Description Line 1'] = `${ext.addressLine1 || ''}, ${ext.city || ''}, ${ext.state || ''} ${ext.postalCode || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
      locationExtRow['Phone Number'] = ext.phone || ext.phoneNumber || '';
      locationExtRow['Country Code'] = ext.country || ext.countryCode || 'US';
      rows.push(locationExtRow);
      break;
      
    case 'message':
      const messageRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Message', 'Active');
      messageRow['Asset Type'] = 'Message';
      messageRow['Link Text'] = ext.messageText || ext.text || '';
      messageRow['Phone Number'] = ext.phone || ext.phoneNumber || '';
      rows.push(messageRow);
      break;
      
    case 'leadform':
    case 'lead_form':
      const leadFormRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Lead form', 'Active');
      leadFormRow['Asset Type'] = 'Lead form';
      leadFormRow['Link Text'] = ext.formName || ext.name || '';
      leadFormRow['Description Line 1'] = ext.formDescription || ext.description || '';
      rows.push(leadFormRow);
      break;
      
    case 'promotion':
      const promotionRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Promotion', 'Active');
      promotionRow['Asset Type'] = 'Promotion';
      promotionRow['Link Text'] = ext.promotionText || ext.text || '';
      promotionRow['Description Line 1'] = ext.promotionDescription || ext.description || '';
      rows.push(promotionRow);
      break;
      
    case 'image':
      const imageRow = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Image', 'Active');
      imageRow['Asset Type'] = 'Image';
      imageRow['Link Text'] = ext.imageName || ext.name || '';
      imageRow['Description Line 1'] = ext.imageAltText || ext.altText || '';
      rows.push(imageRow);
      break;
  }
  
  return rows;
}

/**
 * Create Location targeting rows
 */
function createLocationRows(campaign: Campaign, adGroup: AdGroup, locationTarget: string): CSVRow[] {
  const rows: CSVRow[] = [];
  
  // Parse location target (could be comma-separated list)
  const locations = locationTarget.split(',').map(loc => loc.trim()).filter(loc => loc.length > 0);
  
  locations.forEach((location) => {
    const row = createEmptyRow(campaign.campaign_name, adGroup.adgroup_name, 'Location', 'Active');
    row['Location'] = location;
    row['Bid Adjustment'] = ''; // Can be set if needed
    row['Is Exclusion'] = ''; // Can be set to "Yes" to exclude
    rows.push(row);
  });
  
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
  row.Keywords = cleanNegative; // Bug_46: Changed to plural
  row['Match Types'] = 'Negative'; // Bug_46: Changed to plural
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
    'Campaign Type': '',
    'Ad Groups': adGroupName, // Bug_46: Changed to plural
    'Row Type': rowType,
    Status: status,
    'Keywords': '', // Bug_46: Changed to plural
    'Match Types': '', // Bug_46: Changed to plural
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
    'Location': '',
    'Bid Adjustment': '',
    'Is Exclusion': '',
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
  // Bug_46: Column names in plural form
  const headers: (keyof CSVRow)[] = [
    'Campaign',
    'Campaign Type',
    'Ad Groups',
    'Row Type',
    'Status',
    'Keywords',
    'Match Types',
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
    'Location',
    'Bid Adjustment',
    'Is Exclusion',
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
