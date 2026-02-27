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

/**
 * Default generator implementation
 */
export class ShotListGenerator implements Generator {
  private validator = createValidator();
  private segmenter: SceneSegmenter;
  private contextBuilder: ContextBuilder;
  private metadataExtractor: MetadataExtractor;
  private styleGuidelines: MergedStyleGuidelines | null = null;

  constructor(styleGuidelines?: MergedStyleGuidelines | null) {
    // Initialize modules with default configurations
    this.segmenter = new SceneSegmenter({
      maxShotLength: 30, // 30 seconds max
      targetShotLength: 15, // 15 seconds target
      minShotLength: 5 // 5 seconds minimum
    });

    this.contextBuilder = new ContextBuilder({
      includeAtmosphere: true,
      includeWeather: true,
      trackCharacterEmotions: true
    });

    this.metadataExtractor = new MetadataExtractor({
      extractTechnicalNotes: true,
      inferFromContext: true
    });

    this.styleGuidelines = styleGuidelines || null;
  }

  /**
   * Generate shot list from parsed screenplay
   */
  generate(scenes: Scene[], config: GeneratorConfig): ShotList {
    const shots: Shot[] = [];
    let shotNumber = 1;
    const warnings: Warning[] = [];

    // Process each scene
    for (const scene of scenes) {
      // TODO: Implement scene segmentation (bd-shot-list-3.2)
      // For now, create one shot per scene as placeholder
      const sceneShots = this.segmentScene(scene, shotNumber, config);
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
  private segmentScene(scene: Scene, startShotNumber: number, config: GeneratorConfig): Shot[] {
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
      const characters = this.contextBuilder.buildCharacterStates(segment.elements, sceneContext);

      // Extract metadata for this segment
      const metadata = this.metadataExtractor.extract(segment.elements, isFirstShot);

      // Apply style guidelines if available
      if (this.styleGuidelines) {
        this.applyStyleToMetadata(metadata, this.styleGuidelines);
      }

      // Build description
      const description = this.buildDescription(segment.elements, sceneContext, characters);

      // Extract dialogue from segment
      const dialogue = this.extractDialogue(segment.elements);

      // Check if shot exceeds max duration (Requirement 2)
      if (segment.estimatedDuration > config.maxShotLength) {
        // Split into sub-shots
        const subShots = this.splitIntoSubShots(
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
          description,
          dialogue,
          metadata,
          duration: segment.estimatedDuration,
          characterCount: description.length,
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
   */
  private splitIntoSubShots(
    segment: import('./scene-segmenter').SceneSegment,
    baseShotNumber: number,
    scene: Scene,
    sceneContext: SceneContext,
    config: GeneratorConfig
  ): Shot[] {
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

      // Build sub-shot number (e.g., "3a", "3b", "3c")
      const subShotNumber = `${baseShotNumber}${String.fromCharCode(97 + i)}`; // 97 = 'a'

      // Build character states for this sub-shot
      const characters = this.contextBuilder.buildCharacterStates(subShotElements, sceneContext);

      // Extract metadata for this sub-shot
      const metadata = this.metadataExtractor.extract(subShotElements, i === 0);

      // Apply style guidelines if available
      if (this.styleGuidelines) {
        this.applyStyleToMetadata(metadata, this.styleGuidelines);
      }

      // Build description
      const description = this.buildDescription(subShotElements, sceneContext, characters);

      // Extract dialogue for this sub-shot
      const dialogue = this.extractDialogue(subShotElements);

      // Estimate duration for this sub-shot
      const duration = this.estimateSubShotDuration(subShotElements);

      subShots.push({
        number: subShotNumber,
        sceneNumber: scene.number,
        heading: scene.heading,
        context: sceneContext,
        characters,
        description,
        dialogue,
        metadata,
        duration,
        characterCount: description.length,
        warnings: []
      });
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
   * Extract dialogue from scene elements
   * Requirement 7 & 8: Handle "No dialogue" and mandatory dialogue population
   */
  private extractDialogue(elements: import('../parser/types').SceneElement[]): string {
    const dialogueElements = elements.filter(
      (el): el is import('../parser/types').DialogueElement => el.type === 'dialogue'
    );

    if (dialogueElements.length === 0) {
      return 'No dialogue in this shot'; // Requirement 7
    }

    // Combine all dialogue with character names
    return dialogueElements
      .map(el => `${el.dialogue.character}: ${el.dialogue.speech}`)
      .join(' ');
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
   * Build shot description from elements, context, and characters
   */
  private buildDescription(
    elements: import('../parser/types').SceneElement[],
    context: SceneContext,
    characters: CharacterState[]
  ): string {
    const parts: string[] = [];

    // Add context
    parts.push(`${context.set} - ${context.timeOfDay} - ${context.lighting}`);
    if (context.atmosphere) {
      parts.push(`Atmosphere: ${context.atmosphere}`);
    }
    if (context.weather) {
      parts.push(`Weather: ${context.weather}`);
    }

    // Add characters
    if (characters.length > 0) {
      const characterDesc = characters.map(c => {
        let desc = c.name;
        if (c.emotion) {
          desc += ` (${c.emotion})`;
        }
        if (c.action) {
          desc += ` - ${c.action}`;
        }
        return desc;
      }).join(', ');
      parts.push(`Characters: ${characterDesc}`);
    }

    // Add action and dialogue
    const content = elements.map(el => el.text).join(' ');
    parts.push(content);

    return parts.join('. ');
  }
}

/**
 * Create generator instance
 */
export function createGenerator(styleGuidelines?: MergedStyleGuidelines | null): Generator {
  return new ShotListGenerator(styleGuidelines);
}

