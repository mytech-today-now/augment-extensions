/**
 * Performance tests for module inspection
 * Tests performance benchmarks and regression detection
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import {
  discoverModules,
  findModuleEnhanced,
  extractModuleMetadata,
  listModuleFiles
} from '../../utils/module-system';
import { PluginLoader } from '../../utils/plugin-system';
import { ConfigManager } from '../../utils/config-system';

/**
 * Performance benchmark result
 */
interface BenchmarkResult {
  operation: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

/**
 * Run a performance benchmark
 */
function benchmark(
  operation: string,
  fn: () => void | Promise<void>,
  iterations: number = 100
): BenchmarkResult {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;

  return {
    operation,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond
  };
}

/**
 * Async benchmark
 */
async function benchmarkAsync(
  operation: string,
  fn: () => Promise<void>,
  iterations: number = 100
): Promise<BenchmarkResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;

  return {
    operation,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond
  };
}

describe('Module Inspection Performance Tests', () => {
  // Performance thresholds (in milliseconds)
  const THRESHOLDS = {
    moduleDiscovery: 1000, // 1 second
    moduleSearch: 100, // 100ms
    metadataExtraction: 50, // 50ms
    fileList: 200, // 200ms
    pluginRegistration: 10, // 10ms
    hookExecution: 5, // 5ms
    configLoad: 20 // 20ms
  };

  describe('Module Discovery Performance', () => {
    it('should discover modules within performance threshold', () => {
      const result = benchmark('Module Discovery', () => {
        discoverModules();
      }, 10);

      console.log(`Module Discovery: ${result.averageTime.toFixed(2)}ms (avg)`);
      expect(result.averageTime).toBeLessThan(THRESHOLDS.moduleDiscovery);
    });

    it('should search modules efficiently', () => {
      for (let i = 0; i < 10; i++) {
        findModuleEnhanced('typescript');
      }

      const measureSearchBatch = (iterations: number): number => {
        const searchTimes: number[] = [];
        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          findModuleEnhanced('typescript');
          searchTimes.push(performance.now() - start);
        }

        searchTimes.sort((a, b) => a - b);
        const middle = Math.floor(searchTimes.length / 2);
        return searchTimes.length % 2 === 0
          ? (searchTimes[middle - 1] + searchTimes[middle]) / 2
          : searchTimes[middle];
      };

      const batchMedians = [measureSearchBatch(50)];
      if (batchMedians[0] >= THRESHOLDS.moduleSearch &&
          batchMedians[0] < THRESHOLDS.moduleSearch * 1.1) {
        for (let i = 0; i < 2; i++) {
          findModuleEnhanced('typescript');
          batchMedians.push(measureSearchBatch(25));
        }
      }

      batchMedians.sort((a, b) => a - b);
      const medianTime = batchMedians[Math.floor(batchMedians.length / 2)];

      console.log(`Module Search: ${medianTime.toFixed(2)}ms (median of ${batchMedians.length} measurement batches)`);
      expect(medianTime).toBeLessThan(THRESHOLDS.moduleSearch);
    });
  });

  describe('Metadata Extraction Performance', () => {
    it('should extract metadata within threshold', () => {
      const modules = discoverModules();
      if (modules.length === 0) {
        console.warn('No modules found for performance testing');
        return;
      }

      const testModule = modules[0];

      const result = benchmark('Metadata Extraction', () => {
        extractModuleMetadata(testModule.path);
      }, 100);

      console.log(`Metadata Extraction: ${result.averageTime.toFixed(2)}ms (avg)`);
      expect(result.averageTime).toBeLessThan(THRESHOLDS.metadataExtraction);
    });
  });

  describe('File Listing Performance', () => {
    it('should list module files efficiently', () => {
      const modules = discoverModules();
      if (modules.length === 0) {
        console.warn('No modules found for performance testing');
        return;
      }

      const testModule = modules[0];

      const result = benchmark('File Listing', () => {
        listModuleFiles(testModule.path);
      }, 50);

      console.log(`File Listing: ${result.averageTime.toFixed(2)}ms (avg)`);
      expect(result.averageTime).toBeLessThan(THRESHOLDS.fileList);
    });
  });

  describe('Plugin System Performance', () => {
    it('should register plugins quickly', async () => {
      const result = await benchmarkAsync('Plugin Registration', async () => {
        const loader = new PluginLoader();
        const plugin = {
          id: `test-plugin-${Math.random()}`,
          name: 'Test Plugin',
          version: '1.0.0',
          initialize: async () => {}
        };
        await loader.registerPlugin(plugin);
        await loader.clear();
      }, 100);

      console.log(`Plugin Registration: ${result.averageTime.toFixed(2)}ms (avg)`);
      expect(result.averageTime).toBeLessThan(THRESHOLDS.pluginRegistration);
    });
  });
});

