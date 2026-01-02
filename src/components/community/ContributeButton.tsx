import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Camera, Edit3, FileText, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContributeButtonProps {
  /** The type of entity (artist, venue, festival, etc.) */
  entityType?: string;
  /** The entity's ID for corrections/amendments */
  entityId?: string;
  /** The entity's display name */
  entityName?: string;
  /** Button variant */
  variant?: "default" | "compact" | "inline" | "floating";
  /** Custom class name */
  className?: string;
  /** Whether to show the dropdown or go directly to contribute page */
  showDropdown?: boolean;
}

export const ContributeButton = ({
  entityType,
  entityId,
  entityName,
  variant = "default",
  className = "",
  showDropdown = true,
}: ContributeButtonProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const buildUrl = (action?: string) => {
    const params = new URLSearchParams();
    if (entityType) params.set("type", entityType);
    if (entityId) params.set("entityId", entityId);
    if (entityName) params.set("entityName", entityName);
    if (action) params.set("action", action);
    // Store origin URL for return navigation after submission
    const currentPath = window.location.pathname + window.location.hash;
    params.set("returnTo", currentPath);
    const queryString = params.toString();
    return `/contribute${queryString ? `?${queryString}` : ""}`;
  };

  const handleNavigate = (action?: string) => {
    navigate(buildUrl(action));
    setIsOpen(false);
  };

  // Quick actions for the dropdown
  const actions = [
    { 
      key: "photo", 
      label: "Upload Photos", 
      icon: Camera,
      description: "Add images to the archive"
    },
    { 
      key: "correction", 
      label: "Suggest Edit", 
      icon: Edit3,
      description: "Correct or update info"
    },
    { 
      key: "document", 
      label: "Share Document", 
      icon: FileText,
      description: "Flyers, articles, records"
    },
    { 
      key: "story", 
      label: "Share Story", 
      icon: MessageSquare,
      description: "Personal experience or memory"
    },
  ];

  // Compact inline button
  if (variant === "inline") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleNavigate()}
        className={`font-mono text-xs uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 ${className}`}
      >
        <Plus className="h-3 w-3 mr-1" />
        Contribute
      </Button>
    );
  }

  // Floating button (for bottom of pages)
  if (variant === "floating") {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg font-mono"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Contribute
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map(({ key, label, icon: Icon, description }) => (
              <DropdownMenuItem
                key={key}
                onClick={() => handleNavigate(key)}
                className="cursor-pointer"
              >
                <Icon className="h-4 w-4 mr-2 text-primary" />
                <div>
                  <div className="font-mono text-sm">{label}</div>
                  <div className="font-mono text-xs text-muted-foreground">{description}</div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleNavigate("add_new")}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2 text-primary" />
              <div>
                <div className="font-mono text-sm">Add New Entry</div>
                <div className="font-mono text-xs text-muted-foreground">Submit something new</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Compact button for entity detail pages
  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`font-mono text-xs uppercase tracking-wider ${className}`}
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Contribute
            <ChevronDown className="h-3 w-3 ml-1.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
          {entityName && (
            <>
              <DropdownMenuLabel className="font-mono text-xs text-muted-foreground truncate">
                {entityName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          {actions.map(({ key, label, icon: Icon }) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleNavigate(key)}
              className="cursor-pointer font-mono text-sm"
            >
              <Icon className="h-4 w-4 mr-2 text-primary" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default button with optional dropdown
  if (!showDropdown) {
    return (
      <Button
        onClick={() => handleNavigate()}
        className={`font-mono uppercase tracking-wider ${className}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Contribute Here
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className={`font-mono uppercase tracking-wider ${className}`}>
          <Plus className="h-4 w-4 mr-2" />
          Contribute Here
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64 bg-card border-border">
        <DropdownMenuLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          How would you like to contribute?
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map(({ key, label, icon: Icon, description }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleNavigate(key)}
            className="cursor-pointer py-3"
          >
            <Icon className="h-4 w-4 mr-3 text-primary" />
            <div>
              <div className="font-mono text-sm">{label}</div>
              <div className="font-mono text-xs text-muted-foreground">{description}</div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleNavigate("add_new")}
          className="cursor-pointer py-3"
        >
          <Plus className="h-4 w-4 mr-3 text-primary" />
          <div>
            <div className="font-mono text-sm">Add New Entry</div>
            <div className="font-mono text-xs text-muted-foreground">Submit something new to the archive</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContributeButton;
