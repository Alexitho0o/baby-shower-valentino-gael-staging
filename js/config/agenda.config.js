const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }

  return value;
};

export const AGENDA_CONFIG = deepFreeze({
  schemaVersion: 2,
  enabled: false,
  previewVisible: true,
  document: {
    label: "Programa de actividades y horarios propuestos",
    url: null,
  },
  items: [
    { order: 1, id: "welcome", label: "Bienvenida", time: null },
    { order: 2, id: "lunch", label: "Almuerzo", time: null },
    { order: 3, id: "game-1", label: "Juego 1", time: null },
    { order: 4, id: "game-2", label: "Juego 2", time: null },
    { order: 5, id: "game-3", label: "Juego 3", time: null },
    { order: 6, id: "game-4", label: "Juego 4", time: null },
    { order: 7, id: "game-5", label: "Juego 5", time: null },
    { order: 8, id: "photos-family", label: "Fotos con la familia", time: null },
    { order: 9, id: "photos-friends", label: "Fotos con amigos", time: null },
    { order: 10, id: "photos-all", label: "Fotos con todos", time: null },
    { order: 11, id: "cake", label: "Torta", time: null },
    { order: 12, id: "farewell", label: "Despedida", time: null },
  ],
});
