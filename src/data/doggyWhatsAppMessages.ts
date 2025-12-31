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
    intro: "I'm the Happy Dog — tail wagging at 128 BPM since birth",
    quote: "The bass drops, my ears flop, the serotonin flows. Life is a warehouse rave and I brought snacks.",
    packInvite: "Wag your tail with us"
  },
  'sleepy': {
    intro: "I'm the Sleepy Dog — professional napper, occasional raver",
    quote: "I'll just rest my eyes for one more track... *wakes up at 2pm on Tuesday*",
    packInvite: "Dream the dream"
  },
  'excited': {
    intro: "I'm the Excited Dog — I SAW A STROBE LIGHT AND NOW I CAN'T STOP",
    quote: "EVERY. SINGLE. BEAT. IS THE BEST BEAT. Wait— THIS ONE! No wait— THIS ONE!",
    packInvite: "LOSE IT WITH US"
  },
  'grumpy': {
    intro: "I'm the Grumpy Dog — your taste in techno is statistically mid",
    quote: "Oh wow, another DJ playing that track. How original. *aggressively still dancing*",
    packInvite: "Prove your crate"
  },
  'curious': {
    intro: "I'm the Curious Dog — I need to sniff every synthesizer in the booth",
    quote: "What patch cable is that? Is that a Buchla? Can I lick it? Why does it smell like 1983?",
    packInvite: "Investigate the sound"
  },
  'party': {
    intro: "I'm the Party Dog — I brought glowsticks and zero regrets",
    quote: "If the bass isn't rearranging my internal organs, is it even a party?",
    packInvite: "Bring the chaos"
  },
  'dj': {
    intro: "I'm the DJ Dog — I can hear your requests but I'm choosing not to",
    quote: "Reading the floor is reading souls. Also, no I won't play Sandstorm.",
    packInvite: "Trust the selector"
  },
  'puppy': {
    intro: "I'm the Puppy Dog — what's that loud thing? I LOVE IT",
    quote: "First rave! Why is everyone so sweaty? This fog smells weird! BEST NIGHT OF MY LIFE!",
    packInvite: "Pop your cherry"
  },
  'old': {
    intro: "I'm the Old Dog — I was mixing vinyl before your DJ was born",
    quote: "Back in my day, we had to walk uphill both ways to find a good warehouse. And we liked it.",
    packInvite: "Respect the OGs"
  },
  'techno': {
    intro: "I'm the Techno Dog — no vocals, no nonsense, no mercy",
    quote: "Four to the floor. Eight hours straight. Zero small talk. This is the way.",
    packInvite: "Submit to the rhythm"
  },
  
  // DANCE VIBES
  'dancing': {
    intro: "I'm the Dancing Dog — my legs have been moving since 1992",
    quote: "My body has a restraining order against standing still. The kick drum filed the paperwork.",
    packInvite: "Let your body decide"
  },
  'raving': {
    intro: "I'm the Raving Dog — peak time is not a time, it's a lifestyle",
    quote: "It's 5AM. My shirt is gone. I've made 47 best friends. This is peak civilization.",
    packInvite: "Ascend with us"
  },
  'crazy': {
    intro: "I'm the Crazy Dog — certified unhinged, medically advised to rave",
    quote: "Normal people have hobbies. I have a deep spiritual connection with the sub bass.",
    packInvite: "Embrace the unhinged"
  },
  'fan': {
    intro: "I'm the Fan Dog — front row, hands up, making very intense eye contact with the DJ",
    quote: "Yes I know all 47 aliases. Yes I have the test pressings. Yes this is my whole personality.",
    packInvite: "Stan responsibly"
  },
  'traveller': {
    intro: "I'm the Traveller Dog — my passport has more club stamps than countries",
    quote: "Tresor Tuesday, Bassiani Thursday, questionable life choices Friday through Monday.",
    packInvite: "Chase the sound"
  },
  'zen': {
    intro: "I'm the Zen Dog — I've achieved enlightenment through repetitive kick drums",
    quote: "The 909 is my singing bowl. The warehouse is my temple. The queue is my meditation.",
    packInvite: "Find your frequency"
  },
  'ninja': {
    intro: "I'm the Ninja Dog — nobody saw me enter, nobody will see me leave",
    quote: "In at 2AM, out at 2PM. No photos. No evidence. Only vibes.",
    packInvite: "Move like smoke"
  },
  'space': {
    intro: "I'm the Space Dog — currently orbiting the dancefloor at 140 BPM",
    quote: "Ground control to major woof: I've found intelligent life. They all have good taste in synths.",
    packInvite: "Leave Earth behind"
  },
  'chef': {
    intro: "I'm the Chef Dog — today's special is locally-sourced, free-range techno",
    quote: "This set is a seven-course meal. We're on the third course. Pace yourself.",
    packInvite: "Savor every track"
  },
  'pirate': {
    intro: "I'm the Pirate Dog — sailing the seven warehouses in search of booty bass",
    quote: "Arrr, me hearties! That be the finest 303 squelch I've heard since '94!",
    packInvite: "Join the crew"
  },
  'scientist': {
    intro: "I'm the Scientist Dog — I've peer-reviewed your DJ's transitions",
    quote: "Hypothesis: 127.5 BPM induces transcendence. N=1 (me). Results: extremely promising.",
    packInvite: "Help with the research"
  },
  'rocker': {
    intro: "I'm the Rocker Dog — punk spirit, industrial noise, techno core",
    quote: "They said techno and rock don't mix. They also said I couldn't headbang for 6 hours. Watch me.",
    packInvite: "Mosh in the dark"
  },
  
  // SEASONAL
  'summer': {
    intro: "I'm the Summer Dog — sweating through festival season with zero complaints",
    quote: "Sunset set on the terrace. Warm breeze. Good friends. No thoughts. Only bass.",
    packInvite: "Catch the sunset"
  },
  'christmas': {
    intro: "I'm the Christmas Dog — jingle bells, the 909 swells",
    quote: "All I want for Christmas is a 12-hour closing set and working kidneys by January.",
    packInvite: "Deck the halls with bass"
  },
  'halloween': {
    intro: "I'm the Halloween Dog — the scariest thing I know is last call",
    quote: "Costume theme: haunted warehouse. Reality: just a regular warehouse, but spookier.",
    packInvite: "Dance with the ghosts"
  },
  'valentine': {
    intro: "I'm the Valentine Dog — fell in love on the dancefloor, married the DJ",
    quote: "Roses are red, strobes are blinding, I've been dancing with you since the warm-up set.",
    packInvite: "Find your rave bae"
  },
  'spring': {
    intro: "I'm the Spring Dog — fresh season, fresh sneakers, questionable afterhours",
    quote: "The flowers are blooming. The festivals are coming. My bank account is screaming.",
    packInvite: "Bloom on the floor"
  },
  'autumn': {
    intro: "I'm the Autumn Dog — darker nights, deeper beats, cozier raves",
    quote: "Leaves are falling. Bass is dropping. My seasonal affective disorder is cured by strobes.",
    packInvite: "Embrace the dark"
  },
  'winter': {
    intro: "I'm the Winter Dog — it's cold outside but the warehouse is sweating",
    quote: "Snow on the streets, fire in the speakers, zero need for a jacket once inside.",
    packInvite: "Warm up inside"
  },
  'new year': {
    intro: "I'm the New Year Dog — my only resolution is more afterhours",
    quote: "12 months of bass ahead. No resolutions except 'go harder.' Starting now.",
    packInvite: "Count down with us"
  },
  'easter': {
    intro: "I'm the Easter Dog — hunting for rare vinyl instead of eggs",
    quote: "Found a white label in the crates. Best Easter ever. The bunny can wait.",
    packInvite: "Hunt the sound"
  },
  'birthday': {
    intro: "I'm the Birthday Dog — every rave is a celebration of existence",
    quote: "They said 'act your age.' I'm on hour 9 of a Sunday session. I'm ageless.",
    packInvite: "Celebrate life"
  },
  
  // GENRE DOGS
  'disco': {
    intro: "I'm the Disco Dog — funky ancestor of all things techno",
    quote: "Before there was Roland, there was the groove. Respect your elders, young pups.",
    packInvite: "Get funky with it"
  },
  'thug': {
    intro: "I'm the Thug Dog — too raw for your algorithm",
    quote: "Your Spotify Discover can't find me. Your SoundCloud might. Maybe. If you're worthy.",
    packInvite: "Go off-grid"
  },
  'hypnotic': {
    intro: "I'm the Hypnotic Dog — I've been listening to this same loop for 3 hours and it keeps getting better",
    quote: "One pattern. Eight hours. Infinite depth. You think it's repetitive until you're hypnotized.",
    packInvite: "Surrender to the loop"
  },
  'vinyl': {
    intro: "I'm the Vinyl Dog — that crackle before the drop is my love language",
    quote: "Digital is nice but have you ever seen a DJ sweat over a warped record? That's art.",
    packInvite: "Dig the crates"
  },
  'synth': {
    intro: "I'm the Synth Dog — analog warmth in my veins, patch cables in my dreams",
    quote: "Some people see a Minimoog, they see a synth. I see a portal to another dimension.",
    packInvite: "Patch your soul"
  },
  'acid': {
    intro: "I'm the Acid Dog — squelching my way through life at 303 degrees",
    quote: "That filter cutoff isn't just moving — it's telling the story of 1988 in real time.",
    packInvite: "Get squelchy"
  },
  'industrial': {
    intro: "I'm the Industrial Dog — running on metal, rust, and relentless rhythm",
    quote: "If it sounds like a factory collapsing in slow motion, I'm probably already there.",
    packInvite: "Embrace the noise"
  },
  'minimal': {
    intro: "I'm the Minimal Dog — why use many sound when few sound do trick?",
    quote: "One kick. One hat. One shaker. Three days later you're still nodding. Efficiency.",
    packInvite: "Strip it back"
  },
  'dub': {
    intro: "I'm the Dub Dog — lost in the echo chamber, might never come back",
    quote: "The reverb is so deep I lost my keys in there. Don't need them anyway.",
    packInvite: "Sink into the space"
  },
  '909': {
    intro: "I'm the 909 Dog — that kick drum is my heartbeat now",
    quote: "Roland didn't know they were making the most important instrument ever. But I know.",
    packInvite: "Feel the boom"
  },
  'gabber': {
    intro: "I'm the Gabber Dog — 200 BPM minimum, hakken til death",
    quote: "If your tempo starts with a 1, I'm already asleep. Wake me when it's hardcore.",
    packInvite: "Hakken with us"
  },
  
  // CLUB LIFE
  'berghain': {
    intro: "I'm the Berghain Dog — I've been in the queue so long I've evolved",
    quote: "Maybe this time. Or next time. Or the time after. The door is a teacher.",
    packInvite: "Earn your entry"
  },
  'afterhours': {
    intro: "I'm the Afterhours Dog — the sun is a suggestion, not a rule",
    quote: "They said 'closing time.' The music said otherwise. I believe the music.",
    packInvite: "Push past sunrise"
  },
  'promoter': {
    intro: "I'm the Promoter Dog — building scenes, not just throwing parties",
    quote: "100 people who get it beats 1000 who don't. Curate everything.",
    packInvite: "Support the locals"
  },
  'bouncer': {
    intro: "I'm the Bouncer Dog — I can read your vibe from 50 meters",
    quote: "Nice outfit. Wrong energy. Maybe next week. It's not personal. It's science.",
    packInvite: "Bring the right vibe"
  },
  'producer': {
    intro: "I'm the Producer Dog — spent 847 hours on a track nobody will hear",
    quote: "That snare? Handcrafted from 14 samples. The drop? Three years of my life. Worth it.",
    packInvite: "Make something new"
  },
  'resident': {
    intro: "I'm the Resident Dog — I know every crack in this floor personally",
    quote: "This isn't just a club. This is my living room. And you're all invited. Sort of.",
    packInvite: "Find your home floor"
  },
  'warm up': {
    intro: "I'm the Warm Up Dog — I set tables, literally and metaphorically",
    quote: "Playing at midnight to an empty floor. By 2AM they'll understand. I'm playing the long game.",
    packInvite: "Appreciate the build"
  },
  'peak time': {
    intro: "I'm the Peak Time Dog — 3AM IS NOT A TIME, IT'S A STATE OF BEING",
    quote: "Maximum energy. Maximum sweat. Maximum existential clarity. This is the summit.",
    packInvite: "Meet us at the peak"
  },
  'closing': {
    intro: "I'm the Closing Dog — emotional damage delivered at 7AM",
    quote: "Last track hits different. Everyone crying. All the feelings. Perfect Sunday morning.",
    packInvite: "Stay for the end"
  },
  'modular': {
    intro: "I'm the Modular Dog — I have more patch cables than life choices",
    quote: "People ask 'is it finished?' Finished? It's alive. It's never finished. Neither am I.",
    packInvite: "Get tangled up"
  },
  'analog': {
    intro: "I'm the Analog Dog — warm signals only, cold digital begone",
    quote: "You can keep your laptop. I'll keep my dust, my hum, and my soul.",
    packInvite: "Keep it real"
  },
  'vj': {
    intro: "I'm the VJ Dog — painting with photons while you dance",
    quote: "Every beat gets a visual. Every drop gets a flash. Every moment gets remembered in light.",
    packInvite: "See the sound"
  },
  'underground': {
    intro: "I'm the Underground Dog — the best parties have no address",
    quote: "If you found the flyer, you're maybe worthy. If you found the venue, you're definitely worthy.",
    packInvite: "Find the secret"
  },
  'purist': {
    intro: "I'm the Purist Dog — if it's not 4/4, it's not coming through these speakers",
    quote: "Techno has rules. I didn't make them. I just enforce them. Militantly.",
    packInvite: "Keep it pure"
  },
  'tourist': {
    intro: "I'm the Tourist Dog — first time in this city, heading straight to the club",
    quote: "Jet-lagged, no hotel, straight from the airport. Priorities: sorted.",
    packInvite: "Explore the scene"
  },
  'legend': {
    intro: "I'm the Legend Dog — still here since the beginning",
    quote: "I've seen DJs rise and fall. Clubs open and close. But the beat? The beat stays.",
    packInvite: "Learn the history"
  },
  'nerdy': {
    intro: "I'm the Nerdy Dog — I've analyzed this BPM to three decimal places",
    quote: "127.35 to 127.87 BPM over 32 bars. Exquisite acceleration. *adjusts glasses*",
    packInvite: "Nerd out with us"
  },
  
  // VENUE DOGS
  'tresor': {
    intro: "I'm the Tresor Dog — Detroit heart, Berlin soul, vault vibes",
    quote: "The power plant is closed. The power is not. Some things never die.",
    packInvite: "Enter the vault"
  },
  'about blank': {
    intro: "I'm the About Blank Dog — garden party energy, collective therapy vibes",
    quote: "There's a garden. There's techno. There's community. That's literally everything.",
    packInvite: "Join the collective"
  },
  'bassiani': {
    intro: "I'm the Bassiani Dog — dancing for freedom in the Georgian underground",
    quote: "When they tried to shut us down, we danced harder. This floor is political.",
    packInvite: "Dance for freedom"
  },
  'khidi': {
    intro: "I'm the Khidi Dog — raw Tbilisi industrial vibes only",
    quote: "Uncompromising. Unrelenting. Unforgettable. Georgian techno hits different.",
    packInvite: "Go harder"
  },
  'concrete': {
    intro: "I'm the Concrete Dog — sunrise over the Seine never gets old",
    quote: "The boat doesn't rock. My sense of reality does. Every single time.",
    packInvite: "Float with legends"
  },
  'de school': {
    intro: "I'm the De School Dog — class is forever in session",
    quote: "They said 'school's out.' We said 'school is a state of mind now.'",
    packInvite: "Enroll forever"
  },
  'fold': {
    intro: "I'm the Fold Dog — 24+ hours of South London darkness",
    quote: "Entered Friday. Left Sunday. Not sure what day it is. Don't care.",
    packInvite: "Disappear"
  },
  'fuse': {
    intro: "I'm the Fuse Dog — low ceilings, high temperatures, Brussels legend",
    quote: "The ceiling is close but the vibe is closer. Intimacy in industrial form.",
    packInvite: "Feel the heat"
  },
  'instytut': {
    intro: "I'm the Instytut Dog — Silesian steel, Katowice industrial power",
    quote: "Built in a machine. Sounds like a machine. Moves like a machine. Perfect.",
    packInvite: "Go industrial"
  },
  'marble bar': {
    intro: "I'm the Marble Bar Dog — standing on hallowed Detroit ground",
    quote: "Every DJ who played here left a ghost. The ghosts are still dancing.",
    packInvite: "Respect the source"
  },
  'vent': {
    intro: "I'm the Vent Dog — Tokyo precision, zero ego, perfect sound",
    quote: "Small room. Huge sound. Zero talking. Maximum listening. Japanese engineering.",
    packInvite: "Experience perfection"
  },
  'video club': {
    intro: "I'm the Video Club Dog — Bogotá underground fire since day one",
    quote: "Colombian heat. South American soul. Pan-American bass. No borders.",
    packInvite: "Feel the fire"
  },
  'd-edge': {
    intro: "I'm the D-Edge Dog — São Paulo marathon runner extraordinaire",
    quote: "Started Friday lunch. It's now Sunday brunch. Brazilian hospitality.",
    packInvite: "Run the marathon"
  },
  'mutek': {
    intro: "I'm the MUTEK Dog — where audiovisual experiments go to blow minds",
    quote: "Is it a concert? Is it an installation? Is it a life-changing experience? Yes.",
    packInvite: "Experience the glitch"
  },
  'sub club': {
    intro: "I'm the Sub Club Dog — Melbourne's finest export to Glasgow",
    quote: "Down under meets up over. The bass travels well.",
    packInvite: "Go down under"
  },
  'security': {
    intro: "I'm the Security Dog — my eyes are everywhere and my judgment is fair",
    quote: "Seen everything. Judge nothing. Protect everything. That's the job.",
    packInvite: "Stay protected"
  },
  'bartender': {
    intro: "I'm the Bartender Dog — hydrating ravers since forever",
    quote: "Club Mate. Water. Love. In that order. Your dancing depends on me.",
    packInvite: "Stay hydrated"
  },
  'sven marquardt': {
    intro: "I'm the Sven Marquardt Dog — the door is a philosophy",
    quote: "You shall not pass. Unless you're ready. And you're probably not. Come back.",
    packInvite: "Earn your stripes"
  },
  
  // FESTIVAL DOGS
  'aquasella': {
    intro: "I'm the Aquasella Dog — river raving in Asturias with cider",
    quote: "Mountains. Rivers. Techno. Sidra. Three decades of magic. Still going.",
    packInvite: "Find nature and bass"
  },
  'aquia real raver': {
    intro: "I'm the Aquia Real Raver Dog — La Real until my legs give out",
    quote: "Hands up from dusk til dawn. Repeat every summer. No negotiation.",
    packInvite: "Rave forever"
  },
  
  // GEAR & STYLE
  'dawless': {
    intro: "I'm the Dawless Dog — no laptop, no safety net, pure chaos",
    quote: "If it can't fit in a case and cause technical problems live, I'm not interested.",
    packInvite: "Unplug and play"
  },
  
  // LEGENDS
  'eulogio': {
    intro: "I'm the Eulogio Dog — Asturian legend, crate-digger supreme, Wayfarers on",
    quote: "From the Real to the world. 25 years of digging. The vinyl knows my hands.",
    packInvite: "Dig with the master"
  },
  'm.e.n': {
    intro: "I'm the M.E.N Dog — deep in the Moog Barcelona basement forever",
    quote: "Hypnotic is not a style, it's a religion. I'm the high priest.",
    packInvite: "Worship the groove"
  },
  
  // FOUNDERS
  'alex': {
    intro: "I'm the Alex Dog — scruffy Irish ideas machine, powered by chaos",
    quote: "Built it. Broke it. Built it better. Repeat until brilliant or exhausted.",
    packInvite: "Build weird things"
  },
  'paloma': {
    intro: "I'm the Paloma Dog — alien soul founder, dreaming in impossible colors",
    quote: "This planet is temporary. The frequency is eternal. Let's create something weird.",
    packInvite: "Dream impossible things"
  },
  'charlie': {
    intro: "I'm the Charlie Dog — mohawk philosopher, glasses-adjusting wisdom dispenser",
    quote: "Nietzsche walked so techno could run. Think about it. While you dance.",
    packInvite: "Philosophize on the floor"
  },
  'dolly': {
    intro: "I'm the Dolly Dog — bookish nature lover, bass in the bloodstream",
    quote: "Reading about fungi while the sub-bass hits. Both are networks. Both are life.",
    packInvite: "Learn and groove"
  },
  'antain': {
    intro: "I'm the Antain Dog — Irish-Asturian curly-haired creative soul",
    quote: "Half Celtic, half Cantabrian, fully committed to making beautiful noise.",
    packInvite: "Create something wild"
  },
  'la pipa': {
    intro: "I'm the LA PIPA Dog — beyond the obvious, into the stranger",
    quote: "Why be normal when you can be a brutalist art collective with excellent taste?",
    packInvite: "Question everything"
  },
  'ron': {
    intro: "I'm the Ron Dog — mad technologist from Los Angeles, now building the future from Asturias",
    quote: "Open source everything. Guitar riffs at 4am. Robots in the studio. Cider in hand. The revolution is collaborative.",
    packInvite: "Fork the future with us"
  },
  'julieta': {
    intro: "I'm the Julieta Dog — Madrid party queen, ex-London raver, absolutely unhinged on the dancefloor",
    quote: "Madrid nights, London memories, zero regrets. If the bass isn't making my earrings shake, we need a bigger speaker.",
    packInvite: "Party with us til sunrise"
  },
  'pire': {
    intro: "I'm the Pire Dog — globe-trotting acid head, serious business by day, serious party by night",
    quote: "San Francisco sunrise, London warehouse, Madrid afterhours. The 303 doesn't care about time zones and neither do I.",
    packInvite: "Squelch across continents with us"
  },
  'alberto': {
    intro: "I'm the Alberto Dog — Argentinian soul in London, grilling steaks by day, waving glow sticks by night",
    quote: "The asado is perfect, the friends are beautiful, the bass is heavy. From Buenos Aires to Brixton, this is the life.",
    packInvite: "Dance with us til the sun comes up"
  },
  'richard': {
    intro: "I'm the Richard Dog — steel factory legend by day, Paranoox underground king by night",
    quote: "8 hours forging metal in Gijón, 8 hours forging memories at Paranoox. The beard grows longer with every kick drum.",
    packInvite: "Join the Paranoox family"
  },
  'fran': {
    intro: "I'm the Fran Dog — showjumping legend from Gijón, now raving in Bali til sunrise",
    quote: "90s clubs taught me how to fly without a horse. Big smile, bigger beats, the dancefloor is my arena.",
    packInvite: "Jump into the pack"
  },
  'yayo': {
    intro: "I'm the Yayo Dog — DJ, producer, Neverland commander with the moustache of legends",
    quote: "Behind these glasses I see frequencies. Under this moustache lives bass. The pointy hair? That's just style.",
    packInvite: "Enter Neverland with us"
  },
  'helios': {
    intro: "I'm the Helios Dog — funky soul with flowing locks, the mustache of legends, and a voice that moves crowds",
    quote: "Long hair catches the strobe light, the mustache catches the bass, and my voice catches your soul. Grab the mic, let's go.",
    packInvite: "Sing along with the pack"
  },
  'jeremias': {
    intro: "I'm the Jeremias Dog — Frankfurt banker from Gijón, glasses on, gap-toothed grin ready, party mode activated",
    quote: "By day I crunch euros in Frankfurt. By night these slit eyes scan the dancefloor. Gijón roots never die, the gap in my teeth lets the bass through.",
    packInvite: "Bank on the beat with us"
  },
  'josin': {
    intro: "I'm the Josin Dog — eternal bookworm with ponytail wisdom, reading between the beats",
    quote: "Knowledge is the ultimate bass. Every book I read adds another layer to the mix. The ponytail keeps the thoughts flowing, the glasses focus the frequencies.",
    packInvite: "Read and rave with us"
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
