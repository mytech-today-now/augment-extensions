## ADDED Requirements

### Requirement: Discoverable visual design guidance

The Visual Design module MUST provide indexed rules, guidelines, and task skills with metadata paths that resolve to checked-in files. Its coverage map MUST link basic, intermediate, and advanced guidance for general design, color, typography, and layout, and MUST identify the applicable levels for supporting design and platform areas.

#### Scenario: Discover a task guide

- GIVEN a consumer has linked the Visual Design module
- WHEN the consumer opens its guidance index
- THEN the index MUST direct the consumer to relevant rules, levels, and task skills

#### Scenario: Validate module references

- GIVEN module.json and metadata.json declare the Visual Design guidance
- WHEN the module guidance validator runs
- THEN it MUST report missing files, malformed guidance configuration, mismatched guidance lists, and broken local links

### Requirement: Evidence-aware responsive validation

The responsive validation skill MUST define browser viewport dimensions in CSS pixels and distinguish them from device-pixel ratio and physical display resolution. Its runner MUST plan landscape and portrait cases with long edges from 256 through 7680 pixels, supported aspect ratios, representative 4K and 8K cases, and exact plus adjacent-pixel cases for actual width and height breakpoints.

#### Scenario: Inspect responsive viewport coverage

- GIVEN actual width and height breakpoints are supplied
- WHEN the runner creates a viewport plan
- THEN the plan MUST include each breakpoint and the immediately adjacent CSS pixel below and above it
- AND MUST include minimum, maximum, portrait, landscape, 4K, and 8K cases

#### Scenario: Separate automated findings from product evidence

- GIVEN no consuming application or usable runtime is available
- WHEN the module guidance and runner are validated
- THEN the result MUST be limited to metadata, links, plan generation, and synthetic metric classification
- AND MUST leave application behavior unverified
