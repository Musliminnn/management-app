<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Enums\RoleEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Superadmin',
            'email' => 'superadmin@gmail.com',
            'password' => '@Superadmin1',
            'role_id' => Role::where('name', RoleEnum::Superadmin->value)->first()->id,
        ]);
    }
}
