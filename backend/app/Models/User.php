<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'status',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'bio',
        'avatar',
        'date_of_birth',
        'gender',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the avatar URL attribute.
     * Upload functionality removed - always returns null.
     *
     * @return string|null
     */
    public function getAvatarUrlAttribute()
    {
        return null;
    }

    /**
     * Get the roles that belong to the user.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Check if user has a specific role.
     *
     * @param string $role
     * @return bool
     */
    public function hasRole($role)
    {
        return $this->roles()
            ->where('name', $role)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Check if user has a specific permission.
     * Admin role has all permissions.
     *
     * @param string $permission
     * @return bool
     */
    public function hasPermission($permission)
    {
        // Admin role has all permissions
        if ($this->hasRole('admin')) {
            return true;
        }

        return $this->roles()
            ->where('is_active', true)
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission)
                    ->where('is_active', true);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions.
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAnyPermission($permissions)
    {
        if ($this->hasRole('admin')) {
            return true;
        }

        return $this->roles()
            ->where('is_active', true)
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('name', $permissions)
                    ->where('is_active', true);
            })
            ->exists();
    }

    /**
     * Check if user has all of the given permissions.
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAllPermissions($permissions)
    {
        if ($this->hasRole('admin')) {
            return true;
        }

        $userPermissionCount = $this->roles()
            ->where('is_active', true)
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('name', $permissions)
                    ->where('is_active', true);
            })
            ->withCount(['permissions' => function ($query) use ($permissions) {
                $query->whereIn('name', $permissions)
                    ->where('is_active', true);
            }])
            ->count();

        return $userPermissionCount >= count($permissions);
    }

    /**
     * Get all permissions for the user.
     * Admin role gets all active permissions.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllPermissions()
    {
        if ($this->hasRole('admin')) {
            return Permission::where('is_active', true)->get();
        }

        return Permission::whereHas('roles', function ($query) {
            $query->whereHas('users', function ($q) {
                $q->where('users.id', $this->id);
            })
                ->where('is_active', true);
        })
            ->where('is_active', true)
            ->distinct()
            ->get();
    }

    /**
     * Get permissions grouped by module.
     *
     * @param string|null $module
     * @return array
     */
    public function getPermissionsByModule($module = null)
    {
        $permissions = $this->getAllPermissions();

        $grouped = [];
        foreach ($permissions as $permission) {
            $mod = $permission->module ?? 'general';
            $submod = $permission->submodule ?? 'general';

            if (!isset($grouped[$mod])) {
                $grouped[$mod] = [];
            }

            if (!isset($grouped[$mod][$submod])) {
                $grouped[$mod][$submod] = [];
            }

            $grouped[$mod][$submod][] = [
                'id' => $permission->id,
                'name' => $permission->name,
                'description' => $permission->description,
                'type' => $permission->type,
            ];
        }

        if ($module) {
            return $grouped[$module] ?? [];
        }

        return $grouped;
    }
}

