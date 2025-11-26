import React, { useState, useEffect } from 'react';
import { 
  Layout, Eye, Edit, Copy, Save, Download, Globe, 
  CheckCircle, AlertCircle, Palette, Type, Image as ImageIcon,
  Settings, Code, Smartphone, Monitor, X, Plus, Trash2, Search, Filter, Rocket, ExternalLink, Loader2
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { notifications } from '../utils/notifications';
import { historyService } from '../utils/historyService';
import { allTemplates as importedTemplates, serviceCategories } from '../data/websiteTemplateLibrary';
import { deployWebsiteToVercel, getDeploymentStatus } from '../utils/vercel';
import { savePublishedWebsite, getUserPublishedWebsites, updatePublishedWebsiteStatus } from '../utils/publishedWebsites';
import { supabase } from '../utils/supabase';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  color?: string;
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
  const [baseTemplates] = useState<Template[]>(importedTemplates as Template[]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState<string>('hero-1');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishWebsiteName, setPublishWebsiteName] = useState('');
  const [vercelToken, setVercelToken] = useState('');

  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = async () => {
    try {
      const saved = await historyService.getByType('website-template');
      const converted = saved.map((item: any) => ({
        id: item.id,
        name: item.name,
        originalTemplateId: item.data?.originalTemplateId || 'unknown',
        customizedSections: item.data?.sections || [],
        createdAt: item.timestamp,
        updatedAt: item.timestamp
      }));
      setSavedTemplates(converted);
    } catch (error) {
      console.error('Failed to load saved templates', error);
    }
  };

  // Filter templates based on category and search
  const filteredTemplates = baseTemplates.filter((template) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Function to ensure template has all required sections
  const completeTemplateSections = (sections: TemplateSection[]): TemplateSection[] => {
    const requiredSections: { [key: string]: TemplateSection } = {};
    
    // Map existing sections
    sections.forEach(section => {
      requiredSections[section.type] = section;
    });
    
    // Add missing sections with default content
    const sectionTypes: Array<'hero' | 'features' | 'services' | 'testimonials' | 'cta' | 'footer' | 'privacy' | 'terms'> = 
      ['hero', 'features', 'services', 'testimonials', 'cta', 'footer', 'privacy', 'terms'];
    
    sectionTypes.forEach(type => {
      if (!requiredSections[type]) {
        // Create default section based on type
        switch (type) {
          case 'hero':
            requiredSections[type] = {
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
            };
            break;
          case 'features':
            requiredSections[type] = {
              id: 'features-1',
              type: 'features',
              title: 'Features Section',
              content: {
                heading: 'Why Choose Us',
                features: [
                  { icon: '⚡', title: 'Fast Response', description: 'Quick turnaround time for all service requests' },
                  { icon: '🎯', title: 'Expert Team', description: 'Certified professionals with years of experience' },
                  { icon: '💯', title: 'Quality Guaranteed', description: '100% satisfaction guarantee on all services' },
                  { icon: '🔒', title: 'Secure & Safe', description: 'Licensed, bonded, and fully insured' }
                ]
              }
            };
            break;
          case 'services':
            requiredSections[type] = {
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
            };
            break;
          case 'testimonials':
            requiredSections[type] = {
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
            };
            break;
          case 'cta':
            requiredSections[type] = {
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
            };
            break;
          case 'footer':
            requiredSections[type] = {
              id: 'footer-1',
              type: 'footer',
              title: 'Footer',
              content: {
                columns: [
                  {
                    title: 'Company',
                    links: [
                      { text: 'About Us', url: '#about' },
                      { text: 'Services', url: '#services' },
                      { text: 'Contact', url: '#contact' }
                    ]
                  },
                  {
                    title: 'Legal',
                    links: [
                      { text: 'Privacy Policy', url: '#privacy' },
                      { text: 'Terms of Service', url: '#terms' }
                    ]
                  }
                ],
                copyright: `© ${new Date().getFullYear()} Your Company. All rights reserved.`
              }
            };
            break;
          case 'privacy':
            requiredSections[type] = {
              id: 'privacy-1',
              type: 'privacy',
              title: 'Privacy Policy',
              content: {
                lastUpdated: new Date().toISOString().split('T')[0],
                content: defaultTemplate.sections.find(s => s.type === 'privacy')?.content.content || ''
              }
            };
            break;
          case 'terms':
            requiredSections[type] = {
              id: 'terms-1',
              type: 'terms',
              title: 'Terms of Service',
              content: {
                lastUpdated: new Date().toISOString().split('T')[0],
                content: defaultTemplate.sections.find(s => s.type === 'terms')?.content.content || ''
              }
            };
            break;
        }
      }
    });
    
    // Return sections in the correct order
    return sectionTypes.map(type => requiredSections[type]);
  };

  const handleEditTemplate = async (template?: SavedTemplate | Template, isBase: boolean = false) => {
    if (template && 'customizedSections' in template) {
      // It's a saved template - ensure it has all sections
      const completedTemplate = {
        ...template,
        customizedSections: completeTemplateSections(template.customizedSections)
      };
      setEditingTemplate(completedTemplate);
    } else if (template && isBase) {
      // Create new template from base template - AUTO-SAVE to saved websites
      const baseTemplate = template as Template;
      const completedSections = completeTemplateSections(JSON.parse(JSON.stringify(baseTemplate.sections)));
      const newTemplate: SavedTemplate = {
        id: `template-${Date.now()}`,
        name: `${baseTemplate.name} (Custom)`,
        originalTemplateId: baseTemplate.id,
        customizedSections: completedSections,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Auto-save to saved templates when user clicks Edit
      try {
        await historyService.save(
          'website-template',
          newTemplate.name,
          {
            originalTemplateId: newTemplate.originalTemplateId,
            sections: newTemplate.customizedSections
          },
          'draft'
        );
        await loadSavedTemplates();
        notifications.success('Template saved to your collection!', { title: 'Saved' });
      } catch (error) {
        console.error('Failed to auto-save template:', error);
        // Continue anyway - user can still edit
      }
      
      setEditingTemplate(newTemplate);
      setTemplateName(newTemplate.name);
    } else {
      // Create new template from first base template
      const firstTemplate = baseTemplates[0];
      const completedSections = completeTemplateSections(JSON.parse(JSON.stringify(firstTemplate.sections)));
      const newTemplate: SavedTemplate = {
        id: `template-${Date.now()}`,
        name: 'Untitled Template',
        originalTemplateId: firstTemplate.id,
        customizedSections: completedSections,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setEditingTemplate(newTemplate);
    }
    setShowEditor(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    if (!templateName.trim()) {
      notifications.error('Please enter a template name', { title: 'Name Required' });
      return;
    }

    try {
      const updatedTemplate = {
        ...editingTemplate,
        name: templateName,
        updatedAt: new Date().toISOString()
      };

      await historyService.save(
        'website-template',
        templateName,
        {
          id: updatedTemplate.id,
          originalTemplateId: updatedTemplate.originalTemplateId,
          sections: updatedTemplate.customizedSections
        },
        'completed'
      );

      await loadSavedTemplates();
      notifications.success('Template saved successfully!', { title: 'Saved' });
      setShowSaveDialog(false);
      setShowEditor(false);
      setTemplateName('');
    } catch (error) {
      console.error('Failed to save template:', error);
      notifications.error('Failed to save template. Please try again.', { title: 'Save Error' });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await historyService.delete(id);
      await loadSavedTemplates();
      notifications.success('Template deleted', { title: 'Deleted' });
    } catch (error) {
      console.error('Failed to delete template:', error);
      notifications.error('Failed to delete template. Please try again.', { title: 'Delete Error' });
    }
  };

  const handleExportHTML = async (template: SavedTemplate) => {
    // Auto-save template to user's saved websites when exported/downloaded
    try {
      await historyService.save(
        'website-template',
        template.name,
        {
          id: template.id,
          originalTemplateId: template.originalTemplateId,
          sections: template.customizedSections,
          exported: true,
          exportedAt: new Date().toISOString()
        },
        'completed'
      );
      // Silent save - don't show notification to avoid interrupting user flow
    } catch (error) {
      console.error('Failed to auto-save exported template:', error);
      // Continue anyway - user can still export
    }

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

  const handlePublishWebsite = async () => {
    if (!editingTemplate || !publishWebsiteName.trim()) {
      notifications.error('Please enter a website name', { title: 'Name Required' });
      return;
    }

    if (!vercelToken.trim()) {
      notifications.error('Please enter your Vercel API token', { title: 'Token Required' });
      return;
    }

    setIsPublishing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to publish websites');
      }

      // Generate HTML from template
      const htmlContent = generateHTMLFromTemplate(editingTemplate);
      
      // Deploy to Vercel
      const deployment = await deployWebsiteToVercel({
        name: publishWebsiteName,
        htmlContent,
        vercelToken: vercelToken.trim(),
      });

      // Save to database
      const publishedWebsite = await savePublishedWebsite(user.id, {
        name: publishWebsiteName,
        template_id: editingTemplate.id,
        template_data: editingTemplate,
        vercel_deployment_id: deployment.id,
        vercel_url: deployment.url,
        vercel_project_id: 'User websites',
        status: deployment.state === 'READY' ? 'ready' : 'deploying',
      });

      // Auto-save template to user's saved websites when published
      try {
        await historyService.save(
          'website-template',
          publishWebsiteName,
          {
            id: editingTemplate.id,
            originalTemplateId: editingTemplate.originalTemplateId,
            sections: editingTemplate.customizedSections,
            published: true,
            publishedAt: new Date().toISOString(),
            vercelUrl: deployment.url,
            vercelDeploymentId: deployment.id
          },
          'completed'
        );
        // Silent save - don't show notification to avoid interrupting user flow
      } catch (error) {
        console.error('Failed to auto-save published template:', error);
        // Continue anyway - website is already published
      }

      // If still deploying, check status after a delay
      if (deployment.state !== 'READY') {
        setTimeout(async () => {
          try {
            const updatedDeployment = await getDeploymentStatus(deployment.id, vercelToken.trim());
            await updatePublishedWebsiteStatus(
              publishedWebsite.id,
              updatedDeployment.state === 'READY' ? 'ready' : 'error',
              updatedDeployment.url
            );
            if (updatedDeployment.state === 'READY') {
              notifications.success(`Website published successfully! Visit: ${updatedDeployment.url}`, {
                title: 'Published!',
                duration: 10000,
              });
            }
          } catch (error) {
            console.error('Failed to check deployment status:', error);
          }
        }, 10000); // Check after 10 seconds
      }

      notifications.success(
        `Website is being deployed! ${deployment.state === 'READY' ? 'Visit: ' + deployment.url : 'We\'ll notify you when it\'s ready.'}`,
        { 
          title: 'Publishing...',
          duration: 10000,
        }
      );

      setShowPublishDialog(false);
      setPublishWebsiteName('');
      setVercelToken('');
    } catch (error: any) {
      console.error('Failed to publish website:', error);
      notifications.error(
        error.message || 'Failed to publish website. Please check your Vercel token and try again.',
        { title: 'Publish Error' }
      );
    } finally {
      setIsPublishing(false);
    }
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
          <TabsTrigger value="templates">Template Library ({filteredTemplates.length})</TabsTrigger>
          <TabsTrigger value="saved">My Templates ({savedTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <Layout className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No templates found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="p-6 hover:shadow-xl transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{template.thumbnail}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                        {template.name}
                      </h3>
                      <Badge variant="secondary" className="mb-2">
                        {template.category}
                      </Badge>
                      <p className="text-sm text-slate-600">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {template.sections.length} sections
                    </Badge>
                    <Badge variant="outline" className="text-xs">Google Ads Ready</Badge>
                    <Badge variant="outline" className="text-xs">Mobile Responsive</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEditTemplate(template, true)}
                      className="flex-1"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
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

      {/* Publish Website Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-600" />
              Publish Website to Vercel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="website-name">Website Name</Label>
              <Input
                id="website-name"
                value={publishWebsiteName}
                onChange={(e) => setPublishWebsiteName(e.target.value)}
                placeholder="My Awesome Website"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be used as the project name in Vercel
              </p>
            </div>
            <div>
              <Label htmlFor="vercel-token">Vercel API Token</Label>
              <Input
                id="vercel-token"
                type="password"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                placeholder="Enter your Vercel API token"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your token from{' '}
                <a 
                  href="https://vercel.com/account/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  vercel.com/account/tokens
                </a>
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your website will be deployed to a project called "User websites" in Vercel. 
                The deployment URL will be shared with you once ready.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPublishDialog(false);
                setPublishWebsiteName('');
                setVercelToken('');
              }}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePublishWebsite}
              disabled={isPublishing || !publishWebsiteName.trim() || !vercelToken.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Publish Website
                </>
              )}
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
          <div className="flex gap-2">
            <Button onClick={onSave} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
            <Button 
              onClick={() => {
                if (!editingTemplate) return;
                setPublishWebsiteName(editingTemplate.name);
                setShowPublishDialog(true);
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Publish Website
            </Button>
          </div>
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
  const updateNestedField = (path: string, value: any) => {
    const keys = path.split('.');
    const newContent = { ...section.content };
    let current: any = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onUpdate('content', newContent);
  };

  const updateArrayItem = (arrayName: string, index: number, field: string, value: any) => {
    const newArray = [...(section.content[arrayName] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    onUpdate(arrayName, newArray);
  };

  const renderFieldEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={section.content.subheading || ''}
                onChange={(e) => onUpdate('subheading', e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input
                value={section.content.ctaText || ''}
                onChange={(e) => onUpdate('ctaText', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={section.content.ctaPhone || ''}
                onChange={(e) => onUpdate('ctaPhone', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Background Image URL</Label>
              <Input
                value={section.content.backgroundImage || ''}
                onChange={(e) => onUpdate('backgroundImage', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="mb-2 block">Features</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {(section.content.features || []).map((feature: any, idx: number) => (
                    <div key={idx} className="border-b pb-4 space-y-2">
                      <Input
                        placeholder="Icon (emoji)"
                        value={feature.icon || ''}
                        onChange={(e) => updateArrayItem('features', idx, 'icon', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Title"
                        value={feature.title || ''}
                        onChange={(e) => updateArrayItem('features', idx, 'title', e.target.value)}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Description"
                        value={feature.description || ''}
                        onChange={(e) => updateArrayItem('features', idx, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 'services':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={section.content.subheading || ''}
                onChange={(e) => onUpdate('subheading', e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label className="mb-2 block">Services</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {(section.content.services || []).map((service: any, idx: number) => (
                    <div key={idx} className="border-b pb-4 space-y-2">
                      <Input
                        placeholder="Image URL"
                        value={service.image || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'image', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Service Title"
                        value={service.title || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'title', e.target.value)}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Description"
                        value={service.description || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'description', e.target.value)}
                        rows={2}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Price (e.g., Starting at $99)"
                        value={service.price || ''}
                        onChange={(e) => updateArrayItem('services', idx, 'price', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <Label>Section Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="mb-2 block">Testimonials</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {(section.content.testimonials || []).map((testimonial: any, idx: number) => (
                    <div key={idx} className="border-b pb-4 space-y-2">
                      <Input
                        placeholder="Name"
                        value={testimonial.name || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'name', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Company"
                        value={testimonial.company || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'company', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Avatar URL"
                        value={testimonial.avatar || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'avatar', e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        placeholder="Rating (1-5)"
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'rating', parseInt(e.target.value))}
                        className="mb-2"
                      />
                      <Textarea
                        placeholder="Testimonial Text"
                        value={testimonial.text || ''}
                        onChange={(e) => updateArrayItem('testimonials', idx, 'text', e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <Label>Heading</Label>
              <Input
                value={section.content.heading || ''}
                onChange={(e) => onUpdate('heading', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Subheading</Label>
              <Textarea
                value={section.content.subheading || ''}
                onChange={(e) => onUpdate('subheading', e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input
                value={section.content.ctaText || ''}
                onChange={(e) => onUpdate('ctaText', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={section.content.phone || ''}
                onChange={(e) => onUpdate('phone', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={section.content.email || ''}
                onChange={(e) => onUpdate('email', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Hours/Availability</Label>
              <Input
                value={section.content.hours || ''}
                onChange={(e) => onUpdate('hours', e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'footer':
        return (
          <div className="space-y-4">
            <div>
              <Label>Copyright Text</Label>
              <Input
                value={section.content.copyright || ''}
                onChange={(e) => onUpdate('copyright', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="mb-2 block">Footer Columns</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {(section.content.columns || []).map((column: any, idx: number) => (
                    <div key={idx} className="border-b pb-4 space-y-2">
                      <Input
                        placeholder="Column Title"
                        value={column.title || ''}
                        onChange={(e) => updateArrayItem('columns', idx, 'title', e.target.value)}
                        className="mb-2"
                      />
                      <Label className="text-xs">Links</Label>
                      {(column.links || []).map((link: any, linkIdx: number) => (
                        <div key={linkIdx} className="flex gap-2 mb-2">
                          <Input
                            placeholder="Link Text"
                            value={link.text || ''}
                            onChange={(e) => {
                              const newColumns = [...(section.content.columns || [])];
                              if (!newColumns[idx].links) newColumns[idx].links = [];
                              newColumns[idx].links[linkIdx] = { ...newColumns[idx].links[linkIdx], text: e.target.value };
                              onUpdate('columns', newColumns);
                            }}
                            className="flex-1"
                          />
                          <Input
                            placeholder="URL"
                            value={link.url || ''}
                            onChange={(e) => {
                              const newColumns = [...(section.content.columns || [])];
                              if (!newColumns[idx].links) newColumns[idx].links = [];
                              newColumns[idx].links[linkIdx] = { ...newColumns[idx].links[linkIdx], url: e.target.value };
                              onUpdate('columns', newColumns);
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        );
      
      case 'privacy':
      case 'terms':
        return (
          <div className="space-y-4">
            <div>
              <Label>Last Updated Date</Label>
              <Input
                type="date"
                value={section.content.lastUpdated || ''}
                onChange={(e) => onUpdate('lastUpdated', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={section.content.content || ''}
                onChange={(e) => onUpdate('content', e.target.value)}
                className="mt-2"
                rows={15}
              />
            </div>
          </div>
        );
      
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
        <div className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">{section.content.heading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {section.content.features?.map((feature: any, idx: number) => (
                <div key={idx} className="text-center p-6 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    
    case 'services':
      return (
        <div className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">{section.content.heading}</h2>
            {section.content.subheading && (
              <p className="text-center text-slate-600 mb-12 text-lg">{section.content.subheading}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.content.services?.map((service: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {service.image && (
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">{service.title}</h3>
                    <p className="text-slate-600 mb-4">{service.description}</p>
                    {service.price && (
                      <p className="text-indigo-600 font-semibold">{service.price}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    
    case 'testimonials':
      return (
        <div className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">{section.content.heading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.content.testimonials?.map((testimonial: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    {testimonial.avatar && (
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                      {testimonial.company && (
                        <p className="text-sm text-slate-600">{testimonial.company}</p>
                      )}
                    </div>
                  </div>
                  {testimonial.rating && (
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-slate-300'}>★</span>
                      ))}
                    </div>
                  )}
                  <p className="text-slate-700 italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    
    case 'cta':
      return (
        <div className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">{section.content.heading}</h2>
            {section.content.subheading && (
              <p className="text-xl mb-8 text-indigo-100">{section.content.subheading}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {section.content.phone && (
                <a 
                  href={`tel:${section.content.phone}`}
                  className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                >
                  📞 {section.content.ctaText || 'Call Now'} {section.content.phone}
                </a>
              )}
              {section.content.email && (
                <a 
                  href={`mailto:${section.content.email}`}
                  className="bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-800 transition-colors"
                >
                  ✉️ Email Us
                </a>
              )}
            </div>
            {section.content.hours && (
              <p className="mt-6 text-indigo-100">{section.content.hours}</p>
            )}
          </div>
        </div>
      );
    
    case 'footer':
      return (
        <div className="py-12 px-6 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {section.content.columns?.map((column: any, idx: number) => (
                <div key={idx}>
                  {column.title && (
                    <h4 className="font-semibold mb-4">{column.title}</h4>
                  )}
                  <ul className="space-y-2 text-slate-400">
                    {column.links?.map((link: any, linkIdx: number) => (
                      <li key={linkIdx}>
                        <a href={link.url || '#'} className="hover:text-white transition-colors">
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {section.content.copyright && (
              <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
                {section.content.copyright}
              </div>
            )}
          </div>
        </div>
      );
    
    case 'privacy':
      return (
        <div className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto prose prose-slate max-w-none">
            <h1 className="text-4xl font-bold mb-4 text-slate-900">Privacy Policy</h1>
            {section.content.lastUpdated && (
              <p className="text-slate-600 mb-8">Last Updated: {section.content.lastUpdated}</p>
            )}
            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">
              {section.content.content}
            </div>
          </div>
        </div>
      );
    
    case 'terms':
      return (
        <div className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto prose prose-slate max-w-none">
            <h1 className="text-4xl font-bold mb-4 text-slate-900">Terms of Service</h1>
            {section.content.lastUpdated && (
              <p className="text-slate-600 mb-8">Last Updated: {section.content.lastUpdated}</p>
            )}
            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">
              {section.content.content}
            </div>
          </div>
        </div>
      );
    
    default:
      return <div className="p-8 text-slate-500">Section preview: {section.title}</div>;
  }
};

