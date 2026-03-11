/**
 * Shared rate limiting utilities for edge functions.
 * Supports IP-based persistent rate limiting via Supabase RPC.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimitConfig {
  maxRequests: number;
  endpoint: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  endpoint: 'default',
};

/** Extract client IP from request headers */
export function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP.trim();

  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP.trim();

  return 'unknown';
}

/** Check persistent IP-based rate limit via Supabase RPC */
export async function checkRateLimit(
  supabaseUrl: string,
  supabaseKey: string,
  ip: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  const { maxRequests, endpoint } = { ...DEFAULT_CONFIG, ...config };
  const fallback: RateLimitResult = {
    allowed: true,
    remaining: maxRequests,
    resetAt: new Date(Date.now() + 60000),
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_ip_rate_limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        p_ip_address: ip,
        p_endpoint: endpoint,
        p_limit_per_minute: maxRequests,
      }),
    });

    if (!response.ok) {
      console.error('Rate limit check error:', response.status);
      return fallback;
    }

    const data = await response.json();
    const result = data?.[0];
    if (!result) return fallback;

    return {
      allowed: result.allowed,
      remaining: result.limit_remaining,
      resetAt: new Date(result.reset_at),
    };
  } catch (err) {
    console.error('Rate limit check exception:', err);
    return fallback;
  }
}

/** Check if the request bearer token belongs to an admin user */
export async function isAdminRequest(
  req: Request,
  supabaseUrl: string,
  anonKey: string
): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/has_role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: authHeader,
      },
      body: JSON.stringify({ _user_id: null, _role: 'admin' }),
    });

    if (response.ok) {
      const result = await response.json();
      return result === true;
    }
  } catch (err) {
    console.error('Admin check failed:', err);
  }
  return false;
}

/** Build standard rate-limit response headers */
export function rateLimitHeaders(
  isAdmin: boolean,
  rateLimit: RateLimitResult,
  maxRequests: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': isAdmin ? 'unlimited' : maxRequests.toString(),
    'X-RateLimit-Remaining': isAdmin ? 'unlimited' : rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt.getTime() / 1000).toString(),
  };
}
