/**
 * Shopify Product Catalog Step
 * 
 * Browse the complete Shopify print-on-demand product catalog
 * with real products, sizes, colors, and quality options.
 * 
 * IMPORTANT: This catalog represents POD (Print-on-Demand) TEMPLATES
 * aligned with Printful/Printify/Gooten fulfillment standards.
 * 
 * These templates define:
 * - Available print areas and dimensions
 * - Size charts and measurements
 * - Color options from fulfillment providers
 * - Base pricing from POD providers
 * 
 * DISTINCTION FROM LIVE SHOPIFY PRODUCTS:
 * - Live Shopify products are the ACTUAL products in your store
 *   (e.g., "DJ Dog Hoodie", "Berghain Dog T-Shirt")
 * - This catalog provides the BLANK PRODUCT TEMPLATES that can be
 *   customized with your designs and published to Shopify
 * 
 * The Creative Studio workflow:
 * 1. Select a POD template from this catalog
 * 2. Design your product with mascot/artwork
 * 3. Generate AI preview
 * 4. Publish to Shopify as a new product
 */

import { useState, useMemo } from 'react';
import {
  Package, Search, Filter, ChevronDown, Check, 
  Shirt, ShoppingBag, Coffee, Palette, Ruler, 
  Star, Info, ExternalLink, Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// ============================================================================
// SHOPIFY PRINT-ON-DEMAND CATALOG
// Complete product catalog aligned with Printful/Printify/Gooten standards
// ============================================================================

export interface ShopifyCatalogProduct {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  provider: 'printful' | 'printify' | 'gooten';
  basePrice: number;
  currency: string;
  description: string;
  printAreas: PrintArea[];
  sizes: SizeOption[];
  colors: ColorOption[];
  materials: string[];
  quality: 'standard' | 'premium' | 'eco';
  productionDays: number;
  imageUrl?: string;
  featured?: boolean;
}

export type ProductCategory = 
  | 'apparel'
  | 'accessories'
  | 'home-living'
  | 'drinkware'
  | 'stationery'
  | 'tech'
  | 'bags';

export interface PrintArea {
  id: string;
  name: string;
  maxWidth: number;
  maxHeight: number;
  unit: 'in' | 'cm';
}

export interface SizeOption {
  code: string;
  name: string;
  measurements?: {
    chest?: string;
    length?: string;
    sleeve?: string;
  };
}

export interface ColorOption {
  code: string;
  name: string;
  hex: string;
  inStock: boolean;
}

// Complete Shopify POD Catalog
const SHOPIFY_CATALOG: ShopifyCatalogProduct[] = [
  // ========== APPAREL ==========
  {
    id: 'unisex-heavyweight-tee',
    name: 'Unisex Heavyweight T-Shirt',
    category: 'apparel',
    subcategory: 'T-Shirts',
    provider: 'printful',
    basePrice: 24.99,
    currency: 'USD',
    description: 'Premium 100% ring-spun cotton heavyweight tee with a relaxed fit. Perfect for bold designs.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 16, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 12, maxHeight: 16, unit: 'in' },
      { id: 'left-sleeve', name: 'Left Sleeve', maxWidth: 4, maxHeight: 4, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small', measurements: { chest: '36-38"', length: '28"' } },
      { code: 'M', name: 'Medium', measurements: { chest: '39-41"', length: '29"' } },
      { code: 'L', name: 'Large', measurements: { chest: '42-44"', length: '30"' } },
      { code: 'XL', name: 'X-Large', measurements: { chest: '45-48"', length: '31"' } },
      { code: '2XL', name: '2X-Large', measurements: { chest: '49-52"', length: '32"' } },
      { code: '3XL', name: '3X-Large', measurements: { chest: '53-56"', length: '33"' } },
    ],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
      { code: 'navy', name: 'Navy', hex: '#1e3a5f', inStock: true },
      { code: 'charcoal', name: 'Charcoal', hex: '#36454f', inStock: true },
      { code: 'forest', name: 'Forest Green', hex: '#228b22', inStock: true },
    ],
    materials: ['100% Ring-Spun Cotton', '6.1 oz'],
    quality: 'premium',
    productionDays: 3,
    featured: true,
  },
  {
    id: 'organic-cotton-tee',
    name: 'Organic Cotton T-Shirt',
    category: 'apparel',
    subcategory: 'T-Shirts',
    provider: 'printful',
    basePrice: 29.99,
    currency: 'USD',
    description: 'GOTS certified organic cotton tee. Eco-friendly and ethically made.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 12, maxHeight: 14, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small' },
      { code: 'M', name: 'Medium' },
      { code: 'L', name: 'Large' },
      { code: 'XL', name: 'X-Large' },
      { code: '2XL', name: '2X-Large' },
    ],
    colors: [
      { code: 'natural', name: 'Natural', hex: '#f5f5dc', inStock: true },
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'sage', name: 'Sage', hex: '#9dc183', inStock: true },
    ],
    materials: ['100% Organic Cotton', 'GOTS Certified'],
    quality: 'eco',
    productionDays: 4,
  },
  {
    id: 'pullover-hoodie',
    name: 'Unisex Pullover Hoodie',
    category: 'apparel',
    subcategory: 'Hoodies',
    provider: 'printful',
    basePrice: 44.99,
    currency: 'USD',
    description: 'Classic pullover hoodie with soft fleece lining. Kangaroo pocket and adjustable drawstring hood.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, unit: 'in' },
      { id: 'left-chest', name: 'Left Chest', maxWidth: 4, maxHeight: 4, unit: 'in' },
      { id: 'hood', name: 'Hood', maxWidth: 6, maxHeight: 6, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small', measurements: { chest: '38"', length: '27"' } },
      { code: 'M', name: 'Medium', measurements: { chest: '41"', length: '28"' } },
      { code: 'L', name: 'Large', measurements: { chest: '44"', length: '29"' } },
      { code: 'XL', name: 'X-Large', measurements: { chest: '47"', length: '30"' } },
      { code: '2XL', name: '2X-Large', measurements: { chest: '50"', length: '31"' } },
    ],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'heather-grey', name: 'Heather Grey', hex: '#9a9a9a', inStock: true },
      { code: 'navy', name: 'Navy', hex: '#1e3a5f', inStock: true },
      { code: 'burgundy', name: 'Burgundy', hex: '#800020', inStock: true },
    ],
    materials: ['80% Cotton, 20% Polyester', 'Fleece Lined'],
    quality: 'premium',
    productionDays: 4,
    featured: true,
  },
  {
    id: 'zip-hoodie',
    name: 'Unisex Zip Hoodie',
    category: 'apparel',
    subcategory: 'Hoodies',
    provider: 'printful',
    basePrice: 49.99,
    currency: 'USD',
    description: 'Full-zip hoodie with metal zipper and split kangaroo pockets.',
    printAreas: [
      { id: 'left-chest', name: 'Left Chest', maxWidth: 4, maxHeight: 4, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, unit: 'in' },
      { id: 'right-arm', name: 'Right Arm', maxWidth: 4, maxHeight: 12, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small' },
      { code: 'M', name: 'Medium' },
      { code: 'L', name: 'Large' },
      { code: 'XL', name: 'X-Large' },
      { code: '2XL', name: '2X-Large' },
    ],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'grey', name: 'Grey', hex: '#808080', inStock: true },
    ],
    materials: ['80% Cotton, 20% Polyester'],
    quality: 'premium',
    productionDays: 4,
  },
  {
    id: 'crewneck-sweatshirt',
    name: 'Crewneck Sweatshirt',
    category: 'apparel',
    subcategory: 'Sweatshirts',
    provider: 'printful',
    basePrice: 39.99,
    currency: 'USD',
    description: 'Classic crewneck sweatshirt with ribbed cuffs and hem.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small' },
      { code: 'M', name: 'Medium' },
      { code: 'L', name: 'Large' },
      { code: 'XL', name: 'X-Large' },
      { code: '2XL', name: '2X-Large' },
    ],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
      { code: 'navy', name: 'Navy', hex: '#1e3a5f', inStock: true },
    ],
    materials: ['80% Cotton, 20% Polyester'],
    quality: 'standard',
    productionDays: 3,
  },
  {
    id: 'tank-top',
    name: 'Unisex Tank Top',
    category: 'apparel',
    subcategory: 'Tanks',
    provider: 'printful',
    basePrice: 22.99,
    currency: 'USD',
    description: 'Lightweight tank top perfect for festivals and summer.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 10, maxHeight: 14, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 10, maxHeight: 14, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small' },
      { code: 'M', name: 'Medium' },
      { code: 'L', name: 'Large' },
      { code: 'XL', name: 'X-Large' },
    ],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
      { code: 'neon-yellow', name: 'Neon Yellow', hex: '#f0ff00', inStock: true },
    ],
    materials: ['100% Cotton', 'Lightweight'],
    quality: 'standard',
    productionDays: 3,
  },
  {
    id: 'long-sleeve-tee',
    name: 'Long Sleeve T-Shirt',
    category: 'apparel',
    subcategory: 'T-Shirts',
    provider: 'printful',
    basePrice: 29.99,
    currency: 'USD',
    description: 'Classic long sleeve tee with ribbed cuffs.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 12, maxHeight: 14, unit: 'in' },
      { id: 'left-sleeve', name: 'Left Sleeve', maxWidth: 4, maxHeight: 12, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small' },
      { code: 'M', name: 'Medium' },
      { code: 'L', name: 'Large' },
      { code: 'XL', name: 'X-Large' },
      { code: '2XL', name: '2X-Large' },
    ],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
    ],
    materials: ['100% Cotton'],
    quality: 'standard',
    productionDays: 3,
  },

  // ========== ACCESSORIES ==========
  {
    id: 'dad-hat',
    name: 'Dad Hat',
    category: 'accessories',
    subcategory: 'Hats',
    provider: 'printful',
    basePrice: 24.99,
    currency: 'USD',
    description: 'Classic unstructured 6-panel cap with embroidery.',
    printAreas: [
      { id: 'front', name: 'Front Panel', maxWidth: 2.5, maxHeight: 2, unit: 'in' },
      { id: 'side', name: 'Side', maxWidth: 2, maxHeight: 2, unit: 'in' },
    ],
    sizes: [{ code: 'OS', name: 'One Size' }],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
      { code: 'navy', name: 'Navy', hex: '#1e3a5f', inStock: true },
      { code: 'olive', name: 'Olive', hex: '#556b2f', inStock: true },
    ],
    materials: ['100% Cotton Twill', 'Adjustable Strap'],
    quality: 'premium',
    productionDays: 5,
    featured: true,
  },
  {
    id: 'snapback',
    name: 'Snapback Cap',
    category: 'accessories',
    subcategory: 'Hats',
    provider: 'printful',
    basePrice: 29.99,
    currency: 'USD',
    description: 'Structured 6-panel snapback with flat bill.',
    printAreas: [
      { id: 'front', name: 'Front Panel', maxWidth: 3, maxHeight: 2.5, unit: 'in' },
    ],
    sizes: [{ code: 'OS', name: 'One Size' }],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'black-grey', name: 'Black/Grey', hex: '#1a1a1a', inStock: true },
    ],
    materials: ['Acrylic/Wool Blend'],
    quality: 'premium',
    productionDays: 5,
  },
  {
    id: 'beanie',
    name: 'Cuffed Beanie',
    category: 'accessories',
    subcategory: 'Hats',
    provider: 'printful',
    basePrice: 22.99,
    currency: 'USD',
    description: 'Warm knit beanie with embroidered patch.',
    printAreas: [
      { id: 'front', name: 'Front Cuff', maxWidth: 2.5, maxHeight: 1.5, unit: 'in' },
    ],
    sizes: [{ code: 'OS', name: 'One Size' }],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'grey', name: 'Grey', hex: '#808080', inStock: true },
      { code: 'neon-green', name: 'Neon Green', hex: '#39ff14', inStock: true },
    ],
    materials: ['100% Acrylic Knit'],
    quality: 'standard',
    productionDays: 5,
  },
  {
    id: 'bandana',
    name: 'All-Over Print Bandana',
    category: 'accessories',
    subcategory: 'Accessories',
    provider: 'printful',
    basePrice: 14.99,
    currency: 'USD',
    description: 'Full color all-over print bandana.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 22, maxHeight: 22, unit: 'in' },
    ],
    sizes: [{ code: 'OS', name: '22" x 22"' }],
    colors: [
      { code: 'custom', name: 'Custom Print', hex: '#ffffff', inStock: true },
    ],
    materials: ['100% Polyester'],
    quality: 'standard',
    productionDays: 3,
  },
  {
    id: 'socks',
    name: 'Crew Socks',
    category: 'accessories',
    subcategory: 'Accessories',
    provider: 'printify',
    basePrice: 14.99,
    currency: 'USD',
    description: 'All-over print sublimation crew socks.',
    printAreas: [
      { id: 'full', name: 'Full Sock', maxWidth: 8, maxHeight: 16, unit: 'in' },
    ],
    sizes: [
      { code: 'S', name: 'Small (6-8)' },
      { code: 'M', name: 'Medium (8-12)' },
      { code: 'L', name: 'Large (12-14)' },
    ],
    colors: [
      { code: 'white', name: 'White Base', hex: '#ffffff', inStock: true },
    ],
    materials: ['Polyester/Spandex Blend'],
    quality: 'standard',
    productionDays: 4,
  },

  // ========== BAGS ==========
  {
    id: 'canvas-tote',
    name: 'Canvas Tote Bag',
    category: 'bags',
    subcategory: 'Totes',
    provider: 'printful',
    basePrice: 19.99,
    currency: 'USD',
    description: 'Heavy-duty canvas tote with reinforced handles.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 12, maxHeight: 14, unit: 'in' },
    ],
    sizes: [{ code: 'OS', name: '15" x 16"' }],
    colors: [
      { code: 'natural', name: 'Natural', hex: '#f5f5dc', inStock: true },
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
    ],
    materials: ['12 oz Cotton Canvas'],
    quality: 'eco',
    productionDays: 3,
    featured: true,
  },
  {
    id: 'drawstring-bag',
    name: 'Drawstring Backpack',
    category: 'bags',
    subcategory: 'Backpacks',
    provider: 'printful',
    basePrice: 17.99,
    currency: 'USD',
    description: 'Lightweight drawstring bag for everyday carry.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, unit: 'in' },
    ],
    sizes: [{ code: 'OS', name: '14" x 17"' }],
    colors: [
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
    ],
    materials: ['Polyester'],
    quality: 'standard',
    productionDays: 3,
  },
  {
    id: 'fanny-pack',
    name: 'Fanny Pack',
    category: 'bags',
    subcategory: 'Bags',
    provider: 'printful',
    basePrice: 29.99,
    currency: 'USD',
    description: 'All-over print fanny pack with adjustable strap.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 12, maxHeight: 5, unit: 'in' },
    ],
    sizes: [{ code: 'OS', name: 'One Size' }],
    colors: [
      { code: 'custom', name: 'Custom Print', hex: '#ffffff', inStock: true },
    ],
    materials: ['Polyester', 'Water-Resistant'],
    quality: 'premium',
    productionDays: 5,
  },

  // ========== DRINKWARE ==========
  {
    id: 'ceramic-mug-11oz',
    name: 'Ceramic Mug (11oz)',
    category: 'drinkware',
    subcategory: 'Mugs',
    provider: 'printful',
    basePrice: 14.99,
    currency: 'USD',
    description: 'Classic ceramic mug with wraparound print.',
    printAreas: [
      { id: 'wrap', name: 'Wraparound', maxWidth: 8.5, maxHeight: 3.5, unit: 'in' },
    ],
    sizes: [{ code: '11oz', name: '11 oz' }],
    colors: [
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
    ],
    materials: ['Ceramic', 'Dishwasher Safe'],
    quality: 'standard',
    productionDays: 3,
    featured: true,
  },
  {
    id: 'ceramic-mug-15oz',
    name: 'Ceramic Mug (15oz)',
    category: 'drinkware',
    subcategory: 'Mugs',
    provider: 'printful',
    basePrice: 17.99,
    currency: 'USD',
    description: 'Large ceramic mug for coffee enthusiasts.',
    printAreas: [
      { id: 'wrap', name: 'Wraparound', maxWidth: 9, maxHeight: 4, unit: 'in' },
    ],
    sizes: [{ code: '15oz', name: '15 oz' }],
    colors: [
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
    ],
    materials: ['Ceramic', 'Dishwasher Safe'],
    quality: 'standard',
    productionDays: 3,
  },
  {
    id: 'travel-mug',
    name: 'Stainless Steel Travel Mug',
    category: 'drinkware',
    subcategory: 'Mugs',
    provider: 'printful',
    basePrice: 29.99,
    currency: 'USD',
    description: 'Double-wall insulated travel mug with lid.',
    printAreas: [
      { id: 'wrap', name: 'Wraparound', maxWidth: 8, maxHeight: 3.5, unit: 'in' },
    ],
    sizes: [{ code: '14oz', name: '14 oz' }],
    colors: [
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
      { code: 'silver', name: 'Silver', hex: '#c0c0c0', inStock: true },
    ],
    materials: ['Stainless Steel', 'Double-Wall Insulated'],
    quality: 'premium',
    productionDays: 4,
  },
  {
    id: 'water-bottle',
    name: 'Stainless Steel Water Bottle',
    category: 'drinkware',
    subcategory: 'Bottles',
    provider: 'printful',
    basePrice: 24.99,
    currency: 'USD',
    description: 'Insulated water bottle keeps drinks cold 24hrs or hot 12hrs.',
    printAreas: [
      { id: 'wrap', name: 'Wraparound', maxWidth: 9, maxHeight: 3, unit: 'in' },
    ],
    sizes: [{ code: '17oz', name: '17 oz' }],
    colors: [
      { code: 'white', name: 'White', hex: '#ffffff', inStock: true },
      { code: 'black', name: 'Black', hex: '#1a1a1a', inStock: true },
    ],
    materials: ['Stainless Steel', 'BPA-Free'],
    quality: 'premium',
    productionDays: 4,
  },

  // ========== HOME & LIVING ==========
  {
    id: 'poster-18x24',
    name: 'Poster (18x24)',
    category: 'home-living',
    subcategory: 'Wall Art',
    provider: 'printful',
    basePrice: 19.99,
    currency: 'USD',
    description: 'Museum-quality poster on thick matte paper.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 18, maxHeight: 24, unit: 'in' },
    ],
    sizes: [{ code: '18x24', name: '18" x 24"' }],
    colors: [
      { code: 'matte', name: 'Matte Paper', hex: '#ffffff', inStock: true },
    ],
    materials: ['175gsm Fine Art Paper'],
    quality: 'premium',
    productionDays: 3,
  },
  {
    id: 'poster-24x36',
    name: 'Poster (24x36)',
    category: 'home-living',
    subcategory: 'Wall Art',
    provider: 'printful',
    basePrice: 29.99,
    currency: 'USD',
    description: 'Large format museum-quality poster.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 24, maxHeight: 36, unit: 'in' },
    ],
    sizes: [{ code: '24x36', name: '24" x 36"' }],
    colors: [
      { code: 'matte', name: 'Matte Paper', hex: '#ffffff', inStock: true },
    ],
    materials: ['175gsm Fine Art Paper'],
    quality: 'premium',
    productionDays: 3,
  },
  {
    id: 'canvas-16x20',
    name: 'Canvas Print (16x20)',
    category: 'home-living',
    subcategory: 'Wall Art',
    provider: 'printful',
    basePrice: 49.99,
    currency: 'USD',
    description: 'Gallery-wrapped canvas on wooden stretcher bars.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 16, maxHeight: 20, unit: 'in' },
    ],
    sizes: [{ code: '16x20', name: '16" x 20"' }],
    colors: [
      { code: 'canvas', name: 'Canvas', hex: '#f5f5f5', inStock: true },
    ],
    materials: ['Cotton/Poly Canvas', '1.25" Stretcher Bars'],
    quality: 'premium',
    productionDays: 5,
  },
  {
    id: 'throw-pillow',
    name: 'Throw Pillow',
    category: 'home-living',
    subcategory: 'Home Decor',
    provider: 'printful',
    basePrice: 24.99,
    currency: 'USD',
    description: 'Double-sided print throw pillow with insert.',
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 16, maxHeight: 16, unit: 'in' },
      { id: 'back', name: 'Back', maxWidth: 16, maxHeight: 16, unit: 'in' },
    ],
    sizes: [
      { code: '16x16', name: '16" x 16"' },
      { code: '18x18', name: '18" x 18"' },
    ],
    colors: [
      { code: 'custom', name: 'Custom Print', hex: '#ffffff', inStock: true },
    ],
    materials: ['Polyester Cover', 'Synthetic Insert'],
    quality: 'standard',
    productionDays: 4,
  },
  {
    id: 'blanket',
    name: 'Sherpa Fleece Blanket',
    category: 'home-living',
    subcategory: 'Home Decor',
    provider: 'printful',
    basePrice: 49.99,
    currency: 'USD',
    description: 'Ultra-soft sherpa fleece blanket with custom print.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 50, maxHeight: 60, unit: 'in' },
    ],
    sizes: [{ code: '50x60', name: '50" x 60"' }],
    colors: [
      { code: 'custom', name: 'Custom Print', hex: '#ffffff', inStock: true },
    ],
    materials: ['Polyester Front', 'Sherpa Fleece Back'],
    quality: 'premium',
    productionDays: 5,
  },

  // ========== STATIONERY ==========
  {
    id: 'sticker-sheet',
    name: 'Sticker Sheet',
    category: 'stationery',
    subcategory: 'Stickers',
    provider: 'printful',
    basePrice: 4.99,
    currency: 'USD',
    description: 'Die-cut stickers on a 4x6 sheet.',
    printAreas: [
      { id: 'sheet', name: 'Sheet', maxWidth: 4, maxHeight: 6, unit: 'in' },
    ],
    sizes: [{ code: '4x6', name: '4" x 6" Sheet' }],
    colors: [
      { code: 'white', name: 'White Vinyl', hex: '#ffffff', inStock: true },
      { code: 'clear', name: 'Clear Vinyl', hex: 'transparent', inStock: true },
    ],
    materials: ['Vinyl', 'Waterproof'],
    quality: 'standard',
    productionDays: 3,
    featured: true,
  },
  {
    id: 'notebook',
    name: 'Spiral Notebook',
    category: 'stationery',
    subcategory: 'Notebooks',
    provider: 'printful',
    basePrice: 14.99,
    currency: 'USD',
    description: 'Spiral-bound notebook with custom cover.',
    printAreas: [
      { id: 'cover', name: 'Cover', maxWidth: 5.5, maxHeight: 8.5, unit: 'in' },
    ],
    sizes: [{ code: '5.5x8.5', name: '5.5" x 8.5"' }],
    colors: [
      { code: 'custom', name: 'Custom Cover', hex: '#ffffff', inStock: true },
    ],
    materials: ['Cardstock Cover', 'Lined Pages'],
    quality: 'standard',
    productionDays: 4,
  },

  // ========== TECH ==========
  {
    id: 'phone-case-iphone',
    name: 'iPhone Case',
    category: 'tech',
    subcategory: 'Phone Cases',
    provider: 'printful',
    basePrice: 24.99,
    currency: 'USD',
    description: 'Tough snap case for iPhone with custom print.',
    printAreas: [
      { id: 'back', name: 'Back', maxWidth: 3, maxHeight: 5, unit: 'in' },
    ],
    sizes: [
      { code: 'iphone-14', name: 'iPhone 14' },
      { code: 'iphone-14-pro', name: 'iPhone 14 Pro' },
      { code: 'iphone-15', name: 'iPhone 15' },
      { code: 'iphone-15-pro', name: 'iPhone 15 Pro' },
    ],
    colors: [
      { code: 'glossy', name: 'Glossy', hex: '#ffffff', inStock: true },
      { code: 'matte', name: 'Matte', hex: '#f5f5f5', inStock: true },
    ],
    materials: ['Polycarbonate', 'Shock-Absorbing'],
    quality: 'premium',
    productionDays: 4,
  },
  {
    id: 'mousepad',
    name: 'Mousepad',
    category: 'tech',
    subcategory: 'Accessories',
    provider: 'printful',
    basePrice: 14.99,
    currency: 'USD',
    description: 'Custom printed mousepad with anti-slip backing.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 9, maxHeight: 8, unit: 'in' },
    ],
    sizes: [{ code: '9x8', name: '9" x 8"' }],
    colors: [
      { code: 'custom', name: 'Custom Print', hex: '#ffffff', inStock: true },
    ],
    materials: ['Fabric Top', 'Rubber Base'],
    quality: 'standard',
    productionDays: 3,
  },
  {
    id: 'desk-mat',
    name: 'Desk Mat',
    category: 'tech',
    subcategory: 'Accessories',
    provider: 'printful',
    basePrice: 34.99,
    currency: 'USD',
    description: 'Large format desk mat with all-over print.',
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 31, maxHeight: 15, unit: 'in' },
    ],
    sizes: [{ code: '31x15', name: '31" x 15"' }],
    colors: [
      { code: 'custom', name: 'Custom Print', hex: '#ffffff', inStock: true },
    ],
    materials: ['Fabric Top', 'Non-Slip Rubber Base'],
    quality: 'premium',
    productionDays: 4,
  },
];

// Category metadata
const CATEGORIES: { id: ProductCategory; label: string; icon: typeof Shirt }[] = [
  { id: 'apparel', label: 'Apparel', icon: Shirt },
  { id: 'accessories', label: 'Accessories', icon: Star },
  { id: 'bags', label: 'Bags', icon: ShoppingBag },
  { id: 'drinkware', label: 'Drinkware', icon: Coffee },
  { id: 'home-living', label: 'Home & Living', icon: Package },
  { id: 'stationery', label: 'Stationery', icon: Package },
  { id: 'tech', label: 'Tech', icon: Package },
];

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface StepShopifyCatalogProps {
  selectedProduct: ShopifyCatalogProduct | null;
  selectedSize: string | null;
  selectedColor: string | null;
  onSelectProduct: (product: ShopifyCatalogProduct | null) => void;
  onSelectSize: (size: string | null) => void;
  onSelectColor: (color: string | null) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepShopifyCatalog({
  selectedProduct,
  selectedSize,
  selectedColor,
  onSelectProduct,
  onSelectSize,
  onSelectColor,
}: StepShopifyCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return SHOPIFY_CATALOG.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesQuality = qualityFilter === 'all' || product.quality === qualityFilter;
      
      return matchesSearch && matchesCategory && matchesQuality;
    });
  }, [searchQuery, activeCategory, qualityFilter]);

  // Group by subcategory
  const groupedProducts = useMemo(() => {
    const groups: Record<string, ShopifyCatalogProduct[]> = {};
    filteredProducts.forEach(product => {
      if (!groups[product.subcategory]) {
        groups[product.subcategory] = [];
      }
      groups[product.subcategory].push(product);
    });
    return groups;
  }, [filteredProducts]);

  const handleSelectProduct = (product: ShopifyCatalogProduct) => {
    if (selectedProduct?.id === product.id) {
      onSelectProduct(null);
      onSelectSize(null);
      onSelectColor(null);
    } else {
      onSelectProduct(product);
      // Auto-select first size and color
      onSelectSize(product.sizes[0]?.code || null);
      onSelectColor(product.colors.find(c => c.inStock)?.code || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          Shopify Product Catalog
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Browse {SHOPIFY_CATALOG.length} products from Shopify's print-on-demand providers
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={qualityFilter} onValueChange={setQualityFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quality</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="eco">Eco-Friendly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ProductCategory | 'all')}>
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="all" className="text-xs">
            All Products
          </TabsTrigger>
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs gap-1.5">
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {Object.keys(groupedProducts).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No products match your filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedProducts).map(([subcategory, products]) => (
                  <div key={subcategory}>
                    <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      {subcategory}
                    </h3>
                    <div className="grid gap-3">
                      {products.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isSelected={selectedProduct?.id === product.id}
                          isExpanded={expandedProduct === product.id}
                          selectedSize={selectedProduct?.id === product.id ? selectedSize : null}
                          selectedColor={selectedProduct?.id === product.id ? selectedColor : null}
                          onSelect={() => handleSelectProduct(product)}
                          onExpand={() => setExpandedProduct(
                            expandedProduct === product.id ? null : product.id
                          )}
                          onSelectSize={onSelectSize}
                          onSelectColor={onSelectColor}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Selection Summary */}
      {selectedProduct && (
        <Card className="p-4 border-primary/30 bg-primary/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-muted-foreground">Selected Product</p>
              <p className="font-semibold mt-1">{selectedProduct.name}</p>
              <div className="flex items-center gap-2 mt-2">
                {selectedSize && (
                  <Badge variant="secondary" className="text-xs">
                    Size: {selectedSize}
                  </Badge>
                )}
                {selectedColor && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: selectedProduct.colors.find(c => c.code === selectedColor)?.hex }}
                    />
                    {selectedProduct.colors.find(c => c.code === selectedColor)?.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {selectedProduct.currency} {selectedProduct.basePrice.toFixed(2)}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleSelectProduct(selectedProduct)}>
              Change
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

interface ProductCardProps {
  product: ShopifyCatalogProduct;
  isSelected: boolean;
  isExpanded: boolean;
  selectedSize: string | null;
  selectedColor: string | null;
  onSelect: () => void;
  onExpand: () => void;
  onSelectSize: (size: string | null) => void;
  onSelectColor: (color: string | null) => void;
}

function ProductCard({
  product,
  isSelected,
  isExpanded,
  selectedSize,
  selectedColor,
  onSelect,
  onExpand,
  onSelectSize,
  onSelectColor,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        "transition-all",
        isSelected && "border-primary ring-1 ring-primary/30",
        !isSelected && "hover:border-muted-foreground/30"
      )}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-start gap-4">
          {/* Product Icon/Image */}
          <div className={cn(
            "w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0",
            "bg-muted/50 border border-border"
          )}>
            {product.category === 'apparel' && <Shirt className="w-8 h-8 text-muted-foreground" />}
            {product.category === 'drinkware' && <Coffee className="w-8 h-8 text-muted-foreground" />}
            {product.category === 'bags' && <ShoppingBag className="w-8 h-8 text-muted-foreground" />}
            {!['apparel', 'drinkware', 'bags'].includes(product.category) && (
              <Package className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  {product.name}
                  {product.featured && (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {product.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-mono text-sm font-semibold">
                  ${product.basePrice.toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {product.productionDays} day production
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[9px] capitalize">
                {product.quality}
              </Badge>
              <Badge variant="secondary" className="text-[9px]">
                {product.sizes.length} sizes
              </Badge>
              <Badge variant="secondary" className="text-[9px]">
                {product.colors.length} colors
              </Badge>
              <Badge variant="secondary" className="text-[9px]">
                via {product.provider}
              </Badge>
            </div>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      {isSelected && (
        <Collapsible open={isExpanded} onOpenChange={() => onExpand()}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full rounded-none border-t border-border h-8 text-xs"
            >
              {isExpanded ? 'Hide Details' : 'Show Size Guide, Colors & Print Areas'}
              <ChevronDown className={cn(
                "w-4 h-4 ml-2 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0 space-y-4 border-t border-border">
              {/* Sizes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Sizes
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <Button
                      key={size.code}
                      variant={selectedSize === size.code ? "default" : "outline"}
                      size="sm"
                      className="h-8 min-w-[48px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSize(size.code);
                      }}
                    >
                      {size.code}
                    </Button>
                  ))}
                </div>
                {product.sizes[0]?.measurements && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <Info className="w-3 h-3 inline mr-1" />
                    Size guide: {Object.entries(product.sizes[0].measurements).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Colors
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color.code}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (color.inStock) onSelectColor(color.code);
                      }}
                      disabled={!color.inStock}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                        color.inStock ? "cursor-pointer hover:scale-110" : "opacity-40 cursor-not-allowed",
                        selectedColor === color.code ? "border-primary ring-2 ring-primary/30" : "border-border"
                      )}
                      style={{ backgroundColor: color.hex === 'transparent' ? '#f5f5f5' : color.hex }}
                      title={color.name}
                    >
                      {selectedColor === color.code && (
                        <Check className={cn(
                          "w-4 h-4",
                          color.hex === '#ffffff' || color.hex === '#f5f5dc' ? "text-foreground" : "text-white"
                        )} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Areas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Print Areas
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.printAreas.map(area => (
                    <Badge key={area.id} variant="outline" className="text-[10px]">
                      {area.name} ({area.maxWidth}×{area.maxHeight}{area.unit})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <span className="text-xs font-mono uppercase text-muted-foreground">Materials</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {product.materials.join(' • ')}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
}

// Export catalog for use in other components
export { SHOPIFY_CATALOG, CATEGORIES };
export default StepShopifyCatalog;
