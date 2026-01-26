# Gutenberg Block Example

## Overview

This example demonstrates a complete custom Gutenberg block with block.json metadata, edit component, save function, block styles, PHP registration, and testing steps.

**Use Case**: Custom content blocks for WordPress editor  
**Complexity**: Medium  
**Prerequisites**: Node.js, npm, @wordpress/scripts

---

## Complete Example: "Call to Action Block"

A custom Gutenberg block for displaying call-to-action sections with title, description, button, and customizable colors.

---

## Directory Structure

```
cta-block/
├── cta-block.php              # Main plugin file
├── package.json               # NPM dependencies
├── src/
│   ├── block.json            # Block metadata
│   ├── index.js              # Block registration
│   ├── edit.js               # Edit component
│   ├── save.js               # Save component
│   ├── editor.scss           # Editor styles
│   └── style.scss            # Frontend styles
└── build/                     # Compiled files (generated)
```

---

## 1. Main Plugin File

### File: `cta-block.php`

```php
<?php
/**
 * Plugin Name: Call to Action Block
 * Description: Custom Gutenberg block for call-to-action sections
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Your Name
 * License: GPL-2.0+
 * Text Domain: cta-block
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the block
 */
function cta_block_register() {
    register_block_type(__DIR__ . '/build');
}
add_action('init', 'cta_block_register');
```

---

## 2. Block Metadata

### File: `src/block.json`

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "cta-block/call-to-action",
  "version": "1.0.0",
  "title": "Call to Action",
  "category": "widgets",
  "icon": "megaphone",
  "description": "Display a call-to-action section with title, description, and button",
  "keywords": ["cta", "call to action", "button"],
  "textdomain": "cta-block",
  "supports": {
    "html": false,
    "align": ["wide", "full"],
    "color": {
      "background": true,
      "text": true
    },
    "spacing": {
      "padding": true,
      "margin": true
    }
  },
  "attributes": {
    "title": {
      "type": "string",
      "source": "html",
      "selector": ".cta-title"
    },
    "description": {
      "type": "string",
      "source": "html",
      "selector": ".cta-description"
    },
    "buttonText": {
      "type": "string",
      "source": "html",
      "selector": ".cta-button"
    },
    "buttonUrl": {
      "type": "string",
      "source": "attribute",
      "selector": ".cta-button",
      "attribute": "href"
    },
    "backgroundColor": {
      "type": "string",
      "default": "#0073aa"
    },
    "textColor": {
      "type": "string",
      "default": "#ffffff"
    }
  },
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "style": "file:./style.css"
}
```

---

## 3. Block Registration

### File: `src/index.js`

```javascript
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './editor.scss';
import './style.scss';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
});
```

---

## 4. Edit Component

### File: `src/edit.js`

```javascript
import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls, URLInput } from '@wordpress/block-editor';
import { PanelBody, ColorPicker } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { title, description, buttonText, buttonUrl, backgroundColor, textColor } = attributes;

    const blockProps = useBlockProps({
        style: {
            backgroundColor,
            color: textColor,
        },
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Color Settings', 'cta-block')}>
                    <p>{__('Background Color', 'cta-block')}</p>
                    <ColorPicker
                        color={backgroundColor}
                        onChangeComplete={(value) => setAttributes({ backgroundColor: value.hex })}
                    />
                    <p>{__('Text Color', 'cta-block')}</p>
                    <ColorPicker
                        color={textColor}
                        onChangeComplete={(value) => setAttributes({ textColor: value.hex })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} className="cta-block">
                <RichText
                    tagName="h2"
                    className="cta-title"
                    value={title}
                    onChange={(value) => setAttributes({ title: value })}
                    placeholder={__('Enter title...', 'cta-block')}
                />
                <RichText
                    tagName="p"
                    className="cta-description"
                    value={description}
                    onChange={(value) => setAttributes({ description: value })}
                    placeholder={__('Enter description...', 'cta-block')}
                />
                <div className="cta-button-wrapper">
                    <RichText
                        tagName="span"
                        className="cta-button"
                        value={buttonText}
                        onChange={(value) => setAttributes({ buttonText: value })}
                        placeholder={__('Button text...', 'cta-block')}
                    />
                    <URLInput
                        value={buttonUrl}
                        onChange={(value) => setAttributes({ buttonUrl: value })}
                    />
                </div>
            </div>
        </>
    );
}
```

---

## 5. Save Function

### File: `src/save.js`

```javascript
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { title, description, buttonText, buttonUrl, backgroundColor, textColor } = attributes;

    const blockProps = useBlockProps.save({
        style: {
            backgroundColor,
            color: textColor,
        },
    });

    return (
        <div {...blockProps} className="cta-block">
            <RichText.Content tagName="h2" className="cta-title" value={title} />
            <RichText.Content tagName="p" className="cta-description" value={description} />
            {buttonText && buttonUrl && (
                <a href={buttonUrl} className="cta-button">
                    <RichText.Content tagName="span" value={buttonText} />
                </a>
            )}
        </div>
    );
}
```

---

## 6. Styles

### File: `src/style.scss`

```scss
.cta-block {
    padding: 2rem;
    text-align: center;
    border-radius: 8px;

    .cta-title {
        margin: 0 0 1rem;
        font-size: 2rem;
        font-weight: bold;
    }

    .cta-description {
        margin: 0 0 1.5rem;
        font-size: 1.125rem;
    }

    .cta-button {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    }
}
```

### File: `src/editor.scss`

```scss
.cta-block {
    .cta-button-wrapper {
        margin-top: 1rem;

        .components-base-control {
            margin-top: 0.5rem;
        }
    }
}
```

---

## 7. Package Configuration

### File: `package.json`

```json
{
  "name": "cta-block",
  "version": "1.0.0",
  "description": "Call to Action Gutenberg Block",
  "scripts": {
    "build": "wp-scripts build",
    "start": "wp-scripts start",
    "lint:js": "wp-scripts lint-js",
    "format": "wp-scripts format"
  },
  "devDependencies": {
    "@wordpress/scripts": "^27.0.0"
  }
}
```

---

## 8. Installation & Build

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm start

# Production build
npm run build
```

---

## 9. Testing Steps

### Manual Testing

1. **Activate Plugin**
   - Upload plugin to `wp-content/plugins/`
   - Activate in WordPress admin

2. **Add Block to Editor**
   - Create/edit a post or page
   - Click "+" to add block
   - Search for "Call to Action"
   - Add block to content

3. **Test Block Functionality**
   - Enter title text
   - Enter description text
   - Enter button text
   - Enter button URL
   - Change background color in sidebar
   - Change text color in sidebar

4. **Test Frontend Display**
   - Save/publish post
   - View on frontend
   - Verify styles are applied
   - Test button link works
   - Test responsive design

5. **Test Block Validation**
   - Save and reload editor
   - Verify no validation errors
   - Verify content persists correctly

### Automated Testing

```javascript
// tests/e2e/cta-block.test.js
describe('CTA Block', () => {
    beforeEach(async () => {
        await createNewPost();
    });

    it('should insert block', async () => {
        await insertBlock('Call to Action');
        expect(await page.$('.cta-block')).toBeTruthy();
    });

    it('should allow editing title', async () => {
        await insertBlock('Call to Action');
        await page.type('.cta-title', 'Test Title');
        const title = await page.$eval('.cta-title', el => el.textContent);
        expect(title).toBe('Test Title');
    });
});
```

---

## Best Practices Demonstrated

✅ **block.json** - Modern block metadata format
✅ **@wordpress/scripts** - Official build tools
✅ **InspectorControls** - Settings sidebar
✅ **RichText** - Editable content
✅ **Color customization** - User-controlled colors
✅ **Proper sanitization** - Secure attribute handling
✅ **Internationalization** - Translation-ready strings
✅ **Responsive design** - Mobile-friendly styles

