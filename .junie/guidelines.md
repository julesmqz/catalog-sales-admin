# Project Development Guidelines

## 1. Build & Configuration

### Environment Variables
This project requires Firebase configuration to be provided via environment variables. These are defined in `nuxt.config.ts` under `runtimeConfig.public`.

Create a `.env` file in the root directory with the following variables:
- `NUXT_PUBLIC_FIREBASE_API_KEY`
- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NUXT_PUBLIC_FIREBASE_APP_ID`
- `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

### Nuxt 4 Compatibility
The project uses **Nuxt 4** structure (layers, file locations).
- Compatibility version is set to `4` in `nuxt.config.ts`.
- Compatibility date: `2025-07-15`.
- Note the `app/` directory usage for pages, layouts, and components (Nuxt 4 default).

### Installation & Build
```bash
npm install
npm run build
```
To generate a static site (SPA mode is currently enabled with `ssr: false` and `nitro: { preset: 'static' }`):
```bash
npm run generate
```

## 2. Testing Information

### Setup & Configuration
The project is configured to use **Vitest** for unit and component testing. 

To run tests:
```bash
npm run test
```
To run tests in UI mode:
```bash
npx vitest --ui
```

### Adding New Tests
1. Create a `tests/` directory if it doesn't exist.
2. Add test files with `.test.ts` or `.spec.ts` suffix.
3. Use `@nuxt/test-utils` for Nuxt-specific testing.

Example test (`tests/basic.test.ts`):
```typescript
import { describe, it, expect } from 'vitest'

describe('Basic Calculation', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Important Verification
Before running tests for the first time or after dependency updates, ensure Nuxt types are generated:
```bash
npm run postinstall # Runs 'nuxt prepare'
```

## 3. Additional Development Information

### UI & Styling
- **Framework**: Tailwind CSS (configured in `tailwind.config.ts` and `nuxt.config.ts`).
- **Components**: Shadcn Vue (`shadcn-nuxt` module). 
- **Icons**: `lucide-vue-next`.

### Deployment
Deployment is configured for **Firebase Hosting**. 
The `npm run deploy` script builds the project and deploys to Firebase Hosting:
```bash
npm run deploy
```

### Key Composables
Located in `app/composables/`:
- `useAuth.ts`: Authentication logic.
- `useCustomers.ts`: Customer management.
- `useOrders.ts`: Order management.
- `useProducts.ts`: Product management.
