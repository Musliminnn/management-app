<?php

namespace App\Enums;

enum RoleEnum: string
{
    case Superadmin = 'superadmin';
    case Admin = 'admin';
    case BPP = 'bpp';
    case PAKPA = 'pa_kpa';
}
