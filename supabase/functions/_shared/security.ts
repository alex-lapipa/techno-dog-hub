// Security utilities for edge functions
// Security Improvements: Centralized auth validation and secret handling

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger, Logger } from './logger.ts';

// Admin role verification result
export interface AdminVerifyResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

// Create Supabase admin client (service role)
export function createAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Extract JWT token from Authorization header
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
}

// Verify user from JWT and check admin role
export async function verifyAdminAccess(
  req: Request, 
  logger?: Logger
): Promise<AdminVerifyResult> {
  const log = logger || createLogger('security');
  
  const token = extractBearerToken(req);
  if (!token) {
    log.warn('Missing authorization header');
    return { isAdmin: false, error: 'Authorization header required' };
  }

  try {
    const supabase = createAdminClient();
    
    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      log.warn('Invalid or expired token', { error: authError?.message });
      return { isAdmin: false, error: 'Invalid or expired token' };
    }

    // Check admin role in user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      log.error('Role check failed', { error: roleError.message });
      return { isAdmin: false, userId: user.id, email: user.email, error: 'Failed to verify admin status' };
    }

    const isAdmin = !!roleData;
    
    if (isAdmin) {
      log.info('Admin access verified', { userId: user.id });
    } else {
      log.warn('Non-admin access attempt', { userId: user.id, email: user.email });
    }

    return { isAdmin, userId: user.id, email: user.email };
  } catch (error) {
    log.error('Admin verification error', { error: (error as Error).message });
    return { isAdmin: false, error: 'Server error during verification' };
  }
}

// Rate limiting helper (simple in-memory, per-function instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string, 
  maxRequests: number, 
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.1) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
}

// IP extraction from request
export function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

// Webhook signature verification helper for generic webhooks
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm = 'sha256'
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: `SHA-${algorithm === 'sha256' ? '256' : '512'}` },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// Sanitize user input to prevent injection
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML/script tags
    .trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
