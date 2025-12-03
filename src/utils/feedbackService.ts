import { supabase } from './supabase/client';
import { getCurrentAuthUser } from './auth';
import { api } from './api';

export interface FeedbackData {
  type: 'feedback' | 'feature_request';
  rating?: number;
  message: string;
}

export interface FeedbackRecord {
  id: string;
  user_id: string | null;
  user_email: string | null;
  type: 'feedback' | 'feature_request';
  rating: number | null;
  message: string;
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

/**
 * Submit feedback or feature request
 */
export async function submitFeedback(data: FeedbackData): Promise<void> {
  try {
    const user = await getCurrentAuthUser();
    const userEmail = user?.email || null;
    const userId = user?.id || null;

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        user_email: userEmail,
        type: data.type,
        rating: data.rating || null,
        message: data.message,
        status: 'new',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB insert fails, try to send email
    }

    // Send email notification
    try {
      await api.post('/send-feedback-email', {
        to: 'samayhuf@gmail.com',
        subject: data.type === 'feature_request' 
          ? `New Feature Request from ${userEmail || 'Anonymous User'}`
          : `New Feedback from ${userEmail || 'Anonymous User'}`,
        body: `
          Type: ${data.type === 'feature_request' ? 'Feature Request' : 'Feedback'}
          ${data.rating ? `Rating: ${data.rating}/5` : ''}
          User: ${userEmail || 'Anonymous'}
          ${userId ? `User ID: ${userId}` : ''}
          
          Message:
          ${data.message}
          
          ---
          Submitted at: ${new Date().toISOString()}
        `,
        feedbackType: data.type,
        rating: data.rating,
        userEmail: userEmail,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the whole operation if email fails
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    throw error;
  }
}

/**
 * Get all feedback (for admin)
 */
export async function getAllFeedback(): Promise<FeedbackRecord[]> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    throw error;
  }
}

/**
 * Update feedback status (for admin)
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackRecord['status']
): Promise<void> {
  try {
    const { error } = await supabase
      .from('feedback')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Failed to update feedback status:', error);
    throw error;
  }
}

