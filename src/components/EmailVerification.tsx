import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowRight, Sparkle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { notifications } from '../utils/notifications';

interface EmailVerificationProps {
  onVerificationSuccess: () => void;
  onBackToHome: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  onVerificationSuccess, 
  onBackToHome 
}) => {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for verification token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const emailParam = urlParams.get('email');

    if (token && emailParam) {
      setVerificationToken(token);
      setEmail(emailParam);
      // Auto-verify if token is present
      handleVerify(token, emailParam);
    } else {
      // Check if user just signed up
      const pendingVerification = localStorage.getItem('pending_verification');
      if (pendingVerification) {
        const data = JSON.parse(pendingVerification);
        setEmail(data.email);
      }
    }
  }, []);

  const handleVerify = async (token?: string, emailParam?: string) => {
    const verifyToken = token || verificationToken;
    const verifyEmail = emailParam || email;

    if (!verifyToken || !verifyEmail) {
      setError('Invalid verification link. Please check your email.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate API call to verify email
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Verify token (in production, this would be an API call)
      const pendingVerification = localStorage.getItem('pending_verification');
      if (pendingVerification) {
        const data = JSON.parse(pendingVerification);
        
        if (data.email === verifyEmail && data.token === verifyToken) {
          // Mark user as verified
          const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
          const userIndex = savedUsers.findIndex((u: any) => u.email === verifyEmail);
          
          if (userIndex !== -1) {
            savedUsers[userIndex].verified = true;
            savedUsers[userIndex].verifiedAt = new Date().toISOString();
            localStorage.setItem('adiology_users', JSON.stringify(savedUsers));
            
            // Remove pending verification
            localStorage.removeItem('pending_verification');
            
            // Set user as logged in (verified)
            localStorage.setItem('auth_user', JSON.stringify({ 
              email: verifyEmail, 
              role: 'user',
              name: savedUsers[userIndex].name,
              verified: true
            }));
            
            setIsVerified(true);
            notifications.success('Email verified successfully!', {
              title: 'Verification Complete',
              description: 'Your email has been verified. Redirecting to pricing...',
            });

            // Redirect to pricing after 1.5 seconds
            setTimeout(() => {
              onVerificationSuccess();
            }, 1500);
          } else {
            throw new Error('User not found');
          }
        } else {
          throw new Error('Invalid verification token');
        }
      } else {
        throw new Error('Verification session expired');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Generate new token
      const token = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const verificationUrl = `${window.location.origin}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

      // Store pending verification
      localStorage.setItem('pending_verification', JSON.stringify({
        email,
        token,
        createdAt: new Date().toISOString(),
      }));

      // In production, send email via API
      // For now, show the verification URL (for testing with Mailinator)
      console.log('Verification URL:', verificationUrl);
      
      // Show success message
      notifications.success('Verification email sent!', {
        title: 'Email Sent',
        description: 'Please check your email inbox (and spam folder) for the verification link.',
      });
      
      // For testing: Show URL in console and alert
      if (import.meta.env.DEV) {
        alert(`For testing: Use this verification link:\n\n${verificationUrl}\n\n(In production, this would be sent via email)`);
      }

      setIsVerifying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-800 to-purple-800 p-4">
        <Card className="border border-slate-200 shadow-2xl bg-white backdrop-blur-xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Your email has been successfully verified. Redirecting to pricing...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-800 to-purple-800 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="border border-slate-200 shadow-2xl bg-white backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Adiology</h2>
              <p className="text-xs text-slate-500 -mt-0.5">~ Samay</p>
            </div>
            <CardTitle className="text-xl font-bold text-center text-slate-900">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-center text-slate-600">
              {email 
                ? `We've sent a verification link to ${email}`
                : 'Please verify your email address to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {email && (
              <div className="text-center p-4 bg-slate-50 rounded-lg space-y-3">
                <p className="text-sm text-slate-700 mb-2">
                  <strong>Email:</strong> {email}
                </p>
                <p className="text-xs text-slate-500">
                  Check your inbox (or spam folder) for the verification link.
                </p>
                {verificationToken && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-xs text-indigo-700 font-semibold mb-2">For Testing (Mailinator):</p>
                    <p className="text-xs text-indigo-600 break-all font-mono">
                      {window.location.origin}/verify-email?token={verificationToken}&email={encodeURIComponent(email)}
                    </p>
                    <p className="text-xs text-indigo-500 mt-2">
                      Copy this link to test email verification
                    </p>
                  </div>
                )}
              </div>
            )}

            {verificationToken ? (
              <div className="space-y-4">
                <Button
                  onClick={() => handleVerify()}
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                  {isVerifying ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Didn't receive the email? Check your spam folder or resend.
                </p>
                <Button
                  onClick={handleResendEmail}
                  disabled={isVerifying || !email}
                  variant="outline"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={onBackToHome}
                variant="ghost"
                className="w-full text-slate-600"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

