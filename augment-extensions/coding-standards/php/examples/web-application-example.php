<?php

/**
 * Web Application Example - Laravel User Authentication Module
 * 
 * This example demonstrates best practices for PHP web applications including:
 * - MVC architecture with thin controllers
 * - Eloquent ORM for database interactions
 * - Form validation with Form Requests
 * - Middleware for authentication and authorization
 * - Blade templating with auto-escaping
 * - CSRF protection
 * - Session management
 */

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

/**
 * User Controller - Thin controller delegating to service layer
 */
class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {
        $this->middleware('auth');
        $this->middleware('can:manage-users')->except(['index', 'show']);
    }
    
    /**
     * Display a listing of users
     */
    public function index(Request $request): View
    {
        $users = $this->userService->getPaginatedUsers(
            perPage: $request->input('per_page', 20),
            search: $request->input('search')
        );
        
        return view('users.index', [
            'users' => $users,
            'search' => $request->input('search')
        ]);
    }
    
    /**
     * Show the form for creating a new user
     */
    public function create(): View
    {
        return view('users.create', [
            'roles' => $this->userService->getAvailableRoles()
        ]);
    }
    
    /**
     * Store a newly created user
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = $this->userService->createUser($request->validated());
        
        return redirect()
            ->route('users.show', $user)
            ->with('success', 'User created successfully!');
    }
    
    /**
     * Display the specified user
     */
    public function show(int $id): View
    {
        $user = $this->userService->findUserById($id);
        
        return view('users.show', ['user' => $user]);
    }
    
    /**
     * Show the form for editing the specified user
     */
    public function edit(int $id): View
    {
        $user = $this->userService->findUserById($id);
        
        return view('users.edit', [
            'user' => $user,
            'roles' => $this->userService->getAvailableRoles()
        ]);
    }
    
    /**
     * Update the specified user
     */
    public function update(UpdateUserRequest $request, int $id): RedirectResponse
    {
        $user = $this->userService->updateUser($id, $request->validated());
        
        return redirect()
            ->route('users.show', $user)
            ->with('success', 'User updated successfully!');
    }
    
    /**
     * Remove the specified user
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->userService->deleteUser($id);
        
        return redirect()
            ->route('users.index')
            ->with('success', 'User deleted successfully!');
    }
}

// ============================================================================
// Form Request - Validation Logic
// ============================================================================

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'role' => ['required', Rule::in(['user', 'admin', 'moderator'])],
            'is_active' => 'boolean'
        ];
    }
    
    public function messages(): array
    {
        return [
            'name.required' => 'Please provide a name for the user',
            'email.unique' => 'This email address is already registered',
            'password.min' => 'Password must be at least 8 characters long'
        ];
    }
}

// ============================================================================
// Service Layer - Business Logic
// ============================================================================

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(
        private UserRepository $userRepository
    ) {}
    
    public function getPaginatedUsers(int $perPage = 20, ?string $search = null): LengthAwarePaginator
    {
        return $this->userRepository->paginate($perPage, $search);
    }
    
    public function findUserById(int $id): User
    {
        return $this->userRepository->findOrFail($id);
    }
    
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
                'is_active' => $data['is_active'] ?? true
            ]);
            
            // Send welcome email
            $user->sendWelcomeEmail();
            
            // Log activity
            activity()
                ->performedOn($user)
                ->log('User created');
            
            return $user;
        });
    }
}

