# TUI (Terminal User Interface) Setup

## Overview

The Augment Extensions CLI includes a Terminal User Interface (TUI) for interactive module management.

## Framework

We use **Ink** (React for CLIs) as the TUI framework because:
- React-based component model
- Excellent TypeScript support
- Active development and community
- Easy to build interactive components
- Good documentation

## Installation

To use the TUI, install the required dependencies:

```bash
npm install ink react
npm install --save-dev @types/react
```

## Architecture

### Components

1. **TreeNavigator** (`cli/src/gui/components/tree-navigator.tsx`)
   - Displays modules in a tree structure
   - Supports category grouping
   - Arrow key navigation
   - Collapse/expand functionality

2. **VersionSelector** (`cli/src/gui/components/version-selector.tsx`)
   - Shows available versions for selected module
   - Indicates current version
   - Shows pinned versions
   - Allows version selection and pinning

3. **SearchFilter** (`cli/src/gui/components/search-filter.tsx`)
   - Search functionality (placeholder)
   - Filter options (placeholder)

4. **PreviewPane** (`cli/src/gui/components/preview-pane.tsx`)
   - Displays module details
   - Shows metadata and description

5. **StatusBar** (`cli/src/gui/components/status-bar.tsx`)
   - Shows current state
   - Displays help hints
   - Module count

### State Management

- **NavigationState** (`cli/src/gui/state/navigation-state.ts`)
  - Current category/module
  - Expanded categories
  - Focused component

- **SelectionState** (`cli/src/gui/state/selection-state.ts`)
  - Selected module/version
  - Available versions
  - Loading state

### Theme

- **Theme** (`cli/src/gui/theme.ts`)
  - Dark and light themes
  - Color palette
  - Spacing configuration
  - Border styles

## Usage

```typescript
import { renderApp } from './gui';

// Render the TUI
renderApp({ initialTheme: 'dark' });
```

## Keyboard Shortcuts

- **Arrow Keys**: Navigate
- **Enter**: Select/Toggle
- **Tab**: Switch focus between components
- **Space**: Expand/collapse categories
- **P**: Pin/unpin version
- **Q**: Quit

## Integration with CLI

The TUI can be launched from the CLI:

```bash
augx gui
```

## Future Enhancements

- [ ] Fuzzy search implementation
- [ ] Advanced filtering
- [ ] Module installation from TUI
- [ ] Configuration editing
- [ ] Theme customization
- [ ] Mouse support

