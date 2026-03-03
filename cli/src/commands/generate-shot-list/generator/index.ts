/**
 * Shot List Generator
 *
 * Main orchestration for generating AI-optimized shot lists from parsed screenplays
 */

import { Scene } from '../parser/types';
import {
  ShotList,
  Shot,
  Warning,
  GeneratorConfig,
  Generator,
  SceneContext,
  CharacterState,
  ShotMetadata
} from './types';
import { createValidator } from './validator';
import { SceneSegmenter, SegmentationConfig } from './scene-segmenter';
import { ContextBuilder, ContextBuilderConfig } from './context-builder';
import { MetadataExtractor, MetadataExtractorConfig } from './metadata-extractor';
import { MergedStyleGuidelines } from '../style/types';
import { AIBlockingExtractor, CharacterBlockingPosition, BlockingExtractionResult } from './ai-blocking-extractor';

/**
 * Default generator implementation
 */
export class ShotListGenerator implements Generator {
  private validator = createValidator();
  private segmenter: SceneSegmenter;
  private contextBuilder: ContextBuilder;
  private metadataExtractor: MetadataExtractor;
  private blockingExtractor: AIBlockingExtractor;
  private styleGuidelines: MergedStyleGuidelines | null = null;
  private characterBlockingCache: Map<string, CharacterBlockingPosition> = new Map();

  constructor(styleGuidelines?: MergedStyleGuidelines | null) {
    // Store style guidelines first
    this.styleGuidelines = styleGuidelines || null;

    // Initialize modules with default configurations
    this.segmenter = new SceneSegmenter({
      maxShotLength: 30, // 30 seconds max
      targetShotLength: 15, // 15 seconds target
      minShotLength: 5 // 5 seconds minimum
    });

    // Pass style guidelines to ContextBuilder so it can filter appropriately
    this.contextBuilder = new ContextBuilder({
      includeAtmosphere: true,
      includeWeather: true,
      trackCharacterEmotions: true,
      styleGuidelines: this.styleGuidelines
    });

    this.metadataExtractor = new MetadataExtractor({
      extractTechnicalNotes: true,
      inferFromContext: true
    });

    this.blockingExtractor = new AIBlockingExtractor(undefined, this.styleGuidelines);
  }

  /**
   * Generate shot list from parsed screenplay
   */
  async generate(scenes: Scene[], config: GeneratorConfig): Promise<ShotList> {
    // CRITICAL: Reset all state at the start of each screenplay generation
    // This prevents Character Bible contamination between different screenplays
    this.contextBuilder.reset();
    this.characterBlockingCache.clear();
    this.blockingExtractor.clearCache(); // Clear character description cache

    const shots: Shot[] = [];
    let shotNumber = 1;
    const warnings: Warning[] = [];

    // Process each scene
    for (const scene of scenes) {
      // TODO: Implement scene segmentation (bd-shot-list-3.2)
      // For now, create one shot per scene as placeholder
      const sceneShots = await this.segmentScene(scene, shotNumber, config);
      shots.push(...sceneShots);
      shotNumber += sceneShots.length;
    }

    // Calculate totals
    const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0);
    const totalCharacters = shots.reduce((sum, shot) => sum + shot.characterCount, 0);

    // Create shot list
    const shotList: ShotList = {
      shots,
      totalShots: shots.length,
      totalDuration,
      totalCharacters,
      warnings: [],
      metadata: {
        generatedAt: new Date(),
        maxCharacters: config.maxCharacters,
        maxShotLength: config.maxShotLength,
        sourceFormat: 'fountain' // TODO: Get from screenplay metadata
      }
    };

    // Validate shot list using validator module
    const validationWarnings = this.validator.validate(shotList, config);
    warnings.push(...validationWarnings);

    return {
      shots,
      totalShots: shots.length,
      totalDuration,
      totalCharacters,
      warnings,
      metadata: {
        generatedAt: new Date(),
        maxCharacters: config.maxCharacters,
        maxShotLength: config.maxShotLength,
        sourceFormat: 'fountain' // TODO: Get from screenplay metadata
      }
    };
  }

  /**
   * Validate shot list against limits
   * Delegates to validator module (bd-shot-list-3.5)
   */
  validate(shotList: ShotList, config: GeneratorConfig): Warning[] {
    return this.validator.validate(shotList, config);
  }

  /**
   * Segment scene into shots
   * Implemented: bd-shot-list-3.2
   * Enhanced: bd-2b68 (Requirement 2: Intelligent Shot Splitting)
   */
  private async segmentScene(scene: Scene, startShotNumber: number, config: GeneratorConfig): Promise<Shot[]> {
    // Build scene-level context once
    const sceneContext = this.contextBuilder.buildSceneContext(scene);

    // Segment scene into shots
    const segments = this.segmenter.segment(scene);

    // Convert segments to shots
    const shots: Shot[] = [];
    let currentShotNumber = startShotNumber;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isFirstShot = i === 0;

      // Build character states for this segment
      const characters = await this.contextBuilder.buildCharacterStates(segment.elements, sceneContext);

      // Extract metadata for this segment
      const metadata = this.metadataExtractor.extract(segment.elements, isFirstShot);

      // Apply style guidelines if available
      if (this.styleGuidelines) {
        this.applyStyleToMetadata(metadata, this.styleGuidelines);
      }

      // Extract blocking using AI
      const blockingData = await this.extractBlockingWithAI(segment.elements, characters);

      // Apply AI-generated character descriptions to character states
      this.applyCharacterDescriptions(characters, blockingData.characterDescriptions);

      // Build structured description components
      const set = this.buildSetDescription(sceneContext);
      const description = blockingData.setDescription || this.buildVisualDescription(sceneContext);
      const actions = blockingData.characterActions.length > 0
        ? blockingData.characterActions.join('. ')
        : 'No specific actions in this shot';
      const dialogue = this.extractDialogue(segment.elements);
      const blocking = this.buildBlockingFromAI(blockingData.characterPositions, characters);
      const sfx = config.muteSfx
        ? 'No sound effects specified'
        : (blockingData.soundEffects.length > 0
          ? blockingData.soundEffects.join('. ')
          : 'No sound effects specified');
      const techDetails = this.buildTechDetails(metadata);

      // Calculate total character count from all components
      const totalCharacterCount = set.length + description.length + actions.length +
                                   dialogue.length + blocking.length + sfx.length + techDetails.length;

      // Check if shot exceeds max duration (Requirement 2)
      if (segment.estimatedDuration > config.maxShotLength) {
        // Split into sub-shots
        const subShots = await this.splitIntoSubShots(
          segment,
          currentShotNumber,
          scene,
          sceneContext,
          config
        );
        shots.push(...subShots);
        currentShotNumber += subShots.length;
      } else {
        // Create single shot
        shots.push({
          number: currentShotNumber,
          sceneNumber: scene.number,
          heading: scene.heading,
          context: sceneContext,
          characters,
          set,
          description,
          actions,
          dialogue,
          blocking,
          sfx,
          techDetails,
          metadata,
          duration: segment.estimatedDuration,
          characterCount: totalCharacterCount,
          warnings: []
        });
        currentShotNumber++;
      }
    }

    return shots;
  }

  /**
   * Split a long shot into intelligent sub-shots
   * Requirement 2: Intelligent Shot Splitting for Long Durations
   * Recursively splits sub-shots that still exceed maxShotLength
   */
  private async splitIntoSubShots(
    segment: import('./scene-segmenter').SceneSegment,
    baseShotNumber: number | string,
    scene: Scene,
    sceneContext: SceneContext,
    config: GeneratorConfig
  ): Promise<Shot[]> {
    const subShots: Shot[] = [];
    const elements = segment.elements;
    const targetDuration = config.maxShotLength;

    // Calculate how many sub-shots we need
    const numSubShots = Math.ceil(segment.estimatedDuration / targetDuration);
    const elementsPerSubShot = Math.ceil(elements.length / numSubShots);

    // Split elements into sub-shots
    for (let i = 0; i < numSubShots; i++) {
      const startIdx = i * elementsPerSubShot;
      const endIdx = Math.min((i + 1) * elementsPerSubShot, elements.length);
      const subShotElements = elements.slice(startIdx, endIdx);

      // Build sub-shot number (e.g., "3a", "3b", "3c" or "3a.1", "3a.2")
      const subShotNumber = typeof baseShotNumber === 'string'
        ? `${baseShotNumber}.${i + 1}` // Nested: "3a.1", "3a.2" or "3a.1.1", "3a.1.2"
        : `${baseShotNumber}${String.fromCharCode(97 + i)}`; // First level: "3a", "3b"

      // Build character states for this sub-shot
      const characters = await this.contextBuilder.buildCharacterStates(subShotElements, sceneContext);

      // Extract metadata for this sub-shot
      const metadata = this.metadataExtractor.extract(subShotElements, i === 0);

      // Apply style guidelines if available
      if (this.styleGuidelines) {
        this.applyStyleToMetadata(metadata, this.styleGuidelines);
      }

      // Extract blocking using AI
      const blockingData = await this.extractBlockingWithAI(subShotElements, characters);

      // Apply AI-generated character descriptions to character states
      this.applyCharacterDescriptions(characters, blockingData.characterDescriptions);

      // Build structured description components
      const set = this.buildSetDescription(sceneContext);
      const description = blockingData.setDescription || this.buildVisualDescription(sceneContext);
      const actions = blockingData.characterActions.length > 0
        ? blockingData.characterActions.join('. ')
        : 'No specific actions in this shot';
      const dialogue = this.extractDialogue(subShotElements);
      const blocking = this.buildBlockingFromAI(blockingData.characterPositions, characters);
      const sfx = config.muteSfx
        ? 'No sound effects specified'
        : (blockingData.soundEffects.length > 0
          ? blockingData.soundEffects.join('. ')
          : 'No sound effects specified');
      const techDetails = this.buildTechDetails(metadata);

      // Calculate total character count from all components
      const totalCharacterCount = set.length + description.length + actions.length +
                                   dialogue.length + blocking.length + sfx.length + techDetails.length;

      // Estimate duration for this sub-shot
      const duration = this.estimateSubShotDuration(subShotElements);

      // Check if this sub-shot still exceeds max duration
      if (duration > config.maxShotLength) {
        // If we have multiple elements, split recursively
        if (subShotElements.length > 1) {
          // Create a segment for recursive splitting
          const nestedSegment: import('./scene-segmenter').SceneSegment = {
            elements: subShotElements,
            estimatedDuration: duration,
            breakReason: 'duration'
          };

          // Recursively split this sub-shot
          const nestedSubShots = await this.splitIntoSubShots(
            nestedSegment,
            subShotNumber,
            scene,
            sceneContext,
            config
          );

          subShots.push(...nestedSubShots);
        }
        // If we have a single dialogue element, split the dialogue text
        else if (subShotElements.length === 1 && subShotElements[0].type === 'dialogue') {
          const dialogueElement = subShotElements[0] as import('../parser/types').DialogueElement;
          const splitDialogueElements = this.splitDialogueText(dialogueElement, config.maxShotLength);

          // Create a segment with the split dialogue elements
          const dialogueSegment: import('./scene-segmenter').SceneSegment = {
            elements: splitDialogueElements,
            estimatedDuration: this.estimateSubShotDuration(splitDialogueElements),
            breakReason: 'duration'
          };

          // Recursively split the dialogue-based segment
          const dialogueSubShots = await this.splitIntoSubShots(
            dialogueSegment,
            subShotNumber,
            scene,
            sceneContext,
            config
          );

          subShots.push(...dialogueSubShots);
        }
        // Single non-dialogue element that can't be split further
        else {
          const warnings: import('./types').Warning[] = [];
          warnings.push({
            type: 'duration-limit-error',
            message: `Shot ${subShotNumber} exceeds duration limit (${duration}s/${config.maxShotLength}s) and cannot be split further`,
            shotNumber: subShotNumber,
            severity: 'error'
          });

          subShots.push({
            number: subShotNumber,
            sceneNumber: scene.number,
            heading: scene.heading,
            context: sceneContext,
            characters,
            set,
            description,
            actions,
            dialogue,
            blocking,
            sfx,
            techDetails,
            metadata,
            duration,
            characterCount: totalCharacterCount,
            warnings
          });
        }
      } else {
        // This sub-shot is within limits, add it
        const warnings: import('./types').Warning[] = [];

        subShots.push({
          number: subShotNumber,
          sceneNumber: scene.number,
          heading: scene.heading,
          context: sceneContext,
          characters,
          set,
          description,
          actions,
          dialogue,
          blocking,
          sfx,
          techDetails,
          metadata,
          duration,
          characterCount: totalCharacterCount,
          warnings
        });
      }
    }

    return subShots;
  }

  /**
   * Estimate duration for a sub-shot based on its elements
   */
  private estimateSubShotDuration(elements: import('../parser/types').SceneElement[]): number {
    const DURATION_ESTIMATES = {
      ACTION_LINE: 3,
      DIALOGUE_WORD: 0.4,
      TRANSITION: 1,
      NOTE: 0
    };

    let duration = 0;
    for (const element of elements) {
      switch (element.type) {
        case 'action':
          duration += DURATION_ESTIMATES.ACTION_LINE;
          break;
        case 'dialogue':
          const dialogueElement = element as import('../parser/types').DialogueElement;
          const wordCount = dialogueElement.dialogue.speech.split(/\s+/).length;
          duration += wordCount * DURATION_ESTIMATES.DIALOGUE_WORD;
          break;
        case 'transition':
          duration += DURATION_ESTIMATES.TRANSITION;
          break;
        case 'note':
          duration += DURATION_ESTIMATES.NOTE;
          break;
      }
    }

    return Math.round(duration);
  }

  /**
   * Split a dialogue element's speech into multiple smaller dialogue elements
   * based on sentence boundaries and target duration
   */
  private splitDialogueText(
    dialogueElement: import('../parser/types').DialogueElement,
    maxDuration: number
  ): import('../parser/types').DialogueElement[] {
    const DIALOGUE_WORD_DURATION = 0.4; // seconds per word
    const maxWords = Math.floor(maxDuration / DIALOGUE_WORD_DURATION);

    const speech = dialogueElement.dialogue.speech;
    const sentences = speech.match(/[^.!?]+[.!?]+/g) || [speech];

    const chunks: string[] = [];
    let currentChunk = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).length;

      // If adding this sentence would exceed max words, start a new chunk
      if (currentWordCount + sentenceWords > maxWords && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
        currentWordCount = sentenceWords;
      } else {
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
        currentWordCount += sentenceWords;
      }
    }

    // Add the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    // If we couldn't split by sentences (single long sentence), split by words
    if (chunks.length === 1 && currentWordCount > maxWords) {
      const words = speech.split(/\s+/);
      chunks.length = 0; // Clear the array

      for (let i = 0; i < words.length; i += maxWords) {
        const chunkWords = words.slice(i, i + maxWords);
        chunks.push(chunkWords.join(' '));
      }
    }

    // Create new dialogue elements for each chunk
    return chunks.map((chunk, index) => ({
      type: 'dialogue' as const,
      text: chunk,
      line: dialogueElement.line,
      column: dialogueElement.column,
      dialogue: {
        character: dialogueElement.dialogue.character,
        parenthetical: index === 0 ? dialogueElement.dialogue.parenthetical : undefined,
        speech: chunk
      }
    }));
  }

  /**
   * Extract dialogue from scene elements
   * Requirement 7 & 8: Handle "No dialogue" and mandatory dialogue population
   * Format dialogue in MPAA-style screenplay format
   */
  private extractDialogue(elements: import('../parser/types').SceneElement[]): string {
    const dialogueElements = elements.filter(
      (el): el is import('../parser/types').DialogueElement => el.type === 'dialogue'
    );

    if (dialogueElements.length === 0) {
      return 'No dialogue in this shot'; // Requirement 7 & 8
    }

    // Format dialogue in MPAA-style screenplay format (Requirement 8)
    // Character name in ALL CAPS, parenthetical if present, then dialogue
    const formattedDialogue = dialogueElements
      .map(el => {
        const characterName = el.dialogue.character.name.toUpperCase();
        const parenthetical = el.dialogue.parenthetical
          ? `\n${el.dialogue.parenthetical}`
          : '';
        const speech = el.dialogue.speech;

        return `${characterName}${parenthetical}\n${speech}`;
      })
      .join('\n\n');

    return formattedDialogue;
  }

  /**
   * Apply style guidelines to shot metadata
   */
  private applyStyleToMetadata(metadata: ShotMetadata, style: MergedStyleGuidelines): void {
    // Visual style is already set to 'Reality' by default in metadata extractor
    // Style guidelines can override this if needed (future enhancement)

    // Apply cinematic style name(s)
    metadata.cinematicStyle = style.appliedStyles.join(', ');
  }

  /**
   * Build set description from context
   */
  private buildSetDescription(context: SceneContext): string {
    return context.set;
  }

  /**
   * Build visual/environmental description from context
   * Target: Extremely detailed set/environment description (1000+ characters)
   */
  private buildVisualDescription(context: SceneContext): string {
    return this.buildVerboseContext(context);
  }

  /**
   * Build character actions from scene elements
   * Includes both explicit actions and inferred actions from dialogue
   */
  private buildActions(elements: import('../parser/types').SceneElement[]): string {
    const actionList: string[] = [];

    // Extract explicit action descriptions
    // Include ALL actions (character entrances, movements, and general actions)
    // Only filter out pure sound effects
    const actionElements = elements.filter(el => el.type === 'action');
    const explicitActions = actionElements
      .map(el => el.text)
      .filter(text => {
        // Keep the action if it's NOT a pure sound effect
        // Character entrances should always be included
        return !this.isSoundEffect(text) || this.isCharacterEntrance(text);
      });

    actionList.push(...explicitActions);

    // Infer actions from dialogue (e.g., spell-casting, shouting, etc.)
    const dialogueElements = elements.filter(
      (el): el is import('../parser/types').DialogueElement => el.type === 'dialogue'
    );

    for (const dialogueEl of dialogueElements) {
      const inferredAction = this.inferActionFromDialogue(dialogueEl);
      if (inferredAction) {
        actionList.push(inferredAction);
      }
    }

    if (actionList.length === 0) {
      return 'No specific actions in this shot';
    }

    return actionList.join('. ');
  }

  /**
   * Infer character actions from dialogue content
   * Examples:
   * - Spell incantations -> "waves staff and casts spell"
   * - Shouting -> "shouts"
   * - Whispering -> "whispers"
   */
  private inferActionFromDialogue(dialogueEl: import('../parser/types').DialogueElement): string | null {
    const characterName = dialogueEl.dialogue.character.name;
    const speech = dialogueEl.dialogue.speech;
    const parenthetical = dialogueEl.dialogue.parenthetical?.toLowerCase() || '';

    // Detect spell incantations - ONLY specific magical phrases
    // Removed overly broad Latin-like pattern that matched treaty names
    const spellPatterns = [
      /\b(Expecto|Lumos|Accio|Wingardium|Expelliarmus|Avada)/i, // Harry Potter spells
      /\b(Abracadabra|Alakazam|Hocus Pocus|Presto)/i, // Classic magic words
    ];

    const isSpell = spellPatterns.some(pattern => pattern.test(speech));

    if (isSpell) {
      // Check if character has a staff/wand in their props
      // For now, assume wizards have staffs/wands
      return `${characterName} waves staff and casts spell`;
    }

    // Detect shouting (ALL CAPS or exclamation marks)
    if (speech === speech.toUpperCase() && speech.length > 10) {
      return `${characterName} shouts`;
    }

    // Detect whispering from parenthetical
    if (parenthetical.includes('whisper')) {
      return `${characterName} whispers`;
    }

    // Detect other emotional delivery
    if (parenthetical.includes('angry') || parenthetical.includes('furious')) {
      return `${characterName} speaks angrily`;
    }

    if (parenthetical.includes('sad') || parenthetical.includes('crying')) {
      return `${characterName} speaks sadly`;
    }

    return null;
  }

  /**
   * Build character blocking (positions and movements)
   * DEPRECATED: Use buildBlockingFromAI() instead
   */
  private buildBlocking(characters: CharacterState[]): string {
    if (characters.length === 0) {
      return 'No characters in this shot';
    }

    const blockingParts = characters.map(char => {
      const parts: string[] = [];

      // Position
      if (char.position && char.position !== 'in scene') {
        parts.push(`${char.name} is ${char.position}`);
      }

      // Movement/action
      if (char.action) {
        parts.push(`${char.name} ${char.action}`);
      }

      return parts.join('; ');
    }).filter(p => p.length > 0);

    return blockingParts.length > 0
      ? blockingParts.join('. ')
      : 'Characters maintain their positions';
  }

  /**
   * Extract blocking using AI-powered spatial inference
   */
  private async extractBlockingWithAI(
    elements: import('../parser/types').SceneElement[],
    characters: CharacterState[]
  ): Promise<BlockingExtractionResult> {
    // Extract action lines
    const actionLines = elements
      .filter(el => el.type === 'action')
      .map(el => el.text);

    if (actionLines.length === 0) {
      return {
        characterPositions: [],
        characterDescriptions: [],
        setDescription: '',
        characterActions: [],
        soundEffects: []
      };
    }

    // Get character names
    const characterNames = characters.map(c => c.name);

    // Call AI blocking extractor
    console.log(`Extracting blocking with AI for ${characterNames.length} characters...`);
    const result = await this.blockingExtractor.extractBlocking(
      actionLines,
      characterNames,
      this.characterBlockingCache
    );

    // Update cache with new positions
    for (const pos of result.characterPositions) {
      this.characterBlockingCache.set(pos.character, pos);
    }

    return result;
  }

  /**
   * Build blocking description from AI-extracted positions
   */
  private buildBlockingFromAI(
    positions: CharacterBlockingPosition[],
    characters: CharacterState[]
  ): string {
    if (positions.length === 0) {
      // Fallback to cached positions
      const cachedBlocking: string[] = [];
      for (const char of characters) {
        const cached = this.characterBlockingCache.get(char.name);
        if (cached) {
          cachedBlocking.push(this.formatBlockingPosition(cached));
        }
      }
      return cachedBlocking.length > 0
        ? cachedBlocking.join('\n')
        : 'Characters maintain their positions';
    }

    return positions.map(pos => this.formatBlockingPosition(pos)).join('\n');
  }

  /**
   * Format a single character blocking position
   */
  private formatBlockingPosition(pos: CharacterBlockingPosition): string {
    const parts: string[] = [pos.character + ':'];

    if (pos.action) {
      parts.push(pos.action);
    }

    if (pos.position) {
      parts.push(pos.position);
    }

    if (pos.stagePosition) {
      parts.push(`(${pos.stagePosition})`);
    }

    if (pos.relativePosition) {
      parts.push(`[${pos.relativePosition}]`);
    }

    return parts.join(' ');
  }

  /**
   * Apply AI-generated character descriptions to character states
   */
  private applyCharacterDescriptions(
    characters: CharacterState[],
    descriptions: import('./ai-blocking-extractor').CharacterDescription[]
  ): void {
    for (const desc of descriptions) {
      const char = characters.find(c => c.name === desc.character);
      if (char) {
        if (desc.physicalAppearance) {
          char.physicalAppearance = desc.physicalAppearance;
        }
        if (desc.wardrobe) {
          char.wardrobe = desc.wardrobe;
        }
        if (desc.emotion) {
          char.emotion = desc.emotion;
        }
      }
    }
  }

  /**
   * Build sound effects from scene elements
   * Filters out character entrances/exits which should be in Actions, not SFX
   */
  private buildSFX(elements: import('../parser/types').SceneElement[]): string {
    const sfxList: string[] = [];

    // Check dialogue for intercom references
    const dialogueElements = elements.filter(el => el.type === 'dialogue') as import('../parser/types').DialogueElement[];
    for (const dialogueEl of dialogueElements) {
      const parenthetical = dialogueEl.dialogue.parenthetical?.toLowerCase() || '';
      if (parenthetical.includes('intercom') || parenthetical.includes('over intercom')) {
        sfxList.push('Intercom buzz/chirp');
      }
    }

    // Extract sound effects from action lines
    const actionElements = elements.filter(el => el.type === 'action');
    const actionSfx = actionElements
      .map(el => el.text)
      .filter(text => this.isSoundEffect(text) && !this.isCharacterEntrance(text));

    sfxList.push(...actionSfx);

    if (sfxList.length === 0) {
      return 'No sound effects specified';
    }

    return sfxList.join('. ');
  }

  /**
   * Check if text describes a character entrance or exit
   * These should be in Actions, not SFX
   */
  private isCharacterEntrance(text: string): boolean {
    const entranceKeywords = [
      'enters', 'enter', 'entering',
      'exits', 'exit', 'exiting',
      'arrives', 'arrive', 'arriving',
      'leaves', 'leave', 'leaving',
      'walks in', 'walks out',
      'comes in', 'goes out'
    ];

    const lowerText = text.toLowerCase();

    // Check if text contains character introduction pattern: "NAME (description) enters"
    const hasCharacterIntro = /[A-Z][A-Z\s]+\s*\([^)]+\)/.test(text);

    // Check for entrance keywords
    const hasEntranceKeyword = entranceKeywords.some(keyword => lowerText.includes(keyword));

    return hasCharacterIntro || hasEntranceKeyword;
  }

  /**
   * Check if text describes a sound effect
   */
  private isSoundEffect(text: string): boolean {
    const sfxKeywords = [
      'sound', 'noise', 'hear', 'echo', 'rumble', 'crash', 'bang',
      'whisper', 'shout', 'scream', 'music', 'song', 'melody',
      'beep', 'buzz', 'hum', 'ring', 'chime', 'alarm'
    ];

    const lowerText = text.toLowerCase();
    return sfxKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Build technical details from metadata
   */
  private buildTechDetails(metadata: ShotMetadata): string {
    const parts: string[] = [];

    // Camera details
    parts.push(`Shot Type: ${metadata.shotType}`);
    parts.push(`Camera Movement: ${metadata.cameraMovement}`);
    parts.push(`Framing: ${metadata.framing}`);
    parts.push(`Visual Style: ${metadata.visualStyle}`);

    // Cinematic style if available
    if (metadata.cinematicStyle) {
      parts.push(`Cinematic Style: ${metadata.cinematicStyle}`);
    }

    // Technical notes if available
    if (metadata.technicalNotes && metadata.technicalNotes.length > 0) {
      parts.push(`Notes: ${metadata.technicalNotes.join(', ')}`);
    }

    return parts.join('. ');
  }

  /**
   * Build verbose context description for generative AI
   * Target: Extremely detailed set/environment description (1000+ characters)
   * PRIORITY: Extract concrete details from screenplay, avoid generic filler
   * STYLE-AWARE: Apply style-specific visual characteristics
   * QUALITY: Environment only - no character actions
   */
  private buildVerboseContext(context: SceneContext): string {
    const parts: string[] = [];

    // Start with the actual set description from the screenplay
    // This should contain the concrete visual details
    if (context.description && context.description.length > 50) {
      // Clean the description to remove character actions
      const environmentOnly = this.extractEnvironmentDescription(context.description);
      if (environmentOnly) {
        parts.push(environmentOnly);
      } else {
        // Fallback if cleaning removed everything
        parts.push(`${context.set} fills the frame`);
      }
    } else {
      // Fallback: Build from available context
      parts.push(`${context.set} fills the frame`);
    }

    // Apply style-specific visual characteristics
    if (this.styleGuidelines) {
      const styleEnhancements = this.getStyleVisualCharacteristics(context);
      if (styleEnhancements) {
        parts.push(styleEnhancements);
      }
    }

    // Add lighting details if specific
    if (context.lighting && !context.lighting.includes('natural') && !context.lighting.includes('standard')) {
      parts.push(`Lighting: ${context.lighting}`);
    }

    // Add atmosphere if specific
    if (context.atmosphere && context.atmosphere !== 'neutral') {
      parts.push(`Atmosphere: ${context.atmosphere}`);
    }

    // Add weather if present (already filtered by ContextBuilder for space settings)
    if (context.weather) {
      parts.push(`Weather: ${context.weather}`);
    }

    // Only pad if we're significantly under target (1000 chars)
    const currentLength = parts.join('. ').length;
    if (currentLength < 800 && context.description) {
      // Add more detail about the setting from time of day
      if (context.timeOfDay && context.timeOfDay !== 'DAY') {
        parts.push(`The ${context.timeOfDay.toLowerCase()} setting affects the lighting and mood`);
      }
    }

    return parts.join('. ');
  }

  /**
   * Extract environment description only, removing character actions
   * Keeps: Set details, props, lighting, atmosphere
   * Removes: Character introductions, character actions
   */
  private extractEnvironmentDescription(description: string): string {
    // First, remove character introductions with parenthetical descriptions
    // Example: "WIZARD CLIF HIGH (mid-70s, magnificent long white beard...) stands at..."
    // This removes the entire character introduction clause
    let cleaned = description.replace(/[A-Z][A-Z\s]+\([^)]+\)\s+[^.]*\./g, '');

    // Split into sentences to process individually
    const sentences = cleaned.split(/\.\s+/);
    const cleanedSentences: string[] = [];

    for (let sentence of sentences) {
      // Skip if this is primarily a character action sentence
      // Check if sentence starts with or contains character action patterns
      if (this.isCharacterActionSentence(sentence)) {
        continue;
      }

      // Trim and check if anything meaningful remains
      sentence = sentence.trim();

      // Keep sentences that have substantial content
      if (sentence.length > 15) {
        cleanedSentences.push(sentence);
      }
    }

    return cleanedSentences.join('. ').trim();
  }

  /**
   * Check if a sentence is primarily about character actions
   * Returns true only if the sentence describes what a character is DOING
   * Returns false if it's describing the environment, even if it contains action-like verbs
   */
  private isCharacterActionSentence(sentence: string): boolean {
    const lowerSentence = sentence.toLowerCase();

    // Check if sentence contains character name patterns (ALL CAPS words or known character names)
    const hasCharacterName = /\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\b/.test(sentence);

    // Character action patterns: "CHARACTER + ACTION VERB"
    // Example: "WIZARD stands at the center", "Clif pauses", "HEIDI enters"
    const characterActionPatterns = [
      /\b(stands?|stood|standing)\s+(at|in|near|by)/i,
      /\b(sits?|sat|sitting)\s+(at|in|on|down)/i,
      /\b(walks?|walked|walking)\s+(to|toward|into|through)/i,
      /\b(enters?|entered|entering)\b/i,
      /\b(exits?|exited|exiting)\b/i,
      /\b(waves?|waved|waving)\s+(his|her|their|a)/i,
      /\b(pauses?|paused|pausing)\b/i,
      /\b(sighs?|sighed|sighing)\b/i,
      /\b(looks?|looked|looking)\s+(at|toward|up|down)/i,
      /\b(turns?|turned|turning)\s+(to|toward|around)/i,
      /\b(moves?|moved|moving)\s+(to|toward|closer)/i,
      /\b(gestures?|gestured|gesturing)\b/i,
      /\b(points?|pointed|pointing)\s+(at|to|toward)/i,
      /\b(reaches?|reached|reaching)\s+(for|toward|out)/i,
      /\b(grabs?|grabbed|grabbing)\b/i
    ];

    // Check if sentence matches character action patterns
    const hasCharacterAction = characterActionPatterns.some(pattern => pattern.test(lowerSentence));

    // Return true only if it has both a character reference AND an action pattern
    return hasCharacterName && hasCharacterAction;
  }

  /**
   * Check if a sentence is a character introduction
   * Example: "WIZARD CLIF HIGH (mid-70s, magnificent long white beard...)"
   */
  private isCharacterIntroduction(sentence: string): boolean {
    // Character introductions typically have:
    // 1. All-caps name
    // 2. Parenthetical description with age, appearance, etc.
    const hasAllCapsName = /[A-Z]{2,}\s+[A-Z]{2,}/.test(sentence);
    const hasParentheticalDescription = /\([^)]*\)/.test(sentence);

    return hasAllCapsName && hasParentheticalDescription;
  }

  /**
   * Get style-specific visual characteristics based on active style guidelines
   * Returns visual descriptors that match the franchise/format aesthetic
   */
  private getStyleVisualCharacteristics(context: SceneContext): string | null {
    if (!this.styleGuidelines || !this.styleGuidelines.appliedStyles) {
      return null;
    }

    const characteristics: string[] = [];
    const appliedStylesLower = this.styleGuidelines.appliedStyles.map(s => s.toLowerCase());

    // Check for Star Trek franchise style
    if (appliedStylesLower.some(s => s.includes('star trek'))) {
      // Apply Star Trek visual aesthetic
      characteristics.push('Clean futurism with bright, optimistic lighting');
      characteristics.push('Sleek, utopian design with smooth surfaces and advanced technology');

      // Check if this is a bridge/command center
      const location = context.set.toLowerCase();
      if (location.includes('bridge') || location.includes('command')) {
        characteristics.push('Command stations with illuminated displays and ergonomic controls');
      }
    }

    // Check for SNL comedy format style
    if (appliedStylesLower.some(s => s.includes('saturday night live') || s.includes('snl'))) {
      // Apply SNL visual style
      characteristics.push('Exaggerated, absurd visual comedy elements');
      characteristics.push('Fast-paced, chaotic energy with physical comedy potential');

      // Emphasize the comedic tone
      if (context.atmosphere && context.atmosphere !== 'neutral') {
        characteristics.push(`Absurdly ${context.atmosphere} atmosphere for comedic effect`);
      }
    }

    // Check for other franchises
    if (appliedStylesLower.some(s => s.includes('star wars'))) {
      characteristics.push('Lived-in, used-future aesthetic with weathered technology');
    }

    return characteristics.length > 0 ? characteristics.join('. ') : null;
  }

  /**
   * Build verbose character description for generative AI
   * Target: 500-800 characters per character with complete visual detail
   * PRIORITY: Use actual screenplay details, avoid generic filler
   */
  private buildVerboseCharacterDescription(character: CharacterState): string {
    const parts: string[] = [];

    // Start with character name
    parts.push(character.name);

    // Add physical appearance if available (from screenplay)
    if (character.physicalAppearance && character.physicalAppearance.length > 0) {
      parts.push(character.physicalAppearance);
    }

    // Add wardrobe if available (from screenplay)
    if (character.wardrobe && character.wardrobe.length > 0) {
      parts.push(character.wardrobe);
    }

    // Add position if specific
    if (character.position && character.position !== 'in scene') {
      parts.push(`Position: ${character.position}`);
    }

    // Add emotion if specific
    if (character.emotion && character.emotion !== 'neutral') {
      parts.push(`Emotion: ${character.emotion}`);
    }

    // Add action if specific
    if (character.action && character.action.length > 5) {
      parts.push(character.action);
    }

    // If we have no details, return just the name
    if (parts.length === 1) {
      return character.name;
    }

    return parts.join('. ');
  }
}

/**
 * Create generator instance
 */
export function createGenerator(styleGuidelines?: MergedStyleGuidelines | null): Generator {
  return new ShotListGenerator(styleGuidelines);
}

