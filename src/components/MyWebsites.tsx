import React, { useState, useEffect } from 'react';
import { 
  Globe, ExternalLink, Trash2, RefreshCw, CheckCircle, 
  AlertCircle, Loader2, Rocket, Calendar, Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { getUserPublishedWebsites, deletePublishedWebsite, updatePublishedWebsiteStatus, PublishedWebsite } from '../utils/publishedWebsites';
import { getDeploymentStatus } from '../utils/vercel';
import { supabase } from '../utils/supabase';
import { notifications } from '../utils/notifications';

export const MyWebsites: React.FC = () => {
  const [websites, setWebsites] = useState<PublishedWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [vercelToken, setVercelToken] = useState('');

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        notifications.error('You must be logged in to view your websites', {
          title: 'Authentication Required'
        });
        return;
      }

      const userWebsites = await getUserPublishedWebsites(user.id);
      setWebsites(userWebsites);
    } catch (error: any) {
      console.error('Failed to load websites:', error);
      notifications.error('Failed to load your websites', {
        title: 'Load Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async (website: PublishedWebsite) => {
    if (!vercelToken) {
      notifications.warning('Please enter your Vercel API token in settings to refresh status', {
        title: 'Token Required'
      });
      return;
    }

    setRefreshing(website.id);
    try {
      const deployment = await getDeploymentStatus(website.vercel_deployment_id, vercelToken);
      await updatePublishedWebsiteStatus(
        website.id,
        deployment.state === 'READY' ? 'ready' : deployment.state === 'ERROR' ? 'error' : 'deploying',
        deployment.url
      );
      await loadWebsites();
      notifications.success('Status updated!', { title: 'Refreshed' });
    } catch (error: any) {
      console.error('Failed to refresh status:', error);
      notifications.error('Failed to refresh status', { title: 'Error' });
    } finally {
      setRefreshing(null);
    }
  };

  const handleDeleteWebsite = async (websiteId: string) => {
    try {
      await deletePublishedWebsite(websiteId);
      await loadWebsites();
      notifications.success('Website deleted successfully', { title: 'Deleted' });
      setShowDeleteDialog(null);
    } catch (error: any) {
      console.error('Failed to delete website:', error);
      notifications.error('Failed to delete website', { title: 'Delete Error' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Live
          </Badge>
        );
      case 'deploying':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Deploying
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold theme-gradient-text">My Websites</h1>
            <p className="text-slate-600 mt-1">Manage your published websites</p>
          </div>
        </div>
      </div>

      {websites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No websites published yet</h3>
            <p className="text-slate-500 mb-6">
              Start by editing a template and clicking "Publish Website"
            </p>
            <Button 
              onClick={() => window.location.href = '#/website-templates'}
              className="theme-button-primary"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Go to Templates
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <Card key={website.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{website.name}</CardTitle>
                    {getStatusBadge(website.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Template ID</p>
                    <p className="text-sm font-mono text-slate-700">{website.template_id}</p>
                  </div>
                  
                  {website.vercel_url && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Website URL</p>
                      <a
                        href={website.vercel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 break-all"
                      >
                        {website.vercel_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Published {new Date(website.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    {website.vercel_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(website.vercel_url, '_blank')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshStatus(website)}
                      disabled={refreshing === website.id || !vercelToken}
                    >
                      {refreshing === website.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(website.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Website</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 py-4">
            Are you sure you want to delete this website? This will remove it from your list but won't delete it from Vercel.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDeleteWebsite(showDeleteDialog)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

