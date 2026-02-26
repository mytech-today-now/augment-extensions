import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { displayHelp } from './generate-shot-list/help-text';
import { ExitCode, exitWithCode } from './generate-shot-list/exit-codes';
import { createParserAuto } from './generate-shot-list/parser';
import { createGenerator } from './generate-shot-list/generator';
import { createFormatter } from './generate-shot-list/formatter';
import { createLogger } from './generate-shot-list/logger';
import { createStyleSystem } from './generate-shot-list/style';
import type { OutputFormat } from './generate-shot-list/formatter/types';
import type { MergedStyleGuidelines } from './generate-shot-list/style/types';

interface GenerateShotListOptions {
  path?: string;
  format?: string;
  output?: string;
  maxCharacters?: number;
  maxShotLength?: number;
  logging?: boolean;
  style?: string | string[];  // Can be single string or array of strings
  help?: boolean;
  h?: boolean;
}

export async function generateShotListCommand(options: GenerateShotListOptions): Promise<void> {
  try {
    // Handle help flags
    if (options.help || options.h) {
      displayHelp();
      exitWithCode(ExitCode.SUCCESS);
    }

    // Validate required arguments
    if (!options.path) {
      console.error(chalk.red('Error: Missing required argument: --path'));
      console.log(chalk.gray('Usage: augx generate-shot-list --path <screenplay-file> [options]'));
      console.log(chalk.gray("Run 'augx generate-shot-list --help' for more information."));
      exitWithCode(ExitCode.INVALID_ARGUMENTS);
    }

    // Set defaults
    const format = options.format || 'md';
    const maxCharacters = options.maxCharacters || 4000;
    const maxShotLength = options.maxShotLength || 12;
    const logging = options.logging || false;

    // Validate format
    const validFormats = ['md', 'json', 'jsonl', 'csv', 'txt', 'html'];
    if (!validFormats.includes(format)) {
      console.error(chalk.red(`Error: Invalid format: ${format}`));
      console.log(chalk.gray(`Supported formats: ${validFormats.join(', ')}`));
      exitWithCode(ExitCode.INVALID_ARGUMENTS);
    }

    // Validate character limit
    if (maxCharacters < 100 || maxCharacters > 10000) {
      console.error(chalk.red('Error: Character limit must be between 100 and 10000'));
      exitWithCode(ExitCode.INVALID_ARGUMENTS);
    }

    // Validate shot length
    if (maxShotLength < 1 || maxShotLength > 60) {
      console.error(chalk.red('Error: Shot length must be between 1 and 60 seconds'));
      exitWithCode(ExitCode.INVALID_ARGUMENTS);
    }

    // Validate input file
    if (!fs.existsSync(options.path)) {
      console.error(chalk.red(`Error: Input file not found: ${options.path}`));
      exitWithCode(ExitCode.INPUT_FILE_ERROR);
    }

    // Check file is readable
    try {
      fs.accessSync(options.path, fs.constants.R_OK);
    } catch (error) {
      console.error(chalk.red(`Error: Permission denied: ${options.path}`));
      exitWithCode(ExitCode.INPUT_FILE_ERROR);
    }

    // Check file size (< 50MB)
    const stats = fs.statSync(options.path);
    if (stats.size > 50 * 1024 * 1024) {
      console.error(chalk.red('Error: File size exceeds 50MB limit'));
      exitWithCode(ExitCode.INPUT_FILE_ERROR);
    }

    console.log(chalk.blue(`\n🎬 Generating AI Shot List...\n`));
    console.log(chalk.gray(`Processing: ${options.path}`));
    console.log(chalk.gray(`Format: ${format}`));
    console.log(chalk.gray(`Max characters: ${maxCharacters}`));
    console.log(chalk.gray(`Max shot length: ${maxShotLength}s\n`));

    // Initialize logger if requested
    let logger;
    if (logging) {
      logger = await createLogger();
      await logger.logInfo('Shot list generation started', {
        inputFile: options.path,
        format,
        maxCharacters,
        maxShotLength
      });
    }

    // Load cinematic styles if requested
    let styleGuidelines: MergedStyleGuidelines | null = null;
    if (options.style) {
      const stylePaths = Array.isArray(options.style) ? options.style : [options.style];
      console.log(chalk.gray(`🎨 Loading cinematic styles...`));

      const styleSystem = createStyleSystem();

      // Validate all style paths
      for (const stylePath of stylePaths) {
        const isValid = await styleSystem.validateStylePath(stylePath);
        if (!isValid) {
          console.error(chalk.red(`Error: Invalid style module path: ${stylePath}`));
          console.log(chalk.gray('Expected format: writing-standards/screenplay/cinematic-styles/[category]/[style-name]'));
          console.log(chalk.gray('Categories: directors, franchises, films, comedy-formats'));
          exitWithCode(ExitCode.INVALID_ARGUMENTS);
        }
      }

      // Load and merge styles
      try {
        styleGuidelines = await styleSystem.loadStyles(stylePaths);
        if (styleGuidelines) {
          console.log(chalk.green(`✓ Loaded styles: ${styleSystem.formatStylesForDisplay(styleGuidelines)}`));

          if (logging && logger) {
            await logger.logInfo('Cinematic styles loaded', {
              styles: styleGuidelines.appliedStyles,
              conflicts: styleGuidelines.conflicts.length
            });

            // Log conflicts if any
            for (const conflict of styleGuidelines.conflicts) {
              await logger.logWarning('STYLE_CONFLICT', `Style conflict resolved: ${conflict.guideline}`, {
                styles: conflict.styles,
                resolution: conflict.resolution,
                resolvedBy: conflict.resolvedBy
              });
            }
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error loading styles: ${error}`));
        exitWithCode(ExitCode.GENERAL_ERROR);
      }
    }

    try {
      // Step 1: Read input file
      console.log(chalk.gray('📖 Reading screenplay file...'));
      const content = fs.readFileSync(options.path, 'utf-8');

      // Step 2: Parse screenplay
      console.log(chalk.gray('🔍 Parsing screenplay...'));
      const parser = createParserAuto(options.path, content);
      const screenplay = parser.parse(content);
      console.log(chalk.green(`✓ Parsed ${screenplay.scenes.length} scenes`));

      if (logging && logger) {
        await logger.logInfo('Screenplay parsed successfully', {
          sceneCount: screenplay.scenes.length,
          format: screenplay.metadata.format,
          totalLines: screenplay.metadata.totalLines
        });
      }

      // Step 3: Generate shot list
      console.log(chalk.gray('🎬 Generating shots...'));
      const generator = createGenerator();
      const shotList = generator.generate(screenplay.scenes, {
        maxCharacters,
        maxShotLength,
        warningThreshold: 90, // 90% threshold for warnings
        includeContext: true,
        includeMetadata: true
      });
      console.log(chalk.green(`✓ Generated ${shotList.totalShots} shots`));
      console.log(chalk.gray(`   Total duration: ${Math.floor(shotList.totalDuration / 60)}m ${Math.floor(shotList.totalDuration % 60)}s`));
      console.log(chalk.gray(`   Total characters: ${shotList.totalCharacters}`));

      if (logging && logger) {
        const inputStats = fs.statSync(options.path);
        await logger.logSuccess(
          'Shot list generated successfully',
          {
            shotCount: shotList.totalShots,
            duration: shotList.totalDuration,
            characterCount: shotList.totalCharacters,
            processingTime: 0, // TODO: Track actual processing time
            warningCount: shotList.warnings.length,
            inputFileSize: inputStats.size,
            outputFileSize: 0 // Will be updated when file is written
          },
          options.path,
          options.output || 'console',
          format
        );
      }

      // Display warnings if any
      if (shotList.warnings.length > 0) {
        console.log(chalk.yellow(`\n⚠️  ${shotList.warnings.length} warning(s):`));
        for (const warning of shotList.warnings.slice(0, 5)) {
          console.log(chalk.yellow(`   - Shot ${warning.shotNumber}: ${warning.message}`));
        }
        if (shotList.warnings.length > 5) {
          console.log(chalk.gray(`   ... and ${shotList.warnings.length - 5} more`));
        }
        console.log();
      }

      // Step 4: Format output
      console.log(chalk.gray('📝 Formatting output...'));
      const formatter = createFormatter(format as OutputFormat);
      const output = formatter.format(shotList);

      // Step 5: Write output
      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
        console.log(chalk.green(`✓ Shot list saved to: ${options.output}\n`));

        if (logging && logger) {
          const inputStats = fs.statSync(options.path);
          const outputStats = fs.statSync(options.output);
          await logger.logSuccess(
            'Output file written',
            {
              shotCount: shotList.totalShots,
              duration: shotList.totalDuration,
              characterCount: shotList.totalCharacters,
              processingTime: 0,
              warningCount: shotList.warnings.length,
              inputFileSize: inputStats.size,
              outputFileSize: outputStats.size
            },
            options.path,
            options.output,
            format
          );
        }
      } else {
        // Print to console
        console.log(chalk.blue('\n📋 Shot List:\n'));
        console.log(output);
        console.log();
      }

      console.log(chalk.green('✅ Shot list generation complete!\n'));
      exitWithCode(ExitCode.SUCCESS);

    } catch (parseError: any) {
      console.error(chalk.red(`\n❌ Error during generation: ${parseError.message}\n`));

      if (logging && logger) {
        // Create error definition from the caught error
        const errorDef = {
          code: 'GE001',
          name: 'Generation Error',
          description: parseError.message,
          severity: 'error' as const,
          exitCode: ExitCode.GENERAL_ERROR,
          recovery: 'Check input file and try again',
          message: () => parseError.message,
          fix: () => 'Verify the screenplay file is valid and try again',
          autoFixable: false,
          relatedDocs: []
        };

        await logger.logError(errorDef, {
          inputFile: options.path,
          stage: 'generation'
        }, parseError.stack);
      }

      exitWithCode(ExitCode.GENERAL_ERROR);
    }

  } catch (error) {
    console.error(chalk.red('Error generating shot list:'), error);
    exitWithCode(ExitCode.GENERAL_ERROR);
  }
}

