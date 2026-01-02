import { ReactNode, useEffect, ComponentType, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Loader2, Menu } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminSidebar from './AdminSidebar';

interface AdminPageLayoutProps {
  title: string;
  description: string;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  iconColor?: string;
  children: ReactNode;
  onRefresh?: () => void;
  onRunAgent?: () => void;
  isLoading?: boolean;
  isRunning?: boolean;
  runButtonText?: string;
  actions?: ReactNode;
  showSidebar?: boolean;
}

export const AdminPageLayout = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-crimson',
  children,
  onRefresh,
  onRunAgent,
  isLoading = false,
  isRunning = false,
  runButtonText = 'Run',
  actions,
  showSidebar = true
}: AdminPageLayoutProps) => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // CRITICAL: All hooks must be called before any early returns
  useEffect(() => {
    if (!authLoading && !isLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, isLoading, navigate]);

  // Early returns AFTER all hooks
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Loading</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <AdminSidebar 
              isCollapsed={sidebarCollapsed} 
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
            />
          </div>
          
          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
          
          {/* Mobile sidebar */}
          <div className={cn(
            "lg:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300",
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <AdminSidebar 
              isCollapsed={false} 
              onToggle={() => setMobileSidebarOpen(false)} 
            />
          </div>
        </>
      )}

      {/* Subtle scanline overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px)',
        }}
      />
      
      {/* Main content */}
      <div className={cn(
        "relative z-10 transition-all duration-300",
        showSidebar && !sidebarCollapsed && "lg:ml-64",
        showSidebar && sidebarCollapsed && "lg:ml-16"
      )}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                {showSidebar && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden hover:bg-muted"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/admin')}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-mono uppercase tracking-tight text-foreground flex items-center gap-2">
                    {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
                    {title}
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {onRefresh && (
                  <Button onClick={onRefresh} variant="outline" size="sm" className="font-mono text-xs uppercase">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
                {onRunAgent && (
                  <Button 
                    onClick={onRunAgent} 
                    disabled={isRunning} 
                    size="sm" 
                    variant="brutalist"
                    className="font-mono text-xs uppercase"
                  >
                    {isRunning && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    {isRunning ? 'Running' : runButtonText}
                  </Button>
                )}
                {actions}
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPageLayout;
