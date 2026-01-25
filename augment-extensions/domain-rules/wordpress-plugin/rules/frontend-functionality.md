# Frontend Functionality

## Overview

This guide covers WordPress plugin frontend features: custom post types, custom taxonomies, shortcodes, and widgets. These are the primary ways plugins extend WordPress content and display functionality.

---

## Custom Post Types

### Basic Registration

```php
<?php
/**
 * Register custom post type
 */
function my_plugin_register_post_type() {
    $labels = array(
        'name'                  => __( 'Books', 'my-plugin' ),
        'singular_name'         => __( 'Book', 'my-plugin' ),
        'add_new'               => __( 'Add New', 'my-plugin' ),
        'add_new_item'          => __( 'Add New Book', 'my-plugin' ),
        'edit_item'             => __( 'Edit Book', 'my-plugin' ),
        'new_item'              => __( 'New Book', 'my-plugin' ),
        'view_item'             => __( 'View Book', 'my-plugin' ),
        'view_items'            => __( 'View Books', 'my-plugin' ),
        'search_items'          => __( 'Search Books', 'my-plugin' ),
        'not_found'             => __( 'No books found', 'my-plugin' ),
        'not_found_in_trash'    => __( 'No books found in Trash', 'my-plugin' ),
        'all_items'             => __( 'All Books', 'my-plugin' ),
        'archives'              => __( 'Book Archives', 'my-plugin' ),
        'attributes'            => __( 'Book Attributes', 'my-plugin' ),
        'insert_into_item'      => __( 'Insert into book', 'my-plugin' ),
        'uploaded_to_this_item' => __( 'Uploaded to this book', 'my-plugin' ),
        'menu_name'             => __( 'Books', 'my-plugin' ),
    );
    
    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'publicly_queryable'  => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_nav_menus'   => true,
        'show_in_admin_bar'   => true,
        'query_var'           => true,
        'rewrite'             => array( 'slug' => 'book', 'with_front' => false ),
        'capability_type'     => 'post',
        'has_archive'         => true,
        'hierarchical'        => false,
        'menu_position'       => 20,
        'menu_icon'           => 'dashicons-book',
        'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest'        => true, // Enable Gutenberg + REST API
        'rest_base'           => 'books',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
    );
    
    register_post_type( 'book', $args );
}
add_action( 'init', 'my_plugin_register_post_type' );
```

### Advanced Post Type with Custom Capabilities

```php
<?php
/**
 * Register post type with custom capabilities
 */
function my_plugin_register_advanced_post_type() {
    $args = array(
        'labels'              => array( /* labels array */ ),
        'public'              => true,
        'capability_type'     => array( 'book', 'books' ),
        'map_meta_cap'        => true,
        'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions' ),
        'show_in_rest'        => true,
        'taxonomies'          => array( 'category', 'post_tag' ), // Support default taxonomies
        'has_archive'         => 'books-archive',
        'rewrite'             => array(
            'slug'       => 'library/%book_category%',
            'with_front' => false,
            'feeds'      => true,
            'pages'      => true,
        ),
    );
    
    register_post_type( 'book', $args );
}
add_action( 'init', 'my_plugin_register_advanced_post_type' );
```

---

## Custom Taxonomies

### Hierarchical Taxonomy (Like Categories)

```php
<?php
/**
 * Register hierarchical taxonomy
 */
function my_plugin_register_taxonomy() {
    $labels = array(
        'name'              => __( 'Genres', 'my-plugin' ),
        'singular_name'     => __( 'Genre', 'my-plugin' ),
        'search_items'      => __( 'Search Genres', 'my-plugin' ),
        'all_items'         => __( 'All Genres', 'my-plugin' ),
        'parent_item'       => __( 'Parent Genre', 'my-plugin' ),
        'parent_item_colon' => __( 'Parent Genre:', 'my-plugin' ),
        'edit_item'         => __( 'Edit Genre', 'my-plugin' ),
        'update_item'       => __( 'Update Genre', 'my-plugin' ),
        'add_new_item'      => __( 'Add New Genre', 'my-plugin' ),
        'new_item_name'     => __( 'New Genre Name', 'my-plugin' ),
        'menu_name'         => __( 'Genres', 'my-plugin' ),
    );
    
    $args = array(
        'labels'            => $labels,
        'hierarchical'      => true,
        'public'            => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud'     => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'genre', 'with_front' => false ),
        'show_in_rest'      => true,
        'rest_base'         => 'genres',
        'rest_controller_class' => 'WP_REST_Terms_Controller',
    );
    
    register_taxonomy( 'genre', array( 'book' ), $args );
}
add_action( 'init', 'my_plugin_register_taxonomy' );
```

### Non-Hierarchical Taxonomy (Like Tags)

```php
<?php
/**
 * Register non-hierarchical taxonomy
 */
function my_plugin_register_tag_taxonomy() {
    $args = array(
        'labels'            => array( /* labels array */ ),
        'hierarchical'      => false,
        'public'            => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array( 'slug' => 'book-tag' ),
    );
    
    register_taxonomy( 'book_tag', array( 'book' ), $args );
}
add_action( 'init', 'my_plugin_register_tag_taxonomy' );

---

## Shortcodes

### Basic Shortcode

```php
<?php
/**
 * Register shortcode
 * Usage: [my_books]
 */
function my_plugin_books_shortcode( $atts ) {
    // Parse attributes with defaults
    $atts = shortcode_atts( array(
        'limit'    => 5,
        'category' => '',
        'orderby'  => 'date',
        'order'    => 'DESC',
    ), $atts, 'my_books' );

    // Query books
    $args = array(
        'post_type'      => 'book',
        'posts_per_page' => intval( $atts['limit'] ),
        'orderby'        => sanitize_text_field( $atts['orderby'] ),
        'order'          => sanitize_text_field( $atts['order'] ),
    );

    if ( ! empty( $atts['category'] ) ) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'genre',
                'field'    => 'slug',
                'terms'    => sanitize_text_field( $atts['category'] ),
            ),
        );
    }

    $query = new WP_Query( $args );

    // Build output
    ob_start();

    if ( $query->have_posts() ) {
        echo '<div class="my-plugin-books">';
        while ( $query->have_posts() ) {
            $query->the_post();
            ?>
            <div class="book-item">
                <h3><?php the_title(); ?></h3>
                <?php if ( has_post_thumbnail() ) : ?>
                    <?php the_post_thumbnail( 'thumbnail' ); ?>
                <?php endif; ?>
                <div class="book-excerpt">
                    <?php the_excerpt(); ?>
                </div>
                <a href="<?php the_permalink(); ?>"><?php esc_html_e( 'Read More', 'my-plugin' ); ?></a>
            </div>
            <?php
        }
        echo '</div>';
    } else {
        echo '<p>' . esc_html__( 'No books found.', 'my-plugin' ) . '</p>';
    }

    wp_reset_postdata();

    return ob_get_clean();
}
add_shortcode( 'my_books', 'my_plugin_books_shortcode' );
```

### Shortcode with Enclosed Content

```php
<?php
/**
 * Shortcode with enclosed content
 * Usage: [book_highlight id="123"]Custom text here[/book_highlight]
 */
function my_plugin_book_highlight_shortcode( $atts, $content = null ) {
    $atts = shortcode_atts( array(
        'id'    => 0,
        'class' => 'book-highlight',
    ), $atts, 'book_highlight' );

    $book_id = intval( $atts['id'] );

    if ( ! $book_id || get_post_type( $book_id ) !== 'book' ) {
        return '';
    }

    $book_title = get_the_title( $book_id );
    $book_url   = get_permalink( $book_id );

    $output = sprintf(
        '<div class="%s"><p>%s</p><p><a href="%s">%s</a></p></div>',
        esc_attr( $atts['class'] ),
        wp_kses_post( $content ),
        esc_url( $book_url ),
        esc_html( $book_title )
    );

    return $output;
}
add_shortcode( 'book_highlight', 'my_plugin_book_highlight_shortcode' );
```

---

## Widgets

### Modern Widget (WP_Widget Class)

```php
<?php
/**
 * Recent Books Widget
 */
class My_Plugin_Recent_Books_Widget extends WP_Widget {

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(
            'my_plugin_recent_books',
            __( 'Recent Books', 'my-plugin' ),
            array(
                'description' => __( 'Display recent books from your library', 'my-plugin' ),
                'classname'   => 'my-plugin-recent-books-widget',
            )
        );
    }

    /**
     * Front-end display
     */
    public function widget( $args, $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Recent Books', 'my-plugin' );
        $title = apply_filters( 'widget_title', $title, $instance, $this->id_base );
        $limit = ! empty( $instance['limit'] ) ? absint( $instance['limit'] ) : 5;

        echo $args['before_widget'];

        if ( $title ) {
            echo $args['before_title'] . esc_html( $title ) . $args['after_title'];
        }

        $query = new WP_Query( array(
            'post_type'      => 'book',
            'posts_per_page' => $limit,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ) );

        if ( $query->have_posts() ) {
            echo '<ul class="recent-books-list">';
            while ( $query->have_posts() ) {
                $query->the_post();
                ?>
                <li>
                    <?php if ( has_post_thumbnail() ) : ?>
                        <a href="<?php the_permalink(); ?>">
                            <?php the_post_thumbnail( 'thumbnail' ); ?>
                        </a>
                    <?php endif; ?>
                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                </li>
                <?php
            }
            echo '</ul>';
            wp_reset_postdata();
        } else {
            echo '<p>' . esc_html__( 'No books found.', 'my-plugin' ) . '</p>';
        }

        echo $args['after_widget'];
    }

    /**
     * Back-end widget form
     */
    public function form( $instance ) {
        $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'Recent Books', 'my-plugin' );
        $limit = ! empty( $instance['limit'] ) ? absint( $instance['limit'] ) : 5;
        ?>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>">
                <?php esc_html_e( 'Title:', 'my-plugin' ); ?>
            </label>
            <input class="widefat"
                   id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"
                   name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>"
                   type="text"
                   value="<?php echo esc_attr( $title ); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr( $this->get_field_id( 'limit' ) ); ?>">
                <?php esc_html_e( 'Number of books:', 'my-plugin' ); ?>
            </label>
            <input class="tiny-text"
                   id="<?php echo esc_attr( $this->get_field_id( 'limit' ) ); ?>"
                   name="<?php echo esc_attr( $this->get_field_name( 'limit' ) ); ?>"
                   type="number"
                   step="1"
                   min="1"
                   value="<?php echo esc_attr( $limit ); ?>"
                   size="3">
        </p>
        <?php
    }

    /**
     * Sanitize widget form values
     */
    public function update( $new_instance, $old_instance ) {
        $instance = array();
        $instance['title'] = ! empty( $new_instance['title'] ) ? sanitize_text_field( $new_instance['title'] ) : '';
        $instance['limit'] = ! empty( $new_instance['limit'] ) ? absint( $new_instance['limit'] ) : 5;

        return $instance;
    }
}

/**
 * Register widget
 */
function my_plugin_register_widgets() {
    register_widget( 'My_Plugin_Recent_Books_Widget' );
}
add_action( 'widgets_init', 'my_plugin_register_widgets' );
```

---

## Best Practices

### Custom Post Types

1. **Use proper labels**: Provide all label variations for better UX
2. **Enable REST API**: Set `show_in_rest => true` for Gutenberg support
3. **Set proper capabilities**: Use `capability_type` and `map_meta_cap`
4. **Flush rewrite rules**: Only on activation/deactivation, never on every page load
5. **Use proper supports**: Only enable features you need

### Custom Taxonomies

1. **Choose hierarchy wisely**: Hierarchical for categories, non-hierarchical for tags
2. **Enable REST API**: Required for Gutenberg block editor
3. **Show in admin column**: Makes content management easier
4. **Use proper rewrite rules**: Avoid conflicts with existing slugs

### Shortcodes

1. **Use shortcode_atts()**: Always provide defaults and sanitize
2. **Return, don't echo**: Shortcodes should return content, not echo it
3. **Use output buffering**: For complex HTML output
4. **Sanitize and escape**: All user input and output
5. **Support enclosed content**: When it makes sense for your shortcode

### Widgets

1. **Extend WP_Widget**: Use the standard WordPress widget class
2. **Sanitize in update()**: Always sanitize user input
3. **Escape in widget()**: Escape all output
4. **Use widget_title filter**: Allow theme/plugin filtering of titles
5. **Reset post data**: Always call wp_reset_postdata() after custom queries

---

## Common Pitfalls

### ❌ DON'T

```php
// Don't flush rewrite rules on every page load
add_action( 'init', 'my_plugin_register_post_type' );
add_action( 'init', 'flush_rewrite_rules' ); // BAD!

// Don't echo in shortcodes
function bad_shortcode() {
    echo '<p>Content</p>'; // BAD!
}

// Don't forget to sanitize widget input
public function update( $new_instance, $old_instance ) {
    return $new_instance; // BAD!
}
```

### ✅ DO

```php
// Flush rewrite rules only on activation
register_activation_hook( __FILE__, 'my_plugin_activate' );
function my_plugin_activate() {
    my_plugin_register_post_type();
    flush_rewrite_rules();
}

// Return content from shortcodes
function good_shortcode() {
    return '<p>Content</p>'; // GOOD!
}

// Always sanitize widget input
public function update( $new_instance, $old_instance ) {
    $instance = array();
    $instance['title'] = sanitize_text_field( $new_instance['title'] );
    return $instance; // GOOD!
}
```
```

