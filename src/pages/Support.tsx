import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  Zap,
  Star,
  Crown,
  Building2,
  Check,
  Loader2,
  ArrowRight,
  Settings,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";

const Support = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);
  
  // One-time support state
  const [oneTimeAmount, setOneTimeAmount] = useState<number>(20);
  const [oneTimeCustom, setOneTimeCustom] = useState<string>("");
  const [oneTimeLoading, setOneTimeLoading] = useState(false);
  
  // Recurring support state
  const [recurringAmount, setRecurringAmount] = useState<number>(7);
  const [recurringCustom, setRecurringCustom] = useState<string>("");
  const [recurringLoading, setRecurringLoading] = useState(false);
  
  // Corporate state
  const [corporateAmount, setCorporateAmount] = useState<number>(500);
  const [corporateCustom, setCorporateCustom] = useState<string>("");
  const [corporateCompany, setCorporateCompany] = useState("");
  const [corporateEmail, setCorporateEmail] = useState("");
  const [corporateVat, setCorporateVat] = useState("");
  const [corporateNotes, setCorporateNotes] = useState("");
  const [corporateLoading, setCorporateLoading] = useState(false);
  
  // Portal state
  const [portalEmail, setPortalEmail] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Clear the query param without triggering a reload
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("success");
      setSearchParams(newParams, { replace: true });
    } else if (searchParams.get("cancelled") === "true") {
      toast({
        title: "Payment cancelled",
        description: "No worries. Come back anytime.",
        variant: "destructive",
      });
      // Clear the query param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("cancelled");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, toast]);

  const handleManageSubscription = async () => {
    if (!portalEmail) {
      toast({
        title: "Email required",
        description: "Please enter the email you used to subscribe",
        variant: "destructive",
      });
      return;
    }

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { email: portalEmail },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: "Error",
        description: error.message || "Could not open subscription portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCheckout = async (mode: "one_time" | "recurring", amount: number) => {
    const setLoading = mode === "one_time" ? setOneTimeLoading : setRecurringLoading;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("stripe-support", {
        body: {
          mode,
          amount_cents: Math.round(amount * 100),
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCorporateRequest = async () => {
    if (!corporateCompany || !corporateEmail) {
      toast({
        title: "Missing information",
        description: "Please provide company name and email",
        variant: "destructive",
      });
      return;
    }

    setCorporateLoading(true);

    try {
      const amount = corporateCustom ? parseFloat(corporateCustom) : corporateAmount;
      
      const { data, error } = await supabase.functions.invoke("stripe-support", {
        body: {
          mode: "corporate",
          amount_cents: Math.round(amount * 100),
          email: corporateEmail,
          company_name: corporateCompany,
          vat_number: corporateVat,
          notes: corporateNotes,
        },
      });

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: data.message || "We'll contact you shortly.",
      });

      // Reset form
      setCorporateCompany("");
      setCorporateEmail("");
      setCorporateVat("");
      setCorporateNotes("");
      setCorporateCustom("");
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setCorporateLoading(false);
    }
  };

  const oneTimeFinalAmount = oneTimeCustom ? parseFloat(oneTimeCustom) || 0 : oneTimeAmount;
  const recurringFinalAmount = recurringCustom ? parseFloat(recurringCustom) || 0 : recurringAmount;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Support techno.dog"
        description="Support independent cultural infrastructure. No ads. No paywalls. No corporate agenda."
        path="/support"
      />
      <Header />

      <main className="pt-16">
        {/* Success Panel */}
        {showSuccess && (
          <section className="border-b border-logo-green bg-logo-green/5">
            <div className="container mx-auto px-4 md:px-8 py-12">
              <div className="max-w-2xl mx-auto text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-logo-green/20 flex items-center justify-center">
                    <PartyPopper className="w-8 h-8 text-logo-green" />
                  </div>
                </div>
                <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight mb-4 text-logo-green">
                  Thank You for Your Support
                </h2>
                <p className="font-mono text-sm text-muted-foreground mb-6 leading-relaxed">
                  Your contribution has been received. A confirmation email is on its way to your inbox.<br />
                  You're now part of the crew keeping independent techno culture alive.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    className="font-mono uppercase tracking-wider"
                    onClick={() => setShowSuccess(false)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Continue Exploring
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-3xl">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                // Independent Infrastructure
              </div>
              <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6">
                Support techno.dog
              </h1>
              <div className="space-y-4 font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
                <p>
                  techno.dog is an independent, open knowledge project.<br />
                  No ads. No paywalls. No corporate agenda.
                </p>
                <p>
                  It exists because it's been funded, built, and maintained by one person for a long time — and because it matters.
                </p>
                <p>
                  Support helps keep the servers running, the archive growing, the APIs open, and the work sustainable.
                </p>
                <p className="text-foreground font-semibold pt-4">
                  This is not a charity.<br />
                  It's support for independent cultural infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Support Enables */}
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-6">
              What Your Support Enables
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "Hosting, storage, bandwidth, and APIs",
                "Research, curation, and documentation",
                "Community contributions and moderation",
                "Long-term preservation of underground techno culture",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 border border-border/50">
                  <Check className="w-4 h-4 text-logo-green mt-0.5 shrink-0" />
                  <span className="font-mono text-xs">{item}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-6">
              Everything stays open to read. Support simply makes it possible.
            </p>
          </div>
        </section>

        {/* One-Time Support */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-5 h-5 text-crimson" />
                <h2 className="font-mono text-xl uppercase tracking-tight">One-Time Support</h2>
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-6">
                Give once. No commitment.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[5, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => { setOneTimeAmount(amount); setOneTimeCustom(""); }}
                    className={`p-4 border font-mono text-sm transition-all ${
                      oneTimeAmount === amount && !oneTimeCustom
                        ? "border-logo-green bg-logo-green/10 text-logo-green"
                        : "border-border hover:border-logo-green/50"
                    }`}
                  >
                    €{amount}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-sm text-muted-foreground">€</span>
                <Input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  value={oneTimeCustom}
                  onChange={(e) => setOneTimeCustom(e.target.value)}
                  className="font-mono"
                />
              </div>

              <Button
                variant="brutalist"
                className="w-full font-mono uppercase tracking-wider"
                onClick={() => handleCheckout("one_time", oneTimeFinalAmount)}
                disabled={oneTimeLoading || oneTimeFinalAmount < 1}
              >
                {oneTimeLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Support techno.dog — €{oneTimeFinalAmount.toFixed(0)}
              </Button>
            </div>
          </div>
        </section>

        {/* Monthly Membership */}
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-logo-green" />
              <h2 className="font-mono text-xl uppercase tracking-tight">Monthly Membership</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground mb-8">
              Ongoing support. Cancel anytime.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Member */}
              <button
                onClick={() => { setRecurringAmount(7); setRecurringCustom(""); }}
                className={`p-6 border text-left transition-all ${
                  recurringAmount === 7 && !recurringCustom
                    ? "border-logo-green bg-logo-green/10"
                    : "border-border hover:border-logo-green/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-logo-green" />
                  <span className="font-mono text-sm uppercase tracking-tight">Member</span>
                </div>
                <div className="font-mono text-2xl text-logo-green mb-2">€7<span className="text-sm text-muted-foreground">/mo</span></div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Access to supporter updates and early features.
                </p>
              </button>

              {/* Patron */}
              <button
                onClick={() => { setRecurringAmount(25); setRecurringCustom(""); }}
                className={`p-6 border text-left transition-all ${
                  recurringAmount === 25 && !recurringCustom
                    ? "border-logo-green bg-logo-green/10"
                    : "border-border hover:border-logo-green/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-logo-green" />
                  <span className="font-mono text-sm uppercase tracking-tight">Patron</span>
                </div>
                <div className="font-mono text-2xl text-logo-green mb-2">€25<span className="text-sm text-muted-foreground">/mo</span></div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Higher API limits, early access, supporter badge.
                </p>
              </button>

              {/* Founding Supporter */}
              <button
                onClick={() => { setRecurringAmount(100); setRecurringCustom(""); }}
                className={`p-6 border text-left transition-all ${
                  recurringAmount === 100 && !recurringCustom
                    ? "border-crimson bg-crimson/10"
                    : "border-border hover:border-crimson/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-crimson" />
                  <span className="font-mono text-sm uppercase tracking-tight">Founding Supporter</span>
                </div>
                <div className="font-mono text-2xl text-crimson mb-2">€100<span className="text-sm text-muted-foreground">/mo</span></div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Maximum API access, priority features, long-term recognition.
                </p>
              </button>
            </div>

            <div className="max-w-md">
              <p className="font-mono text-xs text-muted-foreground mb-2">
                Or set your own monthly amount:
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-sm text-muted-foreground">€</span>
                <Input
                  type="number"
                  min="3"
                  placeholder="Custom monthly amount"
                  value={recurringCustom}
                  onChange={(e) => setRecurringCustom(e.target.value)}
                  className="font-mono"
                />
                <span className="font-mono text-sm text-muted-foreground">/mo</span>
              </div>

              <Button
                variant="brutalist"
                className="w-full font-mono uppercase tracking-wider"
                onClick={() => handleCheckout("recurring", recurringFinalAmount)}
                disabled={recurringLoading || recurringFinalAmount < 3}
              >
                {recurringLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Become a member — €{recurringFinalAmount.toFixed(0)}/mo
              </Button>
            </div>
          </div>
        </section>

        {/* Corporate Support */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-mono text-xl uppercase tracking-tight">Corporate & Professional Support</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground mb-8">
              For studios, collectives, venues, labels, agencies, and companies who benefit from open cultural infrastructure.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { amount: 500, label: "Bronze", desc: "€500/year" },
                    { amount: 2000, label: "Silver", desc: "€2,000/year" },
                    { amount: 10000, label: "Gold", desc: "€10,000/year" },
                  ].map((tier) => (
                    <button
                      key={tier.amount}
                      onClick={() => { setCorporateAmount(tier.amount); setCorporateCustom(""); }}
                      className={`p-4 border font-mono text-left transition-all ${
                        corporateAmount === tier.amount && !corporateCustom
                          ? "border-logo-green bg-logo-green/10"
                          : "border-border hover:border-logo-green/50"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-tight">{tier.label}</div>
                      <div className="text-sm text-logo-green">{tier.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">€</span>
                  <Input
                    type="number"
                    min="100"
                    placeholder="Custom amount/year"
                    value={corporateCustom}
                    onChange={(e) => setCorporateCustom(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Company name *"
                  value={corporateCompany}
                  onChange={(e) => setCorporateCompany(e.target.value)}
                  className="font-mono"
                />
                <Input
                  type="email"
                  placeholder="Contact email *"
                  value={corporateEmail}
                  onChange={(e) => setCorporateEmail(e.target.value)}
                  className="font-mono"
                />
                <Input
                  placeholder="VAT number (optional)"
                  value={corporateVat}
                  onChange={(e) => setCorporateVat(e.target.value)}
                  className="font-mono"
                />
                <Textarea
                  placeholder="Notes (optional)"
                  value={corporateNotes}
                  onChange={(e) => setCorporateNotes(e.target.value)}
                  className="font-mono min-h-[80px]"
                />

                <Button
                  variant="outline"
                  className="w-full font-mono uppercase tracking-wider"
                  onClick={handleCorporateRequest}
                  disabled={corporateLoading}
                >
                  {corporateLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Request sponsorship / invoice
                </Button>

                <p className="font-mono text-[10px] text-muted-foreground">
                  Invoices available. We'll contact you within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Note */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Important Note
            </h3>
            <p className="font-mono text-xs text-muted-foreground max-w-2xl">
              Support is a commercial contribution to Project La PIPA, operated by Miramonte Somió SL (Spain).
              It is not presented as a tax-deductible donation.
            </p>
          </div>
        </section>

        {/* Manage Subscription */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-mono text-xl uppercase tracking-tight">Manage Subscription</h2>
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-6">
                Already a supporter? Enter your email to manage your subscription, update payment methods, or cancel.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={portalEmail}
                  onChange={(e) => setPortalEmail(e.target.value)}
                  className="font-mono flex-1"
                />
                <Button
                  variant="outline"
                  className="font-mono uppercase tracking-wider shrink-0"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Manage
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Thank You */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 text-center">
            <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight mb-4">
              Thank You
            </h2>
            <p className="font-mono text-sm text-muted-foreground max-w-lg mx-auto">
              If you support this project, you're not "donating".<br />
              You're keeping a piece of culture alive.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
