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
