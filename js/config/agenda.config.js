const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }

  return value;
};

export const AGENDA_CONFIG = deepFreeze({
  schemaVersion: 1,
  enabled: false,
  items: [],
});
