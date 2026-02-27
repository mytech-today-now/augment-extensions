/**
 * Markdown Formatter
 *
 * Generates Markdown output with structured shot list, headings, metadata tables
 */

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
    const charPercentage = Math.round((shot.characterCount / maxChars) * 100);
    const charStatus = this.getCharacterStatus(charPercentage);

    // Shot heading
    parts.push(`### Shot ${shot.number}`);
    parts.push('');

    // Scene heading
    parts.push(`**Scene:** ${shot.heading.raw}`);
    parts.push('');

    // Metadata table
    if (options?.includeMetadata !== false) {
      parts.push('| Property | Value |');
      parts.push('|----------|-------|');
      parts.push(`| Duration | ${this.formatTime(shot.duration)} |`);
      parts.push(`| Shot Type | ${shot.metadata.shotType} |`);
      parts.push(`| Camera Movement | ${shot.metadata.cameraMovement} |`);
      parts.push(`| Framing | ${shot.metadata.framing} |`);
      // Requirement 6: Simplified character count display
      parts.push(`| Characters | ${shot.characterCount}/${maxChars} (${charPercentage}%) ${charStatus} |`);
      
      if (shot.metadata.technicalNotes && shot.metadata.technicalNotes.length > 0) {
        parts.push(`| Technical Notes | ${shot.metadata.technicalNotes.join(', ')} |`);
      }
      
      parts.push('');
    }

    // Context
    parts.push('**Context:**');
    parts.push(`- Set: ${shot.context.set}`);
    parts.push(`- Time: ${shot.context.timeOfDay}`);
    parts.push(`- Lighting: ${shot.context.lighting}`);
    if (shot.context.atmosphere) {
      parts.push(`- Atmosphere: ${shot.context.atmosphere}`);
    }
    if (shot.context.weather) {
      parts.push(`- Weather: ${shot.context.weather}`);
    }
    parts.push('');

    // Characters
    if (shot.characters.length > 0) {
      parts.push('**Characters:**');
      for (const char of shot.characters) {
        let charLine = `- ${char.name}`;
        if (char.position) charLine += ` (${char.position})`;
        if (char.emotion) charLine += ` - ${char.emotion}`;
        if (char.action) charLine += ` - ${char.action}`;
        parts.push(charLine);
      }
      parts.push('');
    }

    // Description
    parts.push('**Description:**');
    parts.push('');
    parts.push(shot.description);

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

