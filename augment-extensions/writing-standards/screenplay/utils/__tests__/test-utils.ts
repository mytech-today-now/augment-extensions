/**
 * Test utilities for screenplay module testing
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Sample feature selection configurations for testing
 */
export const sampleConfigs = {
  singleGenre: {
    screenplay_enhancements: {
      enabled: true,
      features: {
        genres: {
          enabled: true,
          selected: ['action'],
          hybridMode: false,
          conflictResolution: 'merge'
        },
        themes: {
          enabled: false,
          selected: []
        },
        styles: {
          enabled: false,
          selected: []
        }
      }
    }
  },
  
  hybridGenre: {
    screenplay_enhancements: {
      enabled: true,
      features: {
        genres: {
          enabled: true,
          selected: ['action', 'comedy'],
          hybridMode: true,
          conflictResolution: 'merge'
        },
        themes: {
          enabled: false,
          selected: []
        },
        styles: {
          enabled: false,
          selected: []
        }
      }
    }
  },
  
  multipleThemes: {
    screenplay_enhancements: {
      enabled: true,
      features: {
        genres: {
          enabled: false,
          selected: []
        },
        themes: {
          enabled: true,
          selected: ['redemption', 'revenge', 'identity'],
          primaryTheme: 'redemption',
          integrationLevel: 'moderate'
        },
        styles: {
          enabled: false,
          selected: []
        }
      }
    }
  },
  
  fullFeatures: {
    screenplay_enhancements: {
      enabled: true,
      features: {
        genres: {
          enabled: true,
          selected: ['thriller'],
          hybridMode: false,
          conflictResolution: 'merge'
        },
        themes: {
          enabled: true,
          selected: ['survival', 'betrayal'],
          primaryTheme: 'survival',
          integrationLevel: 'prominent'
        },
        styles: {
          enabled: true,
          selected: ['non-linear']
        }
      }
    }
  },
  
  allDisabled: {
    screenplay_enhancements: {
      enabled: false,
      features: {
        genres: {
          enabled: false,
          selected: []
        },
        themes: {
          enabled: false,
          selected: []
        },
        styles: {
          enabled: false,
          selected: []
        }
      }
    }
  }
};

/**
 * Sample test data for feature loading
 */
export const sampleTestData = {
  genres: ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'thriller'],
  themes: ['redemption', 'love', 'revenge', 'identity', 'power', 'survival'],
  styles: ['linear', 'non-linear', 'ensemble', 'minimalist', 'epic']
};

/**
 * Helper to create temporary test configuration file
 */
export function createTempConfig(config: any): string {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const configPath = path.join(tempDir, `test-config-${Date.now()}.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  return configPath;
}

/**
 * Helper to clean up temporary test files
 */
export function cleanupTempFiles(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Helper to validate configuration against schema
 */
export function validateConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required top-level structure
  if (!config.screenplay_enhancements) {
    errors.push('Missing screenplay_enhancements object');
    return { valid: false, errors };
  }
  
  const enhancements = config.screenplay_enhancements;
  
  // Check enabled flag
  if (typeof enhancements.enabled !== 'boolean') {
    errors.push('screenplay_enhancements.enabled must be boolean');
  }
  
  // Check features object
  if (!enhancements.features) {
    errors.push('Missing features object');
    return { valid: false, errors };
  }
  
  // Validate each feature
  ['genres', 'themes', 'styles'].forEach(feature => {
    if (!enhancements.features[feature]) {
      errors.push(`Missing ${feature} configuration`);
    } else {
      const featureConfig = enhancements.features[feature];
      
      if (typeof featureConfig.enabled !== 'boolean') {
        errors.push(`${feature}.enabled must be boolean`);
      }
      
      if (!Array.isArray(featureConfig.selected)) {
        errors.push(`${feature}.selected must be array`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors };
}

