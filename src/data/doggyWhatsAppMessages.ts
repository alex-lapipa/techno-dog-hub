// Unique WhatsApp share messages for each doggy
// Each message has the doggy personality + a techno quote that users can edit

export interface DoggyMessage {
  intro: string;      // Short personal intro
  quote: string;      // Techno wisdom quote
  packInvite: string; // Call to action
}

export const doggyMessages: Record<string, DoggyMessage> = {
  // CORE PACK
  'happy': {
    intro: "I'm the Happy Dog",
    quote: "The bass drops, the crowd smiles, the night is young.",
    packInvite: "Find your spirit doggy"
  },
  'sleepy': {
    intro: "I'm the Sleepy Dog",
    quote: "Some of us dance until sunrise... I dream of the next one.",
    packInvite: "Rest, then rave. Join us"
  },
  'excited': {
    intro: "I'm the Excited Dog",
    quote: "EVERY. SINGLE. BEAT. Matters.",
    packInvite: "Bring your energy"
  },
  'grumpy': {
    intro: "I'm the Grumpy Dog",
    quote: "Your favorite DJ is mid. Mine's underground.",
    packInvite: "Prove me wrong"
  },
  'curious': {
    intro: "I'm the Curious Dog",
    quote: "What's that sound? I need to know the producer.",
    packInvite: "Explore with us"
  },
  'party': {
    intro: "I'm the Party Dog",
    quote: "If the bass isn't shaking your chest, is it even a party?",
    packInvite: "Celebrate life"
  },
  'dj': {
    intro: "I'm the DJ Dog",
    quote: "Reading the floor is reading souls.",
    packInvite: "Drop in"
  },
  'puppy': {
    intro: "I'm the Puppy Dog",
    quote: "First rave. No idea what's happening. Absolutely loving it.",
    packInvite: "Start your journey"
  },
  'old': {
    intro: "I'm the Old Dog",
    quote: "I was there when techno was just Detroit and a dream.",
    packInvite: "Learn from the elders"
  },
  'techno': {
    intro: "I'm the Techno Dog",
    quote: "No vocals. Just pulse. Pure machine music.",
    packInvite: "Join the underground"
  },
  
  // DANCE VIBES
  'dancing': {
    intro: "I'm the Dancing Dog",
    quote: "My body doesn't know how to stand still when the kick hits.",
    packInvite: "Move with us"
  },
  'raving': {
    intro: "I'm the Raving Dog",
    quote: "Peak time is a state of mind. And it's 5AM.",
    packInvite: "Lose yourself"
  },
  'crazy': {
    intro: "I'm the Crazy Dog",
    quote: "Normal is boring. Weird is wonderful. Bass is life.",
    packInvite: "Embrace the chaos"
  },
  'fan': {
    intro: "I'm the Fan Dog",
    quote: "Front row, hands up, eyes closed, soul open.",
    packInvite: "Support the scene"
  },
  'traveller': {
    intro: "I'm the Traveller Dog",
    quote: "Tresor, Bassiani, Fabric, Berghain... Home is where the bass is.",
    packInvite: "Explore the world"
  },
  'zen': {
    intro: "I'm the Zen Dog",
    quote: "The kick drum is my meditation bell.",
    packInvite: "Find your peace"
  },
  'ninja': {
    intro: "I'm the Ninja Dog",
    quote: "You won't see me, but you'll feel the energy.",
    packInvite: "Move in silence"
  },
  'space': {
    intro: "I'm the Space Dog",
    quote: "Somewhere between Mars and the dancefloor.",
    packInvite: "Orbit with us"
  },
  'chef': {
    intro: "I'm the Chef Dog",
    quote: "Today's special: raw, unfiltered, warehouse techno.",
    packInvite: "Taste the sound"
  },
  'pirate': {
    intro: "I'm the Pirate Dog",
    quote: "Sailing through the night, chasing sound.",
    packInvite: "Join the crew"
  },
  'scientist': {
    intro: "I'm the Scientist Dog",
    quote: "Hypothesis: 130 BPM induces transcendence. Testing in progress.",
    packInvite: "Research with us"
  },
  'rocker': {
    intro: "I'm the Rocker Dog",
    quote: "Punk spirit, industrial soul, techno heart.",
    packInvite: "Break the rules"
  },
  
  // SEASONAL
  'summer': {
    intro: "I'm the Summer Dog",
    quote: "Sunset set on the terrace. Life complete.",
    packInvite: "Chase the sun"
  },
  'christmas': {
    intro: "I'm the Christmas Dog",
    quote: "All I want for Christmas is a 12-hour closing set.",
    packInvite: "Celebrate underground"
  },
  'halloween': {
    intro: "I'm the Halloween Dog",
    quote: "The scariest thing? When the music stops.",
    packInvite: "Face your fears"
  },
  'valentine': {
    intro: "I'm the Valentine Dog",
    quote: "Fell in love on the dancefloor. Still there.",
    packInvite: "Share the love"
  },
  'spring': {
    intro: "I'm the Spring Dog",
    quote: "Fresh season, fresh sounds, same underground soul.",
    packInvite: "Bloom with us"
  },
  'autumn': {
    intro: "I'm the Autumn Dog",
    quote: "Darker nights, deeper beats, warmer hearts.",
    packInvite: "Embrace the dark"
  },
  'winter': {
    intro: "I'm the Winter Dog",
    quote: "Cold outside. Fire on the dancefloor.",
    packInvite: "Warm up inside"
  },
  'new year': {
    intro: "I'm the New Year Dog",
    quote: "12 months of bass. No resolutions, just raves.",
    packInvite: "Start fresh"
  },
  'easter': {
    intro: "I'm the Easter Dog",
    quote: "Hunting for hidden gems in the crates.",
    packInvite: "Discover more"
  },
  'birthday': {
    intro: "I'm the Birthday Dog",
    quote: "Every night out is a celebration of life.",
    packInvite: "Celebrate"
  },
  
  // GENRE DOGS
  'disco': {
    intro: "I'm the Disco Dog",
    quote: "Before techno, there was disco. Respect the roots.",
    packInvite: "Get groovy"
  },
  'thug': {
    intro: "I'm the Thug Dog",
    quote: "Too raw for the mainstream. Perfect for the underground.",
    packInvite: "Stay true"
  },
  'hypnotic': {
    intro: "I'm the Hypnotic Dog",
    quote: "One loop. Eight hours. Pure trance.",
    packInvite: "Get lost"
  },
  'vinyl': {
    intro: "I'm the Vinyl Dog",
    quote: "The crackle before the drop. That's the magic.",
    packInvite: "Dig deep"
  },
  'synth': {
    intro: "I'm the Synth Dog",
    quote: "Analog warmth in a digital world.",
    packInvite: "Patch in"
  },
  'acid': {
    intro: "I'm the Acid Dog",
    quote: "303 squelch is the sound of pure joy.",
    packInvite: "Get squelchy"
  },
  'industrial': {
    intro: "I'm the Industrial Dog",
    quote: "Hard as nails. Loud as machines. Pure as steel.",
    packInvite: "Embrace the noise"
  },
  'minimal': {
    intro: "I'm the Minimal Dog",
    quote: "One kick. One hat. Infinite groove.",
    packInvite: "Less is more"
  },
  'dub': {
    intro: "I'm the Dub Dog",
    quote: "Deep in the echo. Lost in the space.",
    packInvite: "Go deeper"
  },
  '909': {
    intro: "I'm the 909 Dog",
    quote: "That kick. You know the one.",
    packInvite: "Feel the boom"
  },
  
  // CLUB LIFE
  'berghain': {
    intro: "I'm the Berghain Dog",
    quote: "Maybe next time. Or maybe not. Keep trying.",
    packInvite: "Queue with us"
  },
  'afterhours': {
    intro: "I'm the Afterhours Dog",
    quote: "Sunrise is just the beginning of day two.",
    packInvite: "Keep going"
  },
  'promoter': {
    intro: "I'm the Promoter Dog",
    quote: "Building scenes, not just events.",
    packInvite: "Support your locals"
  },
  'bouncer': {
    intro: "I'm the Bouncer Dog",
    quote: "Reading energy, not just outfits.",
    packInvite: "Bring the right vibe"
  },
  'producer': {
    intro: "I'm the Producer Dog",
    quote: "That track took 3 years. Nobody will know.",
    packInvite: "Create something"
  },
  'resident': {
    intro: "I'm the Resident Dog",
    quote: "This is my floor. Welcome home.",
    packInvite: "Find your home"
  },
  'warm up': {
    intro: "I'm the Warm Up Dog",
    quote: "Setting the mood is an art form.",
    packInvite: "Start slow"
  },
  'peak time': {
    intro: "I'm the Peak Time Dog",
    quote: "3AM. Maximum energy. No regrets.",
    packInvite: "Go all in"
  },
  'closing': {
    intro: "I'm the Closing Dog",
    quote: "Last track, best track. Pure emotion.",
    packInvite: "End beautifully"
  },
  'modular': {
    intro: "I'm the Modular Dog",
    quote: "Patch cables are the new sheet music.",
    packInvite: "Get modular"
  },
  'analog': {
    intro: "I'm the Analog Dog",
    quote: "Warm signals only. No laptops allowed.",
    packInvite: "Keep it real"
  },
  'vj': {
    intro: "I'm the VJ Dog",
    quote: "Visuals and sound are one. Always.",
    packInvite: "See the music"
  },
  'underground': {
    intro: "I'm the Underground Dog",
    quote: "The best parties have no address.",
    packInvite: "Find the secret"
  },
  'purist': {
    intro: "I'm the Purist Dog",
    quote: "Four-to-the-floor or go home.",
    packInvite: "Keep it pure"
  },
  'tourist': {
    intro: "I'm the Tourist Dog",
    quote: "First time here. Mind blown. Changed forever.",
    packInvite: "Experience it"
  },
  'legend': {
    intro: "I'm the Legend Dog",
    quote: "Been here since day one. Still dancing.",
    packInvite: "Learn the history"
  },
  'nerdy': {
    intro: "I'm the Nerdy Dog",
    quote: "127.6 BPM. Perfect for that transition.",
    packInvite: "Get technical"
  },
  
  // VENUE DOGS
  'tresor': {
    intro: "I'm the Tresor Dog",
    quote: "Detroit-Berlin axis. The vault never closes.",
    packInvite: "Enter the vault"
  },
  'about blank': {
    intro: "I'm the About Blank Dog",
    quote: "Garden party until sunrise. Collective spirit.",
    packInvite: "Join the collective"
  },
  'bassiani': {
    intro: "I'm the Bassiani Dog",
    quote: "Dancing for freedom. Tbilisi never sleeps.",
    packInvite: "Dance for freedom"
  },
  'khidi': {
    intro: "I'm the Khidi Dog",
    quote: "Raw, dark, uncompromising. Georgian power.",
    packInvite: "Go raw"
  },
  'concrete': {
    intro: "I'm the Concrete Dog",
    quote: "Sunrise on the Seine. Paris knows.",
    packInvite: "Witness legend"
  },
  'de school': {
    intro: "I'm the De School Dog",
    quote: "Class is in session. Amsterdam teaches.",
    packInvite: "Learn the lesson"
  },
  'fold': {
    intro: "I'm the Fold Dog",
    quote: "24+ hours of darkness. East London delivers.",
    packInvite: "Disappear inside"
  },
  'fuse': {
    intro: "I'm the Fuse Dog",
    quote: "Low ceiling. High energy. Brussels legend.",
    packInvite: "Feel the heat"
  },
  'instytut': {
    intro: "I'm the Instytut Dog",
    quote: "Silesian steel. Katowice industrial.",
    packInvite: "Go industrial"
  },
  'marble bar': {
    intro: "I'm the Marble Bar Dog",
    quote: "Birthplace of techno. Detroit forever.",
    packInvite: "Respect the source"
  },
  'vent': {
    intro: "I'm the Vent Dog",
    quote: "Tokyo intimacy. Perfect sound. Zero ego.",
    packInvite: "Experience perfection"
  },
  'video club': {
    intro: "I'm the Video Club Dog",
    quote: "Bogotá underground. Colombian fire.",
    packInvite: "Feel the fire"
  },
  'd-edge': {
    intro: "I'm the D-Edge Dog",
    quote: "São Paulo marathon. South American soul.",
    packInvite: "Run all night"
  },
  'mutek': {
    intro: "I'm the MUTEK Dog",
    quote: "Audiovisual experiment. Art and sound collide.",
    packInvite: "Experience the glitch"
  },
  'sub club': {
    intro: "I'm the Sub Club Dog",
    quote: "Melbourne underground. Australian bass.",
    packInvite: "Go down under"
  },
  'security': {
    intro: "I'm the Security Dog",
    quote: "Eyes on the floor. Protecting the vibe.",
    packInvite: "Stay safe"
  },
  'bartender': {
    intro: "I'm the Bartender Dog",
    quote: "Club mate and water. The real fuel.",
    packInvite: "Stay hydrated"
  },
  'sven marquardt': {
    intro: "I'm the Sven Marquardt Dog",
    quote: "You shall not pass. Unless you're ready.",
    packInvite: "Be ready"
  },
  
  // FESTIVAL DOGS
  'aquasella': {
    intro: "I'm the Aquasella Dog",
    quote: "River raving in Asturias. Nature and bass.",
    packInvite: "Find nature"
  },
  'aquia real raver': {
    intro: "I'm the Aquia Real Raver Dog",
    quote: "La Real til sunrise. Hands up always.",
    packInvite: "Live for festivals"
  },
  
  // GEAR
  'dawless': {
    intro: "I'm the Dawless Dog",
    quote: "No laptop. Just hardware. Pure performance.",
    packInvite: "Go dawless"
  },
  
  // LEGENDS
  'eulogio': {
    intro: "I'm the Eulogio Dog",
    quote: "Asturian crate-digger. Wayfarers on. La Real forever.",
    packInvite: "Dig deep"
  },
  'm.e.n': {
    intro: "I'm the M.E.N Dog",
    quote: "Moog Barcelona basement. Deep hypnotic always.",
    packInvite: "Go hypnotic"
  },
  
  // FOUNDERS
  'alex': {
    intro: "I'm the Alex Dog",
    quote: "Ideas are cheap. Execution is everything. Let's build.",
    packInvite: "Build something"
  },
  'paloma': {
    intro: "I'm the Paloma Dog",
    quote: "Dreaming in frequencies. Creating in colors.",
    packInvite: "Dream with us"
  },
  'charlie': {
    intro: "I'm the Charlie Dog",
    quote: "Philosophy on the dancefloor. Wisdom in the groove.",
    packInvite: "Think different"
  },
  'dolly': {
    intro: "I'm the Dolly Dog",
    quote: "Nature and knowledge. Books and bass.",
    packInvite: "Learn and grow"
  },
  'antain': {
    intro: "I'm the Antain Dog",
    quote: "Irish-Asturian soul. Curly vibes. Creating always.",
    packInvite: "Create freely"
  },
  'la pipa': {
    intro: "I'm the La Pipa Dog",
    quote: "Beyond the obvious. Something stranger. Always questioning.",
    packInvite: "Question everything"
  },
  'ron': {
    intro: "I'm the Ron Dog — mad technologist from Los Angeles, now building the future from Asturias",
    quote: "Open source everything. Guitar riffs at 4am. Robots in the studio. Cider in hand. The revolution is collaborative.",
    packInvite: "Fork the future with us"
  }
};

// Generate full WhatsApp share text for a doggy
export const getWhatsAppShareText = (dogName: string): string => {
  const slug = dogName.toLowerCase().replace(/\s+/g, '-');
  const message = doggyMessages[dogName.toLowerCase()] || doggyMessages['techno'];
  
  return `🖤 ${message.intro}

"${message.quote}"

${message.packInvite}:
techno.dog/doggies?dog=${slug}`;
};

// Generate shorter SMS/general text share
export const getShortShareText = (dogName: string): string => {
  const message = doggyMessages[dogName.toLowerCase()] || doggyMessages['techno'];
  return `🖤 ${message.intro} — "${message.quote}"`;
};
