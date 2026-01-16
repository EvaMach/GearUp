import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
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
});
