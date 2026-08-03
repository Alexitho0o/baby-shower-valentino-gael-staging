const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }

  return value;
};

export const GIFT_SELECTION_VALUES = Object.freeze({
  diapers: "diapers",
  bottle: "bottle",
  shirt: "shirt",
  pants: "pants",
  other: "other",
});

export const GIFT_CATALOG_CONFIG = deepFreeze({
  schemaVersion: 1,
  enabled: true,
  optional: true,
  availabilityMode: "preview",
  maxReservationsPerCatalogItem: 2,
  introduction: {
    title: "¿Te gustaría llevar un presente?",
    message:
      "Tu presencia es lo más importante. Ya contamos con todo lo necesario para recibir a Valentino. Si deseas llevar un presente, puedes seleccionar uno o más regalos. Esta información solo nos ayudará a evitar repeticiones; no existen marcas, precios ni preferencias de valor.",
  },
  items: [
    {
      id: GIFT_SELECTION_VALUES.diapers,
      label: "Pañales",
      capacity: 2,
      requiresDetail: false,
    },
    {
      id: GIFT_SELECTION_VALUES.bottle,
      label: "Mamadera",
      capacity: 2,
      requiresDetail: false,
    },
    {
      id: GIFT_SELECTION_VALUES.shirt,
      label: "Polera",
      capacity: 2,
      requiresDetail: false,
    },
    {
      id: GIFT_SELECTION_VALUES.pants,
      label: "Pantalón",
      capacity: 2,
      requiresDetail: false,
    },
    {
      id: GIFT_SELECTION_VALUES.other,
      label: "Otro regalo",
      capacity: null,
      requiresDetail: true,
    },
  ],
});
