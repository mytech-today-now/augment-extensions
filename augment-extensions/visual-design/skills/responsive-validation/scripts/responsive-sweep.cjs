'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const MIN_VIEWPORT = 256;
const MAX_VIEWPORT = 7680;
const DEFAULT_STEP = 128;
const ASPECT_RATIOS = [
  { name: '1:1', value: 1 },
  { name: '4:3', value: 4 / 3 },
  { name: '3:2', value: 3 / 2 },
  { name: '16:9', value: 16 / 9 },
  { name: '21:9', value: 21 / 9 },
  { name: '32:9', value: 32 / 9 }
];

function parsePositiveList(value, optionName) {
  if (!value) return [];
  const entries = value.split(',').map((part) => Number(part.trim()));
  if (entries.some((entry) => !Number.isInteger(entry) || entry <= 0)) {
    throw new Error(optionName + ' must be a comma-separated list of positive integer CSS pixels.');
  }
  return Array.from(new Set(entries)).sort((a, b) => a - b);
}

function parseArguments(argv) {
  const options = {
    url: '',
    widthBreakpoints: [],
    heightBreakpoints: [],
    step: DEFAULT_STEP,
    out: 'test-results/responsive-validation',
    dryRun: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--url' || arg === '--width-breakpoints' || arg === '--height-breakpoints' || arg === '--step' || arg === '--out') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('Missing value for ' + arg + '.');
      index += 1;
      if (arg === '--url') options.url = value;
      if (arg === '--width-breakpoints') options.widthBreakpoints = parsePositiveList(value, arg);
      if (arg === '--height-breakpoints') options.heightBreakpoints = parsePositiveList(value, arg);
      if (arg === '--step') options.step = Number(value);
      if (arg === '--out') options.out = value;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error('Unknown option: ' + arg);
    }
  }
  if (!Number.isInteger(options.step) || options.step < 1 || options.step > MAX_VIEWPORT) {
    throw new Error('--step must be an integer from 1 through ' + MAX_VIEWPORT + '.');
  }
  if (!options.dryRun && !options.help && !options.url) {
    throw new Error('--url is required unless --dry-run is used.');
  }
  return options;
}

function buildViewportPlan(options = {}) {
  const step = options.step === undefined ? DEFAULT_STEP : options.step;
  if (!Number.isInteger(step) || step < 1) throw new Error('step must be a positive integer.');
  const cases = new Map();
  function add(width, height, label, boundary) {
    const w = Math.round(width);
    const h = Math.round(height);
    if (w < 1 || h < 1) return;
    const key = w + 'x' + h;
    const existing = cases.get(key);
    if (existing) {
      if (!existing.labels.includes(label)) existing.labels.push(label);
      existing.boundary = existing.boundary || Boolean(boundary);
      return;
    }
    cases.set(key, {
      width: w,
      height: h,
      actualAspectRatio: Number((w / h).toFixed(4)),
      labels: [label],
      boundary: Boolean(boundary)
    });
  }

  const longEdges = [];
  for (let edge = MIN_VIEWPORT; edge <= MAX_VIEWPORT; edge += step) longEdges.push(edge);
  if (longEdges[longEdges.length - 1] !== MAX_VIEWPORT) longEdges.push(MAX_VIEWPORT);
  for (const longEdge of longEdges) {
    for (const ratio of ASPECT_RATIOS) {
      const shortEdge = Math.max(MIN_VIEWPORT, Math.round(longEdge / ratio.value));
      const edgeBoundary = longEdge === MIN_VIEWPORT || longEdge === MAX_VIEWPORT;
      add(longEdge, shortEdge, 'sweep landscape ' + ratio.name + ' long edge ' + longEdge, edgeBoundary);
      add(shortEdge, longEdge, 'sweep portrait ' + ratio.name + ' long edge ' + longEdge, edgeBoundary);
    }
  }

  add(MIN_VIEWPORT, MIN_VIEWPORT, 'minimum square', true);
  add(MAX_VIEWPORT, MAX_VIEWPORT, 'maximum square', false);
  add(MAX_VIEWPORT, MIN_VIEWPORT, 'maximum landscape extreme', true);
  add(MIN_VIEWPORT, MAX_VIEWPORT, 'maximum portrait extreme', true);
  add(3840, 2160, '4K landscape 16:9', true);
  add(2160, 3840, '4K portrait 9:16', true);
  add(7680, 4320, '8K landscape 16:9', true);
  add(4320, 7680, '8K portrait 9:16', true);

  for (const breakpoint of options.widthBreakpoints || []) {
    for (const width of [breakpoint - 1, breakpoint, breakpoint + 1]) {
      if (width < 1) continue;
      add(width, Math.max(1, Math.round(width * 9 / 16)), 'width breakpoint ' + breakpoint + ' at ' + width + ' landscape', true);
      add(width, Math.max(width, Math.round(width * 16 / 9)), 'width breakpoint ' + breakpoint + ' at ' + width + ' portrait', true);
    }
  }
  for (const breakpoint of options.heightBreakpoints || []) {
    for (const height of [breakpoint - 1, breakpoint, breakpoint + 1]) {
      if (height < 1) continue;
      add(Math.max(height, Math.round(height * 16 / 9)), height, 'height breakpoint ' + breakpoint + ' at ' + height + ' landscape', true);
      add(Math.max(1, Math.round(height * 9 / 16)), height, 'height breakpoint ' + breakpoint + ' at ' + height + ' portrait', true);
    }
  }
  return Array.from(cases.values()).sort((a, b) => a.width - b.width || a.height - b.height);
}

function evaluateViewportMetrics(metrics) {
  const failures = [];
  const review = [];
  if (metrics.horizontalOverflowPx > 1) failures.push('Horizontal overflow is ' + metrics.horizontalOverflowPx + ' CSS pixels.');
  if (metrics.brokenImages && metrics.brokenImages.length > 0) failures.push(metrics.brokenImages.length + ' visible image or images failed to load.');
  if (metrics.clippedControls && metrics.clippedControls.length > 0) review.push(metrics.clippedControls.length + ' visible control or controls may be clipped.');
  if (metrics.clippedText && metrics.clippedText.length > 0) review.push(metrics.clippedText.length + ' text element or elements may be clipped.');
  if (metrics.overlappingControls && metrics.overlappingControls.length > 0) review.push(metrics.overlappingControls.length + ' control overlap candidate or candidates need inspection.');
  if (metrics.overlapAuditLimited) review.push('Control overlap inspection was limited to a sample.');
  if (metrics.smallTouchTargets && metrics.smallTouchTargets.length > 0) review.push(metrics.smallTouchTargets.length + ' touch target candidate or candidates are below 24 by 24 CSS pixels.');
  if (metrics.focusIndicatorCandidates && metrics.focusIndicatorCandidates.length > 0) review.push(metrics.focusIndicatorCandidates.length + ' focused control or controls need a visual focus-indicator review.');
  if (metrics.focusUnavailable) review.push('Keyboard focus could not be confirmed for visible controls.');
  return { status: failures.length > 0 ? 'fail' : review.length > 0 ? 'needs-review' : 'pass', failures, review };
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const horizontalOverflowPx = Math.max(0, root.scrollWidth - root.clientWidth, body ? body.scrollWidth - root.clientWidth : 0);
    const selector = 'a[href], button, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
    const visible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 &&
        !element.closest('[hidden], [inert], [aria-hidden="true"]') && rect.width > 0 && rect.height > 0;
    };
    const describe = (element) => {
      const text = (element.getAttribute('aria-label') || element.getAttribute('title') || element.innerText || element.tagName).trim();
      return element.tagName.toLowerCase() + (element.id ? '#' + element.id : '') + ': ' + text.slice(0, 80);
    };
    const clippedControls = [];
    const clippedText = [];
    const brokenImages = [];
    const smallTouchTargets = [];
    const focusIndicatorCandidates = [];
    const controlNodes = Array.from(document.querySelectorAll(selector)).filter(visible);

    for (const element of controlNodes) {
      const rect = element.getBoundingClientRect();
      if (rect.left < -1 || rect.right > window.innerWidth + 1) clippedControls.push(describe(element));
      if (window.matchMedia('(pointer: coarse)').matches && (rect.width < 24 || rect.height < 24)) {
        smallTouchTargets.push(describe(element) + ' (' + Math.round(rect.width) + 'x' + Math.round(rect.height) + ')');
      }
      let ancestor = element.parentElement;
      while (ancestor && ancestor !== body && ancestor !== root) {
        const style = window.getComputedStyle(ancestor);
        const ancestorRect = ancestor.getBoundingClientRect();
        const clipsX = style.overflowX === 'hidden' || style.overflowX === 'clip';
        const clipsY = style.overflowY === 'hidden' || style.overflowY === 'clip';
        if ((clipsX && (rect.left < ancestorRect.left - 1 || rect.right > ancestorRect.right + 1)) ||
            (clipsY && (rect.top < ancestorRect.top - 1 || rect.bottom > ancestorRect.bottom + 1))) {
          clippedControls.push(describe(element) + ' clipped by ' + describe(ancestor));
          break;
        }
        ancestor = ancestor.parentElement;
      }
    }

    const textNodes = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,label,button,a,[data-responsive-critical]')).filter(visible).slice(0, 300);
    for (const element of textNodes) {
      const style = window.getComputedStyle(element);
      const clips = style.overflowX === 'hidden' || style.overflowX === 'clip' || style.overflowY === 'hidden' ||
        style.overflowY === 'clip' || style.webkitLineClamp !== 'none';
      if (clips && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)) {
        clippedText.push(describe(element));
      }
    }

    for (const image of Array.from(document.images)) {
      if (visible(image) && image.complete && image.naturalWidth === 0 && (image.currentSrc || image.src)) {
        brokenImages.push(image.currentSrc || image.src);
      }
    }

    const overlapNodes = controlNodes.slice(0, 150).map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .sort((a, b) => a.rect.left - b.rect.left);
    const overlappingControls = [];
    for (let i = 0; i < overlapNodes.length; i += 1) {
      const first = overlapNodes[i];
      for (let j = i + 1; j < overlapNodes.length && overlapNodes[j].rect.left < first.rect.right; j += 1) {
        const second = overlapNodes[j];
        if (first.element.contains(second.element) || second.element.contains(first.element)) continue;
        const overlapWidth = Math.max(0, Math.min(first.rect.right, second.rect.right) - Math.max(first.rect.left, second.rect.left));
        const overlapHeight = Math.max(0, Math.min(first.rect.bottom, second.rect.bottom) - Math.max(first.rect.top, second.rect.top));
        const smallerArea = Math.min(first.rect.width * first.rect.height, second.rect.width * second.rect.height);
        if (smallerArea > 0 && overlapWidth * overlapHeight / smallerArea > 0.15) {
          overlappingControls.push(describe(first.element) + ' overlaps ' + describe(second.element));
          if (overlappingControls.length >= 20) break;
        }
      }
      if (overlappingControls.length >= 20) break;
    }

    const active = document.activeElement;
    if (active && active !== body && active !== root && visible(active)) {
      const focusStyle = window.getComputedStyle(active);
      const hasOutline = focusStyle.outlineStyle !== 'none' && parseFloat(focusStyle.outlineWidth) > 0;
      const hasShadow = focusStyle.boxShadow !== 'none';
      if (!hasOutline && !hasShadow) {
        focusIndicatorCandidates.push(describe(active) + ' outline=' + focusStyle.outlineStyle + '/' + focusStyle.outlineWidth + ', shadow=' + focusStyle.boxShadow);
      }
    }

    return {
      horizontalOverflowPx,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      document: { clientWidth: root.clientWidth, scrollWidth: root.scrollWidth },
      clippedControls: Array.from(new Set(clippedControls)).slice(0, 30),
      clippedText: clippedText.slice(0, 30),
      brokenImages,
      overlappingControls,
      overlapAuditLimited: controlNodes.length > 150,
      smallTouchTargets,
      focusIndicatorCandidates,
      visibleInteractiveCount: controlNodes.length
    };
  });
}

async function checkKeyboard(page, maxTabs = 40) {
  const states = [];
  const seen = new Set();
  let focusUnavailable = false;
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press('Tab');
    const state = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element || element === document.body || element === document.documentElement) return { key: '', focusUnavailable: true };
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const label = (element.getAttribute('aria-label') || element.innerText || element.tagName).trim().slice(0, 80);
      return {
        key: element.tagName + ':' + (element.id || label),
        focusUnavailable: false,
        label,
        inViewport: rect.right > 0 && rect.left < window.innerWidth && rect.bottom > 0 && rect.top < window.innerHeight,
        outline: style.outlineStyle + '/' + style.outlineWidth,
        shadow: style.boxShadow
      };
    });
    if (state.focusUnavailable) {
      focusUnavailable = true;
      break;
    }
    if (seen.has(state.key)) break;
    seen.add(state.key);
    states.push(state);
  }
  return { focusUnavailable, states };
}

function needsBoundaryScreenshot(viewportCase) {
  return viewportCase.labels.some((label) => label.includes('breakpoint') || label.includes('minimum') ||
    label.includes('maximum landscape extreme') || label.includes('maximum portrait extreme') ||
    label.includes('4K') || label.includes('8K'));
}

async function runBrowserSweep(options, plan) {
  let playwright;
  try {
    const callerRequire = createRequire(path.resolve(process.cwd(), 'package.json'));
    playwright = callerRequire('playwright');
  } catch (error) {
    throw new Error('Playwright is not available from the caller project. Use its existing browser runner. No dependency was added by this module. Details: ' + error.message);
  }
  const outputDir = path.resolve(process.cwd(), options.out);
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await playwright.chromium.launch({ headless: true });
  const results = [];
  const pageErrors = [];

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
    const page = await context.newPage();
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    for (const viewportCase of plan) {
      await page.setViewportSize({ width: viewportCase.width, height: viewportCase.height });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const metrics = await inspectPage(page);
      const result = {
        viewport: { width: viewportCase.width, height: viewportCase.height, unit: 'CSS pixels', devicePixelRatio: 1 },
        labels: viewportCase.labels,
        boundary: viewportCase.boundary,
        metrics,
        ...evaluateViewportMetrics(metrics)
      };
      if (needsBoundaryScreenshot(viewportCase)) {
        const filename = 'viewport-' + viewportCase.width + 'x' + viewportCase.height + '.png';
        await page.screenshot({ path: path.join(outputDir, filename), fullPage: false, animations: 'disabled' });
        result.screenshot = filename;
      }
      if (viewportCase.labels.some((label) => label.includes('minimum square') || label.includes('width breakpoint'))) {
        const keyboard = await checkKeyboard(page);
        result.keyboard = keyboard;
        if (keyboard.focusUnavailable && metrics.visibleInteractiveCount > 0) {
          result.review.push('Keyboard tab navigation did not expose a visible control.');
          result.status = 'needs-review';
        }
        const missingIndicator = keyboard.states.filter((state) => {
          const outlineParts = state.outline.split('/');
          const hasVisibleOutline = outlineParts[0] !== 'none' && Number.parseFloat(outlineParts[1]) > 0;
          return !hasVisibleOutline && state.shadow === 'none';
        });
        if (missingIndicator.length > 0) {
          result.review.push(missingIndicator.length + ' keyboard-focused control or controls need visual focus-indicator review.');
          result.status = 'needs-review';
        }
      }
      results.push(result);
    }

    await page.setViewportSize({ width: 256, height: 640 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const reducedMotion = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    results.push({
      viewport: { width: 256, height: 640, unit: 'CSS pixels', devicePixelRatio: 1 },
      labels: ['reduced motion emulation'],
      status: reducedMotion ? 'pass' : 'fail',
      failures: reducedMotion ? [] : ['The browser did not report the reduced-motion preference.'],
      review: []
    });

    for (const size of [{ width: 256, height: 640 }, { width: 768, height: 1024 }]) {
      await page.setViewportSize(size);
      const styleTag = await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const metrics = await inspectPage(page);
      results.push({
        viewport: { width: size.width, height: size.height, unit: 'CSS pixels', devicePixelRatio: 1 },
        labels: ['root font size 200 percent approximation'],
        metrics,
        ...evaluateViewportMetrics(metrics)
      });
      await styleTag.evaluate((element) => element.remove());
    }

    const touchContext = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const touchPage = await touchContext.newPage();
    touchPage.on('pageerror', (error) => pageErrors.push(error.message));
    await touchPage.goto(options.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const touchWidths = Array.from(new Set([256, 320, 375, 390, 768].concat((options.widthBreakpoints || []).filter((value) => value >= MIN_VIEWPORT && value <= 768))));
    for (const width of touchWidths) {
      const touchSizes = [
        { width, height: Math.max(256, Math.round(width * 16 / 9)) },
        { width, height: Math.max(256, Math.round(width * 9 / 16)) }
      ];
      for (const size of touchSizes) {
        await touchPage.setViewportSize(size);
        const metrics = await inspectPage(touchPage);
        results.push({
          viewport: { width: size.width, height: size.height, unit: 'CSS pixels', devicePixelRatio: 1 },
          labels: ['touch-capable browser emulation'],
          metrics,
          ...evaluateViewportMetrics(metrics)
        });
      }
    }
    await touchContext.close();
    await context.close();
  } finally {
    await browser.close();
  }

  const summary = {
    url: options.url,
    viewportUnit: 'CSS pixels',
    devicePixelRatio: 1,
    physicalDisplayResolution: 'not measured',
    widthBreakpoints: options.widthBreakpoints,
    heightBreakpoints: options.heightBreakpoints,
    longEdgeRange: { min: MIN_VIEWPORT, max: MAX_VIEWPORT, step: options.step },
    plannedViewportCount: plan.length,
    resultCount: results.length,
    pageErrors,
    failedOrNeedsReview: results.filter((result) => result.status !== 'pass').length,
    results
  };
  fs.writeFileSync(path.join(outputDir, 'responsive-sweep-results.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({
    output: outputDir,
    plannedViewportCount: summary.plannedViewportCount,
    resultCount: summary.resultCount,
    pageErrors: pageErrors.length,
    failedOrNeedsReview: summary.failedOrNeedsReview
  }, null, 2));
  return summary;
}

function printHelp() {
  console.log('Responsive viewport sweep');
  console.log('  --url <local-app-url>             Required for a browser run');
  console.log('  --width-breakpoints <px,...>      Actual viewport width breakpoints');
  console.log('  --height-breakpoints <px,...>     Actual viewport height breakpoints');
  console.log('  --step <px>                       Long-edge sweep interval, default 128');
  console.log('  --out <directory>                 Result and screenshot directory');
  console.log('  --dry-run                         Print the viewport plan without Playwright');
}

async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    const plan = buildViewportPlan(options);
    if (options.dryRun) {
      console.log(JSON.stringify({
        viewportUnit: 'CSS pixels',
        devicePixelRatio: 1,
        longEdgeRange: { min: MIN_VIEWPORT, max: MAX_VIEWPORT, step: options.step },
        widthBreakpoints: options.widthBreakpoints,
        heightBreakpoints: options.heightBreakpoints,
        viewportCount: plan.length,
        viewports: plan
      }, null, 2));
      return;
    }
    const summary = await runBrowserSweep(options, plan);
    if (summary.failedOrNeedsReview > 0 || summary.pageErrors.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error('Responsive sweep failed: ' + error.message);
    process.exitCode = 2;
  }
}

module.exports = { ASPECT_RATIOS, MIN_VIEWPORT, MAX_VIEWPORT, DEFAULT_STEP, parseArguments, buildViewportPlan, evaluateViewportMetrics };
if (require.main === module) main();
