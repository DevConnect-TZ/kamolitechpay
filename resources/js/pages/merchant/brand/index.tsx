import { Head, useForm } from '@inertiajs/react';
import { Palette, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface Props {
    merchant: {
        theme_color: string;
        logo_url: string | null;
    };
}

export default function BrandSettings({ merchant }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        theme_color: merchant.theme_color,
        logo: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(merchant.logo_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Use post because we might be sending a file
        post('/merchant/brand', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Brand settings updated!');
            },
        });
    };

    return (
        <>
            <Head title="Brand Settings" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 md:text-3xl">Brand Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">Customize how your payment pages look to your customers.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Logo</label>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
                                        {preview ? (
                                            <img src={preview} alt="Logo preview" className="h-full w-full object-contain" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        >
                                            <Upload className="h-4 w-4" /> Change Logo
                                        </button>
                                        <p className="mt-2 text-xs text-gray-500">PNG, JPG up to 2MB. Recommended size: 256x256px.</p>
                                        {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Theme Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 shadow-sm overflow-hidden">
                                        <input
                                            type="color"
                                            value={data.theme_color}
                                            onChange={e => setData('theme_color', e.target.value)}
                                            className="absolute -inset-2 h-14 w-14 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={data.theme_color}
                                            onChange={e => setData('theme_color', e.target.value)}
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                            placeholder="#4f46e5"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase"
                                        />
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">This color will be used for buttons and accents on your payment pages.</p>
                                {errors.theme_color && <p className="mt-1 text-sm text-red-600">{errors.theme_color}</p>}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Preview Panel */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center">
                        <div className="w-full max-w-sm rounded-xl bg-white shadow-xl overflow-hidden ring-1 ring-gray-100">
                            <div className="p-6 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4 overflow-hidden shadow-sm">
                                    {preview ? (
                                        <img src={preview} alt="Logo" className="h-full w-full object-contain" />
                                    ) : (
                                        <Palette className="h-8 w-8 text-gray-400" style={{ color: data.theme_color }} />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Preview</h3>
                                <p className="text-sm text-gray-500 mb-6">See how your brand looks to customers.</p>
                                
                                <div className="space-y-3">
                                    <div className="h-10 w-full rounded-md bg-gray-100 border border-gray-200"></div>
                                    <div className="h-10 w-full rounded-md bg-gray-100 border border-gray-200"></div>
                                    <button 
                                        className="h-10 w-full rounded-md font-medium text-white shadow-sm transition-opacity hover:opacity-90 mt-2"
                                        style={{ backgroundColor: data.theme_color }}
                                    >
                                        Pay Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
