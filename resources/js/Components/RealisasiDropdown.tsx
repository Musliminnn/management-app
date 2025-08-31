import CustomDropdownWithSearch from './CustomDropdownWithSearch';

interface DropdownOption {
    kode: string;
    nama: string;
}

interface RealisasiDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    showCodeInLabel?: boolean;
}

export default function RealisasiDropdown({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi',
    label,
    required = false,
    disabled = false,
    error,
    className = '',
    showCodeInLabel = true,
}: RealisasiDropdownProps) {
    // Transform dropdown options to match CustomDropdownWithSearch format
    const transformedOptions = options.map((option) => ({
        value: option.kode,
        label: showCodeInLabel
            ? `${option.kode} - ${option.nama}`
            : option.nama,
        description: showCodeInLabel ? undefined : option.kode,
    }));

    return (
        <CustomDropdownWithSearch
            options={transformedOptions}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            label={label}
            required={required}
            disabled={disabled}
            error={error}
            className={className}
            searchPlaceholder="Cari kode atau nama..."
            showSearch={true}
        />
    );
}
