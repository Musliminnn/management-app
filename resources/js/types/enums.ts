export enum RoleEnum {
    Superadmin = 'superadmin',
    Admin = 'admin',
    PAKPA = 'pa_kpa',
    PPTK = 'pptk',
    BPP = 'bpp',
}

export enum MenuEnum {
    Dashboard = 'dashboard',
    InputDPA = 'input_dpa',
    InputRealisasiBelanja = 'input_realisasi_belanja',
    RiwayatTransaksi = 'riwayat_transaksi',
    LaporanRealisasi = 'laporan_realisasi',
}

export enum PermissionEnum {
    View = 'view',
    Add = 'add',
    Edit = 'edit',
    Delete = 'delete',
    Validate = 'validate',
    Export = 'export',
}

export enum RealisasiStatusEnum {
    Pending = 'pending',
    Validated = 'validated',
    Rejected = 'rejected',
}

export const RealisasiStatusLabel: Record<RealisasiStatusEnum, string> = {
    [RealisasiStatusEnum.Pending]: 'Menunggu Validasi',
    [RealisasiStatusEnum.Validated]: 'Tervalidasi',
    [RealisasiStatusEnum.Rejected]: 'Ditolak',
};

export const RealisasiStatusColor: Record<
    RealisasiStatusEnum,
    { bg: string; text: string }
> = {
    [RealisasiStatusEnum.Pending]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
    },
    [RealisasiStatusEnum.Validated]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
    },
    [RealisasiStatusEnum.Rejected]: { bg: 'bg-red-100', text: 'text-red-800' },
};
