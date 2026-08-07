const CONTROLLED_TURNSTILE_ERRORS =
  new Set([
    "TURNSTILE_API_LOAD_FAILED",
    "TURNSTILE_API_UNAVAILABLE",
    "TURNSTILE_CONTAINER_NOT_FOUND",
    "TURNSTILE_RENDER_FAILED",
    "TURNSTILE_EXECUTION_FAILED",
    "TURNSTILE_INVALID_TOKEN",
    "TURNSTILE_ERROR",
    "TURNSTILE_EXPIRED",
    "TURNSTILE_TIMEOUT",
    "TURNSTILE_UNSUPPORTED",
  ]);

const isObject = (value) => (
  typeof value === "object"
  && value !== null
  && !Array.isArray(value)
);

const validateEndpoint = (endpoint) => {
  const url = new URL(endpoint);

  if (
    url.protocol !== "https:"
    || !url.hostname.endsWith(
      ".supabase.co",
    )
    || url.pathname
      !== "/functions/v1/rsvp-gateway"
    || url.search
    || url.hash
  ) {
    throw new TypeError(
      "GATEWAY_ENDPOINT_INVALID",
    );
  }

  return url.toString();
};

const canonicalPayloadKey = (
  payload,
) => JSON.stringify({
  schemaVersion:
    payload?.schemaVersion ?? null,
  fullName:
    payload?.fullName ?? "",
  attendance:
    payload?.attendance ?? "",
  adults:
    payload?.adults ?? null,
  children:
    payload?.children ?? null,
  giftSelections:
    Array.isArray(
      payload?.giftSelections,
    )
      ? [...payload.giftSelections].sort()
      : [],
  otherGift:
    payload?.otherGift ?? "",
  comments:
    payload?.comments ?? "",
});

const readResponseBody = async (
  response,
) => {
  try {
    const body = await response.json();

    return isObject(body)
      ? body
      : null;
  } catch {
    return null;
  }
};

const errorResult = (code) => (
  Object.freeze({
    ok: false,
    status: "error",
    code,
  })
);

export const createGatewayRsvpAdapter = ({
  endpoint,
  requestTimeoutMs,
  turnstileService,
  fetchImpl = globalThis.fetch,
  cryptoImpl = globalThis.crypto,
}) => {
  const safeEndpoint =
    validateEndpoint(endpoint);

  if (
    !Number.isInteger(
      requestTimeoutMs,
    )
    || requestTimeoutMs < 1000
    || requestTimeoutMs > 30000
  ) {
    throw new TypeError(
      "GATEWAY_TIMEOUT_INVALID",
    );
  }

  if (
    !turnstileService
    || typeof turnstileService.getToken
      !== "function"
    || typeof turnstileService.reset
      !== "function"
  ) {
    throw new TypeError(
      "TURNSTILE_SERVICE_INVALID",
    );
  }

  if (typeof fetchImpl !== "function") {
    throw new TypeError(
      "FETCH_IMPLEMENTATION_INVALID",
    );
  }

  if (
    !cryptoImpl
    || typeof cryptoImpl.randomUUID
      !== "function"
  ) {
    throw new TypeError(
      "CRYPTO_IMPLEMENTATION_INVALID",
    );
  }

  let retryState = null;

  const resolveRequestIdentity = (
    payload,
  ) => {
    const payloadKey =
      canonicalPayloadKey(payload);

    if (
      !retryState
      || retryState.payloadKey
        !== payloadKey
    ) {
      retryState = Object.freeze({
        payloadKey,
        requestId:
          cryptoImpl.randomUUID(),
      });
    }

    return retryState;
  };

  const submit = async (payload) => {
    const {
      requestId,
    } = resolveRequestIdentity(
      payload,
    );

    const controller =
      new AbortController();

    let timeout = null;

    try {
      const turnstileToken =
        await turnstileService
          .getToken();

      timeout = setTimeout(
        () => controller.abort(),
        requestTimeoutMs,
      );

      const response =
        await fetchImpl(
          safeEndpoint,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              requestId,
              turnstileToken,
              payload,
            }),
            signal: controller.signal,
          },
        );

      const body =
        await readResponseBody(
          response,
        );

      if (
        response.status === 201
        && body?.ok === true
        && typeof body.submissionId
          === "string"
      ) {
        retryState = null;

        return Object.freeze({
          ok: true,
          status: "submitted",
          submissionId:
            body.submissionId,
          acceptedGifts:
            Array.isArray(
              body.acceptedGifts,
            )
              ? body.acceptedGifts
              : [],
        });
      }

      if (response.status < 500) {
        retryState = null;
      }

      return errorResult(
        typeof body?.code === "string"
          ? body.code
          : "GATEWAY_REQUEST_REJECTED",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "";

      if (controller.signal.aborted) {
        return errorResult(
          "GATEWAY_TIMEOUT",
        );
      }

      if (
        CONTROLLED_TURNSTILE_ERRORS
          .has(message)
      ) {
        return errorResult(message);
      }

      return errorResult(
        "GATEWAY_UNAVAILABLE",
      );
    } finally {
      if (timeout !== null) {
        clearTimeout(timeout);
      }

      try {
        turnstileService.reset();
      } catch {
        // El reinicio no altera el resultado.
      }
    }
  };

  return Object.freeze({
    submit,
  });
};
