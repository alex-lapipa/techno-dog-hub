import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AgentReport {
  id: string;
  agent_name: string;
  agent_category: string;
  report_type: string;
  severity: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

const AgentReportsList = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['agent-reports-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_reports')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as AgentReport[];
    },
    refetchInterval: 30000
  });

  const severityColors: Record<string, string> = {
    critical: 'bg-crimson/30 border-crimson text-crimson',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500',
    info: 'bg-logo-green/20 border-logo-green/50 text-logo-green'
  };

  if (isLoading) {
    return (
      <div className="border border-border bg-card p-6">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">
          Loading reports...
        </div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="border border-border bg-card p-6">
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
          // Pending Reports
        </h3>
        <div className="text-center py-8">
          <div className="font-mono text-2xl text-logo-green mb-2">●</div>
          <p className="font-mono text-xs text-muted-foreground">
            No pending reports
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card p-6">
      <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
        // Pending Reports ({reports.length})
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {reports.map((report) => (
          <div 
            key={report.id}
            className="p-3 border border-border/50 bg-background/50 hover:border-crimson/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "px-1.5 py-0.5 text-[9px] font-mono uppercase border",
                    severityColors[report.severity] || severityColors.info
                  )}>
                    {report.severity}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    {report.agent_name}
                  </span>
                </div>
                <p className="font-mono text-xs text-foreground truncate">
                  {report.title}
                </p>
                {report.description && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-1 line-clamp-1">
                    {report.description}
                  </p>
                )}
              </div>
              <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentReportsList;