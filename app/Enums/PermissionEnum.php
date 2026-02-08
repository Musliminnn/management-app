<?php

namespace App\Enums;

enum PermissionEnum: string
{
    case View = 'view';
    case Add = 'add';
    case Edit = 'edit';
    case Delete = 'delete';
    case Validate = 'validate';
    case Export = 'export';

    public function label(): string
    {
        return match ($this) {
            self::View => 'View',
            self::Add => 'Add',
            self::Edit => 'Edit',
            self::Delete => 'Delete',
            self::Validate => 'Validasi',
            self::Export => 'Export',
        };
    }
}
