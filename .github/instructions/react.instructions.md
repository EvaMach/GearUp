---
name: React Development Guidelines
description: React development standards and best practices for GearUp project
applyTo: '**/*.{tsx,ts,jsx,js}'
---

# React Development Instructions

Follow these guidelines for React development within the GearUp project.

## Component Architecture

- Create all components as **functional components** using modern React patterns
- Use **PascalCase** for component filenames and function names
- Export components as **default exports** unless they are small utility components
- Keep components **small and focused** on a single responsibility (Single Responsibility Principle)
- Break complex UIs into smaller, reusable sub-components
- Prefer **composition over inheritance** for component reusability
- Avoid prop drilling; consider context or state management solutions for deeply nested data

## Modern React Features

### Concurrent Features

- Use **React.lazy()** and **Suspense** for code-splitting and lazy loading components
- Implement **Suspense boundaries** with meaningful fallback UI for async components
- Use **startTransition** for non-urgent state updates to keep UI responsive
- Consider **useDeferredValue** for expensive computations that can be deferred

### Server Components (if applicable)

- Leverage Server Components for data fetching when using frameworks that support them
- Keep client-side interactivity boundaries minimal using `"use client"` directive sparingly

## State Management

- Use **React Hooks** (`useState`, `useReducer`, `useContext`) for state management
- **Never use class components** or class-based lifecycle methods
- Create **custom hooks** to encapsulate and reuse complex logic
- Lift state up to common ancestors only when necessary (avoid over-lifting)
- Use **useReducer** for complex state logic with multiple sub-values
- Consider external state management (Zustand, Jotai) only when needed

## TypeScript & Type Safety

- Use **TypeScript** for all component files (`.tsx` for React, `.ts` for utilities)
- Define strict **interfaces** or **types** for all component props and state
- **Never use `any`**; use `unknown` or specific types when type is unclear
- Use proper types for event handlers (e.g., `React.ChangeEvent<HTMLInputElement>`)
- Leverage **union types** and **discriminated unions** for variant props
- Use **generics** for reusable component patterns
- Enable strict mode in `tsconfig.json` and fix all type errors

## Performance Optimization

- Use **React.memo()** for components that receive the same props frequently
- Memoize expensive calculations with **useMemo**
- Memoize callback functions passed to children with **useCallback**
- Use **key prop correctly** when rendering lists; ensure keys are unique, stable, and not array indices
- Avoid inline object/array creation in JSX that causes unnecessary re-renders
- Profile performance using React DevTools Profiler before optimizing

## Code Quality Principles

### DRY (Don't Repeat Yourself)

- Extract repeated logic into custom hooks or utility functions
- Create reusable components for common UI patterns
- Use constants for repeated values

### SOLID Principles

- **Single Responsibility**: Each component should have one clear purpose
- **Open/Closed**: Design components to be extendable via props, not modification
- **Liskov Substitution**: Component props should be predictable and consistent
- **Interface Segregation**: Avoid bloated prop interfaces; split into focused components
- **Dependency Inversion**: Depend on abstractions (props, hooks) not concrete implementations

### Clean Code Practices

- Use **descriptive names** for components, functions, and variables
- Keep functions small and focused (ideally under 20 lines)
- **Destructure props** in the function signature for clarity
- Add comments only when code intent is not obvious
- Remove dead code and unused imports immediately
- Use early returns to reduce nesting and improve readability

## Styling (Tailwind CSS)

- Use **Tailwind CSS** utility classes exclusively for styling
- Avoid custom CSS files unless absolutely necessary for complex animations
- Use Tailwind's **responsive prefixes** (`sm:`, `md:`, `lg:`, `xl:`) for mobile-first design
- Use **`clsx`** or **`tailwind-merge`** for conditional class application
- Extract repeated class combinations into component variants or CSS classes
- Follow consistent spacing and sizing scale from Tailwind's design system

## Accessibility (a11y)

- Use **semantic HTML** elements (`<button>`, `<nav>`, `<main>`, `<header>`, etc.)
- Add **ARIA labels** (`aria-label`, `aria-labelledby`) to interactive elements without visible text
- Ensure **keyboard navigation** works for all interactive elements
- Use **ARIA roles** appropriately (but prefer semantic HTML first)
- Maintain **focus management** for modals, dropdowns, and dynamic content
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure **color contrast** meets WCAG AA standards (4.5:1 for text)
- Provide **alt text** for all images (use empty string for decorative images)
- Use **focus-visible** styles instead of removing focus outlines
- Make forms accessible with proper labels and error messages

## Security Best Practices

- **Sanitize user input** before rendering; React escapes by default, but be cautious with `dangerouslySetInnerHTML`
- **Never use `dangerouslySetInnerHTML`** unless absolutely necessary; use a sanitization library (DOMPurify) if required
- **Validate all user input** on both client and server
- Store sensitive data securely; **never expose API keys or secrets** in client-side code
- Use **Content Security Policy (CSP)** headers to prevent XSS attacks
- Implement **HTTPS** for all production deployments
- Be cautious with **third-party dependencies**; audit regularly and keep updated
- Use **environment variables** for configuration, never hard-code credentials

## Error Handling

- Implement **Error Boundaries** to catch and handle component crashes gracefully
- Provide meaningful error messages to users
- Log errors to monitoring services (Sentry, LogRocket) in production
- Use **try-catch** blocks for async operations and API calls
- Display fallback UI when components fail to load

## Testing Considerations

- Write tests for critical user flows and complex logic
- Use React Testing Library for component tests
- Test accessibility with `@testing-library/jest-dom` matchers
- Mock external dependencies and API calls

## File Organization

- Place related components, hooks, and utilities in logical folders
- Keep component files focused; extract hooks and utilities to separate files
- Use index files for cleaner imports when appropriate

## Examples

### Good Component Pattern

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-4 py-2 rounded font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' &&
          'bg-gray-200 text-gray-800 hover:bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={label}
    >
      {label}
    </button>
  );
}
```

### Using Suspense for Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

**Remember**: Write code that is **readable, maintainable, secure, and accessible**. Code is read more often than it is written.
