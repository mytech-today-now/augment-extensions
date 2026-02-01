# GUI Configuration Guide

## Overview

The Augment Extensions GUI can be customized using a configuration file in your project's `.augment/` directory.

## Configuration File

**Location**: `.augment/gui-config.json`

**Required**: No (uses defaults if not present)

## Configuration Schema

```json
{
  "spacing": "medium",
  "showDescriptions": true,
  "showCharacterCounts": true,
  "groupByCategory": true,
  "sortBy": "name",
  "sortOrder": "asc",
  "searchOptions": {
    "fuzzyMatch": true,
    "searchFields": ["name", "description", "tags"],
    "caseSensitive": false,
    "minMatchScore": 0.3
  },
  "displayOptions": {
    "showLinkedBadge": true,
    "showPriorityBadge": true,
    "showCategoryIcon": true,
    "highlightMatches": true
  }
}
```

## Configuration Options

### spacing

**Type**: `"compact" | "medium" | "spacious"`  
**Default**: `"medium"`  
**Description**: Controls the spacing and padding of module list items.

- `compact` - Minimal padding for dense lists
- `medium` - Balanced spacing (default)
- `spacious` - Maximum padding for readability

### showDescriptions

**Type**: `boolean`  
**Default**: `true`  
**Description**: Show module descriptions in the list.

### showCharacterCounts

**Type**: `boolean`  
**Default**: `true`  
**Description**: Display character counts for each module.

### groupByCategory

**Type**: `boolean`  
**Default**: `true`  
**Description**: Group modules by their category (coding-standards, domain-rules, etc.).

### sortBy

**Type**: `"name" | "type" | "priority" | "characterCount"`  
**Default**: `"name"`  
**Description**: Field to sort modules by.

### sortOrder

**Type**: `"asc" | "desc"`  
**Default**: `"asc"`  
**Description**: Sort order (ascending or descending).

### searchOptions

Configuration for search functionality.

#### fuzzyMatch

**Type**: `boolean`  
**Default**: `true`  
**Description**: Enable fuzzy matching in search.

#### searchFields

**Type**: `("name" | "description" | "tags")[]`  
**Default**: `["name", "description", "tags"]`  
**Description**: Fields to search in.

#### caseSensitive

**Type**: `boolean`  
**Default**: `false`  
**Description**: Make search case-sensitive.

#### minMatchScore

**Type**: `number` (0-1)  
**Default**: `0.3`  
**Description**: Minimum score for fuzzy matching (0 = no match, 1 = exact match).

### displayOptions

Visual display options for modules.

#### showLinkedBadge

**Type**: `boolean`  
**Default**: `true`  
**Description**: Show badge for linked modules.

#### showPriorityBadge

**Type**: `boolean`  
**Default**: `true`  
**Description**: Show priority badge (high/medium/low).

#### showCategoryIcon

**Type**: `boolean`  
**Default**: `true`  
**Description**: Show category icon for each module.

#### highlightMatches

**Type**: `boolean`  
**Default**: `true`  
**Description**: Highlight search matches in results.

## Example Configurations

### Compact View

```json
{
  "spacing": "compact",
  "showDescriptions": false,
  "showCharacterCounts": false,
  "groupByCategory": false,
  "sortBy": "name",
  "sortOrder": "asc"
}
```

### Detailed View

```json
{
  "spacing": "spacious",
  "showDescriptions": true,
  "showCharacterCounts": true,
  "groupByCategory": true,
  "sortBy": "priority",
  "sortOrder": "desc",
  "displayOptions": {
    "showLinkedBadge": true,
    "showPriorityBadge": true,
    "showCategoryIcon": true,
    "highlightMatches": true
  }
}
```

### Search-Focused View

```json
{
  "spacing": "medium",
  "searchOptions": {
    "fuzzyMatch": true,
    "searchFields": ["name", "description", "tags"],
    "caseSensitive": false,
    "minMatchScore": 0.2
  },
  "displayOptions": {
    "highlightMatches": true
  }
}
```

## Loading Configuration

The GUI automatically loads configuration from `.augment/gui-config.json` when launching:

```bash
augx gui
```

If the file doesn't exist, default values are used.

