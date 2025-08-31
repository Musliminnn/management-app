// Utility functions for currency formatting and parsing

/**
 * Format number to IDR currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(amount);
};

/**
 * Format number to IDR currency string without currency symbol
 */
export const formatCurrencyNumber = (amount: number): string => {
    return new Intl.NumberFormat('id-ID').format(amount);
};

/**
 * Parse currency string to number
 * Removes currency symbols, dots, and commas
 */
export const parseCurrency = (value: string): number => {
    if (!value) return 0;
    
    // Remove currency symbols, dots (thousands separator), and spaces
    const cleaned = value
        .replace(/[Rp\s]/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format input value for currency display while typing
 */
export const formatCurrencyInput = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Convert to number and format
    const amount = parseInt(numbers);
    return formatCurrencyNumber(amount);
};

/**
 * Handle currency input change
 */
export const handleCurrencyInputChange = (
    value: string,
    onChange: (amount: number) => void
): string => {
    const formatted = formatCurrencyInput(value);
    const parsed = parseCurrency(formatted);
    onChange(parsed);
    return formatted;
};

/**
 * Calculate maximum koefisien from DPA string
 * Extracts numbers from string like "100 Orang x 2 Paket" and multiplies them
 * For decimal numbers like "17.4099528663817", returns the integer part (17)
 */
export const calculateMaxKoefisien = (koefisienDPA: string): number => {
    if (!koefisienDPA) return 0;
    
    // First check if it's a single decimal number
    const singleNumber = parseFloat(koefisienDPA.trim());
    if (!isNaN(singleNumber) && koefisienDPA.trim().match(/^\d+(\.\d+)?$/)) {
        // If it's a single decimal number, return the integer part
        return Math.floor(singleNumber);
    }
    
    // Extract numbers from string like "100 Orang x 2 Paket"
    const numbers = koefisienDPA.match(/\d+(\.\d+)?/g);
    if (!numbers || numbers.length === 0) return 0;
    
    // Multiply all numbers found (convert to integers for multiplication)
    return numbers.reduce((acc, num) => acc * Math.floor(parseFloat(num)), 1);
};

/**
 * Validate koefisien realisasi against DPA maximum
 */
export const validateKoefisienRealisasi = (
    koefisienRealisasi: number,
    koefisienDPA: string
): { isValid: boolean; errorMessage?: string } => {
    const maxKoefisien = calculateMaxKoefisien(koefisienDPA);
    
    if (maxKoefisien > 0 && koefisienRealisasi > maxKoefisien) {
        return {
            isValid: false,
            errorMessage: `Koefisien tidak boleh melebihi ${maxKoefisien} (dari DPA: ${koefisienDPA})`
        };
    }
    
    return { isValid: true };
};

/**
 * Validate realisasi against Pagu Anggaran (total_harga) maximum
 */
export const validateRealisasiPagu = (
    realisasi: number,
    paguAnggaran: number
): { isValid: boolean; errorMessage?: string } => {
    if (paguAnggaran <= 0) return { isValid: true };
    
    if (realisasi > paguAnggaran) {
        return {
            isValid: false,
            errorMessage: `Realisasi tidak boleh melebihi Pagu Anggaran ${formatCurrency(paguAnggaran)}`
        };
    }
    
    return { isValid: true };
};
