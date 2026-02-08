<?php

namespace App\Models;

use App\Enums\MenuEnum;
use App\Enums\PermissionEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['name', 'label'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function menuPermissions(): HasMany
    {
        return $this->hasMany(RoleMenuPermission::class);
    }

    public function hasPermission(MenuEnum|string $menu, PermissionEnum|string $permission): bool
    {
        $menuName = $menu instanceof MenuEnum ? $menu->value : $menu;
        $permissionName = $permission instanceof PermissionEnum ? $permission->value : $permission;

        return $this->menuPermissions()
            ->whereHas('menu', fn($q) => $q->where('name', $menuName))
            ->where('permission', $permissionName)
            ->exists();
    }
}
