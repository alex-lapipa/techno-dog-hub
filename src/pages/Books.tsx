import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ExternalLink, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  description: string;
  whyRead: string;
  purchaseUrl: string;
  year?: number;
}

const books: Book[] = [
  // Detroit Techno & Origins
  {
    id: "techno-rebels",
    title: "Techno Rebels: The Renegades of Electronic Funk",
    author: "Dan Sicko",
    category: "Detroit Techno & Origins",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388287986i/592805.jpg",
    description: "The definitive history of Detroit techno, demystifying the genre's origins and its Belleville Three founders—Juan Atkins, Derrick May, and Kevin Saunderson. Traces the city's 1980s party scene and the influence of The Electrifying Mojo and Ken Collier.",
    whyRead: "Essential foundation. If you read one book about techno, this is it. Sicko was there from the beginning and tells the story with respect and precision.",
    purchaseUrl: "https://wsupress.wayne.edu/9780814334386/",
    year: 2010
  },
  {
    id: "assembling-black-counter-culture",
    title: "Assembling a Black Counter Culture",
    author: "DeForrest Brown Jr.",
    category: "Detroit Techno & Origins",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1604356277i/55686790.jpg",
    description: "A critical history that repositions techno as a unique form of Black musical production rooted in Detroit's industrialized labor systems. Features deep analysis of Underground Resistance, Drexciya, Jeff Mills, and Robert Hood through a Black theoretical perspective.",
    whyRead: "Reclaims the narrative. Brown connects the dots between assembly lines and 808s, making a compelling case to 'make techno Black again.' Required reading for understanding techno's political roots.",
    purchaseUrl: "https://www.amazon.com/Assembling-Black-Counter-Culture-DeForrest/dp/1734489731",
    year: 2022
  },
  {
    id: "electrochoc",
    title: "Electrochoc",
    author: "Laurent Garnier with David Brun-Lambert",
    category: "Detroit Techno & Origins",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347755892i/845413.jpg",
    description: "A memoir providing crucial firsthand accounts of the Detroit-Europe connection and the influence of Detroit artists on the global underground scene. From The Haçienda to Wake Up!",
    whyRead: "Garnier lived it. He was DJ-ing at The Haçienda, connected Detroit and Paris, and built F Communications. This is history told by someone who made it happen.",
    purchaseUrl: "https://www.amazon.com/Electrochoc-Laurent-Garnier/dp/1905428227",
    year: 2005
  },

  // UK Free Party & Rave Culture
  {
    id: "darker-electricity",
    title: "A Darker Electricity: The Origins of the Spiral Tribe Sound System",
    author: "Mark Harrison",
    category: "UK Free Party & Rave Culture",
    coverUrl: "https://velocitypress.uk/wp-content/uploads/2022/05/DarkerElectricity.jpg",
    description: "An insider account from Spiral Tribe's co-founder charting their nomadic journey from London squats to the infamous 1992 Castlemorton Festival and their subsequent legal battle against the British government.",
    whyRead: "Written by the 'criminal ringleader' himself. This is the definitive inside story of the sound system that sparked the Criminal Justice Act and the European teknival exodus.",
    purchaseUrl: "https://velocitypress.uk/product/a-darker-electricity/",
    year: 2022
  },
  {
    id: "dreaming-in-yellow",
    title: "Dreaming in Yellow: The Story of the DiY Sound System",
    author: "Harry Harrison",
    category: "UK Free Party & Rave Culture",
    coverUrl: "https://velocitypress.uk/wp-content/uploads/2021/03/DiY-Cover.jpg",
    description: "The history of one of Britain's most influential free party collectives, bridging the gap between the 1990 summer of love and the outlaw rave scene. Nottingham's answer to the commercial club world.",
    whyRead: "DiY were the blueprint for collective action in UK rave culture. Their story is one of community, resistance, and pure hedonism.",
    purchaseUrl: "https://velocitypress.uk/product/dreaming-in-yellow/",
    year: 2021
  },
  {
    id: "altered-state",
    title: "Altered State: The Story of Ecstasy Culture and Acid House",
    author: "Matthew Collin",
    category: "UK Free Party & Rave Culture",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328867899i/389703.jpg",
    description: "A comprehensive look at the social and political impact of electronic music culture in the UK, from the Second Summer of Love through the Criminal Justice Act and beyond.",
    whyRead: "The most thorough cultural analysis of how ecstasy and acid house transformed British society. Collin connects the music to politics, law, and social change.",
    purchaseUrl: "https://www.amazon.com/Altered-State-Story-Ecstasy-Culture/dp/1846687136",
    year: 2009
  },
  {
    id: "energy-flash",
    title: "Energy Flash: A Journey Through Rave Music and Dance Culture",
    author: "Simon Reynolds",
    category: "UK Free Party & Rave Culture",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1312051064i/204808.jpg",
    description: "A comprehensive global survey covering the evolution from acid house through jungle, hardcore, and darkcore. Reynolds traces the music's journey from warehouses to global phenomenon.",
    whyRead: "Reynolds is the most articulate music critic of his generation. This is dance music history written with intellectual rigor and genuine passion.",
    purchaseUrl: "https://www.amazon.com/Energy-Flash-Journey-Through-Culture/dp/1593764782",
    year: 2012
  },
  {
    id: "join-the-future",
    title: "Join The Future: Bleep Techno and the Birth of British Bass Music",
    author: "Matt Anniss",
    category: "UK Free Party & Rave Culture",
    coverUrl: "https://velocitypress.uk/wp-content/uploads/2019/06/JoinTheFuture-Cover.jpg",
    description: "Focuses on the unique British breakbeat and bleep techno sound that fueled the northern rave scene. The story of Warp Records, LFO, and the Sheffield sound.",
    whyRead: "Finally, proper documentation of the UK's unique contribution to electronic music. This explains how Yorkshire basslines led to dubstep, grime, and beyond.",
    purchaseUrl: "https://velocitypress.uk/product/join-the-future-book/",
    year: 2019
  },

  // Berlin & European Underground
  {
    id: "der-klang-der-familie",
    title: "Der Klang der Familie: Berlin, Techno and the Fall of the Wall",
    author: "Felix Denk & Sven von Thülen",
    category: "Berlin & European Underground",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1430663285i/25489721.jpg",
    description: "An oral history detailing how the reunification of Berlin and abandoned spaces in the East gave birth to legendary clubs like Tresor and Ufo. Told through the voices of those who were there.",
    whyRead: "The Wall fell and techno filled the void. This oral history captures the chaos, freedom, and creative explosion that made Berlin the techno capital of the world.",
    purchaseUrl: "https://www.amazon.com/Klang-Familie-Berlin-Techno-Fall/dp/3518465449",
    year: 2014
  },
  {
    id: "underground-is-massive",
    title: "The Underground Is Massive: How Electronic Dance Music Conquered America",
    author: "Michaelangelo Matos",
    category: "Berlin & European Underground",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1405538432i/22609382.jpg",
    description: "A detailed history of how electronic dance music evolved from underground warehouses to a global phenomenon, tracing the American rave scene from its origins.",
    whyRead: "Matos documents the American underground with obsessive detail. Essential for understanding how rave culture crossed the Atlantic and mutated.",
    purchaseUrl: "https://www.amazon.com/Underground-Massive-Electronic-Dance-Conquered/dp/0062271792",
    year: 2015
  },

  // Synthesizers & Gear
  {
    id: "analog-days",
    title: "Analog Days: The Invention and Impact of the Moog Synthesizer",
    author: "Trevor Pinch & Frank Trocco",
    category: "Synthesizers & Gear",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388334936i/224671.jpg",
    description: "A definitive social history of Bob Moog's development of synthesizers through the 1960s and 70s, including insights into Buchla and ARP. How machines became musical.",
    whyRead: "This is where it all started. Pinch and Trocco tell the story of how Bob Moog's curiosity created an entire industry and changed music forever.",
    purchaseUrl: "https://www.amazon.com/Analog-Days-Invention-Impact-Synthesizer/dp/0674016173",
    year: 2004
  },
  {
    id: "patch-and-tweak",
    title: "Patch & Tweak: Exploring Modular Synthesis",
    author: "Kim Bjørn & Chris Meyer",
    category: "Synthesizers & Gear",
    coverUrl: "https://bjooks.com/cdn/shop/products/Patch_Tweak_Book_frontcover_1800x1800.jpg",
    description: "A beautifully illustrated, comprehensive guide to modular synthesis covering both technical functions and creative musical application. Features interviews with artists and designers.",
    whyRead: "The most gorgeous and accessible entry point into modular synthesis. Part technical manual, part art book, part philosophy of sound.",
    purchaseUrl: "https://bjooks.com/products/patch-tweak-exploring-modular-synthesis",
    year: 2018
  },
  {
    id: "push-turn-move",
    title: "Push Turn Move: Interface Design in Electronic Music",
    author: "Kim Bjørn",
    category: "Synthesizers & Gear",
    coverUrl: "https://bjooks.com/cdn/shop/products/Push_Turn_Move_cover3D_1800x1800.jpg",
    description: "A celebrated exploration of the interface and design of electronic music instruments, from modular synths to DAWs. How the tools we use shape the music we make.",
    whyRead: "Beautiful coffee-table book that reveals how interface design shapes creativity. You will never look at a knob the same way again.",
    purchaseUrl: "https://bjooks.com/products/push-turn-move",
    year: 2017
  },
  {
    id: "prophet-from-silicon-valley",
    title: "The Prophet From Silicon Valley: The Complete Story of Sequential Circuits",
    author: "David Abernethy",
    category: "Synthesizers & Gear",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522869696i/39569686.jpg",
    description: "The complete story of Dave Smith and Sequential Circuits, detailing the journey from software sequencers to the legendary Prophet-5 and the invention of MIDI.",
    whyRead: "Dave Smith invented MIDI and the Prophet-5. This is the story of a true innovator who shaped electronic music at the hardware level.",
    purchaseUrl: "https://www.amazon.com/Prophet-Silicon-Valley-Sequential-Circuits/dp/0974936030",
    year: 2015
  },

  // Live Coding & SuperCollider
  {
    id: "live-coding-users-manual",
    title: "Live Coding: A User's Manual",
    author: "Blackwell, Cocker, Cox, McLean, Magnusson",
    category: "Live Coding & SuperCollider",
    coverUrl: "https://mitpress.mit.edu/wp-content/uploads/2022/10/Live-Coding.jpeg",
    description: "The definitive cultural and technical manual for the live coding movement. Explores the philosophy of 'thinking in public,' the history of TOPLAP, and the DIY/punk ethos of Algoraves.",
    whyRead: "Code as performance. This MIT Press volume legitimizes live coding as art while maintaining its punk spirit. Essential for anyone interested in algorithmic music.",
    purchaseUrl: "https://mitpress.mit.edu/9780262544818/live-coding/",
    year: 2022
  },
  {
    id: "supercollider-book",
    title: "The SuperCollider Book",
    author: "Wilson, Cottle & Collins (eds.)",
    category: "Live Coding & SuperCollider",
    coverUrl: "https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262232692.jpg",
    description: "The essential reference for SuperCollider, covering everything from basic synthesis to advanced algorithmic composition and machine learning integration.",
    whyRead: "SuperCollider is the foundation of modern live coding. This book unlocks its power, from simple patches to complex algorithmic systems.",
    purchaseUrl: "https://mitpress.mit.edu/9780262232692/the-supercollider-book/",
    year: 2011
  },
  {
    id: "sonic-writing",
    title: "Sonic Writing: Technologies of Material, Symbolic, and Signal Inscriptions",
    author: "Thor Magnusson",
    category: "Live Coding & SuperCollider",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1562852166i/50215915.jpg",
    description: "A deep dive into how software and hardware define musical creativity. Explores the intersection of instrument design, notation, and digital technology.",
    whyRead: "Magnusson is a key figure in live coding culture. This book theorizes how digital instruments shape musical thought.",
    purchaseUrl: "https://www.bloomsbury.com/us/sonic-writing-9781501313851/",
    year: 2019
  },
  {
    id: "speaking-code",
    title: "Speaking Code: Coding as Aesthetic and Political Expression",
    author: "Geoff Cox & Alex McLean",
    category: "Live Coding & SuperCollider",
    coverUrl: "https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262018364.jpg",
    description: "Explores the intersection of code, language, and political activism. How programming becomes a form of expression beyond mere functionality.",
    whyRead: "Code is never neutral. Cox and McLean reveal the politics embedded in every algorithm and the radical potential of creative coding.",
    purchaseUrl: "https://mitpress.mit.edu/9780262018364/speaking-code/",
    year: 2013
  },

  // Sound Art & Philosophy
  {
    id: "audio-culture",
    title: "Audio Culture: Readings in Modern Music",
    author: "Christoph Cox & Daniel Warner (eds.)",
    category: "Sound Art & Philosophy",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387752219i/356839.jpg",
    description: "A foundational collection of essays covering the history and theory of electronic music from futurism to experimental techno. The essential reader for sonic theory.",
    whyRead: "The definitive anthology. From Russolo to Eno to Kodwo Eshun, this collection maps the intellectual history of electronic sound.",
    purchaseUrl: "https://www.amazon.com/Audio-Culture-Revised-Readings-Modern/dp/1501318365",
    year: 2017
  },
  {
    id: "ocean-of-sound",
    title: "Ocean of Sound: Aether Talk, Ambient Sound and Imaginary Worlds",
    author: "David Toop",
    category: "Sound Art & Philosophy",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189608i/304284.jpg",
    description: "A poetic exploration of ambient culture, connecting Fourth World music, dub, and techno. Toop traces the history of immersive sonic environments.",
    whyRead: "Toop writes about sound like no one else. This is a meditation on listening itself, wandering through ambient, dub, and electronic worlds.",
    purchaseUrl: "https://www.amazon.com/Ocean-Sound-Ambient-Imaginary-Worlds/dp/1852427434",
    year: 2001
  },
  {
    id: "microsound",
    title: "Microsound",
    author: "Curtis Roads",
    category: "Sound Art & Philosophy",
    coverUrl: "https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262681544.jpg",
    description: "The definitive technical and aesthetic guide to granular synthesis and the philosophy of 'the sound molecule.' Where physics meets art at the micro level.",
    whyRead: "Roads literally wrote the book on granular synthesis. If you want to understand sound at its most fundamental level, start here.",
    purchaseUrl: "https://mitpress.mit.edu/9780262681544/microsound/",
    year: 2004
  },
  {
    id: "listening-noise-silence",
    title: "Listening to Noise and Silence: Towards a Philosophy of Sound Art",
    author: "Salomé Voegelin",
    category: "Sound Art & Philosophy",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347989098i/9386892.jpg",
    description: "Explores the phenomenology of listening and the political/aesthetic implications of sound art. A philosophical framework for understanding sonic experience.",
    whyRead: "Voegelin makes you reconsider what it means to listen. This is philosophy through the ear, challenging visual dominance in art theory.",
    purchaseUrl: "https://www.amazon.com/Listening-Noise-Silence-Towards-Philosophy/dp/1441162070",
    year: 2010
  },
  {
    id: "cracked-media",
    title: "Cracked Media: The Sound of Malfunction",
    author: "Caleb Kelly",
    category: "Sound Art & Philosophy",
    coverUrl: "https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262513531.jpg",
    description: "Analyzes the aesthetics of failure, glitch, and industrial 'malfunction' as creative tools. How broken machines became instruments.",
    whyRead: "Glitch is not a bug, it is a feature. Kelly's book is the definitive text on how artists have embraced technological failure as creative material.",
    purchaseUrl: "https://mitpress.mit.edu/9780262513531/cracked-media/",
    year: 2009
  }
];

const categories = [
  "Detroit Techno & Origins",
  "UK Free Party & Rave Culture",
  "Berlin & European Underground",
  "Synthesizers & Gear",
  "Live Coding & SuperCollider",
  "Sound Art & Philosophy"
];

const Books = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Essential Techno Culture Books",
    "description": "Curated reading list covering Detroit techno, UK rave culture, synthesizers, live coding, and sound art philosophy.",
    "url": "https://techno.dog/books"
  };

  return (
    <PageLayout
      title="Books – Essential Reading"
      description="Curated underground techno culture reading list. Detroit origins, UK free party movement, synthesizer history, live coding, and sound art philosophy."
      path="/books"
      structuredData={structuredData}
    >
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* VHS Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-crimson animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-mono uppercase tracking-wider text-foreground">
              Books
            </h1>
          </div>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Essential reading for the underground. No commercial EDM guides, no mainstream histories. 
            These are the texts that document the culture, the movements, the machines, and the philosophy.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-crimson">
            <BookOpen className="w-3 h-3" />
            <span>{books.length} titles curated</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryBooks = books.filter(b => b.category === category);
            const isExpanded = expandedCategories.has(category);

            return (
              <section key={category} className="border border-border bg-card/30">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-logo-green" />
                    <h2 className="text-lg font-mono uppercase tracking-wider text-foreground">
                      {category}
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground">
                      ({categoryBooks.length})
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {/* Books Grid */}
                {isExpanded && (
                  <div className="p-4 pt-0 grid gap-6">
                    {categoryBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-16 border-t border-border pt-8">
          <p className="font-mono text-xs text-muted-foreground text-center max-w-xl mx-auto">
            This list is curated to align with techno.dog's mission: culture, movements, gear, and art. 
            No affiliate links. Support your local bookshop when possible.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <article className="group flex flex-col md:flex-row gap-6 p-4 border border-border/50 bg-background/50 hover:border-logo-green/30 transition-colors">
      {/* Cover Image - VHS Style */}
      <div className="relative shrink-0 w-full md:w-32 lg:w-40">
        <div className="relative aspect-[2/3] overflow-hidden border border-border">
          {/* VHS Scanlines Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]" />
          {/* VHS Color Aberration Effect */}
          <div className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-5 bg-gradient-to-r from-crimson via-transparent to-cyan-500" />
          
          <img
            src={book.coverUrl}
            alt={`${book.title} cover`}
            className="w-full h-full object-cover grayscale-[30%] contrast-110 group-hover:grayscale-0 transition-all duration-500"
            loading="lazy"
          />
          
          {/* VHS Corner Badge */}
          {book.year && (
            <div className="absolute bottom-0 right-0 bg-crimson text-white text-[9px] font-mono px-1.5 py-0.5">
              {book.year}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Title & Author */}
        <div className="mb-3">
          <h3 className="text-base font-mono text-foreground group-hover:text-logo-green transition-colors leading-tight">
            {book.title}
          </h3>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            by {book.author}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
          {book.description}
        </p>

        {/* Why Read - Highlighted */}
        <div className="mb-4 p-3 border-l-2 border-logo-green bg-logo-green/5">
          <p className="text-xs font-mono text-foreground leading-relaxed">
            <span className="text-logo-green uppercase tracking-wider">Why read:</span>{" "}
            {book.whyRead}
          </p>
        </div>

        {/* Purchase Link - VHS Button */}
        <a
          href={book.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 self-start",
            "px-4 py-2 border border-crimson/50 bg-crimson/10",
            "font-mono text-[10px] uppercase tracking-widest text-crimson",
            "hover:bg-crimson/20 hover:border-crimson hover:shadow-[0_0_12px_hsl(var(--crimson)/0.4)]",
            "transition-all duration-300"
          )}
        >
          <ExternalLink className="w-3 h-3" />
          Find This Book
        </a>
      </div>
    </article>
  );
};

export default Books;
