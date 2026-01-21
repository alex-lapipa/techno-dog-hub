/**
 * Brand Book Protection Hook
 * 
 * Checks if current user is authorized to modify brand books.
 * Only Alex Lawton can modify brand book content.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BrandBookConfig {
  id: string;
  config_type: string;
  is_locked: boolean;
  locked_by: string;
  locked_reason: string | null;
  updated_at: string;
}

interface BrandBookProtection {
  isLoading: boolean;
  isOwner: boolean;
  isProtected: boolean;
  lockedBy: string;
  lockedReason: string;
  configs: BrandBookConfig[];
  logAccess: (configType: string, action: string, details?: Record<string, unknown>) => Promise<void>;
}

// Alex Lawton's authorized emails
const AUTHORIZED_EMAILS = [
  'alex@alexlawton.io',
  'alex@rmtv.io',
  'alex.lawton@miramonte.io'
];

export function useBrandBookProtection(): BrandBookProtection {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<BrandBookConfig[]>([]);
  
  const isOwner = user?.email ? AUTHORIZED_EMAILS.includes(user.email) : false;

  useEffect(() => {
    async function fetchConfigs() {
      try {
        const { data, error } = await supabase
          .from('brand_book_configs')
          .select('*')
          .order('config_type');
        
        if (error) throw error;
        setConfigs(data || []);
      } catch (err) {
        console.error('Failed to fetch brand book configs:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfigs();
  }, []);

  const logAccess = async (
    configType: string, 
    action: string, 
    details: Record<string, unknown> = {}
  ) => {
    try {
      await supabase.rpc('log_brand_book_access', {
        p_config_type: configType,
        p_action: action,
        p_details: JSON.parse(JSON.stringify(details))
      });
    } catch (err) {
      console.error('Failed to log brand book access:', err);
    }
  };

  const primaryConfig = configs[0];

  return {
    isLoading,
    isOwner,
    isProtected: primaryConfig?.is_locked ?? true,
    lockedBy: primaryConfig?.locked_by ?? 'Alex Lawton',
    lockedReason: primaryConfig?.locked_reason ?? 'Brand book is protected - source of truth',
    configs,
    logAccess
  };
}

export default useBrandBookProtection;
