import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TermsOfService = () => {
  useEffect(() => {
    supabase.from('privacy_audit_log').insert({
      action_type: 'policy_view',
      details: { policy: 'terms_of_service' },
    });
  }, []);

  const lastUpdated = '2024-12-31';

  return (
    <PageLayout
      title="Terms of Service"
      description="Read the terms and conditions for using techno.dog services."
      path="/terms"
    >
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-logo-green" />
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-wider">
              Terms of Service
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Last updated: {lastUpdated}
            </span>
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none font-mono space-y-8">
          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using techno.dog ("the Service"), you accept and agree to be bound 
              by these Terms of Service. If you do not agree to these terms, please do not use 
              our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              2. Service Provider
            </h2>
            <div className="bg-card border border-border p-4 rounded-none">
              <p className="text-foreground font-medium">Miramonte Somió SL</p>
              <p className="text-muted-foreground text-xs">
                Cam. Nogales, 318, Periurbano - Rural<br />
                33203 Gijón, Asturias, Spain<br />
                CIF: B67299438
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              3. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              techno.dog is an open-source archive of global techno culture, providing:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• Information about techno artists, labels, venues, and festivals</li>
              <li>• Community-contributed content and resources</li>
              <li>• Educational materials about techno music and culture</li>
              <li>• An online store for merchandise</li>
              <li>• Developer API access (subject to separate terms)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              4. User Accounts
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              When you create an account, you agree to:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• Provide accurate and complete information</li>
              <li>• Maintain the security of your account credentials</li>
              <li>• Accept responsibility for all activities under your account</li>
              <li>• Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              5. User Content
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By submitting content to techno.dog, you:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• Retain ownership of your original content</li>
              <li>• Grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content</li>
              <li>• Warrant that you have the right to submit the content</li>
              <li>• Agree not to submit content that is illegal, offensive, or infringes on others' rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              6. Prohibited Conduct
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• Use the Service for any illegal purpose</li>
              <li>• Harass, abuse, or harm others</li>
              <li>• Impersonate any person or entity</li>
              <li>• Attempt to gain unauthorized access to our systems</li>
              <li>• Interfere with or disrupt the Service</li>
              <li>• Scrape or collect data without authorization</li>
              <li>• Use the Service for commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              7. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The techno.dog platform, including its design, code, and original content, is 
              protected by intellectual property laws. The archive content is community-contributed 
              and subject to various licenses. Our source code is available under open-source licenses.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              8. Store Purchases
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Purchases made through our store are subject to our{' '}
              <Link to="/store/info" className="text-logo-green hover:underline">
                Store Information
              </Link>{' '}
              policies, including shipping, returns, and payment terms. All transactions are 
              processed by Shopify and subject to their terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              9. API Usage
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Access to our Developer API is subject to additional terms, including rate limits 
              and acceptable use policies. Misuse of the API may result in access revocation.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE 
              THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE MAKE NO WARRANTIES 
              ABOUT THE ACCURACY OR COMPLETENESS OF THE CONTENT.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              11. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF 
              THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              12. Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your access to the Service at any time, with or without 
              cause, and with or without notice. Upon termination, your right to use the Service 
              ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              13. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Spain, 
              without regard to its conflict of law provisions. Any disputes shall be subject to 
              the exclusive jurisdiction of the courts of Gijón, Asturias, Spain.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              14. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective 
              immediately upon posting. Your continued use of the Service constitutes acceptance 
              of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              15. Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@techno.dog" className="text-logo-green hover:underline">
                legal@techno.dog
              </a>
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default TermsOfService;
