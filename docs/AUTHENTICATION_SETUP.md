# Authentication Setup Guide

This document describes how authentication has been implemented in the GearUp application using Clerk and Convex.

## Overview

The GearUp application now uses **Clerk** for authentication and **Convex** for backend data management with user-scoped data isolation.

## Architecture

```
ClerkProvider (Auth Management)
  └── ConvexProviderWithClerk (Backend Integration)
      └── RouterProvider (Routing)
          └── App (Main Layout)
              ├── Header (with AuthButton)
              └── Routes
                  ├── Public Routes (/, /sign-in, /sign-up)
                  └── Protected Routes (/gear-list)
```

## What Was Implemented

### Backend (Convex)

1. **Schema Changes** (`convex/schema.ts`)
   - Added `users` table (synced from Clerk)
   - Added `trips` table (user-specific trips)
   - Added `gearLists` table (user-specific gear lists)
   - Added `gearListItems` table (items in gear lists)
   - Kept `gear` table as global catalog (shared across all users)

2. **Auth Helpers** (`convex/lib/auth.ts`)
   - `getUserId()` - Get authenticated user's Clerk ID
   - `getCurrentUser()` - Get or create user document
   - `verifyOwnership()` - Verify user owns a resource

3. **User Management** (`convex/users.ts`)
   - `getCurrentUserProfile` - Query current user's profile
   - `updateProfile` - Update user profile

4. **Trip Management** (`convex/trips.ts`)
   - `getUserTrips` - Get user's trips
   - `createTrip` - Create new trip
   - `updateTrip` - Update trip
   - `deleteTrip` - Delete trip and associated gear lists

5. **Gear List Management** (`convex/gearLists.ts`)
   - `getUserGearLists` - Get user's gear lists
   - `getGearListWithItems` - Get gear list with all items
   - `createGearList` - Create new gear list
   - `addItemToGearList` - Add item to gear list
   - `toggleItemPacked` - Toggle packed status
   - `removeItemFromGearList` - Remove item
   - `deleteGearList` - Delete entire list

6. **Auth Configuration** (`convex/auth.config.ts`)
   - Configured Clerk as authentication provider

### Frontend (React)

1. **Authentication Components**
   - `SignInPage` - Full-page sign-in view with Clerk component
   - `SignUpPage` - Full-page sign-up view with Clerk component
   - `ProtectedRoute` - Route wrapper that requires authentication
   - `AuthButton` - Header button showing sign-in or user menu

2. **Updated Components**
   - `Header` - Now displays AuthButton with user profile
   - `main.tsx` - Wrapped with ClerkProvider and ConvexProviderWithClerk
   - Added routes for /sign-in and /sign-up
   - Protected /gear-list route with ProtectedRoute wrapper

3. **Dependencies Added**
   - `@clerk/clerk-react` - Clerk React SDK for authentication

## Setup Instructions

### 1. Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Create a new account
3. Create a new application
4. Select authentication methods:
   - Email + Password (required)
   - Google OAuth (optional)
   - GitHub OAuth (optional)

### 2. Get Clerk Keys

From your Clerk dashboard:

1. Navigate to **API Keys**
2. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Configure Clerk JWT Template

1. In Clerk dashboard, go to **JWT Templates**
2. Create a new template named **"convex"**
3. Use these settings:
   - Name: `convex`
   - Token lifetime: 60 seconds (default)
   - Keep other settings as default
4. Save the template

### 4. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Convex
VITE_CONVEX_URL=your_convex_deployment_url

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### 5. Configure Convex Environment Variables

In your Convex dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - Name: `CLERK_SECRET_KEY`
   - Value: `sk_test_xxxxxxxxxxxxx` (your Clerk secret key)

### 6. Deploy Convex Functions

Run the following command to deploy your Convex functions:

```bash
npx convex dev
```

This will:
- Deploy the updated schema
- Deploy all authentication functions
- Generate TypeScript types

### 7. Run the Application

```bash
npm run dev
```

## How Authentication Works

### Sign-Up Flow

1. User navigates to `/sign-up`
2. Enters email and password
3. Receives verification email (if enabled)
4. After verification, redirected to `/gear-list`
5. Backend automatically creates user record on first login

### Sign-In Flow

1. User navigates to `/sign-in`
2. Enters credentials
3. Clerk validates and creates session
4. JWT token sent with all Convex requests
5. Redirected to `/gear-list`

### Protected Route Access

1. User tries to access `/gear-list`
2. `ProtectedRoute` checks `isSignedIn` status
3. If not signed in → redirect to `/sign-in`
4. If signed in → render page content

### Backend Authorization

Every protected Convex function:

1. Calls `getCurrentUser(ctx)` to get authenticated user
2. Verifies user owns the resource being accessed
3. Throws error if unauthorized
4. Returns data if authorized

## Security Features

- ✅ JWT token validation (automatic via Convex)
- ✅ User data isolation (enforced by database queries)
- ✅ Ownership verification (checked in all mutations)
- ✅ Secure password storage (handled by Clerk)
- ✅ Session management (handled by Clerk)
- ✅ HTTPS-only cookies (in production)

## Data Model

### Users
- Created automatically from Clerk identity
- Stores: clerkId, email, name, imageUrl
- One-to-many relationship with trips and gear lists

### Trips
- Belong to a specific user
- Can have associated gear lists
- Statuses: planning, packed, ongoing, completed

### Gear Lists
- Belong to a specific user
- Can be associated with a trip (optional)
- Contains multiple gear items

### Gear List Items
- Links gear catalog to user's gear list
- Tracks quantity, packed status, notes
- References the global gear catalog

### Gear (Global Catalog)
- Shared across all users
- No user-specific data
- Public queries (no auth required)

## Migration Notes

### Existing Local Storage Data

The current implementation stores gear lists in local storage. After implementing authentication:

1. **Local storage data is NOT automatically migrated**
2. Users will need to manually recreate their gear lists
3. Future enhancement: Add import/export feature for migration

### Backward Compatibility

- Gear catalog remains unchanged (global, shared)
- Gear queries are still public (no auth required)
- Existing gear data is preserved

## Testing Checklist

- [ ] Sign up with email/password
- [ ] Verify email (if enabled)
- [ ] Sign in with credentials
- [ ] Access protected route when authenticated
- [ ] Redirect to sign-in when accessing protected route unauthenticated
- [ ] Sign out
- [ ] Session persists across page refreshes
- [ ] Create gear list (once integrated)
- [ ] View only own gear lists
- [ ] Delete gear list

## Troubleshooting

### "Authentication required" error

- Check that Clerk publishable key is set correctly
- Verify you're signed in (check browser console)
- Clear browser cache and cookies
- Check Convex dashboard for auth errors

### Redirect loop on sign-in

- Verify Clerk redirect URLs are configured correctly
- Check that `afterSignInUrl` and `afterSignUpUrl` are set properly
- Ensure ProtectedRoute is not wrapping sign-in/sign-up pages

### User not created in database

- Check Convex environment variables are set
- Verify Clerk JWT template is named "convex"
- Check Convex logs for errors
- Ensure `getCurrentUser()` is called in protected functions

## Next Steps

1. **Update GearListForm** to use Convex mutations instead of local storage
2. **Update GearListPage** to fetch user-specific gear lists
3. **Add Trip Management UI** for creating and managing trips
4. **Implement Data Migration** for existing local storage data
5. **Add Profile Page** for updating user information
6. **Add OAuth Providers** (Google, GitHub) in Clerk dashboard
7. **Implement Error Boundaries** for better error handling
8. **Add Loading States** throughout the application

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Convex + Clerk Integration](https://docs.convex.dev/auth/clerk)
- [Technical Specification](./specs/AUTHENTICATION_SPEC.md)
