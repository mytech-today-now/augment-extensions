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

      // Build structured description components
      const set = this.buildSetDescription(sceneContext);
      const description = this.buildVisualDescription(sceneContext);
      const actions = this.buildActions(segment.elements);
      const dialogue = this.extractDialogue(segment.elements);
      const blocking = this.buildBlocking(characters);
      const sfx = this.buildSFX(segment.elements);
      const techDetails = this.buildTechDetails(metadata);

      // Calculate total character count from all components
      const totalCharacterCount = set.length + description.length + actions.length +
                                   dialogue.length + blocking.length + sfx.length + techDetails.length;

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

      // Build structured description components
      const set = this.buildSetDescription(sceneContext);
      const description = this.buildVisualDescription(sceneContext);
      const actions = this.buildActions(subShotElements);
      const dialogue = this.extractDialogue(subShotElements);
      const blocking = this.buildBlocking(characters);
      const sfx = this.buildSFX(subShotElements);
      const techDetails = this.buildTechDetails(metadata);

      // Calculate total character count from all components
      const totalCharacterCount = set.length + description.length + actions.length +
                                   dialogue.length + blocking.length + sfx.length + techDetails.length;

      // Estimate duration for this sub-shot
      const duration = this.estimateSubShotDuration(subShotElements);

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
    return `${context.set} - ${context.timeOfDay}`;
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
   */
  private buildActions(elements: import('../parser/types').SceneElement[]): string {
    const actionElements = elements.filter(el => el.type === 'action');

    if (actionElements.length === 0) {
      return 'No specific actions in this shot';
    }

    // Extract action descriptions, filtering out sound effects
    const actions = actionElements
      .map(el => el.text)
      .filter(text => !this.isSoundEffect(text))
      .join('. ');

    return actions || 'No specific actions in this shot';
  }

  /**
   * Build character blocking (positions and movements)
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
   * Build sound effects from scene elements
   */
  private buildSFX(elements: import('../parser/types').SceneElement[]): string {
    const actionElements = elements.filter(el => el.type === 'action');

    // Extract sound effects from action lines
    const sfxElements = actionElements
      .map(el => el.text)
      .filter(text => this.isSoundEffect(text));

    if (sfxElements.length === 0) {
      return 'No sound effects specified';
    }

    return sfxElements.join('. ');
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
   */
  private buildVerboseContext(context: SceneContext): string {
    const parts: string[] = [];

    // Detailed set description with spatial awareness
    parts.push(`The scene unfolds within ${context.set}, a meticulously crafted environment that serves as the visual foundation for this moment in the narrative`);
    parts.push(`The spatial composition of this location has been carefully considered, with every element contributing to the overall cinematic aesthetic and storytelling purpose`);

    // Time and lighting details with technical specificity
    parts.push(`The temporal setting is ${context.timeOfDay}, establishing the chronological context for the action`);
    parts.push(`Lighting design employs ${context.lighting}, which not only illuminates the subjects but also sculpts the three-dimensional space, creates depth through shadow and highlight, and establishes the emotional tone through color temperature and intensity`);
    parts.push(`The interplay of light and shadow across surfaces, textures, and characters creates a dynamic visual field that guides the viewer's eye and emphasizes key narrative elements`);

    // Atmosphere expansion with sensory detail
    if (context.atmosphere) {
      parts.push(`The prevailing atmosphere is unmistakably ${context.atmosphere}, a quality that permeates every visual element within the frame`);
      parts.push(`This atmospheric quality manifests through subtle environmental cues, character behavior, color palette choices, and the overall energy of the composition`);
    }

    // Weather details with environmental impact
    if (context.weather) {
      parts.push(`Environmental weather conditions present ${context.weather}, which adds tangible atmospheric texture and visual interest to the scene`);
      parts.push(`These weather elements interact with the lighting, affect the visibility and clarity of distant elements, and contribute moisture, movement, or other dynamic qualities to the air itself`);
    }

    // Additional environmental detail
    parts.push(`The overall visual presentation balances practical realism with cinematic enhancement, ensuring that every element serves both aesthetic and narrative functions`);

    return parts.join('. ');
  }

  /**
   * Build verbose character description for generative AI
   * Target: 500-800 characters per character with complete visual detail
   */
  private buildVerboseCharacterDescription(character: CharacterState): string {
    const parts: string[] = [];

    // Character introduction with spatial positioning
    const position = character.position && character.position !== 'in scene'
      ? character.position
      : 'positioned within the frame, occupying their designated space in the composition';
    parts.push(`${character.name} is ${position}, their placement carefully considered for both narrative clarity and visual balance`);

    // Physical appearance - extremely verbose
    if (character.physicalAppearance) {
      parts.push(`Their physical appearance is characterized by ${character.physicalAppearance}, which fundamentally defines their visual presence and establishes their identity within the shot`);
      parts.push(`These physical characteristics contribute to the viewer's immediate understanding of the character, providing visual cues about age, health, lifestyle, and personality through observable details of face, body, and bearing`);
    } else {
      parts.push(`They possess an average build with unremarkable physical characteristics, medium height approximately 5'8" to 5'10", proportionate features that blend naturally into the scene without drawing undue attention`);
      parts.push(`Their facial features are symmetrical and conventional, with no distinguishing marks, scars, or unusual characteristics that would make them stand out in a crowd, presenting as an everyday person one might encounter in any ordinary setting`);
    }

    // Wardrobe - extremely verbose with fabric and style details
    if (character.wardrobe) {
      parts.push(`They are dressed in ${character.wardrobe}, garments that contribute significantly to their character presentation and the overall visual aesthetic of the frame`);
      parts.push(`The clothing choices reflect character background, current circumstances, and narrative context, with fabric textures, colors, and styling all working together to communicate information about the character's social status, profession, personality, and current emotional or physical state`);
    } else {
      parts.push(`They wear casual, contemporary attire appropriate for the setting, consisting of neutral-toned everyday clothing in earth tones or muted colors - perhaps a simple cotton shirt or blouse, comfortable pants or jeans, and practical footwear suitable for the environment`);
      parts.push(`The wardrobe selections are deliberately unremarkable, chosen to blend with the environment rather than stand out, suggesting a character who values comfort and practicality over fashion or self-expression, with fabrics that appear well-worn but well-maintained`);
    }

    // Emotional state and body language
    if (character.emotion) {
      parts.push(`Their emotional state distinctly conveys ${character.emotion}, manifesting through subtle facial expressions including micro-expressions around the eyes and mouth, body language such as posture and gesture, and overall energy that radiates from their presence`);
      parts.push(`This emotional quality colors every aspect of their performance, influencing how they move, speak, and interact with their environment and other characters, creating a cohesive emotional through-line that supports the narrative`);
    } else {
      parts.push(`Their emotional state appears neutral and composed, maintaining a calm, centered presence without strong emotional displays, suggesting either emotional control, professional demeanor, or a moment of quiet contemplation between more dramatic beats`);
    }

    // Action and movement
    if (character.action) {
      parts.push(`Currently engaged in ${character.action}, their movement and behavior actively drive the narrative forward, creating visual interest and advancing the plot through physical choices`);
      parts.push(`These actions are performed with intention and specificity, each gesture and movement motivated by character objectives and emotional state, contributing to the overall kinetic energy of the scene`);
    } else {
      parts.push(`They maintain a state of active stillness, present and engaged with their surroundings while not performing any specific action, their attention focused on other elements within the scene or on internal thoughts and reactions`);
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

