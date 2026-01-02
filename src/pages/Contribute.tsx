import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Send, 
  CheckCircle, 
  Loader2, 
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Edit3,
  Plus,
  ExternalLink,
  Camera,
  MessageSquare,
  Users,
  MapPin,
  Disc,
  Building2,
  PartyPopper,
  Tag,
  Wrench,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// File upload constants
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"];
const ALLOWED_DOC_TYPES = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 10;

const contributionSchema = z.object({
  email: z.string().email("Please enter a valid email").max(255),
  contributionType: z.enum(["artist", "venue", "festival", "label", "release", "gear", "collective", "event", "other"], {
    required_error: "Please select what you're contributing",
  }),
  actionType: z.enum(["add_new", "correction", "photo", "document", "story"], {
    required_error: "Please select the type of contribution",
  }),
  name: z.string().trim().max(200, "Name must be less than 200 characters").optional(),
  description: z.string().trim().max(5000, "Description must be less than 5000 characters").optional(),
  location: z.string().trim().max(200, "Location must be less than 200 characters").optional(),
  websiteUrl: z.string().url("Please enter a valid URL").max(500).optional().or(z.literal("")),
  additionalInfo: z.string().trim().max(2000, "Additional info must be less than 2000 characters").optional(),
  entityId: z.string().optional(), // For corrections/amendments
  entityName: z.string().optional(), // For corrections/amendments
  consent: z.boolean().refine((val) => val === true, {
    message: "You must confirm you have rights to share this content",
  }),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface UploadedFile {
  file: File;
  preview?: string;
  type: "image" | "video" | "audio" | "document";
}

const Contribute = () => {
  useScrollDepth({ pageName: "contribute" });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Pre-fill from URL params
  const prefilledType = searchParams.get("type") as ContributionFormData["contributionType"] | null;
  const prefilledAction = searchParams.get("action") as ContributionFormData["actionType"] | null;
  const prefilledEntityId = searchParams.get("entityId");
  const prefilledEntityName = searchParams.get("entityName");

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      email: user?.email || "",
      contributionType: prefilledType || undefined,
      actionType: prefilledAction || undefined,
      name: prefilledEntityName || "",
      description: "",
      location: "",
      websiteUrl: "",
      additionalInfo: "",
      entityId: prefilledEntityId || "",
      entityName: prefilledEntityName || "",
      consent: false,
    },
  });

  // Update email when user logs in
  useEffect(() => {
    if (user?.email && !form.getValues("email")) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  const contributionTypes = {
    artist: { label: "Artist / DJ", icon: Users, color: "text-primary" },
    venue: { label: "Venue / Club", icon: Building2, color: "text-logo-red" },
    festival: { label: "Festival", icon: PartyPopper, color: "text-yellow-500" },
    label: { label: "Record Label", icon: Disc, color: "text-purple-500" },
    release: { label: "Release / Track", icon: Music, color: "text-blue-500" },
    gear: { label: "Equipment / Gear", icon: Wrench, color: "text-orange-500" },
    collective: { label: "Collective / Crew", icon: Users, color: "text-pink-500" },
    event: { label: "Event / Party", icon: MapPin, color: "text-cyan-500" },
    other: { label: "Other", icon: HelpCircle, color: "text-muted-foreground" },
  };

  const actionTypes = {
    add_new: { label: "Add New Entry", description: "Submit something new to the archive", icon: Plus },
    correction: { label: "Propose Amendment", description: "Correct or update existing information", icon: Edit3 },
    photo: { label: "Upload Photos", description: "Add images to existing entries", icon: Camera },
    document: { label: "Share Document", description: "Flyers, articles, historical records", icon: FileText },
    story: { label: "Share Story", description: "Personal experience or memory", icon: MessageSquare },
  };

  const getAllowedTypes = () => {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_DOC_TYPES];
  };

  const getFileType = (file: File): "image" | "video" | "audio" | "document" => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) return "image";
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) return "video";
    if (ALLOWED_AUDIO_TYPES.includes(file.type)) return "audio";
    return "document";
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (files.length + newFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      if (!getAllowedTypes().includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File must be under 50MB`);
        return;
      }

      const fileType = getFileType(file);
      newFiles.push({
        file,
        preview: fileType === "image" ? URL.createObjectURL(file) : undefined,
        type: fileType,
      });
    });

    if (errors.length > 0) {
      toast({
        title: "Some files were rejected",
        description: errors.slice(0, 3).join(". "),
        variant: "destructive",
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, [files.length, toast]);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // AI Enhancement
  const enhanceDescription = async () => {
    const currentData = form.getValues();
    if (!currentData.description || currentData.description.length < 10) {
      toast({
        title: "Need more content",
        description: "Please write at least a brief description first",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("contribute-assist", {
        body: {
          action: "enhance_description",
          data: {
            entityType: currentData.contributionType,
            name: currentData.name,
            description: currentData.description,
            context: currentData.additionalInfo,
          },
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.result) {
        form.setValue("description", data.data.result);
        toast({
          title: "Description enhanced",
          description: "AI has improved your description. Feel free to edit further.",
        });
      }
    } catch (err) {
      console.error("Enhancement error:", err);
      toast({
        title: "Enhancement unavailable",
        description: "Please continue with your current description",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Validate with AI
  const validateContribution = async () => {
    const currentData = form.getValues();
    
    try {
      const { data, error } = await supabase.functions.invoke("contribute-assist", {
        body: {
          action: "validate_contribution",
          data: {
            contributionType: currentData.contributionType,
            actionType: currentData.actionType,
            name: currentData.name,
            description: currentData.description,
            location: currentData.location,
            additionalInfo: currentData.additionalInfo,
          },
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        if (data.data.suggestions) {
          setAiSuggestions(data.data.suggestions);
        }
        return data.data;
      }
    } catch (err) {
      console.error("Validation error:", err);
    }
    return null;
  };

  const onSubmit = async (data: ContributionFormData) => {
    setIsSubmitting(true);

    try {
      // Upload files if any
      const uploadedUrls: string[] = [];
      
      for (const { file, type } of files) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
        const fileName = `contributions/${data.contributionType}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("community-uploads")
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("community-uploads")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Create submission
      const { error } = await supabase.from("community_submissions").insert({
        user_id: user?.id || null,
        email: data.email,
        submission_type: data.actionType,
        entity_type: data.contributionType,
        entity_id: data.entityId || null,
        name: data.name || null,
        description: data.description || null,
        location: data.location || null,
        website_url: data.websiteUrl || null,
        additional_info: data.additionalInfo || null,
        file_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        consent_confirmed: true,
        consent_text_version: "v2",
        status: "pending",
        media_metadata: {
          entity_name: data.entityName || null,
          file_count: uploadedUrls.length,
          action_type: data.actionType,
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      form.reset();
      setFiles([]);
      
      toast({
        title: "Contribution received!",
        description: "Thank you for helping build the techno archive.",
      });

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedAction = form.watch("actionType");
  const watchedType = form.watch("contributionType");

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, []);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageSEO
          title="Contribution Received"
          description="Thank you for contributing to the techno.dog archive."
          path="/contribute"
        />
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 md:px-8 py-24">
            <div className="max-w-xl mx-auto text-center">
              <div className="border border-primary bg-primary/5 p-12">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                <h1 className="font-mono text-3xl uppercase tracking-tight mb-4">
                  Contribution Received
                </h1>
                <p className="font-mono text-sm text-muted-foreground mb-8">
                  Our team will review your submission. Quality underground content will be added to the archive.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    className="font-mono text-xs uppercase"
                  >
                    Submit another
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    className="font-mono text-xs uppercase"
                  >
                    Back to archive
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Contribute to the Archive"
        description="Add artists, venues, festivals, photos, corrections, and stories to the techno.dog knowledge base. Help build the underground techno archive."
        path="/contribute"
      />
      <Header />

      <main className="pt-16">
        {/* Hero Header */}
        <section className="relative border-b border-border overflow-hidden">
          {/* Background grid effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          
          <div className="container relative mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/40 bg-primary/10 mb-8">
                <Plus className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Community Archive</span>
              </div>
              <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6 leading-tight">
                Contribute to the
                <span className="block text-primary">Underground Archive</span>
              </h1>
              <p className="font-mono text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
                Share your knowledge, upload photos, submit corrections, or tell your stories. 
                Every contribution helps preserve and grow the global techno culture database.
              </p>
              
              {/* Quick action cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
                {Object.entries(actionTypes).map(([key, { label, icon: Icon }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      form.setValue("actionType", key as ContributionFormData["actionType"]);
                      document.getElementById("contribution-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group p-4 border border-border hover:border-primary/50 bg-card/50 hover:bg-primary/5 transition-all duration-200"
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Form */}
        <section id="contribution-form" className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
            <div className="max-w-2xl mx-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Step 1: What are you contributing? */}
                  <Card className="border-border overflow-hidden">
                    <CardHeader className="border-b border-border pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-mono text-sm font-bold text-primary">1</div>
                        <div>
                          <CardTitle className="font-mono text-lg uppercase tracking-wider">What are you contributing?</CardTitle>
                          <CardDescription className="font-mono text-xs text-muted-foreground">Select category and action type</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="contributionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-xs uppercase tracking-wider">
                              Category *
                            </FormLabel>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                              {Object.entries(contributionTypes).map(([value, { label, icon: Icon, color }]) => (
                                <div
                                  key={value}
                                  onClick={() => field.onChange(value)}
                                  className={`p-3 border cursor-pointer transition-all text-center ${
                                    field.value === value 
                                      ? "border-primary bg-primary/10" 
                                      : "border-border hover:border-primary/50 hover:bg-card"
                                  }`}
                                >
                                  <Icon className={`w-5 h-5 mx-auto mb-1 ${field.value === value ? "text-primary" : color}`} />
                                  <span className="font-mono text-[10px] uppercase tracking-wider block truncate">{label.split(' ')[0]}</span>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-xs uppercase tracking-wider">
                              What would you like to do? *
                            </FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              {Object.entries(actionTypes).map(([value, { label, description, icon: Icon }]) => (
                                <div
                                  key={value}
                                  onClick={() => field.onChange(value)}
                                  className={`group p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                                    field.value === value 
                                      ? "border-primary bg-primary/5" 
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    field.value === value ? "bg-primary/20" : "bg-muted"
                                  }`}>
                                    <Icon className={`w-4 h-4 ${field.value === value ? "text-primary" : "text-muted-foreground"}`} />
                                  </div>
                                  <div>
                                    <div className="font-mono text-sm mb-0.5">{label}</div>
                                    <div className="font-mono text-xs text-muted-foreground">{description}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Step 2: Details */}
                  <Card className="border-border overflow-hidden">
                    <CardHeader className="border-b border-border pb-4 bg-gradient-to-r from-logo-red/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-logo-red/20 flex items-center justify-center font-mono text-sm font-bold text-logo-red">2</div>
                        <div>
                          <CardTitle className="font-mono text-lg uppercase tracking-wider">Details</CardTitle>
                          <CardDescription className="font-mono text-xs text-muted-foreground">Tell us more about your contribution</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-xs uppercase tracking-wider">
                              Your Email *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                className="font-mono h-12"
                              />
                            </FormControl>
                            <FormDescription className="font-mono text-[10px] text-muted-foreground/60">
                              We'll only contact you about your submission
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-xs uppercase tracking-wider">
                              {watchedAction === "correction" ? "What are you correcting?" : "Name"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={
                                  watchedAction === "correction" 
                                    ? "e.g., Artist bio, venue capacity, event date" 
                                    : "e.g., Paula Temple, Bassiani, Dekmantel"
                                }
                                className="font-mono h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="font-mono text-xs uppercase tracking-wider">
                                {watchedAction === "correction" ? "What's incorrect & what's correct?" : "Description"}
                              </FormLabel>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={enhanceDescription}
                                      disabled={isEnhancing}
                                      className="h-6 px-2 text-xs"
                                    >
                                      {isEnhancing ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <>
                                          <Sparkles className="h-3 w-3 mr-1" />
                                          Enhance
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">AI will improve your description</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={
                                  watchedAction === "correction"
                                    ? "Describe what's wrong and provide the correct information..."
                                    : watchedAction === "story"
                                    ? "Share your experience, memory, or story..."
                                    : "Why is this significant? What's the connection to underground techno?"
                                }
                                className="font-mono min-h-[140px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* AI Suggestions */}
                      {aiSuggestions.length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-mono text-xs uppercase tracking-wider text-primary">AI Suggestions</span>
                          </div>
                          <ul className="space-y-1">
                            {aiSuggestions.map((suggestion, i) => (
                              <li key={i} className="font-mono text-xs text-muted-foreground">• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-mono text-xs uppercase tracking-wider">
                              Location
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Berlin, Germany"
                                className="font-mono h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Advanced Fields */}
                      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        <CollapsibleTrigger asChild>
                          <Button type="button" variant="ghost" className="w-full justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            Additional Details
                            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-6 pt-4">
                          <FormField
                            control={form.control}
                            name="websiteUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-xs uppercase tracking-wider">
                                  Website / Source URL
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="url"
                                    placeholder="https://"
                                    className="font-mono h-12"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="additionalInfo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-mono text-xs uppercase tracking-wider">
                                  Additional Notes
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Social links, notable releases, historical context..."
                                    className="font-mono min-h-[80px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>

                  {/* Step 3: Files */}
                  <Card className="border-border overflow-hidden">
                    <CardHeader className="border-b border-border pb-4 bg-gradient-to-r from-blue-500/5 to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-mono text-sm font-bold text-blue-500">3</div>
                        <div>
                          <CardTitle className="font-mono text-lg uppercase tracking-wider">Attach Files</CardTitle>
                          <CardDescription className="font-mono text-xs text-muted-foreground">Optional • Photos, documents, videos, audio</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Drop zone */}
                      <div
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileSelect(e.dataTransfer.files);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={getAllowedTypes().join(",")}
                          multiple
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                        />
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-mono text-sm text-muted-foreground mb-2">
                          Drop files here or click to browse
                        </p>
                        <div className="flex items-center justify-center gap-4 font-mono text-xs text-muted-foreground/60">
                          <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Images</span>
                          <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Videos</span>
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Documents</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground/40 mt-2">
                          Max 50MB per file • Up to {MAX_FILES} files
                        </p>
                      </div>

                      {/* Preview grid */}
                      {files.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                          {files.map((file, index) => (
                            <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted border border-border">
                              {file.type === "image" && file.preview ? (
                                <img
                                  src={file.preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                  {file.type === "video" && <Video className="h-8 w-8 text-muted-foreground mb-1" />}
                                  {file.type === "audio" && <Music className="h-8 w-8 text-muted-foreground mb-1" />}
                                  {file.type === "document" && <FileText className="h-8 w-8 text-muted-foreground mb-1" />}
                                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-full px-2">
                                    {file.file.name}
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80"
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Consent & Submit */}
                  <Card className="border-border bg-card/50">
                    <CardContent className="pt-6 space-y-6">
                      <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-mono text-sm text-muted-foreground">
                                I confirm this information is accurate and I have the rights to share this content *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full font-mono uppercase tracking-wider h-14 text-base"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Contribution
                          </>
                        )}
                      </Button>

                      <p className="font-mono text-xs text-muted-foreground text-center">
                        Submissions are reviewed by our team. Only quality, underground-focused content will be added.
                      </p>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section className="border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="text-center mb-10">
              <h2 className="font-mono text-2xl uppercase tracking-wider mb-3">Contribution Guidelines</h2>
              <p className="font-mono text-sm text-muted-foreground">What we're looking for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="border border-primary/20 bg-primary/5 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Disc className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">Underground Only</h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  We focus on underground techno culture. No mainstream EDM or commercial content.
                </p>
              </div>
              <div className="border border-logo-red/20 bg-logo-red/5 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-logo-red/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-logo-red" />
                </div>
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">Quality Matters</h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Detail and context make contributions valuable. Tell us why it matters.
                </p>
              </div>
              <div className="border border-blue-500/20 bg-blue-500/5 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">Global Archive</h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  We document techno worldwide. Every scene and story matters.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contribute;
