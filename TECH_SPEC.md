# Convex Auth Implementation Technical Specification (GearUp)

## Overview

Implement Convex Auth for the GearUp React (Vite) app using Convex Auth documentation. The solution introduces secure email+password authentication with email verification and password reset, new sign-in/sign-up screens, route protection, and authenticated UI states. Backend setup includes Convex Auth tables, server auth configuration, and HTTP routes required by the library. The frontend replaces the provider with `ConvexAuthProvider`, adds auth pages and a guard for protected routes, and updates the header to show sign-in/out actions. Security is prioritized via strong password validation, email verification, secure token handling, and avoidance of XSS patterns.

## Files to Create/Modify

### Backend (Convex)

- `convex/schema.ts` - add Convex Auth tables alongside existing `gear`
- `convex/auth.config.ts` - configure Auth.js provider domain
- `convex/auth.ts` - initialize `convexAuth` and register providers
- `convex/http.ts` - register auth HTTP routes
- `convex/ResendOTP.ts` - email verification provider (OTP)
- `convex/ResendOTPPasswordReset.ts` - password reset provider (OTP)
- `convex/gear.ts` - optional: enforce auth for any user-specific data (future-proof)

### Frontend (React)

- `src/main.tsx` - replace `ConvexProvider` with `ConvexAuthProvider`
- `src/App.tsx` - wrap content with auth-aware layout; show loading state
- `src/components/header.tsx` - add sign-in/out UI (rename existing if needed)
- `src/components/auth/AuthLayout.tsx` - shared layout for auth pages
- `src/components/auth/SignInPage.tsx` - sign-in form
- `src/components/auth/SignUpPage.tsx` - sign-up form
- `src/components/auth/PasswordResetPage.tsx` - reset flow
- `src/components/auth/EmailVerificationPage.tsx` - verification flow
- `src/components/auth/ProtectedRoute.tsx` - route guard with `Authenticated`, `Unauthenticated`, `AuthLoading`
- `src/routes.tsx` - optional: centralize routes for clarity
- `package.json` - add `@convex-dev/auth` and `@auth/core`

## Data Model Changes

```typescript
// convex/schema.ts additions/modifications
export default defineSchema({
  ...authTables,
  gear: defineTable({
    name: v.string(),
    type: v.union(v.literal('tent'), v.literal('hotel'), v.literal('all')),
    group: v.string(),
    amount: v.number(),
  })
    .index('by_type', ['type'])
    .index('by_name', ['name'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['type'],
    }),
});
```

## Component Hierarchy

```
App
├── Header
├── AuthLoading (loading state)
├── Routes
│   ├── /login → SignInPage
│   ├── /signup → SignUpPage
│   ├── /reset-password → PasswordResetPage
│   ├── /verify-email → EmailVerificationPage
│   └── /gear-list → ProtectedRoute
│        └── GearListPage
└── HomePage (public)
```

## Implementation Steps

1. **Backend Setup**

   - Add Convex Auth tables in `convex/schema.ts`.
   - Create `convex/auth.config.ts` with provider domain using `CONVEX_SITE_URL`.
   - Create `convex/auth.ts` using `convexAuth` and configure the `Password` provider with:
     - `verify` using `convex/ResendOTP.ts` for email verification.
     - `reset` using `convex/ResendOTPPasswordReset.ts` for password reset.
     - `validatePasswordRequirements` for strong password policy.
     - `profile` for email normalization and optional user fields.
   - Add `convex/http.ts` and register `auth.addHttpRoutes`.
   - Ensure environment variables:
     - `JWT_PRIVATE_KEY`, `JWKS` (generated via Convex Auth setup)
     - `SITE_URL` (for magic link/OTP URLs; still recommended)
     - `CONVEX_SITE_URL` (for Auth.js config)
     - `AUTH_RESEND_KEY` (if using Resend)
   - Optional: for any user-owned data in future, enforce `getAuthUserId` checks in `convex/gear.ts`.

2. **Frontend Implementation**

   - Replace provider in `src/main.tsx` with `ConvexAuthProvider`.
   - Add auth pages:
     - `SignInPage` uses `useAuthActions().signIn` with `flow="signIn"`.
     - `SignUpPage` uses `flow="signUp"` and handles post-submit verification step.
     - `EmailVerificationPage` uses `flow="email-verification"` with OTP input.
     - `PasswordResetPage` uses `flow="reset"` then `flow="reset-verification"`.
   - Build `ProtectedRoute` to handle:
     - `AuthLoading` fallback
     - `Authenticated` render
     - `Unauthenticated` redirect to `/login`
   - Update `src/App.tsx` to include loading state and consistent layout.
   - Update header to display `SignIn`/`SignOut` and current auth state.

3. **Integration**
   - Update router config (currently in `src/main.tsx`) to include auth routes and wrap protected routes.
   - Ensure form validation (client-side) mirrors backend checks.
   - Provide error messaging without leaking sensitive details.
   - Run linting and confirm no `any` usage.

## Technical Considerations

- **Security:**
  - Enforce strong password rules in backend `validatePasswordRequirements`.
  - Require email verification for new accounts (`verify` provider).
  - Enable password reset via OTP (`reset` provider).
  - Avoid `dangerouslySetInnerHTML` and sanitize any user content.
  - Use `ConvexError` for safe error exposure.
- **Token Storage:**
  - Convex Auth stores tokens in `localStorage` by default; ensure strict XSS prevention.
  - Consider `sessionStorage` for reduced persistence if desired.
- **Route Protection:**
  - Avoid UI flash by using `AuthLoading`.
  - Redirect unauthenticated access to `/gear-list`.
- **User Experience:**
  - Separate sign-in and sign-up screens for clarity.
  - Use an interstitial verification screen for OTP entry.
- **Dependencies:**
  - Add `@convex-dev/auth` and `@auth/core` in `package.json`.

## Acceptance Criteria

- [ ] Convex Auth is configured with `authTables`, `auth.ts`, `auth.config.ts`, and `http.ts`.
- [ ] Users can sign up, verify email, sign in, and reset password.
- [ ] Authenticated routes are protected using `Authenticated`, `Unauthenticated`, and `AuthLoading`.
- [ ] Header displays sign-in/out state correctly.
- [ ] Security best practices are applied (strong passwords, verification, no XSS patterns).
- [ ] No TypeScript `any` usage introduced.
