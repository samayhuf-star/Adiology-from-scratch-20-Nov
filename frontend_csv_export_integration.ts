/**
 * Frontend Integration for CSV Export Fix
 * 
 * Replace the generateCSV function in CampaignBuilder.tsx with this implementation
 * that calls the backend API for proper CSV generation.
 */

import { api } from '../utils/api';
import { notifications } from '../utils/notifications';

/**
 * Convert Campaign Builder 1 data format to backend request format
 */
function convertToExportRequest(
  campaignName: string,
  adGroups: any[],
  locationTargeting?: any,
  budget?: number,
  biddingStrategy?: string
): any {
  return {
    campaign_name: campaignName || 'Campaign 1',
    ad_groups: adGroups.map(group => ({
      name: group.name,
      keywords: group.keywords || [],
      ads: group.ads || [],
      negativeKeywords: group.negativeKeywords || [],
      defaultMaxCPC: group.defaultMaxCPC
    })),
    location_targeting: locationTargeting,
    budget: budget,
    bidding_strategy: biddingStrategy || 'MANUAL_CPC'
  };
}

/**
 * Main CSV export function - replaces generateCSV in CampaignBuilder.tsx
 */
export async function generateCSVWithBackend(
  campaignName: string,
  adGroups: any[],
  locationTargeting?: any,
  budget?: number,
  biddingStrategy?: string
): Promise<void> {
  try {
    // Show loading notification
    notifications.info('Generating CSV...', {
      title: 'Exporting',
      description: 'Validating and generating Google Ads Editor CSV file...'
    });

    // Convert to backend format
    const request = convertToExportRequest(
      campaignName,
      adGroups,
      locationTargeting,
      budget,
      biddingStrategy
    );

    // Call backend API
    const response = await fetch(`${API_BASE}/export-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(request)
    });

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
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notifications.success('CSV exported successfully', {
        title: 'Export Complete',
        description: `Campaign exported to ${filename}. Ready for Google Ads Editor import.`
      });
    } else {
      // Validation errors - parse JSON response
      const errorData = await response.json();
      
      if (errorData.validation_errors && errorData.validation_errors.length > 0) {
        // Format validation errors for display
        const errorMessages = errorData.validation_errors.map((err: any, idx: number) => {
          const rowInfo = err.row_index ? ` (Row ${err.row_index})` : '';
          return `${idx + 1}. ${err.field}${rowInfo}: ${err.message}`;
        }).join('\n');

        const warningMessages = errorData.warnings && errorData.warnings.length > 0
          ? errorData.warnings.map((warn: any, idx: number) => {
              const rowInfo = warn.row_index ? ` (Row ${warn.row_index})` : '';
              return `${idx + 1}. ${warn.field}${rowInfo}: ${warn.message}`;
            }).join('\n')
          : '';

        let fullMessage = `Validation failed:\n\n${errorMessages}`;
        if (warningMessages) {
          fullMessage += `\n\nWarnings:\n${warningMessages}`;
        }

        notifications.error(fullMessage, {
          title: 'CSV Export Failed',
          description: `Please fix ${errorData.validation_errors.length} error(s) before exporting.`,
          duration: 10000, // Show for 10 seconds
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
    
    // Fallback to local generation if backend is unavailable
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      notifications.warning('Backend unavailable, using local CSV generation', {
        title: 'Fallback Mode',
        description: 'The backend CSV exporter is unavailable. Using local generation (may have validation issues).'
      });
      
      // Fall back to existing local generateCSV function
      // generateCSV(); // Uncomment if you want fallback
    } else {
      notifications.error('CSV export failed', {
        title: 'Export Error',
        description: errorMessage,
        priority: 'high'
      });
    }
  }
}

/**
 * Usage in CampaignBuilder.tsx:
 * 
 * Replace the generateCSV function (around line 1685) with:
 * 
 * const generateCSV = async () => {
 *   const adGroups = getDynamicAdGroups();
 *   const locationTargeting = {
 *     locations: [
 *       { type: 'COUNTRY', code: targetCountry },
 *       ...(selectedCities.map(city => ({ type: 'CITY', code: city }))),
 *       ...(selectedStates.map(state => ({ type: 'STATE', code: state }))),
 *       ...(selectedZips.map(zip => ({ type: 'ZIP', code: zip })))
 *     ]
 *   };
 * 
 *   await generateCSVWithBackend(
 *     campaignName || 'Campaign 1',
 *     adGroups.map(group => ({
 *       ...group,
 *       ads: generatedAds.filter(ad => 
 *         (ad.adGroup === group.name || ad.adGroup === ALL_AD_GROUPS_VALUE) &&
 *         (ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly')
 *       )
 *     })),
 *     locationTargeting
 *   );
 * };
 */

