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
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || 'bg-gray-200 text-gray-800'}`}>
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
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, {merchant?.name}</h1>
                        <p className="mt-1 text-sm text-gray-500">Your payment collection overview</p>
                    </div>
                    <div className="rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-semibold text-black">
                        Merchant Portal
                    </div>
                </div>

                {message && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        {message}
                    </div>
                )}

                {/* API Key Card */}
                {api_key && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="rounded-lg bg-gray-800 p-2">
                                <Key className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Use this key to authenticate API requests. Keep it secret.</p>
                        <div className="flex items-center gap-3">
                            <code className="flex-1 rounded-lg bg-gray-100 px-4 py-3 font-mono text-sm text-gray-800">
                                {api_key}
                            </code>
                            <button
                                onClick={copyApiKey}
                                className="rounded-lg bg-[#8DB600] px-4 py-3 text-sm font-semibold text-white hover:bg-[#7aa500]"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                        {webhook_url && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                <Globe className="h-4 w-4" />
                                Webhook: {webhook_url}
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Grid */}
                {stats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Payments"
                            value={stats.total_payments.toLocaleString()}
                            icon={<CreditCard className="h-5 w-5 text-white" />}
                            color="bg-[#8DB600]"
                        />
                        <StatCard
                            title="Total Amount (TZS)"
                            value={stats.total_amount.toLocaleString()}
                            icon={<TrendingUp className="h-5 w-5 text-white" />}
                            color="bg-[#FFD700]"
                            textColor="text-gray-900"
                        />
                        <StatCard
                            title="Successful"
                            value={stats.successful_payments.toLocaleString()}
                            icon={<CheckCircle className="h-5 w-5 text-white" />}
                            color="bg-emerald-600"
                        />
                        <StatCard
                            title="Pending"
                            value={stats.pending_payments.toLocaleString()}
                            icon={<Clock className="h-5 w-5 text-white" />}
                            color="bg-blue-600"
                        />
                    </div>
                )}

                {/* Recent Payments */}
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Your Recent Payments</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">UUID</th>
                                    <th className="px-6 py-3 font-semibold">MSISDN</th>
                                    <th className="px-6 py-3 font-semibold">Amount</th>
                                    <th className="px-6 py-3 font-semibold">Wallet</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recent_payments.map((payment) => (
                                    <tr key={payment.uuid} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-mono text-xs text-gray-600">{payment.uuid}</td>
                                        <td className="px-6 py-3 text-gray-600">{payment.msisdn}</td>
                                        <td className="px-6 py-3 font-semibold text-gray-900">{payment.amount.toLocaleString()} TZS</td>
                                        <td className="px-6 py-3 text-gray-600">{payment.wallet_type}</td>
                                        <td className="px-6 py-3"><StatusBadge status={payment.status} /></td>
                                        <td className="px-6 py-3 text-gray-500">{new Date(payment.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {recent_payments.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div className={`rounded-lg ${color} p-2.5`}>{icon}</div>
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

MerchantDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/merchant' }],
};
