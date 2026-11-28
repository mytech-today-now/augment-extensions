#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const semver = require('semver');

const repoRoot = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(['--dry-run', '--force']);
for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    console.error(`Unknown option: ${arg}`);
    process.exit(2);
  }
}
if (args.has('--dry-run') && args.has('--force')) {
  console.error('--dry-run and --force cannot be used together.');
  process.exit(2);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function matchingBraceEnd(text, openIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = openIndex; index < text.length; index++) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth++;
    else if (character === '}' && --depth === 0) return index + 1;
  }
  throw new Error('Could not locate the end of a JSON object.');
}

function replaceVersionField(text, start, end, expected, next, label) {
  const objectText = text.slice(start, end);
  const fieldPattern = /(^\s*"version"\s*:\s*")([^"]+)(")/m;
  const match = fieldPattern.exec(objectText);
  if (!match) throw new Error(`Could not find the version field in ${label}.`);
  if (match[2] !== expected) {
    throw new Error(`${label} contains ${match[2]}, expected ${expected} from VERSION.`);
  }
  const updatedObject = objectText.slice(0, match.index)
    + match[1] + next + match[3]
    + objectText.slice(match.index + match[0].length);
  return {
    text: text.slice(0, start) + updatedObject + text.slice(end),
    changed: expected !== next
  };
}

function topLevelObjectRange(text) {
  const start = text.indexOf('{');
  if (start < 0) throw new Error('Could not locate the root JSON object.');
  return { start, end: matchingBraceEnd(text, start) };
}

function packageLockRootRange(text) {
  const packagesKey = text.indexOf('"packages"');
  if (packagesKey < 0) throw new Error('package-lock.json has no packages map.');
  const rootKey = text.indexOf('""', packagesKey);
  if (rootKey < 0) throw new Error('package-lock.json has no root package entry.');
  const start = text.indexOf('{', rootKey + 2);
  if (start < 0) throw new Error('Could not locate the package-lock root package object.');
  return { start, end: matchingBraceEnd(text, start) };
}

async function confirmWrite() {
  if (!process.stdin.isTTY) {
    throw new Error('Non-interactive synchronization requires --force. Use pnpm version:sync:force.');
  }
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => prompt.question('Apply these version updates? [y/N] ', resolve));
  prompt.close();
  return /^y(es)?$/i.test(answer.trim());
}

async function main() {
  const versionPath = path.join(repoRoot, 'VERSION');
  const packagePath = path.join(repoRoot, 'package.json');
  const lockPath = path.join(repoRoot, 'package-lock.json');
  const version = fs.readFileSync(versionPath, 'utf8').trim();
  if (!semver.valid(version) || semver.valid(version) !== version) {
    throw new Error(`VERSION must contain a canonical semantic version, found: ${version || '(empty)'}`);
  }

  const packageJson = readJson(packagePath);
  const lockJson = readJson(lockPath);
  const lockRoot = lockJson.packages && lockJson.packages[''];
  if (!lockRoot) throw new Error('package-lock.json has no packages[""] root entry.');
  if (packageJson.name !== lockJson.name || packageJson.name !== lockRoot.name) {
    throw new Error('Package names differ between package.json and package-lock.json.');
  }

  let packageText = fs.readFileSync(packagePath, 'utf8');
  const packageRange = topLevelObjectRange(packageText);
  const packageUpdate = replaceVersionField(
    packageText,
    packageRange.start,
    packageRange.end,
    packageJson.version,
    version,
    'package.json'
  );
  packageText = packageUpdate.text;

  let lockText = fs.readFileSync(lockPath, 'utf8');
  const lockRange = topLevelObjectRange(lockText);
  const lockUpdate = replaceVersionField(
    lockText,
    lockRange.start,
    lockRange.end,
    lockJson.version,
    version,
    'package-lock.json top-level version'
  );
  lockText = lockUpdate.text;

  const rootRange = packageLockRootRange(lockText);
  const rootUpdate = replaceVersionField(
    lockText,
    rootRange.start,
    rootRange.end,
    lockRoot.version,
    version,
    'package-lock.json packages[""] version'
  );
  lockText = rootUpdate.text;

  const changes = [];
  if (packageUpdate.changed) changes.push({ path: 'package.json', from: packageJson.version, to: version });
  if (lockUpdate.changed) changes.push({ path: 'package-lock.json top-level version', from: lockJson.version, to: version });
  if (rootUpdate.changed) changes.push({ path: 'package-lock.json packages[""] version', from: lockRoot.version, to: version });

  if (changes.length === 0) {
    console.log(`Package metadata is already synchronized at ${version}.`);
    return;
  }
  for (const change of changes) console.log(`${change.path}: ${change.from} -> ${change.to}`);
  if (args.has('--dry-run')) {
    console.log('Dry run complete; no files were changed.');
    return;
  }
  if (!args.has('--force') && !(await confirmWrite())) {
    console.log('Synchronization cancelled; no files were changed.');
    return;
  }

  JSON.parse(packageText);
  JSON.parse(lockText);
  fs.writeFileSync(packagePath, packageText);
  fs.writeFileSync(lockPath, lockText);
  console.log(`Synchronized package metadata to ${version}.`);
}

main().catch(error => {
  console.error(`Version sync failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
