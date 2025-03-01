'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthOverlayProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export default function AuthOverlay({ children, redirectPath = '/login' }: AuthOverlayProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Add listener for auth changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogin = () => {
    // Get current path to redirect back after login
    const currentPath = window.location.pathname;
    router.push(`${redirectPath}?redirect=${currentPath}`);
  };

  const handleSignUp = () => {
    const currentPath = window.location.pathname;
    router.push(`/register?redirect=${currentPath}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Auth overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
        <Card className="w-[350px] shadow-lg">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to be signed in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              Join our community of backpackers to access chats, groups, and more features.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleSignUp}>
              Sign Up
            </Button>
            <Button onClick={handleLogin}>
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 