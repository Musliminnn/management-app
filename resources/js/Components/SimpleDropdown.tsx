import CustomDropdownWithSearch from './CustomDropdownWithSearch';

interface SimpleDropdownProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export default function SimpleDropdown({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi',
    label,
    required = false,
    disabled = false,
    error,
    className = '',
}: SimpleDropdownProps) {
    // Transform string options to match CustomDropdownWithSearch format
    const transformedOptions = options.map((option) => ({
        value: option,
        label: option,
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
            searchPlaceholder="Cari..."
            showSearch={true}
        />
    );
}
