import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser, getOrCreateCurrentUser } from './lib/auth';
import { ConvexError } from 'convex/values';

export const getUserGearLists = query({
  args: {
    tripId: v.optional(v.id('trips')),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new ConvexError('Unauthorized');
    }

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
    if (!user) {
      throw new ConvexError('Unauthorized');
    }
    const gearList = await ctx.db.get(args.gearListId);

    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }

    // Verify ownership
    // Ownership check
    if (gearList.userId !== user._id) {
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
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new ConvexError('Unauthorized');
    }

    // If tripId provided, verify ownership
    if (args.tripId) {
      const trip = await ctx.db.get(args.tripId);
      if (!trip) {
        throw new ConvexError('Trip not found');
      }

      if (trip.userId !== user._id) {
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
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new ConvexError('Unauthorized');
    }
    const gearList = await ctx.db.get(args.gearListId);

    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }

    // Verify ownership
    // Ownership check
    if (gearList.userId !== user._id) {
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
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new ConvexError('Unauthorized');
    }
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new ConvexError('Item not found');
    }

    const gearList = await ctx.db.get(item.gearListId);
    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }

    // Verify ownership
    // Ownership check
    if (gearList.userId !== user._id) {
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
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new ConvexError('Unauthorized');
    }
    const item = await ctx.db.get(args.itemId);

    if (!item) {
      throw new ConvexError('Item not found');
    }

    const gearList = await ctx.db.get(item.gearListId);
    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }

    // Verify ownership
    // Ownership check
    if (gearList.userId !== user._id) {
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

/**
 * Delete gear list
 */
export const deleteGearList = mutation({
  args: {
    gearListId: v.id('gearLists'),
  },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx);
    if (!user) {
      throw new ConvexError('Unauthorized');
    }
    const gearList = await ctx.db.get(args.gearListId);

    if (!gearList) {
      throw new ConvexError('Gear list not found');
    }

    // Verify ownership
    // Ownership check
    if (gearList.userId !== user._id) {
      throw new ConvexError('Unauthorized: You do not own this gear list');
    }

    // Delete all items in the list
    const items = await ctx.db
      .query('gearListItems')
      .withIndex('by_gear_list', (q) => q.eq('gearListId', args.gearListId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.gearListId);

    return { success: true };
  },
});
