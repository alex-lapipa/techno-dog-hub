import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface AdminPageLayoutProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: ReactNode;
  onRefresh?: () => void;
  onRunAgent?: () => void;
  isLoading?: boolean;
  isRunning?: boolean;
  runButtonText?: string;
  actions?: ReactNode;
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
  actions
}: AdminPageLayoutProps) => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();

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
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle scanline overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px)',
        }}
      />
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
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
  );
};

export default AdminPageLayout;
