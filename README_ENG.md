# BaroFarm Frontend

[한글 README](./README.md)

BaroFarm is a Next.js frontend for agricultural product commerce.  
It includes product browsing, search, cart, checkout, order tracking, Kakao login, seller application, seller dashboard, and admin user management.

## Features

- Product listing and product detail pages
- Search and wishlist
- Cart and checkout flow
- Order history and order detail
- Kakao OAuth login
- Toss Payments integration
- My page and notifications
- Seller application and seller dashboard
- Admin user management

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- React Hook Form
- Zod
- pnpm

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm 10 or later

### Install

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

Open `http://localhost:3000`.

### Production build

```bash
pnpm build
pnpm start
```

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
```

## Environment Variables

Create `.env.local` in the project root.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# Optional service-specific overrides
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8080/user-service
NEXT_PUBLIC_BUYER_SERVICE_URL=http://localhost:8080/buyer-service
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:8080/order-service
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:8080/payment-service
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8080/ai-service

NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
NEXT_PUBLIC_IMAGE_BASE_URL=/uploads
```

### Environment variable notes

- `NEXT_PUBLIC_API_BASE_URL`: public frontend base URL
- `NEXT_PUBLIC_API_GATEWAY_URL`: backend gateway base URL
- `NEXT_PUBLIC_KAKAO_CLIENT_ID`: Kakao login client ID
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: Toss Payments client key
- Service-specific URLs are optional overrides for the gateway-based defaults

## Project Structure

```text
app/           Next.js App Router pages and route handlers
components/    Reusable UI and feature components
hooks/         Custom React hooks
lib/           API clients, services, stores, and utilities
public/        Static assets
scripts/       Helper scripts kept in the repository
```

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Home |
| `/products` | Product list |
| `/products/[id]` | Product detail |
| `/search` | Search |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/orders` | Order history |
| `/order/[id]` | Order detail |
| `/login` | Login |
| `/signup` | Sign up |
| `/oauth/kakao/callback` | Kakao OAuth callback |
| `/profile` | My page |
| `/dashboard` | Seller dashboard entry |
| `/seller/products` | Seller products |
| `/seller/orders` | Seller orders |
| `/seller/reviews` | Seller reviews |
| `/seller/settlement` | Seller settlement |
| `/admin/users` | Admin users |

## Deployment

The current deployment target is Vercel.

### Vercel setup

1. Import the GitHub repository into Vercel.
2. Set the framework preset to `Next.js`.
3. Optionally set the install command to `pnpm install --frozen-lockfile`.
4. Optionally set the build command to `pnpm build`.
5. Add the required environment variables in Vercel Project Settings.

### Recommended Vercel environment variables

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_KAKAO_CLIENT_ID`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- Optional service-specific API URLs

## API Integration

The frontend communicates with backend services through modules under `lib/api/services`.

- `user-service`: auth, OAuth, seller application
- `buyer-service`: products and cart-related APIs
- `order-service`: order-related APIs
- `payment-service`: payment-related APIs
- `ai-service`: chatbot and AI-related APIs
- `support-service`: notifications, reviews, settlement, and support features

## Notes

- The active public-facing scope is focused on agricultural product commerce.
- Experience reservation is not part of the current product flow.
- Some legacy assets or text may still remain in the repository and can be cleaned up separately.

## License

Follow the repository policy if a separate license file is not provided.
