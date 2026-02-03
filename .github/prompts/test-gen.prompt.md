---
agent: 'agent'
description: 'Generate comprehensive unit tests for React components and Convex functions'
---

Generate comprehensive tests for the selected code:

## For React Components:

- Use React Testing Library with Vitest
- Test component rendering and user interactions
- Mock Convex hooks (`useQuery`, `useMutation`) appropriately
- Test edge cases and error states
- Follow AAA pattern (Arrange, Act, Assert)
- Use descriptive test names that explain behavior

## For Convex Functions:

- Create test files in `convex/` directory with `.test.ts` suffix
- Test query/mutation logic with various inputs
- Validate argument validation works correctly
- Test database interactions and edge cases
- Mock database operations when appropriate

## General Guidelines:

- Aim for high code coverage of critical paths
- Include both positive and negative test cases
- Use clear, descriptive assertions
- Keep tests isolated and independent
