# PHP API Development Best Practices

## Overview

This guide provides best practices for developing RESTful APIs in PHP, including proper HTTP method usage, authentication, response formatting, versioning, and error handling.

## RESTful Design Principles

### HTTP Methods

Use HTTP methods semantically:

- **GET** - Retrieve resources (idempotent, safe)
- **POST** - Create new resources
- **PUT** - Replace entire resource
- **PATCH** - Partial update of resource
- **DELETE** - Remove resource

```php
<?php

namespace App\Controllers\Api;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserApiController
{
    // GET /api/users - List all users
    public function index(): JsonResponse
    {
        $users = User::paginate(20);
        
        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'total' => $users->total(),
                'per_page' => $users->perPage()
            ],
            'links' => [
                'self' => url('/api/users'),
                'next' => $users->nextPageUrl(),
                'prev' => $users->previousPageUrl()
            ]
        ]);
    }
    
    // GET /api/users/{id} - Get single user
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        return response()->json([
            'data' => $user,
            'links' => [
                'self' => url("/api/users/{$id}"),
                'posts' => url("/api/users/{$id}/posts")
            ]
        ]);
    }
    
    // POST /api/users - Create new user
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users'
        ]);
        
        $user = User::create($validated);
        
        return response()->json([
            'data' => $user,
            'message' => 'User created successfully'
        ], 201);
    }
    
    // PUT /api/users/{id} - Replace entire user
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id
        ]);
        
        $user->update($validated);
        
        return response()->json([
            'data' => $user,
            'message' => 'User updated successfully'
        ]);
    }
    
    // PATCH /api/users/{id} - Partial update
    public function patch(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id
        ]);
        
        $user->update($validated);
        
        return response()->json([
            'data' => $user
        ]);
    }
    
    // DELETE /api/users/{id} - Delete user
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        
        return response()->json([
            'message' => 'User deleted successfully'
        ], 204);
    }
}
```

### Resource Naming

**Use plural nouns** for resource names:

```
✅ Good:
GET    /api/users
GET    /api/users/123
GET    /api/users/123/posts
POST   /api/posts

❌ Bad:
GET    /api/getUsers
GET    /api/user/123
POST   /api/createPost
```

## API Versioning

### URL-Based Versioning

```php
<?php

// routes/api.php
Route::prefix('v1')->group(function () {
    Route::apiResource('users', UserApiController::class);
    Route::apiResource('posts', PostApiController::class);
});

Route::prefix('v2')->group(function () {
    Route::apiResource('users', V2\UserApiController::class);
    Route::apiResource('posts', V2\PostApiController::class);
});

// URLs:
// /api/v1/users
// /api/v2/users
```

### Header-Based Versioning

```php
<?php

// Middleware to handle API versioning
class ApiVersion
{
    public function handle(Request $request, Closure $next)
    {
        $version = $request->header('Accept-Version', 'v1');
        
        $request->attributes->set('api_version', $version);
        
        return $next($request);
    }
}
```

## Authentication

### JWT Authentication

```php
<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuthController
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
        
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'error' => 'Invalid credentials'
            ], 401);
        }
        
        $user = Auth::user();
        $token = $this->generateToken($user);
        
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 3600
        ]);
    }
    
    private function generateToken(User $user): string
    {
        $payload = [
            'iss' => config('app.url'),
            'sub' => $user->id,
            'iat' => time(),
            'exp' => time() + 3600
        ];
        
        return JWT::encode($payload, config('jwt.secret'), 'HS256');
    }
}
```

### API Token Authentication

```php
<?php

// Middleware
class AuthenticateApiToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 401);
        }
        
        $user = User::where('api_token', hash('sha256', $token))->first();
        
        if (!$user) {
            return response()->json([
                'error' => 'Invalid token'
            ], 401);
        }
        
        Auth::setUser($user);

        return $next($request);
    }
}
```

## Response Formatting

### Consistent Response Structure

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'links' => [
                'self' => url("/api/users/{$this->id}"),
                'posts' => url("/api/users/{$this->id}/posts")
            ]
        ];
    }
}

// Usage in controller
public function show(int $id): JsonResponse
{
    $user = User::findOrFail($id);
    return new UserResource($user);
}
```

### HTTP Status Codes

Use appropriate status codes:

```php
<?php

// Success responses
return response()->json($data, 200);  // OK
return response()->json($data, 201);  // Created
return response()->json(null, 204);   // No Content

// Client error responses
return response()->json(['error' => 'Bad Request'], 400);
return response()->json(['error' => 'Unauthorized'], 401);
return response()->json(['error' => 'Forbidden'], 403);
return response()->json(['error' => 'Not Found'], 404);
return response()->json(['error' => 'Validation Failed'], 422);

// Server error responses
return response()->json(['error' => 'Internal Server Error'], 500);
return response()->json(['error' => 'Service Unavailable'], 503);
```

### Error Response Format

```php
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($request->is('api/*')) {
            return $this->handleApiException($request, $exception);
        }

        return parent::render($request, $exception);
    }

    private function handleApiException($request, Throwable $exception)
    {
        if ($exception instanceof ValidationException) {
            return response()->json([
                'error' => 'Validation failed',
                'message' => $exception->getMessage(),
                'errors' => $exception->errors()
            ], 422);
        }

        if ($exception instanceof NotFoundHttpException) {
            return response()->json([
                'error' => 'Resource not found',
                'message' => 'The requested resource does not exist'
            ], 404);
        }

        return response()->json([
            'error' => 'Server error',
            'message' => config('app.debug') ? $exception->getMessage() : 'An error occurred'
        ], 500);
    }
}
```

## Pagination

### Implementing Pagination

```php
<?php

public function index(Request $request): JsonResponse
{
    $perPage = $request->input('per_page', 20);
    $users = User::paginate($perPage);

    return response()->json([
        'data' => UserResource::collection($users),
        'meta' => [
            'current_page' => $users->currentPage(),
            'from' => $users->firstItem(),
            'to' => $users->lastItem(),
            'total' => $users->total(),
            'per_page' => $users->perPage(),
            'last_page' => $users->lastPage()
        ],
        'links' => [
            'first' => $users->url(1),
            'last' => $users->url($users->lastPage()),
            'prev' => $users->previousPageUrl(),
            'next' => $users->nextPageUrl()
        ]
    ]);
}
```

## Rate Limiting

### Implementing Rate Limits

```php
<?php

// routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    Route::apiResource('users', UserApiController::class);
});

// Custom rate limiter
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Different limits for authenticated vs guest
RateLimiter::for('api', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(100)->by($request->user()->id)
        : Limit::perMinute(20)->by($request->ip());
});
```

## Best Practices

### ✅ DO

- Use API resources for consistent response formatting
- Implement proper authentication (JWT, OAuth 2.0)
- Use rate limiting to prevent abuse
- Version your API from the start
- Return appropriate HTTP status codes
- Implement HATEOAS links in responses
- Use pagination for list endpoints
- Validate all input data
- Log API requests and errors
- Document your API (OpenAPI/Swagger)
- Use HTTPS in production
- Implement proper CORS configuration

### ❌ DON'T

- Return HTML from API endpoints
- Use sessions for API authentication
- Expose internal error details in production
- Use GET requests for state-changing operations
- Return different response structures for same endpoint
- Ignore API versioning
- Allow unlimited requests (no rate limiting)
- Use verbs in endpoint URLs
- Return 200 OK for errors
- Expose sensitive data in responses

## Security Checklist

- [ ] Authentication required for protected endpoints
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] API tokens stored securely (hashed)
- [ ] Sensitive data not exposed in responses
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS prevention (proper encoding)
- [ ] CSRF protection (for cookie-based auth)
- [ ] Request size limits enforced
- [ ] Proper error handling (no stack traces in production)
