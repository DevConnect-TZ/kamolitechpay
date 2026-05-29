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
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage API consumers and view activity</p>
                    </div>
                    <div className="rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-black">
                        {merchants.data.length} total
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">ID</th>
                                    <th className="px-6 py-3 font-semibold">Name</th>
                                    <th className="px-6 py-3 font-semibold">Email</th>
                                    <th className="px-6 py-3 font-semibold">API Key</th>
                                    <th className="px-6 py-3 font-semibold">Payments</th>
                                    <th className="px-6 py-3 font-semibold">Volume (TZS)</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Mode</th>
                                    <th className="px-6 py-3 font-semibold"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {merchants.data.map((merchant) => (
                                    <tr key={merchant.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-600">{merchant.id}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{merchant.name}</td>
                                        <td className="px-6 py-3 text-gray-600">{merchant.email}</td>
                                        <td className="px-6 py-3 font-mono text-xs text-gray-500">{merchant.api_key}</td>
                                        <td className="px-6 py-3 text-gray-600">{merchant.payments_count}</td>
                                        <td className="px-6 py-3 font-semibold text-gray-900">{merchant.payments_sum_amount.toLocaleString()}</td>
                                        <td className="px-6 py-3">
                                            {merchant.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                    <CheckCircle className="mr-1 h-3 w-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                                                    <XCircle className="mr-1 h-3 w-3" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${merchant.is_test_mode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {merchant.is_test_mode ? 'Test' : 'Live'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Link
                                                href={`/merchants/${merchant.id}`}
                                                className="inline-flex items-center gap-1 rounded-md bg-[#8DB600] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7aa500]"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {merchants.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                            No merchants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                        <div className="text-sm text-gray-500">Showing {merchants.data.length} merchants</div>
                        <div className="flex gap-1">
                            {merchants.links.map((link, i) => (
                                <span
                                    key={i}
                                    className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-[#8DB600] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
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
