-- =====================================================
-- BOOKS MODULE: Complete Database Schema
-- Self-contained module for techno.dog book curation
-- =====================================================

-- Book categories for organization
CREATE TABLE public.book_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Main books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category_id UUID REFERENCES public.book_categories(id) ON DELETE SET NULL,
  cover_url TEXT,
  description TEXT,
  why_read TEXT,
  purchase_url TEXT,
  year_published INTEGER,
  isbn TEXT,
  publisher TEXT,
  pages INTEGER,
  language TEXT DEFAULT 'en',
  
  -- Curation metadata
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  discovery_source TEXT,
  curator_notes TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(author, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED
);

-- Book tags for flexible categorization
CREATE TABLE public.book_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, tag)
);

-- Book recommendations/related books
CREATE TABLE public.book_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  related_book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'related' CHECK (relation_type IN ('related', 'sequel', 'companion', 'prerequisite')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, related_book_id),
  CHECK (book_id != related_book_id)
);

-- Librarian agent run history
CREATE TABLE public.librarian_agent_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type TEXT NOT NULL CHECK (run_type IN ('discovery', 'validation', 'enrichment', 'analytics', 'cleanup')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  stats JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  books_processed INTEGER DEFAULT 0,
  books_discovered INTEGER DEFAULT 0,
  books_updated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Book discovery queue (for AI-suggested books pending review)
CREATE TABLE public.book_discovery_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  suggested_category TEXT,
  discovery_source TEXT,
  discovery_reason TEXT,
  confidence_score NUMERIC(3,2),
  raw_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  merged_book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Book analytics events
CREATE TABLE public.book_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'search_appear', 'share')),
  session_id TEXT,
  referrer TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_books_category ON public.books(category_id);
CREATE INDEX idx_books_status ON public.books(status);
CREATE INDEX idx_books_featured ON public.books(is_featured) WHERE is_featured = true;
CREATE INDEX idx_books_search ON public.books USING GIN(search_vector);
CREATE INDEX idx_book_tags_book ON public.book_tags(book_id);
CREATE INDEX idx_book_tags_tag ON public.book_tags(tag);
CREATE INDEX idx_book_analytics_book ON public.book_analytics(book_id);
CREATE INDEX idx_book_analytics_created ON public.book_analytics(created_at);
CREATE INDEX idx_book_discovery_status ON public.book_discovery_queue(status);
CREATE INDEX idx_librarian_runs_type ON public.librarian_agent_runs(run_type);

-- Enable RLS
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.librarian_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_discovery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_analytics ENABLE ROW LEVEL SECURITY;

-- Public read policies for categories and published books
CREATE POLICY "Public can view book categories"
  ON public.book_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can view published books"
  ON public.books FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can view book tags"
  ON public.book_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.books WHERE books.id = book_tags.book_id AND books.status = 'published'));

CREATE POLICY "Public can view book relations"
  ON public.book_relations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.books WHERE books.id = book_relations.book_id AND books.status = 'published'));

-- Admin policies for full access
CREATE POLICY "Admins can manage book categories"
  ON public.book_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all books"
  ON public.books FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage book tags"
  ON public.book_tags FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage book relations"
  ON public.book_relations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view librarian runs"
  ON public.librarian_agent_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage librarian runs"
  ON public.librarian_agent_runs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view discovery queue"
  ON public.book_discovery_queue FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage discovery queue"
  ON public.book_discovery_queue FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Analytics insert for anyone"
  ON public.book_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON public.book_analytics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_categories_updated_at
  BEFORE UPDATE ON public.book_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories
INSERT INTO public.book_categories (name, slug, description, display_order, icon) VALUES
  ('Detroit Techno & Origins', 'detroit-origins', 'The birthplace of techno: Belleville Three, Underground Resistance, and Motor City history', 1, '🏭'),
  ('UK Free Party & Rave Culture', 'uk-rave', 'Spiral Tribe, Criminal Justice Act, acid house, and the British underground', 2, '🎪'),
  ('Berlin & European Underground', 'berlin-europe', 'Tresor, reunification era, and continental techno movements', 3, '🏛️'),
  ('Synthesizers & Gear', 'synths-gear', 'Moog, modular synthesis, instrument design, and music technology', 4, '🎛️'),
  ('Live Coding & SuperCollider', 'live-coding', 'Algorithmic music, TOPLAP, Algorave, and creative coding', 5, '💻'),
  ('Sound Art & Philosophy', 'sound-philosophy', 'Sonic theory, noise culture, ambient, and the philosophy of listening', 6, '🔊');

-- Insert initial books with category references
INSERT INTO public.books (title, author, category_id, cover_url, description, why_read, purchase_url, year_published, status, published_at) VALUES
  -- Detroit Techno & Origins
  ('Techno Rebels: The Renegades of Electronic Funk', 'Dan Sicko', (SELECT id FROM book_categories WHERE slug = 'detroit-origins'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388287986i/592805.jpg', 'The definitive history of Detroit techno, demystifying the genre''s origins and its Belleville Three founders—Juan Atkins, Derrick May, and Kevin Saunderson. Traces the city''s 1980s party scene and the influence of The Electrifying Mojo and Ken Collier.', 'Essential foundation. If you read one book about techno, this is it. Sicko was there from the beginning and tells the story with respect and precision.', 'https://wsupress.wayne.edu/9780814334386/', 2010, 'published', now()),
  
  ('Assembling a Black Counter Culture', 'DeForrest Brown Jr.', (SELECT id FROM book_categories WHERE slug = 'detroit-origins'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1604356277i/55686790.jpg', 'A critical history that repositions techno as a unique form of Black musical production rooted in Detroit''s industrialized labor systems. Features deep analysis of Underground Resistance, Drexciya, Jeff Mills, and Robert Hood through a Black theoretical perspective.', 'Reclaims the narrative. Brown connects the dots between assembly lines and 808s, making a compelling case to ''make techno Black again.'' Required reading for understanding techno''s political roots.', 'https://www.amazon.com/Assembling-Black-Counter-Culture-DeForrest/dp/1734489731', 2022, 'published', now()),
  
  ('Electrochoc', 'Laurent Garnier with David Brun-Lambert', (SELECT id FROM book_categories WHERE slug = 'detroit-origins'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347755892i/845413.jpg', 'A memoir providing crucial firsthand accounts of the Detroit-Europe connection and the influence of Detroit artists on the global underground scene. From The Haçienda to Wake Up!', 'Garnier lived it. He was DJ-ing at The Haçienda, connected Detroit and Paris, and built F Communications. This is history told by someone who made it happen.', 'https://www.amazon.com/Electrochoc-Laurent-Garnier/dp/1905428227', 2005, 'published', now()),

  -- UK Free Party & Rave Culture
  ('A Darker Electricity: The Origins of the Spiral Tribe Sound System', 'Mark Harrison', (SELECT id FROM book_categories WHERE slug = 'uk-rave'), 'https://velocitypress.uk/wp-content/uploads/2022/05/DarkerElectricity.jpg', 'An insider account from Spiral Tribe''s co-founder charting their nomadic journey from London squats to the infamous 1992 Castlemorton Festival and their subsequent legal battle against the British government.', 'Written by the ''criminal ringleader'' himself. This is the definitive inside story of the sound system that sparked the Criminal Justice Act and the European teknival exodus.', 'https://velocitypress.uk/product/a-darker-electricity/', 2022, 'published', now()),
  
  ('Dreaming in Yellow: The Story of the DiY Sound System', 'Harry Harrison', (SELECT id FROM book_categories WHERE slug = 'uk-rave'), 'https://velocitypress.uk/wp-content/uploads/2021/03/DiY-Cover.jpg', 'The history of one of Britain''s most influential free party collectives, bridging the gap between the 1990 summer of love and the outlaw rave scene. Nottingham''s answer to the commercial club world.', 'DiY were the blueprint for collective action in UK rave culture. Their story is one of community, resistance, and pure hedonism.', 'https://velocitypress.uk/product/dreaming-in-yellow/', 2021, 'published', now()),
  
  ('Altered State: The Story of Ecstasy Culture and Acid House', 'Matthew Collin', (SELECT id FROM book_categories WHERE slug = 'uk-rave'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328867899i/389703.jpg', 'A comprehensive look at the social and political impact of electronic music culture in the UK, from the Second Summer of Love through the Criminal Justice Act and beyond.', 'The most thorough cultural analysis of how ecstasy and acid house transformed British society. Collin connects the music to politics, law, and social change.', 'https://www.amazon.com/Altered-State-Story-Ecstasy-Culture/dp/1846687136', 2009, 'published', now()),
  
  ('Energy Flash: A Journey Through Rave Music and Dance Culture', 'Simon Reynolds', (SELECT id FROM book_categories WHERE slug = 'uk-rave'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1312051064i/204808.jpg', 'A comprehensive global survey covering the evolution from acid house through jungle, hardcore, and darkcore. Reynolds traces the music''s journey from warehouses to global phenomenon.', 'Reynolds is the most articulate music critic of his generation. This is dance music history written with intellectual rigor and genuine passion.', 'https://www.amazon.com/Energy-Flash-Journey-Through-Culture/dp/1593764782', 2012, 'published', now()),
  
  ('Join The Future: Bleep Techno and the Birth of British Bass Music', 'Matt Anniss', (SELECT id FROM book_categories WHERE slug = 'uk-rave'), 'https://velocitypress.uk/wp-content/uploads/2019/06/JoinTheFuture-Cover.jpg', 'Focuses on the unique British breakbeat and bleep techno sound that fueled the northern rave scene. The story of Warp Records, LFO, and the Sheffield sound.', 'Finally, proper documentation of the UK''s unique contribution to electronic music. This explains how Yorkshire basslines led to dubstep, grime, and beyond.', 'https://velocitypress.uk/product/join-the-future-book/', 2019, 'published', now()),

  -- Berlin & European Underground
  ('Der Klang der Familie: Berlin, Techno and the Fall of the Wall', 'Felix Denk & Sven von Thülen', (SELECT id FROM book_categories WHERE slug = 'berlin-europe'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1430663285i/25489721.jpg', 'An oral history detailing how the reunification of Berlin and abandoned spaces in the East gave birth to legendary clubs like Tresor and Ufo. Told through the voices of those who were there.', 'The Wall fell and techno filled the void. This oral history captures the chaos, freedom, and creative explosion that made Berlin the techno capital of the world.', 'https://www.amazon.com/Klang-Familie-Berlin-Techno-Fall/dp/3518465449', 2014, 'published', now()),
  
  ('The Underground Is Massive: How Electronic Dance Music Conquered America', 'Michaelangelo Matos', (SELECT id FROM book_categories WHERE slug = 'berlin-europe'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1405538432i/22609382.jpg', 'A detailed history of how electronic dance music evolved from underground warehouses to a global phenomenon, tracing the American rave scene from its origins.', 'Matos documents the American underground with obsessive detail. Essential for understanding how rave culture crossed the Atlantic and mutated.', 'https://www.amazon.com/Underground-Massive-Electronic-Dance-Conquered/dp/0062271792', 2015, 'published', now()),

  -- Synthesizers & Gear
  ('Analog Days: The Invention and Impact of the Moog Synthesizer', 'Trevor Pinch & Frank Trocco', (SELECT id FROM book_categories WHERE slug = 'synths-gear'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388334936i/224671.jpg', 'A definitive social history of Bob Moog''s development of synthesizers through the 1960s and 70s, including insights into Buchla and ARP. How machines became musical.', 'This is where it all started. Pinch and Trocco tell the story of how Bob Moog''s curiosity created an entire industry and changed music forever.', 'https://www.amazon.com/Analog-Days-Invention-Impact-Synthesizer/dp/0674016173', 2004, 'published', now()),
  
  ('Patch & Tweak: Exploring Modular Synthesis', 'Kim Bjørn & Chris Meyer', (SELECT id FROM book_categories WHERE slug = 'synths-gear'), 'https://bjooks.com/cdn/shop/products/Patch_Tweak_Book_frontcover_1800x1800.jpg', 'A beautifully illustrated, comprehensive guide to modular synthesis covering both technical functions and creative musical application. Features interviews with artists and designers.', 'The most gorgeous and accessible entry point into modular synthesis. Part technical manual, part art book, part philosophy of sound.', 'https://bjooks.com/products/patch-tweak-exploring-modular-synthesis', 2018, 'published', now()),
  
  ('Push Turn Move: Interface Design in Electronic Music', 'Kim Bjørn', (SELECT id FROM book_categories WHERE slug = 'synths-gear'), 'https://bjooks.com/cdn/shop/products/Push_Turn_Move_cover3D_1800x1800.jpg', 'A celebrated exploration of the interface and design of electronic music instruments, from modular synths to DAWs. How the tools we use shape the music we make.', 'Beautiful coffee-table book that reveals how interface design shapes creativity. You will never look at a knob the same way again.', 'https://bjooks.com/products/push-turn-move', 2017, 'published', now()),
  
  ('The Prophet From Silicon Valley: The Complete Story of Sequential Circuits', 'David Abernethy', (SELECT id FROM book_categories WHERE slug = 'synths-gear'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1522869696i/39569686.jpg', 'The complete story of Dave Smith and Sequential Circuits, detailing the journey from software sequencers to the legendary Prophet-5 and the invention of MIDI.', 'Dave Smith invented MIDI and the Prophet-5. This is the story of a true innovator who shaped electronic music at the hardware level.', 'https://www.amazon.com/Prophet-Silicon-Valley-Sequential-Circuits/dp/0974936030', 2015, 'published', now()),

  -- Live Coding & SuperCollider
  ('Live Coding: A User''s Manual', 'Blackwell, Cocker, Cox, McLean, Magnusson', (SELECT id FROM book_categories WHERE slug = 'live-coding'), 'https://mitpress.mit.edu/wp-content/uploads/2022/10/Live-Coding.jpeg', 'The definitive cultural and technical manual for the live coding movement. Explores the philosophy of ''thinking in public,'' the history of TOPLAP, and the DIY/punk ethos of Algoraves.', 'Code as performance. This MIT Press volume legitimizes live coding as art while maintaining its punk spirit. Essential for anyone interested in algorithmic music.', 'https://mitpress.mit.edu/9780262544818/live-coding/', 2022, 'published', now()),
  
  ('The SuperCollider Book', 'Wilson, Cottle & Collins (eds.)', (SELECT id FROM book_categories WHERE slug = 'live-coding'), 'https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262232692.jpg', 'The essential reference for SuperCollider, covering everything from basic synthesis to advanced algorithmic composition and machine learning integration.', 'SuperCollider is the foundation of modern live coding. This book unlocks its power, from simple patches to complex algorithmic systems.', 'https://mitpress.mit.edu/9780262232692/the-supercollider-book/', 2011, 'published', now()),
  
  ('Sonic Writing: Technologies of Material, Symbolic, and Signal Inscriptions', 'Thor Magnusson', (SELECT id FROM book_categories WHERE slug = 'live-coding'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1562852166i/50215915.jpg', 'A deep dive into how software and hardware define musical creativity. Explores the intersection of instrument design, notation, and digital technology.', 'Magnusson is a key figure in live coding culture. This book theorizes how digital instruments shape musical thought.', 'https://www.bloomsbury.com/us/sonic-writing-9781501313851/', 2019, 'published', now()),
  
  ('Speaking Code: Coding as Aesthetic and Political Expression', 'Geoff Cox & Alex McLean', (SELECT id FROM book_categories WHERE slug = 'live-coding'), 'https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262018364.jpg', 'Explores the intersection of code, language, and political activism. How programming becomes a form of expression beyond mere functionality.', 'Code is never neutral. Cox and McLean reveal the politics embedded in every algorithm and the radical potential of creative coding.', 'https://mitpress.mit.edu/9780262018364/speaking-code/', 2013, 'published', now()),

  -- Sound Art & Philosophy
  ('Audio Culture: Readings in Modern Music', 'Christoph Cox & Daniel Warner (eds.)', (SELECT id FROM book_categories WHERE slug = 'sound-philosophy'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387752219i/356839.jpg', 'A foundational collection of essays covering the history and theory of electronic music from futurism to experimental techno. The essential reader for sonic theory.', 'The definitive anthology. From Russolo to Eno to Kodwo Eshun, this collection maps the intellectual history of electronic sound.', 'https://www.amazon.com/Audio-Culture-Revised-Readings-Modern/dp/1501318365', 2017, 'published', now()),
  
  ('Ocean of Sound: Aether Talk, Ambient Sound and Imaginary Worlds', 'David Toop', (SELECT id FROM book_categories WHERE slug = 'sound-philosophy'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388189608i/304284.jpg', 'A poetic exploration of ambient culture, connecting Fourth World music, dub, and techno. Toop traces the history of immersive sonic environments.', 'Toop writes about sound like no one else. This is a meditation on listening itself, wandering through ambient, dub, and electronic worlds.', 'https://www.amazon.com/Ocean-Sound-Ambient-Imaginary-Worlds/dp/1852427434', 2001, 'published', now()),
  
  ('Microsound', 'Curtis Roads', (SELECT id FROM book_categories WHERE slug = 'sound-philosophy'), 'https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262681544.jpg', 'The definitive technical and aesthetic guide to granular synthesis and the philosophy of ''the sound molecule.'' Where physics meets art at the micro level.', 'Roads literally wrote the book on granular synthesis. If you want to understand sound at its most fundamental level, start here.', 'https://mitpress.mit.edu/9780262681544/microsound/', 2004, 'published', now()),
  
  ('Listening to Noise and Silence: Towards a Philosophy of Sound Art', 'Salomé Voegelin', (SELECT id FROM book_categories WHERE slug = 'sound-philosophy'), 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347989098i/9386892.jpg', 'Explores the phenomenology of listening and the political/aesthetic implications of sound art. A philosophical framework for understanding sonic experience.', 'Voegelin makes you reconsider what it means to listen. This is philosophy through the ear, challenging visual dominance in art theory.', 'https://www.amazon.com/Listening-Noise-Silence-Towards-Philosophy/dp/1441162070', 2010, 'published', now()),
  
  ('Cracked Media: The Sound of Malfunction', 'Caleb Kelly', (SELECT id FROM book_categories WHERE slug = 'sound-philosophy'), 'https://mitpress.mit.edu/wp-content/uploads/2023/04/9780262513531.jpg', 'Analyzes the aesthetics of failure, glitch, and industrial ''malfunction'' as creative tools. How broken machines became instruments.', 'Glitch is not a bug, it is a feature. Kelly''s book is the definitive text on how artists have embraced technological failure as creative material.', 'https://mitpress.mit.edu/9780262513531/cracked-media/', 2009, 'published', now());