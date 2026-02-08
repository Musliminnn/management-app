<?php

namespace App\Enums;

enum RoleEnum: string
{
    case Superadmin = 'superadmin';
    case Admin = 'admin'; // BP / Admin
    case PAKPA = 'pa_kpa';
    case PPTK = 'pptk';
    case BPP = 'bpp';

    public function label(): string
    {
        return match ($this) {
            self::Superadmin => 'Super Admin',
            self::Admin => 'BP / Admin',
            self::PAKPA => 'PA / KPA',
            self::PPTK => 'PPTK',
            self::BPP => 'BPP',
        };
    }
}
