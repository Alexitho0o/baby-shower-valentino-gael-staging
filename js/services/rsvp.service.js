import { assertRsvpAdapter } from "../adapters/rsvp.adapter.js";

export const createRsvpService = ({ adapter, featureFlags }) => {
  const safeAdapter = assertRsvpAdapter(adapter);
  const persistenceEnabled = featureFlags?.rsvpPersistenceEnabled === true;

  const submit = async (payload) => {
    if (!persistenceEnabled) {
      return Object.freeze({
        ok: false,
        status: "disabled",
        code: "PERSISTENCE_DISABLED",
      });
    }

    return safeAdapter.submit(payload);
  };

  return Object.freeze({
    submit,
  });
};
