import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  includeHome?: boolean;
  className?: string;
}

/**
 * SEO-optimized breadcrumb navigation with structured data
 * Provides clear hierarchy signals to search engines
 */
export function BreadcrumbNav({
  items,
  includeHome = true,
  className,
}: BreadcrumbNavProps) {
  const allItems = includeHome
    ? [{ label: "Home", href: "/" }, ...items]
    : items;

  // Generate JSON-LD structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && { "item": `https://techno.dog${item.href}` }),
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visible Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className={cn("mb-4 sm:mb-6", className)}
      >
        <ol className="flex items-center flex-wrap gap-1 sm:gap-2 font-mono text-[10px] sm:text-xs">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center gap-1 sm:gap-2">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              )}
              {item.href && index < allItems.length - 1 ? (
                <Link
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {index === 0 && includeHome && (
                    <Home className="w-3 h-3" />
                  )}
                  <span className="uppercase tracking-wider">{item.label}</span>
                </Link>
              ) : (
                <span className="text-foreground uppercase tracking-wider">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
