# Migration to Convex

This project has been migrated from Deno/MongoDB to Convex.

## Setup Instructions

1. **Create a Convex account**

   - Visit https://dashboard.convex.dev
   - Sign up or log in

2. **Initialize Convex**

   ```bash
   npx convex dev
   ```

   This will:

   - Prompt you to login
   - Create a new Convex project (or select an existing one)
   - Generate a `.env.local` file with your `VITE_CONVEX_URL`
   - Start the Convex development server

3. **Seed the database**

   ```bash
   npm run seed
   ```

   This will populate the gear database with initial data.

4. **Start the development server**
   ```bash
   npm run dev
   ```

## What Changed

### Removed

- `/api` directory (Deno backend)
- `deno.json` configuration
- MongoDB connection code
- TanStack Query (replaced with Convex hooks)

### Added

- `/convex` directory with:
  - `schema.ts` - Database schema definition
  - `gear.ts` - Query functions for gear data
  - `seed.ts` - Seed data for initial setup
- Convex React client setup in `main.tsx`
- Environment variable: `VITE_CONVEX_URL`

### Modified

- `src/api/gear.ts` - Updated types to use Convex IDs
- `src/components/gearListForm.tsx` - Uses Convex hooks instead of TanStack Query
- `src/main.tsx` - ConvexProvider instead of QueryClientProvider
- `package.json` - Updated scripts for Convex

## Environment Variables

Create a `.env.local` file in the root directory:

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

This will be automatically created when you run `npx convex dev`.

## Database Schema

The gear table has the following structure:

- `name` (string) - Name of the gear item
- `type` ("tent" | "hotel" | "all") - Trip type applicability
- `group` (string) - Category/group name
- `amount` (number) - Default quantity

## Convex Queries

- `getGear` - Fetch gear list filtered by trip type
- `searchGear` - Search gear items by name (used for autocomplete)

## Best Practices Implemented

1. **Search Index** - Using Convex's built-in search for efficient text search
2. **Type Safety** - Full TypeScript support with generated types
3. **Real-time Updates** - Convex automatically updates UI when data changes
4. **Optimized Queries** - Using indexes for better performance
5. **Validation** - Schema validation at the database level
