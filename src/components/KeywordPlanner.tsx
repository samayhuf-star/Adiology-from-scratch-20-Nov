import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Save, AlertCircle, Download, FolderOpen, Trash2, FileDown, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { api } from '../utils/api';
import { generateKeywords as generateKeywordsFromGoogleAds } from '../utils/api/googleAds';
import { historyService } from '../utils/historyService';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { copyToClipboard } from '../utils/clipboard';
import { notifications } from '../utils/notifications';

interface SavedList {
    id: string;
    name: string;
    seedKeywords: string;
    negativeKeywords: string;
    generatedKeywords: string[];
    matchTypes: { broad: boolean; phrase: boolean; exact: boolean };
    createdAt: string;
}

// Default negative keywords list
const DEFAULT_NEGATIVE_KEYWORDS = [
    'cheap',
    'discount',
    'reviews',
    'job',
    'headquater',
    'apply',
    'free',
    'best',
    'company',
    'information',
    'when',
    'why',
    'where',
    'how',
    'career',
    'hiring',
    'scam',
    'feedback'
].join('\n');

export const KeywordPlanner = ({ initialData }: { initialData?: any }) => {
    const [seedKeywords, setSeedKeywords] = useState('');
    const [negativeKeywords, setNegativeKeywords] = useState(DEFAULT_NEGATIVE_KEYWORDS);
    const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [apiStatus, setApiStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [listName, setListName] = useState('');
    const [savedLists, setSavedLists] = useState<SavedList[]>([]);
    const [activeTab, setActiveTab] = useState('planner');
    
    // Match types - all selected by default
    const [matchTypes, setMatchTypes] = useState({
        broad: true,
        phrase: true,
        exact: true
    });

    useEffect(() => {
        if (initialData) {
            setSeedKeywords(initialData.seedKeywords || '');
            // Use initialData negative keywords if provided, otherwise use defaults
            setNegativeKeywords(initialData.negativeKeywords || DEFAULT_NEGATIVE_KEYWORDS);
            setGeneratedKeywords(initialData.generatedKeywords || []);
            setMatchTypes(initialData.matchTypes || { broad: true, phrase: true, exact: true });
        }
    }, [initialData]);

    const handleGenerate = async (isAppend: boolean = false) => {
        if (!seedKeywords.trim()) {
            notifications.warning('Please enter seed keywords', {
                title: 'Seed Keywords Required'
            });
            return;
        }

        // Bug_44: Validate minimum character length for keywords
        const seedKeywordsArray = seedKeywords.split(',').map(k => k.trim()).filter(Boolean);
        const MIN_KEYWORD_LENGTH = 3;
        const invalidKeywords = seedKeywordsArray.filter(k => k.length < MIN_KEYWORD_LENGTH);
        
        if (invalidKeywords.length > 0) {
            notifications.error(
                `Each keyword must be at least ${MIN_KEYWORD_LENGTH} characters long. Please check: ${invalidKeywords.slice(0, 3).join(', ')}${invalidKeywords.length > 3 ? '...' : ''}`,
                { 
                    title: 'Invalid Keywords',
                    description: `Keywords must be at least ${MIN_KEYWORD_LENGTH} characters long.`
                }
            );
            return;
        }

        setIsGenerating(true);

        try {
            console.log('Calling Google Ads API with:', { seeds: seedKeywords, negatives: negativeKeywords });                                                             
            
            // Use Google Ads API with AI fallback
            const seedKeywordsArray = seedKeywords.split(',').map(k => k.trim()).filter(Boolean);
            const response = await generateKeywordsFromGoogleAds({
                seedKeywords: seedKeywordsArray,
                negativeKeywords: negativeKeywords.split(',').map(k => k.trim()).filter(Boolean),
                maxResults: 500
            });

            console.log('Google Ads API Response:', response);

            if (response.keywords && Array.isArray(response.keywords)) {
                // Extract keyword text and apply match type formatting
                const keywordTexts = response.keywords.map((k: any) => k.text || k.keyword || k);                                                               
                const formattedKeywords: string[] = [];
                
                keywordTexts.forEach((keyword: string) => {
                    if (matchTypes.broad) {
                        formattedKeywords.push(keyword);
                    }
                    if (matchTypes.phrase) {
                        formattedKeywords.push(`"${keyword}"`);
                    }
                    if (matchTypes.exact) {
                        formattedKeywords.push(`[${keyword}]`);
                    }
                });

                if (isAppend) {
                    setGeneratedKeywords(prev => [...prev, ...formattedKeywords]);                                                                              
                } else {
                    setGeneratedKeywords(formattedKeywords);
                }
                setApiStatus('ok');
            } else {
                console.error('Invalid response format:', response);
                notifications.error('Invalid response from Google Ads API. Check console for details.', {
                    title: 'API Error'
                });                                                                              
                setApiStatus('error');
            }
        } catch (error: any) {
            console.log('ℹ️ Backend unavailable - using local fallback generation');
            
            // FALLBACK: Generate mock keywords locally when API is unavailable
            const seeds = seedKeywords.split(',').map(s => s.trim()).filter(Boolean);
            const negatives = negativeKeywords.split('\n').map(n => n.trim().toLowerCase()).filter(Boolean);
            
            const mockKeywords: string[] = [];
            const modifiers = [
                'near me', 'online', 'service', 'support', 'help', 'contact', 
                'phone number', 'customer service', 'call center', 'hotline',
                'number', '24/7', 'hours', 'location', 'address', 'chat',
                'email', 'support team', 'helpline', 'assistance', 'care'
            ];
            
            const questions = ['how to', 'what is', 'where is', 'when does', 'why'];
            
            seeds.forEach(seed => {
                // Add base seed
                if (!negatives.some(neg => seed.toLowerCase().includes(neg))) {
                    mockKeywords.push(seed);
                }
                
                // Add modifiers
                modifiers.forEach(modifier => {
                    const combined = `${seed} ${modifier}`;
                    if (!negatives.some(neg => combined.toLowerCase().includes(neg))) {
                        mockKeywords.push(combined);
                    }
                });
                
                // Add question variations
                questions.forEach(question => {
                    const combined = `${question} ${seed}`;
                    if (!negatives.some(neg => combined.toLowerCase().includes(neg))) {
                        mockKeywords.push(combined);
                    }
                });
            });
            
            // Apply match type formatting
            const formattedKeywords: string[] = [];
            mockKeywords.forEach((keyword: string) => {
                if (matchTypes.broad) {
                    formattedKeywords.push(keyword);
                }
                if (matchTypes.phrase) {
                    formattedKeywords.push(`"${keyword}"`);
                }
                if (matchTypes.exact) {
                    formattedKeywords.push(`[${keyword}]`);
                }
            });
            
            if (isAppend) {
                setGeneratedKeywords(prev => [...prev, ...formattedKeywords]);
            } else {
                setGeneratedKeywords(formattedKeywords);
            }
            
            setApiStatus('error');
            console.log('Generated mock keywords:', formattedKeywords.length);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateNegatives = async () => {
        if (!seedKeywords.trim()) {
            notifications.warning('Please enter seed keywords', {
                title: 'Seed Keywords Required'
            });
            return;
        }

        setIsGenerating(true);

        try {
            console.log('Calling API with:', { seeds: seedKeywords, negatives: negativeKeywords });
            
            const response = await api.post('/generate-negatives', {
                seeds: seedKeywords,
                negatives: negativeKeywords
            });

            console.log('API Response:', response);

            if (response.keywords && Array.isArray(response.keywords)) {
                // Extract keyword text and apply match type formatting
                const keywordTexts = response.keywords.map((k: any) => k.text || k.keyword || k);
                const formattedKeywords: string[] = [];
                
                keywordTexts.forEach((keyword: string) => {
                    if (matchTypes.broad) {
                        formattedKeywords.push(keyword);
                    }
                    if (matchTypes.phrase) {
                        formattedKeywords.push(`"${keyword}"`);
                    }
                    if (matchTypes.exact) {
                        formattedKeywords.push(`[${keyword}]`);
                    }
                });

                setNegativeKeywords(formattedKeywords.join('\n'));
                setApiStatus('ok');
            } else {
                console.error('Invalid response format:', response);
                notifications.error('Invalid response from server. Check console for details.', {
                    title: 'API Error'
                });
                setApiStatus('error');
            }
        } catch (error: any) {
            console.log('ℹ️ Backend unavailable - using local fallback generation');
            
            // FALLBACK: Generate mock keywords locally when API is unavailable
            const seeds = seedKeywords.split(',').map(s => s.trim()).filter(Boolean);
            const negatives = negativeKeywords.split('\n').map(n => n.trim().toLowerCase()).filter(Boolean);
            
            const mockKeywords: string[] = [];
            const modifiers = [
                'near me', 'online', 'service', 'support', 'help', 'contact', 
                'phone number', 'customer service', 'call center', 'hotline',
                'number', '24/7', 'hours', 'location', 'address', 'chat',
                'email', 'support team', 'helpline', 'assistance', 'care'
            ];
            
            const questions = ['how to', 'what is', 'where is', 'when does', 'why'];
            
            seeds.forEach(seed => {
                // Add base seed
                if (!negatives.some(neg => seed.toLowerCase().includes(neg))) {
                    mockKeywords.push(seed);
                }
                
                // Add modifiers
                modifiers.forEach(modifier => {
                    const combined = `${seed} ${modifier}`;
                    if (!negatives.some(neg => combined.toLowerCase().includes(neg))) {
                        mockKeywords.push(combined);
                    }
                });
                
                // Add question variations
                questions.forEach(question => {
                    const combined = `${question} ${seed}`;
                    if (!negatives.some(neg => combined.toLowerCase().includes(neg))) {
                        mockKeywords.push(combined);
                    }
                });
            });
            
            // Apply match type formatting
            const formattedKeywords: string[] = [];
            mockKeywords.forEach((keyword: string) => {
                if (matchTypes.broad) {
                    formattedKeywords.push(keyword);
                }
                if (matchTypes.phrase) {
                    formattedKeywords.push(`"${keyword}"`);
                }
                if (matchTypes.exact) {
                    formattedKeywords.push(`[${keyword}]`);
                }
            });
            
            setNegativeKeywords(formattedKeywords.join('\n'));
            
            setApiStatus('error');
            console.log('Generated mock keywords:', formattedKeywords.length);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyAll = async () => {
        const text = generatedKeywords.join('\n');
        const success = await copyToClipboard(text);
        if (success) {
            notifications.success('Keywords copied to clipboard!', {
                title: 'Copied'
            });
        } else {
            notifications.warning('Please manually copy the text from the visible text area.', {
                title: 'Copy Failed'
            });
        }
    };

    const handleSave = async () => {
        if (generatedKeywords.length === 0) return;
        setIsSaving(true);
        try {
            await historyService.save(
                'keyword-planner',
                `Plan: ${seedKeywords.substring(0, 30)}...`,
                { seedKeywords, negativeKeywords, generatedKeywords, matchTypes }
            );
            notifications.success('Keyword plan saved!', {
                title: 'Saved Successfully'
            });
        } catch (error) {
            console.error("Save failed", error);
            notifications.error('Failed to save. Please try again.', {
                title: 'Save Failed'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenSaveDialog = () => {
        setShowSaveDialog(true);
    };

    const handleCloseSaveDialog = () => {
        setShowSaveDialog(false);
    };

    const handleSaveWithCustomName = async () => {
        if (generatedKeywords.length === 0) return;
        
        // Bug_42: Validate that listName is not empty or whitespace-only
        const trimmedName = listName.trim();
        if (!trimmedName || trimmedName.length === 0) {
            notifications.warning('Please enter a plan name', {
                title: 'Plan Name Required',
                description: 'The plan name cannot be empty.'
            });
            return;
        }
        
        setIsSaving(true);
        try {
            await historyService.save(
                'keyword-planner',
                trimmedName || `Plan: ${seedKeywords.substring(0, 30)}...`,
                { seedKeywords, negativeKeywords, generatedKeywords, matchTypes }
            );
            // Bug_43: Use toast notification instead of alert
            notifications.success('Keyword plan saved successfully!', {
                title: 'Saved',
                description: 'Your keyword plan has been saved.'
            });
            setListName('');
            setShowSaveDialog(false);
        } catch (error) {
            console.error("Save failed", error);
            notifications.error('Failed to save. Please try again.', {
                title: 'Save Failed'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadSavedList = async (listId: string) => {
        try {
            // Load from localStorage using historyService
            const allItems = await historyService.getAll();
            const item = allItems.find(i => i.id === listId);
            if (item && item.data) {
                setSeedKeywords(item.data.seedKeywords || '');
                setNegativeKeywords(item.data.negativeKeywords || '');
                setGeneratedKeywords(item.data.generatedKeywords || []);
                setMatchTypes(item.data.matchTypes || { broad: true, phrase: true, exact: true });
                setActiveTab('planner');
            }
        } catch (error) {
            console.error("Load failed", error);
            notifications.error('Failed to load list. Please try again.', {
                title: 'Load Failed'
            });
        }
    };

    const handleDeleteSavedList = async (listId: string) => {
        if (!confirm('Are you sure you want to delete this list?')) return;
        
        try {
            await historyService.delete(listId);
            setSavedLists(prev => prev.filter(list => list.id !== listId));
            notifications.success('List deleted successfully!', {
                title: 'Deleted'
            });
        } catch (error) {
            console.error("Delete failed", error);
            notifications.error('Failed to delete list. Please try again.', {
                title: 'Delete Failed'
            });
        }
    };

    const handleDownloadKeywords = () => {
        const text = generatedKeywords.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'keywords.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleLoadSavedLists = async () => {
        try {
            const items = await historyService.getByType('keyword-planner');
            const formattedLists: SavedList[] = items.map(item => ({
                id: item.id,
                name: item.name,
                seedKeywords: item.data.seedKeywords || '',
                negativeKeywords: item.data.negativeKeywords || '',
                generatedKeywords: item.data.generatedKeywords || [],
                matchTypes: item.data.matchTypes || { broad: true, phrase: true, exact: true },
                createdAt: item.timestamp
            }));
            setSavedLists(formattedLists);
        } catch (error) {
            console.error("Load all failed", error);
        }
    };

    useEffect(() => {
        handleLoadSavedLists();
    }, []);

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    AI Keyword Planner and Negative List Builder
                </h1>
                <p className="text-slate-500">
                    Generate comprehensive keyword lists using AI based on your seed keywords and negative filters
                </p>
            </div>

            {/* Tabs at the top */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                    <TabsTrigger value="planner">Keyword Planner</TabsTrigger>
                    <TabsTrigger value="saved">Saved Lists</TabsTrigger>
                </TabsList>
                
                <TabsContent value="planner">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Panel: Define Your Strategy */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                            <h2 className="text-xl font-bold text-indigo-600 mb-6">
                                1. Define Your Strategy
                            </h2>

                            {/* Seed Keywords */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Seed Keywords (3-5 Core Ideas, comma-separated)
                                </label>
                                <Input
                                    placeholder="airline number, contact airline, delta phone number"
                                    value={seedKeywords}
                                    onChange={(e) => setSeedKeywords(e.target.value)}
                                    className="bg-white border-slate-300"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    These are the primary topics the AI will build upon.
                                </p>
                            </div>

                            {/* Target Match Types */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Target Match Types
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id="broad-planner" 
                                            checked={matchTypes.broad}
                                            onCheckedChange={(c) => setMatchTypes(prev => ({...prev, broad: c as boolean}))}
                                        />
                                        <label htmlFor="broad-planner" className="text-sm text-slate-600 cursor-pointer">
                                            Broad Match
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id="phrase-planner" 
                                            checked={matchTypes.phrase}
                                            onCheckedChange={(c) => setMatchTypes(prev => ({...prev, phrase: c as boolean}))}
                                        />
                                        <label htmlFor="phrase-planner" className="text-sm text-slate-600 cursor-pointer">
                                            Phrase Match
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id="exact-planner" 
                                            checked={matchTypes.exact}
                                            onCheckedChange={(c) => setMatchTypes(prev => ({...prev, exact: c as boolean}))}
                                        />
                                        <label htmlFor="exact-planner" className="text-sm text-slate-600 cursor-pointer">
                                            Exact Match
                                        </label>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Keywords will be generated to fit the characteristics of the selected match types.
                                </p>
                            </div>

                            {/* Negative Keywords */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Negative Keywords (One term/phrase per line)
                                    </label>
                                    <Button
                                        onClick={() => handleGenerateNegatives()}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs gap-1 border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                        <ShieldCheck className="w-3 h-3" />
                                        Generate 500-1000
                                    </Button>
                                </div>
                                <div className="relative bg-white border border-slate-300 rounded-lg overflow-hidden h-[200px]">
                                    <div className="absolute inset-0 overflow-y-auto p-3">
                                        <div className="grid grid-cols-3 gap-2 font-mono text-sm text-slate-700">
                                            {negativeKeywords.split('\n').filter(k => k.trim()).map((keyword, idx) => (
                                                <div key={idx} className="text-xs leading-relaxed break-words">
                                                    {keyword}
                                                </div>
                                            ))}
                                            {negativeKeywords.trim() === '' && (
                                                <div className="col-span-3 text-slate-400 text-center py-8">
                                                    Enter negative keywords (one per line) or click Generate
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Type here... cheap, discount, reviews, job, headquater, apply, free, best, company"
                                        value={negativeKeywords}
                                        onChange={(e) => setNegativeKeywords(e.target.value)}
                                        className="absolute inset-0 bg-transparent border-0 font-mono text-sm resize-none opacity-0 focus:opacity-100 focus:bg-white z-10"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Click the text area to edit. The AI will strictly avoid generating keywords containing these terms.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Button
                                    onClick={() => handleGenerate(false)}
                                    disabled={isGenerating || !seedKeywords.trim()}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                                            Generating Keywords...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Generate 100-300 Keywords (Faster)
                                        </>
                                    )}
                                </Button>

                                {generatedKeywords.length > 0 && (
                                    <Button
                                        onClick={() => handleGenerate(true)}
                                        disabled={isGenerating || !seedKeywords.trim()}
                                        variant="outline"
                                        className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 py-6"
                                    >
                                        Append More Keywords (Total: {generatedKeywords.length})
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Generated Keyword List */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-indigo-600">
                                    2. Generated Keyword List
                                </h2>
                                {generatedKeywords.length > 0 && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleOpenSaveDialog}
                                            disabled={isSaving || generatedKeywords.length === 0}
                                            variant="default"
                                            size="sm"
                                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? 'Saving...' : 'Save Plan'}
                                        </Button>
                                        <Button
                                            onClick={handleCopyAll}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy All
                                        </Button>
                                        <Button
                                            onClick={handleDownloadKeywords}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {generatedKeywords.length > 0 && (
                                <div className="mb-4 px-4 py-2 bg-slate-100 rounded-lg flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">
                                        {generatedKeywords.length} Keywords Generated
                                    </span>
                                </div>
                            )}

                            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-y-auto max-h-[600px]">
                                {generatedKeywords.length > 0 ? (
                                    <div className="space-y-1">
                                        {generatedKeywords.map((keyword, idx) => (
                                            <div
                                                key={idx}
                                                className="px-3 py-2 bg-white rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-slate-700 font-mono"
                                            >
                                                {keyword}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500">
                                                Enter seed keywords and click "Generate" to create your keyword list
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Save button at bottom for better visibility */}
                            {generatedKeywords.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <Button
                                        onClick={handleOpenSaveDialog}
                                        disabled={isSaving || generatedKeywords.length === 0}
                                        variant="default"
                                        size="lg"
                                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        <Save className="w-5 h-5" />
                                        {isSaving ? 'Saving Keyword Plan...' : 'Save Keyword Plan'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="saved">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                        <h2 className="text-xl font-bold text-indigo-600 mb-6">
                            3. Saved Keyword Lists
                        </h2>
                        {savedLists.length > 0 ? (
                            <div className="space-y-4">
                                {savedLists.map(list => (
                                    <div
                                        key={list.id}
                                        className="px-3 py-2 bg-white rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-slate-700 font-mono"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <span className="font-bold">{list.name}</span>
                                                <span className="text-xs text-slate-500">
                                                    Created: {new Date(list.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleLoadSavedList(list.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    <FolderOpen className="w-4 h-4" />
                                                    Load
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteSavedList(list.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">
                                        No saved keyword lists found.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Save Dialog */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Save Keyword Plan</DialogTitle>
                        <DialogDescription>
                            Enter a name for your keyword plan and save it for future use.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="My Keyword Plan"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                className="bg-white border-slate-300"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleCloseSaveDialog}
                            variant="outline"
                            className="gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveWithCustomName}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};