---
id: visual-design-review
name: Visual Design Review
version: 1.0.0
category: analysis
tags: [visual-design, accessibility, ux, responsive]
tokenBudget: 2600
priority: high
dependencies: []
cliCommand: augx-visual-design-review
---

# Visual Design Review

## Purpose

Review a design or implementation against user goals, available evidence, applicable requirements, product patterns, and the right platform constraints.

## Usage

1. Record the reviewed artifact, revision, route or screen, platforms, input methods, and available evidence.
2. Identify user goals, product constraints, relevant accessibility target, established design system, and any missing information.
3. Walk a realistic user journey through entry, normal use, loading, empty, error, recovery, completion, and interruption states.
4. Review information grouping, labels, navigation, hierarchy, color, typography, spacing, imagery, iconography, and content density.
5. Operate the experience with supported keyboard, pointer, touch, and assistive-technology paths. Inspect focus order, focus visibility, names, roles, values, errors, and status feedback.
6. Check theme, larger text, zoom, reduced motion, localization, orientation, and responsive behavior where applicable. Use the [responsive validation skill](responsive-validation/SKILL.md) for screen interfaces.
7. Separate reproduced failures from risks and questions. For each finding, name the affected state, evidence, user impact, likely cause, correction, and regression check.
8. Do not claim conformance, usability, research, or device coverage that the available evidence does not support.

## Finding format

- **Area and state**: the component, route, or journey step.
- **Evidence**: observed behavior and how it was reproduced.
- **Impact**: the task or user need that is affected.
- **Cause**: the implementation or design decision supported by evidence.
- **Correction**: a focused change that fits product and platform constraints.
- **Regression check**: an observable assertion or repeatable manual step.
- **Status**: verified, needs review, unverified, or out of scope.
