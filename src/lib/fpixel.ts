// src/lib/fpixel.ts

// Type definition for the Facebook Pixel function if needed
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Helper function to safely call fbq
const callFbq = (...args: any[]) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  } else {
    console.warn("FB Pixel (fbq) not initialized yet.");
    // Optionally queue events if needed, though base code handles queuing
  }
};

// Standard PageView event (called by the base code in layout)
// export const pageview = () => {
//   callFbq('track', 'PageView');
// };

// --- E-commerce Events ---

interface ProductEventArgs {
  content_ids: string[]; // Product IDs (SKUs or database IDs)
  content_name?: string;
  content_type: "product" | "product_group";
  value?: number;
  currency?: string;
}

// ViewContent: User views product details
export const trackViewContent = (params: ProductEventArgs) => {
  callFbq("track", "ViewContent", params);
};

// AddToCart: User adds product to cart
export const trackAddToCart = (params: ProductEventArgs) => {
  callFbq("track", "AddToCart", params);
};

interface InitiateCheckoutEventArgs {
  content_ids: string[];
  content_type: "product" | "product_group";
  num_items: number;
  value: number;
  currency: string;
}

// InitiateCheckout: User begins checkout process
export const trackInitiateCheckout = (params: InitiateCheckoutEventArgs) => {
  callFbq("track", "InitiateCheckout", params);
};

interface PurchaseEventArgs {
  content_ids: string[];
  content_type: "product" | "product_group";
  num_items: number;
  order_id: string;
  value: number;
  currency: string;
}

// Purchase: User completes a purchase
export const trackPurchase = (params: PurchaseEventArgs) => {
  callFbq("track", "Purchase", params);
};

// You can add other standard or custom events here as needed
// export const trackLead = () => {
//   callFbq('track', 'Lead');
// };
