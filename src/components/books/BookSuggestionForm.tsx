import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BookPlus, Upload, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const suggestionSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(2, "Book title or document name required").max(200),
  author: z.string().max(200).optional(),
  description: z.string().min(10, "Please provide a brief description").max(2000),
  additionalInfo: z.string().max(2000).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  consent: z.boolean().refine((val) => val === true, "You must confirm this information is accurate"),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

export const BookSuggestionForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      email: "",
      name: "",
      author: "",
      description: "",
      additionalInfo: "",
      websiteUrl: "",
      consent: false,
    },
  });

  const onSubmit = async (data: SuggestionFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("community_submissions").insert({
        email: data.email.trim(),
        name: data.name.trim(),
        submission_type: "book",
        description: data.description.trim(),
        additional_info: [
          data.author ? `Author: ${data.author}` : null,
          data.additionalInfo || null,
        ].filter(Boolean).join("\n\n"),
        website_url: data.websiteUrl || null,
        consent_confirmed: true,
        consent_text_version: "v1-books",
        status: "pending",
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Suggestion submitted for review");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="border border-logo-green/30 bg-logo-green/5 p-8 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-logo-green" />
        <h3 className="font-mono text-lg uppercase tracking-wider text-foreground mb-2">
          Suggestion Received
        </h3>
        <p className="font-mono text-xs text-muted-foreground max-w-md mx-auto">
          Your submission will be reviewed by our curators. If approved, it will appear on the site.
          Thanks for contributing to the underground knowledge base.
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            form.reset();
          }}
          className="mt-6 font-mono text-xs text-logo-green hover:underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card/30 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-crimson" />
        <div>
          <h3 className="font-mono text-lg uppercase tracking-wider text-foreground flex items-center gap-2">
            <BookPlus className="w-4 h-4" />
            Suggest a Book or Document
          </h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Know something we're missing? Essays, academic papers, zines, books — we want to hear about it.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Your Email *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@example.com"
                    className="bg-background/50 border-border font-mono text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Book/Document Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Title / Name *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Book title, essay name, or document title"
                    className="bg-background/50 border-border font-mono text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Author */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Author / Creator
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Who wrote or created this?"
                    className="bg-background/50 border-border font-mono text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Why is this relevant? *
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Brief description of the content and why it belongs in the collection..."
                    rows={4}
                    className="bg-background/50 border-border font-mono text-sm resize-none"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Website/Link */}
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Link (optional)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="url"
                    placeholder="https://..."
                    className="bg-background/50 border-border font-mono text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Additional Info */}
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Additional Notes (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Publisher, year, ISBN, or any other relevant details..."
                    rows={3}
                    className="bg-background/50 border-border font-mono text-sm resize-none"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Consent */}
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-mono text-xs text-muted-foreground cursor-pointer">
                    I confirm this information is accurate to the best of my knowledge and relevant to techno culture.
                  </FormLabel>
                  <FormMessage className="text-xs" />
                </div>
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full md:w-auto px-8 py-3",
              "font-mono text-xs uppercase tracking-widest",
              "bg-crimson hover:bg-crimson/90 text-white border-none"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Suggestion
              </>
            )}
          </Button>

          <p className="font-mono text-[10px] text-muted-foreground">
            All submissions are reviewed before publication. Expect a response within 7 days.
          </p>
        </form>
      </Form>
    </div>
  );
};
