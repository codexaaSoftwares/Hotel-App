<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of permissions.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Permission::query();

        if ($request->has('module')) {
            $query->where('module', $request->module);
        }

        if ($request->has('submodule')) {
            $query->where('submodule', $request->submodule);
        }

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // SoftDeletes automatically excludes deleted records, no need for is_deleted check

        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%")
                    ->orWhere('submodule', 'like', "%{$search}%");
            });
        }

        // Group by module if requested (no pagination in this mode)
        if ($request->has('group_by_module')) {
            $permissions = $query->orderBy('module')->orderBy('submodule')->orderBy('name')->get();
            $grouped = [];
            foreach ($permissions as $permission) {
                $module = $permission->module ?? 'general';
                $submodule = $permission->submodule ?? 'general';

                if (!isset($grouped[$module])) {
                    $grouped[$module] = [];
                }

                if (!isset($grouped[$module][$submodule])) {
                    $grouped[$module][$submodule] = [];
                }

                $grouped[$module][$submodule][] = $permission;
            }

            return response()->json([
                'success' => true,
                'data' => $grouped,
            ]);
        }

        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['name', 'module', 'submodule', 'created_at'],
            ['column' => 'name', 'direction' => 'asc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        $permissions = array_map(
            static fn (Permission $permission) => $permission->toArray(),
            $paginator->items()
        );

        return response()->json([
            'success' => true,
            'data' => $permissions,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Display the specified permission.
     *
     * @param Permission $permission
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Permission $permission)
    {
        return response()->json($permission->load('roles'));
    }
}

