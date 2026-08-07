let turnstileApiPromise = null;

const controlledError = (code) => (
  new Error(code)
);

export const normalizeTurnstileClientErrorCode = (
  errorCode,
) => {
  const safeCode =
    typeof errorCode === "number"
      ? String(errorCode)
      : typeof errorCode === "string"
        ? errorCode.trim()
        : "";

  return /^[0-9]{3,8}$/.test(safeCode)
    ? `TURNSTILE_CLIENT_${safeCode}`
    : "TURNSTILE_ERROR";
};

const validateScriptUrl = (
  scriptUrl,
) => {
  const url = new URL(scriptUrl);

  if (
    url.origin
      !== "https://challenges.cloudflare.com"
    || url.pathname
      !== "/turnstile/v0/api.js"
    || url.searchParams.get("render")
      !== "explicit"
  ) {
    throw new TypeError(
      "TURNSTILE_SCRIPT_URL_INVALID",
    );
  }

  return url.toString();
};

const loadTurnstileApi = ({
  scriptUrl,
  documentRef,
  windowRef,
}) => {
  if (
    windowRef.turnstile
    && typeof windowRef.turnstile.render
      === "function"
  ) {
    return Promise.resolve(
      windowRef.turnstile,
    );
  }

  if (turnstileApiPromise) {
    return turnstileApiPromise;
  }

  const safeScriptUrl =
    validateScriptUrl(scriptUrl);

  turnstileApiPromise =
    new Promise((resolve, reject) => {
      const selector =
        'script[data-turnstile-api="explicit"]';

      let script =
        documentRef.querySelector(
          selector,
        );

      const onLoad = () => {
        if (
          !windowRef.turnstile
          || typeof windowRef.turnstile
            .render !== "function"
        ) {
          reject(
            controlledError(
              "TURNSTILE_API_UNAVAILABLE",
            ),
          );
          return;
        }

        resolve(windowRef.turnstile);
      };

      const onError = () => {
        reject(
          controlledError(
            "TURNSTILE_API_LOAD_FAILED",
          ),
        );
      };

      if (!script) {
        script =
          documentRef.createElement(
            "script",
          );

        script.src = safeScriptUrl;
        script.async = true;
        script.defer = true;
        script.dataset.turnstileApi =
          "explicit";

        script.addEventListener(
          "load",
          onLoad,
          { once: true },
        );

        script.addEventListener(
          "error",
          onError,
          { once: true },
        );

        documentRef.head.append(
          script,
        );
      } else {
        script.addEventListener(
          "load",
          onLoad,
          { once: true },
        );

        script.addEventListener(
          "error",
          onError,
          { once: true },
        );
      }
    })
      .catch((error) => {
        turnstileApiPromise = null;
        throw error;
      });

  return turnstileApiPromise;
};

export const createTurnstileService = ({
  config,
  containerSelector,
  documentRef = document,
  windowRef = window,
}) => {
  if (
    !config
    || typeof config.siteKey
      !== "string"
    || !config.siteKey.trim()
    || typeof config.action
      !== "string"
    || !config.action.trim()
    || typeof containerSelector
      !== "string"
    || !containerSelector.trim()
  ) {
    throw new TypeError(
      "TURNSTILE_CONFIG_INVALID",
    );
  }

  let api = null;
  let widgetId = null;
  let pending = null;
  let tokenTimer = null;

  const clearTokenTimer = () => {
    if (tokenTimer !== null) {
      windowRef.clearTimeout(
        tokenTimer,
      );

      tokenTimer = null;
    }
  };

  const settleSuccess = (token) => {
    if (!pending) {
      return;
    }

    if (
      typeof token !== "string"
      || token.length < 1
      || token.length > 2048
    ) {
      settleFailure(
        "TURNSTILE_INVALID_TOKEN",
      );
      return;
    }

    const current = pending;
    pending = null;
    clearTokenTimer();
    current.resolve(token);
  };

  const settleFailure = (code) => {
    if (!pending) {
      return;
    }

    const current = pending;
    pending = null;
    clearTokenTimer();

    current.reject(
      controlledError(code),
    );
  };

  const prepare = async () => {
    if (widgetId !== null) {
      return widgetId;
    }

    const container =
      documentRef.querySelector(
        containerSelector,
      );

    if (!container) {
      throw controlledError(
        "TURNSTILE_CONTAINER_NOT_FOUND",
      );
    }

    api = await loadTurnstileApi({
      scriptUrl: config.scriptUrl,
      documentRef,
      windowRef,
    });

    widgetId = api.render(
      containerSelector,
      {
        sitekey: config.siteKey,
        action: config.action,
        execution: config.execution,
        appearance: config.appearance,
        theme: config.theme,
        language: config.language,
        callback: settleSuccess,
        "error-callback": (errorCode) => {
          settleFailure(
            normalizeTurnstileClientErrorCode(
              errorCode,
            ),
          );
          return true;
        },
        "expired-callback": () => {
          settleFailure(
            "TURNSTILE_EXPIRED",
          );
        },
        "timeout-callback": () => {
          settleFailure(
            "TURNSTILE_TIMEOUT",
          );
        },
        "unsupported-callback": () => {
          settleFailure(
            "TURNSTILE_UNSUPPORTED",
          );
        },
      },
    );

    if (
      widgetId === undefined
      || widgetId === null
    ) {
      widgetId = null;

      throw controlledError(
        "TURNSTILE_RENDER_FAILED",
      );
    }

    return widgetId;
  };

  const getToken = async () => {
    await prepare();

    if (pending) {
      return pending.promise;
    }

    let resolvePromise;
    let rejectPromise;

    const promise =
      new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
      });

    pending = {
      promise,
      resolve: resolvePromise,
      reject: rejectPromise,
    };

    tokenTimer =
      windowRef.setTimeout(
        () => {
          settleFailure(
            "TURNSTILE_TIMEOUT",
          );
        },
        config.tokenTimeoutMs,
      );

    try {
      api.execute(
        containerSelector,
      );
    } catch {
      settleFailure(
        "TURNSTILE_EXECUTION_FAILED",
      );
    }

    return promise;
  };

  const reset = () => {
    if (
      api
      && widgetId !== null
    ) {
      api.reset(widgetId);
    }
  };

  const destroy = () => {
    if (
      api
      && widgetId !== null
    ) {
      api.remove(widgetId);
    }

    widgetId = null;
    pending = null;
    clearTokenTimer();
  };

  return Object.freeze({
    prepare,
    getToken,
    reset,
    destroy,
  });
};
