/**
 * JSONL Formatter
 *
 * Generates JSONL (JSON Lines) output with one shot per line
 */

import { BaseFormatter } from './base-formatter';
import { ShotList, Shot, Warning } from '../generator/types';
import { FormatterOptions } from './types';

/**
 * JSONL formatter implementation
 * 
 * JSONL format: One JSON object per line, newline-separated
 * Each line is a complete, valid JSON object representing one shot
 */
export class JSONLFormatter extends BaseFormatter {
  /**
   * Format shot list to JSONL
   */
  format(shotList: ShotList, options?: FormatterOptions): string {
    const includeWarnings = options?.includeWarnings !== false; // Default to true
    
    // Convert each shot to a JSON line
    const lines = shotList.shots.map(shot => 
      JSON.stringify(this.formatShot(shot, options))
    );
    
    // Join with newlines (JSONL format)
    return lines.join('\n');
  }

  /**
   * Format individual shot for JSONL
   * Requirement 12: Include all fields from Shot interface
   */
  private formatShot(shot: Shot, options?: FormatterOptions): any {
    const includeWarnings = options?.includeWarnings !== false;

    return {
      number: shot.number,
      sceneNumber: shot.sceneNumber,
      heading: {
        raw: shot.heading.raw,
        intExt: shot.heading.intExt,
        location: shot.heading.location,
        timeOfDay: shot.heading.timeOfDay
      },
      context: {
        set: shot.context.set,
        lighting: shot.context.lighting,
        timeOfDay: shot.context.timeOfDay,
        atmosphere: shot.context.atmosphere || null,
        weather: shot.context.weather || null
      },
      characters: shot.characters.map(char => ({
        name: char.name,
        position: char.position,
        appearance: char.appearance,
        wardrobe: char.wardrobe || null,              // Requirement 10: Rich character descriptions
        physicalAppearance: char.physicalAppearance || null,  // Requirement 10: Rich character descriptions
        emotion: char.emotion || null,
        action: char.action || null
      })),
      description: shot.description,
      dialogue: shot.dialogue,  // Requirement 8 & 12: Mandatory dialogue property
      metadata: {
        shotType: shot.metadata.shotType,
        cameraMovement: shot.metadata.cameraMovement,
        framing: shot.metadata.framing,
        visualStyle: shot.metadata.visualStyle,        // Requirement 5 & 12: Visual style property
        cinematicStyle: shot.metadata.cinematicStyle || null,  // Requirement 12: Cinematic style
        technicalNotes: shot.metadata.technicalNotes || []
      },
      duration: {
        seconds: shot.duration,
        formatted: this.formatTime(shot.duration)
      },
      characterCount: {
        count: shot.characterCount,
        limit: options?.maxCharacters || shot.characterCount,
        percentage: Math.round((shot.characterCount / (options?.maxCharacters || shot.characterCount)) * 100)
      },
      warnings: includeWarnings ? this.formatWarnings(shot.warnings) : []
    };
  }

  /**
   * Format warnings for JSONL
   */
  private formatWarnings(warnings: Warning[]): any[] {
    return warnings.map(warning => ({
      type: warning.type,
      message: warning.message,
      shotNumber: warning.shotNumber,
      severity: warning.severity,
      suggestion: warning.suggestion || null
    }));
  }

  /**
   * Get file extension
   */
  getExtension(): string {
    return 'jsonl';
  }

  /**
   * Get MIME type
   */
  getMimeType(): string {
    return 'application/jsonl';
  }
}

