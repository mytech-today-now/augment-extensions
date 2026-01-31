# VS Code Integration for Screenplay Writing

## Overview

This guide covers integrating screenplay writing tools with Visual Studio Code for professional screenplay development.

---

## Better Fountain Extension

### Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Better Fountain"
4. Install the extension by Piers Deseilligny

### Features

**Syntax Highlighting**
- Automatic syntax highlighting for .fountain files
- Color-coded scene headings, character names, dialogue, action
- Parentheticals and transitions clearly marked

**Live Preview**
- Real-time PDF preview of screenplay
- Side-by-side editing and preview
- Automatic page count and timing

**Auto-Completion**
- Character name auto-completion
- Scene heading suggestions
- Transition shortcuts

**Export Options**
- Export to PDF (industry-standard formatting)
- Export to HTML
- Export to Final Draft (.fdx)

### Configuration

Add to your `.vscode/settings.json`:

```json
{
  "fountain.general.previewTheme": "paper",
  "fountain.general.previewTexture": true,
  "fountain.pdf.emboldenSceneHeaders": true,
  "fountain.pdf.showPageNumbers": true,
  "fountain.pdf.splitDialog": true,
  "fountain.pdf.printTitlePage": true,
  "fountain.pdf.printProfile": "a4",
  "fountain.general.parentheticalNewLine": false,
  "fountain.general.numberSections": false,
  "fountain.general.showPageNumbers": true
}
```

---

## Fountain Format Basics

### Scene Headings

```fountain
INT. COFFEE SHOP - DAY

EXT. CITY STREET - NIGHT

INT./EXT. CAR - MOVING - DAY
```

**Rules:**
- Must start with INT, EXT, or INT./EXT.
- Followed by location
- End with time of day
- Blank line before and after

### Character Names

```fountain
SARAH
This is dialogue.

MARCUS (O.S.)
This is off-screen dialogue.

NARRATOR (V.O.)
This is voice-over.
```

**Rules:**
- All caps
- Centered automatically
- Extensions in parentheses: (O.S.), (V.O.), (CONT'D)

### Dialogue

```fountain
SARAH
I can't believe this is happening.

MARCUS
(concerned)
Are you okay?
```

**Rules:**
- Character name on its own line
- Dialogue below character name
- Parentheticals for direction/emotion

### Action/Description

```fountain
Sarah walks to the window, staring out at the rain.

The phone RINGS. She doesn't answer.
```

**Rules:**
- Regular text (not all caps unless emphasizing)
- Sound effects in ALL CAPS
- Keep paragraphs short (3-4 lines max)

### Transitions

```fountain
CUT TO:

FADE OUT.

DISSOLVE TO:
```

**Rules:**
- Right-aligned (automatic in Fountain)
- End with colon or period
- Use sparingly

---

## Keyboard Shortcuts

### Better Fountain Shortcuts

- **Ctrl+Shift+P** (Cmd+Shift+P): Command palette
  - "Fountain: Show Preview" - Open live preview
  - "Fountain: Export PDF" - Export to PDF
  - "Fountain: Statistics" - Show word count, page count, etc.

### Custom Snippets

Add to your user snippets (File > Preferences > User Snippets > fountain.json):

```json
{
  "Scene Heading INT": {
    "prefix": "int",
    "body": [
      "INT. ${1:LOCATION} - ${2:DAY}",
      "",
      "$0"
    ]
  },
  "Scene Heading EXT": {
    "prefix": "ext",
    "body": [
      "EXT. ${1:LOCATION} - ${2:DAY}",
      "",
      "$0"
    ]
  },
  "Character Dialogue": {
    "prefix": "char",
    "body": [
      "${1:CHARACTER}",
      "${2:Dialogue}",
      "",
      "$0"
    ]
  }
}
```

---

## Export Workflow

### PDF Export

1. Open .fountain file
2. Cmd/Ctrl+Shift+P
3. Type "Fountain: Export PDF"
4. Choose location and filename
5. PDF generated with industry-standard formatting

### Final Draft Export

1. Open .fountain file
2. Cmd/Ctrl+Shift+P
3. Type "Fountain: Export to Final Draft"
4. .fdx file created
5. Open in Final Draft for further editing

---

## Project Structure

Recommended folder structure for screenplay projects:

```
my-screenplay/
├── screenplay.fountain          # Main screenplay
├── characters/
│   ├── sarah-profile.yaml
│   ├── marcus-profile.yaml
│   └── elena-profile.yaml
├── planning/
│   ├── beat-sheet.yaml
│   ├── plot-outline.yaml
│   └── trope-inventory.yaml
├── exports/
│   ├── screenplay-draft-1.pdf
│   └── screenplay-draft-2.pdf
└── .vscode/
    └── settings.json
```

---

## Tips for VS Code Screenplay Writing

**Use Multi-Cursor Editing**
- Alt+Click to add cursors
- Useful for formatting multiple character names

**Use Find and Replace**
- Ctrl+H (Cmd+H) for find/replace
- Useful for character name changes

**Use Outline View**
- View > Outline
- Shows scene structure
- Quick navigation between scenes

**Use Zen Mode**
- View > Appearance > Zen Mode
- Distraction-free writing
- Toggle with Ctrl+K Z (Cmd+K Z)

---

## Troubleshooting

**Preview not showing:**
- Ensure Better Fountain extension is installed
- Try reloading window (Ctrl+Shift+P > "Reload Window")

**Export not working:**
- Check file permissions
- Ensure output directory exists
- Try exporting to different location

**Formatting issues:**
- Check Fountain syntax
- Ensure blank lines between elements
- Verify scene headings start with INT/EXT

---

## Additional Resources

- Better Fountain Documentation: https://github.com/piersdeseilligny/betterfountain
- Fountain Syntax: https://fountain.io/syntax
- VS Code Documentation: https://code.visualstudio.com/docs

