# Gutenberg Block Plugin Example

## Overview

This example demonstrates a complete **Gutenberg Block Plugin** with block.json, edit.js, save.js, PHP registration, styles, and build process using modern WordPress block development practices.

**Complexity**: Medium-High  
**File Count**: 10-15 files  
**Team Size**: 1-3 developers  
**Use Case**: Custom Gutenberg blocks, content components, interactive elements

---

## Complete Plugin: "Testimonial Block"

A comprehensive Gutenberg block plugin demonstrating modern block development with block.json, React components, InspectorControls, RichText, MediaUpload, and proper build process.

---

## Directory Structure

```
testimonial-block/
├── testimonial-block.php              # Main plugin file
├── package.json                       # NPM dependencies
├── webpack.config.js                  # Webpack configuration
├── .babelrc                           # Babel configuration
├── readme.txt                         # WordPress.org readme
├── src/
│   ├── block.json                     # Block metadata
│   ├── index.js                       # Block registration
│   ├── edit.js                        # Edit component
│   ├── save.js                        # Save component
│   ├── editor.scss                    # Editor styles
│   └── style.scss                     # Frontend styles
├── build/                             # Compiled files (generated)
│   ├── index.js
│   ├── index.asset.php
│   ├── editor.css
│   └── style.css
└── languages/                         # Translation files
```

---

## Main Plugin File

### File: `testimonial-block.php`

```php
<?php
/**
 * Plugin Name: Testimonial Block
 * Plugin URI: https://example.com/testimonial-block
 * Description: Custom Gutenberg block for displaying testimonials
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: testimonial-block
 * Domain Path: /languages
 *
 * @package Testimonial_Block
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('TESTIMONIAL_BLOCK_VERSION', '1.0.0');
define('TESTIMONIAL_BLOCK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('TESTIMONIAL_BLOCK_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Register the block
 */
function testimonial_block_register() {
    // Register the block
    register_block_type(TESTIMONIAL_BLOCK_PLUGIN_DIR . 'build');
}
add_action('init', 'testimonial_block_register');

/**
 * Load plugin text domain
 */
function testimonial_block_load_textdomain() {
    load_plugin_textdomain(
        'testimonial-block',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
}
add_action('init', 'testimonial_block_load_textdomain');

/**
 * Add block category (optional)
 */
function testimonial_block_add_category($categories) {
    return array_merge(
        $categories,
        array(
            array(
                'slug'  => 'testimonials',
                'title' => __('Testimonials', 'testimonial-block'),
                'icon'  => 'star-filled',
            ),
        )
    );
}
add_filter('block_categories_all', 'testimonial_block_add_category');
```

---

## Block Configuration

### File: `src/block.json`

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "testimonial-block/testimonial",
  "version": "1.0.0",
  "title": "Testimonial",
  "category": "testimonials",
  "icon": "format-quote",
  "description": "Display a testimonial with author information and photo.",
  "keywords": ["testimonial", "review", "quote"],
  "textdomain": "testimonial-block",
  "attributes": {
    "content": {
      "type": "string",
      "source": "html",
      "selector": ".testimonial-content"
    },
    "authorName": {
      "type": "string",
      "source": "html",
      "selector": ".testimonial-author-name"
    },
    "authorTitle": {
      "type": "string",
      "source": "html",
      "selector": ".testimonial-author-title"
    },
    "authorImage": {
      "type": "object",
      "default": {
        "url": "",
        "alt": "",
        "id": null
      }
    },
    "rating": {
      "type": "number",
      "default": 5
    },
    "alignment": {
      "type": "string",
      "default": "left"
    },
    "backgroundColor": {
      "type": "string",
      "default": "#f9f9f9"
    },
    "textColor": {
      "type": "string",
      "default": "#333333"
    }
  },
  "supports": {
    "html": false,
    "align": ["wide", "full"],
    "spacing": {
      "margin": true,
      "padding": true
    }
  },
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "style": "file:./style.css"
}
```

---

## Block Registration

### File: `src/index.js`

```javascript
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './editor.scss';
import './style.scss';

/**
 * Register the block
 */
registerBlockType(metadata.name, {
    edit: Edit,
    save,
});
```

---

## Edit Component

### File: `src/edit.js`

```javascript
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    RichText,
    MediaUpload,
    MediaUploadCheck,
    BlockControls,
    AlignmentToolbar,
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    Button,
    ColorPicker,
} from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Edit component
 */
export default function Edit({ attributes, setAttributes }) {
    const {
        content,
        authorName,
        authorTitle,
        authorImage,
        rating,
        alignment,
        backgroundColor,
        textColor,
    } = attributes;

    const blockProps = useBlockProps({
        className: `testimonial-block align-${alignment}`,
        style: {
            backgroundColor,
            color: textColor,
        },
    });

    const onSelectImage = (media) => {
        setAttributes({
            authorImage: {
                url: media.url,
                alt: media.alt,
                id: media.id,
            },
        });
    };

    const removeImage = () => {
        setAttributes({
            authorImage: {
                url: '',
                alt: '',
                id: null,
            },
        });
    };

    const renderStars = (count) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star ${i < count ? 'filled' : ''}`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <Fragment>
            <BlockControls>
                <AlignmentToolbar
                    value={alignment}
                    onChange={(newAlignment) =>
                        setAttributes({ alignment: newAlignment })
                    }
                />
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Testimonial Settings', 'testimonial-block')}>
                    <RangeControl
                        label={__('Rating', 'testimonial-block')}
                        value={rating}
                        onChange={(value) => setAttributes({ rating: value })}
                        min={1}
                        max={5}
                        step={1}
                    />
                </PanelBody>

                <PanelBody title={__('Color Settings', 'testimonial-block')}>
                    <p>{__('Background Color', 'testimonial-block')}</p>
                    <ColorPicker
                        color={backgroundColor}
                        onChangeComplete={(value) =>
                            setAttributes({ backgroundColor: value.hex })
                        }
                    />

                    <p style={{ marginTop: '20px' }}>
                        {__('Text Color', 'testimonial-block')}
                    </p>
                    <ColorPicker
                        color={textColor}
                        onChangeComplete={(value) =>
                            setAttributes({ textColor: value.hex })
                        }
                    />
                </PanelBody>

                <PanelBody title={__('Author Image', 'testimonial-block')}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={onSelectImage}
                            allowedTypes={['image']}
                            value={authorImage.id}
                            render={({ open }) => (
                                <div>
                                    {authorImage.url ? (
                                        <div>
                                            <img
                                                src={authorImage.url}
                                                alt={authorImage.alt}
                                                style={{
                                                    width: '100%',
                                                    marginBottom: '10px',
                                                }}
                                            />
                                            <Button
                                                onClick={removeImage}
                                                isDestructive
                                            >
                                                {__('Remove Image', 'testimonial-block')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button onClick={open} isPrimary>
                                            {__('Select Image', 'testimonial-block')}
                                        </Button>
                                    )}
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className="testimonial-content-wrapper">
                    <div className="testimonial-quote-icon">❝</div>
                    <RichText
                        tagName="p"
                        className="testimonial-content"
                        value={content}
                        onChange={(value) => setAttributes({ content: value })}
                        placeholder={__(
                            'Enter testimonial content...',
                            'testimonial-block'
                        )}
                    />
                </div>

                <div className="testimonial-rating">{renderStars(rating)}</div>

                <div className="testimonial-author">
                    {authorImage.url && (
                        <img
                            src={authorImage.url}
                            alt={authorImage.alt}
                            className="testimonial-author-image"
                        />
                    )}
                    <div className="testimonial-author-info">
                        <RichText
                            tagName="p"
                            className="testimonial-author-name"
                            value={authorName}
                            onChange={(value) =>
                                setAttributes({ authorName: value })
                            }
                            placeholder={__('Author Name', 'testimonial-block')}
                        />
                        <RichText
                            tagName="p"
                            className="testimonial-author-title"
                            value={authorTitle}
                            onChange={(value) =>
                                setAttributes({ authorTitle: value })
                            }
                            placeholder={__('Author Title', 'testimonial-block')}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
```

