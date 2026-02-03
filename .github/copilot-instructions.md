# GearUp - AI Coding Agent Instructions

## Project Overview

GearUp is a gear packing list generator for trips. Users select trip type (tent/hotel) and duration, then get a customized checklist organized by category. Built with React + TypeScript + Convex (serverless backend).

**Tech Stack**: Vite, React 18, TypeScript, Convex (backend), React Hook Form, React Router 7, Tailwind CSS, react-select

## Architecture & Data Flow

### Convex Backend Pattern

This project uses **Convex** as the serverless backend (not REST/GraphQL). All database operations are:

- **Queries** ([convex/gear.ts](convex/gear.ts)) - Real-time reactive data fetching
- **Mutations** ([convex/seed.ts](convex/seed.ts)) - Database writes

Key pattern: Frontend uses Convex React hooks (`useQuery`, `useMutation`) from `convex/react`, NOT TanStack Query.

```tsx
// Example: Fetching gear data
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const gearData = useQuery(api.gear.getGear, { type: 'tent' });
```

### State Management Strategy

- **Convex queries**: Server state (gear database)
- **localStorage**: Persisted user lists with timestamp-based cache invalidation
- **React state**: UI state (current form, selections)
- **React Router state**: Trip details passed between routes via `navigate('/path', { state: {...} })`

See [src/components/gearListForm.tsx](src/components/gearListForm.tsx#L56-L68) for the localStorage caching pattern with timestamp comparison.

### Schema & Database

Database schema lives in [convex/schema.ts](convex/schema.ts):

- Table: `gear` with fields: `name`, `type` ('tent' | 'hotel' | 'all'), `group`, `amount`
- Indexes: `by_type`, `by_name` for filtering
- Search index: `search_name` for autocomplete (see [convex/gear.ts](convex/gear.ts#L21-L33))

**Critical**: IDs use Convex's `Id<"gear">` type, not MongoDB ObjectIds. Type as `string` in frontend types ([src/api/gear.ts](src/api/gear.ts#L2)).

## Development Workflow

### Setup & Running

```bash
npm install
npx convex dev          # Initializes Convex, creates .env.local with VITE_CONVEX_URL
npm run seed            # Seeds database with initial gear data
npm run dev             # Runs Vite dev server (port 5173 by default)
```

**Important**: `npm run dev` has a `predev` script that runs `convex dev --until-success` first. This ensures Convex is ready before Vite starts.

### Seeding Database

Run `npm run seed` (alias for `convex run seed:seedGear`) to populate the gear table. Seed data in [convex/seed.ts](convex/seed.ts).

### Environment Variables

- `VITE_CONVEX_URL` - Auto-generated in `.env.local` by `npx convex dev`
- Access in code: `import.meta.env.VITE_CONVEX_URL`

## Code Conventions

### Component Patterns

1. **Forms**: Use `react-hook-form` with `useForm` hook ([src/components/tripDetailsForm.tsx](src/components/tripDetailsForm.tsx#L12-L17))
2. **Routing**: React Router 7 with `useNavigate` for programmatic navigation
3. **Styling**: Tailwind CSS utility classes (no CSS modules or styled-components)
4. **Icons**: Custom SVG icons in [src/libs/icons/icons.tsx](src/libs/icons/icons.tsx), imported as React components

### TypeScript Conventions

- **Gear types** defined in [src/api/gear.ts](src/api/gear.ts):
  - `GearItem` - DB record with `_id`
  - `GearItemToPack` - Extended with `packed: boolean`, `_id` is optional
  - `GroupedGearListToPack` - Object with group names as keys, arrays of items as values
- Export helper functions like `groupAndMarkList` from type files
- Use explicit return types for components: `(): JSX.Element`

### Convex-Specific Patterns

- **Generated types**: Import from `convex/_generated/api` (auto-generated, in `.gitignore`)
- **Search**: Use Convex search indexes, not client-side filtering ([src/api/useGearSearch.ts](src/api/useGearSearch.ts))
- **Type safety**: Args validated with `v.` validators in Convex functions ([convex/gear.ts](convex/gear.ts#L4-L6))

### Data Transformations

Gear data goes through specific transformations:

1. Fetch from Convex → `GearItem[]`
2. Add `packed: false` → `GearItemToPack[]`
3. Group by `group` field → `GroupedGearListToPack`

See [src/api/gear.ts](src/api/gear.ts#L26-L35) for `groupAndMarkList` implementation.

## Common Tasks

### Adding a New Convex Query

1. Define in [convex/gear.ts](convex/gear.ts) using `query()` wrapper
2. Add args validation with `v.` validators
3. Import in frontend: `import { api } from '../../convex/_generated/api'`
4. Use with: `useQuery(api.gear.yourQuery, { args })`

### Adding a New Component

- Place in [src/components/](src/components/)
- Export default component
- Use PascalCase for files: `myComponent.tsx`
- Import global styles from [src/global.css](src/global.css)

### Modifying Schema

1. Update [convex/schema.ts](convex/schema.ts)
2. Run `npx convex dev` to regenerate types
3. Update frontend types in [src/api/gear.ts](src/api/gear.ts) if needed

## Migration Context

This project was recently migrated from Deno/MongoDB to Convex. See [CONVEX_MIGRATION.md](CONVEX_MIGRATION.md) for details. Key changes:

- No `/api` backend directory (removed)
- TanStack Query removed, replaced with Convex hooks
- MongoDB ObjectIds → Convex IDs

**Do not** suggest TanStack Query, MongoDB, or backend REST APIs - use Convex patterns instead.
