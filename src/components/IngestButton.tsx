import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { allDocuments } from '@/data/technoKnowledge';
import { useNavigate } from 'react-router-dom';

const IngestButton = () => {
  const [isIngesting, setIsIngesting] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleIngest = async () => {
    if (!user) {
      toast({
        title: 'Autenticación requerida',
        description: 'Debes iniciar sesión para ingestar documentos.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!isAdmin) {
      toast({
        title: 'Acceso denegado',
        description: 'Solo los administradores pueden ingestar documentos.',
        variant: 'destructive',
      });
      return;
    }

    setIsIngesting(true);
    
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const { data, error } = await supabase.functions.invoke('ingest-documents', {
        body: { documents: allDocuments },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (error) throw error;

      toast({
        title: 'Documentos ingestados',
        description: `Se han procesado ${data?.ingested || 0} fragmentos de documentos.`,
      });
    } catch (error) {
      console.error('Ingest error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron procesar los documentos.',
        variant: 'destructive',
      });
    } finally {
      setIsIngesting(false);
    }
  };

  // Only show button to admins
  if (!isAdmin) {
    return null;
  }

  return (
    <Button
      variant="terminal"
      size="sm"
      onClick={handleIngest}
      disabled={isIngesting}
      className="font-mono text-xs"
    >
      {isIngesting ? '[ PROCESANDO... ]' : '[ INGESTAR DOCS ]'}
    </Button>
  );
};

export default IngestButton;
