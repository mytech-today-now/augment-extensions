/**
 * Metadata Extractor
 * 
 * Implements shot metadata extraction: determine shot type (establishing, close-up, etc.),
 * camera movement (static, pan, etc.), framing (wide, medium, close-up),
 * extract technical notes from action lines.
 * 
 * Task: bd-shot-list-3.4
 */

import { SceneElement, ActionElement, DialogueElement } from '../parser/types';
import { ShotMetadata, ShotType, CameraMovement, CameraFraming } from './types';

/**
 * Metadata extractor configuration
 */
export interface MetadataExtractorConfig {
  extractTechnicalNotes: boolean;
  inferFromContext: boolean;
}

/**
 * Metadata Extractor class
 */
export class MetadataExtractor {
  private config: MetadataExtractorConfig;

  constructor(config: MetadataExtractorConfig) {
    this.config = config;
  }

  /**
   * Extract metadata from scene elements
   */
  extract(elements: SceneElement[], isFirstShot: boolean): ShotMetadata {
    const shotType = this.determineShotType(elements, isFirstShot);
    const cameraMovement = this.determineCameraMovement(elements);
    const framing = this.determineFraming(elements);
    const technicalNotes = this.config.extractTechnicalNotes
      ? this.extractTechnicalNotes(elements)
      : undefined;

    return {
      shotType,
      cameraMovement,
      framing,
      visualStyle: 'Reality', // Default to Reality (Requirement 5)
      technicalNotes
    };
  }

  /**
   * Determine shot type from elements
   */
  private determineShotType(elements: SceneElement[], isFirstShot: boolean): ShotType {
    // First shot of a scene is typically establishing
    if (isFirstShot) {
      return 'establishing';
    }

    // Check action lines for shot type keywords
    for (const element of elements) {
      if (element.type === 'action') {
        const text = element.text.toLowerCase();
        
        if (text.includes('close-up') || text.includes('closeup') || text.includes('cu')) {
          return 'close-up';
        } else if (text.includes('extreme close-up') || text.includes('ecu')) {
          return 'extreme-close-up';
        } else if (text.includes('wide shot') || text.includes('ws')) {
          return 'wide';
        } else if (text.includes('medium shot') || text.includes('ms')) {
          return 'medium';
        } else if (text.includes('over the shoulder') || text.includes('ots')) {
          return 'over-the-shoulder';
        } else if (text.includes('pov') || text.includes('point of view')) {
          return 'point-of-view';
        } else if (text.includes('insert')) {
          return 'insert';
        } else if (text.includes('cutaway')) {
          return 'cutaway';
        }
      }
    }

    // Default based on content
    const hasDialogue = elements.some(el => el.type === 'dialogue');
    return hasDialogue ? 'medium' : 'wide';
  }

  /**
   * Determine camera movement from elements
   */
  private determineCameraMovement(elements: SceneElement[]): CameraMovement {
    for (const element of elements) {
      if (element.type === 'action') {
        const text = element.text.toLowerCase();
        
        if (text.includes('pan')) {
          return 'pan';
        } else if (text.includes('tilt')) {
          return 'tilt';
        } else if (text.includes('dolly')) {
          return 'dolly';
        } else if (text.includes('track')) {
          return 'track';
        } else if (text.includes('crane')) {
          return 'crane';
        } else if (text.includes('handheld')) {
          return 'handheld';
        } else if (text.includes('steadicam')) {
          return 'steadicam';
        } else if (text.includes('zoom')) {
          return 'zoom';
        }
      }
    }

    return 'static';
  }

  /**
   * Determine framing from elements
   */
  private determineFraming(elements: SceneElement[]): CameraFraming {
    for (const element of elements) {
      if (element.type === 'action') {
        const text = element.text.toLowerCase();
        
        if (text.includes('close-up') || text.includes('closeup') || text.includes('cu')) {
          return 'close-up';
        } else if (text.includes('extreme close-up') || text.includes('ecu')) {
          return 'extreme-close-up';
        } else if (text.includes('medium close-up') || text.includes('mcu')) {
          return 'medium-close-up';
        } else if (text.includes('medium shot') || text.includes('ms')) {
          return 'medium-shot';
        } else if (text.includes('full shot') || text.includes('fs')) {
          return 'full-shot';
        } else if (text.includes('wide') || text.includes('ws')) {
          return 'wide';
        }
      }
    }

    // Default based on dialogue presence
    const hasDialogue = elements.some(el => el.type === 'dialogue');
    return hasDialogue ? 'medium' : 'wide';
  }

  /**
   * Extract technical notes from action lines
   */
  private extractTechnicalNotes(elements: SceneElement[]): string[] | undefined {
    const notes: string[] = [];
    const technicalKeywords = [
      'focus', 'lens', 'aperture', 'lighting', 'shadow', 'color',
      'filter', 'exposure', 'depth of field', 'bokeh', 'rack focus',
      'slow motion', 'time lapse', 'freeze frame'
    ];

    for (const element of elements) {
      if (element.type === 'action') {
        const text = element.text.toLowerCase();

        for (const keyword of technicalKeywords) {
          if (text.includes(keyword)) {
            notes.push(element.text);
            break; // Only add each action line once
          }
        }
      }
    }

    return notes.length > 0 ? notes : undefined;
  }
}

