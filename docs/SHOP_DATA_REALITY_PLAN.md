# Shop Data Reality Plan

## Goal

Reduce mock data in the public shop list and shop detail screens. The UI should prefer backend data, show clear empty/unavailable states when data is missing, and keep image data ready for real shop photos when URLs or files are provided.

## Current Data Sources

- `GET /api/v1/shops` is the primary source for the shop card list.
- `GET /api/v1/shops/:id` is the primary source for shop profile detail.
- `GET /api/v1/shops/:id/service-categories` is the primary source for shop services.
- `src/data/allShops.json` and `src/data/shopDetails.json` are legacy mock files and should not be treated as live data.
- `src/data/services.json` is only a local metadata/catalog fallback for service copy and should not replace real shop service data.

## Shop Card Target Contract

Recommended fields from backend:

- `id`
- `name`
- `rating`
- `ratingCount`
- `imageUrl`
- `startingPrice`
- `distanceKm`
- `deliveryHours`
- `deliveryLabel`
- `isOpenToday`
- `openingStatus`
- `address`

UI behavior:

- Show `Open today` only when `isOpenToday` is true or `openingStatus` says the shop is open.
- Do not show fake `0.0 km`; show unavailable state if distance is missing.
- Do not show fake `24 h Delivery`; use `deliveryHours` or `deliveryLabel` only.
- Do not show `0 VND/kg` as a real price when `startingPrice` is missing.
- Use local fallback images only as visual placeholders, not as data truth.

## Shop Detail Target Contract

Recommended fields from backend:

- `id`
- `name`
- `rating`
- `ratingCount`
- `address`
- `image` or `imageUrl`
- `gallery`
- `distance`
- `turnaround`
- `hours`
- `promotions`
- `reviews`

Service category fields:

- `id`
- `serviceName` or `name`
- `price`
- `description`
- `estimatedTime`
- `minOrder`
- `pricingType` or `serviceUnit`
- `available`
- `categoryName`

UI behavior:

- Do not inject default hours if backend does not provide hours.
- Do not inject default reviews.
- Do not inject fake promo codes.
- Do not inject default services as selectable services.
- Render empty states when services, reviews, promotions, hours, or distance are absent.

## Image Input Options

The user can provide either files or URLs.

Preferred file format:

```txt
public/shop-images/shop-1-cover.jpg
public/shop-images/shop-2-cover.jpg
```

Preferred URL mapping:

```txt
shopId=1, imageUrl=https://example.com/shop-1.jpg
shopId=2, imageUrl=https://example.com/shop-2.jpg
```

Multiple images per shop:

```txt
shopId=1
cover=https://example.com/shop-1-cover.jpg
gallery=https://example.com/a.jpg, https://example.com/b.jpg
```

## Implementation Steps

1. Move root Markdown documents into `docs`.
2. Keep the public shop list bound to `GET /api/v1/shops`.
3. Normalize shop card data without silently converting missing fields to real-looking values.
4. Render shop card badges and metadata only when the backend provides the needed data.
5. Keep detail profile data bound to `GET /api/v1/shops/:id`.
6. Keep services bound to `GET /api/v1/shops/:id/service-categories`.
7. Remove fake detail promo, review, hour, and service injection.
8. Add safe empty states for missing services/reviews/promotions.
9. Leave image mapping ready for real URLs or files when provided.
10. Run build verification.

