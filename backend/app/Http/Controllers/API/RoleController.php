<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of roles.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Role::with('permissions');

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // SoftDeletes automatically excludes deleted records, no need for is_deleted check

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'description', 'created_at'],
            ['column' => 'created_at', 'direction' => 'desc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $roles = array_map(
            static function (Role $role) {
                return $role->toArray();
            },
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $roles,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created role.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $permissions = $validated['permissions'] ?? null;
        unset($validated['permissions']);

        if (!array_key_exists('is_active', $validated)) {
            $validated['is_active'] = true;
        }

        // Check if role exists (including soft-deleted ones)
        $existingRole = Role::withTrashed()->where('name', $validated['name'])->first();

        if ($existingRole) {
            // If role is soft-deleted, restore it and update
            if ($existingRole->trashed()) {
                $existingRole->restore();
                $existingRole->fill([
                    'description' => $validated['description'] ?? $existingRole->description,
                    'is_active' => $validated['is_active'] ?? $existingRole->is_active ?? true,
                ]);
                $existingRole->save();

                if (is_array($permissions)) {
                    $existingRole->permissions()->sync($permissions);
                }

                return response()->json($existingRole->load('permissions'), 200);
            }

            return response()->json([
                'message' => 'A role with this name already exists.',
                'errors' => [
                    'name' => ['The role name must be unique.'],
                ],
            ], 422);
        }

        $role = Role::create($validated);

        if (is_array($permissions)) {
            $role->permissions()->sync($permissions);
        }

        return response()->json($role->load('permissions'), 201);
    }

    /**
     * Display the specified role.
     *
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Role $role)
    {
        return response()->json($role->load('permissions'));
    }

    /**
     * Update the specified role.
     *
     * @param Request $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')
                    ->ignore($role->id)
                    ->whereNull('deleted_at'),
            ],
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $role->update($validated);

        return response()->json($role->load('permissions'));
    }

    /**
     * Update role permissions.
     *
     * @param Request $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($validated['permissions']);

        return response()->json($role->load('permissions'));
    }

    /**
     * Remove the specified role.
     *
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Role $role)
    {
        $role->delete(); // SoftDeletes trait handles soft deletion

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully',
        ]);
    }
}

