# AI Coding Agent Instructions for GearUp Project

## Project Overview

The GearUp project is a web application designed for managing gear lists for trips. It utilizes React for the frontend and Convex for backend functionalities, including data management and querying.

## Architecture

- **Frontend**: Built with React, utilizing components for modularity. Key components include `GearListForm`, `Header`, and various pages managed by React Router.
- **Backend**: Convex handles data storage and retrieval, with functions defined in the `convex` directory. Queries and mutations are structured to interact with the gear database.

## Key Components

- **GearListForm**: Manages the gear selection and packing process. It fetches gear data, allows users to add/remove items, and stores the state in local storage.
- **API Layer**: Functions in `src/api` handle data fetching and manipulation, including `useGearSearch` for searching gear items.

## Developer Workflows

- **Building the Project**: Use `npm run build` to compile the project. Ensure all dependencies are installed with `npm install`.
- **Running the Development Server**: Start the development server with `npm run dev`.
- **Seeding the Database**: Use `npx convex run seed:seedGear` to populate the database with initial gear data.

## Testing and Debugging

- **Linting**: Run `npm run lint` to check for code quality issues. Ensure to fix any reported problems before committing.
- **Debugging**: Utilize browser developer tools for frontend debugging. For backend issues, check Convex logs and console outputs.

## Project Conventions

- **File Structure**: Follow the established directory structure for components, APIs, and Convex functions. Keep related files together for better maintainability.
- **Naming Conventions**: Use camelCase for variables and functions, PascalCase for components, and kebab-case for file names.

## Integration Points

- **Convex**: The project heavily relies on Convex for data management. Familiarize yourself with the Convex documentation for effective usage of queries and mutations.
- **External Libraries**: The project uses libraries like `react-select` for dropdowns and `lodash` for utility functions. Refer to their documentation for advanced usage.

## Communication Patterns

- **State Management**: Local state is managed within components, while Convex handles global state through its database. Ensure to understand how data flows between components and the backend.
- **Error Handling**: Implement error handling in API calls to manage user feedback effectively. Use `console.error` for logging errors during development.

## Example Usage

- To fetch gear data in a component:
  ```tsx
  const gearData = useQuery(api.gear.getGear, { type: tripDetails.type });
  ```
- To add a new gear item:
  ```tsx
  const addItem = (selectedItem: SingleValue<SelectOption>): void => {
    // Logic to add item
  };
  ```

## Conclusion

These instructions should help AI coding agents navigate the GearUp project effectively. For any unclear sections, please provide feedback for further refinement.
