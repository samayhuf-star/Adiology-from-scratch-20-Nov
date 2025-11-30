import React, { useState, useEffect } from 'react';
import { 
  Layout, Eye, Edit, Download, Globe, 
  ExternalLink, Loader2, Search, Filter, Star, Code, Smartphone, Monitor
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { notifications } from '../utils/notifications';

// Top 25 templates from the GitHub repo
const TOP_TEMPLATES = [
  { id: '3-col-portfolio', name: '3 Column Portfolio', category: 'Portfolio', description: 'Clean three-column portfolio layout', preview: 'https://learning-zone.github.io/website-templates/3-col-portfolio/' },
  { id: 'above-educational-bootstrap-responsive-template', name: 'Above Educational', category: 'Education', description: 'Bootstrap responsive educational template', preview: 'https://learning-zone.github.io/website-templates/above-educational-bootstrap-responsive-template/' },
  { id: 'ace-responsive-coming-soon-template', name: 'Ace Coming Soon', category: 'Coming Soon', description: 'Responsive coming soon page template', preview: 'https://learning-zone.github.io/website-templates/ace-responsive-coming-soon-template/' },
  { id: 'add-life-health-fitness-free-bootstrap-html5-template', name: 'Add Life Health', category: 'Health & Fitness', description: 'Health and fitness bootstrap template', preview: 'https://learning-zone.github.io/website-templates/add-life-health-fitness-free-bootstrap-html5-template/' },
  { id: 'aerosky-real-estate-html-responsive-website-template', name: 'Aerosky Real Estate', category: 'Real Estate', description: 'Real estate responsive website template', preview: 'https://learning-zone.github.io/website-templates/aerosky-real-estate-html-responsive-website-template/' },
  { id: 'agile-agency-free-bootstrap-web-template', name: 'Agile Agency', category: 'Agency', description: 'Free bootstrap agency web template', preview: 'https://learning-zone.github.io/website-templates/agile-agency-free-bootstrap-web-template/' },
  { id: 'alive-responsive-coming-soon-template', name: 'Alive Coming Soon', category: 'Coming Soon', description: 'Responsive coming soon template', preview: 'https://learning-zone.github.io/website-templates/alive-responsive-coming-soon-template/' },
  { id: 'amaze-photography-bootstrap-html5-template', name: 'Amaze Photography', category: 'Photography', description: 'Photography bootstrap HTML5 template', preview: 'https://learning-zone.github.io/website-templates/amaze-photography-bootstrap-html5-template/' },
  { id: 'aroma-beauty-and-spa-responsive-bootstrap-template', name: 'Aroma Beauty & Spa', category: 'Beauty', description: 'Beauty and spa responsive template', preview: 'https://learning-zone.github.io/website-templates/aroma-beauty-and-spa-responsive-bootstrap-template/' },
  { id: 'atlanta-free-business-bootstrap-template', name: 'Atlanta Business', category: 'Business', description: 'Free business bootstrap template', preview: 'https://learning-zone.github.io/website-templates/atlanta-free-business-bootstrap-template/' },
  { id: 'bizpro-business-html5-responsive-web-template', name: 'BizPro Business', category: 'Business', description: 'Business HTML5 responsive template', preview: 'https://learning-zone.github.io/website-templates/bizpro-business-html5-responsive-web-template/' },
  { id: 'boots-business-free-bootstrap-responsive-web-template', name: 'Boots Business', category: 'Business', description: 'Business bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/boots-business-free-bootstrap-responsive-web-template/' },
  { id: 'bootstrap-agency-free-responsive-web-template', name: 'Bootstrap Agency', category: 'Agency', description: 'Agency free responsive template', preview: 'https://learning-zone.github.io/website-templates/bootstrap-agency-free-responsive-web-template/' },
  { id: 'bootstrap-business-corporate-free-responsive-web-template', name: 'Bootstrap Corporate', category: 'Corporate', description: 'Corporate free responsive template', preview: 'https://learning-zone.github.io/website-templates/bootstrap-business-corporate-free-responsive-web-template/' },
  { id: 'bootstrap-restaurant-free-responsive-web-template', name: 'Bootstrap Restaurant', category: 'Restaurant', description: 'Restaurant free responsive template', preview: 'https://learning-zone.github.io/website-templates/bootstrap-restaurant-free-responsive-web-template/' },
  { id: 'business-corporate-free-bootstrap-responsive-web-template', name: 'Business Corporate', category: 'Corporate', description: 'Corporate bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/business-corporate-free-bootstrap-responsive-web-template/' },
  { id: 'clean-blog-free-bootstrap-responsive-web-template', name: 'Clean Blog', category: 'Blog', description: 'Clean blog bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/clean-blog-free-bootstrap-responsive-web-template/' },
  { id: 'corporate-business-free-bootstrap-responsive-web-template', name: 'Corporate Business', category: 'Business', description: 'Corporate business bootstrap template', preview: 'https://learning-zone.github.io/website-templates/corporate-business-free-bootstrap-responsive-web-template/' },
  { id: 'creative-agency-free-bootstrap-responsive-web-template', name: 'Creative Agency', category: 'Agency', description: 'Creative agency bootstrap template', preview: 'https://learning-zone.github.io/website-templates/creative-agency-free-bootstrap-responsive-web-template/' },
  { id: 'ecommerce-free-bootstrap-responsive-web-template', name: 'Ecommerce', category: 'Ecommerce', description: 'Ecommerce bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/ecommerce-free-bootstrap-responsive-web-template/' },
  { id: 'education-free-bootstrap-responsive-web-template', name: 'Education', category: 'Education', description: 'Education bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/education-free-bootstrap-responsive-web-template/' },
  { id: 'fitness-free-bootstrap-responsive-web-template', name: 'Fitness', category: 'Health & Fitness', description: 'Fitness bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/fitness-free-bootstrap-responsive-web-template/' },
  { id: 'freelancer-free-bootstrap-responsive-web-template', name: 'Freelancer', category: 'Portfolio', description: 'Freelancer bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/freelancer-free-bootstrap-responsive-web-template/' },
  { id: 'hotel-free-bootstrap-responsive-web-template', name: 'Hotel', category: 'Hospitality', description: 'Hotel bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/hotel-free-bootstrap-responsive-web-template/' },
  { id: 'medical-free-bootstrap-responsive-web-template', name: 'Medical', category: 'Medical', description: 'Medical bootstrap responsive template', preview: 'https://learning-zone.github.io/website-templates/medical-free-bootstrap-responsive-web-template/' },
];

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
}

export const WebTemplates2: React.FC = () => {
  const [templates] = useState<Template[]>(TOP_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleDownload = async (template: Template) => {
    try {
      setLoading(true);
      // Fetch template from GitHub repo
      const repoUrl = `https://raw.githubusercontent.com/samayhuf-star/website-templates/master/${template.id}/index.html`;
      
      const response = await fetch(repoUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      
      const html = await response.text();
      
      // Create blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      notifications.success('Template downloaded successfully', {
        title: 'Download Complete'
      });
    } catch (error: any) {
      console.error('Download error:', error);
      notifications.error('Failed to download template. You can view it online instead.', {
        title: 'Download Failed'
      });
      // Open preview in new tab as fallback
      window.open(template.preview, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Web Templates 2.0
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Top 25 open-source HTML5 templates from GitHub
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {template.category}
                  </Badge>
                </div>
                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4 line-clamp-2">
                {template.description}
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 min-w-[100px] text-xs"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  className="flex-1 min-w-[100px] text-xs theme-button-primary"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-2 text-xs"
                onClick={() => handleDownload(template)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1" />
                )}
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No templates found matching your search.</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">{selectedTemplate?.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedTemplate && window.open(selectedTemplate.preview, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Full
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={selectedTemplate?.preview}
              className={`w-full h-full border-0 ${
                previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : ''
              }`}
              title={selectedTemplate?.name}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Edit: {selectedTemplate?.name}</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">Visual editor for {selectedTemplate?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedTemplate && window.open(selectedTemplate.preview, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Source
                </Button>
              </div>
            </div>
          </DialogHeader>
          <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
              <div className="h-full overflow-auto px-6 pb-6">
                <div className={`bg-white shadow-xl rounded-lg overflow-hidden mx-auto ${
                  previewMode === 'mobile' ? 'max-w-[375px]' : 'w-full'
                }`}>
                  <iframe
                    src={selectedTemplate?.preview}
                    className="w-full border-0"
                    style={{ minHeight: '600px' }}
                    title={`Edit ${selectedTemplate?.name}`}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="code" className="flex-1 overflow-hidden mt-4">
              <ScrollArea className="h-full px-6 pb-6">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="mb-4 text-slate-400 text-xs">
                    Loading source code from GitHub...
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedTemplate) {
                        const repoUrl = `https://github.com/samayhuf-star/website-templates/tree/master/${selectedTemplate.id}`;
                        window.open(repoUrl, '_blank');
                      }
                    }}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="px-6 pb-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  handleDownload(selectedTemplate);
                }
              }}
              className="theme-button-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

