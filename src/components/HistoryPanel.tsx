import React, { useState, useEffect } from 'react';
import { 
    History, Clock, ArrowRight, Trash2, RotateCcw, FileText, 
    Search, Filter, Calendar
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { historyService } from '../utils/historyService';

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
            setHistory(history.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Activity History
                    </h1>
                    <p className="text-slate-500 mt-1">View, restore, or manage your past campaigns and keyword lists.</p>
                </div>
            </div>

            <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5 bg-slate-100/80">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="campaign">Campaigns</TabsTrigger>
                                <TabsTrigger value="keyword-planner">Planning</TabsTrigger>
                                <TabsTrigger value="keyword-mixer">Mixer</TabsTrigger>
                                <TabsTrigger value="negative-keywords">Negatives</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Search history..." 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredHistory.length > 0 ? (
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {filteredHistory.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800">{item.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {getTypeLabel(item.type)}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleDelete(item.id)}
                                                className="text-slate-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => onLoadItem(item.type, item.data)}
                                                className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
                                            >
                                                Restore <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <History className="w-12 h-12 mb-4 opacity-20" />
                            <p>No history found.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};