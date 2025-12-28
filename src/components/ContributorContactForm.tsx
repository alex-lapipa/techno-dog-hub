import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, Mail } from "lucide-react";

const SKILL_OPTIONS = [
  { id: "audio-dsp", label: "Audio / DSP Engineering" },
  { id: "sequencer", label: "Sequencer + Timing" },
  { id: "plugin-dev", label: "Plugin / Standalone App Engineering" },
  { id: "ui-design", label: "UI / Interaction Design" },
  { id: "sound-design", label: "Sound Design + Kit Building" },
  { id: "testing", label: "Testing + QA" },
  { id: "documentation", label: "Documentation + Tutorials" },
  { id: "other", label: "Other" },
];

const ContributorContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: [] as string[],
    message: "",
  });

  const handleSkillToggle = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((s) => s !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedSkillLabels = formData.skills.map(
        (id) => SKILL_OPTIONS.find((s) => s.id === id)?.label || id
      );

      const { error } = await supabase.functions.invoke("contributor-contact", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          skills: selectedSkillLabels,
          message: formData.message.trim(),
        },
      });

      if (error) throw error;

      toast.success("Message sent! We'll be in touch soon.");
      setFormData({ name: "", email: "", skills: [], message: "" });
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-lg bg-card/50 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-logo-green/20 border border-logo-green/50 flex items-center justify-center">
          <Mail className="w-5 h-5 text-logo-green" />
        </div>
        <div>
          <h3 className="font-mono text-lg font-bold">Get Involved</h3>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Contributor Contact Form
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-sm">
              Name <span className="text-logo-green">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="font-mono bg-background/50 border-border/50 focus:border-logo-green"
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-sm">
              Email <span className="text-logo-green">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="font-mono bg-background/50 border-border/50 focus:border-logo-green"
              maxLength={255}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-mono text-sm">Skills / Areas of Interest</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <div key={skill.id} className="flex items-center space-x-2">
                <Checkbox
                  id={skill.id}
                  checked={formData.skills.includes(skill.id)}
                  onCheckedChange={() => handleSkillToggle(skill.id)}
                  className="border-border/50 data-[state=checked]:bg-logo-green data-[state=checked]:border-logo-green"
                />
                <Label
                  htmlFor={skill.id}
                  className="font-mono text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                >
                  {skill.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="font-mono text-sm">
            Message <span className="text-logo-green">*</span>
          </Label>
          <Textarea
            id="message"
            placeholder="Tell us about your experience and how you'd like to contribute..."
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            className="font-mono bg-background/50 border-border/50 focus:border-logo-green min-h-[120px] resize-none"
            maxLength={2000}
            required
          />
          <p className="font-mono text-[10px] text-muted-foreground/60 text-right">
            {formData.message.length}/2000
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full font-mono uppercase tracking-wider bg-logo-green hover:bg-logo-green/90 text-background"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContributorContactForm;
