import { Head, useForm } from '@inertiajs/react';
import { CreditCard, Phone, AlertCircle, CheckCircle2, Loader2, XCircle, Store } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LinkData {
    uuid: string;
    title: string;
    description: string | null;
    amount: number | null;
    msisdn: string | null;
    merchant_name: string;
    theme_color: string;
    logo_url: string | null;
}

interface Props {
    link: LinkData;
    flash?: {
        success?: string;
        error?: string;
        payment_uuid?: string;
    };
    errors: any;
}

export default function PayShow({ link, flash, errors: serverErrors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        amount: link.amount || '',
        msisdn: link.msisdn || '',
    });

    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'polling' | 'success' | 'failed' | 'timeout'>('idle');
    const [paymentUuid, setPaymentUuid] = useState<string | null>(flash?.payment_uuid || null);
    const [statusMessage, setStatusMessage] = useState<string | null>(flash?.success || null);
    const [pollCount, setPollCount] = useState(0);

    const themeColor = link.theme_color || '#4f46e5';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/pay/${link.uuid}`, {
            onSuccess: (page) => {
                if (page.props.flash?.payment_uuid) {
                    setPaymentUuid(page.props.flash.payment_uuid);
                    setPaymentStatus('polling');
                    setPollCount(0);
                    setStatusMessage(page.props.flash.success || 'Processing...');
                }
            },
        });
    };

    useEffect(() => {
        if (paymentStatus !== 'polling' || !paymentUuid) return;

        const maxPolls = 30; // 2 minutes at 4 seconds each

        const checkStatus = async () => {
            if (pollCount >= maxPolls) {
                setPaymentStatus('timeout');
                setStatusMessage('Payment confirmation timed out. Please check your messages.');
                return;
            }

            try {
                const response = await fetch(`/pay/status/${paymentUuid}`);
                const result = await response.json();

                if (result.status === 'success') {
                    setPaymentStatus('success');
                    setStatusMessage(result.message || 'Payment completed successfully!');
                } else if (result.status === 'failed') {
                    setPaymentStatus('failed');
                    setStatusMessage(result.message || 'Payment failed.');
                } else {
                    // still pending/inprogress/ambiguous
                    setPollCount(c => c + 1);
                }
            } catch (error) {
                console.error("Failed to fetch payment status:", error);
                setPollCount(c => c + 1);
            }
        };

        const timer = setInterval(checkStatus, 4000);
        return () => clearInterval(timer);
    }, [paymentStatus, paymentUuid, pollCount]);

    // Derived theme styles
    const buttonStyle = {
        backgroundColor: themeColor,
        borderColor: themeColor,
        boxShadow: `0 4px 14px 0 ${themeColor}40`,
    };

    const renderPollingState = () => (
        <div className="text-center py-8">
            <Loader2 className="mx-auto h-16 w-16 animate-spin mb-6" style={{ color: themeColor }} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Awaiting Confirmation</h2>
            <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                {statusMessage || "Please check your phone and enter your PIN to confirm the payment via USSD push."}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-6 mb-2 overflow-hidden">
                <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000 ease-linear" 
                    style={{ width: `${Math.min(100, (pollCount / 30) * 100)}%`, backgroundColor: themeColor }}
                ></div>
            </div>
            <p className="text-xs text-gray-400">Time remaining: {120 - (pollCount * 4)}s</p>
        </div>
    );

    const renderSuccessState = () => (
        <div className="text-center py-8">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                {statusMessage}
            </p>
            <p className="text-sm font-medium text-gray-500 bg-gray-50 py-3 rounded-lg border border-gray-100">
                You can safely close this window.
            </p>
        </div>
    );

    const renderFailedState = () => (
        <div className="text-center py-8">
            <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {paymentStatus === 'timeout' ? 'Payment Timed Out' : 'Payment Failed'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                {statusMessage}
            </p>
            <button 
                onClick={() => {
                    setPaymentStatus('idle');
                    setPaymentUuid(null);
                    setPollCount(0);
                }}
                className="font-semibold px-6 py-2 rounded-lg text-white transition-opacity hover:opacity-90 shadow-md"
                style={{ backgroundColor: themeColor }}
            >
                Try Again
            </button>
        </div>
    );

    return (
        <>
            <Head title={`Pay ${link.merchant_name} - ${link.title}`} />
            
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-900">
                
                {/* Header Profile */}
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center flex flex-col items-center">
                        <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center shadow-md overflow-hidden ring-1 ring-gray-900/5 mb-4">
                            {link.logo_url ? (
                                <img src={link.logo_url} alt={link.merchant_name} className="h-full w-full object-contain p-2" />
                            ) : (
                                <Store className="h-8 w-8" style={{ color: themeColor }} />
                            )}
                        </div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                            {link.merchant_name}
                        </h2>
                    </div>
                </div>

                {/* Form Card */}
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
                    {/* Top Accent line */}
                    <div className="absolute top-0 inset-x-0 h-2 rounded-t-2xl shadow-sm" style={{ backgroundColor: themeColor }}></div>
                    
                    <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl ring-1 ring-gray-900/5">
                        
                        {/* Dynamic States */}
                        {paymentStatus === 'polling' && renderPollingState()}
                        {paymentStatus === 'success' && renderSuccessState()}
                        {(paymentStatus === 'failed' || paymentStatus === 'timeout') && renderFailedState()}

                        {/* Initial Form State */}
                        {paymentStatus === 'idle' && (
                            <>
                                <div className="mb-8 text-center">
                                    <h3 className="text-xl font-bold text-gray-900">{link.title}</h3>
                                    {link.description && (
                                        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{link.description}</p>
                                    )}
                                </div>

                                {(flash?.error || serverErrors?.error) && (
                                    <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100 shadow-sm animate-in slide-in-from-top-2">
                                        <div className="flex">
                                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">
                                                    {flash?.error || serverErrors?.error}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <form className="space-y-6" onSubmit={submit}>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (TZS)</label>
                                        {link.amount ? (
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    <span className="text-gray-500 sm:text-sm font-medium">TZS</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={parseFloat(link.amount.toString()).toLocaleString()}
                                                    className="block w-full rounded-lg border-0 py-3 pl-14 text-gray-900 ring-1 ring-inset ring-gray-200 bg-gray-50 sm:text-lg sm:leading-6 font-semibold"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    <span className="text-gray-500 sm:text-sm font-medium">TZS</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="100"
                                                    required
                                                    value={data.amount}
                                                    onChange={e => setData('amount', e.target.value)}
                                                    placeholder="0.00"
                                                    className="block w-full rounded-lg border-0 py-3 pl-14 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-lg sm:leading-6 font-medium transition-all"
                                                    style={{ focusRingColor: themeColor }}
                                                />
                                                {errors.amount && <p className="mt-2 text-sm text-red-600 font-medium">{errors.amount}</p>}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Money Number</label>
                                        {link.msisdn ? (
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={link.msisdn}
                                                    className="block w-full rounded-lg border-0 py-3 pl-12 text-gray-900 ring-1 ring-inset ring-gray-200 bg-gray-50 sm:text-lg sm:leading-6 font-semibold tracking-wide"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={data.msisdn}
                                                    onChange={e => setData('msisdn', e.target.value)}
                                                    placeholder="255765123456"
                                                    className="block w-full rounded-lg border-0 py-3 pl-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-lg sm:leading-6 font-medium tracking-wide transition-all"
                                                />
                                                {errors.msisdn && <p className="mt-2 text-sm text-red-600 font-medium">{errors.msisdn}</p>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex w-full justify-center rounded-xl border border-transparent py-3.5 px-4 text-base font-bold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                                            style={buttonStyle}
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5" />
                                                    {`Pay ${link.amount ? parseFloat(link.amount.toString()).toLocaleString() + ' TZS' : 'Now'}`}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                        
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
                            Secured by <span className="text-gray-600 font-bold">Kamolitech Pay</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
