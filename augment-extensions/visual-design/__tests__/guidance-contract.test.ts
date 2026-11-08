import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { calculateModuleCharacterCount, findModule, validateModuleMetadata } from '../../../cli/src/utils/module-system';
import { ModuleLoader } from '../../../cli/src/core/module-loader';
import { DEFAULT_VENDOR_PRIORITY } from '../style-selector';

const responsiveSweep = require('../skills/responsive-validation/scripts/responsive-sweep.cjs') as {
  ASPECT_RATIOS: Array<{ name: string; value: number }>;
  parseArguments: (argv: string[]) => Record<string, unknown>;
  buildViewportPlan: (options?: Record<string, unknown>) => Array<{
    width: number;
    height: number;
    labels: string[];
    boundary: boolean;
  }>;
  evaluateViewportMetrics: (metrics: Record<string, unknown>) => {
    status: string;
    failures: string[];
    review: string[];
  };
};

const guidanceValidator = require('../scripts/validate-guidance.cjs') as {
  validateGuidanceModule: (moduleRoot: string) => { errors: string[] };
};

const moduleRoot = path.resolve(__dirname, '..');
const guidance = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'module.json'), 'utf8')).contents.guidance;

function makeValidFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-design-guidance-'));
  const metadata = {
    name: 'visual-design-fixture',
    version: '1.0.0',
    displayName: 'Visual Design Fixture',
    description: 'A fixture for validating visual design guidance paths.',
    type: 'domain-rules',
    contents: {
      guidance: {
        rules: ['rules/index.md'],
        guidelines: ['guidelines/levels.md'],
        skills: ['skills/review.md'],
        coverageMap: 'guidelines/levels.md',
        responsiveRunner: 'skills/responsive-sweep.cjs',
        validationScript: 'scripts/validate-guidance.cjs'
      }
    }
  };
  fs.writeFileSync(path.join(root, 'module.json'), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(root, 'metadata.json'), JSON.stringify({
    version: '1.0.0',
    files: { rules: ['index.md'], guidelines: ['levels.md'], skills: ['review.md'] }
  }, null, 2));
  const files: Record<string, string> = {
    'README.md': 'Fixture module.',
    'rules/index.md': '[Levels](../guidelines/levels.md#basic-levels)',
    'guidelines/levels.md': '## Basic Levels\n\nUsable guidance.',
    'skills/review.md': '[Rules](../rules/index.md)',
    'skills/responsive-sweep.cjs': 'module.exports = {};\n',
    'scripts/validate-guidance.cjs': 'module.exports = {};\n'
  };
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }
  return root;
}

describe('Visual Design guidance contract', () => {
  let temporaryRoots: string[] = [];

  afterEach(() => {
    for (const root of temporaryRoots) fs.rmSync(root, { recursive: true, force: true });
    temporaryRoots = [];
  });

  it('keeps the module discoverable and version-loadable through existing CLI mechanisms', () => {
    const discovered = findModule('visual-design');
    expect(discovered?.fullName).toBe('visual-design');
    expect(discovered?.rules).toEqual(expect.arrayContaining([
      'index.md',
      'design-practice.md',
      'accessibility-and-color.md',
      'platform-guidance.md'
    ]));

    const loaded = new ModuleLoader().load(moduleRoot, { version: '1.0.0', useCache: false });
    expect(loaded?.version).toBe('1.0.0');
    expect(loaded?.module.metadata.name).toBe('visual-design');
  });

  it('keeps vendor selection priority unchanged', () => {
    expect(DEFAULT_VENDOR_PRIORITY).toEqual(['google', 'microsoft', 'amazon']);
  });

  it('keeps declared core, vendor, and domain file references available', () => {
    const moduleMetadata = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'module.json'), 'utf8'));
    for (const relativePath of moduleMetadata.contents.core) {
      expect(fs.existsSync(path.join(moduleRoot, relativePath))).toBe(true);
    }
    for (const [directory, files] of Object.entries(moduleMetadata.contents.vendors)) {
      for (const relativePath of files as string[]) {
        expect(fs.existsSync(path.join(moduleRoot, 'domains', directory, relativePath))).toBe(true);
      }
    }
    for (const [directory, files] of Object.entries(moduleMetadata.contents.domains)) {
      for (const relativePath of files as string[]) {
        expect(fs.existsSync(path.join(moduleRoot, 'domains', directory, relativePath))).toBe(true);
      }
    }
  });

  it('declares the guidance paths used by the module', () => {
    for (const field of ['rules', 'guidelines', 'skills']) {
      expect(guidance[field].length).toBeGreaterThan(0);
      for (const relativePath of guidance[field]) {
        expect(fs.existsSync(path.join(moduleRoot, relativePath))).toBe(true);
      }
    }
    expect(fs.existsSync(path.join(moduleRoot, guidance.coverageMap))).toBe(true);
    expect(fs.existsSync(path.join(moduleRoot, guidance.responsiveRunner))).toBe(true);
    expect(fs.existsSync(path.join(moduleRoot, guidance.validationScript))).toBe(true);
    expect(guidance.rules).toContain('rules/index.md');
    expect(guidance.guidelines).toContain('guidelines/coverage-map.md');
    expect(guidance.skills).toEqual(expect.arrayContaining([
      'skills/design-brief.md',
      'skills/design-review.md',
      'skills/responsive-validation/SKILL.md'
    ]));
  });

  it('maps every required design and platform area to three levels', () => {
    const coverageMap = fs.readFileSync(path.join(moduleRoot, guidance.coverageMap), 'utf8');
    const requiredAreas = [
      'General design', 'Color', 'Typography', 'Layout', 'UX design', 'UI design', 'Interaction design',
      'Visual and graphic design', 'Information architecture', 'User research and strategy', 'Product design',
      'Service design', 'UX writing', 'Accessibility', 'Motion', 'Design systems', 'Web applications and sites',
      'Mobile applications', 'Desktop software', 'Cross-platform products'
    ];
    for (const area of requiredAreas) {
      const row = coverageMap.split(/\r?\n/).find((line) => line.startsWith('| ' + area + ' |'));
      expect(row).toBeDefined();
      expect((row?.match(/\]\(/g) || []).length).toBe(3);
    }
  });

  it('keeps sidecar metadata and declared character counts synchronized', () => {
    const moduleMetadata = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'module.json'), 'utf8'));
    const sidecarMetadata = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'metadata.json'), 'utf8'));
    const actualCount = calculateModuleCharacterCount(moduleRoot);
    expect(moduleMetadata.characterCount).toBe(actualCount);
    expect(moduleMetadata.augment.characterCount).toBe(actualCount);
    expect(sidecarMetadata.characterCount).toBe(actualCount);

    const fixtureRoot = makeValidFixture();
    temporaryRoots.push(fixtureRoot);
    const sidecarPath = path.join(fixtureRoot, 'metadata.json');
    const originalSidecar = fs.readFileSync(sidecarPath, 'utf8');
    const inconsistent = JSON.parse(originalSidecar);
    inconsistent.files.skills = ['missing.md'];
    fs.writeFileSync(sidecarPath, JSON.stringify(inconsistent, null, 2) + '\n');
    expect(guidanceValidator.validateGuidanceModule(fixtureRoot).errors).toContain(
      'metadata.json files.skills must match module.json contents.guidance.skills.'
    );
    inconsistent.files.skills = ['review.md'];
    inconsistent.characterCount = 1;
    fs.writeFileSync(sidecarPath, JSON.stringify(inconsistent, null, 2) + '\n');
    expect(guidanceValidator.validateGuidanceModule(fixtureRoot).errors).toContain(
      'metadata.json characterCount does not match the module files.'
    );
    fs.writeFileSync(sidecarPath, originalSidecar);
  });

  it('validates the checked-in guidance index and local links', () => {
    const result = guidanceValidator.validateGuidanceModule(moduleRoot);
    expect(result.errors).toEqual([]);
  });

  it('reports missing or malformed module metadata', () => {
    const missing = validateModuleMetadata({ name: 'incomplete' });
    expect(missing.valid).toBe(false);
    expect(missing.errors).toContain('Missing required field: version');

    const unsupported = validateModuleMetadata({
      name: 'fixture',
      version: '1.0.0',
      displayName: 'Fixture',
      description: 'A metadata validation fixture.',
      type: 'unsupported'
    });
    expect(unsupported.valid).toBe(false);
    expect(unsupported.errors.some((error) => error.includes('Invalid type: unsupported'))).toBe(true);
  });

  it('reports malformed JSON, invalid guidance configuration, and missing references', () => {
    const root = makeValidFixture();
    temporaryRoots.push(root);

    const manifestPath = path.join(root, 'module.json');
    const validMetadata = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    fs.writeFileSync(manifestPath, '{');
    expect(guidanceValidator.validateGuidanceModule(root).errors[0]).toContain('Unable to parse module.json');

    fs.writeFileSync(manifestPath, JSON.stringify(validMetadata, null, 2));
    const sidecarPath = path.join(root, 'metadata.json');
    const validSidecar = fs.readFileSync(sidecarPath, 'utf8');
    fs.writeFileSync(sidecarPath, '{');
    expect(guidanceValidator.validateGuidanceModule(root).errors.some((error) => error.startsWith('Unable to parse metadata.json:'))).toBe(true);
    fs.writeFileSync(sidecarPath, validSidecar);

    const metadata = JSON.parse(JSON.stringify(validMetadata));
    metadata.contents.guidance.skills = 'skills/review.md';
    fs.writeFileSync(manifestPath, JSON.stringify(metadata, null, 2));
    expect(guidanceValidator.validateGuidanceModule(root).errors).toContain(
      'contents.guidance.skills must be a non-empty array.'
    );

    metadata.contents.guidance.skills = ['skills/missing.md'];
    fs.writeFileSync(manifestPath, JSON.stringify(metadata, null, 2));
    expect(guidanceValidator.validateGuidanceModule(root).errors).toContain(
      'Referenced file for contents.guidance.skills[0] was not found: skills/missing.md'
    );

    fs.rmSync(sidecarPath);
    expect(guidanceValidator.validateGuidanceModule(root).errors).toContain('metadata.json is missing.');
  });

  it('rejects a missing required validation script reference', () => {
    const root = makeValidFixture();
    temporaryRoots.push(root);
    const manifestPath = path.join(root, 'module.json');
    const metadata = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    delete metadata.contents.guidance.validationScript;
    fs.writeFileSync(manifestPath, JSON.stringify(metadata, null, 2));
    expect(guidanceValidator.validateGuidanceModule(root).errors).toContain(
      'contents.guidance.validationScript must be a non-empty module-relative path.'
    );
  });

  it('reports links to missing files and headings without passing the fixture', () => {
    const root = makeValidFixture();
    temporaryRoots.push(root);
    fs.writeFileSync(path.join(root, 'skills/review.md'), '[Missing file](../missing.md)');
    const missingFile = guidanceValidator.validateGuidanceModule(root);
    expect(missingFile.errors.some((error) => error.includes('links to a missing file'))).toBe(true);

    fs.writeFileSync(path.join(root, 'skills/review.md'), '[Missing heading](../guidelines/levels.md#not-a-heading)');
    const missingHeading = guidanceValidator.validateGuidanceModule(root);
    expect(missingHeading.errors.some((error) => error.includes('links to a missing heading'))).toBe(true);
  });
});

describe('Responsive viewport plan and audit policy', () => {
  const plan = responsiveSweep.buildViewportPlan({
    step: 128,
    widthBreakpoints: [768],
    heightBreakpoints: [600]
  });

  it('covers minimum, maximum, portrait, landscape, 4K, and 8K CSS viewport cases', () => {
    expect(plan.some((item) => item.width === 256 && item.height === 256)).toBe(true);
    expect(plan.some((item) => item.width === 7680 && item.height === 256)).toBe(true);
    expect(plan.some((item) => item.width === 256 && item.height === 7680)).toBe(true);
    expect(plan.some((item) => item.width === 3840 && item.height === 2160)).toBe(true);
    expect(plan.some((item) => item.width === 2160 && item.height === 3840)).toBe(true);
    expect(plan.some((item) => item.width === 7680 && item.height === 4320)).toBe(true);
    expect(plan.some((item) => item.width === 4320 && item.height === 7680)).toBe(true);
    expect(responsiveSweep.ASPECT_RATIOS.map((ratio) => ratio.name)).toEqual(['1:1', '4:3', '3:2', '16:9', '21:9', '32:9']);
    expect(plan.some((item) => item.labels.some((label) => label.includes('32:9')))).toBe(true);
  });

  it('covers every 128-pixel long-edge step from 256 through 7680', () => {
    for (let longEdge = 256; longEdge <= 7680; longEdge += 128) {
      expect(plan.some((item) => item.labels.some((label) => label.includes('long edge ' + longEdge)))).toBe(true);
    }
    expect(plan.some((item) => item.labels.some((label) => label.includes('long edge 7680')))).toBe(true);
  });

  it('validates runner options and keeps the broad sweep plan dry-run compatible', () => {
    expect(responsiveSweep.parseArguments(['--dry-run', '--width-breakpoints', '768,1024']).widthBreakpoints).toEqual([768, 1024]);
    expect(() => responsiveSweep.parseArguments(['--width-breakpoints', '768,wide', '--dry-run'])).toThrow('positive integer CSS pixels');
    expect(() => responsiveSweep.parseArguments([])).toThrow('--url is required');
  });

  it('tests the exact width and height breakpoints and adjacent CSS pixels', () => {
    for (const width of [767, 768, 769]) {
      expect(plan.some((item) => item.width === width && item.labels.some((label) => label.includes('width breakpoint 768')))).toBe(true);
    }
    for (const height of [599, 600, 601]) {
      expect(plan.some((item) => item.height === height && item.labels.some((label) => label.includes('height breakpoint 600')))).toBe(true);
    }
  });

  it('passes conforming metrics and fails measured horizontal overflow or broken images', () => {
    expect(responsiveSweep.evaluateViewportMetrics({
      horizontalOverflowPx: 0,
      brokenImages: [],
      clippedControls: [],
      clippedText: [],
      overlappingControls: []
    }).status).toBe('pass');

    const overflow = responsiveSweep.evaluateViewportMetrics({ horizontalOverflowPx: 2, brokenImages: [] });
    expect(overflow.status).toBe('fail');
    expect(overflow.failures[0]).toContain('Horizontal overflow is 2');

    const brokenImage = responsiveSweep.evaluateViewportMetrics({
      horizontalOverflowPx: 0,
      brokenImages: ['broken.png']
    });
    expect(brokenImage.status).toBe('fail');
  });

  it('keeps clipped or overlapping controls in review instead of reporting a false pass', () => {
    const result = responsiveSweep.evaluateViewportMetrics({
      horizontalOverflowPx: 0,
      brokenImages: [],
      clippedControls: ['button: Save'],
      clippedText: [],
      overlappingControls: ['button: Save overlaps button: Cancel']
    });
    expect(result.status).toBe('needs-review');
    expect(result.review.length).toBeGreaterThan(0);
  });

  it('flags clipped long text, small touch targets, limited overlap scans, and missing focus evidence for review', () => {
    const result = responsiveSweep.evaluateViewportMetrics({
      horizontalOverflowPx: 0,
      brokenImages: [],
      clippedText: ['button: localized action'],
      smallTouchTargets: ['button: Save (20x20)'],
      overlapAuditLimited: true,
      focusIndicatorCandidates: ['button: Save'],
      focusUnavailable: true
    });
    expect(result.status).toBe('needs-review');
    expect(result.review.join(' ')).toContain('text element');
    expect(result.review.join(' ')).toContain('touch target');
    expect(result.review.join(' ')).toContain('sample');
    expect(result.review.join(' ')).toContain('Keyboard focus');
  });

  it('does not treat a 200 percent text-size overflow as a pass', () => {
    const largeText = responsiveSweep.evaluateViewportMetrics({
      horizontalOverflowPx: 12,
      clippedText: ['heading: Expanded localized content'],
      brokenImages: []
    });
    expect(largeText.status).toBe('fail');
    expect(largeText.failures[0]).toContain('12 CSS pixels');
    expect(largeText.review[0]).toContain('text element');
  });
});
