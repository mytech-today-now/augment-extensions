# Screenplay Formatting Validation

## Overview

This guide provides comprehensive validation rules for screenplay formatting against AMPAS (Academy of Motion Picture Arts and Sciences) standards.

---

## AMPAS Formatting Standards

### Page Setup

**Paper Size:** US Letter (8.5" x 11")

**Margins:**
- Top: 1.0"
- Bottom: 0.5" - 1.0"
- Left: 1.5"
- Right: 1.0"

**Font:**
- Courier or Courier New
- 12 point
- Fixed-width (monospace)

**Line Spacing:**
- Single-spaced within elements
- Double-spaced between elements

---

## Element Formatting

### Scene Headings

**Format:**
```
INT. LOCATION - TIME
```

**Specifications:**
- Left margin: 1.5"
- All caps
- Blank line before and after
- Must start with: INT, EXT, INT./EXT, I/E

**Examples:**
```fountain
INT. COFFEE SHOP - DAY

EXT. CITY STREET - NIGHT

INT./EXT. CAR - MOVING - DUSK
```

**Validation:**
- [ ] Starts with INT, EXT, or variant
- [ ] All caps
- [ ] Includes location
- [ ] Includes time of day
- [ ] Blank line before
- [ ] Blank line after

### Action/Description

**Specifications:**
- Left margin: 1.5"
- Right margin: 1.0"
- Width: 6.0"
- Mixed case (except sound effects)
- Blank line before and after

**Examples:**
```fountain
Sarah walks to the window.

The phone RINGS.

She doesn't answer.
```

**Validation:**
- [ ] Left-aligned
- [ ] Proper margins
- [ ] Sound effects in caps
- [ ] Paragraphs 3-4 lines max
- [ ] Blank line between paragraphs

### Character Names

**Specifications:**
- Left margin: 3.7"
- All caps
- Extensions in parentheses
- Blank line before (from action)

**Examples:**
```fountain
SARAH

MARCUS (O.S.)

NARRATOR (V.O.)

SARAH (CONT'D)
```

**Validation:**
- [ ] All caps
- [ ] Proper indentation (3.7")
- [ ] Extensions formatted correctly
- [ ] Consistent throughout screenplay

### Dialogue

**Specifications:**
- Left margin: 2.5"
- Right margin: 2.5"
- Width: 3.5"
- Mixed case
- No blank line after character name

**Examples:**
```fountain
SARAH
I can't believe this is happening.
```

**Validation:**
- [ ] Proper margins (2.5" left, 2.5" right)
- [ ] Follows character name immediately
- [ ] Natural language
- [ ] Appropriate length

### Parentheticals

**Specifications:**
- Left margin: 3.1"
- Right margin: 3.5"
- Wrapped in parentheses
- Lowercase (except proper nouns)

**Examples:**
```fountain
SARAH
(to Marcus)
I need to tell you something.

MARCUS
(nervous)
What is it?
```

**Validation:**
- [ ] Proper indentation (3.1")
- [ ] Wrapped in parentheses
- [ ] Lowercase
- [ ] Brief (2-3 words ideal)

### Transitions

**Specifications:**
- Right-aligned (6.0" from left)
- All caps
- End with colon or period
- Blank line before and after

**Examples:**
```fountain
CUT TO:

FADE OUT.

DISSOLVE TO:
```

**Validation:**
- [ ] Right-aligned
- [ ] All caps
- [ ] Proper punctuation
- [ ] Used sparingly

---

## Page Count Standards

### Feature Films

**Target:** 90-120 pages
- 90-100 pages: Tight, fast-paced
- 100-110 pages: Standard
- 110-120 pages: Epic, complex

**Rule of Thumb:** 1 page = 1 minute screen time

### Television

**One-Hour Drama:** 50-60 pages
- Network: 50-55 pages (with commercials)
- Cable/Streaming: 55-60 pages

**Half-Hour Comedy:** 25-35 pages
- Network: 25-30 pages (with commercials)
- Cable/Streaming: 30-35 pages

**Half-Hour Drama:** 30-40 pages

---

## Title Page Format

**Required Elements:**
```
                    TITLE
                (all caps, centered)


              Written by
           (centered, lowercase)


               Author Name
              (centered, mixed case)


                                        Contact Info
                                        (bottom right)
                                        
                                        Draft Date
                                        (bottom right)
```

**Validation:**
- [ ] Title centered and in caps
- [ ] "Written by" centered
- [ ] Author name centered
- [ ] Contact info bottom right
- [ ] Draft date included

---

## Common Formatting Errors

### Scene Headings

**❌ Incorrect:**
```
int. coffee shop - day          (not all caps)
INT COFFEE SHOP DAY             (missing hyphens)
COFFEE SHOP - DAY               (missing INT/EXT)
INT. COFFEE SHOP                (missing time)
```

**✅ Correct:**
```
INT. COFFEE SHOP - DAY
```

### Character Names

**❌ Incorrect:**
```
Sarah                           (not all caps)
SARAH(O.S.)                     (no space)
sarah (o.s.)                    (not all caps)
```

**✅ Correct:**
```
SARAH
SARAH (O.S.)
```

### Dialogue

**❌ Incorrect:**
```
SARAH: I can't do this.         (colon after name)

SARAH
    I can't do this.            (indented)
```

**✅ Correct:**
```
SARAH
I can't do this.
```

### Action

**❌ Incorrect:**
```
SARAH WALKS TO THE WINDOW.      (all caps)

Sarah walks to the window and stares out at the rain for a long moment 
before turning back to Marcus with tears streaming down her face as she 
contemplates what to say next.  (too long)
```

**✅ Correct:**
```
Sarah walks to the window.

She stares out at the rain.

A beat.

She turns back to Marcus, tears in her eyes.
```

---

## Validation Checklist

### Overall Format

- [ ] Courier 12pt font
- [ ] Proper margins (1.5" left, 1" right/top/bottom)
- [ ] US Letter paper size
- [ ] Single-spaced within elements
- [ ] Double-spaced between elements

### Scene Headings

- [ ] All caps
- [ ] Start with INT/EXT
- [ ] Include location and time
- [ ] Blank lines before and after

### Characters and Dialogue

- [ ] Character names all caps
- [ ] Proper indentation
- [ ] Natural dialogue
- [ ] Parentheticals formatted correctly

### Action

- [ ] Mixed case (except sound effects)
- [ ] Short paragraphs (3-4 lines)
- [ ] Visual and specific
- [ ] No camera directions (unless appropriate)

### Page Count

- [ ] Appropriate for format
- [ ] Approximately 1 page = 1 minute

### Title Page

- [ ] Properly formatted
- [ ] All required information
- [ ] Professional appearance

---

## Automated Validation Tools

**Better Fountain (VS Code):**
- Real-time syntax checking
- Format validation
- Page count tracking

**Highland 2:**
- Industry-standard formatting
- Automatic validation
- Export to multiple formats

**Fade In:**
- Professional formatting
- Validation against industry standards
- Collaboration features

---

## Manual Validation Process

1. **Visual Inspection:**
   - Check overall appearance
   - Verify consistent formatting
   - Look for obvious errors

2. **Element-by-Element Review:**
   - Scene headings
   - Character names
   - Dialogue
   - Action
   - Transitions

3. **Page Count Check:**
   - Verify appropriate length
   - Check pacing (1 page = 1 minute)

4. **Read-Through:**
   - Read entire screenplay
   - Note formatting inconsistencies
   - Mark areas for revision

5. **Final Validation:**
   - Run automated tools
   - Manual checklist review
   - Professional appearance check

---

## Resources

- AMPAS Screenplay Format Guide
- The Hollywood Standard by Christopher Riley
- Better Fountain Documentation
- Industry Standard Examples

