# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (run both simultaneously in separate terminals)
npm run dev           # Vite frontend (note: predev hook auto-runs `convex dev --until-success`)
npx convex dev        # Convex backend with type generation

# Build
npm run build         # convex codegen + tsc + vite build

# Lint (zero warnings allowed)
npm run lint

# Seed the gear catalog
npm run seed          # alias for: convex run seed:seedGear
```

> TypeScript types for Convex are generated at runtime. If you see import errors in `_generated/`, run `npx convex dev` first.

## Architecture

GearUp is a camping gear packing app. The stack is:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router 7
- **Backend**: Convex (real-time database + serverless functions)
- **Auth**: Clerk (`@clerk/clerk-react` + `convex/react-clerk`)

### Provider nesting (`src/main.tsx`)

```
ClerkProvider
  └── ConvexProviderWithClerk (bridges Clerk JWT into Convex)
        └── RouterProvider
              └── App (Header + <Outlet />)
```

### Routes

| Path | Component | Auth |
|------|-----------|------|
| `/` | `HomePage` | Public |
| `/sign-in/*` | `SignInPage` (Clerk) | Public |
| `/sign-up/*` | `SignUpPage` (Clerk) | Public |
| `/gear-list` | `GearListPage` via `ProtectedRoute` | Required |

`ProtectedRoute` (`src/components/auth/protectedRoute.tsx`) redirects unauthenticated users to `/sign-in`.

### Convex backend (`convex/`)

| File | Purpose |
|------|---------|
| `schema.ts` | All table definitions |
| `auth.config.ts` | Clerk JWT domain for Convex verification |
| `lib/auth.ts` | Shared auth helpers (see below) |
| `gear.ts` | Public gear catalog queries |
| `gearLists.ts` | User gear list CRUD (auth-gated) |
| `trips.ts` | User trip CRUD (auth-gated) |
| `users.ts` | User profile management |
| `seed.ts` | Database seeding |

### Data model

```
gear            — Global shared catalog (type: 'tent' | 'hotel' | 'all')
users           — Synced from Clerk (indexed by clerkId)
trips           — User-owned; linked to users via userId
gearLists       — User-owned; optionally linked to a trip
gearListItems   — Links gearLists ↔ gear with quantity/isPacked state
```

### Auth helper pattern (`convex/lib/auth.ts`)

All protected Convex functions call one of:
- `getCurrentUser(ctx)` — throws if not authenticated or user not in DB
- `getOrCreateCurrentUser(ctx)` — creates user row on first mutation (used in write paths)
- `verifyOwnership(ctx, resourceUserId, resourceType)` — throws if caller doesn't own resource

Ownership is always verified before modifying `gearLists`, `gearListItems`, or `trips`.

## Conventions

### TypeScript
- No `any` types anywhere — use `unknown` or specific types
- Use `Doc<"tableName">` and `Id<"tableName">` from `_generated/dataModel`
- Validate all Convex function args with the `v` object from `convex/values`

### Convex functions
- Use `ConvexError` (not plain `Error`) for user-facing errors
- Perform auth/ownership checks at the **start** of every protected handler
- Use `db.patch()` for partial updates, `db.replace()` only for full overwrites
- Group related queries and mutations by domain in the same file (e.g., all gear list logic in `gearLists.ts`)
- Shared utilities go in `convex/lib/`

### React components
- Functional components only, PascalCase names, default exports
- Tailwind CSS utility classes for all styling (no inline styles, no CSS files)
- File names use kebab-case (e.g., `signInPage.tsx`, `protectedRoute.tsx`)
- Keep components small and focused on a single responsibility — split when a component grows too large
- Separate presentational components (render UI, receive data via props) from logic components (fetch data, manage state, orchestrate behavior)
- Extract shared or complex logic into custom hooks (`use*.ts`) rather than duplicating it across components

### Comments
- Prefer well-named variables and functions over explanatory comments
- Add comments only when the *why* cannot be expressed in code (e.g. non-obvious business rules, workarounds)
- Never use comments to describe *what* the code does — rewrite the code to be self-evident instead

## Validation loop

Before handing over any edits for acceptance, always run these steps in order and fix any failures before finishing:

```bash
# 1. Format (Prettier — singleQuote, semi, trailingComma: es5, tabWidth: 2)
npx prettier --write .

# 2. Lint (zero warnings allowed; also enforces Prettier via eslint-plugin-prettier)
npm run lint

# 3. Build (convex codegen → tsc → vite build)
npm run build
```

If `npm run build` fails because Convex types are stale, run `npx convex dev` first to regenerate `convex/_generated/`.

## Environment variables

Create `.env.local` with:
```
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

## Current status

- **Auth**: Fully implemented with Clerk (sign-up, sign-in, sign-out, protected routes)
- **Backend**: All CRUD for users, trips, gear lists, and gear list items is complete
- **Pending**: `gearListPage.tsx` and `gearListForm.tsx` still use local storage and need to be wired to the authenticated Convex backend (`gearLists.*` mutations)
- **Not started**: Trip management UI, profile management UI
