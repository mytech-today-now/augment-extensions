/**
 * Stream Reader Utility
 * 
 * Provides streaming file reading for large files to reduce memory usage.
 * Supports chunked content processing and memory-efficient operations.
 */

import * as fs from 'fs';
import * as readline from 'readline';

export interface StreamOptions {
  chunkSize?: number; // Size of each chunk in bytes (default: 64KB)
  encoding?: BufferEncoding; // File encoding (default: 'utf-8')
  highWaterMark?: number; // Stream buffer size (default: 64KB)
}

export interface StreamStats {
  bytesRead: number;
  linesRead: number;
  chunksProcessed: number;
  memoryUsed: number;
}

/**
 * Read file in chunks using streams
 */
export async function readFileStreaming(
  filePath: string,
  onChunk: (chunk: string, stats: StreamStats) => void | Promise<void>,
  options: StreamOptions = {}
): Promise<StreamStats> {
  const {
    encoding = 'utf-8',
    highWaterMark = 64 * 1024 // 64KB default
  } = options;

  const stats: StreamStats = {
    bytesRead: 0,
    linesRead: 0,
    chunksProcessed: 0,
    memoryUsed: 0
  };

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, {
      encoding,
      highWaterMark
    });

    stream.on('data', async (chunk: string | Buffer) => {
      const chunkStr = typeof chunk === 'string' ? chunk : chunk.toString(encoding);
      stats.bytesRead += Buffer.byteLength(chunkStr, encoding);
      stats.chunksProcessed++;
      stats.memoryUsed = process.memoryUsage().heapUsed;

      try {
        await onChunk(chunkStr, stats);
      } catch (error) {
        stream.destroy();
        reject(error);
      }
    });

    stream.on('end', () => {
      resolve(stats);
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Read file line by line using streams
 */
export async function readFileLineByLine(
  filePath: string,
  onLine: (line: string, lineNumber: number, stats: StreamStats) => void | Promise<void>,
  options: StreamOptions = {}
): Promise<StreamStats> {
  const {
    encoding = 'utf-8',
    highWaterMark = 64 * 1024
  } = options;

  const stats: StreamStats = {
    bytesRead: 0,
    linesRead: 0,
    chunksProcessed: 0,
    memoryUsed: 0
  };

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, {
      encoding,
      highWaterMark
    });

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    rl.on('line', async (line: string) => {
      stats.linesRead++;
      stats.bytesRead += Buffer.byteLength(line + '\n', encoding);
      stats.memoryUsed = process.memoryUsage().heapUsed;

      try {
        await onLine(line, stats.linesRead, stats);
      } catch (error) {
        rl.close();
        stream.destroy();
        reject(error);
      }
    });

    rl.on('close', () => {
      resolve(stats);
    });

    stream.on('error', (error) => {
      rl.close();
      reject(error);
    });
  });
}

/**
 * Read file with pagination support (memory-efficient)
 */
export async function readFilePaginated(
  filePath: string,
  page: number = 1,
  pageSize: number = 100,
  options: StreamOptions = {}
): Promise<{ lines: string[]; totalLines: number; hasMore: boolean }> {
  const startLine = (page - 1) * pageSize;
  const endLine = startLine + pageSize;
  const lines: string[] = [];
  let totalLines = 0;

  await readFileLineByLine(
    filePath,
    async (line, lineNumber) => {
      totalLines = lineNumber;
      if (lineNumber > startLine && lineNumber <= endLine) {
        lines.push(line);
      }
    },
    options
  );

  return {
    lines,
    totalLines,
    hasMore: totalLines > endLine
  };
}

