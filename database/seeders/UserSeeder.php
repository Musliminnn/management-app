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
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@gmail.com',
                'password' => '@Superadmin1',
                'role' => RoleEnum::Superadmin,
            ],
            [
                'name' => 'BP Admin',
                'email' => 'admin@gmail.com',
                'password' => '@Admin1',
                'role' => RoleEnum::Admin,
            ],
            [
                'name' => 'PA KPA',
                'email' => 'pakpa@gmail.com',
                'password' => '@Pakpa1',
                'role' => RoleEnum::PAKPA,
            ],
            [
                'name' => 'PPTK',
                'email' => 'pptk@gmail.com',
                'password' => '@Pptk1',
                'role' => RoleEnum::PPTK,
            ],
            [
                'name' => 'BPP',
                'email' => 'bpp@gmail.com',
                'password' => '@Bpp1',
                'role' => RoleEnum::BPP,
            ],
        ];

        foreach ($users as $userData) {
            User::factory()->create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => $userData['password'],
                'role_id' => Role::where('name', $userData['role']->value)->first()->id,
            ]);
        }
    }
}
