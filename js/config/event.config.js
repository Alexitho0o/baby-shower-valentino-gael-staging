const deepFreeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const EVENT_CONFIG = deepFreeze({
  schemaVersion: 2,
  event: {
    type: "Baby Shower",
    title: "Baby Shower de Valentino Gael Burgos León",
    concept: null,
  },
  child: {
    fullName: "Valentino Gael Burgos León",
    displayName: "Valentino Gael",
    principalName: "VALENTINO",
    secondaryName: "GAEL BURGOS LEÓN",
  },
  date: {
    day: 31,
    month: "octubre",
    year: null,
    display: "31 de octubre",
  },
  schedule: {
    start: "12:00",
    end: "19:00",
    display: "12:00 a 19:00 hrs.",
  },
  pool: {
    enabled: true,
    headline: "Habrá piscina",
    reminder: "No olvides tu traje de baño.",
  },
  location: {
    address: "Pedro Víctor Contreras 2447, Villa Alemana, Región de Valparaíso",
    commune: "Villa Alemana",
    region: "Región de Valparaíso",
    country: "Chile",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Pedro%20V%C3%ADctor%20Contreras%202447%2C%20Villa%20Alemana%2C%20Regi%C3%B3n%20de%20Valpara%C3%ADso%2C%20Chile",
  },
  documents: {
    agendaPdfUrl: null,
    photoAlbumUrl: null,
  },
  contact: {
    alexi: {
      name: "Alexi",
      phoneE164: "+56945130486",
      phoneDisplay: "+56 9 4513 0486",
      whatsappUrl: "https://wa.me/56945130486?text=Hola%20Alexi%2C%20tengo%20una%20consulta%20sobre%20el%20Baby%20Shower%20de%20Valentino.",
    },
    vivian: {
      name: "Vivian",
      phoneE164: "+56966191941",
      phoneDisplay: "+56 9 6619 1941",
      whatsappUrl: "https://wa.me/56966191941?text=Hola%20Vivian%2C%20tengo%20una%20consulta%20sobre%20el%20Baby%20Shower%20de%20Valentino.",
    },
  },
  rsvp: {
    deadline: null,
  },
});
