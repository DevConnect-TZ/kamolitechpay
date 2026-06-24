import { Head, useForm } from '@inertiajs/react';
import { CreditCard, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface LinkData {
    uuid: string;
    title: string;
    description: string | null;
    amount: number | null;
    msisdn: string | null;
    merchant_name: string;
}

interface Props {
    link: LinkData;
    flash?: {
        success?: string;
        error?: string;
    };
    errors: any;
}

export default function PayShow({ link, flash, errors: serverErrors }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        amount: link.amount || '',
        msisdn: link.msisdn || '',
    });

    const [isSuccess, setIsSuccess] = useState(!!flash?.success);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/pay/${link.uuid}`, {
            onSuccess: (page) => {
                if (page.props.flash?.success) {
                    setIsSuccess(true);
                }
            },
        });
    };

    if (isSuccess) {
        return (
            <>
                <Head title={`Payment Successful - ${link.title}`} />
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Initiated!</h2>
                            <p className="text-gray-600 mb-6">
                                {flash?.success || "Please check your phone and enter your PIN to confirm the payment via USSD push."}
                            </p>
                            <p className="text-sm text-gray-500">
                                You can safely close this window now.
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Pay ${link.merchant_name} - ${link.title}`} />
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            {link.merchant_name}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Secure payment via Kamolitech Pay
                        </p>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-bold text-gray-900">{link.title}</h3>
                            {link.description && (
                                <p className="mt-2 text-sm text-gray-500">{link.description}</p>
                            )}
                        </div>

                        {(flash?.error || serverErrors?.error) && (
                            <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                    </div>
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
                                <label className="block text-sm font-medium text-gray-700">Amount (TZS)</label>
                                {link.amount ? (
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                            TZS
                                        </span>
                                        <input
                                            type="text"
                                            disabled
                                            value={parseFloat(link.amount.toString()).toLocaleString()}
                                            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 sm:text-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <input
                                            type="number"
                                            min="100"
                                            required
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            placeholder="Enter amount"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mobile Money Number</label>
                                {link.msisdn ? (
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                            <Phone className="h-4 w-4" />
                                        </span>
                                        <input
                                            type="text"
                                            disabled
                                            value={link.msisdn}
                                            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 sm:text-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            required
                                            value={data.msisdn}
                                            onChange={e => setData('msisdn', e.target.value)}
                                            placeholder="e.g., 255765123456"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Supported networks: Vodacom, Airtel, Tigo, Halotel, Zantel</p>
                                        {errors.msisdn && <p className="mt-1 text-sm text-red-600">{errors.msisdn}</p>}
                                    </div>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Processing...' : `Pay ${link.amount ? parseFloat(link.amount.toString()).toLocaleString() + ' TZS' : 'Now'}`}
                                </button>
                            </div>
                        </form>
                        
                        <div className="mt-6 text-center text-xs text-gray-400">
                            Secured by Kamolitech Pay
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
