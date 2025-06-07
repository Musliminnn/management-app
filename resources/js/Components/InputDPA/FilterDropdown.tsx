import CustomButton from '@/Components/CustomButton';
import Dropdown from '@/Components/Dropdown';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

type ModelType = {
    kode: string;
    nama: string;
};

export function FilterDropdown({
    model,
    value,
    placeholder = 'Pilih Item',
    onSelect,
}: {
    model: ModelType[];
    value: string | null;
    placeholder?: string;
    onSelect?: (kode: string | null) => void;
}) {
    const [selectedKode, setSelectedKode] = useState<string | null>(null);

    const handleSelect = (kode: string) => {
        const nextValue = selectedKode === kode ? null : kode;
        setSelectedKode(nextValue);
        if (onSelect) onSelect(nextValue);
    };

    const selectedName = value
        ? model.find((p) => p.kode === value)?.nama
        : placeholder;

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <CustomButton variant="shadow" className="gap-2">
                    <span className="block max-w-full truncate">
                        {selectedName || placeholder}
                    </span>
                    <ChevronDown className="size-5" />
                </CustomButton>
            </Dropdown.Trigger>

            <Dropdown.Content
                align="left"
                contentClasses="w-screen max-w-3xl bg-white"
            >
                {model.map((item, i) => (
                    <Dropdown.Link
                        key={i}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSelect(item.kode);
                        }}
                        className={
                            selectedName === item.nama
                                ? 'bg-main/10 font-semibold'
                                : 'hover:bg-grey-100'
                        }
                    >
                        {item.nama}
                    </Dropdown.Link>
                ))}
            </Dropdown.Content>
        </Dropdown>
    );
}
