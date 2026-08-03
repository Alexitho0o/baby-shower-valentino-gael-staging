import { noopRsvpAdapter } from "./adapters/noop-rsvp.adapter.js";
import { APP_CONFIG } from "./config/app.config.js";
import { EVENT_CONFIG } from "./config/event.config.js";
import { GIFT_CATALOG_CONFIG } from "./config/gift-catalog.config.js";
import { createHashRouter } from "./router.js";
import { createRsvpService } from "./services/rsvp.service.js";
import { createFormController } from "./ui/form.controller.js";
import { createGiftController } from "./ui/gift.controller.js";
import { createMobileSnapController } from "./ui/mobile-snap.controller.js";
import { createMessageController } from "./ui/message.controller.js";
import { createRouteController } from "./ui/route.controller.js";
import { queryOptional, queryRequired, setText } from "./utils/dom.js";

const getConfigValue = (source, path) => path.split(".").reduce((value, key) => (
  value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : null
), source);

const hydrateEventContent = () => {
  document.querySelectorAll(APP_CONFIG.selectors.eventText).forEach((element) => {
    const configPath = element.dataset.eventText;
    const value = getConfigValue(EVENT_CONFIG, configPath);
    setText(element, value);
  });

  document.querySelectorAll(APP_CONFIG.selectors.eventHref).forEach((element) => {
    const configPath = element.dataset.eventHref;
    const value = getConfigValue(EVENT_CONFIG, configPath);

    if (typeof value === "string" && value.trim()) {
      element.setAttribute("href", value);
    } else {
      element.removeAttribute("href");
      element.setAttribute("aria-disabled", "true");
    }
  });

  document.title = EVENT_CONFIG.event.title.replace(" de Valentino Gael Burgos León", " de Valentino Gael");
  const metaDescription = queryOptional("meta[name='description']");
  setText(metaDescription, null);
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      `${EVENT_CONFIG.event.title}, el ${EVENT_CONFIG.date.display} de ${EVENT_CONFIG.schedule.display}`,
    );
  }
};

const initialize = () => {
  if (APP_CONFIG.featureFlags.eventHydrationEnabled) {
    hydrateEventContent();
  }

  const statusElement = queryRequired(APP_CONFIG.selectors.rsvpStatus);
  const messageController = createMessageController({
    statusElement,
    persistenceEnabled: APP_CONFIG.featureFlags.rsvpPersistenceEnabled,
  });
  const rsvpService = createRsvpService({
    adapter: noopRsvpAdapter,
    featureFlags: APP_CONFIG.featureFlags,
  });

  let formController = null;

  if (APP_CONFIG.featureFlags.rsvpUiEnabled) {
    formController = createFormController({
      config: APP_CONFIG,
      messageController,
      rsvpService,
    });
  }

  if (
    APP_CONFIG.featureFlags.giftSelectionUiEnabled
    && formController
  ) {
    createGiftController({
      form: formController.form,
      catalog: GIFT_CATALOG_CONFIG,
      selectors: APP_CONFIG.selectors,
    });
  }


  if (
    APP_CONFIG.featureFlags
      .mobileSectionSnapEnabled
  ) {
    createMobileSnapController({
      config: APP_CONFIG,
    });
  }

  if (APP_CONFIG.featureFlags.routingEnabled) {
    const routeController = createRouteController({
      linkSelector: APP_CONFIG.selectors.routeLink,
      messageController,
    });
    createHashRouter({
      defaultRoute: APP_CONFIG.defaultRoute,
      onRouteChange: routeController.handleRoute,
    }).start();
  }

  document.documentElement.dataset.appReady = "true";
};

try {
  initialize();
} catch {
  document.documentElement.dataset.appReady = "false";
}
