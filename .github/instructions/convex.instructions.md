---
name: Convex Backend Guidelines
description: Backend development standards and best practices for Convex in the GearUp project
applyTo: 'convex/**/*.{ts,js}'
---

# Convex Backend Instructions

Follow these guidelines for backend development using Convex in the GearUp project.

## Schema & Validation

- Define the database schema explicitly in `convex/schema.ts` using `defineSchema`
- Use `defineTable` for every collection to ensure type safety across the application
- **Validate all function arguments** using the `v` object from `convex/values`
- Ensure all fields in the schema have **specific validators** (e.g., `v.string()`, `v.number()`) rather than `v.any()`
- Use `v.optional()` for optional fields rather than `v.union(v.null(), ...)`
- Document schema fields with comments for complex data structures
- Use **enums or unions** for fields with limited valid values (e.g., status fields)

## Data Access (Queries)

- Define read operations using the `query` wrapper from `./_generated/server`
- **Keep queries pure**: do not modify data inside a `query` function
- Use **specific indexes** when querying large datasets to maintain performance
- Return only the **necessary data fields** to the frontend to minimize payload size
- Throw instances of `ConvexError` for expected application errors (e.g., "Item not found")
- Use **pagination** for queries that may return large result sets
- Avoid N+1 query problems by using batch operations or denormalization when appropriate
- Cache frequently accessed data patterns using indexes

## Data Modification (Mutations)

- Define write operations using the `mutation` wrapper from `./_generated/server`
- Use `db.patch()` when updating specific fields of a document
- Use `db.replace()` only when you intend to completely overwrite a document
- Use `db.insert()` for creating new documents
- **Perform all necessary permission checks** (e.g., verifying user ownership) at the start of the mutation
- Validate all input data before performing database operations
- Use **transactions** implicitly (Convex mutations are atomic by default)
- Return meaningful data from mutations (e.g., the updated document or confirmation)
- Handle edge cases (e.g., attempting to update a non-existent document)

## Type Safety

- Use the generated types `Doc<"tableName">` and `Id<"tableName">` from `./_generated/dataModel`
- **Never use `any` type**; rely on Convex's type inference
- Use `args` typing in functions to ensure frontend inputs match backend expectations
- Avoid manually defining types that duplicate the Convex schema
- Use **TypeScript strict mode** and fix all type errors
- Leverage union types for variant data structures
- Type return values explicitly for complex functions

## Security Best Practices

- **Always validate and sanitize input** in mutations and actions
- Implement **authentication checks** at the start of protected functions
- Verify **authorization** (user permissions) before modifying or returning sensitive data
- Never expose sensitive data (passwords, tokens, API keys) in query results
- Use **environment variables** for secrets and API keys (access via `process.env`)
- Sanitize user-generated content before storing to prevent injection attacks
- Implement **rate limiting** for public-facing endpoints
- Log security-relevant events (failed auth attempts, suspicious activity)
- Use **ConvexError** with appropriate error messages (don't leak sensitive information)
- Never trust client-side validation alone; always validate on the backend

## Error Handling

- Throw `ConvexError` for expected, user-facing errors with clear messages
- Use specific error messages that help users understand what went wrong
- Catch and handle errors from external API calls gracefully
- Log unexpected errors for debugging (use `console.error`)
- Avoid exposing internal implementation details in error messages
- Use try-catch blocks for error-prone operations (external APIs, file operations)

## Code Quality Principles

### DRY (Don't Repeat Yourself)

- Extract repeated validation logic into reusable helper functions
- Create utility functions for common database operations
- Use shared constants for repeated values

### SOLID Principles

- **Single Responsibility**: Each function should have one clear purpose
- **Open/Closed**: Design functions to be extendable via arguments, not modification
- **Dependency Inversion**: Use dependency injection for external services (pass as arguments)
- Keep functions small and focused (ideally under 30 lines)

### Clean Code Practices

- Use **descriptive function and variable names** that convey intent
- Add comments only when the code's purpose is not obvious
- Remove dead code and unused imports immediately
- Use early returns to reduce nesting and improve readability
- Keep function complexity low; split complex functions into smaller helpers

## Performance Optimization

- Use **database indexes** for frequently queried fields
- Denormalize data when read performance is critical (balance with consistency needs)
- Avoid fetching unnecessary data; select only needed fields
- Use pagination for large result sets
- Consider caching strategies for expensive computations
- Monitor query performance and optimize slow queries

## File Organization

- Group related functions into the same file (e.g., `convex/gear.ts` for all gear-related logic)
- Place shared utility functions in `convex/lib/` or `convex/utils/`
- Keep schema definitions in `convex/schema.ts`
- **Never import frontend-specific libraries** (like React) into Convex functions
- Use clear, descriptive filenames that reflect the domain
- Organize by feature/domain rather than by type (queries/mutations)

## Actions (HTTP Actions & External APIs)

- Use `action` wrapper for operations that call external APIs or perform side effects
- Actions can call queries and mutations using `ctx.runQuery()` and `ctx.runMutation()`
- Handle HTTP errors gracefully with proper status codes
- Implement retry logic for transient failures in external API calls
- Use timeouts for external requests to prevent hanging
- Validate and sanitize data received from external sources

## Testing Considerations

- Write tests for complex business logic
- Test validation logic thoroughly
- Mock external dependencies in tests
- Test error handling paths
- Verify permission checks work correctly

## Examples

### Good Query Pattern

```typescript
import { query } from './_generated/server';
import { v } from 'convex/values';

export const getGearByType = query({
  args: {
    type: v.union(v.literal('hiking'), v.literal('camping')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const gear = await ctx.db
      .query('gear')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .take(limit);

    // Return only necessary fields
    return gear.map(({ _id, name, weight, category }) => ({
      _id,
      name,
      weight,
      category,
    }));
  },
});
```

### Good Mutation Pattern

```typescript
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { ConvexError } from 'convex/values';

export const updateGear = mutation({
  args: {
    gearId: v.id('gear'),
    name: v.optional(v.string()),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate input
    if (args.weight !== undefined && args.weight < 0) {
      throw new ConvexError('Weight must be positive');
    }

    // Check existence
    const gear = await ctx.db.get(args.gearId);
    if (!gear) {
      throw new ConvexError('Gear not found');
    }

    // Perform update
    await ctx.db.patch(args.gearId, {
      ...(args.name && { name: args.name }),
      ...(args.weight !== undefined && { weight: args.weight }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
```

---

**Remember**: Write backend code that is **secure, performant, type-safe, and maintainable**. Always validate input, handle errors gracefully, and protect user data.
