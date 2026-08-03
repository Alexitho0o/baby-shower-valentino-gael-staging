import { DEFAULT_ROUTE, REQUIRED_ROUTE_HASHES, ROUTES } from "./routes.js";

const routeByHash = new Map(Object.values(ROUTES).map((route) => [route.hash, route]));

export const normalizeHash = (hash) => {
  const cleanHash = typeof hash === "string" ? hash.trim() : "";
  if (!cleanHash || cleanHash === "#") {
    return DEFAULT_ROUTE;
  }

  const withoutQuery = cleanHash.split("?")[0];
  return REQUIRED_ROUTE_HASHES.includes(withoutQuery) ? withoutQuery : DEFAULT_ROUTE;
};

export const getRoute = (hash) => routeByHash.get(normalizeHash(hash)) || routeByHash.get(DEFAULT_ROUTE);

export const createHashRouter = ({ onRouteChange, defaultRoute = DEFAULT_ROUTE } = {}) => {
  const routeTo = (rawHash, replace = false) => {
    const normalizedHash = normalizeHash(rawHash);
    const route = getRoute(normalizedHash);

    if (window.location.hash !== normalizedHash) {
      if (replace) {
        window.history.replaceState(null, "", normalizedHash);
        onRouteChange?.(route, normalizedHash);
      } else {
        window.location.hash = normalizedHash;
      }
      return route;
    }

    onRouteChange?.(route, normalizedHash);
    return route;
  };

  const handleHashChange = () => {
    const normalizedHash = normalizeHash(window.location.hash);
    routeTo(normalizedHash, normalizedHash !== window.location.hash);
  };

  const start = () => {
    window.addEventListener("hashchange", handleHashChange);
    routeTo(window.location.hash || defaultRoute, true);
  };

  return Object.freeze({
    start,
    routeTo,
    getRoute,
  });
};
