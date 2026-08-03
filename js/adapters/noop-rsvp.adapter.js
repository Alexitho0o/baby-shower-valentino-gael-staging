export const noopRsvpAdapter = Object.freeze({
  async submit() {
    return Object.freeze({
      ok: false,
      status: "disabled",
      code: "PERSISTENCE_DISABLED",
    });
  },
});
