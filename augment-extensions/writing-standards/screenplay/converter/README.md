# Fountain to HTML Converter

## Overview

A robust, industry-standard Fountain screenplay converter with preprocessing, context-aware parsing, HTML rendering, and comprehensive validation.

**Key Features:**
- ✅ **Preprocessing Pipeline** - Removes markdown, normalizes whitespace, detects character lists
- ✅ **Context-Aware Parsing** - Intelligent element detection with lookahead/lookbehind
- ✅ **Accurate Page Length** - Industry-standard 55 lines/page estimation
- ✅ **HTML Rendering** - Clean, well-formatted HTML with embedded CSS
- ✅ **Validation Layer** - Page length, classification, heuristic, and HTML quality checks

## Architecture

### Conversion Pipeline

```
Fountain File
    ↓
[1. Preprocessor] → Remove markdown, normalize whitespace, detect character lists
    ↓
[2. Parser] → Context-aware element classification
    ↓
[3. Renderer] → Generate HTML with industry-standard CSS
    ↓
[4. Validator] → Validate output quality
    ↓
HTML Output
```

## Components

### 1. Preprocessor (`preprocessor.ts`)

**Purpose**: Clean fountain files before parsing

**Features:**
- **Markdown Removal**: Strips `**bold**`, `*italic*`, `# headers`, `[links](url)`, `` `code` ``
- **Whitespace Normalization**: Removes trailing spaces, normalizes line breaks
- **Comment Removal**: Removes `[[notes]]` and `/* boneyard */` sections
- **Character List Detection**: Identifies bullet-point character lists
- **Title Page Extraction**: Extracts and parses title page metadata

**Usage:**
```typescript
import { preprocessFountain } from './preprocessor';

const result = preprocessFountain(fountainContent);
console.log(result.content); // Cleaned content
console.log(result.titlePage); // { Title: "...", Author: "..." }
console.log(result.characterLists); // Detected character lists
```

### 2. Parser (`parser.ts`)

**Purpose**: Parse preprocessed content into structured elements

**Features:**
- **Context-Aware Detection**: Uses lookahead/lookbehind for accurate classification
- **Character List Handling**: Prevents false character name detection in lists
- **Element Types**: Scene headings, action, character, dialogue, parenthetical, transition, centered
- **Metadata Tracking**: Line numbers, element counts, context information

**Usage:**
```typescript
import { parseFountain } from './parser';

const parsed = parseFountain(preprocessed.content, preprocessed.characterLists);
console.log(parsed.elements); // Array of FountainElement
console.log(parsed.metadata.elementCounts); // { scene_heading: 5, action: 20, ... }
```

### 3. Renderer (`renderer.ts`)

**Purpose**: Generate HTML from parsed elements

**Features:**
- **Industry-Standard CSS**: Courier 12pt, proper margins, reduced line-height
- **Page Length Estimation**: 55 lines/page industry standard
- **Action Emphasis**: Emphasizes sound effects (ALL CAPS words)
- **Clean HTML**: Well-formed, semantic HTML5

**Usage:**
```typescript
import { renderToHTML } from './renderer';

const result = renderToHTML(parsed.elements, { 
  includeCSS: true, 
  title: "My Screenplay" 
});
console.log(result.html); // Complete HTML document
console.log(result.estimatedPages); // ~5 pages
console.log(result.lineCount); // Total lines rendered
```

### 4. Validator (`validator.ts`)

**Purpose**: Validate conversion quality

**Features:**
- **Page Length Validation**: Checks against expected page count (±10% tolerance)
- **Element Classification**: Verifies proper element type distribution
- **Heuristic Validation**: Checks for common parsing errors
- **HTML Quality**: Validates well-formed HTML structure

**Usage:**
```typescript
import { validateConversion } from './validator';

const report = validateConversion(parsed.elements, renderResult, 5); // Expected 5 pages
console.log(report.valid); // true/false
console.log(report.issues); // Array of ValidationIssue
console.log(report.summary); // { totalIssues, errors, warnings, infos }
```

## Complete Example

```typescript
import { preprocessFountain } from './preprocessor';
import { parseFountain } from './parser';
import { renderToHTML } from './renderer';
import { validateConversion } from './validator';
import * as fs from 'fs';

// Read fountain file
const fountainContent = fs.readFileSync('screenplay.fountain', 'utf-8');

// 1. Preprocess
const preprocessed = preprocessFountain(fountainContent);

// 2. Parse
const parsed = parseFountain(preprocessed.content, preprocessed.characterLists);

// 3. Render
const rendered = renderToHTML(parsed.elements, { 
  includeCSS: true, 
  title: preprocessed.titlePage.Title || 'Untitled' 
});

// 4. Validate
const validation = validateConversion(parsed.elements, rendered, 5);

// Output results
console.log(`Estimated Pages: ${rendered.estimatedPages}`);
console.log(`Validation: ${validation.valid ? 'PASSED' : 'FAILED'}`);
console.log(`Issues: ${validation.summary.totalIssues}`);

// Save HTML
fs.writeFileSync('screenplay.html', rendered.html);
```

## Testing

Run the test suite:

```bash
npm test -- converter
```

Test files:
- `__tests__/preprocessor.test.ts` - Preprocessing tests
- `__tests__/parser.test.ts` - Parser tests
- `__tests__/renderer.test.ts` - Renderer tests
- `__tests__/validator.test.ts` - Validator tests

## Troubleshooting

### Character Lists Detected as Character Names

**Problem**: Bullet-point character lists are being classified as character names

**Solution**: The preprocessor now detects character lists and marks them. The parser uses this information to prevent false positives.

### Page Count Too High/Low

**Problem**: Estimated page count doesn't match expectations

**Solution**: 
- Check for excessive whitespace in source
- Verify CSS line-height is set to 1 (not 1.5)
- Ensure 55 lines/page calculation is used
- Review action/dialogue ratio

### Markdown Syntax in Output

**Problem**: Markdown syntax (`**bold**`, `*italic*`) appears in HTML

**Solution**: Ensure preprocessor is run before parser. The preprocessor removes all markdown syntax.

### False Character Name Detection

**Problem**: Action lines are being classified as character names

**Solution**: Parser uses context-aware detection with:
- Lookahead for dialogue/parenthetical
- Character list exclusion
- Bullet point detection
- Previous element context

## References

- [Fountain Syntax](https://fountain.io/syntax)
- [Industry Page Length Standards](https://www.scriptreaderpro.com/screenplay-format/)
- [AMPAS Formatting Guidelines](https://www.oscars.org/nicholl/formatting)

