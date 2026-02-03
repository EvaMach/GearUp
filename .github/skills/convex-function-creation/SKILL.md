---
name: 'convex-function-creation'
description: 'Guide for creating and modifying Convex backend functions (queries, mutations, actions) following GearUp conventions'
---

# Convex Function Creation Skill

## Purpose

Standardized approach for creating Convex backend functions that handle data operations for the GearUp application.

## Function Types

### Query (Read-only operations)

Use for fetching data without modifications.

### Mutation (Write operations)

Use for creating, updating, or deleting data.

### Action (External integrations)

Use for third-party API calls or non-deterministic operations.

## Workflow

### 1. Define Schema First

Update `convex/schema.ts` if creating a new table:

```typescript
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  tableName: defineTable({
    field1: v.string(),
    field2: v.number(),
    field3: v.optional(v.boolean()),
    // Add indexes for common queries
  }).index('by_field1', ['field1']),
});
```

### 2. Create Function File

Location: `convex/moduleName.ts`

**Query Example:**

```typescript
import { query } from './_generated/server';
import { v } from 'convex/values';

export const getItems = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate args
    const limit = args.limit ?? 50;

    // Query builder
    let queryBuilder = ctx.db.query('tableName');

    // Apply filters
    if (args.category) {
      queryBuilder = queryBuilder.withIndex('by_category', (q) =>
        q.eq('category', args.category)
      );
    }

    // Execute and return
    return await queryBuilder.take(limit);
  },
});
```

**Mutation Example:**

```typescript
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const createItem = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    // Validation
    if (args.weight < 0) {
      throw new Error('Weight must be non-negative');
    }

    // Insert document
    const itemId = await ctx.db.insert('tableName', {
      name: args.name,
      category: args.category,
      weight: args.weight,
      createdAt: Date.now(),
    });

    return itemId;
  },
});

export const updateItem = mutation({
  args: {
    id: v.id('tableName'),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check existence
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error('Item not found');
    }

    // Update
    await ctx.db.patch(id, updates);
  },
});
```

### 3. Follow Validation Best Practices

**Always validate arguments:**

```typescript
args: {
  email: v.string(),
  age: v.number(),
  role: v.union(v.literal("user"), v.literal("admin")),
  tags: v.array(v.string()),
  metadata: v.optional(v.object({
    key: v.string(),
    value: v.any(),
  })),
}
```

**Add runtime validation in handler:**

```typescript
handler: async (ctx, args) => {
  // Email format validation
  if (!args.email.includes('@')) {
    throw new Error('Invalid email format');
  }

  // Range validation
  if (args.age < 0 || args.age > 150) {
    throw new Error('Age must be between 0 and 150');
  }

  // Continue with logic...
};
```

### 4. Use Proper Error Handling

```typescript
handler: async (ctx, args) => {
  try {
    // Business logic
    const result = await someOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw new Error(`Failed to complete operation: ${error.message}`);
  }
};
```

### 5. Optimize Queries

**Use indexes for common queries:**

```typescript
// In schema.ts
defineTable({
  userId: v.id('users'),
  status: v.string(),
  createdAt: v.number(),
})
  .index('by_user', ['userId'])
  .index('by_status', ['status'])
  .index('by_user_and_status', ['userId', 'status']);
```

**Query with index:**

```typescript
const items = await ctx.db
  .query('tableName')
  .withIndex('by_user_and_status', (q) =>
    q.eq('userId', args.userId).eq('status', 'active')
  )
  .collect();
```

### 6. Export Functions Properly

Update `convex/_generated/api.d.ts` by running:

```bash
npx convex dev
```

### 7. Use in React Components

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function Component() {
  // Query
  const items = useQuery(api.moduleName.getItems, {
    category: 'camping',
  });

  // Mutation
  const createItem = useMutation(api.moduleName.createItem);

  const handleCreate = async () => {
    await createItem({
      name: 'Tent',
      category: 'shelter',
      weight: 2000,
    });
  };

  // Handle loading state
  if (items === undefined) return <div>Loading...</div>;

  return <div>{/* Use items */}</div>;
}
```

## Checklist

- [ ] Schema updated in `convex/schema.ts` (if new table)
- [ ] Arguments validated with `v` object
- [ ] Runtime validation for business rules
- [ ] Indexes defined for common queries
- [ ] Error handling implemented
- [ ] Function exported from module
- [ ] TypeScript types generated (`npx convex dev`)
- [ ] Tested from React component
- [ ] Error cases tested

## Common Patterns

### Pagination

```typescript
export const getPagedItems = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tableName')
      .order('desc')
      .paginate(args.paginationOpts);
  },
});
```

### Conditional Updates

```typescript
export const toggleStatus = mutation({
  args: { id: v.id('items') },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error('Item not found');

    await ctx.db.patch(args.id, {
      status: item.status === 'active' ? 'inactive' : 'active',
    });
  },
});
```

### Batch Operations

```typescript
export const createMultiple = mutation({
  args: {
    items: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = await Promise.all(
      args.items.map((item) => ctx.db.insert('tableName', item))
    );
    return ids;
  },
});
```
