import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Database,
  Bot,
  Users,
  Settings,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Newspaper,
  Image,
  Music,
  Headphones,
  Shield,
  Activity,
  Bell,
  FileText,
  BadgeCheck,
  Zap,
  Globe,
  BookOpen,
  MessageSquare,
  Cpu,
  Building,
  Radio,
  PenTool,
  Languages,
  Search,
  Library,
  Dog,
  Ticket,
  Key,
  Heart,
  CheckCircle,
  Inbox,
  Target,
  ClipboardList,
} from 'lucide-react';

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

interface NavItem {
  label: string;
  path: string;
  icon?: React.ElementType;
  description?: string;
}

const adminSections: NavSection[] = [
  {
    id: 'control',
    label: 'Control Center',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, description: 'Main overview' },
      { label: 'System Health', path: '/admin/health', icon: Activity, description: 'Infrastructure status' },
      { label: 'API Guardian', path: '/admin/api-guardian', icon: Key, description: 'Keys & rate limits' },
      { label: 'Security', path: '/admin/security-auditor', icon: Shield, description: 'Access control' },
      { label: 'Data Integrity', path: '/admin/data-integrity', icon: CheckCircle, description: 'Orphaned records' },
      { label: 'Activity Log', path: '/admin/activity-log', icon: FileText, description: 'Action history' },
      { label: 'Notifications', path: '/admin/notifications', icon: Bell, description: 'Alert channels' },
    ],
  },
  {
    id: 'data',
    label: 'Data & Content',
    icon: Database,
    items: [
      { label: 'Artists', path: '/admin/dj-artists', icon: Music, description: 'Database records' },
      { label: 'Gear', path: '/admin/gear-agent', icon: Headphones, description: 'Equipment database' },
      { label: 'Media Engine', path: '/admin/media-engine', icon: Image, description: 'Photo pipeline' },
      { label: 'Media Curator', path: '/admin/media-curator', icon: Image, description: 'Photo assets' },
      { label: 'AI Images', path: '/admin/images', icon: Image, description: 'Generated assets' },
      { label: 'News', path: '/admin/news-agent', icon: Newspaper, description: 'Articles & drafts' },
      { label: 'Knowledge Base', path: '/admin/knowledge', icon: Library, description: 'Wikipedia ingest' },
      { label: 'Knowledge Layer', path: '/admin/knowledge-layer', icon: Library, description: 'RAG system' },
      { label: 'Book Knowledge', path: '/admin/book-knowledge', icon: BookOpen, description: 'Book database' },
      { label: 'Librarian', path: '/admin/librarian', icon: BookOpen, description: 'Book discovery' },
      { label: 'Data Audit', path: '/admin/data-audit', icon: ClipboardList, description: 'Entity analysis' },
      { label: 'Artist Migration', path: '/admin/artist-migration', icon: Database, description: 'Data migration' },
    ],
  },
  {
    id: 'agents',
    label: 'AI Agents',
    icon: Bot,
    items: [
      { label: 'AI Orchestrator', path: '/admin/ai-orchestrator', icon: Cpu, description: 'Central coordination' },
      { label: 'Content Orchestrator', path: '/admin/content-orchestrator', icon: PenTool, description: 'Entity enrichment' },
      { label: 'Artist Enrichment', path: '/admin/artist-enrichment', icon: Music, description: 'Artist data pipeline' },
      { label: 'Gear Expert', path: '/admin/gear-agent', icon: Headphones, description: 'Equipment AI' },
      { label: 'Gear Manufacturer', path: '/admin/gear-manufacturer', icon: Building, description: 'Brand relations' },
      { label: 'Artist Labels', path: '/admin/artist-label-agent', icon: Radio, description: 'Management & labels' },
      { label: 'Labels Agent', path: '/admin/labels-agent', icon: Radio, description: 'Label discovery' },
      { label: 'Collectives', path: '/admin/collectives-agent', icon: Users, description: 'Scene intelligence' },
      { label: 'PR & Media', path: '/admin/pr-media', icon: Globe, description: 'Journalist contacts' },
      { label: 'Outreach Engine', path: '/admin/outreach-engine', icon: Target, description: 'Email campaigns' },
      { label: 'Dog Agent', path: '/admin/dog-agent', icon: MessageSquare, description: 'Voice assistant' },
      { label: 'Translation', path: '/admin/translation-agent', icon: Languages, description: 'Multi-language' },
      { label: 'Knowledge Gap', path: '/admin/knowledge-gap', icon: Search, description: 'Content gaps' },
      { label: 'Health Monitor', path: '/admin/health-monitor', icon: Heart, description: 'Agent health' },
      { label: 'Media Monitor', path: '/admin/media-monitor', icon: Activity, description: 'Pipeline status' },
      { label: 'Submissions Triage', path: '/admin/submissions-triage', icon: Inbox, description: 'Auto-triage' },
      { label: 'Analytics Reporter', path: '/admin/analytics-reporter', icon: BarChart3, description: 'Usage insights' },
      { label: 'Privacy Agent', path: '/admin/privacy-agent', icon: Shield, description: 'GDPR compliance' },
      { label: 'Playbook', path: '/admin/playbook-agent', icon: BookOpen, description: 'OS handbook' },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    items: [
      { label: 'User Management', path: '/admin/users', icon: Users, description: 'Permissions & roles' },
      { label: 'Submissions', path: '/admin/submissions', icon: Inbox, description: 'Full management' },
      { label: 'Moderation', path: '/admin/moderation', icon: Shield, description: 'Review content' },
      { label: 'Badges', path: '/admin/badges', icon: BadgeCheck, description: 'Gamification' },
      { label: 'XP Events', path: '/admin/xp-events', icon: Zap, description: 'Multipliers' },
      { label: 'Ticketing', path: '/admin/ticketing', icon: Ticket, description: 'Event tickets' },
      { label: 'Training Center', path: '/admin/training', icon: BookOpen, description: 'Onboarding' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    items: [
      { label: 'Doggies', path: '/admin/doggies', icon: Dog, description: 'Pack management' },
      { label: 'Doggy Orchestrator', path: '/admin/doggy-orchestrator', icon: Dog, description: 'Pack sync' },
      { label: 'Audit Log', path: '/admin/audit', icon: FileText, description: 'AI-powered audit' },
      { label: 'Control Center', path: '/admin/control-center', icon: Cpu, description: 'Agent control' },
      { label: 'Changelog', path: '/admin/changelog', icon: ClipboardList, description: 'Version history' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    items: [
      { label: 'Dashboard', path: '/analytics', icon: BarChart3, description: 'Usage metrics' },
      { label: 'SEO Strategy', path: '/admin/google-organic-strategy', icon: Search, description: 'Organic growth' },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const AdminSidebar = ({ isCollapsed = false, onToggle }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['control']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-zinc-900 border-r border-crimson/20 z-40 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-crimson/20">
        {!isCollapsed && (
          <div className="font-mono text-sm uppercase tracking-wider text-crimson">
            Control Room
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="p-2 space-y-1">
          {adminSections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            const hasActiveItem = section.items.some(item => isActive(item.path));

            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors",
                    "hover:bg-zinc-800",
                    hasActiveItem && "bg-crimson/10 text-crimson"
                  )}
                >
                  <SectionIcon className={cn(
                    "w-4 h-4 flex-shrink-0",
                    hasActiveItem ? "text-crimson" : "text-muted-foreground"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="font-mono text-xs uppercase tracking-wider flex-1">
                        {section.label}
                      </span>
                      <ChevronRight className={cn(
                        "w-3 h-3 transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </>
                  )}
                </button>

                {!isCollapsed && isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border/50 pl-3">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon || FileText;
                      const active = isActive(item.path);

                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                            "hover:bg-zinc-800",
                            active && "bg-crimson/20 text-crimson"
                          )}
                        >
                          <ItemIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="font-mono text-[11px] truncate">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default AdminSidebar;
