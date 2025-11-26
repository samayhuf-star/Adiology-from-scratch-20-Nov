import React, { useState, useEffect } from 'react';
import { 
  Layout, Eye, Edit, Copy, Save, Download, Globe, 
  CheckCircle, AlertCircle, Palette, Type, Image as ImageIcon,
  Settings, Code, Smartphone, Monitor, X, Plus, Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { notifications } from '../utils/notifications';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  sections: TemplateSection[];
}

interface TemplateSection {
  id: string;
  type: 'hero' | 'features' | 'services' | 'testimonials' | 'cta' | 'footer' | 'privacy' | 'terms';
  title: string;
  content: any;
  styles?: any;
}

interface SavedTemplate {
  id: string;
  name: string;
  originalTemplateId: string;
  customizedSections: TemplateSection[];
  createdAt: string;
  updatedAt: string;
}

const defaultTemplate: Template = {
  id: 'template-1',
  name: 'Professional Service Landing Page',
  description: 'Complete single-page website with all Google Ads required policies',
  thumbnail: '🏢',
  category: 'Business',
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      title: 'Hero Section',
      content: {
        heading: 'Professional Services You Can Trust',
        subheading: 'Expert solutions for your business needs with 24/7 support',
        ctaText: 'Get Started Today',
        ctaPhone: '1-800-123-4567',
        backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop',
      }
    },
    {
      id: 'features-1',
      type: 'features',
      title: 'Features Section',
      content: {
        heading: 'Why Choose Us',
        features: [
          {
            icon: '⚡',
            title: 'Fast Response',
            description: 'Quick turnaround time for all service requests'
          },
          {
            icon: '🎯',
            title: 'Expert Team',
            description: 'Certified professionals with years of experience'
          },
          {
            icon: '💯',
            title: 'Quality Guaranteed',
            description: '100% satisfaction guarantee on all services'
          },
          {
            icon: '🔒',
            title: 'Secure & Safe',
            description: 'Licensed, bonded, and fully insured'
          }
        ]
      }
    },
    {
      id: 'services-1',
      type: 'services',
      title: 'Services Section',
      content: {
        heading: 'Our Services',
        subheading: 'Comprehensive solutions tailored to your needs',
        services: [
          {
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
            title: 'Consultation',
            description: 'Expert consultation to assess your needs and provide tailored solutions',
            price: 'Starting at $99'
          },
          {
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
            title: 'Implementation',
            description: 'Professional implementation of solutions with minimal disruption',
            price: 'Custom Pricing'
          },
          {
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            title: 'Support & Maintenance',
            description: 'Ongoing support and maintenance to ensure optimal performance',
            price: 'From $199/month'
          }
        ]
      }
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      title: 'Testimonials Section',
      content: {
        heading: 'What Our Clients Say',
        testimonials: [
          {
            name: 'John Smith',
            company: 'ABC Corporation',
            rating: 5,
            text: 'Outstanding service! They exceeded our expectations and delivered results quickly.',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
          },
          {
            name: 'Sarah Johnson',
            company: 'XYZ Industries',
            rating: 5,
            text: 'Professional, reliable, and efficient. Highly recommend their services!',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
          },
          {
            name: 'Michael Brown',
            company: 'Tech Solutions Inc',
            rating: 5,
            text: 'Best decision we made for our business. Great team and excellent results.',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
          }
        ]
      }
    },
    {
      id: 'cta-1',
      type: 'cta',
      title: 'Call to Action',
      content: {
        heading: 'Ready to Get Started?',
        subheading: 'Contact us today for a free consultation',
        ctaText: 'Call Now',
        phone: '1-800-123-4567',
        email: 'info@yourcompany.com',
        hours: 'Available 24/7'
      }
    },
    {
      id: 'privacy-1',
      type: 'privacy',
      title: 'Privacy Policy',
      content: {
        lastUpdated: new Date().toISOString().split('T')[0],
        content: `
# Privacy Policy

Last Updated: ${new Date().toISOString().split('T')[0]}

## Introduction
We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.

## Information We Collect
- **Contact Information**: Name, email address, phone number
- **Usage Data**: How you interact with our website
- **Technical Data**: IP address, browser type, device information
- **Communication Data**: Records of your communications with us

## How We Use Your Information
- To provide and improve our services
- To respond to your inquiries and requests
- To send important updates and notifications
- To comply with legal obligations
- To detect and prevent fraud

## Data Security
We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Third-Party Services
We may use third-party services for analytics and advertising:
- Google Analytics for website analytics
- Google Ads for advertising
- Payment processors for secure transactions

## Your Rights
You have the right to:
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your data
- Opt-out of marketing communications
- Lodge a complaint with supervisory authorities

## Cookies
We use cookies to enhance your browsing experience. You can control cookie preferences through your browser settings.

## Data Retention
We retain your personal information only as long as necessary for the purposes outlined in this policy or as required by law.

## Children's Privacy
Our services are not directed to children under 13. We do not knowingly collect information from children.

## Changes to This Policy
We may update this Privacy Policy periodically. We will notify you of significant changes via email or website notice.

## Contact Us
If you have questions about this Privacy Policy, please contact us:
- Email: privacy@yourcompany.com
- Phone: 1-800-123-4567
- Address: 123 Business St, City, State 12345
        `
      }
    },
    {
      id: 'terms-1',
      type: 'terms',
      title: 'Terms of Service',
      content: {
        lastUpdated: new Date().toISOString().split('T')[0],
        content: `
# Terms of Service

Last Updated: ${new Date().toISOString().split('T')[0]}

## Agreement to Terms
By accessing or using our services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.

## Service Description
We provide professional services as described on our website. Service details, pricing, and availability are subject to change without notice.

## User Obligations
You agree to:
- Provide accurate and complete information
- Maintain the confidentiality of your account
- Use our services in compliance with applicable laws
- Not engage in fraudulent or harmful activities
- Not misuse or abuse our services

## Payment Terms
- All prices are in USD unless otherwise stated
- Payment is due upon completion of services or as agreed
- We accept major credit cards and other payment methods
- Refunds are handled on a case-by-case basis

## Service Guarantee
We stand behind our services with a satisfaction guarantee. If you're not satisfied, contact us within 30 days for resolution.

## Limitation of Liability
To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.

## Intellectual Property
All content on this website, including text, graphics, logos, and software, is our property and protected by copyright and trademark laws.

## Disclaimer of Warranties
Our services are provided "as is" without warranties of any kind, either express or implied. We do not warrant that services will be uninterrupted or error-free.

## Indemnification
You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of our services or violation of these terms.

## Termination
We reserve the right to terminate or suspend access to our services immediately, without prior notice, for any violation of these Terms.

## Governing Law
These Terms are governed by the laws of [Your State/Country], without regard to conflict of law principles.

## Dispute Resolution
Any disputes arising from these Terms will be resolved through binding arbitration in accordance with [Arbitration Rules].

## Severability
If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.

## Entire Agreement
These Terms constitute the entire agreement between you and us regarding our services.

## Contact Information
For questions about these Terms, contact us:
- Email: legal@yourcompany.com
- Phone: 1-800-123-4567
- Address: 123 Business St, City, State 12345
        `
      }
    },
    {
      id: 'footer-1',
      type: 'footer',
      title: 'Footer',
      content: {
        companyName: 'Your Company Name',
        tagline: 'Professional Services You Can Trust',
        address: '123 Business Street, City, State 12345',
        phone: '1-800-123-4567',
        email: 'info@yourcompany.com',
        socialLinks: {
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          linkedin: 'https://linkedin.com',
          instagram: 'https://instagram.com'
        },
        links: [
          { text: 'Privacy Policy', href: '#privacy' },
          { text: 'Terms of Service', href: '#terms' },
          { text: 'Contact Us', href: '#contact' },
          { text: 'About Us', href: '#about' }
        ],
        copyright: `© ${new Date().getFullYear()} Your Company Name. All rights reserved.`
      }
    }
  ]
};

export const WebsiteTemplates: React.FC = () => {
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState<string>('hero-1');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = () => {
    try {
      const saved = localStorage.getItem('website_templates');
      if (saved) {
        setSavedTemplates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved templates', error);
    }
  };

  const handleEditTemplate = (template?: SavedTemplate) => {
    if (template) {
      setEditingTemplate(template);
    } else {
      // Create new template from default
      const newTemplate: SavedTemplate = {
        id: `template-${Date.now()}`,
        name: 'Untitled Template',
        originalTemplateId: defaultTemplate.id,
        customizedSections: JSON.parse(JSON.stringify(defaultTemplate.sections)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setEditingTemplate(newTemplate);
    }
    setShowEditor(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;

    if (!templateName.trim()) {
      notifications.error('Please enter a template name', { title: 'Name Required' });
      return;
    }

    const updatedTemplate = {
      ...editingTemplate,
      name: templateName,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = savedTemplates.findIndex(t => t.id === updatedTemplate.id);
    let updatedTemplates;

    if (existingIndex >= 0) {
      updatedTemplates = [...savedTemplates];
      updatedTemplates[existingIndex] = updatedTemplate;
    } else {
      updatedTemplates = [...savedTemplates, updatedTemplate];
    }

    setSavedTemplates(updatedTemplates);
    localStorage.setItem('website_templates', JSON.stringify(updatedTemplates));

    notifications.success('Template saved successfully!', { title: 'Saved' });
    setShowSaveDialog(false);
    setTemplateName('');
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem('website_templates', JSON.stringify(updated));
    notifications.success('Template deleted', { title: 'Deleted' });
  };

  const handleExportHTML = (template: SavedTemplate) => {
    const html = generateHTMLFromTemplate(template);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.success('Template exported successfully!', { title: 'Exported' });
  };

  const generateHTMLFromTemplate = (template: SavedTemplate): string => {
    // Generate complete HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .section { padding: 80px 0; }
        /* Add more styles based on sections */
    </style>
</head>
<body>
    ${template.customizedSections.map(section => renderSectionHTML(section)).join('\n')}
</body>
</html>`;
  };

  const renderSectionHTML = (section: TemplateSection): string => {
    // Render each section type to HTML
    return `<section id="${section.id}" class="section section-${section.type}">
        <!-- Section content here -->
    </section>`;
  };

  const updateSectionContent = (sectionId: string, field: string, value: any) => {
    if (!editingTemplate) return;

    const updatedSections = editingTemplate.customizedSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: {
            ...section.content,
            [field]: value
          }
        };
      }
      return section;
    });

    setEditingTemplate({
      ...editingTemplate,
      customizedSections: updatedSections
    });
  };

  if (showEditor && editingTemplate) {
    return <TemplateEditor 
      template={editingTemplate}
      onClose={() => {
        setShowEditor(false);
        setEditingTemplate(null);
      }}
      onSave={() => {
        setTemplateName(editingTemplate.name);
        setShowSaveDialog(true);
      }}
      onUpdate={setEditingTemplate}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      updateSectionContent={updateSectionContent}
    />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Website Templates
            </h1>
            <p className="text-slate-600">
              Professional landing page templates with Google Ads compliance
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Available Templates</TabsTrigger>
          <TabsTrigger value="saved">My Templates ({savedTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card className="p-8 hover:shadow-xl transition-all">
            <div className="flex items-start gap-6">
              <div className="text-6xl">{defaultTemplate.thumbnail}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {defaultTemplate.name}
                    </h3>
                    <p className="text-slate-600 mb-4">{defaultTemplate.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Single Page</Badge>
                      <Badge variant="secondary">Google Ads Ready</Badge>
                      <Badge variant="secondary">Mobile Responsive</Badge>
                      <Badge variant="secondary">Privacy Policy</Badge>
                      <Badge variant="secondary">Terms of Service</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  {defaultTemplate.sections.slice(0, 8).map(section => (
                    <div key={section.id} className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl mb-1">
                        {section.type === 'hero' && '🎯'}
                        {section.type === 'features' && '⭐'}
                        {section.type === 'services' && '🛠️'}
                        {section.type === 'testimonials' && '💬'}
                        {section.type === 'cta' && '📞'}
                        {section.type === 'privacy' && '🔒'}
                        {section.type === 'terms' && '📋'}
                        {section.type === 'footer' && '📍'}
                      </div>
                      <p className="text-xs font-medium text-slate-600">{section.title}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleEditTemplate()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Template
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {savedTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <Layout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No saved templates yet</h3>
              <p className="text-slate-500 mb-6">Create your first template by editing the default template</p>
              <Button onClick={() => handleEditTemplate()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTemplates.map(template => (
                <Card key={template.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{template.name}</h3>
                    <p className="text-xs text-slate-500">
                      Updated: {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {template.customizedSections.length} sections
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExportHTML(template)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Template Editor Component
const TemplateEditor: React.FC<{
  template: SavedTemplate;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (template: SavedTemplate) => void;
  previewMode: 'desktop' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  activeSection: string;
  setActiveSection: (id: string) => void;
  updateSectionContent: (sectionId: string, field: string, value: any) => void;
}> = ({ 
  template, 
  onClose, 
  onSave, 
  onUpdate, 
  previewMode, 
  setPreviewMode,
  activeSection,
  setActiveSection,
  updateSectionContent
}) => {
  const currentSection = template.customizedSections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col">
      {/* Editor Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <h2 className="text-lg font-semibold text-slate-800">{template.name}</h2>
        </div>

        <div className="flex items-center gap-3">
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
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sections Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Sections</h3>
            <div className="space-y-1">
              {template.customizedSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Properties</h3>
            {currentSection && (
              <SectionEditor
                section={currentSection}
                onUpdate={(field, value) => updateSectionContent(currentSection.id, field, value)}
              />
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className={`mx-auto bg-white shadow-xl ${
            previewMode === 'mobile' ? 'max-w-sm' : 'max-w-6xl'
          }`}>
            <TemplatePreview template={template} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Editor Component
const SectionEditor: React.FC<{
  section: TemplateSection;
  onUpdate: (field: string, value: any) => void;
}> = ({ section, onUpdate }) => {
  const renderFieldEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Heading</Label>
              <Input
                value={section.content.heading}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={section.content.subheading}
                onChange={(e) => onUpdate('subheading', e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input
                value={section.content.ctaText}
                onChange={(e) => onUpdate('ctaText', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={section.content.ctaPhone}
                onChange={(e) => onUpdate('ctaPhone', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Background Image URL</Label>
              <Input
                value={section.content.backgroundImage}
                onChange={(e) => onUpdate('backgroundImage', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );
      // Add more section type editors
      default:
        return (
          <div className="text-sm text-slate-500">
            Select a section to edit its properties
          </div>
        );
    }
  };

  return <div>{renderFieldEditor()}</div>;
};

// Template Preview Component
const TemplatePreview: React.FC<{ template: SavedTemplate }> = ({ template }) => {
  return (
    <div className="template-preview">
      {template.customizedSections.map(section => (
        <div key={section.id} id={section.id} className="section-preview">
          {renderSectionPreview(section)}
        </div>
      ))}
    </div>
  );
};

const renderSectionPreview = (section: TemplateSection) => {
  switch (section.type) {
    case 'hero':
      return (
        <div 
          className="relative h-[600px] flex items-center justify-center text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${section.content.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="text-center px-6">
            <h1 className="text-5xl font-bold mb-4">{section.content.heading}</h1>
            <p className="text-xl mb-8">{section.content.subheading}</p>
            <div className="flex gap-4 justify-center">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold">
                {section.content.ctaText}
              </button>
              <button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-lg font-semibold">
                📞 {section.content.ctaPhone}
              </button>
            </div>
          </div>
        </div>
      );
    
    case 'features':
      return (
        <div className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">{section.content.heading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {section.content.features.map((feature: any, idx: number) => (
                <div key={idx} className="text-center">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    
    // Add more section renderers
    default:
      return <div className="p-8 text-slate-500">Section preview: {section.title}</div>;
  }
};

