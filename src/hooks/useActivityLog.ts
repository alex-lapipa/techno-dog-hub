import { supabase } from '@/integrations/supabase/client';

interface LogActivityParams {
  action_type: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}

export const useActivityLog = () => {
  const logActivity = async (params: LogActivityParams): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No session, cannot log activity');
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activity-log`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to log activity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  };

  return { logActivity };
};
