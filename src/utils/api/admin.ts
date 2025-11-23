import { projectId } from '../supabase/info';
import { supabase } from '../supabase/client';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6757d0ca`;

// Get auth token for API calls
async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Helper to make authenticated requests
async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Super Admin API functions
export const adminApi = {
  // Users
  async getUsers(params?: { search?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return authenticatedFetch(`/admin/users?${queryParams}`);
  },

  async getUserById(id: string) {
    return authenticatedFetch(`/admin/users/${id}`);
  },

  async updateUser(id: string, data: any) {
    return authenticatedFetch(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string) {
    return authenticatedFetch(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Overview
  async getOverview() {
    return authenticatedFetch('/admin/overview');
  },

  // Audit Logs
  async getAuditLogs(params?: { page?: number; limit?: number; action?: string; userId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.userId) queryParams.append('userId', params.userId);

    return authenticatedFetch(`/admin/audit-logs?${queryParams}`);
  },

  // Billing Stats
  async getBillingStats() {
    return authenticatedFetch('/admin/billing/stats');
  },

  // Usage Metrics
  async getUsageMetrics(params?: { metricType?: string; period?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.metricType) queryParams.append('metricType', params.metricType);
    if (params?.period) queryParams.append('period', params.period);

    return authenticatedFetch(`/admin/usage?${queryParams}`);
  },

  // System Health
  async getSystemHealth() {
    return authenticatedFetch('/admin/health');
  },

  // Feature Flags
  async getFeatureFlags() {
    return authenticatedFetch('/admin/feature-flags');
  },

  async createFeatureFlag(data: any) {
    return authenticatedFetch('/admin/feature-flags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFeatureFlag(id: string, data: any) {
    return authenticatedFetch(`/admin/feature-flags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

