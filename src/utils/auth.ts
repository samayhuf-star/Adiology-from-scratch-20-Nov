import { supabase } from './supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Get current authenticated user from Supabase
 */
export async function getCurrentAuthUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user profile from users table
 */
export async function getCurrentUserProfile() {
  try {
    const user = await getCurrentAuthUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Create or update user profile in users table
 */
export async function createUserProfile(userId: string, email: string, fullName: string) {
  try {
    // Check if user profile already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingUser) {
      // Update existing profile
      const { data, error } = await supabase
        .from('users')
        .update({
          email,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          full_name: fullName,
          role: 'user',
          subscription_plan: 'free',
          subscription_status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

/**
 * Sign up with email and password using Supabase Auth
 */
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) throw error;

    // Create user profile if signup successful
    if (data.user) {
      try {
        await createUserProfile(data.user.id, email, fullName);
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw - auth was successful, profile can be created later
      }
    }

    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

/**
 * Sign in with email and password using Supabase Auth
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update last_login_at in user profile
    if (data.user) {
      try {
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);
      } catch (profileError) {
        console.error('Error updating last login:', profileError);
        // Don't throw - login was successful
      }
    }

    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

/**
 * Update user password (for password reset flow)
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Check if current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentAuthUser();
    if (!user) return false;

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !userData) return false;
    return userData.role === 'superadmin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

