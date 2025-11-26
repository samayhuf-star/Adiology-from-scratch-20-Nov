import React, { useState, useEffect } from 'react';
import { Shuffle, Plus, X, Download, Save } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { historyService } from '../utils/historyService';
import { notifications } from '../utils/notifications';
import { DEFAULT_MIXER_KEYWORDS } from '../utils/defaultExamples';

export const KeywordMixer = ({ initialData }: { initialData?: any }) => {
    // Store each list as a string (newline-separated)
    const [listA, setListA] = useState(DEFAULT_MIXER_KEYWORDS.set1);
    const [listB, setListB] = useState(DEFAULT_MIXER_KEYWORDS.set2);
    const [listC, setListC] = useState('');
    const [mixedKeywords, setMixedKeywords] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Match types - all selected by default
    const [matchTypes, setMatchTypes] = useState({
        broad: true,
        phrase: true,
        exact: true
    });

    useEffect(() => {
        // Bug_45: Scroll to top when component mounts
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (initialData) {
            // Convert old array format to newline-separated strings if needed
            if (initialData.lists) {
                setListA(initialData.lists[0]?.join('\n') || '');
                setListB(initialData.lists[1]?.join('\n') || '');
                setListC(initialData.lists[2]?.join('\n') || '');
            }
            // Handle new string format
            if (initialData.listA) setListA(initialData.listA);
            if (initialData.listB) setListB(initialData.listB);
            if (initialData.listC) setListC(initialData.listC);
            
            setMixedKeywords(initialData.mixedKeywords || []);
            setMatchTypes(initialData.matchTypes || { broad: true, phrase: true, exact: true });
        }
    }, [initialData]);

    const handleSave = async () => {
        if (mixedKeywords.length === 0) return;
        setIsSaving(true);
        try {
            await historyService.save(
                'keyword-mixer',
                `Mixer: ${mixedKeywords.length} Combinations`,
                { listA, listB, listC, mixedKeywords, matchTypes }
            );
            notifications.success('Mixer result saved!', {
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

    const mixKeywords = () => {
        // Parse each list - split by newlines and commas, trim, and filter empty
        const parseList = (text: string): string[] => {
            return text
                .split('\n')
                .flatMap(line => line.split(','))
                .map(item => item.trim())
                .filter(item => item !== '');
        };

        const lists = [
            parseList(listA),
            parseList(listB),
            parseList(listC)
        ].filter(list => list.length > 0); // Only include non-empty lists
        
        const mix = (arr: string[][]): string[] => {
            if (arr.length === 0) return [];
            if (arr.length === 1) return arr[0];
            
            const result: string[] = []
            const [first, ...rest] = arr;
            const restMixed = mix(rest);
            
            for (const item of first) {
                if (restMixed.length === 0) {
                    result.push(item);
                } else {
                    for (const mixed of restMixed) {
                        result.push(`${item} ${mixed}`.trim());
                    }
                }
            }
            
            return result;
        };

        const baseMixed = mix(lists);
        
        // Apply match type formatting
        const formattedKeywords: string[] = [];
        baseMixed.forEach(keyword => {
            if (matchTypes.broad) {
                formattedKeywords.push(keyword); // Broad match (no formatting)
            }
            if (matchTypes.phrase) {
                formattedKeywords.push(`"${keyword}"`); // Phrase match
            }
            if (matchTypes.exact) {
                formattedKeywords.push(`[${keyword}]`); // Exact match
            }
        });
        
        setMixedKeywords(formattedKeywords);
    };

    const exportToCSV = () => {
        // Bug_46: Column name in plural form, filename without "mixed_" prefix
        const csv = ['Keywords\n', ...mixedKeywords].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'keywords.csv'; // Bug_46: Simplified filename - removed "mixed_" prefix
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Keyword Mixer
                </h1>
                <p className="text-slate-500">
                    Mix and match multiple keyword lists to generate all possible combinations
                </p>
            </div>

            <div className="space-y-6">
                {/* Input Section - Horizontal Lists */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Keyword Lists</h2>
                    
                    {/* Lists arranged horizontally */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-slate-700 mb-2">Keywords A</h3>
                            <Textarea
                                value={listA}
                                onChange={(e) => setListA(e.target.value)}
                                placeholder="Enter keywords for A&#10;One per line or comma-separated"
                                className="min-h-[200px] px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-slate-700 mb-2">Keywords B</h3>
                            <Textarea
                                value={listB}
                                onChange={(e) => setListB(e.target.value)}
                                placeholder="Enter keywords for B&#10;One per line or comma-separated"
                                className="min-h-[200px] px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-slate-700 mb-2">Keywords C</h3>
                            <Textarea
                                value={listC}
                                onChange={(e) => setListC(e.target.value)}
                                placeholder="Enter keywords for C&#10;One per line or comma-separated"
                                className="min-h-[200px] px-4 py-3 bg-white border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>
                    </div>
                    
                    {/* Helpful hint */}
                    <div className="mb-6 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <p className="text-sm text-indigo-700">
                            💡 <span className="font-semibold">Tip:</span> You can enter comma-separated values in any field (e.g., "delta, united, southwest") to create multiple variations at once.
                        </p>
                    </div>

                    {/* Match Type Selection */}
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="font-semibold text-slate-700 mb-4">Keyword Match Types</h3>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="broad" 
                                    checked={matchTypes.broad}
                                    onCheckedChange={(c) => setMatchTypes(prev => ({...prev, broad: c as boolean}))}
                                />
                                <label htmlFor="broad" className="text-sm text-slate-600 cursor-pointer font-medium">
                                    Broad Match
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="phrase" 
                                    checked={matchTypes.phrase}
                                    onCheckedChange={(c) => setMatchTypes(prev => ({...prev, phrase: c as boolean}))}
                                />
                                <label htmlFor="phrase" className="text-sm text-slate-600 cursor-pointer font-medium">
                                    Phrase Match "keyword"
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="exact" 
                                    checked={matchTypes.exact}
                                    onCheckedChange={(c) => setMatchTypes(prev => ({...prev, exact: c as boolean}))}
                                />
                                <label htmlFor="exact" className="text-sm text-slate-600 cursor-pointer font-medium">
                                    Exact Match [keyword]
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={mixKeywords}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <Shuffle className="w-5 h-5" />
                        Generate Keywords
                    </button>
                </div>

                {/* Results Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">
                            Generated Keywords {mixedKeywords.length > 0 && `(${mixedKeywords.length})`}
                        </h2>
                        {mixedKeywords.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-white border border-slate-200 text-indigo-600 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                        {mixedKeywords.length > 0 ? (
                            <div className="space-y-2">
                                {mixedKeywords.map((keyword, idx) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors"
                                    >
                                        <span className="text-slate-700 font-medium">{keyword}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Shuffle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">
                                        Add keywords and click "Generate Keywords" to create combinations
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