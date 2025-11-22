import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Download, FileSpreadsheet, Copy, CheckSquare, Square, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { api } from '../utils/api';

interface AdGroup {
    id: string;
    name: string;
    keywords: string;
}

interface GeneratedAd {
    id: string;
    groupName: string;
    adType: 'RSA' | 'DKI' | 'CallOnly';
    headline1?: string;
    headline2?: string;
    headline3?: string;
    headline4?: string;
    headline5?: string;
    description1?: string;
    description2?: string;
    path1?: string;
    path2?: string;
    finalUrl?: string;
    phoneNumber?: string;
    businessName?: string;
    selected: boolean;
}

export const AdsBuilder = () => {
    const [mode, setMode] = useState<'single' | 'multiple'>('single');
    const [singleKeywords, setSingleKeywords] = useState('');
    const [adGroups, setAdGroups] = useState<AdGroup[]>([
        { id: '1', name: 'Group 1', keywords: '' }
    ]);
    
    const [baseUrl, setBaseUrl] = useState('https://www.example.com');
    
    const [adConfig, setAdConfig] = useState({
        rsaCount: 1,
        dkiCount: 1,
        callOnlyCount: 1
    });
    
    const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);

    const addAdGroup = () => {
        const newId = (adGroups.length + 1).toString();
        setAdGroups([...adGroups, { 
            id: newId, 
            name: `Group ${newId}`, 
            keywords: '' 
        }]);
    };

    const removeAdGroup = (id: string) => {
        if (adGroups.length > 1) {
            setAdGroups(adGroups.filter(group => group.id !== id));
        }
    };

    const updateAdGroup = (id: string, field: 'name' | 'keywords', value: string) => {
        setAdGroups(adGroups.map(group => 
            group.id === id ? { ...group, [field]: value } : group
        ));
    };

    const generateAds = async () => {
        setIsGenerating(true);
        try {
            const groupsToProcess = mode === 'single' 
                ? [{ id: '1', name: 'Group 1', keywords: singleKeywords }]
                : adGroups.filter(g => g.keywords.trim());

            if (groupsToProcess.length === 0 || groupsToProcess.every(g => !g.keywords.trim())) {
                alert('Please enter keywords for at least one group');
                setIsGenerating(false);
                return;
            }

            // Calculate total ads that will be generated
            const totalAdsPerGroup = adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount;
            const totalAdsToGenerate = totalAdsPerGroup * groupsToProcess.length;

            // Limit total ads to 25
            if (totalAdsToGenerate > 25) {
                alert(`Total ads cannot exceed 25. You're trying to generate ${totalAdsToGenerate} ads (${groupsToProcess.length} groups × ${totalAdsPerGroup} ads per group). Please reduce the quantities or number of groups.`);
                setIsGenerating(false);
                return;
            }

            const allGeneratedAds: GeneratedAd[] = [];

            for (const group of groupsToProcess) {
                const keywords = group.keywords.split(',').map(k => k.trim()).filter(Boolean);
                
                // Generate RSA Ads
                if (adConfig.rsaCount > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'RSA',
                            count: adConfig.rsaCount,
                            groupName: group.name
                        });

                        if (response.ads) {
                            response.ads.forEach((ad: any) => {
                                allGeneratedAds.push({
                                    id: crypto.randomUUID(),
                                    groupName: group.name,
                                    adType: 'RSA',
                                    ...ad,
                                    selected: false
                                });
                            });
                        }
                    } catch (error) {
                        console.log('API unavailable, using fallback for RSA');
                        // Fallback RSA generation
                        for (let i = 0; i < adConfig.rsaCount; i++) {
                            allGeneratedAds.push(generateFallbackRSA(group.name, keywords, i));
                        }
                    }
                }

                // Generate DKI Ads
                if (adConfig.dkiCount > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'DKI',
                            count: adConfig.dkiCount,
                            groupName: group.name
                        });

                        if (response.ads) {
                            response.ads.forEach((ad: any) => {
                                allGeneratedAds.push({
                                    id: crypto.randomUUID(),
                                    groupName: group.name,
                                    adType: 'DKI',
                                    ...ad,
                                    selected: false
                                });
                            });
                        }
                    } catch (error) {
                        console.log('API unavailable, using fallback for DKI');
                        // Fallback DKI generation
                        for (let i = 0; i < adConfig.dkiCount; i++) {
                            allGeneratedAds.push(generateFallbackDKI(group.name, keywords, i));
                        }
                    }
                }

                // Generate Call Only Ads
                if (adConfig.callOnlyCount > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'CallOnly',
                            count: adConfig.callOnlyCount,
                            groupName: group.name
                        });

                        if (response.ads) {
                            response.ads.forEach((ad: any) => {
                                allGeneratedAds.push({
                                    id: crypto.randomUUID(),
                                    groupName: group.name,
                                    adType: 'CallOnly',
                                    ...ad,
                                    selected: false
                                });
                            });
                        }
                    } catch (error) {
                        console.log('API unavailable, using fallback for Call Only');
                        // Fallback Call Only generation
                        for (let i = 0; i < adConfig.callOnlyCount; i++) {
                            allGeneratedAds.push(generateFallbackCallOnly(group.name, keywords, i));
                        }
                    }
                }
            }

            setGeneratedAds(allGeneratedAds);
            setSelectedAds([]);
        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate ads. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateFallbackRSA = (groupName: string, keywords: string[], index: number): GeneratedAd => {
        const mainKeyword = keywords[index % keywords.length];
        const variations = [
            { h1: `${mainKeyword} - Best Deals Available`, h2: 'Shop Now & Save', h3: 'Limited Time Offer' },
            { h1: `Professional ${mainKeyword} Service`, h2: 'Available 24/7', h3: 'Expert Support' },
            { h1: `${mainKeyword} Solutions`, h2: 'Get Started Today', h3: 'Free Consultation' },
            { h1: `Premium ${mainKeyword}`, h2: 'Trusted by Thousands', h3: 'Best Price Guarantee' },
            { h1: `${mainKeyword} Experts`, h2: 'Fast & Reliable', h3: 'Contact Us Now' }
        ];
        
        const variation = variations[index % variations.length];
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'RSA',
            headline1: variation.h1,
            headline2: variation.h2,
            headline3: variation.h3,
            headline4: `Quality ${mainKeyword}`,
            headline5: 'Call Today',
            description1: `Looking for ${mainKeyword}? We offer the best solutions with competitive pricing and excellent customer service.`,
            description2: `Get your ${mainKeyword} today. Fast delivery, expert support, and satisfaction guaranteed. Contact us now!`,
            path1: mainKeyword.toLowerCase().replace(/\s+/g, '-').substring(0, 15),
            path2: 'shop',
            finalUrl: baseUrl,
            selected: false
        };
    };

    const generateFallbackDKI = (groupName: string, keywords: string[], index: number): GeneratedAd => {
        const mainKeyword = keywords[index % keywords.length];
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'DKI',
            headline1: `{KeyWord:${mainKeyword}} - Official Site`,
            headline2: 'Shop {KeyWord:' + mainKeyword + '}',
            headline3: 'Best {KeyWord:' + mainKeyword + '} Deals',
            description1: `Find the perfect {KeyWord:${mainKeyword}} for your needs. Compare options and get the best price available today.`,
            description2: `Order your {KeyWord:${mainKeyword}} online with fast shipping and expert customer support. Satisfaction guaranteed!`,
            path1: 'keyword',
            path2: 'deals',
            finalUrl: baseUrl,
            selected: false
        };
    };

    const generateFallbackCallOnly = (groupName: string, keywords: string[], index: number): GeneratedAd => {
        const mainKeyword = keywords[index % keywords.length];
        const variations = [
            { h1: `${mainKeyword} - Call Now`, h2: 'Available 24/7' },
            { h1: `Professional ${mainKeyword}`, h2: 'Speak to an Expert' },
            { h1: `${mainKeyword} Support`, h2: 'Call for Free Quote' },
            { h1: `${mainKeyword} Hotline`, h2: 'Immediate Assistance' },
            { h1: `${mainKeyword} Service`, h2: 'Call for Best Price' }
        ];
        
        const variation = variations[index % variations.length];
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'CallOnly',
            headline1: variation.h1,
            headline2: variation.h2,
            description1: `Need ${mainKeyword}? Call us now for expert advice and the best pricing. Our team is ready to help!`,
            description2: `Get immediate assistance with ${mainKeyword}. Speak directly with our specialists. Call today!`,
            phoneNumber: '+1-800-123-4567',
            businessName: 'Your Business',
            selected: false
        };
    };

    const toggleAdSelection = (adId: string) => {
        setSelectedAds(prev => 
            prev.includes(adId) ? prev.filter(id => id !== adId) : [...prev, adId]
        );
    };

    const selectAll = () => {
        if (selectedAds.length === generatedAds.length) {
            setSelectedAds([]);
        } else {
            setSelectedAds(generatedAds.map(ad => ad.id));
        }
    };

    const exportToCSV = () => {
        if (selectedAds.length === 0) {
            alert('Please select at least one ad to export');
            return;
        }

        const adsToExport = generatedAds.filter(ad => selectedAds.includes(ad.id));
        
        const headers = [
            'Ad Group',
            'Ad Type',
            'Headline 1',
            'Headline 2',
            'Headline 3',
            'Headline 4',
            'Headline 5',
            'Description 1',
            'Description 2',
            'Path 1',
            'Path 2',
            'Final URL',
            'Phone Number',
            'Business Name'
        ];

        const rows = adsToExport.map(ad => [
            ad.groupName,
            ad.adType,
            ad.headline1 || '',
            ad.headline2 || '',
            ad.headline3 || '',
            ad.headline4 || '',
            ad.headline5 || '',
            ad.description1 || '',
            ad.description2 || '',
            ad.path1 || '',
            ad.path2 || '',
            ad.finalUrl || '',
            ad.phoneNumber || '',
            ad.businessName || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `google-ads-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const copyToClipboard = () => {
        if (selectedAds.length === 0) {
            alert('Please select at least one ad to copy');
            return;
        }

        const adsToExport = generatedAds.filter(ad => selectedAds.includes(ad.id));
        const text = adsToExport.map(ad => {
            if (ad.adType === 'CallOnly') {
                return `[${ad.groupName}] ${ad.adType}\nH1: ${ad.headline1}\nH2: ${ad.headline2}\nD1: ${ad.description1}\nD2: ${ad.description2}\nPhone: ${ad.phoneNumber}\nBusiness: ${ad.businessName}\n`;
            } else {
                return `[${ad.groupName}] ${ad.adType}\nH1: ${ad.headline1}\nH2: ${ad.headline2}\nH3: ${ad.headline3}\nD1: ${ad.description1}\nD2: ${ad.description2}\nURL: ${ad.finalUrl}\n`;
            }
        }).join('\n---\n\n');

        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    AI-Powered Ads Builder
                </h1>
                <p className="text-slate-500">
                    Generate high-converting Google Ads with AI optimization for maximum ad rank
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel: Configuration */}
                <div className="space-y-6">
                    {/* Mode Selection */}
                    <Card className="p-6 bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl">
                        <h2 className="text-xl font-bold text-indigo-600 mb-4">
                            1. Choose Your Mode
                        </h2>
                        <Tabs value={mode} onValueChange={(v) => setMode(v as 'single' | 'multiple')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="single">Single Group</TabsTrigger>
                                <TabsTrigger value="multiple">Multiple Groups</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="single" className="mt-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Enter 3-4 Keywords (comma-separated)
                                    </label>
                                    <Textarea
                                        placeholder="airline number, contact airline, delta phone number, customer service"
                                        value={singleKeywords}
                                        onChange={(e) => setSingleKeywords(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        AI will generate optimized ads for these keywords
                                    </p>
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="multiple" className="mt-4">
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600 mb-3">
                                        Create ads for multiple keyword groups at once
                                    </p>
                                    
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {adGroups.map((group, index) => (
                                            <div key={group.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Input
                                                        value={group.name}
                                                        onChange={(e) => updateAdGroup(group.id, 'name', e.target.value)}
                                                        className="font-semibold max-w-[200px]"
                                                    />
                                                    {adGroups.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeAdGroup(group.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Textarea
                                                    placeholder="Enter keywords for this group (comma-separated)"
                                                    value={group.keywords}
                                                    onChange={(e) => updateAdGroup(group.id, 'keywords', e.target.value)}
                                                    className="min-h-[80px]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button
                                        onClick={addAdGroup}
                                        variant="outline"
                                        className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Another Group
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </Card>

                    {/* Base URL Configuration */}
                    <Card className="p-6 bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl">
                        <h2 className="text-xl font-bold text-indigo-600 mb-4">
                            Base URL Configuration
                        </h2>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Landing Page URL
                            </label>
                            <Input
                                type="url"
                                placeholder="https://www.example.com"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                className="bg-white"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                This URL will be used for all generated ads. You can edit individual ad URLs after generation.
                            </p>
                        </div>
                    </Card>

                    {/* Ad Type Configuration */}
                    <Card className="p-6 bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl">
                        <h2 className="text-xl font-bold text-indigo-600 mb-4">
                            2. Configure Ad Types & Quantity
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">RSA</Badge>
                                    Responsive Search Ads
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="25"
                                    value={adConfig.rsaCount}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        const total = value + adConfig.dkiCount + adConfig.callOnlyCount;
                                        if (total <= 25) {
                                            setAdConfig({...adConfig, rsaCount: value});
                                        } else {
                                            alert(`Total ads cannot exceed 25. Current total would be ${total}. Please reduce other ad types first.`);
                                        }
                                    }}
                                    className="max-w-[120px]"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Multiple headlines and descriptions for testing
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <Badge variant="outline" className="mr-2 bg-purple-50 text-purple-700 border-purple-200">DKI</Badge>
                                    Dynamic Keyword Insertion Ads
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="25"
                                    value={adConfig.dkiCount}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        const total = adConfig.rsaCount + value + adConfig.callOnlyCount;
                                        if (total <= 25) {
                                            setAdConfig({...adConfig, dkiCount: value});
                                        } else {
                                            alert(`Total ads cannot exceed 25. Current total would be ${total}. Please reduce other ad types first.`);
                                        }
                                    }}
                                    className="max-w-[120px]"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Automatically inserts search keywords into ad text
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">Call</Badge>
                                    Call Only Ads
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="25"
                                    value={adConfig.callOnlyCount}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        const total = adConfig.rsaCount + adConfig.dkiCount + value;
                                        if (total <= 25) {
                                            setAdConfig({...adConfig, callOnlyCount: value});
                                        } else {
                                            alert(`Total ads cannot exceed 25. Current total would be ${total}. Please reduce other ad types first.`);
                                        }
                                    }}
                                    className="max-w-[120px]"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Mobile-only ads with click-to-call functionality
                                </p>
                            </div>
                            
                            {/* Total Ads Counter */}
                            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-700">Total Ads:</span>
                                    <span className={`text-lg font-bold ${(adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount) > 25 ? 'text-red-600' : 'text-indigo-600'}`}>
                                        {adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount} / 25
                                    </span>
                                </div>
                                {(adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount) > 25 && (
                                    <p className="text-xs text-red-600 mt-1">Maximum limit exceeded. Please reduce quantities.</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Generate Button */}
                    <Button
                        onClick={generateAds}
                        disabled={isGenerating || (adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount) > 25}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                                Generating AI-Optimized Ads...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5 mr-2" />
                                Generate High-Performing Ads
                            </>
                        )}
                    </Button>
                </div>

                {/* Right Panel: Generated Ads */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-indigo-600">
                            3. Review & Export Ads
                        </h2>
                        {generatedAds.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={selectAll}
                                    variant="outline"
                                    size="sm"
                                >
                                    {selectedAds.length === generatedAds.length ? (
                                        <><Square className="w-4 h-4 mr-1" /> Deselect All</>
                                    ) : (
                                        <><CheckSquare className="w-4 h-4 mr-1" /> Select All</>
                                    )}
                                </Button>
                                <Button
                                    onClick={exportToCSV}
                                    disabled={selectedAds.length === 0}
                                    variant="default"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    CSV
                                </Button>
                                <Button
                                    onClick={copyToClipboard}
                                    disabled={selectedAds.length === 0}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy
                                </Button>
                            </div>
                        )}
                    </div>

                    {generatedAds.length > 0 && (
                        <div className="mb-4 px-4 py-3 bg-slate-100 rounded-lg">
                            <p className="text-sm font-semibold text-slate-700">
                                {generatedAds.length} Ads Generated
                                {selectedAds.length > 0 && (
                                    <span className="ml-2 text-indigo-600">
                                        ({selectedAds.length} selected)
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                        {generatedAds.length > 0 ? (
                            generatedAds.map((ad) => (
                                <div
                                    key={ad.id}
                                    onClick={() => toggleAdSelection(ad.id)}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                        selectedAds.includes(ad.id)
                                            ? 'border-indigo-300 bg-indigo-50'
                                            : 'border-slate-200 bg-white hover:border-indigo-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={selectedAds.includes(ad.id)}
                                            onCheckedChange={() => toggleAdSelection(ad.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {ad.groupName}
                                                </Badge>
                                                <Badge 
                                                    variant="outline"
                                                    className={
                                                        ad.adType === 'RSA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        ad.adType === 'DKI' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        'bg-green-50 text-green-700 border-green-200'
                                                    }
                                                >
                                                    {ad.adType}
                                                </Badge>
                                            </div>

                                            {ad.adType === 'CallOnly' ? (
                                                <div className="space-y-1 text-sm">
                                                    <div className="font-semibold text-blue-600">{ad.headline1}</div>
                                                    <div className="text-slate-700">{ad.headline2}</div>
                                                    <div className="text-slate-600 text-xs">{ad.description1}</div>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                        <span>📞 {ad.phoneNumber}</span>
                                                        <span>•</span>
                                                        <span>{ad.businessName}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1 text-sm">
                                                    <div className="font-semibold text-blue-600">{ad.headline1}</div>
                                                    <div className="text-slate-700">{ad.headline2}</div>
                                                    {ad.headline3 && <div className="text-slate-600">{ad.headline3}</div>}
                                                    <div className="text-slate-600 text-xs mt-2">{ad.description1}</div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Input
                                                            type="url"
                                                            value={ad.finalUrl || baseUrl}
                                                            onChange={(e) => {
                                                                setGeneratedAds(generatedAds.map(a => 
                                                                    a.id === ad.id ? { ...a, finalUrl: e.target.value } : a
                                                                ));
                                                            }}
                                                            className="text-xs h-7 text-green-700 border-green-200 focus:border-green-400 flex-1"
                                                            placeholder="Enter URL"
                                                        />
                                                        <span className="text-xs text-slate-500 whitespace-nowrap">/{ad.path1}/{ad.path2}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-[400px]">
                                <div className="text-center">
                                    <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">
                                        Configure your settings and click "Generate" to create optimized ads
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