import { Head, Link } from '@inertiajs/react';
import { Users, Eye, CheckCircle, XCircle } from 'lucide-react';

interface Merchant {
    id: number;
    name: string;
    email: string;
    api_key: string;
    webhook_url: string | null;
    is_active: boolean;
    is_test_mode: boolean;
    payments_count: number;
    payments_sum_amount: number;
    created_at: string;
}

interface MerchantsIndexProps {
    merchants: {
        data: Merchant[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function MerchantsIndex({ merchants }: MerchantsIndexProps) {
    return (
        <>
            <Head title="Merchants" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Merchants</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage API consumers and view activity</p>
                    </div>
                    <div className="shrink-0 rounded-lg bg-[#FFD700] px-3 py-1.5 text-xs font-semibold text-black md:px-4 md:py-2 md:text-sm">
                        {merchants.data.length} total
                    </div>
                </div>

                {/* Table card */}
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Name</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Email</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Payments</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Volume</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Status</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {merchants.data.map((merchant) => (
                                    <tr key={merchant.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2.5 font-medium text-gray-900 md:px-6 md:py-3 whitespace-nowrap">{merchant.name}</td>
                                        <td className="px-3 py-2.5 text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{merchant.email}</td>
                                        <td className="px-3 py-2.5 text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{merchant.payments_count}</td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-900 md:px-6 md:py-3 whitespace-nowrap">{merchant.payments_sum_amount.toLocaleString()}</td>
                                        <td className="px-3 py-2.5 md:px-6 md:py-3">
                                            {merchant.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 md:px-2.5">
                                                    <CheckCircle className="mr-1 h-3 w-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 md:px-2.5">
                                                    <XCircle className="mr-1 h-3 w-3" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 md:px-6 md:py-3">
                                            <Link
                                                href={`/merchants/${merchant.id}`}
                                                className="inline-flex items-center gap-1 rounded-md bg-[#8DB600] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#7aa500] md:px-3"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {merchants.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-8 text-center text-gray-500 md:px-6">
                                            No merchants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-3 py-3 sm:flex-row md:px-6">
                        <div className="text-xs text-gray-500 md:text-sm">Showing {merchants.data.length} merchants</div>
                        <div className="flex gap-1 flex-wrap">
                            {merchants.links.map((link, i) => (
                                <span
                                    key={i}
                                    className={`rounded px-2.5 py-1 text-xs md:px-3 md:text-sm ${link.active ? 'bg-[#8DB600] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

MerchantsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Merchants', href: '/merchants' },
    ],
};
