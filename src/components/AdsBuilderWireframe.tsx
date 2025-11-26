/**
 * Ads Builder - Wireframe Layout
 * Two-panel layout matching the design pattern from AI Negative Keyword Generator
 */

import React, { useState } from 'react';
import { Sparkles, Globe, Tag, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const AdsBuilderWireframe = () => {
    const [targetUrl, setTargetUrl] = useState('');
    const [coreKeywords, setCoreKeywords] = useState('');
    const [userGoal, setUserGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCount, setGeneratedCount] = useState(0);

    const handleFillInfo = () => {
        setTargetUrl('https://example.com/landing-page');
        setCoreKeywords('plumbing services, emergency plumber, drain cleaning, water heater repair, pipe repair');
        setUserGoal('Leads (High-Intent)');
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate generation
        setTimeout(() => {
            setIsGenerating(false);
            setGeneratedCount(5); // Example count
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        AI Ads Builder
                    </h1>
                    <p className="text-slate-600">
                        Generate high-converting Google Ads with AI optimization
                    </p>
                </div>

                {/* Two-Panel Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel: Configuration */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                        <CardHeader className="relative">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-800 mb-1">
                                        Ad Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        Provide details to guide the AI model
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleFillInfo}
                                    className="shrink-0"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Fill Info
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Target URL Input */}
                            <div className="space-y-2">
                                <Label htmlFor="targetUrl" className="flex items-center gap-2 text-slate-700">
                                    <Globe className="w-4 h-4 text-indigo-600" />
                                    Target URL *
                                </Label>
                                <Input
                                    id="targetUrl"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    placeholder="https://example.com/landing-page"
                                />
                                <p className="text-xs text-slate-500">
                                    AI will analyze this website to understand your business, CTA, and generate relevant ads.
                                </p>
                            </div>

                            {/* Core Keywords Input */}
                            <div className="space-y-2">
                                <Label htmlFor="coreKeywords" className="flex items-center gap-2 text-slate-700">
                                    <Tag className="w-4 h-4 text-indigo-600" />
                                    Core Keywords *
                                </Label>
                                <Textarea
                                    id="coreKeywords"
                                    value={coreKeywords}
                                    onChange={(e) => setCoreKeywords(e.target.value)}
                                    placeholder="plumbing services, emergency plumber, drain cleaning, water heater repair, pipe repair"
                                    rows={3}
                                    className="resize-none"
                                />
                                <p className="text-xs text-slate-500">
                                    Enter the main keywords you are targeting.
                                </p>
                            </div>

                            {/* User Desire / Goal Dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="userGoal" className="flex items-center gap-2 text-slate-700">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    User Desire / Goal *
                                </Label>
                                <Select value={userGoal} onValueChange={setUserGoal}>
                                    <SelectTrigger id="userGoal">
                                        <SelectValue placeholder="Select goal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Leads (High-Intent)">Leads (High-Intent)</SelectItem>
                                        <SelectItem value="Sales (Conversion)">Sales (Conversion)</SelectItem>
                                        <SelectItem value="Awareness (Brand)">Awareness (Brand)</SelectItem>
                                        <SelectItem value="Traffic (Website)">Traffic (Website)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <div className="p-6 border-t border-slate-200">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !targetUrl.trim() || !coreKeywords.trim() || !userGoal}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                size="lg"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating Ads...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate Ads
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {/* Right Panel: Generated Ads */}
                    <Card className="border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-slate-800 mb-1">
                                Generated Ads ({generatedCount} of {generatedCount})
                            </CardTitle>
                            <CardDescription>
                                Results will appear here after generation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {generatedCount === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                        Ready to Generate
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-md">
                                        Fill out the configuration including your website URL. AI will analyze your website to understand your business and generate a comprehensive list of ads.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Generated ads will appear here...
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

