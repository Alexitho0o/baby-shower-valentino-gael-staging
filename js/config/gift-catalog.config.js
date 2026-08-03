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
  wipes: "wipes",
  protectiveCream: "protective_cream",
  bib: "bib",
  bodysuit: "bodysuit",
  pajamas: "pajamas",
  shirt: "shirt",
  pants: "pants",
  blanket: "blanket",
  hoodedTowel: "hooded_towel",
  toyOrBook: "toy_or_book",
  other: "other",
});

export const GIFT_CATALOG_CONFIG = deepFreeze({
  schemaVersion: 2,
  enabled: true,
  optional: true,
  availabilityMode: "preview",
  counterRuntimeEnabled: false,
  counterSource: "supabase_rpc_pending",
  maxReservationsPerCatalogItem: 10,
  governance: {
    warningAt: 8,
    reviewAt: 10,
    closureMode: "admin_manual",
    autoDisableAtLimit: false,
    publicCountVisibleWhenRuntimeEnabled: true,
  },
  introduction: {
    title: "¿Te gustaría llevar un presente?",
    message:
      "Tu presencia es lo más importante. Ya contamos con todo lo necesario para recibir a Valentino. Si deseas llevar un presente, puedes seleccionar uno o más regalos. Esta información solo nos ayudará a evitar repeticiones; no existen marcas, precios ni preferencias de valor.",
  },
  items: [
    { id: GIFT_SELECTION_VALUES.diapers, label: "Pañales", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.bottle, label: "Mamadera", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.wipes, label: "Toallitas húmedas", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.protectiveCream, label: "Crema protectora", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.bib, label: "Babero", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.bodysuit, label: "Body", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.pajamas, label: "Pijama", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.shirt, label: "Polera", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.pants, label: "Pantalón", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.blanket, label: "Manta", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.hoodedTowel, label: "Toalla con capucha", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.toyOrBook, label: "Sonajero o libro infantil", capacity: 10, requiresDetail: false },
    { id: GIFT_SELECTION_VALUES.other, label: "Otro regalo", capacity: null, requiresDetail: true },
  ],
});
