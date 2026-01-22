// Google Analytics 4 utility functions - Performance Optimized
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: any,
    ) => void;
    dataLayer: any[];
  }
}

// Performance-optimized GA loading check
let gaLoadedCache: boolean | null = null;
export const isGALoaded = (): boolean => {
  if (gaLoadedCache !== null) return gaLoadedCache;

  if (typeof window === "undefined") {
    gaLoadedCache = false;
    return false;
  }

  // Only check if GA ID is present to avoid unnecessary calls
  if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    gaLoadedCache = false;
    return false;
  }

  gaLoadedCache = typeof window.gtag === "function";
  return gaLoadedCache;
};

// Lightweight event queue for offline/slow connections
const eventQueue: Array<{ name: string; params: any }> = [];
let isProcessingQueue = false;

const processEventQueue = () => {
  if (isProcessingQueue || !isGALoaded()) return;

  isProcessingQueue = true;

  try {
    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      if (event) {
        window.gtag("event", event.name, event.params);
      }
    }
  } catch (error) {
    // Silent fail in production, log in development
    if (process.env.NODE_ENV === "development") {
      console.warn("GA queue processing error:", error);
    }
  } finally {
    isProcessingQueue = false;
  }
};

// Debounced tracking to prevent spam
const trackingDebounce = new Map<string, number>();
const DEBOUNCE_TIME = 1000; // 1 second

const shouldTrack = (eventKey: string): boolean => {
  const now = Date.now();
  const lastTracked = trackingDebounce.get(eventKey);

  if (!lastTracked || now - lastTracked > DEBOUNCE_TIME) {
    trackingDebounce.set(eventKey, now);
    return true;
  }

  return false;
};

// Optimized track event function
export const trackEvent = (
  eventName: string,
  parameters?: {
    event_category?: string;
    event_label?: string;
    value?: number;
    currency?: string;
    [key: string]: any;
  },
) => {
  // Skip if not in browser or no GA ID
  if (
    typeof window === "undefined" ||
    !process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  )
    return;

  const eventKey = `${eventName}_${JSON.stringify(parameters)}`;
  if (!shouldTrack(eventKey)) return;

  if (isGALoaded()) {
    try {
      window.gtag("event", eventName, parameters);
    } catch (error) {
      // Queue for retry if GA fails
      eventQueue.push({ name: eventName, params: parameters });
    }
  } else {
    // Queue event if GA not loaded yet
    eventQueue.push({ name: eventName, params: parameters });

    // Try to process queue after a delay
    setTimeout(processEventQueue, 2000);
  }
};

// Optimized page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === "undefined") return;

  trackEvent("page_view", {
    page_title: title || document.title,
    page_location: url,
  });
};

// E-commerce tracking with validation
export const trackAddToCart = (item: {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}) => {
  // Validate required fields
  if (!item.items || item.items.length === 0) return;

  trackEvent("add_to_cart", {
    currency: item.currency || "KES",
    value: item.value || 0,
    items: item.items.map((i) => ({
      item_id: String(i.item_id),
      item_name: String(i.item_name),
      category: String(i.category || "Unknown"),
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
    })),
  });
};

// Optimized view item tracking
export const trackViewItem = (item: {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    price: number;
  }>;
}) => {
  if (!item.items || item.items.length === 0) return;

  trackEvent("view_item", {
    currency: item.currency || "KES",
    value: item.value || 0,
    items: item.items.map((i) => ({
      item_id: String(i.item_id),
      item_name: String(i.item_name),
      category: String(i.category || "Unknown"),
      price: Number(i.price) || 0,
    })),
  });
};

// Lightweight search tracking
export const trackSearch = (searchTerm: string, results?: number) => {
  if (!searchTerm || searchTerm.length < 2) return;

  trackEvent("search", {
    search_term: searchTerm.toLowerCase().trim(),
    ...(typeof results === "number" && { search_results: results }),
  });
};

// Purchase tracking
export const trackPurchase = (transactionData: {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}) => {
  if (!transactionData.transaction_id || !transactionData.items?.length) return;

  trackEvent("purchase", {
    transaction_id: String(transactionData.transaction_id),
    value: Number(transactionData.value) || 0,
    currency: transactionData.currency || "KES",
    items: transactionData.items.map((i) => ({
      item_id: String(i.item_id),
      item_name: String(i.item_name),
      category: String(i.category || "Unknown"),
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
    })),
  });
};

// Begin checkout tracking
export const trackBeginCheckout = (checkoutData: {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}) => {
  if (!checkoutData.items?.length) return;

  trackEvent("begin_checkout", {
    currency: checkoutData.currency || "KES",
    value: Number(checkoutData.value) || 0,
    items: checkoutData.items.map((i) => ({
      item_id: String(i.item_id),
      item_name: String(i.item_name),
      category: String(i.category || "Unknown"),
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
    })),
  });
};

// Custom event tracking
export const trackCustomEvent = (eventName: string, data?: any) => {
  if (!eventName) return;

  trackEvent(eventName, data);
};

// Initialize event queue processing when GA loads
if (typeof window !== "undefined") {
  // Check periodically if GA has loaded and process queue
  const checkGAInterval = setInterval(() => {
    if (isGALoaded()) {
      processEventQueue();
      clearInterval(checkGAInterval);
    }
  }, 1000);

  // Clear interval after 30 seconds to prevent memory leaks
  setTimeout(() => clearInterval(checkGAInterval), 30000);
}
