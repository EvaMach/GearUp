---
agent: 'agent'
description: 'Refactor code for better maintainability, performance, or adherence to project standards'
---

Refactor the selected code while maintaining functionality:

## Objectives:

- Improve code readability and maintainability
- Follow GearUp project conventions (see copilot-instructions.md)
- Adhere to React and Convex best practices
- Enhance TypeScript type safety
- Optimize performance where applicable

## Focus Areas:

1. **Structure**: Break down complex components/functions into smaller, reusable pieces
2. **Naming**: Use clear, descriptive names following project conventions (camelCase for functions/variables, PascalCase for components)
3. **TypeScript**: Add or improve type annotations, avoid `any` types
4. **React Patterns**: Use appropriate hooks, avoid prop drilling, optimize re-renders
5. **Convex Integration**: Ensure proper query/mutation usage, validate arguments
6. **DRY Principle**: Extract repeated logic into utility functions or custom hooks
7. **Error Handling**: Add proper error boundaries and user feedback

## Constraints:

- Maintain existing functionality and behavior
- Keep breaking changes minimal
- Update related tests if they exist
- Follow Tailwind for styling (no inline styles)
- Preserve accessibility features
