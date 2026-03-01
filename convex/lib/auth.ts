import { ConvexError } from 'convex/values';
import { QueryCtx, MutationCtx } from '../_generated/server';
import { Doc } from '../_generated/dataModel';

export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError('Authentication required');
  }

  return identity.subject;
}

async function getUserByClerkId(
  ctx: QueryCtx | MutationCtx,
  clerkId: string
): Promise<Doc<'users'> | null> {
  return ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
    .unique();
}

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError('Authentication required');
  }

  const user = await getUserByClerkId(ctx, identity.subject);

  if (!user) {
    throw new ConvexError('User not found');
  }

  return user;
}

export async function getOrCreateCurrentUser(
  ctx: MutationCtx
): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError('Authentication required');
  }

  let user = await getUserByClerkId(ctx, identity.subject);

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

  if (!user) {
    throw new ConvexError('User not found');
  }

  return user;
}

export async function verifyOwnership(
  ctx: QueryCtx | MutationCtx,
  resourceUserId: string | undefined,
  resourceType: string
): Promise<void> {
  const user = await getCurrentUser(ctx);

  if (!resourceUserId || resourceUserId !== user._id) {
    throw new ConvexError(`Unauthorized: You don't own this ${resourceType}`);
  }
}
