# Internationalization (i18n)

## Overview

This guide covers WordPress plugin internationalization (i18n) and localization (l10n) including text domains, translation functions, pluralization, context, and translation file generation.

---

## Text Domain

### Defining Text Domain

The text domain must match your plugin slug and be consistent throughout.

```php
<?php
/**
 * Plugin Name: My Plugin
 * Text Domain: my-plugin
 * Domain Path: /languages
 */

// Load text domain
function my_plugin_load_textdomain() {
    load_plugin_textdomain(
        'my-plugin',
        false,
        dirname( plugin_basename( __FILE__ ) ) . '/languages'
    );
}
add_action( 'plugins_loaded', 'my_plugin_load_textdomain' );
```

### Text Domain Rules

✅ **DO**:
- Use lowercase with hyphens: `my-plugin`
- Match plugin slug exactly
- Use consistently throughout plugin
- Define in plugin header

❌ **DON'T**:
- Use underscores: `my_plugin`
- Use variables for text domain
- Mix multiple text domains
- Omit text domain parameter

---

## Translation Functions

### Basic Translation

```php
<?php
// Translate and return
$text = __( 'Hello World', 'my-plugin' );

// Translate and echo
_e( 'Hello World', 'my-plugin' );

// Translate with escaping (recommended)
echo esc_html__( 'Hello World', 'my-plugin' );
esc_html_e( 'Hello World', 'my-plugin' );

// Attribute escaping
echo '<input placeholder="' . esc_attr__( 'Enter name', 'my-plugin' ) . '" />';
esc_attr_e( 'Enter name', 'my-plugin' );
```

### Variables in Translations

```php
<?php
// ✅ CORRECT: Use sprintf
echo sprintf(
    /* translators: %s: user name */
    __( 'Hello %s', 'my-plugin' ),
    $user_name
);

// ✅ CORRECT: Multiple variables
echo sprintf(
    /* translators: 1: post count, 2: category name */
    __( 'Found %1$d posts in %2$s', 'my-plugin' ),
    $count,
    $category
);

// ❌ WRONG: Concatenation breaks translation
echo __( 'Hello', 'my-plugin' ) . ' ' . $user_name;
```

### Plural Forms

```php
<?php
// Basic plural
echo sprintf(
    _n(
        'One item',
        '%d items',
        $count,
        'my-plugin'
    ),
    number_format_i18n( $count )
);

// With context
echo sprintf(
    _n(
        'One comment',
        '%d comments',
        $comment_count,
        'my-plugin'
    ),
    number_format_i18n( $comment_count )
);
```

### Context

Use context when the same English word has different meanings:

```php
<?php
// Noun vs Verb
_x( 'Post', 'noun', 'my-plugin' );
_x( 'Post', 'verb', 'my-plugin' );

// Different contexts
_x( 'Read', 'past tense', 'my-plugin' );
_x( 'Read', 'imperative', 'my-plugin' );

// With escaping
echo esc_html_x( 'Draft', 'post status', 'my-plugin' );
```

---

## JavaScript Translations

### wp_set_script_translations()

```php
<?php
function my_plugin_enqueue_scripts() {
    wp_enqueue_script(
        'my-plugin-script',
        plugins_url( 'js/script.js', __FILE__ ),
        array( 'wp-i18n' ),
        '1.0.0',
        true
    );
    
    // Set translations for script
    wp_set_script_translations(
        'my-plugin-script',
        'my-plugin',
        plugin_dir_path( __FILE__ ) . 'languages'
    );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_scripts' );
```

### JavaScript Translation Functions

```javascript
// Import i18n
import { __, _x, _n, sprintf } from '@wordpress/i18n';

// Basic translation
const message = __( 'Hello World', 'my-plugin' );

// With context
const label = _x( 'Post', 'noun', 'my-plugin' );

// Plural
const count = 5;
const text = sprintf(
    _n( 'One item', '%d items', count, 'my-plugin' ),
    count
);

// With variables
const greeting = sprintf(
    __( 'Hello %s', 'my-plugin' ),
    userName
);
```

---

## Translation File Generation

### Using WP-CLI

```bash
# Generate POT file
wp i18n make-pot . languages/my-plugin.pot

# Generate JSON for JavaScript
wp i18n make-json languages --no-purge

# Update PO files
wp i18n update-po languages/my-plugin.pot languages/
```

### Manual POT Generation

Use tools like Poedit or GlotPress to extract translatable strings.

---

## Translation File Structure

### Directory Structure

```
my-plugin/
├── languages/
│   ├── my-plugin.pot          # Template file
│   ├── my-plugin-es_ES.po     # Spanish translation
│   ├── my-plugin-es_ES.mo     # Spanish compiled
│   ├── my-plugin-fr_FR.po     # French translation
│   ├── my-plugin-fr_FR.mo     # French compiled
│   └── my-plugin-en_US-*.json # JavaScript translations
```

### POT File Format

```
# Copyright (C) 2024 My Plugin
# This file is distributed under the GPL-2.0+.
msgid ""
msgstr ""
"Project-Id-Version: My Plugin 1.0.0\n"
"Report-Msgid-Bugs-To: https://wordpress.org/support/plugin/my-plugin\n"
"POT-Creation-Date: 2024-01-01 00:00:00+00:00\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"

#: includes/class-admin.php:45
msgid "Settings"
msgstr ""

#: includes/class-admin.php:67
#. translators: %s: user name
msgid "Hello %s"
msgstr ""
```

---

## Best Practices

### String Guidelines

✅ **DO**:
- Use complete sentences
- Provide translator comments for variables
- Use context for ambiguous strings
- Keep strings simple and clear
- Use proper grammar and punctuation

❌ **DON'T**:
- Concatenate translatable strings
- Use variables in text domain
- Split sentences across multiple strings
- Use HTML in translatable strings (when possible)
- Hard-code text without translation functions

### Translator Comments

```php
<?php
/* translators: %s: user name */
__( 'Welcome back, %s!', 'my-plugin' );

/* translators: 1: number of posts, 2: category name */
__( 'Found %1$d posts in %2$s', 'my-plugin' );

/* translators: This appears in the admin settings page */
__( 'Enable feature', 'my-plugin' );
```

### HTML in Translations

```php
<?php
// ✅ CORRECT: Keep HTML outside when possible
echo '<strong>' . esc_html__( 'Important', 'my-plugin' ) . '</strong>';

// ✅ ACCEPTABLE: When HTML is necessary for meaning
echo wp_kses_post( __( 'Click <a href="#">here</a> to continue', 'my-plugin' ) );

// ❌ WRONG: Unnecessary HTML in string
__( '<div class="notice">Notice text</div>', 'my-plugin' );
```

### Date and Number Formatting

```php
<?php
// Format dates for localization
echo date_i18n( get_option( 'date_format' ), $timestamp );

// Format numbers
echo number_format_i18n( $number );

// Format currency (use appropriate plugin/library)
echo wc_price( $amount ); // WooCommerce example
```

---

## Testing Translations

### Test with Different Locales

```php
<?php
// Temporarily switch locale for testing
function my_plugin_test_translation() {
    switch_to_locale( 'es_ES' );

    $text = __( 'Hello World', 'my-plugin' );
    echo $text; // Should output Spanish translation

    restore_current_locale();
}
```

### Validation Checklist

- [ ] All user-facing strings use translation functions
- [ ] Text domain is consistent throughout
- [ ] Translator comments provided for variables
- [ ] Plural forms implemented correctly
- [ ] Context used for ambiguous strings
- [ ] JavaScript translations configured
- [ ] POT file generated and up-to-date
- [ ] No concatenated translatable strings
- [ ] HTML kept outside translations when possible

---

## Common Mistakes

### Variable Text Domain

```php
<?php
// ❌ WRONG: Variable text domain
$text_domain = 'my-plugin';
__( 'Hello', $text_domain );

// ✅ CORRECT: Literal text domain
__( 'Hello', 'my-plugin' );
```

### String Concatenation

```php
<?php
// ❌ WRONG: Concatenation
echo __( 'You have', 'my-plugin' ) . ' ' . $count . ' ' . __( 'items', 'my-plugin' );

// ✅ CORRECT: Single string with placeholder
echo sprintf( __( 'You have %d items', 'my-plugin' ), $count );
```

### Missing Context

```php
<?php
// ❌ WRONG: Ambiguous without context
__( 'Post', 'my-plugin' ); // Noun or verb?

// ✅ CORRECT: Clear with context
_x( 'Post', 'noun', 'my-plugin' );
_x( 'Post', 'verb', 'my-plugin' );
```

---

## WordPress.org Translation

### Automatic Translation

WordPress.org provides automatic translation infrastructure:

1. Upload plugin to WordPress.org
2. Translators contribute via translate.wordpress.org
3. Language packs automatically distributed
4. Users receive translations via WordPress updates

### Requirements

- POT file in `languages/` directory
- Proper text domain in plugin header
- All strings properly internationalized
- Text domain matches plugin slug

---

## Resources

- [WordPress I18n Documentation](https://developer.wordpress.org/plugins/internationalization/)
- [WP-CLI i18n Commands](https://developer.wordpress.org/cli/commands/i18n/)
- [GlotPress](https://wordpress.org/plugins/glotpress/)
- [Poedit](https://poedit.net/)
- [translate.wordpress.org](https://translate.wordpress.org/)


