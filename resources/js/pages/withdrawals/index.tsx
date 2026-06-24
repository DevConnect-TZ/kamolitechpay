import { Head, Link, useForm, router } from '@inertiajs/react';
import { ListFilter, Phone, Building2, ExternalLink, Check, X } from 'lucide-react';
import { useState } from 'react';

interface Withdrawal {
    id: number;
    merchant_name: string;
    merchant_id: number;
    amount: number;
    fee_percentage: number;
    fee_amount: number;
    net_amount: number;
    destination_type: string;
    destination_details: any;
    status: string;
    admin_notes: string | null;
    created_at: string;
    processed_at: string | null;
}

interface Props {
    withdrawals: {
        data: Withdrawal[];
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
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-emerald-100 text-emerald-800',
        rejected: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
}

export default function Withdrawals({ withdrawals, filters }: Props) {
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
    const [modalAction, setModalAction] = useState<'completed' | 'rejected'>('completed');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, put, processing, reset, errors } = useForm({
        status: '',
        admin_notes: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get('/withdrawals', { status: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const openModal = (withdrawal: Withdrawal, action: 'completed' | 'rejected') => {
        setSelectedWithdrawal(withdrawal);
        setModalAction(action);
        setData({
            status: action,
            admin_notes: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWithdrawal(null);
        reset();
    };

    const submitProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWithdrawal) return;

        put(`/withdrawals/${selectedWithdrawal.id}`, {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <>
            <Head title="Withdrawal Requests" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900 md:text-3xl">Withdrawal Requests</h1>
                    <div className="flex items-center gap-2">
                        <ListFilter className="h-5 w-5 text-gray-500" />
                        <select
                            value={filters.status || 'all'}
                            onChange={handleFilterChange}
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Merchant</th>
                                    <th className="px-4 py-3 font-semibold">Net Amount</th>
                                    <th className="px-4 py-3 font-semibold">Destination</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {withdrawals.data.map((w) => (
                                    <tr key={w.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(w.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-medium text-indigo-600 whitespace-nowrap">
                                            <Link href={`/merchants/${w.merchant_id}`} className="hover:underline flex items-center gap-1">
                                                {w.merchant_name} <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">{w.net_amount.toLocaleString()} TZS</div>
                                            <div className="text-xs text-gray-500">Gross: {w.amount.toLocaleString()} ({w.fee_percentage}% fee)</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {w.destination_type === 'phone' ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1 font-medium"><Phone className="h-3 w-3" /> Mobile</span>
                                                    <span>{w.destination_details.phone_number}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1 font-medium"><Building2 className="h-3 w-3" /> Bank</span>
                                                    <span>{w.destination_details.bank_name}</span>
                                                    <span>{w.destination_details.account_name}</span>
                                                    <span className="font-mono text-xs">{w.destination_details.account_number}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 items-start">
                                                <StatusBadge status={w.status} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            {w.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openModal(w, 'completed')}
                                                        className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                                                    >
                                                        <Check className="h-3 w-3" /> Complete
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(w, 'rejected')}
                                                        className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                                                    >
                                                        <X className="h-3 w-3" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {withdrawals.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No withdrawal requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {withdrawals.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{withdrawals.current_page}</span> of <span className="font-medium">{withdrawals.last_page}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {withdrawals.links.map((link, i) => (
                                            <Link
                                                key={i}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                } ${i === 0 ? 'rounded-l-md' : ''} ${i === withdrawals.links.length - 1 ? 'rounded-r-md' : ''}`}
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

            {/* Process Modal */}
            {isModalOpen && selectedWithdrawal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalAction === 'completed' ? 'Complete Withdrawal' : 'Reject Withdrawal'}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {modalAction === 'completed' 
                                    ? `Confirm that you have transferred ${selectedWithdrawal.net_amount.toLocaleString()} TZS to the merchant.`
                                    : 'Please provide a reason for rejecting this withdrawal request.'}
                            </p>
                        </div>

                        <form onSubmit={submitProcess} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Admin Notes (Optional for completion, recommended for rejection)</label>
                                <textarea
                                    value={data.admin_notes}
                                    onChange={e => setData('admin_notes', e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Enter any reference numbers or notes here..."
                                />
                                {errors.admin_notes && <p className="mt-1 text-sm text-red-600">{errors.admin_notes}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                                        modalAction === 'completed' 
                                            ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                    }`}
                                >
                                    {processing ? 'Processing...' : modalAction === 'completed' ? 'Confirm Transfer' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Withdrawals.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Withdrawals', href: '/withdrawals' },
    ],
};
