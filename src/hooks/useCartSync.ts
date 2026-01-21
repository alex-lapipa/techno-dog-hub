/**
 * useCartSync - Syncs cart state with Shopify after checkout
 * 
 * Clears cart when user returns from checkout (handles completed orders).
 * Should be used in the main App component.
 */

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export function useCartSync() {
  const syncCart = useCartStore(state => state.syncCart);

  useEffect(() => {
    // Sync on initial page load (handles browser refresh after checkout)
    syncCart();
    
    // Sync when user returns to the tab (handles return from checkout in new tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncCart();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncCart]);
}
