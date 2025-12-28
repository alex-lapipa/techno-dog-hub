import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Award, Camera, FileText, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  points: number;
  action_type: string;
  description: string | null;
  created_at: string;
}

interface PointsHistoryProps {
  profileId: string;
  limit?: number;
}

const actionIcons: Record<string, React.ReactNode> = {
  photo_upload: <Camera className="h-4 w-4 text-blue-400" />,
  correction: <FileText className="h-4 w-4 text-purple-400" />,
  correction_approved: <CheckCircle className="h-4 w-4 text-green-400" />,
  badge_earned: <Award className="h-4 w-4 text-amber-400" />,
  default: <TrendingUp className="h-4 w-4 text-primary" />,
};

export function PointsHistory({ profileId, limit = 20 }: PointsHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from("point_transactions")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    };

    loadHistory();
  }, [profileId, limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Points History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No points earned yet. Start contributing!
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-muted">
                    {actionIcons[tx.action_type] || actionIcons.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description || tx.action_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className={`font-mono text-sm font-bold ${
                    tx.points >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {tx.points >= 0 ? "+" : ""}{tx.points}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
