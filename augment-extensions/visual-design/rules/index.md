# Visual Design Guidance Index

Use this index to choose the smallest applicable guide. Resolve conflicts in this order:

1. User needs and product requirements.
2. Applicable accessibility and platform requirements.
3. The product's established design system.
4. This module's defaults and examples.

Distinguish a binding requirement from a platform convention and a module recommendation. Do not claim legal compliance or user research without evidence.

## Choose by task

| Task | Start here |
|---|---|
| Frame goals, journeys, evidence, and iteration | [Design practice rules](design-practice.md) and the [design brief skill](../skills/design-brief.md) |
| Review a design or implementation | [Accessibility and color rules](accessibility-and-color.md), [platform guidance](platform-guidance.md), and the [design review skill](../skills/design-review.md) |
| Choose a depth for a new design | [Design levels](../guidelines/design-levels.md) |
| Apply the guidance by topic and level | [Coverage map](../guidelines/coverage-map.md) |
| Test an in-scope web interface responsively | [Responsive validation skill](../skills/responsive-validation/SKILL.md) |
| Select a vendor palette or domain pattern | Existing TypeScript data under domains, with the scope rules in [platform guidance](platform-guidance.md) |

## Guidance locations

- Rules define decisions that apply across designs and implementations.
- Guidelines give progressive design depth and map coverage.
- Skills provide repeatable, task-sized procedures.
- Existing vendor and domain TypeScript files remain selectable design references.

The CLI reads module metadata and the Markdown files directly under rules. Use augx show visual-design rules/index.md for this index and augx show visual-design skills/responsive-validation/SKILL.md for the responsive procedure. The repository-level augx skill command indexes the root skills directory; it does not discover module-local skill files.

## Scope

Apply viewport and orientation guidance to screen interfaces. Print, film and image-generation work have different size and composition constraints; use their existing domain material and the applicable parts of the design rules. A screen interface embedded in any of those products still needs responsive and accessibility review.
