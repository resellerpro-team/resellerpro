import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 -z-10" />

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-600">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        <section>
                            <p>
                                ResellerPro ("we", "our", or "us") operates a subscription-based
                                SaaS platform designed to help resellers manage products,
                                customers, orders, and business workflows. We respect your
                                privacy and are committed to protecting your personal
                                information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                1. Information We Collect
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Account information such as name, email, and phone number</li>
                                <li>
                                    Business data including products, customers, orders, and
                                    invoices
                                </li>
                                <li>
                                    Subscription and payment status (we do not store card or UPI
                                    details)
                                </li>
                                <li>
                                    Usage data to improve performance, security, and user
                                    experience
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                2. How We Use Your Information
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To create and manage your account</li>
                                <li>To provide subscription-based services</li>
                                <li>To process payments and renewals</li>
                                <li>To communicate important updates and support messages</li>
                                <li>To improve and secure the platform</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                3. Payments
                            </h2>
                            <p>
                                All payments on ResellerPro are processed securely through
                                <strong> Razorpay</strong>. We do not store your card, UPI, or
                                banking details on our servers. Razorpay’s privacy policy
                                governs payment transactions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                4. Data Security
                            </h2>
                            <p>
                                We use industry-standard security practices, including
                                encryption and access controls, to protect your data. While no
                                system is completely secure, we continuously work to safeguard
                                your information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                5. Data Sharing
                            </h2>
                            <p>
                                We do not sell or rent your personal data. Information may only
                                be shared with trusted third parties such as payment processors
                                (Razorpay) or when required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                6. Your Rights
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access or update your account information</li>
                                <li>Request deletion of your account</li>
                                <li>Contact us regarding privacy-related concerns</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                7. Contact Us
                            </h2>
                            <p>
                                If you have any questions about this Privacy Policy, you can
                                contact us at:
                            </p>
                            <p className="mt-2">
                                📧 <strong>resellerpro@gmail.com</strong>
                                <br />
                                📞 <strong>+91 70253 02327</strong>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
