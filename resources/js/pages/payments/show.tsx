import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface Log {
    id: number;
    direction: string;
    event: string;
    payload: Record<string, unknown>;
    created_at: string;
}

interface Merchant {
    id: number;
    name: string;
    email: string;
}

interface PaymentShowProps {
    payment: {
        id: number;
        uuid: string;
        merchant: Merchant;
        merchant_order_id: string | null;
        selcom_transid: string;
        selcom_reference: string | null;
        msisdn: string;
        amount: number;
        currency: string;
        wallet_type: string;
        status: string;
        selcom_resultcode: string | null;
        selcom_result: string | null;
        selcom_message: string | null;
        receipt_data: Record<string, unknown> | null;
        notification_payload: Record<string, unknown> | null;
        callback_url: string | null;
        callback_forwarded_at: string | null;
        created_at: string;
        completed_at: string | null;
        logs: Log[];
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
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold md:text-sm ${colors[status] || 'bg-gray-200 text-gray-800'}`}>
            {status === 'success' && <CheckCircle className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" />}
            {status === 'failed' && <AlertCircle className="mr-1 h-3.5 w-3.5 md:h-4 md:w-4" />}
            {status}
        </span>
    );
}

export default function PaymentShow({ payment }: PaymentShowProps) {
    return (
        <>
            <Head title={`Payment ${payment.uuid}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/payments"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 md:text-3xl">Payment Details</h1>
                        <p className="mt-0.5 font-mono text-xs text-gray-500 md:text-sm">{payment.uuid}</p>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="space-y-4 md:space-y-6 lg:col-span-2">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                            <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
                                <div className="rounded-lg bg-[#8DB600] p-2">
                                    <CreditCard className="h-4 w-4 text-white md:h-5 md:w-5" />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900 md:text-lg">Transaction Info</h2>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
                                <Field label="Status" value={<StatusBadge status={payment.status} />} />
                                <Field label="Amount" value={`${payment.amount.toLocaleString()} ${payment.currency}`} />
                                <Field label="MSISDN" value={payment.msisdn} />
                                <Field label="Wallet Type" value={payment.wallet_type} />
                                <Field label="Selcom TransID" value={payment.selcom_transid} />
                                <Field label="Selcom Reference" value={payment.selcom_reference || '-'} />
                                <Field label="Result Code" value={payment.selcom_resultcode || '-'} />
                                <Field label="Result" value={payment.selcom_result || '-'} />
                                <div className="sm:col-span-2">
                                    <Field label="Message" value={payment.selcom_message || '-'} />
                                </div>
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                            <h2 className="mb-3 text-base font-semibold text-gray-900 md:mb-4 md:text-lg">Event Logs</h2>
                            <div className="space-y-2 md:space-y-3">
                                {payment.logs.map((log) => (
                                    <div key={log.id} className="rounded-md border border-gray-100 bg-gray-50 p-2.5 md:p-3">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${log.direction === 'outgoing' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {log.direction}
                                                </span>
                                                <span className="text-xs text-gray-500">{log.event}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs text-gray-700">
                                            {JSON.stringify(log.payload, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                                {payment.logs.length === 0 && (
                                    <p className="text-gray-500">No logs yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                            <h2 className="mb-3 text-base font-semibold text-gray-900 md:mb-4 md:text-lg">Merchant</h2>
                            <div className="space-y-2 md:space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="mt-0.5 text-sm font-medium text-gray-900 md:text-base">{payment.merchant.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="mt-0.5 text-sm font-medium text-gray-900 md:text-base break-all">{payment.merchant.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                            <h2 className="mb-3 text-base font-semibold text-gray-900 md:mb-4 md:text-lg">Timeline</h2>
                            <div className="space-y-2 md:space-y-3">
                                <TimelineItem label="Created" value={new Date(payment.created_at).toLocaleString()} />
                                <TimelineItem label="Completed" value={payment.completed_at ? new Date(payment.completed_at).toLocaleString() : '-'} />
                                <TimelineItem label="Callback Forwarded" value={payment.callback_forwarded_at ? new Date(payment.callback_forwarded_at).toLocaleString() : '-'} />
                            </div>
                        </div>

                        {payment.receipt_data && (
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                                <h2 className="mb-3 text-base font-semibold text-gray-900 md:mb-4 md:text-lg">Receipt</h2>
                                <pre className="overflow-x-auto rounded bg-gray-50 p-2.5 text-xs text-gray-700 md:p-3">
                                    {JSON.stringify(payment.receipt_data, null, 2)}
                                </pre>
                            </div>
                        )}

                        {payment.notification_payload && (
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
                                <h2 className="mb-3 text-base font-semibold text-gray-900 md:mb-4 md:text-lg">Notification Payload</h2>
                                <pre className="overflow-x-auto rounded bg-gray-50 p-2.5 text-xs text-gray-700 md:p-3">
                                    {JSON.stringify(payment.notification_payload, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <div className="mt-0.5 break-words text-sm text-gray-900 md:text-base">{value}</div>
        </div>
    );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="break-words text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
}

PaymentShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/payments' },
        { title: 'Payment Detail', href: '#' },
    ],
};
