/**
 * Shopify Product Catalog Configuration
 * 
 * Extended product types beyond basic apparel, aligned with Shopify taxonomy.
 * Includes sizing, materials, gender options, and POD specifications.
 */

// ============================================================================
// PRODUCT CATEGORIES & TYPES
// ============================================================================

export interface ProductTypeConfig {
  id: string;
  name: string;
  category: ProductCategory;
  icon: string;
  hasGender: boolean;
  hasSizes: boolean;
  sizeType: SizeType;
  materials: MaterialOption[];
  printAreas: PrintArea[];
  basePrice: number;
  fulfillmentProvider: 'printful' | 'printify' | 'gooten' | 'custom';
  mockupAspectRatio: string;
  description: string;
}

export type ProductCategory = 
  | 'apparel'
  | 'accessories'
  | 'bags'
  | 'drinkware'
  | 'home-decor'
  | 'tech'
  | 'stationery'
  | 'lifestyle';

export type SizeType = 
  | 'apparel' 
  | 'one-size' 
  | 'numeric' 
  | 'dimensions'
  | 'volume';

export type GenderOption = 'unisex' | 'male' | 'female' | 'youth';

export interface MaterialOption {
  id: string;
  name: string;
  tier: 'standard' | 'premium' | 'luxury';
  priceMultiplier: number;
  description: string;
  composition?: string;
  weight?: string;
}

export interface PrintArea {
  id: string;
  name: string;
  maxWidth: number;
  maxHeight: number;
  position: 'front' | 'back' | 'left' | 'right' | 'all-over' | 'wrap';
}

// ============================================================================
// SIZING SYSTEMS
// ============================================================================

export const APPAREL_SIZES = {
  standard: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  extended: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
  youth: ['YS', 'YM', 'YL', 'YXL'],
} as const;

export const SIZE_CONVERSIONS = {
  US: { XS: 0, S: 2, M: 4, L: 8, XL: 12, '2XL': 16, '3XL': 20 },
  UK: { XS: 4, S: 6, M: 8, L: 12, XL: 16, '2XL': 20, '3XL': 24 },
  EU: { XS: 32, S: 34, M: 36, L: 40, XL: 44, '2XL': 48, '3XL': 52 },
} as const;

export const NUMERIC_SIZES = ['6', '7', '8', '9', '10', '11', '12', '13', '14'] as const;

// ============================================================================
// MATERIAL PRESETS
// ============================================================================

export const MATERIAL_PRESETS: Record<string, MaterialOption[]> = {
  cotton: [
    { id: 'cotton-standard', name: 'Cotton Blend', tier: 'standard', priceMultiplier: 1.0, description: '50/50 cotton-poly blend', composition: '50% Cotton, 50% Polyester', weight: '180gsm' },
    { id: 'cotton-premium', name: 'Ring-Spun Cotton', tier: 'premium', priceMultiplier: 1.3, description: 'Soft ring-spun cotton', composition: '100% Ring-Spun Cotton', weight: '200gsm' },
    { id: 'cotton-luxury', name: 'Organic Cotton', tier: 'luxury', priceMultiplier: 1.6, description: 'GOTS certified organic', composition: '100% Organic Cotton', weight: '220gsm' },
  ],
  fleece: [
    { id: 'fleece-standard', name: 'Fleece Blend', tier: 'standard', priceMultiplier: 1.0, description: 'Standard fleece', composition: '50% Cotton, 50% Polyester', weight: '280gsm' },
    { id: 'fleece-premium', name: 'French Terry', tier: 'premium', priceMultiplier: 1.4, description: 'Premium French terry', composition: '80% Cotton, 20% Polyester', weight: '320gsm' },
    { id: 'fleece-luxury', name: 'Heavyweight Fleece', tier: 'luxury', priceMultiplier: 1.8, description: 'Ultra-soft heavyweight', composition: '100% Cotton', weight: '400gsm' },
  ],
  synthetic: [
    { id: 'poly-standard', name: 'Polyester', tier: 'standard', priceMultiplier: 1.0, description: 'Moisture-wicking poly', composition: '100% Polyester' },
    { id: 'poly-premium', name: 'Performance Blend', tier: 'premium', priceMultiplier: 1.25, description: 'Athletic performance', composition: '90% Polyester, 10% Spandex' },
  ],
  canvas: [
    { id: 'canvas-standard', name: 'Cotton Canvas', tier: 'standard', priceMultiplier: 1.0, description: 'Durable canvas', composition: '100% Cotton Canvas', weight: '12oz' },
    { id: 'canvas-premium', name: 'Heavy Canvas', tier: 'premium', priceMultiplier: 1.3, description: 'Heavy-duty canvas', composition: '100% Cotton Canvas', weight: '16oz' },
  ],
  ceramic: [
    { id: 'ceramic-standard', name: 'Ceramic', tier: 'standard', priceMultiplier: 1.0, description: 'Standard ceramic' },
    { id: 'ceramic-premium', name: 'Premium Ceramic', tier: 'premium', priceMultiplier: 1.5, description: 'High-gloss finish' },
  ],
};

// ============================================================================
// EXTENDED PRODUCT CATALOG
// ============================================================================

export const PRODUCT_CATALOG: ProductTypeConfig[] = [
  // APPAREL
  {
    id: 'hoodie',
    name: 'Hoodie',
    category: 'apparel',
    icon: '🧥',
    hasGender: true,
    hasSizes: true,
    sizeType: 'apparel',
    materials: MATERIAL_PRESETS.fleece,
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, position: 'front' },
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, position: 'back' },
      { id: 'left-chest', name: 'Left Chest', maxWidth: 4, maxHeight: 4, position: 'left' },
    ],
    basePrice: 45.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Premium pullover hoodie with kangaroo pocket',
  },
  {
    id: 't-shirt',
    name: 'T-Shirt',
    category: 'apparel',
    icon: '👕',
    hasGender: true,
    hasSizes: true,
    sizeType: 'apparel',
    materials: MATERIAL_PRESETS.cotton,
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, position: 'front' },
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, position: 'back' },
    ],
    basePrice: 24.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Classic crew neck t-shirt',
  },
  {
    id: 'tank-top',
    name: 'Tank Top',
    category: 'apparel',
    icon: '🎽',
    hasGender: true,
    hasSizes: true,
    sizeType: 'apparel',
    materials: MATERIAL_PRESETS.cotton,
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 10, maxHeight: 12, position: 'front' },
      { id: 'back', name: 'Back', maxWidth: 10, maxHeight: 12, position: 'back' },
    ],
    basePrice: 22.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Breathable tank for festival wear',
  },
  {
    id: 'long-sleeve',
    name: 'Long Sleeve',
    category: 'apparel',
    icon: '👔',
    hasGender: true,
    hasSizes: true,
    sizeType: 'apparel',
    materials: MATERIAL_PRESETS.cotton,
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, position: 'front' },
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, position: 'back' },
      { id: 'sleeve', name: 'Sleeve', maxWidth: 4, maxHeight: 12, position: 'left' },
    ],
    basePrice: 28.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Long sleeve crew neck',
  },
  {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    category: 'apparel',
    icon: '🧶',
    hasGender: true,
    hasSizes: true,
    sizeType: 'apparel',
    materials: MATERIAL_PRESETS.fleece,
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, position: 'front' },
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, position: 'back' },
    ],
    basePrice: 38.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Crew neck sweatshirt',
  },
  {
    id: 'zip-hoodie',
    name: 'Zip Hoodie',
    category: 'apparel',
    icon: '🧥',
    hasGender: true,
    hasSizes: true,
    sizeType: 'apparel',
    materials: MATERIAL_PRESETS.fleece,
    printAreas: [
      { id: 'back', name: 'Back', maxWidth: 14, maxHeight: 16, position: 'back' },
      { id: 'left-chest', name: 'Left Chest', maxWidth: 4, maxHeight: 4, position: 'left' },
    ],
    basePrice: 52.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Full-zip hoodie with split kangaroo pocket',
  },
  {
    id: 'crop-top',
    name: 'Crop Top',
    category: 'apparel',
    icon: '👚',
    hasGender: false,
    hasSizes: true,
    sizeType: 'apparel',
    materials: MATERIAL_PRESETS.cotton,
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 10, maxHeight: 8, position: 'front' },
    ],
    basePrice: 26.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Cropped fit tee',
  },
  
  // ACCESSORIES
  {
    id: 'cap',
    name: 'Dad Cap',
    category: 'accessories',
    icon: '🧢',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'twill', name: 'Cotton Twill', tier: 'standard', priceMultiplier: 1.0, description: 'Classic cotton twill' },
      { id: 'corduroy', name: 'Corduroy', tier: 'premium', priceMultiplier: 1.3, description: 'Vintage corduroy' },
    ],
    printAreas: [
      { id: 'front', name: 'Front Panel', maxWidth: 4, maxHeight: 2.5, position: 'front' },
    ],
    basePrice: 24.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:1',
    description: 'Unstructured dad cap with adjustable strap',
  },
  {
    id: 'snapback',
    name: 'Snapback',
    category: 'accessories',
    icon: '🧢',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'acrylic', name: 'Acrylic Blend', tier: 'standard', priceMultiplier: 1.0, description: 'Structured fit' },
    ],
    printAreas: [
      { id: 'front', name: 'Front Panel', maxWidth: 5, maxHeight: 3, position: 'front' },
    ],
    basePrice: 28.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:1',
    description: 'Structured snapback with flat brim',
  },
  {
    id: 'beanie',
    name: 'Beanie',
    category: 'accessories',
    icon: '🧶',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'acrylic', name: 'Acrylic Knit', tier: 'standard', priceMultiplier: 1.0, description: 'Warm acrylic' },
      { id: 'merino', name: 'Merino Wool', tier: 'luxury', priceMultiplier: 2.0, description: 'Premium merino' },
    ],
    printAreas: [
      { id: 'front', name: 'Front Cuff', maxWidth: 3, maxHeight: 2, position: 'front' },
    ],
    basePrice: 22.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:1',
    description: 'Cuffed beanie with embroidered patch',
  },
  {
    id: 'bandana',
    name: 'Bandana',
    category: 'accessories',
    icon: '🎭',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'cotton', name: 'Cotton', tier: 'standard', priceMultiplier: 1.0, description: '100% cotton' },
    ],
    printAreas: [
      { id: 'all-over', name: 'All Over', maxWidth: 22, maxHeight: 22, position: 'all-over' },
    ],
    basePrice: 14.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:1',
    description: '22" square bandana',
  },
  {
    id: 'socks',
    name: 'Crew Socks',
    category: 'accessories',
    icon: '🧦',
    hasGender: false,
    hasSizes: true,
    sizeType: 'numeric',
    materials: [
      { id: 'cotton-blend', name: 'Cotton Blend', tier: 'standard', priceMultiplier: 1.0, description: 'Comfortable blend' },
    ],
    printAreas: [
      { id: 'all-over', name: 'All Over', maxWidth: 4, maxHeight: 8, position: 'all-over' },
    ],
    basePrice: 16.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:2',
    description: 'Sublimated crew socks',
  },
  
  // BAGS
  {
    id: 'tote-bag',
    name: 'Tote Bag',
    category: 'bags',
    icon: '👜',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: MATERIAL_PRESETS.canvas,
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 12, position: 'front' },
      { id: 'back', name: 'Back', maxWidth: 12, maxHeight: 12, position: 'back' },
    ],
    basePrice: 18.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:1',
    description: 'Heavyweight canvas tote',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    category: 'bags',
    icon: '🎒',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'nylon', name: 'Nylon', tier: 'standard', priceMultiplier: 1.0, description: 'Durable nylon' },
    ],
    printAreas: [
      { id: 'front', name: 'Front Panel', maxWidth: 10, maxHeight: 14, position: 'front' },
    ],
    basePrice: 45.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '3:4',
    description: 'All-over print backpack',
  },
  {
    id: 'fanny-pack',
    name: 'Fanny Pack',
    category: 'bags',
    icon: '👛',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'nylon', name: 'Nylon', tier: 'standard', priceMultiplier: 1.0, description: 'Water-resistant' },
    ],
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 8, maxHeight: 5, position: 'front' },
    ],
    basePrice: 28.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '16:9',
    description: 'Festival-ready fanny pack',
  },
  {
    id: 'drawstring-bag',
    name: 'Drawstring Bag',
    category: 'bags',
    icon: '🎒',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'poly', name: 'Polyester', tier: 'standard', priceMultiplier: 1.0, description: 'Lightweight poly' },
    ],
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 12, maxHeight: 14, position: 'front' },
    ],
    basePrice: 16.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '3:4',
    description: 'Lightweight drawstring backpack',
  },
  
  // DRINKWARE
  {
    id: 'mug',
    name: 'Ceramic Mug',
    category: 'drinkware',
    icon: '☕',
    hasGender: false,
    hasSizes: false,
    sizeType: 'volume',
    materials: MATERIAL_PRESETS.ceramic,
    printAreas: [
      { id: 'wrap', name: 'Wrap', maxWidth: 9, maxHeight: 3.5, position: 'wrap' },
    ],
    basePrice: 14.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:1',
    description: '11oz ceramic mug',
  },
  {
    id: 'tumbler',
    name: 'Tumbler',
    category: 'drinkware',
    icon: '🥤',
    hasGender: false,
    hasSizes: false,
    sizeType: 'volume',
    materials: [
      { id: 'stainless', name: 'Stainless Steel', tier: 'premium', priceMultiplier: 1.0, description: 'Double-wall insulated' },
    ],
    printAreas: [
      { id: 'wrap', name: 'Wrap', maxWidth: 8, maxHeight: 6, position: 'wrap' },
    ],
    basePrice: 28.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:2',
    description: '20oz insulated tumbler',
  },
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    category: 'drinkware',
    icon: '💧',
    hasGender: false,
    hasSizes: false,
    sizeType: 'volume',
    materials: [
      { id: 'stainless', name: 'Stainless Steel', tier: 'premium', priceMultiplier: 1.0, description: 'Vacuum insulated' },
    ],
    printAreas: [
      { id: 'wrap', name: 'Wrap', maxWidth: 6, maxHeight: 8, position: 'wrap' },
    ],
    basePrice: 32.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:3',
    description: '32oz insulated water bottle',
  },
  
  // HOME & LIFESTYLE
  {
    id: 'poster',
    name: 'Poster',
    category: 'home-decor',
    icon: '🖼️',
    hasGender: false,
    hasSizes: true,
    sizeType: 'dimensions',
    materials: [
      { id: 'matte', name: 'Matte Paper', tier: 'standard', priceMultiplier: 1.0, description: '200gsm matte' },
      { id: 'lustre', name: 'Lustre Paper', tier: 'premium', priceMultiplier: 1.3, description: 'Semi-gloss lustre' },
    ],
    printAreas: [
      { id: 'full', name: 'Full Bleed', maxWidth: 24, maxHeight: 36, position: 'front' },
    ],
    basePrice: 18.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '2:3',
    description: 'Museum-quality poster print',
  },
  {
    id: 'canvas',
    name: 'Canvas Print',
    category: 'home-decor',
    icon: '🎨',
    hasGender: false,
    hasSizes: true,
    sizeType: 'dimensions',
    materials: [
      { id: 'canvas', name: 'Gallery Canvas', tier: 'premium', priceMultiplier: 1.0, description: 'Gallery-wrapped' },
    ],
    printAreas: [
      { id: 'full', name: 'Full Bleed', maxWidth: 30, maxHeight: 40, position: 'front' },
    ],
    basePrice: 45.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '3:4',
    description: 'Gallery-wrapped canvas',
  },
  {
    id: 'throw-pillow',
    name: 'Throw Pillow',
    category: 'home-decor',
    icon: '🛋️',
    hasGender: false,
    hasSizes: true,
    sizeType: 'dimensions',
    materials: [
      { id: 'poly', name: 'Polyester', tier: 'standard', priceMultiplier: 1.0, description: 'Soft polyester' },
    ],
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 18, maxHeight: 18, position: 'front' },
      { id: 'back', name: 'Back', maxWidth: 18, maxHeight: 18, position: 'back' },
    ],
    basePrice: 24.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '1:1',
    description: 'Double-sided throw pillow',
  },
  {
    id: 'blanket',
    name: 'Throw Blanket',
    category: 'home-decor',
    icon: '🛏️',
    hasGender: false,
    hasSizes: true,
    sizeType: 'dimensions',
    materials: [
      { id: 'fleece', name: 'Fleece', tier: 'standard', priceMultiplier: 1.0, description: 'Soft fleece' },
      { id: 'sherpa', name: 'Sherpa', tier: 'premium', priceMultiplier: 1.5, description: 'Sherpa-lined' },
    ],
    printAreas: [
      { id: 'full', name: 'Full Print', maxWidth: 50, maxHeight: 60, position: 'front' },
    ],
    basePrice: 55.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '5:6',
    description: 'Cozy throw blanket',
  },
  
  // TECH
  {
    id: 'phone-case',
    name: 'Phone Case',
    category: 'tech',
    icon: '📱',
    hasGender: false,
    hasSizes: true,
    sizeType: 'dimensions',
    materials: [
      { id: 'snap', name: 'Snap Case', tier: 'standard', priceMultiplier: 1.0, description: 'Slim snap-on' },
      { id: 'tough', name: 'Tough Case', tier: 'premium', priceMultiplier: 1.4, description: 'Dual-layer protection' },
    ],
    printAreas: [
      { id: 'back', name: 'Back', maxWidth: 3, maxHeight: 6, position: 'back' },
    ],
    basePrice: 22.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '9:16',
    description: 'Custom phone case',
  },
  {
    id: 'laptop-sleeve',
    name: 'Laptop Sleeve',
    category: 'tech',
    icon: '💻',
    hasGender: false,
    hasSizes: true,
    sizeType: 'dimensions',
    materials: [
      { id: 'neoprene', name: 'Neoprene', tier: 'standard', priceMultiplier: 1.0, description: 'Padded neoprene' },
    ],
    printAreas: [
      { id: 'front', name: 'Front', maxWidth: 13, maxHeight: 10, position: 'front' },
    ],
    basePrice: 32.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:3',
    description: 'Padded laptop sleeve',
  },
  {
    id: 'mousepad',
    name: 'Mousepad',
    category: 'tech',
    icon: '🖱️',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'rubber', name: 'Rubber Base', tier: 'standard', priceMultiplier: 1.0, description: 'Non-slip rubber' },
    ],
    printAreas: [
      { id: 'full', name: 'Full Surface', maxWidth: 9, maxHeight: 7, position: 'front' },
    ],
    basePrice: 14.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '9:7',
    description: 'Cloth surface mousepad',
  },
  
  // STATIONERY
  {
    id: 'sticker-sheet',
    name: 'Sticker Sheet',
    category: 'stationery',
    icon: '🏷️',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'vinyl', name: 'Vinyl', tier: 'standard', priceMultiplier: 1.0, description: 'Waterproof vinyl' },
      { id: 'holographic', name: 'Holographic', tier: 'premium', priceMultiplier: 1.5, description: 'Holographic vinyl' },
    ],
    printAreas: [
      { id: 'sheet', name: 'Sheet', maxWidth: 8, maxHeight: 10, position: 'front' },
    ],
    basePrice: 8.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '4:5',
    description: 'Die-cut sticker sheet',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    category: 'stationery',
    icon: '📓',
    hasGender: false,
    hasSizes: false,
    sizeType: 'one-size',
    materials: [
      { id: 'spiral', name: 'Spiral Bound', tier: 'standard', priceMultiplier: 1.0, description: '80 pages' },
      { id: 'hardcover', name: 'Hardcover', tier: 'premium', priceMultiplier: 1.6, description: '120 pages' },
    ],
    printAreas: [
      { id: 'cover', name: 'Cover', maxWidth: 6, maxHeight: 8, position: 'front' },
    ],
    basePrice: 16.00,
    fulfillmentProvider: 'printful',
    mockupAspectRatio: '3:4',
    description: 'Custom cover notebook',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getProductsByCategory(category: ProductCategory): ProductTypeConfig[] {
  return PRODUCT_CATALOG.filter(p => p.category === category);
}

export function getProductById(id: string): ProductTypeConfig | undefined {
  return PRODUCT_CATALOG.find(p => p.id === id);
}

export function getCategoryLabel(category: ProductCategory): string {
  const labels: Record<ProductCategory, string> = {
    'apparel': 'Apparel',
    'accessories': 'Accessories',
    'bags': 'Bags & Packs',
    'drinkware': 'Drinkware',
    'home-decor': 'Home & Décor',
    'tech': 'Tech Accessories',
    'stationery': 'Stationery',
    'lifestyle': 'Lifestyle',
  };
  return labels[category];
}

export function getSizesForProduct(product: ProductTypeConfig, gender?: GenderOption): string[] {
  if (!product.hasSizes) return ['One Size'];
  
  switch (product.sizeType) {
    case 'apparel':
      return gender === 'youth' ? [...APPAREL_SIZES.youth] : [...APPAREL_SIZES.standard];
    case 'numeric':
      return [...NUMERIC_SIZES];
    case 'one-size':
      return ['One Size'];
    case 'dimensions':
      // Product-specific dimensions
      if (product.id === 'poster') return ['12x18', '18x24', '24x36'];
      if (product.id === 'canvas') return ['12x16', '18x24', '24x36'];
      if (product.id === 'throw-pillow') return ['14x14', '16x16', '18x18'];
      if (product.id === 'blanket') return ['30x40', '50x60', '60x80'];
      if (product.id === 'phone-case') return ['iPhone 14', 'iPhone 15', 'iPhone 15 Pro', 'Samsung S24'];
      if (product.id === 'laptop-sleeve') return ['13"', '15"', '17"'];
      return ['Standard'];
    case 'volume':
      if (product.id === 'mug') return ['11oz', '15oz'];
      if (product.id === 'tumbler') return ['20oz', '30oz'];
      if (product.id === 'water-bottle') return ['24oz', '32oz'];
      return ['Standard'];
    default:
      return ['One Size'];
  }
}

export function calculatePrice(
  basePrice: number,
  materialMultiplier: number = 1.0,
  marginPercent: number = 40
): { cost: number; price: number; profit: number } {
  const cost = basePrice * materialMultiplier;
  const price = Math.ceil(cost / (1 - marginPercent / 100));
  const profit = price - cost;
  return { cost, price, profit };
}
