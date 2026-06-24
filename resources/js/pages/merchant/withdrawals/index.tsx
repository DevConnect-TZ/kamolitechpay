import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Banknote, Phone, Building2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Withdrawal {
    id: number;
    amount: number;
    fee_percentage: number;
    fee_amount: number;
    net_amount: number;
    destination_type: string;
    destination_details: any;
    status: string;
    admin_notes: string | null;
    created_at: string;
}

interface Props {
    withdrawals: {
        data: Withdrawal[];
        links: any[];
    };
    available_balance: number;
    fee_percentage: number;
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

export default function Withdrawals({ withdrawals, available_balance, fee_percentage }: Props) {
    const [destinationType, setDestinationType] = useState('phone');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        destination_type: 'phone',
        destination_details: {
            phone_number: '',
            bank_name: '',
            account_name: '',
            account_number: '',
        },
    });

    const handleDestinationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setDestinationType(type);
        setData('destination_type', type);
    };

    const handleDetailChange = (field: string, value: string) => {
        setData('destination_details', {
            ...data.destination_details,
            [field]: value,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/merchant/withdrawals', {
            onSuccess: () => {
                reset();
            },
        });
    };

    const amountNum = parseFloat(data.amount) || 0;
    const feeAmount = amountNum * (fee_percentage / 100);
    const netAmount = amountNum - feeAmount;

    return (
        <>
            <Head title="Withdrawals" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="flex items-center gap-3">
                    <Link
                        href="/merchant"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 md:text-3xl">Withdrawals</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900">Available Balance</h2>
                            <p className="text-3xl font-bold text-gray-900">{available_balance.toLocaleString()} TZS</p>
                            <p className="mt-2 text-sm text-gray-500">Withdrawal fee: {fee_percentage}%</p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-gray-400" /> Request Withdrawal
                            </h2>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount (TZS)</label>
                                    <input
                                        type="number"
                                        min="1000"
                                        max={available_balance}
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                </div>

                                {amountNum > 0 && (
                                    <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-100 space-y-1">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Requested:</span>
                                            <span>{amountNum.toLocaleString()} TZS</span>
                                        </div>
                                        <div className="flex justify-between text-red-600">
                                            <span>Fee ({fee_percentage}%):</span>
                                            <span>-{feeAmount.toLocaleString()} TZS</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200 mt-1">
                                            <span>You will receive:</span>
                                            <span>{netAmount.toLocaleString()} TZS</span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                                    <select
                                        value={destinationType}
                                        onChange={handleDestinationTypeChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="phone">Mobile Money</option>
                                        <option value="bank">Bank Account</option>
                                    </select>
                                    {errors.destination_type && <p className="mt-1 text-sm text-red-600">{errors.destination_type}</p>}
                                </div>

                                {destinationType === 'phone' ? (
                                    <div className="space-y-4 pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-indigo-700 mb-2">
                                            <Phone className="h-4 w-4" /> <span className="text-sm font-medium">Mobile Details</span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 255765123456"
                                                value={data.destination_details.phone_number}
                                                onChange={e => handleDetailChange('phone_number', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-indigo-700 mb-2">
                                            <Building2 className="h-4 w-4" /> <span className="text-sm font-medium">Bank Details</span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. CRDB"
                                                value={data.destination_details.bank_name}
                                                onChange={e => handleDetailChange('bank_name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Account Name</label>
                                            <input
                                                type="text"
                                                value={data.destination_details.account_name}
                                                onChange={e => handleDetailChange('account_name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                                            <input
                                                type="text"
                                                value={data.destination_details.account_number}
                                                onChange={e => handleDetailChange('account_number', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {errors.destination_details && <p className="mt-1 text-sm text-red-600">Please provide valid destination details.</p>}

                                <button
                                    type="submit"
                                    disabled={processing || available_balance < 1000}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Withdrawal History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Date</th>
                                            <th className="px-4 py-3 font-semibold">Requested</th>
                                            <th className="px-4 py-3 font-semibold">Net</th>
                                            <th className="px-4 py-3 font-semibold">Destination</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {withdrawals.data.map((w) => (
                                            <tr key={w.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(w.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{parseFloat(w.amount.toString()).toLocaleString()} TZS</td>
                                                <td className="px-4 py-3 text-emerald-600 font-semibold whitespace-nowrap">{parseFloat(w.net_amount.toString()).toLocaleString()} TZS</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {w.destination_type === 'phone' ? (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" /> {w.destination_details.phone_number}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" /> {w.destination_details.bank_name} - {w.destination_details.account_number}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <StatusBadge status={w.status} />
                                                        {w.admin_notes && (
                                                            <span className="flex items-center text-xs text-gray-500" title={w.admin_notes}>
                                                                <AlertCircle className="h-3 w-3 mr-1" /> Notes
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {withdrawals.data.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No withdrawals yet.</td>
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

Withdrawals.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/merchant' },
        { title: 'Withdrawals', href: '/merchant/withdrawals' },
    ],
};
