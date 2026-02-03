---
name: 'component-creation'
description: 'Step-by-step process for creating new React components in the GearUp project following best practices'
---

# Component Creation Skill

## Purpose

Standardized workflow for creating new React components that follow GearUp project conventions and best practices.

## Workflow

### 1. Plan Component Structure

Before creating the component, determine:

- Component purpose and responsibilities
- Props interface
- State requirements
- Convex data dependencies (queries/mutations)
- Child components needed

### 2. Create Component File

Location: `src/components/componentName.tsx`

Template:

```tsx
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ComponentNameProps {
  // Define props with TypeScript types
  propName: string;
  optionalProp?: number;
}

export default function ComponentName({
  propName,
  optionalProp,
}: ComponentNameProps) {
  // Convex queries/mutations
  const data = useQuery(api.module.queryName, {
    /* args */
  });
  const mutate = useMutation(api.module.mutationName);

  // Local state
  const [state, setState] = React.useState<Type>(initialValue);

  // Event handlers
  const handleEvent = () => {
    // Logic here
  };

  // Loading/error states
  if (data === undefined) return <div>Loading...</div>;

  return <div className="container-styles">{/* Component JSX */}</div>;
}
```

### 3. Follow Conventions

#### TypeScript

- Define explicit prop interfaces
- Avoid `any` types
- Use proper type imports from Convex generated types

#### Styling

- Use Tailwind utility classes only
- No inline styles or CSS modules
- Follow mobile-first responsive design

#### Structure

- Convex hooks at top
- Local state after
- Event handlers after state
- Helper functions before return
- Return JSX last

#### Naming

- Component file: camelCase (`gearListForm.tsx`)
- Component function: PascalCase (`GearListForm`)
- Props interface: `{ComponentName}Props`
- Event handlers: `handle{Action}` (`handleSubmit`)

### 4. Add Error Handling

```tsx
const [error, setError] = React.useState<string | null>(null);

const handleAction = async () => {
  try {
    await mutate({
      /* args */
    });
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
    console.error('Action failed:', err);
  }
};

// Display errors
{
  error && <div className="text-red-600">{error}</div>;
}
```

### 5. Optimize Performance

- Use `React.memo` for expensive components
- Memoize callbacks with `useCallback` when passed as props
- Memoize expensive computations with `useMemo`
- Avoid prop drilling - use Convex queries directly in child components

### 6. Add to Router (if page component)

Update `src/App.tsx`:

```tsx
import ComponentName from './components/componentName';

// In router configuration
<Route path="/path" element={<ComponentName />} />;
```

### 7. Test Component

- Test rendering in the browser
- Verify Convex integration works
- Check responsive behavior
- Test error states
- Validate TypeScript compilation: `npm run build`
- Run linter: `npm run lint`

## Checklist

- [ ] Component file created in `src/components/`
- [ ] TypeScript props interface defined
- [ ] Convex queries/mutations properly typed
- [ ] Tailwind classes used for styling
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Responsive design verified
- [ ] No TypeScript errors
- [ ] Linter passes
- [ ] Component tested in browser
