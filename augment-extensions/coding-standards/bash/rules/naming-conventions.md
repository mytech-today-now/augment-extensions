# Bash Naming Conventions

Comprehensive naming standards for Bash code following Google Shell Style Guide and industry best practices.

## Variables

### Standard Variables

**Use lowercase with underscores** (snake_case):

```bash
# ✅ Correct
user_name="john_doe"
file_path="/tmp/data.txt"
max_retry_count=3
is_enabled=true

# ❌ Incorrect
userName="john_doe"        # camelCase
file-path="/tmp/data.txt"  # kebab-case
MAXRETRYCOUNT=3            # ALL CAPS (reserved for constants)
```

### Constants and Environment Variables

**Use UPPERCASE with underscores**:

```bash
# Constants
readonly MAX_RETRIES=5
readonly DEFAULT_TIMEOUT=30
readonly API_BASE_URL="https://api.example.com"

# Environment variables
export PATH="/usr/local/bin:$PATH"
export DATABASE_URL="postgresql://localhost/mydb"
export LOG_LEVEL="INFO"
```

### Boolean Variables

Prefix with `is_`, `has_`, `should_`, `can_`:

```bash
is_valid=true
has_permission=false
should_continue=true
can_write=false

# Usage in conditionals
if [[ "$is_valid" == "true" ]]; then
  echo "Valid"
fi
```

### Loop Variables

Use descriptive names, even for simple loops:

```bash
# ✅ Good
for file in *.txt; do
  echo "$file"
done

for user in "${users[@]}"; do
  echo "$user"
done

# ❌ Avoid single letters (except for very short loops)
for i in {1..10}; do  # OK for numeric iteration
  echo "$i"
done

for f in *.txt; do  # Avoid - use 'file' instead
  echo "$f"
done
```

### Temporary Variables

Prefix with `tmp_` or `temp_`:

```bash
tmp_file="/tmp/data_$$.txt"
temp_dir="$(mktemp -d)"
tmp_result=""
```

## Functions

### Function Names

**Use lowercase with underscores** (snake_case):

```bash
# ✅ Correct
function process_data() {
  # ...
}

function validate_input() {
  # ...
}

function get_user_info() {
  # ...
}

# ❌ Incorrect
function processData() {  # camelCase
  # ...
}

function Process-Data() {  # PascalCase
  # ...
}
```

### Verb-Noun Pattern

Use descriptive verb-noun combinations:

```bash
# ✅ Good verbs
get_user_data()
set_configuration()
validate_email()
parse_json()
format_output()
check_permissions()
create_backup()
delete_temp_files()
update_database()
send_notification()

# ❌ Vague names
do_stuff()
handle()
process()
run()
```

### Private/Internal Functions

Prefix with underscore `_`:

```bash
# Public function
function deploy_application() {
  _validate_environment
  _build_artifacts
  _upload_to_server
}

# Private helper functions
function _validate_environment() {
  # ...
}

function _build_artifacts() {
  # ...
}

function _upload_to_server() {
  # ...
}
```

## Arrays

### Array Names

Use plural nouns:

```bash
# ✅ Correct
files=()
users=("alice" "bob" "charlie")
error_messages=()
config_options=()

# ❌ Incorrect
file=()  # Singular
user_list=("alice" "bob")  # Redundant 'list'
```

### Associative Arrays

Use descriptive names with `_map` or `_dict` suffix (optional):

```bash
declare -A user_map
user_map["alice"]="admin"
user_map["bob"]="user"

declare -A config
config["host"]="localhost"
config["port"]="5432"
```

## File and Directory Names

### Script Files

```bash
# ✅ Good
backup_database.sh
deploy_application.sh
process_logs.sh
validate_config.sh

# ❌ Avoid
BackupDatabase.sh  # PascalCase
backup-database.sh  # kebab-case (harder to source)
bkup_db.sh  # Abbreviations
```

### Configuration Files

```bash
# ✅ Good
.bashrc
.bash_profile
config.sh
settings.conf

# ❌ Avoid
Config.sh
SETTINGS.CONF
```

## Special Variables

### Positional Parameters

Document clearly:

```bash
function process_file() {
  local input_file="$1"
  local output_file="$2"
  local options="${3:-}"  # Optional parameter with default
  
  # Use descriptive names, not $1, $2, $3
}
```

### Special Shell Variables

Know and use appropriately:

```bash
# Process ID
echo "$$"

# Last background process ID
echo "$!"

# Exit status of last command
echo "$?"

# Number of arguments
echo "$#"

# All arguments as separate words
echo "$@"

# All arguments as single word
echo "$*"

# Script name
echo "$0"
```

## Naming Anti-Patterns

### Avoid

```bash
# ❌ Single letter variables (except loop counters)
a="value"
x=10

# ❌ Abbreviations
usr_nm="john"
cfg_pth="/etc/config"
tmp_fl="/tmp/file"

# ❌ Hungarian notation
str_name="john"
int_count=5
bool_is_valid=true

# ❌ Redundant prefixes
var_user_name="john"
func_process_data() { }

# ❌ Inconsistent naming
userName="john"
file_path="/tmp"
MAX-RETRIES=3
```

### Use Instead

```bash
# ✅ Descriptive names
user_name="john"
config_path="/etc/config"
temp_file="/tmp/file"

# ✅ Clear types from context
name="john"
count=5
is_valid=true

# ✅ Consistent style
user_name="john"
file_path="/tmp"
MAX_RETRIES=3
```

## Best Practices Summary

1. **Variables**: lowercase_with_underscores
2. **Constants**: UPPERCASE_WITH_UNDERSCORES
3. **Functions**: lowercase_with_underscores (verb_noun pattern)
4. **Arrays**: plural_nouns
5. **Booleans**: is_/has_/should_/can_ prefix
6. **Private functions**: _leading_underscore
7. **Temporary variables**: tmp_/temp_ prefix
8. **Be descriptive**: Avoid abbreviations
9. **Be consistent**: Same style throughout
10. **Document parameters**: Use local variables with clear names

