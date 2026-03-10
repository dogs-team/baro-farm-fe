# API Structure

## Core layers

- `lib/api/urls.ts`: gateway/service base URL and env override policy
- `lib/api/session.ts`: auth/session cache helpers (`userId`, `userRole`)
- `lib/api/http-client.ts`: shared fetch client, error parsing, 401 refresh retry
- `lib/api/instances.ts`: service client instances (`userApi`, `buyerApi`, ...)
- `lib/api/client.ts`: shared export surface for app code

## Domain services

- Keep endpoint logic in `lib/api/services/*.ts` by domain (`user`, `product`, `order`, `payment`...)
- UI/page files should call only service functions, not `ApiClient` directly

## Recommended page-to-service mapping

- `/`, `/products`, `/products/:id`: `productService`
- `/search`: `searchService`
- `/cart`: `cartService`
- `/checkout`, `/order/success`, `/order/fail`: `orderService`, `paymentService`, `depositService`
- `/orders`, `/order/:id`: `orderService`
- `/notifications`: `notificationService`
- `/profile`, `/profile/orders`: `userService`, `orderService`
- `/seller/products`: `productService`, `inventoryService`
- `/seller/orders`: `orderService`, `sellerService`
- `/seller/reviews`: `reviewService`
- `/seller/settlement`: `sellerService`, `paymentService`
- `/admin/users`: `adminService`
- `/login`, `/signup`, `/forgot-password`, `/oauth/*`: `userService`

## Implementation rules

- Add API endpoints to the nearest domain service file.
- If a new backend service is introduced, add its URL in `lib/api/urls.ts` and its instance in `lib/api/instances.ts`.
- Do not put page-specific UI logic in service files.
