/**
 * Markdown Formatter
 *
 * Generates Markdown output with structured shot list, headings, metadata tables
 */

import chalk from 'chalk';
import { BaseFormatter } from './base-formatter';
import { ShotList, Shot } from '../generator/types';
import { FormatterOptions } from './types';

/**
 * Markdown formatter implementation
 */
export class MarkdownFormatter extends BaseFormatter {
  /**
   * Format shot list to Markdown
   */
  format(shotList: ShotList, options?: FormatterOptions): string {
    const parts: string[] = [];
    const maxChars = options?.maxCharacters || shotList.metadata.maxCharacters;

    // Title
    if (shotList.title) {
      parts.push(`# ${shotList.title}`);
      parts.push('');
    }

    // Author
    if (shotList.author) {
      parts.push(`**Author:** ${shotList.author}`);
      parts.push('');
    }

    // Summary metadata
    parts.push('## Summary');
    parts.push('');
    parts.push('| Metric | Value |');
    parts.push('|--------|-------|');
    parts.push(`| Total Shots | ${shotList.totalShots} |`);
    parts.push(`| Total Duration | ${this.formatTime(shotList.totalDuration)} |`);  // Requirement 3: MM:SS format
    parts.push(`| Total Characters | ${shotList.totalCharacters.toLocaleString()} |`);
    parts.push(`| Average Shot Length | ${this.formatTime(Math.round(shotList.totalDuration / shotList.totalShots))} |`);  // Requirement 3: MM:SS format
    parts.push(`| Average Characters | ${this.getAverageCharCount(shotList)} |`);
    parts.push(`| Max Characters | ${this.getMaxCharCount(shotList)} |`);
    parts.push(`| Character Limit | ${maxChars} |`);
    parts.push(`| Generated | ${shotList.metadata.generatedAt.toLocaleString()} |`);
    parts.push('');

    // Warnings summary
    if (options?.includeWarnings && shotList.warnings.length > 0) {
      parts.push('## Warnings');
      parts.push('');
      for (const warning of shotList.warnings) {
        const icon = warning.severity === 'error' ? '❌' : '⚠️';
        parts.push(`${icon} **Shot ${warning.shotNumber}**: ${warning.message}`);
        if (warning.suggestion) {
          parts.push(`   - *Suggestion: ${warning.suggestion}*`);
        }
      }
      parts.push('');
    }

    // Shot list
    parts.push('## Shot List');
    parts.push('');

    for (const shot of shotList.shots) {
      parts.push(this.formatShot(shot, maxChars, options));
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Format individual shot
   */
  private formatShot(shot: Shot, maxChars: number, options?: FormatterOptions): string {
    const parts: string[] = [];

    // Shot heading
    parts.push(`### Shot ${shot.number}`);
    parts.push('');

    // Scene heading
    parts.push(`**Scene:**`);
    parts.push('');

    // Metadata table
    if (options?.includeMetadata !== false) {
      parts.push('| Property | Value |');
      parts.push('|----------|-------|');
      parts.push(`| Duration | ${this.formatTime(shot.duration)} |`);
      parts.push(`| Shot Type | ${shot.metadata.shotType || 'medium'} |`);
      parts.push(`| Camera Movement | ${shot.metadata.cameraMovement || 'static'} |`);
      parts.push(`| Framing | ${shot.metadata.framing || 'medium'} |`);
      parts.push(`| Visual Style | ${shot.metadata.visualStyle || 'Reality'} |`);
      parts.push(`| C: | ${shot.characterCount} / ${maxChars} |`);

      parts.push('');
    }

    // Set - always has value
    parts.push('**Set:**');
    parts.push(shot.set || 'No set description provided');
    parts.push('');

    // Visual Description - always has value
    parts.push('**Description:**');
    parts.push(shot.description || 'No description provided');
    parts.push('');

    // Characters - individual sections for each character
    if (shot.characters && shot.characters.length > 0) {
      for (const char of shot.characters) {
        parts.push(`**${char.name}:**`);
        const charParts: string[] = [];

        if (char.position) charParts.push(`Position: ${char.position}`);
        if (char.physicalAppearance) charParts.push(`Appearance: ${char.physicalAppearance}`);
        if (char.wardrobe) charParts.push(`Wardrobe: ${char.wardrobe}`);
        if (char.emotion) charParts.push(`Emotion: ${char.emotion}`);
        if (char.action) charParts.push(`Action: ${char.action}`);

        parts.push(charParts.length > 0 ? charParts.join('. ') : 'No character details provided');
        parts.push('');
      }
    } else {
      // If no characters, still include a placeholder
      parts.push('**Characters:**');
      parts.push('No characters specified in this shot');
      parts.push('');
    }

    // Actions - always has value
    parts.push('**Actions:**');
    parts.push(shot.actions || 'No actions specified');
    parts.push('');

    // Dialogue - always has value
    parts.push('**Dialogue:**');
    parts.push(shot.dialogue || 'No dialogue in this shot');
    parts.push('');

    // Blocking - always has value
    parts.push('**Blocking:**');
    parts.push(shot.blocking || 'No blocking specified');
    parts.push('');

    // SFX - always has value
    parts.push('**SFX:**');
    parts.push(shot.sfx || 'No sound effects specified');
    parts.push('');

    // Technical Details - always has value
    parts.push('**Technical Details:**');
    parts.push(shot.techDetails || 'No technical details specified');

    // Shot warnings
    if (options?.includeWarnings && shot.warnings.length > 0) {
      parts.push('');
      parts.push('**Warnings:**');
      for (const warning of shot.warnings) {
        const icon = warning.severity === 'error' ? '❌' : '⚠️';
        parts.push(`${icon} ${warning.message}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Get character count status indicator
   */
  private getCharacterStatus(percentage: number): string {
    if (percentage >= 100) return '🔴';
    if (percentage >= 90) return '🟡';
    return '🟢';
  }

  /**
   * Get character count color function (Requirement 6)
   * - Green if under 4000 characters
   * - Yellow if between 4000 and 5000 characters
   * - Red if over 5000 characters
   */
  private getCharacterCountColor(charCount: number, maxChars: number): typeof chalk.green {
    if (charCount > 5000) {
      return chalk.red;
    } else if (charCount >= 4000) {
      return chalk.yellow;
    } else {
      return chalk.green;
    }
  }

  /**
   * Get duration severity color (Requirement 4)
   * - Red for shots exceeding max duration (error)
   * - Yellow for shots approaching max duration (warning)
   * - Green for shots within acceptable range
   */
  private getDurationSeverityColor(duration: number, maxDuration: number): typeof chalk.green {
    if (duration > maxDuration) {
      return chalk.red;  // Error: exceeds max
    } else if (duration >= maxDuration * 0.9) {
      return chalk.yellow;  // Warning: approaching limit
    } else {
      return chalk.green;  // OK
    }
  }

  /**
   * Get file extension
   */
  getExtension(): string {
    return 'md';
  }

  /**
   * Get MIME type
   */
  getMimeType(): string {
    return 'text/markdown';
  }
}

