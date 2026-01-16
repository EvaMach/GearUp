# gear-up

A gear packing list application built with React and Convex.

## Setup

### Prerequisites

- Node.js 18+ installed
- A Convex account (free at https://dashboard.convex.dev)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Initialize Convex**

   ```bash
   npx convex dev
   ```

   This will:

   - Prompt you to login to Convex
   - Create a new project or select an existing one
   - Generate `.env.local` with your `VITE_CONVEX_URL`
   - Generate TypeScript types in `convex/_generated/`
   - Start the Convex development server

3. **Seed the database**

   In a new terminal, run:

   ```bash
   npm run seed
   ```

   This populates the database with initial gear items.

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:5173

## Migration from Deno/MongoDB

This project has been migrated from Deno + MongoDB to Convex. See [CONVEX_MIGRATION.md](./CONVEX_MIGRATION.md) for details.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless backend)
- **Routing**: React Router
- **Forms**: React Hook Form
- **Build Tool**: Vite

## Project Structure

```
├── src/
│   ├── api/              # API hooks and types
│   ├── components/       # React components
│   ├── assets/          # Images and static files
│   └── main.tsx         # App entry point
├── convex/
│   ├── schema.ts        # Database schema
│   ├── gear.ts          # Gear queries
│   └── seed.ts          # Seed data
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server (with Convex)
- `npm run build` - Build for production
- `npm run seed` - Seed the database with initial data
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
