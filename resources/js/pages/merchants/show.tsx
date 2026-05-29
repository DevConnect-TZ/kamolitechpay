import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Users, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface Payment {
    uuid: string;
    msisdn: string;
    amount: number;
    status: string;
    wallet_type: string;
    created_at: string;
}

interface Merchant {
    id: number;
    name: string;
    email: string;
    api_key: string;
    webhook_url: string | null;
    is_active: boolean;
    is_test_mode: boolean;
    created_at: string;
    payments: Payment[];
}

interface MerchantShowProps {
    merchant: Merchant;
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

export default function MerchantShow({ merchant }: MerchantShowProps) {
    return (
        <>
            <Head title={`Merchant: ${merchant.name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/merchants"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 md:text-3xl truncate">{merchant.name}</h1>
                        <p className="mt-0.5 text-xs text-gray-500 md:text-sm">{merchant.email}</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Details card */}
                    <div className="space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                            <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
                                <div className="rounded-lg bg-[#8DB600] p-2">
                                    <Users className="h-4 w-4 text-white md:h-5 md:w-5" />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900 md:text-lg">Details</h2>
                            </div>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">API Key</p>
                                    <p className="mt-1 font-mono text-xs text-gray-900 break-all md:text-sm">{merchant.api_key}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Webhook URL</p>
                                    <p className="mt-1 text-xs text-gray-900 break-all md:text-sm">{merchant.webhook_url || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</p>
                                    <div className="mt-1">
                                        {merchant.is_active ? (
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 md:px-2.5">
                                                <CheckCircle className="mr-1 h-3 w-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 md:px-2.5">
                                                <XCircle className="mr-1 h-3 w-3" /> Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Mode</p>
                                    <div className="mt-1">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold md:px-2.5 ${merchant.is_test_mode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {merchant.is_test_mode ? 'Test' : 'Live'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Created</p>
                                    <p className="mt-1 text-xs text-gray-900 md:text-sm">{new Date(merchant.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                            <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
                                <div className="rounded-lg bg-[#FFD700] p-2">
                                    <CreditCard className="h-4 w-4 text-black md:h-5 md:w-5" />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900 md:text-lg">Recent Payments</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">UUID</th>
                                            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">MSISDN</th>
                                            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">Amount</th>
                                            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">Wallet</th>
                                            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">Status</th>
                                            <th className="px-3 py-2.5 font-semibold md:px-4 md:py-3">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {merchant.payments.map((payment) => (
                                            <tr key={payment.uuid} className="hover:bg-gray-50">
                                                <td className="px-3 py-2.5 font-mono text-xs text-gray-600 md:px-4 md:py-3 whitespace-nowrap">{payment.uuid}</td>
                                                <td className="px-3 py-2.5 text-gray-600 md:px-4 md:py-3 whitespace-nowrap">{payment.msisdn}</td>
                                                <td className="px-3 py-2.5 font-semibold text-gray-900 md:px-4 md:py-3 whitespace-nowrap">{payment.amount.toLocaleString()} TZS</td>
                                                <td className="px-3 py-2.5 text-gray-600 md:px-4 md:py-3 whitespace-nowrap">{payment.wallet_type}</td>
                                                <td className="px-3 py-2.5 md:px-4 md:py-3"><StatusBadge status={payment.status} /></td>
                                                <td className="px-3 py-2.5 text-gray-500 text-xs md:text-sm md:px-4 md:py-3 whitespace-nowrap">{new Date(payment.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {merchant.payments.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-3 py-6 text-center text-gray-500 md:px-4">No payments yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

MerchantShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Merchants', href: '/merchants' },
        { title: 'Merchant Detail', href: '#' },
    ],
};
