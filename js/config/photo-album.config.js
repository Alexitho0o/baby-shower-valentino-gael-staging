const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }

  return value;
};

export const PHOTO_ALBUM_CONFIG = deepFreeze({
  schemaVersion: 1,
  enabled: false,
  provider: "Apple Shared Albums",
  url: null,
  instructions: null,
});
