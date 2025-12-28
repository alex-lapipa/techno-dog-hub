import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // Prevent the browser from restoring scroll on back/forward navigation
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const scrollWindowToTopInstant = () => {
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    // Force instant jump even if global CSS sets scroll-behavior: smooth
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0 });
    requestAnimationFrame(() => {
      root.style.scrollBehavior = prev;
    });
  };

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

    scrollWindowToTopInstant();
  }, [pathname, hash]);

  // Backup effect to ensure scroll happens after lazy content loads
  useEffect(() => {
    if (!hash) {
      // Double-check scroll position after React's paint cycle
      requestAnimationFrame(() => {
        if (window.scrollY !== 0) {
          scrollWindowToTopInstant();
        }
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

