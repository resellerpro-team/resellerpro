import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function TermsAndConditionsPage() {
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
                            Terms & Conditions
                        </h1>
                        <p className="text-gray-600">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 text-gray-700 leading-relaxed">
                        <section>
                            <p>
                                These Terms & Conditions ("Terms") govern your access to and use
                                of <strong>ResellerPro</strong>. By creating an account or using
                                the platform, you agree to be bound by these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                1. Service Description
                            </h2>
                            <p>
                                ResellerPro is a cloud-based SaaS platform that helps resellers
                                manage products, customers, orders, analytics, and business
                                workflows through a subscription-based model.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                2. Account Registration
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You must create an account to use ResellerPro</li>
                                <li>You are responsible for maintaining account security</li>
                                <li>
                                    You agree to provide accurate and up-to-date information
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                3. Subscription & Billing
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    ResellerPro offers Free, Professional, and Business plans
                                </li>
                                <li>Paid plans are billed on a monthly basis</li>
                                <li>
                                    Subscription prices are displayed clearly on the pricing page
                                </li>
                                <li>
                                    Payments are processed securely via <strong>Razorpay</strong>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                4. Cancellation & Refunds
                            </h2>
                            <p>
                                You may cancel your subscription at any time. Your access will
                                continue until the end of the current billing cycle.
                            </p>
                            <p className="mt-2">
                                Refunds, if applicable, are handled in accordance with Razorpay
                                policies and the plan terms. Promotional or discounted plans may
                                not be eligible for refunds.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                5. Fair Usage Policy
                            </h2>
                            <p>You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>Use the platform for illegal or unauthorized purposes</li>
                                <li>Attempt to disrupt, reverse engineer, or misuse services</li>
                                <li>Abuse system limits or features unfairly</li>
                            </ul>
                            <p className="mt-2">
                                We reserve the right to suspend or terminate accounts that
                                violate these Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                6. Data Ownership
                            </h2>
                            <p>
                                You retain full ownership of your business data. ResellerPro
                                does not claim ownership over your content. We process your data
                                solely to provide and improve the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                7. Service Availability
                            </h2>
                            <p>
                                ResellerPro is provided on an “as is” and “as available” basis.
                                While we aim for high availability, uninterrupted service is
                                not guaranteed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                8. Changes to Terms
                            </h2>
                            <p>
                                We may update these Terms from time to time. Continued use of
                                ResellerPro after changes indicates acceptance of the updated
                                Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                9. Contact Information
                            </h2>
                            <p>
                                If you have any questions about these Terms & Conditions, you
                                can contact us at:
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
