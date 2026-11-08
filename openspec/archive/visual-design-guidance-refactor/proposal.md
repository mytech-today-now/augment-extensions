# Visual Design Guidance Refactor

## Why

The Visual Design module has useful TypeScript vendor and domain references, but no indexed rule, guideline, or module-local skill structure. Its metadata does not expose that guidance, and its legacy accessibility statements can be mistaken for current conformance claims.

## What Changes

- Add indexed rules, progressive design-level guidance, and repeatable design brief, review, and responsive validation skills.
- Define a 256 through 7680 CSS-pixel browser viewport sweep with aspect ratios, portrait and landscape cases, actual breakpoint neighbors, and boundary screenshots.
- Preserve existing vendor priorities and domain data while clarifying that legacy values are examples rather than universal requirements.
- Make metadata, validation, module discovery documentation, catalogs, and tests agree with the new structure.

## Capabilities

- Affected capability: visual-design/guidance

## Compatibility

Existing TypeScript interfaces and vendor selection behavior remain compatible. The module adds Markdown guidance and local validation scripts. Browser automation uses the consuming application's existing Playwright installation and adds no dependency.

Application-specific responsive results remain outside this module until a consuming application and runtime are provided.
