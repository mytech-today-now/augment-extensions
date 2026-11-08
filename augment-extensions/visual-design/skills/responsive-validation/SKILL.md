---
id: visual-design-responsive-validation
name: Responsive Interface Validation
version: 1.0.0
category: analysis
tags: [visual-design, responsive, accessibility, browser-testing]
tokenBudget: 4800
priority: high
dependencies: []
cliCommand: augx-visual-design-responsive-validation
---

# Responsive Interface Validation

## Purpose

Repeatably inspect and correct a screen interface across viewport dimensions, orientations, breakpoints, input modes, and accessibility settings. This procedure does not apply viewport rules to print, film, or image-generation outputs.

## 1. Identify the target and available tools

Record the application, route, state, revision, and test data. Identify supported browsers, native targets, existing browser or UI runners, device farms, and screenshot review tools. Prefer the application's existing infrastructure.

Use the browser runner for web content. Use the existing native UI runner for iOS, Android, or desktop applications. Do not infer native or physical-device behavior from browser emulation.

If there is no application or usable runtime, validate this module's sweep plan and provide the steps below for a caller-supplied application. Mark all application-level layout and interaction results unverified.

## 2. Record the test setup

Before running, record:

- Application revision, URL or native screen, route, account state, and test data.
- Browser, operating system, runner, runner version, and device or emulator profile.
- Viewport width and height in CSS pixels for browser work.
- Device-pixel ratio separately from CSS viewport dimensions. Physical display resolution is a separate hardware or display-setting value.
- Pointer and touch capabilities, orientation, font scaling, browser zoom, and reduced-motion setting.
- Existing width and height media-query breakpoints and orientation or aspect-ratio queries.
- Container-query thresholds and the component or harness used to reach each container width.
- Known min/max widths, fixed-width regions, scroll containers, safe areas, and supported content density.

Attach the runner output and boundary screenshots. Do not include secrets or personal data in artifacts.

For this skill, a browser test resolution means viewport dimensions in CSS pixels. For example, a 390 by 844 viewport at device-pixel ratio 3 is still a 390 by 844 CSS-pixel viewport. It is not a 1170 by 2532 CSS-pixel viewport.

## 3. Inventory layout constraints

Inspect the actual application styles, design tokens, component rules, viewport metadata, native layout constraints, and existing tests. List every viewport width and height breakpoint. Include orientation and aspect-ratio conditions. Record container-query thresholds separately because a viewport sweep alone does not prove a nested component adapts at its own container boundaries.

Do not assume that conventional device labels or this module's example breakpoint numbers match the application. Choose additional test points where real content, controls, or navigation stop fitting.

## 4. Run the broad browser sweep

Use the module runner with the caller application's existing Playwright installation. It creates a deterministic sweep of long-edge values from 256 through 7680 CSS pixels at a 128-pixel default interval, with landscape and portrait pairs. It includes square, 4:3, 3:2, 16:9, 21:9, and 32:9 ratios, the 256-pixel minimum, extreme 7680 by 256 and 256 by 7680 cases, 3840 by 2160 and 2160 by 3840 4K cases, and 7680 by 4320 and 4320 by 7680 8K cases.

At every actual width and height breakpoint, the runner adds the exact value and the immediately adjacent CSS pixels below and above. Pass all breakpoints found during source inspection. Container-query boundaries need a component harness or a test that controls the component's containing block.

From the repository root, a caller with a local app and Playwright can run:

    node augment-extensions/visual-design/skills/responsive-validation/scripts/responsive-sweep.cjs --url http://127.0.0.1:3000 --width-breakpoints 480,768,1024 --height-breakpoints 600 --step 128 --out test-results/responsive-validation

Use the exact app URL, actual breakpoints, and available script path for the checkout. If Playwright is available only through a different runner, adapt the same generated viewport plan to that runner. Do not install a dependency solely to run this module's example. Use --dry-run to inspect the generated plan without a browser.

The runner records CSS viewport dimensions, device-pixel ratio 1 for the broad sweep, overflow, clipped text and controls, visible control overlap, broken images, keyboard focus evidence, reduced-motion preference emulation, touch-target candidates, and larger-text checks. It writes JSON results and screenshots for min/max, breakpoint, 4K, and 8K boundaries. Preference emulation and a 200 percent root-font-size approximation do not prove the application responds correctly. Any reported failure or review candidate must be classified against the actual product and recorded before a pass is reported.

## 5. Review measurable failures

Treat these as failures unless an evidenced, accessible exception is intentional:

- The document has horizontal overflow greater than 1 CSS pixel outside a deliberately scrollable two-dimensional region.
- Required content or controls are clipped, overlap in a way that blocks reading or operation, or leave the viewport without an operable alternative.
- A visible primary control has no usable size, label, state, or keyboard focus path.
- Text, labels, tables, or images are clipped, unreadable, distorted, or scaled independently of their surrounding content.
- A broken image or missing essential content changes the task.
- An interaction has no useful loading, success, error, or recovery feedback.

Overlap and clipping detectors can identify candidates, not judge intent. Inspect each candidate and boundary screenshot. A horizontal data table may use a labeled, keyboard-operable scroll region; that exception does not permit the page itself to scroll horizontally without need.

For each reproduced failure, state the root cause, affected state, user impact, correction, and regression assertion. Add the assertion to the application's existing test suite when the application is in scope.

## 6. Check input, accessibility, and content stress

- Navigate with the keyboard. Confirm logical order, no keyboard trap, visible focus, and access to every essential action.
- Use browser or native zoom and text scaling where supported. Confirm no content or functionality is lost. The runner's 200 percent root-font test is an approximation; it is not proof of browser zoom behavior.
- Emulate reduced motion and confirm nonessential movement is removed or reduced while state changes remain understandable.
- On touch-capable browser cases, review targets smaller than 24 CSS pixels for the WCAG 2.2 minimum-size rule and spacing exceptions. Also consider the 44 CSS pixel Level AAA enhanced target. For native work, test platform units and controls directly.
- Activate the main touch tasks in the touch-capable browser or native runner. Target-size inspection alone does not prove that gestures, hit areas, or control behavior work.
- Test long localized labels, right-to-left direction, empty and error states, large headings, data density, and image crops with realistic content.
- Check representative narrow and wide aspect ratios, portrait and landscape rotation, and short-height windows.
- Review image quality and loading at high pixel density separately from CSS viewport behavior. The runner's DPR 1 sweep does not establish high-DPR image quality.

## 7. Report evidence and limits

Report exact commands, app revision, route, browser or native environment, CSS viewport plan, breakpoints tested, screenshots reviewed, and failed or skipped checks. Separate automated results from visual review and physical-device evidence. Do not call a 128-pixel interval exhaustive; breakpoint neighbors and configured edge cases supplement that sample.

If no application or runtime was available, say so. The skill structure, viewport plan, and validators can be tested locally, but application-specific overflow, clipping, overlap, controls, keyboard focus, touch behavior, zoom, text scaling, reduced motion, localization, and 4K/8K rendering remain unverified.
