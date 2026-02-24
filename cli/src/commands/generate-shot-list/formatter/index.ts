/**
 * Shot List Formatter
 *
 * Main orchestration for formatting shot lists to various output formats
 */

import { OutputFormat, Formatter } from './types';
import { BaseFormatter, timeFormatter, textWrapper } from './base-formatter';
import { HTMLFormatter } from './html-formatter';
import { MarkdownFormatter } from './markdown-formatter';
import { JSONFormatter } from './json-formatter';
import { JSONLFormatter } from './jsonl-formatter';
import { CSVFormatter } from './csv-formatter';
import { TXTFormatter } from './txt-formatter';

// Re-export utilities and base class
export { BaseFormatter, timeFormatter, textWrapper };

/**
 * Formatter factory
 */
export function createFormatter(format: OutputFormat): Formatter {
  switch (format) {
    case 'md':
      return new MarkdownFormatter();
    case 'json':
      return new JSONFormatter();
    case 'jsonl':
      return new JSONLFormatter();
    case 'csv':
      return new CSVFormatter();
    case 'txt':
      return new TXTFormatter();
    case 'html':
      return new HTMLFormatter();
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

