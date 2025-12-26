-- TECHNO.DOG News Agent Tables (Additive - does not modify existing tables)

-- Table: Agent run history and logs
CREATE TABLE public.td_news_agent_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'partial', 'failed')),
  sources_checked JSONB DEFAULT '[]'::jsonb,
  candidates JSONB DEFAULT '[]'::jsonb,
  rejected JSONB DEFAULT '[]'::jsonb,
  chosen_story JSONB,
  final_article_id UUID,
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: News articles (drafts and published)
CREATE TABLE public.td_news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  body_markdown TEXT NOT NULL,
  author_pseudonym TEXT NOT NULL,
  city_tags TEXT[] DEFAULT '{}',
  genre_tags TEXT[] DEFAULT '{}',
  entity_tags TEXT[] DEFAULT '{}',
  source_urls TEXT[] DEFAULT '{}',
  source_snapshots JSONB DEFAULT '[]'::jsonb,
  confidence_score FLOAT DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: Knowledge base entities
CREATE TABLE public.td_knowledge_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('artist', 'label', 'club', 'venue', 'festival', 'promoter', 'collective', 'city', 'scene', 'release')),
  country TEXT,
  city TEXT,
  description TEXT,
  aliases TEXT[] DEFAULT '{}',
  source_urls TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: Article-Entity junction table
CREATE TABLE public.td_article_entities (
  article_id UUID NOT NULL REFERENCES public.td_news_articles(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES public.td_knowledge_entities(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, entity_id)
);

-- Add foreign key from runs to articles
ALTER TABLE public.td_news_agent_runs 
ADD CONSTRAINT fk_final_article 
FOREIGN KEY (final_article_id) 
REFERENCES public.td_news_articles(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.td_news_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.td_news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.td_knowledge_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.td_article_entities ENABLE ROW LEVEL SECURITY;

-- Public read access for published articles
CREATE POLICY "Published articles are publicly readable"
ON public.td_news_articles
FOR SELECT
USING (status = 'published');

-- Admin policies (users with admin role can manage all)
CREATE POLICY "Admins can manage all articles"
ON public.td_news_articles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage agent runs"
ON public.td_news_agent_runs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Public read for knowledge entities
CREATE POLICY "Knowledge entities are publicly readable"
ON public.td_knowledge_entities
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage knowledge entities"
ON public.td_knowledge_entities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Article entities are publicly readable"
ON public.td_article_entities
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage article entities"
ON public.td_article_entities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Indexes for performance
CREATE INDEX idx_td_news_articles_status ON public.td_news_articles(status);
CREATE INDEX idx_td_news_articles_created_at ON public.td_news_articles(created_at DESC);
CREATE INDEX idx_td_knowledge_entities_type ON public.td_knowledge_entities(type);
CREATE INDEX idx_td_knowledge_entities_name ON public.td_knowledge_entities(name);
CREATE INDEX idx_td_news_agent_runs_run_date ON public.td_news_agent_runs(run_date DESC);

-- Update trigger for articles
CREATE TRIGGER update_td_news_articles_updated_at
BEFORE UPDATE ON public.td_news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for entities
CREATE TRIGGER update_td_knowledge_entities_updated_at
BEFORE UPDATE ON public.td_knowledge_entities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();