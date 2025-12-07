export interface TimelineEvent {
  id: string;
  year: number;
  month?: string;
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  category: 'birth' | 'release' | 'venue' | 'label' | 'cultural' | 'political';
  location?: string;
  relatedArtists?: string[];
  relatedVenues?: string[];
  relatedLabels?: string[];
}

export const timeline: TimelineEvent[] = [
  {
    id: "kraftwerk-autobahn",
    year: 1974,
    title: {
      en: "Kraftwerk releases 'Autobahn'",
      es: "Kraftwerk lanza 'Autobahn'"
    },
    description: {
      en: "German electronic pioneers Kraftwerk release 'Autobahn', laying the foundation for all electronic dance music to come.",
      es: "Los pioneros electrónicos alemanes Kraftwerk lanzan 'Autobahn', sentando las bases de toda la música electrónica de baile."
    },
    category: "release",
    location: "Düsseldorf, Germany"
  },
  {
    id: "belleville-three",
    year: 1981,
    title: {
      en: "The Belleville Three meet in Detroit",
      es: "Los Tres de Belleville se conocen en Detroit"
    },
    description: {
      en: "Juan Atkins, Derrick May, and Kevin Saunderson—three high school friends from Belleville, Michigan—begin making music together.",
      es: "Juan Atkins, Derrick May y Kevin Saunderson—tres amigos del instituto de Belleville, Michigan—empiezan a hacer música juntos."
    },
    category: "birth",
    location: "Detroit, USA",
    relatedArtists: ["Juan Atkins", "Derrick May", "Kevin Saunderson"]
  },
  {
    id: "techno-coined",
    year: 1988,
    title: {
      en: "'Techno! The New Dance Sound of Detroit' compilation",
      es: "'Techno! The New Dance Sound of Detroit' - la compilación"
    },
    description: {
      en: "Virgin UK releases the compilation that gives the genre its name. Techno is officially born.",
      es: "Virgin UK lanza la compilación que da nombre al género. El techno nace oficialmente."
    },
    category: "release",
    location: "Detroit/London"
  },
  {
    id: "underground-resistance-founded",
    year: 1989,
    title: {
      en: "Underground Resistance is founded",
      es: "Se funda Underground Resistance"
    },
    description: {
      en: "Mad Mike Banks, Jeff Mills, and Robert Hood form the militant collective that would define techno's political edge.",
      es: "Mad Mike Banks, Jeff Mills y Robert Hood forman el colectivo militante que definiría el lado político del techno."
    },
    category: "label",
    location: "Detroit, USA",
    relatedLabels: ["underground-resistance"]
  },
  {
    id: "tresor-opens",
    year: 1991,
    title: {
      en: "Tresor opens in Berlin",
      es: "Tresor abre en Berlín"
    },
    description: {
      en: "In a vault beneath the Wertheim department store, Tresor opens—creating the Detroit-Berlin axis that would define techno's future.",
      es: "En una bóveda bajo los almacenes Wertheim, abre Tresor—creando el eje Detroit-Berlín que definiría el futuro del techno."
    },
    category: "venue",
    location: "Berlin, Germany",
    relatedVenues: ["tresor"]
  },
  {
    id: "downwards-founded",
    year: 1993,
    title: {
      en: "Downwards Records founded in Birmingham",
      es: "Se funda Downwards Records en Birmingham"
    },
    description: {
      en: "Regis and Female establish Downwards, the dark heart of Birmingham's industrial techno scene.",
      es: "Regis y Female fundan Downwards, el corazón oscuro de la escena de techno industrial de Birmingham."
    },
    category: "label",
    location: "Birmingham, UK",
    relatedLabels: ["downwards"]
  },
  {
    id: "criminal-justice-act",
    year: 1994,
    title: {
      en: "Criminal Justice Act passed in UK",
      es: "Se aprueba la Ley de Justicia Criminal en UK"
    },
    description: {
      en: "The UK government bans gatherings with music 'characterized by repetitive beats'. The rave culture goes underground.",
      es: "El gobierno del Reino Unido prohíbe reuniones con música 'caracterizada por beats repetitivos'. La cultura rave pasa a la clandestinidad."
    },
    category: "political",
    location: "United Kingdom"
  },
  {
    id: "minimal-nation-release",
    year: 1994,
    title: {
      en: "Robert Hood releases 'Minimal Nation'",
      es: "Robert Hood lanza 'Minimal Nation'"
    },
    description: {
      en: "The album that defined minimal techno. Stripped to the bone. Pure machine soul.",
      es: "El álbum que definió el minimal techno. Despojado hasta el hueso. Pura alma de máquina."
    },
    category: "release",
    location: "Detroit, USA",
    relatedArtists: ["robert-hood"]
  },
  {
    id: "berghain-opens",
    year: 2004,
    title: {
      en: "Berghain opens in Berlin",
      es: "Berghain abre en Berlín"
    },
    description: {
      en: "The former power plant becomes the cathedral of techno. The world changes.",
      es: "La antigua central eléctrica se convierte en la catedral del techno. El mundo cambia."
    },
    category: "venue",
    location: "Berlin, Germany",
    relatedVenues: ["berghain"]
  },
  {
    id: "bassiani-opens",
    year: 2014,
    title: {
      en: "Bassiani opens in Tbilisi",
      es: "Bassiani abre en Tbilisi"
    },
    description: {
      en: "A club opens in a Soviet swimming pool. It becomes a symbol of Georgian youth resistance.",
      es: "Un club abre en una piscina soviética. Se convierte en símbolo de la resistencia juvenil georgiana."
    },
    category: "venue",
    location: "Tbilisi, Georgia",
    relatedVenues: ["bassiani"]
  },
  {
    id: "bassiani-raid",
    year: 2018,
    title: {
      en: "Bassiani raid and protests",
      es: "Redada en Bassiani y protestas"
    },
    description: {
      en: "Police raid Bassiani. Thousands take to the streets in protest. 'We Dance Together, We Fight Together.'",
      es: "La policía hace una redada en Bassiani. Miles salen a las calles a protestar. 'Bailamos Juntos, Luchamos Juntos.'"
    },
    category: "political",
    location: "Tbilisi, Georgia",
    relatedVenues: ["bassiani"]
  },
  {
    id: "covid-closures",
    year: 2020,
    title: {
      en: "Global club closures due to COVID-19",
      es: "Cierre global de clubs por COVID-19"
    },
    description: {
      en: "The pandemic forces clubs worldwide to close. The scene goes silent. Streaming becomes the norm.",
      es: "La pandemia obliga a los clubs de todo el mundo a cerrar. La escena se silencia. El streaming se convierte en norma."
    },
    category: "cultural",
    location: "Worldwide"
  },
  {
    id: "berghain-30",
    year: 2024,
    title: {
      en: "Berghain celebrates 20 years",
      es: "Berghain celebra 20 años"
    },
    description: {
      en: "The institution marks two decades of uncompromising techno.",
      es: "La institución marca dos décadas de techno sin compromisos."
    },
    category: "cultural",
    location: "Berlin, Germany",
    relatedVenues: ["berghain"]
  }
];

export const getTimelineByYear = (year: number) => timeline.filter(e => e.year === year);
export const getTimelineByCategory = (category: TimelineEvent['category']) => timeline.filter(e => e.category === category);
export const getTimelineByDecade = (decade: number) => timeline.filter(e => e.year >= decade && e.year < decade + 10);
