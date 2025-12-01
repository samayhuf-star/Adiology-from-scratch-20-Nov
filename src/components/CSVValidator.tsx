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
    "Bid Adjustment":   { required: false, types: ['location'], rule: "Percentage value (e.g., 10% or -50%)." },
    "Is Exclusion":     { required: false, types: ['location'], rule: "Set to Yes to exclude." },
    "Zip Codes":        { required: false, types: ['location'], rule: "List of zip codes (use Location column for core targeting)." },
    "Cities":           { required: false, types: ['location'], rule: "List of cities (use Location column for core targeting)." },
    "Call Extension":   { required: false, types: ['ad', 'sitelink'], rule: "Deprecated, use Call Asset (Call) instead." }
};

const REQUIRED_HEADERS_FOR_AD = ["Campaign", "Ad Group", "Row Type", "Final URL", "Headline 1", "Headline 2", "Headline 3", "Description 1", "Description 2"];
const REQUIRED_HEADERS_FOR_SITELINK = ["Campaign", "Ad Group", "Row Type", "Asset Type", "Final URL", "Link Text"];
const REQUIRED_HEADERS_FOR_CALL = ["Campaign", "Ad Group", "Row Type", "Asset Type", "Phone Number", "Country Code"];
const REQUIRED_HEADERS_FOR_LOCATION = ["Campaign", "Ad Group", "Row Type", "Location"];

// --- Utility Functions ---
function parseCSV(text: string) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    let headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Normalize headers
    headers = headers.map(h => {
        const normalized = h.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        
        for (const ruleKey in COLUMN_RULES) {
            if (ruleKey.toLowerCase() === h.toLowerCase() || ruleKey.toLowerCase() === normalized.toLowerCase()) {
                return ruleKey;
            }
        }
        return h;
    });

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
        if (!values) continue;

        const row: any = {};
        for (let j = 0; j < headers.length; j++) {
            const value = (values[j] || '').trim().replace(/^"|"$/g, '');
            row[headers[j]] = value;
        }
        result.push(row);
    }
    return { data: result, headers };
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
        
        // Validate Phone Number format
        if (header === "Phone Number" && trimmedValue) {
            // Remove common formatting characters for validation
            const cleanPhone = trimmedValue.replace(/[\s\-\(\)\.]/g, '');
            if (!/^\d{10,15}$/.test(cleanPhone)) {
                return { status: 'error', message: `Invalid phone number format. Should be 10-15 digits.` };
            }
        }
        
        // Validate Country Code format
        if (header === "Country Code" && trimmedValue) {
            if (!/^[A-Z]{2}$/i.test(trimmedValue)) {
                return { status: 'error', message: `Invalid country code format. Must be 2-letter code (e.g., US, GB, IN).` };
            }
        }
        
        // Validate Asset Type
        if (header === "Asset Type" && trimmedValue) {
            const validAssetTypes = ['sitelink', 'call', 'callout', 'structured snippet', 'image'];
            if (!validAssetTypes.includes(trimmedValue.toLowerCase())) {
                return { status: 'error', message: `Invalid Asset Type: ${trimmedValue}. Must be one of: ${validAssetTypes.join(', ')}.` };
            }
        }
        
        // Validate Location field
        if (header === "Location" && trimmedValue) {
            // Location should not be empty for location rows
            if (trimmedValue.length < 2) {
                return { status: 'error', message: `Location must be at least 2 characters.` };
            }
        }
        
        // Validate Bid Adjustment format
        if (header === "Bid Adjustment" && trimmedValue) {
            // Remove % sign for validation
            const cleanBid = trimmedValue.replace('%', '').trim();
            const bidValue = parseFloat(cleanBid);
            if (isNaN(bidValue) || bidValue < -90 || bidValue > 900) {
                return { status: 'error', message: `Invalid Bid Adjustment. Must be a percentage between -90% and 900%.` };
            }
        }
        
        const validRowTypes = ['ad', 'sitelink', 'call', 'location', 'keyword', 'campaign', 'ad group'];
        if (header === "Row Type" && !validRowTypes.includes(trimmedValue.toLowerCase())) {
            return { status: 'warning', message: `Unrecognized Row Type: ${trimmedValue}. Should be one of ${validRowTypes.join(', ')}.` };
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
            
            // Auto-detect row type if not explicitly set
            let detectedRowType = rowType;
            if (!detectedRowType) {
                // Try to detect from other fields
                if (row["Location"]) detectedRowType = 'location';
                else if (row["Asset Type"]) {
                    const assetType = (row["Asset Type"] || "").trim().toLowerCase();
                    if (assetType === 'sitelink') detectedRowType = 'sitelink';
                    else if (assetType === 'call') detectedRowType = 'call';
                } else if (row["Link Text"]) detectedRowType = 'sitelink';
                else if (row["Phone Number"]) detectedRowType = 'call';
                else if (row["Headline 1"] || row["Final URL"]) detectedRowType = 'ad';
            }
            
            let requiredHeaders: string[] = [];
            if (detectedRowType === 'ad') requiredHeaders = REQUIRED_HEADERS_FOR_AD;
            else if (detectedRowType === 'sitelink') requiredHeaders = REQUIRED_HEADERS_FOR_SITELINK;
            else if (detectedRowType === 'call') requiredHeaders = REQUIRED_HEADERS_FOR_CALL;
            else if (detectedRowType === 'location') requiredHeaders = REQUIRED_HEADERS_FOR_LOCATION;
            else if (detectedRowType !== '') requiredHeaders = REQUIRED_HEADERS_FOR_AD;

            // Check for missing required headers
            requiredHeaders.forEach(reqHeader => {
                if (!headers.includes(reqHeader)) {
                    results[rowIdx][reqHeader] = { 
                        status: 'warning', 
                        message: `Required column '${reqHeader}' for '${detectedRowType}' is missing from file headers.` 
                    };
                    warnings++;
                } else {
                    // Check if required field has value
                    const value = (row[reqHeader] || "").trim();
                    if (!value && detectedRowType !== '') {
                        results[rowIdx][reqHeader] = {
                            status: 'error',
                            message: `Required field '${reqHeader}' is empty for Row Type: ${detectedRowType}.`
                        };
                        errors++;
                    }
                }
            });
            
            headers.forEach(header => {
                const value = row[header];
                const result = validateCell(header, value, detectedRowType);
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

            // Count keywords
            if (rowType === 'keyword') {
                keywords.total++;
            } else if (rowType === 'negative keyword' || rowType === 'campaign negative keyword' || rowType === 'ad group negative keyword') {
                keywords.negative++;
            }

            // Count ads
            if (rowType === 'ad' || rowType === 'responsive search ad' || rowType === 'expanded text ad') {
                // Check if it's RSA, DKI, or Call-Only based on available fields
                if (row['Headline 1'] || row['Description 1']) {
                    ads.RSA++;
                } else if (row['Phone Number']) {
                    ads.CallOnly++;
                } else {
                    ads.other++;
                }
            }

            // Count assets - more comprehensive tracking
            // Auto-detect asset type if Row Type is not explicitly set
            let detectedAssetType = assetType;
            if (!detectedAssetType && row['Asset Type']) {
                detectedAssetType = (row['Asset Type'] || '').toLowerCase().trim();
            }
            
            // Detect sitelinks
            if (rowType === 'sitelink' || detectedAssetType === 'sitelink' || row['Link Text']) {
                assets.sitelinks++;
            } 
            // Detect call assets
            else if (rowType === 'call' || detectedAssetType === 'call' || row['Phone Number']) {
                assets.calls++;
            } 
            // Detect locations - check multiple ways
            else if (rowType === 'location' || rowType === 'location target' || rowType === 'location targeting' || 
                     row['Location'] || row['Location Target'] || row['Zip Codes'] || row['Cities']) {
                assets.locations++;
            } 
            // Detect callouts
            else if (rowType === 'callout' || detectedAssetType === 'callout' || row['Callout Text']) {
                assets.callouts++;
            } 
            // Detect structured snippets
            else if (rowType === 'structured snippet' || detectedAssetType === 'structured snippet' || row['Header']) {
                assets.structuredSnippets++;
            } 
            // Detect images
            else if (rowType === 'image' || detectedAssetType === 'image' || row['Image URL']) {
                assets.images++;
            } 
            // Other assets
            else if (rowType.includes('asset') || detectedAssetType) {
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

            {/* Loading Screen - Full Screen Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 border-2 border-indigo-200">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Processing CSV File</h3>
                            <p className="text-slate-600 text-center text-sm">
                                Reading and validating your CSV data. This may take a few moments...
                            </p>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Please wait while we process your file...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Uploaded File Details */}
            {uploadedData.length > 0 && uploadedHeaders.length > 0 && !isProcessing && (
                <div className="mb-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Uploaded File Details
                                </h2>
                                <p className="text-indigo-100 text-sm mt-1.5">
                                    {fileName} • {uploadedData.length} rows • {uploadedHeaders.length} columns
                                </p>
                            </div>
                            <div className="bg-white/20 rounded-lg px-3 py-1.5">
                                <span className="text-white text-sm font-medium">✓ Loaded</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Column Headers */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <Hash className="w-5 h-5 text-indigo-600" />
                                Detected Columns ({uploadedHeaders.length})
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                                {uploadedHeaders.map((header, idx) => {
                                    const rule = COLUMN_RULES[header];
                                    const hasRule = !!rule;
                                    return (
                                        <span
                                            key={idx}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                                                hasRule
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-300'
                                            }`}
                                            title={rule ? rule.rule : 'No validation rule defined'}
                                        >
                                            {header}
                                            {hasRule && <span className="ml-1 text-indigo-500">✓</span>}
                                        </span>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {uploadedHeaders.filter(h => COLUMN_RULES[h]).length} columns have validation rules
                            </p>
                        </div>

                        {/* Sample Data Preview */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                                Data Preview (First 5 Rows)
                            </h3>
                            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
                                <table className="w-full text-sm">
                                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-100 z-10">#</th>
                                            {uploadedHeaders.slice(0, 7).map((header, idx) => (
                                                <th key={idx} className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap min-w-[120px]">
                                                    {header}
                                                </th>
                                            ))}
                                            {uploadedHeaders.length > 7 && (
                                                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                                                    +{uploadedHeaders.length - 7} more columns
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {uploadedData.slice(0, 5).map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-indigo-50/30 transition-colors">
                                                <td className="px-4 py-2.5 font-semibold text-slate-600 sticky left-0 bg-white z-10 border-r border-slate-200">
                                                    {rowIdx + 1}
                                                </td>
                                                {uploadedHeaders.slice(0, 7).map((header, colIdx) => {
                                                    const value = row[header] || '';
                                                    const displayValue = value.length > 25 ? value.substring(0, 25) + '...' : value;
                                                    const validation = validationResults[rowIdx]?.[header];
                                                    const hasError = validation?.status === 'error';
                                                    const hasWarning = validation?.status === 'warning';
                                                    return (
                                                        <td 
                                                            key={colIdx} 
                                                            className={`px-4 py-2.5 text-slate-700 whitespace-nowrap min-w-[120px] ${
                                                                hasError ? 'bg-red-50 text-red-700' : hasWarning ? 'bg-yellow-50 text-yellow-700' : ''
                                                            }`}
                                                            title={value || 'Empty cell'}
                                                        >
                                                            {displayValue || <span className="text-slate-400 italic text-xs">empty</span>}
                                                        </td>
                                                    );
                                                })}
                                                {uploadedHeaders.length > 7 && (
                                                    <td className="px-4 py-2.5 text-slate-400 text-xs italic">
                                                        ...
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {uploadedData.length > 5 && (
                                <p className="text-xs text-slate-500 mt-3 text-center bg-slate-50 py-2 rounded-lg">
                                    Showing first 5 of {uploadedData.length} rows. View full data with validation in the table below.
                                </p>
                            )}
                        </div>
                    </div>
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

                        {/* Other Assets */}
                        {(summary.assets.structuredSnippets + summary.assets.images + summary.assets.other) > 0 && (
                            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Other Assets</p>
                                        <p className="text-2xl font-bold text-slate-800">
                                            {summary.assets.structuredSnippets + summary.assets.images + summary.assets.other}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 space-y-1">
                                    {summary.assets.structuredSnippets > 0 && <div>• {summary.assets.structuredSnippets} Snippets</div>}
                                    {summary.assets.images > 0 && <div>• {summary.assets.images} Images</div>}
                                    {summary.assets.other > 0 && <div>• {summary.assets.other} Other</div>}
                                </div>
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