/**
 * Brand Image Validator - MANDATORY ENFORCEMENT
 * 
 * ZERO TOLERANCE POLICY:
 * - ONLY official brand book images allowed
 * - ONLY user-uploaded images with explicit approval
 * - NO AI-generated mascots or brand elements
 * - ALL outputs must be Shopify-ready format
 * 
 * This edge function validates image sources before any product creation.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// APPROVED IMAGE SOURCES - HARDCODED, IMMUTABLE
const APPROVED_IMAGE_SOURCES = {
  // User uploads (must be explicitly provided by user)
  userUploads: /^user-uploads:\/\//,
  
  // Official brand book assets
  brandBookPaths: [
    '/images/las-querodias-official.png',
    '/images/techno-dog-logo',
    '/assets/doggies/',
    '/assets/brand/',
    'public/images/',
  ],
  
  // Official Techno Doggies SVG pack (94 variants)
  officialMascotPattern: /^(dj|raving|ninja|space|grumpy|acid|warehouse|berlin|detroit|minimal|industrial|dark|peak-time|afterhours|vinyl|modular|analog|digital|808|303|909|tb|tr|sh|moog|prophet|juno|jupiter|oberheim|arp|sequential|korg|roland|yamaha|elektron|teenage|mutable|make-noise|buchla|serge|eurorack|cv|gate|midi|sync|clock|lfo|vco|vcf|vca|env|adsr|filter|resonance|cutoff|oscillator|waveform|sine|saw|square|triangle|pulse|noise|sub|bass|kick|snare|hat|clap|rim|tom|perc|fx|delay|reverb|chorus|flanger|phaser|distortion|saturation|compression|eq|sidechain|ducking|pumping|groove|swing|shuffle|humanize|quantize|step|sequence|pattern|loop)-dog$/,
  
  // Shopify CDN (for existing products)
  shopifyCdn: /^https:\/\/cdn\.shopify\.com\//,
};

// FORBIDDEN SOURCES - ALWAYS REJECT
const FORBIDDEN_SOURCES = [
  /^data:image\/.*base64/i, // No inline base64 from AI generation
  /blob:/i, // No blob URLs from canvas manipulation
  /placeholder/i, // No placeholder images
  /unsplash/i, // No stock photos
  /pexels/i,
  /shutterstock/i,
  /getty/i,
  /istock/i,
  /stock/i,
  /lorem/i,
  /picsum/i,
];

// SHOPIFY FORMAT REQUIREMENTS
const SHOPIFY_REQUIREMENTS = {
  supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxFileSizeMB: 20,
  recommendedDimensions: {
    product: { width: 2048, height: 2048 },
    lifestyle: { width: 1920, height: 1080 },
    thumbnail: { width: 400, height: 400 },
  },
  aspectRatios: ['1:1', '4:3', '16:9', '3:4'],
};

interface ValidationRequest {
  imageUrl?: string;
  imagePath?: string;
  imageSource?: 'user-upload' | 'brand-book' | 'ai-generated' | 'external';
  productType?: string;
  brandBook?: 'techno-dog' | 'techno-doggies';
  action: 'validate' | 'approve' | 'reject' | 'list-approved';
}

interface ValidationResult {
  approved: boolean;
  reason: string;
  shopifyReady: boolean;
  source: string;
  recommendations?: string[];
  violations?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      imageUrl, 
      imagePath, 
      imageSource,
      productType,
      brandBook,
      action = 'validate'
    }: ValidationRequest = await req.json();

    // Action: List all approved sources
    if (action === 'list-approved') {
      return new Response(JSON.stringify({
        approvedSources: {
          userUploads: 'user-uploads://* (explicitly provided by user)',
          brandBookPaths: APPROVED_IMAGE_SOURCES.brandBookPaths,
          officialMascots: '94 Techno Doggies variants (stroke-based SVG only)',
          shopifyCdn: 'Existing Shopify product images',
        },
        forbiddenSources: [
          'AI-generated mascots or brand elements',
          'Stock photo services (Unsplash, Pexels, etc.)',
          'Placeholder images',
          'Base64-encoded AI outputs',
        ],
        shopifyRequirements: SHOPIFY_REQUIREMENTS,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pathToValidate = imageUrl || imagePath || '';
    const violations: string[] = [];
    const recommendations: string[] = [];
    let approved = false;
    let source = 'unknown';

    // STEP 1: Check for FORBIDDEN sources first
    for (const forbidden of FORBIDDEN_SOURCES) {
      if (forbidden.test(pathToValidate)) {
        violations.push(`FORBIDDEN SOURCE DETECTED: ${forbidden.toString()}`);
        return new Response(JSON.stringify({
          approved: false,
          reason: 'Image source is explicitly forbidden by brand compliance policy',
          shopifyReady: false,
          source: 'forbidden',
          violations,
        } as ValidationResult), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // STEP 2: Validate against APPROVED sources
    
    // Check user uploads
    if (APPROVED_IMAGE_SOURCES.userUploads.test(pathToValidate)) {
      approved = true;
      source = 'user-upload';
      recommendations.push('User-provided image approved. Ensure it meets Shopify format requirements.');
    }
    
    // Check brand book paths
    for (const brandPath of APPROVED_IMAGE_SOURCES.brandBookPaths) {
      if (pathToValidate.includes(brandPath)) {
        approved = true;
        source = 'brand-book';
        break;
      }
    }

    // Check official mascot pattern
    if (APPROVED_IMAGE_SOURCES.officialMascotPattern.test(pathToValidate)) {
      approved = true;
      source = 'official-mascot';
      recommendations.push('Official Techno Doggy variant detected. Use stroke-based SVG only.');
    }

    // Check Shopify CDN
    if (APPROVED_IMAGE_SOURCES.shopifyCdn.test(pathToValidate)) {
      approved = true;
      source = 'shopify-cdn';
    }

    // STEP 3: AI-generated content special handling
    if (imageSource === 'ai-generated') {
      // AI-generated is ONLY allowed for:
      // - Blank product mockups (no graphics)
      // - Lifestyle/environment shots (no brand elements)
      if (brandBook === 'techno-doggies') {
        violations.push('AI-generated mascots are FORBIDDEN. Use official SVG pack only.');
        approved = false;
      } else if (brandBook === 'techno-dog') {
        violations.push('AI-generated brand elements are FORBIDDEN. Use official assets only.');
        approved = false;
      } else {
        // Allow blank mockups only
        recommendations.push('AI-generated blank mockups allowed. Official assets must be composited client-side.');
        source = 'ai-blank-mockup';
        approved = true;
      }
    }

    // STEP 4: Check Shopify format compliance
    const extension = pathToValidate.split('.').pop()?.toLowerCase() || '';
    const shopifyReady = SHOPIFY_REQUIREMENTS.supportedFormats.includes(extension) || 
                         pathToValidate.startsWith('user-uploads://') ||
                         APPROVED_IMAGE_SOURCES.shopifyCdn.test(pathToValidate);

    if (!shopifyReady && approved) {
      recommendations.push(`Convert to Shopify-supported format: ${SHOPIFY_REQUIREMENTS.supportedFormats.join(', ')}`);
    }

    // STEP 5: If still not approved, it's an unknown/unauthorized source
    if (!approved && violations.length === 0) {
      violations.push('Image source not in approved list. Use official brand book assets or user-uploaded images only.');
    }

    const result: ValidationResult = {
      approved,
      reason: approved 
        ? `Image approved from source: ${source}` 
        : 'Image rejected - not from approved source',
      shopifyReady,
      source,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      violations: violations.length > 0 ? violations : undefined,
    };

    // Log validation for audit
    console.log(`[Brand Validator] ${approved ? 'APPROVED' : 'REJECTED'}: ${pathToValidate.substring(0, 100)} | Source: ${source}`);

    return new Response(JSON.stringify(result), {
      status: approved ? 200 : 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Brand Image Validator Error:", e);
    return new Response(JSON.stringify({ 
      approved: false,
      reason: 'Validation error occurred',
      error: e instanceof Error ? e.message : "Unknown error" 
    }), {
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
