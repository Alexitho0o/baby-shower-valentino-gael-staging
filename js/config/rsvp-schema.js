import {
  GIFT_CATALOG_CONFIG,
  GIFT_SELECTION_VALUES,
} from "./gift-catalog.config.js";

export const RSVP_FIELD_NAMES = Object.freeze({
  fullName: "fullName",
  attendance: "attendance",
  adults: "adults",
  children: "children",
  companions: "companions",
  giftSelections: "giftSelections",
  otherGift: "otherGift",
  comments: "comments",
});

export const RSVP_ATTENDANCE_VALUES = Object.freeze({
  attending: "attending",
  notAttending: "not_attending",
});

export const RSVP_SCHEMA = Object.freeze({
  schemaVersion: 2,
  fields: Object.freeze({
    fullName: Object.freeze({
      name: RSVP_FIELD_NAMES.fullName,
      type: "string",
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 120,
    }),
    attendance: Object.freeze({
      name: RSVP_FIELD_NAMES.attendance,
      type: "enum",
      required: true,
      values: Object.freeze([
        RSVP_ATTENDANCE_VALUES.attending,
        RSVP_ATTENDANCE_VALUES.notAttending,
      ]),
    }),
    adults: Object.freeze({
      name: RSVP_FIELD_NAMES.adults,
      type: "integer",
      required: true,
      min: 0,
      max: 99,
      includesRespondent: true,
    }),
    children: Object.freeze({
      name: RSVP_FIELD_NAMES.children,
      type: "integer",
      required: true,
      min: 0,
      max: 99,
    }),
    companions: Object.freeze({
      name: RSVP_FIELD_NAMES.companions,
      type: "string",
      required: false,
      trim: true,
      maxLength: 500,
    }),
    giftSelections: Object.freeze({
      name: RSVP_FIELD_NAMES.giftSelections,
      type: "array",
      required: false,
      maxItems: GIFT_CATALOG_CONFIG.items.length,
      values: Object.freeze(
        Object.values(GIFT_SELECTION_VALUES),
      ),
    }),
    otherGift: Object.freeze({
      name: RSVP_FIELD_NAMES.otherGift,
      type: "string",
      required: false,
      trim: true,
      maxLength: 160,
      requiredWhenGiftSelected:
        GIFT_SELECTION_VALUES.other,
    }),
    comments: Object.freeze({
      name: RSVP_FIELD_NAMES.comments,
      type: "string",
      required: false,
      trim: true,
      maxLength: 1000,
    }),
  }),
  businessRules: Object.freeze({
    adultTotalIncludesRespondent: true,
    giftSelectionOptional: true,
    giftCatalogReservationLimit:
      GIFT_CATALOG_CONFIG.maxReservationsPerCatalogItem,
  }),
  pendingBusinessRules: Object.freeze([
    "La disponibilidad de regalos deberá validarse de forma atómica cuando exista persistencia.",
    "La agenda permanecerá oculta hasta que existan actividades y horarios confirmados.",
    "El álbum permanecerá oculto hasta que exista un enlace aprobado.",
  ]),
});
