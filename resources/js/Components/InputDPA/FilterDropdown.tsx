import CustomButton from '@/Components/CustomButton';
import Dropdown from '@/Components/Dropdown';
import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ModelType = {
    kode: string;
    nama: string;
};

export function FilterDropdown({
    model,
    value,
    placeholder = 'Pilih Item',
    onSelect,
    isWithCode = true,
}: {
    model: ModelType[];
    value: string | null;
    placeholder?: string;
    onSelect?: (kode: string | null) => void;
    isWithCode?: boolean;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleSelect = (kode: string) => {
        if (!onSelect) return; // Don't do anything if onSelect is not provided
        const nextValue = value === kode ? null : kode;
        setSearchTerm(''); // Reset search term when selecting
        onSelect(nextValue);
    };

    // Filter items based on search term
    const filteredItems = model.filter(
        (item) =>
            item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.kode.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Show only first 3 items if no search term
    const displayItems =
        searchTerm.length > 0 ? filteredItems : filteredItems.slice(0, 3);

    const selectedItem = value ? model.find((p) => p.kode === value) : null;
    const selectedName = selectedItem
        ? isWithCode
            ? `${selectedItem.kode} - ${selectedItem.nama}`
            : selectedItem.nama
        : placeholder;

    // Focus search input when dropdown opens
    useEffect(() => {
        if (searchInputRef.current) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <CustomButton
                    variant="shadow"
                    className="flex max-w-48 items-center justify-between gap-2 px-3 py-2"
                >
                    <span className="w-24 truncate text-left">
                        {selectedName || placeholder}
                    </span>
                    <ChevronDown className="size-5 flex-shrink-0" />
                </CustomButton>
            </Dropdown.Trigger>

            <Dropdown.Content
                align="left"
                contentClasses="w-screen max-w-3xl bg-white p-0"
            >
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
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                    {displayItems.length > 0 ? (
                        displayItems.map((item, i) => (
                            <Dropdown.Link
                                key={i}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(item.kode);
                                }}
                                className={
                                    value === item.kode
                                        ? 'bg-main/10 font-semibold'
                                        : 'hover:bg-gray-100'
                                }
                            >
                                {isWithCode && (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {item.kode} - {item.nama}
                                        </span>
                                    </div>
                                )}
                                {!isWithCode && (
                                    <span className="font-medium text-gray-900">
                                        {item.nama}
                                    </span>
                                )}
                            </Dropdown.Link>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                            Tidak ada data yang ditemukan
                        </div>
                    )}

                    {searchTerm.length === 0 && filteredItems.length > 3 && (
                        <div className="border-t bg-gray-50 px-4 py-2 text-sm text-gray-500">
                            Menampilkan 3 dari {filteredItems.length} item.
                            Ketik untuk mencari lebih banyak.
                        </div>
                    )}
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
