import { ROUTES } from "../routes.js";
import { focusHeading, prefersReducedMotion, queryOptional } from "../utils/dom.js";

const routes = Object.values(ROUTES);

export const createRouteController = ({ linkSelector, messageController }) => {
  const updateLinks = (hash) => {
    document.querySelectorAll(linkSelector).forEach((link) => {
      const isCurrent = link.getAttribute("href") === hash;
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const scrollToRoute = (route) => {
    const section = queryOptional(route.sectionSelector);
    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => focusHeading(section, route.headingSelector), 80);
  };

  const handleRoute = (route, hash) => {
    const activeHash = route?.hash || hash;
    document.body.dataset.route = activeHash;
    updateLinks(activeHash);
    messageController?.setState(route?.messageState || "preview");
    scrollToRoute(route || routes[0]);
  };

  return Object.freeze({
    handleRoute,
  });
};
