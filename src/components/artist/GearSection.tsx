import { Radio, Headphones, Disc3, Wrench, BadgeCheck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGearCatalogLookup } from "@/hooks/useGearCatalogLookup";
import LinkedGearItem from "./LinkedGearItem";

interface GearSectionProps {
  studioGear?: string[];
  liveSetup?: string[];
  djSetup?: string[];
  riderNotes?: string;
}

const GearSection = ({ studioGear, liveSetup, djSetup, riderNotes }: GearSectionProps) => {
  const { matchGearList, isLoading, catalogSize } = useGearCatalogLookup();
  
  const hasGear = (studioGear?.length || 0) > 0 || (liveSetup?.length || 0) > 0 || (djSetup?.length || 0) > 0;
  
  // Match all gear to catalog
  const studioMatches = studioGear ? matchGearList(studioGear) : [];
  const liveMatches = liveSetup ? matchGearList(liveSetup) : [];
  const djMatches = djSetup ? matchGearList(djSetup) : [];
  
  // Count linked items
  const linkedCount = [...studioMatches, ...liveMatches, ...djMatches].filter(m => m.catalogId).length;
  const totalCount = studioMatches.length + liveMatches.length + djMatches.length;

  return (
    <section className="mb-12 border-t border-border pt-8">
      <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
        <Wrench className="w-5 h-5" />
        Gear & Rider
        {hasGear && (
          <Badge variant="outline" className="font-mono text-[10px] border-logo-green/50 text-logo-green ml-2">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
        {hasGear && !isLoading && linkedCount > 0 && (
          <span className="font-mono text-[10px] text-muted-foreground ml-auto">
            {linkedCount}/{totalCount} linked to archive
          </span>
        )}
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
        )}
      </h2>
      
      {hasGear ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Studio Gear */}
          {studioMatches.length > 0 && (
            <div className="border border-border p-4 bg-card/30">
              <h3 className="font-mono text-xs uppercase tracking-wider text-logo-green mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Studio
              </h3>
              <ul className="space-y-2">
                {studioMatches.map((match, i) => (
                  <LinkedGearItem 
                    key={i} 
                    gearText={match.gearText}
                    catalogId={match.catalogId}
                    catalogName={match.catalogName}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Live Setup */}
          {liveMatches.length > 0 && (
            <div className="border border-border p-4 bg-card/30">
              <h3 className="font-mono text-xs uppercase tracking-wider text-logo-green mb-4 flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                Live Setup
              </h3>
              <ul className="space-y-2">
                {liveMatches.map((match, i) => (
                  <LinkedGearItem 
                    key={i} 
                    gearText={match.gearText}
                    catalogId={match.catalogId}
                    catalogName={match.catalogName}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* DJ Setup */}
          {djMatches.length > 0 && (
            <div className="border border-border p-4 bg-card/30">
              <h3 className="font-mono text-xs uppercase tracking-wider text-logo-green mb-4 flex items-center gap-2">
                <Disc3 className="w-4 h-4" />
                DJ Setup
              </h3>
              <ul className="space-y-2">
                {djMatches.map((match, i) => (
                  <LinkedGearItem 
                    key={i} 
                    gearText={match.gearText}
                    catalogId={match.catalogId}
                    catalogName={match.catalogName}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-dashed border-border/50 p-8 text-center">
          <Wrench className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-mono text-xs text-muted-foreground">
            Gear data not yet verified for this artist
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/70 mt-1">
            Know their setup? Submit a contribution below
          </p>
        </div>
      )}

      {/* Rider Notes */}
      {riderNotes && (
        <div className="mt-6 border border-logo-green/30 p-4 bg-logo-green/5">
          <h3 className="font-mono text-xs uppercase tracking-wider text-logo-green mb-3 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            Technical Rider Notes
          </h3>
          <p className="font-mono text-sm text-foreground leading-relaxed">
            {riderNotes}
          </p>
        </div>
      )}
    </section>
  );
};

export default GearSection;
