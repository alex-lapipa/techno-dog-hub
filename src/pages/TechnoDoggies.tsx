import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { dogVariants } from "@/components/DogPack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Share2, Download, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import HexagonLogo from "@/components/HexagonLogo";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";

const TechnoDoggies = () => {
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedDogs, setSelectedDogs] = useState<number[]>([]);

  const currentDog = dogVariants[currentDogIndex];
  const DogComponent = currentDog.Component;

  const nextDog = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDogIndex(prev => (prev + 1) % dogVariants.length);
      setIsAnimating(false);
    }, 150);
  };

  const randomDog = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDogIndex(Math.floor(Math.random() * dogVariants.length));
      setIsAnimating(false);
    }, 150);
  };

  const toggleDogSelection = (index: number) => {
    setSelectedDogs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Check out these Techno Doggies! 🐕");
    const body = encodeURIComponent(
      `I found these awesome Techno Doggies at techno.dog!\n\n` +
      `My favorite is the ${currentDog.name} Dog - ${currentDog.personality}\n\n` +
      `Create your own pack: https://techno.dog/doggies\n\n` +
      `🐕 Bork bork!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success("Opening email client...");
  };

  const downloadDog = async () => {
    const svg = document.querySelector('#current-dog-display svg');
    if (!svg) {
      toast.error("Couldn't find the doggy!");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 512;
    canvas.height = 512;
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement('a');
      link.download = `techno-${currentDog.name.toLowerCase()}-dog.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(`Downloaded ${currentDog.name} Dog!`);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareUrl = "https://techno.dog/doggies";
  const shareText = `Check out the ${currentDog.name} Techno Dog! 🐕 Create your own pack at techno.dog`;

  return (
    <>
      <Helmet>
        <title>Techno Doggies - Create & Share Your Pack | techno.dog</title>
        <meta name="description" content="Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community. Bork bork!" />
        <meta property="og:title" content="Techno Doggies - Create & Share Your Pack" />
        <meta property="og:description" content="Create and share your own pack of Techno Doggies! Fun, shareable dog characters for the techno community." />
        <meta property="og:url" content="https://techno.dog/doggies" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <HexagonLogo className="w-8 h-8 drop-shadow-[0_0_6px_hsl(100_100%_60%/0.5)]" />
              <span className="font-mono text-sm tracking-[0.2em] text-foreground group-hover:animate-glitch">
                techno.dog
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="font-mono text-xs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-mono">
              Techno Doggies
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">
              Create and share your own pack of techno doggies. 
              Spread the borks across the internet! 🐕
            </p>
          </div>

          {/* Main Dog Display */}
          <Card className="max-w-md mx-auto mb-8 border-logo-green/30 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div 
                id="current-dog-display"
                className={`flex flex-col items-center transition-all duration-150 ${
                  isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
                }`}
              >
                <DogComponent className="w-32 h-32" animated />
                <h2 className="mt-4 text-2xl font-bold text-foreground font-mono">
                  {currentDog.name} Dog
                </h2>
                <p className="text-sm text-muted-foreground text-center mt-2 font-mono">
                  {currentDog.personality}
                </p>
                <span className="mt-3 px-3 py-1 text-xs uppercase tracking-wider rounded-full border border-logo-green/30 text-logo-green font-mono">
                  {currentDog.status}
                </span>
              </div>

              {/* Controls */}
              <div className="flex gap-2 justify-center mt-6">
                <Button variant="outline" size="sm" onClick={nextDog} className="font-mono text-xs">
                  Next
                </Button>
                <Button variant="outline" size="sm" onClick={randomDog} className="font-mono text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Random
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Share Section */}
          <Card className="max-w-md mx-auto mb-8 border-border/50">
            <CardContent className="p-6">
              <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4 text-center">
                Share This Doggy
              </h3>
              
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <SocialShareButtons url={shareUrl} text={shareText} size="default" />
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={shareViaEmail} className="font-mono text-xs">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={downloadDog} className="font-mono text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Full Pack Grid */}
          <div className="max-w-4xl mx-auto">
            <h3 className="font-mono text-lg text-center mb-6 text-foreground">
              Meet the Full Pack
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {dogVariants.map((dog, index) => {
                const Dog = dog.Component;
                const isSelected = selectedDogs.includes(index);
                return (
                  <button
                    key={dog.name}
                    onClick={() => {
                      setCurrentDogIndex(index);
                      toggleDogSelection(index);
                    }}
                    className={`p-4 rounded-lg border transition-all hover:scale-105 ${
                      isSelected 
                        ? 'border-logo-green bg-logo-green/10' 
                        : 'border-border/50 hover:border-logo-green/50'
                    }`}
                  >
                    <Dog className="w-12 h-12 mx-auto" />
                    <p className="text-xs font-mono text-muted-foreground mt-2 text-center">
                      {dog.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="max-w-md mx-auto mt-12 text-center">
            <p className="font-mono text-xs text-muted-foreground">
              🐕 All doggies are free to share and spread joy across the techno community
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              Made with 🖤 by the <Link to="/" className="text-logo-green hover:underline">techno.dog</Link> pack
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default TechnoDoggies;
