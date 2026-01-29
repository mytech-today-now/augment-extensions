# PHP Web Applications Best Practices

## Overview

This guide provides best practices for developing PHP web applications using MVC architecture, modern frameworks (Laravel, Symfony), templating engines, and secure form handling.

## MVC Architecture

### Controllers

**Keep controllers thin** - Controllers should delegate business logic to services.

```php
<?php

namespace App\Controllers;

use App\Services\UserService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UserController
{
    public function __construct(
        private UserService $userService
    ) {}
    
    public function index(): Response
    {
        // Thin controller - delegates to service
        $users = $this->userService->getAllUsers();
        
        return $this->render('users/index', [
            'users' => $users
        ]);
    }
    
    public function store(Request $request): Response
    {
        // Validate and delegate
        $validated = $this->validate($request, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users'
        ]);
        
        $user = $this->userService->createUser($validated);
        
        return $this->redirect('/users/' . $user->id);
    }
}
```

### Models

**Models handle data logic** - Use Eloquent ORM or Doctrine for database interactions.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
    
    protected $hidden = ['password', 'remember_token'];
    
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean'
    ];
    
    // Relationships
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
    
    // Accessors
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
    
    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

### Views

**Minimal logic in views** - Use template engines with auto-escaping.

```php
<!-- Blade Template (Laravel) -->
@extends('layouts.app')

@section('content')
    <h1>{{ $title }}</h1>
    
    @foreach($users as $user)
        <div class="user-card">
            <h2>{{ $user->name }}</h2>
            <p>{{ $user->email }}</p>
            
            @if($user->is_active)
                <span class="badge badge-success">Active</span>
            @else
                <span class="badge badge-danger">Inactive</span>
            @endif
        </div>
    @endforeach
@endsection
```

## Routing

### RESTful Routes

```php
<?php

use App\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// RESTful resource routes
Route::resource('users', UserController::class);

// Generates:
// GET    /users           -> index()
// GET    /users/create    -> create()
// POST   /users           -> store()
// GET    /users/{id}      -> show()
// GET    /users/{id}/edit -> edit()
// PUT    /users/{id}      -> update()
// DELETE /users/{id}      -> destroy()

// Route model binding
Route::get('/users/{user}', function (User $user) {
    return view('users.show', ['user' => $user]);
});

// Route groups with middleware
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::resource('posts', PostController::class);
});
```

## Template Engines

### Twig (Symfony)

```php
<?php

// Controller
return $this->render('user/profile.html.twig', [
    'user' => $user,
    'posts' => $posts
]);
```

```twig
{# Template: user/profile.html.twig #}
{% extends 'base.html.twig' %}

{% block title %}{{ user.name }} - Profile{% endblock %}

{% block content %}
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
    
    {# Auto-escaping enabled by default #}
    <div>{{ user.bio }}</div>
    
    {# Raw output (use with caution) #}
    <div>{{ user.html_content|raw }}</div>
    
    {# Loops #}
    {% for post in posts %}
        <article>
            <h2>{{ post.title }}</h2>
            <p>{{ post.excerpt }}</p>
        </article>
    {% endfor %}
{% endblock %}
```

### Blade (Laravel)

```php
{{-- Template inheritance --}}
@extends('layouts.app')

@section('title', 'User Profile')

@section('content')
    <h1>{{ $user->name }}</h1>
    
    {{-- Components --}}
    <x-alert type="success">
        Profile updated successfully!
    </x-alert>
    
    {{-- Directives --}}
    @auth
        <a href="/profile/edit">Edit Profile</a>
    @endauth

    @include('partials.user-stats', ['user' => $user])
@endsection
```

## Form Handling

### CSRF Protection

**Always use CSRF tokens** for forms.

```php
<!-- Blade -->
<form method="POST" action="/users">
    @csrf
    <input type="text" name="name" value="{{ old('name') }}">
    <button type="submit">Submit</button>
</form>

<!-- Twig -->
<form method="post" action="{{ path('user_create') }}">
    <input type="hidden" name="_token" value="{{ csrf_token('user_create') }}">
    <input type="text" name="name">
    <button type="submit">Submit</button>
</form>
```

### Form Validation

**Use dedicated validation classes** (Form Requests in Laravel).

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'age' => 'nullable|integer|min:18|max:120',
            'role' => 'required|in:user,admin,moderator'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please provide your name',
            'email.unique' => 'This email is already registered',
            'password.min' => 'Password must be at least 8 characters'
        ];
    }
}

// Controller usage
public function store(StoreUserRequest $request)
{
    // Validation already passed
    $validated = $request->validated();

    $user = User::create($validated);

    return redirect('/users')->with('success', 'User created!');
}
```

### Displaying Validation Errors

```php
<!-- Blade -->
@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<!-- Field-specific errors -->
<input type="text" name="email" value="{{ old('email') }}"
       class="@error('email') is-invalid @enderror">
@error('email')
    <span class="error">{{ $message }}</span>
@enderror
```

## Middleware

### Creating Middleware

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        if (!$request->user() || !$request->user()->hasRole($role)) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}

// Usage in routes
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'index']);
});
```

## Session Management

### Using Sessions

```php
<?php

// Store data
session(['key' => 'value']);
$request->session()->put('user_id', $user->id);

// Retrieve data
$value = session('key');
$userId = $request->session()->get('user_id');

// Flash data (available for next request only)
$request->session()->flash('status', 'Task was successful!');

// Regenerate session ID (after login)
$request->session()->regenerate();

// Destroy session (logout)
$request->session()->invalidate();
```

## Best Practices

### ✅ DO

- Use route model binding for automatic model injection
- Implement middleware for cross-cutting concerns (auth, logging, CORS)
- Use service classes for complex business logic
- Leverage dependency injection for testability
- Use database migrations for schema management
- Implement proper error handling and logging
- Use environment variables for configuration
- Enable HTTPS in production
- Implement rate limiting for public endpoints
- Use queues for long-running tasks

### ❌ DON'T

- Put business logic in controllers or views
- Use raw SQL queries without parameter binding
- Store sensitive data in sessions without encryption
- Disable CSRF protection
- Use `extract()` on user input
- Echo user input without escaping
- Use `eval()` or similar dangerous functions
- Hardcode credentials or API keys
- Ignore validation errors
- Use global variables for state management

## Security Checklist

- [ ] CSRF tokens on all forms
- [ ] Input validation on all user data
- [ ] Output escaping in all views
- [ ] Prepared statements for database queries
- [ ] HTTPS enforced in production
- [ ] Secure session configuration (httponly, secure flags)
- [ ] Password hashing with bcrypt/argon2
- [ ] Rate limiting on authentication endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload validation
- [ ] Proper error handling (don't expose stack traces)

## Performance Tips

- Use eager loading to avoid N+1 queries
- Implement caching for frequently accessed data
- Use database indexes on frequently queried columns
- Optimize images and assets
- Enable OPcache in production
- Use CDN for static assets
- Implement database query logging in development
- Use pagination for large datasets
- Minimize middleware stack
- Use lazy loading for heavy resources

