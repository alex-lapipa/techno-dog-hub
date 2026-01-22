// Unified YouTube client with consistent error handling and caching
// Phase 1: Integration Consolidation

import { createLogger, Logger } from './logger.ts';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl?: string;
  duration?: string;
  durationMinutes?: number;
  viewCount?: number;
  isEmbeddable?: boolean;
  isPublic?: boolean;
}

export interface YouTubeSearchOptions {
  maxResults?: number;
  type?: 'video' | 'channel' | 'playlist';
  videoDuration?: 'short' | 'medium' | 'long';
  order?: 'relevance' | 'date' | 'viewCount';
}

export interface YouTubeClientOptions {
  logger?: Logger;
}

// Parse ISO 8601 duration to minutes
export function parseDurationToMinutes(isoDuration: string): number {
  if (!isoDuration) return 0;
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 60 + minutes + (seconds >= 30 ? 1 : 0);
}

// Get YouTube API key
export function getYouTubeApiKey(): string {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!apiKey) {
    throw new Error('YouTube API key not configured (YOUTUBE_API_KEY)');
  }
  
  return apiKey;
}

export class YouTubeClient {
  private apiKey: string;
  private logger: Logger;

  constructor(options: YouTubeClientOptions = {}) {
    this.apiKey = getYouTubeApiKey();
    this.logger = options.logger || createLogger('youtube-client');
  }

  // Search for videos
  async search(query: string, options: YouTubeSearchOptions = {}): Promise<YouTubeVideo[]> {
    const { maxResults = 10, type = 'video', videoDuration, order = 'relevance' } = options;
    
    this.logger.info('YouTube search', { query, maxResults });

    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type,
        maxResults: String(maxResults),
        order,
        key: this.apiKey,
      });

      if (videoDuration) {
        params.set('videoDuration', videoDuration);
      }

      const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('YouTube search failed', { status: response.status, error: errorText });
        throw new Error(`YouTube search failed: ${response.status}`);
      }

      const data = await response.json();
      const videos: YouTubeVideo[] = (data.items || []).map((item: any) => ({
        id: item.id?.videoId || item.id,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        channelTitle: item.snippet?.channelTitle || '',
        channelId: item.snippet?.channelId || '',
        publishedAt: item.snippet?.publishedAt || '',
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || 
                     item.snippet?.thumbnails?.medium?.url || 
                     item.snippet?.thumbnails?.default?.url,
      }));

      this.logger.info('YouTube search complete', { resultCount: videos.length });
      return videos;
    } catch (error) {
      this.logger.error('YouTube search error', { error: (error as Error).message });
      throw error;
    }
  }

  // Get video details by IDs
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (!videoIds.length) return [];
    
    this.logger.info('YouTube get video details', { count: videoIds.length });

    try {
      // Batch in groups of 50 (YouTube API limit)
      const results: YouTubeVideo[] = [];
      
      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const params = new URLSearchParams({
          part: 'snippet,contentDetails,status,statistics',
          id: batch.join(','),
          key: this.apiKey,
        });

        const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error('YouTube video details failed', { status: response.status, error: errorText });
          continue;
        }

        const data = await response.json();
        
        for (const item of data.items || []) {
          const durationMinutes = parseDurationToMinutes(item.contentDetails?.duration || '');
          
          results.push({
            id: item.id,
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            channelTitle: item.snippet?.channelTitle || '',
            channelId: item.snippet?.channelId || '',
            publishedAt: item.snippet?.publishedAt || '',
            thumbnailUrl: this.getBestThumbnail(item.snippet?.thumbnails),
            duration: item.contentDetails?.duration || '',
            durationMinutes,
            viewCount: parseInt(item.statistics?.viewCount || '0', 10),
            isEmbeddable: item.status?.embeddable === true,
            isPublic: item.status?.privacyStatus === 'public',
          });
        }
      }

      this.logger.info('YouTube video details complete', { resultCount: results.length });
      return results;
    } catch (error) {
      this.logger.error('YouTube video details error', { error: (error as Error).message });
      throw error;
    }
  }

  // Get best available thumbnail
  private getBestThumbnail(thumbnails: any): string | undefined {
    if (!thumbnails) return undefined;
    return thumbnails.maxres?.url || 
           thumbnails.standard?.url || 
           thumbnails.high?.url || 
           thumbnails.medium?.url || 
           thumbnails.default?.url;
  }

  // Verify video exists and is embeddable
  async verifyVideo(videoId: string): Promise<{ valid: boolean; video?: YouTubeVideo; reason?: string }> {
    this.logger.info('YouTube verify video', { videoId });
    
    try {
      const videos = await this.getVideoDetails([videoId]);
      
      if (!videos.length) {
        return { valid: false, reason: 'Video not found' };
      }

      const video = videos[0];
      
      if (!video.isPublic) {
        return { valid: false, video, reason: 'Video is private' };
      }
      
      if (!video.isEmbeddable) {
        return { valid: false, video, reason: 'Video is not embeddable' };
      }

      return { valid: true, video };
    } catch (error) {
      return { valid: false, reason: (error as Error).message };
    }
  }

  // Get playlist items
  async getPlaylistItems(playlistId: string, maxResults = 50): Promise<YouTubeVideo[]> {
    this.logger.info('YouTube get playlist items', { playlistId, maxResults });
    
    try {
      const videos: YouTubeVideo[] = [];
      let nextPageToken: string | undefined;

      do {
        const params = new URLSearchParams({
          part: 'snippet',
          playlistId,
          maxResults: String(Math.min(maxResults - videos.length, 50)),
          key: this.apiKey,
        });

        if (nextPageToken) {
          params.set('pageToken', nextPageToken);
        }

        const response = await fetch(`${YOUTUBE_API_BASE}/playlistItems?${params}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error('YouTube playlist items failed', { status: response.status, error: errorText });
          break;
        }

        const data = await response.json();
        
        for (const item of data.items || []) {
          videos.push({
            id: item.snippet?.resourceId?.videoId || '',
            title: item.snippet?.title || '',
            description: item.snippet?.description || '',
            channelTitle: item.snippet?.videoOwnerChannelTitle || '',
            channelId: item.snippet?.videoOwnerChannelId || '',
            publishedAt: item.snippet?.publishedAt || '',
            thumbnailUrl: this.getBestThumbnail(item.snippet?.thumbnails),
          });
        }

        nextPageToken = data.nextPageToken;
      } while (nextPageToken && videos.length < maxResults);

      this.logger.info('YouTube playlist items complete', { resultCount: videos.length });
      return videos;
    } catch (error) {
      this.logger.error('YouTube playlist items error', { error: (error as Error).message });
      throw error;
    }
  }
}

// Factory function for quick access
export function createYouTubeClient(options?: YouTubeClientOptions): YouTubeClient {
  return new YouTubeClient(options);
}
