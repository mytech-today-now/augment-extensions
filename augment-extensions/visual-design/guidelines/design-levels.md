# Design Levels

Use the level that matches the task, risk, and evidence available. Advanced work extends the foundations; it does not bypass them.

## General design

### Basic: General design

- State who the interface serves, the main task, and the expected outcome.
- Put the most important information and action in a clear hierarchy.
- Use consistent alignment, spacing, and component patterns.
- Sketch the main user journey and identify its start, completion, and recovery points.
- Review one realistic task with a user or a representative usability method.

### Intermediate: General design

- Adapt hierarchy and patterns to real content, device constraints, localization, and user context.
- Compare alternate journeys and test high-risk assumptions before detailed visual polish.
- Connect components, content structure, and interaction states to semantic design tokens.
- Review success, empty, loading, error, and interruption paths, not only the ideal path.
- Iterate from observed usability evidence and record the limits of each study.

### Advanced: General design

- Balance user outcomes, product strategy, service operations, accessibility, delivery cost, and long-term maintenance.
- Evaluate alternatives with explicit evidence, risk, and tradeoff records.
- Govern cross-platform patterns, migration paths, and design-system contribution quality.
- Plan for edge cases such as assistive input, very large text, right-to-left scripts, low bandwidth, interrupted tasks, and changing display environments.

## Color

### Basic: Color

- Choose a limited palette with semantic roles for text, surfaces, actions, borders, and feedback.
- Check foreground and background contrast for the selected state and theme.
- Pair color with another signal so meaning is not conveyed by hue alone.
- Verify that error, success, warning, and information colors are distinguishable.

### Intermediate: Color

- Define semantic tokens for light and dark themes and map states consistently.
- Test the full set of component states, data visualizations, disabled controls, and focus indicators.
- Check color-vision differences, high-contrast settings, and localized labels beside color indicators.
- Use measured contrast results, not the name or reputation of a palette.

### Advanced: Color

- Govern token aliases, brand palettes, contrast testing, and theme extension across products.
- Test forced colors, increased contrast, transparency preferences, dynamic color, and display gamut where supported.
- Evaluate chart palettes for multiple series, print output, color-vision variation, and non-color alternatives.
- Record the standard version, conformance scope, exceptions, and test method for any compliance claim.

## Typography

### Basic: Typography

- Define display, heading, body, label, and supporting text roles.
- Choose readable line spacing and line lengths for the medium and viewing context.
- Prefer scalable type and do not make essential information depend on tiny labels.
- Keep labels concise, specific, and understandable out of context.

### Intermediate: Typography

- Adapt the type scale to hierarchy, responsive constraints, platform styles, and content density.
- Support user text scaling and check wrapping, reflow, truncation, and control growth.
- Plan for font loading, fallback metrics, glyph coverage, localization, and right-to-left text.
- Review long, realistic strings in tables, buttons, navigation, error messages, and forms.

### Advanced: Typography

- Govern type tokens and platform mappings while preserving accessible scaling and user settings.
- Measure layout shifts and rendering performance for local and remote font strategies.
- Test complex scripts, variable font axes, mixed-script content, numerals, and high text enlargement.
- Resolve density and branding tradeoffs without hiding content or reducing operability.

## Layout

### Basic: Layout

- Organize content into a clear reading and task sequence.
- Use alignment, spacing, grouping, and a simple grid to show relationships.
- Keep the primary action and required content visible at the smallest supported size.
- Allow ordinary text to wrap and controls to grow with their content.

### Intermediate: Layout

- Use fluid containers and choose breakpoints when the content or interaction needs a new arrangement.
- Reflow navigation, forms, cards, tables, and media across portrait and landscape.
- Set reasonable line lengths and maximum content widths at large sizes.
- Test browser, safe-area, keyboard, orientation, and multi-window constraints that apply to the product.

### Advanced: Layout

- Govern responsive and container-level rules across nested components and shared shells.
- Evaluate dense data, extreme aspect ratios, ultra-wide displays, split windows, zoom, and 200 percent text scaling.
- Balance performance, image resolution, layout stability, content priority, and localization.
- Use deliberate exceptions for inherently two-dimensional content, and provide an accessible way to inspect or operate it.

## Research, product, and service design

### Basic: Research, product, and service design

- Write the user goal, product outcome, assumptions, and constraints before choosing a visual treatment.
- Select a research method that can answer the most important open question.
- Sketch the journey and note the channels, support, and handoffs that affect completion.

### Intermediate: Research, product, and service design

- Triangulate observation, interviews, usage data, and usability testing where appropriate.
- Prioritize by user impact, evidence strength, feasibility, and operational cost.
- Test the concept with representative tasks and use outcomes to revise scope and flow.

### Advanced: Research, product, and service design

- Govern evidence quality, research ethics, sampling limits, and the path from insight to product decision.
- Measure cross-channel outcomes and service handoffs without overstating causal evidence.
- Revisit strategy when user needs, policy, business constraints, or platform capabilities change.

## UX, information architecture, and UX writing

### Basic: UX, information architecture, and UX writing

- Group content by user tasks and use familiar labels.
- Show location, available actions, progress, and next steps.
- Write specific labels and recovery-oriented messages.

### Intermediate: UX, information architecture, and UX writing

- Test navigation and findability with realistic tasks.
- Use progressive disclosure only when it reduces load without hiding required information.
- Localize labels and content, then verify wrapping, reading order, and meaning.

### Advanced: UX, information architecture, and UX writing

- Govern taxonomy, search, content lifecycle, localization, and cross-product terminology.
- Evaluate complex permissions, large information sets, errors, and recovery paths.
- Measure findability and task comprehension, and record evidence limits.

## UI, interaction, and visual or graphic design

### Basic: UI, interaction, and visual design

- Define components by purpose and provide clear default, focus, active, disabled, loading, and error states as needed.
- Support the intended keyboard, pointer, and touch methods.
- Use consistent imagery and iconography with text or accessible names where needed.

### Intermediate: UI, interaction, and visual design

- Design state transitions, validation, feedback, error prevention, and recovery.
- Adapt component layouts to content, orientation, density, theme, and input capability.
- Use imagery and icons consistently without distortion or color-only meaning.

### Advanced: UI, interaction, and visual design

- Resolve complex focus management, concurrent states, asynchronous updates, and interrupted tasks.
- Govern visual identity and component behavior across platforms and accessibility settings.
- Evaluate motion and graphics for performance, legibility, localization, and assistive technology.

## Accessibility and motion

### Basic: Accessibility and motion

- Keep content perceivable and actions operable through supported input methods.
- Provide readable text, visible focus, labels, and non-color cues.
- Keep motion purposeful and honor the user's reduced-motion preference.

### Intermediate: Accessibility and motion

- Test semantic roles, keyboard flow, contrast, zoom, larger text, and assistive-technology output.
- Check dialogs, menus, errors, status updates, animation, and focus restoration.
- Record exact tools, settings, versions, and untested states.

### Advanced: Accessibility and motion

- Map applicable criteria to evidence and track exceptions, platform differences, and residual risks.
- Test complex interactions, personalization, forced colors, dynamic type, and nonvisual operation.
- Include disabled participants or representative methods where the project and consent process support them.

## Design systems

### Basic: Design systems

- Reuse named colors, type roles, spacing, and components.
- Document component purpose, variants, and states.

### Intermediate: Design systems

- Define semantic tokens, ownership, contribution review, platform mappings, and versioned migration guidance.
- Check system changes against accessibility, localization, responsive behavior, and performance.

### Advanced: Design systems

- Govern adoption, deprecation, exceptions, token aliases, cross-platform parity, and long-term maintenance.
- Measure design-system outcomes and remove patterns only after consumer impact is understood.

## Platform practice

### Basic: Platform practice

- Identify browser, mobile, desktop, or cross-platform constraints before selecting layouts.
- Use native navigation, safe areas, keyboard, pointer, and touch patterns appropriate to the target.

### Intermediate: Platform practice

- Test each supported platform's resize, orientation, scaling, input, and accessibility settings.
- Share semantic tokens while adapting components and navigation to platform conventions.

### Advanced: Platform practice

- Govern platform-specific differences, multi-window and multi-display behavior, browser support, and adaptive breakpoints.
- Reassess behavior when operating-system or browser guidance changes.
