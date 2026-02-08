import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser, getOrCreateCurrentUser } from './lib/auth';
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

    if (args.status !== undefined) {
      const status = args.status;
      tripsQuery = ctx.db
        .query('trips')
        .withIndex('by_user_and_status', (q) =>
          q.eq('userId', user._id).eq('status', status)
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
    const user = await getOrCreateCurrentUser(ctx);

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
    const user = await getOrCreateCurrentUser(ctx);
    const trip = await ctx.db.get(args.tripId);

    if (!trip) {
      throw new ConvexError('Trip not found');
    }

    // Verify ownership
    if (trip.userId !== user._id) {
      throw new ConvexError('Unauthorized: You do not own this trip');
    }

    // Build updates object with proper typing
    const updates: {
      updatedAt: number;
      name?: string;
      type?: 'tent' | 'hotel';
      startDate?: number;
      endDate?: number;
      location?: string;
      notes?: string;
      status?: 'planning' | 'packed' | 'ongoing' | 'completed';
    } = { updatedAt: Date.now() };
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
    const user = await getOrCreateCurrentUser(ctx);
    const trip = await ctx.db.get(args.tripId);

    if (!trip) {
      throw new ConvexError('Trip not found');
    }

    // Verify ownership
    if (trip.userId !== user._id) {
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
