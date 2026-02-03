import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Global gear catalog (shared across all users)
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

  // User profiles (synced from Clerk)
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_clerk_id', ['clerkId']),

  // User trips
  trips: defineTable({
    userId: v.id('users'),
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

  // User gear lists (can be trip-specific or standalone)
  gearLists: defineTable({
    userId: v.id('users'),
    tripId: v.optional(v.id('trips')),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_trip', ['tripId'])
    .index('by_user_and_trip', ['userId', 'tripId']),

  // Items in gear lists (links gear catalog to user lists)
  gearListItems: defineTable({
    gearListId: v.id('gearLists'),
    gearId: v.id('gear'),
    quantity: v.number(),
    isPacked: v.boolean(),
    notes: v.optional(v.string()),
    addedAt: v.number(),
  })
    .index('by_gear_list', ['gearListId'])
    .index('by_gear_list_and_packed', ['gearListId', 'isPacked'])
    .index('by_gear', ['gearId']),
});
