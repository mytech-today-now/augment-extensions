# Coding Standards Specifications

This directory contains OpenSpec specifications for coding standards modules in Augment Extensions.

## Overview

Coding standards modules provide comprehensive guidelines for writing clean, maintainable, and consistent code across different programming languages and frameworks.

## Specifications

### [Python Coding Standards](./python-standards.md)
- **Module**: `augment-extensions/coding-standards/python/`
- **Version**: 1.0.0 (planned)
- **Target Size**: ~15,000-25,000 characters
- **Contents**:
  - Naming conventions (PEP 8)
  - Type hints (PEP 484, 585, 604)
  - Code organization (imports, classes, modules)
  - Error handling (exceptions, context managers)
  - Async patterns (async/await, asyncio)
  - Documentation (docstrings, Google/NumPy style)
  - Testing (pytest, fixtures, parametrize)
  - Code quality tools (Black, Ruff, mypy, isort)

### [React Coding Standards](./react-standards.md)
- **Module**: `augment-extensions/coding-standards/react/`
- **Version**: 1.0.0 (planned)
- **Target Size**: ~20,000-30,000 characters
- **Dependencies**: `typescript-standards`
- **Contents**:
  - Component patterns (functional components, composition)
  - Hooks best practices (useState, useEffect, custom hooks)
  - TypeScript integration (props typing, event handlers)
  - State management (local state, global state, Context API)
  - Performance optimization (React.memo, useMemo, code splitting)
  - Testing (React Testing Library, user behavior)
  - Accessibility (semantic HTML, ARIA, keyboard navigation)
  - Styling (CSS Modules, Styled Components, Tailwind)
  - Error handling (Error Boundaries, async errors)

### [HTML/CSS/JavaScript Coding Standards](./html-css-js-standards.md)
- **Module**: `augment-extensions/coding-standards/html-css-js/`
- **Version**: 1.0.0 (planned)
- **Target Size**: ~25,000-35,000 characters
- **Contents**:
  - HTML standards (semantic HTML, accessibility, structure)
  - CSS standards (naming conventions, BEM, organization)
  - CSS modern features (Grid, Flexbox, custom properties)
  - JavaScript standards (ES6+, const/let, arrow functions)
  - Code organization (modules, imports, structure)
  - DOM manipulation (queries, event handling, delegation)
  - Async patterns (async/await, Fetch API, promises)
  - Performance (debounce, lazy loading, critical CSS)
  - Tooling (ESLint, Prettier, Stylelint)
  - Browser compatibility (feature detection, polyfills)

## Implementation Plan

### Phase 1: Python Coding Standards
1. Create module directory structure
2. Write `module.json` with metadata
3. Create `README.md` with overview
4. Write rule files:
   - `naming-conventions.md`
   - `type-hints.md`
   - `code-organization.md`
   - `error-handling.md`
   - `async-patterns.md`
   - `documentation.md`
   - `testing.md`
5. Create example files:
   - `best-practices.py`
   - `async-examples.py` (optional)
   - `type-hints-examples.py` (optional)
6. Calculate character count
7. Update `MODULES.md` catalog

### Phase 2: React Coding Standards
1. Create module directory structure
2. Write `module.json` with metadata (include typescript-standards dependency)
3. Create `README.md` with overview
4. Write rule files:
   - `component-patterns.md`
   - `hooks-best-practices.md`
   - `typescript-integration.md`
   - `state-management.md`
   - `performance.md`
   - `testing.md`
   - `accessibility.md`
   - `styling.md`
   - `error-handling.md`
5. Create example files:
   - `component-examples.tsx`
   - `hooks-examples.tsx`
   - `testing-examples.tsx` (optional)
6. Calculate character count
7. Update `MODULES.md` catalog

### Phase 3: HTML/CSS/JS Coding Standards
1. Create module directory structure
2. Write `module.json` with metadata
3. Create `README.md` with overview
4. Write rule files:
   - `html-standards.md`
   - `css-standards.md`
   - `css-modern-features.md`
   - `javascript-standards.md`
   - `dom-manipulation.md`
   - `async-patterns.md`
   - `performance.md`
   - `tooling.md`
5. Create example files:
   - `html-examples.html`
   - `css-examples.css`
   - `javascript-examples.js`
   - `responsive-layout.html` (optional)
6. Calculate character count
7. Update `MODULES.md` catalog

## Common Patterns

All coding standards modules MUST:
- Follow the standard module structure (`module.json`, `README.md`, `rules/`, `examples/`)
- Use semantic versioning starting at 1.0.0
- Include comprehensive examples
- Calculate and document character count
- Be cataloged in `MODULES.md`
- Be project-agnostic and reusable

All coding standards modules SHOULD:
- Target 15,000-35,000 characters depending on scope
- Include both positive (✅) and negative (❌) examples
- Provide clear, actionable guidelines
- Reference official style guides and standards
- Include tooling recommendations

## Dependencies

- **React Standards** depends on **TypeScript Standards** (React + TypeScript is the recommended approach)
- **Python Standards** has no dependencies
- **HTML/CSS/JS Standards** has no dependencies

## Related Specifications

- [Augment Extensions Specification](../augment-extensions/spec.md) - Overall module system
- [TypeScript Standards](../../augment-extensions/coding-standards/typescript/) - Existing TypeScript module

## Success Criteria

Each coding standards module is considered complete when:
- ✅ All required files are created
- ✅ Character count is within target range
- ✅ Examples are comprehensive and working
- ✅ `MODULES.md` is updated
- ✅ Module is tested with AI agents
- ✅ Documentation is clear and actionable

