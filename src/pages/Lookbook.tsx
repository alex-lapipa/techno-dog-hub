import { Link } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";

// Lifestyle images with product references
const lookbookImages = [
  {
    src: "/src/assets/products/lifestyle-warehouse-tshirt-club.jpg",
    alt: "Warehouse Tee in underground club",
    product: "Warehouse Tee",
    handle: "warehouse",
    setting: "Underground Club",
  },
  {
    src: "/src/assets/products/lifestyle-night-shift-festival.jpg",
    alt: "Night Shift Hoodie at festival",
    product: "Night Shift Hoodie",
    handle: "night-shift",
    setting: "Festival",
  },
  {
    src: "/src/assets/products/lifestyle-closing-set-studio.jpg",
    alt: "Closing Set Longsleeve in DJ studio",
    product: "Closing Set Longsleeve",
    handle: "closing-set",
    setting: "DJ Studio",
  },
  {
    src: "/src/assets/products/lifestyle-crop-top-club.jpg",
    alt: "Rave Crop Top in warehouse",
    product: "Rave Crop Top",
    handle: "rave-crop-top",
    setting: "Warehouse Rave",
  },
  {
    src: "/src/assets/products/lifestyle-bike-shorts-club.jpg",
    alt: "Afterhours Bike Shorts in club",
    product: "Afterhours Bike Shorts",
    handle: "afterhours-bike-shorts",
    setting: "Club",
  },
  {
    src: "/src/assets/products/lifestyle-leggings-club.jpg",
    alt: "Mainroom Leggings with laser lights",
    product: "Mainroom Leggings",
    handle: "mainroom-leggings",
    setting: "Laser Room",
  },
  {
    src: "/src/assets/products/lifestyle-low-profile-rave.jpg",
    alt: "Low Profile Cap at rave",
    product: "Low Profile Cap",
    handle: "low-profile",
    setting: "Rave",
  },
  {
    src: "/src/assets/products/lifestyle-tote-street.jpg",
    alt: "Record Bag on night street",
    product: "Record Bag",
    handle: "record-bag",
    setting: "Night Street",
  },
  {
    src: "/src/assets/products/lifestyle-sports-bra-club.jpg",
    alt: "Peak Hour Sports Bra backstage",
    product: "Peak Hour Sports Bra",
    handle: "peak-hour-sports-bra",
    setting: "Backstage",
  },
  {
    src: "/src/assets/products/lifestyle-womens-tee-rave.jpg",
    alt: "Fitted Tee in warehouse",
    product: "Fitted V-Neck",
    handle: "womens-fitted-v-neck",
    setting: "Warehouse",
  },
  {
    src: "/src/assets/products/lifestyle-warehouse-sessions-club.jpg",
    alt: "Warehouse Sessions Tee with turntables",
    product: "Warehouse Sessions Tee",
    handle: "eulogio-x-techno-dog",
    setting: "DJ Booth",
  },
];

// Import lifestyle images for bundling
import lifestyleWarehouse from "@/assets/products/lifestyle-warehouse-tshirt-club.jpg";
import lifestyleNightShift from "@/assets/products/lifestyle-night-shift-festival.jpg";
import lifestyleClosingSet from "@/assets/products/lifestyle-closing-set-studio.jpg";
import lifestyleCropTop from "@/assets/products/lifestyle-crop-top-club.jpg";
import lifestyleBikeShorts from "@/assets/products/lifestyle-bike-shorts-club.jpg";
import lifestyleLeggings from "@/assets/products/lifestyle-leggings-club.jpg";
import lifestyleLowProfile from "@/assets/products/lifestyle-low-profile-rave.jpg";
import lifestyleTote from "@/assets/products/lifestyle-tote-street.jpg";
import lifestyleSportsBra from "@/assets/products/lifestyle-sports-bra-club.jpg";
import lifestyleWomensTee from "@/assets/products/lifestyle-womens-tee-rave.jpg";
import lifestyleWarehouseSessions from "@/assets/products/lifestyle-warehouse-sessions-club.jpg";

const imageImports = [
  lifestyleWarehouse,
  lifestyleNightShift,
  lifestyleClosingSet,
  lifestyleCropTop,
  lifestyleBikeShorts,
  lifestyleLeggings,
  lifestyleLowProfile,
  lifestyleTote,
  lifestyleSportsBra,
  lifestyleWomensTee,
  lifestyleWarehouseSessions,
];

const Lookbook = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Lookbook | techno.dog"
        description="Visual stories from the warehouse. See techno.dog apparel in its natural habitat - clubs, festivals, and studios."
        path="/store/lookbook"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <Link to="/store" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-3 h-3" />
              Back to Store
            </Link>
            
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-5 h-5 text-logo-green" />
                <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
                  // Lookbook
                </span>
              </div>
              <h1 className="font-mono text-3xl md:text-5xl uppercase tracking-tight">
                From the warehouse floor.
              </h1>
              <p className="font-mono text-sm text-muted-foreground mt-6 max-w-lg leading-relaxed">
                Visual stories captured in clubs, festivals, and studios. Our pieces in their natural habitat.
              </p>
            </div>
          </div>
        </section>

        {/* Magazine Grid */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {/* Masonry-style grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lookbookImages.map((image, index) => (
                <Link
                  key={index}
                  to={`/store/product/${image.handle}`}
                  className={`group relative overflow-hidden bg-muted ${
                    // Create visual interest with varied heights
                    index % 5 === 0 ? "md:row-span-2" : ""
                  } ${
                    index % 7 === 3 ? "lg:col-span-2" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={imageImports[index]}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="font-mono text-[10px] text-logo-green uppercase tracking-widest">
                        {image.setting}
                      </span>
                      <h3 className="font-mono text-lg uppercase tracking-tight text-white mt-1">
                        {image.product}
                      </h3>
                      <span className="font-mono text-xs text-white/60 mt-2 inline-block">
                        View Product →
                      </span>
                    </div>
                  </div>

                  {/* VHS scan line effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 text-center">
            <p className="font-mono text-xs text-muted-foreground mb-6">
              Ready to join the movement?
            </p>
            <Link to="/store">
              <Button 
                variant="outline" 
                className="font-mono text-xs uppercase tracking-wider"
              >
                Shop the Collection
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Lookbook;
