export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Check for valid Kenya phone number formats
  if (cleaned.length === 12 && cleaned.startsWith("254")) return true;
  if (cleaned.length === 10 && cleaned.startsWith("0")) return true;
  if (cleaned.length === 9 && !cleaned.startsWith("0")) return true;

  return false;
}

export function isValidPrice(price: number): boolean {
  return !isNaN(price) && price >= 0;
}

export function isValidQuantity(quantity: number): boolean {
  return !isNaN(quantity) && Number.isInteger(quantity) && quantity > 0;
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateProduct(product: any): string[] {
  const errors: string[] = [];

  if (!product.name?.trim()) {
    errors.push("Product name is required");
  }

  if (!product.description?.trim()) {
    errors.push("Product description is required");
  }

  if (!isValidPrice(product.price)) {
    errors.push("Invalid price");
  }

  if (!isValidQuantity(product.stock)) {
    errors.push("Invalid stock quantity");
  }

  if (product.images?.length === 0) {
    errors.push("At least one product image is required");
  }

  return errors;
}

export function validateOrder(order: any): string[] {
  const errors: string[] = [];

  if (!order.customerName?.trim()) {
    errors.push("Customer name is required");
  }

  if (!isValidPhone(order.customerPhone)) {
    errors.push("Invalid phone number");
  }

  if (!order.deliveryLocation?.trim()) {
    errors.push("Delivery location is required");
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push("Order must contain at least one item");
  }

  if (!isValidPrice(order.total)) {
    errors.push("Invalid order total");
  }

  return errors;
}
