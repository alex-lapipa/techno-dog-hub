import { useState, useEffect, useContext, createContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, X, Eye, EyeOff, Check } from 'lucide-react';
import { HistoryEntry } from './RequestHistory';

const API_KEY_STORAGE_KEY = 'technodog_api_key';

// Context for history management
export const HistoryContext = createContext<{
  addToHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
} | null>(null);

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryContext');
  return ctx;
};

interface TryItPanelProps {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  baseUrl: string;
  params?: { name: string; type: string; description: string; required?: boolean }[];
  body?: { name: string; type: string; description: string; required?: boolean }[];
}

export const TryItPanel = ({ method, path, baseUrl, params, body }: TryItPanelProps) => {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    }
    return '';
  });
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [bodyParams, setBodyParams] = useState<Record<string, string>>({});
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number; data: any; time: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const historyCtx = useContext(HistoryContext);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }
  }, [apiKey]);

  const pathParamNames = path.match(/:(\w+)/g)?.map(p => p.slice(1)) || [];

  const buildUrl = () => {
    let url = `${baseUrl}${path}`;
    
    pathParamNames.forEach(param => {
      if (pathParams[param]) {
        url = url.replace(`:${param}`, pathParams[param]);
      }
    });
    
    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      const url = buildUrl();
      const options: RequestInit = {
        method,
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && body && body.length > 0) {
        const bodyData: Record<string, any> = {};
        Object.entries(bodyParams).forEach(([key, value]) => {
          if (value) {
            try {
              bodyData[key] = JSON.parse(value);
            } catch {
              bodyData[key] = value;
            }
          }
        });
        if (Object.keys(bodyData).length > 0) {
          options.body = JSON.stringify(bodyData);
        }
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const data = await res.json();

      const responseTime = Math.round(endTime - startTime);
      setResponse({
        status: res.status,
        data,
        time: responseTime,
      });

      if (historyCtx) {
        const bodyData: Record<string, any> = {};
        Object.entries(bodyParams).forEach(([key, value]) => {
          if (value) {
            try { bodyData[key] = JSON.parse(value); } catch { bodyData[key] = value; }
          }
        });
        historyCtx.addToHistory({
          method,
          url,
          status: res.status,
          time: responseTime,
          requestBody: Object.keys(bodyData).length > 0 ? bodyData : undefined,
          responseData: data,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        <Play className="h-4 w-4" />
        Try It
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="apiKey" className="text-xs text-muted-foreground">API Key</Label>
          {apiKey && (
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Check className="h-2.5 w-2.5" />
              Saved
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <div className="relative flex-1">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              placeholder="td_live_xxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm h-9 pr-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {apiKey && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-crimson"
              onClick={() => {
                setApiKey('');
                localStorage.removeItem(API_KEY_STORAGE_KEY);
              }}
              title="Clear saved API key"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Path Parameters */}
      {pathParamNames.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Path Parameters</Label>
          <div className="grid gap-2">
            {pathParamNames.map((param) => (
              <div key={param} className="flex items-center gap-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded min-w-[60px]">{param}</code>
                <Input
                  placeholder={`Enter ${param}`}
                  value={pathParams[param] || ''}
                  onChange={(e) => setPathParams({ ...pathParams, [param]: e.target.value })}
                  className="font-mono text-sm h-8 flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Parameters */}
      {params && params.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Query Parameters</Label>
          <div className="grid gap-2">
            {params.map((param) => (
              <div key={param.name} className="flex items-center gap-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded min-w-[80px]">
                  {param.name}
                  {param.required && <span className="text-crimson ml-1">*</span>}
                </code>
                <Input
                  placeholder={param.description}
                  value={queryParams[param.name] || ''}
                  onChange={(e) => setQueryParams({ ...queryParams, [param.name]: e.target.value })}
                  className="font-mono text-sm h-8 flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body Parameters */}
      {body && body.length > 0 && method !== 'GET' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Request Body</Label>
          <div className="grid gap-2">
            {body.map((field) => (
              <div key={field.name} className="flex items-start gap-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded min-w-[100px] mt-2">
                  {field.name}
                  {field.required && <span className="text-crimson ml-1">*</span>}
                </code>
                {field.type.includes('[]') || field.type === 'object' ? (
                  <Textarea
                    placeholder={`${field.description} (JSON format)`}
                    value={bodyParams[field.name] || ''}
                    onChange={(e) => setBodyParams({ ...bodyParams, [field.name]: e.target.value })}
                    className="font-mono text-sm flex-1 min-h-[60px]"
                  />
                ) : (
                  <Input
                    placeholder={field.description}
                    value={bodyParams[field.name] || ''}
                    onChange={(e) => setBodyParams({ ...bodyParams, [field.name]: e.target.value })}
                    className="font-mono text-sm h-8 flex-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full font-mono text-xs uppercase tracking-wider"
        variant="brutalist"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Send Request
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="p-3 bg-crimson/10 border border-crimson/30 rounded text-sm text-crimson font-mono">
          {error}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge
              className={`font-mono text-xs ${
                response.status >= 200 && response.status < 300
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : response.status >= 400
                  ? 'bg-crimson/20 text-crimson border-crimson/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {response.status}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{response.time}ms</span>
          </div>
          <pre className="bg-background/50 border border-border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[300px] overflow-y-auto">
            <code className="text-foreground/90">
              {JSON.stringify(response.data, null, 2)}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};
