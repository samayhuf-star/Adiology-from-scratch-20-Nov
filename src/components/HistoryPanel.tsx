import React, { useState, useEffect } from 'react';
import { 
    History, Clock, ArrowRight, Trash2, RotateCcw, FileText, 
    Search, Filter, Calendar, AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { historyService } from '../utils/historyService';
import { notifications } from '../utils/notifications';

interface HistoryItem {
    id: string;
    type: string;
    name: string;
    timestamp: string;
    data: any;
}

interface HistoryPanelProps {
    onLoadItem: (type: string, data: any) => void;
}

export const HistoryPanel = ({ onLoadItem }: HistoryPanelProps) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setError(null);
            try {
                const data = await historyService.getHistory();
                if (data.history) {
                    setHistory(data.history);
                }
            } catch (apiError) {
                // Fallback to localStorage if API fails
                console.log('ℹ️ Loading history from local storage (API unavailable)');
                // Use the unified localStorage history service
                const localHistory = await historyService.getAll();
                // Sort by timestamp
                localHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setHistory(localHistory);
            }
        } catch (error) {
            console.error("Failed to load history", error);
            setError(error instanceof Error ? error.message : "Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await historyService.deleteHistory(id);
            const deletedItem = history.find(item => item.id === id);
            setHistory(history.filter(item => item.id !== id));
            
            // Show success notification
            notifications.success('History item deleted successfully', {
                title: 'Deleted',
                description: deletedItem ? `"${deletedItem.name}" has been removed from your history.` : 'Item has been removed from your history.'
            });
        } catch (error) {
            console.error("Failed to delete", error);
            notifications.error('Failed to delete history item', {
                title: 'Error',
                description: error instanceof Error ? error.message : 'An error occurred while deleting the item.'
            });
        }
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(filter.toLowerCase());
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        return matchesSearch && matchesTab;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'campaign': return <FileText className="w-4 h-4 text-blue-500" />;
            case 'keyword-planner': return <Search className="w-4 h-4 text-green-500" />;
            case 'keyword-mixer': return <RotateCcw className="w-4 h-4 text-orange-500" />;
            case 'negative-keywords': return <Filter className="w-4 h-4 text-red-500" />;
            default: return <History className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'campaign': return 'Campaign';
            case 'keyword-planner': return 'Keyword Plan';
            case 'keyword-mixer': return 'Mixed Keywords';
            case 'negative-keywords': return 'Negative List';
            default: return 'Item';
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Activity History
                </h1>
                <p className="text-slate-600">View, restore, or manage your past campaigns and keyword lists.</p>
            </div>

            {/* Filters and Search */}
            <Card className="border-slate-200 bg-white shadow-xl mb-6">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                        {/* Tabs */}
                        <Tabs defaultValue="all" className="flex-1" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5 bg-slate-100 h-10">
                                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                                <TabsTrigger value="campaign" className="text-xs sm:text-sm">Campaigns</TabsTrigger>
                                <TabsTrigger value="keyword-planner" className="text-xs sm:text-sm">Planning</TabsTrigger>
                                <TabsTrigger value="keyword-mixer" className="text-xs sm:text-sm">Mixer</TabsTrigger>
                                <TabsTrigger value="negative-keywords" className="text-xs sm:text-sm">Negatives</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        
                        {/* Search */}
                        <div className="relative w-full lg:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Search history..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-10 bg-white border-slate-200 h-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            <Card className="border-slate-200 bg-white shadow-xl">
                <CardContent className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-slate-500">Loading history...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-500">
                            <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-semibold mb-2">Failed to load history</p>
                            <p className="text-sm text-slate-500">{error}</p>
                            <Button 
                                onClick={fetchHistory} 
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : filteredHistory.length > 0 ? (
                        <div className="space-y-3">
                            {filteredHistory.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all gap-4"
                                >
                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="p-2.5 sm:p-3 bg-white rounded-lg group-hover:bg-indigo-50 transition-colors shadow-sm flex-shrink-0">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 mb-1 truncate">{item.name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <Badge variant="secondary" className="text-xs">
                                                    {getTypeLabel(item.type)}
                                                </Badge>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                </span>
                                                <span className="hidden sm:inline text-xs text-slate-400">
                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start flex-shrink-0">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            size="sm"
                                            onClick={() => onLoadItem(item.type, item.data)}
                                            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                                        >
                                            Restore <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <History className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No history found</h3>
                            <p className="text-sm text-slate-500 text-center max-w-sm">
                                {filter ? `No items match "${filter}"` : 'Your activity history will appear here once you create campaigns or keyword lists.'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};