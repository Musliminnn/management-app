<?php

namespace App\Http\Middleware;

use App\Enums\MenuEnum;
use App\Enums\PermissionEnum;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $this->getUserPermissions($request),
            ],
        ];
    }

    /**
     * Get user permissions grouped by menu.
     */
    protected function getUserPermissions(Request $request): array
    {
        $user = $request->user();

        if (! $user || ! $user->role) {
            return [];
        }

        $permissions = [];

        foreach (MenuEnum::cases() as $menu) {
            $menuPermissions = [];
            foreach (PermissionEnum::cases() as $permission) {
                if ($user->hasPermission($menu, $permission)) {
                    $menuPermissions[] = $permission->value;
                }
            }
            if (! empty($menuPermissions)) {
                $permissions[$menu->value] = $menuPermissions;
            }
        }

        return $permissions;
    }
}
