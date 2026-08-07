import { ROUTES } from "../routes.js";
import {
  focusHeading,
  prefersReducedMotion,
  queryOptional,
} from "../utils/dom.js";

const routes = Object.values(ROUTES);
const HOME_HASH = ROUTES.home.hash;

const resetHomeScrollPosition = () => {
  const page = queryOptional(
    ".site-page",
  );
  const root =
    document.documentElement;
  const body =
    document.body;

  if (
    "scrollRestoration" in window.history
  ) {
    window.history.scrollRestoration =
      "manual";
  }

  if (page) {
    page.scrollTop = 0;
  }

  root.scrollTop = 0;
  body.scrollTop = 0;
  window.scrollTo(0, 0);
};

export const createRouteController = ({
  linkSelector,
  messageController,
}) => {
  let isInitialRoute = true;

  const updateLinks = (hash) => {
    document
      .querySelectorAll(linkSelector)
      .forEach((link) => {
        const isCurrent =
          link.getAttribute("href")
          === hash;

        if (isCurrent) {
          link.setAttribute(
            "aria-current",
            "page",
          );
        } else {
          link.removeAttribute(
            "aria-current",
          );
        }
      });
  };

  const scrollToRoute = (
    route,
    immediate = false,
  ) => {
    if (route.hash === HOME_HASH) {
      resetHomeScrollPosition();
      return;
    }

    const section = queryOptional(
      route.sectionSelector,
    );

    if (!section) {
      return;
    }

    const page = queryOptional(
      ".site-page",
    );

    const mobileSnap =
      document.documentElement
        .dataset.mobileSnap === "true";

    const behavior =
      immediate || prefersReducedMotion()
        ? "auto"
        : "smooth";

    if (mobileSnap && page) {
      const top =
        page.scrollTop
        + section
            .getBoundingClientRect()
            .top
        - page
            .getBoundingClientRect()
            .top;

      page.scrollTo({
        top: Math.max(0, top),
        behavior,
      });
    } else {
      section.scrollIntoView({
        behavior,
        block: "start",
      });
    }

    window.setTimeout(
      () => focusHeading(
        section,
        route.headingSelector,
      ),
      immediate ? 0 : 80,
    );
  };

  const handleRoute = (
    route,
    hash,
  ) => {
    const activeHash =
      route?.hash || hash;

    document.body.dataset.route =
      activeHash;

    updateLinks(activeHash);

    messageController?.setState(
      route?.messageState
      || "preview",
    );

    scrollToRoute(
      route || routes[0],
      isInitialRoute,
    );

    isInitialRoute = false;
  };

  return Object.freeze({
    handleRoute,
  });
};
