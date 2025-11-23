/**
 * CSV Exporter for Google Ads Editor
 * Converts campaign structure to Google Ads Editor CSV format
 */

import { CampaignStructure, Campaign, AdGroup, Ad } from './campaignStructureGenerator';

export interface CSVRow {
  Campaign: string;
  'Campaign Type': string;
  'Ad Group': string;
  Keyword: string;
  'Criterion Type': string;
  'Final URL': string;
  'Headline 1': string;
  'Headline 2': string;
  'Headline 3': string;
  'Description 1': string;
  'Description 2': string;
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
      // Create rows for each keyword
      adGroup.keywords.forEach((keyword) => {
        // Determine criterion type from keyword format
        const criterionType = getCriterionType(keyword);
        
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
            Keyword: keyword,
            'Criterion Type': criterionType,
            'Final URL': finalUrl,
            'Headline 1': ad.headline1 || '',
            'Headline 2': ad.headline2 || '',
            'Headline 3': ad.headline3 || '',
            'Description 1': ad.description1 || '',
            'Description 2': ad.description2 || '',
            'Location Target': adGroup.location_target || '',
            'Negative Keyword': ''
          });
        });
      });

      // Add negative keyword rows (one per negative keyword)
      if (adGroup.negative_keywords && adGroup.negative_keywords.length > 0) {
        adGroup.negative_keywords.forEach((negativeKw) => {
          // Format negative keyword with match type if needed
          const formattedNegative = negativeKw.startsWith('[') || negativeKw.startsWith('"') 
            ? negativeKw 
            : `[${negativeKw}]`; // Default to exact match for negatives
          
          rows.push({
            Campaign: campaign.campaign_name,
            'Campaign Type': 'Search',
            'Ad Group': adGroup.adgroup_name,
            Keyword: formattedNegative,
            'Criterion Type': 'Negative',
            'Final URL': '',
            'Headline 1': '',
            'Headline 2': '',
            'Headline 3': '',
            'Description 1': '',
            'Description 2': '',
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

function getCriterionType(keyword: string): string {
  // Check for negative keyword first
  if (keyword.toLowerCase().includes('negative')) {
    return 'Negative';
  }
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

