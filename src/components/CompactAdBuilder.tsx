import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit3, Trash2, Save, Clock, Download, Eye, 
    FileText, Phone, Link2, DollarSign, Smartphone, MessageSquare, 
    Building2, Tag, Image as ImageIcon, FileText as FormIcon, MapPin,
    CheckCircle2, X, Search, History
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { LiveAdPreview } from './LiveAdPreview';
import { historyService } from '../utils/historyService';

interface Ad {
    id: number;
    type: 'rsa' | 'dki' | 'callonly';
    [key: string]: any;
}

interface Extension {
    extensionType: string;
    [key: string]: any;
}

interface CompactAdBuilderProps {
    selectedKeywords: string[];
    selectedAdGroup: string;
    onAdGroupChange: (group: string) => void;
    adGroups: string[];
    generatedAds: Ad[];
    extensions: Extension[];
    onCreateAd: (type: string) => void;
    onUpdateAd: (id: number, field: string, value: any) => void;
    onDeleteAd: (id: number) => void;
    onDuplicateAd: (ad: Ad) => void;
    selectedAdIds: number[];
    ALL_AD_GROUPS_VALUE: string;
}

// Extension definitions with icons and colors
const EXTENSION_TYPES = [
    { id: 'snippet', label: 'Structured Snippet', icon: FileText, color: 'bg-orange-500', description: 'Show structured information' },
    { id: 'callout', label: 'Callout', icon: CheckCircle2, color: 'bg-pink-500', description: 'Highlight key features' },
    { id: 'sitelink', label: 'Sitelink', icon: Link2, color: 'bg-cyan-500', description: 'Add multiple links' },
    { id: 'call', label: 'Call Extension', icon: Phone, color: 'bg-teal-500', description: 'Phone number & tracking' },
    { id: 'price', label: 'Price Extension', icon: DollarSign, color: 'bg-yellow-500', description: 'Show pricing info' },
    { id: 'app', label: 'App Extension', icon: Smartphone, color: 'bg-indigo-500', description: 'Link to app stores' },
    { id: 'location', label: 'Location Extension', icon: MapPin, color: 'bg-red-500', description: 'Business locations' },
    { id: 'message', label: 'Message Extension', icon: MessageSquare, color: 'bg-violet-500', description: 'SMS messaging' },
    { id: 'leadform', label: 'Lead Form', icon: FormIcon, color: 'bg-emerald-500', description: 'Lead generation form' },
    { id: 'promotion', label: 'Promotion', icon: Tag, color: 'bg-rose-500', description: 'Special offers & deals' },
    { id: 'image', label: 'Image Extension', icon: ImageIcon, color: 'bg-amber-500', description: 'Rich media images' },
];

const AD_TYPES = [
    { id: 'rsa', label: 'Responsive Search Ad', icon: FileText, color: 'bg-blue-600', description: 'Multiple headlines & descriptions' },
    { id: 'dki', label: 'DKI Text Ad', icon: Search, color: 'bg-purple-600', description: 'Dynamic keyword insertion' },
    { id: 'callonly', label: 'Call Only Ad', icon: Phone, color: 'bg-green-600', description: 'Mobile click-to-call' },
];

export const CompactAdBuilder: React.FC<CompactAdBuilderProps> = ({
    selectedKeywords,
    selectedAdGroup,
    onAdGroupChange,
    adGroups,
    generatedAds,
    extensions,
    onCreateAd,
    onUpdateAd,
    onDeleteAd,
    onDuplicateAd,
    selectedAdIds,
    ALL_AD_GROUPS_VALUE,
}) => {
    const [activeTab, setActiveTab] = useState<'builder' | 'history'>('builder');
    const [selectedPreviewAdId, setSelectedPreviewAdId] = useState<number | null>(null);
    const [editingAdId, setEditingAdId] = useState<number | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [searchHistory, setSearchHistory] = useState('');

    // Filter ads and attach extensions
    const baseAds = generatedAds.filter(ad => ad.type === 'rsa' || ad.type === 'dki' || ad.type === 'callonly');
    const currentGroupAds = selectedAdGroup === ALL_AD_GROUPS_VALUE 
        ? baseAds.filter(ad => selectedAdIds.includes(ad.id))
        : baseAds.filter(ad => ad.adGroup === selectedAdGroup);
    
    const adsWithExtensions = currentGroupAds.map(ad => {
        const adExtensions = extensions.filter(ext => {
            if (selectedAdGroup === ALL_AD_GROUPS_VALUE) {
                return selectedAdIds.includes(ad.id);
            } else {
                return ext.adGroup === ad.adGroup || !ext.adGroup;
            }
        });
        return { ...ad, extensions: adExtensions };
    });

    // Auto-select first ad for preview
    useEffect(() => {
        if (!selectedPreviewAdId && adsWithExtensions.length > 0) {
            setSelectedPreviewAdId(adsWithExtensions[0].id);
        }
    }, [adsWithExtensions.length]);

    const selectedPreviewAd = adsWithExtensions.find(ad => ad.id === selectedPreviewAdId);

    // Load history
    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const loadHistory = async () => {
        try {
            const data = await historyService.getHistory();
            setHistory(data.history || []);
        } catch (error) {
            console.error('Failed to load history', error);
        }
    };

    const exportToCSV = (adData: any) => {
        // Export logic here
        const csvContent = JSON.stringify(adData, null, 2);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ads-${Date.now()}.json`;
        a.click();
    };

    const handleSaveAd = (adId: number) => {
        setEditingAdId(null);
        // Save logic handled by parent
    };

    const filteredHistory = history.filter(item => 
        item.name?.toLowerCase().includes(searchHistory.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchHistory.toLowerCase())
    );

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'builder' | 'history')} className="flex-1 flex flex-col">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                    <TabsTrigger value="builder" className="text-base font-semibold">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Builder
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-base font-semibold">
                        <History className="w-4 h-4 mr-2" />
                        History ({history.length})
                    </TabsTrigger>
                </TabsList>

                {/* Builder Tab */}
                <TabsContent value="builder" className="flex-1 flex flex-col mt-0">
                    <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                        {/* Left Panel - Compact Selection Cards */}
                        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto">
                            {/* Ad Group Selector */}
                            <Card className="p-3">
                                <Select value={selectedAdGroup} onValueChange={onAdGroupChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL_AD_GROUPS_VALUE}>ALL AD GROUPS</SelectItem>
                                        {adGroups.map(group => (
                                            <SelectItem key={group} value={group}>{group}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Card>

                            {/* Ad Types */}
                            <Card className="p-3">
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">Ad Types</h3>
                                <div className="space-y-2">
                                    {AD_TYPES.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => onCreateAd(type.id)}
                                            disabled={selectedKeywords.length === 0}
                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                                                type.color.replace('bg-', 'bg-') + ' text-white border-transparent hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <type.icon className="w-4 h-4" />
                                                <span className="text-xs font-semibold">{type.label}</span>
                                            </div>
                                            <p className="text-xs opacity-90">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>

                            {/* Extensions */}
                            <Card className="p-3">
                                <h3 className="text-sm font-semibold text-slate-700 mb-2">Extensions</h3>
                                <ScrollArea className="h-[400px]">
                                    <div className="space-y-2">
                                        {EXTENSION_TYPES.map(ext => (
                                            <button
                                                key={ext.id}
                                                onClick={() => onCreateAd(ext.id)}
                                                disabled={selectedKeywords.length === 0}
                                                className={`w-full p-2.5 rounded-lg border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    ext.color.replace('bg-', 'bg-') + ' text-white border-transparent hover:shadow-md'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ext.icon className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-semibold">{ext.label}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </Card>
                        </div>

                        {/* Middle Panel - Ad List */}
                        <div className="col-span-4 flex flex-col gap-2 overflow-y-auto">
                            <Card className="p-3 sticky top-0 z-10 bg-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        Your Ads ({adsWithExtensions.length})
                                    </h3>
                                </div>
                            </Card>
                            
                            {adsWithExtensions.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">No ads yet. Create one from the left panel.</p>
                                </Card>
                            ) : (
                                <div className="space-y-2">
                                    {adsWithExtensions.map(ad => (
                                        <Card 
                                            key={ad.id}
                                            className={`p-3 cursor-pointer transition-all ${
                                                selectedPreviewAdId === ad.id 
                                                    ? 'ring-2 ring-indigo-500 border-indigo-500' 
                                                    : 'hover:shadow-md'
                                            }`}
                                            onClick={() => setSelectedPreviewAdId(ad.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Badge className="mb-1 text-xs">
                                                        {ad.type?.toUpperCase() || 'AD'}
                                                    </Badge>
                                                    <p className="text-sm font-medium text-slate-800 line-clamp-2">
                                                        {ad.headline1 || ad.type || 'Ad'}
                                                    </p>
                                                    {ad.extensions && ad.extensions.length > 0 && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            +{ad.extensions.length} extension(s)
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 ml-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingAdId(editingAdId === ad.id ? null : ad.id);
                                                        }}
                                                        className="h-7 w-7 p-0"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteAd(ad.id);
                                                        }}
                                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Live Preview */}
                        <div className="col-span-5 flex flex-col">
                            <Card className="p-4 flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Live Preview
                                    </h3>
                                    {selectedPreviewAd && (
                                        <Badge variant="outline">Ad #{selectedPreviewAd.id}</Badge>
                                    )}
                                </div>
                                
                                <ScrollArea className="flex-1">
                                    {selectedPreviewAd ? (
                                        <div className="space-y-4">
                                            <LiveAdPreview ad={selectedPreviewAd} />
                                            
                                            {editingAdId === selectedPreviewAd.id && (
                                                <Card className="p-4 border-2 border-indigo-300 bg-indigo-50">
                                                    <h4 className="font-semibold mb-3">Edit Ad</h4>
                                                    {/* Edit form would go here */}
                                                    <div className="flex gap-2">
                                                        <Button onClick={() => handleSaveAd(selectedPreviewAd.id)} size="sm">
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Save
                                                        </Button>
                                                        <Button 
                                                            onClick={() => setEditingAdId(null)} 
                                                            variant="outline" 
                                                            size="sm"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </Card>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                            <Eye className="w-16 h-16 mb-4 opacity-20" />
                                            <p>Select an ad to preview</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="flex-1 flex flex-col mt-0">
                    <Card className="flex-1 flex flex-col p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Ads History</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search history..."
                                    value={searchHistory}
                                    onChange={(e) => setSearchHistory(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        
                        <ScrollArea className="flex-1">
                            {filteredHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <History className="w-16 h-16 mb-4 opacity-20" />
                                    <p>No history found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredHistory.map((item) => (
                                        <Card key={item.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{item.name || 'Untitled'}</h4>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => exportToCSV(item.data)}
                                                    variant="outline"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Export
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

