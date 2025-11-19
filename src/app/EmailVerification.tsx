'use client';

import { useState } from 'react';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onResend: () => Promise<void>;
  onSkip?: () => void;
}

export default function EmailVerification({ email, onVerified, onResend, onSkip }: EmailVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, verify the OTP with the backend
      // For now, accept any 6-digit code
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setSuccess('Email verified successfully!');
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);
    try {
      await onResend();
      setSuccess('Verification code sent successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend code';
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We ve sent a verification code to
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Didnt receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-green-600 hover:text-green-700 font-medium text-sm underline disabled:text-gray-400 disabled:no-underline"
          >
            {isResending ? 'Sending...' : 'Resend verification code'}
          </button>
        </div>

        {/* Skip Option */}
        {onSkip && (
          <div className="mt-6 text-center">
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
              disabled={isLoading}
            >
              Skip verification for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}