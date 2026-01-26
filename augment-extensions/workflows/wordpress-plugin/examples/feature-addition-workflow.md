# Feature Addition Workflow Example

This example demonstrates adding a new feature to an existing WordPress plugin using OpenSpec and Beads.

## Scenario

Adding a "Custom Fields" feature to an existing "Simple Contact Form" plugin to allow admins to add custom form fields beyond the default name, email, subject, and message fields.

## Existing Plugin

**Plugin**: Simple Contact Form (from complete-plugin-example.md)

**Current Features**:
- Frontend contact form with fixed fields (name, email, subject, message)
- Admin page to view submissions
- Email notifications
- AJAX submission
- Rate limiting

**New Feature**: Custom Fields
- Allow admins to create custom form fields
- Support field types: text, textarea, select, checkbox, radio
- Store custom field data with submissions
- Display custom fields in admin submissions view

## Workflow Steps

### Step 1: Create OpenSpec Change Proposal

**File**: `openspec/changes/custom-fields/proposal.md`

```markdown
---
id: custom-fields
relatedTasks: []
relatedRules: [module-development.md]
status: draft
---

# Add Custom Fields to Contact Form

## Motivation

Users have requested the ability to add custom fields to the contact form beyond
the default fields. This would allow collecting additional information like:
- Phone number
- Company name
- Department selection
- Budget range
- Preferred contact method

## Changes

1. Add custom fields management in admin
2. Modify database schema to store custom field definitions
3. Update form rendering to include custom fields
4. Update submission handler to save custom field data
5. Update admin submissions view to display custom field data

## Impact

### Breaking Changes
- None (backward compatible)

### Database Changes
- Create `wp_simple_contact_custom_fields` table
- Add `custom_fields_data` column to `wp_simple_contact_messages` table (JSON)

### Admin Changes
- New admin page: Tools > Contact Form > Custom Fields
- Add/edit/delete custom fields interface
- Drag-and-drop field ordering

### Frontend Changes
- Custom fields rendered in form based on admin configuration
- Validation for required custom fields
- Custom field data included in AJAX submission

## Timeline

- Database schema: 1 day
- Admin interface: 2-3 days
- Frontend integration: 1-2 days
- Testing: 1-2 days

## Dependencies

- Existing Simple Contact Form plugin
```

### Step 2: Create OpenSpec Spec Delta

**File**: `openspec/changes/custom-fields/specs/plugin-features/contact-form.md`

```markdown
---
id: plugin-features/contact-form
status: active
relatedTasks: []
---

# Delta for Contact Form Specification

## ADDED Requirements

### Requirement: Custom Fields Management
Admins MUST be able to create, edit, and delete custom form fields.

#### Scenario: Create custom field
- GIVEN an admin is on the Custom Fields page
- WHEN they click "Add Field"
- AND enter field details (label, type, required, options)
- AND click "Save"
- THEN the field is saved to the database
- AND appears in the fields list
- AND is rendered in the frontend form

#### Scenario: Edit custom field
- GIVEN a custom field exists
- WHEN an admin edits the field
- THEN changes are saved
- AND the frontend form updates immediately

#### Scenario: Delete custom field
- GIVEN a custom field exists
- WHEN an admin deletes the field
- THEN the field is removed from the database
- AND removed from the frontend form
- AND existing submission data is preserved

#### Scenario: Reorder fields
- GIVEN multiple custom fields exist
- WHEN an admin drags a field to a new position
- THEN the order is saved
- AND the frontend form reflects the new order

### Requirement: Custom Field Types
The system MUST support multiple field types.

**Supported Types**:
- Text input (single line)
- Textarea (multi-line)
- Select dropdown
- Checkbox (single)
- Radio buttons
- Email
- Phone
- URL

#### Scenario: Text field
- WHEN a text field is added
- THEN it renders as `<input type="text">`
- AND validates as required if configured

#### Scenario: Select field
- WHEN a select field is added with options
- THEN it renders as `<select>` with `<option>` elements
- AND validates selection if required

### Requirement: Custom Field Data Storage
Custom field data MUST be stored with each submission.

#### Scenario: Submit form with custom fields
- GIVEN a form has custom fields
- WHEN a user submits the form
- THEN custom field data is validated
- AND saved as JSON in `custom_fields_data` column
- AND included in email notification

## MODIFIED Requirements

### Requirement: Form Rendering (MODIFIED)
The system SHALL render both default and custom fields in the contact form.

#### Scenario: Render form (MODIFIED)
- WHEN the form is displayed
- THEN default fields are rendered (name, email, subject, message)
- AND custom fields are rendered in configured order (ADDED)
- AND all fields have proper labels and validation (CHANGED)

### Requirement: Submission Handling (MODIFIED)
The system SHALL validate and save both default and custom field data.

#### Scenario: Form submission (MODIFIED)
- WHEN a user submits the form
- THEN default fields are validated
- AND custom fields are validated (ADDED)
- AND all data is saved to database
- AND email notification includes custom field data (ADDED)

## REMOVED Requirements

(None for this change)
```

### Step 3: Create Beads Tasks

```bash
# Create epic for custom fields feature
bd create "Add Custom Fields to Contact Form" -p 1 --type epic --label wordpress --label plugin --label feature
# Returns: bd-cf

# Database changes
bd create "Create custom_fields table schema" -p 0 --parent bd-cf --label database
# Returns: bd-cf.1

bd create "Add custom_fields_data column to messages table" -p 0 --parent bd-cf --label database
# Returns: bd-cf.2

bd create "Create database migration script" -p 0 --parent bd-cf --label database
# Returns: bd-cf.3

# Core classes
bd create "Create CustomField model class" -p 1 --parent bd-cf --label implementation
# Returns: bd-cf.4

bd create "Create FieldRenderer class" -p 1 --parent bd-cf --label implementation
# Returns: bd-cf.5

bd create "Create FieldValidator class" -p 1 --parent bd-cf --label implementation
# Returns: bd-cf.6

# Admin interface
bd create "Create Custom Fields admin page" -p 1 --parent bd-cf --label admin
# Returns: bd-cf.7

bd create "Add field creation UI" -p 1 --parent bd-cf --label admin
# Returns: bd-cf.8

bd create "Add field editing UI" -p 1 --parent bd-cf --label admin
# Returns: bd-cf.9

bd create "Add drag-and-drop ordering" -p 1 --parent bd-cf --label admin
# Returns: bd-cf.10

bd create "Add admin CSS/JS for custom fields" -p 1 --parent bd-cf --label admin
# Returns: bd-cf.11

# Frontend integration
bd create "Update form renderer to include custom fields" -p 1 --parent bd-cf --label frontend
# Returns: bd-cf.12

bd create "Update AJAX handler to process custom fields" -p 1 --parent bd-cf --label frontend
# Returns: bd-cf.13

bd create "Update email handler to include custom fields" -p 1 --parent bd-cf --label frontend
# Returns: bd-cf.14

bd create "Update admin submissions view" -p 1 --parent bd-cf --label admin
# Returns: bd-cf.15

# Security
bd create "Add nonce verification for custom field CRUD" -p 1 --parent bd-cf --label security
# Returns: bd-cf.16

bd create "Add capability checks for custom field management" -p 1 --parent bd-cf --label security
# Returns: bd-cf.17

bd create "Add sanitization for custom field data" -p 1 --parent bd-cf --label security
# Returns: bd-cf.18

# Testing
bd create "Write unit tests for custom fields" -p 1 --parent bd-cf --label testing
# Returns: bd-cf.19

bd create "Manual testing of custom fields feature" -p 2 --parent bd-cf --label testing
# Returns: bd-cf.20

# Documentation
bd create "Update plugin documentation" -p 2 --parent bd-cf --label documentation
# Returns: bd-cf.21
```

### Step 4: Add Task Dependencies

```bash
# Migration depends on schema changes
bd dep add bd-cf.3 bd-cf.1
bd dep add bd-cf.3 bd-cf.2

# Model depends on database
bd dep add bd-cf.4 bd-cf.3

# Renderer and Validator depend on Model
bd dep add bd-cf.5 bd-cf.4
bd dep add bd-cf.6 bd-cf.4

# Admin UI depends on Model
bd dep add bd-cf.7 bd-cf.4
bd dep add bd-cf.8 bd-cf.7
bd dep add bd-cf.9 bd-cf.7
bd dep add bd-cf.10 bd-cf.9
bd dep add bd-cf.11 bd-cf.10

# Frontend depends on Renderer and Validator
bd dep add bd-cf.12 bd-cf.5
bd dep add bd-cf.13 bd-cf.6
bd dep add bd-cf.14 bd-cf.13
bd dep add bd-cf.15 bd-cf.4

# Security depends on implementation
bd dep add bd-cf.16 bd-cf.8
bd dep add bd-cf.17 bd-cf.8
bd dep add bd-cf.18 bd-cf.13

# Testing depends on everything
bd dep add bd-cf.19 bd-cf.18
bd dep add bd-cf.20 bd-cf.19

# Documentation depends on testing
bd dep add bd-cf.21 bd-cf.20
```

### Step 5: Implementation

#### Task bd-cf.1: Create custom_fields Table Schema

```bash
bd update bd-cf.1 --status in_progress
```

**File**: `includes/class-custom-field.php` (add table creation method)

```php
<?php
class Simple_Contact_Custom_Field {
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_custom_fields';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            field_key varchar(100) NOT NULL,
            field_label varchar(255) NOT NULL,
            field_type varchar(50) NOT NULL,
            field_options text,
            is_required tinyint(1) DEFAULT 0,
            field_order int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY field_key (field_key),
            KEY field_order (field_order)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}
```

```bash
bd comment bd-cf.1 "Created custom_fields table with unique field_key and ordering"
bd close bd-cf.1
```

#### Task bd-cf.2: Add custom_fields_data Column

```bash
bd update bd-cf.2 --status in_progress
```

**File**: `includes/class-contact-message.php` (add migration method)

```php
<?php
class Simple_Contact_Message {
    // ... existing code ...

    public static function add_custom_fields_column() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_messages';

        // Check if column exists
        $column = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = %s
                AND TABLE_NAME = %s
                AND COLUMN_NAME = %s",
                DB_NAME,
                $table_name,
                'custom_fields_data'
            )
        );

        if (empty($column)) {
            $wpdb->query(
                "ALTER TABLE $table_name
                ADD COLUMN custom_fields_data longtext AFTER message"
            );
        }
    }
}
```

```bash
bd comment bd-cf.2 "Added custom_fields_data JSON column to messages table"
bd close bd-cf.2
```

#### Task bd-cf.3: Create Migration Script

```bash
bd ready  # Shows bd-cf.3 is ready
bd update bd-cf.3 --status in_progress
```

**File**: `simple-contact-form.php` (update activation hook)

```php
<?php
// Update activation hook
register_activation_hook(__FILE__, 'simple_contact_form_activate');
function simple_contact_form_activate() {
    require_once SIMPLE_CONTACT_FORM_PATH . 'includes/class-contact-message.php';
    require_once SIMPLE_CONTACT_FORM_PATH . 'includes/class-custom-field.php';

    // Create/update tables
    Simple_Contact_Message::create_table();
    Simple_Contact_Message::add_custom_fields_column();
    Simple_Contact_Custom_Field::create_table();

    // Set version for future migrations
    update_option('simple_contact_form_db_version', '1.1.0');
}

// Check for updates on plugins_loaded
add_action('plugins_loaded', 'simple_contact_form_check_version');
function simple_contact_form_check_version() {
    $current_version = get_option('simple_contact_form_db_version', '1.0.0');

    if (version_compare($current_version, '1.1.0', '<')) {
        simple_contact_form_activate();
    }
}
```

```bash
bd comment bd-cf.3 "Created migration script with version checking for automatic updates"
bd close bd-cf.3
```

#### Task bd-cf.4: Create CustomField Model Class

```bash
bd ready  # Shows bd-cf.4 is ready
bd update bd-cf.4 --status in_progress
```

**File**: `includes/class-custom-field.php` (add CRUD methods)

```php
<?php
class Simple_Contact_Custom_Field {
    // ... table creation method from bd-cf.1 ...

    /**
     * Get all custom fields ordered by field_order
     */
    public static function get_all() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_custom_fields';

        return $wpdb->get_results(
            "SELECT * FROM $table_name ORDER BY field_order ASC",
            ARRAY_A
        );
    }

    /**
     * Get custom field by ID
     */
    public static function get_by_id($id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_custom_fields';

        return $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id),
            ARRAY_A
        );
    }

    /**
     * Create custom field
     */
    public static function create($data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_custom_fields';

        $wpdb->insert(
            $table_name,
            array(
                'field_key' => sanitize_key($data['field_key']),
                'field_label' => sanitize_text_field($data['field_label']),
                'field_type' => sanitize_text_field($data['field_type']),
                'field_options' => isset($data['field_options']) ? wp_json_encode($data['field_options']) : null,
                'is_required' => isset($data['is_required']) ? (int) $data['is_required'] : 0,
                'field_order' => isset($data['field_order']) ? (int) $data['field_order'] : 0
            ),
            array('%s', '%s', '%s', '%s', '%d', '%d')
        );

        return $wpdb->insert_id;
    }

    /**
     * Update custom field
     */
    public static function update($id, $data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_custom_fields';

        $update_data = array();
        $formats = array();

        if (isset($data['field_label'])) {
            $update_data['field_label'] = sanitize_text_field($data['field_label']);
            $formats[] = '%s';
        }
        if (isset($data['field_type'])) {
            $update_data['field_type'] = sanitize_text_field($data['field_type']);
            $formats[] = '%s';
        }
        if (isset($data['field_options'])) {
            $update_data['field_options'] = wp_json_encode($data['field_options']);
            $formats[] = '%s';
        }
        if (isset($data['is_required'])) {
            $update_data['is_required'] = (int) $data['is_required'];
            $formats[] = '%d';
        }
        if (isset($data['field_order'])) {
            $update_data['field_order'] = (int) $data['field_order'];
            $formats[] = '%d';
        }

        return $wpdb->update(
            $table_name,
            $update_data,
            array('id' => $id),
            $formats,
            array('%d')
        );
    }

    /**
     * Delete custom field
     */
    public static function delete($id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'simple_contact_custom_fields';

        return $wpdb->delete(
            $table_name,
            array('id' => $id),
            array('%d')
        );
    }
}
```

```bash
bd comment bd-cf.4 "Created CustomField model with full CRUD operations and sanitization"
bd close bd-cf.4
```

## Step 6: Continue Implementation

Following the dependency chain, implement remaining tasks:

- **bd-cf.5**: FieldRenderer class to render different field types
- **bd-cf.6**: FieldValidator class to validate custom field inputs
- **bd-cf.7-11**: Admin interface for managing custom fields
- **bd-cf.12-15**: Frontend integration
- **bd-cf.16-18**: Security hardening
- **bd-cf.19-20**: Testing
- **bd-cf.21**: Documentation

## Step 7: Testing and Completion

```bash
# Run unit tests
./vendor/bin/phpunit

# Manual testing
bd update bd-cf.20 --status in_progress
bd comment bd-cf.20 "Manual testing completed:
- ✓ Can create custom fields in admin
- ✓ Can edit and delete custom fields
- ✓ Drag-and-drop ordering works
- ✓ Custom fields render in frontend form
- ✓ Custom field data saves with submissions
- ✓ Custom field data displays in admin submissions view
- ✓ Email notifications include custom field data
- ✓ Validation works for required custom fields
- ✓ All field types render correctly (text, select, checkbox, etc.)
- ✓ Security: nonces verified, capabilities checked, inputs sanitized"
bd close bd-cf.20

# Update documentation
bd update bd-cf.21 --status in_progress
bd comment bd-cf.21 "Updated readme.txt with custom fields feature, added screenshots"
bd close bd-cf.21

# Close epic
bd close bd-cf
```

## Step 8: Archive OpenSpec Change

```bash
# Apply delta to source spec
# Merge ADDED and MODIFIED sections into openspec/specs/plugin-features/contact-form.md

# Move to archive
mv openspec/changes/custom-fields openspec/archive/custom-fields
```

## AI Agent Workflow

### Initial Prompt

```
Add a "Custom Fields" feature to the Simple Contact Form plugin.

Requirements:
- Allow admins to create custom form fields
- Support field types: text, textarea, select, checkbox, radio, email, phone, URL
- Store custom field definitions in database
- Store custom field data with each submission (JSON format)
- Admin interface for managing custom fields (add, edit, delete, reorder)
- Display custom fields in frontend form
- Include custom field data in email notifications
- Display custom field data in admin submissions view

Security:
- Nonce verification for custom field CRUD operations
- Capability checks (manage_options)
- Sanitize all inputs
- Validate custom field data on submission

Follow the existing plugin architecture and WordPress best practices.
```

### Implementation Approach

1. **Create OpenSpec change proposal** with motivation and impact analysis
2. **Create spec delta** with ADDED/MODIFIED requirements
3. **Break down into Beads tasks** with clear dependencies
4. **Implement database changes first** (foundation)
5. **Build core classes** (model, renderer, validator)
6. **Add admin interface** for management
7. **Integrate with frontend** form and submission handler
8. **Harden security** with nonces, capabilities, sanitization
9. **Test thoroughly** with unit and manual tests
10. **Update documentation** and archive change

## Key Takeaways

- **Use OpenSpec deltas** to document changes to existing specs
- **Database migrations** should be version-checked and automatic
- **Backward compatibility** is critical for existing users
- **Security** must be applied to all new CRUD operations
- **Testing** should cover both new and existing functionality
- **Documentation** should explain new features clearly
- **Beads dependencies** ensure correct implementation order

