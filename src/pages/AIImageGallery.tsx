import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Eye,
  Sparkles,
  Image as ImageIcon,
  Search,
  Filter,
  Download,
  Check,
  X,
  Loader2,
  Palette,
  Grid3X3,
  List,
} from "lucide-react";

interface MediaAsset {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  source_url: string | null;
  storage_url: string | null;
  provider: string | null;
  quality_score: number | null;
  match_score: number | null;
  final_selected: boolean | null;
  alt_text: string | null;
  reasoning_summary: string | null;
  created_at: string;
  license_status: string | null;
}

const AIImageGallery = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: "Error loading assets",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAssets();
    }
  }, [isAdmin]);

  const handleRegenerate = async (asset: MediaAsset) => {
    setRegenerating(asset.id);
    try {
      const { data, error } = await supabase.functions.invoke("media-engine", {
        body: {
          action: "generate-batch",
          entities: [
            {
              type: asset.entity_type,
              id: asset.entity_id,
              name: asset.entity_name,
            },
          ],
        },
      });

      if (error) throw error;

      toast({
        title: "Regeneration started",
        description: `Generating new image for ${asset.entity_name}`,
      });

      // Refresh after a delay
      setTimeout(fetchAssets, 3000);
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: "Regeneration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRegenerating(null);
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    setDeleting(asset.id);
    try {
      const { error } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", asset.id);

      if (error) throw error;

      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      toast({
        title: "Asset deleted",
        description: `Removed image for ${asset.entity_name}`,
      });
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleSelected = async (asset: MediaAsset) => {
    try {
      const { error } = await supabase
        .from("media_assets")
        .update({ final_selected: !asset.final_selected })
        .eq("id", asset.id);

      if (error) throw error;

      setAssets((prev) =>
        prev.map((a) =>
          a.id === asset.id ? { ...a, final_selected: !a.final_selected } : a
        )
      );
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.entity_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      entityTypeFilter === "all" || asset.entity_type === entityTypeFilter;
    const matchesProvider =
      providerFilter === "all" || asset.provider === providerFilter;
    return matchesSearch && matchesType && matchesProvider;
  });

  const entityTypes = [...new Set(assets.map((a) => a.entity_type))];
  const providers = [...new Set(assets.map((a) => a.provider).filter(Boolean))];

  const aiGeneratedCount = assets.filter(
    (a) => a.provider === "ai_generated" || a.provider === "lovable_ai"
  ).length;
  const externalCount = assets.filter(
    (a) => a.provider && !["ai_generated", "lovable_ai"].includes(a.provider)
  ).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/admin");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="AI Image Gallery"
        description="Preview and manage AI-generated images"
        path="/admin/images"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="font-mono text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-1">
                    // Media Assets
                  </div>
                  <h1 className="font-mono text-2xl md:text-3xl uppercase tracking-tight">
                    AI Image Gallery
                  </h1>
                </div>
              </div>
              <Button
                variant="brutalist"
                size="sm"
                onClick={fetchAssets}
                disabled={loading}
                className="font-mono text-xs uppercase"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="border border-border bg-card p-4 text-center">
                <div className="font-mono text-2xl text-logo-green">
                  {assets.length}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  Total Assets
                </div>
              </div>
              <div className="border border-border bg-card p-4 text-center">
                <div className="font-mono text-2xl text-crimson">
                  {aiGeneratedCount}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  AI Generated
                </div>
              </div>
              <div className="border border-border bg-card p-4 text-center">
                <div className="font-mono text-2xl text-foreground">
                  {externalCount}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  External Sources
                </div>
              </div>
              <div className="border border-border bg-card p-4 text-center">
                <div className="font-mono text-2xl text-logo-green">
                  {assets.filter((a) => a.final_selected).length}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase">
                  Selected
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-mono text-sm"
                />
              </div>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-[180px] font-mono text-xs">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-[180px] font-mono text-xs">
                  <Palette className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider!}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-muted" : ""}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-muted" : ""}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Gallery */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-20 border border-border bg-card">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-mono text-sm text-muted-foreground">
                  No images found
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="group relative border border-border bg-card overflow-hidden"
                  >
                    <div
                      className="aspect-square bg-muted cursor-pointer"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setPreviewOpen(true);
                      }}
                    >
                      {asset.storage_url || asset.source_url ? (
                        <img
                          src={asset.storage_url || asset.source_url || ""}
                          alt={asset.alt_text || asset.entity_name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Overlay badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {asset.final_selected && (
                        <Badge className="bg-logo-green/90 text-background text-[8px]">
                          <Check className="w-2 h-2 mr-1" />
                          Selected
                        </Badge>
                      )}
                      {(asset.provider === "ai_generated" ||
                        asset.provider === "lovable_ai") && (
                        <Badge className="bg-crimson/90 text-white text-[8px]">
                          <Sparkles className="w-2 h-2 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>

                    {/* Actions on hover */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerate(asset)}
                        disabled={regenerating === asset.id}
                      >
                        {regenerating === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleSelected(asset)}
                      >
                        {asset.final_selected ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(asset)}
                        disabled={deleting === asset.id}
                        className="text-crimson hover:text-crimson"
                      >
                        {deleting === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="font-mono text-[10px] truncate">
                        {asset.entity_name}
                      </p>
                      <p className="font-mono text-[8px] text-muted-foreground uppercase">
                        {asset.entity_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-4 p-4 border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-16 h-16 shrink-0 bg-muted">
                      {asset.storage_url || asset.source_url ? (
                        <img
                          src={asset.storage_url || asset.source_url || ""}
                          alt={asset.entity_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">
                        {asset.entity_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[8px]">
                          {asset.entity_type}
                        </Badge>
                        {asset.provider && (
                          <Badge variant="outline" className="text-[8px]">
                            {asset.provider}
                          </Badge>
                        )}
                        {asset.final_selected && (
                          <Badge className="bg-logo-green/20 text-logo-green text-[8px]">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate(asset)}
                        disabled={regenerating === asset.id}
                      >
                        {regenerating === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(asset)}
                        disabled={deleting === asset.id}
                        className="text-crimson hover:text-crimson"
                      >
                        {deleting === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-tight">
              {selectedAsset?.entity_name}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {selectedAsset?.entity_type} • {selectedAsset?.provider || "Unknown"}
            </DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                {selectedAsset.storage_url || selectedAsset.source_url ? (
                  <img
                    src={selectedAsset.storage_url || selectedAsset.source_url || ""}
                    alt={selectedAsset.entity_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Quality Score:</span>{" "}
                  {selectedAsset.quality_score ?? "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">Match Score:</span>{" "}
                  {selectedAsset.match_score ?? "N/A"}
                </div>
                <div>
                  <span className="text-muted-foreground">License:</span>{" "}
                  {selectedAsset.license_status || "Unknown"}
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {new Date(selectedAsset.created_at).toLocaleDateString()}
                </div>
              </div>

              {selectedAsset.reasoning_summary && (
                <div className="p-3 bg-muted/50 border border-border">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1">
                    AI Reasoning
                  </p>
                  <p className="font-mono text-xs">
                    {selectedAsset.reasoning_summary}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleToggleSelected(selectedAsset!)}
            >
              {selectedAsset?.final_selected ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Deselect
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Select
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRegenerate(selectedAsset!)}
              disabled={regenerating === selectedAsset?.id}
            >
              {regenerating === selectedAsset?.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Regenerate
            </Button>
            {(selectedAsset?.storage_url || selectedAsset?.source_url) && (
              <Button
                variant="brutalist"
                onClick={() =>
                  window.open(
                    selectedAsset.storage_url || selectedAsset.source_url!,
                    "_blank"
                  )
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIImageGallery;
