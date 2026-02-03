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
