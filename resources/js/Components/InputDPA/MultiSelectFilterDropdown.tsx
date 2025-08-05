import CustomButton from '@/Components/CustomButton';
import Dropdown from '@/Components/Dropdown';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ModelType = {
    kode: string;
    nama: string;
};

export function MultiSelectFilterDropdown({
    model,
    value,
    placeholder = 'Pilih Item',
    onSelect,
}: {
    model: ModelType[];
    value: string[];
    placeholder?: string;
    onSelect?: (selectedValues: string[]) => void;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleSelect = (kode: string) => {
        if (!onSelect) return;

        const isSelected = value.includes(kode);
        let newValue: string[];

        if (isSelected) {
            // Remove from selection
            newValue = value.filter((v) => v !== kode);
        } else {
            // Add to selection
            newValue = [...value, kode];
        }

        setIsOpen(true);

        onSelect(newValue);
    };

    const clearAll = () => {
        if (!onSelect) return;
        onSelect([]);
    };

    // Filter items based on search term
    const filteredItems = model.filter(
        (item) =>
            item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kode.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Show only first 5 items if no search term
    const displayItems =
        searchTerm.length > 0 ? filteredItems : filteredItems.slice(0, 5);

    // Generate display text
    const getDisplayText = () => {
        if (value.length === 0) {
            return placeholder;
        }

        return `${value.length} item dipilih`;
    };

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <CustomButton
                    variant="shadow"
                    className="flex max-w-48 items-center justify-between gap-2 px-3 py-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="w-24 truncate text-left">
                        {getDisplayText()}
                    </span>
                    <div className="flex items-center gap-1">
                        {value.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearAll();
                                }}
                                className="rounded-full p-1 hover:bg-gray-200"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                        <ChevronDown className="size-5 flex-shrink-0" />
                    </div>
                </CustomButton>
            </Dropdown.Trigger>

            <Dropdown.Content
                align="left"
                contentClasses="w-screen max-w-3xl bg-white p-0"
            >
                <div onClick={(e) => e.stopPropagation()}>
                    <div
                        className="border-b border-gray-200 p-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Cari..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-main"
                            />
                        </div>
                    </div>

                    {/* Selected items display */}
                    {value.length > 0 && (
                        <div className="border-b border-gray-200 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                    Dipilih ({value.length})
                                </span>
                                <button
                                    onClick={clearAll}
                                    className="text-sm text-red-600 hover:text-red-800"
                                >
                                    Hapus Semua
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {value.map((selectedKode) => {
                                    const item = model.find(
                                        (m) => m.kode === selectedKode,
                                    );
                                    if (!item) return null;

                                    return (
                                        <span
                                            key={selectedKode}
                                            className="inline-flex items-center gap-1 rounded-full bg-main/10 px-2 py-1 text-xs text-main"
                                        >
                                            {item.nama}
                                            <button
                                                onClick={() =>
                                                    handleSelect(selectedKode)
                                                }
                                                className="rounded-full hover:bg-main/20"
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto">
                        {displayItems.length > 0 ? (
                            displayItems.map((item, i) => {
                                const isSelected = value.includes(item.kode);
                                return (
                                    <Dropdown.Link
                                        key={i}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleSelect(item.kode);
                                        }}
                                        className={`flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-main/10 font-semibold text-main'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {item.nama}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <Check className="size-4 text-main" />
                                        )}
                                    </Dropdown.Link>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                Tidak ada data yang ditemukan
                            </div>
                        )}

                        {searchTerm.length === 0 &&
                            filteredItems.length > 5 && (
                                <div className="border-t bg-gray-50 px-4 py-2 text-sm text-gray-500">
                                    Menampilkan 5 dari {filteredItems.length}{' '}
                                    item. Ketik untuk mencari lebih banyak.
                                </div>
                            )}
                    </div>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
