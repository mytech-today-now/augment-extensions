# Performance Optimization

## Overview

Performance optimization is crucial for scalable PHP applications. This document defines best practices for opcode caching, database optimization, and caching strategies.

---

## Opcode Caching

### Enable OPcache

**Rules:**
- OPcache MUST be enabled in production
- Configure OPcache settings appropriately
- Avoid file-based caching in favor of memory caching

**Configuration (php.ini):**
```ini
; ✅ Good - Production OPcache settings
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0  ; Disable in production
opcache.revalidate_freq=0
opcache.fast_shutdown=1
```

**Deployment:**
```php
// ✅ Good - Clear OPcache on deployment
opcache_reset();
```

---

## Database Query Optimization

### Avoid N+1 Query Problems

**Rules:**
- Use eager loading for related data
- Avoid queries inside loops
- Use joins or batch loading

**Examples:**
```php
// ✅ Good - Eager loading
$users = User::with('posts', 'comments')->get();
foreach ($users as $user) {
    echo $user->posts->count();  // No additional query
}

// ✅ Good - Batch loading
$userIds = [1, 2, 3, 4, 5];
$users = User::whereIn('id', $userIds)->get();

// ❌ Bad - N+1 problem
$users = User::all();
foreach ($users as $user) {
    echo $user->posts()->count();  // Query for each user!
}
```

### Use Indexes

**Rules:**
- Add indexes to frequently queried columns
- Use composite indexes for multi-column queries
- Avoid over-indexing (impacts write performance)

**Examples:**
```php
// ✅ Good - Migration with indexes
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();  // Index for unique constraint
    $table->string('username')->index();  // Index for searches
    $table->timestamp('created_at')->index();  // Index for sorting
    $table->index(['status', 'created_at']);  // Composite index
});
```

### Optimize Query Selection

**Rules:**
- Select only needed columns
- Use `exists()` instead of `count()` for existence checks
- Limit result sets appropriately

**Examples:**
```php
// ✅ Good - Select specific columns
$users = User::select('id', 'name', 'email')->get();

// ✅ Good - Check existence
if (User::where('email', $email)->exists()) {
    // Email exists
}

// ✅ Good - Limit results
$recentPosts = Post::orderBy('created_at', 'desc')->limit(10)->get();

// ❌ Bad - Select all columns
$users = User::all();  // Loads all columns

// ❌ Bad - Count for existence
if (User::where('email', $email)->count() > 0) {  // Slower than exists()
    // Email exists
}
```

### Use Query Caching

**Rules:**
- Cache frequently accessed query results
- Invalidate cache when data changes
- Use appropriate cache TTL

**Examples:**
```php
// ✅ Good - Cache query results
$users = Cache::remember('active_users', 3600, function () {
    return User::where('status', 'active')->get();
});

// ✅ Good - Invalidate cache on update
function updateUser(User $user, array $data): User
{
    $user->update($data);
    Cache::forget('active_users');
    return $user;
}
```

---

## Caching Strategies

### Use Memory Caching

**Rules:**
- Use Redis or Memcached for distributed caching
- Avoid file-based caching in production
- Implement cache warming for critical data

**Examples:**
```php
// ✅ Good - Redis caching
use Illuminate\Support\Facades\Redis;

function getUserPreferences(int $userId): array
{
    $cacheKey = "user_prefs:{$userId}";
    
    $cached = Redis::get($cacheKey);
    if ($cached !== null) {
        return json_decode($cached, true);
    }
    
    $prefs = $this->loadPreferencesFromDb($userId);
    Redis::setex($cacheKey, 3600, json_encode($prefs));
    
    return $prefs;
}

// ✅ Good - Cache warming
function warmCache(): void
{
    $popularProducts = Product::orderBy('views', 'desc')->limit(100)->get();
    
    foreach ($popularProducts as $product) {
        Cache::put("product:{$product->id}", $product, 3600);
    }
}
```

### Cache Invalidation

**Rules:**
- Define clear cache invalidation strategy
- Use cache tags for grouped invalidation
- Implement versioned cache keys

**Examples:**
```php
// ✅ Good - Cache tags (Laravel)
Cache::tags(['users', 'active'])->put('active_users', $users, 3600);
Cache::tags(['users'])->flush();  // Invalidate all user caches

// ✅ Good - Versioned cache keys
function getCacheKey(string $key): string
{
    $version = config('cache.version', 1);
    return "{$key}:v{$version}";
}

$data = Cache::get(getCacheKey('user_stats'));
```

### Cache Namespacing

**Rules:**
- Namespace cache keys to avoid collisions
- Include relevant identifiers in keys
- Use consistent key naming conventions

**Examples:**
```php
// ✅ Good - Namespaced keys
$userKey = "user:{$userId}:profile";
$orderKey = "order:{$orderId}:items";
$statsKey = "stats:daily:{$date}";

// ❌ Bad - Generic keys
$key = "profile";  // Collision risk
$key = "items";  // Collision risk
```

---

## Code Optimization

### Avoid Unnecessary Computations

**Rules:**
- Cache computed values
- Avoid repeated function calls in loops
- Use lazy loading when appropriate

**Examples:**
```php
// ✅ Good - Cache computed value
$count = count($items);
for ($i = 0; $i < $count; $i++) {
    // Process item
}

// ✅ Good - Lazy loading
class Report
{
    private ?array $data = null;
    
    public function getData(): array
    {
        if ($this->data === null) {
            $this->data = $this->loadData();
        }
        return $this->data;
    }
}

// ❌ Bad - Repeated computation
for ($i = 0; $i < count($items); $i++) {  // count() called each iteration
    // Process item
}
```

### Use Efficient Data Structures

**Rules:**
- Use arrays for indexed access
- Use `isset()` instead of `array_key_exists()` when possible
- Use generators for large datasets

**Examples:**
```php
// ✅ Good - Generator for large dataset
function readLargeFile(string $path): Generator
{
    $handle = fopen($path, 'r');
    
    while (($line = fgets($handle)) !== false) {
        yield $line;
    }
    
    fclose($handle);
}

foreach (readLargeFile('large.txt') as $line) {
    // Process line without loading entire file
}

// ✅ Good - isset() for existence check
if (isset($array[$key])) {
    // Key exists
}

// ❌ Bad - Load entire file into memory
$lines = file('large.txt');  // Memory intensive
```

### Optimize String Operations

**Rules:**
- Use single quotes for simple strings
- Use string interpolation instead of concatenation
- Use `implode()` for joining arrays

**Examples:**
```php
// ✅ Good - Single quotes (faster)
$name = 'John Doe';

// ✅ Good - String interpolation
$message = "Hello, {$name}!";

// ✅ Good - implode() for arrays
$parts = ['Hello', 'World'];
$result = implode(' ', $parts);

// ❌ Bad - Concatenation in loop
$result = '';
foreach ($items as $item) {
    $result .= $item . ', ';  // Creates new string each iteration
}

// ✅ Better - Build array then implode
$parts = [];
foreach ($items as $item) {
    $parts[] = $item;
}
$result = implode(', ', $parts);
```

---

## Asset Optimization

### Minimize HTTP Requests

**Rules:**
- Combine CSS and JavaScript files
- Use asset bundlers (Webpack, Vite)
- Implement HTTP/2 server push when beneficial

### Enable Compression

**Rules:**
- Enable gzip/brotli compression
- Compress responses at web server level

**Configuration (Apache .htaccess):**
```apache
# ✅ Good - Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### Use CDN for Static Assets

**Rules:**
- Serve static assets from CDN
- Use versioned asset URLs for cache busting

**Examples:**
```php
// ✅ Good - CDN with versioning
function assetUrl(string $path): string
{
    $version = config('app.version');
    $cdnUrl = config('app.cdn_url');
    return "{$cdnUrl}/{$path}?v={$version}";
}
```

---

## Profiling and Monitoring

### Use Profiling Tools

**Tools:**
- Xdebug profiler
- Blackfire.io
- New Relic
- Tideways

**Examples:**
```php
// ✅ Good - Manual profiling
$start = microtime(true);

// Code to profile
processData($data);

$duration = microtime(true) - $start;
logger()->info('Processing time', ['duration' => $duration]);
```

