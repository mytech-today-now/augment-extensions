import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { deflateRawSync } from 'zlib';
import * as unzipper from 'unzipper';

export interface ZipArchiveEntry {
  relativePath: string;
  data: Buffer;
  modifiedAt?: Date;
}

export interface ZipArchiveOptions {
  rootFolder?: string;
}

export interface ZipArchiveResult {
  path: string;
  checksum: string;
  fileCount: number;
}

export interface ZipExtractOptions {
  force?: boolean;
}

export interface ZipExtractResult {
  extracted: number;
  directories: number;
}

interface InternalArchiveEntry extends ZipArchiveEntry {
  normalizedPath: string;
}

const CRC32_TABLE = buildCrc32Table();

function buildCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let crc = index;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 1) !== 0 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[index] = crc >>> 0;
  }
  return table;
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index++) {
    const byte = data[index];
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (~crc) >>> 0;
}

function sha256Buffer(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function toDosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(1980, date.getFullYear());
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  return { time: dosTime, date: dosDate };
}

function normalizeArchivePath(relativePath: string): string | null {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) {
    return null;
  }
  if (/^[A-Za-z]:/.test(normalized)) {
    return null;
  }

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    return null;
  }

  return segments.join('/');
}

function ensureContainedPath(rootAbs: string, candidateAbs: string): void {
  const relative = path.relative(rootAbs, candidateAbs);
  if (relative.length === 0 || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return;
  }

  throw new Error(`Refusing to write outside destination root: ${candidateAbs}`);
}

function ensureNoSymlinkAncestors(rootAbs: string, candidateAbs: string): void {
  const relative = path.relative(rootAbs, candidateAbs);
  if (relative.length === 0) {
    return;
  }

  const segments = relative.split(path.sep).filter(Boolean);
  let current = rootAbs;
  for (const segment of segments) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) {
      break;
    }
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to extract through symbolic link: ${current}`);
    }
  }
}

function readArchiveEntries(sourceDir: string, rootFolder?: string): InternalArchiveEntry[] {
  const rootAbs = fs.realpathSync(sourceDir);
  const entries: InternalArchiveEntry[] = [];

  function walk(dirAbs: string): void {
    for (const dirent of fs.readdirSync(dirAbs, { withFileTypes: true })) {
      const absPath = path.join(dirAbs, dirent.name);
      const stat = fs.lstatSync(absPath);

      if (stat.isSymbolicLink()) {
        throw new Error(`Refusing to archive symbolic link: ${absPath}`);
      }

      if (dirent.isDirectory()) {
        walk(absPath);
        continue;
      }

      if (!dirent.isFile()) {
        continue;
      }

      const relative = path.relative(rootAbs, absPath).split(path.sep).join('/');
      const archiveRelative = rootFolder ? path.posix.join(rootFolder, relative) : relative;
      const normalizedPath = normalizeArchivePath(archiveRelative);

      if (!normalizedPath) {
        throw new Error(`Unsafe archive path: ${archiveRelative}`);
      }

      entries.push({
        relativePath: archiveRelative,
        normalizedPath,
        data: fs.readFileSync(absPath),
        modifiedAt: stat.mtime
      });
    }
  }

  walk(rootAbs);
  entries.sort((a, b) => a.normalizedPath.localeCompare(b.normalizedPath));
  return entries;
}

function buildZipBuffer(entries: readonly InternalArchiveEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const compressed = deflateRawSync(entry.data);
    const fileName = Buffer.from(entry.normalizedPath, 'utf8');
    const crc = crc32(entry.data);
    const modified = toDosDateTime(entry.modifiedAt ?? new Date());

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(modified.time, 10);
    localHeader.writeUInt16LE(modified.date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, fileName, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(modified.time, 12);
    centralHeader.writeUInt16LE(modified.date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(localOffset, 42);

    centralParts.push(centralHeader, fileName);

    localOffset += localHeader.length + fileName.length + compressed.length;
  }

  const centralDirectoryOffset = localOffset;
  const centralDirectorySize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectorySize, 12);
  eocd.writeUInt32LE(centralDirectoryOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

export function createZipArchiveFromEntries(
  entries: readonly ZipArchiveEntry[],
  outputPath: string,
  options: ZipArchiveOptions = {}
): ZipArchiveResult {
  if (entries.length === 0) {
    throw new Error('Cannot create an archive with no entries');
  }

  const normalizedEntries = entries.map((entry) => {
    const normalizedPath = normalizeArchivePath(entry.relativePath);
    if (!normalizedPath) {
      throw new Error(`Unsafe archive path: ${entry.relativePath}`);
    }
    return {
      ...entry,
      normalizedPath
    };
  });

  const buffer = buildZipBuffer(normalizedEntries);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);

  return {
    path: outputPath,
    checksum: sha256Buffer(buffer),
    fileCount: normalizedEntries.length
  };
}

export function createZipArchiveFromDirectory(
  sourceDir: string,
  outputPath: string,
  options: ZipArchiveOptions = {}
): ZipArchiveResult {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  const rootFolder = options.rootFolder ?? path.basename(path.resolve(sourceDir));
  const entries = readArchiveEntries(sourceDir, rootFolder);
  return createZipArchiveFromEntries(entries, outputPath, { rootFolder });
}

export async function extractZipArchiveSafely(
  zipPath: string,
  destinationDir: string,
  options: ZipExtractOptions = {}
): Promise<ZipExtractResult> {
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Archive not found: ${zipPath}`);
  }

  const destinationRoot = path.resolve(destinationDir);
  fs.mkdirSync(destinationRoot, { recursive: true });

  const directory = await unzipper.Open.file(zipPath);
  let extracted = 0;
  let directories = 0;

  for (const entry of directory.files) {
    const normalized = normalizeArchivePath(entry.path);
    if (!normalized) {
      throw new Error(`Unsafe archive entry path: ${entry.path}`);
    }

    const targetPath = path.resolve(destinationRoot, normalized);
    ensureContainedPath(destinationRoot, targetPath);
    ensureNoSymlinkAncestors(destinationRoot, path.dirname(targetPath));

    if (entry.type === 'Directory') {
      fs.mkdirSync(targetPath, { recursive: true });
      directories++;
      continue;
    }

    if (entry.type !== 'File') {
      throw new Error(`Unsupported archive entry type: ${entry.type}`);
    }

    if (fs.existsSync(targetPath)) {
      const stat = fs.lstatSync(targetPath);
      if (stat.isSymbolicLink()) {
        throw new Error(`Refusing to overwrite symbolic link: ${targetPath}`);
      }
      if (!options.force) {
        throw new Error(`Refusing to overwrite existing file without force: ${targetPath}`);
      }
    }

    const data = await entry.buffer();
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, data);
    extracted++;
  }

  return { extracted, directories };
}

export function checksumFile(filePath: string): string {
  return sha256Buffer(fs.readFileSync(filePath));
}

