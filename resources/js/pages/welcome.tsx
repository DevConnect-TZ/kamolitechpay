import { Head, Link, usePage } from '@inertiajs/react';
import { CreditCard, Shield, Zap, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Kamolitech Pay — Tanzania's Payment Gateway" />
            <div className="min-h-screen bg-white text-gray-900">
                {/* Navbar */}
                <nav className="border-b border-gray-100 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#8DB600] p-2">
                                <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Kamolitech</span>
                            <span className="rounded-md bg-[#FFD700] px-2 py-0.5 text-xs font-bold text-black">Pay</span>
                        </div>
                        <div className="flex items-center gap-4">
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
                    </div>
                </nav>

                {/* Hero */}
                <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                                <span className="h-2 w-2 rounded-full bg-[#8DB600]"></span>
                                <span className="text-sm font-medium text-gray-600">Tanzania's Trusted Payment Gateway</span>
                            </div>
                            <h1 className="text-4xl font-extrabold leading-tight text-gray-900 lg:text-6xl">
                                Collect Payments via{' '}
                                <span className="text-[#8DB600]">USSD Push</span>
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-gray-600">
                                The simplest way for Tanzanian businesses to accept mobile money payments.
                                Auto-detects Vodacom, Airtel, Tigo, Halopesa &amp; Zantel wallets.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    href={auth.user ? '/dashboard' : '/register'}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#8DB600] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#7aa500]"
                                >
                                    Start Collecting
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="/docs"
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    API Documentation
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-lg bg-[#8DB600] p-2">
                                        <CreditCard className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-gray-900">API Request Example</span>
                                </div>
                                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-300">
                                    {`POST /api/v1/payments
Content-Type: application/json
X-API-Key: kml_live_xxx

{
  "msisdn": "255765123456",
  "amount": 15000,
  "merchant_order_id": "INV-001"
}`}
                                </pre>
                                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>202 Accepted — USSD push sent</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="border-t border-gray-100 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-6 py-20">
                        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
                            Why Kamolitech Pay?
                        </h2>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<Zap className="h-6 w-6 text-white" />}
                                title="Instant USSD Push"
                                description="Trigger USSD prompts directly to customer phones. No app required."
                                color="bg-[#8DB600]"
                            />
                            <FeatureCard
                                icon={<Globe className="h-6 w-6 text-black" />}
                                title="Auto Wallet Detection"
                                description="We detect Vodacom, Airtel, Tigo, Halopesa &amp; Zantel from the MSISDN prefix."
                                color="bg-[#FFD700]"
                            />
                            <FeatureCard
                                icon={<Shield className="h-6 w-6 text-white" />}
                                title="Secure &amp; Compliant"
                                description="Enterprise-grade security with HMAC-SHA256 signed requests and encrypted webhooks."
                                color="bg-gray-800"
                            />
                            <FeatureCard
                                icon={<CheckCircle className="h-6 w-6 text-white" />}
                                title="Real-time Webhooks"
                                description="Get instant payment notifications forwarded to your callback URL."
                                color="bg-[#8DB600]"
                            />
                            <FeatureCard
                                icon={<CreditCard className="h-6 w-6 text-black" />}
                                title="Simple API Keys"
                                description="Authenticate with kml_ prefixed keys. No OAuth complexity."
                                color="bg-[#FFD700]"
                            />
                            <FeatureCard
                                icon={<ArrowRight className="h-6 w-6 text-white" />}
                                title="Query Anytime"
                                description="Poll payment status via UUID. Full transaction history available."
                                color="bg-gray-700"
                            />
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <div className="rounded bg-[#8DB600] p-1.5">
                                    <CreditCard className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Kamolitech Pay</span>
                            </div>
                            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Kamolitech. All rights reserved.</p>
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
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className={`mb-4 inline-flex rounded-lg ${color} p-3`}>{icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
    );
}
