/**
 * Shot List Generator Types
 * 
 * Data structures for AI-optimized shot list generation
 */

import { Scene, SceneHeading } from '../parser/types';

/**
 * Shot type classification
 */
export type ShotType = 
  | 'establishing'
  | 'wide'
  | 'medium'
  | 'close-up'
  | 'extreme-close-up'
  | 'over-the-shoulder'
  | 'point-of-view'
  | 'insert'
  | 'cutaway';

/**
 * Camera movement type
 */
export type CameraMovement = 
  | 'static'
  | 'pan'
  | 'tilt'
  | 'dolly'
  | 'track'
  | 'crane'
  | 'handheld'
  | 'steadicam'
  | 'zoom';

/**
 * Camera framing
 */
export type CameraFraming = 
  | 'wide'
  | 'medium'
  | 'close-up'
  | 'extreme-close-up'
  | 'full-shot'
  | 'medium-shot'
  | 'medium-close-up';

/**
 * Visual style classification
 */
export type VisualStyle = 'Reality' | 'Animation' | 'CGI' | 'Hybrid';

/**
 * Character state in a shot
 */
export interface CharacterState {
  name: string;
  position: string;
  appearance: string;
  emotion?: string;
  action?: string;
  wardrobe?: string;           // Full wardrobe description
  physicalAppearance?: string; // Physical appearance details
}

/**
 * Scene context for shot
 */
export interface SceneContext {
  set: string;
  lighting: string;
  timeOfDay: string;
  atmosphere?: string;
  weather?: string;
}

/**
 * Shot metadata
 */
export interface ShotMetadata {
  shotType: ShotType;
  cameraMovement: CameraMovement;
  framing: CameraFraming;
  technicalNotes?: string[];
  visualStyle: VisualStyle;    // Visual style: Reality, Animation, CGI, or Hybrid
  cinematicStyle?: string;     // Cinematic style name(s) applied
}

/**
 * Warning types
 */
export type WarningType = 
  | 'character-limit-warning'
  | 'character-limit-error'
  | 'duration-limit-warning'
  | 'duration-limit-error'
  | 'missing-context'
  | 'ambiguous-action';

/**
 * Warning for shot list validation
 */
export interface Warning {
  type: WarningType;
  message: string;
  shotNumber: number | string; // Support sub-shot numbers like "3a"
  severity: 'warning' | 'error';
  suggestion?: string;
}

/**
 * Individual shot in the shot list
 */
export interface Shot {
  number: number | string;  // Can be number (1, 2, 3) or string (3a, 3b, 3c) for sub-shots
  sceneNumber: number;
  heading: SceneHeading;
  context: SceneContext;
  characters: CharacterState[];

  // Structured description components
  set: string;              // Set/location description
  description: string;      // Visual/environmental description only
  actions: string;          // Character actions
  dialogue: string;         // Dialogue in this shot or "No dialogue in this shot"
  blocking: string;         // Character positions and movements
  sfx: string;              // Sound effects
  techDetails: string;      // Technical notes and camera details

  metadata: ShotMetadata;
  duration: number; // in seconds
  characterCount: number;
  warnings: Warning[];
}

/**
 * Complete shot list
 */
export interface ShotList {
  title?: string;
  author?: string;
  shots: Shot[];
  totalShots: number;
  totalDuration: number;
  totalCharacters: number;
  warnings: Warning[];
  metadata: {
    generatedAt: Date;
    maxCharacters: number;
    maxShotLength: number;
    sourceFormat: 'fountain' | 'markdown' | 'plaintext';
  };
}

/**
 * Generator configuration
 */
export interface GeneratorConfig {
  maxCharacters: number;
  maxShotLength: number;
  warningThreshold: number; // percentage (e.g., 90 for 90%)
  includeContext: boolean;
  includeMetadata: boolean;
  cinematicStyle?: string;  // Formatted cinematic style name(s) for display
}

/**
 * Generator interface
 */
export interface Generator {
  /**
   * Generate shot list from parsed screenplay
   */
  generate(scenes: Scene[], config: GeneratorConfig): ShotList;
  
  /**
   * Validate shot list against limits
   */
  validate(shotList: ShotList, config: GeneratorConfig): Warning[];
}

