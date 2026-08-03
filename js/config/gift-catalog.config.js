const deepFreeze = (value) => {
  if (
    value
    && typeof value === "object"
    && !Object.isFrozen(value)
  ) {
    Object
      .values(value)
      .forEach(deepFreeze);

    Object.freeze(value);
  }

  return value;
};

export const GIFT_SIZE_VARIANTS = deepFreeze([
  {
    id: "rn",
    label: "RN",
  },
  {
    id: "1_3m",
    label: "1–3 meses",
  },
  {
    id: "3_6m",
    label: "3–6 meses",
  },
  {
    id: "6m_plus",
    label: "6 meses o más",
  },
]);

export const GIFT_SELECTION_VALUES = Object.freeze({
  diapers: "diapers",
  wipes: "wipes",
  protectiveCream: "protective_cream",
  babyWash: "baby_wash",
  cottonCloths: "cotton_cloths",
  bottle: "bottle",
  pacifier: "pacifier",
  teether: "teether",
  bib: "bib",
  bodysuit: "bodysuit",
  pajamas: "pajamas",
  romper: "romper",
  shirt: "shirt",
  pants: "pants",
  outfit: "outfit",
  socks: "socks",
  hat: "hat",
  blanket: "blanket",
  hoodedTowel: "hooded_towel",
  cribSheet: "crib_sheet",
  rattle: "rattle",
  babyBook: "baby_book",
  bathToy: "bath_toy",
  plush: "plush",
  other: "other",
});

const standardItem = (
  id,
  label,
  category,
) => ({
  id,
  label,
  category,
  capacity: 10,
  requiresDetail: false,
  variants: [],
});

const sizedItem = (
  id,
  label,
) => ({
  id,
  label,
  category: "clothing",
  capacity: null,
  requiresDetail: false,
  variants: GIFT_SIZE_VARIANTS.map(
    (variant) => ({
      ...variant,
      reservationKey:
        `${id}__${variant.id}`,
      capacity: 10,
    }),
  ),
});

export const GIFT_CATALOG_CONFIG = deepFreeze({
  schemaVersion: 3,
  enabled: true,
  optional: true,
  availabilityMode: "preview",
  counterRuntimeEnabled: false,
  counterSource: "supabase_rpc_pending",
  selectionKeyMode:
    "item_or_item_variant",
  maxReservationsPerCatalogItem: 10,
  governance: {
    warningAt: 8,
    reviewAt: 10,
    closureMode: "admin_manual",
    autoDisableAtLimit: false,
    publicCountVisibleWhenRuntimeEnabled:
      true,
    sizedItemsHaveIndependentCounters: true,
  },
  introduction: {
    title:
      "¿Te gustaría llevar un presente?",
    message:
      "Tu presencia es lo más importante. Si deseas llevar un presente, puedes seleccionar una o más alternativas. Las prendas permiten escoger talla y cada talla se contará por separado.",
  },
  items: [
    standardItem(
      GIFT_SELECTION_VALUES.diapers,
      "Pañales",
      "hygiene",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.wipes,
      "Toallitas húmedas",
      "hygiene",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.protectiveCream,
      "Crema protectora",
      "hygiene",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.babyWash,
      "Jabón o shampoo para bebé",
      "hygiene",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.cottonCloths,
      "Paños de algodón o muselinas",
      "hygiene",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.bottle,
      "Mamadera",
      "feeding",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.pacifier,
      "Chupete",
      "feeding",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.teether,
      "Mordedor",
      "feeding",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.bib,
      "Babero",
      "feeding",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.bodysuit,
      "Body",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.pajamas,
      "Pijama",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.romper,
      "Enterito",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.shirt,
      "Polera",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.pants,
      "Pantalón",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.outfit,
      "Conjunto",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.socks,
      "Calcetines",
    ),
    sizedItem(
      GIFT_SELECTION_VALUES.hat,
      "Gorro",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.blanket,
      "Manta",
      "rest",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.hoodedTowel,
      "Toalla con capucha",
      "bath",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.cribSheet,
      "Sábana de cuna",
      "rest",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.rattle,
      "Sonajero",
      "stimulation",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.babyBook,
      "Libro infantil",
      "stimulation",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.bathToy,
      "Juguete para el baño",
      "stimulation",
    ),
    standardItem(
      GIFT_SELECTION_VALUES.plush,
      "Peluche",
      "stimulation",
    ),
    {
      id: GIFT_SELECTION_VALUES.other,
      label: "Otro regalo",
      category: "other",
      capacity: null,
      requiresDetail: true,
      variants: [],
    },
  ],
});

export const GIFT_SELECTION_KEYS =
  Object.freeze(
    GIFT_CATALOG_CONFIG.items.flatMap(
      (item) => (
        item.variants.length > 0
          ? item.variants.map(
              (variant) => (
                variant.reservationKey
              ),
            )
          : [item.id]
      ),
    ),
  );
