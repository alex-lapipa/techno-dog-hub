import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verified Wikimedia Commons URLs (CC-licensed)
const GEAR_IMAGE_SOURCES: Record<string, string> = {
  'roland-tr-808': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Roland_TR-808_drum_machine.jpg/1280px-Roland_TR-808_drum_machine.jpg',
  'roland-tr-909': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Roland_TR-909.jpg/1280px-Roland_TR-909.jpg',
  'roland-tb-303': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/TB303_Front_View.jpg/1280px-TB303_Front_View.jpg',
  'roland-sh-101': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Roland_SH-101.jpg/1280px-Roland_SH-101.jpg',
  'roland-juno-106': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Roland_Juno-106.jpg/1280px-Roland_Juno-106.jpg',
  'roland-juno-60': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Roland_Juno-60_%28large%29.jpg/1280px-Roland_Juno-60_%28large%29.jpg',
  'roland-jupiter-8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Roland_Jupiter-8.jpg/1280px-Roland_Jupiter-8.jpg',
  'moog-minimoog-model-d': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Minimoog.JPG/1280px-Minimoog.JPG',
  'moog-sub-37': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Moog_Sub_37.jpg/1280px-Moog_Sub_37.jpg',
  'moog-mother-32': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Moog_Mother-32.jpg/1280px-Moog_Mother-32.jpg',
  'sequential-prophet-5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sequential_Circuits_Prophet_5.jpg/1280px-Sequential_Circuits_Prophet_5.jpg',
  'korg-ms-20': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/KORG_MS-20.jpg/1280px-KORG_MS-20.jpg',
  'oberheim-ob-xa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Oberheim_OB-Xa.jpg/1280px-Oberheim_OB-Xa.jpg',
  'elektron-machinedrum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Elektron_Machinedrum_SPS-1_mkII.jpg/1280px-Elektron_Machinedrum_SPS-1_mkII.jpg',
  'akai-mpc60': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Akai_MPC60.jpg/1280px-Akai_MPC60.jpg',
};

async function fetchAndStoreImage(
  supabase: any,
  gearId: string,
  imageUrl: string,
  source: string
): Promise<{ success: boolean; storagePath?: string; error?: string }> {
  try {
    console.log(`Fetching image for ${gearId} from ${imageUrl}`);
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechnoDog/1.0; +https://technodog.lovable.app)',
      },
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Determine file extension
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('gif')) ext = 'gif';
    
    const storagePath = `${gearId}.${ext}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('gear-images')
      .upload(storagePath, uint8Array, {
        contentType,
        upsert: true,
      });
    
    if (uploadError) {
      return { success: false, error: uploadError.message };
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gear-images')
      .getPublicUrl(storagePath);
    
    // Update gear_catalog with new image URL
    const { error: updateError } = await supabase
      .from('gear_catalog')
      .update({ 
        image_url: publicUrl,
        image_attribution: {
          source,
          original_url: imageUrl,
          fetched_at: new Date().toISOString(),
        }
      })
      .eq('id', gearId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { success: true, storagePath };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { action, gearId } = await req.json();

    if (action === 'curate-single' && gearId) {
      // Curate a single gear item
      const imageUrl = GEAR_IMAGE_SOURCES[gearId];
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ success: false, error: 'No image source found for this gear' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const source = 'wikimedia';
      const result = await fetchAndStoreImage(supabase, gearId, imageUrl, source);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'curate-all') {
      // Curate all gear items that don't have images
      const { data: gearItems } = await supabase
        .from('gear_catalog')
        .select('id, name, image_url')
        .order('brand');
      
      const results: Record<string, { success: boolean; error?: string }> = {};
      
      for (const item of gearItems || []) {
        // Skip items that already have stored images
        if (item.image_url?.includes('gear-images')) {
          results[item.id] = { success: true };
          continue;
        }
        
        const imageUrl = GEAR_IMAGE_SOURCES[item.id];
        if (!imageUrl) {
          results[item.id] = { success: false, error: 'No source URL' };
          continue;
        }
        
        const source = 'wikimedia';
        results[item.id] = await fetchAndStoreImage(supabase, item.id, imageUrl, source);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const successful = Object.values(results).filter(r => r.success).length;
      const failed = Object.values(results).filter(r => !r.success).length;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          summary: { successful, failed, total: gearItems?.length || 0 },
          details: results 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      // Get current image status
      const { data: gearItems } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, image_url, image_attribution')
        .order('brand');
      
      const status = gearItems?.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        hasImage: !!item.image_url,
        hasStoredImage: item.image_url?.includes('gear-images') || false,
        hasSourceUrl: !!GEAR_IMAGE_SOURCES[item.id],
        attribution: item.image_attribution,
      }));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: status,
          summary: {
            total: status?.length || 0,
            withImages: status?.filter(s => s.hasImage).length || 0,
            withStoredImages: status?.filter(s => s.hasStoredImage).length || 0,
            withSourceUrls: status?.filter(s => s.hasSourceUrl).length || 0,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
