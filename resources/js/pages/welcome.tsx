import { Head, Link, usePage } from '@inertiajs/react';
import { CreditCard, Shield, Zap, Globe, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Welcome() {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <Head title="Kamolitech Pay — Tanzania's Payment Gateway" />
            <div className="min-h-screen bg-white text-gray-900">
                {/* Navbar */}
                <nav className="border-b border-gray-100 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#8DB600] p-2">
                                <CreditCard className="h-5 w-5 text-white md:h-6 md:w-6" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 md:text-xl">Kamolitech</span>
                            <span className="rounded-md bg-[#FFD700] px-2 py-0.5 text-xs font-bold text-black">Pay</span>
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-4 md:flex">
                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-lg bg-[#8DB600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7aa500]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-lg bg-[#8DB600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7aa500]"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    {menuOpen && (
                        <div className="border-t border-gray-100 px-4 py-4 md:hidden">
                            <div className="flex flex-col gap-3">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="rounded-lg bg-[#8DB600] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#7aa500]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="rounded-lg border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="rounded-lg bg-[#8DB600] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#7aa500]"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                                <Link
                                    href="/docs"
                                    className="rounded-lg border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    API Documentation
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero */}
                <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20 lg:py-28">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
                        <div className="order-1">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 md:mb-6 md:px-4 md:py-2">
                                <span className="h-2 w-2 rounded-full bg-[#8DB600]"></span>
                                <span className="text-xs font-medium text-gray-600 md:text-sm">Tanzania's Trusted Payment Gateway</span>
                            </div>
                            <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
                                Collect Payments via{' '}
                                <span className="text-[#8DB600]">USSD Push</span>
                            </h1>
                            <p className="mt-4 text-base leading-relaxed text-gray-600 md:mt-6 md:text-lg">
                                The simplest way for Tanzanian businesses to accept mobile money payments.
                                Auto-detects Vodacom, Airtel, Tigo, Halopesa &amp; Zantel wallets.
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-8 md:gap-4">
                                <Link
                                    href={auth.user ? '/dashboard' : '/register'}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8DB600] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7aa500] md:px-6 md:py-3.5 md:text-base"
                                >
                                    Start Collecting
                                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                                </Link>
                                <Link
                                    href="/docs"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 md:px-6 md:py-3.5 md:text-base"
                                >
                                    API Documentation
                                </Link>
                            </div>
                        </div>

                        <div className="order-2">
                            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:p-6">
                                <div className="mb-3 flex items-center gap-3 md:mb-4">
                                    <div className="rounded-lg bg-[#8DB600] p-2">
                                        <CreditCard className="h-4 w-4 text-white md:h-5 md:w-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 md:text-base">API Request Example</span>
                                </div>
                                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-300 md:p-4 md:text-sm">
                                    {`POST /api/v1/payments
Content-Type: application/json
X-API-Key: kml_live_xxx

{
  "msisdn": "255765123456",
  "amount": 15000,
  "merchant_order_id": "INV-001"
}`}
                                </pre>
                                <div className="mt-3 rounded-lg bg-gray-50 p-3 md:mt-4 md:p-4">
                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 md:text-sm">
                                        <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                        <span>202 Accepted — USSD push sent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="border-t border-gray-100 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
                        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:mb-12 md:text-3xl">
                            Why Kamolitech Pay?
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                            <FeatureCard
                                icon={<Zap className="h-5 w-5 text-white md:h-6 md:w-6" />}
                                title="Instant USSD Push"
                                description="Trigger USSD prompts directly to customer phones. No app required."
                                color="bg-[#8DB600]"
                            />
                            <FeatureCard
                                icon={<Globe className="h-5 w-5 text-black md:h-6 md:w-6" />}
                                title="Auto Wallet Detection"
                                description="We detect Vodacom, Airtel, Tigo, Halopesa &amp; Zantel from the MSISDN prefix."
                                color="bg-[#FFD700]"
                            />
                            <FeatureCard
                                icon={<Shield className="h-5 w-5 text-white md:h-6 md:w-6" />}
                                title="Secure &amp; Compliant"
                                description="Enterprise-grade security with HMAC-SHA256 signed requests and encrypted webhooks."
                                color="bg-gray-800"
                            />
                            <FeatureCard
                                icon={<CheckCircle className="h-5 w-5 text-white md:h-6 md:w-6" />}
                                title="Real-time Webhooks"
                                description="Get instant payment notifications forwarded to your callback URL."
                                color="bg-[#8DB600]"
                            />
                            <FeatureCard
                                icon={<CreditCard className="h-5 w-5 text-black md:h-6 md:w-6" />}
                                title="Simple API Keys"
                                description="Authenticate with kml_ prefixed keys. No OAuth complexity."
                                color="bg-[#FFD700]"
                            />
                            <FeatureCard
                                icon={<ArrowRight className="h-5 w-5 text-white md:h-6 md:w-6" />}
                                title="Query Anytime"
                                description="Poll payment status via UUID. Full transaction history available."
                                color="bg-gray-700"
                            />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
                        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="rounded bg-[#8DB600] p-1.5">
                                    <CreditCard className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Kamolitech Pay</span>
                            </div>
                            <p className="text-xs text-gray-500 md:text-sm">&copy; {new Date().getFullYear()} Kamolitech. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    color,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className={`mb-3 inline-flex rounded-lg p-2.5 md:mb-4 md:p-3 ${color}`}>{icon}</div>
            <h3 className="mb-1 text-base font-semibold text-gray-900 md:mb-2 md:text-lg">{title}</h3>
            <p className="text-xs leading-relaxed text-gray-600 md:text-sm">{description}</p>
        </div>
    );
}
