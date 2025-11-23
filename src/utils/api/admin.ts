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
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      return await authenticatedFetch(`/admin/users?${queryParams}`);
    } catch (error) {
      // Fallback: Note that admin functions require server-side implementation
      console.log('API unavailable - admin functions require backend implementation');
      // Return empty result since admin functions can't be called client-side
      return {
        users: [],
        pagination: { total: 0, totalPages: 0 },
      };

      // Filter by search if provided
      let filteredUsers = authUsers || [];
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredUsers = filteredUsers.filter((u: any) => 
          u.email?.toLowerCase().includes(searchLower) ||
          u.user_metadata?.full_name?.toLowerCase().includes(searchLower) ||
          u.id.toLowerCase().includes(searchLower)
        );
      }

      // Paginate
      const page = params?.page || 1;
      const limit = params?.limit || 50;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = filteredUsers.slice(start, end);

      return {
        users: paginatedUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.user_metadata?.full_name || '',
          subscription_plan: u.user_metadata?.subscription_plan || 'free',
          subscription_status: u.user_metadata?.subscription_status || 'active',
          created_at: u.created_at,
          last_login_at: u.last_sign_in_at,
        })),
        pagination: {
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit),
        },
      };
    }
  },

  async getUserById(id: string) {
    return authenticatedFetch(`/admin/users/${id}`);
  },

  async updateUser(id: string, data: any) {
    try {
      return await authenticatedFetch(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Fallback: Admin functions require server-side implementation
      console.error('Admin API unavailable - updateUser requires backend');
      throw new Error('Admin functions require backend implementation');
    }
  },

  async deleteUser(id: string) {
    try {
      // Try API first, fallback to direct Supabase
      return await authenticatedFetch(`/admin/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback: Admin functions require server-side implementation
      console.error('Admin API unavailable - deleteUser requires backend');
      throw new Error('Admin functions require backend implementation');
    }
  },

  async createUser(data: { email: string; password: string; full_name?: string; subscription_plan?: string }) {
    try {
      // Try API first, fallback to direct Supabase
      return await authenticatedFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Fallback: Admin functions require server-side implementation
      console.error('Admin API unavailable - createUser requires backend');
      throw new Error('Admin functions require backend implementation');
    }
  },

  async resetPassword(userId: string) {
    try {
      return await authenticatedFetch(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
    } catch (error) {
      // Fallback: Admin functions require server-side implementation
      console.error('Admin API unavailable - resetPassword requires backend');
      throw new Error('Admin functions require backend implementation');
    }
  },

  // Overview
  async getOverview() {
    try {
      return await authenticatedFetch('/admin/overview');
    } catch (error) {
      // Fallback: Return default values since admin functions require backend
      console.log('API unavailable - returning default overview stats');
      return {
        totalUsers: 0,
        activeSubscriptions: 0,
        recentSignups: 0,
        systemHealth: 'unknown',
      };
    }
  },

  // Audit Logs
  async getAuditLogs(params?: { page?: number; limit?: number; action?: string; userId?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.action) queryParams.append('action', params.action);
      if (params?.userId) queryParams.append('userId', params.userId);

      return await authenticatedFetch(`/admin/audit-logs?${queryParams}`);
    } catch (error) {
      // Fallback: Return empty logs
      console.log('API unavailable, returning empty audit logs');
      return { logs: [], pagination: { total: 0, totalPages: 0 } };
    }
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

