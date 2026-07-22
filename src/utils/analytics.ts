export type AnalyticsEventData = Record<string, string | number | boolean>;

interface AnalyticsProvider {
  track(name: string, data?: AnalyticsEventData): void;
}

declare global {
  interface Window {
    umami?: { track: (name: string, data?: AnalyticsEventData) => void };
    trackEvent?: (name: string, data?: AnalyticsEventData) => void;
  }
}

/**
 * Only this adapter knows the vendor's API shape. allbrainy (and umami.is,
 * which it's compatible with) expose `window.umami.track(name, data)`.
 * Swapping analytics vendors means replacing this object — every call site
 * below goes through trackEvent() and never touches window.* directly.
 */
const provider: AnalyticsProvider = {
  track(name, data) {
    window.umami?.track(name, data);
  },
};

/** Fires a custom analytics event. Silently no-ops if the vendor script hasn't loaded (dev, adblock, consent). */
export function trackEvent(name: string, data?: AnalyticsEventData): void {
  try {
    provider.track(name, data);
  } catch {
    // Analytics must never break the page.
  }
}
