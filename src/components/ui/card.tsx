import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'article' | 'div' | 'section';
  itemScope?: boolean;
  itemType?: string;
  itemProp?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, as: Component = 'div', itemScope, itemType, itemProp, ...props }, ref) => (
    <Component 
      ref={ref} 
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} 
      itemScope={itemScope}
      itemType={itemType}
      itemProp={itemProp}
      {...props} 
    />
  )
);
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  itemProp?: string;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, itemProp, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} itemProp={itemProp} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  itemProp?: string;
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, as: Component = 'h3', itemProp, ...props }, ref) => (
    <Component 
      ref={ref as any} 
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)} 
      itemProp={itemProp}
      {...props} 
    />
  ),
);
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  itemProp?: string;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, itemProp, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} itemProp={itemProp} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  itemProp?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, itemProp, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} itemProp={itemProp} {...props} />
  ),
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  itemProp?: string;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, itemProp, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} itemProp={itemProp} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
