const HexagonLogo = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer circle */}
    <circle
      cx="50"
      cy="50"
      r="46"
      stroke="hsl(100, 100%, 60%)"
      strokeWidth="3"
      fill="none"
    />
    
    {/* Spanish Galgo / Greyhound profile - elegant side silhouette */}
    <g stroke="hsl(100, 100%, 60%)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Long elegant neck curving up */}
      <path d="M20 70 Q22 55, 28 45 Q34 36, 42 32" />
      
      {/* Top of head - sleek greyhound shape */}
      <path d="M42 32 Q48 28, 54 28 Q60 29, 64 32" />
      
      {/* Long distinctive greyhound snout pointing right */}
      <path d="M64 32 Q70 33, 78 36 L80 40 L78 43 Q72 45, 64 43" />
      
      {/* Under jaw and throat */}
      <path d="M64 43 Q56 48, 48 52 Q38 58, 28 62 Q24 66, 20 70" />
      
      {/* Tall pointed galgo ear - distinctive upright */}
      <path d="M48 30 L44 12 L52 14 Q54 20, 52 28" />
      
      {/* Second ear slightly behind */}
      <path d="M42 32 L36 16 L44 18 Q46 24, 44 30" />
    </g>
    
    {/* Eye - almond shaped like a sighthound */}
    <ellipse
      cx="62"
      cy="35"
      rx="3"
      ry="2.5"
      fill="hsl(100, 100%, 60%)"
    />
    
    {/* Nose - prominent at end of long snout */}
    <circle
      cx="79"
      cy="39"
      r="3"
      fill="hsl(100, 100%, 60%)"
    />
  </svg>
);

export default HexagonLogo;
