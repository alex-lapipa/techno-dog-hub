export type GearCategory = 'synth' | 'drum-machine' | 'sampler' | 'sequencer' | 'effect' | 'daw' | 'midi-tool';

export interface GearItem {
  id: string;
  name: string;
  manufacturer: string;
  releaseYear: number;
  category: GearCategory;
  shortDescription: {
    en: string;
    es: string;
  };
  technicalOverview: {
    synthesisType?: string;
    polyphony?: string;
    architecture?: string;
    midiSync?: string;
    sequencer?: string;
    inputsOutputs?: string;
    modifications?: string;
    strengths?: string;
    limitations?: string;
  };
  notableArtists: {
    name: string;
    usage: string;
  }[];
  famousTracks: {
    artist: string;
    title: string;
    year: number;
    role: string;
  }[];
  technoApplications: {
    en: string;
    es: string;
  };
  relatedGear: string[];
  tags: string[];
  // New fields for official resources
  officialUrl?: string;
  imageUrl?: string;
  youtubeVideos?: {
    title: string;
    url: string;
    channel: string;
  }[];
}

export const gearCategories: Record<GearCategory, { en: string; es: string }> = {
  'synth': { en: 'Synthesizer', es: 'Sintetizador' },
  'drum-machine': { en: 'Drum Machine', es: 'Caja de Ritmos' },
  'sampler': { en: 'Sampler', es: 'Sampler' },
  'sequencer': { en: 'Sequencer', es: 'Secuenciador' },
  'effect': { en: 'Effect', es: 'Efecto' },
  'daw': { en: 'DAW', es: 'DAW' },
  'midi-tool': { en: 'MIDI Tool', es: 'Herramienta MIDI' },
};

export const gear: GearItem[] = [
  // === ANALOG / CLASSIC TECHNO FOUNDATIONS ===
  {
    id: 'roland-tb-303',
    name: 'Roland TB-303',
    manufacturer: 'Roland',
    releaseYear: 1981,
    category: 'synth',
    shortDescription: {
      en: 'The bassline synthesizer that accidentally invented acid techno. Originally designed for guitarists, its squelchy resonance became the defining sound of acid house and techno.',
      es: 'El sintetizador de bajos que inventó accidentalmente el acid techno. Originalmente diseñado para guitarristas, su resonancia característica definió el sonido del acid house y techno.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive',
      polyphony: 'Monophonic',
      architecture: 'Single VCO (sawtooth/square), 18dB/oct lowpass filter, single envelope',
      midiSync: 'DIN Sync (no MIDI on original)',
      sequencer: 'Built-in 16-step sequencer with accent and slide functions',
      inputsOutputs: 'Audio out, headphone out, DIN sync in/out',
      modifications: 'Devil Fish mod (adds filter FM, MIDI, extended controls), CV/Gate mods',
      strengths: 'Iconic squelchy acid sound, built-in sequencer with unique slide/accent, compact form factor',
      limitations: 'No MIDI without modification, limited programming interface, very expensive on used market'
    },
    notableArtists: [
      { name: 'Phuture', usage: 'Pioneers of acid house, used TB-303 for "Acid Tracks"' },
      { name: 'Hardfloor', usage: 'Known for intricate 303 programming across multiple units' },
      { name: 'Luke Slater', usage: 'Integrated into live techno performances' },
      { name: 'Plastikman (Richie Hawtin)', usage: 'Minimal acid techno foundation' }
    ],
    famousTracks: [
      { artist: 'Phuture', title: 'Acid Tracks', year: 1987, role: 'The track that defined acid house, entire bassline is 303' },
      { artist: 'Hardfloor', title: 'Acperience 1', year: 1992, role: 'Multi-layered 303 acid workout' },
      { artist: 'Josh Wink', title: 'Higher State of Consciousness', year: 1995, role: 'Intense 303 filter sweeps' },
      { artist: 'Plastikman', title: 'Spastik', year: 1993, role: 'Minimal acid techno masterpiece' }
    ],
    technoApplications: {
      en: 'The 303 excels at creating hypnotic basslines with its characteristic "acid" sound. Key techniques include: slow filter sweeps with high resonance, accent patterns for rhythmic variation, slide functions for legato phrases, and stacking multiple units for complex layers. Sync via DIN sync to TR-909 for classic acid techno setups. Modern producers often use the Behringer TD-3 or Roland TB-03/TB-3 for similar sounds with MIDI.',
      es: 'El 303 destaca creando líneas de bajo hipnóticas con su sonido "acid" característico. Técnicas clave incluyen: barridos lentos del filtro con alta resonancia, patrones de acento para variación rítmica, funciones de slide para frases legato, y apilar múltiples unidades para capas complejas.'
    },
    relatedGear: ['behringer-td-3', 'roland-sh-101', 'roland-tr-909'],
    tags: ['acid', 'analog', 'bassline', 'classic', 'monophonic'],
    officialUrl: 'https://www.roland.com/global/products/rc_tb-303/',
    imageUrl: 'https://static.roland.com/assets/images/products/gallery/rc_tb-303_top_gal.png',
    youtubeVideos: [
      { title: 'Roland TB-303 Bass Line In Action', url: 'https://www.youtube.com/watch?v=rt71d5LIV5M', channel: 'Doctor Mix' },
      { title: 'TB-303 Patterns and Programming', url: 'https://www.youtube.com/watch?v=4k35KPppf-U', channel: 'Roland' }
    ]
  },
  {
    id: 'roland-tr-808',
    name: 'Roland TR-808',
    manufacturer: 'Roland',
    releaseYear: 1980,
    category: 'drum-machine',
    shortDescription: {
      en: 'The drum machine that shaped electronic music. Its booming kick drum and crisp hi-hats became foundational sounds for techno, house, hip-hop, and beyond.',
      es: 'La caja de ritmos que dio forma a la música electrónica. Su bombo retumbante y hi-hats nítidos se convirtieron en sonidos fundamentales para techno, house, hip-hop y más.'
    },
    technicalOverview: {
      synthesisType: 'Analog synthesis (not sample-based)',
      polyphony: '11 instruments simultaneously',
      architecture: 'Individual analog circuits for each drum sound: kick, snare, toms (3), congas (2), rimshot, claves, handclap, cowbell, cymbal, hi-hats',
      midiSync: 'DIN Sync (no MIDI on original)',
      sequencer: '16-step sequencer with pattern chaining, accent per step',
      inputsOutputs: 'Individual outputs for most sounds, mix output, DIN sync, trigger inputs',
      modifications: 'MIDI retrofit kits, individual output mods, tuning mods',
      strengths: 'Legendary low-end kick drum, punchy analog sounds, individual outputs for mixing, pattern sequencer',
      limitations: 'No MIDI without modification, limited sound palette, expensive on vintage market'
    },
    notableArtists: [
      { name: 'Jeff Mills', usage: 'Core of his DJ and live setup, layered with 909' },
      { name: 'Juan Atkins', usage: 'Detroit techno foundation' },
      { name: 'Derrick May', usage: 'Rhythmic backbone of early Detroit productions' },
      { name: 'Underground Resistance', usage: 'Combined with 909 for militant techno' }
    ],
    famousTracks: [
      { artist: 'Cybotron', title: 'Clear', year: 1983, role: 'Proto-techno classic built on 808 patterns' },
      { artist: 'Afrika Bambaataa', title: 'Planet Rock', year: 1982, role: 'Full 808 drum programming' },
      { artist: 'Model 500', title: 'No UFOs', year: 1985, role: '808 rhythms in Detroit techno context' },
      { artist: 'Lil Louis', title: 'French Kiss', year: 1989, role: '808 kick and hi-hats foundation' }
    ],
    technoApplications: {
      en: 'The 808 kick is essential for deep, booming techno. Layer with 909 kick for punch + sub. Use the analog hi-hats for rolling patterns. The cowbell and claves add percussive accents. Individual outputs allow detailed EQ and compression per sound. Sync to sequencer via DIN sync or use MIDI-retrofitted units. The Behringer RD-8 offers affordable alternative with MIDI.',
      es: 'El bombo 808 es esencial para techno profundo y retumbante. Combinar con bombo 909 para pegada + sub. Usar los hi-hats analógicos para patrones rodantes. El cencerro y claves añaden acentos percusivos.'
    },
    relatedGear: ['roland-tr-909', 'behringer-rd-8', 'elektron-analog-rytm'],
    tags: ['analog', 'drum-machine', 'classic', 'detroit', 'kick'],
    officialUrl: 'https://www.roland.com/global/products/rc_tr-808/',
    imageUrl: 'https://static.roland.com/assets/images/products/gallery/rc_tr-808_top_gal.png',
    youtubeVideos: [
      { title: 'The Roland TR-808 In Action', url: 'https://www.youtube.com/watch?v=nEDuHsCEDfs', channel: 'Doctor Mix' },
      { title: 'TR-808 Software Rhythm Composer', url: 'https://www.youtube.com/watch?v=Ov38brxRGks', channel: 'Roland' }
    ]
  },
  {
    id: 'roland-tr-909',
    name: 'Roland TR-909',
    manufacturer: 'Roland',
    releaseYear: 1983,
    category: 'drum-machine',
    shortDescription: {
      en: 'The heartbeat of techno and house. Its punchy analog kick, snappy snare, and sampled cymbals defined the sound of dance music for decades.',
      es: 'El latido del techno y house. Su bombo analógico contundente, caja nítida y platillos sampleados definieron el sonido de la música dance durante décadas.'
    },
    technicalOverview: {
      synthesisType: 'Hybrid: analog synthesis (kick, snare, toms, claps) + 6-bit samples (cymbals, hi-hats)',
      polyphony: '11 instruments',
      architecture: 'Analog circuits for bass drum, snare, 3 toms, rimshot, handclap; PCM samples for hi-hats, crash, ride',
      midiSync: 'MIDI In/Out, DIN Sync',
      sequencer: '16-step with pattern chaining, shuffle/flam functions, accent',
      inputsOutputs: 'Individual outputs, mix output, MIDI, DIN sync, trigger in/out',
      modifications: 'Individual output installation, extended tuning range mods',
      strengths: 'The definitive techno kick drum, shuffle function for groove, built-in MIDI, individual outputs',
      limitations: 'Sampled hi-hats can sound dated, expensive vintage prices'
    },
    notableArtists: [
      { name: 'Jeff Mills', usage: 'Core of his legendary live sets and productions' },
      { name: 'Robert Hood', usage: 'Minimal techno built around 909 patterns' },
      { name: 'Laurent Garnier', usage: 'French techno productions' },
      { name: 'Ben Klock', usage: 'Berghain sound foundation' }
    ],
    famousTracks: [
      { artist: 'Inner City', title: 'Big Fun', year: 1988, role: 'Full 909 drum programming' },
      { artist: 'Jeff Mills', title: 'The Bells', year: 1997, role: 'Hypnotic 909 pattern' },
      { artist: 'Robert Hood', title: 'Minimal Nation', year: 1994, role: 'Stripped-down 909 minimal techno' },
      { artist: 'Joey Beltram', title: 'Mentasm', year: 1991, role: '909 drums with Hoover bass' }
    ],
    technoApplications: {
      en: 'The 909 kick is the techno standard—punchy with defined transient. Use the shuffle for swing feel. Layer kick with 808 for sub-bass extension. The hi-hats work well when processed with distortion. Individual outputs essential for proper mixing. Sync to DAW via MIDI or use as master clock. The Behringer RD-9 offers affordable clone.',
      es: 'El bombo 909 es el estándar del techno—contundente con transiente definido. Usar el shuffle para sensación de swing. Combinar bombo con 808 para extensión de sub-bajos.'
    },
    relatedGear: ['roland-tr-808', 'behringer-rd-9', 'elektron-analog-rytm'],
    tags: ['analog', 'drum-machine', 'classic', 'techno', 'kick', 'essential'],
    officialUrl: 'https://www.roland.com/global/products/rc_tr-909/',
    imageUrl: 'https://static.roland.com/assets/images/products/gallery/rc_tr-909_top_gal.png',
    youtubeVideos: [
      { title: 'TR-909: The Beat Goes On', url: 'https://www.youtube.com/watch?v=4k35KPppf-U', channel: 'Roland' },
      { title: 'Roland TR-909 Famous Patterns', url: 'https://www.youtube.com/watch?v=ld4n-dT-qQg', channel: 'Doctor Mix' }
    ]
  },
  {
    id: 'roland-sh-101',
    name: 'Roland SH-101',
    manufacturer: 'Roland',
    releaseYear: 1982,
    category: 'synth',
    shortDescription: {
      en: 'A versatile monophonic synth beloved for punchy basslines and aggressive leads. Its simplicity and portability made it a staple of early electronic music.',
      es: 'Un sintetizador monofónico versátil apreciado por líneas de bajo contundentes y leads agresivos. Su simplicidad y portabilidad lo convirtieron en un básico de la música electrónica temprana.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive',
      polyphony: 'Monophonic',
      architecture: 'Single VCO (saw/pulse/square + sub-oscillator), 24dB/oct lowpass filter, single ADSR envelope, LFO',
      midiSync: 'CV/Gate (no MIDI on original)',
      sequencer: 'Built-in 100-step sequencer with arpeggiator',
      inputsOutputs: 'Audio out, CV/Gate in, external clock in, headphone out',
      modifications: 'MIDI retrofit, filter modifications',
      strengths: 'Excellent sub-oscillator for bass, responsive filter, built-in sequencer, battery operation',
      limitations: 'Monophonic only, no MIDI without modification, limited modulation options'
    },
    notableArtists: [
      { name: 'Orbital', usage: 'Signature lead sounds' },
      { name: 'The Prodigy', usage: 'Aggressive acid leads' },
      { name: 'Luke Slater', usage: 'Techno basslines and sequences' },
      { name: 'Helena Hauff', usage: 'Acid and electro productions' }
    ],
    famousTracks: [
      { artist: 'Orbital', title: 'Chime', year: 1990, role: 'Iconic SH-101 lead sequence' },
      { artist: 'The Prodigy', title: 'Voodoo People', year: 1994, role: 'Aggressive lead sounds' },
      { artist: 'Hardfloor', title: 'Hardtrance Acperience', year: 1992, role: 'Acid techno sequences' }
    ],
    technoApplications: {
      en: 'The SH-101 excels at punchy basslines using the sub-oscillator with main saw wave. Its built-in sequencer creates hypnotic patterns when synced to drum machines via clock input. For leads, the PWM (pulse width modulation) adds movement. The filter has excellent resonance for acid-style sounds without the 303\'s signature squelch. Use CV/Gate for external sequencing or add MIDI retrofit.',
      es: 'El SH-101 destaca en líneas de bajo contundentes usando el sub-oscilador con la onda saw principal. Su secuenciador incorporado crea patrones hipnóticos cuando se sincroniza con cajas de ritmos.'
    },
    relatedGear: ['roland-tb-303', 'roland-juno-106', 'behringer-ms-101'],
    tags: ['analog', 'monophonic', 'bassline', 'classic', 'sequencer'],
    officialUrl: 'https://www.roland.com/global/promos/roland_classic_synths/',
    youtubeVideos: [
      { title: 'Roland SH-101 History and Sound', url: 'https://www.youtube.com/watch?v=nPt6j-qFvQY', channel: 'Vintage Synth Explorer' }
    ]
  },
  {
    id: 'roland-juno-106',
    name: 'Roland Juno-106',
    manufacturer: 'Roland',
    releaseYear: 1984,
    category: 'synth',
    shortDescription: {
      en: 'The quintessential polyphonic analog synth. Its lush pads, smooth basses, and built-in chorus defined the sound of 80s and early 90s electronic music.',
      es: 'El sintetizador analógico polifónico por excelencia. Sus pads exuberantes, bajos suaves y chorus incorporado definieron el sonido de la música electrónica de los 80 y 90.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive (DCO-based)',
      polyphony: '6 voices',
      architecture: '1 DCO per voice (saw/pulse/sub), 24dB/oct lowpass filter, 1 envelope (shared VCA/VCF), LFO, built-in chorus',
      midiSync: 'MIDI In/Out',
      sequencer: 'None built-in',
      inputsOutputs: 'Audio out, MIDI in/out, headphone out',
      modifications: 'Voice chip replacement (common failure point), individual outputs mod',
      strengths: 'Lush analog sound, excellent chorus, MIDI equipped, intuitive interface with sliders',
      limitations: 'Voice chips prone to failure, single envelope limits sound design, no individual outputs'
    },
    notableArtists: [
      { name: 'Sven Väth', usage: 'Trance and techno pads' },
      { name: 'The Orb', usage: 'Ambient textures' },
      { name: 'Surgeon', usage: 'Dark techno textures and stabs' },
      { name: 'Moodymann', usage: 'Deep house chords' }
    ],
    famousTracks: [
      { artist: 'Inner City', title: 'Good Life', year: 1988, role: 'Lush pad sounds' },
      { artist: 'Orbital', title: 'Belfast', year: 1991, role: 'Warm pad textures' },
      { artist: 'Model 500', title: 'The Chase', year: 1989, role: 'Detroit techno strings' }
    ],
    technoApplications: {
      en: 'The Juno-106 is ideal for warm pads and chords in techno. The built-in chorus adds width and movement—use Mode I for subtle stereo, Mode II for full lush sound. For basslines, disable the chorus and use the sub-oscillator. Program stabs using short envelope decay. Pairs well with 909 for classic Detroit sound. The Behringer DeepMind or Roland JU-06A offer modern alternatives.',
      es: 'El Juno-106 es ideal para pads cálidos y acordes en techno. El chorus incorporado añade amplitud y movimiento—usar Modo I para estéreo sutil, Modo II para sonido exuberante completo.'
    },
    relatedGear: ['roland-sh-101', 'korg-polysix', 'behringer-deepmind'],
    tags: ['analog', 'polyphonic', 'pads', 'classic', 'chorus'],
    officialUrl: 'https://www.roland.com/global/products/rc_juno-106/',
    imageUrl: 'https://static.roland.com/assets/images/products/gallery/rc_juno-106_top_gal.png',
    youtubeVideos: [
      { title: 'Roland Cloud JUNO-106 Demo & Review', url: 'https://www.youtube.com/watch?v=xdh3hu3SMVU', channel: 'Roland' },
      { title: 'Roland Icon Series: The JUNO-106', url: 'https://www.youtube.com/watch?v=nf4Y-8R0T9M', channel: 'Roland' }
    ]
  },
  {
    id: 'korg-ms-20',
    name: 'Korg MS-20',
    manufacturer: 'Korg',
    releaseYear: 1978,
    category: 'synth',
    shortDescription: {
      en: 'A semi-modular beast with aggressive filters and extensive patching options. Its raw, screaming character made it essential for industrial and hard techno.',
      es: 'Una bestia semi-modular con filtros agresivos y extensas opciones de patcheo. Su carácter crudo y estridente lo hizo esencial para el techno industrial y duro.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive, semi-modular',
      polyphony: 'Monophonic (duophonic in some modes)',
      architecture: '2 VCOs, 2 filters (highpass + lowpass, both resonant), 2 envelopes, external signal processor, patch bay',
      midiSync: 'Hz/V (not V/Oct), requires converter for standard CV',
      sequencer: 'None built-in',
      inputsOutputs: '37-point patch bay, audio in for external processing, headphones',
      modifications: 'V/Oct conversion, MIDI retrofit',
      strengths: 'Aggressive self-oscillating filters, semi-modular flexibility, external signal processing, dual oscillators',
      limitations: 'Hz/V format incompatible with most CV gear, no MIDI, can be harsh/difficult to tame'
    },
    notableArtists: [
      { name: 'Aphex Twin', usage: 'Experimental textures and leads' },
      { name: 'The Hacker', usage: 'Electro basslines' },
      { name: 'Perc', usage: 'Industrial techno textures' },
      { name: 'Ancient Methods', usage: 'Harsh industrial sounds' }
    ],
    famousTracks: [
      { artist: 'Aphex Twin', title: 'Vordhosbn', year: 2001, role: 'Aggressive lead sounds' },
      { artist: 'The Hacker', title: 'Fadin Away', year: 2004, role: 'Electro bassline' },
      { artist: 'Perc', title: 'Look What Your Love Has Done', year: 2014, role: 'Industrial textures' }
    ],
    technoApplications: {
      en: 'The MS-20 excels at aggressive, screaming sounds for industrial techno. The dual filters allow complex tonal shaping—highpass removes mud while lowpass sculpts the tone. Self-oscillating filters create kick drums and percussion. The external signal processor turns it into an effects unit for processing drums or vocals. The Korg MS-20 Mini offers modern reissue with MIDI and USB.',
      es: 'El MS-20 destaca en sonidos agresivos y estridentes para techno industrial. Los filtros duales permiten moldeo tonal complejo—el pasa-altos elimina barro mientras el pasa-bajos esculpe el tono.'
    },
    relatedGear: ['moog-mother-32', 'arturia-minibrute', 'korg-ms-20-mini'],
    tags: ['analog', 'semi-modular', 'aggressive', 'industrial', 'filters'],
    officialUrl: 'https://www.korg.com/us/products/synthesizers/ms_20fs/',
    imageUrl: 'https://www.korg.com/us/products/synthesizers/ms_20fs/images/main_l.jpg',
    youtubeVideos: [
      { title: 'Korg MS-20 Mini Overview', url: 'https://www.youtube.com/watch?v=7q_LxMgbKFI', channel: 'Korg' }
    ]
  },
  {
    id: 'moog-mother-32',
    name: 'Moog Mother-32',
    manufacturer: 'Moog',
    releaseYear: 2015,
    category: 'synth',
    shortDescription: {
      en: 'Moog\'s entry into semi-modular synthesis. Fat bass, classic Moog filter, and Eurorack-compatible for expanding into modular territory.',
      es: 'La entrada de Moog en la síntesis semi-modular. Bajo gordo, filtro Moog clásico, y compatible con Eurorack para expandirse al territorio modular.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive, semi-modular',
      polyphony: 'Monophonic',
      architecture: 'Single VCO (saw/pulse), Moog ladder filter (20Hz-20kHz), ADSR envelope + AD envelope, LFO, 32-point patch bay',
      midiSync: 'MIDI, CV/Gate, clock in/out',
      sequencer: '32-step sequencer with accent, ratchet, and glide',
      inputsOutputs: '32-point Eurorack-compatible patch bay, MIDI in, sync I/O, audio out',
      modifications: 'None needed—designed for expansion via Eurorack',
      strengths: 'Classic Moog bass sound, excellent sequencer, Eurorack compatible, compact',
      limitations: 'Monophonic, limited without external modules, relatively expensive for single voice'
    },
    notableArtists: [
      { name: 'Surgeon', usage: 'Live modular techno performances' },
      { name: 'KiNK', usage: 'Live hardware sets' },
      { name: 'Sterac', usage: 'Studio productions' },
      { name: 'Truncate', usage: 'Bassline-focused techno' }
    ],
    famousTracks: [
      { artist: 'KiNK', title: 'Perth', year: 2016, role: 'Live-sequenced basslines' },
      { artist: 'Truncate', title: 'Concentrate', year: 2017, role: 'Deep Moog bass' }
    ],
    technoApplications: {
      en: 'The Mother-32 is ideal for fat, driving basslines with the classic Moog ladder filter warmth. The sequencer excels at hypnotic patterns with its ratcheting and accent features. Use the patch bay to add external modulation or integrate with Eurorack modules. Clock sync to drum machines for tight timing. Stack multiple units for bass + lead voices. The MIDI input accepts notes from DAW or controller.',
      es: 'El Mother-32 es ideal para líneas de bajo gordas y potentes con la calidez del filtro ladder clásico de Moog. El secuenciador destaca en patrones hipnóticos con sus funciones de ratcheting y acento.'
    },
    relatedGear: ['moog-dfam', 'moog-subharmonicon', 'korg-ms-20'],
    tags: ['analog', 'semi-modular', 'moog', 'bass', 'eurorack'],
    officialUrl: 'https://www.moogmusic.com/products/mother-32',
    imageUrl: 'https://www.moogmusic.com/sites/default/files/2022-12/Mother-32_Front_Product_Image.png',
    youtubeVideos: [
      { title: 'Moog Sound Studio: Mother-32 & DFAM & Subharmonicon', url: 'https://www.youtube.com/watch?v=nZVGJkXVNB0', channel: 'Moog Music' }
    ]
  },
  {
    id: 'moog-dfam',
    name: 'Moog DFAM',
    manufacturer: 'Moog',
    releaseYear: 2018,
    category: 'drum-machine',
    shortDescription: {
      en: 'Drummer From Another Mother—a semi-modular analog percussion synthesizer. Creates evolving, organic drum sounds that go far beyond conventional machines.',
      es: 'Drummer From Another Mother—un sintetizador de percusión analógico semi-modular. Crea sonidos de batería orgánicos y evolutivos que van mucho más allá de las máquinas convencionales.'
    },
    technicalOverview: {
      synthesisType: 'Analog percussion synthesis, semi-modular',
      polyphony: '2 voices (2 oscillators)',
      architecture: '2 VCOs with wide range, Moog ladder filter, 2 envelope generators, VCA, noise generator, 8-step sequencer per voice',
      midiSync: 'No MIDI—CV/Gate and analog sync only',
      sequencer: 'Dual 8-step sequencers with velocity, trigger advance',
      inputsOutputs: '24-point patch bay, sync I/O, audio out',
      modifications: 'MIDI converter boxes available (Kenton, etc.)',
      strengths: 'Massive analog percussion sounds, hands-on interface, Eurorack compatible, unique evolving patterns',
      limitations: 'No MIDI without external converter, only 8 steps, can be chaotic to program'
    },
    notableArtists: [
      { name: 'Surgeon', usage: 'Modular live performances' },
      { name: 'Paula Temple', usage: 'Industrial percussion' },
      { name: 'Clouds', usage: 'Textural percussion' },
      { name: 'Blawan', usage: 'Raw techno drums' }
    ],
    famousTracks: [
      { artist: 'Blawan', title: 'Tasser', year: 2018, role: 'Organic modular percussion' },
      { artist: 'Paula Temple', title: 'Gegen', year: 2019, role: 'Industrial drum textures' }
    ],
    technoApplications: {
      en: 'The DFAM excels at creating organic, evolving percussion that escapes the grid-locked feel of traditional drum machines. Use the dual oscillators tuned to different pitches for complex kick/tom sounds. The sequencer\'s non-quantized feel adds human groove. Patch the noise source for hi-hats and cymbals. Sync to Mother-32 or external clock for tight timing. The Moog filter adds warmth to harsh transients.',
      es: 'El DFAM destaca creando percusión orgánica y evolutiva que escapa de la sensación cuadriculada de las cajas de ritmos tradicionales. Usar los osciladores duales afinados a diferentes tonos para sonidos complejos de bombo/tom.'
    },
    relatedGear: ['moog-mother-32', 'moog-subharmonicon', 'elektron-analog-rytm'],
    tags: ['analog', 'semi-modular', 'moog', 'percussion', 'eurorack'],
    officialUrl: 'https://www.moogmusic.com/products/dfam',
    imageUrl: 'https://www.moogmusic.com/sites/default/files/2022-12/DFAM_Front_Product_Image.png',
    youtubeVideos: [
      { title: 'DFAM Sound Design Demo', url: 'https://www.youtube.com/watch?v=nZVGJkXVNB0', channel: 'Moog Music' }
    ]
  },
  {
    id: 'moog-subharmonicon',
    name: 'Moog Subharmonicon',
    manufacturer: 'Moog',
    releaseYear: 2020,
    category: 'synth',
    shortDescription: {
      en: 'A polyrhythmic analog synthesizer inspired by 1930s Trautonium technology. Creates hypnotic, evolving patterns through subharmonic oscillators and polyrhythm sequencers.',
      es: 'Un sintetizador analógico polirrítmico inspirado en la tecnología Trautonium de los años 30. Crea patrones hipnóticos y evolutivos a través de osciladores subarmónicos y secuenciadores polirrítmicos.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive with subharmonic oscillators',
      polyphony: '2 voices + 4 subharmonic oscillators (6 total)',
      architecture: '2 VCOs, 4 subharmonic oscillators, Moog ladder filter, 2 envelope generators, 4 polyrhythmic sequencers',
      midiSync: 'No MIDI—CV/Gate and analog sync only',
      sequencer: '4 independent polyrhythm sequencers (ratios from 1:1 to 16:1)',
      inputsOutputs: '32-point patch bay, sync I/O, audio out, VCO/VCF CV inputs',
      modifications: 'MIDI converter boxes available',
      strengths: 'Unique subharmonic synthesis, polyrhythmic sequencing, hypnotic evolving patterns, Eurorack compatible',
      limitations: 'No MIDI, steep learning curve, limited to 4 steps per sequence'
    },
    notableArtists: [
      { name: 'Alessandro Cortini', usage: 'Ambient and experimental productions' },
      { name: 'Richard Devine', usage: 'Sound design' },
      { name: 'Surgeon', usage: 'Modular techno explorations' }
    ],
    famousTracks: [
      { artist: 'Alessandro Cortini', title: 'VOLUME MASSIMO', year: 2021, role: 'Subharmonic drones and textures' }
    ],
    technoApplications: {
      en: 'The Subharmonicon creates hypnotic, ever-evolving patterns ideal for extended techno sets. The subharmonic oscillators generate rich bass frequencies below the fundamental—perfect for deep, rumbling techno. Use the polyrhythm sequencers to create complex interlocking patterns. Sync to DFAM and Mother-32 for a complete Moog ecosystem. The 4-step limitation forces creative constraints.',
      es: 'El Subharmonicon crea patrones hipnóticos y siempre cambiantes ideales para sets de techno extendidos. Los osciladores subarmónicos generan frecuencias de bajo ricas por debajo del fundamental—perfecto para techno profundo y retumbante.'
    },
    relatedGear: ['moog-mother-32', 'moog-dfam', 'make-noise-0-coast'],
    tags: ['analog', 'semi-modular', 'moog', 'polyrhythm', 'eurorack', 'experimental'],
    officialUrl: 'https://www.moogmusic.com/products/subharmonicon',
    imageUrl: 'https://www.moogmusic.com/sites/default/files/2022-12/Subharmonicon_Front_Product_Image.png',
    youtubeVideos: [
      { title: 'Moog Subharmonicon Demo', url: 'https://www.youtube.com/watch?v=Zzy4ZVrfttc', channel: 'Vintage King' }
    ]
  },
  {
    id: 'elektron-analog-four',
    name: 'Elektron Analog Four',
    manufacturer: 'Elektron',
    releaseYear: 2012,
    category: 'synth',
    shortDescription: {
      en: 'A 4-voice analog synthesizer with Elektron\'s legendary sequencer. Deep sound design capabilities with parameter locks for evolving, complex sequences.',
      es: 'Un sintetizador analógico de 4 voces con el legendario secuenciador de Elektron. Capacidades profundas de diseño de sonido con parameter locks para secuencias complejas y evolutivas.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive',
      polyphony: '4 voices (can be used as 4 mono or various poly configurations)',
      architecture: '2 VCOs per voice (saw/pulse/triangle + sub), 2 filters (multimode + ladder-style), 2 LFOs, 2 envelopes, effects',
      midiSync: 'MIDI In/Out/Thru, Overbridge USB',
      sequencer: '64-step sequencer with parameter locks, conditional triggers, song mode',
      inputsOutputs: 'Stereo audio out, individual voice outputs (MKII), CV/Gate outputs, MIDI, Overbridge',
      modifications: 'None needed—firmware updates add features',
      strengths: 'Deep analog sound, incredible sequencer, CV outputs for modular, Overbridge integration, portable',
      limitations: '4 voices can feel limiting, learning curve, menu diving for some functions'
    },
    notableArtists: [
      { name: 'Ben Klock', usage: 'Studio and live productions' },
      { name: 'Marcel Dettmann', usage: 'Berghain sound design' },
      { name: 'Rødhåd', usage: 'Dark hypnotic techno' },
      { name: 'DVS1', usage: 'Live techno performances' }
    ],
    famousTracks: [
      { artist: 'Ben Klock', title: 'Subzero', year: 2016, role: 'Deep analog basslines' },
      { artist: 'Rødhåd', title: 'Blindness', year: 2015, role: 'Evolving analog sequences' }
    ],
    technoApplications: {
      en: 'The Analog Four is a techno powerhouse. Use parameter locks to create evolving filter sweeps and rhythmic variations per step. The CV outputs can control modular gear or vintage synths. Dedicate one voice to bass, one to lead, and two to percussion or pads. Overbridge allows multitrack recording into DAW. The MKII adds individual outputs and improved interface.',
      es: 'El Analog Four es una potencia del techno. Usar parameter locks para crear barridos de filtro evolutivos y variaciones rítmicas por paso. Las salidas CV pueden controlar equipo modular o sintetizadores vintage.'
    },
    relatedGear: ['elektron-analog-rytm', 'elektron-digitakt', 'elektron-digitone'],
    tags: ['analog', 'polyphonic', 'sequencer', 'elektron', 'parameter-locks'],
    officialUrl: 'https://www.elektron.se/products/analog-four-mkii/',
    imageUrl: 'https://www.elektron.se/wp-content/uploads/2017/05/A4_MKII_Front.png',
    youtubeVideos: [
      { title: 'Analog Four MKII Introduction', url: 'https://www.youtube.com/watch?v=OoqS-BVaJ_Y', channel: 'Elektron' }
    ]
  },
  {
    id: 'elektron-analog-rytm',
    name: 'Elektron Analog Rytm',
    manufacturer: 'Elektron',
    releaseYear: 2014,
    category: 'drum-machine',
    shortDescription: {
      en: 'Hybrid analog/digital drum machine with Elektron\'s sequencer. Eight analog voices plus sample playback for unlimited percussion possibilities.',
      es: 'Caja de ritmos híbrida analógica/digital con el secuenciador de Elektron. Ocho voces analógicas más reproducción de samples para posibilidades de percusión ilimitadas.'
    },
    technicalOverview: {
      synthesisType: 'Hybrid: analog synthesis + sample playback',
      polyphony: '8 drum voices + 1 sample-only track',
      architecture: '8 analog drum voices (each with 2 oscillators, filter, overdrive), sample engine layerable with analog, built-in compressor/distortion',
      midiSync: 'MIDI In/Out/Thru, Overbridge USB',
      sequencer: '64-step sequencer with parameter locks, conditional triggers, song mode, retrig',
      inputsOutputs: 'Stereo audio out, individual outputs (MKII), MIDI, Overbridge, audio input (MKII)',
      modifications: 'None needed—Overbridge expands functionality',
      strengths: 'Analog punch with sample flexibility, incredible sequencer, performance pads, Overbridge integration',
      limitations: 'Learning curve, expensive, sample memory limitations'
    },
    notableArtists: [
      { name: 'Paula Temple', usage: 'Live industrial techno' },
      { name: 'Blawan', usage: 'Raw techno drums' },
      { name: 'Surgeon', usage: 'Modular integration' },
      { name: 'DVS1', usage: 'Live performances' }
    ],
    famousTracks: [
      { artist: 'Blawan', title: 'Why They Hide Their Bodies', year: 2012, role: 'Intense analog percussion' },
      { artist: 'Paula Temple', title: 'Deathvox', year: 2014, role: 'Industrial drum programming' }
    ],
    technoApplications: {
      en: 'The Analog Rytm is the modern standard for techno drum programming. The analog engines provide punch while samples add character. Use parameter locks for evolving hi-hat patterns and tonal percussion. The performance mode allows real-time manipulation during live sets. Layer analog kick with sample for massive low end. Scene morph for dramatic build-ups.',
      es: 'El Analog Rytm es el estándar moderno para programación de baterías de techno. Los motores analógicos proporcionan pegada mientras los samples añaden carácter.'
    },
    relatedGear: ['elektron-analog-four', 'elektron-digitakt', 'roland-tr-909'],
    tags: ['analog', 'hybrid', 'drum-machine', 'elektron', 'samples', 'parameter-locks'],
    officialUrl: 'https://www.elektron.se/products/analog-rytm-mkii/',
    imageUrl: 'https://www.elektron.se/wp-content/uploads/2017/05/AR_MKII_Front.png',
    youtubeVideos: [
      { title: 'Analog Rytm MKII Introduction', url: 'https://www.youtube.com/watch?v=qYTrKDJL4m4', channel: 'Elektron' }
    ]
  },
  {
    id: 'sequential-prophet-5',
    name: 'Sequential Prophet-5',
    manufacturer: 'Sequential',
    releaseYear: 1978,
    category: 'synth',
    shortDescription: {
      en: 'The first fully programmable polyphonic synthesizer. Its rich, warm sound defined a generation of electronic music and remains highly sought after.',
      es: 'El primer sintetizador polifónico totalmente programable. Su sonido rico y cálido definió una generación de música electrónica y sigue siendo muy buscado.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive',
      polyphony: '5 voices',
      architecture: '2 VCOs per voice (saw/pulse), 24dB/oct lowpass filter, 2 ADSR envelopes, LFO, poly-mod section',
      midiSync: 'MIDI (Rev 3.3+ and modern reissue)',
      sequencer: 'None built-in',
      inputsOutputs: 'Audio out, MIDI (later versions), cassette interface (vintage)',
      modifications: 'MIDI retrofit for older revisions',
      strengths: 'Legendary warm sound, iconic presets, poly-mod for complex tones, fully programmable memory',
      limitations: 'Only 5 voices, expensive, vintage units require maintenance'
    },
    notableArtists: [
      { name: 'Tangerine Dream', usage: 'Berlin school sequences' },
      { name: 'Jean-Michel Jarre', usage: 'Signature pad sounds' },
      { name: 'Vince Clarke', usage: 'Synth-pop foundations' },
      { name: 'The Human League', usage: 'Early electronic pop' }
    ],
    famousTracks: [
      { artist: 'Depeche Mode', title: 'Just Can\'t Get Enough', year: 1981, role: 'Synth stabs and pads' },
      { artist: 'New Order', title: 'Blue Monday', year: 1983, role: 'Lead synth lines' },
      { artist: 'Tangerine Dream', title: 'Love on a Real Train', year: 1984, role: 'Atmospheric pads' }
    ],
    technoApplications: {
      en: 'While more associated with prog and synth-pop, the Prophet-5 creates lush pads and warm stabs for deeper techno. The poly-mod section allows complex, evolving tones. Use the unison mode for massive leads. The 2022 reissue offers vintage Rev 3 and Rev 4 filter options plus modern connectivity. Alternative: Sequential Prophet-6 for similar sound with modern features.',
      es: 'Aunque más asociado con prog y synth-pop, el Prophet-5 crea pads exuberantes y stabs cálidos para techno más profundo.'
    },
    relatedGear: ['sequential-prophet-6', 'oberheim-ob-x', 'moog-one'],
    tags: ['analog', 'polyphonic', 'classic', 'legendary', 'pads'],
    officialUrl: 'https://sequential.com/classics-reissued/prophet-5-10/',
    imageUrl: 'https://sequential.com/wp-content/uploads/2020/08/Prophet-5-front-1920x1440.png',
    youtubeVideos: [
      { title: 'Sequential Prophet-5 Demo', url: 'https://www.youtube.com/watch?v=33CJhKTGWn8', channel: 'Perfect Circuit' },
      { title: 'Prophet-5 2020 Reissue Sound Demo', url: 'https://www.youtube.com/watch?v=wWzb6-kfvdk', channel: 'Sequential' }
    ]
  },
  {
    id: 'arp-2600',
    name: 'ARP 2600',
    manufacturer: 'ARP Instruments',
    releaseYear: 1971,
    category: 'synth',
    shortDescription: {
      en: 'A semi-modular monolith with normalled connections and patch points. Its filter and VCOs became iconic sounds of early electronic and experimental music.',
      es: 'Un monolito semi-modular con conexiones normalizadas y puntos de patch. Su filtro y VCOs se convirtieron en sonidos icónicos de la música electrónica y experimental temprana.'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive, semi-modular',
      polyphony: 'Monophonic (duophonic with external processing)',
      architecture: '3 VCOs, 24dB/oct lowpass filter (various versions), 2 envelope generators, spring reverb, ring modulator, sample & hold, noise source',
      midiSync: 'CV/Gate, no MIDI on original',
      sequencer: 'None built-in',
      inputsOutputs: 'Extensive patch panel, audio inputs, built-in preamp, spring reverb',
      modifications: 'MIDI retrofit available',
      strengths: 'Highly versatile, excellent for sound design, pre-wired connections with patch override, self-contained with speakers (some models)',
      limitations: 'Large and heavy, expensive, original units require restoration'
    },
    notableArtists: [
      { name: 'Jean-Michel Jarre', usage: 'Signature sounds throughout career' },
      { name: 'Herbie Hancock', usage: 'Jazz-funk explorations' },
      { name: 'Stevie Wonder', usage: 'Funk and R&B productions' },
      { name: 'The Who', usage: 'Rock synthesizer textures' }
    ],
    famousTracks: [
      { artist: 'Jean-Michel Jarre', title: 'Oxygène Part IV', year: 1976, role: 'Primary synth throughout' },
      { artist: 'Edgar Winter Group', title: 'Frankenstein', year: 1972, role: 'Iconic synth solo' }
    ],
    technoApplications: {
      en: 'The ARP 2600 excels at experimental techno textures, screaming leads, and complex sound design. The sample & hold creates random modulation patterns. The ring modulator adds metallic, industrial character. Use the external audio input to process drum machines or vocals. Korg\'s 2020 reissue (ARP 2600 FS) offers faithful recreation with MIDI. Alternative: Behringer 2600 for affordable version.',
      es: 'El ARP 2600 destaca en texturas de techno experimental, leads estridentes y diseño de sonido complejo. El sample & hold crea patrones de modulación aleatorios.'
    },
    relatedGear: ['korg-ms-20', 'behringer-2600', 'moog-mother-32'],
    tags: ['analog', 'semi-modular', 'classic', 'experimental', 'sound-design'],
    officialUrl: 'https://www.korg.com/us/products/synthesizers/arp2600_fs/',
    imageUrl: 'https://www.korg.com/us/products/synthesizers/arp2600_fs/images/main_l.jpg',
    youtubeVideos: [
      { title: 'ARP 2600 FS Full Demo', url: 'https://www.youtube.com/watch?v=4IxhTzPVWNk', channel: 'Korg' },
      { title: 'ARP 2600 Sound Design', url: 'https://www.youtube.com/watch?v=WMc9jGJAHmE', channel: 'Perfect Circuit' }
    ]
  },
  {
    id: 'oberheim-ob-xa',
    name: 'Oberheim OB-Xa',
    manufacturer: 'Oberheim',
    releaseYear: 1981,
    category: 'synth',
    shortDescription: {
      en: 'A powerful polyphonic analog with rich, thick sound. The OB-Xa\'s complex modulation and detuned oscillators created the quintessential "big synth" sound.',
      es: 'Un potente sintetizador analógico polifónico con sonido rico y grueso. La modulación compleja y los osciladores desafinados del OB-Xa crearon el sonido quintaesencial de "sintetizador grande".'
    },
    technicalOverview: {
      synthesisType: 'Analog subtractive',
      polyphony: '4, 6, or 8 voices (depending on model)',
      architecture: '2 VCOs per voice (saw/pulse), 12dB or 24dB/oct switchable filter, 2 envelopes, LFO',
      midiSync: 'MIDI (later models and retrofits)',
      sequencer: 'None built-in',
      inputsOutputs: 'Audio out, CV/Gate on some, MIDI on later/retrofit',
      modifications: 'MIDI retrofit, voice restoration',
      strengths: 'Massive detuned sound, excellent filter, programmable memory, split/layer modes',
      limitations: 'Vintage units require maintenance, expensive, heavy'
    },
    notableArtists: [
      { name: 'Van Halen', usage: 'Jump keyboard sound' },
      { name: 'Prince', usage: 'Purple Rain era' },
      { name: 'New Order', usage: 'Power synth sounds' },
      { name: 'Tangerine Dream', usage: 'Epic pad textures' }
    ],
    famousTracks: [
      { artist: 'Van Halen', title: 'Jump', year: 1984, role: 'Iconic brass synth sound' },
      { artist: 'New Order', title: 'Blue Monday', year: 1983, role: 'Synth stabs' },
      { artist: 'Prince', title: 'Let\'s Go Crazy', year: 1984, role: 'Opening synth' }
    ],
    technoApplications: {
      en: 'The OB-Xa creates massive, detuned pads and powerful stabs for epic techno moments. The cross-modulation between oscillators adds complex harmonics. Use the unison mode for huge leads. The filter\'s 12/24dB switch offers sonic variety. Layer with 909 for impactful drops. Modern alternative: Behringer UB-Xa or Oberheim OB-X8 reissue.',
      es: 'El OB-Xa crea pads masivos y desafinados y stabs potentes para momentos épicos de techno. La modulación cruzada entre osciladores añade armónicos complejos.'
    },
    relatedGear: ['sequential-prophet-5', 'roland-juno-106', 'behringer-ub-xa'],
    tags: ['analog', 'polyphonic', 'classic', 'pads', 'vintage', 'big-sound'],
    officialUrl: 'https://oberheim.com/products/ob-x8/',
    imageUrl: 'https://oberheim.com/wp-content/uploads/2022/04/OB-X8-Top1.png',
    youtubeVideos: [
      { title: 'Oberheim OB-X8 Introduction', url: 'https://www.youtube.com/watch?v=V5zL7pVvM8k', channel: 'Oberheim' },
      { title: 'OB-X8 Sound Demo', url: 'https://www.youtube.com/watch?v=YJhDwH9eCko', channel: 'Sound On Sound' }
    ]
  },
  // === MODERN / HYBRID ===
  {
    id: 'elektron-digitakt',
    name: 'Elektron Digitakt',
    manufacturer: 'Elektron',
    releaseYear: 2017,
    category: 'sampler',
    shortDescription: {
      en: 'A compact 8-track digital drum machine and sampler with Elektron\'s sequencer. The go-to portable sampler for modern techno production and live performance.',
      es: 'Una caja de ritmos digital compacta de 8 pistas y sampler con el secuenciador de Elektron. El sampler portátil predilecto para producción de techno moderno y actuaciones en vivo.'
    },
    technicalOverview: {
      synthesisType: 'Sample-based with synthesis parameters',
      polyphony: '8 audio tracks + 8 MIDI tracks',
      architecture: '8 sample tracks with filter, amp, LFO, bit reduction; MIDI tracks for external gear',
      midiSync: 'MIDI In/Out, Overbridge USB',
      sequencer: '64-step sequencer with parameter locks, conditional triggers, retrig',
      inputsOutputs: 'Stereo audio in/out, MIDI, Overbridge, individual outputs via Overbridge',
      modifications: 'None needed—Overbridge expands functionality',
      strengths: 'Incredible sequencer, compact, sample manipulation, MIDI sequencing for external gear, Overbridge',
      limitations: 'No time-stretching, mono samples only, 64MB RAM'
    },
    notableArtists: [
      { name: 'KiNK', usage: 'Live improvised sets' },
      { name: 'Surgeon', usage: 'Portable techno setup' },
      { name: 'Blawan', usage: 'Sample-based productions' },
      { name: 'Sterac', usage: 'Live performances' }
    ],
    famousTracks: [
      { artist: 'KiNK', title: 'Chorus', year: 2018, role: 'Live Digitakt programming' },
      { artist: 'Sterac', title: 'Secret Life of Machines', year: 2019, role: 'Sampled textures' }
    ],
    technoApplications: {
      en: 'The Digitakt is the modern techno sampler. Record your own sounds or import samples. Use parameter locks for evolving drum patterns. The 8 MIDI tracks sequence external synths. Conditional triggers create variation over loops. Pair with Analog Heat for saturation. The compact size makes it ideal for travel/touring. Overbridge allows multitrack recording into DAW.',
      es: 'El Digitakt es el sampler de techno moderno. Graba tus propios sonidos o importa samples. Usa parameter locks para patrones de batería evolutivos.'
    },
    relatedGear: ['elektron-digitone', 'elektron-analog-rytm', 'elektron-octatrack'],
    tags: ['digital', 'sampler', 'elektron', 'sequencer', 'portable', 'parameter-locks'],
    officialUrl: 'https://www.elektron.se/products/digitakt-ii/',
    imageUrl: 'https://www.elektron.se/wp-content/uploads/2023/09/Digitakt-II_angle.png',
    youtubeVideos: [
      { title: 'Digitakt II Introduction', url: 'https://www.youtube.com/watch?v=sS6VzrDYlgE', channel: 'Elektron' }
    ]
  },
  {
    id: 'elektron-digitone',
    name: 'Elektron Digitone',
    manufacturer: 'Elektron',
    releaseYear: 2018,
    category: 'synth',
    shortDescription: {
      en: 'An 8-voice FM synthesizer with Elektron\'s sequencer. Modern FM synthesis made accessible, perfect for pads, basses, and metallic percussion.',
      es: 'Un sintetizador FM de 8 voces con el secuenciador de Elektron. Síntesis FM moderna hecha accesible, perfecto para pads, bajos y percusión metálica.'
    },
    technicalOverview: {
      synthesisType: 'FM synthesis (4-operator)',
      polyphony: '8 voices across 4 tracks',
      architecture: '4 operators per voice, multimode filter, 2 LFOs, chorus, delay, reverb, overdrive',
      midiSync: 'MIDI In/Out, Overbridge USB',
      sequencer: '64-step sequencer with parameter locks, conditional triggers',
      inputsOutputs: 'Stereo audio out, MIDI, Overbridge',
      modifications: 'None needed—firmware updates add features',
      strengths: 'Accessible FM synthesis, great effects, parameter locks on FM parameters, portable',
      limitations: 'FM can be harsh, learning curve for FM sound design, no audio input'
    },
    notableArtists: [
      { name: 'Legowelt', usage: 'Cosmic synth explorations' },
      { name: 'Andrew Weatherall', usage: 'Studio productions' },
      { name: 'KiNK', usage: 'Live FM textures' }
    ],
    famousTracks: [
      { artist: 'Legowelt', title: 'Crystaltone', year: 2019, role: 'FM pads and textures' }
    ],
    technoApplications: {
      en: 'The Digitone excels at metallic percussion, evolving pads, and aggressive bass. FM synthesis creates bell-like tones perfect for hi-hats and cymbals. Use parameter locks to modulate FM ratios per step for evolving textures. The built-in filter tames harsh FM harmonics. Pairs perfectly with Digitakt—Digitone for melodic, Digitakt for drums. Overbridge for DAW integration.',
      es: 'El Digitone destaca en percusión metálica, pads evolutivos y bajos agresivos. La síntesis FM crea tonos tipo campana perfectos para hi-hats y platillos.'
    },
    relatedGear: ['elektron-digitakt', 'elektron-model-cycles', 'yamaha-dx7'],
    tags: ['digital', 'fm', 'elektron', 'sequencer', 'portable', 'metallic'],
    officialUrl: 'https://www.elektron.se/products/digitone-ii/',
    imageUrl: 'https://www.elektron.se/wp-content/uploads/2023/09/Digitone-II_angle.png',
    youtubeVideos: [
      { title: 'Digitone II Introduction', url: 'https://www.youtube.com/watch?v=Wv9YHVxE7jA', channel: 'Elektron' }
    ]
  },
  {
    id: 'novation-peak',
    name: 'Novation Peak',
    manufacturer: 'Novation',
    releaseYear: 2017,
    category: 'synth',
    shortDescription: {
      en: 'An 8-voice hybrid synthesizer with analog filters and digital oscillators. Modern sound design power with analog warmth at an accessible price.',
      es: 'Un sintetizador híbrido de 8 voces con filtros analógicos y osciladores digitales. Poder de diseño de sonido moderno con calidez analógica a un precio accesible.'
    },
    technicalOverview: {
      synthesisType: 'Hybrid: NCOs (digital) through analog filters',
      polyphony: '8 voices',
      architecture: '3 NCOs per voice (virtual analog + wavetables), analog multimode filter, 3 envelopes, 2 LFOs, FM, ring mod, effects',
      midiSync: 'MIDI, USB',
      sequencer: 'Arpeggiator only',
      inputsOutputs: 'Stereo audio out, MIDI in/out, USB, expression pedal input',
      modifications: 'None needed—firmware updates add features',
      strengths: 'Deep sound design, analog filter warmth, wavetables, excellent build quality, affordable for features',
      limitations: 'No full sequencer, desktop only (no keys on Peak), learning curve'
    },
    notableArtists: [
      { name: 'BT', usage: 'Sound design and production' },
      { name: 'Tycho', usage: 'Atmospheric textures' },
      { name: 'Floating Points', usage: 'Deep pads and basses' }
    ],
    famousTracks: [
      { artist: 'Floating Points', title: 'LesAlpx', year: 2019, role: 'Rich synthesizer textures' }
    ],
    technoApplications: {
      en: 'The Peak combines digital flexibility with analog warmth—ideal for modern techno. Use the wavetables for evolving textures, then warm them with the analog filter. The FM section creates metallic percussion. Three oscillators allow complex stacked sounds. The ring modulator adds industrial character. Use the arpeggiator synced to MIDI clock for rhythmic sequences. Summit offers 16 voices and keybed.',
      es: 'El Peak combina flexibilidad digital con calidez analógica—ideal para techno moderno. Usa las wavetables para texturas evolutivas, luego caliéntalas con el filtro analógico.'
    },
    relatedGear: ['novation-summit', 'asm-hydrasynth', 'sequential-prophet-rev2'],
    tags: ['hybrid', 'polyphonic', 'wavetable', 'analog-filter', 'modern'],
    officialUrl: 'https://novationmusic.com/products/peak',
    imageUrl: 'https://cdn11.bigcommerce.com/s-itgb7ssiy1/images/stencil/1280x1280/products/125/3217/Peak_Top_Image__05618.1681814155.png',
    youtubeVideos: [
      { title: 'Novation Peak Overview', url: 'https://www.youtube.com/watch?v=m6V6Pfu5eDk', channel: 'Novation' }
    ]
  },
  {
    id: 'asm-hydrasynth',
    name: 'ASM Hydrasynth',
    manufacturer: 'Ashun Sound Machines',
    releaseYear: 2019,
    category: 'synth',
    shortDescription: {
      en: 'A deep wavetable synthesizer with polyphonic aftertouch and ribbon controller. Massive modulation matrix and unique interface for expressive sound design.',
      es: 'Un sintetizador wavetable profundo con aftertouch polifónico y controlador ribbon. Matriz de modulación masiva e interfaz única para diseño de sonido expresivo.'
    },
    technicalOverview: {
      synthesisType: 'Wavetable synthesis with wavemorphing',
      polyphony: '8 voices (Keyboard), 16 voices (Deluxe)',
      architecture: '3 oscillators (wavetable with 219 waves), dual multimode filters, 5 envelopes, 5 LFOs, 32-slot modulation matrix',
      midiSync: 'MIDI, USB',
      sequencer: 'Arpeggiator with mutator function',
      inputsOutputs: 'Stereo audio out, MIDI, USB, sustain pedal, expression',
      modifications: 'None needed—firmware updates',
      strengths: 'Deep wavetable synthesis, polyphonic aftertouch, ribbon controller, massive modulation, affordable',
      limitations: 'Digital sound (no analog), can be overwhelming, module version has no keys'
    },
    notableArtists: [
      { name: 'Venetian Snares', usage: 'Experimental electronic' },
      { name: 'Richard Devine', usage: 'Sound design' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'The Hydrasynth creates complex, evolving textures for modern techno. Use wavemorphing for slowly shifting timbres. The polyphonic aftertouch allows per-note expression. Route multiple LFOs and envelopes via the mod matrix for organic movement. The ribbon controller adds gestural expression to live performance. Use for pads, leads, and processed textures.',
      es: 'El Hydrasynth crea texturas complejas y evolutivas para techno moderno. Usa wavemorphing para timbres que cambian lentamente.'
    },
    relatedGear: ['novation-peak', 'modal-argon8', 'waldorf-iridium'],
    tags: ['digital', 'wavetable', 'polyphonic', 'modulation', 'expressive', 'modern'],
    officialUrl: 'https://www.ashunsoundmachines.com/hydrasynth-key',
    imageUrl: 'https://www.ashunsoundmachines.com/quality_auto/Hydrasynth(2023).png',
    youtubeVideos: [
      { title: 'ASM Hydrasynth Overview and Demo', url: 'https://www.youtube.com/watch?v=op4jROJER8w', channel: 'Starsky Carr' },
      { title: 'Hydrasynth Deluxe Introduction', url: 'https://www.youtube.com/watch?v=bVwPXn7VQhY', channel: 'ASM Ashun Sound Machines' }
    ]
  },
  {
    id: 'behringer-rd-8',
    name: 'Behringer RD-8',
    manufacturer: 'Behringer',
    releaseYear: 2019,
    category: 'drum-machine',
    shortDescription: {
      en: 'An affordable analog clone of the Roland TR-808. Captures the legendary sounds with modern additions like USB, individual outputs, and MIDI.',
      es: 'Un clon analógico asequible del Roland TR-808. Captura los sonidos legendarios con adiciones modernas como USB, salidas individuales y MIDI.'
    },
    technicalOverview: {
      synthesisType: 'Analog synthesis (808 clone)',
      polyphony: '11 drum instruments',
      architecture: 'Analog circuits replicating 808: kick, snare, 3 toms, congas, rimshot, claves, maracas, handclap, cymbal, open/closed hi-hats',
      midiSync: 'MIDI In/Out/Thru, USB',
      sequencer: '16-step sequencer with pattern chaining, fill function',
      inputsOutputs: 'Individual outputs for all sounds, stereo mix, MIDI, USB, trigger in/out, DIN sync',
      modifications: 'None needed—affordable to buy multiple',
      strengths: 'Affordable 808 sounds, individual outputs, MIDI/USB, easy access to drum synthesis',
      limitations: 'Not 100% identical to vintage, plastic build, occasional QC issues'
    },
    notableArtists: [
      { name: 'Various', usage: 'Affordable alternative to vintage 808' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'The RD-8 provides authentic 808 sounds at accessible prices. Use individual outputs for detailed processing and mixing. The MIDI/USB connectivity integrates with modern DAWs. Layer the kick with 909 or RD-9 for full frequency range. The wave designer section allows tuning and decay adjustments. Perfect for starting a hardware drum machine collection.',
      es: 'El RD-8 proporciona sonidos 808 auténticos a precios accesibles. Usa las salidas individuales para procesamiento y mezcla detallados.'
    },
    relatedGear: ['roland-tr-808', 'behringer-rd-9', 'elektron-analog-rytm'],
    tags: ['analog', 'drum-machine', 'clone', 'affordable', '808'],
    officialUrl: 'https://www.behringer.com/product.html?modelCode=0704-AAA',
    imageUrl: 'https://mediadl.musictribe.com/media/PLM/data/images/products/P0DJL/2000Wx2000H/RD-8_P0DJL_Front_XL.png',
    youtubeVideos: [
      { title: 'Behringer RD-8 Introduction', url: 'https://www.youtube.com/watch?v=I0m0u4C6iyA', channel: 'Behringer' }
    ]
  },
  {
    id: 'behringer-rd-9',
    name: 'Behringer RD-9',
    manufacturer: 'Behringer',
    releaseYear: 2020,
    category: 'drum-machine',
    shortDescription: {
      en: 'An affordable analog clone of the Roland TR-909. Brings the essential techno drum machine sounds to a new generation at accessible prices.',
      es: 'Un clon analógico asequible del Roland TR-909. Trae los sonidos esenciales de la caja de ritmos de techno a una nueva generación a precios accesibles.'
    },
    technicalOverview: {
      synthesisType: 'Hybrid: analog (kick, snare, toms, rimshot, clap) + samples (hi-hats, cymbals)',
      polyphony: '11 drum instruments',
      architecture: 'Replicates 909 architecture: analog bass drum, snare, 3 toms, rimshot, handclap; sample-based hi-hats, crash, ride',
      midiSync: 'MIDI In/Out/Thru, USB',
      sequencer: '16-step sequencer with pattern chaining, shuffle, flam',
      inputsOutputs: 'Individual outputs, stereo mix, MIDI, USB, trigger in/out, DIN sync',
      modifications: 'None needed',
      strengths: 'Affordable 909 sounds, individual outputs, MIDI/USB, the essential techno kick',
      limitations: 'Not identical to vintage, build quality concerns, hi-hats slightly different'
    },
    notableArtists: [
      { name: 'Various', usage: 'Budget-friendly 909 alternative' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'The RD-9 puts the essential techno drum sounds within reach. The kick drum captures the 909 punch. Use shuffle for groove. Individual outputs allow proper mixing—compress the kick, saturate the hi-hats. Sync via MIDI to DAW or other hardware. Pair with TD-3 for classic acid techno setup. Use alongside RD-8 for complete Roland-style drum palette.',
      es: 'El RD-9 pone los sonidos esenciales de batería de techno al alcance. El bombo captura la pegada del 909. Usa shuffle para el groove.'
    },
    relatedGear: ['roland-tr-909', 'behringer-rd-8', 'behringer-td-3'],
    tags: ['analog', 'hybrid', 'drum-machine', 'clone', 'affordable', '909', 'techno'],
    officialUrl: 'https://www.behringer.com/product.html?modelCode=0704-AAB',
    imageUrl: 'https://mediadl.musictribe.com/media/PLM/data/images/products/P0DTZ/2000Wx2000H/RD-9_P0DTZ_Front_XL.png',
    youtubeVideos: [
      { title: 'Behringer RD-9 Overview', url: 'https://www.youtube.com/watch?v=FqT7O0tDoEY', channel: 'Behringer' }
    ]
  },
  // === SAMPLERS & SEQUENCERS ===
  {
    id: 'akai-mpc-3000',
    name: 'Akai MPC3000',
    manufacturer: 'Akai',
    releaseYear: 1994,
    category: 'sampler',
    shortDescription: {
      en: 'The legendary hardware sampler/sequencer that defined hip-hop and electronic production. Roger Linn\'s swing algorithm created an unmistakable groove.',
      es: 'El legendario sampler/secuenciador hardware que definió la producción de hip-hop y electrónica. El algoritmo de swing de Roger Linn creó un groove inconfundible.'
    },
    technicalOverview: {
      synthesisType: 'Sample-based',
      polyphony: '32 voices',
      architecture: '16-bit/44.1kHz sampling, 32MB RAM, 16 drum pads, 64-track MIDI sequencer',
      midiSync: 'MIDI In/Out/Thru x2',
      sequencer: '64-track MIDI sequencer with legendary swing, 99 sequences, song mode',
      inputsOutputs: 'SCSI, stereo in/out, 8 individual outputs, S/PDIF, MIDI',
      modifications: 'RAM expansion, SCSI2SD, output upgrades',
      strengths: 'The MPC swing feel, rock-solid timing, 16 pressure-sensitive pads, deep sequencer',
      limitations: 'Vintage—requires maintenance, small screen, SCSI storage'
    },
    notableArtists: [
      { name: 'DJ Shadow', usage: 'Endtroducing..... production' },
      { name: 'J Dilla', usage: 'Signature loose swing' },
      { name: 'The Roots', usage: 'Live hip-hop production' },
      { name: 'Madlib', usage: 'Beat production' }
    ],
    famousTracks: [
      { artist: 'DJ Shadow', title: 'Building Steam With a Grain of Salt', year: 1996, role: 'Entire track built on MPC' },
      { artist: 'J Dilla', title: 'Donuts (album)', year: 2006, role: 'Signature MPC workflow' }
    ],
    technoApplications: {
      en: 'The MPC3000\'s swing is legendary—even in techno contexts, it adds human feel. Use for sampling vinyl, building drum kits, and sequencing external synths via MIDI. The pads allow performance-style beat creation. Modern alternatives (MPC Live, MPC One) offer similar workflow with modern features, but many prefer the original\'s converters and timing.',
      es: 'El swing del MPC3000 es legendario—incluso en contextos de techno, añade sensación humana. Úsalo para samplear vinilo, construir kits de batería y secuenciar sintetizadores externos vía MIDI.'
    },
    relatedGear: ['akai-mpc60', 'emu-sp-1200', 'elektron-octatrack'],
    tags: ['sampler', 'sequencer', 'classic', 'swing', 'hip-hop', 'mpc'],
    officialUrl: 'https://www.akaipro.com/mpc-hardware.html',
    imageUrl: 'https://www.akaipro.com/media/catalog/product/m/p/mpc3000_1_2.jpg',
    youtubeVideos: [
      { title: 'MPC3000 Instructional Video', url: 'https://www.youtube.com/watch?v=pGJ3fns9O1I', channel: 'Sample Kings' },
      { title: 'MPC 3000 Classic & Limited Edition Review', url: 'https://www.youtube.com/watch?v=kSgG476YC-s', channel: 'Vintage Synth' }
    ]
  },
  {
    id: 'emu-sp-1200',
    name: 'E-mu SP-1200',
    manufacturer: 'E-mu Systems',
    releaseYear: 1987,
    category: 'sampler',
    shortDescription: {
      en: 'The gritty 12-bit sampler that defined the golden age of hip-hop. Its unique sound character—crunchy and warm—remains unmatched.',
      es: 'El sampler granuloso de 12 bits que definió la época dorada del hip-hop. Su carácter de sonido único—crujiente y cálido—sigue sin igual.'
    },
    technicalOverview: {
      synthesisType: 'Sample-based (12-bit)',
      polyphony: '8 voices',
      architecture: '12-bit/26.04kHz sampling, 10 seconds sample time, 8 tunable drum pads, SSM analog filters',
      midiSync: 'MIDI In/Out/Thru',
      sequencer: 'Built-in sequencer with swing',
      inputsOutputs: 'Stereo sampling input, 8 individual outputs, MIDI',
      modifications: 'Memory expansion (up to 2.5 minutes), SCSI',
      strengths: 'Legendary gritty sound, SSM filters add warmth, iconic drum machine interface',
      limitations: 'Very limited sample time, 12-bit resolution, expensive vintage'
    },
    notableArtists: [
      { name: 'Pete Rock', usage: 'Golden age hip-hop production' },
      { name: 'DJ Premier', usage: 'Gang Starr productions' },
      { name: 'Marley Marl', usage: 'Pioneering sampling techniques' },
      { name: 'Just Blaze', usage: 'Modern productions' }
    ],
    famousTracks: [
      { artist: 'Pete Rock & CL Smooth', title: 'They Reminisce Over You', year: 1992, role: 'Full SP-1200 production' },
      { artist: 'Gang Starr', title: 'Mass Appeal', year: 1994, role: 'SP-1200 drums and samples' }
    ],
    technoApplications: {
      en: 'The SP-1200 adds grit and character to techno drums. The 12-bit sampling and SSM filters create warmth that digital samplers can\'t replicate. Use for processing drum hits—sample through the SP to add color. Limited memory forces creative chopping. Modern reissue (SP-1200 2022) offers expanded memory with original sound. Alternative: use SP-1200 emulation plugins.',
      es: 'El SP-1200 añade grit y carácter a las baterías de techno. El sampling de 12 bits y los filtros SSM crean calidez que los samplers digitales no pueden replicar.'
    },
    relatedGear: ['akai-mpc3000', 'akai-mpc60', 'elektron-digitakt'],
    tags: ['sampler', 'classic', '12-bit', 'gritty', 'hip-hop', 'vintage'],
    officialUrl: 'https://www.rossum-electro.com/products/sp-1200/',
    imageUrl: 'https://www.rossum-electro.com/wp-content/uploads/2021/11/SP-1200-Front-Panel-scaled.jpg',
    youtubeVideos: [
      { title: 'The Sound of SP-1200 Rossum', url: 'https://www.youtube.com/watch?v=a_fs4Pe7MU8', channel: 'Cookin Soul' },
      { title: 'SP-1200 Tutorial for both E-mu & Rossum', url: 'https://www.youtube.com/watch?v=fJllMiVqL3U', channel: 'Rossum Electro-Music' }
    ]
  },
  {
    id: 'elektron-octatrack',
    name: 'Elektron Octatrack',
    manufacturer: 'Elektron',
    releaseYear: 2011,
    category: 'sampler',
    shortDescription: {
      en: 'The performance sampler for live electronic music. Eight stereo tracks with real-time manipulation, crossfader scenes, and external audio processing.',
      es: 'El sampler de actuación para música electrónica en vivo. Ocho pistas estéreo con manipulación en tiempo real, escenas de crossfader y procesamiento de audio externo.'
    },
    technicalOverview: {
      synthesisType: 'Sample-based with live sampling',
      polyphony: '8 stereo audio tracks + 8 MIDI tracks',
      architecture: 'Time-stretching, pitch-shifting, 2 LFOs per track, filter, amp, effects (delay, reverb, compressor, etc.)',
      midiSync: 'MIDI In/Out/Thru',
      sequencer: '64-step per track, parameter locks, conditional triggers, arranger',
      inputsOutputs: 'Stereo in (A/B), stereo cue out, main out, MIDI, CF card',
      modifications: 'None needed—deep functionality built-in',
      strengths: 'Live sampling and resampling, crossfader scenes, timestretch, external audio processing, extreme depth',
      limitations: 'Steep learning curve, complex menu structure, expensive'
    },
    notableArtists: [
      { name: 'Surgeon', usage: 'Live techno manipulation' },
      { name: 'KiNK', usage: 'Improvised live sets' },
      { name: 'Speedy J', usage: 'Performance-based sets' },
      { name: 'Caterina Barbieri', usage: 'Experimental sampling' }
    ],
    famousTracks: [
      { artist: 'KiNK', title: 'Boiler Room sets', year: 2014, role: 'Central live performance tool' }
    ],
    technoApplications: {
      en: 'The Octatrack is the ultimate live techno performance tool. Use scenes for dramatic transitions via crossfader. Sample live audio inputs and manipulate in real-time. Pickup machines create loop-based performances. Slice long samples into beats. Process external synths through the Octatrack\'s effects. The learning curve is steep but rewards deep mastery.',
      es: 'El Octatrack es la herramienta definitiva de actuación de techno en vivo. Usa escenas para transiciones dramáticas vía crossfader. Samplea entradas de audio en vivo y manipula en tiempo real.'
    },
    relatedGear: ['elektron-digitakt', 'elektron-analog-rytm', 'akai-mpc-live'],
    tags: ['sampler', 'elektron', 'live', 'performance', 'timestretch', 'advanced'],
    officialUrl: 'https://www.elektron.se/explore/octatrack-mkii',
    imageUrl: 'https://www.elektron.se/wp-content/uploads/2017/09/OT_MKII_Front.png',
    youtubeVideos: [
      { title: 'Octatrack MKII Introduction', url: 'https://www.youtube.com/watch?v=sQwf1mVWxEs', channel: 'Elektron' },
      { title: 'Octatrack MKII Deep Dive', url: 'https://www.youtube.com/watch?v=2oS2p_qh8d8', channel: 'Elektron' }
    ]
  },
  {
    id: 'polyend-tracker',
    name: 'Polyend Tracker',
    manufacturer: 'Polyend',
    releaseYear: 2020,
    category: 'sampler',
    shortDescription: {
      en: 'A hardware tracker bringing the classic tracker workflow to standalone hardware. Sample-based production with the speed of keyboard-driven sequencing.',
      es: 'Un tracker hardware que trae el flujo de trabajo clásico del tracker a hardware autónomo. Producción basada en samples con la velocidad de secuenciación por teclado.'
    },
    technicalOverview: {
      synthesisType: 'Sample-based',
      polyphony: '8 stereo tracks',
      architecture: '8 audio tracks, sample playback with granular, wavetable modes, per-step effects, pattern-based sequencing',
      midiSync: 'MIDI In/Out, USB',
      sequencer: 'Tracker-style with up to 128 steps, per-step effects, song mode',
      inputsOutputs: 'Stereo in/out, headphones, MIDI, USB, SD card',
      modifications: 'None needed—firmware updates',
      strengths: 'Fast tracker workflow, portable, performance mode, granular sampling, unique character',
      limitations: 'Learning curve if unfamiliar with trackers, limited tracks, some workflow limitations'
    },
    notableArtists: [
      { name: 'Bogdan Raczynski', usage: 'Experimental productions' },
      { name: 'Venetian Snares', usage: 'Complex sequencing' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'The Tracker offers a unique workflow for techno production. The per-step effects allow complex, glitchy patterns. Granular mode creates textures from any sample. The performance mode enables live manipulation. Import samples or record directly. The tracker interface allows rapid pattern creation. Perfect for producers who think differently.',
      es: 'El Tracker ofrece un flujo de trabajo único para producción de techno. Los efectos por paso permiten patrones complejos y glitchy.'
    },
    relatedGear: ['elektron-digitakt', 'dirtywave-m8', 'elektron-model-samples'],
    tags: ['sampler', 'tracker', 'sequencer', 'portable', 'granular', 'unique'],
    officialUrl: 'https://polyend.com/tracker/',
    imageUrl: 'https://polyend.com/wp-content/uploads/2020/05/Tracker-hero-1.png',
    youtubeVideos: [
      { title: 'Polyend Tracker Overview', url: 'https://www.youtube.com/watch?v=VWq7v4hv4Qg', channel: 'Polyend' },
      { title: 'Polyend Tracker Mini Introduction', url: 'https://www.youtube.com/watch?v=RnYT-c9lNHc', channel: 'Polyend' }
    ]
  },
  {
    id: 'squarp-pyramid',
    name: 'Squarp Pyramid',
    manufacturer: 'Squarp Instruments',
    releaseYear: 2015,
    category: 'sequencer',
    shortDescription: {
      en: 'A polyrhythmic hardware sequencer with extensive MIDI capabilities. The brain of complex hardware setups with unique pattern generation tools.',
      es: 'Un secuenciador hardware polirrítmico con amplias capacidades MIDI. El cerebro de setups hardware complejos con herramientas únicas de generación de patrones.'
    },
    technicalOverview: {
      synthesisType: 'MIDI/CV sequencer (no audio)',
      polyphony: '64 tracks, 4 instruments each with 16 tracks',
      architecture: 'Polyrhythmic sequencer, step mode, live mode, euclidean, arpeggiator, harmonizer, MIDI effects',
      midiSync: 'MIDI In/Out x2, USB host/device, CV/Gate outputs',
      sequencer: '64 tracks, polyrhythmic, polymetric, extensive MIDI effects per track',
      inputsOutputs: 'MIDI x2, USB host (for USB MIDI devices), CV/Gate x4, BPM output',
      modifications: 'None needed',
      strengths: 'Deep polyrhythmic capabilities, MIDI effects per track, USB host, CV outputs, song mode',
      limitations: 'No audio—sequencer only, learning curve, touch pads not velocity sensitive'
    },
    notableArtists: [
      { name: 'Surgeon', usage: 'Hardware sequencing' },
      { name: 'Caterina Barbieri', usage: 'Polyrhythmic explorations' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'The Pyramid is the command center for hardware techno setups. Use polyrhythmic tracks to create evolving, hypnotic patterns. MIDI effects (arpeggiator, harmonizer, swing) per track add movement. CV outputs control modular gear. USB host connects USB MIDI devices directly. Define sequences in step mode or perform live. The euclidean generator creates algorithmic rhythms.',
      es: 'El Pyramid es el centro de mando para setups de techno hardware. Usa pistas polirrítmicas para crear patrones evolutivos e hipnóticos.'
    },
    relatedGear: ['sequentix-cirklon', 'elektron-analog-four', 'squarp-hapax'],
    tags: ['sequencer', 'midi', 'polyrhythm', 'hardware', 'cv-gate'],
    officialUrl: 'https://squarp.net/pyramid/',
    imageUrl: 'https://squarp.net/wp-content/uploads/2023/10/pyramid-hero.png',
    youtubeVideos: [
      { title: 'Squarp Pyramid Overview', url: 'https://www.youtube.com/watch?v=8MqdJRHbMFc', channel: 'Squarp Instruments' },
      { title: 'Pyramid MIDI Effects Demo', url: 'https://www.youtube.com/watch?v=IXHGPp_2OGQ', channel: 'Squarp Instruments' }
    ]
  },
  {
    id: 'sequentix-cirklon',
    name: 'Sequentix Cirklon',
    manufacturer: 'Sequentix',
    releaseYear: 2011,
    category: 'sequencer',
    shortDescription: {
      en: 'The legendary hardware sequencer with years-long waiting lists. Deep MIDI and CV control with instrument definitions and CK patterns.',
      es: 'El legendario secuenciador hardware con listas de espera de años. Control profundo MIDI y CV con definiciones de instrumentos y patrones CK.'
    },
    technicalOverview: {
      synthesisType: 'MIDI/CV sequencer (no audio)',
      polyphony: '6 instrument tracks (each with multiple voices)',
      architecture: 'Up to 256 steps per pattern, CK patterns (aux patterns), comprehensive MIDI control, modular CV expansion',
      midiSync: 'MIDI In/Out x3, CV expansion cards available',
      sequencer: 'Step sequencer with CK auxiliary patterns, instrument definitions, probability, ratchets',
      inputsOutputs: 'MIDI x3, CV expansion (CVIO), DIN sync, analog clock',
      modifications: 'CV expansion cards, various hardware revisions',
      strengths: 'Legendary reliability, deep instrument definitions, CK patterns, comprehensive MIDI control, touring-ready',
      limitations: 'Years-long wait list, expensive, learning curve'
    },
    notableArtists: [
      { name: 'Speedy J', usage: 'Core of live setup' },
      { name: 'Surgeon', usage: 'Hardware sequencing' },
      { name: 'Luke Slater', usage: 'Live techno performances' },
      { name: 'Planetary Assault Systems', usage: 'Studio and live' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'The Cirklon is the gold standard for hardware techno sequencing. Instrument definitions tailor the interface to each synth. CK patterns create evolving overlays on main patterns. Probability and ratchets add human variation. Multiple MIDI outputs control large setups. CV expansion integrates modular. Built for reliability on tour. If you can get one, it becomes the heart of your setup.',
      es: 'El Cirklon es el estándar de oro para secuenciación de techno hardware. Las definiciones de instrumentos adaptan la interfaz a cada sintetizador.'
    },
    relatedGear: ['squarp-pyramid', 'elektron-analog-four', 'squarp-hapax'],
    tags: ['sequencer', 'midi', 'cv-gate', 'professional', 'live', 'legendary'],
    officialUrl: 'https://www.sequentix.com/products/cirklon2-sequencer',
    imageUrl: 'https://www.sequentix.com/cdn/shop/files/ck2.jpg',
    youtubeVideos: [
      { title: 'Cirklon Tutorial - Getting Started', url: 'https://www.youtube.com/watch?v=AC8FMrzn7Is', channel: 'Sequentix' },
      { title: 'Classic House on Hardware with Cirklon', url: 'https://www.youtube.com/watch?v=qJQHvfQ8w7w', channel: 'Starsky Carr' }
    ]
  },
  // === DAWs ===
  {
    id: 'ableton-live',
    name: 'Ableton Live',
    manufacturer: 'Ableton',
    releaseYear: 2001,
    category: 'daw',
    shortDescription: {
      en: 'The industry standard DAW for electronic music production and live performance. Session View and real-time warping revolutionized how music is made.',
      es: 'El DAW estándar de la industria para producción de música electrónica y actuación en vivo. Session View y el warping en tiempo real revolucionaron cómo se hace música.'
    },
    technicalOverview: {
      synthesisType: 'DAW with included instruments (Wavetable, Operator, Analog, Drift, etc.)',
      polyphony: 'Unlimited (CPU dependent)',
      architecture: 'Session View (clip-based), Arrangement View (timeline), unlimited audio/MIDI tracks, built-in instruments and effects',
      midiSync: 'Full MIDI support, Ableton Link, CV Tools',
      sequencer: 'Piano roll, step sequencer options via Max for Live, groove templates',
      inputsOutputs: 'Any audio interface, MIDI, OSC, CV via CV Tools',
      modifications: 'Max for Live extends functionality infinitely',
      strengths: 'Intuitive clip-based workflow, real-time warping, Session View for improvisation, Push integration, industry standard plugins',
      limitations: 'Expensive (Suite), resource-intensive, arrangement view less intuitive for some'
    },
    notableArtists: [
      { name: 'Richie Hawtin', usage: 'Live performances and productions' },
      { name: 'Deadmau5', usage: 'Production workflow' },
      { name: 'Flume', usage: 'Sound design and production' },
      { name: 'SOPHIE', usage: 'Experimental productions' }
    ],
    famousTracks: [
      { artist: 'Nearly everything post-2010', title: 'Various', year: 2010, role: 'Industry standard production' }
    ],
    technoApplications: {
      en: 'Ableton Live is the default DAW for techno production. Session View allows improvised arrangement—perfect for exploring ideas. The included synths (Wavetable, Analog, Drift) cover most needs. Use groove templates for swing. Sidechain compression via internal routing. Max for Live adds modular-style processing. Push controller provides hands-on control. Link syncs multiple devices.',
      es: 'Ableton Live es el DAW predeterminado para producción de techno. Session View permite arreglos improvisados—perfecto para explorar ideas.'
    },
    relatedGear: ['bitwig-studio', 'ableton-push'],
    tags: ['daw', 'production', 'live', 'session-view', 'industry-standard'],
    officialUrl: 'https://www.ableton.com/en/live/',
    imageUrl: 'https://cdn-resources.ableton.com/resources/images/metaimages/live12.png',
    youtubeVideos: [
      { title: 'Live 12: Overview', url: 'https://www.youtube.com/watch?v=I7JJz7RN_GE', channel: 'Ableton' }
    ]
  },
  {
    id: 'bitwig-studio',
    name: 'Bitwig Studio',
    manufacturer: 'Bitwig',
    releaseYear: 2014,
    category: 'daw',
    shortDescription: {
      en: 'A modern DAW with modular architecture and deep modulation. The Grid synthesizer and per-note expression bring hardware-like flexibility.',
      es: 'Un DAW moderno con arquitectura modular y modulación profunda. El sintetizador Grid y la expresión por nota traen flexibilidad tipo hardware.'
    },
    technicalOverview: {
      synthesisType: 'DAW with modular synthesis (The Grid), FM, sampler, Phase-4, etc.',
      polyphony: 'Unlimited (CPU dependent)',
      architecture: 'Clip launcher + arranger, modular devices, unified modulation system, per-note expression (MPE)',
      midiSync: 'Full MIDI, Ableton Link, CV I/O, HW CV/Gate support',
      sequencer: 'Piano roll, pattern-based, automation, per-note probability',
      inputsOutputs: 'Any interface, extensive CV/Gate support, MIDI, OSC',
      modifications: 'Open architecture—user-created modulators and devices',
      strengths: 'The Grid modular environment, unified modulation, MPE support, native CV, stability, modern architecture',
      limitations: 'Smaller plugin ecosystem, less third-party content than Ableton, learning curve'
    },
    notableArtists: [
      { name: 'Richard Devine', usage: 'Sound design' },
      { name: 'Infected Mushroom', usage: 'Production' },
      { name: 'Koan Sound', usage: 'Complex sound design' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'Bitwig excels for techno producers who want modular-like flexibility in software. The Grid creates custom synths and effects. Native CV support connects to hardware modular. Unified modulation allows anything to modulate anything. Per-note expression enables expressive MIDI controllers. The sampler includes granular modes. Ableton Link syncs with other DAWs and hardware.',
      es: 'Bitwig destaca para productores de techno que quieren flexibilidad tipo modular en software. El Grid crea sintetizadores y efectos personalizados.'
    },
    relatedGear: ['ableton-live', 'fl-studio'],
    tags: ['daw', 'production', 'modular', 'mpe', 'cv-gate', 'modern'],
    officialUrl: 'https://www.bitwig.com/',
    imageUrl: 'https://assets.bitwig.net/media/image/bitwig-home_2311_bitwig-studio-hero/Bitwig-Home_2311_Bitwig-Studio-Hero_SM-SD.jpg',
    youtubeVideos: [
      { title: 'Bitwig Studio 5 Features', url: 'https://www.youtube.com/watch?v=Q-_u3EvG0ko', channel: 'Bitwig' }
    ]
  },
  {
    id: 'logic-pro',
    name: 'Logic Pro',
    manufacturer: 'Apple',
    releaseYear: 2004,
    category: 'daw',
    shortDescription: {
      en: 'Apple\'s professional DAW with comprehensive tools for production, mixing, and mastering. Industry standard for many genres with exceptional value.',
      es: 'El DAW profesional de Apple con herramientas completas para producción, mezcla y mastering. Estándar de la industria para muchos géneros con valor excepcional.'
    },
    technicalOverview: {
      synthesisType: 'DAW with included instruments (Alchemy, Retro Synth, Sculpture, Sample Alchemy, etc.)',
      polyphony: 'Unlimited (CPU dependent)',
      architecture: 'Traditional timeline DAW, drummer track, flex time/pitch, comprehensive mixing',
      midiSync: 'Full MIDI support, Ableton Link (3rd party)',
      sequencer: 'Piano roll, step sequencer, drummer AI, pattern regions',
      inputsOutputs: 'Any Core Audio interface, MIDI',
      modifications: 'Scripter for custom MIDI processing, environment',
      strengths: 'Exceptional value for included content, Alchemy synth, drummer track, solid performance on Mac, comprehensive mixing tools',
      limitations: 'Mac only, traditional workflow less suited to live performance, less modular than Bitwig'
    },
    notableArtists: [
      { name: 'Calvin Harris', usage: 'Production' },
      { name: 'Skrillex', usage: 'Early productions' },
      { name: 'Hardwell', usage: 'EDM production' }
    ],
    famousTracks: [],
    technoApplications: {
      en: 'Logic Pro offers comprehensive techno production at an accessible price. Alchemy provides deep wavetable synthesis. Retro Synth covers analog emulation. Quick Sampler enables fast sample manipulation. The step sequencer suits pattern-based production. Spatial audio tools add dimension. Logic is less common in underground techno but perfectly capable.',
      es: 'Logic Pro ofrece producción de techno completa a un precio accesible. Alchemy proporciona síntesis wavetable profunda.'
    },
    relatedGear: ['ableton-live', 'bitwig-studio'],
    tags: ['daw', 'production', 'mac', 'comprehensive', 'value'],
    officialUrl: 'https://www.apple.com/logic-pro/',
    imageUrl: 'https://www.apple.com/v/logic-pro/m/images/meta/og__bth9rq4qlkya_image.png',
    youtubeVideos: [
      { title: 'Logic Pro 11 Overview', url: 'https://www.youtube.com/watch?v=yyOTBNoC7KM', channel: 'Echo Sound Works' },
      { title: 'Logic Pro for Beginners', url: 'https://www.youtube.com/watch?v=EYBvLaV1E_M', channel: 'Apple' }
    ]
  },
];

export const getGearById = (id: string): GearItem | undefined => {
  return gear.find(item => item.id === id);
};

export const getGearByCategory = (category: GearCategory): GearItem[] => {
  return gear.filter(item => item.category === category);
};

export const getRelatedGear = (ids: string[]): GearItem[] => {
  return gear.filter(item => ids.includes(item.id));
};

export const searchGear = (query: string): GearItem[] => {
  const lowerQuery = query.toLowerCase();
  return gear.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.manufacturer.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
