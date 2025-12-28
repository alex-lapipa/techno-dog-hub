// Centralized React Query hooks for data fetching
// Uses canonical database as primary source with verified RAG data

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { loadArtistsSummaryUnified, loadArtistByIdUnified } from "@/data/canonical-artists-loader";
import { loadVenuesSummary, loadVenueById, type VenueSummary } from "@/data/venues-loader";
import { loadFestivalsSummary, loadFestivalById, type FestivalSummary } from "@/data/festivals-loader";

// Stale time configuration (10 minutes)
const STALE_TIME = 1000 * 60 * 10;

// ============================================================
// ARTISTS HOOKS - Uses Canonical Database
// ============================================================

export function useArtists() {
  return useQuery({
    queryKey: ['artists-summary'],
    queryFn: loadArtistsSummaryUnified,
    staleTime: STALE_TIME,
  });
}

export function useArtist(id: string | undefined) {
  return useQuery({
    queryKey: ['artist', id],
    queryFn: () => loadArtistByIdUnified(id!),
    staleTime: STALE_TIME,
    enabled: !!id,
  });
}

export function usePrefetchArtist() {
  const queryClient = useQueryClient();
  
  return useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['artist', id],
      queryFn: () => loadArtistByIdUnified(id),
      staleTime: STALE_TIME,
    });
  }, [queryClient]);
}

// ============================================================
// VENUES HOOKS
// ============================================================

export function useVenues() {
  return useQuery({
    queryKey: ['venues-summary'],
    queryFn: loadVenuesSummary,
    staleTime: STALE_TIME,
  });
}

export function useVenue(id: string | undefined) {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => loadVenueById(id!),
    staleTime: STALE_TIME,
    enabled: !!id,
  });
}

export function usePrefetchVenue() {
  const queryClient = useQueryClient();
  
  return useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['venue', id],
      queryFn: () => loadVenueById(id),
      staleTime: STALE_TIME,
    });
  }, [queryClient]);
}

// ============================================================
// FESTIVALS HOOKS
// ============================================================

export function useFestivals() {
  return useQuery({
    queryKey: ['festivals-summary'],
    queryFn: loadFestivalsSummary,
    staleTime: STALE_TIME,
  });
}

export function useFestival(id: string | undefined) {
  return useQuery({
    queryKey: ['festival', id],
    queryFn: () => loadFestivalById(id!),
    staleTime: STALE_TIME,
    enabled: !!id,
  });
}

export function usePrefetchFestival() {
  const queryClient = useQueryClient();
  
  return useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['festival', id],
      queryFn: () => loadFestivalById(id),
      staleTime: STALE_TIME,
    });
  }, [queryClient]);
}

// ============================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================

export type { CanonicalArtistSummary as ArtistSummary } from "@/data/canonical-artists-loader";
export type { VenueSummary } from "@/data/venues-loader";
export type { FestivalSummary } from "@/data/festivals-loader";
