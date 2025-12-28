import { useState } from "react";
import PageSEO from "@/components/PageSEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, ExternalLink, Lock, Server, Users, FileText, Image, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const methodColors = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <Card className="bg-card/50 border-border/50 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={`${methodColors[method]} font-mono text-xs px-2 py-0.5`}>
            {method}
          </Badge>
          <code className="text-sm font-mono text-foreground/90">{path}</code>
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
  const baseUrl = "https://bshyeweljerupobpmmes.supabase.co/functions/v1/admin-api";

  return (
    <>
      <PageSEO
        title="Admin API Documentation | Techno Dog"
        description="Complete API documentation for the Techno Dog Admin API. Manage users, content, articles, DJ artists, and system settings."
        path="/api-docs"
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin API Documentation</h1>
            <p className="text-muted-foreground">
              RESTful API for managing Techno Dog content, users, and system settings.
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
                    { name: "city_tags", type: "string[]", description: "City tags" },
                    { name: "genre_tags", type: "string[]", description: "Genre tags" },
                    { name: "entity_tags", type: "string[]", description: "Entity tags" },
                    { name: "source_urls", type: "string[]", description: "Source URLs" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/articles" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "New Techno Event",
    "body_markdown": "# Event Details\\n...",
    "author_pseudonym": "Underground Reporter",
    "city_tags": ["Berlin"],
    "genre_tags": ["techno"]
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
                    { name: "article_ids", type: "string[]", description: "Array of article IDs", required: true },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/articles/bulk" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "publish",
    "article_ids": ["uuid-1", "uuid-2", "uuid-3"]
  }'`}
                  response={`{
  "success": true,
  "data": {
    "published": true,
    "count": 3
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
        "real_name": "Jeffrey Mills",
        "nationality": "USA",
        "years_active": "1984–present",
        "subgenres": ["Detroit techno"],
        "labels": ["Axis", "Tresor"],
        "known_for": "The Wizard"
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
                    { name: "years_active", type: "string", description: "Active years range" },
                    { name: "subgenres", type: "string[]", description: "Music subgenres" },
                    { name: "labels", type: "string[]", description: "Associated labels" },
                    { name: "top_tracks", type: "string[]", description: "Notable tracks" },
                    { name: "known_for", type: "string", description: "What they're known for" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/dj-artists" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "artist_name": "New Artist",
    "rank": 101,
    "nationality": "Germany",
    "subgenres": ["industrial techno"],
    "labels": ["Mord", "PoleGroup"]
  }'`}
                />

                <EndpointCard
                  method="PATCH"
                  path="/content/dj-artists/:id"
                  description="Update an existing DJ artist."
                  body={[
                    { name: "artist_name", type: "string", description: "Artist stage name" },
                    { name: "rank", type: "number", description: "Ranking position" },
                    { name: "subgenres", type: "string[]", description: "Music subgenres" },
                    { name: "labels", type: "string[]", description: "Associated labels" },
                  ]}
                  example={`curl -X PATCH "${baseUrl}/content/dj-artists/1" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"subgenres": ["detroit techno", "minimal"]}'`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/dj-artists/bulk"
                  description="Bulk operations on multiple DJ artists."
                  body={[
                    { name: "action", type: "string", description: "update or delete", required: true },
                    { name: "artist_ids", type: "number[]", description: "Array of artist IDs", required: true },
                    { name: "updates", type: "object", description: "Fields to update (for update action)" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/dj-artists/bulk" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "update",
    "artist_ids": [1, 2, 3],
    "updates": {"nationality": "Updated"}
  }'`}
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
                    { name: "storage_url", type: "string", description: "Storage URL" },
                    { name: "provider", type: "string", description: "Image provider" },
                    { name: "license_status", type: "string", description: "License status" },
                    { name: "alt_text", type: "string", description: "Alt text for accessibility" },
                    { name: "match_score", type: "number", description: "AI match score (0-100)" },
                    { name: "quality_score", type: "number", description: "Quality score (0-100)" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/media-assets" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entity_type": "artist",
    "entity_id": "jeff-mills",
    "entity_name": "Jeff Mills",
    "source_url": "https://example.com/image.jpg",
    "license_status": "verified",
    "alt_text": "Jeff Mills performing"
  }'`}
                />

                <EndpointCard
                  method="POST"
                  path="/content/media-assets/bulk"
                  description="Bulk operations on media assets."
                  body={[
                    { name: "action", type: "string", description: "update, delete, or select_final", required: true },
                    { name: "asset_ids", type: "string[]", description: "Array of asset IDs", required: true },
                    { name: "updates", type: "object", description: "Fields to update (for update action)" },
                  ]}
                  example={`curl -X POST "${baseUrl}/content/media-assets/bulk" \\
  -H "x-api-key: td_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "select_final",
    "asset_ids": ["asset-uuid-1"]
  }'`}
                  response={`{
  "success": true,
  "data": {
    "selected": true,
    "count": 1
  }
}`}
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
      "pending_reports": 2,
      "alerts": []
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
        "click": 300,
        "scroll_depth": 23
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
                  response={`{
  "success": true,
  "data": {
    "api_usage": {
      "period": "24h",
      "total_requests": 5432,
      "recent": [...]
    }
  }
}`}
                  example={`curl -X GET "${baseUrl}/system/api-usage" \\
  -H "x-api-key: td_live_xxxxx"`}
                />

                <EndpointCard
                  method="GET"
                  path="/system/audit"
                  description="Get recent admin audit logs."
                  response={`{
  "success": true,
  "data": {
    "audit_logs": [
      {
        "id": "uuid",
        "admin_user_id": "uuid",
        "action_type": "POST /content/articles/publish",
        "entity_type": "content",
        "entity_id": "article-uuid",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}`}
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
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ApiDocs;
