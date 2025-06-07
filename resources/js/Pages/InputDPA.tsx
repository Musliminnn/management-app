import { ParentLayout } from '@/Layouts/MainLayout';
import { Head, usePage } from '@inertiajs/react';

export default function InputDPA() {
    const page = usePage();
    const data = (page.props as any).data as Record<string, any>[];

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    return (
        <ParentLayout>
            <div className="max-w-full overflow-x-auto p-6">
                <Head title="Data Transaksi Belanja" />
                <h1 className="mb-4 text-2xl font-bold">
                    Data Transaksi Belanja
                </h1>

                <div className="overflow-x-auto rounded border">
                    <table className="w-full min-w-[1500px] table-auto border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className="whitespace-nowrap border-b px-4 py-2 text-left font-semibold"
                                    >
                                        {col.replace(/_/g, ' ').toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
                                    {columns.map((col) => (
                                        <td
                                            key={col}
                                            className="whitespace-nowrap border-b px-4 py-2"
                                        >
                                            {row[col] ?? '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ParentLayout>
    );
}
