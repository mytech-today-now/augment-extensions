# AI Integration Testing Guide

## Overview

This guide covers testing AI-generated screenplays against industry standards and the screenplay module rules.

---

## Testing Checklist

### Format Validation

**Scene Headings:**
- [ ] All scene headings start with INT, EXT, or INT./EXT.
- [ ] Scene headings include location and time of day
- [ ] Blank lines before and after scene headings
- [ ] Scene headings are in ALL CAPS

**Character Names:**
- [ ] Character names are in ALL CAPS
- [ ] Character names are consistent throughout
- [ ] Extensions (O.S., V.O., CONT'D) are properly formatted
- [ ] Character names are on their own line

**Dialogue:**
- [ ] Dialogue follows character names
- [ ] Parentheticals are properly formatted
- [ ] Dialogue is natural and character-appropriate
- [ ] No overly long dialogue blocks

**Action Lines:**
- [ ] Action paragraphs are 3-4 lines maximum
- [ ] Sound effects are in ALL CAPS
- [ ] Action is visual and specific
- [ ] No camera directions (unless category-appropriate)

**Transitions:**
- [ ] Transitions are used sparingly
- [ ] Transitions are in ALL CAPS
- [ ] Transitions end with colon or period

---

## Category-Specific Validation

### AAA Hollywood Films

**Spectacle:**
- [ ] Action sequences are visually dynamic
- [ ] Set pieces are clearly described
- [ ] Visual effects notes are included where appropriate

**Pacing:**
- [ ] Fast-paced action
- [ ] Quick scene transitions
- [ ] High-stakes moments every 10-15 pages

**Structure:**
- [ ] Clear three-act structure
- [ ] Major plot points at expected page numbers
- [ ] Satisfying climax and resolution

### Independent Films

**Character Depth:**
- [ ] Complex, nuanced characters
- [ ] Character-driven plot
- [ ] Emotional authenticity

**Dialogue:**
- [ ] Natural, realistic dialogue
- [ ] Subtext and layered meaning
- [ ] Character voice consistency

**Themes:**
- [ ] Clear thematic exploration
- [ ] Meaningful character arcs
- [ ] Thought-provoking content

### TV Series

**Episode Structure:**
- [ ] Teaser/cold open (if applicable)
- [ ] Act breaks at appropriate moments
- [ ] Cliffhanger or hook at end
- [ ] Series continuity maintained

**Character Consistency:**
- [ ] Characters match established series canon
- [ ] Character development progresses logically
- [ ] Relationships evolve appropriately

**Timing:**
- [ ] Appropriate page count for format
- [ ] Pacing suitable for episode length
- [ ] Commercial breaks considered (if applicable)

---

## AI-Specific Validation

### Common AI Mistakes

**Over-Description:**
```fountain
❌ Sarah, a beautiful woman in her early thirties with long flowing brown hair 
and piercing green eyes, walks slowly and deliberately across the room, her 
footsteps echoing on the hardwood floor as she contemplates her next move.

✅ Sarah crosses the room, hesitant.
```

**Unnatural Dialogue:**
```fountain
❌ SARAH
As you know, Marcus, we have been working together for five years at the 
social services department where we both help families in need.

✅ SARAH
Five years we've been doing this.
```

**Camera Directions (unless appropriate):**
```fountain
❌ CLOSE ON Sarah's face as a single tear rolls down her cheek.

✅ A tear rolls down Sarah's face.
```

**Telling Instead of Showing:**
```fountain
❌ Sarah is sad and lonely.

✅ Sarah sits alone, staring at her phone. No messages.
```

---

## Before/After Examples

### Example 1: Over-Written Action

**Before (AI-generated):**
```fountain
INT. COFFEE SHOP - DAY

The coffee shop is bustling with activity. People are sitting at tables, 
drinking coffee and having conversations. The barista is making drinks behind 
the counter. Sarah, a woman in her thirties, enters through the front door 
and looks around the room, searching for someone. She spots Marcus sitting 
at a table in the corner and walks over to him.
```

**After (Revised):**
```fountain
INT. COFFEE SHOP - DAY

Busy. Sarah enters, scans the room.

She spots Marcus in the corner, heads over.
```

### Example 2: Unnatural Dialogue

**Before (AI-generated):**
```fountain
SARAH
Hello, Marcus. Thank you for agreeing to meet with me today. I wanted to 
discuss the case we have been working on together regarding the Rodriguez 
family and their ongoing struggles with addiction.

MARCUS
Of course, Sarah. I am always happy to discuss our cases with you. What 
specifically did you want to talk about?
```

**After (Revised):**
```fountain
SARAH
Thanks for meeting me.

MARCUS
Of course. What's up?

SARAH
It's the Rodriguez case. I'm worried.
```

### Example 3: Character Inconsistency

**Before (AI-generated):**
```fountain
SARAH
(cheerfully)
Everything's great! I love my job and I'm so happy!
```

**After (Revised - consistent with character):**
```fountain
SARAH
(deflecting)
I'm fine. Let's focus on the case.
```

---

## Validation Tools

### Automated Checks

**Format Validation:**
- Better Fountain (VS Code) - syntax checking
- Highland 2 - format validation
- Fade In - industry standard checking

**Character Consistency:**
- Search for character name variations
- Check dialogue patterns
- Verify character voice

**Page Count:**
- Target: 1 page = 1 minute screen time
- Feature film: 90-120 pages
- TV hour: 50-60 pages
- TV half-hour: 25-35 pages

### Manual Review

**Read Aloud:**
- Dialogue should sound natural
- Action should be clear and visual
- Pacing should feel right

**Character Voice:**
- Each character should sound distinct
- Dialogue should match character background
- Consistency throughout screenplay

**Visual Clarity:**
- Can you "see" the scene?
- Is action clear and specific?
- Are visuals compelling?

---

## Industry Standards Compliance

### AMPAS (Academy) Standards

**Formatting:**
- Courier 12pt font
- 1.5" left margin, 1" other margins
- Scene headings in ALL CAPS
- Character names in ALL CAPS
- Proper spacing between elements

**Page Count:**
- Feature film: 90-120 pages
- One page = approximately one minute

**Title Page:**
- Title centered
- Author credit
- Contact information
- Draft date

### BBC Standards (for UK productions)

**Formatting:**
- Similar to AMPAS with minor variations
- A4 paper size (vs. US Letter)
- Slightly different margin specifications

**Style:**
- British spelling and terminology
- Cultural considerations
- Regional dialects noted

---

## Quality Metrics

### Excellent AI-Generated Screenplay

- [ ] Formatting is 100% compliant
- [ ] Dialogue sounds natural when read aloud
- [ ] Characters are distinct and consistent
- [ ] Action is visual and specific
- [ ] Pacing is appropriate for category
- [ ] Structure follows established beats
- [ ] No camera directions (unless appropriate)
- [ ] No over-description
- [ ] Theme is clear and explored
- [ ] Emotional beats land effectively

### Needs Revision

- [ ] Formatting errors present
- [ ] Dialogue sounds artificial
- [ ] Characters lack distinction
- [ ] Action is vague or over-written
- [ ] Pacing issues
- [ ] Structure problems
- [ ] Excessive camera directions
- [ ] Over-description
- [ ] Unclear theme
- [ ] Emotional beats don't land

---

## Testing Workflow

1. **Generate screenplay** using AI with module rules
2. **Automated validation** using Better Fountain or similar
3. **Manual review** against checklist
4. **Category-specific validation** 
5. **Read aloud test** for dialogue
6. **Revision** based on findings
7. **Final validation** before export

---

## Resources

- AMPAS Screenplay Format Guide
- BBC Writers' Room Format Guide
- Better Fountain Documentation
- Industry Standard Screenplay Examples

