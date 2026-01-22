// Unified Resend email client with consistent error handling and templates
// Phase 1: Integration Consolidation

import { createLogger, Logger } from './logger.ts';

const RESEND_API_BASE = 'https://api.resend.com';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface ResendClientOptions {
  fromAddress?: string;
  logger?: Logger;
}

// Get Resend API key
export function getResendApiKey(): string {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!apiKey) {
    throw new Error('Resend API key not configured (RESEND_API_KEY)');
  }
  
  return apiKey;
}

export class ResendClient {
  private apiKey: string;
  private logger: Logger;
  private defaultFrom: string;

  constructor(options: ResendClientOptions = {}) {
    this.apiKey = getResendApiKey();
    this.logger = options.logger || createLogger('resend-client');
    this.defaultFrom = options.fromAddress || 'techno.dog <doggy@techno.dog>';
  }

  // Send an email
  async send(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, text, from, replyTo, cc, bcc, tags } = options;
    
    this.logger.info('Sending email', { 
      to: Array.isArray(to) ? to.length : 1, 
      subject: subject.substring(0, 50) 
    });

    try {
      const body: Record<string, unknown> = {
        from: from || this.defaultFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
      };

      if (html) body.html = html;
      if (text) body.text = text;
      if (replyTo) body.reply_to = replyTo;
      if (cc?.length) body.cc = cc;
      if (bcc?.length) body.bcc = bcc;
      if (tags?.length) body.tags = tags;

      const response = await fetch(`${RESEND_API_BASE}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Email send failed: ${response.status}`;
        this.logger.error('Email send failed', { status: response.status, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const data = await response.json();
      this.logger.info('Email sent successfully', { id: data.id });
      
      return { success: true, id: data.id };
    } catch (error) {
      const errorMsg = (error as Error).message;
      this.logger.error('Email send error', { error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }

  // Send using a template
  async sendTemplate(
    to: string | string[],
    templateId: string,
    data: Record<string, unknown>,
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResult> {
    this.logger.info('Sending template email', { to, templateId });

    try {
      const body: Record<string, unknown> = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(to) ? to : [to],
        template_id: templateId,
        data,
      };

      if (options.replyTo) body.reply_to = options.replyTo;
      if (options.tags?.length) body.tags = options.tags;

      const response = await fetch(`${RESEND_API_BASE}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Template email send failed: ${response.status}`;
        this.logger.error('Template email send failed', { status: response.status, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const responseData = await response.json();
      this.logger.info('Template email sent successfully', { id: responseData.id });
      
      return { success: true, id: responseData.id };
    } catch (error) {
      const errorMsg = (error as Error).message;
      this.logger.error('Template email send error', { error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }
}

// Factory function for quick access
export function createResendClient(options?: ResendClientOptions): ResendClient {
  return new ResendClient(options);
}

// Pre-built email templates for common use cases
export const EmailTemplates = {
  // Generate unsubscribe link
  generateUnsubscribeUrl(profileId: string, baseUrl: string): string {
    // Simple token generation - in production use signed tokens
    const token = btoa(`${profileId}:${Date.now()}`);
    return `${baseUrl}/functions/v1/email-unsubscribe?id=${profileId}&token=${token}`;
  },

  // Welcome email template
  welcomeEmail(userName: string, features: string[]): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 32px; }
            h1 { color: #fff; font-size: 24px; margin: 16px 0; }
            p { color: #a0a0a0; line-height: 1.6; }
            .features { background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 24px 0; }
            .feature { padding: 8px 0; border-bottom: 1px solid #333; }
            .feature:last-child { border-bottom: none; }
            .cta { display: inline-block; background: #22c55e; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 24px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🐕</div>
              <h1>Welcome to techno.dog, ${userName}!</h1>
            </div>
            <p>You've just joined the global techno knowledge hub. Here's what you can explore:</p>
            <div class="features">
              ${features.map(f => `<div class="feature">✓ ${f}</div>`).join('')}
            </div>
            <p style="text-align: center;">
              <a href="https://techno.dog" class="cta">Explore the Archive</a>
            </p>
            <div class="footer">
              <p>techno.dog - Global Techno Knowledge Hub</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Notification email template
  notificationEmail(title: string, message: string, ctaText?: string, ctaUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .logo { text-align: center; font-size: 24px; margin-bottom: 24px; }
            h1 { color: #fff; font-size: 20px; margin: 0 0 16px; }
            p { color: #a0a0a0; line-height: 1.6; margin: 0 0 24px; }
            .cta { display: inline-block; background: #22c55e; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🐕 techno.dog</div>
            <h1>${title}</h1>
            <p>${message}</p>
            ${ctaText && ctaUrl ? `<p><a href="${ctaUrl}" class="cta">${ctaText}</a></p>` : ''}
            <div class="footer">
              <p>techno.dog - Global Techno Knowledge Hub</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },
};
