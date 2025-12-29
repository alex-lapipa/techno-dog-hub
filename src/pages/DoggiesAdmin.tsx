import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Shuffle, Heart, AlertTriangle, CheckCircle2, Zap, Shield } from "lucide-react";
import DogSilhouette from "@/components/DogSilhouette";
import { dogVariants, GrumpyDog } from "@/components/DogPack";
import DoggyExport from "@/components/DoggyExport";

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
  const { isAdmin, loading } = useAdminAuth();
  const { toast } = useToast();
  
  const [packHealth, setPackHealth] = useState(94);
  const [cohesionScore, setCohesionScore] = useState(87);
  const [waggingIntensity, setWaggingIntensity] = useState([70]);
  const [borkMode, setBorkMode] = useState(false);
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
      title: "🐕 Pack Check Initiated",
      description: "Sniffing all doggies for alignment issues...",
    });
    
    setTimeout(() => {
      setPackHealth(prev => Math.min(100, prev + Math.floor(Math.random() * 5)));
      setCohesionScore(prev => Math.min(100, prev + Math.floor(Math.random() * 8)));
      toast({
        title: "✅ Pack Check Complete",
        description: "All doggies accounted for. Good boys confirmed.",
      });
    }, 2000);
  };

  const shufflePack = () => {
    toast({
      title: "🔀 Shuffling Pack Formation",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Herding doggies..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <GrumpyDog className="w-16 h-16 mx-auto mb-4" />
            <h2 className="font-mono text-xl mb-2">Access Denied</h2>
            <p className="text-muted-foreground">The pack doesn't recognize your scent.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO 
        title="Doggies Pack Manager | Admin"
        description="Manage the techno.dog pack - keep all doggies aligned and happy"
        path="/admin/doggies"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-logo-green uppercase tracking-[0.3em] mb-2">// pack management</div>
              <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight flex items-center gap-3">
                <DogSilhouette className="w-10 h-10" />
                Doggies HQ
              </h1>
              <p className="font-mono text-sm text-muted-foreground mt-2 italic">"{packQuote}"</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={shufflePack}>
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle Pack
              </Button>
              <Button variant="brutalist" onClick={runPackCheck}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Pack Check
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <p className="font-mono text-xs text-muted-foreground uppercase">Cohesion Score</p>
                    <p className="font-mono text-2xl font-bold text-logo-green">{cohesionScore}%</p>
                  </div>
                  <Shield className="w-8 h-8 text-logo-green opacity-50" />
                </div>
                <Progress value={cohesionScore} className="mt-2 h-1" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase">Active Doggies</p>
                    <p className="font-mono text-2xl font-bold">{dogVariants.length + generatedDogs.length}</p>
                  </div>
                  <DogSilhouette className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground uppercase">Bork Mode</p>
                    <p className="font-mono text-sm mt-1">{borkMode ? 'ACTIVATED' : 'Standby'}</p>
                  </div>
                  <Switch checked={borkMode} onCheckedChange={setBorkMode} />
                </div>
                {borkMode && <p className="font-mono text-xs text-logo-green mt-2 animate-pulse">WOOF WOOF WOOF</p>}
              </CardContent>
            </Card>
          </div>

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

          {/* The Pack */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-base">The Pack</CardTitle>
              <CardDescription>Click a doggie to inspect their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {dogVariants.map((dog, index) => {
                  const DogComponent = dog.Component;
                  return (
                    <div 
                      key={dog.name}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-logo-green hover:bg-logo-green/5 ${selectedDog === index ? 'border-logo-green bg-logo-green/10' : ''}`}
                      onClick={() => setSelectedDog(selectedDog === index ? null : index)}
                    >
                      <DogComponent className="w-16 h-16 mx-auto mb-2" animated={borkMode || waggingIntensity[0] > 80} />
                      <p className="font-mono text-xs text-center font-bold">{dog.name}</p>
                      <Badge variant="outline" className="w-full justify-center mt-1 text-[10px]">{dog.status}</Badge>
                    </div>
                  );
                })}
              </div>
              
              {selectedDog !== null && (
                <div className="mt-6 p-4 border border-logo-green/30 rounded-lg bg-logo-green/5">
                  <div className="flex items-start gap-4">
                    {(() => {
                      const DogComponent = dogVariants[selectedDog].Component;
                      return <DogComponent className="w-20 h-20" animated />;
                    })()}
                    <div>
                      <h3 className="font-mono text-lg font-bold">{dogVariants[selectedDog].name} Dog</h3>
                      <p className="font-mono text-sm text-muted-foreground">{dogVariants[selectedDog].personality}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{dogVariants[selectedDog].status}</Badge>
                        <Badge variant="secondary">Pack Member Since Day 1</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doggie Generator */}
          <Card className="border-logo-green/30">
            <CardHeader>
              <CardTitle className="font-mono text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-logo-green" />
                Doggie Generator™
              </CardTitle>
              <CardDescription>Create new pack members using advanced bork technology</CardDescription>
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
      </main>
      
      <Footer />
    </div>
  );
};

export default DoggiesAdmin;
