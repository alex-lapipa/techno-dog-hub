import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Input validation helpers
const validateSlug = (slug: string): boolean => {
  return /^[a-z0-9-]{2,100}$/.test(slug);
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
};

const validateName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 100;
};

const sanitizeString = (str: string): string => {
  return str.trim().slice(0, 500);
};

// Widget JavaScript that gets injected into external sites
const generateWidgetScript = (supabaseUrl: string, supabaseAnonKey: string) => `
(function() {
  'use strict';
  
  // Prevent multiple loads
  if (window.TechnoTickets) return;
  
  const SUPABASE_URL = '${supabaseUrl}';
  const SUPABASE_ANON_KEY = '${supabaseAnonKey}';
  const API_BASE = SUPABASE_URL + '/functions/v1';
  
  // Styles for the widget
  const styles = \`
    .tt-widget {
      font-family: 'Space Grotesk', system-ui, sans-serif;
      max-width: 480px;
      margin: 0 auto;
      background: #0a0a0a;
      border: 1px solid #27272a;
      border-radius: 8px;
      overflow: hidden;
      color: #fafafa;
    }
    .tt-header {
      background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
      padding: 20px;
      border-bottom: 1px solid #3f3f46;
    }
    .tt-header h2 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 700;
      color: #fafafa;
    }
    .tt-header p {
      margin: 0;
      font-size: 13px;
      color: #a1a1aa;
    }
    .tt-venue {
      margin-top: 8px;
      font-size: 12px;
      color: #71717a;
    }
    .tt-body {
      padding: 20px;
    }
    .tt-ticket-type {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 6px;
      transition: border-color 0.2s;
    }
    .tt-ticket-type:hover {
      border-color: #dc2626;
    }
    .tt-ticket-type.sold-out {
      opacity: 0.5;
      pointer-events: none;
    }
    .tt-ticket-name {
      font-weight: 600;
      font-size: 15px;
    }
    .tt-ticket-desc {
      font-size: 12px;
      color: #71717a;
      margin-top: 4px;
    }
    .tt-ticket-price {
      color: #22c55e;
      font-weight: 700;
      font-size: 18px;
    }
    .tt-ticket-avail {
      font-size: 11px;
      color: #71717a;
      margin-top: 4px;
    }
    .tt-ticket-avail.low {
      color: #f59e0b;
    }
    .tt-ticket-avail.sold-out {
      color: #ef4444;
    }
    .tt-qty-control {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tt-qty-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #3f3f46;
      background: #27272a;
      color: #fafafa;
      border-radius: 4px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tt-qty-btn:hover {
      background: #dc2626;
      border-color: #dc2626;
    }
    .tt-qty-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .tt-qty-btn:disabled:hover {
      background: #27272a;
      border-color: #3f3f46;
    }
    .tt-qty-value {
      min-width: 24px;
      text-align: center;
      font-weight: 600;
    }
    .tt-checkout-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tt-checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
    }
    .tt-checkout-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .tt-total {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      margin-bottom: 16px;
      border-top: 1px solid #27272a;
      font-size: 18px;
    }
    .tt-total-label {
      color: #a1a1aa;
    }
    .tt-total-value {
      font-weight: 700;
      color: #22c55e;
    }
    .tt-loading {
      text-align: center;
      padding: 40px;
      color: #71717a;
    }
    .tt-loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #27272a;
      border-top-color: #dc2626;
      border-radius: 50%;
      animation: tt-spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    @keyframes tt-spin {
      to { transform: rotate(360deg); }
    }
    .tt-error {
      text-align: center;
      padding: 32px;
      color: #ef4444;
    }
    .tt-powered {
      text-align: center;
      padding: 12px;
      font-size: 11px;
      color: #52525b;
      background: #0a0a0a;
      border-top: 1px solid #27272a;
    }
    .tt-powered a {
      color: #dc2626;
      text-decoration: none;
    }
    .tt-form {
      display: none;
    }
    .tt-form.active {
      display: block;
    }
    .tt-form-group {
      margin-bottom: 16px;
    }
    .tt-form-group label {
      display: block;
      font-size: 13px;
      color: #a1a1aa;
      margin-bottom: 6px;
    }
    .tt-form-group input {
      width: 100%;
      padding: 12px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 6px;
      color: #fafafa;
      font-size: 14px;
      box-sizing: border-box;
    }
    .tt-form-group input:focus {
      outline: none;
      border-color: #dc2626;
    }
    .tt-form-group input.error {
      border-color: #ef4444;
    }
    .tt-form-error {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }
    .tt-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .tt-back-btn {
      background: transparent;
      border: 1px solid #3f3f46;
      color: #a1a1aa;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .tt-back-btn:hover {
      border-color: #71717a;
      color: #fafafa;
    }
    .tt-success {
      text-align: center;
      padding: 40px 20px;
    }
    .tt-success-icon {
      width: 64px;
      height: 64px;
      background: #22c55e;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .tt-success h3 {
      margin: 0 0 8px;
      font-size: 24px;
    }
    .tt-success p {
      color: #a1a1aa;
      margin: 0;
    }
    .tt-order-number {
      font-family: monospace;
      background: #18181b;
      padding: 8px 16px;
      border-radius: 4px;
      margin-top: 16px;
      display: inline-block;
    }
    .tt-summary {
      background: #18181b;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .tt-summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px solid #27272a;
    }
    .tt-summary-item:last-child {
      border-bottom: none;
    }
  \`;
  
  class TechnoTickets {
    constructor(config) {
      this.config = {
        orgSlug: config.orgSlug || '',
        eventSlug: config.eventSlug || '',
        containerId: config.containerId || 'techno-tickets',
        primaryColor: config.primaryColor || '#dc2626',
        ...config
      };
      this.tickets = [];
      this.quantities = {};
      this.event = null;
      this.step = 'select';
      this.orderNumber = null;
      this.init();
    }
    
    async init() {
      this.injectStyles();
      this.render();
      await this.loadEvent();
    }
    
    injectStyles() {
      if (!document.getElementById('tt-styles')) {
        const style = document.createElement('style');
        style.id = 'tt-styles';
        style.textContent = styles.replace(/#dc2626/g, this.config.primaryColor);
        document.head.appendChild(style);
      }
    }
    
    async loadEvent() {
      try {
        const response = await fetch(API_BASE + '/ticketing-widget?action=get-event&orgSlug=' + 
          encodeURIComponent(this.config.orgSlug) + '&eventSlug=' + 
          encodeURIComponent(this.config.eventSlug), {
          headers: { 'apikey': SUPABASE_ANON_KEY }
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Event not found');
        }
        
        const data = await response.json();
        this.event = data.event;
        this.tickets = data.ticketTypes || [];
        this.tickets.forEach(t => this.quantities[t.id] = 0);
        this.render();
      } catch (error) {
        console.error('TechnoTickets Error:', error);
        this.renderError(error.message);
      }
    }
    
    getContainer() {
      return document.getElementById(this.config.containerId);
    }
    
    render() {
      const container = this.getContainer();
      if (!container) return;
      
      if (this.step === 'select') {
        this.renderTicketSelection(container);
      } else if (this.step === 'checkout') {
        this.renderCheckoutForm(container);
      } else if (this.step === 'success') {
        this.renderSuccess(container);
      }
    }
    
    renderTicketSelection(container) {
      if (!this.event) {
        container.innerHTML = \`
          <div class="tt-widget">
            <div class="tt-loading">
              <div class="tt-loading-spinner"></div>
              <div>Loading tickets...</div>
            </div>
          </div>
        \`;
        return;
      }
      
      const total = this.calculateTotal();
      const hasSelection = Object.values(this.quantities).some(q => q > 0);
      
      container.innerHTML = \`
        <div class="tt-widget">
          <div class="tt-header">
            <h2>\${this.escapeHtml(this.event.name)}</h2>
            <p>\${this.formatDate(this.event.start_date)}</p>
            \${this.event.venue_name ? \`<div class="tt-venue">📍 \${this.escapeHtml(this.event.venue_name)}</div>\` : ''}
          </div>
          <div class="tt-body">
            \${this.tickets.length === 0 ? '<p style="color:#71717a;text-align:center;">No tickets available</p>' : ''}
            \${this.tickets.map(ticket => {
              const available = ticket.quantity_total - ticket.quantity_sold;
              const isSoldOut = available <= 0;
              const isLow = available > 0 && available <= 10;
              const maxQty = Math.min(available, ticket.max_per_order || 10);
              
              return \`
                <div class="tt-ticket-type \${isSoldOut ? 'sold-out' : ''}">
                  <div>
                    <div class="tt-ticket-name">\${this.escapeHtml(ticket.name)}</div>
                    \${ticket.description ? \`<div class="tt-ticket-desc">\${this.escapeHtml(ticket.description)}</div>\` : ''}
                    <div class="tt-ticket-avail \${isSoldOut ? 'sold-out' : isLow ? 'low' : ''}">
                      \${isSoldOut ? 'Sold Out' : available + ' remaining'}
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="tt-ticket-price">\${this.formatPrice(ticket.price_cents / 100, ticket.currency)}</div>
                    \${!isSoldOut ? \`
                      <div class="tt-qty-control">
                        <button class="tt-qty-btn" data-action="decrease" data-id="\${ticket.id}" 
                          \${this.quantities[ticket.id] === 0 ? 'disabled' : ''}>−</button>
                        <span class="tt-qty-value">\${this.quantities[ticket.id]}</span>
                        <button class="tt-qty-btn" data-action="increase" data-id="\${ticket.id}"
                          \${this.quantities[ticket.id] >= maxQty ? 'disabled' : ''}>+</button>
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`;
            }).join('')}
            
            \${this.tickets.length > 0 ? \`
              <div class="tt-total">
                <span class="tt-total-label">Total</span>
                <span class="tt-total-value">\${this.formatPrice(total, this.tickets[0]?.currency || 'EUR')}</span>
              </div>
              
              <button class="tt-checkout-btn" \${!hasSelection ? 'disabled' : ''}>
                Proceed to Checkout
              </button>
            \` : ''}
          </div>
          <div class="tt-powered">
            Powered by <a href="https://techno.dog" target="_blank">Techno.Dog</a>
          </div>
        </div>
      \`;
      
      this.bindEvents(container);
    }
    
    renderCheckoutForm(container) {
      const selectedTickets = this.tickets.filter(t => this.quantities[t.id] > 0);
      
      container.innerHTML = \`
        <div class="tt-widget">
          <div class="tt-header">
            <h2>Checkout</h2>
            <p>\${this.escapeHtml(this.event.name)}</p>
          </div>
          <div class="tt-body">
            <button class="tt-back-btn">← Back to Tickets</button>
            
            <div class="tt-summary">
              \${selectedTickets.map(t => \`
                <div class="tt-summary-item">
                  <span>\${this.quantities[t.id]}x \${this.escapeHtml(t.name)}</span>
                  <span>\${this.formatPrice((t.price_cents / 100) * this.quantities[t.id], t.currency)}</span>
                </div>
              \`).join('')}
            </div>
            
            <div class="tt-form active">
              <div class="tt-form-row">
                <div class="tt-form-group">
                  <label>First Name *</label>
                  <input type="text" id="tt-first-name" maxlength="100" required />
                </div>
                <div class="tt-form-group">
                  <label>Last Name *</label>
                  <input type="text" id="tt-last-name" maxlength="100" required />
                </div>
              </div>
              <div class="tt-form-group">
                <label>Email *</label>
                <input type="email" id="tt-email" maxlength="255" required />
              </div>
              <div class="tt-form-group">
                <label>Phone (optional)</label>
                <input type="tel" id="tt-phone" maxlength="20" />
              </div>
              
              <div class="tt-total">
                <span class="tt-total-label">Total</span>
                <span class="tt-total-value">\${this.formatPrice(this.calculateTotal(), this.tickets[0]?.currency || 'EUR')}</span>
              </div>
              
              <button class="tt-checkout-btn" id="tt-submit-order">
                Complete Order
              </button>
            </div>
          </div>
          <div class="tt-powered">
            Powered by <a href="https://techno.dog" target="_blank">Techno.Dog</a>
          </div>
        </div>
      \`;
      
      this.bindCheckoutEvents(container);
    }
    
    renderSuccess(container) {
      container.innerHTML = \`
        <div class="tt-widget">
          <div class="tt-success">
            <div class="tt-success-icon">✓</div>
            <h3>Order Confirmed!</h3>
            <p>Check your email for tickets and confirmation.</p>
            \${this.orderNumber ? \`<div class="tt-order-number">\${this.escapeHtml(this.orderNumber)}</div>\` : ''}
          </div>
          <div class="tt-powered">
            Powered by <a href="https://techno.dog" target="_blank">Techno.Dog</a>
          </div>
        </div>
      \`;
    }
    
    renderError(message) {
      const container = this.getContainer();
      if (!container) return;
      
      container.innerHTML = \`
        <div class="tt-widget">
          <div class="tt-error">
            <p>⚠️ \${this.escapeHtml(message)}</p>
          </div>
        </div>
      \`;
    }
    
    bindEvents(container) {
      container.querySelectorAll('.tt-qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          const id = e.target.dataset.id;
          const ticket = this.tickets.find(t => t.id === id);
          const available = ticket.quantity_total - ticket.quantity_sold;
          const maxQty = Math.min(available, ticket.max_per_order || 10);
          
          if (action === 'increase' && this.quantities[id] < maxQty) {
            this.quantities[id]++;
          } else if (action === 'decrease' && this.quantities[id] > 0) {
            this.quantities[id]--;
          }
          
          this.render();
        });
      });
      
      container.querySelector('.tt-checkout-btn')?.addEventListener('click', () => {
        if (Object.values(this.quantities).some(q => q > 0)) {
          this.step = 'checkout';
          this.render();
        }
      });
    }
    
    bindCheckoutEvents(container) {
      container.querySelector('.tt-back-btn')?.addEventListener('click', () => {
        this.step = 'select';
        this.render();
      });
      
      container.querySelector('#tt-submit-order')?.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const firstName = container.querySelector('#tt-first-name').value.trim();
        const lastName = container.querySelector('#tt-last-name').value.trim();
        const email = container.querySelector('#tt-email').value.trim();
        const phone = container.querySelector('#tt-phone').value.trim();
        
        // Validation
        let hasError = false;
        
        if (!firstName || firstName.length < 1) {
          container.querySelector('#tt-first-name').classList.add('error');
          hasError = true;
        } else {
          container.querySelector('#tt-first-name').classList.remove('error');
        }
        
        if (!lastName || lastName.length < 1) {
          container.querySelector('#tt-last-name').classList.add('error');
          hasError = true;
        } else {
          container.querySelector('#tt-last-name').classList.remove('error');
        }
        
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          container.querySelector('#tt-email').classList.add('error');
          hasError = true;
        } else {
          container.querySelector('#tt-email').classList.remove('error');
        }
        
        if (hasError) {
          return;
        }
        
        const btn = container.querySelector('#tt-submit-order');
        btn.disabled = true;
        btn.textContent = 'Processing...';
        
        try {
          const items = Object.entries(this.quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
          
          const response = await fetch(API_BASE + '/ticketing-widget', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              action: 'create-order',
              eventId: this.event.id,
              customer: { 
                firstName, 
                lastName, 
                email,
                phone: phone || null
              },
              items
            })
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Order failed');
          }
          
          this.orderNumber = result.orderNumber;
          this.step = 'success';
          this.render();
        } catch (error) {
          console.error('Order error:', error);
          alert(error.message || 'Failed to create order. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Complete Order';
        }
      });
    }
    
    calculateTotal() {
      return this.tickets.reduce((sum, ticket) => {
        return sum + ((ticket.price_cents / 100) * (this.quantities[ticket.id] || 0));
      }, 0);
    }
    
    formatPrice(amount, currency) {
      return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: currency || 'EUR'
      }).format(amount);
    }
    
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  }
  
  window.TechnoTickets = TechnoTickets;
  
  // Auto-initialize any existing containers with data attributes
  document.querySelectorAll('[data-techno-tickets]').forEach(el => {
    new TechnoTickets({
      containerId: el.id,
      orgSlug: el.dataset.orgSlug,
      eventSlug: el.dataset.eventSlug,
      primaryColor: el.dataset.primaryColor
    });
  });
})();
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  
  // Serve the widget script
  if (req.method === 'GET' && url.searchParams.get('action') === 'script') {
    const script = generateWidgetScript(supabaseUrl, supabaseAnonKey);
    
    return new Response(script, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  // Get event data
  if (req.method === 'GET' && url.searchParams.get('action') === 'get-event') {
    const orgSlug = url.searchParams.get('orgSlug') || '';
    const eventSlug = url.searchParams.get('eventSlug') || '';
    
    // Validate inputs
    if (!validateSlug(orgSlug) || !validateSlug(eventSlug)) {
      return new Response(
        JSON.stringify({ error: 'Invalid organization or event slug' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching event: org=${orgSlug}, event=${eventSlug}`);

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from('tkt_organizations')
      .select('id, name, slug')
      .eq('slug', orgSlug)
      .single();

    if (orgError || !org) {
      console.error('Organization not found:', orgError);
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get event (only published)
    const { data: event, error: eventError } = await supabase
      .from('tkt_events')
      .select('id, name, description, venue_name, venue_address, image_url, start_date, end_date, doors_open, status')
      .eq('organization_id', org.id)
      .eq('slug', eventSlug)
      .eq('status', 'published')
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return new Response(
        JSON.stringify({ error: 'Event not found or not published' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active ticket types
    const { data: ticketTypes, error: ticketsError } = await supabase
      .from('tkt_ticket_types')
      .select('id, name, description, price_cents, currency, quantity_total, quantity_sold, max_per_order, sale_start, sale_end')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      return new Response(
        JSON.stringify({ error: 'Failed to load tickets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter by sale dates
    const now = new Date();
    const availableTickets = (ticketTypes || []).filter(t => {
      const saleStart = t.sale_start ? new Date(t.sale_start) : null;
      const saleEnd = t.sale_end ? new Date(t.sale_end) : null;
      
      if (saleStart && now < saleStart) return false;
      if (saleEnd && now > saleEnd) return false;
      return true;
    });

    return new Response(
      JSON.stringify({ 
        event, 
        ticketTypes: availableTickets,
        organization: { name: org.name }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Handle order creation
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      
      if (body.action === 'create-order') {
        const { eventId, customer, items } = body;
        
        // Validate customer data
        if (!customer || typeof customer !== 'object') {
          return new Response(
            JSON.stringify({ error: 'Invalid customer data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const firstName = sanitizeString(customer.firstName || '');
        const lastName = sanitizeString(customer.lastName || '');
        const email = sanitizeString(customer.email || '').toLowerCase();
        const phone = customer.phone ? sanitizeString(customer.phone) : null;
        
        if (!validateName(firstName) || !validateName(lastName)) {
          return new Response(
            JSON.stringify({ error: 'Invalid name provided' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (!validateEmail(email)) {
          return new Response(
            JSON.stringify({ error: 'Invalid email address' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No tickets selected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate event exists and is published
        const { data: event, error: eventError } = await supabase
          .from('tkt_events')
          .select('id, status')
          .eq('id', eventId)
          .eq('status', 'published')
          .single();
          
        if (eventError || !event) {
          return new Response(
            JSON.stringify({ error: 'Event not available' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate tickets and calculate total
        let totalCents = 0;
        const orderItems: Array<{
          ticket_type_id: string;
          quantity: number;
          unit_price_cents: number;
          subtotal_cents: number;
        }> = [];
        
        for (const item of items) {
          const { ticketTypeId, quantity } = item;
          
          if (!ticketTypeId || typeof quantity !== 'number' || quantity < 1 || quantity > 50) {
            return new Response(
              JSON.stringify({ error: 'Invalid ticket selection' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // Get ticket type and check availability
          const { data: ticket, error: ticketError } = await supabase
            .from('tkt_ticket_types')
            .select('id, price_cents, quantity_total, quantity_sold, max_per_order, is_active')
            .eq('id', ticketTypeId)
            .eq('event_id', eventId)
            .eq('is_active', true)
            .single();
            
          if (ticketError || !ticket) {
            return new Response(
              JSON.stringify({ error: 'Ticket type not available' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const available = ticket.quantity_total - ticket.quantity_sold;
          const maxPerOrder = ticket.max_per_order || 10;
          
          if (quantity > available) {
            return new Response(
              JSON.stringify({ error: `Only ${available} tickets remaining` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (quantity > maxPerOrder) {
            return new Response(
              JSON.stringify({ error: `Maximum ${maxPerOrder} tickets per order` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const subtotal = ticket.price_cents * quantity;
          totalCents += subtotal;
          
          orderItems.push({
            ticket_type_id: ticketTypeId,
            quantity,
            unit_price_cents: ticket.price_cents,
            subtotal_cents: subtotal
          });
        }
        
        console.log(`Creating order: ${email}, total: ${totalCents}, items: ${orderItems.length}`);
        
        // Create order
        const { data: order, error: orderError } = await supabase
          .from('tkt_orders')
          .insert({
            event_id: eventId,
            customer_email: email,
            customer_name: `${firstName} ${lastName}`,
            customer_phone: phone,
            total_cents: totalCents,
            currency: 'EUR',
            status: 'confirmed' // Auto-confirm for now (no payment integration)
          })
          .select('id, order_number')
          .single();
          
        if (orderError || !order) {
          console.error('Order creation failed:', orderError);
          return new Response(
            JSON.stringify({ error: 'Failed to create order' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Create order items
        const itemsToInsert = orderItems.map(item => ({
          order_id: order.id,
          ticket_type_id: item.ticket_type_id,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          subtotal_cents: item.subtotal_cents
        }));
        
        const { error: itemsError } = await supabase
          .from('tkt_order_items')
          .insert(itemsToInsert);
          
        if (itemsError) {
          console.error('Order items creation failed:', itemsError);
          // Rollback order
          await supabase.from('tkt_orders').delete().eq('id', order.id);
          return new Response(
            JSON.stringify({ error: 'Failed to create order' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Order created successfully: ${order.order_number}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            orderId: order.id,
            orderNumber: order.order_number,
            message: 'Order created successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Unknown action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
};

serve(handler);
