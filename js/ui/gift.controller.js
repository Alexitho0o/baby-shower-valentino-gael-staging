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
    "Conteo todavía no disponible.";

  return counter;
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

  input.type = "checkbox";
  input.name =
    RSVP_FIELD_NAMES
      .giftSelections;
  input.value = item.id;
  input.dataset.rsvpField =
    RSVP_FIELD_NAMES
      .giftSelections;

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

export const createGiftController = ({
  form,
  catalog,
  selectors,
}) => {
  const optionsContainer =
    queryRequired(
      selectors.giftOptions,
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

  const fragment =
    document
      .createDocumentFragment();

  catalog.items.forEach((item) => {
    fragment.append(
      createGiftOption(
        item,
        catalog
          .counterRuntimeEnabled,
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
      === true;

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

  updateOtherGift();

  return Object.freeze({
    updateOtherGift,
  });
};
