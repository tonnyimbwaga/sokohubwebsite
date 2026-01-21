# Google Analytics 4 Setup for Toto Toys & Fun

## Environment Variables Required

The following environment variables have been configured in Cloudflare:

### Client-Side Tracking
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: `G-YPJGEPLZGH`

### Server-Side Analytics API
- `GA4_PROPERTY_ID`: `487148205`
- `GA_SERVICE_ACCOUNT_KEY`: JSON service account credentials

## Features Implemented

### 1. Client-Side Tracking
- **Page Views**: Automatic tracking on all pages
- **E-commerce Events**:
  - `add_to_cart`: When users add products to cart
  - `view_item`: When users click on product cards
  - `search`: When users perform searches
  - `begin_checkout`: When users start checkout process
  - `purchase`: When users complete purchases

### 2. Server-Side Analytics API
- **Analytics Dashboard**: `/api/analytics` endpoint
- **Report Types**:
  - `overview`: Sessions, users, page views, bounce rate
  - `ecommerce`: Add to cart, revenue, purchases
  - `popular-products`: Most viewed and added products
  - `search-terms`: Popular search queries

### 3. Components with Analytics

#### ProductCard.tsx
- Tracks `add_to_cart` events with product details
- Tracks `view_item` events when cards are clicked
- Includes product ID, name, category, price, and currency (KES)

#### MainNav.tsx (Search)
- Tracks `search` events with search terms and result counts
- Automatically tracks when search results are loaded

#### Analytics Dashboard
- Displays real-time analytics data
- Shows key metrics: users, sessions, page views, bounce rate
- Responsive design with loading states

## Usage Examples

### Track Custom Events
```typescript
import { trackEvent, trackCustomEvent } from '@/lib/analytics';

// Track a custom event
trackEvent('button_click', {
  event_category: 'engagement',
  event_label: 'header_cta',
  value: 1
});

// Track custom e-commerce event
trackCustomEvent('promotion_view', {
  promotion_id: 'summer_sale',
  promotion_name: 'Summer Sale 2024'
});
```

### Fetch Analytics Data
```typescript
// Get overview data
const response = await fetch('/api/analytics?type=overview&startDate=7daysAgo&endDate=today');
const data = await response.json();

// Get e-commerce data
const ecommerceData = await fetch('/api/analytics?type=ecommerce');
```

## Data Privacy & Compliance

- All tracking respects user privacy
- No personally identifiable information is collected
- Events include only product and interaction data
- Compatible with GDPR and privacy regulations

## Performance Optimizations

- Analytics scripts load with `afterInteractive` strategy
- Error handling prevents tracking failures from affecting UX
- Debounced search tracking to avoid excessive API calls
- Client-side validation before sending events

## Testing

To verify analytics are working:

1. **Client-Side**: Check browser dev tools Network tab for `gtag` calls
2. **Server-Side**: Monitor `/api/analytics` endpoint responses
3. **GA4 Dashboard**: View real-time reports in Google Analytics
4. **Debug Mode**: Enable GA4 debug mode for detailed event tracking

## Troubleshooting

### Common Issues

1. **Events not appearing**: Check that `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` is set
2. **API errors**: Verify `GA_SERVICE_ACCOUNT_KEY` JSON format
3. **Property access**: Ensure service account has Analytics Viewer permissions
4. **CORS issues**: Analytics API calls are server-side only

### Debug Mode
Add `?debug_mode=1` to URLs to enable enhanced GA4 debugging.

## Next Steps

1. Set up conversion goals in GA4 dashboard
2. Configure enhanced e-commerce reporting
3. Add audience segmentation
4. Implement A/B testing with GA4 experiments
5. Set up automated reports and alerts 