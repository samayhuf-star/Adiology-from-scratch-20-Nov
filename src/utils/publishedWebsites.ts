/**
 * Published Websites Database Utilities
 */

import { supabase } from './supabase/client';

export interface PublishedWebsite {
  id: string;
  user_id: string;
  name: string;
  template_id: string;
  template_data: any; // JSON of the template
  vercel_deployment_id: string;
  vercel_url: string;
  vercel_project_id: string;
  status: 'deploying' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
}

/**
 * Save published website to database
 */
export async function savePublishedWebsite(
  userId: string,
  websiteData: {
    name: string;
    template_id: string;
    template_data: any;
    vercel_deployment_id: string;
    vercel_url: string;
    vercel_project_id: string;
    status: 'deploying' | 'ready' | 'error';
  }
): Promise<PublishedWebsite> {
  const { data, error } = await supabase
    .from('published_websites')
    .insert({
      user_id: userId,
      name: websiteData.name,
      template_id: websiteData.template_id,
      template_data: websiteData.template_data,
      vercel_deployment_id: websiteData.vercel_deployment_id,
      vercel_url: websiteData.vercel_url,
      vercel_project_id: websiteData.vercel_project_id,
      status: websiteData.status,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save published website: ${error.message}`);
  }

  return data;
}

/**
 * Get all published websites for a user
 */
export async function getUserPublishedWebsites(
  userId: string
): Promise<PublishedWebsite[]> {
  try {
    const { data, error } = await supabase
      .from('published_websites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // If table doesn't exist, return empty array instead of throwing
    if (error) {
      // Check if error is about missing table
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        console.warn('published_websites table not found, returning empty array');
        return [];
      }
      throw new Error(`Failed to fetch published websites: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    // Gracefully handle any errors and return empty array
    console.warn('Error fetching published websites:', error);
    return [];
  }
}

/**
 * Update published website status
 */
export async function updatePublishedWebsiteStatus(
  websiteId: string,
  status: 'deploying' | 'ready' | 'error',
  vercel_url?: string
): Promise<PublishedWebsite> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (vercel_url) {
    updateData.vercel_url = vercel_url;
  }

  const { data, error } = await supabase
    .from('published_websites')
    .update(updateData)
    .eq('id', websiteId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update website status: ${error.message}`);
  }

  return data;
}

/**
 * Delete published website
 */
export async function deletePublishedWebsite(
  websiteId: string
): Promise<void> {
  const { error } = await supabase
    .from('published_websites')
    .delete()
    .eq('id', websiteId);

  if (error) {
    throw new Error(`Failed to delete website: ${error.message}`);
  }
}

