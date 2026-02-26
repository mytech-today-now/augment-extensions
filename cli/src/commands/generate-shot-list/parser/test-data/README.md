# Test Data Fixtures

This directory contains test screenplay files in various formats for parser testing.

## Available Fixtures

### simple-scene.fdx
Final Draft XML format with 2 scenes:
- INT. COFFEE SHOP - DAY (with dialogue)
- EXT. STREET - NIGHT (with action)

### simple-scene.rtf
RTF format with the same 2-scene screenplay.

### simple-scene.docx (TODO)
DOCX format - needs to be created manually using Microsoft Word or LibreOffice:
1. Create a new document
2. Add the following content:
   ```
   INT. COFFEE SHOP - DAY
   
   SARAH, 30s, enters carrying a laptop. She scans the room.
   
   SARAH
   (to barista)
   Large coffee, please.
   
   The BARISTA nods and starts making the drink.
   
   EXT. STREET - NIGHT
   
   JOHN walks alone, hands in pockets.
   ```
3. Save as simple-scene.docx

### simple-scene.pdf (TODO)
PDF format - needs to be created manually:
1. Create the same content as above in a text editor
2. Print/export to PDF as simple-scene.pdf

## Content Template

All test files should contain the same 2-scene screenplay:

**Scene 1: INT. COFFEE SHOP - DAY**
- Action: SARAH, 30s, enters carrying a laptop. She scans the room.
- Character: SARAH
- Parenthetical: (to barista)
- Dialogue: Large coffee, please.
- Action: The BARISTA nods and starts making the drink.

**Scene 2: EXT. STREET - NIGHT**
- Action: JOHN walks alone, hands in pockets.

## Usage

These fixtures are used by the parser integration tests to verify that each parser can correctly extract screenplay structure from its respective format.

