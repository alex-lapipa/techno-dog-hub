import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  title: string;
  description?: string;
  path: string;
  structuredData?: object | object[];
  className?: string;
  children: ReactNode;
  /** Whether to include the standard top padding for header offset */
  withHeaderPadding?: boolean;
}

export function PageLayout({ 
  title,
  description,
  path,
  structuredData,
  className,
  children,
  withHeaderPadding = true
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={title}
        description={description || `${title} - techno.dog`}
        path={path}
        structuredData={structuredData}
      />
      <Header />
      <main className={cn(
        withHeaderPadding && "pt-16",
        className
      )}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
