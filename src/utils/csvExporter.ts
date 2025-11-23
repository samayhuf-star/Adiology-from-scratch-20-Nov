/**
 * CSV Exporter for Google Ads Editor
 * Converts campaign structure to Google Ads Editor CSV format
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
 */
export function structureToCSV(structure: CampaignStructure): CSVRow[] {
  const rows: CSVRow[] = [];

  structure.campaigns.forEach((campaign) => {
    campaign.adgroups.forEach((adGroup) => {
      // Create rows for each keyword-ad combination
      adGroup.keywords.forEach((keyword) => {
        // Determine match type from keyword format
        const matchType = getMatchType(keyword);
        const cleanKeyword = keyword.replace(/^\[|\]$|^"|"$/g, ''); // Remove brackets/quotes for display
        
        // Create one row per ad (or one row if no ads)
        const ads = adGroup.ads.length > 0 ? adGroup.ads : [getDefaultAdRow(campaign)];
        
        ads.forEach((ad) => {
          // Build final URL with paths
          let finalUrl = ad.final_url || '';
          if (ad.path1) {
            finalUrl = finalUrl.replace(/\/$/, '') + '/' + ad.path1.replace(/^\//, '');
          }
          if (ad.path2) {
            finalUrl = finalUrl.replace(/\/$/, '') + '/' + ad.path2.replace(/^\//, '');
          }
          
          rows.push({
            Campaign: campaign.campaign_name,
            'Campaign Type': 'Search',
            'Ad Group': adGroup.adgroup_name,
            'Row Type': 'ad',
            Status: 'Active',
            'Keyword': cleanKeyword,
            'Match Type': matchType,
            'Final URL': finalUrl,
            'Headline 1': ad.headline1 || '',
            'Headline 2': ad.headline2 || '',
            'Headline 3': ad.headline3 || '',
            'Headline 4': ad.headline4 || '',
            'Headline 5': ad.headline5 || '',
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
            'Description 1': ad.description1 || '',
            'Description 2': ad.description2 || '',
            'Description 3': '',
            'Description 4': '',
            'Path 1': ad.path1 || '',
            'Path 2': ad.path2 || '',
            'Asset Type': '',
            'Link Text': '',
            'Description Line 1': '',
            'Description Line 2': '',
            'Phone Number': '',
            'Country Code': '',
            'Location Target': adGroup.location_target || '',
            'Negative Keyword': ''
          });
        });
      });

      // Add extension rows
      if (adGroup.ads && adGroup.ads.length > 0) {
        adGroup.ads.forEach((ad) => {
          // Check if ad has extensions
          const extensions = (ad as any).extensions || [];
          extensions.forEach((ext: any) => {
            if (ext.extensionType === 'sitelink' && ext.links) {
              ext.links.forEach((link: any) => {
                rows.push({
                  Campaign: campaign.campaign_name,
                  'Campaign Type': 'Search',
                  'Ad Group': adGroup.adgroup_name,
                  'Row Type': 'sitelink',
                  Status: 'Active',
                  'Keyword': '',
                  'Match Type': '',
                  'Final URL': link.url || ad.final_url || '',
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
                  'Asset Type': 'Sitelink',
                  'Link Text': link.text || '',
                  'Description Line 1': link.description || '',
                  'Description Line 2': '',
                  'Phone Number': '',
                  'Country Code': '',
                  'Location Target': '',
                  'Negative Keyword': ''
                });
              });
            } else if (ext.extensionType === 'call' && ext.phone) {
              rows.push({
                Campaign: campaign.campaign_name,
                'Campaign Type': 'Search',
                'Ad Group': adGroup.adgroup_name,
                'Row Type': 'call',
                Status: 'Active',
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
                'Asset Type': 'Call',
                'Link Text': '',
                'Description Line 1': '',
                'Description Line 2': '',
                'Phone Number': ext.phone || '',
                'Country Code': 'US',
                'Location Target': '',
                'Negative Keyword': ''
              });
            } else if (ext.extensionType === 'callout' && ext.values) {
              ext.values.forEach((value: string) => {
                rows.push({
                  Campaign: campaign.campaign_name,
                  'Campaign Type': 'Search',
                  'Ad Group': adGroup.adgroup_name,
                  'Row Type': 'callout',
                  Status: 'Active',
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
                  'Asset Type': 'Callout',
                  'Link Text': value,
                  'Description Line 1': '',
                  'Description Line 2': '',
                  'Phone Number': '',
                  'Country Code': '',
                  'Location Target': '',
                  'Negative Keyword': ''
                });
              });
            } else if (ext.extensionType === 'snippet' && ext.values) {
              ext.values.forEach((value: string) => {
                rows.push({
                  Campaign: campaign.campaign_name,
                  'Campaign Type': 'Search',
                  'Ad Group': adGroup.adgroup_name,
                  'Row Type': 'snippet',
                  Status: 'Active',
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
                  'Asset Type': 'Snippet',
                  'Link Text': value,
                  'Description Line 1': ext.header || '',
                  'Description Line 2': '',
                  'Phone Number': '',
                  'Country Code': '',
                  'Location Target': '',
                  'Negative Keyword': ''
                });
              });
            }
          });
        });
      }

      // Add negative keyword rows
      if (adGroup.negative_keywords && adGroup.negative_keywords.length > 0) {
        adGroup.negative_keywords.forEach((negativeKw) => {
          const formattedNegative = negativeKw.startsWith('[') || negativeKw.startsWith('"') 
            ? negativeKw 
            : `[${negativeKw}]`;
          const cleanNegative = formattedNegative.replace(/^\[|\]$|^"|"$/g, '');
          
          rows.push({
            Campaign: campaign.campaign_name,
            'Campaign Type': 'Search',
            'Ad Group': adGroup.adgroup_name,
            'Row Type': 'keyword',
            Status: 'Active',
            'Keyword': cleanNegative,
            'Match Type': 'Negative',
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
            'Location Target': adGroup.location_target || '',
            'Negative Keyword': 'Yes'
          });
        });
      }
    });
  });

  return rows;
}

/**
 * Convert CSV rows to CSV string
 */
export function rowsToCSVString(rows: CSVRow[]): string {
  if (rows.length === 0) return '';

  // Get headers
  const headers = Object.keys(rows[0]) as (keyof CSVRow)[];

  // Create CSV content
  const csvLines: string[] = [];
  
  // Add header row
  csvLines.push(headers.map(h => escapeCSV(h)).join(','));

  // Add data rows
  rows.forEach((row) => {
    csvLines.push(headers.map(header => escapeCSV(row[header] || '')).join(','));
  });

  return csvLines.join('\n');
}

/**
 * Export campaign structure to CSV file
 */
export function exportCampaignToCSV(structure: CampaignStructure, filename: string = 'campaign_export.csv'): void {
  const rows = structureToCSV(structure);
  const csvContent = rowsToCSVString(rows);
  
  // Create blob and download
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

// Helper Functions

function getMatchType(keyword: string): string {
  if (keyword.startsWith('[') && keyword.endsWith(']')) {
    return 'Exact';
  } else if (keyword.startsWith('"') && keyword.endsWith('"')) {
    return 'Phrase';
  }
  return 'Broad';
}

function getDefaultAdRow(campaign: Campaign): Ad {
  return {
    type: 'rsa',
    headline1: 'Default Headline',
    description1: 'Default Description',
    final_url: ''
  };
}

function escapeCSV(value: string | undefined | null): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

