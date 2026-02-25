/**
 * CSV Formatter
 *
 * Generates CSV output with header row and proper escaping
 * Compatible with Excel and Google Sheets
 */

import { stringify } from 'csv-stringify/sync';
import { BaseFormatter } from './base-formatter';
import { ShotList, Shot } from '../generator/types';
import { FormatterOptions } from './types';

/**
 * CSV formatter implementation
 * 
 * Features:
 * - Header row with column names
 * - Proper escaping of special characters (quotes, commas, newlines)
 * - Excel/Google Sheets compatibility
 * - Semicolon-separated lists for multi-value fields
 */
export class CSVFormatter extends BaseFormatter {
  /**
   * Format shot list to CSV
   */
  format(shotList: ShotList, options?: FormatterOptions): string {
    // Build CSV records from shots
    const records = shotList.shots.map(shot => this.formatShot(shot, options));
    
    // Use csv-stringify library for proper escaping and formatting
    return stringify(records, {
      header: true,
      quoted: true, // Quote all fields for safety
      columns: [
        { key: 'shotNumber', header: 'Shot Number' },
        { key: 'sceneNumber', header: 'Scene Number' },
        { key: 'heading', header: 'Scene Heading' },
        { key: 'intExt', header: 'INT/EXT' },
        { key: 'location', header: 'Location' },
        { key: 'timeOfDay', header: 'Time of Day' },
        { key: 'set', header: 'Set' },
        { key: 'lighting', header: 'Lighting' },
        { key: 'atmosphere', header: 'Atmosphere' },
        { key: 'characters', header: 'Characters' },
        { key: 'description', header: 'Description' },
        { key: 'shotType', header: 'Shot Type' },
        { key: 'cameraMovement', header: 'Camera Movement' },
        { key: 'framing', header: 'Framing' },
        { key: 'technicalNotes', header: 'Technical Notes' },
        { key: 'duration', header: 'Duration (seconds)' },
        { key: 'durationFormatted', header: 'Duration (formatted)' },
        { key: 'characterCount', header: 'Character Count' },
        { key: 'characterPercentage', header: 'Character %' }
      ]
    });
  }

  /**
   * Format individual shot for CSV
   */
  private formatShot(shot: Shot, options?: FormatterOptions): any {
    const maxChars = options?.maxCharacters || 4000;
    
    return {
      shotNumber: shot.number,
      sceneNumber: shot.sceneNumber,
      heading: shot.heading.raw,
      intExt: shot.heading.intExt,
      location: shot.heading.location,
      timeOfDay: shot.heading.timeOfDay,
      set: shot.context.set,
      lighting: shot.context.lighting,
      atmosphere: shot.context.atmosphere || '',
      characters: this.formatCharacters(shot.characters),
      description: shot.description,
      shotType: shot.metadata.shotType,
      cameraMovement: shot.metadata.cameraMovement,
      framing: shot.metadata.framing,
      technicalNotes: this.formatTechnicalNotes(shot.metadata.technicalNotes || []),
      duration: shot.duration,
      durationFormatted: this.formatTime(shot.duration),
      characterCount: shot.characterCount,
      characterPercentage: Math.round((shot.characterCount / maxChars) * 100)
    };
  }

  /**
   * Format characters list for CSV (semicolon-separated)
   */
  private formatCharacters(characters: any[]): string {
    return characters
      .map(char => `${char.name} (${char.position}, ${char.appearance})`)
      .join('; ');
  }

  /**
   * Format technical notes for CSV (semicolon-separated)
   */
  private formatTechnicalNotes(notes: string[]): string {
    return notes.join('; ');
  }

  /**
   * Get file extension
   */
  getExtension(): string {
    return 'csv';
  }

  /**
   * Get MIME type
   */
  getMimeType(): string {
    return 'text/csv';
  }
}

