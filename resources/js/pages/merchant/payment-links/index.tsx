import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Link as LinkIcon, Copy, Trash2, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentLink {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    amount: number | null;
    msisdn: string | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    links: {
        data: PaymentLink[];
        links: any[];
    };
}

export default function PaymentLinks({ links }: Props) {
    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        description: '',
        amount: '',
        msisdn: '',
    });

    const [isCreating, setIsCreating] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/merchant/payment-links', {
            onSuccess: () => {
                reset();
                setIsCreating(false);
                toast.success('Payment link created successfully');
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this payment link?')) {
            destroy(`/merchant/payment-links/${id}`);
        }
    };

    const copyToClipboard = (uuid: string) => {
        const url = `${window.location.origin}/pay/${uuid}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    return (
        <>
            <Head title="Payment Links" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/merchant"
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 md:text-3xl">Payment Links</h1>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <PlusCircle className="h-4 w-4" /> Create Link
                        </button>
                    )}
                </div>

                {isCreating && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-6 max-w-2xl">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-indigo-500" /> New Payment Link
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g., Event Ticket"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="What is this payment for?"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    rows={2}
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount in TZS (Optional)</label>
                                    <p className="text-xs text-gray-500 mb-1">Leave empty to let the customer decide.</p>
                                    <input
                                        type="number"
                                        min="100"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        placeholder="e.g., 10000"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer Phone Number (Optional)</label>
                                    <p className="text-xs text-gray-500 mb-1">Lock to a specific customer.</p>
                                    <input
                                        type="text"
                                        value={data.msisdn}
                                        onChange={e => setData('msisdn', e.target.value)}
                                        placeholder="e.g., 255765123456"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {errors.msisdn && <p className="mt-1 text-sm text-red-600">{errors.msisdn}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Link'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsCreating(false); reset(); }}
                                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Title</th>
                                    <th className="px-4 py-3 font-semibold">Amount</th>
                                    <th className="px-4 py-3 font-semibold">MSISDN</th>
                                    <th className="px-4 py-3 font-semibold">Date Created</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {links.data.map((link) => (
                                    <tr key={link.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {link.title}
                                            {link.description && <p className="text-xs text-gray-500 mt-0.5 font-normal truncate max-w-xs">{link.description}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {link.amount ? `${parseFloat(link.amount.toString()).toLocaleString()} TZS` : <span className="text-gray-400 italic">Open Amount</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {link.msisdn ? link.msisdn : <span className="text-gray-400 italic">Any User</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {new Date(link.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(link.uuid)}
                                                    className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                                                >
                                                    <Copy className="h-3.5 w-3.5" /> Copy
                                                </button>
                                                <a
                                                    href={`/pay/${link.uuid}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                                                >
                                                    <LinkIcon className="h-3.5 w-3.5" /> Visit
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(link.id)}
                                                    className="inline-flex items-center gap-1 rounded bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {links.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">You haven't created any payment links yet.</td>
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
