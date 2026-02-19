# C Coding Standards - Configuration Reference

## Table of Contents

1. [Configuration File Format](#configuration-file-format)
2. [Schema Reference](#schema-reference)
3. [Configuration Options](#configuration-options)
4. [Examples](#examples)
5. [Validation](#validation)

---

## Configuration File Format

### Supported Formats

The extension supports two configuration file formats:

1. **JSON** - `.augment/c-standards.json`
2. **YAML** - `.augment/c-standards.yaml`

### File Location

Place your configuration file in the `.augment` directory at your project root:

```
project-root/
├── .augment/
│   └── c-standards.json  (or c-standards.yaml)
├── src/
└── include/
```

---

## Schema Reference

### Root Object

```typescript
{
  c_standards: CStandardsConfiguration
}
```

### CStandardsConfiguration

```typescript
interface CStandardsConfiguration {
  version: string;                    // Configuration version
  categories: string[];               // Active categories
  c_standard: CStandard;             // C standard to follow
  universal_rules: UniversalRules;   // Universal rule settings
  category_overrides?: CategoryOverrides;  // Category-specific overrides
  static_analysis?: StaticAnalysis;  // Static analysis tool integration
  custom_rules?: CustomRules;        // Custom rule configuration
}
```

### CStandard

```typescript
type CStandard = 'c89' | 'c99' | 'c11' | 'c17' | 'c23';
```

**Options:**
- `c89` - ANSI C (C89/C90)
- `c99` - C99 standard
- `c11` - C11 standard (recommended)
- `c17` - C17 standard
- `c23` - C23 standard (latest)

### UniversalRules

```typescript
interface UniversalRules {
  naming: RuleState;
  memory_safety: RuleState;
  error_handling: RuleState;
  documentation: RuleState;
  header_guards: RuleState;
  const_correctness: RuleState;
}

type RuleState = 'enabled' | 'warning' | 'disabled';
```

**Rule States:**
- `enabled` - Violations are reported as errors
- `warning` - Violations are reported as warnings
- `disabled` - Rule is not checked

### Categories

```typescript
type Category = 
  | 'systems'      // Systems programming
  | 'embedded'     // Embedded systems
  | 'kernel'       // Kernel development
  | 'drivers'      // Device drivers
  | 'realtime'     // Real-time systems
  | 'networking'   // Networking
  | 'legacy';      // Legacy code
```

### CategoryOverrides

```typescript
interface CategoryOverrides {
  systems?: SystemsOverrides;
  embedded?: EmbeddedOverrides;
  kernel?: KernelOverrides;
  drivers?: DriversOverrides;
  realtime?: RealtimeOverrides;
  networking?: NetworkingOverrides;
  legacy?: LegacyOverrides;
}
```

#### SystemsOverrides

```typescript
interface SystemsOverrides {
  require_posix_compliance?: boolean;
  allow_gnu_extensions?: boolean;
  max_file_descriptors?: number;
}
```

#### EmbeddedOverrides

```typescript
interface EmbeddedOverrides {
  allow_dynamic_allocation?: boolean;
  require_volatile_hardware?: boolean;
  max_stack_usage?: number;
  require_interrupt_safety?: boolean;
}
```

#### KernelOverrides

```typescript
interface KernelOverrides {
  follow_kernel_style?: boolean;
  require_module_license?: boolean;
  max_function_length?: number;
}
```

#### DriversOverrides

```typescript
interface DriversOverrides {
  require_error_cleanup?: boolean;
  require_dma_safety?: boolean;
  max_interrupt_latency?: number;
}
```

#### RealtimeOverrides

```typescript
interface RealtimeOverrides {
  require_deterministic_paths?: boolean;
  max_function_complexity?: number;
  max_execution_time?: number;
}
```

#### NetworkingOverrides

```typescript
interface NetworkingOverrides {
  require_byte_order_conversion?: boolean;
  require_socket_error_handling?: boolean;
  max_packet_size?: number;
}
```

#### LegacyOverrides

```typescript
interface LegacyOverrides {
  allow_deprecated_functions?: boolean;
  require_compatibility_layer?: boolean;
  min_c_standard?: CStandard;
}
```

### StaticAnalysis

```typescript
interface StaticAnalysis {
  clang_tidy?: boolean;
  cppcheck?: boolean;
  valgrind?: boolean;
  custom_tools?: string[];
}
```

### CustomRules

```typescript
interface CustomRules {
  enabled: boolean;
  path: string;
}
```

---

## Configuration Options

### version

**Type:** `string`  
**Required:** Yes  
**Default:** `"1.0.0"`

Configuration schema version.

**Example:**
```json
{
  "version": "1.0.0"
}
```

### categories

**Type:** `string[]`  
**Required:** Yes  
**Default:** `[]`

Array of active categories for your project.

**Example:**
```json
{
  "categories": ["systems", "embedded", "networking"]
}
```

### c_standard

**Type:** `CStandard`  
**Required:** Yes  
**Default:** `"c11"`

C language standard to follow.

**Example:**
```json
{
  "c_standard": "c11"
}
```

