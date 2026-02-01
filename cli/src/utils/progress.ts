/**
 * Progress Indicator Utility
 * 
 * Provides progress bars and spinners for long-running operations.
 * Supports cancellation with Ctrl+C.
 */

import chalk from 'chalk';

export interface ProgressOptions {
  total?: number;
  width?: number;
  format?: string;
  clear?: boolean;
}

export class ProgressBar {
  private current: number = 0;
  private total: number;
  private width: number;
  private format: string;
  private clear: boolean;
  private startTime: number;
  private lastRender: string = '';

  constructor(options: ProgressOptions = {}) {
    this.total = options.total || 100;
    this.width = options.width || 40;
    this.format = options.format || ':bar :percent :current/:total :eta';
    this.clear = options.clear !== false;
    this.startTime = Date.now();
  }

  /**
   * Update progress
   */
  update(current: number, tokens?: Record<string, any>): void {
    this.current = current;
    this.render(tokens);
  }

  /**
   * Increment progress
   */
  tick(delta: number = 1, tokens?: Record<string, any>): void {
    this.current += delta;
    this.render(tokens);
  }

  /**
   * Render progress bar
   */
  private render(tokens?: Record<string, any>): void {
    const percent = Math.min(100, Math.max(0, (this.current / this.total) * 100));
    const complete = Math.round((this.width * percent) / 100);
    const incomplete = this.width - complete;

    const elapsed = Date.now() - this.startTime;
    const rate = this.current / (elapsed / 1000);
    const eta = this.current === 0 ? 0 : (this.total - this.current) / rate;

    const bar = chalk.green('█'.repeat(complete)) + chalk.gray('░'.repeat(incomplete));

    let output = this.format
      .replace(':bar', bar)
      .replace(':percent', `${percent.toFixed(1)}%`)
      .replace(':current', String(this.current))
      .replace(':total', String(this.total))
      .replace(':eta', this.formatTime(eta))
      .replace(':elapsed', this.formatTime(elapsed / 1000));

    // Replace custom tokens
    if (tokens) {
      for (const [key, value] of Object.entries(tokens)) {
        output = output.replace(`:${key}`, String(value));
      }
    }

    // Clear previous line and write new one
    if (this.lastRender) {
      process.stderr.write('\r' + ' '.repeat(this.lastRender.length) + '\r');
    }
    process.stderr.write(output);
    this.lastRender = output;
  }

  /**
   * Complete progress bar
   */
  complete(): void {
    this.current = this.total;
    this.render();
    if (this.clear) {
      process.stderr.write('\n');
    }
  }

  /**
   * Format time in seconds to human-readable string
   */
  private formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) {
      return '--:--';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export class Spinner {
  private frames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private currentFrame: number = 0;
  private interval: NodeJS.Timeout | null = null;
  private text: string;
  private lastRender: string = '';

  constructor(text: string = 'Processing...') {
    this.text = text;
  }

  /**
   * Start spinner
   */
  start(): void {
    this.interval = setInterval(() => {
      this.render();
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 80);
  }

  /**
   * Update spinner text
   */
  setText(text: string): void {
    this.text = text;
  }

  /**
   * Render spinner
   */
  private render(): void {
    const frame = this.frames[this.currentFrame];
    const output = `${chalk.cyan(frame)} ${this.text}`;

    // Clear previous line and write new one
    if (this.lastRender) {
      process.stderr.write('\r' + ' '.repeat(this.lastRender.length) + '\r');
    }
    process.stderr.write(output);
    this.lastRender = output;
  }

  /**
   * Stop spinner
   */
  stop(finalText?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // Clear spinner line
    if (this.lastRender) {
      process.stderr.write('\r' + ' '.repeat(this.lastRender.length) + '\r');
    }

    if (finalText) {
      process.stderr.write(finalText + '\n');
    }
  }
}

