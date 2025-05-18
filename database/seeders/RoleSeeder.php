<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Enums\RoleEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (RoleEnum::cases() as $enum) {
            Role::firstOrCreate(
                ['name' => $enum->value],
                ['label' => match ($enum) {
                    RoleEnum::Superadmin => 'Super Admin',
                    RoleEnum::Admin => 'BP / Admin',
                    RoleEnum::BPP => 'BPP Dinas/UPTD/UOBK',
                    RoleEnum::PAKPA => 'PA / KPA',
                }]
            );
        }
    }
}
