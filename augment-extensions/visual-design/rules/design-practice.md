# Design Practice Rules

## Start with users, goals, and evidence

- Name the users, their context, the task they need to complete, and the outcome the product needs to support.
- Separate verified requirements and research findings from assumptions. Label unknowns and give them a way to be tested.
- Choose research methods that answer the decision at hand. Use interviews or contextual inquiry to understand needs, task observation to reveal workarounds, surveys for appropriately sampled patterns, and usability tests to find interaction problems.
- Record who participated, the method, the context, the date, and the limits of the evidence. Do not invent personas, journey findings, or measured outcomes.
- Map journeys across discovery, entry, completion, recovery, and follow-up. Include service touchpoints outside the interface when they affect the outcome.
- Form a testable design hypothesis. Use usability evidence and product measures to iterate; do not treat preference votes as proof of task success.

## Shape information and language

- Group information by users' tasks and mental models. Prefer labels users recognize over internal team terminology.
- Make navigation location and available actions predictable. Provide a clear route back, visible current location, and useful empty, loading, and error states.
- Test findability with realistic tasks. When users cannot predict a label, revise the grouping or wording and test again.
- Write concise, specific labels and instructions. State what happened, what the user can do next, and how to recover from errors.
- Avoid blame, unexplained jargon, ambiguous confirmations, and color-only meaning.
- Plan localization for translation, right-to-left direction, plural rules, date and number formats, and text expansion. Do not hard-code an assumed expansion percentage.

## Design interfaces and interactions

- Establish a clear hierarchy using content order, type, spacing, alignment, and restrained emphasis. Do not use size or color as the only signal of importance.
- Define components by purpose, anatomy, variants, and states. Cover default, hover where supported, focus, pressed, selected, disabled, loading, success, empty, validation, and error states as applicable.
- Support each intended input method. Keyboard, pointer, touch, switch, voice, and assistive-technology paths must reach the same essential functions when those methods are supported.
- Give immediate, understandable feedback for actions. Prevent duplicate submissions where needed, preserve user input after recoverable errors, and describe a clear recovery path.
- Keep focus logical when content appears, moves, or closes. Return focus to the invoking control when a transient layer closes.
- Use motion to explain state or spatial relationships. It must not be the only way information is conveyed. Respect reduced-motion preferences.

## Build coherent visual and graphic language

- Define how identity, color roles, type, spacing, shape, imagery, and icons work together. Reuse patterns to signal related meaning.
- Select imagery for the content and context. Preserve useful crops, provide appropriate text alternatives for meaningful images, and keep decorative media out of the accessibility tree.
- Use a consistent icon family and optical alignment. Pair unfamiliar icons with visible labels.
- Do not distort images or rely on texture, hue, or fine detail alone to communicate meaning.
- Treat vendor palettes and domain styles in this module as starting points. Verify current vendor documentation and test the actual product states before making compliance claims.

## Connect strategy, product, and service design

- Connect interface decisions to user outcomes and product constraints. State the tradeoff when reach, cost, schedule, risk, and quality compete.
- Prioritize by user impact, evidence strength, and implementation cost. Make the chosen scope and deferred needs visible.
- Map service handoffs, support, policies, notifications, and recovery paths when the experience crosses channels or teams.
- Define how a concept will be evaluated before polishing it. Use task success, errors, time, comprehension, or other suitable measures, and report what the measure cannot show.

## Govern design systems

- Use semantic tokens for roles such as surface, text, action, border, feedback, spacing, type, and motion. Avoid using a raw palette value as a role.
- Define component ownership, supported variants, accessibility behavior, platform adaptations, and change history.
- Keep design tokens and components consistent where they express shared product meaning. Allow platform-specific components where interaction conventions differ.
- Review additions for contrast, localization, reduced motion, responsiveness, density, and future migration cost.
- Mark deprecated tokens and components, give a migration path, and remove them only after usage and consumer impact are known.

## Limit viewport rules to screen work

Responsive viewport dimensions apply to web and other screen interfaces. Print uses page size, bleed, and safe areas. Film and motion-picture design use shot and viewing context. Image generation uses prompt, aspect ratio, crop, and output constraints. Do not substitute a viewport sweep for those domain-specific checks.
