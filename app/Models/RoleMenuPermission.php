<?php

namespace App\Models;

use App\Enums\MenuEnum;
use App\Enums\PermissionEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoleMenuPermission extends Model
{
    protected $fillable = ['role_id', 'menu_id', 'permission'];

    protected $casts = [
        'permission' => PermissionEnum::class,
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }
}
