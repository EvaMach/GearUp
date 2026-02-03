import { query, QueryCtx } from './_generated/server';
import { v } from 'convex/values';

export const getGear = query({
  args: {
    type: v.optional(v.union(v.literal('tent'), v.literal('hotel'))),
  },
  handler: async (ctx: QueryCtx, args: { type?: 'tent' | 'hotel' }) => {
    const allItems = await ctx.db.query('gear').collect();
    if (!args.type) {
      return allItems;
    }

    return allItems.filter(
      (item) => item.type === args.type || item.type === 'all'
    );
  },
});

export const searchGear = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx: QueryCtx, args: { searchTerm: string }) => {
    if (!args.searchTerm) {
      return [];
    }

    const results = await ctx.db
      .query('gear')
      .withSearchIndex('search_name', (q) => q.search('name', args.searchTerm))
      .collect();

    return results;
  },
});
