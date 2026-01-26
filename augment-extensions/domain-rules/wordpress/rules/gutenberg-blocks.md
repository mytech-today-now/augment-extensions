# Gutenberg Block Development Workflow

## Overview

This document provides step-by-step workflows for developing custom Gutenberg blocks using modern WordPress block development tools.

## Workflow 1: Create New Block with @wordpress/create-block

### Step 1: Initialize Block

```bash
# Navigate to plugins directory
cd wp-content/plugins

# Create new block (interactive)
npx @wordpress/create-block my-custom-block

# Or with options
npx @wordpress/create-block my-custom-block \
  --namespace="my-company" \
  --title="My Custom Block" \
  --category="widgets" \
  --template="@wordpress/create-block/block-template"
```

This creates:
```
my-custom-block/
├── build/                  # Compiled files (gitignored)
├── src/                    # Source files
│   ├── index.js           # Block registration
│   ├── edit.js            # Editor component
│   ├── save.js            # Save function
│   ├── style.scss         # Frontend styles
│   └── editor.scss        # Editor styles
├── block.json             # Block metadata
├── my-custom-block.php    # Main plugin file
├── package.json           # Dependencies
└── readme.txt             # Plugin readme
```

### Step 2: Configure block.json

**block.json**:
```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 2,
  "name": "my-company/my-custom-block",
  "version": "1.0.0",
  "title": "My Custom Block",
  "category": "widgets",
  "icon": "smiley",
  "description": "A custom Gutenberg block",
  "keywords": ["custom", "block"],
  "supports": {
    "html": false,
    "align": true,
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
    "content": {
      "type": "string",
      "source": "html",
      "selector": "p"
    },
    "alignment": {
      "type": "string",
      "default": "left"
    }
  },
  "example": {
    "attributes": {
      "content": "This is example content"
    }
  },
  "textdomain": "my-custom-block",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./index.css",
  "style": "file:./style-index.css"
}
```

### Step 3: Implement Edit Component

**src/edit.js**:
```jsx
import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, AlignmentToolbar, BlockControls } from '@wordpress/block-editor';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { content, alignment } = attributes;
    
    const blockProps = useBlockProps({
        className: `has-text-align-${alignment}`,
    });
    
    return (
        <>
            <BlockControls>
                <AlignmentToolbar
                    value={alignment}
                    onChange={(newAlignment) => setAttributes({ alignment: newAlignment })}
                />
            </BlockControls>
            
            <div {...blockProps}>
                <RichText
                    tagName="p"
                    value={content}
                    onChange={(newContent) => setAttributes({ content: newContent })}
                    placeholder={__('Enter your content...', 'my-custom-block')}
                />
            </div>
        </>
    );
}
```

### Step 4: Implement Save Function

**src/save.js**:
```jsx
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { content, alignment } = attributes;
    
    const blockProps = useBlockProps.save({
        className: `has-text-align-${alignment}`,
    });
    
    return (
        <div {...blockProps}>
            <RichText.Content tagName="p" value={content} />
        </div>
    );
}
```

### Step 5: Register Block

**src/index.js**:
```js
import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
});
```

### Step 6: Build and Test

```bash
# Development mode (watch for changes)
npm start

# Production build
npm run build
```

Activate the plugin in WordPress admin and test the block in the editor.

## Workflow 2: Add Block Controls and Settings

### Inspector Controls (Sidebar)

**src/edit.js**:
```jsx
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, RangeControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { content, showIcon, iconSize } = attributes;
    
    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'my-custom-block')}>
                    <ToggleControl
                        label={__('Show Icon', 'my-custom-block')}
                        checked={showIcon}
                        onChange={(value) => setAttributes({ showIcon: value })}
                    />
                    
                    {showIcon && (
                        <RangeControl
                            label={__('Icon Size', 'my-custom-block')}
                            value={iconSize}
                            onChange={(value) => setAttributes({ iconSize: value })}
                            min={10}
                            max={100}
                        />
                    )}
                    
                    <TextControl
                        label={__('Custom Class', 'my-custom-block')}
                        value={attributes.customClass}
                        onChange={(value) => setAttributes({ customClass: value })}
                    />
                </PanelBody>
            </InspectorControls>
            
            {/* Block content */}
        </>
    );
}
```

### Block Toolbar Controls

```jsx
import { BlockControls, AlignmentToolbar } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';

<BlockControls>
    <AlignmentToolbar
        value={alignment}
        onChange={(newAlignment) => setAttributes({ alignment: newAlignment })}
    />
    
    <ToolbarGroup>
        <ToolbarButton
            icon="admin-links"
            label={__('Add Link', 'my-custom-block')}
            onClick={() => setAttributes({ hasLink: !hasLink })}
            isActive={hasLink}
        />
    </ToolbarGroup>
</BlockControls>
```

## Workflow 3: Dynamic Blocks (Server-Side Rendering)

### Step 1: Configure block.json for Dynamic Block

```json
{
  "apiVersion": 2,
  "name": "my-company/dynamic-block",
  "title": "Dynamic Block",
  "category": "widgets",
  "attributes": {
    "numberOfPosts": {
      "type": "number",
      "default": 5
    }
  },
  "editorScript": "file:./index.js",
  "render": "file:./render.php"
}
```

### Step 2: Create Render Template

**src/render.php**:
```php
<?php
/**
 * Server-side rendering for dynamic block
 *
 * @param array    $attributes Block attributes
 * @param string   $content    Block content
 * @param WP_Block $block      Block instance
 */

$number_of_posts = isset( $attributes['numberOfPosts'] ) ? absint( $attributes['numberOfPosts'] ) : 5;

$args = array(
    'posts_per_page' => $number_of_posts,
    'post_status'    => 'publish',
);

$query = new WP_Query( $args );

if ( ! $query->have_posts() ) {
    return '<p>' . __( 'No posts found.', 'my-custom-block' ) . '</p>';
}

$output = '<div ' . get_block_wrapper_attributes() . '>';
$output .= '<ul class="dynamic-block-list">';

while ( $query->have_posts() ) {
    $query->the_post();
    $output .= '<li>';
    $output .= '<a href="' . esc_url( get_permalink() ) . '">';
    $output .= esc_html( get_the_title() );
    $output .= '</a>';
    $output .= '</li>';
}

$output .= '</ul>';
$output .= '</div>';

wp_reset_postdata();

echo $output;
```

### Step 3: Create Edit Component for Dynamic Block

**src/edit.js**:
```jsx
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
    const { numberOfPosts } = attributes;
    
    const posts = useSelect((select) => {
        return select('core').getEntityRecords('postType', 'post', {
            per_page: numberOfPosts,
        });
    }, [numberOfPosts]);
    
    const blockProps = useBlockProps();
    
    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'my-custom-block')}>
                    <RangeControl
                        label={__('Number of Posts', 'my-custom-block')}
                        value={numberOfPosts}
                        onChange={(value) => setAttributes({ numberOfPosts: value })}
                        min={1}
                        max={10}
                    />
                </PanelBody>
            </InspectorControls>
            
            <div {...blockProps}>
                {!posts && <p>{__('Loading...', 'my-custom-block')}</p>}
                
                {posts && posts.length === 0 && (
                    <p>{__('No posts found.', 'my-custom-block')}</p>
                )}
                
                {posts && posts.length > 0 && (
                    <ul className="dynamic-block-list">
                        {posts.map((post) => (
                            <li key={post.id}>
                                <a href={post.link}>{post.title.rendered}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
```

### Step 4: No Save Function for Dynamic Blocks

**src/save.js**:
```jsx
// Dynamic blocks don't need a save function
export default function save() {
    return null;
}
```

## Workflow 4: Block Variations and Styles

### Block Variations

**src/index.js**:
```js
import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
});

// Register variations
registerBlockVariation('my-company/my-custom-block', {
    name: 'highlighted',
    title: __('Highlighted Block', 'my-custom-block'),
    description: __('A highlighted version of the block', 'my-custom-block'),
    icon: 'star-filled',
    attributes: {
        className: 'is-style-highlighted',
    },
});
```

### Block Styles

**src/index.js**:
```js
import { registerBlockStyle } from '@wordpress/blocks';

registerBlockStyle('my-company/my-custom-block', {
    name: 'rounded',
    label: __('Rounded', 'my-custom-block'),
});

registerBlockStyle('my-company/my-custom-block', {
    name: 'shadow',
    label: __('Shadow', 'my-custom-block'),
});
```

**src/style.scss**:
```scss
.wp-block-my-company-my-custom-block {
    &.is-style-rounded {
        border-radius: 10px;
    }
    
    &.is-style-shadow {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
}
```

## Testing and Production

### Development Workflow

```bash
# Start development server
npm start

# This watches for changes and rebuilds automatically
```

### Production Build

```bash
# Build for production
npm run build

# This creates optimized files in build/ directory
```

### Testing Checklist

✅ Block appears in inserter  
✅ Block can be inserted into editor  
✅ All controls work correctly  
✅ Block saves and loads correctly  
✅ Frontend display matches editor  
✅ Styles load correctly  
✅ Block works in different contexts (posts, pages, widgets)  
✅ Block is accessible (keyboard navigation, screen readers)  
✅ Block works with different themes  
✅ No console errors

## Best Practices

### DO

✅ Use `block.json` for metadata  
✅ Use `@wordpress/scripts` for building  
✅ Follow WordPress coding standards  
✅ Use translation functions  
✅ Provide block examples  
✅ Support common block features (align, color, spacing)  
✅ Test with different themes  
✅ Optimize for performance  
✅ Document block usage  
✅ Version control source files, not build files

### DON'T

❌ Hardcode values that should be configurable  
❌ Use inline styles  
❌ Ignore accessibility  
❌ Skip error handling  
❌ Commit build files to version control  
❌ Use deprecated WordPress functions  
❌ Forget to sanitize/escape data  
❌ Create overly complex blocks  
❌ Ignore mobile responsiveness

