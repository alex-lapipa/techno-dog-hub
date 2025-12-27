import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/form";

const submissionSchema = z.object({
  submission_type: z.enum(["artist", "venue", "festival", "label", "other"], {
    required_error: "Please select a type",
  }),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters")
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
    .max(1000, "Additional info must be less than 1000 characters")
    .optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

const CommunitySubmissionForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      submission_type: undefined,
      name: "",
      description: "",
      location: "",
      website_url: "",
      additional_info: "",
    },
  });

  const typeLabels = {
    artist: "Artist / DJ",
    venue: "Venue / Club",
    festival: "Festival",
    label: "Record Label",
    other: "Other",
  };

  const onSubmit = async (data: SubmissionFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("community_submissions").insert({
        user_id: user?.id || null,
        submission_type: data.submission_type,
        name: data.name,
        description: data.description || null,
        location: data.location || null,
        website_url: data.website_url || null,
        additional_info: data.additional_info || null,
      });

      if (error) throw error;

      setIsSuccess(true);
      form.reset();
      toast({
        title: "Submission received",
        description: "Thank you for contributing to the techno knowledge base!",
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
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
      <div className="border border-primary bg-card p-8 text-center">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="font-mono text-xl uppercase tracking-tight mb-2">
          Submission Received
        </h3>
        <p className="font-mono text-sm text-muted-foreground mb-4">
          Our team will review your suggestion. Thank you for contributing!
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="font-mono text-xs uppercase"
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
          // Community submission
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Type Selection */}
          <FormField
            control={form.control}
            name="submission_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider">
                  Type *
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="font-mono">
                      <SelectValue placeholder="Select type..." />
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
                  Name *
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

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-mono text-xs uppercase tracking-wider">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Why should this be in the archive? What makes it significant to underground techno?"
                    className="font-mono min-h-[100px]"
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
                  Additional Info
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Any other relevant details, social links, notable releases, etc."
                    className="font-mono min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
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
                  Submit Suggestion
                </>
              )}
            </Button>

            <p className="font-mono text-xs text-muted-foreground text-center mt-4">
              Submissions are reviewed by our team. Only quality, underground-focused content will be added.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CommunitySubmissionForm;
