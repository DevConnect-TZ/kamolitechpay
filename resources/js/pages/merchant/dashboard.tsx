import { Head } from '@inertiajs/react';
import { CreditCard, TrendingUp, CheckCircle, Clock, AlertCircle, Copy, Check, Key, Globe } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';

interface MerchantDashboardProps {
    stats: {
        total_payments: number;
        total_amount: number;
        successful_payments: number;
        pending_payments: number;
        failed_payments: number;
    } | null;
    api_key: string | null;
    webhook_url: string | null;
    recent_payments: Array<{
        uuid: string;
        msisdn: string;
        amount: number;
        status: string;
        wallet_type: string;
        created_at: string;
    }>;
    message?: string;
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

export default function MerchantDashboard({ stats, api_key, webhook_url, recent_payments, message }: MerchantDashboardProps) {
    const [copied, setCopied] = useState(false);
    const { merchant } = usePage().props as { merchant?: { name: string } };

    const copyApiKey = () => {
        if (api_key) {
            navigator.clipboard.writeText(api_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <Head title="Merchant Dashboard" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 md:text-3xl truncate">Welcome, {merchant?.name}</h1>
                        <p className="mt-1 text-sm text-gray-500">Your payment collection overview</p>
                    </div>
                    <div className="shrink-0 rounded-lg bg-[#FFD700] px-3 py-1.5 text-xs font-semibold text-black md:px-4 md:py-2 md:text-sm">
                        Merchant Portal
                    </div>
                </div>

                {message && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 md:p-4">
                        {message}
                    </div>
                )}

                {/* API Key Card */}
                {api_key && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                        <div className="mb-2 flex items-center gap-2 md:mb-3 md:gap-3">
                            <div className="rounded-lg bg-gray-800 p-2">
                                <Key className="h-4 w-4 text-white md:h-5 md:w-5" />
                            </div>
                            <h2 className="text-base font-semibold text-gray-900 md:text-lg">API Key</h2>
                        </div>
                        <p className="mb-3 text-xs text-gray-600 md:text-sm">Use this key to authenticate API requests. Keep it secret.</p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <code className="flex-1 rounded-lg bg-gray-100 px-3 py-2.5 font-mono text-xs text-gray-800 break-all md:px-4 md:py-3 md:text-sm">
                                {api_key}
                            </code>
                            <button
                                onClick={copyApiKey}
                                className="shrink-0 rounded-lg bg-[#8DB600] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#7aa500] md:px-4 md:py-3"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                        {webhook_url && (
                            <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:gap-2 md:text-sm">
                                <span className="flex items-center gap-1">
                                    <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    Webhook:
                                </span>
                                <span className="break-all">{webhook_url}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                        <StatCard
                            title="Total Payments"
                            value={stats.total_payments.toLocaleString()}
                            icon={<CreditCard className="h-4 w-4 text-white md:h-5 md:w-5" />}
                            color="bg-[#8DB600]"
                        />
                        <StatCard
                            title="Total Amount (TZS)"
                            value={stats.total_amount.toLocaleString()}
                            icon={<TrendingUp className="h-4 w-4 text-white md:h-5 md:w-5" />}
                            color="bg-[#FFD700]"
                        />
                        <StatCard
                            title="Successful"
                            value={stats.successful_payments.toLocaleString()}
                            icon={<CheckCircle className="h-4 w-4 text-white md:h-5 md:w-5" />}
                            color="bg-emerald-600"
                        />
                        <StatCard
                            title="Pending"
                            value={stats.pending_payments.toLocaleString()}
                            icon={<Clock className="h-4 w-4 text-white md:h-5 md:w-5" />}
                            color="bg-blue-600"
                        />
                    </div>
                )}

                {/* Recent Payments */}
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
                        <h2 className="text-base font-semibold text-gray-900 md:text-lg">Your Recent Payments</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">UUID</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">MSISDN</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Amount</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Wallet</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Status</th>
                                    <th className="px-3 py-2.5 font-semibold md:px-6 md:py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recent_payments.map((payment) => (
                                    <tr key={payment.uuid} className="hover:bg-gray-50">
                                        <td className="px-3 py-2.5 font-mono text-xs text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{payment.uuid}</td>
                                        <td className="px-3 py-2.5 text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{payment.msisdn}</td>
                                        <td className="px-3 py-2.5 font-semibold text-gray-900 md:px-6 md:py-3 whitespace-nowrap">{payment.amount.toLocaleString()} TZS</td>
                                        <td className="px-3 py-2.5 text-gray-600 md:px-6 md:py-3 whitespace-nowrap">{payment.wallet_type}</td>
                                        <td className="px-3 py-2.5 md:px-6 md:py-3"><StatusBadge status={payment.status} /></td>
                                        <td className="px-3 py-2.5 text-gray-500 md:px-6 md:py-3 whitespace-nowrap">{new Date(payment.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {recent_payments.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-8 text-center text-gray-500 md:px-6">
                                            No payments yet. Use your API key to start collecting.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 md:p-2.5 ${color}`}>{icon}</div>
            </div>
            <div className="mt-3 md:mt-4">
                <p className="text-xs font-medium text-gray-500 md:text-sm">{title}</p>
                <p className="mt-1 text-lg font-bold text-gray-900 md:text-2xl">{value}</p>
            </div>
        </div>
    );
}

MerchantDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/merchant' }],
};
