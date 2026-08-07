import {
  RSVP_FIELD_NAMES,
} from "../config/rsvp-schema.js";
import {
  buildRsvpPayload,
} from "../validation/rsvp.validator.js";
import {
  queryOptional,
  queryRequired,
} from "../utils/dom.js";

const CONTROLLED_DIAGNOSTIC_CODES =
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
    "TURNSTILE_REJECTED",
    "TURNSTILE_ACTION_MISMATCH",
    "TURNSTILE_HOSTNAME_MISMATCH",
    "TURNSTILE_UNAVAILABLE",
    "GATEWAY_REQUEST_REJECTED",
    "GATEWAY_TIMEOUT",
    "GATEWAY_UNAVAILABLE",
    "IDEMPOTENCY_CONFLICT",
    "RSVP_VALIDATION_FAILED",
    "GIFT_UNAVAILABLE",
  ]);

export const normalizeDiagnosticCode = (
  code,
) => (
  typeof code === "string"
  && (
    CONTROLLED_DIAGNOSTIC_CODES
      .has(code)
    || /^TURNSTILE_CLIENT_[0-9]{3,8}$/.test(code)
  )
    ? code
    : ""
);

export const renderDiagnosticCode = ({
  diagnosticElement,
  diagnosticEnabled,
  code,
}) => {
  if (!diagnosticElement) {
    return;
  }

  const safeCode =
    diagnosticEnabled
      ? normalizeDiagnosticCode(code)
      : "";

  diagnosticElement.textContent =
    safeCode
      ? `Código de diagnóstico: ${safeCode}`
      : "";
  diagnosticElement.hidden = !safeCode;
};

const fieldErrorId = (fieldName) => (
  `${fieldName}-error`
);

export const collectFormData = (form) => {
  const formData = new FormData(form);

  return Object.fromEntries(
    Object.values(RSVP_FIELD_NAMES).map(
      (fieldName) => [
        fieldName,
        fieldName === RSVP_FIELD_NAMES.giftSelections
          ? formData.getAll(fieldName)
          : formData.get(fieldName) ?? "",
      ],
    ),
  );
};

export const clearFieldErrors = (form) => {
  form
    .querySelectorAll("[data-field-error]")
    .forEach((element) => element.remove());

  form
    .querySelectorAll("[aria-invalid='true']")
    .forEach((element) => {
      element.removeAttribute("aria-invalid");
      element.removeAttribute("aria-describedby");
    });
};

export const renderFieldErrors = (
  form,
  errors,
) => {
  Object.entries(errors).forEach(
    ([fieldName, messages]) => {
      const field = queryOptional(
        `[name="${fieldName}"]`,
        form,
      );

      if (!field) {
        return;
      }

      const error =
        document.createElement("span");

      error.className =
        "help-text field-error";
      error.id = fieldErrorId(fieldName);
      error.dataset.fieldError = fieldName;
      error.textContent = messages.join(" ");

      field.setAttribute(
        "aria-invalid",
        "true",
      );
      field.setAttribute(
        "aria-describedby",
        error.id,
      );

      field
        .closest(
          ".field, .choice-group, .gift-planner",
        )
        ?.append(error);
    },
  );
};

export const setSubmittingState = (
  submitButton,
) => {
  submitButton.dataset.submitting = "true";
  submitButton.disabled = true;
};

export const resetSubmittingState = (
  submitButton,
) => {
  delete submitButton.dataset.submitting;
  submitButton.disabled = false;
};

export const createFormController = ({
  config,
  messageController,
  rsvpService,
}) => {
  const form = queryRequired(
    config.selectors.rsvpForm,
  );

  const submitButton = queryRequired(
    config.selectors.rsvpSubmit,
    form,
  );

  const diagnosticElement =
    queryOptional(
      config.selectors.rsvpDiagnostic,
      form,
    );

  const persistenceEnabled =
    config.featureFlags
      .rsvpPersistenceEnabled === true;

  const diagnosticEnabled =
    config.featureFlags
      .rsvpDiagnosticEnabled === true;

  const clearDiagnostic = () => {
    renderDiagnosticCode({
      diagnosticElement,
      diagnosticEnabled: false,
      code: "",
    });
  };

  submitButton.disabled = true;
  clearDiagnostic();

  if (!persistenceEnabled) {
    messageController?.setState("preview");
    clearDiagnostic();

    return Object.freeze({
      form,
      submitButton,
      collectFormData:
        () => collectFormData(form),
      renderFieldErrors:
        (errors) => renderFieldErrors(
          form,
          errors,
        ),
      clearFieldErrors:
        () => clearFieldErrors(form),
      setSubmittingState:
        () => setSubmittingState(
          submitButton,
        ),
      resetSubmittingState:
        () => resetSubmittingState(
          submitButton,
        ),
      clearDiagnostic,
    });
  }

  submitButton.disabled = false;

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      clearDiagnostic();

      const payloadResult =
        buildRsvpPayload(
          collectFormData(form),
        );

      if (!payloadResult.valid) {
        renderFieldErrors(
          form,
          payloadResult.errors,
        );
        messageController?.setState(
          "invalid",
        );
        return;
      }

      setSubmittingState(submitButton);
      messageController?.setState(
        "sending",
      );

      const response =
        await rsvpService.submit(
          payloadResult.data,
        );

      resetSubmittingState(
        submitButton,
      );

      messageController?.setState(
        response.ok
          ? "success"
          : "error",
      );

      renderDiagnosticCode({
        diagnosticElement,
        diagnosticEnabled:
          !response.ok
          && diagnosticEnabled,
        code: response.code,
      });
    },
  );

  return Object.freeze({
    form,
    submitButton,
    collectFormData:
      () => collectFormData(form),
    renderFieldErrors:
      (errors) => renderFieldErrors(
        form,
        errors,
      ),
    clearFieldErrors:
      () => clearFieldErrors(form),
    setSubmittingState:
      () => setSubmittingState(
        submitButton,
      ),
    resetSubmittingState:
      () => resetSubmittingState(
        submitButton,
      ),
    clearDiagnostic,
  });
};
