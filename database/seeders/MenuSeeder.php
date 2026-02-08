<?php

namespace Database\Seeders;

use App\Enums\MenuEnum;
use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        foreach (MenuEnum::cases() as $menu) {
            Menu::firstOrCreate(
                ['name' => $menu->value],
                ['label' => $menu->label()]
            );
        }
    }
}
