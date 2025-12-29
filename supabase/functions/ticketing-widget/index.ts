import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    .tt-ticket-name {
      font-weight: 600;
      font-size: 15px;
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
      this.step = 'select'; // select, checkout, success
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
        
        if (!response.ok) throw new Error('Event not found');
        
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
            <h2>\${this.escapeHtml(this.event.title)}</h2>
            <p>\${this.formatDate(this.event.start_date)}</p>
          </div>
          <div class="tt-body">
            \${this.tickets.map(ticket => \`
              <div class="tt-ticket-type">
                <div>
                  <div class="tt-ticket-name">\${this.escapeHtml(ticket.name)}</div>
                  <div class="tt-ticket-avail">\${ticket.quantity_total - ticket.quantity_sold} remaining</div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div class="tt-ticket-price">\${this.formatPrice(ticket.price, ticket.currency)}</div>
                  <div class="tt-qty-control">
                    <button class="tt-qty-btn" data-action="decrease" data-id="\${ticket.id}" 
                      \${this.quantities[ticket.id] === 0 ? 'disabled' : ''}>−</button>
                    <span class="tt-qty-value">\${this.quantities[ticket.id]}</span>
                    <button class="tt-qty-btn" data-action="increase" data-id="\${ticket.id}"
                      \${this.quantities[ticket.id] >= (ticket.quantity_total - ticket.quantity_sold) ? 'disabled' : ''}>+</button>
                  </div>
                </div>
              </div>
            \`).join('')}
            
            <div class="tt-total">
              <span class="tt-total-label">Total</span>
              <span class="tt-total-value">\${this.formatPrice(total, this.tickets[0]?.currency || 'EUR')}</span>
            </div>
            
            <button class="tt-checkout-btn" \${!hasSelection ? 'disabled' : ''}>
              Proceed to Checkout
            </button>
          </div>
          <div class="tt-powered">
            Powered by <a href="https://techno.dog" target="_blank">Techno.Dog</a>
          </div>
        </div>
      \`;
      
      this.bindEvents(container);
    }
    
    renderCheckoutForm(container) {
      container.innerHTML = \`
        <div class="tt-widget">
          <div class="tt-header">
            <h2>Checkout</h2>
            <p>\${this.escapeHtml(this.event.title)}</p>
          </div>
          <div class="tt-body">
            <button class="tt-back-btn">← Back to Tickets</button>
            
            <div class="tt-form active">
              <div class="tt-form-row">
                <div class="tt-form-group">
                  <label>First Name *</label>
                  <input type="text" id="tt-first-name" required />
                </div>
                <div class="tt-form-group">
                  <label>Last Name *</label>
                  <input type="text" id="tt-last-name" required />
                </div>
              </div>
              <div class="tt-form-group">
                <label>Email *</label>
                <input type="email" id="tt-email" required />
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
          
          if (action === 'increase' && this.quantities[id] < (ticket.quantity_total - ticket.quantity_sold)) {
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
        
        if (!firstName || !lastName || !email) {
          alert('Please fill in all required fields');
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
              orgSlug: this.config.orgSlug,
              eventSlug: this.config.eventSlug,
              buyer: { firstName, lastName, email },
              items
            })
          });
          
          if (!response.ok) throw new Error('Order failed');
          
          this.step = 'success';
          this.render();
        } catch (error) {
          console.error('Order error:', error);
          alert('Failed to create order. Please try again.');
          btn.disabled = false;
          btn.textContent = 'Complete Order';
        }
      });
    }
    
    calculateTotal() {
      return this.tickets.reduce((sum, ticket) => {
        return sum + (ticket.price * (this.quantities[ticket.id] || 0));
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

  const url = new URL(req.url);
  
  // Serve the widget script
  if (req.method === 'GET' && url.searchParams.get('action') === 'script') {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
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
    const orgSlug = url.searchParams.get('orgSlug');
    const eventSlug = url.searchParams.get('eventSlug');
    
    if (!orgSlug || !eventSlug) {
      return new Response(
        JSON.stringify({ error: 'Missing orgSlug or eventSlug' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mock data for demo - in production this would query the database
    const mockEvent = {
      id: 'evt_001',
      title: eventSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published'
    };

    const mockTicketTypes = [
      {
        id: 'tt_early',
        name: 'Early Bird',
        price: 35,
        currency: 'EUR',
        quantity_total: 100,
        quantity_sold: 67
      },
      {
        id: 'tt_ga',
        name: 'General Admission',
        price: 50,
        currency: 'EUR',
        quantity_total: 500,
        quantity_sold: 123
      },
      {
        id: 'tt_vip',
        name: 'VIP Access',
        price: 120,
        currency: 'EUR',
        quantity_total: 50,
        quantity_sold: 12
      }
    ];

    return new Response(
      JSON.stringify({ event: mockEvent, ticketTypes: mockTicketTypes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Handle order creation
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      
      if (body.action === 'create-order') {
        // Mock order creation - in production this would:
        // 1. Validate ticket availability
        // 2. Create order in database
        // 3. Generate tickets with QR codes
        // 4. Send confirmation email
        
        console.log('Creating order:', body);
        
        const orderId = 'ord_' + Math.random().toString(36).substring(2, 10);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            orderId,
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
