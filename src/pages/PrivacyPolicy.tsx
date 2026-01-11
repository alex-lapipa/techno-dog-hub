import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { ArrowLeft, Shield, Mail, Calendar, Globe, Scale, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GDPRRequestForm } from '@/components/privacy/GDPRRequestForm';
import { CCPARequestForm } from '@/components/privacy/CCPARequestForm';
import { DoNotSellLink } from '@/components/privacy/DoNotSellLink';

const PrivacyPolicy = () => {
  // Log policy view for compliance
  useEffect(() => {
    supabase.from('privacy_audit_log').insert({
      action_type: 'policy_view',
      details: { policy: 'privacy_policy' },
    });
  }, []);

  const lastUpdated = '2025-01-11';

  // JSON-LD structured data for privacy policy
  const privacySchemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "description": "Learn how techno.dog collects, uses, and protects your personal information. GDPR, CCPA, and ePrivacy compliant.",
    "url": "https://techno.dog/privacy",
    "dateModified": lastUpdated,
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "name": "techno.dog",
      "url": "https://techno.dog"
    },
    "about": {
      "@type": "Thing",
      "name": "Privacy and Data Protection"
    },
    "mainEntity": {
      "@type": "Article",
      "headline": "Privacy Policy - techno.dog",
      "datePublished": "2024-01-01",
      "dateModified": lastUpdated,
      "author": {
        "@type": "Organization",
        "name": "Miramonte Somió SL",
        "url": "https://techno.dog"
      },
      "publisher": {
        "@type": "Organization",
        "name": "techno.dog",
        "logo": {
          "@type": "ImageObject",
          "url": "https://techno.dog/og-image.png"
        }
      }
    }
  };

  const gdprComplianceSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "techno.dog",
    "legalName": "Miramonte Somió SL",
    "url": "https://techno.dog",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Cam. Nogales, 318, Periurbano - Rural",
      "addressLocality": "Gijón",
      "addressRegion": "Asturias",
      "postalCode": "33203",
      "addressCountry": "ES"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Data Protection Officer",
      "email": "alex.lawton@miramonte.io",
      "name": "Alex Lawton"
    },
    "sameAs": [
      "https://techno.dog/privacy",
      "https://techno.dog/cookies",
      "https://techno.dog/terms"
    ]
  };

  return (
    <PageLayout
      title="Privacy Policy"
      description="Learn how techno.dog collects, uses, and protects your personal information. GDPR, CCPA, and ePrivacy compliant."
      path="/privacy"
      structuredData={[privacySchemaData, gdprComplianceSchema]}
    >
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-logo-green" />
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-wider">
              Privacy Policy
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Last updated: {lastUpdated}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none font-mono space-y-8">
          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              1. Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              techno.dog ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you visit our website techno.dog (the "Site").
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We comply with the General Data Protection Regulation (GDPR) and other applicable 
              data protection laws. By using our Site, you agree to the collection and use of 
              information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              2. Data Controller & Data Protection Officer
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The data controller responsible for your personal data is:
            </p>
            <div className="bg-card border border-border p-4 rounded-none mb-4">
              <p className="text-foreground font-medium">Miramonte Somió SL</p>
              <p className="text-muted-foreground text-xs">
                Cam. Nogales, 318, Periurbano - Rural<br />
                33203 Gijón, Asturias, Spain<br />
                CIF: B67299438
              </p>
            </div>
            
            <h3 className="text-lg text-foreground mt-6">Data Protection Officer (DPO)</h3>
            <p className="text-muted-foreground leading-relaxed">
              We have appointed a Data Protection Officer to oversee compliance with data protection 
              regulations and to be your point of contact for all privacy-related inquiries:
            </p>
            <div className="bg-card border border-border p-4 rounded-none flex items-center gap-3">
              <Mail className="w-5 h-5 text-logo-green" />
              <div>
                <p className="text-foreground font-medium text-sm">Alex Lawton — Data Protection Officer</p>
                <a href="mailto:alex.lawton@miramonte.io" className="text-logo-green hover:underline text-sm">
                  alex.lawton@miramonte.io
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              3. Information We Collect
            </h2>
            
            <h3 className="text-lg text-foreground mt-6">3.1 Information You Provide</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Account Information:</strong> Email address when you create an account</li>
              <li>• <strong>Community Submissions:</strong> Content you submit (artist info, venue details, etc.)</li>
              <li>• <strong>Contact Information:</strong> When you contact us for support</li>
              <li>• <strong>Purchase Information:</strong> Order details when using our store (processed by Shopify)</li>
            </ul>

            <h3 className="text-lg text-foreground mt-6">3.2 Automatically Collected Information</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Usage Data:</strong> Pages visited, time spent, click patterns (with consent)</li>
              <li>• <strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li>• <strong>IP Address:</strong> Used for security and fraud prevention (anonymized for analytics)</li>
              <li>• <strong>Cookies:</strong> See our <Link to="/cookies" className="text-logo-green hover:underline">Cookie Policy</Link></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              4. How We Use Your Information
            </h2>
            <ul className="text-muted-foreground space-y-2">
              <li>• To provide and maintain our Service</li>
              <li>• To notify you about changes to our Service</li>
              <li>• To provide customer support</li>
              <li>• To gather analysis or valuable information to improve our Service (with consent)</li>
              <li>• To monitor the usage of our Service</li>
              <li>• To detect, prevent and address technical issues</li>
              <li>• To process transactions through our store</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              5. Legal Basis for Processing (GDPR)
            </h2>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Consent:</strong> You have given consent for analytics and marketing cookies</li>
              <li>• <strong>Contract:</strong> Processing is necessary to fulfill our service to you</li>
              <li>• <strong>Legal Obligation:</strong> Processing is necessary for compliance with legal obligations</li>
              <li>• <strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests (security, fraud prevention)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              6. Data Sharing & Data Processing Agreements
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal data. We may share data with:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Service Providers:</strong> Supabase (hosting), Shopify (e-commerce), Google (analytics with consent)</li>
              <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li>• <strong>Business Transfers:</strong> In connection with any merger or acquisition</li>
            </ul>
            
            <h3 className="text-lg text-foreground mt-6">Data Processing Agreements (DPAs)</h3>
            <p className="text-muted-foreground leading-relaxed">
              We have executed Data Processing Agreements (DPAs) with all our sub-processors 
              to ensure GDPR-compliant handling of your personal data. These agreements establish:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• The scope and purpose of data processing</li>
              <li>• Security and confidentiality obligations</li>
              <li>• Data subject rights assistance requirements</li>
              <li>• Sub-processor notification and approval procedures</li>
              <li>• Data breach notification timelines (within 72 hours)</li>
              <li>• Data deletion upon termination of services</li>
            </ul>
            
            <h3 className="text-lg text-foreground mt-6">List of Sub-Processors</h3>
            <div className="border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Provider</th>
                    <th className="text-left p-3 font-medium">Purpose</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">DPA Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-logo-green">Supabase Inc.</td>
                    <td className="p-3 text-muted-foreground">Database & Authentication</td>
                    <td className="p-3 text-muted-foreground">USA (SCCs)</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-logo-green">Shopify Inc.</td>
                    <td className="p-3 text-muted-foreground">E-commerce Platform</td>
                    <td className="p-3 text-muted-foreground">Canada (Adequacy)</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-logo-green">Google LLC</td>
                    <td className="p-3 text-muted-foreground">Analytics (with consent)</td>
                    <td className="p-3 text-muted-foreground">USA (SCCs)</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-logo-green">Resend Inc.</td>
                    <td className="p-3 text-muted-foreground">Transactional Email</td>
                    <td className="p-3 text-muted-foreground">USA (SCCs)</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-logo-green">ElevenLabs Inc.</td>
                    <td className="p-3 text-muted-foreground">Voice AI Services</td>
                    <td className="p-3 text-muted-foreground">USA (SCCs)</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-logo-green">Musikaze S.L.</td>
                    <td className="p-3 text-muted-foreground">Consent Management (MusikazePro)</td>
                    <td className="p-3 text-muted-foreground">Spain (EU)</td>
                    <td className="p-3 text-logo-green">✓ Signed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* MusikazePro Detailed Disclosure */}
            <div className="mt-6 bg-card border border-border p-4 rounded-none">
              <h4 className="text-foreground font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-logo-green" />
                Third Party: MusikazePro Consent Manager
              </h4>
              <p className="text-muted-foreground text-xs mb-3">
                We use MusikazePro to manage cookie consent and GDPR compliance on this website.
              </p>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-foreground font-medium">Data Controller:</p>
                  <p className="text-muted-foreground">MusikazePro (operated by Musikaze S.L.)</p>
                  <p className="text-muted-foreground">Contact: <a href="mailto:privacy@musikazepro.com" className="text-logo-green hover:underline">privacy@musikazepro.com</a></p>
                </div>
                
                <div>
                  <p className="text-foreground font-medium">Data Collected:</p>
                  <ul className="text-muted-foreground list-disc list-inside ml-2">
                    <li>Consent preferences (accept/reject)</li>
                    <li>With your consent: pages viewed, scroll behavior, time on page</li>
                    <li>Device information (browser, operating system)</li>
                    <li>Anonymized IP address (hashed, not stored raw)</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-foreground font-medium">Purpose:</p>
                  <ul className="text-muted-foreground list-disc list-inside ml-2">
                    <li>Comply with GDPR cookie consent requirements</li>
                    <li>Analyze website usage (with your consent)</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-foreground font-medium">Legal Basis:</p>
                  <p className="text-muted-foreground">Your consent (GDPR Article 6(1)(a))</p>
                </div>
                
                <div>
                  <p className="text-foreground font-medium">Data Retention:</p>
                  <ul className="text-muted-foreground list-disc list-inside ml-2">
                    <li>Consent records: 3 years (GDPR requirement)</li>
                    <li>Behavioral data: 13 months</li>
                  </ul>
                </div>
                
                <div>
                  <p className="text-foreground font-medium">Your Rights:</p>
                  <p className="text-muted-foreground">
                    You can withdraw consent at any time by clicking the "Privacy" button on our website. 
                    For other rights (access, deletion, portability), contact{' '}
                    <a href="mailto:privacy@musikazepro.com" className="text-logo-green hover:underline">privacy@musikazepro.com</a>.
                  </p>
                </div>
                
                <p className="text-muted-foreground">
                  More information:{' '}
                  <a href="https://musikazepro.com/privacy" target="_blank" rel="noopener noreferrer" className="text-logo-green hover:underline">
                    https://musikazepro.com/privacy
                  </a>
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs mt-4">
              SCCs = Standard Contractual Clauses approved by the European Commission for international data transfers.
              For a copy of our DPAs or sub-processor agreements, contact our DPO at{' '}
              <a href="mailto:alex.lawton@miramonte.io" className="text-logo-green hover:underline">alex.lawton@miramonte.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              7. Your Rights (GDPR)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Under GDPR, you have the following rights:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Access:</strong> Request copies of your personal data</li>
              <li>• <strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li>• <strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li>• <strong>Restriction:</strong> Request restriction of processing</li>
              <li>• <strong>Portability:</strong> Request transfer of your data to another service</li>
              <li>• <strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li>• <strong>Withdraw Consent:</strong> Withdraw consent at any time via cookie settings</li>
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights:
              </p>
              <GDPRRequestForm />
            </div>
            <p className="text-muted-foreground text-xs mt-4">
              Or contact us directly at{' '}
              <a href="mailto:alex.lawton@miramonte.io" className="text-logo-green hover:underline">
                alex.lawton@miramonte.io
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              8. Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain personal data only as long as necessary for the purposes described in this policy:
            </p>
            <div className="border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Data Type</th>
                    <th className="text-left p-3 font-medium">Retention Period</th>
                    <th className="text-left p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Account Data</td>
                    <td className="p-3 text-muted-foreground">Until account deletion + 30 days</td>
                    <td className="p-3 text-muted-foreground">Deleted</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Community Submissions</td>
                    <td className="p-3 text-muted-foreground">5 years</td>
                    <td className="p-3 text-muted-foreground">Email anonymized, content retained</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Analytics Data</td>
                    <td className="p-3 text-muted-foreground">12 months</td>
                    <td className="p-3 text-muted-foreground">Anonymized</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Consent Records</td>
                    <td className="p-3 text-muted-foreground">7 years</td>
                    <td className="p-3 text-muted-foreground">Retained for legal compliance</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Transaction Data</td>
                    <td className="p-3 text-muted-foreground">7 years</td>
                    <td className="p-3 text-muted-foreground">PII anonymized after period</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground">GDPR Requests</td>
                    <td className="p-3 text-muted-foreground">7 years</td>
                    <td className="p-3 text-muted-foreground">Retained for compliance records</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              9. International Transfers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be transferred to and processed in countries outside the EU/EEA. 
              We ensure appropriate safeguards are in place, including Standard Contractual 
              Clauses approved by the European Commission.
            </p>
          </section>

          {/* CCPA/CPRA Section */}
          <section className="border-2 border-logo-green/30 p-6 rounded-lg bg-logo-green/5">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-logo-green" />
              <h2 className="text-xl uppercase tracking-wider text-foreground">
                California Privacy Rights (CCPA/CPRA)
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you are a California resident, the California Consumer Privacy Act (CCPA) and 
              California Privacy Rights Act (CPRA) provide you with specific rights regarding 
              your personal information.
            </p>

            <h3 className="text-lg text-foreground mt-6 mb-3">Your California Privacy Rights</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Right to Know:</strong> Request disclosure of personal information we collect, use, disclose, and sell</li>
              <li>• <strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li>• <strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
              <li>• <strong>Right to Opt-Out of Sale/Sharing:</strong> Opt-out of the sale or sharing of your personal information</li>
              <li>• <strong>Right to Limit:</strong> Limit the use of sensitive personal information</li>
              <li>• <strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your rights</li>
              <li>• <strong>Right to Portability:</strong> Receive your data in a portable format</li>
            </ul>

            <h3 className="text-lg text-foreground mt-6 mb-3">Categories of Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In the preceding 12 months, we have collected the following categories of personal information:
            </p>
            <div className="border border-border mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Collected</th>
                    <th className="text-left p-3 font-medium">Sold/Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Identifiers (email, username)</td>
                    <td className="p-3 text-logo-green">Yes</td>
                    <td className="p-3 text-muted-foreground">No</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Internet activity (browsing, search)</td>
                    <td className="p-3 text-logo-green">Yes (with consent)</td>
                    <td className="p-3 text-muted-foreground">No</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Geolocation data</td>
                    <td className="p-3 text-muted-foreground">No</td>
                    <td className="p-3 text-muted-foreground">No</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3 text-foreground">Commercial information (purchases)</td>
                    <td className="p-3 text-logo-green">Yes (store users)</td>
                    <td className="p-3 text-muted-foreground">No</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground">Inferences (preferences, behavior)</td>
                    <td className="p-3 text-logo-green">Yes (with consent)</td>
                    <td className="p-3 text-muted-foreground">No</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg text-foreground mt-6 mb-3">Do Not Sell or Share My Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. However, we provide you with the ability 
              to opt-out of any future sale or sharing:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <DoNotSellLink />
            </div>

            <h3 className="text-lg text-foreground mt-6 mb-3">Submit a CCPA Request</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To exercise your California privacy rights, you can submit a verifiable consumer request:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <CCPARequestForm />
            </div>
            <p className="text-muted-foreground text-xs mt-4">
              We will respond to verifiable requests within 45 days. You may also designate an 
              authorized agent to make a request on your behalf.
            </p>

            <h3 className="text-lg text-foreground mt-6 mb-3">Global Privacy Control (GPC)</h3>
            <p className="text-muted-foreground leading-relaxed">
              We honor Global Privacy Control (GPC) signals. If your browser sends a GPC signal, 
              we will automatically treat it as a valid opt-out request for the sale and sharing 
              of your personal information.
            </p>
          </section>

          {/* ePrivacy Section */}
          <section className="border-2 border-blue-500/30 p-6 rounded-lg bg-blue-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl uppercase tracking-wider text-foreground">
                ePrivacy Directive Compliance
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In compliance with the EU ePrivacy Directive (2002/58/EC as amended by 2009/136/EC), 
              we adhere to strict requirements regarding electronic communications and cookies.
            </p>

            <h3 className="text-lg text-foreground mt-6 mb-3">Cookie Consent</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• We obtain prior informed consent before placing non-essential cookies</li>
              <li>• Essential/strictly necessary cookies are placed without consent as permitted</li>
              <li>• You can withdraw consent at any time via our <Link to="/cookies" className="text-logo-green hover:underline">Cookie Settings</Link></li>
              <li>• We provide clear information about each cookie's purpose and duration</li>
            </ul>

            <h3 className="text-lg text-foreground mt-6 mb-3">Electronic Communications</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Marketing emails are only sent with your explicit prior consent</li>
              <li>• Every marketing email includes an unsubscribe link</li>
              <li>• We do not use automated calling systems or unsolicited fax marketing</li>
              <li>• We maintain suppression lists to honor opt-out requests</li>
            </ul>

            <h3 className="text-lg text-foreground mt-6 mb-3">Traffic & Location Data</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>• Traffic data is anonymized after it is no longer needed for transmission</li>
              <li>• We do not process precise location data without explicit consent</li>
              <li>• Any location-based services would require separate opt-in consent</li>
            </ul>

            <h3 className="text-lg text-foreground mt-6 mb-3">Security of Communications</h3>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to ensure the 
              confidentiality and security of electronic communications, including:
            </p>
            <ul className="text-muted-foreground space-y-2 mt-2">
              <li>• TLS/SSL encryption for all data in transit</li>
              <li>• Encryption of data at rest</li>
              <li>• Regular security audits and vulnerability assessments</li>
              <li>• Access controls and authentication mechanisms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              10. Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your 
              personal data, including encryption, access controls, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              11. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not directed to anyone under the age of 16. We do not knowingly 
              collect personal data from children under 16. If we become aware of such collection, 
              we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              12. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              13. Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related inquiries or to exercise your rights:
            </p>
            <div className="bg-card border border-border p-4 rounded-none flex items-center gap-3">
              <Mail className="w-5 h-5 text-logo-green" />
              <a href="mailto:privacy@techno.dog" className="text-logo-green hover:underline">
                privacy@techno.dog
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-xl uppercase tracking-wider text-foreground border-b border-border pb-2">
              14. Supervisory Authority
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to lodge a complaint with a supervisory authority. 
              For Spain, this is the Agencia Española de Protección de Datos (AEPD):
            </p>
            <div className="bg-card border border-border p-4 rounded-none">
              <p className="text-foreground font-medium">Agencia Española de Protección de Datos</p>
              <p className="text-muted-foreground text-xs">
                C/ Jorge Juan, 6<br />
                28001 Madrid, Spain<br />
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-logo-green hover:underline">
                  www.aepd.es
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivacyPolicy;
