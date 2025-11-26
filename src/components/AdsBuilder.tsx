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
    
    // Ad type selection with checkboxes
    const [selectedAdTypes, setSelectedAdTypes] = useState({
        rsa: true,
        dki: true,
        callOnly: true
    });
    
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

            // Calculate total ads that will be generated
            const totalAdsPerGroup = adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount;
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
        const mainKeyword = toTitleCase(selectedKeyword);
        
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
        const mainKeyword = toTitleCase(selectedKeyword);
        
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

    const exportToCSV = () => {
        if (selectedAds.length === 0) {
            notifications.warning('Please select at least one ad to export', {
                title: 'No Ads Selected'
            });
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                <div>
                        <h1 className="text-4xl font-bold theme-gradient-text mb-2">
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
                    {/* URL Section */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <CardContent className="p-6">
                            <div>
                                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                                    URL
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="enter url here"
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
                                    className={`bg-white border-slate-300 focus:border-indigo-500 ${urlError ? 'border-red-500 focus:border-red-500' : ''}`}
                                />
                                {urlError && (
                                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {urlError}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ad Type Selection */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="bg-yellow-400 p-4 border-b border-slate-200">
                            <CardTitle className="text-lg font-bold text-slate-900">
                                2. Select Ad Types
                            </CardTitle>
                        </div>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {/* Checkboxes in a row */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-slate-700">CheckBox</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="responsive-ad"
                                            checked={selectedAdTypes.rsa}
                                            onCheckedChange={(checked) => {
                                                setSelectedAdTypes({...selectedAdTypes, rsa: checked as boolean});
                                                if (!checked) setAdConfig({...adConfig, rsaCount: 0});
                                                else if (adConfig.rsaCount === 0) setAdConfig({...adConfig, rsaCount: 1});
                                            }}
                                        />
                                        <Label htmlFor="responsive-ad" className="text-sm font-medium text-slate-700 cursor-pointer">
                                            Responsive
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="dki-ads"
                                            checked={selectedAdTypes.dki}
                                            onCheckedChange={(checked) => {
                                                setSelectedAdTypes({...selectedAdTypes, dki: checked as boolean});
                                                if (!checked) setAdConfig({...adConfig, dkiCount: 0});
                                                else if (adConfig.dkiCount === 0) setAdConfig({...adConfig, dkiCount: 1});
                                            }}
                                        />
                                        <Label htmlFor="dki-ads" className="text-sm font-medium text-slate-700 cursor-pointer">
                                            DKI Ads
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="call-ads"
                                            checked={selectedAdTypes.callOnly}
                                            onCheckedChange={(checked) => {
                                                setSelectedAdTypes({...selectedAdTypes, callOnly: checked as boolean});
                                                if (!checked) setAdConfig({...adConfig, callOnlyCount: 0});
                                                else if (adConfig.callOnlyCount === 0) setAdConfig({...adConfig, callOnlyCount: 1});
                                            }}
                                        />
                                        <Label htmlFor="call-ads" className="text-sm font-medium text-slate-700 cursor-pointer">
                                            Call Ads
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mode Selection */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="bg-yellow-400 p-4 border-b border-slate-200">
                            <CardTitle className="text-lg font-bold text-slate-900">
                                Choose Your Mode
                            </CardTitle>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-6 mb-4">
                                <Button
                                    variant={mode === 'single' ? 'default' : 'outline'}
                                    onClick={() => setMode('single')}
                                    className={mode === 'single' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border-slate-300'}
                                >
                                    Single
                                </Button>
                                <Button
                                    variant={mode === 'multiple' ? 'default' : 'outline'}
                                    onClick={() => setMode('multiple')}
                                    className={mode === 'multiple' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border-slate-300'}
                                >
                                    Multiple
                                </Button>
                            </div>
                            
                            {mode === 'single' && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Enter 3-4 Keywords (comma-separated)
                                    </label>
                                    <Textarea
                                        placeholder="airline number, contact airline, delta phone number, customer service"
                                        value={singleKeywords}
                                        onChange={(e) => setSingleKeywords(e.target.value)}
                                        className="min-h-[100px] border-slate-300"
                                    />
                                </div>
                            )}
                            
                            {mode === 'multiple' && (
                                <div className="space-y-4">
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
                            )}
                        </CardContent>
                    </Card>

                    {/* Generate Button */}
                    <Button
                        onClick={generateAds}
                        disabled={isGenerating || (adConfig.rsaCount + adConfig.dkiCount + adConfig.callOnlyCount) > 25}
                        className="w-full theme-button-primary py-7 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    <div className="bg-white p-6 border-b border-slate-300">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900 text-center">
                                    Generated Ads
                                </CardTitle>
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-slate-300">
                                            <Download className="w-4 h-4 mr-1" />
                                            Export
                                            <ChevronDown className="w-3 h-3 ml-1" />
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
                    
                    {/* Statistics & Search/Filter Bar */}
                    {generatedAds.length > 0 && (
                        <div className="px-6 pb-4 space-y-3">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                                    <div className="text-xs text-blue-600 font-medium mb-0.5">Total</div>
                                    <div className="text-lg font-bold text-blue-700">{stats.total}</div>
                                </div>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-center">
                                    <div className="text-xs text-indigo-600 font-medium mb-0.5">RSA</div>
                                    <div className="text-lg font-bold text-indigo-700">{stats.rsa}</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                                    <div className="text-xs text-purple-600 font-medium mb-0.5">DKI</div>
                                    <div className="text-lg font-bold text-purple-700">{stats.dki}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                                    <div className="text-xs text-green-600 font-medium mb-0.5">Call</div>
                                    <div className="text-lg font-bold text-green-700">{stats.callOnly}</div>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                                    <div className="text-xs text-orange-600 font-medium mb-0.5">Selected</div>
                                    <div className="text-lg font-bold text-orange-700">{stats.selected}</div>
                                </div>
                            </div>
                            
                            {/* Search & Filters */}
                            <div className="flex flex-wrap gap-2">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Search ads by headline, description, or group..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <Select value={filterAdType} onValueChange={setFilterAdType}>
                                    <SelectTrigger className="w-[140px] h-9 text-sm">
                                        <SelectValue placeholder="Ad Type" />
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
                                        <SelectTrigger className="w-[140px] h-9 text-sm">
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
                                {(searchQuery || filterAdType !== 'all' || filterGroup !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterAdType('all');
                                            setFilterGroup('all');
                                        }}
                                        className="h-9 text-xs"
                                    >
                                        <X className="w-3 h-3 mr-1" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                    </div>
                    <CardContent className="p-6">
                    {generatedAds.length > 0 && (
                            <div className="mb-4 px-3 py-2 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-indigo-50/50 rounded-lg border border-indigo-200/50 text-center">
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

                        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
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
                                                    <LiveAdPreview 
                                                        ad={previewAd} 
                                                        onRemoveExtension={(extensionId) => handleRemoveExtension(ad.id, extensionId)}
                                                    />

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
                        ) : generatedAds.length > 0 ? (
                            <div className="flex items-center justify-center h-[300px]">
                                <div className="text-center">
                                    <Filter className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-slate-600 font-medium mb-1">No ads match your filters</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterAdType('all');
                                            setFilterGroup('all');
                                        }}
                                        className="mt-2"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
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