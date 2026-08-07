const MESSAGE_STATE = Object.freeze({
  idle: Object.freeze({
    className: "message message--success field--full",
    text: "Tu confirmación se enviará de forma segura cuando presiones Confirmar asistencia.",
  }),
  preview: Object.freeze({
    className: "message message--warning field--full",
    text: "Vista previa: la confirmación en línea se habilitará en la próxima etapa.",
  }),
  invalid: Object.freeze({
    className: "message message--error field--full",
    text: "Revisa los campos marcados antes de continuar.",
  }),
  sending: Object.freeze({
    className: "message message--warning field--full",
    text: "Enviando tu confirmación...",
  }),
  success: Object.freeze({
    className: "message message--success field--full",
    text: "Confirmación recibida. Gracias por responder.",
  }),
  error: Object.freeze({
    className: "message message--error field--full",
    text: "No pudimos completar el envío. Inténtalo nuevamente en unos minutos.",
  }),
  disabled: Object.freeze({
    className: "message message--warning field--full",
    text: "La confirmación en línea está deshabilitada hasta definir la persistencia.",
  }),
});

export const createMessageController = ({ statusElement, persistenceEnabled }) => {
  const setState = (state) => {
    const safeState = persistenceEnabled ? state : (state === "idle" ? "preview" : state);
    const message = MESSAGE_STATE[safeState] || MESSAGE_STATE.preview;
    statusElement.className = message.className;
    statusElement.textContent = message.text;
    statusElement.dataset.state = safeState;
  };

  setState(persistenceEnabled ? "idle" : "preview");

  return Object.freeze({
    setState,
  });
};
