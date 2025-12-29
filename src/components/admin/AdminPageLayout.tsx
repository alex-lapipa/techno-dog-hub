import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Bot, Loader2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface AdminPageLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  children: ReactNode;
  onRefresh?: () => void;
  onRunAgent?: () => void;
  isLoading?: boolean;
  isRunning?: boolean;
  agentButtonText?: string;
  agentButtonColor?: string;
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
  agentButtonText = 'Run Agent',
  agentButtonColor = 'bg-crimson hover:bg-crimson/80',
  actions
}: AdminPageLayoutProps) => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-crimson" />
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Loading...</p>
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
      {/* VHS Scanline overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)',
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
                className="hover:bg-zinc-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {onRefresh && (
                <Button onClick={onRefresh} variant="outline" size="sm" className="font-mono text-xs">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
              {onRunAgent && (
                <Button 
                  onClick={onRunAgent} 
                  disabled={isRunning} 
                  size="sm" 
                  className={`font-mono text-xs ${agentButtonColor}`}
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4 mr-2" />
                  )}
                  {isRunning ? 'Running...' : agentButtonText}
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
