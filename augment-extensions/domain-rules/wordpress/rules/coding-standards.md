# WordPress Coding Standards (WPCS)

## Overview

This document defines WordPress coding standards for PHP, JavaScript, CSS, and HTML. Following these standards ensures code consistency, readability, and compatibility.

## PHP Coding Standards

### File Structure

```php
<?php
/**
 * File description
 *
 * @package    My_Plugin
 * @subpackage My_Plugin/includes
 * @author     Your Name <email@example.com>
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Code here
```

### Naming Conventions

#### Functions

```php
// ✅ CORRECT: Lowercase with underscores
function my_plugin_get_data() {
    // Function code
}

// ❌ WRONG: CamelCase
function myPluginGetData() {
    // Function code
}
```

#### Classes

```php
// ✅ CORRECT: Capitalized words separated by underscores
class My_Plugin_Admin {
    // Class code
}

// ❌ WRONG: CamelCase without underscores
class MyPluginAdmin {
    // Class code
}
```

#### Variables

```php
// ✅ CORRECT: Lowercase with underscores
$user_name = 'John';
$post_count = 10;

// ❌ WRONG: CamelCase
$userName = 'John';
$postCount = 10;
```

#### Constants

```php
// ✅ CORRECT: Uppercase with underscores
define( 'MY_PLUGIN_VERSION', '1.0.0' );
const MY_CONSTANT = 'value';

// ❌ WRONG: Lowercase or mixed case
define( 'my_plugin_version', '1.0.0' );
```

### Indentation and Spacing

#### Indentation

```php
// Use tabs for indentation, not spaces
function my_function() {
	if ( $condition ) {
		// Code here (one tab)
		foreach ( $items as $item ) {
			// Code here (two tabs)
		}
	}
}
```

#### Spacing

```php
// ✅ CORRECT: Space after control structures, before opening brace
if ( $condition ) {
	// Code
}

foreach ( $items as $item ) {
	// Code
}

// ✅ CORRECT: Space around operators
$sum = $a + $b;
$result = $value * 2;

// ✅ CORRECT: Space after commas
function_name( $arg1, $arg2, $arg3 );

// ❌ WRONG: No spaces
if($condition){
	// Code
}
$sum=$a+$b;
```

### Braces

```php
// ✅ CORRECT: Opening brace on same line
if ( $condition ) {
	// Code
}

function my_function() {
	// Code
}

// ❌ WRONG: Opening brace on new line
if ( $condition )
{
	// Code
}
```

### Control Structures

#### If/Else

```php
// ✅ CORRECT
if ( $condition ) {
	// Code
} elseif ( $other_condition ) {
	// Code
} else {
	// Code
}

// ✅ CORRECT: Alternative syntax for templates
<?php if ( $condition ) : ?>
	<p>Content</p>
<?php else : ?>
	<p>Other content</p>
<?php endif; ?>
```

#### Loops

```php
// ✅ CORRECT: foreach
foreach ( $items as $item ) {
	echo esc_html( $item );
}

// ✅ CORRECT: for
for ( $i = 0; $i < $count; $i++ ) {
	// Code
}

// ✅ CORRECT: while
while ( $condition ) {
	// Code
}
```

#### Switch

```php
// ✅ CORRECT
switch ( $value ) {
	case 'option1':
		// Code
		break;
	
	case 'option2':
		// Code
		break;
	
	default:
		// Code
		break;
}
```

### Arrays

```php
// ✅ CORRECT: Short array syntax (PHP 5.4+)
$array = array(
	'key1' => 'value1',
	'key2' => 'value2',
	'key3' => 'value3',
);

// ✅ CORRECT: Trailing comma
$items = array(
	'item1',
	'item2',
	'item3', // Trailing comma
);

// ✅ CORRECT: Associative array alignment
$config = array(
	'name'        => 'My Plugin',
	'version'     => '1.0.0',
	'description' => 'Plugin description',
);
```

### Function Calls

```php
// ✅ CORRECT: Space after function name, before parenthesis
function_name( $arg1, $arg2 );

// ✅ CORRECT: Multi-line function calls
wp_insert_post(
	array(
		'post_title'   => $title,
		'post_content' => $content,
		'post_status'  => 'publish',
		'post_type'    => 'post',
	)
);

// ❌ WRONG: No space
function_name($arg1,$arg2);
```

### String Concatenation

```php
// ✅ CORRECT: Spaces around concatenation operator
$message = 'Hello ' . $name . '!';
$url = home_url() . '/page';

// ✅ CORRECT: Use sprintf for complex strings
$message = sprintf( __( 'Hello %s, you have %d messages', 'my-plugin' ), $name, $count );
```

### Yoda Conditions

```php
// ✅ CORRECT: Yoda conditions (constant/literal first)
if ( 'value' === $variable ) {
	// Code
}

if ( 10 < $count ) {
	// Code
}

// ❌ WRONG: Variable first
if ( $variable === 'value' ) {
	// Code
}
```

### Comments

#### Single-line Comments

```php
// This is a single-line comment
$value = 10; // Inline comment
```

#### Multi-line Comments

```php
/**
 * This is a multi-line comment
 * that spans multiple lines.
 */
```

#### DocBlocks

```php
/**
 * Function description
 *
 * Longer description if needed.
 *
 * @since 1.0.0
 *
 * @param string $param1 Description of param1.
 * @param int    $param2 Description of param2.
 * @return bool True on success, false on failure.
 */
function my_function( $param1, $param2 ) {
	// Function code
	return true;
}

/**
 * Class description
 *
 * @since 1.0.0
 */
class My_Class {
	
	/**
	 * Property description
	 *
	 * @var string
	 */
	private $property;
	
	/**
	 * Method description
	 *
	 * @since 1.0.0
	 *
	 * @param string $param Parameter description.
	 * @return void
	 */
	public function method( $param ) {
		// Method code
	}
}
```

### Database Queries

```php
// ✅ CORRECT: Use $wpdb->prepare()
global $wpdb;

$results = $wpdb->get_results(
	$wpdb->prepare(
		"SELECT * FROM {$wpdb->prefix}my_table WHERE user_id = %d AND status = %s",
		$user_id,
		$status
	)
);

// ✅ CORRECT: Use WordPress functions when possible
$posts = get_posts(
	array(
		'post_type'      => 'post',
		'posts_per_page' => 10,
	)
);
```

### Translation

```php
// ✅ CORRECT: Use translation functions
__( 'Text to translate', 'my-plugin' );
_e( 'Text to translate', 'my-plugin' );
esc_html__( 'Text to translate', 'my-plugin' );
esc_html_e( 'Text to translate', 'my-plugin' );

// ✅ CORRECT: Plural forms
_n( 'One item', '%d items', $count, 'my-plugin' );

// ✅ CORRECT: Context
_x( 'Post', 'noun', 'my-plugin' );
_x( 'Post', 'verb', 'my-plugin' );

// ✅ CORRECT: Variables in translations
sprintf( __( 'Hello %s', 'my-plugin' ), $name );
```

## JavaScript Coding Standards

### Naming Conventions

```javascript
// ✅ CORRECT: camelCase for variables and functions
const userName = 'John';
function getUserData() {
    // Code
}

// ✅ CORRECT: PascalCase for classes
class MyClass {
    constructor() {
        // Code
    }
}

// ✅ CORRECT: UPPERCASE for constants
const API_URL = 'https://api.example.com';
```

### Indentation and Spacing

```javascript
// Use tabs for indentation
if ( condition ) {
	// Code (one tab)
	if ( otherCondition ) {
		// Code (two tabs)
	}
}

// Spaces around operators
const sum = a + b;
const result = value * 2;

// Space after keywords
if ( condition ) {
	// Code
}

for ( let i = 0; i < count; i++ ) {
	// Code
}
```

### jQuery

```javascript
// ✅ CORRECT: Use $ within closure
( function( $ ) {
	'use strict';
	
	$( document ).ready( function() {
		$( '.my-element' ).on( 'click', function() {
			// Code
		} );
	} );
	
} )( jQuery );

// ✅ CORRECT: Cache jQuery selectors
const $element = $( '.my-element' );
$element.addClass( 'active' );
```

## CSS Coding Standards

### Formatting

```css
/* ✅ CORRECT: Properties on separate lines */
.my-class {
	display: block;
	margin: 0 auto;
	padding: 10px 20px;
	color: #333;
}

/* ✅ CORRECT: Space after colon */
.my-class {
	color: #333;
}

/* ✅ CORRECT: Lowercase hex colors */
.my-class {
	color: #fff;
	background-color: #000;
}
```

### Naming

```css
/* ✅ CORRECT: Lowercase with hyphens */
.my-plugin-container {
	/* Styles */
}

.my-plugin-button {
	/* Styles */
}

/* ❌ WRONG: CamelCase or underscores */
.myPluginContainer {
	/* Styles */
}

.my_plugin_container {
	/* Styles */
}
```

### Selectors

```css
/* ✅ CORRECT: Specific selectors */
.my-plugin .button {
	/* Styles */
}

/* ✅ CORRECT: Avoid !important */
.my-class {
	color: #333;
}

/* ❌ WRONG: Overly specific */
body div.container ul li a.link {
	/* Styles */
}
```

## HTML Coding Standards

### Formatting

```html
<!-- ✅ CORRECT: Lowercase tags and attributes -->
<div class="my-class" id="my-id">
	<p>Content</p>
</div>

<!-- ✅ CORRECT: Self-closing tags -->
<img src="image.jpg" alt="Description" />
<br />

<!-- ✅ CORRECT: Quoted attributes -->
<input type="text" name="field_name" value="value" />
```

### Semantic HTML

```html
<!-- ✅ CORRECT: Use semantic elements -->
<header>
	<nav>
		<ul>
			<li><a href="#">Link</a></li>
		</ul>
	</nav>
</header>

<main>
	<article>
		<h1>Title</h1>
		<p>Content</p>
	</article>
</main>

<footer>
	<p>&copy; 2024</p>
</footer>
```

## Tools and Validation

### PHP_CodeSniffer

```bash
# Install WordPress Coding Standards
composer require --dev wp-coding-standards/wpcs

# Run PHPCS
phpcs --standard=WordPress path/to/file.php

# Fix automatically
phpcbf --standard=WordPress path/to/file.php
```

### ESLint

```bash
# Install ESLint with WordPress config
npm install --save-dev eslint @wordpress/eslint-plugin

# Run ESLint
npx eslint path/to/file.js
```

### Stylelint

```bash
# Install Stylelint with WordPress config
npm install --save-dev stylelint stylelint-config-wordpress

# Run Stylelint
npx stylelint "**/*.css"
```

## Best Practices

### DO

✅ Follow WordPress coding standards  
✅ Use consistent naming conventions  
✅ Add proper documentation  
✅ Use translation functions  
✅ Validate and sanitize input  
✅ Escape output  
✅ Use WordPress functions when available  
✅ Write readable, maintainable code

### DON'T

❌ Mix coding styles  
❌ Use deprecated functions  
❌ Ignore security best practices  
❌ Skip documentation  
❌ Use global namespace  
❌ Hardcode values  
❌ Write overly complex code

