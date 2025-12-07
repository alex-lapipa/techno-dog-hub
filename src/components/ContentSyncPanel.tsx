import { useState, useEffect } from 'react';
import { useContentSync } from '@/hooks/useContentSync';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Image, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function ContentSyncPanel() {
  const { user, isAdmin } = useAuth();
  const { isLoading, progress, result, syncContent, getSyncStatus, getCorrections } = useContentSync();
  const [status, setStatus] = useState<Record<string, { total: number; verified: number; needsReview: number }> | null>(null);
  const [corrections, setCorrections] = useState<Array<{
    entity_type: string;
    entity_id: string;
    corrections: unknown;
    photo_url?: string | null;
  }>>([]);

  useEffect(() => {
    if (isAdmin) {
      getSyncStatus().then(setStatus);
      getCorrections().then(setCorrections);
    }
  }, [isAdmin, getSyncStatus, getCorrections]);

  if (!user || !isAdmin) {
    return null;
  }

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  const entityTypes = ['artist', 'venue', 'festival', 'gear', 'label', 'release', 'crew'];

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Content Sync (Grok AI)</h2>
        </div>
        <Button 
          onClick={() => syncContent()} 
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Sync All Content'}
        </Button>
      </div>

      {isLoading && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Processing entities...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {result && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{result.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-500">{result.verified}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-500">{result.needsReview}</div>
            <div className="text-xs text-muted-foreground">Needs Review</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">{result.withPhotos}</div>
            <div className="text-xs text-muted-foreground">Photos Found</div>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{result.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>
      )}

      {/* Sync by type */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Sync by Category</h3>
        <div className="flex flex-wrap gap-2">
          {entityTypes.map(type => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => syncContent(type)}
              className="capitalize"
            >
              {type}s
              {status?.[type] && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {status[type].verified}/{status[type].total}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Corrections preview */}
      {corrections.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            Content Needing Review ({corrections.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {corrections.slice(0, 10).map((item, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{item.entity_type}: {item.entity_id}</span>
                  <div className="flex gap-2">
                    {item.photo_url && (
                      <Badge variant="outline" className="gap-1">
                        <Image className="w-3 h-3" />
                        Photo found
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {(item.corrections as Array<unknown>)?.length || 0} corrections
                    </Badge>
                  </div>
                </div>
                {(item.corrections as Array<{ field: string; original: string; corrected: string; reason: string }>)?.slice(0, 2).map((c, cIdx) => (
                  <div key={cIdx} className="text-xs text-muted-foreground ml-2">
                    <span className="text-yellow-500">{c.field}:</span> {c.original} → <span className="text-green-500">{c.corrected}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {status && Object.keys(status).length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Sync Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(status).map(([type, stats]) => (
              <div key={type} className="p-2 bg-muted/30 rounded text-center">
                <div className="text-xs text-muted-foreground capitalize">{type}s</div>
                <div className="font-medium">{stats.verified}/{stats.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
