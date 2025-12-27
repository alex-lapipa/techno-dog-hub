import { Link } from "react-router-dom";
import { ArrowLeft, Package, RefreshCcw, Truck, Building } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const StoreInfo = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Store Info | techno.dog"
        description="Shipping, returns, and production information for techno.dog store."
        path="/store/info"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        {/* Breadcrumb */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <Link 
              to="/store" 
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Store
            </Link>
          </div>
        </section>

        {/* Header */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
              // Info
            </span>
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight mt-4">
              Store Information
            </h1>
          </div>
        </section>

        {/* Shipping */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-2xl">
              <div className="flex items-start gap-4 mb-6">
                <Truck className="w-5 h-5 text-logo-green shrink-0 mt-1" />
                <div>
                  <h2 className="font-mono text-lg uppercase tracking-wider mb-4">
                    Shipping
                  </h2>
                  <div className="space-y-4 font-mono text-sm text-muted-foreground">
                    <p>
                      All orders are shipped worldwide from production facilities in Europe and the United States, depending on your location.
                    </p>
                    <div className="border-l-2 border-border pl-4">
                      <p className="text-foreground mb-2">Estimated delivery times:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Europe: 5-10 business days</li>
                        <li>• United States: 5-12 business days</li>
                        <li>• Rest of World: 10-20 business days</li>
                      </ul>
                    </div>
                    <p className="text-xs">
                      Delivery times are estimates. Actual times may vary depending on your location and customs processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Returns */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-2xl">
              <div className="flex items-start gap-4 mb-6">
                <RefreshCcw className="w-5 h-5 text-logo-green shrink-0 mt-1" />
                <div>
                  <h2 className="font-mono text-lg uppercase tracking-wider mb-4">
                    Returns & Exchanges
                  </h2>
                  <div className="space-y-4 font-mono text-sm text-muted-foreground">
                    <p>
                      We accept returns and exchanges within 30 days of delivery for items that are unused and in their original condition.
                    </p>
                    <div className="border-l-2 border-border pl-4">
                      <p className="text-foreground mb-2">Return process:</p>
                      <ul className="space-y-1 text-xs">
                        <li>1. Contact us with your order number</li>
                        <li>2. Receive return shipping instructions</li>
                        <li>3. Ship item back in original condition</li>
                        <li>4. Refund processed within 5-7 business days</li>
                      </ul>
                    </div>
                    <p className="text-xs">
                      Note: Print-on-demand items with manufacturing defects will be replaced at no cost. For size exchanges, a new order may be required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Production */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-2xl">
              <div className="flex items-start gap-4 mb-6">
                <Package className="w-5 h-5 text-logo-green shrink-0 mt-1" />
                <div>
                  <h2 className="font-mono text-lg uppercase tracking-wider mb-4">
                    Production
                  </h2>
                  <div className="space-y-4 font-mono text-sm text-muted-foreground">
                    <p>
                      All products are printed on demand. This means each item is produced only after you place your order.
                    </p>
                    <div className="border-l-2 border-logo-green/30 pl-4 bg-logo-green/5 py-3 pr-3">
                      <p className="text-foreground mb-2">Why print-on-demand?</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Zero waste production</li>
                        <li>• No excess inventory</li>
                        <li>• Sustainable approach</li>
                        <li>• Each piece made for you</li>
                      </ul>
                    </div>
                    <p className="text-xs">
                      Production typically takes 2-5 business days before shipping.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="max-w-2xl">
              <div className="flex items-start gap-4 mb-6">
                <Building className="w-5 h-5 text-logo-green shrink-0 mt-1" />
                <div>
                  <h2 className="font-mono text-lg uppercase tracking-wider mb-4">
                    Legal Information
                  </h2>
                  <div className="space-y-4 font-mono text-sm text-muted-foreground">
                    <p>
                      The techno.dog store is operated by:
                    </p>
                    <div className="border border-border p-4 bg-card">
                      <p className="text-foreground mb-1">Miramonte Somío SL</p>
                      <p className="text-xs">CIF: B67299438</p>
                      <p className="text-xs mt-2">Commercial name: Project La PIPA</p>
                      <p className="text-xs">
                        <a 
                          href="https://lapipa.io" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-logo-green hover:underline"
                        >
                          lapipa.io
                        </a>
                      </p>
                    </div>
                    <p className="text-xs">
                      For any inquiries, please contact us through the main techno.dog website.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StoreInfo;
