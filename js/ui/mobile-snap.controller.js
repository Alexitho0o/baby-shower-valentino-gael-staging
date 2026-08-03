import {
  prefersReducedMotion,
} from "../utils/dom.js";

const MOBILE_QUERY = "(max-width: 899px)";

const isInteractiveElement = (element) => (
  element instanceof Element
  && element.matches(
    "input, textarea, select, button, "
    + "a[href], [contenteditable='true']",
  )
);

const getSectionLabel = (
  section,
  index,
) => {
  const heading = section.querySelector(
    "h1, h2, h3",
  );

  return (
    section.dataset.snapLabel
    || heading?.textContent?.trim()
    || `Sección ${index + 1}`
  );
};

const getSnapSections = () => {
  const page = document.querySelector(
    ".site-page",
  );

  if (!page) {
    return [];
  }

  const hero = page.querySelector(
    ".site-hero",
  );

  const main = page.querySelector(
    "main",
  );

  const mainSections = main
    ? Array.from(main.children).filter(
        (element) => (
          element.matches(
            "section, article",
          )
        ),
      )
    : [];

  const footer = page.querySelector(
    ".site-footer",
  );

  return [
    hero,
    ...mainSections,
    footer,
  ].filter(Boolean);
};

export const createMobileSnapController = ({
  config,
}) => {
  const enabled =
    config.featureFlags
      .mobileSectionSnapEnabled === true;

  const root =
    document.documentElement;
  const body =
    document.body;
  const media =
    window.matchMedia(MOBILE_QUERY);
  const sections =
    getSnapSections();

  if (
    !enabled
    || sections.length === 0
  ) {
    return Object.freeze({
      enabled: false,
      sections: [],
    });
  }

  let activeSection = sections[0];
  let observer = null;

  sections.forEach(
    (section, index) => {
      section.dataset.snapSection =
        String(index + 1);
      section.dataset.snapLabel =
        getSectionLabel(
          section,
          index,
        );
    },
  );

  const updateOverflowState = () => {
    const viewportHeight =
      window.visualViewport?.height
      || window.innerHeight;

    sections.forEach((section) => {
      const hasInternalOverflow =
        section.scrollHeight
        > Math.ceil(viewportHeight) + 2;

      section.toggleAttribute(
        "data-snap-overflow",
        hasInternalOverflow,
      );
    });
  };

  const updateActiveSection = (
    section,
  ) => {
    activeSection = section;

    body.dataset.activeSnapSection =
      section.dataset.snapSection;

    body.dataset.activeSnapLabel =
      section.dataset.snapLabel;
  };

  const rebuildObserver = () => {
    observer?.disconnect();
    observer = null;

    if (
      !media.matches
      || typeof IntersectionObserver
        !== "function"
    ) {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(
            (entry) => (
              entry.isIntersecting
              && entry.intersectionRatio
                >= 0.5
            ),
          )
          .sort(
            (left, right) => (
              right.intersectionRatio
              - left.intersectionRatio
            ),
          );

        if (visible[0]) {
          updateActiveSection(
            visible[0].target,
          );
        }
      },
      {
        root: body,
        threshold: [
          0.5,
          0.65,
          0.8,
        ],
      },
    );

    sections.forEach(
      (section) => (
        observer.observe(section)
      ),
    );
  };

  const updateMode = () => {
    const active = media.matches;

    if (active) {
      root.dataset.mobileSnap =
        "true";
      body.dataset.mobileSnap =
        "true";

      requestAnimationFrame(() => {
        updateOverflowState();
        rebuildObserver();
      });
    } else {
      delete root.dataset.mobileSnap;
      delete body.dataset.mobileSnap;
      delete body.dataset
        .activeSnapSection;
      delete body.dataset
        .activeSnapLabel;

      observer?.disconnect();
      observer = null;
    }
  };

  const scrollToSection = (
    section,
  ) => {
    section.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: prefersReducedMotion()
        ? "auto"
        : "smooth",
    });
  };

  const moveBy = (offset) => {
    const currentIndex = Math.max(
      0,
      sections.indexOf(activeSection),
    );

    const targetIndex = Math.min(
      sections.length - 1,
      Math.max(
        0,
        currentIndex + offset,
      ),
    );

    scrollToSection(
      sections[targetIndex],
    );
  };

  const handleKeyboard = (event) => {
    if (
      !media.matches
      || event.defaultPrevented
      || isInteractiveElement(
        event.target,
      )
    ) {
      return;
    }

    const actions = {
      ArrowDown: () => moveBy(1),
      PageDown: () => moveBy(1),
      ArrowUp: () => moveBy(-1),
      PageUp: () => moveBy(-1),
      Home: () => scrollToSection(
        sections[0],
      ),
      End: () => scrollToSection(
        sections[
          sections.length - 1
        ],
      ),
    };

    const action =
      actions[event.key];

    if (!action) {
      return;
    }

    event.preventDefault();
    action();
  };

  const handleResize = () => {
    requestAnimationFrame(
      updateOverflowState,
    );
  };

  media.addEventListener(
    "change",
    updateMode,
  );

  window.addEventListener(
    "resize",
    handleResize,
    {
      passive: true,
    },
  );

  window.visualViewport
    ?.addEventListener(
      "resize",
      handleResize,
      {
        passive: true,
      },
    );

  document.addEventListener(
    "keydown",
    handleKeyboard,
  );

  const resizeObserver =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(
          handleResize,
        )
      : null;

  sections.forEach(
    (section) => (
      resizeObserver?.observe(section)
    ),
  );

  updateMode();
  updateActiveSection(sections[0]);

  return Object.freeze({
    enabled: true,
    sections,
    refresh: updateMode,
    destroy: () => {
      observer?.disconnect();
      resizeObserver?.disconnect();

      media.removeEventListener(
        "change",
        updateMode,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      window.visualViewport
        ?.removeEventListener(
          "resize",
          handleResize,
        );

      document.removeEventListener(
        "keydown",
        handleKeyboard,
      );

      delete root.dataset.mobileSnap;
      delete body.dataset.mobileSnap;
    },
  });
};
