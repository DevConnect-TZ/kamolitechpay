import { Head, useForm } from '@inertiajs/react';
import { Settings as SettingsIcon } from 'lucide-react';

interface Props {
    withdrawal_fee_percentage: number;
}

export default function Settings({ withdrawal_fee_percentage }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        withdrawal_fee_percentage: withdrawal_fee_percentage,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/global-settings');
    };

    return (
        <>
            <Head title="Global Settings" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 md:text-3xl">Global Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage application-wide settings and configurations.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                                <SettingsIcon className="h-5 w-5 text-gray-400" /> Financial Settings
                            </h2>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Global Withdrawal Fee Percentage (%)
                                    </label>
                                    <p className="mb-2 text-xs text-gray-500">
                                        This fee applies to all merchants requesting withdrawals.
                                    </p>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={data.withdrawal_fee_percentage}
                                        onChange={e => setData('withdrawal_fee_percentage', parseFloat(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                    {errors.withdrawal_fee_percentage && (
                                        <p className="mt-1 text-sm text-red-600">{errors.withdrawal_fee_percentage}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
