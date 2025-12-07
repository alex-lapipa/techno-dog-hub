// Re-export from legacy file for backwards compatibility
// This enables future dynamic imports while maintaining current sync API
export type { Festival } from './festivals-legacy';
export { 
  festivals, 
  getFestivalById, 
  getFestivalsByCountry, 
  getActiveFestivals, 
  getFestivalsByMonth 
} from './festivals-legacy';
