# PHP CLI Tools Best Practices

## Overview

This guide provides best practices for developing command-line interface (CLI) tools in PHP using the Symfony Console component, including command structure, argument handling, error handling, and user interaction.

## Symfony Console Component

### Basic Command Structure

```php
<?php

namespace App\Console\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class UserCreateCommand extends Command
{
    protected static $defaultName = 'user:create';
    protected static $defaultDescription = 'Create a new user';
    
    protected function configure(): void
    {
        $this
            ->setDescription('Create a new user in the system')
            ->setHelp('This command allows you to create a user...')
            ->addArgument('name', InputArgument::REQUIRED, 'The name of the user')
            ->addArgument('email', InputArgument::REQUIRED, 'The email of the user')
            ->addOption('admin', 'a', InputOption::VALUE_NONE, 'Make the user an admin')
            ->addOption('role', 'r', InputOption::VALUE_REQUIRED, 'User role', 'user');
    }
    
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $name = $input->getArgument('name');
        $email = $input->getArgument('email');
        $isAdmin = $input->getOption('admin');
        $role = $input->getOption('role');
        
        $output->writeln("<info>Creating user: {$name}</info>");
        
        try {
            // Create user logic here
            $user = $this->createUser($name, $email, $role, $isAdmin);
            
            $output->writeln("<info>User created successfully!</info>");
            $output->writeln("ID: {$user->id}");
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $output->writeln("<error>Error: {$e->getMessage()}</error>");
            return Command::FAILURE;
        }
    }
    
    private function createUser(string $name, string $email, string $role, bool $isAdmin): object
    {
        // Implementation
        return (object)['id' => 123, 'name' => $name, 'email' => $email];
    }
}
```

### Command Naming Conventions

Use **namespace:action** format:

```
✅ Good:
user:create
user:delete
cache:clear
db:migrate
report:generate

❌ Bad:
createUser
deleteuser
clear_cache
migrate
```

## Arguments and Options

### Arguments

**Arguments are positional and can be required or optional:**

```php
<?php

// Required argument
$this->addArgument('filename', InputArgument::REQUIRED, 'The file to process');

// Optional argument
$this->addArgument('output', InputArgument::OPTIONAL, 'Output file', 'output.txt');

// Array argument (must be last)
$this->addArgument('files', InputArgument::IS_ARRAY, 'Files to process');

// Usage in execute()
$filename = $input->getArgument('filename');
$output = $input->getArgument('output');
$files = $input->getArgument('files'); // Returns array
```

### Options

**Options are named and always optional:**

```php
<?php

// Flag option (no value)
$this->addOption('force', 'f', InputOption::VALUE_NONE, 'Force the operation');

// Option with required value
$this->addOption('format', null, InputOption::VALUE_REQUIRED, 'Output format');

// Option with optional value
$this->addOption('verbose', 'v', InputOption::VALUE_OPTIONAL, 'Verbosity level', 1);

// Option with default value
$this->addOption('limit', 'l', InputOption::VALUE_REQUIRED, 'Limit results', 100);

// Array option (can be specified multiple times)
$this->addOption('exclude', null, InputOption::VALUE_IS_ARRAY | InputOption::VALUE_REQUIRED, 'Exclude patterns');

// Usage in execute()
$force = $input->getOption('force');
$format = $input->getOption('format');
$excludes = $input->getOption('exclude'); // Returns array
```

## Input/Output Handling

### Output Formatting

```php
<?php

protected function execute(InputInterface $input, OutputInterface $output): int
{
    // Basic output
    $output->writeln('Normal text');
    
    // Styled output
    $output->writeln('<info>Info message</info>');
    $output->writeln('<comment>Comment message</comment>');
    $output->writeln('<question>Question message</question>');
    $output->writeln('<error>Error message</error>');
    
    // Custom styles
    $output->writeln('<fg=green>Green text</>');
    $output->writeln('<bg=yellow;fg=black>Yellow background</>');
    $output->writeln('<options=bold>Bold text</>');
    
    // Verbosity levels
    $output->writeln('Always shown');
    $output->writeln('Verbose', OutputInterface::VERBOSITY_VERBOSE);
    $output->writeln('Very verbose', OutputInterface::VERBOSITY_VERY_VERBOSE);
    $output->writeln('Debug', OutputInterface::VERBOSITY_DEBUG);
    
    return Command::SUCCESS;
}
```

### Interactive Input

```php
<?php

use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Question\ConfirmationQuestion;
use Symfony\Component\Console\Question\ChoiceQuestion;

protected function execute(InputInterface $input, OutputInterface $output): int
{
    $helper = $this->getHelper('question');
    
    // Simple question
    $question = new Question('Please enter your name: ', 'John Doe');
    $name = $helper->ask($input, $output, $question);
    
    // Hidden input (for passwords)
    $question = new Question('Please enter your password: ');
    $question->setHidden(true);
    $question->setHiddenFallback(false);
    $password = $helper->ask($input, $output, $question);
    
    // Confirmation question
    $question = new ConfirmationQuestion('Continue with this action? (y/n) ', false);
    if (!$helper->ask($input, $output, $question)) {
        return Command::SUCCESS;
    }
    
    // Choice question
    $question = new ChoiceQuestion(
        'Please select your role',
        ['user', 'admin', 'moderator'],
        0 // Default index
    );
    $role = $helper->ask($input, $output, $question);

    return Command::SUCCESS;
}
```

## Progress Indicators

### Progress Bar

```php
<?php

use Symfony\Component\Console\Helper\ProgressBar;

protected function execute(InputInterface $input, OutputInterface $output): int
{
    $items = range(1, 100);

    $progressBar = new ProgressBar($output, count($items));
    $progressBar->start();

    foreach ($items as $item) {
        // Process item
        sleep(1);

        $progressBar->advance();
    }

    $progressBar->finish();
    $output->writeln(''); // New line after progress bar

    return Command::SUCCESS;
}
```

### Custom Progress Bar Format

```php
<?php

$progressBar = new ProgressBar($output, 100);
$progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%');
$progressBar->start();

// Or use predefined formats
$progressBar->setFormat('verbose');
$progressBar->setFormat('very_verbose');
$progressBar->setFormat('debug');
```

### Spinner for Indeterminate Progress

```php
<?php

use Symfony\Component\Console\Helper\ProgressIndicator;

protected function execute(InputInterface $input, OutputInterface $output): int
{
    $spinner = new ProgressIndicator($output);
    $spinner->start('Processing...');

    while ($condition) {
        // Do work
        usleep(100000);
        $spinner->advance();
    }

    $spinner->finish('Done!');

    return Command::SUCCESS;
}
```

## Error Handling and Exit Codes

### Exit Codes

```php
<?php

protected function execute(InputInterface $input, OutputInterface $output): int
{
    try {
        // Successful execution
        return Command::SUCCESS; // 0

    } catch (ValidationException $e) {
        $output->writeln("<error>Validation error: {$e->getMessage()}</error>");
        return Command::INVALID; // 2

    } catch (\Exception $e) {
        $output->writeln("<error>Error: {$e->getMessage()}</error>");
        return Command::FAILURE; // 1
    }
}
```

### Custom Exit Codes

```php
<?php

class MyCommand extends Command
{
    public const EXIT_SUCCESS = 0;
    public const EXIT_GENERAL_ERROR = 1;
    public const EXIT_INVALID_INPUT = 2;
    public const EXIT_FILE_NOT_FOUND = 3;
    public const EXIT_PERMISSION_DENIED = 4;

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        if (!file_exists($filename)) {
            $output->writeln("<error>File not found: {$filename}</error>");
            return self::EXIT_FILE_NOT_FOUND;
        }

        if (!is_readable($filename)) {
            $output->writeln("<error>Permission denied: {$filename}</error>");
            return self::EXIT_PERMISSION_DENIED;
        }

        return self::EXIT_SUCCESS;
    }
}
```

## Tables

### Displaying Tabular Data

```php
<?php

use Symfony\Component\Console\Helper\Table;

protected function execute(InputInterface $input, OutputInterface $output): int
{
    $table = new Table($output);
    $table
        ->setHeaders(['ID', 'Name', 'Email', 'Status'])
        ->setRows([
            [1, 'John Doe', 'john@example.com', 'Active'],
            [2, 'Jane Smith', 'jane@example.com', 'Inactive'],
            [3, 'Bob Johnson', 'bob@example.com', 'Active'],
        ]);

    $table->render();

    return Command::SUCCESS;
}
```

## Idempotency

### Making Commands Idempotent

```php
<?php

class ImportDataCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $filename = $input->getArgument('filename');

        // Check if already imported
        if ($this->isAlreadyImported($filename)) {
            $output->writeln('<comment>File already imported. Skipping.</comment>');
            return Command::SUCCESS;
        }

        // Use transactions for database operations
        DB::beginTransaction();

        try {
            $this->importData($filename);

            // Mark as imported
            $this->markAsImported($filename);

            DB::commit();
            $output->writeln('<info>Import completed successfully</info>');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            DB::rollBack();
            $output->writeln("<error>Import failed: {$e->getMessage()}</error>");
            return Command::FAILURE;
        }
    }

    private function isAlreadyImported(string $filename): bool
    {
        return ImportLog::where('filename', $filename)->exists();
    }

    private function markAsImported(string $filename): void
    {
        ImportLog::create([
            'filename' => $filename,
            'imported_at' => now()
        ]);
    }
}
```

## Best Practices

### ✅ DO

- Use descriptive command names with namespace:action format
- Provide clear help text and descriptions
- Validate input arguments and options
- Use appropriate exit codes
- Show progress for long-running operations
- Make commands idempotent when possible
- Use transactions for database operations
- Log command execution and errors
- Provide verbose output options
- Handle interruptions gracefully (SIGINT, SIGTERM)
- Use dependency injection for services
- Write tests for commands

### ❌ DON'T

- Use generic command names without namespaces
- Ignore user input validation
- Always return 0 (success) regardless of outcome
- Run long operations without progress indicators
- Modify data without confirmation in destructive operations
- Use global state or static methods
- Hardcode configuration values
- Suppress error messages
- Use echo/print instead of OutputInterface
- Perform operations that can't be rolled back

## Security Checklist

- [ ] Validate all input arguments and options
- [ ] Sanitize file paths to prevent directory traversal
- [ ] Use parameterized queries for database operations
- [ ] Don't expose sensitive data in output
- [ ] Implement proper permission checks
- [ ] Use secure temporary file handling
- [ ] Validate file uploads and imports
- [ ] Log security-relevant events
- [ ] Don't execute arbitrary code from input
- [ ] Use environment variables for credentials

## Performance Tips

- Use batch processing for large datasets
- Implement chunking for memory-intensive operations
- Use database transactions efficiently
- Optimize queries (avoid N+1 problems)
- Use caching where appropriate
- Implement timeout handling for external services
- Use async operations for I/O-bound tasks
- Profile long-running commands
- Implement graceful shutdown on signals
- Use memory-efficient data structures

