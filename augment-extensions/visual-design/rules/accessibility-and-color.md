# Accessibility, Color, Typography, and Motion Rules

## Separate standards from recommendations

WCAG 2.2 is a W3C Recommendation. Use the success criteria and conformance level required by the product or applicable policy. This module does not establish legal applicability and does not certify an implementation.

For web content, treat WCAG 2.2 Level AA as a useful review baseline when the product has not named another target. Confirm the required version and level with the product owner and applicable jurisdiction. Native applications need their applicable platform requirements and assistive-technology testing as well.

Use the following terms precisely:

- **Requirement**: a criterion that applies to the product's stated conformance target, platform contract, or jurisdiction.
- **Platform convention**: current guidance from the platform owner, such as recommended touch target dimensions.
- **Recommendation**: a module default that should be adapted to evidence and product context.

The WCAG 2.2 minimum target-size criterion is 24 by 24 CSS pixels or an applicable exception. The 44 by 44 CSS pixel target-size enhanced criterion is Level AAA. Do not present 44 CSS pixels as the WCAG 2.2 AA minimum. See [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), and [Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).

## Color and themes

- Assign semantic roles before choosing swatches: canvas, surface, primary text, secondary text, action, border, focus, success, warning, error, and information.
- Measure each foreground and background pair used in every state and theme. WCAG 2.2 AA requires 4.5:1 for normal text and 3:1 for large text. It requires 3:1 for applicable non-text controls and graphical objects. Apply the standard's definitions and exceptions rather than assuming every visible shape has the same threshold.
- Check hover, focus, selected, disabled, error, success, light, dark, high-contrast, and forced-color presentations where supported.
- Never encode state or meaning with hue alone. Pair color with text, shape, icon, pattern, position, or another visible distinction.
- Check common color-vision differences with simulations as a design aid, then verify real labels, contrast, and task comprehension. A simulation is not an accessibility test.
- Give charts direct labels or legends and use distinct line, marker, or pattern encodings in addition to color.
- Test themes against actual semantic pairs. A palette that passes in one theme can fail in another.

## Typography and content

- Establish a small hierarchy for display, headings, body, labels, and supporting text. Choose size, weight, line length, and line spacing for reading context.
- Do not claim that one pixel size guarantees readability. Prefer scalable units and platform text styles, preserve user text settings, and test larger text without clipping or lost actions.
- Check font availability, loading fallback, language glyph coverage, numeral forms, and layout shift. Avoid hiding essential content until a remote font loads.
- Test long realistic names, translated labels, legal or help content, and right-to-left text. Allow controls and rows to grow rather than clipping text.
- Keep links and labels understandable when read outside visual context. Do not use placeholder text as the only form label.

## Motion and time

- Use motion only when it explains a state change, location, or relationship. Keep essential content available if motion is removed.
- Support the user's reduced-motion preference using the platform mechanism. The web prefers-reduced-motion media feature is defined in [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion).
- Avoid flashing, uncontrolled parallax, forced movement, and auto-advancing content without a usable pause or stop mechanism when required.
- Check loading and progress states for a clear status that does not depend on animation alone.

## Operability and assistive technology

- Make essential functionality available by keyboard on platforms with keyboard input. Keep a logical focus order and a clearly visible focus indicator.
- Ensure labels, roles, names, values, instructions, and error associations are exposed through the platform accessibility API.
- Do not put focus inside hidden content. Manage focus when opening, closing, or replacing dialogs, menus, and routes.
- Check zoom, text scaling, contrast preferences, reduced motion, and screen-reader output using available platform tools. Record which settings and technologies were actually tested.

## Treat existing style data as reference material

The legacy vendor and domain data includes sample breakpoints, target sizes, and accessibility descriptions. Those entries preserve style characteristics and are not a conformance certificate or universal requirement. Apply this rule and current source documentation when a legacy value conflicts with an applicable requirement or the product's design system.
