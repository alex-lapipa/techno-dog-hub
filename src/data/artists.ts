// Re-export from legacy file for backwards compatibility
// This enables future dynamic imports while maintaining current sync API
export type { Artist, ImageAttribution } from './artists-legacy';
export { 
  artists, 
  getArtistById, 
  getArtistsByTag, 
  getArtistsByCountry, 
  getArtistsByRegion 
} from './artists-legacy';
