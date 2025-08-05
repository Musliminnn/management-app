export const formatCurrency = (value: number | string) => {
    if (!value || value === '-' || value === '') return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '-';
    return numValue.toLocaleString('id-ID');
};
