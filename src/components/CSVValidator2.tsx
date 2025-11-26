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

export const CSVValidator2 = () => {
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [problems, setProblems] = useState<ValidationProblem[]>([]);
    const [editorBehavior, setEditorBehavior] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fixing, setFixing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
    const [editValue, setEditValue] = useState('');

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
            const keywordCell = row['Keyword'] || '';
            const matchCell = row['Match type'] || '';
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

            // Duplicate detection
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
            // Try API first, fallback to client-side validation
            try {
                const resp = await api.post('/validate-csv', { headers, rows });
                setProblems(resp.problems || []);
                setEditorBehavior(resp.editorBehavior || []);
            } catch (apiError) {
                // Fallback to client-side validation
                console.log('API unavailable, using client-side validation');
                const problems = validateRows(rows, headers);
                setProblems(problems);
                
                const behavior: string[] = [];
                if (problems.length === 0) {
                    behavior.push('Google Ads Editor should accept this CSV without errors.');
                } else {
                    behavior.push('Google Ads Editor may reject rows with format errors (e.g., match type mismatches) or show them in the "Rejected changes" pane.');
                    behavior.push('Duplicates may be imported but will appear as separate rows unless Editor de-duplicates; consider removing duplicates.');
                    behavior.push('Fields longer than 255 characters may be truncated on import.');
                }
                setEditorBehavior(behavior);
            }
        } catch (error: any) {
            console.error('Validation error:', error);
            notifications.error('Validation failed: ' + (error.message || 'Unknown error'), {
                title: 'Validation Failed'
            });
        } finally {
            setLoading(false);
        }
    }, [headers, rows, validateRows]);

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

    // Fix sheet with AI
    const handleFixSheet = useCallback(async () => {
        if (rows.length === 0) {
            notifications.warning('Please upload a CSV file first.', {
                title: 'No File Uploaded'
            });
            return;
        }

        setFixing(true);
        try {
            // Try API first, fallback to client-side fix
            try {
                const resp = await api.post('/fix-csv', { 
                    headers, 
                    rows, 
                    fixOptions: { removeDuplicates: true } 
                });
                setRows(resp.fixedRows || rows);
                setProblems([]);
                const actionsText = (resp.actions || []).slice(0, 20).map((a: FixAction) => `Row ${a.row}: ${a.action}`).join('\n');
                notifications.success(`Fix completed. Actions: ${actionsText}`, {
                    title: 'Fix Completed',
                    duration: 8000
                });
            } catch (apiError) {
                // Fallback to client-side fix
                console.log('API unavailable, using client-side fix');
                const fixed: any[] = [];
                const actions: FixAction[] = [];
                const seen = new Set<string>();

                rows.forEach((row, i) => {
                    const copy = { ...row };
                    const changed: string[] = [];

                    // Normalize whitespace
                    if (copy['Keyword']) {
                        const orig = copy['Keyword'];
                        copy['Keyword'] = orig.replace(/\s+/g, ' ').trim();
                        if (copy['Keyword'] !== orig) changed.push('normalized whitespace');
                    }

                    // Fix match type
                    if (!copy['Match type'] || !ALLOWED_MATCH_TYPES.includes((copy['Match type'] || '').trim())) {
                        const detected = detectMatchTypeFormat(copy['Keyword']);
                        if (detected) {
                            copy['Match type'] = detected;
                            changed.push(`set match type to ${detected}`);
                        } else {
                            if (copy['Keyword'] && /^\[.*\]$/.test(copy['Keyword'])) {
                                copy['Match type'] = 'Exact';
                            } else if (copy['Keyword'] && /^\".*\"$/.test(copy['Keyword'])) {
                                copy['Match type'] = 'Phrase';
                            } else {
                                copy['Match type'] = 'Broad';
                            }
                            changed.push(`defaulted match type to ${copy['Match type']}`);
                        }
                    }

                    // Fix keyword format to match match type
                    if (copy['Keyword'] && copy['Match type']) {
                        const mt = copy['Match type'].trim();
                        if (!isValidKeywordForMatch(copy['Keyword'], mt)) {
                            if (mt === 'Exact' && !/^\[.*\]$/.test(copy['Keyword'])) {
                                copy['Keyword'] = `[${copy['Keyword'].replace(/^\-/, '')}]`;
                                changed.push('wrapped keyword in [ ] for Exact');
                            } else if (mt === 'Phrase' && !/^\".*\"$/.test(copy['Keyword'])) {
                                copy['Keyword'] = `"${copy['Keyword'].replace(/^\-/, '')}"`;
                                changed.push('wrapped keyword in "" for Phrase');
                            } else if (mt === 'Broad' && (/^\[.*\]$/.test(copy['Keyword']) || /^\".*\"$/.test(copy['Keyword']))) {
                                copy['Keyword'] = copy['Keyword'].replace(/^\[|\]$|^\"|\"$/g, '');
                                changed.push('removed brackets/quotes for Broad');
                            }
                        }
                    }

                    // Truncate long fields
                    if (copy['Keyword'] && copy['Keyword'].length > 250) {
                        copy['Keyword'] = copy['Keyword'].slice(0, 250);
                        changed.push('truncated keyword to 250 chars');
                    }

                    // De-duplicate
                    const norm = (copy['Keyword'] || '').toLowerCase().replace(/[\s\u00A0]+/g, ' ').trim();
                    if (seen.has(norm)) {
                        return; // Skip duplicate
                    } else {
                        seen.add(norm);
                    }

                    if (changed.length) {
                        actions.push({ row: i + 2, action: changed.join('; ') });
                    }
                    fixed.push(copy);
                });

                setRows(fixed);
                setProblems([]);
                const actionsText = actions.slice(0, 20).map(a => `Row ${a.row}: ${a.action}`).join('\n');
                notifications.success(`Fix completed. Actions: ${actionsText}`, {
                    title: 'Fix Completed',
                    duration: 8000
                });
            }
        } catch (error: any) {
            console.error('Fix error:', error);
            notifications.error('Fix failed: ' + (error.message || 'Unknown error'), {
                title: 'Fix Failed'
            });
        } finally {
            setFixing(false);
        }
    }, [headers, rows, detectMatchTypeFormat, isValidKeywordForMatch]);

    // Download CSV
    const handleDownload = useCallback(() => {
        if (rows.length === 0) {
            notifications.warning('Please upload and process a file first.', {
                title: 'No File Processed'
            });
            return;
        }

        const csv = Papa.unparse({ fields: headers, data: rows.map(r => headers.map(h => r[h] || '')) });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'fixed-google-ads.csv';
        link.click();
        URL.revokeObjectURL(url);
    }, [headers, rows]);

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

        // Find column names (case-insensitive matching)
        const campaignCol = headers.find(h => h.toLowerCase() === 'campaign') || '';
        const adGroupCol = headers.find(h => h.toLowerCase() === 'ad group' || h.toLowerCase() === 'adgroup') || '';
        const keywordCol = headers.find(h => h.toLowerCase() === 'keyword') || '';
        const rowTypeCol = headers.find(h => h.toLowerCase() === 'row type' || h.toLowerCase() === 'rowtype') || '';
        const assetTypeCol = headers.find(h => h.toLowerCase() === 'asset type' || h.toLowerCase() === 'assettype') || '';
        const locationCol = headers.find(h => h.toLowerCase() === 'location') || '';

        // Count unique campaigns
        const uniqueCampaigns = new Set<string>();
        rows.forEach(row => {
            const campaign = row[campaignCol] || '';
            if (campaign.trim()) {
                uniqueCampaigns.add(campaign.trim());
            }
        });

        // Count unique ad groups
        const uniqueAdGroups = new Set<string>();
        rows.forEach(row => {
            const adGroup = row[adGroupCol] || '';
            if (adGroup.trim()) {
                uniqueAdGroups.add(adGroup.trim());
            }
        });

        // Count keywords (non-empty)
        const keywordCount = rows.filter(row => {
            const keyword = row[keywordCol] || '';
            return keyword.trim() !== '';
        }).length;

        // Count extensions/assets (sitelink, call, or rows with Asset Type)
        const extensionsAssetsCount = rows.filter(row => {
            const rowType = (row[rowTypeCol] || '').toLowerCase().trim();
            const assetType = (row[assetTypeCol] || '').trim();
            return rowType === 'sitelink' || 
                   rowType === 'call' || 
                   assetType !== '';
        }).length;

        // Count locations (Row Type = location or Location column has value)
        const locationsCount = rows.filter(row => {
            const rowType = (row[rowTypeCol] || '').toLowerCase().trim();
            const location = row[locationCol] || '';
            return rowType === 'location' || location.trim() !== '';
        }).length;

        return {
            campaigns: uniqueCampaigns.size,
            adGroups: uniqueAdGroups.size,
            keywords: keywordCount,
            extensionsAssets: extensionsAssetsCount,
            locations: locationsCount,
        };
    }, [rows, headers]);

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        CSV Validator 2.0
                    </h1>
                    <p className="text-slate-600">
                        Upload a CSV exported from your sheet or generated by the generator. The validator will check for errors and show how Google Ads Editor will behave on import.
                    </p>
                </div>

                {/* Upload Section */}
                <Card className="mb-6 border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                    <CardContent className="p-6">
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
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
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-slate-700 mb-1">
                                                Uploading and Processing...
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Please wait while we process your file
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-slate-700 mb-1">
                                                Click to Upload CSV or Excel File
                                            </p>
                                            <p className="text-sm text-slate-500">
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
                    <div className="mb-6 flex flex-wrap gap-3">
                        <Button
                            onClick={handleValidate}
                            disabled={loading || rows.length === 0}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                            disabled={rows.length === 0}
                            variant="outline"
                            className="border-slate-300"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download CSV
                        </Button>
                    </div>
                )}

                {/* Detected Headers */}
                {headers.length > 0 && (
                    <Card className="mb-6 border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                        <CardContent className="p-4">
                            <p className="text-sm">
                                <strong>Detected Headers:</strong> {headers.join(', ')}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Editor Behavior */}
                {editorBehavior.length > 0 && (
                    <Card className="mb-6 border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                                Editor Behavior
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-slate-700">
                                {editorBehavior.map((b, i) => (
                                    <li key={i}>{b}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Problems */}
                {problems.length > 0 && (
                    <Card className="mb-6 border-red-200/60 bg-red-50/50 backdrop-blur-xl shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <AlertCircle className="w-5 h-5" />
                                Problems ({problems.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                {problems.slice(0, 50).map((p, i) => (
                                    <div key={i} className="text-sm text-red-700">
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
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Campaigns Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-indigo-50 to-indigo-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Campaigns</p>
                                        <p className="text-3xl font-bold text-indigo-700">{statistics.campaigns}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                                        <FolderOpen className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ad Groups Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Ad Groups</p>
                                        <p className="text-3xl font-bold text-purple-700">{statistics.adGroups}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Layers className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Keywords Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Keywords</p>
                                        <p className="text-3xl font-bold text-blue-700">{statistics.keywords}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Hash className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Extensions/Assets Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Extensions/Assets</p>
                                        <p className="text-3xl font-bold text-green-700">{statistics.extensionsAssets}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Link2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Locations Card */}
                        <Card className="border-slate-200/60 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 mb-1">Locations</p>
                                        <p className="text-3xl font-bold text-orange-700">{statistics.locations}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Data Table */}
                {rows.length > 0 && (
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <CardHeader>
                            <CardTitle>Data Table ({rows.length} rows)</CardTitle>
                            <CardDescription>Click on any cell to edit inline</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg z-10">
                                        <tr>
                                            <th className="p-3 text-left font-semibold border-r border-slate-700">#</th>
                                            {headers.map(h => (
                                                <th key={h} className="p-3 text-left font-semibold whitespace-nowrap border-r border-slate-700 last:border-r-0">
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
                                                <td className="p-3 font-semibold text-slate-700 border-r border-slate-200">
                                                    {rIdx + 1}
                                                </td>
                                                {headers.map(h => {
                                                    const problem = getCellProblem(rIdx, h);
                                                    const isEditing = editingCell?.row === rIdx && editingCell?.col === h;
                                                    const value = row[h] || '';

                                                    return (
                                                        <td
                                                            key={h}
                                                            className={`p-2 border-r border-slate-200 last:border-r-0 ${
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
                                                                        className="h-8 text-sm"
                                                                        autoFocus
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={saveEdit}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <Save className="w-3 h-3 text-green-600" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={cancelEdit}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <X className="w-3 h-3 text-red-600" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="cursor-pointer hover:bg-indigo-100 p-1 rounded flex items-center justify-between group"
                                                                    onClick={() => startEdit(rIdx, h)}
                                                                >
                                                                    <span className="text-sm">{value || <span className="text-slate-400 italic">empty</span>}</span>
                                                                    <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                        <CardContent className="p-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">
                                No CSV Loaded
                            </h3>
                            <p className="text-slate-500">
                                Upload a CSV file to begin validation
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

