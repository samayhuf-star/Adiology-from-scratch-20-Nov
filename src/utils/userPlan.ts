/**
 * User Plan Utility
 * Centralized functions to check user plan status and access rights
 */

/**
 * Check if user has a paid plan
 */
export function isPaidUser(): boolean {
  try {
    const authUser = localStorage.getItem('auth_user');
    const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
    
    if (authUser) {
      const user = JSON.parse(authUser);
      const userData = savedUsers.find((u: any) => u.email === user.email);
      
      const plan = userData?.plan || user.plan || 'Free';
      return plan !== 'Free' && plan !== null && plan !== undefined;
    }
  } catch (e) {
    console.error('Error checking user plan:', e);
  }
  return false;
}

/**
 * Get user's current plan name
 */
export function getUserPlan(): string {
  try {
    const authUser = localStorage.getItem('auth_user');
    const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
    
    if (authUser) {
      const user = JSON.parse(authUser);
      const userData = savedUsers.find((u: any) => u.email === user.email);
      
      return userData?.plan || user.plan || 'Free';
    }
  } catch (e) {
    console.error('Error getting user plan:', e);
  }
  return 'Free';
}

/**
 * Check if user has access to a feature
 * For now, all paid users have access to all features
 */
export function hasFeatureAccess(feature: string): boolean {
  // All paid users have access to all features
  if (isPaidUser()) {
    return true;
  }
  
  // Free users have limited access
  // Add specific feature restrictions here if needed
  return true; // For now, free users also have access (no paywalls)
}

