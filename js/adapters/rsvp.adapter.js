export const assertRsvpAdapter = (adapter) => {
  if (!adapter || typeof adapter.submit !== "function") {
    throw new TypeError("El adaptador RSVP debe implementar submit(payload).");
  }

  return adapter;
};
