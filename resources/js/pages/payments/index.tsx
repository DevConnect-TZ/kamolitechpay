import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, CreditCard, Filter } from 'lucide-react';
import { useState } from 'react';

interface Payment {
    id: number;
    uuid: string;
    merchant_name: string;
    msisdn: string;
    amount: number;
    currency: string;
    status: string;
    wallet_type: string;
    selcom_reference: string | null;
    merchant_order_id: string | null;
    created_at: string;
    completed_at: string | null;
}

interface PaymentsIndexProps {
    payments: {
        data: Payment[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    statuses: string[];
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: 'bg-[#FFD700] text-black',
        push_sent: 'bg-[#8DB600] text-white',
        inprogress: 'bg-blue-600 text-white',
        success: 'bg-emerald-600 text-white',
        failed: 'bg-red-600 text-white',
        ambiguous: 'bg-amber-600 text-white',
        timeout: 'bg-gray-600 text-white',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || 'bg-gray-200 text-gray-800'}`}>
            {status}
        </span>
    );
}

export default function PaymentsIndex({ payments, statuses }: PaymentsIndexProps) {
    const [filterStatus, setFilterStatus] = useState('');

    const filtered = filterStatus
        ? payments.data.filter((p) => p.status === filterStatus)
        : payments.data;

    return (
        <>
            <Head title="Payments" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                        <p className="mt-1 text-sm text-gray-500">All transactions across merchants</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#8DB600] focus:outline-none focus:ring-1 focus:ring-[#8DB600]"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">UUID</th>
                                    <th className="px-6 py-3 font-semibold">Merchant</th>
                                    <th className="px-6 py-3 font-semibold">MSISDN</th>
                                    <th className="px-6 py-3 font-semibold">Amount</th>
                                    <th className="px-6 py-3 font-semibold">Wallet</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Reference</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                    <th className="px-6 py-3 font-semibold"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((payment) => (
                                    <tr key={payment.uuid} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-mono text-xs text-gray-600">{payment.uuid}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{payment.merchant_name}</td>
                                        <td className="px-6 py-3 text-gray-600">{payment.msisdn}</td>
                                        <td className="px-6 py-3 font-semibold text-gray-900">{payment.amount.toLocaleString()} {payment.currency}</td>
                                        <td className="px-6 py-3 text-gray-600">{payment.wallet_type}</td>
                                        <td className="px-6 py-3"><StatusBadge status={payment.status} /></td>
                                        <td className="px-6 py-3 text-xs text-gray-500">{payment.selcom_reference || '-'}</td>
                                        <td className="px-6 py-3 text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-3">
                                            <Link
                                                href={`/payments/${payment.uuid}`}
                                                className="inline-flex items-center gap-1 rounded-md bg-[#8DB600] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7aa500]"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                            No payments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                        <div className="text-sm text-gray-500">Showing {filtered.length} payments</div>
                        <div className="flex gap-1">
                            {payments.links.map((link, i) => (
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

PaymentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/payments' },
    ],
};
