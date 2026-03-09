import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Pharmtech Solutions',
    description: 'Privacy Policy for Pharmtech',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Privacy Policy</h1>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
                        <p className="font-semibold">Effective Date: [10-03-2026]</p>

                        <p>
                            At Pharmtech, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                        <p>We may collect the following information:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Full name</li>
                            <li>Phone number</li>
                            <li>Email address</li>
                            <li>Home or business address</li>
                            <li>Service details and inquiries</li>
                            <li>Technical information such as IP address and browser type</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Respond to inquiries and service requests</li>
                            <li>Provide solar, Starlink, networking, CCTV, and home automation services</li>
                            <li>Send quotations and invoices</li>
                            <li>Improve our website and customer experience</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                        <p className="mt-4">
                            We do not sell, rent, or trade your personal information to third parties.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Protection</h2>
                        <p>
                            We implement reasonable security measures to protect your information from unauthorized access, alteration, or disclosure.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Third-Party Services</h2>
                        <p>We may use third-party tools such as:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Payment processors</li>
                            <li>Analytics services</li>
                            <li>Messaging platforms (e.g., WhatsApp)</li>
                        </ul>
                        <p className="mt-4">
                            These third parties may collect limited information necessary to provide their services.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
                        <p>You may request to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your data (where legally permitted)</li>
                        </ul>

                        <p className="mt-6">To make a request, contact us at:</p>
                        <ul className="space-y-1">
                            <li><strong>Email:</strong> <a href="mailto:info@pharmtech.com" className="text-blue-600 hover:underline">info@pharmtech.com</a></li>
                            <li><strong>Phone:</strong> <a href="tel:+2348142111657" className="text-blue-600 hover:underline">+234 814 211 1657</a></li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Updates to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. Changes will be posted on this page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
