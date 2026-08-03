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

const createGiftOption = (item) => {
  const label =
    document.createElement("label");
  const input =
    document.createElement("input");
  const content =
    document.createElement("span");
  const name =
    document.createElement("strong");
  const note =
    document.createElement("small");

  label.className = "gift-option";

  input.type = "checkbox";
  input.name =
    RSVP_FIELD_NAMES.giftSelections;
  input.value = item.id;
  input.dataset.rsvpField =
    RSVP_FIELD_NAMES.giftSelections;

  content.className =
    "gift-option__content";
  name.textContent = item.label;

  note.textContent =
    item.capacity === null
      ? "Escribe tu idea para evitar repeticiones."
      : "La disponibilidad se validará al confirmar.";

  content.append(name, note);
  label.append(input, content);

  return label;
};

export const createGiftController = ({
  form,
  catalog,
  selectors,
}) => {
  const optionsContainer = queryRequired(
    selectors.giftOptions,
    form,
  );

  const otherField = queryRequired(
    selectors.otherGiftField,
    form,
  );

  const otherInput = queryRequired(
    selectors.otherGiftInput,
    form,
  );

  const fragment =
    document.createDocumentFragment();

  catalog.items.forEach((item) => {
    fragment.append(
      createGiftOption(item),
    );
  });

  optionsContainer.replaceChildren(
    fragment,
  );

  const updateOtherGift = () => {
    const otherCheckbox = queryOptional(
      `[name="${RSVP_FIELD_NAMES.giftSelections}"]`
      + `[value="${GIFT_SELECTION_VALUES.other}"]`,
      form,
    );

    const enabled =
      otherCheckbox?.checked === true;

    otherField.hidden = !enabled;
    otherInput.disabled = !enabled;

    if (!enabled) {
      otherInput.value = "";
    }
  };

  optionsContainer.addEventListener(
    "change",
    updateOtherGift,
  );

  updateOtherGift();

  return Object.freeze({
    updateOtherGift,
  });
};
