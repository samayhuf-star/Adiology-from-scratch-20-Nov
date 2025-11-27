import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, Trash2, Download, FileSpreadsheet, Copy, CheckSquare, Square, Zap, Globe, Settings, Eye, Link2, Phone, Tag, MessageSquare, Building2, FileText, Image as ImageIcon, DollarSign, MapPin, Smartphone, Gift, AlertCircle, Search, Filter, X, ChevronDown, SlidersHorizontal, BarChart3, BarChart, TrendingUp, FileText as FileTextIcon, MoreVertical, Save, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LiveAdPreview } from './LiveAdPreview';
import { api } from '../utils/api';
import { notifications } from '../utils/notifications';

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
    const [urlError, setUrlError] = useState('');
    
    // Ad type selection with dropdown (single selection)
    const [selectedAdType, setSelectedAdType] = useState<string>('rsa'); // 'rsa' | 'dki' | 'callOnly' | 'all'
    
    // Simplified ad config - will generate 1 ad of selected type
    const getAdConfig = () => {
        if (selectedAdType === 'all') {
            return { rsaCount: 1, dkiCount: 1, callOnlyCount: 1 };
        } else if (selectedAdType === 'rsa') {
            return { rsaCount: 1, dkiCount: 0, callOnlyCount: 0 };
        } else if (selectedAdType === 'dki') {
            return { rsaCount: 0, dkiCount: 1, callOnlyCount: 0 };
        } else {
            return { rsaCount: 0, dkiCount: 0, callOnlyCount: 1 };
        }
    };
    
    const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);
    const [showExtensionDialog, setShowExtensionDialog] = useState(false);
    const [selectedAdForExtension, setSelectedAdForExtension] = useState<string | null>(null);
    const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
    
    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAdType, setFilterAdType] = useState<string>('all');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showConfigSidebar, setShowConfigSidebar] = useState(true);
    
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
            // Bug_23: Renumber groups after deletion (Group 2 becomes Group 1, etc.)
            const filteredGroups = adGroups.filter(group => group.id !== id);
            const renumberedGroups = filteredGroups.map((group, index) => ({
                ...group,
                name: `Group ${index + 1}`
            }));
            setAdGroups(renumberedGroups);
        }
    };

    const updateAdGroup = (id: string, field: 'name' | 'keywords', value: string) => {
        setAdGroups(adGroups.map(group => 
            group.id === id ? { ...group, [field]: value } : group
        ));
    };

    const generateAds = async () => {
        // Bug_27: Validate URL before generating
        const urlValue = baseUrl.trim();
        if (urlValue && !urlValue.match(/^https?:\/\/.+/i)) {
            setUrlError('Please enter a valid URL starting with http:// or https://');
            notifications.warning('Please enter a valid URL', {
                title: 'Invalid URL',
                description: 'The landing page URL must start with http:// or https://'
            });
            return;
        }
        setUrlError('');

        // Bug_33: Validate that no group fields are blank in multiple mode
        if (mode === 'multiple') {
            const blankGroups = adGroups.filter(g => !g.keywords.trim());
            if (blankGroups.length > 0) {
                const groupNames = blankGroups.map(g => g.name).join(', ');
                notifications.warning(`Please enter keywords for all groups. The following groups are blank: ${groupNames}`, {
                    title: 'Blank Group Fields',
                    description: 'All groups must have keywords before generating ads.'
                });
                return;
            }
        }

        // Bug_33: Validate single mode has keywords
        if (mode === 'single' && !singleKeywords.trim()) {
            notifications.warning('Please enter keywords', {
                title: 'Keywords Required',
                description: 'You must enter keywords before generating ads.'
            });
            return;
        }

        setIsGenerating(true);
        try {
            const groupsToProcess = mode === 'single' 
                ? [{ id: '1', name: 'Group 1', keywords: singleKeywords }]
                : adGroups.filter(g => g.keywords.trim());

            if (groupsToProcess.length === 0 || groupsToProcess.every(g => !g.keywords.trim())) {
                notifications.warning('Please enter keywords for at least one group', {
                    title: 'Keywords Required'
                });
                setIsGenerating(false);
                return;
            }

            // Get ad config based on selected ad type
            const currentAdConfig = getAdConfig();
            
            // Calculate total ads that will be generated
            const totalAdsPerGroup = currentAdConfig.rsaCount + currentAdConfig.dkiCount + currentAdConfig.callOnlyCount;
            const totalAdsToGenerate = totalAdsPerGroup * groupsToProcess.length;

            // Limit total ads to 25
            if (totalAdsToGenerate > 25) {
                notifications.warning(`Total ads cannot exceed 25. You're trying to generate ${totalAdsToGenerate} ads (${groupsToProcess.length} groups × ${totalAdsPerGroup} ads per group). Please reduce the quantities or number of groups.`, {
                    title: 'Too Many Ads'
                });
                setIsGenerating(false);
                return;
            }

            const allGeneratedAds: GeneratedAd[] = [];

            for (const group of groupsToProcess) {
                // Split by comma, newline, or semicolon to handle different input formats
                const keywords = group.keywords
                    .split(/[,\n;]+/)
                    .map(k => k.trim())
                    .filter(Boolean);
                
                // Debug: Log keywords array
                console.log('Processing keywords for group:', group.name);
                console.log('Keywords array:', keywords);
                console.log('Number of keywords:', keywords.length);
                
                if (keywords.length === 0) {
                    console.warn('No keywords found after splitting for group:', group.name);
                    continue;
                }
                
                // Generate RSA Ads
                if (currentAdConfig.rsaCount > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'RSA',
                            count: currentAdConfig.rsaCount,
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
                        for (let i = 0; i < currentAdConfig.rsaCount; i++) {
                            allGeneratedAds.push(generateFallbackRSA(group.name, keywords, i));
                        }
                    }
                }

                // Generate DKI Ads
                if (currentAdConfig.dkiCount > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'DKI',
                            count: currentAdConfig.dkiCount,
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
                        for (let i = 0; i < currentAdConfig.dkiCount; i++) {
                            allGeneratedAds.push(generateFallbackDKI(group.name, keywords, i));
                        }
                    }
                }

                // Generate Call Only Ads
                if (currentAdConfig.callOnlyCount > 0) {
                    try {
                        const response = await api.post('/generate-ads', {
                            keywords,
                            adType: 'CallOnly',
                            count: currentAdConfig.callOnlyCount,
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
                        for (let i = 0; i < currentAdConfig.callOnlyCount; i++) {
                            allGeneratedAds.push(generateFallbackCallOnly(group.name, keywords, i));
                        }
                    }
                }
            }

            setGeneratedAds(allGeneratedAds);
            setSelectedAds([]);
        } catch (error) {
            console.error('Generation error:', error);
            notifications.error('Failed to generate ads. Please try again.', {
                title: 'Generation Failed'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Helper function for proper title casing (Google Ads best practice)
    const toTitleCase = (str: string): string => {
        const exceptions = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in'];
        return str.toLowerCase().split(' ').map((word, index) => {
            // Always capitalize first word, last word, and words not in exceptions
            if (index === 0 || !exceptions.includes(word)) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        }).join(' ');
    };

    const generateFallbackRSA = (groupName: string, keywords: string[], index: number): GeneratedAd => {
        // Select a keyword from the array, cycling through them
        const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
        
        // Clean keyword: Remove quotes, brackets, and match type syntax
        // Google Ads doesn't allow quotes in ad text
        let cleanKeyword = selectedKeyword.trim();
        if ((cleanKeyword.startsWith('"') && cleanKeyword.endsWith('"')) || 
            (cleanKeyword.startsWith("'") && cleanKeyword.endsWith("'"))) {
            cleanKeyword = cleanKeyword.slice(1, -1);
        }
        if (cleanKeyword.startsWith('[') && cleanKeyword.endsWith(']')) {
            cleanKeyword = cleanKeyword.slice(1, -1);
        }
        if (cleanKeyword.startsWith('-')) {
            cleanKeyword = cleanKeyword.slice(1);
        }
        cleanKeyword = cleanKeyword.trim();
        
        const mainKeyword = toTitleCase(cleanKeyword);
        
        // Google Ads Best Practices: Strong CTAs, Value Props, Urgency
        const variations = [
            { 
                h1: `${mainKeyword} - Best Deals Online`, 
                h2: 'Shop Now & Save Big', 
                h3: 'Limited Time Offer',
                h4: 'Free Shipping Available',
                h5: 'Order Today'
            },
            { 
                h1: `Professional ${mainKeyword} Service`, 
                h2: 'Available 24/7', 
                h3: 'Expert Support Team',
                h4: 'Get a Free Quote',
                h5: 'Trusted by 10K+ Customers'
            },
            { 
                h1: `${mainKeyword} Solutions You Need`, 
                h2: 'Get Started Today', 
                h3: 'Free Consultation',
                h4: 'Premium Quality Guaranteed',
                h5: 'Call Now for Info'
            },
            { 
                h1: `Premium ${mainKeyword} Products`, 
                h2: 'Trusted by Thousands', 
                h3: 'Best Price Guarantee',
                h4: '5-Star Rated Service',
                h5: 'Shop the Collection'
            },
            { 
                h1: `${mainKeyword} Experts Near You`, 
                h2: 'Fast & Reliable', 
                h3: 'Contact Us Now',
                h4: 'Same-Day Service Available',
                h5: 'Get Your Free Estimate'
            }
        ];
        
        const variation = variations[index % variations.length];
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'RSA',
            type: 'rsa',
            headline1: variation.h1.substring(0, 30), // Google Ads limit: 30 chars
            headline2: variation.h2.substring(0, 30),
            headline3: variation.h3.substring(0, 30),
            headline4: variation.h4.substring(0, 30),
            headline5: variation.h5.substring(0, 30),
            description1: `Looking for ${mainKeyword}? We offer the best solutions with competitive pricing and excellent customer service. Shop with confidence today.`.substring(0, 90),
            description2: `Get your ${mainKeyword} today with fast delivery, expert support, and 100% satisfaction guaranteed. Contact us now for more information!`.substring(0, 90),
            path1: mainKeyword.toLowerCase().replace(/\s+/g, '-').substring(0, 15),
            path2: 'deals',
            finalUrl: baseUrl,
            selected: false,
            extensions: []
        };
    };

    const generateFallbackDKI = (groupName: string, keywords: string[], index: number): GeneratedAd => {
        // Select a keyword from the array, cycling through them
        const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
        
        // Clean keyword: Remove quotes, brackets, and match type syntax
        // Remove leading/trailing quotes
        let cleanKeyword = selectedKeyword.trim();
        if ((cleanKeyword.startsWith('"') && cleanKeyword.endsWith('"')) || 
            (cleanKeyword.startsWith("'") && cleanKeyword.endsWith("'"))) {
            cleanKeyword = cleanKeyword.slice(1, -1);
        }
        // Remove brackets for exact match
        if (cleanKeyword.startsWith('[') && cleanKeyword.endsWith(']')) {
            cleanKeyword = cleanKeyword.slice(1, -1);
        }
        // Remove negative keyword prefix
        if (cleanKeyword.startsWith('-')) {
            cleanKeyword = cleanKeyword.slice(1);
        }
        cleanKeyword = cleanKeyword.trim();
        
        const mainKeyword = toTitleCase(cleanKeyword);
        
        // DKI Best Practices: Title case for default text, proper formatting
        // IMPORTANT: DKI syntax must NOT have quotes around the keyword
        // Correct: {KeyWord:call plumbing services}
        // Wrong: {KeyWord:"call plumbing services"}
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'DKI',
            type: 'dki',
            headline1: `{KeyWord:${mainKeyword}} - Official Site`.substring(0, 30),
            headline2: `Shop {KeyWord:${mainKeyword}} Online`.substring(0, 30),
            headline3: `Best {KeyWord:${mainKeyword}} Deals`.substring(0, 30),
            headline4: `Buy {KeyWord:${mainKeyword}} Today`.substring(0, 30),
            headline5: `Top Rated {KeyWord:${mainKeyword}}`.substring(0, 30),
            description1: `Find the perfect {KeyWord:${mainKeyword}} for your needs. Compare options and get the best price available today.`.substring(0, 90),
            description2: `Order your {KeyWord:${mainKeyword}} online with fast shipping and expert customer support. Satisfaction guaranteed!`.substring(0, 90),
            path1: 'keyword'.substring(0, 15),
            path2: 'deals'.substring(0, 15),
            finalUrl: baseUrl,
            selected: false,
            extensions: []
        };
    };

    const generateFallbackCallOnly = (groupName: string, keywords: string[], index: number): GeneratedAd => {
        // Select a keyword from the array, cycling through them
        const selectedKeyword = keywords[index % keywords.length] || keywords[0] || 'Product';
        
        // Clean keyword: Remove quotes, brackets, and match type syntax
        // Google Ads doesn't allow quotes in ad text
        let cleanKeyword = selectedKeyword.trim();
        if ((cleanKeyword.startsWith('"') && cleanKeyword.endsWith('"')) || 
            (cleanKeyword.startsWith("'") && cleanKeyword.endsWith("'"))) {
            cleanKeyword = cleanKeyword.slice(1, -1);
        }
        if (cleanKeyword.startsWith('[') && cleanKeyword.endsWith(']')) {
            cleanKeyword = cleanKeyword.slice(1, -1);
        }
        if (cleanKeyword.startsWith('-')) {
            cleanKeyword = cleanKeyword.slice(1);
        }
        cleanKeyword = cleanKeyword.trim();
        
        const mainKeyword = toTitleCase(cleanKeyword);
        
        // Call-Only Best Practices: Strong CTAs with "Call" or "Contact"
        const variations = [
            { 
                h1: `${mainKeyword} - Call Now`, 
                h2: 'Available 24/7 - Free Quote'
            },
            { 
                h1: `Professional ${mainKeyword}`, 
                h2: 'Speak to an Expert Today'
            },
            { 
                h1: `${mainKeyword} Support Near You`, 
                h2: 'Call for Free Consultation'
            },
            { 
                h1: `${mainKeyword} Hotline`, 
                h2: 'Immediate Assistance Available'
            },
            { 
                h1: `${mainKeyword} Service - Call Us`, 
                h2: 'Get Your Best Price Now'
            }
        ];
        
        const variation = variations[index % variations.length];
        
        return {
            id: crypto.randomUUID(),
            groupName,
            adType: 'CallOnly',
            type: 'callonly',
            headline1: variation.h1.substring(0, 30),
            headline2: variation.h2.substring(0, 30),
            description1: `Need ${mainKeyword}? Call us now for expert advice and the best pricing. Our team is ready to help you today!`.substring(0, 90),
            description2: `Get immediate assistance with ${mainKeyword}. Speak directly with our specialists. Call today for your free quote!`.substring(0, 90),
            phoneNumber: '+1-800-123-4567',
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

    const exportToCSV = async () => {
        if (selectedAds.length === 0) {
            notifications.warning('Please select at least one ad to export', {
                title: 'No Ads Selected'
            });
            return;
        }

        const adsToExport = generatedAds.filter(ad => selectedAds.includes(ad.id));
        
        try {
            const { exportCSVWithValidation } = await import('../utils/csvGeneratorV3');
            const filename = `google-ads-${new Date().toISOString().split('T')[0]}.csv`;
            
            // Get default final URL from first ad
            const defaultUrl = adsToExport[0]?.finalUrl || 'https://www.example.com';
            
            const result = await exportCSVWithValidation(
                adsToExport,
                filename,
                'ads',
                {
                    campaignName: 'Ads Campaign',
                    finalUrl: defaultUrl
                }
            );
            
            if (result.warnings && result.warnings.length > 0) {
                notifications.warning(
                    <div className="whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
                        {result.warnings.join('\n')}
                    </div>,
                    { 
                        title: '⚠️  CSV Validation Warnings',
                        description: 'Your ads will export, but consider fixing these warnings.',
                        duration: 10000
                    }
                );
            } else {
                notifications.success(`Exported ${adsToExport.length} ad(s) to CSV`, {
                    title: 'Export Complete'
                });
            }
        } catch (error: any) {
            console.error('Export error:', error);
            notifications.error(
                error?.message || 'An unexpected error occurred during export',
                { 
                    title: '❌ Export Failed',
                    description: 'Please try again or contact support if the issue persists.'
                }
            );
        }
    };

    const copyToClipboard = () => {
        if (selectedAds.length === 0) {
            notifications.warning('Please select at least one ad to copy', {
                title: 'No Ads Selected'
            });
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
        notifications.success('Copied to clipboard!', {
            title: 'Copied'
        });
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

            const ad = generatedAds.find(a => a.id === selectedAdForExtension);
        if (!ad) return;

        // Get existing extension types to prevent duplicates
        const existingExtensionTypes = (ad.extensions || []).map((ext: Extension) => ext.extensionType);
        
        // Filter out extension types that already exist
        const newExtensionTypes = selectedExtensions.filter(extType => !existingExtensionTypes.includes(extType));
        
        if (newExtensionTypes.length === 0) {
            notifications.warning('All selected extensions are already added to this ad', {
                title: 'Extensions Already Added'
            });
            return;
        }

            const mainKeyword = ad?.headline1?.split(' ')[0] || 'service';

        const newExtensions: Extension[] = newExtensionTypes.map(extType => {
            const extId = crypto.randomUUID();

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

        // Merge new extensions with existing ones
        setGeneratedAds(generatedAds.map(a => 
            a.id === selectedAdForExtension 
                ? { ...a, extensions: [...(a.extensions || []), ...newExtensions] }
                : a
        ));

        setShowExtensionDialog(false);
        setSelectedAdForExtension(null);
        setSelectedExtensions([]);
    };

    const handleRemoveExtension = (adId: string, extensionId: string) => {
        setGeneratedAds(generatedAds.map(ad => 
            ad.id === adId 
                ? { ...ad, extensions: (ad.extensions || []).filter((ext: Extension) => ext.id !== extensionId) }
                : ad
        ));
    };

    // Filter and search logic
    const filteredAds = useMemo(() => {
        return generatedAds.filter(ad => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = 
                    ad.headline1?.toLowerCase().includes(query) ||
                    ad.headline2?.toLowerCase().includes(query) ||
                    ad.headline3?.toLowerCase().includes(query) ||
                    ad.description1?.toLowerCase().includes(query) ||
                    ad.description2?.toLowerCase().includes(query) ||
                    ad.groupName.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }
            
            // Ad type filter
            if (filterAdType !== 'all' && ad.adType !== filterAdType) return false;
            
            // Group filter
            if (filterGroup !== 'all' && ad.groupName !== filterGroup) return false;
            
            return true;
        });
    }, [generatedAds, searchQuery, filterAdType, filterGroup]);

    // Statistics
    const stats = useMemo(() => {
        const adTypes = generatedAds.reduce((acc, ad) => {
            acc[ad.adType] = (acc[ad.adType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const groups = [...new Set(generatedAds.map(ad => ad.groupName))];
        
        return {
            total: generatedAds.length,
            rsa: adTypes['RSA'] || 0,
            dki: adTypes['DKI'] || 0,
            callOnly: adTypes['CallOnly'] || 0,
            groups: groups.length,
            selected: selectedAds.length
        };
    }, [generatedAds, selectedAds]);

    // Unique groups for filter dropdown
    const uniqueGroups = useMemo(() => {
        return [...new Set(generatedAds.map(ad => ad.groupName))];
    }, [generatedAds]);

    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-4">
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold theme-gradient-text mb-1">
                            Ads Builder
                        </h1>
                        <p className="text-slate-600 text-xs">
                            Generate high-converting Google Ads with AI optimization
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Single Form */}
                <div className="space-y-4">
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900">
                                Create Your Ads
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600">
                                Fill in the details below to generate your Google Ads
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* URL Input */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                    URL
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://www.example.com"
                                    value={baseUrl}
                                    onChange={(e) => {
                                        setBaseUrl(e.target.value);
                                        if (urlError) setUrlError('');
                                    }}
                                    onBlur={(e) => {
                                        const urlValue = e.target.value.trim();
                                        if (urlValue && !urlValue.match(/^https?:\/\/.+/i)) {
                                            setUrlError('Please enter a valid URL starting with http:// or https://');
                                        } else {
                                            setUrlError('');
                                        }
                                    }}
                                    className={`bg-white border-slate-300 focus:border-indigo-500 h-10 text-sm ${urlError ? 'border-red-500 focus:border-red-500' : ''}`}
                                />
                                {urlError && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {urlError}
                                    </p>
                                )}
                            </div>

                            {/* Ad Type Dropdown */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Type of Ads
                                </Label>
                                <Select value={selectedAdType} onValueChange={setSelectedAdType}>
                                    <SelectTrigger className="w-full h-10 text-sm">
                                        <SelectValue placeholder="Select ad type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rsa">Responsive Search Ads</SelectItem>
                                        <SelectItem value="dki">Dynamic Keyword Insertion (DKI)</SelectItem>
                                        <SelectItem value="callOnly">Call-Only Ads</SelectItem>
                                        <SelectItem value="all">All Types</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mode Selection */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Choose Your Mode
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant={mode === 'single' ? 'default' : 'outline'}
                                        onClick={() => setMode('single')}
                                        size="sm"
                                        className={`flex-1 ${mode === 'single' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        Single Ad Group
                                    </Button>
                                    <Button
                                        variant={mode === 'multiple' ? 'default' : 'outline'}
                                        onClick={() => setMode('multiple')}
                                        size="sm"
                                        className={`flex-1 ${mode === 'multiple' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        Multiple Ad Groups
                                    </Button>
                                </div>
                            </div>

                            {/* Keywords Input */}
                            {mode === 'single' ? (
                                <div>
                                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Enter Keywords (comma-separated)
                                    </Label>
                                    <Textarea
                                        placeholder="e.g., airline number, contact airline, delta phone number, customer service"
                                        value={singleKeywords}
                                        onChange={(e) => setSingleKeywords(e.target.value)}
                                        className="min-h-[120px] border-slate-300 text-sm"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Ad Groups & Keywords
                                    </Label>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                        {adGroups.map((group) => (
                                            <div key={group.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Input
                                                        value={group.name}
                                                        onChange={(e) => updateAdGroup(group.id, 'name', e.target.value)}
                                                        placeholder="Ad Group Name"
                                                        className="font-semibold max-w-[200px] h-8 text-xs"
                                                    />
                                                    {adGroups.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeAdGroup(group.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Textarea
                                                    placeholder="Enter keywords (comma-separated)"
                                                    value={group.keywords}
                                                    onChange={(e) => updateAdGroup(group.id, 'keywords', e.target.value)}
                                                    className="min-h-[80px] text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button
                                        onClick={addAdGroup}
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Ad Group
                                    </Button>
                                </div>
                            )}

                            {/* Generate Button */}
                            <Button
                                onClick={generateAds}
                                disabled={isGenerating}
                                className="w-full theme-button-primary py-3 text-base font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Ads...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Generate Ads
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Generated Ads Results */}
                <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-lg overflow-hidden lg:sticky lg:top-6 h-[calc(100vh-8rem)] flex flex-col">
                    <div className="bg-white p-3 border-b border-slate-300 flex-shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <CardTitle className="text-sm font-bold text-slate-900">
                                Generated Ads
                            </CardTitle>
                            {generatedAds.length > 0 && (
                                <div className="flex gap-1">
                                    <Button
                                        onClick={selectAll}
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-300 h-7 text-xs px-2"
                                    >
                                        {selectedAds.length === generatedAds.length ? (
                                            <><Square className="w-3 h-3 mr-1" /> All</>
                                        ) : (
                                            <><CheckSquare className="w-3 h-3 mr-1" /> All</>
                                        )}
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="border-slate-300 h-7 text-xs px-2">
                                                <Download className="w-3 h-3 mr-1" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={exportToCSV} disabled={selectedAds.length === 0}>
                                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                                CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={copyToClipboard} disabled={selectedAds.length === 0}>
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy to Clipboard
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                        
                        {/* Compact Statistics */}
                        {generatedAds.length > 0 && (
                            <div className="grid grid-cols-5 gap-1 mb-2">
                                <div className="bg-blue-50 border border-blue-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-blue-600 font-medium">Total</div>
                                    <div className="text-sm font-bold text-blue-700">{stats.total}</div>
                                </div>
                                <div className="bg-indigo-50 border border-indigo-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-indigo-600 font-medium">RSA</div>
                                    <div className="text-sm font-bold text-indigo-700">{stats.rsa}</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-purple-600 font-medium">DKI</div>
                                    <div className="text-sm font-bold text-purple-700">{stats.dki}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-green-600 font-medium">Call</div>
                                    <div className="text-sm font-bold text-green-700">{stats.callOnly}</div>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded p-1.5 text-center">
                                    <div className="text-[10px] text-orange-600 font-medium">Sel</div>
                                    <div className="text-sm font-bold text-orange-700">{stats.selected}</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Compact Search & Filters */}
                        {generatedAds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                <div className="flex-1 min-w-[120px] relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-7 h-7 text-xs"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <Select value={filterAdType} onValueChange={setFilterAdType}>
                                    <SelectTrigger className="w-[100px] h-7 text-xs">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="RSA">RSA</SelectItem>
                                        <SelectItem value="DKI">DKI</SelectItem>
                                        <SelectItem value="CallOnly">Call Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                {uniqueGroups.length > 0 && (
                                    <Select value={filterGroup} onValueChange={setFilterGroup}>
                                        <SelectTrigger className="w-[100px] h-7 text-xs">
                                            <SelectValue placeholder="Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Groups</SelectItem>
                                            {uniqueGroups.map(group => (
                                                <SelectItem key={group} value={group}>{group}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        )}
                    </div>
                    <CardContent className="p-3 flex-1 overflow-hidden flex flex-col">
                        {generatedAds.length > 0 && (
                            <div className="mb-2 px-2 py-1 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 rounded border border-indigo-200/50 text-center flex-shrink-0">
                                <p className="text-xs font-semibold text-slate-800">
                                    Showing {filteredAds.length} of {generatedAds.length} ads
                                    {selectedAds.length > 0 && (
                                        <span className="ml-2 text-indigo-600">
                                            • {selectedAds.length} selected
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                        {filteredAds.length > 0 ? (
                                filteredAds.map((ad) => {
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
                                    className={`border rounded-lg p-2.5 transition-all ${
                                        selectedAds.includes(ad.id)
                                            ? 'border-indigo-400 bg-indigo-50/50 shadow-sm'
                                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        <Checkbox
                                            checked={selectedAds.includes(ad.id)}
                                            onCheckedChange={() => toggleAdSelection(ad.id)}
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                                <Badge variant="outline" className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5">
                                                    {ad.groupName}
                                                </Badge>
                                                <Badge 
                                                    variant="outline"
                                                    className={`text-[10px] font-semibold px-1.5 py-0.5 ${
                                                        ad.adType === 'RSA' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                                        ad.adType === 'DKI' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                                                        'bg-green-100 text-green-700 border-green-300'
                                                    }`}
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
                                                    className="ml-auto text-[10px] h-6 border-purple-300 text-purple-700 hover:bg-purple-50 px-2"
                                                >
                                                    <Plus className="w-2.5 h-2.5 mr-0.5" />
                                                    Ext
                                                </Button>
                                            </div>

                                                    {/* Live Ad Preview */}
                                                    <LiveAdPreview 
                                                        ad={previewAd} 
                                                        onRemoveExtension={(extensionId) => handleRemoveExtension(ad.id, extensionId)}
                                                    />

                                            {/* Editable URL for RSA/DKI */}
                                            {(ad.adType === 'RSA' || ad.adType === 'DKI') && (
                                                <div className="mt-2 pt-2 border-t border-slate-200">
                                                    <Label className="text-[10px] font-semibold text-slate-700 mb-1 block">Final URL</Label>
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="url"
                                                            value={ad.finalUrl || baseUrl}
                                                            onChange={(e) => {
                                                                setGeneratedAds(generatedAds.map(a => 
                                                                    a.id === ad.id ? { ...a, finalUrl: e.target.value } : a
                                                                ));
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] h-6 text-green-700 border-green-200 focus:border-green-400 flex-1"
                                                            placeholder="Enter URL"
                                                        />
                                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">/{ad.path1}/{ad.path2}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                    );
                                })
                        ) : generatedAds.length > 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Filter className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-xs text-slate-600 font-medium mb-1">No ads match your filters</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterAdType('all');
                                            setFilterGroup('all');
                                        }}
                                        className="mt-2 h-7 text-xs"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium mb-1">No ads generated yet</p>
                                    <p className="text-[10px] text-slate-500">
                                        Configure settings and click "Generate"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    </CardContent>
                </Card>
            </div>
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
                            const ad = generatedAds.find(a => a.id === selectedAdForExtension);
                            const alreadyAdded = (ad?.extensions || []).some((e: Extension) => e.extensionType === ext.id);
                            return (
                                <div
                                    key={ext.id}
                                    onClick={() => {
                                        if (!alreadyAdded) {
                                        setSelectedExtensions(prev =>
                                            prev.includes(ext.id)
                                                ? prev.filter(e => e !== ext.id)
                                                : [...prev, ext.id]
                                        );
                                        }
                                    }}
                                    className={`p-4 border-2 rounded-lg transition-all ${
                                        alreadyAdded
                                            ? 'border-slate-300 bg-slate-100 cursor-not-allowed opacity-60'
                                            : isSelected
                                                ? (ext.color === 'purple' ? 'border-purple-500 bg-purple-50 cursor-pointer' :
                                                   ext.color === 'blue' ? 'border-blue-500 bg-blue-50 cursor-pointer' :
                                                   ext.color === 'green' ? 'border-green-500 bg-green-50 cursor-pointer' :
                                                   ext.color === 'indigo' ? 'border-indigo-500 bg-indigo-50 cursor-pointer' :
                                                   ext.color === 'emerald' ? 'border-emerald-500 bg-emerald-50 cursor-pointer' :
                                                   ext.color === 'red' ? 'border-red-500 bg-red-50 cursor-pointer' :
                                                   ext.color === 'orange' ? 'border-orange-500 bg-orange-50 cursor-pointer' :
                                                   ext.color === 'pink' ? 'border-pink-500 bg-pink-50 cursor-pointer' :
                                                   ext.color === 'cyan' ? 'border-cyan-500 bg-cyan-50 cursor-pointer' :
                                                   'border-purple-500 bg-purple-50 cursor-pointer')
                                                : 'border-slate-200 hover:border-indigo-300 bg-white cursor-pointer'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={isSelected}
                                            disabled={alreadyAdded}
                                            onCheckedChange={(checked) => {
                                                if (!alreadyAdded) {
                                                if (checked) {
                                                    setSelectedExtensions([...selectedExtensions, ext.id]);
                                                } else {
                                                    setSelectedExtensions(selectedExtensions.filter(e => e !== ext.id));
                                                    }
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
                                                {alreadyAdded && (
                                                    <Badge variant="outline" className="text-xs ml-auto bg-green-100 text-green-700 border-green-300">
                                                        Already Added
                                                    </Badge>
                                                )}
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
                        <Button onClick={handleConfirmExtensions} className="theme-button-primary">
                            Add {selectedExtensions.length > 0 ? `${selectedExtensions.length} ` : ''}Extension{selectedExtensions.length !== 1 ? 's' : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};