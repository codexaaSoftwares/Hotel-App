<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    use PaginatesResults;


    /**
     * Format user data with avatar URL.
     *
     * @param User $user
     * @return array
     */
    protected function formatUserData(User $user)
    {
        // Get raw attributes to avoid accessor interference
        $userData = $user->getAttributes();
        $userData['roles'] = $user->roles->toArray();
        $userData['created_at'] = $user->created_at;
        $userData['updated_at'] = $user->updated_at;
        
        // Handle avatar URL
        $avatarPath = $userData['avatar'] ?? null;
        $avatarUrl = null;
        
        if ($avatarPath) {
            // Generate storage URL with correct backend path
            $avatarUrl = $this->getStorageUrl($avatarPath);
        }
        
        $userData['avatar_url'] = $avatarUrl;
        $userData['avatar'] = $avatarPath; // Keep relative path
        
        return $userData;
    }

    /**
     * Generate storage URL with correct backend path.
     * Handles subdirectory installations like /admin/api
     *
     * @param string $relativePath Relative path from storage/app/public (e.g., 'avatars/file.png')
     * @return string Full URL to the storage file
     */
    protected function getStorageUrl(string $relativePath): string
    {
        $appUrl = rtrim(config('app.url'), '/');
        
        // Extract domain from APP_URL
        $parsedUrl = parse_url($appUrl);
        $domain = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? 'lvclicks.in');
        
        // Check if APP_URL includes /api
        if (str_contains($appUrl, '/api')) {
            return $appUrl . '/storage/' . $relativePath;
        }
        
        // If APP_URL ends with /admin, add /api before /storage
        if (str_ends_with($appUrl, '/admin')) {
            return $domain . '/admin/api/storage/' . $relativePath;
        }
        
        // If APP_URL contains /admin but doesn't end with it, check path
        if (str_contains($appUrl, '/admin')) {
            // Extract path from APP_URL
            $path = $parsedUrl['path'] ?? '';
            // If path is /admin, add /api
            if ($path === '/admin') {
                return $domain . '/admin/api/storage/' . $relativePath;
            }
            // Otherwise use APP_URL as is
            return $appUrl . '/storage/' . $relativePath;
        }
        
        // Default: append /storage/ to APP_URL
        return $appUrl . '/storage/' . $relativePath;
    }

    /**
     * Display a listing of users.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($role = $request->input('role')) {
            $query->whereHas('roles', function ($roleQuery) use ($role) {
                if (is_numeric($role)) {
                    $roleQuery->where('id', (int) $role);
                } else {
                    $roleQuery->where('name', $role);
                }
            });
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['first_name', 'last_name', 'email', 'created_at', 'status'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $users = array_map(
            function (User $user) {
                return $this->formatUserData($user);
            },
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $users,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'bio' => 'nullable|string',
            'roles' => 'nullable|array',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['status'] = $validated['status'] ?? 'active';

        $user = User::create($validated);

        $roleIds = $this->normalizeRoleIds($request->input('roles', []));
        if (!empty($roleIds)) {
            $user->roles()->sync($roleIds);
        }

        $user->load('roles');
        return response()->json($this->formatUserData($user), 201);
    }

    /**
     * Display the specified user.
     *
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(User $user)
    {
        $user->load('roles');
        return response()->json($this->formatUserData($user));
    }

    /**
     * Update the specified user.
     *
     * @param Request $request
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:active,inactive',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'bio' => 'nullable|string',
            'roles' => 'nullable|array',
        ]);

        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $rolesInput = $request->input('roles', null);
        $user->update($validated);

        if (!is_null($rolesInput)) {
            $roleIds = $this->normalizeRoleIds($rolesInput);
            $user->roles()->sync($roleIds);
        }

        $user->load('roles');
        return response()->json($this->formatUserData($user));
    }

    /**
     * Remove the specified user.
     *
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get current authenticated user profile.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile(Request $request)
    {
        $user = $request->user()->load('roles');
        
        return response()->json([
            'success' => true,
            'data' => $this->formatUserData($user),
        ]);
    }

    /**
     * Update current authenticated user profile.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string',
            'bio' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other,prefer-not-to-say',
        ]);

        // Avatar upload is handled separately via uploadAvatar endpoint
        if ($request->has('avatar')) {
            unset($validated['avatar']);
        }

        // Only update fields that are present in the request
        // Convert empty strings to null for nullable fields
        $updateData = [];
        $nullableFields = ['date_of_birth', 'gender', 'bio', 'address', 'city', 'state', 'zip_code', 'country', 'phone'];
        
        foreach ($validated as $key => $value) {
            // Convert empty strings to null for nullable fields
            if (in_array($key, $nullableFields) && $value === '') {
                $updateData[$key] = null;
            } else {
                $updateData[$key] = $value;
            }
        }
        
        $user->update($updateData);

        // Reload user to get fresh data
        $user->refresh();
        $user->load('roles');

        return response()->json([
            'success' => true,
            'data' => $this->formatUserData($user),
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Upload profile avatar.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadAvatar(Request $request)
    {
        try {
            $user = $request->user();
            
            $validated = $request->validate([
                'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048', // 2MB max
            ]);

            // Delete old avatar if exists
            if ($user->avatar) {
                $oldPath = storage_path('app/public/' . $user->avatar);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Store new avatar
            $file = $request->file('avatar');
            $filename = 'avatar_user_' . $user->id . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/avatars', $filename);
            
            // Get relative path for storage (without 'public/' prefix)
            $relativePath = 'avatars/' . $filename;

            // Update user avatar
            $user->avatar = $relativePath;
            $user->save();

            // Generate storage URL with correct backend path
            $avatarUrl = $this->getStorageUrl($relativePath);

            // Reload user to get fresh data
            $user->refresh();
            $user->load('roles');

            return response()->json([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'data' => $this->formatUserData($user),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Avatar upload error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete profile avatar.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAvatar(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->avatar) {
                // Delete the avatar file from storage
                $avatarPath = storage_path('app/public/' . $user->avatar);
                if (file_exists($avatarPath)) {
                    @unlink($avatarPath);
                }
            }

            // Remove avatar from user
            $user->avatar = null;
            $user->save();

            // Reload user to get fresh data
            $user->refresh();
            $user->load('roles');

            return response()->json([
                'success' => true,
                'message' => 'Avatar deleted successfully',
                'data' => $this->formatUserData($user),
            ]);
        } catch (\Exception $e) {
            \Log::error('Avatar deletion error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete avatar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Normalize role identifiers (IDs or names) into role IDs.
     *
     * @param array $roles
     * @return array
     *
     * @throws ValidationException
     */
    protected function normalizeRoleIds($roles)
    {
        if (empty($roles)) {
            return [];
        }

        $roles = is_array($roles) ? $roles : [$roles];

        $resolvedIds = collect($roles)
            ->map(function ($role) {
                if (is_numeric($role)) {
                    return Role::notDeleted()->where('is_active', true)->where('id', (int) $role)->value('id');
                }

                return Role::notDeleted()->where('is_active', true)->where('name', $role)->value('id');
            });

        if ($resolvedIds->contains(null)) {
            throw ValidationException::withMessages([
                'roles' => ['One or more roles are invalid or inactive.'],
            ]);
        }

        return $resolvedIds
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}

