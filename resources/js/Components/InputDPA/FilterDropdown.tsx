import CustomButton from '@/Components/CustomButton';
import Dropdown from '@/Components/Dropdown';
import { ChevronDown } from 'lucide-react';
import {  useState } from 'react';

type ModelType = {
    kode: string;
    nama: string;
};

export function FilterDropdown({
    model,
    placeholder = 'Pilih Item',
    onSelect,
}: {
    model: ModelType[];
    placeholder?: string;
    onSelect?: (kode: string | null) => void;
}) {
    const [selectedKode, setSelectedKode] = useState<string | null>(null);

    const handleSelect = (kode: string) => {
        const nextValue = selectedKode === kode ? null : kode;
        setSelectedKode(nextValue);
        if (onSelect) onSelect(nextValue);
    };

    const selectedName =
        selectedKode && model.find((item) => item.kode === selectedKode)?.nama;

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
                contentClasses="w-screen max-w-5xl bg-white"
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
