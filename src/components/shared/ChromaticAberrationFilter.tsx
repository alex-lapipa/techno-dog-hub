/**
 * Shared SVG filter for chromatic aberration effect
 * Used by GlitchImage and FilmFrame components
 */

export const ChromaticAberrationFilter = () => (
  <svg className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="chromatic-aberration-red">
        <feColorMatrix 
          type="matrix" 
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" 
        />
      </filter>
    </defs>
  </svg>
);

export default ChromaticAberrationFilter;
