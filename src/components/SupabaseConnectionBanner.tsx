import React, { useEffect, useState } from 'react';
import { testSupabaseConnection } from '../lib/supabase';

export const SupabaseConnectionBanner: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    let isMounted = true;

    async function checkConnectionWithRetry(retries = 3, delayMs = 600) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        const result = await testSupabaseConnection();
        if (!isMounted) return;

        if (result.success) {
          setStatus('success');
          return;
        }

        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs));
        } else {
          console.error('[Supabase Technical Error]:', result.error || 'Connection failed');
          if (isMounted) {
            setStatus('error');
          }
        }
      }
    }

    checkConnectionWithRetry();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === 'loading') {
    return null;
  }

  if (status === 'success') {
    return (
      <div
        id="supabase-dev-status"
        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-emerald-900/90 text-emerald-100 border border-emerald-700/60 rounded-full text-xs font-medium shadow-md backdrop-blur-sm flex items-center gap-2 transition-opacity"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Supabase connected successfully.</span>
      </div>
    );
  }

  return (
    <div
      id="supabase-dev-status"
      className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-rose-900/90 text-rose-100 border border-rose-700/60 rounded-full text-xs font-medium shadow-md backdrop-blur-sm flex items-center gap-2 transition-opacity"
    >
      <span className="w-2 h-2 rounded-full bg-rose-400" />
      <span>Supabase connection failed. Please check the configuration.</span>
    </div>
  );
};

