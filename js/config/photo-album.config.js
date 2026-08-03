const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }

  return value;
};

export const PHOTO_ALBUM_CONFIG = deepFreeze({
  schemaVersion: 2,
  enabled: false,
  previewVisible: true,
  provider: "Apple Shared Albums",
  url: null,
  linkLabel: "Abrir álbum compartido",
  instructions:
    "Los invitados podrán agregar y descargar las fotografías del Baby Shower.",
});
