const MESSAGE_STATE = Object.freeze({
  idle: Object.freeze({
    className: "message message--warning field--full",
    text: "Vista previa: la confirmación en línea se habilitará en la próxima etapa.",
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
    text: "Estado de previsualización: todavía no se enviará ninguna confirmación.",
  }),
  success: Object.freeze({
    className: "message message--success field--full",
    text: "Estado de previsualización: el flujo de éxito está preparado, pero no se ha recibido ninguna confirmación real.",
  }),
  error: Object.freeze({
    className: "message message--error field--full",
    text: "Estado de previsualización: el flujo de error está preparado y no corresponde a un envío real.",
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
