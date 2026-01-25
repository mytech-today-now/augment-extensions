# Gutenberg Block Development

## Overview

This guide covers WordPress Gutenberg block development for plugins using modern block development tools (@wordpress/create-block, @wordpress/scripts, block.json).

---

## Block Scaffolding

### Create Block with @wordpress/create-block

```bash
# Navigate to plugins directory
cd wp-content/plugins

# Create new block (interactive)
npx @wordpress/create-block my-custom-block

# Or with options
npx @wordpress/create-block my-custom-block \
  --namespace="my-plugin" \
  --title="My Custom Block" \
  --category="widgets" \
  --template="@wordpress/create-block/block-template"
```

**Generated structure:**
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

### Build Commands

```bash
# Development mode (watch for changes)
npm start

# Production build
npm run build

# Lint JavaScript
npm run lint:js

# Format code
npm run format
```

---

## Block Metadata (block.json)

### Complete block.json Example

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 2,
  "name": "my-plugin/custom-block",
  "version": "1.0.0",
  "title": "Custom Block",
  "category": "widgets",
  "icon": "smiley",
  "description": "A custom Gutenberg block",
  "keywords": ["custom", "block", "example"],
  "textdomain": "my-plugin",
  "supports": {
    "html": false,
    "align": true,
    "alignWide": true,
    "color": {
      "background": true,
      "text": true,
      "gradients": true
    },
    "spacing": {
      "padding": true,
      "margin": true
    },
    "typography": {
      "fontSize": true,
      "lineHeight": true
    }
  },
  "attributes": {
    "content": {
      "type": "string",
      "source": "html",
      "selector": "p",
      "default": ""
    },
    "alignment": {
      "type": "string",
      "default": "left"
    },
    "showIcon": {
      "type": "boolean",
      "default": false
    },
    "iconSize": {
      "type": "number",
      "default": 24
    }
  },
  "example": {
    "attributes": {
      "content": "This is example content",
      "alignment": "center"
    }
  },
  "editorScript": "file:./index.js",
  "editorStyle": "file:./index.css",
  "style": "file:./style-index.css"
}
```

### Attribute Types

```json
{
  "attributes": {
    "stringAttr": {
      "type": "string",
      "default": ""
    },
    "numberAttr": {
      "type": "number",
      "default": 0
    },
    "booleanAttr": {
      "type": "boolean",
      "default": false
    },
    "arrayAttr": {
      "type": "array",
      "default": []
    },
    "objectAttr": {
      "type": "object",
      "default": {}
    },
    "htmlContent": {
      "type": "string",
      "source": "html",
      "selector": "p"
    },
    "textContent": {
      "type": "string",
      "source": "text",
      "selector": ".my-class"
    },
    "attributeValue": {
      "type": "string",
      "source": "attribute",
      "selector": "img",
      "attribute": "src"
    }
  }
}
```

---

## Block Registration

### src/index.js

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

---

## Edit Component

### Basic Edit Component

**src/edit.js:**
```jsx
import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { content } = attributes;

    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
            <RichText
                tagName="p"
                value={content}
                onChange={(newContent) => setAttributes({ content: newContent })}
                placeholder={__('Enter your content...', 'my-plugin')}
            />
        </div>
    );
}
```

### Edit Component with Controls

**src/edit.js:**
```jsx
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    RichText,
    AlignmentToolbar,
    BlockControls,
    InspectorControls
} from '@wordpress/block-editor';
import {
    PanelBody,
    ToggleControl,
    RangeControl,
    TextControl
} from '@wordpress/components';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { content, alignment, showIcon, iconSize, customClass } = attributes;

    const blockProps = useBlockProps({
        className: `has-text-align-${alignment} ${customClass}`,
    });

    return (
        <>
            <BlockControls>
                <AlignmentToolbar
                    value={alignment}
                    onChange={(newAlignment) => setAttributes({ alignment: newAlignment })}
                />
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Settings', 'my-plugin')}>
                    <ToggleControl
                        label={__('Show Icon', 'my-plugin')}
                        checked={showIcon}
                        onChange={(value) => setAttributes({ showIcon: value })}
                    />

                    {showIcon && (
                        <RangeControl
                            label={__('Icon Size', 'my-plugin')}
                            value={iconSize}
                            onChange={(value) => setAttributes({ iconSize: value })}
                            min={10}
                            max={100}
                        />
                    )}

                    <TextControl
                        label={__('Custom Class', 'my-plugin')}
                        value={customClass}
                        onChange={(value) => setAttributes({ customClass: value })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {showIcon && (
                    <span className="block-icon" style={{ fontSize: `${iconSize}px` }}>
                        ★
                    </span>
                )}
                <RichText
                    tagName="p"
                    value={content}
                    onChange={(newContent) => setAttributes({ content: newContent })}
                    placeholder={__('Enter your content...', 'my-plugin')}
                />
            </div>
        </>
    );
}
```

---

## Save Function

### Basic Save Function

**src/save.js:**
```jsx
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { content } = attributes;

    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps}>
            <RichText.Content tagName="p" value={content} />
        </div>
    );
}
```

### Save Function with Attributes

**src/save.js:**
```jsx
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { content, alignment, showIcon, iconSize, customClass } = attributes;

    const blockProps = useBlockProps.save({
        className: `has-text-align-${alignment} ${customClass}`,
    });

    return (
        <div {...blockProps}>
            {showIcon && (
                <span className="block-icon" style={{ fontSize: `${iconSize}px` }}>
                    ★
                </span>
            )}
            <RichText.Content tagName="p" value={content} />
        </div>
    );
}
```

---

## Dynamic Blocks (Server-Side Rendering)

### Configure block.json for Dynamic Block

```json
{
  "apiVersion": 2,
  "name": "my-plugin/dynamic-block",
  "title": "Dynamic Block",
  "category": "widgets",
  "attributes": {
    "numberOfPosts": {
      "type": "number",
      "default": 5
    },
    "postType": {
      "type": "string",
      "default": "post"
    }
  },
  "editorScript": "file:./index.js",
  "render": "file:./render.php"
}
```

### PHP Render Template

**src/render.php:**
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
$post_type = isset( $attributes['postType'] ) ? sanitize_text_field( $attributes['postType'] ) : 'post';

$args = array(
    'posts_per_page' => $number_of_posts,
    'post_type'      => $post_type,
    'post_status'    => 'publish',
);

$query = new WP_Query( $args );

$wrapper_attributes = get_block_wrapper_attributes();

$output = sprintf( '<div %s>', $wrapper_attributes );

if ( $query->have_posts() ) {
    $output .= '<ul class="dynamic-block-list">';

    while ( $query->have_posts() ) {
        $query->the_post();
        $output .= sprintf(
            '<li><a href="%s">%s</a></li>',
            esc_url( get_permalink() ),
            esc_html( get_the_title() )
        );
    }

    $output .= '</ul>';
} else {
    $output .= '<p>' . esc_html__( 'No posts found.', 'my-plugin' ) . '</p>';
}

$output .= '</div>';

wp_reset_postdata();

echo $output;
```

### Edit Component for Dynamic Block

**src/edit.js:**
```jsx
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

export default function Edit({ attributes, setAttributes }) {
    const { numberOfPosts, postType } = attributes;

    // Fetch posts for preview
    const posts = useSelect((select) => {
        return select('core').getEntityRecords('postType', postType, {
            per_page: numberOfPosts,
        });
    }, [numberOfPosts, postType]);

    const blockProps = useBlockProps();

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'my-plugin')}>
                    <SelectControl
                        label={__('Post Type', 'my-plugin')}
                        value={postType}
                        options={[
                            { label: 'Posts', value: 'post' },
                            { label: 'Pages', value: 'page' },
                        ]}
                        onChange={(value) => setAttributes({ postType: value })}
                    />

                    <RangeControl
                        label={__('Number of Posts', 'my-plugin')}
                        value={numberOfPosts}
                        onChange={(value) => setAttributes({ numberOfPosts: value })}
                        min={1}
                        max={10}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <p className="block-label">
                    {__('Dynamic Block Preview', 'my-plugin')}
                </p>

                {!posts && <p>{__('Loading...', 'my-plugin')}</p>}

                {posts && posts.length === 0 && (
                    <p>{__('No posts found.', 'my-plugin')}</p>
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

### Save Function for Dynamic Block

**src/save.js:**
```jsx
// Dynamic blocks don't need a save function
// Content is rendered server-side via render.php
export default function save() {
    return null;
}

---

## Block Variations

### Register Block Variations

**src/index.js:**
```js
import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

registerBlockType(metadata.name, {
    edit: Edit,
    save,
});

// Register variations
registerBlockVariation('my-plugin/custom-block', {
    name: 'highlighted',
    title: __('Highlighted Block', 'my-plugin'),
    description: __('A highlighted version of the block', 'my-plugin'),
    icon: 'star-filled',
    attributes: {
        className: 'is-style-highlighted',
        showIcon: true,
    },
});

registerBlockVariation('my-plugin/custom-block', {
    name: 'minimal',
    title: __('Minimal Block', 'my-plugin'),
    description: __('A minimal version of the block', 'my-plugin'),
    icon: 'minus',
    attributes: {
        className: 'is-style-minimal',
        showIcon: false,
    },
});
```

---

## Block Styles

### Register Block Styles

**src/index.js:**
```js
import { registerBlockStyle } from '@wordpress/blocks';

// Register after block registration
registerBlockStyle('my-plugin/custom-block', {
    name: 'rounded',
    label: __('Rounded', 'my-plugin'),
});

registerBlockStyle('my-plugin/custom-block', {
    name: 'shadow',
    label: __('Shadow', 'my-plugin'),
});

registerBlockStyle('my-plugin/custom-block', {
    name: 'bordered',
    label: __('Bordered', 'my-plugin'),
    isDefault: true,
});
```

### Style CSS

**src/style.scss:**
```scss
.wp-block-my-plugin-custom-block {
    padding: 20px;

    &.is-style-rounded {
        border-radius: 10px;
    }

    &.is-style-shadow {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    &.is-style-bordered {
        border: 2px solid #ddd;
    }
}
```

---

## Common Block Components

### Media Upload

```jsx
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';

<MediaUploadCheck>
    <MediaUpload
        onSelect={(media) => setAttributes({ imageUrl: media.url, imageId: media.id })}
        allowedTypes={['image']}
        value={imageId}
        render={({ open }) => (
            <Button onClick={open} variant="primary">
                {imageUrl ? __('Replace Image', 'my-plugin') : __('Select Image', 'my-plugin')}
            </Button>
        )}
    />
</MediaUploadCheck>

{imageUrl && (
    <img src={imageUrl} alt="" />
)}
```

### Color Picker

```jsx
import { InspectorControls, ColorPalette } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

<InspectorControls>
    <PanelBody title={__('Color Settings', 'my-plugin')}>
        <ColorPalette
            value={backgroundColor}
            onChange={(color) => setAttributes({ backgroundColor: color })}
        />
    </PanelBody>
</InspectorControls>
```

### Link Control

```jsx
import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';

const [isLinkPickerVisible, setIsLinkPickerVisible] = useState(false);

<Button onClick={() => setIsLinkPickerVisible(true)}>
    {__('Add Link', 'my-plugin')}
</Button>

{isLinkPickerVisible && (
    <Popover onClose={() => setIsLinkPickerVisible(false)}>
        <LinkControl
            value={{ url: linkUrl, opensInNewTab: linkTarget === '_blank' }}
            onChange={(newLink) => {
                setAttributes({
                    linkUrl: newLink.url,
                    linkTarget: newLink.opensInNewTab ? '_blank' : '_self',
                });
            }}
        />
    </Popover>
)}
```

---

## Best Practices

### Block Development

1. **Use block.json**: Define all metadata in block.json (required for WordPress 5.8+)
2. **Use @wordpress/scripts**: Leverage official build tools for consistency
3. **Enable REST API**: Set `show_in_rest: true` for custom post types used in blocks
4. **Use useBlockProps**: Always use `useBlockProps()` in edit and `useBlockProps.save()` in save
5. **Sanitize attributes**: Validate and sanitize all attribute values
6. **Escape output**: Use proper escaping in save function and render.php
7. **Support block styles**: Enable color, spacing, typography supports when appropriate
8. **Provide examples**: Include example attributes for block preview
9. **Use semantic HTML**: Choose appropriate HTML tags for accessibility
10. **Test in editor**: Test block in both editor and frontend

### Performance

1. **Minimize dependencies**: Only import what you need from @wordpress packages
2. **Use dynamic blocks wisely**: Only when content must be server-rendered
3. **Optimize queries**: Limit posts fetched in dynamic blocks
4. **Cache dynamic content**: Use transients for expensive queries
5. **Lazy load assets**: Only enqueue scripts/styles when block is used

### Accessibility

1. **Use ARIA labels**: Provide labels for controls
2. **Keyboard navigation**: Ensure all controls are keyboard accessible
3. **Color contrast**: Ensure sufficient contrast in block styles
4. **Alt text**: Require alt text for images
5. **Semantic markup**: Use proper heading hierarchy

---

## Common Pitfalls

### ❌ DON'T

```jsx
// Don't mutate attributes directly
attributes.content = 'new value'; // BAD!

// Don't use inline styles without escaping
<div style={{ color: userInput }}> // BAD!

// Don't forget to save block props
export default function save({ attributes }) {
    return <div>{attributes.content}</div>; // BAD! Missing useBlockProps.save()
}

// Don't use hooks conditionally
if (showIcon) {
    const [iconColor, setIconColor] = useState('#000'); // BAD!
}
```

### ✅ DO

```jsx
// Use setAttributes to update
setAttributes({ content: 'new value' }); // GOOD!

// Sanitize and escape user input
<div style={{ color: sanitizeColor(userInput) }}> // GOOD!

// Always use useBlockProps.save()
export default function save({ attributes }) {
    const blockProps = useBlockProps.save();
    return <div {...blockProps}>{attributes.content}</div>; // GOOD!
}

// Use hooks at top level
const [iconColor, setIconColor] = useState('#000');
if (showIcon) {
    // Use the hook value
}
```

---

## PHP Registration (Alternative to block.json)

### Register Block in PHP

**my-plugin.php:**
```php
<?php
/**
 * Register block
 */
function my_plugin_register_block() {
    register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'my_plugin_register_block' );
```

### Register Dynamic Block in PHP

```php
<?php
/**
 * Register dynamic block with render callback
 */
function my_plugin_register_dynamic_block() {
    register_block_type( 'my-plugin/dynamic-block', array(
        'api_version' => 2,
        'attributes'  => array(
            'numberOfPosts' => array(
                'type'    => 'number',
                'default' => 5,
            ),
        ),
        'render_callback' => 'my_plugin_render_dynamic_block',
    ) );
}
add_action( 'init', 'my_plugin_register_dynamic_block' );

/**
 * Render callback
 */
function my_plugin_render_dynamic_block( $attributes, $content, $block ) {
    $number_of_posts = isset( $attributes['numberOfPosts'] ) ? absint( $attributes['numberOfPosts'] ) : 5;

    $query = new WP_Query( array(
        'posts_per_page' => $number_of_posts,
    ) );

    $output = '<div ' . get_block_wrapper_attributes() . '>';

    if ( $query->have_posts() ) {
        $output .= '<ul>';
        while ( $query->have_posts() ) {
            $query->the_post();
            $output .= '<li>' . esc_html( get_the_title() ) . '</li>';
        }
        $output .= '</ul>';
    }

    $output .= '</div>';

    wp_reset_postdata();

    return $output;
}
```
```
```

