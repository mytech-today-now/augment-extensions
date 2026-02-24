/**
 * TXT Formatter
 *
 * Generates plain text output with simple, readable format
 * No special formatting, just clean text
 */

import { BaseFormatter } from './base-formatter';
import { ShotList, Shot } from '../generator/types';
import { FormatterOptions } from './types';

/**
 * TXT formatter implementation
 * 
 * Features:
 * - Simple, readable plain text format
 * - No special formatting or markup
 * - Text wrapping at 80 characters
 * - Clear section separators
 */
export class TXTFormatter extends BaseFormatter {
  /**
   * Format shot list to plain text
   */
  format(shotList: ShotList, options?: FormatterOptions): string {
    let output = `AI SHOT LIST: ${shotList.title || 'Untitled'}\n`;
    output += '='.repeat(80) + '\n\n';

    // Summary section
    output += `Total Shots: ${shotList.totalShots}\n`;
    output += `Total Duration: ${this.formatDuration(shotList.totalDuration)}\n`;
    output += `Average Shot Length: ${this.getAverageShotLength(shotList)} seconds\n`;
    output += `Character Count: ${this.getAverageCharCount(shotList)} avg, ${this.getMaxCharCount(shotList)} max\n\n`;

    // Warnings section
    if (shotList.warnings.length > 0) {
      output += `WARNINGS: ${shotList.warnings.length}\n`;
      shotList.warnings.forEach(w => {
        output += `- ${w.message}\n`;
      });
      output += '\n';
    }

    output += '='.repeat(80) + '\n\n';

    // Format each shot
    for (const shot of shotList.shots) {
      output += this.formatShot(shot, options);
      output += '\n' + '='.repeat(80) + '\n\n';
    }

    return output;
  }

  /**
   * Format individual shot for plain text
   */
  private formatShot(shot: Shot, options?: FormatterOptions): string {
    const maxChars = options?.maxCharacters || 4000;
    let output = `SHOT ${shot.number}\n`;
    output += '-'.repeat(6) + '\n';

    // Metadata
    output += `Duration: ${this.formatTime(shot.duration)} (${shot.duration} seconds)\n`;
    output += `Scene: ${shot.sceneNumber}\n`;
    output += `Heading: ${shot.heading.raw}\n`;
    output += `Shot Type: ${shot.metadata.shotType}\n`;
    output += `Camera Movement: ${shot.metadata.cameraMovement}\n`;
    output += `Framing: ${shot.metadata.framing}\n\n`;

    // Context
    output += `SET:\n${this.wrapText(shot.context.set, 80)}\n\n`;
    output += `LIGHTING: ${shot.context.lighting}\n`;
    output += `TIME OF DAY: ${shot.context.timeOfDay}\n`;
    if (shot.context.atmosphere) {
      output += `ATMOSPHERE: ${shot.context.atmosphere}\n`;
    }
    if (shot.context.weather) {
      output += `WEATHER: ${shot.context.weather}\n`;
    }
    output += '\n';

    // Characters
    if (shot.characters.length > 0) {
      output += `CHARACTERS:\n`;
      shot.characters.forEach(char => {
        output += `- ${char.name}:\n`;
        output += `  Position: ${char.position}\n`;
        output += `  Appearance: ${char.appearance}\n`;
        if (char.emotion) {
          output += `  Emotion: ${char.emotion}\n`;
        }
        if (char.action) {
          output += `  Action: ${char.action}\n`;
        }
      });
      output += '\n';
    }

    // Description
    output += `DESCRIPTION:\n${this.wrapText(shot.description, 80)}\n\n`;

    // Technical notes
    if (shot.metadata.technicalNotes && shot.metadata.technicalNotes.length > 0) {
      output += `TECHNICAL NOTES:\n`;
      shot.metadata.technicalNotes.forEach(note => {
        output += `- ${note}\n`;
      });
      output += '\n';
    }

    // Character count
    const percentage = Math.round((shot.characterCount / maxChars) * 100);
    output += `CHARACTER COUNT: ${shot.characterCount} / ${maxChars} (${percentage}%)\n`;

    // Warnings
    if (shot.warnings.length > 0) {
      output += `\nWARNINGS:\n`;
      shot.warnings.forEach(warning => {
        output += `- [${warning.severity.toUpperCase()}] ${warning.message}\n`;
      });
    }

    return output;
  }

  /**
   * Get file extension
   */
  getExtension(): string {
    return 'txt';
  }

  /**
   * Get MIME type
   */
  getMimeType(): string {
    return 'text/plain';
  }
}

