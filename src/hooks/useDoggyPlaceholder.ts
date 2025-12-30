import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dogVariants } from "@/components/DogPack";

interface DoggyPlaceholder {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  doggy_variant: string;
}

// Hook to get a doggy placeholder for a specific entity
export const useDoggyPlaceholder = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: ["doggy-placeholder", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doggy_placeholders")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .single();
      
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      
      if (data) {
        const dogData = dogVariants.find(
          (d) => d.name.toLowerCase() === (data as DoggyPlaceholder).doggy_variant.toLowerCase()
        );
        return {
          placeholder: data as DoggyPlaceholder,
          DogComponent: dogData?.Component || null,
          personality: dogData?.personality || null,
        };
      }
      
      return null;
    },
    enabled: !!entityType && !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get all placeholders (for bulk operations)
export const useAllDoggyPlaceholders = () => {
  return useQuery({
    queryKey: ["doggy-placeholders-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doggy_placeholders")
        .select("*");
      
      if (error) throw error;
      return data as DoggyPlaceholder[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export default useDoggyPlaceholder;
