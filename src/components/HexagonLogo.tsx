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
      strokeWidth="4"
      fill="none"
    />
    {/* Greyhound dog face - stylized geometric */}
    {/* Long elegant snout */}
    <path
      d="M50 75 L42 58 L38 50 L40 42 L44 38 L50 36 L56 38 L60 42 L62 50 L58 58 Z"
      stroke="hsl(100, 100%, 60%)"
      strokeWidth="2.5"
      fill="none"
      strokeLinejoin="round"
    />
    {/* Left ear - tall and pointed like a greyhound */}
    <path
      d="M40 42 L32 22 L44 36"
      stroke="hsl(100, 100%, 60%)"
      strokeWidth="2.5"
      fill="none"
      strokeLinejoin="round"
    />
    {/* Right ear - tall and pointed */}
    <path
      d="M60 42 L68 22 L56 36"
      stroke="hsl(100, 100%, 60%)"
      strokeWidth="2.5"
      fill="none"
      strokeLinejoin="round"
    />
    {/* Left eye */}
    <circle
      cx="44"
      cy="46"
      r="3"
      fill="hsl(100, 100%, 60%)"
    />
    {/* Right eye */}
    <circle
      cx="56"
      cy="46"
      r="3"
      fill="hsl(100, 100%, 60%)"
    />
    {/* Nose */}
    <ellipse
      cx="50"
      cy="62"
      rx="4"
      ry="3"
      fill="hsl(100, 100%, 60%)"
    />
    {/* Snout line */}
    <line
      x1="50"
      y1="65"
      x2="50"
      y2="72"
      stroke="hsl(100, 100%, 60%)"
      strokeWidth="2"
    />
  </svg>
);

export default HexagonLogo;
