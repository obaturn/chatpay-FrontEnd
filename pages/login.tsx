import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../src/components/AuthContext';
import LoginForm from '../src/components/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated and has a complete profile, redirect to dashboard
    if (isAuthenticated && user && user.displayName) {
      router.push('/dashboard');
    }
    // If user is authenticated but needs profile setup, redirect to profile setup
    else if (isAuthenticated && user && !user.displayName) {
      router.push('/profile-setup');
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (email: string, password: string) => {
    // The LoginForm component will handle the actual login logic
    // After successful login, the useEffect above will handle redirection
  };

  const handleGoogleLogin = async () => {
    // The LoginForm component will handle Google login
  };

  const handleSwitchToRegister = () => {
    router.push('/register');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <LoginForm
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onSwitchToRegister={handleSwitchToRegister}
        onBackToHome={handleBackToHome}
      />
    </div>
  );
}