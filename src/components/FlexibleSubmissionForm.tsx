import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import FileUploadZone from "./FileUploadZone";

const submissionSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .max(255, "Email must be less than 255 characters"),
  submission_type: z.enum(["artist", "venue", "festival", "label", "crew", "release", "gear", "story", "correction", "other"]).optional(),
  name: z
    .string()
    .trim()
    .max(200, "Name must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(5000, "Description must be less than 5000 characters")
    .optional(),
  location: z
    .string()
    .trim()
    .max(200, "Location must be less than 200 characters")
    .optional(),
  website_url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  additional_info: z
    .string()
    .trim()
    .max(3000, "Additional info must be less than 3000 characters")
    .optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must confirm you have rights to share this content",
  }),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

const FlexibleSubmissionForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      email: user?.email || "",
      submission_type: undefined,
      name: "",
      description: "",
      location: "",
      website_url: "",
      additional_info: "",
      consent: false,
    },
  });

  const typeLabels = {
    artist: "Artist / DJ",
    venue: "Venue / Club",
    festival: "Festival",
    label: "Record Label",
    crew: "Crew / Collective",
    release: "Release / Track",
    gear: "Gear / Equipment",
    story: "Story / History",
    correction: "Correction / Update",
    other: "Other",
  };

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);

    try {
      const fileUrls = uploadedFiles.map(f => f.url);

      const { error } = await supabase.from("community_submissions").insert({
        user_id: user?.id || null,
        email: data.email,
        submission_type: data.submission_type || "other",
        name: data.name || null,
        description: data.description || null,
        location: data.location || null,
        website_url: data.website_url || null,
        additional_info: data.additional_info || null,
        file_urls: fileUrls.length > 0 ? fileUrls : null,
        consent_confirmed: true,
        consent_text_version: "v1",
      });

      if (error) throw error;

      setIsSuccess(true);
      form.reset();
      setUploadedFiles([]);
      toast({
        title: "Submission received",
        description: "Thank you for contributing to the techno knowledge base!",
      });

      setTimeout(() => setIsSuccess(false), 10000);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="border border-logo-green bg-card p-8 sm:p-12 text-center">
        <CheckCircle className="w-16 h-16 text-logo-green mx-auto mb-6" />
        <h3 className="font-mono text-2xl uppercase tracking-tight mb-3">
          Thank You!
        </h3>
        <p className="font-mono text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Your contribution has been received. Our team will review it and add it to the archive.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="font-mono text-xs uppercase hover:bg-logo-green hover:text-background hover:border-logo-green"
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border p-4 sm:p-6">
        <h3 className="font-mono text-lg uppercase tracking-wider mb-2">
          Share your knowledge
        </h3>
        <p className="font-mono text-xs text-muted-foreground">
          Everything is optional except your email and consent. Share as much or as little as you want.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
          {/* Email - Required */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider">
                  Email *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your@email.com"
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription className="font-mono text-[10px] text-muted-foreground/60">
                  We'll only use this to follow up if needed
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description - Primary content field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider">
                  Tell us about it
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Share your knowledge, story, or suggestion. Any detail helps — historical context, personal experiences, technical information..."
                    className="font-mono min-h-[150px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-foreground">
              Attachments
            </label>
            <p className="font-mono text-[10px] text-muted-foreground/60 mb-3">
              Upload photos, documents, audio recordings, or any relevant files
            </p>
            <FileUploadZone onFilesChange={setUploadedFiles} />
          </div>

          {/* Collapsible optional fields */}
          <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {showOptionalFields ? "Show fewer fields" : "Show more fields"}
                {showOptionalFields ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
              {/* Type Selection */}
              <FormField
                control={form.control}
                name="submission_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider">
                      What are you sharing?
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="font-mono">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider">
                      Name / Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Paula Temple, Bassiani, Dekmantel"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
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
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider">
                      Website / Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional Info */}
              <FormField
                control={form.control}
                name="additional_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider">
                      Additional Information
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Social links, discography, notable events, connections to other artists or venues..."
                        className="font-mono min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Consent Checkbox */}
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-mono text-xs text-muted-foreground">
                    I confirm this information is accurate and I have rights to share it *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-mono uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>

            <p className="font-mono text-[10px] text-muted-foreground/60 text-center mt-4">
              All submissions help preserve techno culture for future generations.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FlexibleSubmissionForm;