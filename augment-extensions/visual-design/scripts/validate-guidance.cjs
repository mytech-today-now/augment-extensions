'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_PATH_FIELDS = ['rules', 'guidelines', 'skills'];
const REQUIRED_SINGLE_PATH_FIELDS = ['coverageMap', 'responsiveRunner', 'validationScript'];
const VALID_MODULE_TYPES = [
  'coding-standards',
  'domain-rules',
  'workflows',
  'examples',
  'marketing-standards',
  'writing-standards',
  'themes'
];

function isContained(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function markdownSlug(heading) {
  return heading
    .replace(/^#+\s+/, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\x60*_~]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function validateMarkdownLinks(moduleRoot, markdownPaths, errors) {
  const filesToCheck = new Set(markdownPaths);
  filesToCheck.add('README.md');
  for (const relativePath of filesToCheck) {
    const sourcePath = path.resolve(moduleRoot, relativePath);
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) continue;
    const source = fs.readFileSync(sourcePath, 'utf8');
    const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
    let match;
    while ((match = linkPattern.exec(source)) !== null) {
      const target = match[1].trim().split(/\s+/)[0];
      if (/^(https?:|mailto:|tel:|#)/i.test(target)) continue;
      const hashIndex = target.indexOf('#');
      const pathname = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
      const fragment = hashIndex >= 0 ? decodeURIComponent(target.slice(hashIndex + 1)) : '';
      const destination = path.resolve(path.dirname(sourcePath), decodeURIComponent(pathname || path.basename(sourcePath)));
      if (!isContained(moduleRoot, destination)) {
        errors.push(relativePath + ' has a link outside the module: ' + target);
        continue;
      }
      if (!fs.existsSync(destination) || !fs.statSync(destination).isFile()) {
        errors.push(relativePath + ' links to a missing file: ' + target);
        continue;
      }
      if (fragment) {
        const destinationText = fs.readFileSync(destination, 'utf8');
        const headings = destinationText.match(/^#{1,6}\s+.+$/gm) || [];
        const slugs = new Set(headings.map(markdownSlug));
        const htmlIds = new Set(Array.from(destinationText.matchAll(/\bid=["']([^"']+)["']/g), (id) => id[1]));
        if (!slugs.has(fragment.toLowerCase()) && !htmlIds.has(fragment)) {
          errors.push(relativePath + ' links to a missing heading: ' + target);
        }
      }
    }
  }
}

function calculateCharacterCount(moduleRoot) {
  let total = 0;
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.isFile()) total += fs.readFileSync(target, 'utf8').length;
    }
  }
  visit(moduleRoot);
  return total;
}

function validateSidecarMetadata(moduleRoot, metadata, guidance, errors) {
  const sidecarPath = path.join(moduleRoot, 'metadata.json');
  if (!fs.existsSync(sidecarPath)) {
    errors.push('metadata.json is missing.');
    return;
  }

  let sidecar;
  try {
    sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
  } catch (error) {
    errors.push('Unable to parse metadata.json: ' + error.message);
    return;
  }

  if (sidecar.version !== metadata.version) {
    errors.push('metadata.json version does not match module.json.');
  }
  if (!sidecar.files || typeof sidecar.files !== 'object' || Array.isArray(sidecar.files)) {
    errors.push('metadata.json files must be an object.');
    return;
  }

  for (const field of REQUIRED_PATH_FIELDS) {
    const expected = Array.isArray(guidance[field])
      ? guidance[field].map((relativePath) => relativePath.replace(new RegExp('^' + field + '/'), ''))
      : [];
    if (!Array.isArray(sidecar.files[field]) || JSON.stringify(sidecar.files[field]) !== JSON.stringify(expected)) {
      errors.push('metadata.json files.' + field + ' must match module.json contents.guidance.' + field + '.');
    }
  }

  const actualCharacterCount = calculateCharacterCount(moduleRoot);
  if (metadata.characterCount !== undefined && metadata.characterCount !== actualCharacterCount) {
    errors.push('module.json characterCount does not match the module files.');
  }
  if (metadata.augment && metadata.augment.characterCount !== undefined && metadata.augment.characterCount !== actualCharacterCount) {
    errors.push('module.json augment.characterCount does not match the module files.');
  }
  if (sidecar.characterCount !== undefined && sidecar.characterCount !== actualCharacterCount) {
    errors.push('metadata.json characterCount does not match the module files.');
  }
}

function validateGuidanceModule(moduleRoot) {
  const errors = [];
  const manifestPath = path.join(moduleRoot, 'module.json');
  if (!fs.existsSync(manifestPath)) return { errors: ['module.json is missing.'] };

  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    return { errors: ['Unable to parse module.json: ' + error.message] };
  }

  for (const field of ['name', 'version', 'displayName', 'description', 'type']) {
    if (!metadata || typeof metadata[field] !== 'string' || metadata[field].trim() === '') {
      errors.push('module.json is missing a valid ' + field + ' field.');
    }
  }
  if (metadata && metadata.type && !VALID_MODULE_TYPES.includes(metadata.type)) {
    errors.push('module.json has unsupported type: ' + metadata.type + '.');
  }

  const guidance = metadata && metadata.contents && metadata.contents.guidance;
  if (!guidance || typeof guidance !== 'object' || Array.isArray(guidance)) {
    return { errors: errors.concat(['module.json contents.guidance must be an object.']) };
  }

  const markdownPaths = [];
  function validatePath(relativePath, label, markdownRequired) {
    if (typeof relativePath !== 'string' || relativePath.trim() === '') {
      errors.push('contents.guidance.' + label + ' must be a non-empty module-relative path.');
      return;
    }
    if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes('..')) {
      errors.push('contents.guidance.' + label + ' must stay inside the module: ' + relativePath);
      return;
    }
    const resolved = path.resolve(moduleRoot, relativePath);
    if (!isContained(moduleRoot, resolved)) {
      errors.push('contents.guidance.' + label + ' resolves outside the module: ' + relativePath);
      return;
    }
    if (markdownRequired && path.extname(relativePath).toLowerCase() !== '.md') {
      errors.push('contents.guidance.' + label + ' must reference a Markdown file: ' + relativePath);
      return;
    }
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      errors.push('Referenced file for contents.guidance.' + label + ' was not found: ' + relativePath);
      return;
    }
    if (markdownRequired) markdownPaths.push(relativePath);
  }

  for (const field of REQUIRED_PATH_FIELDS) {
    if (!Array.isArray(guidance[field]) || guidance[field].length === 0) {
      errors.push('contents.guidance.' + field + ' must be a non-empty array.');
      continue;
    }
    guidance[field].forEach((relativePath, index) => validatePath(relativePath, field + '[' + index + ']', true));
  }
  for (const field of REQUIRED_SINGLE_PATH_FIELDS) {
    validatePath(guidance[field], field, field === 'coverageMap');
  }
  validateSidecarMetadata(moduleRoot, metadata, guidance, errors);
  validateMarkdownLinks(moduleRoot, markdownPaths, errors);
  return { errors };
}

function parseModuleDirectory(argv) {
  let moduleRoot = path.resolve(__dirname, '..');
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--module-dir') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('Missing value for --module-dir.');
      moduleRoot = path.resolve(value);
      index += 1;
    } else if (argv[index] === '--help' || argv[index] === '-h') {
      console.log('Usage: node scripts/validate-guidance.cjs [--module-dir <path>]');
      return null;
    } else {
      throw new Error('Unknown option: ' + argv[index]);
    }
  }
  return moduleRoot;
}

function main() {
  try {
    const moduleRoot = parseModuleDirectory(process.argv.slice(2));
    if (!moduleRoot) return;
    const result = validateGuidanceModule(moduleRoot);
    if (result.errors.length > 0) {
      console.error('Visual Design guidance validation failed:');
      result.errors.forEach((error) => console.error('- ' + error));
      process.exitCode = 1;
      return;
    }
    console.log('Visual Design guidance validation passed for ' + moduleRoot);
  } catch (error) {
    console.error('Visual Design guidance validation failed: ' + error.message);
    process.exitCode = 2;
  }
}

module.exports = { validateGuidanceModule, markdownSlug };
if (require.main === module) main();
