<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\MenuEnum;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $with = ['role'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasRole(RoleEnum $role): bool
    {
        return $this->role?->name === $role->value;
    }

    public function isSuperadmin(): bool
    {
        return $this->hasRole(RoleEnum::Superadmin);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(RoleEnum::Admin);
    }

    public function isBpp(): bool
    {
        return $this->hasRole(RoleEnum::BPP);
    }

    public function isPaKpa(): bool
    {
        return $this->hasRole(RoleEnum::PAKPA);
    }

    public function isPptk(): bool
    {
        return $this->hasRole(RoleEnum::PPTK);
    }

    public function hasPermission(MenuEnum|string $menu, PermissionEnum|string $permission): bool
    {
        if (! $this->role) {
            return false;
        }

        return $this->role->hasPermission($menu, $permission);
    }

    public function canView(MenuEnum|string $menu): bool
    {
        return $this->hasPermission($menu, PermissionEnum::View);
    }

    public function canAdd(MenuEnum|string $menu): bool
    {
        return $this->hasPermission($menu, PermissionEnum::Add);
    }

    public function canEdit(MenuEnum|string $menu): bool
    {
        return $this->hasPermission($menu, PermissionEnum::Edit);
    }

    public function canDelete(MenuEnum|string $menu): bool
    {
        return $this->hasPermission($menu, PermissionEnum::Delete);
    }

    public function canValidate(MenuEnum|string $menu): bool
    {
        return $this->hasPermission($menu, PermissionEnum::Validate);
    }

    public function canExport(MenuEnum|string $menu): bool
    {
        return $this->hasPermission($menu, PermissionEnum::Export);
    }

    public function getMenuPermissions(MenuEnum|string $menu): array
    {
        if (! $this->role) {
            return [];
        }

        $menuName = $menu instanceof MenuEnum ? $menu->value : $menu;

        return $this->role->menuPermissions()
            ->whereHas('menu', fn($q) => $q->where('name', $menuName))
            ->pluck('permission')
            ->map(fn($p) => $p instanceof PermissionEnum ? $p->value : $p)
            ->toArray();
    }
}
