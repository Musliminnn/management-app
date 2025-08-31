import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Option {
    value: string;
    label: string;
    description?: string;
}

interface CustomDropdownWithSearchProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    searchPlaceholder?: string;
    className?: string;
    showSearch?: boolean;
    maxHeight?: string;
}

export default function CustomDropdownWithSearch({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi',
    label,
    required = false,
    disabled = false,
    error,
    searchPlaceholder = 'Cari...',
    className = '',
    showSearch = true,
    maxHeight = 'max-h-60',
}: CustomDropdownWithSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(
                (option) =>
                    option.label
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    option.value
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (option.description &&
                        option.description
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())),
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSearchTerm('');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchRef.current && showSearch) {
            setTimeout(() => searchRef.current?.focus(), 100);
        }
    }, [isOpen, showSearch]);

    // Get selected option label
    const selectedOption = options.find((option) => option.value === value);
    const selectedLabel = selectedOption ? selectedOption.label : '';

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm('');
            }
        }
    };

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const clearSelection = () => {
        onChange('');
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {label && (
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label}{' '}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled}
                    className={`relative w-full rounded-md border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-main ${
                        disabled
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-main'
                    } ${error ? 'border-red-300 focus:ring-red-500' : ''} `}
                >
                    <span
                        className={`block truncate ${!selectedLabel ? 'text-gray-500' : ''}`}
                    >
                        {selectedLabel || placeholder}
                    </span>

                    <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                        {value && !disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearSelection();
                                }}
                                className="rounded-full p-1 transition-colors hover:bg-main/10"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        )}
                        <ChevronDown
                            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
                        {showSearch && (
                            <div className="border-b border-gray-200 p-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder={searchPlaceholder}
                                        className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-main"
                                    />
                                </div>
                            </div>
                        )}

                        <div className={`py-1 ${maxHeight} overflow-auto`}>
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-center text-sm text-gray-500">
                                    {searchTerm
                                        ? 'Tidak ada data yang ditemukan'
                                        : 'Tidak ada opsi tersedia'}
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            handleSelect(option.value)
                                        }
                                        title={option.description || option.label}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-main/10 focus:bg-main/10 focus:outline-none transition-colors ${value === option.value ? 'bg-main/20 font-medium text-main' : 'text-gray-900'} `}
                                    >
                                        <div className="truncate">
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div className="mt-1 truncate text-xs text-gray-500">
                                                {option.description}
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
