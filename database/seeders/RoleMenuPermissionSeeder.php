<?php

namespace Database\Seeders;

use App\Enums\MenuEnum;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\Menu;
use App\Models\Role;
use App\Models\RoleMenuPermission;
use Illuminate\Database\Seeder;

class RoleMenuPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Define permissions based on template CSV
        $permissions = [
            // BP / ADMIN - Full access to most menus
            RoleEnum::Admin->value => [
                MenuEnum::Dashboard->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::InputDPA->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                // Input Realisasi Belanja - no access for Admin
                MenuEnum::RiwayatTransaksi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::LaporanRealisasi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
            ],

            // PA / KPA - View and Export only
            RoleEnum::PAKPA->value => [
                MenuEnum::Dashboard->value => [
                    PermissionEnum::View,
                    PermissionEnum::Export,
                ],
                // Input DPA - no access
                // Input Realisasi Belanja - no access
                MenuEnum::RiwayatTransaksi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Export,
                ],
                MenuEnum::LaporanRealisasi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Export,
                ],
            ],

            // PPTK - View, Add, Edit, Delete, Export on Realisasi
            RoleEnum::PPTK->value => [
                MenuEnum::Dashboard->value => [
                    PermissionEnum::View,
                    PermissionEnum::Export,
                ],
                MenuEnum::InputDPA->value => [
                    PermissionEnum::Export,
                ],
                MenuEnum::InputRealisasiBelanja->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Export,
                ],
                MenuEnum::RiwayatTransaksi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Export,
                ],
                MenuEnum::LaporanRealisasi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Export,
                ],
            ],

            // BPP - View, Validate, Export
            RoleEnum::BPP->value => [
                MenuEnum::Dashboard->value => [
                    PermissionEnum::View,
                    PermissionEnum::Export,
                ],
                MenuEnum::InputDPA->value => [
                    PermissionEnum::Export,
                ],
                MenuEnum::InputRealisasiBelanja->value => [
                    PermissionEnum::View,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::RiwayatTransaksi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::LaporanRealisasi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
            ],

            // Superadmin - Full access to everything
            RoleEnum::Superadmin->value => [
                MenuEnum::Dashboard->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::InputDPA->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::InputRealisasiBelanja->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::RiwayatTransaksi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
                MenuEnum::LaporanRealisasi->value => [
                    PermissionEnum::View,
                    PermissionEnum::Add,
                    PermissionEnum::Edit,
                    PermissionEnum::Delete,
                    PermissionEnum::Validate,
                    PermissionEnum::Export,
                ],
            ],
        ];

        foreach ($permissions as $roleName => $menus) {
            $role = Role::where('name', $roleName)->first();
            if (! $role) {
                continue;
            }

            foreach ($menus as $menuName => $perms) {
                $menu = Menu::where('name', $menuName)->first();
                if (! $menu) {
                    continue;
                }

                foreach ($perms as $permission) {
                    RoleMenuPermission::firstOrCreate([
                        'role_id' => $role->id,
                        'menu_id' => $menu->id,
                        'permission' => $permission->value,
                    ]);
                }
            }
        }
    }
}
