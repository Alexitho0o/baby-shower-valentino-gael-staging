export const queryOptional = (selector, root = document) => root.querySelector(selector);

export const queryRequired = (selector, root = document) => {
  const element = queryOptional(selector, root);
  if (!element) {
    throw new Error(`No se encontró el selector requerido: ${selector}`);
  }
  return element;
};

export const setText = (element, value) => {
  if (!element || value === null || value === undefined) {
    return;
  }
  element.textContent = String(value);
};

export const prefersReducedMotion = () => (
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
);

export const focusHeading = (section, headingSelector) => {
  const heading = headingSelector ? queryOptional(headingSelector, section) : queryOptional("h1, h2, h3", section);
  if (!heading) {
    return;
  }

  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
};
