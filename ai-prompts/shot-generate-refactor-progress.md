# Shot List Generator Refactor Progress - bd-f582

## Status: IN PROGRESS (3 of 12 requirements complete)

### Completed Requirements ✅

#### 1. Default Output Behavior ✅
**Status:** COMPLETE  
**Files Modified:**
- `cli/src/commands/generate-shot-list.ts` (lines 223-255)

**Implementation:**
- When `--output` is not provided, automatically generates output filename: `<input-filename>-ai-shot-list.<extension>`
- Uses `formatter.getExtension()` to determine correct file extension
- Respects explicit `--output` when provided

**Testing:**
```bash
# Test default output
augx generate-shot-list --path screenplay.fountain
# Should create: screenplay-ai-shot-list.md

# Test explicit output
augx generate-shot-list --path screenplay.fountain --output custom-name.md
# Should create: custom-name.md
```

#### 3. Duration Formatting ✅
**Status:** COMPLETE  
**Files Modified:**
- `cli/src/commands/generate-shot-list/formatter/markdown-formatter.ts` (lines 40, 42)

**Implementation:**
- All durations now use `formatTime()` which outputs MM:SS format
- Total Duration: Uses MM:SS format
- Average Shot Length: Uses MM:SS format
- Individual shot durations: Already using MM:SS format

**Note:** The `formatTime()` method in `base-formatter.ts` already rounds to whole seconds, so no additional rounding needed.

#### 6. Simplified Character Count Display ✅
**Status:** COMPLETE  
**Files Modified:**
- `cli/src/commands/generate-shot-list/formatter/markdown-formatter.ts` (line 100)

**Implementation:**
- Changed from `145 / 200` to `145/200` (removed spaces)
- Kept percentage and status indicator for clarity
- Format: `145/200 (72%) 🟢`

### In Progress Requirements 🚧

#### Type Definitions Updated ✅
**Files Modified:**
- `cli/src/commands/generate-shot-list/generator/types.ts`

**Changes:**
- Added `VisualStyle` type: `'Reality' | 'Animation' | 'CGI' | 'Hybrid'`
- Updated `ShotMetadata.visualStyle` to be mandatory `VisualStyle` type (was optional string)
- Updated `Shot.number` to support string for sub-shots (e.g., "3a", "3b")
- Added `Shot.dialogue` as mandatory string field
- Added `CharacterState.wardrobe` and `CharacterState.physicalAppearance` fields

### Remaining Requirements (9 of 12) 📋

#### 2. Intelligent Shot Splitting for Long Durations ⏳
**Estimated Effort:** 5 hours  
**Priority:** HIGH  
**Dependencies:** None

**Implementation Plan:**
1. Update `scene-segmenter.ts` to detect shots > 12 seconds
2. Implement AI-based splitting logic using Augmentcode AI
3. Generate sub-shot numbers (3a, 3b, 3c)
4. Ensure dialogue is properly distributed across sub-shots
5. Update `Shot.number` type to support string values (DONE)

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/scene-segmenter.ts`
- `cli/src/commands/generate-shot-list/generator/index.ts`

#### 4. Terminal Feedback Severity ⏳
**Estimated Effort:** 2 hours  
**Priority:** MEDIUM

**Implementation Plan:**
1. Update warning generation in `validator.ts`
2. Add severity classification logic:
   - Duration > max → Error (red)
   - Duration approaching max → Warning (yellow)
3. Update terminal output in `generate-shot-list.ts` to use chalk colors

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/validator.ts`
- `cli/src/commands/generate-shot-list.ts` (lines 206-216)

#### 5. Mandatory Per-Shot Visual Style Property ⏳
**Estimated Effort:** 3 hours
**Priority:** HIGH

**Implementation Plan:**
1. Update `metadata-extractor.ts` to determine Visual Style
2. Default to "Reality" unless screenplay indicates otherwise
3. Add logic to detect Animation/CGI/Hybrid from screenplay metadata
4. Update `ShotMetadata.visualStyle` to use `VisualStyle` type (DONE)
5. Update formatters to display Visual Style property

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/metadata-extractor.ts`
- `cli/src/commands/generate-shot-list/generator/index.ts` (applyStyleToMetadata)
- `cli/src/commands/generate-shot-list/formatter/markdown-formatter.ts`
- `cli/src/commands/generate-shot-list/formatter/jsonl-formatter.ts`

#### 7. No-Dialogue Shots ⏳
**Estimated Effort:** 2 hours
**Priority:** MEDIUM

**Implementation Plan:**
1. Update `buildDescription()` in generator to detect no-dialogue shots
2. Add explicit "No dialogue in this shot" text to description
3. Ensure this is included in all formatters

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/index.ts` (buildDescription)

#### 8. Mandatory Dialogue Property Per Shot ⏳
**Estimated Effort:** 2 hours
**Priority:** HIGH

**Implementation Plan:**
1. Add dialogue extraction logic to generator
2. Extract dialogue from scene elements
3. Assign dialogue to specific shots/sub-shots
4. Default to "No dialogue in this shot" if none present
5. Update `Shot.dialogue` field (DONE)
6. Update all formatters to display Dialogue property

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/index.ts`
- `cli/src/commands/generate-shot-list/formatter/markdown-formatter.ts`
- `cli/src/commands/generate-shot-list/formatter/jsonl-formatter.ts`

#### 9. Character Blocking Continuity ⏳
**Estimated Effort:** 4 hours
**Priority:** HIGH

**Implementation Plan:**
1. Implement blocking tracker in generator
2. Track character positions across consecutive shots
3. Validate logical position changes
4. Add blocking details to shot descriptions
5. Generate warnings for illogical position jumps

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/context-builder.ts`
- `cli/src/commands/generate-shot-list/generator/index.ts`
- Create new file: `cli/src/commands/generate-shot-list/generator/blocking-tracker.ts`

#### 10. Rich, Consistent Per-Shot Character Descriptions ⏳
**Estimated Effort:** 4 hours
**Priority:** HIGH

**Implementation Plan:**
1. Build Character Bible system
2. Extract character details from screenplay
3. Maintain consistent descriptions across shots
4. Include: wardrobe, physical appearance, props, emotional state
5. Update `CharacterState` interface (DONE)
6. Implement character description builder

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/context-builder.ts`
- Create new file: `cli/src/commands/generate-shot-list/generator/character-bible.ts`

#### 11. Rich, Consistent Per-Shot Set Descriptions ⏳
**Estimated Effort:** 3 hours
**Priority:** HIGH

**Implementation Plan:**
1. Build Set Bible system
2. Extract set details from screenplay
3. Maintain consistent descriptions across shots in same location
4. Include: architecture, furnishings, lighting, atmosphere, weather, time of day
5. Implement set description builder

**Files to Modify:**
- `cli/src/commands/generate-shot-list/generator/context-builder.ts`
- Create new file: `cli/src/commands/generate-shot-list/generator/set-bible.ts`

#### 12. JSON and JSONL Output Format Corrections ⏳
**Estimated Effort:** 4 hours
**Priority:** HIGH

**Implementation Plan:**
1. Review current JSON/JSONL formatters
2. Implement proper key:value pair structure
3. Ensure JSONL outputs one shot per line
4. Add proper escaping for strings
5. Validate output is parseable JSON/JSONL
6. Add all new fields (dialogue, visualStyle, etc.)

**Files to Modify:**
- `cli/src/commands/generate-shot-list/formatter/json-formatter.ts`
- `cli/src/commands/generate-shot-list/formatter/jsonl-formatter.ts`

## Summary

**Completed:** 3 of 12 requirements (25%)
**Remaining:** 9 requirements (75%)
**Estimated Remaining Effort:** 19-23 hours

**Next Steps:**
1. Implement Requirement 5 (Visual Style) - 3 hours
2. Implement Requirement 8 (Dialogue Property) - 2 hours
3. Implement Requirement 7 (No-Dialogue) - 2 hours
4. Implement Requirement 2 (Shot Splitting) - 5 hours
5. Implement Requirement 4 (Terminal Feedback) - 2 hours
6. Implement Requirement 9 (Blocking Continuity) - 4 hours
7. Implement Requirement 10 (Character Descriptions) - 4 hours
8. Implement Requirement 11 (Set Descriptions) - 3 hours
9. Implement Requirement 12 (JSON/JSONL Corrections) - 4 hours

**Recommended Implementation Order:**
1. Quick wins first: 5, 8, 7, 4 (9 hours total)
2. Complex features: 2, 9, 10, 11, 12 (20 hours total)

## Testing Plan

After each requirement is implemented:
1. Run unit tests
2. Test with sample screenplay
3. Validate output format
4. Check for regressions

**Test Command:**
```bash
augx generate-shot-list --path test-screenplay.fountain --logging
```


