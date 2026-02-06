# Visual Design Module - Usage Examples

This directory contains practical examples demonstrating how to use the Visual Design module with Augment AI.

## Examples

### 1. Basic Usage (`basic-usage.md`)
- How to query the module
- Selecting vendor styles
- Applying design elements

### 2. Website Design (`website-design-example.md`)
- Complete website design workflow
- Multi-page site structure
- Navigation and layout patterns

### 3. Web Application Design (`web-app-design-example.md`)
- SPA/PWA design patterns
- Interactive components
- State-driven UI

### 4. Mobile Application Design (`mobile-app-design-example.md`)
- Touch-first interactions
- Native platform patterns (iOS/Android)
- Responsive mobile layouts

### 5. Print Campaign Design (`print-campaign-example.md`)
- Flyers, posters, banners
- Print-specific color and typography
- Layout for physical media

### 6. Cross-Platform Design (`cross-platform-example.md`)
- Consistent design across platforms
- Platform-specific adaptations
- Design system tokens

### 7. AI Prompt Helper (`ai-prompt-example.md`)
- Generating image prompts
- Style-specific prompt templates
- Multi-platform compatibility

### 8. Domain-Specific Workflows (`domain-workflows.md`)
- Website vs Web-app vs Mobile
- .NET Application design
- Linux/Windows platform design
- Motion Picture design

## How to Use These Examples

1. **Read the example**: Each example is self-contained with context and goals
2. **Follow the workflow**: Step-by-step instructions for AI agents
3. **Adapt to your needs**: Modify examples for your specific use case
4. **Reference the module**: Use `augx show visual-design` for detailed specs

## For AI Agents

When working with the Visual Design module:

1. **Query the module first**: `augx show visual-design`
2. **Select appropriate vendor**: Use default priority or user preference
3. **Choose domain**: Website, Web-app, Mobile, Print, etc.
4. **Apply design elements**: Color, typography, layout, spacing
5. **Follow design principles**: Balance, contrast, hierarchy, accessibility
6. **Generate output**: HTML/CSS, design specs, or mockups

## Example Workflow

```bash
# 1. Link the module
augx link visual-design

# 2. View module content
augx show visual-design

# 3. View specific vendor style
augx show visual-design/google-modern

# 4. View specific domain
augx show visual-design/website
```

## Testing Your Designs

Refer to `__tests__/` directory for:
- Unit tests for style selectors
- Integration tests for vendor styles
- Validation tests for design principles

## Additional Resources

- **Module README**: `../README.md`
- **Type Definitions**: `../types.ts`
- **Core Design Elements**: `../visual-design-core.ts`
- **Style Selector**: `../style-selector.ts`
- **Vendor Styles**: `../domains/web-page-styles/`
- **Domain Styles**: `../domains/other/`

