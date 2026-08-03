import {
  RSVP_ATTENDANCE_VALUES,
  RSVP_FIELD_NAMES,
  RSVP_SCHEMA,
} from "../config/rsvp-schema.js";

const normalizeSpaces = (value) => (
  String(value ?? "").trim().replace(/\s+/g, " ")
);

const addError = (errors, fieldName, message) => {
  errors[fieldName] = [
    ...(errors[fieldName] || []),
    message,
  ];
};

const normalizeInteger = (value) => {
  if (
    value === ""
    || value === null
    || value === undefined
  ) {
    return 0;
  }

  const numericValue = Number(value);

  return Number.isInteger(numericValue)
    ? numericValue
    : Number.NaN;
};

const normalizeGiftSelections = (value) => {
  const source = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  return [
    ...new Set(
      source
        .map(normalizeSpaces)
        .filter(Boolean),
    ),
  ];
};

export const normalizeRsvpInput = (input = {}) => ({
  [RSVP_FIELD_NAMES.fullName]:
    normalizeSpaces(input[RSVP_FIELD_NAMES.fullName]),
  [RSVP_FIELD_NAMES.attendance]:
    normalizeSpaces(input[RSVP_FIELD_NAMES.attendance]),
  [RSVP_FIELD_NAMES.adults]:
    normalizeInteger(input[RSVP_FIELD_NAMES.adults]),
  [RSVP_FIELD_NAMES.children]:
    normalizeInteger(input[RSVP_FIELD_NAMES.children]),
  [RSVP_FIELD_NAMES.giftSelections]:
    normalizeGiftSelections(
      input[RSVP_FIELD_NAMES.giftSelections],
    ),
  [RSVP_FIELD_NAMES.otherGift]:
    normalizeSpaces(input[RSVP_FIELD_NAMES.otherGift]),
  [RSVP_FIELD_NAMES.comments]:
    normalizeSpaces(input[RSVP_FIELD_NAMES.comments]),
});

export const validateRsvpInput = (input = {}) => {
  const data = normalizeRsvpInput(input);
  const errors = {};
  const schema = RSVP_SCHEMA.fields;

  if (
    data.fullName.length
    < schema.fullName.minLength
  ) {
    addError(
      errors,
      RSVP_FIELD_NAMES.fullName,
      "Ingresa nombre y apellido.",
    );
  }

  if (
    data.fullName.length
    > schema.fullName.maxLength
  ) {
    addError(
      errors,
      RSVP_FIELD_NAMES.fullName,
      "El nombre es demasiado largo.",
    );
  }

  if (
    !Object.values(
      RSVP_ATTENDANCE_VALUES,
    ).includes(data.attendance)
  ) {
    addError(
      errors,
      RSVP_FIELD_NAMES.attendance,
      "Selecciona si asistirás.",
    );
  }

  [
    RSVP_FIELD_NAMES.adults,
    RSVP_FIELD_NAMES.children,
  ].forEach((fieldName) => {
    const fieldSchema = schema[fieldName];
    const value = data[fieldName];

    if (!Number.isInteger(value)) {
      addError(
        errors,
        fieldName,
        "Ingresa un número válido.",
      );
      return;
    }

    if (value < fieldSchema.min) {
      addError(
        errors,
        fieldName,
        "La cantidad no puede ser negativa.",
      );
    }

    if (value > fieldSchema.max) {
      addError(
        errors,
        fieldName,
        `La cantidad máxima es ${fieldSchema.max}.`,
      );
    }
  });

  const invalidGifts =
    data.giftSelections.filter(
      (value) => (
        !schema.giftSelections.values.includes(value)
      ),
    );

  if (invalidGifts.length > 0) {
    addError(
      errors,
      RSVP_FIELD_NAMES.giftSelections,
      "Existe una selección de regalo no válida.",
    );
  }

  if (
    data.giftSelections.length
    > schema.giftSelections.maxItems
  ) {
    addError(
      errors,
      RSVP_FIELD_NAMES.giftSelections,
      "Seleccionaste demasiadas alternativas.",
    );
  }

  const requiresOtherGift =
    data.giftSelections.includes(
      schema.otherGift.requiredWhenGiftSelected,
    );

  if (
    requiresOtherGift
    && data.otherGift.length < 2
  ) {
    addError(
      errors,
      RSVP_FIELD_NAMES.otherGift,
      "Escribe el regalo que deseas llevar.",
    );
  }

  if (
    data.otherGift.length
    > schema.otherGift.maxLength
  ) {
    addError(
      errors,
      RSVP_FIELD_NAMES.otherGift,
      "La descripción del regalo es demasiado larga.",
    );
  }

  if (
    data.comments.length
    > schema.comments.maxLength
  ) {
    addError(
      errors,
      RSVP_FIELD_NAMES.comments,
      "Los comentarios son demasiado largos.",
    );
  }

  return Object.freeze({
    valid: Object.keys(errors).length === 0,
    data,
    errors,
  });
};

export const buildRsvpPayload = (input = {}) => {
  const result = validateRsvpInput(input);

  if (!result.valid) {
    return result;
  }

  return Object.freeze({
    valid: true,
    data: Object.freeze({
      schemaVersion: RSVP_SCHEMA.schemaVersion,
      ...result.data,
    }),
    errors: Object.freeze({}),
  });
};
