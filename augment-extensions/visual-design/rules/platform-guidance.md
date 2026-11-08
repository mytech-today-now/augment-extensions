# Platform and Layout Guidance

## Web applications and sites

- Design for content and task flow, then choose breakpoints where the current arrangement stops working. Module values such as 600 or 1024 pixels are examples, not standard device classes.
- Use fluid constraints, grid and flex layouts, intrinsic sizing, and content-aware containers. Avoid fixed page widths and forced horizontal scrolling for ordinary text.
- Treat browser testing dimensions as CSS viewport pixels. Device-pixel ratio and physical display resolution are separate variables. The CSS reference pixel is defined by the [CSS Values and Units specification](https://www.w3.org/TR/css3-values/); device pixel ratio describes a display's physical-pixel to CSS-pixel relationship.
- Check browser zoom, text enlargement, scrollbar behavior, font fallback, safe-area environment variables where relevant, and browser support for each feature used.
- Keep essential tasks available when hover is absent. Test keyboard focus, touch input, browser back and forward, and narrow-window behavior.
- Optimize images and fonts, avoid layout shifts, and defer nonessential media. High-resolution viewports can reveal excessive line lengths and oversized blank regions, not just small-device failures.

## Mobile applications

- Test portrait and landscape, system bars, cutouts, keyboards, safe areas, text scaling, and interruptions. Do not place essential content under system controls.
- Prefer native navigation and input patterns unless a tested product need supports a different pattern. Support back navigation and preserve in-progress work across expected interruptions.
- Make touch targets and their spacing usable. Apple's current Human Interface Guidelines list 44 by 44 points as the recommended default control size and 28 by 28 points as a minimum for iOS and iPadOS. Android's accessibility guidance recommends a 48 by 48 dp touch target. These are platform recommendations with different units; they are not the WCAG CSS-pixel minimum. See [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility) and [Android accessibility for Views](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views).
- Support platform text enlargement such as Dynamic Type or Android font scaling. Let content reflow rather than truncating labels or actions.
- Verify screen-reader names, roles, state, order, and touch exploration with the platform's accessibility tools.

## Desktop software

- Support keyboard-first workflows and pointer workflows. Make focus, selection, shortcut behavior, and context menus visible and predictable.
- Preserve task context when windows resize, move between displays, or change scale. Keep essential controls reachable when window height is short.
- For dense data, support scanning, sorting, filtering, stable column meaning, and an appropriate density choice. Do not shrink text until the information becomes difficult to read.
- Test multi-window and multiple-display behavior when the product supports it. Handle display scaling and system text settings.
- Use the current operating-system design system for native controls, navigation, title bars, and window behavior.

## Cross-platform products

- Share semantic design tokens and product meaning. Define tokens by role, then map them to platform palettes, typography, spacing, and control states.
- Share components only when behavior and accessibility semantics are truly shared. Allow platform-specific navigation, safe-area, keyboard, touch, and window adaptations.
- Document where behavior intentionally differs and how each implementation is tested.
- Test parity by user outcome and task completion, not by forcing identical pixels across platforms.

## Other visual media

- Print work uses physical page dimensions, bleed, trim, and print color constraints rather than viewport breakpoints.
- Motion-picture work uses frame composition, safe-title areas, shot context, and the intended viewing environment.
- Image-generation prompts use model, aspect ratio, crop, and output constraints rather than responsive browser breakpoints.
- Apply relevant contrast, legibility, identity, color, typography, and composition guidance to each medium. Use the existing domain styles for medium-specific craft.

## References verified for this guide

- WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- Apple Human Interface Guidelines, Layout and Accessibility: https://developer.apple.com/design/human-interface-guidelines/layout and https://developer.apple.com/design/human-interface-guidelines/accessibility
- Android Views accessibility: https://developer.android.com/guide/topics/ui/accessibility/views/apps-views
- Android adaptive window size classes: https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes
