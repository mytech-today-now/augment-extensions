# Screenplay Rule Templates

This directory contains templates for creating genre, theme, and style rule files.

## Templates

### genre-template.md

Use this template when creating a new genre rule file. Each genre should include:

- **Core Rules**: 5-10 fundamental rules that define the genre
- **Guidelines**: 10-15 specific guidelines for structure, pacing, characters, tone, visuals, and dialogue
- **Common Pitfalls**: 3-5 mistakes to avoid
- **Film Examples**: 3-5 real films with specific scene references
- **Integration**: How the genre works with themes and styles
- **Best Practices**: 5+ actionable tips

**Target Depth Coverage**: 85%

### theme-template.md

Use this template when creating a new theme rule file. Each theme should include:

- **Core Rules**: 5-8 rules for thematic consistency
- **Integration Guidelines**: How to weave the theme through Acts I, II, and III
- **Character Connection**: How protagonist, antagonist, and supporting characters relate to the theme
- **Subtext Techniques**: How to convey theme through dialogue, visuals, and action
- **Film Examples**: 3-5 real films with specific thematic moments
- **Integration**: How the theme works with genres and styles
- **Best Practices**: 5+ actionable tips

**Target Depth Coverage**: 85%

### style-template.md

Use this template when creating a new narrative style rule file. Each style should include:

- **Structural Requirements**: 5-8 requirements specific to the style
- **Pacing Guidelines**: How to pace scenes and acts in this style
- **Visual Storytelling**: Camera work, visual motifs, action line approach
- **Dialogue Approach**: How dialogue functions in this style
- **Technical Formatting**: Special formatting considerations
- **Film Examples**: 3-5 real films with specific stylistic moments
- **Integration**: How the style works with genres and themes
- **Best Practices**: 5+ actionable tips

**Target Depth Coverage**: 85%

## Usage

1. **Copy the appropriate template** to the target directory (genres/rules/, themes/rules/, or styles/rules/)
2. **Rename the file** to match the feature name (e.g., `action.md`, `redemption.md`, `non-linear.md`)
3. **Fill in all sections** following the template structure
4. **Include real film examples** with specific scenes or moments
5. **Ensure 85% depth coverage** by providing comprehensive, actionable content
6. **Update the parent module.json** to include the new rule file

## Quality Standards

### Depth Coverage (85% Target)

Each rule file should be comprehensive enough that an AI agent can:
- Understand the core concept completely
- Apply the rules consistently
- Identify violations or weak applications
- Provide specific, actionable feedback
- Reference real-world examples

### Film Examples

- **Minimum**: 3 film examples per rule file
- **Recommended**: 5 film examples per rule file
- **Requirements**:
  - Include film title and year
  - Name the director
  - Describe specific scenes or moments (not just general references)
  - Explain WHY the example works
  - Identify specific techniques used

### Rules and Guidelines

- **Core Rules**: Must be specific, actionable, and enforceable
- **Guidelines**: Should provide practical advice for implementation
- **Examples**: Include both good (✅) and bad (❌) examples
- **Explanations**: Explain WHY each rule matters, not just WHAT it is

### AI Parsing

All rule files must be:
- **Structured**: Use consistent markdown formatting
- **Scannable**: Use clear headings and subheadings
- **Actionable**: Provide specific, implementable guidance
- **Comprehensive**: Cover all aspects of the feature
- **Referenced**: Include real-world examples

## Validation Checklist

Before submitting a new rule file, verify:

- [ ] All template sections are filled in
- [ ] 5-10 core rules provided (genres/styles) or 5-8 (themes)
- [ ] 10-15 guidelines provided (genres) or integration guidelines (themes/styles)
- [ ] 3-5 film examples with specific scenes
- [ ] Common pitfalls identified
- [ ] Best practices listed
- [ ] Integration with other features documented
- [ ] Depth coverage reaches 85%
- [ ] Markdown formatting is consistent
- [ ] No placeholder text remains
- [ ] File is saved in correct directory
- [ ] Parent module.json updated

## Character Count Guidelines

- **Small rule file**: < 5,000 characters
- **Medium rule file**: 5,000 - 10,000 characters
- **Large rule file**: 10,000 - 15,000 characters
- **Target**: 8,000 - 12,000 characters per rule file

This ensures comprehensive coverage while maintaining readability and AI parsing efficiency.

