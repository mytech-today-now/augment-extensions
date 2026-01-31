# Bash Universal Standards

Cross-cutting standards that apply to ALL Bash code regardless of project category.

## Core Principles

### 1. Readability First
- Code is read more often than written
- Optimize for maintainability over cleverness
- Use descriptive names over comments when possible

### 2. Fail Fast
- Exit immediately on errors
- Validate inputs early
- Check command availability before use

### 3. Explicit Over Implicit
- Quote all variables
- Use full command paths for critical operations
- Declare function parameters explicitly

## Script Header

### Shebang

**Portable** (recommended):
```bash
#!/usr/bin/env bash
```

**System-specific** (when you need specific Bash location):
```bash
#!/bin/bash
```

**NEVER use**:
```bash
#!/bin/sh  # This is POSIX shell, not Bash
```

### Strict Mode

**ALWAYS** enable strict mode at the beginning of scripts:

```bash
#!/usr/bin/env bash
set -euo pipefail

# -e: Exit on error
# -u: Exit on undefined variable
# -o pipefail: Exit on pipe failure
```

### Script Header Template

```bash
#!/usr/bin/env bash
set -euo pipefail

#######################################
# Brief description of what the script does
# Globals:
#   GLOBAL_VAR
# Arguments:
#   $1: Description of first argument
#   $2: Description of second argument
# Outputs:
#   Writes progress to stdout
# Returns:
#   0 on success, non-zero on error
#######################################
```

## Indentation and Formatting

### Indentation
- **2 spaces** (Google Style Guide) or **4 spaces** (common alternative)
- **NO TABS**
- Be consistent throughout the file

```bash
# ✅ Correct (2 spaces)
if [[ "$status" == "active" ]]; then
  echo "Processing..."
  process_data "$file"
fi

# ❌ Incorrect (mixed tabs and spaces)
if [[ "$status" == "active" ]]; then
	echo "Processing..."
    process_data "$file"
fi
```

### Line Length
- **Maximum 80 characters** (strict)
- **Maximum 100 characters** (relaxed)
- Break long lines with backslash `\`

```bash
# ✅ Good
long_command \
  --option1 value1 \
  --option2 value2 \
  --option3 value3

# ❌ Bad (too long)
long_command --option1 value1 --option2 value2 --option3 value3 --option4 value4 --option5 value5
```

## Quoting

### Always Quote Variables

```bash
# ✅ Correct
echo "$user_name"
rm -f "$temp_file"
cd "$project_dir" || exit 1

# ❌ Incorrect (word splitting and globbing issues)
echo $user_name
rm -f $temp_file
cd $project_dir
```

### Quote Command Substitutions

```bash
# ✅ Correct
current_date="$(date +%Y-%m-%d)"
file_count="$(find . -type f | wc -l)"

# ❌ Incorrect
current_date=$(date +%Y-%m-%d)
file_count=$(find . -type f | wc -l)
```

### When NOT to Quote

```bash
# Intentional word splitting
files=(*.txt)  # Array assignment
for file in *.txt; do  # Glob expansion
  echo "$file"
done

# Arithmetic expansion
count=$((count + 1))
```

## Functions

### Function Declaration

```bash
# ✅ Preferred (explicit function keyword)
function process_file() {
  local file="$1"
  # ...
}

# ✅ Also acceptable (POSIX style)
process_file() {
  local file="$1"
  # ...
}
```

### Local Variables

**ALWAYS** declare function variables as `local`:

```bash
function calculate_sum() {
  local num1="$1"
  local num2="$2"
  local result=$((num1 + num2))
  echo "$result"
}
```

### Return Values

```bash
# Return status code (0-255)
function check_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    return 0  # Success
  else
    return 1  # Failure
  fi
}

# Return data via stdout
function get_timestamp() {
  date +%Y-%m-%d_%H-%M-%S
}

# Capture return value
timestamp="$(get_timestamp)"
```

## Error Handling

### Check Command Availability

```bash
# ✅ Check before use
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed" >&2
  exit 1
fi
```

### Check Command Success

```bash
# ✅ Method 1: if statement
if ! mkdir -p "$output_dir"; then
  echo "Error: Failed to create directory" >&2
  exit 1
fi

# ✅ Method 2: || operator
mkdir -p "$output_dir" || {
  echo "Error: Failed to create directory" >&2
  exit 1
}

# ✅ Method 3: set -e with explicit check
cd "$project_dir" || exit 1
```

## Comments

### When to Comment

```bash
# ✅ Good: Explain WHY, not WHAT
# Retry 3 times because API is flaky
for i in {1..3}; do
  if curl -s "$api_url"; then
    break
  fi
  sleep 2
done

# ❌ Bad: Obvious comment
# Loop from 1 to 3
for i in {1..3}; do
  # ...
done
```

### Function Documentation

```bash
#######################################
# Downloads file from URL with retry logic
# Globals:
#   MAX_RETRIES
# Arguments:
#   $1: URL to download
#   $2: Output file path
# Outputs:
#   Progress messages to stdout
# Returns:
#   0 on success, 1 on failure
#######################################
function download_file() {
  # ...
}
```

## Best Practices Summary

1. **Use strict mode**: `set -euo pipefail`
2. **Quote all variables**: `"$var"` not `$var`
3. **Use local variables**: `local var="value"`
4. **Check command availability**: `command -v cmd`
5. **Handle errors explicitly**: `|| exit 1`
6. **Use functions**: Modularize code
7. **Document functions**: Use comment headers
8. **Consistent indentation**: 2 or 4 spaces, no tabs
9. **Limit line length**: 80-100 characters
10. **Meaningful names**: `user_name` not `un`

