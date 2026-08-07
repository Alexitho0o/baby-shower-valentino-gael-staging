const GATEWAY_ENDPOINT =
  "https://xpbdgbzaqcjuxkxdftbr.supabase.co/functions/v1/rsvp-gateway";

const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const TURNSTILE_SITE_KEY =
  "0x4AAAAAAEJhPh-33MBSuhYZ";

export const RUNTIME_CONFIG = Object.freeze({
  schemaVersion: 1,
  gateway: Object.freeze({
    endpoint: GATEWAY_ENDPOINT,
    requestTimeoutMs: 12000,
  }),
  turnstile: Object.freeze({
    siteKey: TURNSTILE_SITE_KEY,
    scriptUrl: TURNSTILE_SCRIPT_URL,
    action: "rsvp_submit",
    execution: "execute",
    appearance: "interaction-only",
    theme: "auto",
    language: "es",
    tokenTimeoutMs: 30000,
  }),
});
