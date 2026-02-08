<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = ['name', 'label'];

    public function roleMenuPermissions(): HasMany
    {
        return $this->hasMany(RoleMenuPermission::class);
    }
}
