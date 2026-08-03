const deepFreeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const EVENT_CONFIG = deepFreeze({
  schemaVersion: 1,
  event: {
    type: "Baby Shower",
    title: "Baby Shower de Valentino Gael Burgos León",
    concept: "Un cielo de sueños para Valentino Gael.",
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
    address: null,
    commune: null,
    mapUrl: null,
  },
  contact: {
    phone: null,
    email: null,
    whatsapp: null,
  },
  rsvp: {
    deadline: null,
  },
});
