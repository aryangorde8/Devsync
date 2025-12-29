'use client';

import React, { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-redirect when back online
  useEffect(() => {
    if (isOnline) {
      window.location.href = '/dashboard';
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated offline icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Outer ring animation */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-700 animate-pulse" />
            
            {/* Inner content */}
            <div className="absolute inset-2 bg-slate-800 rounded-full flex items-center justify-center">
              <svg 
                className="w-16 h-16 text-slate-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" 
                />
              </svg>
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-purple-500/30 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-pink-500/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-500/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-slate-400 mb-8 leading-relaxed">
          It looks like you've lost your internet connection. 
          Don't worry, we'll automatically reconnect when you're back online.
        </p>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-full mb-8">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <span className="text-sm text-slate-300">
            {isOnline ? 'Back online! Redirecting...' : 'Waiting for connection...'}
          </span>
        </div>

        {/* What you can do */}
        <div className="bg-slate-800/50 rounded-xl p-6 text-left mb-6">
          <h2 className="text-white font-semibold mb-4">While you wait, you can:</h2>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Check your WiFi or mobile data connection
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Try moving to a location with better signal
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Restart your router if you're on WiFi
            </li>
          </ul>
        </div>

        {/* Retry button */}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all hover:scale-105"
        >
          Try Again
        </button>

        {/* Footer */}
        <p className="mt-8 text-xs text-slate-600">
          DevSync works offline for cached content. Install the app for better offline support.
        </p>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
