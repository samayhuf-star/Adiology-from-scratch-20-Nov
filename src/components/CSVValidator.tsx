import React, { useState, useCallback } from 'react';
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
    const [isProcessing, setIsProcessing] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [totalErrors, setTotalErrors] = useState(0);
    const [totalWarnings, setTotalWarnings] = useState(0);

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
            else if (rowType === 'location') requiredHeaders = REQUIRED_HEADERS_FOR_LOCATION;
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

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
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
    }, [validateData]);

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
            if (rowType === 'sitelink' || assetType === 'sitelink') {
                assets.sitelinks++;
            } else if (rowType === 'call' || assetType === 'call') {
                assets.calls++;
            } else if (rowType === 'location' || rowType === 'location target' || rowType === 'location targeting' || row['Location']) {
                assets.locations++;
            } else if (rowType === 'callout' || assetType === 'callout') {
                assets.callouts++;
            } else if (rowType === 'structured snippet' || assetType === 'structured snippet') {
                assets.structuredSnippets++;
            } else if (rowType === 'image' || assetType === 'image') {
                assets.images++;
            } else if (rowType.includes('asset') || assetType) {
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
                            <span className="font-medium">{fileName}</span>
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
                                disabled={isFixing}
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
                                disabled={totalErrors === 0}
                                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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