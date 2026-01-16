# Quick Start Guide

## First Time Setup

Follow these steps in order:

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Convex

**Important**: You need to complete this step before the app will work.

```bash
npx convex dev
```

When prompted:

- Login to your Convex account (or create one at https://dashboard.convex.dev)
- Choose to create a new project or select an existing one
- The command will:
  - Create `.env.local` with your `VITE_CONVEX_URL`
  - Generate TypeScript types in `convex/_generated/`
  - Start watching your Convex functions

**Keep this terminal running** - it watches for changes to your Convex functions.

### 3. Seed the Database

Open a **new terminal** and run:

```bash
npm run seed
```

You should see output like:

```
✓ Running function...
{ success: true, count: 20 }
```

### 4. Start the Development Server

In another **new terminal**, run:

```bash
npm run dev
```

The app will open at http://localhost:5173

## Daily Development

For subsequent development sessions, you need **two terminals**:

**Terminal 1 - Convex Dev Server**:

```bash
npx convex dev
```

**Terminal 2 - Vite Dev Server**:

```bash
npm run dev
```

## Troubleshooting

### "Cannot find module '../../convex/\_generated/api'"

**Solution**: Run `npx convex dev` first. This generates the required types.

### "VITE_CONVEX_URL is not defined"

**Solution**: Make sure you've run `npx convex dev` which creates `.env.local` automatically.

### Empty gear list

**Solution**: Run `npm run seed` to populate the database.

### Database already has data and you want to reset

Run the seed command again - it will clear existing data and re-seed:

```bash
npm run seed
```

## Environment Variables

After running `npx convex dev`, you'll have a `.env.local` file:

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

This file is gitignored and contains your Convex deployment URL.

## Project Files

Key files you might want to modify:

- `convex/seed.ts` - Initial gear data
- `convex/gear.ts` - Database queries
- `convex/schema.ts` - Database schema
- `src/components/` - React components
