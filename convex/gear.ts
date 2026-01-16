import { query } from './_generated/server';
import { v } from 'convex/values';

// Get gear list filtered by trip type
export const getGear = query({
  args: {
    type: v.optional(v.union(v.literal('tent'), v.literal('hotel'))),
  },
  handler: async (ctx, args) => {
    if (!args.type) {
      // Return all items if no type specified
      return await ctx.db.query('gear').collect();
    }

    // Return items where type matches OR type is 'all'
    const allItems = await ctx.db.query('gear').collect();
    return allItems.filter(
      (item) => item.type === args.type || item.type === 'all'
    );
  },
});

// Search for gear items by name (autocomplete/suggestions)
export const searchGear = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm) {
      return [];
    }

    // Use Convex search for efficient text searching
    const results = await ctx.db
      .query('gear')
      .withSearchIndex('search_name', (q) => q.search('name', args.searchTerm))
      .collect();

    return results;
  },
});
