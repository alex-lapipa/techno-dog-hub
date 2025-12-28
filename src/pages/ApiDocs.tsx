import { useState, useEffect, createContext, useContext } from "react";
import PageSEO from "@/components/PageSEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Lock, Server, Users, FileText, Image, Activity, Play, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RequestHistory, HistoryEntry } from "@/components/api-docs/RequestHistory";

const BASE_URL = "https://bshyeweljerupobpmmes.supabase.co/functions/v1/admin-api";

// Context for history management
const HistoryContext = createContext<{
  addToHistory: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
} | null>(null);

const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryContext");
  return ctx;
};

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-background/50 border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code className="text-foreground/90">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

interface TryItPanelProps {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  params?: { name: string; type: string; description: string; required?: boolean }[];
  body?: { name: string; type: string; description: string; required?: boolean }[];
}

const API_KEY_STORAGE_KEY = "technodog_api_key";

const TryItPanel = ({ method, path, params, body }: TryItPanelProps) => {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
    }
    return "";
  });
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [bodyParams, setBodyParams] = useState<Record<string, string>>({});
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number; data: any; time: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const historyCtx = useContext(HistoryContext);

  // Persist API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }
  }, [apiKey]);

  // Extract path parameters like :id from path
  const pathParamNames = path.match(/:(\w+)/g)?.map(p => p.slice(1)) || [];

  const buildUrl = () => {
    let url = `${BASE_URL}${path}`;
    
    // Replace path parameters
    pathParamNames.forEach(param => {
      if (pathParams[param]) {
        url = url.replace(`:${param}`, pathParams[param]);
      }
    });
    
    // Add query parameters
    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
    
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      setError("API key is required");
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
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      };

      if (method !== "GET" && body && body.length > 0) {
        const bodyData: Record<string, any> = {};
        Object.entries(bodyParams).forEach(([key, value]) => {
          if (value) {
            // Try to parse as JSON for arrays/objects
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

      // Add to history
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
      setError(err instanceof Error ? err.message : "Request failed");
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
        <Label htmlFor="apiKey" className="text-xs text-muted-foreground">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="td_live_xxxxx"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="font-mono text-sm h-9"
        />
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
                  value={pathParams[param] || ""}
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
                  value={queryParams[param.name] || ""}
                  onChange={(e) => setQueryParams({ ...queryParams, [param.name]: e.target.value })}
                  className="font-mono text-sm h-8 flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body Parameters */}
      {body && body.length > 0 && method !== "GET" && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Request Body</Label>
          <div className="grid gap-2">
            {body.map((field) => (
              <div key={field.name} className="flex items-start gap-2">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded min-w-[100px] mt-2">
                  {field.name}
                  {field.required && <span className="text-crimson ml-1">*</span>}
                </code>
                {field.type.includes("[]") || field.type === "object" ? (
                  <Textarea
                    placeholder={`${field.description} (JSON format)`}
                    value={bodyParams[field.name] || ""}
                    onChange={(e) => setBodyParams({ ...bodyParams, [field.name]: e.target.value })}
                    className="font-mono text-sm flex-1 min-h-[60px]"
                  />
                ) : (
                  <Input
                    placeholder={field.description}
                    value={bodyParams[field.name] || ""}
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
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : response.status >= 400
                  ? "bg-crimson/20 text-crimson border-crimson/30"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
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

const EndpointCard = ({ 
  method, 
  path, 
  description, 
  params, 
  body,
  response,
  example 
}: { 
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  params?: { name: string; type: string; description: string; required?: boolean }[];
  body?: { name: string; type: string; description: string; required?: boolean }[];
  response?: string;
  example?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const methodColors = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <Card className="bg-card/50 border-border/50 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${methodColors[method]} font-mono text-xs px-2 py-0.5`}>
              {method}
            </Badge>
            <code className="text-sm font-mono text-foreground/90">{path}</code>
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 h-7">
                <Play className="h-3 w-3" />
                Try It
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params && params.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Query Parameters</h4>
            <div className="space-y-2">
              {params.map((param) => (
                <div key={param.name} className="flex items-start gap-2 text-sm">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{param.name}</code>
                  <span className="text-muted-foreground text-xs">({param.type})</span>
                  {param.required && <Badge variant="outline" className="text-xs">required</Badge>}
                  <span className="text-foreground/70">{param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {body && body.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Request Body</h4>
            <div className="space-y-2">
              {body.map((field) => (
                <div key={field.name} className="flex items-start gap-2 text-sm">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{field.name}</code>
                  <span className="text-muted-foreground text-xs">({field.type})</span>
                  {field.required && <Badge variant="outline" className="text-xs">required</Badge>}
                  <span className="text-foreground/70">{field.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Try It Panel */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <TryItPanel method={method} path={path} params={params} body={body} />
          </CollapsibleContent>
        </Collapsible>

        {example && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Example</h4>
            <CodeBlock code={example} />
          </div>
        )}

        {response && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Response</h4>
            <CodeBlock code={response} language="json" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ApiDocs = () => {
  const baseUrl = BASE_URL;
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50
  };

  const clearHistory = () => setHistory([]);

  return (
    <HistoryContext.Provider value={{ addToHistory }}>
      <PageSEO
        title="Admin API Documentation | Techno Dog"
        description="Complete API documentation for the Techno Dog Admin API. Manage users, content, articles, DJ artists, and system settings."
        path="/api-docs"
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Content */}
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Admin API Documentation</h1>
                <p className="text-muted-foreground">
                  RESTful API for managing Techno Dog content, users, and system settings. Use the "Try It" button to test endpoints live.
                </p>
              </div>

          {/* Authentication Section */}
          <Card className="bg-card/50 border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                All API requests require an admin API key. Include it in the request headers:
              </p>
              <CodeBlock 
                code={`curl -X GET "${baseUrl}/ping" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json"`} 
              />
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-200">
                  <strong>Requirements:</strong> API key must have <code className="bg-muted px-1 rounded">admin:full</code> or <code className="bg-muted px-1 rounded">write:admin</code> scope, and the associated user must have the admin role.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card className="bg-card/50 border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Base URL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={baseUrl} />
            </CardContent>
          </Card>

          {/* Endpoints */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="users" className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Articles</span>
              </TabsTrigger>
              <TabsTrigger value="artists" className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Artists</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-1.5">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1.5">
                <Server className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <ScrollArea className="h-[600px] pr-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </h2>

                <EndpointCard
                  method="GET"
                  path="/users"
                  description="List all users with their profiles and roles."
                  response={`{
  "success": true,
  "data": {
    "users": [
      {
        "user_id": "uuid",
        "email": "user@example.com",
        "display_name": "John Doe",
        "role": "admin",
        "trust_score": 50,
        "community_status": "verified"
      }
    ],
    "count": 1
  }
}`}
                  example={`curl -X GET "${baseUrl}/users" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/users/:id"
                  description="Get detailed information about a specific user."
                  example={`curl -X GET "${baseUrl}/users/user-uuid-here" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="PATCH"
                  path="/users/:id"
                  description="Update a user's profile or community status."
                  body={[
                    { name: "status", type: "string", description: "Community status: pending, verified, banned" },
                    { name: "trust_score", type: "number", description: "User's trust score (0-100)" },
                  ]}
                  example={`curl -X PATCH "${baseUrl}/users/user-uuid" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "verified", "trust_score": 75}'`}
                />

                <EndpointCard
                  method="POST"
                  path="/users/roles"
                  description="Grant or revoke admin role for a user."
                  body={[
                    { name: "user_id", type: "string", description: "Target user ID", required: true },
                    { name: "action", type: "string", description: "grant or revoke", required: true },
                    { name: "role", type: "string", description: "Role name (admin)", required: true },
                  ]}
                  example={`curl -X POST "${baseUrl}/users/roles" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"user_id": "uuid", "action": "grant", "role": "admin"}'`}
                />
              </ScrollArea>
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles">
              <ScrollArea className="h-[600px] pr-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  News Articles
                </h2>

                <EndpointCard
                  method="GET"
                  path="/content/articles"
                  description="List articles with filtering, search, and pagination."
                  params={[
                    { name: "status", type: "string", description: "Filter by status: draft, published, archived" },
                    { name: "search", type: "string", description: "Search in title and body" },
                    { name: "limit", type: "number", description: "Results per page (default: 50)" },
                    { name: "offset", type: "number", description: "Pagination offset (default: 0)" },
                  ]}
                  response={`{
  "success": true,
  "data": {
    "articles": [...],
    "count": 10,
    "total": 150,
    "stats": {
      "draft": 45,
      "published": 100,
      "archived": 5
    }
  }
}`}
                  example={`curl -X GET "${baseUrl}/content/articles?status=draft&limit=10" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/content/articles/:id"
                  description="Get a single article with full details."
                  example={`curl -X GET "${baseUrl}/content/articles/article-uuid" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/articles"
                  description="Create a new article."
                  body={[
                    { name: "title", type: "string", description: "Article title", required: true },
                    { name: "body_markdown", type: "string", description: "Article content in markdown", required: true },
                    { name: "author_pseudonym", type: "string", description: "Author name", required: true },
                    { name: "subtitle", type: "string", description: "Article subtitle" },
                    { name: "city_tags", type: "string[]", description: "City tags (JSON array)" },
                    { name: "genre_tags", type: "string[]", description: "Genre tags (JSON array)" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/articles" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "New Techno Event",
    "body_markdown": "# Event Details\\n...",
    "author_pseudonym": "Underground Reporter"
  }'`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/articles/publish"
                  description="Publish a draft article."
                  body={[
                    { name: "article_id", type: "string", description: "Article ID to publish", required: true },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/articles/publish" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"article_id": "article-uuid"}'`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/articles/unpublish"
                  description="Unpublish an article (revert to draft)."
                  body={[
                    { name: "article_id", type: "string", description: "Article ID to unpublish", required: true },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/articles/unpublish" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"article_id": "article-uuid"}'`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/articles/bulk"
                  description="Bulk operations on multiple articles."
                  body={[
                    { name: "action", type: "string", description: "publish, unpublish, archive, or delete", required: true },
                    { name: "article_ids", type: "string[]", description: "Array of article IDs (JSON array)", required: true },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/articles/bulk" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "publish",
    "article_ids": ["uuid-1", "uuid-2"]
  }'`}
                  response={`{
  "success": true,
  "data": {
    "published": true,
    "count": 2
  }
}`}
                />

                <EndpointCard
                  method="DELETE"
                  path="/content/articles/:id"
                  description="Permanently delete an article."
                  example={`curl -X DELETE "${baseUrl}/content/articles/article-uuid" \\
  -H "x-api-key: td_live_xxxxx"`}
                />
              </ScrollArea>
            </TabsContent>

            {/* Artists Tab */}
            <TabsContent value="artists">
              <ScrollArea className="h-[600px] pr-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  DJ Artists
                </h2>

                <EndpointCard
                  method="GET"
                  path="/content/dj-artists"
                  description="List DJ artists with search and pagination."
                  params={[
                    { name: "search", type: "string", description: "Search in artist name, real name, known_for" },
                    { name: "limit", type: "number", description: "Results per page (default: 50)" },
                    { name: "offset", type: "number", description: "Pagination offset (default: 0)" },
                  ]}
                  response={`{
  "success": true,
  "data": {
    "artists": [
      {
        "id": 1,
        "rank": 1,
        "artist_name": "Jeff Mills",
        "nationality": "USA",
        "subgenres": ["Detroit techno"]
      }
    ],
    "count": 50,
    "total": 100
  }
}`}
                  example={`curl -X GET "${baseUrl}/content/dj-artists?search=mills&limit=10" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/content/dj-artists/:id"
                  description="Get a single DJ artist by ID."
                  example={`curl -X GET "${baseUrl}/content/dj-artists/1" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/dj-artists"
                  description="Create a new DJ artist."
                  body={[
                    { name: "artist_name", type: "string", description: "Artist stage name", required: true },
                    { name: "rank", type: "number", description: "Ranking position", required: true },
                    { name: "real_name", type: "string", description: "Real name" },
                    { name: "nationality", type: "string", description: "Country of origin" },
                    { name: "subgenres", type: "string[]", description: "Music subgenres (JSON array)" },
                    { name: "labels", type: "string[]", description: "Associated labels (JSON array)" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/dj-artists" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "artist_name": "New Artist",
    "rank": 101,
    "nationality": "Germany"
  }'`}
                />

                <EndpointCard
                  method="PATCH"
                  path="/content/dj-artists/:id"
                  description="Update an existing DJ artist."
                  body={[
                    { name: "artist_name", type: "string", description: "Artist stage name" },
                    { name: "nationality", type: "string", description: "Country of origin" },
                    { name: "subgenres", type: "string[]", description: "Music subgenres (JSON array)" },
                  ]}
                  example={`curl -X PATCH "${baseUrl}/content/dj-artists/1" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"nationality": "USA"}'`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/dj-artists/bulk"
                  description="Bulk operations on multiple DJ artists."
                  body={[
                    { name: "action", type: "string", description: "update or delete", required: true },
                    { name: "artist_ids", type: "number[]", description: "Array of artist IDs (JSON array)", required: true },
                    { name: "updates", type: "object", description: "Fields to update (for update action)" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/dj-artists/bulk" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "delete", "artist_ids": [101, 102]}'`}
                />

                <EndpointCard
                  method="DELETE"
                  path="/content/dj-artists/:id"
                  description="Delete a DJ artist."
                  example={`curl -X DELETE "${baseUrl}/content/dj-artists/101" \\
  -H "x-api-key: td_live_xxxxx"`}
                />
              </ScrollArea>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media">
              <ScrollArea className="h-[600px] pr-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Media Assets
                </h2>

                <EndpointCard
                  method="GET"
                  path="/content/media-assets"
                  description="List media assets with filtering."
                  params={[
                    { name: "entity_type", type: "string", description: "Filter by entity type (artist, venue, etc.)" },
                    { name: "entity_id", type: "string", description: "Filter by entity ID" },
                    { name: "final_selected", type: "boolean", description: "Filter by selection status" },
                    { name: "limit", type: "number", description: "Results per page (default: 50)" },
                    { name: "offset", type: "number", description: "Pagination offset (default: 0)" },
                  ]}
                  example={`curl -X GET "${baseUrl}/content/media-assets?entity_type=artist&limit=20" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/content/media-assets/by-entity"
                  description="Get all media assets for a specific entity."
                  params={[
                    { name: "type", type: "string", description: "Entity type", required: true },
                    { name: "id", type: "string", description: "Entity ID", required: true },
                  ]}
                  example={`curl -X GET "${baseUrl}/content/media-assets/by-entity?type=artist&id=jeff-mills" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/media-assets"
                  description="Create a new media asset."
                  body={[
                    { name: "entity_type", type: "string", description: "Entity type", required: true },
                    { name: "entity_id", type: "string", description: "Entity ID", required: true },
                    { name: "entity_name", type: "string", description: "Entity display name", required: true },
                    { name: "source_url", type: "string", description: "Original source URL" },
                    { name: "alt_text", type: "string", description: "Alt text for accessibility" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/media-assets" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entity_type": "artist",
    "entity_id": "jeff-mills",
    "entity_name": "Jeff Mills"
  }'`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/media-assets/bulk"
                  description="Bulk operations on media assets."
                  body={[
                    { name: "action", type: "string", description: "update, delete, or select_final", required: true },
                    { name: "asset_ids", type: "string[]", description: "Array of asset IDs (JSON array)", required: true },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/media-assets/bulk" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "select_final", "asset_ids": ["uuid-1"]}'`}
                />

                <EndpointCard
                  method="DELETE"
                  path="/content/media-assets/:id"
                  description="Delete a media asset."
                  example={`curl -X DELETE "${baseUrl}/content/media-assets/asset-uuid" \\
  -H "x-api-key: td_live_xxxxx"`}
                />
              </ScrollArea>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system">
              <ScrollArea className="h-[600px] pr-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Endpoints
                </h2>

                <EndpointCard
                  method="GET"
                  path="/ping"
                  description="Test API authentication and connectivity."
                  response={`{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-01T00:00:00Z",
    "user_id": "admin-uuid",
    "scopes": ["admin:full"]
  }
}`}
                  example={`curl -X GET "${baseUrl}/ping" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/system/health"
                  description="Get system health overview including alerts and pending jobs."
                  response={`{
  "success": true,
  "data": {
    "health": {
      "active_alerts": 0,
      "pending_jobs": 5,
      "pending_reports": 2
    }
  }
}`}
                  example={`curl -X GET "${baseUrl}/system/health" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/system/analytics"
                  description="Get analytics summary for the last 24 hours."
                  response={`{
  "success": true,
  "data": {
    "analytics": {
      "period": "24h",
      "total_events": 1523,
      "by_event": {
        "page_view": 1200,
        "click": 300
      }
    }
  }
}`}
                  example={`curl -X GET "${baseUrl}/system/analytics" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/system/api-usage"
                  description="Get API usage statistics for the last 24 hours."
                  example={`curl -X GET "${baseUrl}/system/api-usage" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/system/audit"
                  description="Get recent admin audit logs."
                  example={`curl -X GET "${baseUrl}/system/audit" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/system/agents"
                  description="Get recent agent reports and status."
                  example={`curl -X GET "${baseUrl}/system/agents" \\
  -H "x-api-key: td_live_xxxxx"`}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Error Responses */}
          <Card className="bg-card/50 border-border/50 mt-8">
            <CardHeader>
              <CardTitle>Error Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">All errors return a JSON object with error details:</p>
              <CodeBlock 
                code={`{
  "error": "Error message description",
  "code": "ERROR_CODE"
}

// Common error codes:
// UNAUTHORIZED (401) - Missing or invalid API key
// FORBIDDEN (403) - Insufficient permissions
// ERROR (500) - Server error`} 
                language="json" 
              />
            </CardContent>
          </Card>
            </div>

            {/* History Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <RequestHistory history={history} onClear={clearHistory} />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </HistoryContext.Provider>
  );
};

export default ApiDocs;
