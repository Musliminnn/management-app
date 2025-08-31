import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CustomDayPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    baseDate: string; // Bulan dan tahun dari periode laporan (YYYY-MM-DD)
}

const CustomDayPicker: React.FC<CustomDayPickerProps> = ({
    label,
    value,
    onChange,
    error,
    placeholder = 'Pilih tanggal',
    required = false,
    disabled = false,
    baseDate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? new Date(value) : null,
    );
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Parse base date (bulan_tahun) untuk mendapatkan bulan dan tahun
    const baseDateObj = baseDate ? new Date(baseDate) : new Date();
    const baseYear = baseDateObj.getFullYear();
    const baseMonth = baseDateObj.getMonth();

    // State untuk navigasi kalender (default ke periode laporan)
    const [currentYear, setCurrentYear] = useState(baseYear);
    const [currentMonth, setCurrentMonth] = useState(baseMonth);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            setSelectedDate(date);
        }
    }, [value]);

    // Reset kalender ke periode laporan saat baseDate berubah
    useEffect(() => {
        setCurrentYear(baseYear);
        setCurrentMonth(baseMonth);
    }, [baseYear, baseMonth]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const getDaysInMonth = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(currentYear, currentMonth, day));
        }

        return days;
    };

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatValueDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        onChange(formatValueDate(date));
        setIsOpen(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const goToBaseDate = () => {
        setCurrentYear(baseYear);
        setCurrentMonth(baseMonth);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        return (
            selectedDate && date.toDateString() === selectedDate.toDateString()
        );
    };

    const days = getDaysInMonth();

    // Jika baseDate tidak ada, disable komponen
    if (!baseDate) {
        return (
            <div className="relative">
                <InputLabel value={label} />
                <div className="mt-1 w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500">
                    Pilih periode laporan terlebih dahulu
                </div>
                {error && <InputError message={error} className="mt-2" />}
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <InputLabel value={label} className="mb-2" />

            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`relative w-full rounded-md border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-main ${
                        disabled
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-main'
                    } ${error ? 'border-red-300 focus:ring-red-500' : ''}`}
                >
                    <div className="flex items-center justify-between">
                        <span
                            className={
                                selectedDate ? 'text-gray-900' : 'text-gray-500'
                            }
                        >
                            {selectedDate
                                ? formatDisplayDate(selectedDate)
                                : placeholder}
                        </span>
                        <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                        {/* Header dengan navigasi */}
                        <div className="rounded-t-lg bg-gradient-to-r from-main to-main/80 p-3 text-white">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => navigateMonth('prev')}
                                    className="rounded-full p-1 transition-colors hover:bg-white/20"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="text-center">
                                    <h3 className="text-lg font-semibold">
                                        {months[currentMonth]} {currentYear}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => navigateMonth('next')}
                                    className="rounded-full p-1 transition-colors hover:bg-white/20"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="p-3">
                            {/* Days of week header */}
                            <div className="mb-2 grid grid-cols-7 gap-1">
                                {daysOfWeek.map((day) => (
                                    <div
                                        key={day}
                                        className="py-1 text-center text-xs font-medium text-gray-500"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar days */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((date, index) => (
                                    <div key={index} className="aspect-square">
                                        {date ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDateSelect(date)
                                                }
                                                className={`h-full w-full rounded text-sm transition-colors duration-200 ${
                                                    isSelected(date)
                                                        ? 'bg-main text-white shadow-md'
                                                        : isToday(date)
                                                          ? 'bg-main/20 font-semibold text-main'
                                                          : 'text-gray-700 hover:bg-main/10'
                                                }`}
                                            >
                                                {date.getDate()}
                                            </button>
                                        ) : (
                                            <div className="h-full w-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
};

export default CustomDayPicker;
