import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, ArrowLeft, Sparkle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface AuthProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Signup is enabled for production
  const SIGNUP_DISABLED = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      if (isLogin) {
        // Login logic - Super admin should use /superadmin route
        if (trimmedEmail === 'sam@sam.com' && trimmedPassword === 'sam@sam.com') {
          setError('Super admin access is available at /superadmin');
          setIsLoading(false);
          return;
        }

        // Regular user login (demo - in production, check against database)
        const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
        const user = savedUsers.find((u: any) => 
          u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
        );

        if (user) {
          localStorage.setItem('auth_user', JSON.stringify({ 
            email: user.email, 
            role: 'user',
            name: user.name
          }));
          setIsLoading(false);
          // Directly go to dashboard - no admin/user selection
          onLoginSuccess();
        } else {
          setError('Invalid email or password. Please try again.');
          setIsLoading(false);
        }
      } else {
        // Signup logic
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }

        if (trimmedPassword.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        // Check if user already exists
        const savedUsers = JSON.parse(localStorage.getItem('adiology_users') || '[]');
        const userExists = savedUsers.some((u: any) => u.email.toLowerCase() === trimmedEmail);

        if (userExists) {
          setError('An account with this email already exists');
          setIsLoading(false);
          return;
        }

        // Create new user (not verified yet)
        const newUser = {
          email: trimmedEmail,
          password: trimmedPassword,
          name: name.trim(),
          createdAt: new Date().toISOString(),
          verified: false
        };

        savedUsers.push(newUser);
        localStorage.setItem('adiology_users', JSON.stringify(savedUsers));
        
        // Generate verification token
        const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}&email=${encodeURIComponent(trimmedEmail)}`;
        
        // Store pending verification
        localStorage.setItem('pending_verification', JSON.stringify({
          email: trimmedEmail,
          token: verificationToken,
          createdAt: new Date().toISOString(),
        }));

        // In production, send email via API
        // For now, log the verification URL (for testing with Mailinator)
        console.log('Verification URL:', verificationUrl);
        
        setIsLoading(false);
        
        // Redirect to verification page
        window.location.href = `/verify-email?token=${verificationToken}&email=${encodeURIComponent(trimmedEmail)}`;
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-800 to-purple-800 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="border border-slate-200 shadow-2xl bg-white backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToHome}
                className="text-slate-700 hover:text-indigo-600 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg mb-3">
                <Sparkle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Adiology</h2>
              <p className="text-xs text-slate-500 -mt-0.5">~ Samay</p>
            </div>
            <CardTitle className="text-xl font-bold text-center text-slate-900">
              {isLogin ? 'Welcome Back' : SIGNUP_DISABLED ? 'Sign Up Disabled' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center text-slate-600">
              {isLogin 
                ? 'Sign in to your Adiology account' 
                : SIGNUP_DISABLED 
                  ? 'New signups are currently disabled until production launch'
                  : 'Start building winning campaigns today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isLogin && !SIGNUP_DISABLED && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-900 font-semibold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      required={!isLogin}
                      disabled={SIGNUP_DISABLED}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && !SIGNUP_DISABLED && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-900 font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      required={!isLogin}
                      disabled={SIGNUP_DISABLED}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-slate-300" />
                    <span className="text-slate-700 font-medium">Remember me</span>
                  </label>
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 h-11"
                disabled={isLoading || (!isLogin && SIGNUP_DISABLED)}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : (SIGNUP_DISABLED ? 'Sign Up Disabled' : 'Create Account')
                )}
              </Button>

              {SIGNUP_DISABLED ? (
                <div className="text-center text-sm text-slate-500 italic">
                  Sign up is currently disabled. Please contact support for access.
                </div>
              ) : (
                <div className="text-center text-sm text-slate-700">
                  {isLogin ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(false);
                          setError('');
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(true);
                          setError('');
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

