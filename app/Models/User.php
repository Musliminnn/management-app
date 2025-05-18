<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\RoleEnum;

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
}
