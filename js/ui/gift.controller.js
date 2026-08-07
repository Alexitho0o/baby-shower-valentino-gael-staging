import {
  GIFT_SELECTION_VALUES,
} from "../config/gift-catalog.config.js";
import {
  RSVP_FIELD_NAMES,
} from "../config/rsvp-schema.js";
import {
  queryOptional,
  queryRequired,
} from "../utils/dom.js";

const GIFT_STATUS = Object.freeze({
  preview:
    "Vista previa: la disponibilidad y los conteos reales se activarán junto con la confirmación en línea. Cada talla o tipo tendrá un contador independiente y solo la administración podrá cerrar una alternativa.",
  loading:
    "Consultando disponibilidad de regalos...",
  loaded:
    "Disponibilidad de regalos actualizada.",
  unavailable:
    "No pudimos cargar la disponibilidad de regalos. Puedes confirmar asistencia sin seleccionar regalo.",
});

export const availabilityKeyForGift = (
  gift,
) => {
  if (
    !gift
    || typeof gift !== "object"
  ) {
    return "";
  }

  if (
    typeof gift.giftId === "string"
    && gift.giftId.trim()
  ) {
    return gift.giftId.trim();
  }

  if (
    typeof gift.itemId === "string"
    && gift.itemId.trim()
    && typeof gift.variantId === "string"
    && gift.variantId.trim()
    && gift.itemId !== gift.variantId
  ) {
    return `${gift.itemId.trim()}__${gift.variantId.trim()}`;
  }

  return typeof gift.itemId === "string"
    ? gift.itemId.trim()
    : "";
};

export const mapAvailabilityByReservationKey = (
  gifts,
) => {
  const availabilityMap =
    new Map();

  if (!Array.isArray(gifts)) {
    return availabilityMap;
  }

  gifts.forEach((gift) => {
    const key =
      availabilityKeyForGift(gift);

    if (!key) {
      return;
    }

    const remaining =
      Number.isFinite(
        Number(gift.remaining),
      )
        ? Number(gift.remaining)
        : 0;

    availabilityMap.set(
      key,
      Object.freeze({
        remaining,
        available:
          gift.available === true
          && remaining > 0,
        manualClosed:
          gift.manualClosed === true,
      }),
    );
  });

  return availabilityMap;
};

export const isGiftAvailable = (
  availability,
) => (
  availability?.available === true
  && availability.manualClosed !== true
  && Number(availability.remaining) > 0
);

export const availabilityLabel = (
  availability,
) => {
  if (!availability) {
    return "Disponibilidad no confirmada";
  }

  if (availability.manualClosed) {
    return "No disponible";
  }

  if (!isGiftAvailable(availability)) {
    return "Agotado";
  }

  return `Disponibles: ${availability.remaining}`;
};

const setGiftStatus = (
  statusElement,
  state,
) => {
  if (!statusElement) {
    return;
  }

  statusElement.hidden = false;
  statusElement.dataset.giftStatusState =
    state;
  statusElement.className =
    state === "loaded"
      ? "message message--success"
      : state === "unavailable"
        ? "message message--error"
        : "message message--warning";
  statusElement.textContent =
    GIFT_STATUS[state]
    ?? GIFT_STATUS.preview;
};

const createCounter = (
  reservationKey,
) => {
  const counter =
    document.createElement("small");

  counter.className =
    "gift-option__counter";
  counter.dataset.giftCounter =
    reservationKey;
  counter.hidden = true;
  counter.textContent =
    "Disponibilidad no confirmada";

  return counter;
};

const markOptionAvailability = (
  input,
  counter,
  availability,
) => {
  const available =
    isGiftAvailable(availability);

  input.disabled = !available;
  input.dataset.giftAvailable =
    available ? "true" : "false";

  if (!available) {
    input.checked = false;
  }

  const option =
    input.closest(".gift-option");

  option?.classList.toggle(
    "gift-option--unavailable",
    !available,
  );

  if (counter) {
    counter.hidden = false;
    counter.textContent =
      availabilityLabel(availability);
  }
};

const createBasicOption = (
  item,
  counterRuntimeEnabled,
) => {
  const label =
    document.createElement("label");
  const input =
    document.createElement("input");
  const content =
    document.createElement("span");
  const name =
    document.createElement("strong");
  const counter =
    createCounter(item.id);

  label.className =
    "gift-option gift-option--basic";
  label.dataset.giftOption =
    item.id;

  input.type = "checkbox";
  input.name =
    RSVP_FIELD_NAMES
      .giftSelections;
  input.value = item.id;
  input.dataset.rsvpField =
    RSVP_FIELD_NAMES
      .giftSelections;
  input.dataset.giftReservationKey =
    item.id;

  content.className =
    "gift-option__content";

  name.textContent = item.label;
  content.append(name);

  if (item.requiresDetail) {
    const note =
      document.createElement("small");

    note.textContent =
      "Selecciona esta opción y descríbela debajo.";

    content.append(note);
  }

  counter.hidden =
    !counterRuntimeEnabled;

  content.append(counter);

  label.append(
    input,
    content,
  );

  return label;
};

const createVariantOption = (
  item,
  counterRuntimeEnabled,
) => {
  const card =
    document.createElement("div");
  const heading =
    document.createElement("strong");
  const label =
    document.createElement("label");
  const select =
    document.createElement("select");
  const emptyOption =
    document.createElement("option");
  const note =
    document.createElement("small");
  const counters =
    document.createElement("div");

  const selectId =
    `gift-${item.id}-variant`;

  card.className =
    "gift-option gift-option--variant";
  card.dataset.giftOption =
    item.id;

  heading.className =
    "gift-option__name";
  heading.textContent =
    item.label;

  label.className =
    "gift-option__variant-label";
  label.htmlFor = selectId;
  label.textContent =
    item.variantLabel;

  select.className =
    "select gift-option__variant-select";
  select.id = selectId;
  select.name =
    RSVP_FIELD_NAMES
      .giftSelections;
  select.dataset.rsvpField =
    RSVP_FIELD_NAMES
      .giftSelections;
  select.dataset.giftVariant =
    item.id;

  emptyOption.value = "";
  emptyOption.textContent =
    item.variantPlaceholder;
  emptyOption.disabled = true;
  emptyOption.selected = true;

  select.append(emptyOption);

  item.variants.forEach(
    (variant) => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        variant.reservationKey;
      option.textContent =
        variant.label;
      option.dataset.giftOptionLabel =
        variant.label;
      option.dataset.giftReservationKey =
        variant.reservationKey;

      select.append(option);
    },
  );

  note.className =
    "gift-option__variant-note";
  note.textContent =
    item.variantNote;

  counters.className =
    "gift-option__variant-counters";
  counters.hidden =
    !counterRuntimeEnabled;

  item.variants.forEach(
    (variant) => {
      counters.append(
        createCounter(
          variant.reservationKey,
        ),
      );
    },
  );

  card.append(
    heading,
    label,
    select,
    note,
    counters,
  );

  return card;
};

const createGiftOption = (
  item,
  counterRuntimeEnabled,
) => (
  item.variants.length > 0
    ? createVariantOption(
        item,
        counterRuntimeEnabled,
      )
    : createBasicOption(
        item,
        counterRuntimeEnabled,
      )
);

const applyBasicAvailability = (
  form,
  availabilityMap,
) => {
  form
    .querySelectorAll(
      "input[data-gift-reservation-key]",
    )
    .forEach((input) => {
      const key =
        input.dataset
          .giftReservationKey;
      const counter =
        queryOptional(
          `[data-gift-counter="${key}"]`,
          form,
        );

      markOptionAvailability(
        input,
        counter,
        availabilityMap.get(key),
      );
    });
};

const applyVariantAvailability = (
  form,
  availabilityMap,
) => {
  form
    .querySelectorAll(
      "select[data-gift-variant]",
    )
    .forEach((select) => {
      let availableOptions = 0;

      Array
        .from(select.options)
        .forEach((option) => {
          const key =
            option.dataset
              .giftReservationKey;

          if (!key) {
            return;
          }

          const optionLabel =
            option.dataset
              .giftOptionLabel
            ?? option.textContent;
          const availability =
            availabilityMap.get(key);
          const available =
            isGiftAvailable(
              availability,
            );

          option.disabled =
            !available;
          option.dataset.giftAvailable =
            available ? "true" : "false";
          option.textContent =
            `${optionLabel} (${availabilityLabel(availability)})`;

          if (available) {
            availableOptions += 1;
          }

          const counter =
            queryOptional(
              `[data-gift-counter="${key}"]`,
              form,
            );

          if (counter) {
            counter.hidden = false;
            counter.textContent =
              `${optionLabel}: ${availabilityLabel(availability)}`;
          }
        });

      select.disabled =
        availableOptions === 0;

      if (
        select.selectedOptions[0]
        ?.disabled
      ) {
        select.value = "";
      }

      select
        .closest(".gift-option")
        ?.classList.toggle(
          "gift-option--unavailable",
          availableOptions === 0,
        );
    });
};

const disableGiftSelection = (
  form,
) => {
  form
    .querySelectorAll(
      "[data-gift-reservation-key], select[data-gift-variant]",
    )
    .forEach((field) => {
      field.disabled = true;

      if (field.type === "checkbox") {
        field.checked = false;
      }

      if (field.tagName === "SELECT") {
        field.value = "";
      }

      field
        .closest(".gift-option")
        ?.classList.add(
          "gift-option--unavailable",
        );
    });
};

export const createGiftController = ({
  form,
  catalog,
  selectors,
  availabilityProvider = null,
  liveAvailabilityEnabled = false,
}) => {
  const optionsContainer =
    queryRequired(
      selectors.giftOptions,
      form,
    );

  const statusElement =
    queryOptional(
      selectors.giftStatus,
      form,
    );

  const otherField =
    queryRequired(
      selectors.otherGiftField,
      form,
    );

  const otherInput =
    queryRequired(
      selectors.otherGiftInput,
      form,
    );

  const counterRuntimeEnabled =
    catalog.counterRuntimeEnabled
    || liveAvailabilityEnabled;

  const fragment =
    document
      .createDocumentFragment();

  catalog.items.forEach((item) => {
    fragment.append(
      createGiftOption(
        item,
        counterRuntimeEnabled,
      ),
    );
  });

  optionsContainer
    .replaceChildren(fragment);

  const updateOtherGift = () => {
    const otherCheckbox =
      queryOptional(
        `[name="${RSVP_FIELD_NAMES.giftSelections}"]`
        + `[value="${GIFT_SELECTION_VALUES.other}"]`,
        form,
      );

    const enabled =
      otherCheckbox?.checked
      === true
      && otherCheckbox.disabled
        !== true;

    otherField.hidden = !enabled;
    otherInput.disabled = !enabled;

    if (!enabled) {
      otherInput.value = "";
    }
  };

  optionsContainer
    .addEventListener(
      "change",
      updateOtherGift,
    );

  const hydrateAvailability = async () => {
    if (
      !liveAvailabilityEnabled
      || typeof availabilityProvider
        !== "function"
    ) {
      setGiftStatus(
        statusElement,
        "preview",
      );
      updateOtherGift();
      return;
    }

    setGiftStatus(
      statusElement,
      "loading",
    );
    disableGiftSelection(form);

    const result =
      await availabilityProvider();

    if (
      !result?.ok
      || !Array.isArray(result.gifts)
    ) {
      setGiftStatus(
        statusElement,
        "unavailable",
      );
      updateOtherGift();
      return;
    }

    const availabilityMap =
      mapAvailabilityByReservationKey(
        result.gifts,
      );

    applyBasicAvailability(
      form,
      availabilityMap,
    );
    applyVariantAvailability(
      form,
      availabilityMap,
    );
    setGiftStatus(
      statusElement,
      "loaded",
    );
    updateOtherGift();
  };

  hydrateAvailability();

  return Object.freeze({
    hydrateAvailability,
    updateOtherGift,
  });
};
