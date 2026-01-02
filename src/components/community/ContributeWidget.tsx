import { useNavigate } from "react-router-dom";
import { Plus, Camera, Edit3 } from "lucide-react";
import DogSilhouette from "@/components/DogSilhouette";

interface ContributeWidgetProps {
  /** The type of entity (artist, venue, festival, gear, etc.) */
  entityType?: string;
  /** The entity's ID for corrections/amendments */
  entityId?: string;
  /** The entity's display name */
  entityName?: string;
  /** Widget variant */
  variant?: "default" | "compact" | "inline";
  /** Custom class name */
  className?: string;
}

export const ContributeWidget = ({
  entityType,
  entityId,
  entityName,
  variant = "default",
  className = "",
}: ContributeWidgetProps) => {
  const navigate = useNavigate();

  const buildUrl = (action?: string) => {
    const params = new URLSearchParams();
    if (entityType) params.set("type", entityType);
    if (entityId) params.set("entityId", entityId);
    if (entityName) params.set("entityName", entityName);
    if (action) params.set("action", action);
    const currentPath = window.location.pathname + window.location.hash;
    params.set("returnTo", currentPath);
    const queryString = params.toString();
    return `/contribute${queryString ? `?${queryString}` : ""}`;
  };

  const handleNavigate = (action?: string) => {
    navigate(buildUrl(action));
  };

  // Inline minimal version
  if (variant === "inline") {
    return (
      <button
        onClick={() => handleNavigate()}
        className={`group inline-flex items-center gap-2 px-3 py-1.5 border border-crimson/30 bg-crimson/5 hover:bg-crimson/10 hover:border-crimson/50 transition-all duration-300 ${className}`}
      >
        <DogSilhouette className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
        <span className="font-mono text-xs uppercase tracking-wider text-crimson/80 group-hover:text-crimson transition-colors">
          Contribute
        </span>
      </button>
    );
  }

  // Compact version for sidebars
  if (variant === "compact") {
    return (
      <div className={`relative overflow-hidden border border-crimson/30 bg-frame-bg ${className}`}>
        {/* VHS scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: `repeating-linear-gradient(0deg, transparent, transparent 1px, hsl(var(--crimson) / 0.03) 1px, hsl(var(--crimson) / 0.03) 2px)`,
          }}
        />

        <button
          onClick={() => handleNavigate()}
          className="group relative w-full p-3 flex items-center gap-3 hover:bg-crimson/5 transition-all duration-300"
        >
          {/* Dog icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <DogSilhouette className="w-6 h-6 relative z-10" />
          </div>

          <div className="flex-1 text-left">
            <span className="block font-mono text-xs uppercase tracking-wider text-foreground group-hover:text-crimson transition-colors">
              Contribute
            </span>
            <span className="block font-mono text-[10px] text-muted-foreground">
              Share knowledge
            </span>
          </div>

          <Plus className="w-4 h-4 text-crimson/50 group-hover:text-crimson transition-colors" />
        </button>
      </div>
    );
  }

  // Default full widget
  return (
    <div className={`relative overflow-hidden bg-frame-bg border border-crimson/30 ${className}`}>
      {/* Film strip sprocket holes */}
      <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-around py-2 bg-background/30">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-1.5 h-2 bg-crimson/20 rounded-sm mx-auto" />
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col justify-around py-2 bg-background/30">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-1.5 h-2 bg-crimson/20 rounded-sm mx-auto" />
        ))}
      </div>

      {/* VHS scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            repeating-linear-gradient(0deg, transparent, transparent 1px, hsl(var(--crimson) / 0.02) 1px, hsl(var(--crimson) / 0.02) 2px),
            radial-gradient(ellipse at center, transparent 60%, hsl(var(--crimson) / 0.1) 100%)
          `,
        }}
      />

      {/* REC indicator */}
      <div className="absolute top-2 right-4 flex items-center gap-1.5 z-10">
        <div className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-crimson">REC</span>
      </div>

      {/* Content */}
      <div className="relative mx-4 py-4">
        {/* Header with dog */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-lg" />
            <DogSilhouette className="w-8 h-8 relative z-10" />
          </div>
          <div>
            <h3 className="font-mono text-sm uppercase tracking-wider text-foreground">
              Community Archive
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              techno.dog
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent mb-3" />

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleNavigate("photo")}
            className="group flex items-center gap-2 p-2 border border-crimson/20 hover:border-crimson/50 hover:bg-crimson/5 transition-all duration-300"
          >
            <Camera className="w-4 h-4 text-crimson/60 group-hover:text-crimson transition-colors" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              Upload
            </span>
          </button>
          <button
            onClick={() => handleNavigate("correction")}
            className="group flex items-center gap-2 p-2 border border-crimson/20 hover:border-crimson/50 hover:bg-crimson/5 transition-all duration-300"
          >
            <Edit3 className="w-4 h-4 text-crimson/60 group-hover:text-crimson transition-colors" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              Edit
            </span>
          </button>
        </div>

        {/* Main CTA */}
        <button
          onClick={() => handleNavigate()}
          className="group w-full mt-2 p-3 border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-wider text-primary">
            Contribute Here
          </span>
        </button>

        {/* Frame counter */}
        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-background/70 border border-crimson/30">
          <span className="font-mono text-[8px] text-crimson tracking-wider">
            {entityType?.toUpperCase() || "ARCHIVE"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContributeWidget;
