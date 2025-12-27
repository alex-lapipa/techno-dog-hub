import { Link } from "react-router-dom";
import { ShopifyProductNode, formatPrice } from "@/lib/shopify";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { GlitchImage } from "./GlitchImage";

interface ProductCardProps {
  product: ShopifyProductNode;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const setOpen = useCartStore(state => state.setOpen);
  
  const firstImage = product.images.edges[0]?.node;
  const firstVariant = product.variants.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return;

    const cartItem: CartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    };

    addItem(cartItem);
    toast.success("Added to cart", {
      description: product.title,
      position: "top-center",
    });
    setOpen(true);
  };

  return (
    <Link 
      to={`/store/product/${product.handle}`}
      className="group block bg-card hover:border-foreground/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        {firstImage ? (
          <GlitchImage
            src={firstImage.url}
            alt={firstImage.altText || product.title}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <span className="font-mono text-xs text-muted-foreground uppercase">
              No image
            </span>
          </div>
        )}
        
        {/* Quick add button */}
        <Button
          variant="default"
          size="sm"
          className="absolute bottom-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] uppercase tracking-wider"
          onClick={handleAddToCart}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        {product.productType && (
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            {product.productType}
          </span>
        )}
        <h3 className="font-mono text-sm uppercase tracking-wider line-clamp-2 group-hover:text-logo-green transition-colors">
          {product.title}
        </h3>
        <p className="font-mono text-xs">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  );
};
