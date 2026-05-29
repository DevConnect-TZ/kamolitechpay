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
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold md:px-2.5 ${colors[status] || 'bg-gray-200 text-gray-800'}`}>
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
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Payments</h1>
                        <p className="mt-1 text-sm text-gray-500">All transactions across merchants</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 focus:border-[#8DB600] focus:outline-none focus:ring-1 focus:ring-[#8DB600] md:px-3"
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
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">UUID</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Merchant</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">MSISDN</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Amount</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Wallet</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Status</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Date</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((payment) => (
                                    <tr key={payment.uuid} className="hover:bg-gray-50">
                                        <td className="px-3 py-2.5 font-mono text-xs text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{payment.uuid}</td>
                                        <td className="px-3 py-2.5 font-medium text-gray-900 md:px-6 md:py-3 whitespace-nowrap">{payment.merchant_name}</td>
                                        <td className="px-3 py-2.5 text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{payment.msisdn}</td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-900 md:px-6 md:py-3 whitespace-nowrap">{payment.amount.toLocaleString()} {payment.currency}</td>
                                        <td className="px-3 py-2.5 text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{payment.wallet_type}</td>
                                        <td className="px-3 py-2.5 md:px-6 md:py-3"><StatusBadge status={payment.status} /></td>
                                        <td className="px-3 py-2.5 text-gray-500 md:px-6 md:py-3 whitespace-nowrap">{new Date(payment.created_at).toLocaleDateString()}</td>
                                        <td className="px-3 py-2.5 md:px-6 md:py-3">
                                            <Link
                                                href={`/payments/${payment.uuid}`}
                                                className="inline-flex items-center gap-1 rounded-md bg-[#8DB600] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#7aa500]"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-3 py-8 text-center text-gray-500 md:px-6">
                                            No payments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-3 py-3 sm:flex-row md:px-6">
                        <div className="text-xs text-gray-500 md:text-sm">Showing {filtered.length} payments</div>
                        <div className="flex gap-1 flex-wrap">
                            {payments.links.map((link, i) => (
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

PaymentsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/payments' },
    ],
};
