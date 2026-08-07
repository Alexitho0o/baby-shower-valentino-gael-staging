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

  const persistenceEnabled =
    config.featureFlags
      .rsvpPersistenceEnabled === true;

  submitButton.disabled = true;

  if (!persistenceEnabled) {
    messageController?.setState("preview");

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
    });
  }

  submitButton.disabled = false;

  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      clearFieldErrors(form);

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
  });
};
