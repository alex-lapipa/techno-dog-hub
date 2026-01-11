import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ArrowLeft, Cookie, Calendar, Shield, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ConsentSettingsButton } from '@/components/privacy/ConsentSettingsButton';
import { DoNotSellLink } from '@/components/privacy/DoNotSellLink';

const CookiePolicy = () => {
  useEffect(() => {
    supabase.from('privacy_audit_log').insert({
      action_type: 'policy_view',
      details: { policy: 'cookie_policy' },
    });
  }, []);

  const lastUpdated = '2025-01-11';

  const cookies = [
    {
      category: 'Essential',
      cookies: [
        { name: 'sb-*-auth-token', provider: 'Supabase', purpose: 'User authentication and session management', expiry: 'Session' },
        { name: 'technodog_consent_preferences', provider: 'techno.dog', purpose: 'Stores your cookie consent preferences', expiry: '1 year' },
        { name: 'technodog_session_id', provider: 'techno.dog', purpose: 'Anonymous session identification for consent tracking', expiry: 'Session' },
      ],
    },
    {
      category: 'Analytics',
      cookies: [
        { name: '_ga', provider: 'Google Analytics', purpose: 'Distinguishes unique users', expiry: '2 years' },
        { name: '_ga_*', provider: 'Google Analytics', purpose: 'Maintains session state', expiry: '2 years' },
        { name: '_gid', provider: 'Google Analytics', purpose: 'Distinguishes unique users', expiry: '24 hours' },
        { name: '_gat', provider: 'Google Analytics', purpose: 'Throttles request rate', expiry: '1 minute' },
      ],
    },
    {
      category: 'Marketing',
      cookies: [
        { name: '_gcl_*', provider: 'Google', purpose: 'Tracks ad campaign performance', expiry: '90 days' },
      ],
    },
    {
      category: 'Personalization',
      cookies: [
        { name: 'doggy_*', provider: 'techno.dog', purpose: 'Remembers your Techno Doggy preferences', expiry: '1 year' },
        { name: 'technodog-cart', provider: 'techno.dog', purpose: 'Stores your shopping cart items', expiry: 'Persistent' },
      ],
    },
  ];

  return (
    <PageLayout
      title="Cookie Policy"
      description="Learn about the cookies we use on techno.dog and how to manage your preferences."
      path="/cookies"
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
            <Cookie className="w-8 h-8 text-logo-green" />
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-wider">
              Cookie Policy
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
              What Are Cookies?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. 
              They are widely used to make websites work more efficiently and to provide information 
              to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              How We Use Cookies
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies for the following purposes:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Essential:</strong> Required for the website to function properly</li>
              <li>• <strong>Analytics:</strong> Help us understand how visitors use our site (with consent)</li>
              <li>• <strong>Marketing:</strong> Used for advertising purposes (with consent)</li>
              <li>• <strong>Personalization:</strong> Remember your preferences (with consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              Cookies We Use
            </h2>
            
            {cookies.map((category) => (
              <div key={category.category} className="mt-6">
                <h3 className="text-lg text-foreground mb-4">{category.category} Cookies</h3>
                <div className="border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 font-medium">Cookie</th>
                        <th className="text-left p-3 font-medium">Provider</th>
                        <th className="text-left p-3 font-medium">Purpose</th>
                        <th className="text-left p-3 font-medium">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.cookies.map((cookie, idx) => (
                        <tr key={cookie.name} className={idx !== category.cookies.length - 1 ? 'border-b border-border' : ''}>
                          <td className="p-3 text-logo-green">{cookie.name}</td>
                          <td className="p-3 text-muted-foreground">{cookie.provider}</td>
                          <td className="p-3 text-muted-foreground">{cookie.purpose}</td>
                          <td className="p-3 text-muted-foreground">{cookie.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              Managing Your Cookie Preferences
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You can change your cookie preferences at any time by clicking the button below:
            </p>
            <div className="mt-4">
              <ConsentSettingsButton />
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can also control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• View what cookies are stored and delete them individually</li>
              <li>• Block third-party cookies</li>
              <li>• Block cookies from specific sites</li>
              <li>• Block all cookies</li>
              <li>• Delete all cookies when you close your browser</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Please note that blocking essential cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              Third-Party Cookies & Data Processing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Some cookies are placed by third-party services that appear on our pages. 
              We have executed Data Processing Agreements (DPAs) with all third-party cookie providers 
              to ensure GDPR-compliant handling of your data:
            </p>
            <div className="border border-border mt-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Provider</th>
                    <th className="text-left p-3 font-medium">Purpose</th>
                    <th className="text-left p-3 font-medium">DPA Status</th>
                    <th className="text-left p-3 font-medium">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Google Analytics</td>
                    <td className="p-3 text-muted-foreground">Website analytics</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                    <td className="p-3">
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-logo-green hover:underline">
                        View
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Shopify</td>
                    <td className="p-3 text-muted-foreground">E-commerce</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                    <td className="p-3">
                      <a href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-logo-green hover:underline">
                        View
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground">Supabase</td>
                    <td className="p-3 text-muted-foreground">Authentication</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                    <td className="p-3">
                      <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-logo-green hover:underline">
                        View
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-xs mt-4">
              For questions about our data processing agreements or to request copies, contact our 
              Data Protection Officer at{' '}
              <a href="mailto:alex.lawton@miramonte.io" className="text-logo-green hover:underline">alex.lawton@miramonte.io</a>.
            </p>
          </section>

          {/* CCPA Notice */}
          <section className="border-2 border-logo-green/30 p-6 rounded-lg bg-logo-green/5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-logo-green" />
              <h2 className="text-lg uppercase tracking-wider text-foreground">
                California Residents (CCPA/CPRA)
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), 
              California residents have additional rights regarding cookies and tracking technologies:
            </p>
            <ul className="text-muted-foreground space-y-2 mb-4">
              <li>• Right to know what cookies are being used and for what purposes</li>
              <li>• Right to opt-out of the "sale" or "sharing" of personal information via cookies</li>
              <li>• Right to limit use of sensitive personal information</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <DoNotSellLink />
            </div>
            <p className="text-muted-foreground text-xs mt-4">
              We honor Global Privacy Control (GPC) signals as a valid opt-out request.
            </p>
          </section>

          {/* ePrivacy Notice */}
          <section className="border-2 border-blue-500/30 p-6 rounded-lg bg-blue-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg uppercase tracking-wider text-foreground">
                EU ePrivacy Directive Compliance
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In compliance with the EU ePrivacy Directive, we:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• Obtain your prior informed consent before placing non-essential cookies</li>
              <li>• Only place strictly necessary cookies without consent (e.g., session cookies for login)</li>
              <li>• Provide clear information about each cookie before you consent</li>
              <li>• Allow you to withdraw consent as easily as you gave it</li>
              <li>• Store consent records to demonstrate compliance</li>
            </ul>
            <p className="text-muted-foreground text-xs mt-4">
              Consent is not required for cookies that are strictly necessary for providing a service 
              you have explicitly requested (Article 5(3) of Directive 2002/58/EC).
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              Updates to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this 
              page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@techno.dog" className="text-logo-green hover:underline">
                privacy@techno.dog
              </a>
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default CookiePolicy;
