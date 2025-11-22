// New Step 3 rendering code
export const renderStep3New = (
    generatedAds: any[],
    setGeneratedAds: (ads: any[]) => void,
    selectedAdGroup: string,
    setSelectedAdGroup: (group: string) => void,
    editingAd: any | null,
    setEditingAd: (ad: any | null) => void,
    showAdDialog: boolean,
    setShowAdDialog: (show: boolean) => void,
    handleNextStep: () => void,
    setStep: (step: number) => void
) => {
    const adGroups = ['Refrigerators', 'Ovens', 'Microwaves'];
    
    const handleEdit = (ad: any) => {
        setEditingAd(ad);
        setShowAdDialog(true);
    };
    
    const handleDuplicate = (ad: any) => {
        const newAd = { ...ad, id: Date.now() };
        setGeneratedAds([...generatedAds, newAd]);
    };
    
    const handleDelete = (adId: number) => {
        setGeneratedAds(generatedAds.filter(a => a.id !== adId));
    };
    
    const handleSaveEdit = () => {
        if (editingAd) {
            setGeneratedAds(generatedAds.map(a => a.id === editingAd.id ? editingAd : a));
            setShowAdDialog(false);
            setEditingAd(null);
        }
    };
    
    return `
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Ad Group Selector */}
                    <div className="bg-slate-100 p-4 rounded-lg">
                        <Select value={selectedAdGroup} onValueChange={setSelectedAdGroup}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {adGroups.map(group => (
                                    <SelectItem key={group} value={group}>{group}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-600 mb-4">
                            You can preview different ad groups, however changing ads here will change all ad groups. 
                            In the next section you can edit ads individually for each ad group.
                        </p>
                    </div>
                    
                    {/* Create Ad Buttons */}
                    <div className="space-y-3">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6">
                            <Plus className="mr-2 w-5 h-5" /> EXP. TEXT AD
                        </Button>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6">
                            <Plus className="mr-2 w-5 h-5" /> CALL ONLY AD
                        </Button>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start py-6">
                            <Plus className="mr-2 w-5 h-5" /> RESP. SEARCH AD
                        </Button>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6">
                            <Plus className="mr-2 w-5 h-5" /> SNIPPET EXTENSION
                        </Button>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start py-6">
                            <Plus className="mr-2 w-5 h-5" /> CALLOUT EXTENSION
                        </Button>
                    </div>
                </div>
                
                {/* Right Panel - Ad Cards */}
                <div className="lg:col-span-2 space-y-4">
                    {generatedAds.map(ad => (
                        <AdCard
                            key={ad.id}
                            headline={ad.headline}
                            displayUrl={ad.displayUrl}
                            description={ad.description}
                            extension={ad.extension}
                            onEdit={() => handleEdit(ad)}
                            onDuplicate={() => handleDuplicate(ad)}
                            onDelete={() => handleDelete(ad.id)}
                        />
                    ))}
                    
                    {generatedAds.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <p className="text-sm text-slate-600">
                                <strong>Types:</strong> Refrigerators, Ovens, Microwaves
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button 
                    size="lg" 
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                >
                    Next Step <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    `;
};
