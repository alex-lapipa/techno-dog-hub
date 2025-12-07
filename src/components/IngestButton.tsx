import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { allDocuments } from '@/data/technoKnowledge';

const IngestButton = () => {
  const [isIngesting, setIsIngesting] = useState(false);
  const { toast } = useToast();

  const handleIngest = async () => {
    setIsIngesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ingest-documents', {
        body: { documents: allDocuments }
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
