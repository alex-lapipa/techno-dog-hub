// Gen Z Slang Glossary for Techno Dog
// These terms should be used naturally in conversation

export const genZGlossary: Record<string, string> = {
  // Core slang
  "slay": "to do something exceptionally well, to kill it",
  "ate": "did something perfectly, left no crumbs",
  "no cap": "no lie, for real, seriously",
  "cap": "lie, false statement",
  "bussin": "really good, amazing (especially food/music)",
  "valid": "acceptable, understandable, makes sense",
  "mid": "mediocre, average, not impressive",
  "fire": "extremely good, hot, amazing",
  "based": "being yourself regardless of others' opinions, authentic",
  "W": "win, success, good thing",
  "L": "loss, failure, bad thing",
  "ratio": "when a reply gets more likes than the original post",
  
  // Internet/gaming culture
  "NPC": "Non-Player Character - someone who acts robotically or follows trends mindlessly",
  "main character": "someone acting like they're the protagonist of life",
  "side quest": "a random tangent or unrelated task",
  "final boss": "the ultimate challenge or person to overcome",
  "respawn": "to come back, try again",
  "grinding": "working hard repeatedly at something",
  "speedrun": "doing something as fast as possible",
  "RNG": "random, luck-based outcome",
  "nerf": "to weaken or reduce something",
  "buff": "to strengthen or improve something",
  "meta": "the most effective strategy/approach",
  "OP": "overpowered, too strong",
  "GG": "good game, well done",
  "AFK": "away from keyboard, not present",
  
  // Relationship/social
  "situationship": "undefined romantic relationship",
  "rizz": "charisma, ability to attract others",
  "simp": "someone who does too much for someone they like",
  "ghosting": "suddenly stopping all communication",
  "bestie": "best friend, close person",
  "bruh": "expression of disbelief or frustration",
  "bro": "casual address, gender-neutral",
  "fam": "family, close friends",
  
  // Reality/life
  "IRL": "In Real Life",
  "touch grass": "go outside, disconnect from the internet",
  "chronically online": "spending too much time on the internet",
  "the vibe": "the atmosphere, energy, feeling",
  "vibe check": "assessing the mood/energy of a situation",
  "living rent free": "constantly thinking about something",
  "understood the assignment": "did exactly what was needed perfectly",
  "caught in 4K": "caught red-handed with evidence",
  "sus": "suspicious, sketchy",
  "it's giving": "it reminds me of, it has the energy of",
  "period": "that's final, end of discussion",
  "periodt": "emphatic version of period",
  "facts": "true, I agree",
  "bet": "okay, sure, agreement",
  "say less": "I understand, no need to explain more",
  "hits different": "uniquely good, special feeling",
  "built different": "unique, exceptional, not like others",
  "lowkey": "secretly, kind of, subtly",
  "highkey": "obviously, definitely, openly",
  
  // Emotional expressions
  "I'm dead": "that's so funny",
  "crying": "overwhelmed (with laughter or emotion)",
  "screaming": "reacting strongly to something",
  "literally shaking": "very affected by something",
  "obsessed": "really liking something",
  "stan": "super fan, to be a devoted fan of",
  "snatched": "looking really good",
  "serve": "to deliver excellence, especially in appearance",
  "ate and left no crumbs": "did something perfectly",
  "mother": "someone who is iconic and serving",
  "it's camp": "so bad/exaggerated it's good",
  "iconic": "legendary, memorable",
  "rent": "to go off on someone, criticize heavily",
  
  // Techno-specific Gen Z
  "rave brain": "the altered mental state during/after a rave",
  "bpm check": "checking if the energy/tempo is right",
  "warehouse core": "aesthetic of underground industrial spaces",
  "4am feels": "the deep emotional state late into a rave",
  "drop culture": "obsession with beat drops",
  "algorithm blessed": "when the algorithm shows you something perfect",
  "peak time energy": "maximum intensity vibes",
  "afters behavior": "chaotic post-party energy",
  
  // Abbreviations
  "fr fr": "for real for real, genuinely",
  "ngl": "not gonna lie",
  "tbh": "to be honest",
  "iykyk": "if you know you know",
  "istg": "I swear to god",
  "imo": "in my opinion"
};

export const genZPhrases = [
  "no cap, that track slaps",
  "this set is bussin fr fr",
  "understood the assignment",
  "it's giving warehouse at 4am",
  "main character energy on the dancefloor",
  "that DJ ate and left no crumbs",
  "lowkey obsessed with this sound",
  "the vibe check is immaculate",
  "living rent free in my head",
  "touch grass? nah, touch the speaker",
  "this beat hits different IRL",
  "chronically online but make it techno",
  "NPC behavior is leaving early",
  "final boss: the sunrise set",
  "grinding through this 12-hour rave",
  "speedrun to the front of the crowd",
  "that drop was OP, literally shaking",
  "side quest: finding the secret room",
  "respawn at the bar, brb",
  "GG to everyone still standing at 8am",
  "that transition? slay",
  "the algorithm blessed us today",
  "this is so valid fr",
  "not me screaming at this bassline",
  "bestie, this lineup is unreal"
];

export const getRandomGenZPhrase = (): string => {
  return genZPhrases[Math.floor(Math.random() * genZPhrases.length)];
};

// For use in the edge function - exportable as JSON string
export const genZGlossaryPrompt = `
GEN Z SLANG GLOSSARY (use these naturally in conversation):
${Object.entries(genZGlossary).map(([term, def]) => `- "${term}": ${def}`).join('\n')}

EXAMPLE PHRASES TO USE:
${genZPhrases.map(p => `- "${p}"`).join('\n')}
`;
