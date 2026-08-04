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

export const GIFT_CLOTHING_SIZE_VARIANTS =
  deepFreeze([
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

export const GIFT_DIAPER_SIZE_VARIANTS =
  deepFreeze([
    {
      id: "rn",
      label: "RN",
      capacity: 2,
    },
    {
      id: "p",
      label: "P",
      capacity: 4,
    },
    {
      id: "m",
      label: "M",
      capacity: 5,
    },
    {
      id: "g",
      label: "G",
      capacity: 5,
    },
  ]);

export const GIFT_MUSICAL_TOY_VARIANTS =
  deepFreeze([
    {
      id: "piano",
      label: "Piano",
    },
    {
      id: "guitar",
      label: "Guitarra",
    },
    {
      id: "accordion",
      label: "Acordeón",
    },
    {
      id: "bass",
      label: "Bajo",
    },
  ]);

export const GIFT_BOOK_TYPE_VARIANTS =
  deepFreeze([
    {
      id: "interactive",
      label: "Interactivo",
    },
    {
      id: "bedtime",
      label: "Para dormir",
    },
    {
      id: "musical",
      label: "Musical",
    },
    {
      id: "normal",
      label: "Normal",
    },
  ]);

export const GIFT_SELECTION_VALUES =
  Object.freeze({
    wipes: "wipes",
    protectiveCream: "protective_cream",
    babySoap: "baby_soap",
    babyShampoo: "baby_shampoo",
    cottonCloths: "cotton_cloths",
    teether: "teether",
    bib: "bib",
    blanket: "blanket",
    hoodedTowel: "hooded_towel",
    cribSheet: "crib_sheet",
    rattle: "rattle",
    bathToy: "bath_toy",
    plush: "plush",
    diapers: "diapers",
    musicalToy: "musical_toy",
    babyBook: "baby_book",
    bodysuit: "bodysuit",
    pajamas: "pajamas",
    romper: "romper",
    shirt: "shirt",
    pants: "pants",
    outfit: "outfit",
    socks: "socks",
    hat: "hat",
    other: "other",
  });

const buildVariants = (
  itemId,
  variants,
) => (
  variants.map(
    (variant) => ({
      ...variant,
      reservationKey:
        `${itemId}__${variant.id}`,
      capacity:
        variant.capacity ?? 10,
    }),
  )
);

const standardItem = (
  id,
  label,
  category,
  capacity = 10,
) => ({
  id,
  label,
  category,
  optionKind: "basic",
  capacity,
  requiresDetail: false,
  variants: [],
});

const variantItem = ({
  id,
  label,
  category,
  variantLabel,
  variantPlaceholder,
  variantNote,
  variants,
}) => ({
  id,
  label,
  category,
  optionKind: "variant",
  capacity: null,
  requiresDetail: false,
  variantLabel,
  variantPlaceholder,
  variantNote,
  variants: buildVariants(
    id,
    variants,
  ),
});

const sizedItem = (
  id,
  label,
  {
    excludedSizes = [],
    capacityBySize = {},
  } = {},
) => variantItem({
  id,
  label,
  category: "clothing",
  variantLabel: "Talla",
  variantPlaceholder:
    "Selecciona talla",
  variantNote:
    "Cada talla tendrá un contador independiente.",
  variants:
    GIFT_CLOTHING_SIZE_VARIANTS
      .filter(
        (variant) => (
          !excludedSizes.includes(
            variant.id
          )
        ),
      )
      .map(
        (variant) => ({
          ...variant,
          capacity:
            capacityBySize[
              variant.id
            ] ?? 10,
        }),
      ),
});

export const GIFT_CATALOG_CONFIG =
  deepFreeze({
    schemaVersion: 5,
    enabled: true,
    optional: true,
    availabilityMode: "preview",
    counterRuntimeEnabled: false,
    counterSource:
      "supabase_rpc_pending",
    selectionKeyMode:
      "item_or_item_variant",
    maxReservationsPerCatalogItem:
      10,
    governance: {
      warningAt: 8,
      reviewAt: 10,
      closureMode: "admin_manual",
      autoDisableAtLimit: false,
      publicCountVisibleWhenRuntimeEnabled:
        true,
      sizedItemsHaveIndependentCounters: true,
      typedItemsHaveIndependentCounters: true,
    },
    introduction: {
      title:
        "¿Te gustaría llevar un presente?",
      message:
        "A medida que las personas elijan una opción, algunas podrán quedar no disponibles. Si igualmente quieres regalar algo de ese tipo, selecciona Otro regalo y descríbelo.",
    },
    items: [
      standardItem(
        GIFT_SELECTION_VALUES.wipes,
        "Toallitas húmedas",
        "hygiene",
        40,
      ),
      standardItem(
        GIFT_SELECTION_VALUES
          .protectiveCream,
        "Crema protectora",
        "hygiene",
      ),
      standardItem(
        GIFT_SELECTION_VALUES.babySoap,
        "Jabón para bebé",
        "hygiene",
      ),
      standardItem(
        GIFT_SELECTION_VALUES
          .babyShampoo,
        "Shampoo para bebé",
        "hygiene",
      ),
      standardItem(
        GIFT_SELECTION_VALUES
          .cottonCloths,
        "Paños de algodón o muselinas",
        "hygiene",
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
      standardItem(
        GIFT_SELECTION_VALUES.blanket,
        "Manta",
        "rest",
      ),
      standardItem(
        GIFT_SELECTION_VALUES
          .hoodedTowel,
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
        GIFT_SELECTION_VALUES.bathToy,
        "Juguete para el baño",
        "stimulation",
      ),
      standardItem(
        GIFT_SELECTION_VALUES.plush,
        "Peluche",
        "stimulation",
      ),
      variantItem({
        id:
          GIFT_SELECTION_VALUES.diapers,
        label: "Pañales",
        category: "hygiene",
        variantLabel:
          "Talla referencial",
        variantPlaceholder:
          "Selecciona talla",
        variantNote:
          "La edad es orientativa; el peso y el ajuste definen la talla.",
        variants:
          GIFT_DIAPER_SIZE_VARIANTS,
      }),
      variantItem({
        id:
          GIFT_SELECTION_VALUES
            .musicalToy,
        label: "Juguete musical",
        category: "stimulation",
        variantLabel: "Instrumento",
        variantPlaceholder:
          "Selecciona instrumento",
        variantNote:
          "Cada instrumento tendrá un contador independiente.",
        variants:
          GIFT_MUSICAL_TOY_VARIANTS,
      }),
      variantItem({
        id:
          GIFT_SELECTION_VALUES
            .babyBook,
        label: "Libro infantil",
        category: "stimulation",
        variantLabel:
          "Tipo de libro",
        variantPlaceholder:
          "Selecciona tipo",
        variantNote:
          "Cada tipo tendrá un contador independiente.",
        variants:
          GIFT_BOOK_TYPE_VARIANTS,
      }),
      sizedItem(
        GIFT_SELECTION_VALUES.bodysuit,
        "Body",
        {
          excludedSizes: ["rn"],
          capacityBySize: {
            "6m_plus": 6,
          },
        },
      ),
      sizedItem(
        GIFT_SELECTION_VALUES.pajamas,
        "Pijama",
      ),
      sizedItem(
        GIFT_SELECTION_VALUES.romper,
        "Enterito",
        {
          excludedSizes: ["rn"],
        },
      ),
      sizedItem(
        GIFT_SELECTION_VALUES.shirt,
        "Polera",
        {
          excludedSizes: ["rn"],
        },
      ),
      sizedItem(
        GIFT_SELECTION_VALUES.pants,
        "Pantalón",
        {
          excludedSizes: ["rn"],
        },
      ),
      sizedItem(
        GIFT_SELECTION_VALUES.outfit,
        "Conjunto",
        {
          excludedSizes: ["rn"],
        },
      ),
      sizedItem(
        GIFT_SELECTION_VALUES.socks,
        "Calcetines",
      ),
      sizedItem(
        GIFT_SELECTION_VALUES.hat,
        "Gorro",
        {
          excludedSizes: [
            "3_6m",
            "6m_plus",
          ],
        },
      ),
      {
        id:
          GIFT_SELECTION_VALUES.other,
        label: "Otro regalo",
        category: "other",
        optionKind: "basic",
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
