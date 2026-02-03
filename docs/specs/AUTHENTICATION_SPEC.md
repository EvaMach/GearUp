# Authentication Implementation Specification

**Version:** 1.0  
**Date:** 2024  
**Status:** Draft  
**Author:** GearUp Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Current State Analysis](#current-state-analysis)
4. [Requirements](#requirements)
5. [Technical Design](#technical-design)
6. [Schema Changes](#schema-changes)
7. [Component Architecture](#component-architecture)
8. [Routing & Navigation](#routing--navigation)
9. [Convex Backend Changes](#convex-backend-changes)
10. [Security Considerations](#security-considerations)
11. [Implementation Plan](#implementation-plan)
12. [Acceptance Criteria](#acceptance-criteria)
13. [Rollback Plan](#rollback-plan)

---

## Executive Summary

This specification outlines the implementation of user authentication for the GearUp application using Clerk as the authentication provider and Convex's built-in auth integration. The implementation will transform GearUp from a single-user application with global gear data into a multi-user platform where each user manages their own gear lists and trips.

**Key Objectives:**
- Implement secure user authentication using Clerk
- Migrate from global gear data to user-specific gear lists
- Add protected routes for authenticated features
- Maintain existing functionality while adding user context
- Follow all security and code quality best practices

**Impact:**
- All gear list functionality will require authentication
- Users will have isolated, personal gear collections
- Future trip planning features will be user-scoped
- No breaking changes to existing gear data model (gear remains global, but lists become user-specific)

---

## Architecture Overview

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. User visits app
       ▼
┌─────────────────────────────────┐
│  Clerk React Components         │
│  - SignIn, SignUp, UserButton   │
└──────────┬──────────────────────┘
           │
           │ 2. Auth state managed by Clerk
           ▼
┌─────────────────────────────────┐
│  ClerkProvider                  │
│  (wraps entire app)             │
└──────────┬──────────────────────┘
           │
           │ 3. Auth token passed to Convex
           ▼
┌─────────────────────────────────┐
│  ConvexProviderWithClerk        │
│  (bridges Clerk + Convex)       │
└──────────┬──────────────────────┘
           │
           │ 4. Authenticated requests
           ▼
┌─────────────────────────────────┐
│  Convex Backend                 │
│  - Validates JWT token          │
│  - Gets userId from ctx.auth    │
│  - Enforces data isolation      │
└─────────────────────────────────┘
```

### Technology Stack

- **Frontend Authentication:** Clerk React SDK (`@clerk/clerk-react`)
- **Backend Authentication:** Convex Auth integration
- **Session Management:** Clerk (handles tokens, refresh, etc.)
- **Protected Routes:** React Router + Clerk components
- **User Context:** Convex `ctx.auth.getUserIdentity()`

### Key Integration Points

1. **Clerk Provider Setup** (`main.tsx`)
   - Wraps app with `ClerkProvider`
   - Uses `ConvexProviderWithClerk` for seamless integration

2. **Convex Configuration** (`convex.json`)
   - Configured with Clerk domain and application ID
   - Validates JWT tokens automatically

3. **Backend Authorization** (All Convex functions)
   - Every protected function checks `ctx.auth.getUserIdentity()`
   - User ID automatically available from authenticated context

---

## Current State Analysis

### Existing Components

```
src/
├── App.tsx                 # Root component with Outlet
├── main.tsx               # Router setup, Convex provider
├── components/
│   ├── homePage.tsx       # Landing page (public)
│   ├── gearListPage.tsx   # Main gear list UI (to be protected)
│   ├── gearListForm.tsx   # Gear selection form (to be protected)
│   └── Header.tsx         # Navigation header
```

### Current Schema

```typescript
// convex/schema.ts
{
  gear: {
    name: string,
    type: 'tent' | 'hotel' | 'all',
    group: string,
    amount: number
  }
}
```

### Current Routes

- `/` - HomePage (public)
- `/gear-list` - GearListPage (currently public, will be protected)

### Pain Points

- No user context - all data is global
- No access control - anyone can access any page
- No user-specific data - cannot track individual trips or preferences
- Local storage used for state - data not persisted per user

---

## Requirements

### Functional Requirements

#### FR-1: User Registration
- Users must be able to create accounts using email/password
- Support OAuth providers (Google, GitHub) via Clerk
- Email verification required before first login
- User profile includes: name, email, profile picture (from Clerk)

#### FR-2: User Authentication
- Users must be able to sign in with email/password
- Support "Remember me" functionality (Clerk default)
- Password reset via email
- Session persistence across browser sessions

#### FR-3: Protected Routes
- `/gear-list` route requires authentication
- Unauthenticated users redirected to sign-in page
- Post-authentication redirect to originally requested page

#### FR-4: User Profile Management
- Display user profile in header (avatar, name)
- User can sign out from any page
- Access to Clerk user profile modal for account settings

#### FR-5: User-Specific Data
- Each user has isolated gear lists
- Trips belong to specific users
- Users cannot access other users' data

### Non-Functional Requirements

#### NFR-1: Security
- All authentication tokens handled securely (HTTPS only)
- No sensitive data exposed in client-side code
- Backend validates all requests with user context
- Follow OWASP security best practices

#### NFR-2: Performance
- Auth check adds < 50ms latency to protected routes
- Token refresh handled transparently
- No blocking UI during auth state initialization

#### NFR-3: User Experience
- Seamless sign-in/sign-up flow
- Clear feedback for authentication errors
- Loading states during auth operations
- Mobile-responsive auth UI

#### NFR-4: Accessibility
- All auth forms meet WCAG AA standards
- Keyboard navigation for all auth flows
- Screen reader compatible

---

## Technical Design

### Files to Create

#### Frontend Components

```
src/
├── components/
│   ├── auth/
│   │   ├── SignInPage.tsx          # Full-page sign-in view
│   │   ├── SignUpPage.tsx          # Full-page sign-up view
│   │   ├── ProtectedRoute.tsx      # Route wrapper for auth check
│   │   └── AuthButton.tsx          # Header auth button (sign in/user menu)
│   └── layout/
│       └── AuthLayout.tsx          # Layout wrapper for auth pages
```

#### Backend Files

```
convex/
├── users.ts                        # User-related queries/mutations
├── trips.ts                        # Trip management (new)
├── gearLists.ts                    # User gear lists (new)
├── auth.config.ts                  # Clerk auth configuration
└── lib/
    └── auth.ts                     # Auth helper functions
```

#### Configuration Files

```
convex/
└── convex.json                     # Update with Clerk config
```

### Files to Modify

#### Frontend

1. **`src/main.tsx`**
   - Add `ClerkProvider` wrapper
   - Replace `ConvexProvider` with `ConvexProviderWithClerk`
   - Add auth routes (sign-in, sign-up)

2. **`src/App.tsx`**
   - Add loading state for auth initialization
   - Potentially add auth-aware layout

3. **`src/components/Header.tsx`**
   - Add `AuthButton` component
   - Display user info when authenticated
   - Add sign-out functionality

4. **`src/components/gearListPage.tsx`**
   - Update to use user-specific data
   - Handle loading states during auth check

5. **`src/components/gearListForm.tsx`**
   - Connect to user-specific gear lists
   - Remove local storage, use Convex mutations

#### Backend

1. **`convex/schema.ts`**
   - Add `users` table
   - Add `trips` table
   - Add `gearLists` table
   - Add `gearListItems` table
   - Update indexes for user-scoped queries

2. **`convex/gear.ts`** (existing file)
   - Keep public gear catalog queries
   - Add authorization checks where needed

---

## Schema Changes

### New Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Existing: Global gear catalog (shared across all users)
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

  // NEW: User profiles (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),        // Clerk user ID (subject from JWT)
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_clerk_id', ['clerkId']),

  // NEW: User trips
  trips: defineTable({
    userId: v.id('users'),      // Owner of the trip
    name: v.string(),
    type: v.union(v.literal('tent'), v.literal('hotel')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal('planning'),
      v.literal('packed'),
      v.literal('ongoing'),
      v.literal('completed')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_status', ['userId', 'status'])
    .index('by_user_and_start_date', ['userId', 'startDate']),

  // NEW: User gear lists (can be trip-specific or standalone)
  gearLists: defineTable({
    userId: v.id('users'),      // Owner of the list
    tripId: v.optional(v.id('trips')), // Associated trip (optional)
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_trip', ['tripId'])
    .index('by_user_and_trip', ['userId', 'tripId']),

  // NEW: Items in gear lists (links gear catalog to user lists)
  gearListItems: defineTable({
    gearListId: v.id('gearLists'),  // Parent list
    gearId: v.id('gear'),            // Reference to gear catalog
    quantity: v.number(),
    isPacked: v.boolean(),
    notes: v.optional(v.string()),
    addedAt: v.number(),
  })
    .index('by_gear_list', ['gearListId'])
    .index('by_gear_list_and_packed', ['gearListId', 'isPacked'])
    .index('by_gear', ['gearId']),
});
```

### Schema Migration Strategy

**Important:** Since the `gear` table is not changing structure, existing gear data remains intact. New tables are additive only.

**Migration Steps:**
1. Deploy schema changes (Convex handles this automatically)
2. No data migration needed for existing `gear` table
3. `users` table populated on first login (via Convex auth hook)
4. Existing gear lists in local storage are user-specific, will be migrated manually by users

---

## Component Architecture

### Authentication Components

#### 1. SignInPage.tsx

```typescript
interface SignInPageProps {}

// Responsibilities:
// - Render Clerk's SignIn component
// - Handle post-sign-in redirect
// - Display error states
// - Responsive layout

// Key features:
// - Full-page centered layout
// - Redirect to /gear-list after sign-in
// - Link to sign-up page
// - Support for OAuth providers
```

#### 2. SignUpPage.tsx

```typescript
interface SignUpPageProps {}

// Responsibilities:
// - Render Clerk's SignUp component
// - Handle post-sign-up redirect
// - Display error states
// - Email verification flow

// Key features:
// - Full-page centered layout
// - Redirect to /gear-list after sign-up
// - Link to sign-in page
// - Terms of service acceptance
```

#### 3. ProtectedRoute.tsx

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Responsibilities:
// - Check authentication status
// - Redirect to sign-in if not authenticated
// - Show loading state during auth check
// - Render children when authenticated

// Implementation:
// - Use Clerk's useAuth() hook
// - Use react-router's Navigate for redirects
// - Store original URL for post-login redirect
```

#### 4. AuthButton.tsx

```typescript
interface AuthButtonProps {
  variant?: 'header' | 'inline';
}

// Responsibilities:
// - Show "Sign In" button when not authenticated
// - Show UserButton (avatar + menu) when authenticated
// - Handle sign-out action
// - Display user name/email

// States:
// - Loading: Skeleton or spinner
// - Unauthenticated: Sign in button
// - Authenticated: User menu with avatar
```

### Component Hierarchy

```
App
├── ClerkProvider
│   ├── ConvexProviderWithClerk
│   │   ├── RouterProvider
│   │   │   ├── Layout (App.tsx)
│   │   │   │   ├── Header
│   │   │   │   │   └── AuthButton
│   │   │   │   │       ├── SignInButton (if not authed)
│   │   │   │   │       └── UserButton (if authed)
│   │   │   │   └── Outlet
│   │   │   │       ├── HomePage (public)
│   │   │   │       ├── SignInPage (public)
│   │   │   │       ├── SignUpPage (public)
│   │   │   │       └── ProtectedRoute
│   │   │   │           ├── GearListPage (protected)
│   │   │   │           └── (future protected routes)
```

### State Management

**Authentication State:**
- Managed entirely by Clerk
- Accessed via `useAuth()`, `useUser()` hooks
- No Redux/Zustand needed for auth state

**User Data State:**
- Fetched from Convex using authenticated queries
- Cached by Convex React client
- Automatically refreshes on mutations

**Loading States:**
- Auth initialization: Clerk's `isLoaded` flag
- Data fetching: Convex's query loading state
- Mutations: Convex's mutation loading state

---

## Routing & Navigation

### Route Configuration

```typescript
// src/main.tsx - Updated router configuration

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/sign-in/*',
        element: <SignInPage />,
      },
      {
        path: '/sign-up/*',
        element: <SignUpPage />,
      },
      
      // Protected routes
      {
        path: '/gear-list',
        element: (
          <ProtectedRoute>
            <GearListPage />
          </ProtectedRoute>
        ),
      },
      
      // Future protected routes
      {
        path: '/trips',
        element: (
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/trips/:tripId',
        element: (
          <ProtectedRoute>
            <TripDetailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
```

### Redirect Logic

**Unauthenticated User Flow:**
1. User navigates to `/gear-list`
2. `ProtectedRoute` checks `isSignedIn`
3. If false, redirects to `/sign-in?redirect=/gear-list`
4. After sign-in, Clerk redirects to `/gear-list`

**Authenticated User Flow:**
1. User navigates to `/sign-in`
2. Clerk detects authenticated session
3. Redirects to `/gear-list` (default post-sign-in URL)

**Post-Sign-Up Flow:**
1. User completes sign-up
2. Email verification (if enabled)
3. Redirect to `/gear-list`
4. Backend creates user record automatically

---

## Convex Backend Changes

### Authentication Helper Functions

```typescript
// convex/lib/auth.ts

import { ConvexError } from 'convex/values';
import { QueryCtx, MutationCtx } from '../_generated/server';

/**
 * Get the authenticated user's ID
 * Throws error if not authenticated
 */
export async function getUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new ConvexError('Authentication required');
  }
  
  return identity.subject; // Clerk user ID
}

/**
 * Get or create user document from Clerk identity
 * Returns user document ID
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
) {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new ConvexError('Authentication required');
  }
  
  // Check if user exists
  let user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
    .unique();
  
  // Create user if doesn't exist
  if (!user) {
    const userId = await ctx.db.insert('users', {
      clerkId: identity.subject,
      email: identity.email ?? '',
      name: identity.name,
      imageUrl: identity.pictureUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    user = await ctx.db.get(userId);
  }
  
  return user;
}

/**
 * Verify user owns a resource
 */
export async function verifyOwnership(
  ctx: QueryCtx | MutationCtx,
  resourceUserId: string,
  resourceType: string
): Promise<void> {
  const currentUserId = await getUserId(ctx);
  
  if (currentUserId !== resourceUserId) {
    throw new ConvexError(`Unauthorized: You don't own this ${resourceType}`);
  }
}
```

### User Management Functions

```typescript
// convex/users.ts

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser } from './lib/auth';

/**
 * Get current user profile
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };
  },
});

/**
 * Update current user profile
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    await ctx.db.patch(user._id, {
      name: args.name,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});
```

### Trip Management Functions

```typescript
// convex/trips.ts

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser } from './lib/auth';
import { ConvexError } from 'convex/values';

/**
 * Get all trips for current user
 */
export const getUserTrips = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('planning'),
        v.literal('packed'),
        v.literal('ongoing'),
        v.literal('completed')
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    let tripsQuery = ctx.db
      .query('trips')
      .withIndex('by_user', (q) => q.eq('userId', user._id));
    
    if (args.status) {
      tripsQuery = ctx.db
        .query('trips')
        .withIndex('by_user_and_status', (q) =>
          q.eq('userId', user._id).eq('status', args.status)
        );
    }
    
    return await tripsQuery.collect();
  },
});

/**
 * Create a new trip
 */
export const createTrip = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal('tent'), v.literal('hotel')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Validate dates
    if (args.startDate && args.endDate && args.startDate > args.endDate) {
      throw new ConvexError('Start date must be before end date');
    }
    
    const tripId = await ctx.db.insert('trips', {
      userId: user._id,
      name: args.name,
      type: args.type,
      startDate: args.startDate,
      endDate: args.endDate,
      location: args.location,
      notes: args.notes,
      status: 'planning',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return tripId;
  },
});

/**
 * Update trip
 */
export const updateTrip = mutation({
  args: {
    tripId: v.id('trips'),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal('tent'), v.literal('hotel'))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('planning'),
        v.literal('packed'),
        v.literal('ongoing'),
        v.literal('completed')
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const trip = await ctx.db.get(args.tripId);
    
    if (!trip) {
      throw new ConvexError('Trip not found');
    }
    
    // Verify ownership
    const tripUser = await ctx.db.get(trip.userId);
    if (tripUser?.clerkId !== user.clerkId) {
      throw new ConvexError('Unauthorized: You do not own this trip');
    }
    
    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.location !== undefined) updates.location = args.location;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.status !== undefined) updates.status = args.status;
    
    await ctx.db.patch(args.tripId, updates);
    
    return { success: true };
  },
});

/**
 * Delete trip
 */
export const deleteTrip = mutation({
  args: {
    tripId: v.id('trips'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const trip = await ctx.db.get(args.tripId);
    
    if (!trip) {
      throw new ConvexError('Trip not found');
    }
    
    // Verify ownership
    const tripUser = await ctx.db.get(trip.userId);
    if (tripUser?.clerkId !== user.clerkId) {
      throw new ConvexError('Unauthorized: You do not own this trip');
    }
    
    // Delete associated gear lists
    const gearLists = await ctx.db
      .query('gearLists')
      .withIndex('by_trip', (q) => q.eq('tripId', args.tripId))
      .collect();
    
    for (const list of gearLists) {
      // Delete gear list items
      const items = await ctx.db
        .query('gearListItems')
        .withIndex('by_gear_list', (q) => q.eq('gearListId', list._id))
        .collect();
      
      for (const item of items) {
        await ctx.db.delete(item._id);
      }
      
      await ctx.db.delete(list._id);
    }
    
    await ctx.db.delete(args.tripId);
    
    return { success: true };
  },
});
```

### Gear List Functions

```typescript
// convex/gearLists.ts

import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser } from './lib/auth';
import { ConvexError } from 'convex/values';

/**
 * Get user's gear lists
 */
export const getUserGearLists = query({
  args: {
    tripId: v.optional(v.id('trips')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    let query = ctx.db
      .query('gearLists')
      .withIndex('by_user', (q) => q.eq('userId', user._id));
    
    if (args.tripId) {
      query = ctx.db
        .query('gearLists')
        .withIndex('by_user_and_trip', (q) =>
          q.eq('userId', user._id).eq('tripId', args.tripId)
        );
    }
    
    const lists = await query.collect();
    
    // Get item counts for each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const items = await ctx.db
          .query('gearListItems')
          .withIndex('by_gear_list', (q) => q.eq('gearListId', list._id))
          .collect();
        
        const packedCount = items.filter((item) => item.isPacked).length;
        
        return {
          ...list,
          totalItems: items.length,
          packedItems: packedCount,
        };
      })
    );
    
    return listsWithCounts;
  },
});

/**
 * Get gear list with items
 */
export const getGearListWithItems = query({
  args: {
    gearListId: v.id('gearLists'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const gearList = await ctx.db.get(args.gearListId);
    
    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }
    
    // Verify ownership
    const listUser = await ctx.db.get(gearList.userId);
    if (listUser?.clerkId !== user.clerkId) {
      throw new ConvexError('Unauthorized: You do not own this gear list');
    }
    
    const items = await ctx.db
      .query('gearListItems')
      .withIndex('by_gear_list', (q) => q.eq('gearListId', args.gearListId))
      .collect();
    
    // Populate gear details
    const itemsWithGear = await Promise.all(
      items.map(async (item) => {
        const gear = await ctx.db.get(item.gearId);
        return {
          ...item,
          gear,
        };
      })
    );
    
    return {
      ...gearList,
      items: itemsWithGear,
    };
  },
});

/**
 * Create gear list
 */
export const createGearList = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    tripId: v.optional(v.id('trips')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // If tripId provided, verify ownership
    if (args.tripId) {
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError('Trip not found');
      }
      
      const tripUser = await ctx.db.get(trip.userId);
      if (tripUser?.clerkId !== user.clerkId) {
        throw new ConvexError('Unauthorized: You do not own this trip');
      }
    }
    
    const listId = await ctx.db.insert('gearLists', {
      userId: user._id,
      tripId: args.tripId,
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return listId;
  },
});

/**
 * Add item to gear list
 */
export const addItemToGearList = mutation({
  args: {
    gearListId: v.id('gearLists'),
    gearId: v.id('gear'),
    quantity: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const gearList = await ctx.db.get(args.gearListId);
    
    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }
    
    // Verify ownership
    const listUser = await ctx.db.get(gearList.userId);
    if (listUser?.clerkId !== user.clerkId) {
      throw new ConvexError('Unauthorized: You do not own this gear list');
    }
    
    // Verify gear exists
    const gear = await ctx.db.get(args.gearId);
    if (!gear) {
      throw new ConvexError('Gear item not found');
    }
    
    // Check if item already exists in list
    const existingItem = await ctx.db
      .query('gearListItems')
      .withIndex('by_gear_list', (q) => q.eq('gearListId', args.gearListId))
      .filter((q) => q.eq(q.field('gearId'), args.gearId))
      .unique();
    
    if (existingItem) {
      // Update quantity instead of adding duplicate
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
      return existingItem._id;
    }
    
    const itemId = await ctx.db.insert('gearListItems', {
      gearListId: args.gearListId,
      gearId: args.gearId,
      quantity: args.quantity,
      isPacked: false,
      notes: args.notes,
      addedAt: Date.now(),
    });
    
    // Update gear list timestamp
    await ctx.db.patch(args.gearListId, {
      updatedAt: Date.now(),
    });
    
    return itemId;
  },
});

/**
 * Toggle item packed status
 */
export const toggleItemPacked = mutation({
  args: {
    itemId: v.id('gearListItems'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const item = await ctx.db.get(args.itemId);
    
    if (!item) {
      throw new ConvexError('Item not found');
    }
    
    const gearList = await ctx.db.get(item.gearListId);
    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }
    
    // Verify ownership
    const listUser = await ctx.db.get(gearList.userId);
    if (listUser?.clerkId !== user.clerkId) {
      throw new ConvexError('Unauthorized');
    }
    
    await ctx.db.patch(args.itemId, {
      isPacked: !item.isPacked,
    });
    
    return { success: true };
  },
});

/**
 * Remove item from gear list
 */
export const removeItemFromGearList = mutation({
  args: {
    itemId: v.id('gearListItems'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const item = await ctx.db.get(args.itemId);
    
    if (!item) {
      throw new ConvexError('Item not found');
    }
    
    const gearList = await ctx.db.get(item.gearListId);
    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }
    
    // Verify ownership
    const listUser = await ctx.db.get(gearList.userId);
    if (listUser?.clerkId !== user.clerkId) {
      throw new ConvexError('Unauthorized');
    }
    
    await ctx.db.delete(args.itemId);
    
    // Update gear list timestamp
    await ctx.db.patch(item.gearListId, {
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});
```

### Updated Gear Functions

```typescript
// convex/gear.ts - Keep existing public queries, add optional auth

import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get all gear (public - no auth required)
 * This is the global gear catalog
 */
export const getAllGear = query({
  args: {
    type: v.optional(v.union(v.literal('tent'), v.literal('hotel'), v.literal('all'))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('gear');
    
    if (args.type && args.type !== 'all') {
      query = query.withIndex('by_type', (q) => q.eq('type', args.type));
    }
    
    return await query.collect();
  },
});

/**
 * Search gear by name (public)
 */
export const searchGear = query({
  args: {
    searchTerm: v.string(),
    type: v.optional(v.union(v.literal('tent'), v.literal('hotel'), v.literal('all'))),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query('gear')
      .withSearchIndex('search_name', (q) => q.search('name', args.searchTerm))
      .collect();
    
    if (args.type && args.type !== 'all') {
      results = results.filter((item) => item.type === args.type);
    }
    
    return results;
  },
});
```

---

## Security Considerations

### Authentication Security

1. **JWT Token Validation**
   - Convex automatically validates Clerk JWT tokens
   - Tokens expire and refresh automatically
   - No manual token handling required

2. **Session Management**
   - Clerk handles session storage securely
   - Tokens stored in httpOnly cookies (when possible)
   - Automatic token refresh before expiration

3. **Password Security**
   - Clerk enforces strong password requirements
   - Passwords never stored or transmitted to Convex
   - Password reset via secure email flow

### Authorization Security

1. **User Isolation**
   - All protected queries/mutations verify user identity
   - User ID from `ctx.auth` cannot be spoofed
   - Database indexes enforce user-scoped queries

2. **Ownership Verification**
   - Every mutation checks resource ownership
   - Explicit checks before any data modification
   - Clear error messages without information leakage

3. **Input Validation**
   - All function arguments validated with `v` validators
   - Type safety enforced at compile time
   - Runtime validation prevents injection attacks

### Data Security

1. **No Sensitive Data Exposure**
   - User emails only accessible to the user
   - No cross-user data leakage
   - Clerk user IDs are non-sequential UUIDs

2. **Audit Trail**
   - `createdAt` and `updatedAt` timestamps on all records
   - User actions traceable via `userId` field
   - Enable logging for security events

3. **Rate Limiting**
   - Clerk provides built-in rate limiting
   - Convex enforces request rate limits
   - Consider additional limits for expensive operations

### Frontend Security

1. **Environment Variables**
   - Clerk publishable key stored in `.env.local`
   - Never commit secrets to version control
   - Use different Clerk apps for dev/staging/prod

2. **XSS Prevention**
   - React escapes all user input by default
   - No use of `dangerouslySetInnerHTML`
   - Content Security Policy headers recommended

3. **CSRF Protection**
   - Clerk tokens include CSRF protection
   - Same-origin policy enforced
   - No cookie-based session authentication

### Compliance Considerations

1. **GDPR Compliance**
   - Users can delete their accounts (Clerk feature)
   - Data deletion cascades to all user resources
   - Export user data on request (implement if needed)

2. **Data Retention**
   - Define retention policy for deleted users
   - Soft delete vs hard delete strategy
   - Backup and recovery procedures

---

## Implementation Plan

### Phase 1: Setup & Configuration (Day 1)

#### Step 1.1: Install Dependencies
```bash
npm install @clerk/clerk-react
npm install --save-dev @clerk/types
```

#### Step 1.2: Configure Clerk
1. Create Clerk account at https://clerk.com
2. Create new application (select email + password + OAuth providers)
3. Get Publishable Key and Secret Key
4. Add to `.env.local`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
5. Add to Convex dashboard environment variables:
   ```
   CLERK_SECRET_KEY=sk_test_...
   ```

#### Step 1.3: Configure Convex Auth
1. Update `convex/auth.config.ts` (create new file):
   ```typescript
   export default {
     providers: [
       {
         domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
         applicationID: "convex",
       },
     ],
   };
   ```

2. In Clerk dashboard, configure JWT template:
   - Name: "convex"
   - Issuer: Keep default
   - Audience: Keep default
   - Token lifetime: 60 seconds (default)

### Phase 2: Backend Schema & Functions (Day 1-2)

#### Step 2.1: Update Schema
1. ✅ Add `users` table to `convex/schema.ts`
2. ✅ Add `trips` table
3. ✅ Add `gearLists` table
4. ✅ Add `gearListItems` table
5. Deploy schema: `npx convex dev` (auto-deploys on save)

#### Step 2.2: Create Auth Helpers
1. ✅ Create `convex/lib/auth.ts`
2. ✅ Implement `getUserId()`
3. ✅ Implement `getCurrentUser()`
4. ✅ Implement `verifyOwnership()`

#### Step 2.3: Implement Backend Functions
1. ✅ Create `convex/users.ts` with user queries/mutations
2. ✅ Create `convex/trips.ts` with trip CRUD operations
3. ✅ Create `convex/gearLists.ts` with gear list operations
4. ✅ Update `convex/gear.ts` to keep public gear queries
5. Test all functions with Convex dashboard

### Phase 3: Frontend Auth Components (Day 2-3)

#### Step 3.1: Update Main Entry Point
1. ✅ Modify `src/main.tsx`:
   - Import Clerk components
   - Wrap with `ClerkProvider`
   - Replace `ConvexProvider` with `ConvexProviderWithClerk`
   - Add sign-in/sign-up routes

#### Step 3.2: Create Auth Pages
1. ✅ Create `src/components/auth/SignInPage.tsx`
2. ✅ Create `src/components/auth/SignUpPage.tsx`
3. ✅ Style with Tailwind CSS
4. ✅ Test sign-up flow
5. ✅ Test sign-in flow

#### Step 3.3: Create Protected Route Component
1. ✅ Create `src/components/auth/ProtectedRoute.tsx`
2. ✅ Implement auth check logic
3. ✅ Add loading states
4. ✅ Handle redirect URLs

#### Step 3.4: Create Auth Button
1. ✅ Create `src/components/auth/AuthButton.tsx`
2. ✅ Add to `src/components/Header.tsx`
3. ✅ Implement responsive design
4. ✅ Test user menu functionality

### Phase 4: Update Existing Features (Day 3-4)

#### Step 4.1: Protect Routes
1. ✅ Wrap `/gear-list` with `ProtectedRoute`
2. ✅ Update navigation logic in `Header.tsx`
3. ✅ Test authentication flow

#### Step 4.2: Update Gear List Page
1. ✅ Modify `src/components/gearListPage.tsx`:
   - Fetch user-specific gear lists
   - Connect to new Convex functions
   - Remove local storage usage
2. ✅ Add loading states
3. ✅ Add error handling

#### Step 4.3: Update Gear List Form
1. ✅ Modify `src/components/gearListForm.tsx`:
   - Use authenticated mutations
   - Connect to user gear lists
   - Handle auth errors
2. ✅ Test create/update/delete operations

### Phase 5: Testing & Polish (Day 4-5)

#### Step 5.1: Manual Testing
- [ ] Sign-up flow (email + password)
- [ ] Sign-up with OAuth (Google, GitHub)
- [ ] Sign-in flow
- [ ] Password reset
- [ ] Protected route access (unauthenticated)
- [ ] Protected route access (authenticated)
- [ ] Create gear list
- [ ] Add items to gear list
- [ ] Mark items as packed
- [ ] Delete items
- [ ] Delete gear list
- [ ] Sign out
- [ ] Session persistence (refresh page)

#### Step 5.2: Error Handling
- [ ] Network errors
- [ ] Invalid credentials
- [ ] Expired session
- [ ] Permission errors
- [ ] Not found errors

#### Step 5.3: Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Focus management
- [ ] ARIA labels
- [ ] Color contrast

#### Step 5.4: Performance
- [ ] Measure auth check latency
- [ ] Check for unnecessary re-renders
- [ ] Verify query caching
- [ ] Test on slow network

### Phase 6: Documentation & Deployment (Day 5)

#### Step 6.1: Update Documentation
- [ ] Update README with auth setup instructions
- [ ] Document environment variables
- [ ] Add user guide for auth features
- [ ] Create developer setup guide

#### Step 6.2: Deployment
1. [ ] Test in staging environment
2. [ ] Configure production Clerk application
3. [ ] Update production environment variables
4. [ ] Deploy to production
5. [ ] Monitor error logs
6. [ ] Verify auth flow in production

---

## Acceptance Criteria

### User Stories

#### US-1: User Registration
- **Given** I am a new user
- **When** I navigate to the sign-up page
- **Then** I can create an account with email and password
- **And** I receive a verification email
- **And** I am redirected to the gear list page after verification

#### US-2: User Login
- **Given** I am a registered user
- **When** I navigate to the sign-in page
- **And** I enter my credentials
- **Then** I am authenticated and redirected to the gear list page

#### US-3: Protected Routes
- **Given** I am not authenticated
- **When** I try to access `/gear-list`
- **Then** I am redirected to the sign-in page
- **And** after signing in, I am redirected back to `/gear-list`

#### US-4: User Profile
- **Given** I am authenticated
- **When** I view the header
- **Then** I see my profile picture and name
- **And** I can click to view my profile or sign out

#### US-5: User-Specific Gear Lists
- **Given** I am authenticated
- **When** I create a gear list
- **Then** it is saved to my account
- **And** other users cannot see or modify it

### Technical Acceptance Criteria

#### TAC-1: Security
- [ ] All protected routes require authentication
- [ ] User data is isolated (no cross-user access)
- [ ] JWT tokens validated on every request
- [ ] No sensitive data in client-side code
- [ ] All inputs validated on backend

#### TAC-2: Performance
- [ ] Auth check completes in < 50ms
- [ ] Page load time < 2s (authenticated)
- [ ] No blocking during token refresh
- [ ] Queries cached appropriately

#### TAC-3: User Experience
- [ ] Clear error messages for auth failures
- [ ] Loading states during auth operations
- [ ] Seamless redirect after authentication
- [ ] Session persists across page refreshes
- [ ] Mobile-responsive auth UI

#### TAC-4: Code Quality
- [ ] TypeScript strict mode with no errors
- [ ] All React components follow guidelines
- [ ] All Convex functions follow guidelines
- [ ] No console errors or warnings
- [ ] Code reviewed and approved

#### TAC-5: Accessibility
- [ ] WCAG AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus management correct
- [ ] Proper ARIA labels

---

## Rollback Plan

### Scenario 1: Critical Auth Bug in Production

**Symptoms:**
- Users cannot sign in
- Session errors
- Authorization failures

**Rollback Steps:**
1. Revert frontend deployment to previous version
2. Keep backend changes (backward compatible)
3. Investigate issue in staging environment
4. Fix and redeploy

**Data Impact:** None (schema changes are backward compatible)

### Scenario 2: Performance Issues

**Symptoms:**
- Slow auth checks
- Timeouts
- High server load

**Mitigation:**
1. Disable auth temporarily for read operations
2. Add caching layer for user lookups
3. Optimize database indexes
4. Scale Convex backend

**Rollback:** Not required (fix in place)

### Scenario 3: User Migration Issues

**Symptoms:**
- Users cannot access their data
- Duplicate user accounts
- Data loss

**Rollback Steps:**
1. Pause new user registrations
2. Restore database from backup
3. Re-run migration scripts with fixes
4. Verify data integrity
5. Resume registrations

**Prevention:**
- Test migration thoroughly in staging
- Keep old local storage data for manual recovery
- Provide import tool for user data

---

## Appendix

### Environment Variables

#### Frontend (.env.local)
```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

#### Backend (Convex Dashboard)
```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
```

### Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy Convex backend
npx convex dev

# Deploy Convex to production
npx convex deploy

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

### Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Auth Guide](https://docs.convex.dev/auth)
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [React Router v6 Docs](https://reactrouter.com/en/main)

### Success Metrics

**Week 1 Post-Launch:**
- 90% of users successfully sign up
- < 5% authentication errors
- < 1s average auth check time
- 0 security incidents

**Month 1 Post-Launch:**
- User retention > 70%
- < 0.1% support tickets for auth issues
- 99.9% auth uptime
- Positive user feedback on auth UX

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** After implementation completion
