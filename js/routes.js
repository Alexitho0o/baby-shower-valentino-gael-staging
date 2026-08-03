export const ROUTES = Object.freeze({
  home: Object.freeze({
    hash: "#/inicio",
    sectionSelector: "[data-route-section='#/inicio']",
    headingSelector: "#hero-title",
    messageState: "preview",
  }),
  details: Object.freeze({
    hash: "#/detalles",
    sectionSelector: "[data-route-section='#/detalles']",
    headingSelector: "#resumen-title",
    messageState: "preview",
  }),
  pool: Object.freeze({
    hash: "#/piscina",
    sectionSelector: "[data-route-section='#/piscina']",
    headingSelector: "#piscina-title",
    messageState: "preview",
  }),
  confirmation: Object.freeze({
    hash: "#/confirmacion",
    sectionSelector: "[data-route-section='#/confirmacion']",
    headingSelector: "#confirmacion-title",
    messageState: "preview",
  }),
  confirmationSending: Object.freeze({
    hash: "#/confirmacion/enviando",
    sectionSelector: "[data-route-section='#/confirmacion']",
    headingSelector: "#confirmacion-title",
    messageState: "sending",
  }),
  confirmationSuccess: Object.freeze({
    hash: "#/confirmacion/exito",
    sectionSelector: "[data-route-section='#/confirmacion']",
    headingSelector: "#confirmacion-title",
    messageState: "success",
  }),
  confirmationError: Object.freeze({
    hash: "#/confirmacion/error",
    sectionSelector: "[data-route-section='#/confirmacion']",
    headingSelector: "#confirmacion-title",
    messageState: "error",
  }),
});

export const DEFAULT_ROUTE = "#/inicio";
export const REQUIRED_ROUTE_HASHES = Object.freeze(Object.values(ROUTES).map((route) => route.hash));
