/**
 * Frontend CSV Export Integration
 * Calls backend API for proper CSV generation with validation
 */

import { api } from './api';
import { notifications } from './notifications';
import { projectId, publicAnonKey } from './supabase/info';

// API Base URL
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6757d0ca`;
// For local development, use: const API_BASE = 'http://localhost:8000';

/**
 * Convert Campaign Builder 1 data to backend request format
 */
function convertToExportRequest(
  campaignName: string,
  adGroups: any[],
  generatedAds: any[],
  locationTargeting?: any,
  budget?: number,
  biddingStrategy?: string,
  negativeKeywords?: string,
  allAdGroupsValue: string = 'ALL_AD_GROUPS'
): any {
  return {
    campaign_name: campaignName || 'Campaign 1',
    ad_groups: adGroups.map(group => ({
      name: group.name,
      keywords: Array.isArray(group.keywords) 
        ? group.keywords 
        : (typeof group.keywords === 'string' ? group.keywords.split('\n').filter((k: string) => k.trim()) : []),
      negativeKeywords: group.negativeKeywords || []
    })),
    generated_ads: generatedAds.filter(ad => 
      ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly'
    ),
    location_targeting: locationTargeting,
    budget: budget,
    bidding_strategy: biddingStrategy || 'MANUAL_CPC',
    negative_keywords: negativeKeywords 
      ? negativeKeywords.split('\n').filter((k: string) => k.trim())
      : [],
    all_ad_groups_value: allAdGroupsValue
  };
}

/**
 * Main CSV export function
 * Replaces generateCSV in CampaignBuilder.tsx
 */
export async function generateCSVWithBackend(
  campaignName: string,
  adGroups: any[],
  generatedAds: any[],
  locationTargeting?: any,
  budget?: number,
  biddingStrategy?: string,
  negativeKeywords?: string,
  allAdGroupsValue: string = 'ALL_AD_GROUPS'
): Promise<void> {
  try {
    // Show loading notification
    const loadingNotification = notifications.info('Generating CSV...', {
      title: 'Exporting',
      description: 'Validating and generating Google Ads Editor CSV file...',
      duration: 0 // Don't auto-dismiss
    });

    // Convert to backend format
    const request = convertToExportRequest(
      campaignName,
      adGroups,
      generatedAds,
      locationTargeting,
      budget,
      biddingStrategy,
      negativeKeywords,
      allAdGroupsValue
    );

    console.log('CSV Export Request:', JSON.stringify(request, null, 2));

    // Call backend API
    const response = await fetch(`${API_BASE}/export-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(request)
    });

    // Dismiss loading notification
    if (loadingNotification) {
      // notifications.dismiss(loadingNotification.id);
    }

    // Check if response is CSV file (success) or JSON (validation errors)
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/csv')) {
      // Success - download CSV file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'campaign_export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Get row count from headers
      const rowCount = response.headers.get('x-row-count');
      const warningsCount = response.headers.get('x-warnings-count');
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      let successMessage = `Campaign exported to ${filename}. Ready for Google Ads Editor import.`;
      if (warningsCount && parseInt(warningsCount) > 0) {
        successMessage += ` (${warningsCount} warning(s) - check console for details)`;
      }

      notifications.success(successMessage, {
        title: 'Export Complete',
        description: `Exported ${rowCount || 'unknown'} rows successfully.`
      });

      console.log(`✅ CSV exported: ${filename}, ${rowCount} rows`);
    } else {
      // Validation errors - parse JSON response
      const errorData = await response.json();
      
      console.error('CSV Export Validation Errors:', errorData);

      if (errorData.validation_errors && errorData.validation_errors.length > 0) {
        // Format validation errors for display
        const errorMessages = errorData.validation_errors
          .map((err: any, idx: number) => {
            const rowInfo = err.row_index ? ` (Row ${err.row_index})` : '';
            return `${idx + 1}. ${err.field}${rowInfo}: ${err.message}`;
          })
          .join('\n');

        const warningMessages = errorData.warnings && errorData.warnings.length > 0
          ? errorData.warnings
              .map((warn: any, idx: number) => {
                const rowInfo = warn.row_index ? ` (Row ${warn.row_index})` : '';
                return `${idx + 1}. ${warn.field}${rowInfo}: ${warn.message}`;
              })
              .join('\n')
          : '';

        let fullMessage = `Validation failed:\n\n${errorMessages}`;
        if (warningMessages) {
          fullMessage += `\n\nWarnings:\n${warningMessages}`;
        }

        notifications.error(fullMessage, {
          title: 'CSV Export Failed',
          description: `Please fix ${errorData.validation_errors.length} error(s) before exporting.`,
          duration: 15000, // Show for 15 seconds
          priority: 'high'
        });
      } else {
        notifications.error(errorData.message || 'CSV export failed', {
          title: 'Export Error',
          description: 'An unexpected error occurred during CSV export.',
          priority: 'high'
        });
      }
    }
  } catch (error) {
    console.error('CSV export error:', error);
    
    // Check if it's a network error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = 
      errorMessage.includes('fetch') || 
      errorMessage.includes('network') ||
      errorMessage.includes('Failed to fetch');

    if (isNetworkError) {
      notifications.warning('Backend unavailable, using local CSV generation', {
        title: 'Fallback Mode',
        description: 'The backend CSV exporter is unavailable. Using local generation (may have validation issues).',
        duration: 10000
      });
      
      // Optionally fall back to local generation
      // You can call the original generateCSV function here if needed
      throw new Error('Backend unavailable - please check server connection');
    } else {
      notifications.error('CSV export failed', {
        title: 'Export Error',
        description: errorMessage,
        priority: 'high',
        duration: 10000
      });
      throw error;
    }
  }
}

