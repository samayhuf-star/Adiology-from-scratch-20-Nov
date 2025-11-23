import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Download, FileSpreadsheet, Copy, CheckSquare, Square, Zap, Globe, Settings, Eye, Link2, Phone, Tag, MessageSquare, Building2, FileText, Image as ImageIcon, DollarSign, MapPin, Smartphone, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { LiveAdPreview } from './LiveAdPreview';
import { api } from '../utils/api';

interface AdGroup {
    id: string;
    name: string;
    keywords: string;
}

interface Extension {
    id: string;
    extensionType: 'callout' | 'sitelink' | 'call' | 'snippet' | 'price' | 'location' | 'message' | 'leadform' | 'promotion' | 'image' | 'app';
    [key: string]: any;
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
    extensions?: Extension[];
    type?: 'rsa' | 'dki' | 'callonly';
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
    const [showExtensionDialog, setShowExtensionDialog] = useState(false);
    const [selectedAdForExtension, setSelectedAdForExtension] = useState<string | null>(null);
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
    
    const extensionTypes = [
        { id: 'callout', label: 'Callout Extension', icon: Tag, description: 'Highlight key benefits', color: 'purple' },
        { id: 'sitelink', label: 'Sitelink Extension', icon: Link2, description: 'Add links to important pages', color: 'blue' },
        { id: 'call', label: 'Call Extension', icon: Phone, description: 'Add phone number', color: 'green' },
        { id: 'snippet', label: 'Snippet Extension', icon: FileText, description: 'Show structured information', color: 'indigo' },
        { id: 'price', label: 'Price Extension', icon: DollarSign, description: 'Display pricing', color: 'emerald' },
        { id: 'location', label: 'Location Extension', icon: MapPin, description: 'Show business location', color: 'red' },
        { id: 'message', label: 'Message Extension', icon: MessageSquare, description: 'Enable messaging', color: 'purple' },
        { id: 'promotion', label: 'Promotion Extension', icon: Gift, description: 'Show special offers', color: 'orange' },
        { id: 'image', label: 'Image Extension', icon: ImageIcon, description: 'Add images', color: 'pink' },
        { id: 'app', label: 'App Extension', icon: Smartphone, description: 'Link to mobile app', color: 'cyan' },
        { id: 'leadform', label: 'Lead Form Extension', icon: Building2, description: 'Add lead form', color: 'blue' },
    ];

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
                                    type: 'rsa',
                                    ...ad,
                                    selected: false,
                                    extensions: []
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
                                    type: 'dki',
                                    ...ad,
                                    selected: false,
                                    extensions: []
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
                                    type: 'callonly',
                                    phone: ad.phoneNumber || ad.phone,
                                    businessName: ad.businessName,
                                    ...ad,
                                    selected: false,
                                    extensions: []
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
            type: 'rsa',
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
            selected: false,
            extensions: []
        };
    };

    const generateFallbackDKI = (groupName: string, keywords: string[], index: number): GeneratedAd => {
        const mainKeyword = keywords[index % keywords.length];
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'DKI',
            type: 'dki',
            headline1: `{KeyWord:${mainKeyword}} - Official Site`,
            headline2: 'Shop {KeyWord:' + mainKeyword + '}',
            headline3: 'Best {KeyWord:' + mainKeyword + '} Deals',
            description1: `Find the perfect {KeyWord:${mainKeyword}} for your needs. Compare options and get the best price available today.`,
            description2: `Order your {KeyWord:${mainKeyword}} online with fast shipping and expert customer support. Satisfaction guaranteed!`,
            path1: 'keyword',
            path2: 'deals',
            finalUrl: baseUrl,
            selected: false,
            extensions: []
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
            type: 'callonly',
            headline1: variation.h1,
            headline2: variation.h2,
            description1: `Need ${mainKeyword}? Call us now for expert advice and the best pricing. Our team is ready to help!`,
            description2: `Get immediate assistance with ${mainKeyword}. Speak directly with our specialists. Call today!`,
            phoneNumber: '+1-800-123-4567',
            phone: '+1-800-123-4567',
            businessName: 'Your Business',
            selected: false,
            extensions: []
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

    const handleAddExtensions = (adId: string) => {
        setSelectedAdForExtension(adId);
        const ad = generatedAds.find(a => a.id === adId);
        if (ad && ad.extensions) {
            setSelectedExtensions(ad.extensions.map((ext: Extension) => ext.extensionType));
        } else {
            setSelectedExtensions([]);
        }
        setShowExtensionDialog(true);
    };

    const handleConfirmExtensions = () => {
        if (!selectedAdForExtension) return;

        const newExtensions: Extension[] = selectedExtensions.map(extType => {
            const extId = crypto.randomUUID();
            const ad = generatedAds.find(a => a.id === selectedAdForExtension);
            const mainKeyword = ad?.headline1?.split(' ')[0] || 'service';

            let extension: Extension = {
                id: extId,
                extensionType: extType as any,
            };

            switch (extType) {
                case 'callout':
                    extension.callouts = [
                        `Free ${mainKeyword} Consultation`,
                        '24/7 Expert Support',
                        'Best Price Guarantee',
                        'Fast & Reliable Service'
                    ];
                    break;
                case 'sitelink':
                    extension.sitelinks = [
                        { text: 'Shop Now', description: 'Browse our collection', url: `${baseUrl}/shop` },
                        { text: 'About Us', description: 'Learn more about us', url: `${baseUrl}/about` },
                        { text: 'Contact', description: 'Get in touch', url: `${baseUrl}/contact` },
                        { text: 'Support', description: 'Customer support', url: `${baseUrl}/support` }
                    ];
                    break;
                case 'call':
                    extension.phone = '(555) 123-4567';
                    extension.callTrackingEnabled = true;
                    break;
                case 'snippet':
                    extension.header = 'Services';
                    extension.values = [mainKeyword, 'Expert Service', 'Quality Products', 'Fast Delivery'];
                    break;
                case 'price':
                    extension.priceQualifier = 'From';
                    extension.price = '$99';
                    extension.currency = 'USD';
                    extension.unit = 'per service';
                    extension.description = 'Competitive pricing';
                    break;
                case 'location':
                    extension.businessName = 'Your Business Name';
                    extension.addressLine1 = '123 Main St';
                    extension.city = 'City';
                    extension.state = 'State';
                    extension.postalCode = '12345';
                    extension.phone = '(555) 123-4567';
                    break;
                case 'message':
                    extension.messageText = `Message us about ${mainKeyword}`;
                    extension.businessName = 'Your Business';
                    extension.phone = '(555) 123-4567';
                    break;
                case 'promotion':
                    extension.promotionText = 'Special Offer';
                    extension.promotionDescription = `Get 20% off ${mainKeyword}`;
                    extension.occasion = 'SALE';
                    extension.startDate = new Date().toISOString().split('T')[0];
                    extension.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    break;
                case 'image':
                    extension.imageUrl = 'https://via.placeholder.com/1200x628';
                    extension.imageAltText = 'Product Image';
                    extension.imageName = 'Product Showcase';
                    break;
                case 'app':
                    extension.appStore = 'GOOGLE_PLAY';
                    extension.appId = 'com.example.app';
                    extension.appLinkText = 'Download Now';
                    break;
                case 'leadform':
                    extension.formName = 'Get Started';
                    extension.formDescription = 'Fill out this form to get in touch';
                    extension.formType = 'CONTACT';
                    break;
            }

            return extension;
        });

        setGeneratedAds(generatedAds.map(ad => 
            ad.id === selectedAdForExtension 
                ? { ...ad, extensions: newExtensions }
                : ad
        ));

        setShowExtensionDialog(false);
        setSelectedAdForExtension(null);
        setSelectedExtensions([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Ads Builder
                    </h1>
                        <p className="text-slate-600 text-sm">
                        Generate high-converting Google Ads with AI optimization for maximum ad rank
                    </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Panel: Configuration */}
                <div className="space-y-6">
                    {/* Mode Selection */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 p-6 border-b border-slate-200/50">
                            <CardHeader className="p-0">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <Settings className="h-5 w-5 text-indigo-600" />
                            1. Choose Your Mode
                                </CardTitle>
                                <CardDescription className="text-slate-600 mt-1">
                                    Select single or multiple keyword groups
                                </CardDescription>
                            </CardHeader>
                        </div>
                        <CardContent className="p-6">
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
                        </CardContent>
                    </Card>

                    {/* Base URL Configuration */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 p-6 border-b border-slate-200/50">
                            <CardHeader className="p-0">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <Globe className="h-5 w-5 text-emerald-600" />
                            Base URL Configuration
                                </CardTitle>
                                <CardDescription className="text-slate-600 mt-1">
                                    Set the landing page URL for all ads
                                </CardDescription>
                            </CardHeader>
                        </div>
                        <CardContent className="p-6">
                        <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                Landing Page URL
                                </Label>
                            <Input
                                type="url"
                                placeholder="https://www.example.com"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                    className="bg-white border-slate-300 focus:border-indigo-500"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                This URL will be used for all generated ads. You can edit individual ad URLs after generation.
                            </p>
                        </div>
                        </CardContent>
                    </Card>

                    {/* Ad Type Configuration */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-6 border-b border-slate-200/50">
                            <CardHeader className="p-0">
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <Zap className="h-5 w-5 text-blue-600" />
                            2. Configure Ad Types & Quantity
                                </CardTitle>
                                <CardDescription className="text-slate-600 mt-1">
                                    Select ad types and quantities (max 25 total)
                                </CardDescription>
                            </CardHeader>
                        </div>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-blue-200/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 font-semibold">RSA</Badge>
                                            <Label className="text-sm font-semibold text-slate-800">Responsive Search Ads</Label>
                                        </div>
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
                                            className="w-20 text-center font-semibold border-blue-300 focus:border-blue-500"
                                />
                                    </div>
                                    <p className="text-xs text-slate-600">
                                    Multiple headlines and descriptions for testing
                                </p>
                            </div>

                                <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border border-purple-200/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 font-semibold">DKI</Badge>
                                            <Label className="text-sm font-semibold text-slate-800">Dynamic Keyword Insertion</Label>
                                        </div>
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
                                            className="w-20 text-center font-semibold border-purple-300 focus:border-purple-500"
                                />
                                    </div>
                                    <p className="text-xs text-slate-600">
                                    Automatically inserts search keywords into ad text
                                </p>
                            </div>

                                <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg border border-green-200/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 font-semibold">Call</Badge>
                                            <Label className="text-sm font-semibold text-slate-800">Call Only Ads</Label>
                                        </div>
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
                                            className="w-20 text-center font-semibold border-green-300 focus:border-green-500"
                                />
                                    </div>
                                    <p className="text-xs text-slate-600">
                                    Mobile-only ads with click-to-call functionality
                                </p>
                            </div>
                            
                            {/* Total Ads Counter */}
                                <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 rounded-lg border-2 border-indigo-200">
                                <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">Total Ads:</span>
                                        <span className={`text-2xl font-bold ${(adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount) > 25 ? 'text-red-600' : 'text-indigo-600'}`}>
                                        {adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount} / 25
                                    </span>
                                </div>
                                {(adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount) > 25 && (
                                        <p className="text-xs text-red-600 mt-2 font-semibold">⚠️ Maximum limit exceeded. Please reduce quantities.</p>
                                )}
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    {/* Generate Button */}
                    <Button
                        onClick={generateAds}
                        disabled={isGenerating || (adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount) > 25}
                        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white py-7 text-lg font-semibold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
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
                </div>

                {/* Right Panel: Generated Ads */}
                <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden h-fit lg:sticky lg:top-6">
                    <div className="bg-gradient-to-r from-slate-500/10 via-indigo-500/10 to-purple-500/10 p-6 border-b border-slate-200/50">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                                    <Eye className="h-5 w-5 text-indigo-600" />
                            3. Review & Export Ads
                                </CardTitle>
                                <CardDescription className="text-slate-600 mt-1">
                                    Preview and manage your generated ads
                                </CardDescription>
                            </div>
                        {generatedAds.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={selectAll}
                                    variant="outline"
                                    size="sm"
                                        className="border-slate-300"
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
                    </div>
                    <CardContent className="p-6">
                    {generatedAds.length > 0 && (
                            <div className="mb-6 px-4 py-3 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 rounded-lg border border-indigo-200/50">
                                <p className="text-sm font-bold text-slate-800">
                                {generatedAds.length} Ads Generated
                                {selectedAds.length > 0 && (
                                        <span className="ml-2 text-indigo-600 font-semibold">
                                        ({selectedAds.length} selected)
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                        {generatedAds.length > 0 ? (
                                generatedAds.map((ad) => {
                                    // Convert GeneratedAd to LiveAdPreview format
                                    const previewAd = {
                                        id: parseInt(ad.id) || Date.now(),
                                        type: (ad.type || (ad.adType === 'RSA' ? 'rsa' : ad.adType === 'DKI' ? 'dki' : 'callonly')) as 'rsa' | 'dki' | 'callonly',
                                        headline1: ad.headline1,
                                        headline2: ad.headline2,
                                        headline3: ad.headline3,
                                        headline4: ad.headline4,
                                        headline5: ad.headline5,
                                        description1: ad.description1,
                                        description2: ad.description2,
                                        finalUrl: ad.finalUrl || baseUrl,
                                        path1: ad.path1,
                                        path2: ad.path2,
                                        phone: ad.phone || ad.phoneNumber,
                                        businessName: ad.businessName,
                                        extensions: ad.extensions || []
                                    };

                                    return (
                                <div
                                    key={ad.id}
                                            className={`border-2 rounded-xl p-4 transition-all ${
                                        selectedAds.includes(ad.id)
                                                    ? 'border-indigo-400 bg-indigo-50/50 shadow-md'
                                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                    }`}
                                >
                                            <div className="flex items-start gap-3 mb-3">
                                        <Checkbox
                                            checked={selectedAds.includes(ad.id)}
                                            onCheckedChange={() => toggleAdSelection(ad.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Badge variant="outline" className="text-xs font-semibold bg-slate-100">
                                                    {ad.groupName}
                                                </Badge>
                                                <Badge 
                                                    variant="outline"
                                                    className={
                                                                ad.adType === 'RSA' ? 'bg-blue-100 text-blue-700 border-blue-300 font-semibold' :
                                                                ad.adType === 'DKI' ? 'bg-purple-100 text-purple-700 border-purple-300 font-semibold' :
                                                                'bg-green-100 text-green-700 border-green-300 font-semibold'
                                                    }
                                                >
                                                    {ad.adType}
                                                </Badge>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddExtensions(ad.id);
                                                            }}
                                                            className="ml-auto text-xs h-7 border-purple-300 text-purple-700 hover:bg-purple-50"
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Extensions
                                                        </Button>
                                            </div>

                                                    {/* Live Ad Preview */}
                                                    <LiveAdPreview ad={previewAd} />

                                                    {/* Editable URL for RSA/DKI */}
                                                    {(ad.adType === 'RSA' || ad.adType === 'DKI') && (
                                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                                            <Label className="text-xs font-semibold text-slate-700 mb-1 block">Final URL</Label>
                                                            <div className="flex items-center gap-2">
                                                        <Input
                                                            type="url"
                                                            value={ad.finalUrl || baseUrl}
                                                            onChange={(e) => {
                                                                setGeneratedAds(generatedAds.map(a => 
                                                                    a.id === ad.id ? { ...a, finalUrl: e.target.value } : a
                                                                ));
                                                            }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-xs h-8 text-green-700 border-green-200 focus:border-green-400 flex-1"
                                                            placeholder="Enter URL"
                                                        />
                                                        <span className="text-xs text-slate-500 whitespace-nowrap">/{ad.path1}/{ad.path2}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                    );
                                })
                        ) : (
                            <div className="flex items-center justify-center h-[400px]">
                                <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-10 h-10 text-indigo-400" />
                                        </div>
                                        <p className="text-slate-600 font-medium mb-1">No ads generated yet</p>
                                        <p className="text-sm text-slate-500">
                                        Configure your settings and click "Generate" to create optimized ads
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    </CardContent>
                </Card>
                </div>

            {/* Extension Selection Dialog */}
            <Dialog open={showExtensionDialog} onOpenChange={setShowExtensionDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            Add Extensions to Ad
                        </DialogTitle>
                        <DialogDescription>
                            Select extensions to add to your ad. These will appear in the live preview below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
                        {extensionTypes.map((ext) => {
                            const IconComponent = ext.icon;
                            const isSelected = selectedExtensions.includes(ext.id);
                            return (
                                <div
                                    key={ext.id}
                                    onClick={() => {
                                        setSelectedExtensions(prev =>
                                            prev.includes(ext.id)
                                                ? prev.filter(e => e !== ext.id)
                                                : [...prev, ext.id]
                                        );
                                    }}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        isSelected
                                            ? (ext.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                                               ext.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                                               ext.color === 'green' ? 'border-green-500 bg-green-50' :
                                               ext.color === 'indigo' ? 'border-indigo-500 bg-indigo-50' :
                                               ext.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                                               ext.color === 'red' ? 'border-red-500 bg-red-50' :
                                               ext.color === 'orange' ? 'border-orange-500 bg-orange-50' :
                                               ext.color === 'pink' ? 'border-pink-500 bg-pink-50' :
                                               ext.color === 'cyan' ? 'border-cyan-500 bg-cyan-50' :
                                               'border-purple-500 bg-purple-50')
                                            : 'border-slate-200 hover:border-indigo-300 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedExtensions([...selectedExtensions, ext.id]);
                                                } else {
                                                    setSelectedExtensions(selectedExtensions.filter(e => e !== ext.id));
                                                }
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconComponent className={`h-4 w-4 ${
                                                    ext.color === 'purple' ? 'text-purple-600' :
                                                    ext.color === 'blue' ? 'text-blue-600' :
                                                    ext.color === 'green' ? 'text-green-600' :
                                                    ext.color === 'indigo' ? 'text-indigo-600' :
                                                    ext.color === 'emerald' ? 'text-emerald-600' :
                                                    ext.color === 'red' ? 'text-red-600' :
                                                    ext.color === 'orange' ? 'text-orange-600' :
                                                    ext.color === 'pink' ? 'text-pink-600' :
                                                    ext.color === 'cyan' ? 'text-cyan-600' :
                                                    'text-purple-600'
                                                }`} />
                                                <div className="font-semibold text-slate-800">{ext.label}</div>
            </div>
                                            <div className="text-sm text-slate-600">{ext.description}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowExtensionDialog(false);
                            setSelectedAdForExtension(null);
                            setSelectedExtensions([]);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmExtensions} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                            Add {selectedExtensions.length > 0 ? `${selectedExtensions.length} ` : ''}Extension{selectedExtensions.length !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};