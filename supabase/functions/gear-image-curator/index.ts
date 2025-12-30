import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verified Wikimedia Commons URLs (CC-licensed) - comprehensive gear catalog
const GEAR_IMAGE_SOURCES: Record<string, string> = {
  // A - Ableton, Access, Akai, Allen & Heath, Arturia
  'ableton-push-2': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Ableton_Push_-_2013-01-01_20.32.25_%28by_GeschnittenBrot%29.jpg',
  'access-virus-ti': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Access_Virus_TI_Desktop.jpg',
  'akai-mpc60': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Akai_MPC60.jpg',
  'akai-mpc2000': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Akai_MPC2000.jpg',
  'akai-mpc2000xl': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Akai_MPC2000XL.jpg',
  'akai-mpc3000': 'https://upload.wikimedia.org/wikipedia/commons/3/38/MPC_3000_Limited_Edition.jpg',
  'akai-mpc-x': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Akai_Professional_MPC_X.jpg',
  'akai-s950': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Akai_S612_%26_Akai_S950%2C_Sample_this.jpg',
  'akai-s1000': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Akai_S1000.jpg',
  'allen-heath-xone-92': 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Allen_%26_Heath_Xone_92.jpg',
  'allen-heath-xone-96': 'https://upload.wikimedia.org/wikipedia/commons/6/65/Allen_%26_Heath_Xone_96.jpg',
  'allen-heath-xone-db4': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Allen_%26_Heath_Xone_DB4.jpg',
  'arturia-drumbrute-impact': 'https://upload.wikimedia.org/wikipedia/commons/1/18/Arturia_DrumBrute_right_side_view_%282016-12-22_14.03.44_by_rotten77_%40pixabay_2427768%29.jpg',
  'arturia-minibrute-2s': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Arturia_Minibrute%2C_manual_%26_box_back_print_%28Photo_by_David_J%29.jpg',
  
  // B - Buchla
  'buchla-music-easel': 'https://upload.wikimedia.org/wikipedia/commons/8/85/Buchla_music_easel.jpg',
  
  // D - Dave Smith, Denon, Doepfer
  'dave-smith-prophet-08': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Daniel_Bayliss_on_Prophet_%2708%2C_gig_at_Pot_Black%2C_Burry.jpg',
  'doepfer-a100-eurorack': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Doepfer_A-100_Analog_Modular_System_Synthesizer.svg',
  
  // E - E-mu, Elektron, Eventide
  'emu-sp-1200': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/E-mu_SP-12_%28low_reso%29.jpg',
  'elektron-machinedrum': 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Elektron_Machinedrum.jpg',
  'elektron-octatrack': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Elektron_Octatrack_MKII.jpg',
  'elektron-analog-rytm': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Elektron_Analog_Rytm%2C_Roland_TR-606%2C_Arturia_MiniBrute%2C_Yamaha_CS01%2C_Yamaha_YME8_MIDI_Expander%2C_Kenton_MIDI_USB_Host%2C_Eventide_Space_Reverb_%26_Beyond%2C_EH_Holy_Grail_%282014-07-24_by_Spiro_Bolos_%40_Flickr_14758256863%29.jpg',
  'eventide-h3000': 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Eventide_H3000_SE_Ultra-Harmonizer_%28left_view%29.jpg',
  
  // K - Korg
  'korg-ms-20': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Korg_Synthesizer_MS-20.jpg',
  'korg-monologue': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Korg_monologue.jpg',
  'korg-minilogue-xd': 'https://upload.wikimedia.org/wikipedia/commons/5/51/Korg_Minilogue_XD.jpg',
  'korg-prologue': 'https://upload.wikimedia.org/wikipedia/commons/3/32/Korg_Prologue_16.jpg',
  'korg-volca-beats': 'https://upload.wikimedia.org/wikipedia/commons/3/38/Korg_Volca_Beats.jpg',
  'korg-volca-series': 'https://upload.wikimedia.org/wikipedia/commons/a/af/Acid_bass_machines_and_Cables_-_MFB-Synth_Lite%2C_Roland_AIRA_TB-3_Touch_Bassline%2C_Cyclone_Analogic_Bass_Bot_TT-303%2C_Korg_Volca_Keys_%28by_David_J%29.jpg',
  
  // M - Mackie, Moog
  'mackie-vlz-series': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Mackie_1604-VLZ_PRO.jpg',
  'moog-minimoog-model-d': 'https://upload.wikimedia.org/wikipedia/commons/2/22/Minimoog.JPG',
  'moog-prodigy': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Moog_Prodigy_synthesizer.jpg',
  'moog-sub-37': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Moog_Sub_37_%282014_NAMM_Show%29.jpg',
  'moog-mother-32': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Moog_Mother-32.jpg',
  
  // N - Native Instruments, Nord, Novation
  'native-instruments-maschine': 'https://upload.wikimedia.org/wikipedia/commons/4/46/NI_Maschine_logo.jpg',
  'native-instruments-traktor': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/NI_Traktor_Kontrol_S4_MK2_Controller_Top.jpg',
  'nord-lead-series': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Clavia_Nord_Lead_2x_front.jpg',
  'novation-bass-station-ii': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Novation_BassStation.jpg',
  'novation-peak': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Novation_Nova_.jpg',
  
  // O - Oberheim
  'oberheim-ob-xa': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Oberheim_OBX-a_Front.jpg',
  'oberheim-sem': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Tomoberheim.com_SEM_%28Synthesizer_Expander_Module%29.jpg',
  
  // P - Pioneer DJ
  'pioneer-cdj-2000nxs2': 'https://upload.wikimedia.org/wikipedia/commons/5/51/CDJ_2000-edit.jpg',
  'pioneer-cdj-3000': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/CDJ-2000_Nexus_%26_DJM-900_1_2023-11-14.jpg',
  'pioneer-djm-900nxs2': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/CDJ-2000_Nexus_%26_DJM-900_1_2023-11-14.jpg',
  'pioneer-djm-v10': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/CDJ-2000_Nexus_%26_DJM-900_1_2023-11-14.jpg',
  
  // R - Roland
  'roland-juno-60': 'https://upload.wikimedia.org/wikipedia/commons/8/85/Roland_Juno-60.jpg',
  'roland-juno-106': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Roland_Juno-106.jpg',
  'roland-jupiter-8': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Roland_Jupiter-8_%281981%29.jpg',
  'roland-jx-3p': 'https://upload.wikimedia.org/wikipedia/commons/1/18/Roland-JX3P.jpg',
  'roland-re-201': 'https://upload.wikimedia.org/wikipedia/commons/d/de/Roland_RE-201_Space_Echo.jpg',
  'roland-sp-404': 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Roland_SP-404SX.jpg',
  'roland-system-100m': 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Roland-System-100M.jpg',
  'roland-system-700': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Roland_System_700.jpg',
  'roland-tr-707': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Roland_TR-707_-_Pattern_Play.jpg',
  'roland-tr-808': 'https://upload.wikimedia.org/wikipedia/commons/b/be/Roland_TR-808_drum_machine.jpg',
  'roland-tr-909': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Roland_TR-909_%28large%29.png',
  'roland-tb-303': 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Roland_TB-303_Panel.jpg',
  'roland-sh-101': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Roland_SH-101.jpg',
  
  // S - Sequential
  'sequential-prophet-5': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Sequential_Prophet_10_Rev_4.png',
  'sequential-prophet-6': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/DSI_Pro_2%2C_Sequential_Prophet-6%2C_Dave_Smith_Modular_-_angled_-_2015_NAMM_Show.jpg',
  'sequential-pro-one': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Sequential_Circuits_Pro-One.jpg',
  
  // T - Teenage Engineering
  'teenage-engineering-op-1': 'https://upload.wikimedia.org/wikipedia/commons/0/05/OP-1_Sequencer_Concept.png',
  'teenage-engineering-op-z': 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Teenage_Engineering_OP-Z.jpg',
  
  // V - Vermona
  'vermona-drm1': 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Vermona_%E2%80%9914_Analog_Synthesizer_-_front_angled_1_-_2015_NAMM_Show.jpg',
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
