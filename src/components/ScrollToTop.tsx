import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // Use useLayoutEffect for synchronous scroll before paint
  useLayoutEffect(() => {
    // If there's a hash, handle anchor scrolling with delay
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }
    
    // Scroll to top immediately and synchronously
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Backup effect to ensure scroll happens after lazy content loads
  useEffect(() => {
    if (!hash) {
      // Double-check scroll position after React's paint cycle
      requestAnimationFrame(() => {
        if (window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

