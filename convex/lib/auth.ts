import { ConvexError } from 'convex/values';
import { QueryCtx, MutationCtx } from '../_generated/server';

/**
 * Get the authenticated user's Clerk ID
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
 * Returns user document
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
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
 * Verify user owns a resource by comparing user IDs
 */
export async function verifyOwnership(
  ctx: QueryCtx | MutationCtx,
  resourceUserId: string | undefined,
  resourceType: string
): Promise<void> {
  const user = await getCurrentUser(ctx);

  if (!resourceUserId || resourceUserId !== user?._id) {
    throw new ConvexError(`Unauthorized: You don't own this ${resourceType}`);
  }
}
