import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DogChat from "@/components/admin/DogChat";
import { 
  BookOpen, 
  Users, 
  Heart, 
  Lightbulb, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Database, 
  Music, 
  Camera,
  MessageSquare,
  Trophy,
  Star,
  Sparkles,
  Zap,
  Building,
  HandHeart,
  GitBranch,
  Target,
  Rocket,
  Dog
} from "lucide-react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";

// ===== ONBOARDING SECTION =====
const OnboardingSection = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const steps = [
    {
      id: 1,
      title: "Welcome to Techno.dog",
      description: "This is a community-powered encyclopedia for techno music culture. Unlike traditional websites, this one is built and maintained by fans like you.",
      icon: Music,
      tip: "Think of it as Wikipedia meets Discogs, but specifically for techno music and culture."
    },
    {
      id: 2,
      title: "Explore the Database",
      description: "Browse thousands of artists, venues, festivals, labels, and equipment. Every piece of information comes from the global techno community.",
      icon: Database,
      tip: "Use the search bar at the top to find any artist, venue, or piece of gear."
    },
    {
      id: 3,
      title: "Join the Community",
      description: "Sign up to contribute information, earn points, and help build the largest techno knowledge base in the world.",
      icon: Users,
      tip: "Every contribution you make helps preserve techno history for future generations."
    },
    {
      id: 4,
      title: "Contribute Knowledge",
      description: "Add new artists, correct information, upload photos, or share stories. The community reviews and verifies all contributions.",
      icon: Heart,
      tip: "Start small - even fixing a typo or adding a missing track is valuable!"
    },
    {
      id: 5,
      title: "Earn Recognition",
      description: "As you contribute, you earn points, badges, and climb the leaderboard. Top contributors get special recognition and perks.",
      icon: Trophy,
      tip: "Quality matters more than quantity. Well-researched contributions earn more points."
    }
  ];

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const progressPercent = (completedSteps.length / steps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Tracker */}
      <Card className="border-logo-green/30 bg-logo-green/5">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2">
            <Rocket className="w-5 h-5 text-logo-green" />
            Your Progress
          </CardTitle>
          <CardDescription>
            Complete these steps to understand how everything works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-mono">
              <span>{completedSteps.length} of {steps.length} completed</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Step Cards */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.id);
          
          return (
            <Card 
              key={step.id}
              className={`transition-all duration-300 cursor-pointer hover:border-logo-green/50 ${
                isCompleted ? 'border-logo-green/50 bg-logo-green/5' : 'border-border'
              }`}
              onClick={() => toggleStep(step.id)}
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? 'border-logo-green bg-logo-green/20' 
                      : 'border-muted-foreground/30 bg-muted/20'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-logo-green" />
                    ) : (
                      <span className="font-mono text-lg font-bold">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-logo-green" />
                      <h3 className="font-mono text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground italic">
                        {step.tip}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ===== USER MANUAL SECTION =====
const UserManualSection = () => {
  const sections = [
    {
      title: "Finding Artists",
      icon: Music,
      steps: [
        "Go to the Artists page from the main menu",
        "Use the search box to find any artist by name",
        "Click on an artist to see their full profile",
        "Browse related artists, labels, and releases"
      ]
    },
    {
      title: "Exploring Venues",
      icon: Building,
      steps: [
        "Visit the Venues section to see legendary clubs",
        "Filter by city, country, or venue type",
        "Each venue shows its history, resident DJs, and photos",
        "Community members can add missing venues"
      ]
    },
    {
      title: "Reading the News",
      icon: BookOpen,
      steps: [
        "The News section features curated techno journalism",
        "Articles are written by AI with human curation",
        "Filter by category: interviews, reviews, features",
        "Subscribe to get weekly digest emails"
      ]
    },
    {
      title: "Contributing Information",
      icon: Heart,
      steps: [
        "Create a free community account first",
        "Click 'Submit' or use the forms on any page",
        "Fill in what you know - partial info is welcome",
        "Our team and AI verify submissions before publishing"
      ]
    },
    {
      title: "Earning Points & Badges",
      icon: Trophy,
      steps: [
        "Every accepted contribution earns you points",
        "Points unlock badges and leaderboard rankings",
        "Special events offer bonus point multipliers",
        "Top contributors get featured on the homepage"
      ]
    },
    {
      title: "Using the Gear Database",
      icon: Zap,
      steps: [
        "Browse synthesizers, drum machines, and DJ equipment",
        "Each item shows specs, famous users, and sound demos",
        "Filter by brand, price range, or era",
        "Suggest additions through the community forms"
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <Card key={index} className="hover:border-logo-green/30 transition-colors">
            <CardHeader>
              <CardTitle className="font-mono text-base flex items-center gap-2">
                <Icon className="w-5 h-5 text-logo-green" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {section.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center font-mono text-xs">
                      {stepIndex + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ===== TECHNICAL OVERVIEW SECTION =====
const TechnicalOverviewSection = () => {
  // Platform structure data for pie chart
  const platformData = [
    { id: "Artists", label: "Artists", value: 35, color: "hsl(142, 76%, 36%)" },
    { id: "Venues", label: "Venues", value: 20, color: "hsl(0, 84%, 60%)" },
    { id: "Gear", label: "Gear", value: 15, color: "hsl(45, 93%, 47%)" },
    { id: "Labels", label: "Labels", value: 15, color: "hsl(199, 89%, 48%)" },
    { id: "News", label: "News", value: 10, color: "hsl(280, 65%, 60%)" },
    { id: "Community", label: "Community", value: 5, color: "hsl(160, 60%, 45%)" }
  ];

  // How data flows
  const dataFlowData = [
    { stage: "Community\nSubmission", value: 100 },
    { stage: "AI\nVerification", value: 85 },
    { stage: "Quality\nCheck", value: 70 },
    { stage: "Published", value: 65 }
  ];

  const components = [
    {
      title: "The Database",
      icon: Database,
      description: "Think of this as a giant digital library. It stores everything: artist names, venue addresses, equipment specs, and more. When you search for something, you're searching this library.",
      simple: "Like a super-organized filing cabinet for techno knowledge"
    },
    {
      title: "AI Assistants",
      icon: Sparkles,
      description: "We use artificial intelligence to help verify information, write news articles, and keep data accurate. AI can't replace human knowledge, but it helps us work faster and catch errors.",
      simple: "Robot helpers that double-check facts and write drafts"
    },
    {
      title: "Community Verification",
      icon: Users,
      description: "When someone submits new information, it goes through a review process. Other community members and our team check if it's accurate before it goes live.",
      simple: "Crowd-sourced fact-checking by fellow techno fans"
    },
    {
      title: "Photo Pipeline",
      icon: Camera,
      description: "We automatically find, verify, and credit photos for artists and venues. The system checks licenses and makes sure we have permission to use images.",
      simple: "Automatic photo finding with proper credits"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Visual Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Structure Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">What's in the Database?</CardTitle>
            <CardDescription>Distribution of content types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsivePie
                data={platformData}
                margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: 'data.color' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="hsl(var(--foreground))"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="white"
                theme={{
                  text: { fill: 'hsl(var(--muted-foreground))' },
                  tooltip: {
                    container: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))'
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Flow Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">How Information Gets Published</CardTitle>
            <CardDescription>From submission to live on the site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveBar
                data={dataFlowData}
                keys={['value']}
                indexBy="stage"
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                padding={0.3}
                colors={['hsl(142, 76%, 36%)']}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: v => `${v}%`
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="white"
                theme={{
                  text: { fill: 'hsl(var(--muted-foreground))' },
                  axis: {
                    ticks: { text: { fill: 'hsl(var(--muted-foreground))' } }
                  },
                  grid: { line: { stroke: 'hsl(var(--border))' } },
                  tooltip: {
                    container: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))'
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {components.map((component, index) => {
          const Icon = component.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="font-mono text-base flex items-center gap-2">
                  <Icon className="w-5 h-5 text-logo-green" />
                  {component.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {component.description}
                </p>
                <div className="p-3 bg-logo-green/10 border border-logo-green/20 rounded-lg">
                  <p className="text-sm font-medium text-logo-green">
                    💡 In simple terms: {component.simple}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ===== OPEN SOURCE PHILOSOPHY SECTION =====
const PhilosophySection = () => {
  const comparisonData = [
    { aspect: "Content\nOwnership", traditional: 30, community: 100 },
    { aspect: "Decision\nMaking", traditional: 10, community: 80 },
    { aspect: "Profit\nSharing", traditional: 5, community: 70 },
    { aspect: "Transparency", traditional: 20, community: 95 }
  ];

  const principles = [
    {
      title: "Knowledge Belongs to Everyone",
      icon: Globe,
      description: "Techno history and culture shouldn't be locked behind paywalls or owned by corporations. Every piece of information on this site is freely accessible to anyone, anywhere in the world.",
      traditional: "Traditional sites lock content behind subscriptions or ads",
      ours: "All content is free and always will be"
    },
    {
      title: "Community-Led, Not Corporate-Driven",
      icon: Users,
      description: "This project is run by techno fans, for techno fans. There are no shareholders demanding profits, no advertisers influencing content, and no data being sold to third parties.",
      traditional: "Corporations prioritize profit over community",
      ours: "Every decision considers what's best for the scene"
    },
    {
      title: "Contributors Are Partners, Not Users",
      icon: HandHeart,
      description: "When you contribute to this project, you're not just providing free labor for a company. You're building something that benefits everyone, including yourself.",
      traditional: "Users create value, companies capture it",
      ours: "Contributors earn recognition and help shape the platform"
    },
    {
      title: "Transparent & Open",
      icon: GitBranch,
      description: "How we work, what decisions we make, and where resources go - it's all open. We believe in showing our work and inviting feedback from the community.",
      traditional: "Decisions happen behind closed doors",
      ours: "Everything is documented and open for discussion"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Statement */}
      <Card className="border-logo-green/30 bg-gradient-to-br from-logo-green/10 to-transparent">
        <CardContent className="p-8 text-center space-y-4">
          <Heart className="w-12 h-12 text-logo-green mx-auto" />
          <h2 className="font-mono text-2xl font-bold">
            This Is Your Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Techno.dog isn't a business trying to extract value from the community. 
            It's a community project that exists to preserve and celebrate techno culture. 
            Every contributor is a co-owner of this shared resource.
          </p>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-base">Traditional Business vs. Community Model</CardTitle>
          <CardDescription>How we differ from typical platforms (higher = better for community)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveBar
              data={comparisonData}
              keys={['traditional', 'community']}
              indexBy="aspect"
              groupMode="grouped"
              margin={{ top: 20, right: 130, bottom: 60, left: 60 }}
              padding={0.3}
              colors={['hsl(0, 84%, 60%)', 'hsl(142, 76%, 36%)']}
              borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: v => `${v}%`
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="white"
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  translateX: 120,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemTextColor: 'hsl(var(--muted-foreground))',
                  symbolSize: 12,
                  symbolShape: 'circle'
                }
              ]}
              theme={{
                text: { fill: 'hsl(var(--muted-foreground))' },
                axis: {
                  ticks: { text: { fill: 'hsl(var(--muted-foreground))' } }
                },
                grid: { line: { stroke: 'hsl(var(--border))' } },
                tooltip: {
                  container: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))'
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Principles */}
      <div className="space-y-4">
        {principles.map((principle, index) => {
          const Icon = principle.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-logo-green/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-logo-green" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <h3 className="font-mono text-lg font-semibold">{principle.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-crimson/10 border border-crimson/20 rounded-lg">
                        <p className="text-xs font-mono text-crimson uppercase mb-1">Traditional Way</p>
                        <p className="text-sm text-muted-foreground">{principle.traditional}</p>
                      </div>
                      <div className="p-3 bg-logo-green/10 border border-logo-green/20 rounded-lg">
                        <p className="text-xs font-mono text-logo-green uppercase mb-1">Our Way</p>
                        <p className="text-sm text-muted-foreground">{principle.ours}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center space-y-4">
          <Target className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-mono text-xl font-semibold">Ready to Join?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Whether you're a casual listener or a veteran DJ, your knowledge matters. 
            Start contributing today and become part of something bigger than any one person or company.
          </p>
          <div className="flex gap-4 justify-center pt-2">
            <Button variant="brutalist" className="font-mono">
              <Users className="w-4 h-4 mr-2" />
              Join Community
            </Button>
            <Button variant="outline" className="font-mono">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const TrainingCenter = () => {
  return (
    <AdminPageLayout
      title="Training Center"
      description="Learn how to use this platform and understand its community-driven philosophy"
      icon={BookOpen}
      iconColor="text-logo-green"
    >
      <Tabs defaultValue="dog" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="dog" className="font-mono text-xs">
            <Dog className="w-3.5 h-3.5 mr-1.5" />
            Ask Dog
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="font-mono text-xs">
            <Rocket className="w-3.5 h-3.5 mr-1.5" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="manual" className="font-mono text-xs">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            User Manual
          </TabsTrigger>
          <TabsTrigger value="technical" className="font-mono text-xs">
            <Database className="w-3.5 h-3.5 mr-1.5" />
            How It Works
          </TabsTrigger>
          <TabsTrigger value="philosophy" className="font-mono text-xs">
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            Philosophy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dog">
          <div className="grid lg:grid-cols-2 gap-6">
            <DogChat />
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-mono text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-logo-green" />
                    Meet Dog 🐕
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dog is your friendly AI companion who knows everything about techno.dog! 
                    Unlike intimidating documentation, Dog explains things in a warm, approachable way.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs font-mono text-logo-green mb-1">KNOWS ABOUT</p>
                      <p className="text-sm">All artists, venues, festivals & gear</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs font-mono text-logo-green mb-1">CAN EXPLAIN</p>
                      <p className="text-sm">How to use every feature</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs font-mono text-logo-green mb-1">UNDERSTANDS</p>
                      <p className="text-sm">Community philosophy & values</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs font-mono text-logo-green mb-1">ORCHESTRATES</p>
                      <p className="text-sm">All automated agents</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-logo-green/10 border border-logo-green/30">
                    <p className="text-sm italic">
                      "Woof! I'm here because we believe learning should feel like chatting with a friend, 
                      not reading a boring manual. Ask me anything - I don't bite! 🐾"
                    </p>
                    <p className="text-xs text-right mt-2 text-logo-green font-mono">— Dog</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-mono text-sm">Why a Dog?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                      <span><strong>Empathy:</strong> Dogs sense how you feel and respond accordingly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                      <span><strong>Approachable:</strong> Everyone feels comfortable talking to a dog</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                      <span><strong>Enthusiastic:</strong> Dogs get excited about helping - so does Dog!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                      <span><strong>Loyal:</strong> Like a real dog, Dog is always here when you need help</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <OnboardingSection />
        </TabsContent>

        <TabsContent value="manual">
          <UserManualSection />
        </TabsContent>

        <TabsContent value="technical">
          <TechnicalOverviewSection />
        </TabsContent>

        <TabsContent value="philosophy">
          <PhilosophySection />
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default TrainingCenter;
