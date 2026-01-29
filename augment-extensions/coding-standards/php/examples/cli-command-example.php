<?php

/**
 * CLI Command Example - Data Migration Script
 * 
 * This example demonstrates best practices for PHP CLI tools including:
 * - Symfony Console component usage
 * - Argument and option handling with validation
 * - Progress bars for long-running operations
 * - Proper error handling and exit codes
 * - Idempotency (can be run multiple times safely)
 * - Database transactions
 * - Logging
 */

namespace App\Console\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Migrate user data from legacy system to new system
 * 
 * Usage:
 *   php artisan users:migrate legacy_users.csv --batch-size=100 --dry-run
 */
class MigrateUsersCommand extends Command
{
    protected static $defaultName = 'users:migrate';
    protected static $defaultDescription = 'Migrate users from legacy CSV file to new system';
    
    private int $successCount = 0;
    private int $errorCount = 0;
    private int $skippedCount = 0;
    
    protected function configure(): void
    {
        $this
            ->setDescription('Migrate users from a CSV file to the new database')
            ->setHelp('This command migrates user data from a legacy CSV file...')
            ->addArgument(
                'file',
                InputArgument::REQUIRED,
                'Path to the CSV file containing user data'
            )
            ->addOption(
                'batch-size',
                'b',
                InputOption::VALUE_REQUIRED,
                'Number of records to process in each batch',
                100
            )
            ->addOption(
                'dry-run',
                null,
                InputOption::VALUE_NONE,
                'Run without making any changes to the database'
            )
            ->addOption(
                'force',
                'f',
                InputOption::VALUE_NONE,
                'Skip confirmation prompt'
            );
    }
    
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $filename = $input->getArgument('file');
        $batchSize = (int) $input->getOption('batch-size');
        $isDryRun = $input->getOption('dry-run');
        $force = $input->getOption('force');
        
        // Validate file exists
        if (!file_exists($filename)) {
            $output->writeln("<error>File not found: {$filename}</error>");
            return Command::FAILURE;
        }
        
        // Validate file is readable
        if (!is_readable($filename)) {
            $output->writeln("<error>File is not readable: {$filename}</error>");
            return Command::FAILURE;
        }
        
        // Count total records
        $totalRecords = $this->countRecords($filename);
        
        $output->writeln("<info>Found {$totalRecords} records to migrate</info>");
        
        if ($isDryRun) {
            $output->writeln("<comment>DRY RUN MODE - No changes will be made</comment>");
        }
        
        // Confirmation prompt
        if (!$force && !$isDryRun) {
            $helper = $this->getHelper('question');
            $question = new ConfirmationQuestion(
                'Continue with migration? (y/n) ',
                false
            );
            
            if (!$helper->ask($input, $output, $question)) {
                $output->writeln('<comment>Migration cancelled</comment>');
                return Command::SUCCESS;
            }
        }
        
        // Create progress bar
        $progressBar = new ProgressBar($output, $totalRecords);
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%');
        $progressBar->start();
        
        // Process file in batches
        try {
            $this->processFile($filename, $batchSize, $isDryRun, $progressBar);
            
            $progressBar->finish();
            $output->writeln('');
            
            // Display summary
            $this->displaySummary($output, $isDryRun);
            
            // Log completion
            Log::info('User migration completed', [
                'file' => $filename,
                'success' => $this->successCount,
                'errors' => $this->errorCount,
                'skipped' => $this->skippedCount,
                'dry_run' => $isDryRun
            ]);
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $progressBar->finish();
            $output->writeln('');
            $output->writeln("<error>Migration failed: {$e->getMessage()}</error>");
            
            Log::error('User migration failed', [
                'file' => $filename,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Command::FAILURE;
        }
    }
    
    private function countRecords(string $filename): int
    {
        $count = 0;
        $handle = fopen($filename, 'r');
        
        // Skip header
        fgetcsv($handle);
        
        while (fgetcsv($handle) !== false) {
            $count++;
        }
        
        fclose($handle);
        return $count;
    }
    
    private function processFile(
        string $filename,
        int $batchSize,
        bool $isDryRun,
        ProgressBar $progressBar
    ): void {
        $handle = fopen($filename, 'r');
        
        // Read header
        $header = fgetcsv($handle);
        
        $batch = [];
        
        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);
            $batch[] = $data;
            
            if (count($batch) >= $batchSize) {
                $this->processBatch($batch, $isDryRun);
                $progressBar->advance(count($batch));
                $batch = [];
            }
        }
        
        // Process remaining records
        if (!empty($batch)) {
            $this->processBatch($batch, $isDryRun);
            $progressBar->advance(count($batch));
        }
        
        fclose($handle);
    }
}

