# Fountain Format Specification

## Overview

Fountain is a plain text markup language for writing screenplays. It's designed to be human-readable while allowing conversion to industry-standard screenplay formats.

---

## Core Syntax

### Title Page

```fountain
Title: The Weight We Carry
Credit: Written by
Author: Jane Doe
Draft date: 01/31/2026
Contact:
    Jane Doe
    jane@example.com
    555-1234
```

**Rules:**
- Must be at the top of the document
- Key: Value format
- Separated from screenplay by `===` or blank lines

### Scene Headings

```fountain
INT. COFFEE SHOP - DAY

EXT. CITY STREET - NIGHT

INT./EXT. CAR - MOVING - DAY
```

**Requirements:**
- Start with: INT, EXT, INT./EXT, INT/EXT, I/E
- Can include: LOCATION - TIME
- Must have blank line before and after
- Automatically formatted as scene headings

**Force Scene Heading:**
```fountain
.FLASHBACK - 10 YEARS EARLIER
```
Use `.` prefix to force any line as scene heading.

### Action/Description

```fountain
Sarah walks to the window, her reflection staring back at her.

The phone RINGS. She ignores it.

A beat. Then she picks it up.
```

**Rules:**
- Regular text (not all caps)
- Sound effects in ALL CAPS
- Keep paragraphs short (3-4 lines)
- Blank line between paragraphs

**Centered Text:**
```fountain
> FADE IN: <
```
Use `>` and `<` to center text.

### Character Names

```fountain
SARAH
This is dialogue.

MARCUS (O.S.)
This is off-screen dialogue.

NARRATOR (V.O.)
This is voice-over.

SARAH (CONT'D)
Continuing dialogue after action.
```

**Rules:**
- All caps
- On its own line
- Extensions: (O.S.), (V.O.), (CONT'D), (SUBTITLE), etc.

**Force Character:**
```fountain
@SARAH
```
Use `@` prefix to force character name (useful for lowercase names).

### Dialogue

```fountain
SARAH
I can't believe this is happening.

MARCUS
(concerned)
Are you okay?

SARAH
(beat)
I don't know.
```

**Rules:**
- Follows character name
- Parentheticals for direction/emotion
- Keep natural and concise

### Parentheticals

```fountain
SARAH
(to Marcus)
I need to tell you something.

MARCUS
(nervous)
What is it?
```

**Rules:**
- Wrapped in parentheses
- Lowercase (except proper nouns)
- Brief direction or emotion
- On separate line or inline

### Transitions

```fountain
CUT TO:

FADE OUT.

DISSOLVE TO:

SMASH CUT TO:
```

**Rules:**
- Right-aligned (automatic)
- All caps
- End with colon or period

**Force Transition:**
```fountain
> FADE TO BLACK
```
Use `>` prefix to force transition.

---

## Advanced Formatting

### Dual Dialogue

```fountain
SARAH ^
This is happening at the same time.

MARCUS ^
As this dialogue.
```

Use `^` after character name for dual dialogue.

### Lyrics

```fountain
~I'm singing in the rain
~Just singing in the rain
```

Use `~` prefix for lyrics (italicized).

### Notes

```fountain
[[This is a note that won't appear in the output]]
```

Use `[[ ]]` for notes to yourself.

### Boneyard (Comments)

```fountain
/* This entire section is commented out
and won't appear in the output

SARAH
This dialogue is hidden.
*/
```

Use `/* */` for multi-line comments.

### Emphasis

```fountain
*italic text*
**bold text**
***bold italic text***
_underline_
```

### Page Breaks

```fountain
====
```

Use `====` to force a page break.

### Sections and Synopses

```fountain
# Act 1

## Scene 1

= Sarah meets Marcus for the first time.

INT. COFFEE SHOP - DAY
```

- `#` for sections (outline structure)
- `=` for synopses (scene summaries)

---

## Best Practices

### Scene Headings

**DO:**
```fountain
INT. SARAH'S APARTMENT - NIGHT

EXT. CITY STREET - DAY

INT./EXT. CAR - MOVING - DUSK
```

**DON'T:**
```fountain
int. sarah's apartment - night  (not all caps)
INT SARAH'S APARTMENT NIGHT     (missing hyphens)
SARAH'S APARTMENT               (missing INT/EXT)
```

### Character Names

**DO:**
```fountain
SARAH
MARCUS (O.S.)
NARRATOR (V.O.)
```

**DON'T:**
```fountain
Sarah           (not all caps)
SARAH(O.S.)     (no space before parenthesis)
sarah (o.s.)    (not all caps)
```

### Dialogue

**DO:**
```fountain
SARAH
I can't do this anymore.

MARCUS
(gently)
Yes, you can.
```

**DON'T:**
```fountain
SARAH
I can't do this anymore. I'm done. I'm leaving. This is too much.
(Long, unbroken dialogue - break into multiple lines or beats)
```

### Action Lines

**DO:**
```fountain
Sarah walks to the window.

She stares out at the rain.

A beat.

She turns back to Marcus.
```

**DON'T:**
```fountain
Sarah walks to the window and stares out at the rain for a long moment before turning back to Marcus with tears in her eyes.
(Too long - break into shorter paragraphs)
```

---

## Conversion Tools

### Fountain to PDF
- Better Fountain (VS Code)
- Highland 2
- Fade In
- WriterSolo

### Fountain to Final Draft
- Better Fountain (VS Code)
- Highland 2
- Fountain.io online converter

### Final Draft to Fountain
- Highland 2
- Fountain.io online converter

---

## Common Mistakes

**Missing Blank Lines:**
```fountain
INT. COFFEE SHOP - DAY
Sarah enters.  ❌

INT. COFFEE SHOP - DAY

Sarah enters.  ✅
```

**Incorrect Character Format:**
```fountain
Sarah:  ❌
This is dialogue.

SARAH  ✅
This is dialogue.
```

**Action in All Caps:**
```fountain
SARAH WALKS TO THE WINDOW.  ❌

Sarah walks to the window.  ✅
```

---

## Resources

- Official Fountain Syntax: https://fountain.io/syntax
- Fountain Apps: https://fountain.io/apps
- Better Fountain: https://github.com/piersdeseilligny/betterfountain
- Fountain Samples: https://fountain.io/samples

