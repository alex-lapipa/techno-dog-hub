import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DoggyVariant {
  id: string;
  name: string;
  slug: string;
  personality: string | null;
  status: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DoggyAnalytics {
  id: string;
  variant_id: string | null;
  variant_name: string;
  action_type: string;
  created_at: string;
}

export interface AnalyticsStats {
  totalShares: number;
  totalDownloads: number;
  totalViews: number;
  byVariant: Record<string, { shares: number; downloads: number; views: number }>;
  byAction: Record<string, number>;
}

export const useDoggyVariants = () => {
  return useQuery({
    queryKey: ["doggy-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doggy_variants")
        .select("*")
        .order("sort_order");
      
      if (error) throw error;
      return data as DoggyVariant[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - variants rarely change
    gcTime: 10 * 60 * 1000,   // 10 minutes cache retention
  });
};

export const useActiveDoggyVariants = () => {
  return useQuery({
    queryKey: ["doggy-variants-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doggy_variants")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (error) throw error;
      return data as DoggyVariant[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - active variants rarely change
    gcTime: 10 * 60 * 1000,   // 10 minutes cache retention
  });
};

export const useDoggyAnalytics = () => {
  return useQuery({
    queryKey: ["doggy-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doggy_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      
      if (error) throw error;
      
      // Calculate stats
      const analytics = data as DoggyAnalytics[];
      const stats: AnalyticsStats = {
        totalShares: 0,
        totalDownloads: 0,
        totalViews: 0,
        byVariant: {},
        byAction: {},
      };

      analytics.forEach((item) => {
        // By action type
        stats.byAction[item.action_type] = (stats.byAction[item.action_type] || 0) + 1;
        
        // Totals
        if (item.action_type.startsWith("share_")) stats.totalShares++;
        if (item.action_type === "download") stats.totalDownloads++;
        if (item.action_type === "view") stats.totalViews++;
        
        // By variant
        if (!stats.byVariant[item.variant_name]) {
          stats.byVariant[item.variant_name] = { shares: 0, downloads: 0, views: 0 };
        }
        if (item.action_type.startsWith("share_")) {
          stats.byVariant[item.variant_name].shares++;
        } else if (item.action_type === "download") {
          stats.byVariant[item.variant_name].downloads++;
        } else if (item.action_type === "view") {
          stats.byVariant[item.variant_name].views++;
        }
      });

      return { analytics, stats };
    },
    staleTime: 60 * 1000,     // 1 minute - analytics can be slightly stale
    gcTime: 5 * 60 * 1000,    // 5 minutes cache retention
  });
};

export const useUpdateDoggyVariant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DoggyVariant> }) => {
      const { error } = await supabase
        .from("doggy_variants")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doggy-variants"] });
      queryClient.invalidateQueries({ queryKey: ["doggy-variants-active"] });
      toast.success("Doggy updated!");
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
};

export const useLogDoggyAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      variantId, 
      variantName, 
      actionType 
    }: { 
      variantId?: string; 
      variantName: string; 
      actionType: string;
    }) => {
      const { error } = await supabase
        .from("doggy_analytics")
        .insert({
          variant_id: variantId,
          variant_name: variantName,
          action_type: actionType,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doggy-analytics"] });
    },
  });
};
