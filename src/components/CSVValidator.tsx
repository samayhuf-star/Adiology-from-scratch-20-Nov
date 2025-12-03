import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Download, Sparkles, AlertCircle, CheckCircle, AlertTriangle, FileText, Loader2, FolderOpen, Layers, Hash, MinusCircle, FileType, Link, Phone, MapPin, MessageSquare, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-js-style';

// --- Column Rules Configuration ---
const COLUMN_RULES = {
    // REQUIRED COMMON FIELDS
    "Campaign":         { required: true, types: ['all'], rule: "Name of the campaign. Max 255 chars." },
    "Ad Group":         { required: true, types: ['all'], rule: "Name of the ad group. Max 255 chars." },
    "Row Type":         { required: true, types: ['all'], rule: "Must be: ad, sitelink, call, location, etc. Lowercase and exact match." },
    "Status":           { required: false, types: ['all'], rule: "Optional. Active, Paused, or Removed." },

    // RESPONSIVE SEARCH AD (RSA) FIELDS (Row Type: ad)
    "Final URL":        { required: true, types: ['ad', 'sitelink'], rule: "Must be a valid URL starting with http:// or https://" },
    "Headline 1":       { required: true, types: ['ad'], rule: "RSA Headline. Max 30 characters. Minimum of 3 Headlines (1, 2, 3...) required." },
    "Headline 2":       { required: true, types: ['ad'], rule: "RSA Headline. Max 30 characters. Minimum of 3 Headlines (1, 2, 3...) required." },
    "Headline 3":       { required: true, types: ['ad'], rule: "RSA Headline. Max 30 characters. Minimum of 3 Headlines (1, 2, 3...) required." },
    "Headline 4":       { required: false, types: ['ad'], rule: "RSA Headline. Max 30 characters." },
    "Headline 15":      { required: false, types: ['ad'], rule: "RSA Headline. Max 30 characters." },
    "Description 1":    { required: true, types: ['ad'], rule: "RSA Description. Max 90 characters. Minimum of 2 Descriptions (1, 2) required." },
    "Description 2":    { required: true, types: ['ad'], rule: "RSA Description. Max 90 characters. Minimum of 2 Descriptions (1, 2) required." },
    "Description 3":    { required: false, types: ['ad'], rule: "RSA Description. Max 90 characters." },
    "Description 4":    { required: false, types: ['ad'], rule: "RSA Description. Max 90 characters." },
    "Path 1":           { required: false, types: ['ad'], rule: "Display Path. Max 15 characters." },
    "Path 2":           { required: false, types: ['ad'], rule: "Display Path. Max 15 characters." },

    // SITELINK ASSET FIELDS (Row Type: sitelink)
    "Asset Type":       { required: true, types: ['sitelink', 'call'], rule: "Must be 'Sitelink' or 'Call'." },
    "Link Text":        { required: true, types: ['sitelink'], rule: "Sitelink Text. Max 25 characters." },
    "Description Line 1": { required: false, types: ['sitelink'], rule: "Sitelink Description. Max 35 characters." },
    "Description Line 2": { required: false, types: ['sitelink'], rule: "Sitelink Description. Max 35 characters." },
    
    // CALL ASSET FIELDS (Row Type: call)
    "Phone Number":     { required: true, types: ['call'], rule: "Full phone number." },
    "Country Code":     { required: true, types: ['call'], rule: "2-letter country code (e.g., US, GB, IN)." },
    
    // LOCATION TARGETING FIELDS (Row Type: location)
    "Location":         { required: true, types: ['location'], rule: "City, ZIP Code, Region, or Country name." },
    "Location Target":  { required: true, types: ['location'], rule: "Location name for targeting (City, ZIP, State, Country)." },
    "Target Type":      { required: false, types: ['location'], rule: "Type of location target (e.g., 'Location of interest', 'City', 'State', 'Postal Code')." },
    "Bid Adjustment":   { required: false, types: ['location'], rule: "Percentage value (e.g., 10% or -50%)." },
    "Is Exclusion":     { required: false, types: ['location'], rule: "Set to Yes to exclude." },
    "Zip Codes":        { required: false, types: ['location'], rule: "List of zip codes (use Location column for core targeting)." },
    "Cities":           { required: false, types: ['location'], rule: "List of cities (use Location column for core targeting)." },
    
    // ADDITIONAL ASSET FIELDS
    "Callout Text":     { required: true, types: ['callout'], rule: "Callout extension text. Max 25 characters." },
    "Header":           { required: true, types: ['structured snippet'], rule: "Structured snippet header/category." },
    "Values":           { required: true, types: ['structured snippet'], rule: "Comma-separated values for structured snippet." },
    "Image URL":        { required: true, types: ['image'], rule: "URL of the image asset." },
    "Alt Text":         { required: false, types: ['image'], rule: "Alternative text for the image." },
    "Call Extension":   { required: false, types: ['ad', 'sitelink'], rule: "Deprecated, use Call Asset (Call) instead." }
};

const REQUIRED_HEADERS_FOR_AD = ["Campaign", "Ad Group", "Row Type", "Final URL", "Headline 1", "Headline 2", "Headline 3", "Description 1", "Description 2"];
const REQUIRED_HEADERS_FOR_SITELINK = ["Campaign", "Ad Group", "Row Type", "Asset Type", "Final URL", "Link Text"];
const REQUIRED_HEADERS_FOR_CALL = ["Campaign", "Ad Group", "Row Type", "Asset Type", "Phone Number", "Country Code"];
const REQUIRED_HEADERS_FOR_LOCATION = ["Campaign", "Ad Group", "Row Type", "Location"];
const REQUIRED_HEADERS_FOR_CALLOUT = ["Campaign", "Ad Group", "Row Type", "Asset Type", "Callout Text"];
const REQUIRED_HEADERS_FOR_SNIPPET = ["Campaign", "Ad Group", "Row Type", "Asset Type", "Header", "Values"];

// --- Utility Functions ---
function parseCSV(text: string) {
    // Handle both CRLF and LF line endings
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];

    const result: any[] = [];
    const allHeaders = new Set<string>();
    let currentHeaders: string[] = [];
    let i = 0;

    // Helper to parse CSV line with proper quote handling
    function parseCSVLine(line: string): string[] {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        // Add last field
        values.push(current.trim());
        return values;
    }

    // Helper to normalize header name
    function normalizeHeader(h: string): string {
        const normalized = h.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        
        for (const ruleKey in COLUMN_RULES) {
            if (ruleKey.toLowerCase() === h.toLowerCase() || ruleKey.toLowerCase() === normalized.toLowerCase()) {
                return ruleKey;
            }
        }
        return h;
    }

    while (i < lines.length) {
        const line = lines[i].trim();
        
        // Skip empty lines (they separate blocks in V3 format)
        if (!line) {
            i++;
            // Reset headers on empty line to allow new block headers
            currentHeaders = [];
            continue;
        }

        const values = parseCSVLine(line);
        
        // Check if this line looks like a header (contains common header words and is likely a header)
        const isHeaderRow = values.some(v => {
            const lower = v.toLowerCase().replace(/^"|"$/g, '');
            return lower.includes('campaign') || lower.includes('ad group') || 
                   lower.includes('headline') || lower.includes('description') ||
                   lower.includes('sitelink') || lower.includes('callout') ||
                   lower.includes('location') || lower.includes('target') ||
                   lower.includes('keyword') || lower.includes('final url') ||
                   lower.includes('phone number') || lower.includes('country code') ||
                   lower.includes('callout text') || lower.includes('link text');
        }) && values.length >= 2; // Headers typically have multiple columns

        // If it looks like a header, update current headers
        if (isHeaderRow) {
            currentHeaders = values.map(h => {
                const cleaned = h.trim().replace(/^"|"$/g, '');
                const normalized = normalizeHeader(cleaned);
                allHeaders.add(normalized);
                return normalized;
            });
            i++;
            continue;
        }

        // If we have headers, process this as a data row
        if (currentHeaders.length > 0 && values.length > 0) {
            const row: any = {};
            // Check if this row has data (not just empty values)
            const hasData = values.some(v => {
                const cleaned = v.trim().replace(/^"|"$/g, '');
                return cleaned !== '' && cleaned !== '""';
            });
            
            if (hasData) {
                for (let j = 0; j < Math.max(currentHeaders.length, values.length); j++) {
                    const header = currentHeaders[j] || `Column${j + 1}`;
                    const value = (values[j] || '').trim().replace(/^"|"$/g, '');
                    if (value && value !== '""') {
                        row[header] = value;
                    }
                }
                // Only add row if it has at least one non-empty value
                if (Object.keys(row).length > 0) {
                    result.push(row);
                }
            }
        }

        i++;
    }

    return { data: result, headers: Array.from(allHeaders) };
}

function validateCell(header: string, value: string, rowType: string) {
    const rule = COLUMN_RULES[header];
    const trimmedValue = (value || "").trim();

    if (!rule) {
        return { status: 'correct', message: 'No issues.' };
    }

    if (!rule.types.includes(rowType.toLowerCase()) && rule.types.includes('all') === false) {
        return { status: 'correct', message: 'No issues.' };
    }

    if (rule.required && trimmedValue === '' && rule.types.includes(rowType.toLowerCase())) {
        return { status: 'error', message: `Required field missing for Row Type: ${rowType}.` };
    }

    if (trimmedValue !== '') {
        if (header.includes("Headline") && trimmedValue.length > 30) {
            return { status: 'error', message: `EXCEEDS LIMIT: Max 30 characters. Current: ${trimmedValue.length}.` };
        }
        if (header.includes("Description") && !header.includes("Line") && trimmedValue.length > 90) {
            return { status: 'error', message: `EXCEEDS LIMIT: Max 90 characters. Current: ${trimmedValue.length}.` };
        }
        if (header.includes("Path") && trimmedValue.length > 15) {
            return { status: 'error', message: `EXCEEDS LIMIT: Max 15 characters. Current: ${trimmedValue.length}.` };
        }
        if (header === "Link Text" && trimmedValue.length > 25) {
            return { status: 'error', message: `EXCEEDS LIMIT: Max 25 characters. Current: ${trimmedValue.length}.` };
        }
        if (header.includes("Description Line") && trimmedValue.length > 35) {
            return { status: 'error', message: `EXCEEDS LIMIT: Max 35 characters. Current: ${trimmedValue.length}.` };
        }
        if (header === "Final URL" && !trimmedValue.match(/^https?:\/\//i)) {
            return { status: 'error', message: `Invalid URL format. Must start with http:// or https://.` };
        }
        
        const validRowTypes = ['ad', 'sitelink', 'call', 'location', 'location target', 'location targeting', 'keyword', 'campaign', 'ad group', 'callout', 'structured snippet', 'image', 'asset'];
        if (header === "Row Type" && trimmedValue && !validRowTypes.includes(trimmedValue.toLowerCase())) {
            return { status: 'warning', message: `Unrecognized Row Type: ${trimmedValue}. Should be one of ${validRowTypes.join(', ')}.` };
        }
        
        // Validate callout text length
        if (header === "Callout Text" && trimmedValue.length > 25) {
            return { status: 'error', message: `EXCEEDS LIMIT: Max 25 characters. Current: ${trimmedValue.length}.` };
        }
    }

    if (header === "Call Extension") {
        return { status: 'warning', message: `Deprecated field. Use 'Call Asset' instead.` };
    }

    if (!rule.required && trimmedValue === '') {
        return { status: 'correct', message: 'Optional field, intentionally empty.' };
    }

    return { status: 'correct', message: 'No issues.' };
}

export const CSVValidator = () => {
    const [uploadedData, setUploadedData] = useState<any[]>([]);
    const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
    const [validationResults, setValidationResults] = useState<any>({});
    const [fileName, setFileName] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [totalErrors, setTotalErrors] = useState(0);
    const [totalWarnings, setTotalWarnings] = useState(0);
    const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const validateData = useCallback((data: any[], headers: string[]) => {
        const results: any = {};
        let errors = 0;
        let warnings = 0;

        data.forEach((row, rowIdx) => {
            results[rowIdx] = {};
            const rowType = (row["Row Type"] || "").trim().toLowerCase();
            
            let requiredHeaders: string[] = [];
            if (rowType === 'ad') requiredHeaders = REQUIRED_HEADERS_FOR_AD;
            else if (rowType === 'sitelink') requiredHeaders = REQUIRED_HEADERS_FOR_SITELINK;
            else if (rowType === 'call') requiredHeaders = REQUIRED_HEADERS_FOR_CALL;
            else if (rowType === 'location' || rowType === 'location target' || rowType === 'location targeting') {
                requiredHeaders = REQUIRED_HEADERS_FOR_LOCATION;
            }
            else if (rowType === 'callout') requiredHeaders = REQUIRED_HEADERS_FOR_CALLOUT;
            else if (rowType === 'structured snippet') requiredHeaders = REQUIRED_HEADERS_FOR_SNIPPET;
            // For rows without Row Type, try to detect by column presence
            else if (!rowType && (row['Location Target'] || row['Location'])) {
                requiredHeaders = REQUIRED_HEADERS_FOR_LOCATION;
            }
            else if (!rowType && (row['Sitelink Text'] || row['Link Text'])) {
                requiredHeaders = REQUIRED_HEADERS_FOR_SITELINK;
            }
            else if (!rowType && row['Callout Text']) {
                requiredHeaders = REQUIRED_HEADERS_FOR_CALLOUT;
            }
            else if (rowType !== '') requiredHeaders = REQUIRED_HEADERS_FOR_AD;

            requiredHeaders.forEach(reqHeader => {
                if (!headers.includes(reqHeader)) {
                    results[rowIdx][reqHeader] = { 
                        status: 'warning', 
                        message: `Required column '${reqHeader}' for '${rowType}' is missing from file headers.` 
                    };
                    warnings++;
                }
            });
            
            headers.forEach(header => {
                const value = row[header];
                const result = validateCell(header, value, rowType);
                results[rowIdx][header] = result;
                if (result.status === 'error') errors++;
                if (result.status === 'warning') warnings++;
            });
        });

        setValidationResults(results);
        setTotalErrors(errors);
        setTotalWarnings(warnings);
        
        return { errors, warnings };
    }, []);

    // Auto-hide success message after 4 seconds (Bug 24)
    useEffect(() => {
        if (successMessage) {
            // Clear any existing timeout
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
            
            // Set new timeout to hide message after 4 seconds
            successTimeoutRef.current = setTimeout(() => {
                setSuccessMessage('');
            }, 4000);
        }

        // Cleanup timeout on unmount
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, [successMessage]);

    // Cleanup file URL on unmount
    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Clean up previous file URL if exists
        if (fileUrl) {
            URL.revokeObjectURL(fileUrl);
        }

        setFileName(file.name);
        setUploadedFile(file);
        
        // Create object URL for the file so it can be opened in a new tab
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        setIsProcessing(true);
        setErrorMessage('');
        setSuccessMessage('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = parseCSV(e.target?.result as string);
                
                if (result.data.length === 0) {
                    throw new Error("The file is empty or could not be parsed.");
                }
                
                setUploadedData(result.data);
                setUploadedHeaders(result.headers);
                validateData(result.data, result.headers);
                setSuccessMessage(`Successfully loaded ${result.data.length} rows`);
            } catch (error: any) {
                setErrorMessage(`Error processing CSV: ${error.message}`);
                setUploadedData([]);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsText(file);
    }, [validateData, fileUrl]);

    const handleCellEdit = (rowIdx: number, header: string, newValue: string) => {
        const newData = [...uploadedData];
        newData[rowIdx][header] = newValue;
        setUploadedData(newData);
        validateData(newData, uploadedHeaders);
    };

    const handleAIFix = async () => {
        setIsFixing(true);
        setErrorMessage('');
        setSuccessMessage('');

        // Simulate AI fixing (in production, you'd call the Gemini API)
        setTimeout(() => {
            const newData = uploadedData.map(row => {
                const newRow = { ...row };
                uploadedHeaders.forEach(header => {
                    const value = newRow[header] || '';
                    
                    // Auto-fix common issues
                    if (header.includes("Headline") && value.length > 30) {
                        newRow[header] = value.substring(0, 30);
                    }
                    if (header.includes("Description") && !header.includes("Line") && value.length > 90) {
                        newRow[header] = value.substring(0, 90);
                    }
                    if (header.includes("Path") && value.length > 15) {
                        newRow[header] = value.substring(0, 15);
                    }
                    if (header === "Link Text" && value.length > 25) {
                        newRow[header] = value.substring(0, 25);
                    }
                    if (header.includes("Description Line") && value.length > 35) {
                        newRow[header] = value.substring(0, 35);
                    }
                    if (header === "Final URL" && value && !value.match(/^https?:\/\//i)) {
                        newRow[header] = 'https://' + value;
                    }
                });
                return newRow;
            });

            setUploadedData(newData);
            const results = validateData(newData, uploadedHeaders);
            setSuccessMessage(`AI Fix completed! Fixed multiple issues. ${results.errors} errors remaining.`);
            setIsFixing(false);
        }, 1500);
    };

    const handleDownload = () => {
        if (uploadedData.length === 0) {
            setErrorMessage('Please upload and process a file first.');
            return;
        }

        const headerRow = uploadedHeaders.join(',');
        const dataRows = uploadedData.map(row => {
            return uploadedHeaders.map(header => {
                let cellValue = row[header] || '';
                if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
                    cellValue = `"${cellValue.replace(/"/g, '""')}"`;
                }
                return cellValue;
            }).join(',');
        });

        const csvContent = [headerRow, ...dataRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'google_ads_bulk_fixed.csv';
        link.click();
        URL.revokeObjectURL(url);
        
        setSuccessMessage('CSV downloaded successfully!');
    };

    const handleDownloadWithErrors = () => {
        if (uploadedData.length === 0) {
            setErrorMessage('Please upload and process a file first.');
            return;
        }

        try {
            // Create a workbook
            const wb = XLSX.utils.book_new();
            
            // Prepare data with error highlighting
            const wsData: any[][] = [];
            
            // Add headers
            wsData.push(uploadedHeaders);
            
            // Add data rows
            uploadedData.forEach((row, rowIdx) => {
                const rowData: any[] = [];
                uploadedHeaders.forEach((header) => {
                    const value = row[header] || '';
                    rowData.push(value || '');
                });
                wsData.push(rowData);
            });
            
            // Create worksheet from data
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Apply red background styling to error cells
            uploadedData.forEach((row, rowIdx) => {
                uploadedHeaders.forEach((header, colIdx) => {
                    const validation = validationResults[rowIdx]?.[header];
                    const cellAddress = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
                    
                    if (!ws[cellAddress]) {
                        ws[cellAddress] = { t: 's', v: '' };
                    }
                    
                    // Apply red background for errors, yellow for warnings
                    if (validation?.status === 'error') {
                        ws[cellAddress].s = {
                            fill: { fgColor: { rgb: 'FFFF0000' } }, // Red background
                            font: { color: { rgb: 'FFFFFFFF' }, bold: true }, // White bold text
                        };
                    } else if (validation?.status === 'warning') {
                        ws[cellAddress].s = {
                            fill: { fgColor: { rgb: 'FFFFFF00' } }, // Yellow background
                            font: { color: { rgb: 'FF000000' }, bold: true }, // Black bold text
                        };
                    } else {
                        ws[cellAddress].s = {
                            fill: { fgColor: { rgb: 'FFFFFFFF' } }, // White background
                            font: { color: { rgb: 'FF000000' } }, // Black text
                        };
                    }
                });
            });
            
            // Style header row
            uploadedHeaders.forEach((header, colIdx) => {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIdx });
                if (ws[cellAddress]) {
                    ws[cellAddress].s = {
                        fill: { fgColor: { rgb: 'FF4472C4' } }, // Blue background
                        font: { color: { rgb: 'FFFFFFFF' }, bold: true }, // White bold text
                    };
                }
            });
            
            // Set column widths for better readability
            ws['!cols'] = uploadedHeaders.map(() => ({ wch: 20 }));
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Campaign Data');
            
            // Write file with styling using xlsx-js-style
            XLSXStyle.writeFile(wb, 'google_ads_with_errors.xlsx');
            
            setSuccessMessage('Excel file with errors downloaded successfully! Errors are highlighted in red.');
        } catch (error: any) {
            setErrorMessage(`Error exporting Excel file: ${error.message}`);
        }
    };

    const getCellClass = (status: string) => {
        if (status === 'error') return 'bg-red-100 border-2 border-red-500 text-red-800';
        if (status === 'warning') return 'bg-yellow-100 border-2 border-yellow-500 text-yellow-800';
        return '';
    };

    // Calculate import summary statistics
    const getImportSummary = () => {
        const campaigns = new Set();
        const adGroups = new Set();
        const keywords = { total: 0, negative: 0 };
        const ads = { RSA: 0, DKI: 0, CallOnly: 0, other: 0 };
        const assets = { sitelinks: 0, calls: 0, locations: 0, callouts: 0, structuredSnippets: 0, images: 0, other: 0 };

        uploadedData.forEach(row => {
            const campaign = row['Campaign'];
            const adGroup = row['Ad Group'];
            const rowType = (row['Row Type'] || '').toLowerCase().trim();
            const assetType = (row['Asset Type'] || '').toLowerCase().trim();

            if (campaign) campaigns.add(campaign);
            if (adGroup) adGroups.add(`${campaign}|${adGroup}`);

            // Count keywords - check for Keyword column or Row Type
            if (rowType === 'keyword' || row['Keyword']) {
                keywords.total++;
            } else if (rowType === 'negative keyword' || rowType === 'campaign negative keyword' || rowType === 'ad group negative keyword' || row['Negative Keyword']) {
                keywords.negative++;
            }

            // Count ads - check for ad indicators
            const hasHeadlines = row['Headline 1'] || row['Headline 2'] || row['Headline 3'];
            const hasDescriptions = row['Description 1'] || row['Description 2'];
            const hasPhone = row['Phone Number'];
            
            if (rowType === 'ad' || rowType === 'responsive search ad' || rowType === 'expanded text ad' || hasHeadlines || hasDescriptions) {
                // Check if it's RSA, DKI, or Call-Only based on available fields
                if (hasHeadlines || hasDescriptions) {
                    // Check for DKI syntax
                    const headline1 = (row['Headline 1'] || '').toString();
                    if (headline1.includes('{KeyWord:') || headline1.includes('{Keyword:')) {
                        ads.DKI++;
                    } else {
                        ads.RSA++;
                    }
                } else if (hasPhone) {
                    ads.CallOnly++;
                } else {
                    ads.other++;
                }
            }

            // Count assets - detect by column presence, not just Row Type
            // Priority: Check for extension/location columns first (more reliable than Row Type)
            
            // Sitelinks - check for "Sitelink Text" or "Link Text" column (and not an ad row)
            if ((row['Sitelink Text'] || row['Link Text']) && !hasHeadlines && !hasDescriptions) {
                assets.sitelinks++;
            } 
            // Callouts - check for "Callout Text" column (and not an ad row)
            else if (row['Callout Text'] && !hasHeadlines && !hasDescriptions) {
                assets.callouts++;
            }
            // Structured Snippets - check for "Header" and "Values" columns (and not an ad row)
            else if (row['Header'] && row['Values'] && !hasHeadlines && !hasDescriptions) {
                assets.structuredSnippets++;
            }
            // Call assets - check for "Phone Number" and "Country Code" columns (and not an ad row)
            else if (row['Phone Number'] && row['Country Code'] && !hasHeadlines && !hasDescriptions) {
                assets.calls++;
            }
            // Locations - check for "Location Target" or "Location" or "Target Type" column
            else if (row['Location Target'] || row['Location'] || row['Target Type']) {
                assets.locations++;
            }
            // Images - check for "Image URL" or "Alt Text" columns
            else if (row['Image URL'] || row['Alt Text']) {
                assets.images++;
            }
            // Fallback to Row Type if columns don't match
            else if (rowType === 'sitelink' || assetType === 'sitelink') {
                assets.sitelinks++;
            } 
            else if (rowType === 'call' || assetType === 'call') {
                assets.calls++;
            } 
            else if (rowType === 'location' || rowType === 'location target' || rowType === 'location targeting') {
                assets.locations++;
            } 
            else if (rowType === 'callout' || assetType === 'callout') {
                assets.callouts++;
            } 
            else if (rowType === 'structured snippet' || assetType === 'structured snippet') {
                assets.structuredSnippets++;
            } 
            else if (rowType === 'image' || assetType === 'image') {
                assets.images++;
            } 
            // Other assets - check for Asset Type column or other asset indicators
            else if (rowType && rowType.includes('asset')) {
                assets.other++;
            } else if (assetType || row['Asset Type']) {
                assets.other++;
            }
        });

        return {
            campaigns: campaigns.size,
            adGroups: adGroups.size,
            keywords,
            ads,
            assets,
        };
    };

    const summary = uploadedData.length > 0 ? getImportSummary() : null;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Google Ads CSV Validator
                </h1>
                <p className="text-slate-500">
                    Upload your CSV to check compliance with standard Google Ads Editor columns. Use AI to fix common errors like length or formatting.
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/60 shadow-xl mb-8">
                <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-all duration-300 hover:bg-indigo-50/30">
                    <input
                        type="file"
                        id="csvFile"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <label
                        htmlFor="csvFile"
                        className="cursor-pointer flex flex-col items-center gap-4"
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-700 mb-1">
                                Click to Upload CSV File
                            </p>
                            <p className="text-sm text-slate-500">
                                or drag and drop your file here
                            </p>
                        </div>
                    </label>
                    {fileName && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-indigo-600">
                            <FileText className="w-4 h-4" />
                            {fileUrl ? (
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium hover:underline cursor-pointer"
                                >
                                    {fileName}
                                </a>
                            ) : (
                                <span className="font-medium">{fileName}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{errorMessage}</p>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-700">{successMessage}</p>
                </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-yellow-700 animate-spin" />
                    <p className="text-yellow-700">Processing data... Please wait.</p>
                </div>
            )}

            {/* Import Summary Cards */}
            {summary && (
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Import Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* Campaigns */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                                    <FolderOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Campaigns</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.campaigns}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Unique campaigns detected</p>
                        </div>

                        {/* Ad Groups */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Ad Groups</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.adGroups}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Across all campaigns</p>
                        </div>

                        {/* Keywords */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                                    <Hash className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Keywords</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.keywords.total}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <MinusCircle className="w-3 h-3 text-red-500" />
                                <span className="text-red-600 font-medium">{summary.keywords.negative} negative</span>
                            </div>
                        </div>

                        {/* Ads */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                                    <FileType className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Ads</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {summary.ads.RSA + summary.ads.CallOnly + summary.ads.DKI + summary.ads.other}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                                {summary.ads.RSA > 0 && <div>• {summary.ads.RSA} RSA</div>}
                                {summary.ads.CallOnly > 0 && <div>• {summary.ads.CallOnly} Call-Only</div>}
                                {summary.ads.DKI > 0 && <div>• {summary.ads.DKI} DKI</div>}
                                {summary.ads.other > 0 && <div>• {summary.ads.other} Other</div>}
                            </div>
                        </div>

                        {/* Sitelinks */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                    <Link className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Sitelinks</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.assets.sitelinks}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Sitelink extensions</p>
                        </div>

                        {/* Locations */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Locations</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.assets.locations}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Location targeting</p>
                        </div>

                        {/* Call Assets */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Call Assets</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.assets.calls}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Call extensions</p>
                        </div>

                        {/* Callouts */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Callouts</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.assets.callouts}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Callout extensions</p>
                        </div>

                        {/* Structured Snippets */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Snippets</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.assets.structuredSnippets}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Structured snippets</p>
                        </div>

                        {/* Images */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Images</p>
                                    <p className="text-2xl font-bold text-slate-800">{summary.assets.images}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Image assets</p>
                        </div>

                        {/* Other Assets */}
                        {summary.assets.other > 0 && (
                            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center shadow-md">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Other Assets</p>
                                        <p className="text-2xl font-bold text-slate-800">{summary.assets.other}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400">Additional assets</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controls & Summary */}
            {uploadedData.length > 0 && (
                <div className="mb-6 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleAIFix}
                                disabled={isFixing || totalErrors === 0}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isFixing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Fixing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Auto-Fix All Errors (AI)
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Submit & Save (Download)
                            </button>
                            <button
                                onClick={handleDownloadWithErrors}
                                disabled={totalErrors === 0 || uploadedData.length === 0}
                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                title={totalErrors === 0 ? "No errors to download" : "Download CSV with highlighted errors"}
                            >
                                <FileSpreadsheet className="w-5 h-5" />
                                Download CSV with Errors
                            </button>
                        </div>
                        <div className="flex gap-6 text-sm font-medium">
                            <span className="text-green-600 font-bold">
                                {uploadedData.length} Rows
                            </span>
                            <span className={`${totalErrors > 0 ? 'text-red-600' : 'text-slate-600'} font-bold`}>
                                {totalErrors} Errors
                            </span>
                            <span className={`${totalWarnings > 0 ? 'text-orange-500' : 'text-slate-600'} font-bold`}>
                                {totalWarnings} Warnings
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Table */}
            {uploadedData.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg z-10">
                                <tr>
                                    <th className="p-3 text-left font-semibold">#</th>
                                    {uploadedHeaders.map((header, idx) => {
                                        const rule = COLUMN_RULES[header];
                                        const title = rule ? `${header} - ${rule.rule}` : header;
                                        return (
                                            <th
                                                key={idx}
                                                className="p-3 text-left whitespace-nowrap font-semibold cursor-help"
                                                title={title}
                                            >
                                                {header}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {uploadedData.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-indigo-50 transition-colors`}
                                    >
                                        <td className="p-3 font-semibold text-slate-700">
                                            {rowIdx + 1}
                                        </td>
                                        {uploadedHeaders.map((header, colIdx) => {
                                            const validation = validationResults[rowIdx]?.[header];
                                            const value = row[header] || '';
                                            const cellClass = validation ? getCellClass(validation.status) : '';
                                            const title = validation?.message || '';

                                            return (
                                                <td
                                                    key={colIdx}
                                                    className={`p-3 whitespace-nowrap ${cellClass} font-medium`}
                                                    title={title}
                                                    contentEditable
                                                    suppressContentEditableWarning
                                                    onBlur={(e) => handleCellEdit(rowIdx, header, e.currentTarget.textContent || '')}
                                                >
                                                    {value || (validation?.message.includes('Required field missing') ? '[REQUIRED & EMPTY]' : '')}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {uploadedData.length === 0 && !isProcessing && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/60 shadow-xl text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">
                        No CSV Loaded
                    </h3>
                    <p className="text-slate-500">
                        Upload a CSV file to begin validation
                    </p>
                </div>
            )}
        </div>
    );
};
};