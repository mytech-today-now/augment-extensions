# Migration Guide: Fountain Converter v2.0

## Overview

This guide helps you migrate from the old Fountain converter to the new **v2.0 preprocessing pipeline**.

**Old System**: Direct parsing with limited markdown handling  
**New System**: 4-stage pipeline (Preprocess → Parse → Render → Validate)

## Breaking Changes

### 1. API Changes

#### Old API (v1.x)
```typescript
import { convertFountain } from './converter';

const html = convertFountain(fountainContent);
```

#### New API (v2.0)
```typescript
import { preprocessFountain } from './preprocessor';
import { parseFountain } from './parser';
import { renderToHTML } from './renderer';

const preprocessed = preprocessFountain(fountainContent);
const parsed = parseFountain(preprocessed.content, preprocessed.characterLists);
const result = renderToHTML(parsed.elements);
```

### 2. Return Types

#### Old Return Type
```typescript
string // Just HTML
```

#### New Return Type
```typescript
{
  html: string;
  estimatedPages: number;
  lineCount: number;
}
```

### 3. CSS Changes

**Line Height**: Changed from `1.5` to `1` for accurate page length  
**Margins**: Reduced margins for all element types  
**Page Estimation**: Now uses industry-standard 55 lines/page

### 4. Character List Handling

**Old Behavior**: Character lists were sometimes classified as character names  
**New Behavior**: Preprocessor detects character lists and parser excludes them from character name detection

### 5. Markdown Handling

**Old Behavior**: Limited markdown removal  
**New Behavior**: Comprehensive markdown removal including:
- Bold (`**text**`, `__text__`)
- Italic (`*text*`, `_text_`)
- Headers (`# text`)
- Links (`[text](url)`)
- Inline code (`` `code` ``)
- Horizontal rules (`---`)

## Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
import { convertFountain } from './converter';
```

**After:**
```typescript
import { preprocessFountain } from './preprocessor';
import { parseFountain } from './parser';
import { renderToHTML } from './renderer';
import { validateConversion } from './validator';
```

### Step 2: Update Function Calls

**Before:**
```typescript
const html = convertFountain(fountainContent);
fs.writeFileSync('output.html', html);
```

**After:**
```typescript
const preprocessed = preprocessFountain(fountainContent);
const parsed = parseFountain(preprocessed.content, preprocessed.characterLists);
const result = renderToHTML(parsed.elements, { includeCSS: true });
fs.writeFileSync('output.html', result.html);
```

### Step 3: Handle New Return Values

**Before:**
```typescript
const html = convertFountain(fountainContent);
console.log('Conversion complete');
```

**After:**
```typescript
const result = renderToHTML(parsed.elements);
console.log(`Conversion complete: ${result.estimatedPages} pages, ${result.lineCount} lines`);
```

### Step 4: Add Validation (Optional)

```typescript
const validation = validateConversion(parsed.elements, result, expectedPages);
if (!validation.valid) {
  console.error('Validation failed:', validation.issues);
}
```

## Migration Examples

### Example 1: Simple Conversion

**Before (v1.x):**
```typescript
import { convertFountain } from './converter';
import * as fs from 'fs';

const content = fs.readFileSync('screenplay.fountain', 'utf-8');
const html = convertFountain(content);
fs.writeFileSync('screenplay.html', html);
```

**After (v2.0):**
```typescript
import { preprocessFountain } from './preprocessor';
import { parseFountain } from './parser';
import { renderToHTML } from './renderer';
import * as fs from 'fs';

const content = fs.readFileSync('screenplay.fountain', 'utf-8');
const preprocessed = preprocessFountain(content);
const parsed = parseFountain(preprocessed.content, preprocessed.characterLists);
const result = renderToHTML(parsed.elements, { includeCSS: true });
fs.writeFileSync('screenplay.html', result.html);
```

### Example 2: With Title Page

**Before (v1.x):**
```typescript
const html = convertFountain(content);
// Title page handling was manual
```

**After (v2.0):**
```typescript
const preprocessed = preprocessFountain(content);
const parsed = parseFountain(preprocessed.content, preprocessed.characterLists);
const result = renderToHTML(parsed.elements, { 
  includeCSS: true,
  title: preprocessed.titlePage.Title || 'Untitled'
});
```

### Example 3: With Validation

**Before (v1.x):**
```typescript
const html = convertFountain(content);
// No built-in validation
```

**After (v2.0):**
```typescript
const preprocessed = preprocessFountain(content);
const parsed = parseFountain(preprocessed.content, preprocessed.characterLists);
const result = renderToHTML(parsed.elements);
const validation = validateConversion(parsed.elements, result, 5);

if (!validation.valid) {
  console.error('Validation issues:', validation.issues);
}
```

## Known Issues and Workarounds

### Issue 1: Page Count Discrepancy

**Problem**: Page count differs from v1.x by 10-20%

**Cause**: New CSS uses line-height: 1 instead of 1.5

**Workaround**: This is expected. The new calculation is more accurate to industry standards.

### Issue 2: Character Lists

**Problem**: Character lists were classified as character names in v1.x

**Solution**: v2.0 fixes this. No workaround needed.

### Issue 3: Markdown in Output

**Problem**: v1.x sometimes left markdown syntax in output

**Solution**: v2.0 preprocessor removes all markdown. No workaround needed.

## Testing Your Migration

1. **Run existing tests**: Ensure all tests pass with new API
2. **Compare outputs**: Convert same file with v1.x and v2.0, compare results
3. **Validate page counts**: Check that page counts are within ±10% of expected
4. **Check character lists**: Verify character lists are classified as action, not character names

## Support

If you encounter issues during migration:

1. Check the [README.md](./README.md) for detailed API documentation
2. Review the [test files](./__tests__/) for usage examples
3. Run validation to identify specific issues
4. Check the troubleshooting section in README.md

## Timeline

- **v1.x**: Deprecated as of 2026-02-07
- **v2.0**: Current stable version
- **Support**: v1.x will be supported until 2026-06-01

