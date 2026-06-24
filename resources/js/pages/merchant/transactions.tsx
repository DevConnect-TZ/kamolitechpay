import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ListFilter } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Transaction {
    uuid: string;
    msisdn: string;
    amount: number;
    status: string;
    wallet_type: string;
    merchant_order_id: string | null;
    created_at: string;
}

interface TransactionsProps {
    transactions: {
        data: Transaction[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
    };
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

export default function Transactions({ transactions, filters }: TransactionsProps) {
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get('/merchant/transactions', { status: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Transactions" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/merchant"
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 md:text-3xl">Transactions</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <ListFilter className="h-5 w-5 text-gray-500" />
                        <select
                            value={filters.status || 'all'}
                            onChange={handleFilterChange}
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="push_sent">Push Sent</option>
                            <option value="failed">Failed</option>
                            <option value="ambiguous">Ambiguous</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">UUID</th>
                                    <th className="px-4 py-3 font-semibold">Order ID</th>
                                    <th className="px-4 py-3 font-semibold">MSISDN</th>
                                    <th className="px-4 py-3 font-semibold">Amount</th>
                                    <th className="px-4 py-3 font-semibold">Wallet</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.data.map((payment) => (
                                    <tr key={payment.uuid} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{payment.uuid}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{payment.merchant_order_id || '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{payment.msisdn}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{payment.amount.toLocaleString()} TZS</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{payment.wallet_type}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={payment.status} /></td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(payment.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination - Simplified for this example */}
                    {transactions.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <Link
                                    href={transactions.links[0].url || '#'}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </Link>
                                <Link
                                    href={transactions.links[transactions.links.length - 1].url || '#'}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </Link>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{transactions.current_page}</span> of <span className="font-medium">{transactions.last_page}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {transactions.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                } ${i === 0 ? 'rounded-l-md' : ''} ${i === transactions.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

Transactions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/merchant' },
        { title: 'Transactions', href: '/merchant/transactions' },
    ],
};
