// Unified Firecrawl client with consistent error handling and rate limiting
// Phase 1: Integration Consolidation

import { createLogger, Logger } from './logger.ts';

const FIRECRAWL_API_BASE = 'https://api.firecrawl.dev/v1';

export interface FirecrawlSearchResult {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
  html?: string;
}

export interface FirecrawlScrapeResult {
  url: string;
  markdown?: string;
  html?: string;
  metadata?: Record<string, unknown>;
}

export interface FirecrawlOptions {
  timeout?: number;
  retries?: number;
  logger?: Logger;
}

// Get the canonical Firecrawl API key (consolidates FIRECRAWL_API_KEY and FIRECRAWL_API_KEY_1)
export function getFirecrawlApiKey(): string {
  // Prefer FIRECRAWL_API_KEY as the canonical key
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
  
  if (!apiKey) {
    throw new Error('Firecrawl API key not configured (FIRECRAWL_API_KEY)');
  }
  
  return apiKey;
}

// Unified Firecrawl client
export class FirecrawlClient {
  private apiKey: string;
  private logger: Logger;
  private defaultTimeout: number;
  private maxRetries: number;

  constructor(options: FirecrawlOptions = {}) {
    this.apiKey = getFirecrawlApiKey();
    this.logger = options.logger || createLogger('firecrawl-client');
    this.defaultTimeout = options.timeout || 30000;
    this.maxRetries = options.retries || 2;
  }

  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries = this.maxRetries
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 429) {
          // Rate limited - wait and retry
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          this.logger.warn('Rate limited by Firecrawl', { attempt, waitTime });
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          const waitTime = 1000 * (attempt + 1);
          this.logger.warn('Firecrawl request failed, retrying', { 
            attempt, 
            error: lastError.message,
            waitTime 
          });
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw lastError || new Error('Firecrawl request failed after retries');
  }

  // Search the web
  async search(query: string, limit = 5): Promise<FirecrawlSearchResult[]> {
    this.logger.info('Firecrawl search', { query, limit });
    
    try {
      const response = await this.fetchWithRetry(`${FIRECRAWL_API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Firecrawl search failed', { status: response.status, error: errorText });
        throw new Error(`Firecrawl search failed: ${response.status}`);
      }

      const data = await response.json();
      this.logger.info('Firecrawl search complete', { resultCount: data.data?.length || 0 });
      
      return data.data || [];
    } catch (error) {
      this.logger.error('Firecrawl search error', { error: (error as Error).message });
      throw error;
    }
  }

  // Scrape a single URL
  async scrape(url: string, formats = ['markdown']): Promise<FirecrawlScrapeResult | null> {
    this.logger.info('Firecrawl scrape', { url });
    
    try {
      const response = await this.fetchWithRetry(`${FIRECRAWL_API_BASE}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Firecrawl scrape failed', { url, status: response.status, error: errorText });
        return null;
      }

      const data = await response.json();
      this.logger.info('Firecrawl scrape complete', { url, hasMarkdown: !!data.data?.markdown });
      
      return data.data || null;
    } catch (error) {
      this.logger.error('Firecrawl scrape error', { url, error: (error as Error).message });
      return null;
    }
  }

  // Crawl a website (multiple pages)
  async crawl(
    url: string, 
    options: { maxPages?: number; includePaths?: string[] } = {}
  ): Promise<FirecrawlScrapeResult[]> {
    const { maxPages = 10, includePaths } = options;
    this.logger.info('Firecrawl crawl', { url, maxPages });
    
    try {
      const body: Record<string, unknown> = {
        url,
        limit: maxPages,
      };
      
      if (includePaths?.length) {
        body.includePaths = includePaths;
      }

      const response = await this.fetchWithRetry(`${FIRECRAWL_API_BASE}/crawl`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('Firecrawl crawl failed', { url, status: response.status, error: errorText });
        return [];
      }

      const data = await response.json();
      this.logger.info('Firecrawl crawl complete', { url, pageCount: data.data?.length || 0 });
      
      return data.data || [];
    } catch (error) {
      this.logger.error('Firecrawl crawl error', { url, error: (error as Error).message });
      return [];
    }
  }
}

// Factory function for quick access
export function createFirecrawlClient(options?: FirecrawlOptions): FirecrawlClient {
  return new FirecrawlClient(options);
}
