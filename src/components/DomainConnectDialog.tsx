/**
 * Domain Connect Dialog
 * UI for connecting a custom domain to a published Vercel site
 */

import React, { useState, useEffect } from 'react';
import {
  Globe, Copy, CheckCircle, AlertCircle, Loader2, ExternalLink, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { notifications } from '../utils/notifications';
import { SavedSite } from '../utils/savedSites';

interface DNSRecord {
  type: 'A' | 'CNAME';
  name: string;
  value: string;
  ttl?: number;
  description: string;
}

interface DomainConnectDialogProps {
  site: SavedSite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DomainConnectDialog: React.FC<DomainConnectDialogProps> = ({
  site,
  open,
  onOpenChange,
}) => {
  const [domain, setDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (open && site.vercel?.url) {
      // Pre-fill domain if already connected
      const url = new URL(site.vercel.url);
      if (url.hostname !== url.hostname.split('.')[0] + '.vercel.app') {
        setDomain(url.hostname);
      }
    }
  }, [open, site]);

  const handleConnect = async () => {
    if (!domain.trim()) {
      notifications.error('Please enter a domain name');
      return;
    }

    try {
      setConnecting(true);
      const response = await fetch('/api/domain-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savedSiteId: site.id,
          domain: domain.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect domain');
      }

      const result = await response.json();
      setDnsRecords(result.dnsRecords || []);
      setVerified(result.verified || false);

      if (result.verified) {
        notifications.success('Domain connected and verified!');
      } else {
        notifications.info('Domain added. Please configure DNS records below.');
      }
    } catch (error: any) {
      console.error('Failed to connect domain:', error);
      notifications.error(error.message || 'Failed to connect domain');
    } finally {
      setConnecting(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!domain.trim()) {
      notifications.error('Please enter a domain name');
      return;
    }

    try {
      setChecking(true);
      const response = await fetch('/api/domain-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          savedSiteId: site.id,
          domain: domain.trim(),
          action: 'check',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check domain status');
      }

      const result = await response.json();
      setVerified(result.verified || false);

      if (result.verified) {
        notifications.success('Domain is verified!');
      } else {
        notifications.info('Domain verification pending. Please ensure DNS records are configured correctly.');
      }
    } catch (error: any) {
      console.error('Failed to check domain status:', error);
      notifications.error(error.message || 'Failed to check domain status');
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notifications.success('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Connect Custom Domain
          </DialogTitle>
          <DialogDescription>
            Connect a custom domain to your published site: {site.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Domain Input */}
          <div>
            <Label htmlFor="domain">Domain Name</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1"
              />
              <Button
                onClick={handleConnect}
                disabled={connecting || !domain.trim()}
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enter your domain (e.g., example.com or www.example.com)
            </p>
          </div>

          {/* DNS Records */}
          {dnsRecords.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>DNS Configuration Required</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckStatus}
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Check Status
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                {dnsRecords.map((record, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{record.type}</Badge>
                          <span className="font-mono text-sm">{record.name}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-mono text-sm">{record.value}</span>
                        </div>
                        <p className="text-xs text-slate-500">{record.description}</p>
                        {record.ttl && (
                          <p className="text-xs text-slate-400 mt-1">TTL: {record.ttl}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(record.value)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Instructions
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Log in to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare)</li>
                  <li>Navigate to DNS management</li>
                  <li>Add the DNS records shown above</li>
                  <li>Wait 5-10 minutes for DNS propagation</li>
                  <li>Click "Check Status" to verify the domain</li>
                </ol>
              </div>
            </div>
          )}

          {/* Verification Status */}
          {dnsRecords.length > 0 && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-50">
              {verified ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Domain verified! Your site is now accessible at {domain}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-amber-600">
                    Domain verification pending. Please configure DNS records and wait for propagation.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Vercel Dashboard Link */}
          {site.vercel?.url && (
            <div className="pt-4 border-t">
              <a
                href={`https://vercel.com/dashboard`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Open Vercel Dashboard
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

