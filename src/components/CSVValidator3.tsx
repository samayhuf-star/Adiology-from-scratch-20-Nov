import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Download, Sparkles, AlertCircle, CheckCircle, FileText, Loader2, Edit2, Save, X, RefreshCw, FolderOpen, Layers, Hash, Link2, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { api } from '../utils/api';
import { notifications } from '../utils/notifications';

// Validation rules
const REQUIRED_HEADERS = ['Keyword', 'Match type'];
const OPTIONAL_HEADERS = ['Campaign', 'Ad group', 'Final URL', 'Custom parameter', 'Category', 'Subcategory', 'Reason', 'Confidence'];
const ALLOWED_MATCH_TYPES = ['Exact', 'Phrase', 'Broad', 'Exact (Negative)', 'Phrase (Negative)', 'Broad (Negative)'];

interface ValidationProblem {
    row: number;
    col: string;
    type: 'missing' | 'invalid' | 'format_mismatch' | 'duplicate' | 'forbidden' | 'too_long';
    message: string;
}

interface FixAction {
    row: number;
    action: string;
}

export const CSVValidator3 = () => {
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [problems, setProblems] = useState<ValidationProblem[]>([]);
    const [editorBehavior, setEditorBehavior] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fixing, setFixing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [expandedStats, setExpandedStats] = useState<Set<string>>(new Set());
    const [validationStats, setValidationStats] = useState({
        errors: 0,
        warnings: 0,
        totalRows: 0,
        errorDetails: [] as Array<{ row: number; message: string }>,
        warningDetails: [] as Array<{ row: number; message: string }>,
    });

    // Normalize headers
    const normalizeHeaders = useCallback((headers: string[]) => {
        return headers.map(h => h.trim());
    }, []);

    // Detect match type from keyword format
    const detectMatchTypeFormat = useCallback((text: string): string | null => {
        if (!text || typeof text !== 'string') return null;
        const t = text.trim();
        if (/^\[.*\]$/.test(t)) return 'Exact';
        if (/^".*"$/.test(t)) return 'Phrase';
        if (/^-\[.*\]$/.test(t) || /^-".*"$/.test(t)) return 'Exact (Negative)';
        if (/^[\w\s\-\/\.:,()\$%']+$/.test(t)) return 'Broad';
        return null;
    }, []);

    // Validate keyword format matches match type
    const isValidKeywordForMatch = useCallback((keyword: string, matchType: string): boolean => {
        if (!keyword) return false;
        const trimmed = keyword.trim();
        if (matchType === 'Exact') return /^\[.*\]$/.test(trimmed);
        if (matchType === 'Phrase') return /^".*"$/.test(trimmed);
        if (matchType === 'Broad') return !/^\[|\"/.test(trimmed);
        if (matchType.endsWith('(Negative)')) {
            return /^-\[.*\]$/.test(trimmed) || /^-".*"$/.test(trimmed) || /^-/.test(trimmed);
        }
        return false;
    }, []);

    // Validate rows
    const validateRows = useCallback((rows: any[], headers: string[]): ValidationProblem[] => {
        const problems: ValidationProblem[] = [];
        const seen = new Map<string, number>();

        rows.forEach((row, i) => {
            const rowNum = i + 2; // header row is 1
            
            // Get Row Type (check multiple possible column names)
            const rowType = (row['Row Type'] || row['row type'] || row['RowType'] || '').toString().toUpperCase().trim();
            
            // Get keyword and match type values (check multiple possible column names)
            const keywordValue = (row['Keyword'] || row['keyword'] || '').toString().trim();
            const matchTypeValue = (row['Match type'] || row['Match Type'] || row['match type'] || '').toString().trim();
            
            // Only validate keyword/match type fields for keyword rows
            // A row is a keyword row if:
            // 1. Row Type is explicitly KEYWORD or NEGATIVE_KEYWORD, OR
            // 2. Row Type is missing/empty BUT the row has non-empty Keyword or Match type values
            const isKeywordRow = rowType === 'KEYWORD' || 
                                 rowType === 'NEGATIVE_KEYWORD' || 
                                 (!rowType && (keywordValue || matchTypeValue));
            
            if (isKeywordRow) {
                const keywordCell = keywordValue;
                const matchCell = matchTypeValue;
                const detected = detectMatchTypeFormat(keywordCell) || (matchCell ? matchCell.trim() : null);

                if (!keywordCell) {
                    problems.push({ row: rowNum, col: 'Keyword', type: 'missing', message: 'Keyword is empty' });
                }
                if (!matchCell) {
                    problems.push({ row: rowNum, col: 'Match type', type: 'missing', message: 'Match type is empty' });
                }
                if (matchCell && !ALLOWED_MATCH_TYPES.includes(matchCell.trim())) {
                    problems.push({ 
                        row: rowNum, 
                        col: 'Match type', 
                        type: 'invalid', 
                        message: `Match type not one of ${ALLOWED_MATCH_TYPES.join(', ')}` 
                    });
                }

                // Check if keyword format matches declared match type
                if (keywordCell && matchCell) {
                    if (!isValidKeywordForMatch(keywordCell, matchCell.trim())) {
                        problems.push({ 
                            row: rowNum, 
                            col: 'Keyword', 
                            type: 'format_mismatch', 
                            message: `Keyword formatting does not match match type (${matchCell})` 
                        });
                    }
                }

                // Duplicate detection (only for keyword rows)
                const norm = (keywordCell || '').toLowerCase().replace(/[\s\u00A0]+/g, ' ').trim();
                if (norm) {
                    if (seen.has(norm)) {
                        problems.push({ 
                            row: rowNum, 
                            col: 'Keyword', 
                            type: 'duplicate', 
                            message: `Duplicate of row ${seen.get(norm)}` 
                        });
                    } else {
                        seen.set(norm, rowNum);
                    }
                }
            }

            // Forbidden tokens
            const forbidden = ['\u0000'];
            forbidden.forEach(tok => {
                if ((keywordCell || '').includes(tok)) {
                    problems.push({ 
                        row: rowNum, 
                        col: 'Keyword', 
                        type: 'forbidden', 
                        message: 'Contains forbidden control characters' 
                    });
                }
            });

            // Length checks
            if ((keywordCell || '').length > 255) {
                problems.push({ 
                    row: rowNum, 
                    col: 'Keyword', 
                    type: 'too_long', 
                    message: 'Keyword longer than 255 chars; may be truncated' 
                });
            }
            if ((row['Campaign'] || '').length > 255) {
                problems.push({ 
                    row: rowNum, 
                    col: 'Campaign', 
                    type: 'too_long', 
                    message: 'Campaign name longer than 255 chars' 
                });
            }
        });

        return problems;
    }, [detectMatchTypeFormat, isValidKeywordForMatch]);

    // Handle file upload
    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setHeaders([]);
        setRows([]);
        setProblems([]);
        setEditorBehavior([]);

        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            
            // Handle Excel files (.xlsx, .xls)
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target?.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: 'array' });
                        
                        // Get first sheet
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        // Convert to JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        if (jsonData.length === 0) {
                            throw new Error('Excel file is empty');
                        }
                        
                        // First row is headers
                        const excelHeaders = (jsonData[0] as any[]).map((h: any) => String(h || '').trim()).filter(h => h);
                        const normalizedHeaders = normalizeHeaders(excelHeaders);
                        
                        // Rest are rows
                        const excelRows = jsonData.slice(1)
                            .filter((row: any[]) => row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
                            .map((row: any[]) => {
                                const rowObj: any = {};
                                excelHeaders.forEach((header, idx) => {
                                    rowObj[header] = row[idx] !== null && row[idx] !== undefined ? String(row[idx]) : '';
                                });
                                return rowObj;
                            });
                        
                        setHeaders(normalizedHeaders);
                        setRows(excelRows);
                        setProblems([]);
                        setEditorBehavior([]);
                        setUploading(false);
                        
                        notifications.success(`Successfully loaded ${excelRows.length} rows from Excel file`, {
                            title: 'File Loaded'
                        });
                    } catch (error: any) {
                        console.error('Excel parsing error:', error);
                        notifications.error('Error parsing Excel file: ' + (error.message || 'Unknown error'), {
                            title: 'Parse Error'
                        });
                        setUploading(false);
                    }
                };
                reader.onerror = () => {
                    notifications.error('Error reading Excel file', {
                        title: 'Read Error'
                    });
                    setUploading(false);
                };
                reader.readAsArrayBuffer(file);
            } else {
                // Handle CSV files
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const normalizedHeaders = normalizeHeaders(results.meta.fields || []);
                        setHeaders(normalizedHeaders);
                        setRows(results.data || []);
                        setProblems([]);
                        setEditorBehavior([]);
                        setUploading(false);
                        
                        notifications.success(`Successfully loaded ${results.data?.length || 0} rows from CSV file`, {
                            title: 'File Loaded'
                        });
                    },
                    error: (error) => {
                        console.error('CSV parsing error:', error);
                        notifications.error('Error parsing CSV: ' + error.message, {
                            title: 'Parse Error'
                        });
                        setUploading(false);
                    }
                });
            }
        } catch (error: any) {
            console.error('File upload error:', error);
            notifications.error('Error uploading file: ' + (error.message || 'Unknown error'), {
                title: 'Upload Error'
            });
            setUploading(false);
        }
    }, [normalizeHeaders]);

    // Validate using Google Ads Editor format
    const validateGoogleAdsEditorFormat = useCallback((rows: any[], headers: string[]): { errors: string[]; warnings: string[]; errorDetails: Array<{ row: number; message: string }>; warningDetails: Array<{ row: number; message: string }> } => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const errorDetails: Array<{ row: number; message: string }> = [];
        const warningDetails: Array<{ row: number; message: string }> = [];

        // Check for Row Type column
        const hasRowType = headers.some(h => h.toLowerCase().trim() === 'row type');
        if (!hasRowType) {
            errors.push('Missing required header: Row Type');
        }

        rows.forEach((row, i) => {
            const rowNum = i + 2; // header row is 1
            const rowType = (row['Row Type'] || row['row type'] || '').toString().toUpperCase().trim();
            
            // If no Row Type, try to infer it
            if (!rowType) {
                if (row['Campaign'] && !row['AdGroup'] && !row['Keyword'] && !row['Ad Type']) {
                    // Likely a campaign row
                    warnings.push(`Row ${rowNum}: Missing Row Type (inferred as CAMPAIGN)`);
                    warningDetails.push({ row: rowNum, message: 'Missing Row Type - inferred as CAMPAIGN' });
                } else if (row['Campaign'] && row['AdGroup'] && !row['Keyword'] && !row['Ad Type']) {
                    // Likely an ad group row
                    warnings.push(`Row ${rowNum}: Missing Row Type (inferred as ADGROUP)`);
                    warningDetails.push({ row: rowNum, message: 'Missing Row Type - inferred as ADGROUP' });
                } else if (row['Keyword'] || row['Match Type']) {
                    // Likely a keyword row
                    warnings.push(`Row ${rowNum}: Missing Row Type (inferred as KEYWORD)`);
                    warningDetails.push({ row: rowNum, message: 'Missing Row Type - inferred as KEYWORD' });
                } else if (row['Ad Type'] || row['Headline 1']) {
                    // Likely an ad row
                    warnings.push(`Row ${rowNum}: Missing Row Type (inferred as AD)`);
                    warningDetails.push({ row: rowNum, message: 'Missing Row Type - inferred as AD' });
                } else {
                    errors.push(`Row ${rowNum}: Missing Row Type`);
                    errorDetails.push({ row: rowNum, message: 'Missing Row Type - cannot determine row type' });
                }
            }

            // Validate campaign rows
            if (rowType === 'CAMPAIGN' || (!rowType && row['Campaign'] && !row['AdGroup'])) {
                if (!row['Campaign'] || !row['Campaign'].toString().trim()) {
                    errors.push(`Row ${rowNum}: Campaign name is required`);
                    errorDetails.push({ row: rowNum, message: 'Campaign name is required for CAMPAIGN row' });
                }
            }

            // Validate ad group rows
            if (rowType === 'ADGROUP' || (!rowType && row['Campaign'] && row['AdGroup'] && !row['Keyword'])) {
                if (!row['AdGroup'] || !row['AdGroup'].toString().trim()) {
                    errors.push(`Row ${rowNum}: AdGroup name is required`);
                    errorDetails.push({ row: rowNum, message: 'AdGroup name is required for ADGROUP row' });
                }
            }

            // Validate keyword rows
            if (rowType === 'KEYWORD' || (!rowType && (row['Keyword'] || row['Match Type']))) {
                if (!row['Keyword'] || !row['Keyword'].toString().trim()) {
                    errors.push(`Row ${rowNum}: Keyword text is required`);
                    errorDetails.push({ row: rowNum, message: 'Keyword text is required for KEYWORD row' });
                }
            }

            // Validate ad rows
            if (rowType === 'AD' || (!rowType && (row['Ad Type'] || row['Headline 1']))) {
                if (!row['Final URL'] || !row['Final URL'].toString().trim()) {
                    errors.push(`Row ${rowNum}: Final URL is required for AD row`);
                    errorDetails.push({ row: rowNum, message: 'Final URL is required for AD row' });
                }
            }
        });

        return { errors, warnings, errorDetails, warningDetails };
    }, []);

    // Validate
    const handleValidate = useCallback(async () => {
        if (rows.length === 0) {
            notifications.warning('Please upload a CSV file first.', {
                title: 'No File Uploaded'
            });
            return;
        }

        setLoading(true);
        try {
            // Use Google Ads Editor format validation
            const validation = validateGoogleAdsEditorFormat(rows, headers);
            const problems = validateRows(rows, headers);
            
            // Combine validations
            const allProblems = [...problems];
            validation.errors.forEach(err => {
                allProblems.push({ row: 0, col: 'Row Type', type: 'missing', message: err });
            });
            
            setProblems(allProblems);
            setValidationStats({
                errors: validation.errors.length + problems.filter(p => p.type === 'missing' || p.type === 'invalid' || p.type === 'format_mismatch').length,
                warnings: validation.warnings.length + problems.filter(p => p.type === 'duplicate' || p.type === 'too_long').length,
                totalRows: rows.length,
                errorDetails: validation.errorDetails,
                warningDetails: validation.warningDetails,
            });
            
            const behavior: string[] = [];
            if (allProblems.length === 0) {
                behavior.push('Google Ads Editor should accept this CSV without errors.');
                notifications.success('CSV validation completed successfully! No errors found.', {
                    title: 'Validation Complete'
                });
            } else {
                behavior.push('Google Ads Editor may reject rows with format errors or show them in the "Rejected changes" pane.');
                if (!headers.some(h => h.toLowerCase().trim() === 'row type')) {
                    behavior.push('Missing "Row Type" column - this is required for Google Ads Editor import.');
                }
                notifications.warning(`Validation completed with ${allProblems.length} problem(s) found.`, {
                    title: 'Validation Complete'
                });
            }
            setEditorBehavior(behavior);
        } catch (error: any) {
            console.error('Validation error:', error);
            notifications.error('Validation failed: ' + (error.message || 'Unknown error'), {
                title: 'Validation Failed'
            });
        } finally {
            setLoading(false);
        }
    }, [headers, rows, validateRows, validateGoogleAdsEditorFormat]);

    // Update cell
    const updateCell = useCallback((rowIdx: number, col: string, value: string) => {
        const newRows = [...rows];
        newRows[rowIdx] = { ...newRows[rowIdx], [col]: value };
        setRows(newRows);
        setEditingCell(null);
    }, [rows]);

    // Start editing
    const startEdit = useCallback((rowIdx: number, col: string) => {
        setEditingCell({ row: rowIdx, col });
        setEditValue(rows[rowIdx]?.[col] || '');
    }, [rows]);

    // Cancel edit
    const cancelEdit = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
    }, []);

    // Save edit
    const saveEdit = useCallback(() => {
        if (editingCell) {
            updateCell(editingCell.row, editingCell.col, editValue);
        }
    }, [editingCell, editValue, updateCell]);

    // Fix sheet with AI - Google Ads Editor format
    const handleFixSheet = useCallback(async () => {
        if (rows.length === 0) {
            notifications.warning('Please upload a CSV file first.', {
                title: 'No File Uploaded'
            });
            return;
        }

        setFixing(true);
        try {
            const fixed: any[] = [];
            const actions: FixAction[] = [];
            const seen = new Set<string>();
            let newHeaders = [...headers];
            
            // Add Row Type column if missing
            const hasRowType = headers.some(h => h.toLowerCase().trim() === 'row type');
            if (!hasRowType) {
                newHeaders = ['Row Type', ...headers];
                actions.push({ row: 0, action: 'Added missing "Row Type" column' });
            }

            rows.forEach((row, i) => {
                const copy: any = { ...row };
                const changed: string[] = [];
                const rowNum = i + 2;

                // Determine and set Row Type if missing
                if (!copy['Row Type'] && !copy['row type']) {
                    if (copy['Campaign'] && !copy['AdGroup'] && !copy['Keyword'] && !copy['Ad Type']) {
                        copy['Row Type'] = 'CAMPAIGN';
                        changed.push('set Row Type to CAMPAIGN');
                    } else if (copy['Campaign'] && copy['AdGroup'] && !copy['Keyword'] && !copy['Ad Type']) {
                        copy['Row Type'] = 'ADGROUP';
                        changed.push('set Row Type to ADGROUP');
                    } else if (copy['Keyword'] || copy['Match Type']) {
                        copy['Row Type'] = 'KEYWORD';
                        changed.push('set Row Type to KEYWORD');
                    } else if (copy['Ad Type'] || copy['Headline 1']) {
                        copy['Row Type'] = 'AD';
                        changed.push('set Row Type to AD');
                    } else if (copy['Negative Keyword']) {
                        copy['Row Type'] = 'NEGATIVE_KEYWORD';
                        changed.push('set Row Type to NEGATIVE_KEYWORD');
                    } else {
                        copy['Row Type'] = 'KEYWORD'; // Default
                        changed.push('set Row Type to KEYWORD (default)');
                    }
                }

                // Normalize Row Type to uppercase
                if (copy['Row Type']) {
                    copy['Row Type'] = copy['Row Type'].toString().toUpperCase().trim();
                }

                // Normalize whitespace
                if (copy['Keyword']) {
                    const orig = copy['Keyword'];
                    copy['Keyword'] = orig.toString().replace(/\s+/g, ' ').trim();
                    if (copy['Keyword'] !== orig) changed.push('normalized whitespace');
                }

                // Fix match type for keywords
                if (copy['Row Type'] === 'KEYWORD' || copy['Row Type'] === 'NEGATIVE_KEYWORD') {
                    if (!copy['Match Type'] && !copy['match type']) {
                        const detected = detectMatchTypeFormat(copy['Keyword']?.toString() || copy['Negative Keyword']?.toString() || '');
                        if (detected) {
                            // For negative keywords, use Google Ads Editor format: "Negative Broad"
                            if (copy['Row Type'] === 'NEGATIVE_KEYWORD') {
                                const negativeFormat = detected.toUpperCase() === 'EXACT' ? 'Negative Exact' :
                                                      detected.toUpperCase() === 'PHRASE' ? 'Negative Phrase' : 'Negative Broad';
                                copy['Match Type'] = negativeFormat;
                                changed.push(`set Match Type to ${negativeFormat}`);
                            } else {
                                // For positive keywords, use standard format: "Broad", "Phrase", "Exact"
                                copy['Match Type'] = detected.charAt(0).toUpperCase() + detected.slice(1).toLowerCase();
                                changed.push(`set Match Type to ${copy['Match Type']}`);
                            }
                        } else {
                            // Default match type
                            if (copy['Row Type'] === 'NEGATIVE_KEYWORD') {
                                copy['Match Type'] = 'Negative Broad';
                                changed.push('set Match Type to Negative Broad (default)');
                            } else {
                                copy['Match Type'] = 'Broad';
                                changed.push('set Match Type to Broad (default)');
                            }
                        }
                    } else {
                        // Normalize match type
                        const matchType = (copy['Match Type'] || copy['match type'] || '').toString().trim();
                        
                        // For negative keywords, ensure proper format
                        if (copy['Row Type'] === 'NEGATIVE_KEYWORD') {
                            const upper = matchType.toUpperCase();
                            if (upper === 'BROAD' || upper === 'NEGATIVE_BROAD' || upper === 'NEGATIVE BROAD') {
                                copy['Match Type'] = 'Negative Broad';
                            } else if (upper === 'PHRASE' || upper === 'NEGATIVE_PHRASE' || upper === 'NEGATIVE PHRASE') {
                                copy['Match Type'] = 'Negative Phrase';
                            } else if (upper === 'EXACT' || upper === 'NEGATIVE_EXACT' || upper === 'NEGATIVE EXACT') {
                                copy['Match Type'] = 'Negative Exact';
                            } else if (!matchType.includes('Negative')) {
                                // If it doesn't contain "Negative", add it
                                copy['Match Type'] = 'Negative ' + matchType.charAt(0).toUpperCase() + matchType.slice(1).toLowerCase();
                                changed.push(`normalized negative match type to ${copy['Match Type']}`);
                            } else {
                                // Already in correct format, just normalize capitalization
                                copy['Match Type'] = matchType.charAt(0).toUpperCase() + matchType.slice(1).toLowerCase();
                            }
                        } else {
                            // For positive keywords, normalize to "Broad", "Phrase", "Exact"
                            const upper = matchType.toUpperCase();
                            if (upper === 'BROAD') {
                                copy['Match Type'] = 'Broad';
                            } else if (upper === 'PHRASE') {
                                copy['Match Type'] = 'Phrase';
                            } else if (upper === 'EXACT') {
                                copy['Match Type'] = 'Exact';
                            } else {
                                copy['Match Type'] = matchType.charAt(0).toUpperCase() + matchType.slice(1).toLowerCase();
                            }
                        }
                    }
                }

                // Fix keyword format to match match type
                if (copy['Keyword'] && copy['Match Type']) {
                    const mt = copy['Match Type'].toString().toUpperCase();
                    const keyword = copy['Keyword'].toString();
                    if (!isValidKeywordForMatch(keyword, mt)) {
                        if (mt === 'EXACT' && !/^\[.*\]$/.test(keyword)) {
                            copy['Keyword'] = `[${keyword.replace(/^\-/, '')}]`;
                            changed.push('wrapped keyword in [ ] for EXACT');
                        } else if (mt === 'PHRASE' && !/^\".*\"$/.test(keyword)) {
                            copy['Keyword'] = `"${keyword.replace(/^\-/, '')}"`;
                            changed.push('wrapped keyword in "" for PHRASE');
                        } else if (mt === 'BROAD' && (/^\[.*\]$/.test(keyword) || /^\".*\"$/.test(keyword))) {
                            copy['Keyword'] = keyword.replace(/^\[|\]$|^\"|\"$/g, '');
                            changed.push('removed brackets/quotes for BROAD');
                        }
                    }
                }

                // Truncate long fields
                if (copy['Keyword'] && copy['Keyword'].toString().length > 250) {
                    copy['Keyword'] = copy['Keyword'].toString().slice(0, 250);
                    changed.push('truncated keyword to 250 chars');
                }

                // Ensure required fields for campaigns
                if (copy['Row Type'] === 'CAMPAIGN') {
                    if (!copy['Campaign Status']) {
                        copy['Campaign Status'] = 'ENABLED';
                        changed.push('set Campaign Status to ENABLED');
                    }
                    if (!copy['Campaign Type']) {
                        copy['Campaign Type'] = 'SEARCH';
                        changed.push('set Campaign Type to SEARCH');
                    }
                }

                // Ensure required fields for ad groups
                if (copy['Row Type'] === 'ADGROUP') {
                    if (!copy['AdGroup Status']) {
                        copy['AdGroup Status'] = 'ENABLED';
                        changed.push('set AdGroup Status to ENABLED');
                    }
                }

                // Ensure required fields for keywords
                if (copy['Row Type'] === 'KEYWORD') {
                    if (!copy['Keyword Status']) {
                        copy['Keyword Status'] = 'ENABLED';
                        changed.push('set Keyword Status to ENABLED');
                    }
                }

                // Ensure required fields for ads
                if (copy['Row Type'] === 'AD') {
                    if (!copy['Ad Status']) {
                        copy['Ad Status'] = 'ENABLED';
                        changed.push('set Ad Status to ENABLED');
                    }
                    if (!copy['Ad Type']) {
                        copy['Ad Type'] = 'RESPONSIVE_SEARCH_AD';
                        changed.push('set Ad Type to RESPONSIVE_SEARCH_AD');
                    }
                }

                // De-duplicate keywords
                if (copy['Row Type'] === 'KEYWORD' || copy['Row Type'] === 'NEGATIVE_KEYWORD') {
                    const norm = (copy['Keyword'] || '').toString().toLowerCase().replace(/[\s\u00A0]+/g, ' ').trim();
                    if (seen.has(norm)) {
                        return; // Skip duplicate
                    } else {
                        seen.add(norm);
                    }
                }

                if (changed.length) {
                    actions.push({ row: rowNum, action: changed.join('; ') });
                }
                fixed.push(copy);
            });

            setHeaders(newHeaders);
            setRows(fixed);
            setProblems([]);
            
            // Re-validate after fixing - trigger validation manually
            setTimeout(() => {
                const validation = validateGoogleAdsEditorFormat(fixed, newHeaders);
                const problems = validateRows(fixed, newHeaders);
                const allProblems = [...problems];
                validation.errors.forEach(err => {
                    allProblems.push({ row: 0, col: 'Row Type', type: 'missing', message: err });
                });
                setProblems(allProblems);
                setValidationStats({
                    errors: validation.errors.length + problems.filter(p => p.type === 'missing' || p.type === 'invalid' || p.type === 'format_mismatch').length,
                    warnings: validation.warnings.length + problems.filter(p => p.type === 'duplicate' || p.type === 'too_long').length,
                    totalRows: fixed.length,
                    errorDetails: validation.errorDetails,
                    warningDetails: validation.warningDetails,
                });
            }, 100);

            const actionsText = actions.slice(0, 10).map(a => `Row ${a.row}: ${a.action}`).join('\n') + 
                (actions.length > 10 ? `\n... and ${actions.length - 10} more fixes` : '');
            notifications.success(`CSV fixed successfully! ${actions.length} fix(es) applied.`, {
                title: 'Fix Completed',
                description: actionsText,
                duration: 8000
            });
        } catch (error: any) {
            console.error('Fix error:', error);
            notifications.error('Fix failed: ' + (error.message || 'Unknown error'), {
                title: 'Fix Failed'
            });
        } finally {
            setFixing(false);
        }
    }, [headers, rows, detectMatchTypeFormat, isValidKeywordForMatch, validateGoogleAdsEditorFormat, validateRows]);

    // Download CSV
    const handleDownload = useCallback(() => {
        if (rows.length === 0) {
            notifications.warning('Please upload and process a file first.', {
                title: 'No File Processed'
            });
            return;
        }

        // Ensure all headers are included in the CSV
        const allHeaders = headers.length > 0 ? headers : Object.keys(rows[0] || {});
        const csv = Papa.unparse({ 
            fields: allHeaders, 
            data: rows.map(r => allHeaders.map(h => r[h] || '')) 
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `google-ads-editor-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        notifications.success('CSV downloaded successfully!', {
            title: 'Download Complete',
            description: `File: ${link.download}`
        });
    }, [headers, rows]);

    // Export CSV with errors (always available when data exists)
    const handleExportWithErrors = useCallback(() => {
        if (rows.length === 0) {
            notifications.warning('Please upload and process a file first.', {
                title: 'No File Processed'
            });
            return;
        }

        // Ensure all headers are included in the CSV
        const allHeaders = headers.length > 0 ? headers : Object.keys(rows[0] || {});
        const csv = Papa.unparse({ 
            fields: allHeaders, 
            data: rows.map(r => allHeaders.map(h => r[h] || '')) 
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const errorCount = problems.length > 0 ? `-${problems.length}-errors` : '';
        link.download = `google-ads-editor-${errorCount}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        const errorMsg = problems.length > 0 
            ? `Exported CSV with ${problems.length} error(s) for debugging.`
            : 'CSV exported successfully.';
        
        notifications.success(errorMsg, {
            title: 'CSV Exported',
            description: `File: ${link.download}`
        });
    }, [headers, rows, problems]);

    // Export only rows with errors and warnings
    const handleExportErrorsWarnings = useCallback(() => {
        if (rows.length === 0) {
            notifications.warning('Please upload and process a file first.', {
                title: 'No File Processed'
            });
            return;
        }

        if (problems.length === 0) {
            notifications.info('No errors or warnings found. Nothing to export.', {
                title: 'No Problems'
            });
            return;
        }

        // Get unique row numbers that have problems (row number in problems is 1-indexed, rows array is 0-indexed)
        // Row number 0 means header-level issues, so we skip those
        const problemRowNumbers = new Set(
            problems
                .map(p => p.row)
                .filter(rowNum => rowNum > 0) // Skip header-level problems (row 0)
        );

        if (problemRowNumbers.size === 0) {
            notifications.info('No row-level errors or warnings found. All problems are header-level.', {
                title: 'No Row Problems'
            });
            return;
        }

        // Filter rows to only include those with problems
        // problems.row is 1-indexed (row 1 = header, row 2 = first data row)
        // rows array is 0-indexed (index 0 = first data row)
        // So row number 2 in problems = index 0 in rows
        const errorRowsWithIndex: Array<{ row: any; index: number; rowNumber: number }> = [];
        rows.forEach((row, index) => {
            const rowNumber = index + 2; // Convert 0-indexed to 1-indexed (accounting for header row)
            if (problemRowNumbers.has(rowNumber)) {
                errorRowsWithIndex.push({ row, index, rowNumber });
            }
        });

        if (errorRowsWithIndex.length === 0) {
            notifications.warning('No rows with errors found.', {
                title: 'No Error Rows'
            });
            return;
        }

        // Ensure all headers are included in the CSV
        const allHeaders = headers.length > 0 ? headers : Object.keys(rows[0] || {});
        
        // Add a column to show what problems each row has
        const enhancedHeaders = [...allHeaders, 'Problems'];
        const enhancedRows = errorRowsWithIndex.map(({ row, rowNumber }) => {
            const rowProblems = problems
                .filter(p => p.row === rowNumber)
                .map(p => `${p.col}: ${p.message}`)
                .join('; ');
            return [...allHeaders.map(h => row[h] || ''), rowProblems];
        });

        const csv = Papa.unparse({ 
            fields: enhancedHeaders, 
            data: enhancedRows
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const errorCount = problems.filter(p => p.row > 0).length;
        const warningCount = validationStats.warnings;
        link.download = `google-ads-errors-warnings-${errorCount}E-${warningCount}W-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        notifications.success(`Exported ${errorRowsWithIndex.length} row(s) with ${errorCount} error(s) and ${warningCount} warning(s).`, {
            title: 'Errors & Warnings Exported',
            description: `File: ${link.download}`
        });
    }, [headers, rows, problems, validationStats]);

    // Get cell problem
    const getCellProblem = useCallback((rowIdx: number, col: string): ValidationProblem | undefined => {
        return problems.find(p => p.row === rowIdx + 2 && p.col === col);
    }, [problems]);

    // Calculate statistics
    const statistics = useMemo(() => {
        if (rows.length === 0) {
            return {
                campaigns: 0,
                adGroups: 0,
                keywords: 0,
                extensionsAssets: 0,
                locations: 0,
            };
        }

        // Find column names (case-insensitive matching with variations)
        const campaignCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'campaign' || lower.includes('campaign');
        }) || '';
        const adGroupCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'ad group' || lower === 'adgroup' || lower.includes('ad group');
        }) || '';
        const keywordCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'keyword' || lower.includes('keyword');
        }) || '';
        const rowTypeCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'row type' || lower === 'rowtype' || lower.includes('row type');
        }) || '';
        const matchTypeCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'match type' || lower === 'matchtype' || lower.includes('match type');
        }) || '';
        const networksCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'networks' || lower.includes('network');
        }) || '';
        const assetTypeCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'asset type' || lower === 'assettype' || lower.includes('asset');
        }) || '';
        const locationCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'location' || lower.includes('location');
        }) || '';

        // Count unique campaigns
        const uniqueCampaigns = new Set<string>();
        rows.forEach(row => {
            const campaign = row[campaignCol] || '';
            if (campaign.trim()) {
                uniqueCampaigns.add(campaign.trim());
            }
        });

        // Count unique ad groups - check both "Ad Group" column and also infer from campaign + other unique combinations
        const uniqueAdGroups = new Set<string>();
        rows.forEach(row => {
            const adGroup = row[adGroupCol] || '';
            if (adGroup.trim()) {
                uniqueAdGroups.add(adGroup.trim());
            } else {
                // If no explicit ad group column, try to infer from campaign + other fields
                // This handles cases where ad groups might be implicit
                const campaign = row[campaignCol] || '';
                if (campaign.trim()) {
                    // Use campaign as ad group if no explicit ad group column exists
                    uniqueAdGroups.add(campaign.trim());
                }
            }
        });

        // Count keywords - check multiple indicators:
        // 1. Rows with non-empty Keyword column
        // 2. Rows with Match Type column (Phrase, Exact, Broad) - these are likely keywords
        // 3. Rows where Row Type is "keyword" or empty (default is keyword)
        const keywordCount = rows.filter(row => {
            const keyword = row[keywordCol] || '';
            const matchType = row[matchTypeCol] || '';
            const rowType = (row[rowTypeCol] || '').toLowerCase().trim();
            const networks = row[networksCol] || '';
            
            // If there's a keyword column with value, it's a keyword
            if (keyword.trim() !== '') {
                return true;
            }
            
            // If there's a match type (Phrase, Exact, Broad), it's likely a keyword row
            const matchTypeLower = matchType.toLowerCase().trim();
            if (matchTypeLower === 'phrase' || matchTypeLower === 'exact' || matchTypeLower === 'broad' ||
                matchTypeLower === 'exact (negative)' || matchTypeLower === 'phrase (negative)' || matchTypeLower === 'broad (negative)') {
                return true;
            }
            
            // If Networks column has match types (Phrase, Exact, Broad), it's likely a keyword
            const networksLower = networks.toLowerCase().trim();
            if (networksLower === 'phrase' || networksLower === 'exact' || networksLower === 'broad') {
                return true;
            }
            
            // If Row Type is empty or "keyword", it's a keyword row
            if (rowType === '' || rowType === 'keyword') {
                return true;
            }
            
            return false;
        }).length;

        // Count extensions/assets - check multiple indicators:
        // 1. Row Type matches extension types
        // 2. Asset Type column has value
        // 3. Extension-specific columns exist (Sitelink Text, Callout Text, Phone Number, etc.)
        const sitelinkTextCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'sitelink text' || lower.includes('sitelink');
        }) || '';
        const calloutTextCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'callout text' || lower.includes('callout');
        }) || '';
        const phoneNumberCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'phone number' || lower.includes('phone');
        }) || '';
        const structuredSnippetHeaderCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'header' || (lower.includes('header') && lower.includes('snippet'));
        }) || '';
        
        const extensionsAssetsCount = rows.filter(row => {
            const rowType = (row[rowTypeCol] || '').toLowerCase().trim();
            const assetType = (row[assetTypeCol] || '').trim();
            
            // Check row type
            if (rowType === 'sitelink' || 
                rowType === 'call' ||
                rowType === 'callout' ||
                rowType === 'snippet' ||
                rowType === 'structured snippet' ||
                rowType === 'price' ||
                rowType === 'promotion' ||
                rowType === 'app' ||
                rowType === 'leadform' ||
                rowType === 'image' ||
                rowType === 'message') {
                return true;
            }
            
            // Check asset type column
            if (assetType !== '') {
                return true;
            }
            
            // Check extension-specific columns
            if (sitelinkTextCol && (row[sitelinkTextCol] || '').trim() !== '') {
                return true;
            }
            if (calloutTextCol && (row[calloutTextCol] || '').trim() !== '') {
                return true;
            }
            if (phoneNumberCol && (row[phoneNumberCol] || '').trim() !== '') {
                return true;
            }
            
            return false;
        }).length;

        // Count locations - check for Location Target column (used in ZIP, City/State, and Location targeting blocks)
        const locationTargetCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'location target' || lower.includes('location target');
        }) || '';
        
        // Also check for Target Type column which indicates location targeting
        const targetTypeCol = headers.find(h => {
            const lower = h.toLowerCase();
            return lower === 'target type' || lower.includes('target type');
        }) || '';
        
        // Count locations (Row Type = location, Location column has value, Location Target column has value, or Target Type indicates location)
        const locationsCount = rows.filter(row => {
            const rowType = (row[rowTypeCol] || '').toLowerCase().trim();
            const location = row[locationCol] || '';
            const locationTarget = row[locationTargetCol] || '';
            const targetType = (row[targetTypeCol] || '').toLowerCase().trim();
            
            // Check row type
            if (rowType === 'location' || rowType === 'location target' || rowType === 'location targeting') {
                return true;
            }
            
            // Check location columns
            if (location.trim() !== '') {
                return true;
            }
            if (locationTarget.trim() !== '') {
                return true;
            }
            
            // Check target type for location-related values
            if (targetType === 'location of interest' || 
                targetType === 'city' || 
                targetType === 'state' || 
                targetType === 'postal code' ||
                targetType === 'country' ||
                targetType.includes('location')) {
                return true;
            }
            
            return false;
        }).length;

        return {
            campaigns: uniqueCampaigns.size,
            adGroups: uniqueAdGroups.size > 0 ? uniqueAdGroups.size : (uniqueCampaigns.size > 0 ? uniqueCampaigns.size : 0),
            keywords: keywordCount,
            extensionsAssets: extensionsAssetsCount,
            locations: locationsCount,
        };
    }, [rows, headers]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 w-full">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        CSV Validator V3
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600">
                        Upload a CSV exported from your sheet or generated by the generator. The validator will check for errors and show how Google Ads Editor will behave on import.
                    </p>
                </div>

                {/* Upload Section */}
                <Card className="mb-4 sm:mb-6 border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                    <CardContent className="p-4 sm:p-6">
                        <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                            uploading 
                                ? 'border-indigo-500 bg-indigo-50/50 cursor-wait' 
                                : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/30'
                        }`}>
                            <input
                                type="file"
                                id="csvFile2"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                            <label
                                htmlFor="csvFile2"
                                className={`flex flex-col items-center gap-4 ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-spin" />
                                        </div>
                                        <div>
                                            <p className="text-base sm:text-lg font-semibold text-slate-700 mb-1">
                                                Uploading and Processing...
                                            </p>
                                            <p className="text-xs sm:text-sm text-slate-500">
                                                Please wait while we process your file
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-base sm:text-lg font-semibold text-slate-700 mb-1">
                                                Click to Upload CSV or Excel File
                                            </p>
                                            <p className="text-xs sm:text-sm text-slate-500">
                                                or drag and drop your file here (.csv, .xlsx, .xls)
                                            </p>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                {headers.length > 0 && (
                    <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
                        <Button
                            onClick={handleValidate}
                            disabled={loading || rows.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Validating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Validate
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleFixSheet}
                            disabled={fixing || rows.length === 0}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {fixing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Fixing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Fix Sheet with AI
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={rows.length === 0 || problems.length > 0}
                            variant="outline"
                            className="border-slate-300"
                            title={problems.length > 0 ? "Fix errors first or use 'Export with Errors' button" : "Download validated CSV"}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download CSV
                        </Button>
                        <Button
                            onClick={handleExportWithErrors}
                            disabled={rows.length === 0}
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            title="Export CSV file even with errors for debugging"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Export with Errors
                        </Button>
                        <Button
                            onClick={handleExportErrorsWarnings}
                            disabled={rows.length === 0 || problems.length === 0}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            title="Export only rows that have errors or warnings"
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Errors & Warnings Export
                        </Button>
                    </div>
                )}

                {/* Detected Headers */}
                {headers.length > 0 && (
                    <Card className="mb-4 sm:mb-6 border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-4 sm:p-6">
                            <p className="text-sm sm:text-base">
                                <strong>Detected Headers:</strong> {headers.join(', ')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Editor Behavior */}
                {editorBehavior.length > 0 && (
                    <Card className="mb-4 sm:mb-6 border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                        <CardHeader className="p-4 sm:p-6 pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                Editor Behavior
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-700">
                                {editorBehavior.map((b, i) => (
                                    <li key={i}>{b}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Problems */}
                {problems.length > 0 && (
                    <Card className="mb-4 sm:mb-6 border-red-200/60 bg-red-50/50 backdrop-blur-xl shadow-xl">
                        <CardHeader className="p-4 sm:p-6 pb-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-red-700">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                Problems ({problems.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                            <div className="max-h-60 overflow-y-auto space-y-1.5">
                                {problems.slice(0, 50).map((p, i) => (
                                    <div key={i} className="text-sm sm:text-base text-red-700">
                                        Row {p.row} • {p.col} • {p.type} • {p.message}
                                    </div>
                                ))}
                                {problems.length > 50 && (
                                    <div className="text-sm text-slate-500 italic">
                                        ... and {problems.length - 50} more problems
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Statistics Cards */}
                {rows.length > 0 && (
                    <>
                    <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        {/* Campaigns Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-indigo-50 to-indigo-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Campaigns</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-indigo-700">{statistics.campaigns}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                                        <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ad Groups Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Ad Groups</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-purple-700">{statistics.adGroups}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Keywords Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Keywords</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-blue-700">{statistics.keywords}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Extensions/Assets Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Extensions/Assets</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-green-700">{statistics.extensionsAssets}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Locations Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Locations</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-orange-700">{statistics.locations}</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Statistics Table */}
                    {problems.length > 0 || validationStats.errors > 0 || validationStats.warnings > 0 ? (
                        <Card className="mb-4 sm:mb-6 border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Validation Statistics</CardTitle>
                                <CardDescription className="text-sm">Click on any row to expand and see details</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                                            <tr>
                                                <th className="p-3 text-left text-sm font-semibold border-r border-slate-700">Metric</th>
                                                <th className="p-3 text-left text-sm font-semibold border-r border-slate-700">Count</th>
                                                <th className="p-3 text-left text-sm font-semibold">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            <tr 
                                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedStats.has('errors') ? 'bg-red-50' : ''}`}
                                                onClick={() => {
                                                    const newExpanded = new Set(expandedStats);
                                                    if (newExpanded.has('errors')) {
                                                        newExpanded.delete('errors');
                                                    } else {
                                                        newExpanded.add('errors');
                                                    }
                                                    setExpandedStats(newExpanded);
                                                }}
                                            >
                                                <td className="p-3 text-sm font-medium text-slate-700 border-r border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                                        Errors
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-red-600 font-semibold border-r border-slate-200">
                                                    {validationStats.errors || problems.filter(p => p.type === 'missing' || p.type === 'invalid' || p.type === 'format_mismatch').length}
                                                </td>
                                                <td className="p-3 text-sm text-slate-600">
                                                    {expandedStats.has('errors') ? 'Click to collapse' : 'Click to expand'}
                                                </td>
                                            </tr>
                                            {expandedStats.has('errors') && (
                                                <tr className="bg-red-50/50">
                                                    <td colSpan={3} className="p-4">
                                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                                            {validationStats.errorDetails.length > 0 ? (
                                                                validationStats.errorDetails.map((detail, idx) => (
                                                                    <div key={idx} className="text-sm text-red-700 p-2 bg-red-100 rounded">
                                                                        <strong>Row {detail.row}:</strong> {detail.message}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                problems.filter(p => p.type === 'missing' || p.type === 'invalid' || p.type === 'format_mismatch').slice(0, 20).map((p, idx) => (
                                                                    <div key={idx} className="text-sm text-red-700 p-2 bg-red-100 rounded">
                                                                        <strong>Row {p.row} • {p.col}:</strong> {p.message}
                                                                    </div>
                                                                ))
                                                            )}
                                                            {(validationStats.errorDetails.length > 20 || problems.filter(p => p.type === 'missing' || p.type === 'invalid' || p.type === 'format_mismatch').length > 20) && (
                                                                <div className="text-xs text-slate-500 italic">
                                                                    ... and more errors
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            <tr 
                                                className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedStats.has('warnings') ? 'bg-yellow-50' : ''}`}
                                                onClick={() => {
                                                    const newExpanded = new Set(expandedStats);
                                                    if (newExpanded.has('warnings')) {
                                                        newExpanded.delete('warnings');
                                                    } else {
                                                        newExpanded.add('warnings');
                                                    }
                                                    setExpandedStats(newExpanded);
                                                }}
                                            >
                                                <td className="p-3 text-sm font-medium text-slate-700 border-r border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                                                        Warnings
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-yellow-600 font-semibold border-r border-slate-200">
                                                    {validationStats.warnings || problems.filter(p => p.type === 'duplicate' || p.type === 'too_long').length}
                                                </td>
                                                <td className="p-3 text-sm text-slate-600">
                                                    {expandedStats.has('warnings') ? 'Click to collapse' : 'Click to expand'}
                                                </td>
                                            </tr>
                                            {expandedStats.has('warnings') && (
                                                <tr className="bg-yellow-50/50">
                                                    <td colSpan={3} className="p-4">
                                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                                            {validationStats.warningDetails.length > 0 ? (
                                                                validationStats.warningDetails.map((detail, idx) => (
                                                                    <div key={idx} className="text-sm text-yellow-700 p-2 bg-yellow-100 rounded">
                                                                        <strong>Row {detail.row}:</strong> {detail.message}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                problems.filter(p => p.type === 'duplicate' || p.type === 'too_long').slice(0, 20).map((p, idx) => (
                                                                    <div key={idx} className="text-sm text-yellow-700 p-2 bg-yellow-100 rounded">
                                                                        <strong>Row {p.row} • {p.col}:</strong> {p.message}
                                                                    </div>
                                                                ))
                                                            )}
                                                            {(validationStats.warningDetails.length > 20 || problems.filter(p => p.type === 'duplicate' || p.type === 'too_long').length > 20) && (
                                                                <div className="text-xs text-slate-500 italic">
                                                                    ... and more warnings
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            <tr className="hover:bg-slate-50">
                                                <td className="p-3 text-sm font-medium text-slate-700 border-r border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                        Total Rows
                                                    </div>
                                                </td>
                                                <td className="p-3 text-sm text-blue-600 font-semibold border-r border-slate-200">
                                                    {validationStats.totalRows || rows.length}
                                                </td>
                                                <td className="p-3 text-sm text-slate-600">
                                                    Rows parsed from CSV
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}
                    </>
                )}

                {/* Data Table */}
                {rows.length > 0 && (
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="text-base sm:text-lg">Data Table ({rows.length} rows)</CardTitle>
                            <CardDescription className="text-sm">Click on any cell to edit inline</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg z-10">
                                        <tr>
                                            <th className="p-2 sm:p-3 text-xs sm:text-sm text-left font-semibold border-r border-slate-700">#</th>
                                            {headers.map(h => (
                                                <th key={h} className="p-2 sm:p-3 text-xs sm:text-sm text-left font-semibold whitespace-nowrap border-r border-slate-700 last:border-r-0">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {rows.map((row, rIdx) => (
                                            <tr
                                                key={rIdx}
                                                className={`${rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-indigo-50 transition-colors`}
                                            >
                                                <td className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-slate-700 border-r border-slate-200">
                                                    {rIdx + 1}
                                                </td>
                                                {headers.map(h => {
                                                    const problem = getCellProblem(rIdx, h);
                                                    const isEditing = editingCell?.row === rIdx && editingCell?.col === h;
                                                    const value = row[h] || '';

                                                    return (
                                                        <td
                                                            key={h}
                                                            className={`p-1.5 sm:p-2 border-r border-slate-200 last:border-r-0 ${
                                                                problem?.type === 'error' 
                                                                    ? 'bg-red-100 border-2 border-red-500' 
                                                                    : problem?.type === 'warning'
                                                                    ? 'bg-yellow-100 border-2 border-yellow-500'
                                                                    : ''
                                                            }`}
                                                            title={problem?.message || ''}
                                                        >
                                                            {isEditing ? (
                                                                <div className="flex items-center gap-1">
                                                                    <Input
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') saveEdit();
                                                                            if (e.key === 'Escape') cancelEdit();
                                                                        }}
                                                                        className="h-7 sm:h-8 text-xs sm:text-sm"
                                                                        autoFocus
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={saveEdit}
                                                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                    >
                                                                        <Save className="w-3 h-3 text-green-600" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={cancelEdit}
                                                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                                                    >
                                                                        <X className="w-3 h-3 text-red-600" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="cursor-pointer hover:bg-indigo-100 p-1 rounded flex items-center justify-between group"
                                                                    onClick={() => startEdit(rIdx, h)}
                                                                >
                                                                    <span className="text-xs sm:text-sm break-words">{value || <span className="text-slate-400 italic">empty</span>}</span>
                                                                    <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {rows.length === 0 && (
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-8 sm:p-12 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">
                                No CSV Loaded
                            </h3>
                            <p className="text-sm sm:text-base text-slate-500">
                                Upload a CSV file to begin validation
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

