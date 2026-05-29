import { Head } from '@inertiajs/react';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardProps {
    stats: {
        total_payments: number;
        total_amount: number;
        successful_payments: number;
        pending_payments: number;
        failed_payments: number;
        total_merchants: number;
        active_merchants: number;
    };
    recent_payments: Array<{
        uuid: string;
        merchant_name: string;
        msisdn: string;
        amount: number;
        status: string;
        wallet_type: string;
        created_at: string;
    }>;
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

export default function Dashboard({ stats, recent_payments }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-500">Kamolitech Pay Overview</p>
                    </div>
                </div>

                {/* Stats Grid */}
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

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Failed"
                        value={stats.failed_payments.toLocaleString()}
                        icon={<AlertCircle className="h-5 w-5 text-white" />}
                        color="bg-red-600"
                    />
                    <StatCard
                        title="Total Merchants"
                        value={stats.total_merchants.toLocaleString()}
                        icon={<Users className="h-5 w-5 text-white" />}
                        color="bg-gray-700"
                    />
                    <StatCard
                        title="Active Merchants"
                        value={stats.active_merchants.toLocaleString()}
                        icon={<ArrowUpRight className="h-5 w-5 text-white" />}
                        color="bg-[#8DB600]"
                    />
                </div>

                {/* Recent Payments */}
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Merchant</th>
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
                                        <td className="px-6 py-3 font-medium text-gray-900">{payment.merchant_name}</td>
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
                                            No payments yet.
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
    textColor = 'text-white',
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    textColor?: string;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div className={`rounded-lg ${color} p-2.5`}>{icon}</div>
            </div>
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className={`mt-1 text-2xl font-bold ${textColor === 'text-gray-900' ? 'text-gray-900' : 'text-gray-900'}`}>{value}</p>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
