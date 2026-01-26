# React Coding Standards Specification

## Overview

This specification defines the React coding standards module for Augment Extensions, providing comprehensive guidelines for React development with modern patterns, hooks, TypeScript integration, and performance best practices.

## Requirements

### Requirement: Module Structure
The React coding standards module SHALL follow the standard Augment Extensions module structure.

#### Scenario: Create module directory
- GIVEN a need for React coding standards
- WHEN creating the module
- THEN it MUST be located at `augment-extensions/coding-standards/react/`
- AND it MUST include `module.json`, `README.md`, and `rules/` directory
- AND it MUST include an `examples/` directory with React code examples

### Requirement: Component Naming and Organization
The module SHALL provide React-specific naming conventions and component organization patterns.

#### Scenario: Component naming
- GIVEN React components
- WHEN naming components
- THEN PascalCase MUST be used for component names
- AND component files SHOULD use PascalCase (e.g., `UserProfile.tsx`)
- AND hook files SHOULD use camelCase with "use" prefix (e.g., `useAuth.ts`)
- AND utility files SHOULD use camelCase or kebab-case

#### Scenario: Component file organization
- GIVEN a React component
- WHEN organizing the component file
- THEN imports MUST come first (React, third-party, local)
- AND type definitions SHOULD come before the component
- AND the component SHOULD be the default export
- AND helper functions SHOULD be defined outside the component when possible

### Requirement: Component Patterns
The module SHALL provide guidelines for React component patterns.

#### Scenario: Functional components
- GIVEN React components
- WHEN creating components
- THEN functional components MUST be preferred over class components
- AND arrow functions SHOULD be used for component definitions
- AND React.FC type SHOULD be avoided (use explicit props typing)

#### Scenario: Component composition
- GIVEN complex UI requirements
- WHEN building components
- THEN composition SHOULD be preferred over inheritance
- AND compound components SHOULD be used for related component groups
- AND render props or custom hooks SHOULD be used for logic sharing

### Requirement: Hooks Best Practices
The module SHALL provide comprehensive React hooks guidelines.

#### Scenario: Built-in hooks usage
- GIVEN React components with state and effects
- WHEN using hooks
- THEN useState MUST be used for component state
- AND useEffect MUST be used for side effects
- AND useCallback MUST be used to memoize callbacks
- AND useMemo MUST be used to memoize expensive computations
- AND useRef MUST be used for DOM references and mutable values

#### Scenario: Custom hooks
- GIVEN reusable component logic
- WHEN creating custom hooks
- THEN hook names MUST start with "use"
- AND hooks SHOULD return arrays or objects consistently
- AND hooks SHOULD handle cleanup in useEffect
- AND hooks SHOULD be properly typed with TypeScript

#### Scenario: Hooks rules
- GIVEN any React component or hook
- WHEN using hooks
- THEN hooks MUST only be called at the top level
- AND hooks MUST only be called from React functions
- AND dependency arrays MUST be complete and accurate
- AND ESLint rules for hooks MUST be enabled

### Requirement: TypeScript Integration
The module SHALL provide React-specific TypeScript patterns.

#### Scenario: Props typing
- GIVEN React components with props
- WHEN defining props
- THEN props MUST be typed with TypeScript interfaces or types
- AND props interfaces SHOULD be named `[ComponentName]Props`
- AND optional props SHOULD use the `?` operator
- AND children prop SHOULD use `React.ReactNode` type

#### Scenario: Event handlers
- GIVEN event handlers in React components
- WHEN typing event handlers
- THEN use React event types (e.g., `React.MouseEvent<HTMLButtonElement>`)
- AND inline event handlers SHOULD be avoided for complex logic
- AND event handler functions SHOULD be memoized with useCallback

### Requirement: State Management
The module SHALL provide state management guidelines.

#### Scenario: Local state
- GIVEN component-specific state
- WHEN managing state
- THEN useState SHOULD be used for simple state
- AND useReducer SHOULD be used for complex state logic
- AND state SHOULD be kept as local as possible

#### Scenario: Global state
- GIVEN application-wide state
- WHEN managing global state
- THEN Context API SHOULD be used for simple global state
- AND external libraries (Redux, Zustand, Jotai) SHOULD be considered for complex state
- AND state management choice SHOULD be documented

### Requirement: Performance Optimization
The module SHALL provide React performance best practices.

#### Scenario: Preventing re-renders
- GIVEN React components
- WHEN optimizing performance
- THEN React.memo SHOULD be used to prevent unnecessary re-renders
- AND useMemo SHOULD be used for expensive computations
- AND useCallback SHOULD be used for callback props
- AND key prop MUST be used correctly in lists

#### Scenario: Code splitting
- GIVEN large React applications
- WHEN optimizing bundle size
- THEN React.lazy SHOULD be used for code splitting
- AND Suspense SHOULD be used with lazy-loaded components
- AND route-based code splitting SHOULD be implemented

### Requirement: Component Testing
The module SHALL provide React testing best practices.

#### Scenario: Component tests
- GIVEN React components
- WHEN writing tests
- THEN React Testing Library SHOULD be the preferred testing framework
- AND tests SHOULD focus on user behavior, not implementation
- AND queries SHOULD prefer accessible selectors (getByRole, getByLabelText)
- AND user interactions SHOULD be tested with userEvent

#### Scenario: Hook testing
- GIVEN custom hooks
- WHEN testing hooks
- THEN @testing-library/react-hooks SHOULD be used
- AND hooks SHOULD be tested in isolation
- AND async hooks SHOULD use waitFor utilities

### Requirement: Accessibility
The module SHALL provide React accessibility guidelines.

#### Scenario: Semantic HTML
- GIVEN React components
- WHEN building UI
- THEN semantic HTML elements SHOULD be used
- AND ARIA attributes SHOULD be added when necessary
- AND keyboard navigation SHOULD be supported
- AND focus management SHOULD be handled properly

#### Scenario: Accessibility testing
- GIVEN React components
- WHEN ensuring accessibility
- THEN eslint-plugin-jsx-a11y SHOULD be enabled
- AND axe-core SHOULD be used for automated testing
- AND manual keyboard testing SHOULD be performed

### Requirement: Styling Patterns
The module SHALL provide React styling guidelines.

#### Scenario: Styling approaches
- GIVEN React components needing styles
- WHEN choosing a styling approach
- THEN CSS Modules, Styled Components, or Tailwind CSS SHOULD be used
- AND inline styles SHOULD be avoided except for dynamic values
- AND styling approach SHOULD be consistent across the project

### Requirement: Error Handling
The module SHALL provide React error handling patterns.

#### Scenario: Error boundaries
- GIVEN React components that may error
- WHEN handling errors
- THEN Error Boundaries MUST be used to catch rendering errors
- AND Error Boundaries SHOULD be placed at appropriate levels
- AND error states SHOULD be displayed to users gracefully

#### Scenario: Async error handling
- GIVEN async operations in React
- WHEN handling errors
- THEN try/catch SHOULD be used in async functions
- AND error states SHOULD be stored in component state
- AND loading and error states SHOULD be displayed to users

### Requirement: Module Metadata
The module SHALL include proper metadata in `module.json`.

#### Scenario: Module configuration
- GIVEN the React standards module
- WHEN configuring the module
- THEN `module.json` MUST include name, version, description
- AND version MUST start at "1.0.0"
- AND type MUST be "coding-standards"
- AND language MUST be "react"
- AND dependencies SHOULD include "typescript-standards"
- AND character count MUST be calculated and included

## Module Contents

The module SHALL include the following files:

### Required Files
- `module.json` - Module metadata and configuration
- `README.md` - Module overview and usage instructions
- `rules/component-patterns.md` - Component naming, organization, and patterns
- `rules/hooks-best-practices.md` - Hooks usage and custom hooks
- `rules/typescript-integration.md` - React-specific TypeScript patterns
- `rules/state-management.md` - Local and global state management
- `rules/performance.md` - Performance optimization techniques
- `rules/testing.md` - Component and hook testing with React Testing Library
- `rules/accessibility.md` - Accessibility guidelines and ARIA
- `rules/styling.md` - Styling approaches and best practices
- `rules/error-handling.md` - Error boundaries and error handling
- `examples/component-examples.tsx` - Component pattern examples
- `examples/hooks-examples.tsx` - Custom hooks examples

### Optional Files
- `examples/testing-examples.tsx` - Testing examples
- `examples/performance-examples.tsx` - Performance optimization examples

## Character Count Target

The module SHOULD target approximately 20,000-30,000 characters to cover React-specific patterns comprehensively.

