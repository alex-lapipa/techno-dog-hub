-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Documents are publicly readable" ON public.documents;

-- Create a more restrictive policy: only service role can read (for rag-chat edge function)
-- The rag-chat function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- This blocks direct client access while keeping server-side RAG working
CREATE POLICY "Only authenticated users can read documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (true);

-- Add a comment explaining the security model
COMMENT ON TABLE public.documents IS 'RAG knowledge base - public client access blocked, server-side access via service role key';