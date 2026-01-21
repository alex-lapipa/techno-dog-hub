import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";

export const CartDrawer = () => {
  const { 
    items, 
    isLoading,
    isSyncing,
    isOpen,
    setOpen,
    updateQuantity, 
    removeItem, 
    getCheckoutUrl,
    syncCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const currencyCode = items[0]?.price.currencyCode || 'EUR';

  // Sync cart when drawer opens
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) syncCart();
  };

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      setOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background border-border">
        <SheetHeader className="flex-shrink-0 border-b border-border pb-4">
          <SheetTitle className="font-mono text-lg uppercase tracking-wider">
            Cart
          </SheetTitle>
          <SheetDescription className="font-mono text-xs text-muted-foreground">
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} object${totalItems !== 1 ? 's' : ''}`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  Nothing here yet
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Scrollable items area */}
              <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 p-3 border border-border bg-card">
                    <div className="w-16 h-16 bg-muted flex-shrink-0 overflow-hidden">
                      {item.product.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.images.edges[0].node.url}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-mono text-xs uppercase tracking-wider truncate">
                        {item.product.title}
                      </h4>
                      {item.variantTitle !== 'Default Title' && (
                        <p className="font-mono text-[10px] text-muted-foreground mt-1">
                          {item.selectedOptions.map(opt => opt.value).join(' / ')}
                        </p>
                      )}
                      <p className="font-mono text-xs mt-2">
                        {formatPrice(item.price.amount, item.price.currencyCode)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-mono text-xs">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Fixed checkout section */}
              <div className="flex-shrink-0 space-y-4 pt-6 mt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                  <span className="font-mono text-lg">
                    {formatPrice(totalPrice.toString(), currencyCode)}
                  </span>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full font-mono text-xs uppercase tracking-widest" 
                  size="lg"
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Checkout
                    </>
                  )}
                </Button>

                <p className="font-mono text-[10px] text-muted-foreground text-center">
                  Secure checkout via Shopify
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const CartButton = () => {
  const { setOpen, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={() => setOpen(true)}
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-logo-green text-background">
          {totalItems}
        </Badge>
      )}
    </Button>
  );
};
