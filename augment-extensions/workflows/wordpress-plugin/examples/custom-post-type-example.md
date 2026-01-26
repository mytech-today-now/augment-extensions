# Custom Post Type Example

This example demonstrates creating a custom post type with taxonomy, meta boxes, and frontend display in a WordPress plugin.

## Scenario

Creating a "Book Review" custom post type for a WordPress plugin that allows users to manage and display book reviews.

## Plugin Context

**Plugin**: Book Reviews
**Feature**: Custom post type for book reviews with rating, author, and genre
**Custom Post Type**: `book_review`
**Custom Taxonomy**: `book_genre`

## Complete Implementation

### Main Plugin File

**File**: `book-reviews.php`

```php
<?php
/**
 * Plugin Name: Book Reviews
 * Plugin URI: https://example.com/book-reviews
 * Description: Manage and display book reviews with ratings and genres
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: book-reviews
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

define('BOOK_REVIEWS_VERSION', '1.0.0');
define('BOOK_REVIEWS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BOOK_REVIEWS_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * The code that runs during plugin activation.
 */
function activate_book_reviews() {
    require_once BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-reviews-activator.php';
    Book_Reviews_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_book_reviews() {
    require_once BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-reviews-deactivator.php';
    Book_Reviews_Deactivator::deactivate();
}

register_activation_hook(__FILE__, 'activate_book_reviews');
register_deactivation_hook(__FILE__, 'deactivate_book_reviews');

/**
 * The core plugin class.
 */
require BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-reviews.php';

/**
 * Begins execution of the plugin.
 */
function run_book_reviews() {
    $plugin = new Book_Reviews();
    $plugin->run();
}
run_book_reviews();
```

### Activator Class

**File**: `includes/class-book-reviews-activator.php`

```php
<?php
/**
 * Fired during plugin activation.
 */
class Book_Reviews_Activator {
    
    /**
     * Activate the plugin.
     */
    public static function activate() {
        // Register post type and taxonomy
        self::register_post_type();
        self::register_taxonomy();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Register the custom post type.
     */
    private static function register_post_type() {
        require_once BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-review-post-type.php';
        $post_type = new Book_Review_Post_Type();
        $post_type->register();
    }
    
    /**
     * Register the custom taxonomy.
     */
    private static function register_taxonomy() {
        require_once BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-genre-taxonomy.php';
        $taxonomy = new Book_Genre_Taxonomy();
        $taxonomy->register();
    }
}
```

### Deactivator Class

**File**: `includes/class-book-reviews-deactivator.php`

```php
<?php
/**
 * Fired during plugin deactivation.
 */
class Book_Reviews_Deactivator {
    
    /**
     * Deactivate the plugin.
     */
    public static function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}
```

### Core Plugin Class

**File**: `includes/class-book-reviews.php`

```php
<?php
/**
 * The core plugin class.
 */
class Book_Reviews {
    
    /**
     * The loader that's responsible for maintaining and registering all hooks.
     */
    protected $loader;
    
    /**
     * The unique identifier of this plugin.
     */
    protected $plugin_name;
    
    /**
     * The current version of the plugin.
     */
    protected $version;
    
    /**
     * Define the core functionality of the plugin.
     */
    public function __construct() {
        $this->version = BOOK_REVIEWS_VERSION;
        $this->plugin_name = 'book-reviews';
        
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }
    
    /**
     * Load the required dependencies for this plugin.
     */
    private function load_dependencies() {
        require_once BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-reviews-loader.php';
        require_once BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-review-post-type.php';
        require_once BOOK_REVIEWS_PLUGIN_DIR . 'includes/class-book-genre-taxonomy.php';
        require_once BOOK_REVIEWS_PLUGIN_DIR . 'admin/class-book-reviews-admin.php';
        require_once BOOK_REVIEWS_PLUGIN_DIR . 'public/class-book-reviews-public.php';

        $this->loader = new Book_Reviews_Loader();
    }

    /**
     * Register all of the hooks related to the admin area functionality.
     */
    private function define_admin_hooks() {
        $admin = new Book_Reviews_Admin($this->get_plugin_name(), $this->get_version());

        $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_styles');
        $this->loader->add_action('admin_enqueue_scripts', $admin, 'enqueue_scripts');
    }

    /**
     * Register all of the hooks related to the public-facing functionality.
     */
    private function define_public_hooks() {
        $public = new Book_Reviews_Public($this->get_plugin_name(), $this->get_version());

        $this->loader->add_action('wp_enqueue_scripts', $public, 'enqueue_styles');
        $this->loader->add_action('wp_enqueue_scripts', $public, 'enqueue_scripts');

        // Register post type and taxonomy
        $post_type = new Book_Review_Post_Type();
        $this->loader->add_action('init', $post_type, 'register');

        $taxonomy = new Book_Genre_Taxonomy();
        $this->loader->add_action('init', $taxonomy, 'register');
    }

    /**
     * Run the loader to execute all of the hooks with WordPress.
     */
    public function run() {
        $this->loader->run();
    }

    /**
     * The name of the plugin used to uniquely identify it.
     */
    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * Retrieve the version number of the plugin.
     */
    public function get_version() {
        return $this->version;
    }
}
```

### Custom Post Type Class

**File**: `includes/class-book-review-post-type.php`

```php
<?php
/**
 * Register the Book Review custom post type.
 */
class Book_Review_Post_Type {

    /**
     * Register the custom post type.
     */
    public function register() {
        $labels = array(
            'name'                  => _x('Book Reviews', 'Post Type General Name', 'book-reviews'),
            'singular_name'         => _x('Book Review', 'Post Type Singular Name', 'book-reviews'),
            'menu_name'             => __('Book Reviews', 'book-reviews'),
            'name_admin_bar'        => __('Book Review', 'book-reviews'),
            'archives'              => __('Book Review Archives', 'book-reviews'),
            'attributes'            => __('Book Review Attributes', 'book-reviews'),
            'parent_item_colon'     => __('Parent Book Review:', 'book-reviews'),
            'all_items'             => __('All Book Reviews', 'book-reviews'),
            'add_new_item'          => __('Add New Book Review', 'book-reviews'),
            'add_new'               => __('Add New', 'book-reviews'),
            'new_item'              => __('New Book Review', 'book-reviews'),
            'edit_item'             => __('Edit Book Review', 'book-reviews'),
            'update_item'           => __('Update Book Review', 'book-reviews'),
            'view_item'             => __('View Book Review', 'book-reviews'),
            'view_items'            => __('View Book Reviews', 'book-reviews'),
            'search_items'          => __('Search Book Review', 'book-reviews'),
            'not_found'             => __('Not found', 'book-reviews'),
            'not_found_in_trash'    => __('Not found in Trash', 'book-reviews'),
            'featured_image'        => __('Book Cover Image', 'book-reviews'),
            'set_featured_image'    => __('Set book cover image', 'book-reviews'),
            'remove_featured_image' => __('Remove book cover image', 'book-reviews'),
            'use_featured_image'    => __('Use as book cover image', 'book-reviews'),
            'insert_into_item'      => __('Insert into book review', 'book-reviews'),
            'uploaded_to_this_item' => __('Uploaded to this book review', 'book-reviews'),
            'items_list'            => __('Book Reviews list', 'book-reviews'),
            'items_list_navigation' => __('Book Reviews list navigation', 'book-reviews'),
            'filter_items_list'     => __('Filter book reviews list', 'book-reviews'),
        );

        $args = array(
            'label'                 => __('Book Review', 'book-reviews'),
            'description'           => __('Book reviews with ratings and metadata', 'book-reviews'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'comments'),
            'taxonomies'            => array('book_genre'),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 5,
            'menu_icon'             => 'dashicons-book',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => true,
            'exclude_from_search'   => false,
            'publicly_queryable'    => true,
            'capability_type'       => 'post',
            'show_in_rest'          => true,
            'rewrite'               => array('slug' => 'book-reviews'),
        );

        register_post_type('book_review', $args);
    }
}
```

### Custom Taxonomy Class

**File**: `includes/class-book-genre-taxonomy.php`

```php
<?php
/**
 * Register the Book Genre custom taxonomy.
 */
class Book_Genre_Taxonomy {

    /**
     * Register the custom taxonomy.
     */
    public function register() {
        $labels = array(
            'name'                       => _x('Book Genres', 'Taxonomy General Name', 'book-reviews'),
            'singular_name'              => _x('Book Genre', 'Taxonomy Singular Name', 'book-reviews'),
            'menu_name'                  => __('Book Genres', 'book-reviews'),
            'all_items'                  => __('All Book Genres', 'book-reviews'),
            'parent_item'                => __('Parent Book Genre', 'book-reviews'),
            'parent_item_colon'          => __('Parent Book Genre:', 'book-reviews'),
            'new_item_name'              => __('New Book Genre Name', 'book-reviews'),
            'add_new_item'               => __('Add New Book Genre', 'book-reviews'),
            'edit_item'                  => __('Edit Book Genre', 'book-reviews'),
            'update_item'                => __('Update Book Genre', 'book-reviews'),
            'view_item'                  => __('View Book Genre', 'book-reviews'),
            'separate_items_with_commas' => __('Separate genres with commas', 'book-reviews'),
            'add_or_remove_items'        => __('Add or remove genres', 'book-reviews'),
            'choose_from_most_used'      => __('Choose from the most used', 'book-reviews'),
            'popular_items'              => __('Popular Genres', 'book-reviews'),
            'search_items'               => __('Search Genres', 'book-reviews'),
            'not_found'                  => __('Not Found', 'book-reviews'),
            'no_terms'                   => __('No genres', 'book-reviews'),
            'items_list'                 => __('Genres list', 'book-reviews'),
            'items_list_navigation'      => __('Genres list navigation', 'book-reviews'),
        );

        $args = array(
            'labels'                     => $labels,
            'hierarchical'               => true,
            'public'                     => true,
            'show_ui'                    => true,
            'show_admin_column'          => true,
            'show_in_nav_menus'          => true,
            'show_tagcloud'              => true,
            'show_in_rest'               => true,
            'rewrite'                    => array('slug' => 'book-genre'),
        );

        register_taxonomy('book_genre', array('book_review'), $args);
    }
}
```

### Admin Class with Meta Boxes

**File**: `admin/class-book-reviews-admin.php`

```php
<?php
/**
 * The admin-specific functionality of the plugin.
 */
class Book_Reviews_Admin {

    /**
     * The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post_book_review', array($this, 'save_meta_boxes'), 10, 2);
        add_filter('manage_book_review_posts_columns', array($this, 'add_custom_columns'));
        add_action('manage_book_review_posts_custom_column', array($this, 'render_custom_columns'), 10, 2);
    }

    /**
     * Register the stylesheets for the admin area.
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            BOOK_REVIEWS_PLUGIN_URL . 'admin/css/book-reviews-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            BOOK_REVIEWS_PLUGIN_URL . 'admin/js/book-reviews-admin.js',
            array('jquery'),
            $this->version,
            false
        );
    }

    /**
     * Add meta boxes for book review details.
     */
    public function add_meta_boxes() {
        add_meta_box(
            'book_review_details',
            __('Book Details', 'book-reviews'),
            array($this, 'render_book_details_meta_box'),
            'book_review',
            'normal',
            'high'
        );

        add_meta_box(
            'book_review_rating',
            __('Book Rating', 'book-reviews'),
            array($this, 'render_book_rating_meta_box'),
            'book_review',
            'side',
            'default'
        );
    }

    /**
     * Render the book details meta box.
     */
    public function render_book_details_meta_box($post) {
        // Add nonce for security
        wp_nonce_field('book_review_details_nonce', 'book_review_details_nonce_field');

        // Get current values
        $author = get_post_meta($post->ID, '_book_author', true);
        $isbn = get_post_meta($post->ID, '_book_isbn', true);
        $publisher = get_post_meta($post->ID, '_book_publisher', true);
        $publication_date = get_post_meta($post->ID, '_book_publication_date', true);

        ?>
        <table class="form-table">
            <tr>
                <th><label for="book_author"><?php _e('Author', 'book-reviews'); ?></label></th>
                <td>
                    <input type="text"
                           id="book_author"
                           name="book_author"
                           value="<?php echo esc_attr($author); ?>"
                           class="regular-text" />
                </td>
            </tr>
            <tr>
                <th><label for="book_isbn"><?php _e('ISBN', 'book-reviews'); ?></label></th>
                <td>
                    <input type="text"
                           id="book_isbn"
                           name="book_isbn"
                           value="<?php echo esc_attr($isbn); ?>"
                           class="regular-text" />
                </td>
            </tr>
            <tr>
                <th><label for="book_publisher"><?php _e('Publisher', 'book-reviews'); ?></label></th>
                <td>
                    <input type="text"
                           id="book_publisher"
                           name="book_publisher"
                           value="<?php echo esc_attr($publisher); ?>"
                           class="regular-text" />
                </td>
            </tr>
            <tr>
                <th><label for="book_publication_date"><?php _e('Publication Date', 'book-reviews'); ?></label></th>
                <td>
                    <input type="date"
                           id="book_publication_date"
                           name="book_publication_date"
                           value="<?php echo esc_attr($publication_date); ?>" />
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * Render the book rating meta box.
     */
    public function render_book_rating_meta_box($post) {
        // Add nonce for security
        wp_nonce_field('book_review_rating_nonce', 'book_review_rating_nonce_field');

        // Get current value
        $rating = get_post_meta($post->ID, '_book_rating', true);

        ?>
        <p>
            <label for="book_rating"><?php _e('Rating (1-5 stars)', 'book-reviews'); ?></label>
            <select id="book_rating" name="book_rating">
                <option value=""><?php _e('Select rating', 'book-reviews'); ?></option>
                <?php for ($i = 1; $i <= 5; $i++) : ?>
                    <option value="<?php echo $i; ?>" <?php selected($rating, $i); ?>>
                        <?php echo str_repeat('★', $i); ?>
                    </option>
                <?php endfor; ?>
            </select>
        </p>
        <?php
    }

    /**
     * Save meta box data.
     */
    public function save_meta_boxes($post_id, $post) {
        // Check if nonce is set
        if (!isset($_POST['book_review_details_nonce_field']) ||
            !isset($_POST['book_review_rating_nonce_field'])) {
            return;
        }

        // Verify nonces
        if (!wp_verify_nonce($_POST['book_review_details_nonce_field'], 'book_review_details_nonce') ||
            !wp_verify_nonce($_POST['book_review_rating_nonce_field'], 'book_review_rating_nonce')) {
            return;
        }

        // Check if this is an autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        // Check user permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save book details
        if (isset($_POST['book_author'])) {
            update_post_meta($post_id, '_book_author', sanitize_text_field($_POST['book_author']));
        }

        if (isset($_POST['book_isbn'])) {
            update_post_meta($post_id, '_book_isbn', sanitize_text_field($_POST['book_isbn']));
        }

        if (isset($_POST['book_publisher'])) {
            update_post_meta($post_id, '_book_publisher', sanitize_text_field($_POST['book_publisher']));
        }

        if (isset($_POST['book_publication_date'])) {
            update_post_meta($post_id, '_book_publication_date', sanitize_text_field($_POST['book_publication_date']));
        }

        // Save rating
        if (isset($_POST['book_rating'])) {
            $rating = intval($_POST['book_rating']);
            if ($rating >= 1 && $rating <= 5) {
                update_post_meta($post_id, '_book_rating', $rating);
            }
        }
    }

    /**
     * Add custom columns to the book review list.
     */
    public function add_custom_columns($columns) {
        $new_columns = array();

        foreach ($columns as $key => $value) {
            $new_columns[$key] = $value;

            // Add custom columns after title
            if ($key === 'title') {
                $new_columns['book_author'] = __('Author', 'book-reviews');
                $new_columns['book_rating'] = __('Rating', 'book-reviews');
                $new_columns['book_genre'] = __('Genre', 'book-reviews');
            }
        }

        return $new_columns;
    }

    /**
     * Render custom column content.
     */
    public function render_custom_columns($column, $post_id) {
        switch ($column) {
            case 'book_author':
                $author = get_post_meta($post_id, '_book_author', true);
                echo esc_html($author);
                break;

            case 'book_rating':
                $rating = get_post_meta($post_id, '_book_rating', true);
                if ($rating) {
                    echo str_repeat('★', intval($rating));
                } else {
                    echo '—';
                }
                break;

            case 'book_genre':
                $terms = get_the_terms($post_id, 'book_genre');
                if ($terms && !is_wp_error($terms)) {
                    $genre_names = array();
                    foreach ($terms as $term) {
                        $genre_names[] = esc_html($term->name);
                    }
                    echo implode(', ', $genre_names);
                } else {
                    echo '—';
                }
                break;
        }
    }
}
```

### Public Class with Shortcode

**File**: `public/class-book-reviews-public.php`

```php
<?php
/**
 * The public-facing functionality of the plugin.
 */
class Book_Reviews_Public {

    /**
     * The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        add_shortcode('book_reviews', array($this, 'book_reviews_shortcode'));
        add_filter('the_content', array($this, 'add_rating_to_content'));
    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            BOOK_REVIEWS_PLUGIN_URL . 'public/css/book-reviews-public.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the public-facing side of the site.
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            BOOK_REVIEWS_PLUGIN_URL . 'public/js/book-reviews-public.js',
            array('jquery'),
            $this->version,
            false
        );
    }

    /**
     * Shortcode to display book reviews.
     *
     * Usage: [book_reviews genre="fiction" limit="5"]
     */
    public function book_reviews_shortcode($atts) {
        $atts = shortcode_atts(array(
            'genre' => '',
            'limit' => 10,
            'orderby' => 'date',
            'order' => 'DESC',
        ), $atts, 'book_reviews');

        $args = array(
            'post_type' => 'book_review',
            'posts_per_page' => intval($atts['limit']),
            'orderby' => sanitize_text_field($atts['orderby']),
            'order' => sanitize_text_field($atts['order']),
        );

        // Add genre filter if specified
        if (!empty($atts['genre'])) {
            $args['tax_query'] = array(
                array(
                    'taxonomy' => 'book_genre',
                    'field' => 'slug',
                    'terms' => sanitize_text_field($atts['genre']),
                ),
            );
        }

        $query = new WP_Query($args);

        ob_start();

        if ($query->have_posts()) {
            echo '<div class="book-reviews-grid">';

            while ($query->have_posts()) {
                $query->the_post();
                $this->render_book_review_card(get_the_ID());
            }

            echo '</div>';
        } else {
            echo '<p>' . esc_html__('No book reviews found.', 'book-reviews') . '</p>';
        }

        wp_reset_postdata();

        return ob_get_clean();
    }

    /**
     * Render a single book review card.
     */
    private function render_book_review_card($post_id) {
        $author = get_post_meta($post_id, '_book_author', true);
        $rating = get_post_meta($post_id, '_book_rating', true);
        $genres = get_the_terms($post_id, 'book_genre');

        ?>
        <div class="book-review-card">
            <?php if (has_post_thumbnail($post_id)) : ?>
                <div class="book-cover">
                    <?php echo get_the_post_thumbnail($post_id, 'medium'); ?>
                </div>
            <?php endif; ?>

            <div class="book-info">
                <h3 class="book-title">
                    <a href="<?php echo esc_url(get_permalink($post_id)); ?>">
                        <?php echo esc_html(get_the_title($post_id)); ?>
                    </a>
                </h3>

                <?php if ($author) : ?>
                    <p class="book-author">
                        <?php _e('by', 'book-reviews'); ?>
                        <strong><?php echo esc_html($author); ?></strong>
                    </p>
                <?php endif; ?>

                <?php if ($rating) : ?>
                    <div class="book-rating">
                        <?php echo str_repeat('★', intval($rating)); ?>
                        <?php echo str_repeat('☆', 5 - intval($rating)); ?>
                    </div>
                <?php endif; ?>

                <?php if ($genres && !is_wp_error($genres)) : ?>
                    <div class="book-genres">
                        <?php foreach ($genres as $genre) : ?>
                            <span class="genre-tag"><?php echo esc_html($genre->name); ?></span>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <div class="book-excerpt">
                    <?php echo wp_trim_words(get_the_excerpt($post_id), 20); ?>
                </div>

                <a href="<?php echo esc_url(get_permalink($post_id)); ?>" class="read-more">
                    <?php _e('Read Review', 'book-reviews'); ?>
                </a>
            </div>
        </div>
        <?php
    }

    /**
     * Add rating to single book review content.
     */
    public function add_rating_to_content($content) {
        if (!is_singular('book_review')) {
            return $content;
        }

        $post_id = get_the_ID();
        $author = get_post_meta($post_id, '_book_author', true);
        $rating = get_post_meta($post_id, '_book_rating', true);
        $isbn = get_post_meta($post_id, '_book_isbn', true);
        $publisher = get_post_meta($post_id, '_book_publisher', true);
        $publication_date = get_post_meta($post_id, '_book_publication_date', true);

        ob_start();
        ?>
        <div class="book-review-details">
            <div class="book-meta">
                <?php if ($author) : ?>
                    <p><strong><?php _e('Author:', 'book-reviews'); ?></strong> <?php echo esc_html($author); ?></p>
                <?php endif; ?>

                <?php if ($publisher) : ?>
                    <p><strong><?php _e('Publisher:', 'book-reviews'); ?></strong> <?php echo esc_html($publisher); ?></p>
                <?php endif; ?>

                <?php if ($publication_date) : ?>
                    <p><strong><?php _e('Publication Date:', 'book-reviews'); ?></strong> <?php echo esc_html($publication_date); ?></p>
                <?php endif; ?>

                <?php if ($isbn) : ?>
                    <p><strong><?php _e('ISBN:', 'book-reviews'); ?></strong> <?php echo esc_html($isbn); ?></p>
                <?php endif; ?>

                <?php if ($rating) : ?>
                    <div class="book-rating-large">
                        <strong><?php _e('Rating:', 'book-reviews'); ?></strong>
                        <span class="stars">
                            <?php echo str_repeat('★', intval($rating)); ?>
                            <?php echo str_repeat('☆', 5 - intval($rating)); ?>
                        </span>
                        <span class="rating-number"><?php echo esc_html($rating); ?>/5</span>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php
        $details = ob_get_clean();

        return $details . $content;
    }
}
```

### CSS Styling

**File**: `public/css/book-reviews-public.css`

```css
/* Book Reviews Grid */
.book-reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
}

/* Book Review Card */
.book-review-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
}

.book-review-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-cover {
    width: 100%;
    height: 400px;
    overflow: hidden;
    background: #f5f5f5;
}

.book-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.book-info {
    padding: 1.5rem;
}

.book-title {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
}

.book-title a {
    color: #333;
    text-decoration: none;
}

.book-title a:hover {
    color: #0073aa;
}

.book-author {
    margin: 0 0 1rem;
    color: #666;
    font-size: 0.95rem;
}

.book-rating {
    margin: 0 0 1rem;
    color: #f39c12;
    font-size: 1.2rem;
}

.book-genres {
    margin: 0 0 1rem;
}

.genre-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    margin: 0 0.5rem 0.5rem 0;
    background: #e8f4f8;
    color: #0073aa;
    border-radius: 4px;
    font-size: 0.85rem;
}

.book-excerpt {
    margin: 0 0 1rem;
    color: #666;
    line-height: 1.6;
}

.read-more {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #0073aa;
    color: #fff;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.3s ease;
}

.read-more:hover {
    background: #005a87;
}

/* Single Book Review */
.book-review-details {
    padding: 1.5rem;
    margin: 0 0 2rem;
    background: #f9f9f9;
    border-left: 4px solid #0073aa;
}

.book-meta p {
    margin: 0.5rem 0;
}

.book-rating-large {
    margin: 1rem 0 0;
    font-size: 1.1rem;
}

.book-rating-large .stars {
    color: #f39c12;
    font-size: 1.5rem;
    margin: 0 0.5rem;
}

.rating-number {
    color: #666;
    font-size: 0.95rem;
}
```

## Usage Examples

### Display All Book Reviews

```
[book_reviews]
```

### Display Fiction Book Reviews

```
[book_reviews genre="fiction" limit="5"]
```

### Display Latest 3 Reviews

```
[book_reviews limit="3" orderby="date" order="DESC"]
```

## Security Features

### 1. Nonce Verification

All meta box saves verify nonces:

```php
if (!wp_verify_nonce($_POST['book_review_details_nonce_field'], 'book_review_details_nonce')) {
    return;
}
```

### 2. Capability Checks

Only users with edit permissions can save:

```php
if (!current_user_can('edit_post', $post_id)) {
    return;
}
```

### 3. Input Sanitization

All inputs are sanitized:

```php
update_post_meta($post_id, '_book_author', sanitize_text_field($_POST['book_author']));
```

### 4. Output Escaping

All outputs are escaped:

```php
echo esc_html($author);
echo esc_url(get_permalink($post_id));
echo esc_attr($isbn);
```

### 5. Data Validation

Rating values are validated:

```php
$rating = intval($_POST['book_rating']);
if ($rating >= 1 && $rating <= 5) {
    update_post_meta($post_id, '_book_rating', $rating);
}
```

## Key Takeaways

- **Custom post types** provide structured content management
- **Custom taxonomies** enable categorization and filtering
- **Meta boxes** allow additional custom fields
- **Custom columns** improve admin list view usability
- **Shortcodes** enable flexible frontend display
- **Security** is implemented at every level (nonces, capabilities, sanitization, escaping)
- **Rewrite rules** must be flushed on activation
- **Template hierarchy** can be used for custom templates
- **REST API support** enables Gutenberg block editor integration

