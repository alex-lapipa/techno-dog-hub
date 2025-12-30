import { useState, useEffect } from "react";
import PageSEO from "@/components/PageSEO";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Shuffle, Heart, AlertTriangle, CheckCircle2, Zap, Shield, Eye, EyeOff, Star, TrendingUp, Share2, Download, ExternalLink, Activity } from "lucide-react";
import DogSilhouette from "@/components/DogSilhouette";
import { dogVariants, GrumpyDog } from "@/components/DogPack";
import DoggyExport from "@/components/DoggyExport";
import DoggyEmbedCode from "@/components/DoggyEmbedCode";
import DoggyPlaceholderManager from "@/components/admin/DoggyPlaceholderManager";
import { useDoggyVariants, useDoggyAnalytics, useUpdateDoggyVariant } from "@/hooks/useDoggyData";
import useDoggyAgent from "@/hooks/useDoggyAgent";
import { Link } from "react-router-dom";

const packQuotes = [
  "A well-organized pack is a happy pack!",
  "No doggie left behind in the data warehouse.",
  "Woof-driven development at its finest.",
  "The pack that debugs together, snugs together.",
  "Keeping our doggies aligned since 1992.",
  "Every good boi deserves a clean codebase.",
  "Tail wagging at 60fps.",
  "Sniffing out regressions before they bite.",
  "Pack cohesion score: VERY GOOD BOI",
  "Our doggies are 100% free-range, organic SVGs.",
];

const DoggiesAdmin = () => {
  const { toast } = useToast();
  const { data: dbVariants, isLoading: variantsLoading } = useDoggyVariants();
  const { data: analyticsData, isLoading: analyticsLoading } = useDoggyAnalytics();
  const updateVariant = useUpdateDoggyVariant();
  const { runAnalysis, isRunning: agentRunning, lastAnalysis } = useDoggyAgent();
  
  const [packHealth, setPackHealth] = useState(94);
  const [cohesionScore, setCohesionScore] = useState(87);
  const [waggingIntensity, setWaggingIntensity] = useState([70]);
  const [barkMode, setBarkMode] = useState(false);
  const [selectedDog, setSelectedDog] = useState<number | null>(null);
  const [packQuote, setPackQuote] = useState(packQuotes[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDogs, setGeneratedDogs] = useState<typeof dogVariants>([]);
  const [packAlerts, setPackAlerts] = useState([
    { id: 1, type: 'warning', message: 'Sleepy Dog has been napping for 3 hours', resolved: false },
    { id: 2, type: 'info', message: 'Party Dog requested extra treats', resolved: true },
    { id: 3, type: 'warning', message: 'Grumpy Dog disapproves of latest commit', resolved: false },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPackQuote(packQuotes[Math.floor(Math.random() * packQuotes.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const runPackCheck = () => {
    toast({
      title: "Pack Check Initiated",
      description: "Sniffing all doggies for alignment issues...",
    });
    
    setTimeout(() => {
      setPackHealth(prev => Math.min(100, prev + Math.floor(Math.random() * 5)));
      setCohesionScore(prev => Math.min(100, prev + Math.floor(Math.random() * 8)));
      toast({
        title: "Pack Check Complete",
        description: "All doggies accounted for. Good boys confirmed.",
      });
    }, 2000);
  };

  const shufflePack = () => {
    toast({
      title: "Shuffling Pack Formation",
      description: "Reorganizing doggies for optimal cuteness...",
    });
  };

  const generateDoggie = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const randomVariant = dogVariants[Math.floor(Math.random() * dogVariants.length)];
      const newDog = {
        ...randomVariant,
        name: `${randomVariant.name} Jr. #${Math.floor(Math.random() * 1000)}`,
        personality: `${randomVariant.personality} (clone)`,
        status: 'freshly generated',
      };
      
      setGeneratedDogs(prev => [...prev, newDog]);
      setIsGenerating(false);
      
      toast({
        title: "🐾 New Doggie Generated!",
        description: `${newDog.name} has joined the pack!`,
      });
    }, 1500);
  };

  const resolveAlert = (id: number) => {
    setPackAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
    toast({
      title: "Alert Resolved",
      description: "Gave the good boi some treats. Problem solved.",
    });
  };

  const toggleVisibility = (variantId: string, currentActive: boolean) => {
    updateVariant.mutate({ id: variantId, updates: { is_active: !currentActive } });
  };

  const toggleFeatured = (variantId: string, currentFeatured: boolean) => {
    updateVariant.mutate({ id: variantId, updates: { is_featured: !currentFeatured } });
  };

  const stats = analyticsData?.stats;

  return (
    <AdminPageLayout
      title="Doggies HQ"
      description="Manage the techno.dog pack - keep all doggies aligned and happy"
      icon={DogSilhouette}
      iconColor="text-logo-green"
      isLoading={variantsLoading || analyticsLoading}
      onRunAgent={runAnalysis}
      isRunning={agentRunning}
      runButtonText="Analyze Pack"
      actions={
        <>
          <Link to="/doggies">
            <Button variant="outline" size="sm" className="font-mono text-xs uppercase">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={shufflePack} className="font-mono text-xs uppercase">
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle Pack
          </Button>
        </>
      }
    >
      <PageSEO 
        title="Doggies Pack Manager | Admin"
        description="Manage the techno.dog pack - keep all doggies aligned and happy"
        path="/admin/doggies"
      />
      
      <div className="space-y-6">
        <p className="font-mono text-sm text-muted-foreground italic text-center">"{packQuote}"</p>

        {/* Analytics Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase">Total Shares</p>
                    <p className="font-mono text-2xl font-bold text-logo-green">{stats?.totalShares || 0}</p>
                  </div>
                  <Share2 className="w-8 h-8 text-logo-green opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase">Downloads</p>
                    <p className="font-mono text-2xl font-bold text-logo-green">{stats?.totalDownloads || 0}</p>
                  </div>
                  <Download className="w-8 h-8 text-logo-green opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase">Views</p>
                    <p className="font-mono text-2xl font-bold">{stats?.totalViews || 0}</p>
                  </div>
                  <Eye className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase">Pack Health</p>
                    <p className="font-mono text-2xl font-bold text-logo-green">{packHealth}%</p>
                  </div>
                  <Heart className="w-8 h-8 text-logo-green opacity-50" />
                </div>
                <Progress value={packHealth} className="mt-2 h-1" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase">Bark Mode</p>
                    <p className="font-mono text-sm mt-1">{barkMode ? 'ACTIVATED' : 'Standby'}</p>
                  </div>
                  <Switch checked={barkMode} onCheckedChange={setBarkMode} />
                </div>
                {barkMode && <p className="font-mono text-xs text-logo-green mt-2 animate-pulse">WOOF WOOF WOOF</p>}
              </CardContent>
            </Card>
          </div>

          {/* Sharing Analytics by Dog */}
          {stats && Object.keys(stats.byVariant).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-logo-green" />
                  Sharing Analytics by Dog
                </CardTitle>
                <CardDescription>See which doggies are the most popular</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(stats.byVariant).map(([name, data]) => (
                    <div key={name} className="p-3 rounded-lg border bg-muted/30">
                      <p className="font-mono text-xs font-bold">{name}</p>
                      <div className="flex gap-2 mt-1 text-[10px] font-mono text-muted-foreground">
                        <span>{data.shares} shares</span>
                        <span>•</span>
                        <span>{data.downloads} dl</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wagging Intensity Control */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-logo-green" />
                Tail Wagging Intensity
              </CardTitle>
              <CardDescription>Adjust the universal happiness coefficient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs">Lazy</span>
                <Slider 
                  value={waggingIntensity} 
                  onValueChange={setWaggingIntensity}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="font-mono text-xs">TURBO</span>
                <Badge variant="outline" className="font-mono">{waggingIntensity[0]}%</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pack Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Pack Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {packAlerts.map(alert => (
                <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${alert.resolved ? 'bg-muted/30 opacity-50' : 'bg-background'}`}>
                  <div className="flex items-center gap-3">
                    {alert.resolved ? (
                      <CheckCircle2 className="w-4 h-4 text-logo-green" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-mono text-sm">{alert.message}</span>
                  </div>
                  {!alert.resolved && (
                    <Button size="sm" variant="ghost" onClick={() => resolveAlert(alert.id)}>
                      Give Treats
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* The Pack - with DB controls */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-base">The Pack (Database Managed)</CardTitle>
              <CardDescription>Toggle visibility and featured status for the public page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {dbVariants?.map((dbDog, index) => {
                  const dogData = dogVariants.find(d => d.name.toLowerCase() === dbDog.name.toLowerCase()) || dogVariants[0];
                  const DogComponent = dogData.Component;
                  return (
                    <div 
                      key={dbDog.id}
                      className={`p-4 rounded-lg border transition-all ${!dbDog.is_active ? 'opacity-40' : ''} ${dbDog.is_featured ? 'border-logo-green bg-logo-green/10' : ''}`}
                    >
                      <DogComponent className="w-16 h-16 mx-auto mb-2" animated={barkMode || waggingIntensity[0] > 80} />
                      <p className="font-mono text-xs text-center font-bold">{dbDog.name}</p>
                      <p className="font-mono text-[10px] text-center text-muted-foreground truncate">{dbDog.personality}</p>
                      <Badge variant="outline" className="w-full justify-center mt-1 text-[10px]">{dbDog.status}</Badge>
                      
                      {/* Controls */}
                      <div className="flex gap-1 mt-3 justify-center">
                        <Button
                          size="sm"
                          variant={dbDog.is_active ? "ghost" : "outline"}
                          className="h-7 px-2"
                          onClick={() => toggleVisibility(dbDog.id, dbDog.is_active)}
                          title={dbDog.is_active ? "Hide from public" : "Show on public"}
                        >
                          {dbDog.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant={dbDog.is_featured ? "default" : "ghost"}
                          className={`h-7 px-2 ${dbDog.is_featured ? 'bg-logo-green text-background hover:bg-logo-green/80' : ''}`}
                          onClick={() => toggleFeatured(dbDog.id, dbDog.is_featured)}
                          title={dbDog.is_featured ? "Remove featured" : "Make featured"}
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Doggie Generator */}
          <Card className="border-logo-green/30">
            <CardHeader>
              <CardTitle className="font-mono text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-logo-green" />
                Doggie Generator™
              </CardTitle>
              <CardDescription>Create new pack members using advanced bark technology</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Button 
                  size="lg" 
                  variant="brutalist" 
                  onClick={generateDoggie}
                  disabled={isGenerating}
                  className="font-mono uppercase"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Good Boi...
                    </>
                  ) : (
                    <>
                      <DogSilhouette className="w-5 h-5 mr-2" />
                      Generate Doggie
                    </>
                  )}
                </Button>
                
                {generatedDogs.length > 0 && (
                  <div className="w-full mt-4">
                    <p className="font-mono text-xs text-muted-foreground mb-2 uppercase">Generated Pack Members ({generatedDogs.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {generatedDogs.map((dog, index) => {
                        const DogComponent = dog.Component;
                        return (
                          <div key={index} className="p-3 rounded-lg border bg-logo-green/5 border-logo-green/20">
                            <DogComponent className="w-12 h-12 mx-auto mb-1" animated />
                            <p className="font-mono text-[10px] text-center truncate">{dog.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Doggie Export & Sharing Station */}
          <DoggyExport selectedDog={selectedDog} generatedDogs={generatedDogs} />

          {/* Doggy Placeholder System */}
          <DoggyPlaceholderManager />

          {/* Embeddable Widget */}
          <DoggyEmbedCode />

          {/* Fun Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <p className="font-mono text-3xl font-bold text-logo-green">∞</p>
              <p className="font-mono text-xs text-muted-foreground">Treats Consumed</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-mono text-3xl font-bold">847</p>
              <p className="font-mono text-xs text-muted-foreground">Tail Wags Today</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-mono text-3xl font-bold">0</p>
              <p className="font-mono text-xs text-muted-foreground">Bad Boys (None!)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-mono text-3xl font-bold text-logo-green">100%</p>
              <p className="font-mono text-xs text-muted-foreground">Good Boy Rate</p>
            </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default DoggiesAdmin;
