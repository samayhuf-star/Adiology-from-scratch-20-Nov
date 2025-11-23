import React, { useState, useEffect } from 'react';
import { Sparkles, Save, AlertCircle, CheckSquare, Square, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { api } from '../utils/api';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { generateComprehensiveNegativeKeywords } from '../utils/negativeKeywords';
import { historyService } from '../utils/historyService';

interface KeywordPlannerSelectableProps {
    initialData?: any;
    onKeywordsSelected?: (keywords: string[]) => void;
    selectedKeywords?: string[];
    onNegativeKeywordsChange?: (negativeKeywords: string) => void;
}

export const KeywordPlannerSelectable = ({ 
    initialData, 
    onKeywordsSelected,
    selectedKeywords: externalSelectedKeywords = [],
    onNegativeKeywordsChange
}: KeywordPlannerSelectableProps) => {
    const [seedKeywords, setSeedKeywords] = useState('');
    const [negativeKeywords, setNegativeKeywords] = useState('');
    const [negativeKeywordsCount, setNegativeKeywordsCount] = useState(750); // Slider value
    const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [apiStatus, setApiStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    // Match types - all selected by default
    const [matchTypes, setMatchTypes] = useState({
        broad: true,
        phrase: true,
        exact: true
    });

    useEffect(() => {
        if (initialData) {
            // Convert newline-separated to comma-separated for display in input field
            const seedKw = initialData.seedKeywords || '';
            const formattedSeedKw = seedKw.includes('\n') && !seedKw.includes(',')
                ? seedKw.split('\n').map((s: string) => s.trim()).filter(Boolean).join(', ')
                : seedKw;
            
            setSeedKeywords(formattedSeedKw);
            setNegativeKeywords(initialData.negativeKeywords || '');
            // Only set generated keywords if they exist in initialData
            if (initialData.generatedKeywords && initialData.generatedKeywords.length > 0) {
                setGeneratedKeywords(initialData.generatedKeywords);
            }
            setMatchTypes(initialData.matchTypes || { broad: true, phrase: true, exact: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount, not when initialData changes

    // Sync external selected keywords
    useEffect(() => {
        if (externalSelectedKeywords.length > 0) {
            setSelectedKeywords(externalSelectedKeywords);
        }
    }, [externalSelectedKeywords]);

    // Notify parent when selection changes
    useEffect(() => {
        if (onKeywordsSelected) {
            onKeywordsSelected(selectedKeywords);
        }
    }, [selectedKeywords, onKeywordsSelected]);

    const handleGenerate = async (isAppend: boolean = false) => {
        console.log('🚀 handleGenerate called with isAppend:', isAppend);
        console.log('📝 seedKeywords:', seedKeywords);
        console.log('🚫 negativeKeywords length:', negativeKeywords.split('\n').filter(Boolean).length);
        console.log('🚫 negativeKeywords (first 100 chars):', negativeKeywords.substring(0, 100));
        
        if (!seedKeywords.trim()) {
            alert('Please enter seed keywords');
            return;
        }

        setIsGenerating(true);
        console.log('✅ isGenerating set to true');

        try {
            console.log('Calling API with:', { seeds: seedKeywords, negatives: negativeKeywords });
            
            const response = await api.post('/generate-keywords', {
                seeds: seedKeywords,
                negatives: negativeKeywords
            });

            console.log('API Response:', response);
            console.log('Response type:', typeof response);
            console.log('Response.keywords:', response?.keywords);
            console.log('Is Array?', Array.isArray(response?.keywords));

            if (response.keywords && Array.isArray(response.keywords)) {
                console.log('✅ Valid response received with', response.keywords.length, 'keywords');
                
                // Extract keyword text and apply match type formatting
                const keywordTexts = response.keywords.map((k: any) => k.text || k.keyword || k);
                console.log('Extracted keyword texts:', keywordTexts.slice(0, 5));
                
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
                    setGeneratedKeywords(prev => {
                        const newKeywords = [...prev, ...formattedKeywords];
                        // Auto-select all keywords when generated
                        setSelectedKeywords(newKeywords);
                        return newKeywords;
                    });
                } else {
                    setGeneratedKeywords(formattedKeywords);
                    // Auto-select all keywords when generated
                    setSelectedKeywords(formattedKeywords);
                }
                setApiStatus('ok');
            } else {
                console.error('Invalid response format:', response);
                console.error('Response keys:', Object.keys(response));
                console.error('Full response:', JSON.stringify(response));
                alert(`Invalid response from server.\n\nResponse keys: ${Object.keys(response).join(', ')}\n\nCheck console for full details.`);
                setApiStatus('error');
                setErrorMessage('Invalid response format from server');
            }
        } catch (error: any) {
            console.log('ℹ️ Backend unavailable - using local fallback generation');
            
            // FALLBACK: Generate mock keywords locally when API is unavailable
            // Handle both comma-separated and newline-separated seed keywords
            const seeds = seedKeywords.includes(',') 
                ? seedKeywords.split(',').map(s => s.trim()).filter(Boolean)
                : seedKeywords.split('\n').map(s => s.trim()).filter(Boolean);
                
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
                setGeneratedKeywords(prev => {
                    const newKeywords = [...prev, ...formattedKeywords];
                    // Auto-select all keywords when generated
                    setSelectedKeywords(newKeywords);
                    return newKeywords;
                });
            } else {
                setGeneratedKeywords(formattedKeywords);
                // Auto-select all keywords when generated
                setSelectedKeywords(formattedKeywords);
            }
            
            setApiStatus('error');
            console.log('Generated mock keywords:', formattedKeywords.length);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedKeywords.length === generatedKeywords.length) {
            setSelectedKeywords([]);
        } else {
            setSelectedKeywords([...generatedKeywords]);
        }
    };

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords(prev => {
            if (prev.includes(keyword)) {
                return prev.filter(k => k !== keyword);
            } else {
                return [...prev, keyword];
            }
        });
    };

    const handleSave = async () => {
        if (generatedKeywords.length === 0) return;
        setIsSaving(true);
        try {
            await historyService.save(
                'keyword-planner',
                `Plan: ${seedKeywords.substring(0, 30)}...`,
                { seedKeywords, negativeKeywords, generatedKeywords, matchTypes, selectedKeywords }
            );
                alert("Keyword plan saved!");
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const allSelected = generatedKeywords.length > 0 && selectedKeywords.length === generatedKeywords.length;

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
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-slate-700">
                                Negative Keywords (One term/phrase per line)
                            </label>
                        </div>

                        {/* Slider for keyword count */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-600">Keywords to Generate:</span>
                                <span className="text-xs font-semibold text-indigo-600">{negativeKeywordsCount}</span>
                            </div>
                            <Slider
                                value={[negativeKeywordsCount]}
                                onValueChange={(value) => setNegativeKeywordsCount(value[0])}
                                min={100}
                                max={1000}
                                step={50}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>100</span>
                                <span>1000</span>
                            </div>
                        </div>

                        {/* Editable negative keywords box */}
                        <div className="bg-white border border-slate-300 rounded-lg overflow-hidden h-[280px]">
                            <Textarea
                                value={negativeKeywords}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setNegativeKeywords(newValue);
                                    if (onNegativeKeywordsChange) {
                                        onNegativeKeywordsChange(newValue);
                                    }
                                }}
                                placeholder="Enter negative keywords (one per line)&#10;e.g.&#10;cheap&#10;discount&#10;reviews&#10;job&#10;free"
                                className="w-full h-full border-0 font-mono text-xs resize-none p-3 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 bg-transparent"
                                style={{ minHeight: '280px', maxHeight: '280px', overflowY: 'auto' }}
                            />
                                                </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-slate-500">
                                The AI will strictly avoid generating keywords containing these terms. Edit directly or adjust the slider and click "Generate" for your desired quantity.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const lines = negativeKeywords.split('\n').filter(k => k.trim());
                                        const uniqueLines = Array.from(new Set(lines.map(l => l.trim().toLowerCase())));
                                        const cleaned = uniqueLines.join('\n');
                                        setNegativeKeywords(cleaned);
                                        if (onNegativeKeywordsChange) {
                                            onNegativeKeywordsChange(cleaned);
                                        }
                                    }}
                                    className="h-7 text-xs"
                                >
                                    Remove Duplicates
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setNegativeKeywords('');
                                        if (onNegativeKeywordsChange) {
                                            onNegativeKeywordsChange('');
                                        }
                                    }}
                                    className="h-7 text-xs text-red-600 hover:text-red-700"
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                console.log('🔘 Generate button clicked!');
                                console.log('🔘 isGenerating:', isGenerating);
                                console.log('🔘 seedKeywords.trim():', seedKeywords.trim());
                                console.log('🔘 Button disabled:', isGenerating || !seedKeywords.trim());
                                handleGenerate(false);
                            }}
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

                {/* Right Panel: Generated Keyword List with Selection */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-indigo-600">
                            2. Generated Keyword List
                        </h2>
                        {generatedKeywords.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {generatedKeywords.length > 0 && (
                        <>
                            <div className="mb-4 flex items-center justify-between px-4 py-3 bg-slate-100 rounded-lg">
                                <span className="text-sm font-semibold text-slate-700">
                                    {generatedKeywords.length} Keywords Generated
                                    {selectedKeywords.length > 0 && (
                                        <span className="ml-2 text-indigo-600">
                                            ({selectedKeywords.length} selected)
                                        </span>
                                    )}
                                </span>
                                <Button
                                    onClick={handleSelectAll}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    {allSelected ? (
                                        <>
                                            <Square className="w-4 h-4" />
                                            Deselect All
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="w-4 h-4" />
                                            Select All
                                        </>
                                    )}
                                </Button>
                            </div>

                            {selectedKeywords.length === 0 && (
                                <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-800 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Please select keywords to proceed to the next step
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-y-auto max-h-[600px]">
                        {generatedKeywords.length > 0 ? (
                            <div className="space-y-1">
                                {generatedKeywords.map((keyword, idx) => {
                                    const isSelected = selectedKeywords.includes(keyword);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => toggleKeyword(keyword)}
                                            className={`px-3 py-2 rounded border cursor-pointer transition-all text-sm font-mono flex items-center gap-3 ${
                                                isSelected 
                                                    ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100' 
                                                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Checkbox 
                                                checked={isSelected}
                                                onCheckedChange={() => toggleKeyword(keyword)}
                                                className="pointer-events-none"
                                            />
                                            <span className={isSelected ? 'text-indigo-700 font-medium' : 'text-slate-700'}>
                                                {keyword}
                                            </span>
                                        </div>
                                    );
                                })}
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
                </div>
            </div>
        </div>
    );
};