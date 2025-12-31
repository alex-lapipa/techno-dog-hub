import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface LinkedGearItemProps {
  gearText: string;
  catalogId: string | null;
  catalogName: string | null;
}

const LinkedGearItem = ({ gearText, catalogId, catalogName }: LinkedGearItemProps) => {
  if (catalogId) {
    return (
      <li className="font-mono text-xs text-foreground flex items-start gap-2 group">
        <span className="text-logo-green">→</span>
        <Link 
          to={`/gear/${catalogId}`}
          className="hover:text-logo-green transition-colors duration-200 flex items-center gap-1.5 underline-offset-2 hover:underline"
          title={catalogName ? `View ${catalogName} in Gear Archive` : undefined}
        >
          {gearText}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
        </Link>
      </li>
    );
  }

  return (
    <li className="font-mono text-xs text-foreground flex items-start gap-2">
      <span className="text-logo-green">→</span>
      <span className="text-muted-foreground">{gearText}</span>
    </li>
  );
};

export default LinkedGearItem;
