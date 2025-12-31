// Re-export from legacy file for backwards compatibility
// This enables future dynamic imports while maintaining current sync API
export type { Venue, ImageAttribution } from './venues-legacy';
export { 
  venues, 
  getVenueById, 
  getVenuesByCity, 
  getVenuesByType, 
  getActiveVenues,
  getClosedVenues,
  isVenueOpen
} from './venues-legacy';
