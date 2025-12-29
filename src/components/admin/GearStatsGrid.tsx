import { AdminStatsCard } from '@/components/admin';
import { Database, CheckCircle, Zap, Percent } from 'lucide-react';

interface AgentStats {
  totalGear: number;
  withDescriptions: number;
  withTechnoApps: number;
  completionRate: number;
}

interface GearStatsGridProps {
  stats: AgentStats | null;
}

export const GearStatsGrid = ({ stats }: GearStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AdminStatsCard
        label="Total Gear"
        value={stats?.totalGear || 0}
        icon={Database}
        iconColor="text-crimson"
      />
      <AdminStatsCard
        label="With Descriptions"
        value={stats?.withDescriptions || 0}
        icon={CheckCircle}
        iconColor="text-logo-green"
      />
      <AdminStatsCard
        label="Techno Apps"
        value={stats?.withTechnoApps || 0}
        icon={Zap}
        iconColor="text-amber-500"
      />
      <AdminStatsCard
        label="Completion"
        value={`${stats?.completionRate || 0}%`}
        icon={Percent}
      />
    </div>
  );
};

export default GearStatsGrid;
