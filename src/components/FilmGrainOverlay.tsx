/**
 * FilmGrainOverlay - Subtle animated film grain noise for VHS aesthetic
 * Applies a full-screen overlay with animated noise texture
 */
const FilmGrainOverlay = () => {
  return (
    <>
      {/* Primary grain layer - subtle animated noise */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999]"
        aria-hidden="true"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: 'overlay',
          animation: 'grain 0.5s steps(10) infinite',
        }}
      />
      
      {/* Secondary grain layer - finer texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9998]"
        aria-hidden="true"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.02,
          mixBlendMode: 'soft-light',
          animation: 'grain 0.8s steps(8) infinite reverse',
        }}
      />
      
      {/* Subtle vignette */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9997]"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.15) 100%)',
        }}
      />
      
      {/* Horizontal scan lines - very subtle */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9996]"
        aria-hidden="true"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)',
        }}
      />
    </>
  );
};

export default FilmGrainOverlay;
