import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms and Conditions | Pharmtech Solutions',
    description: 'Terms and Conditions for Pharmtech',
};

export default function TermsAndConditionsPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">Terms and Conditions</h1>

                    <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
                        <p className="font-semibold">Effective Date: 10-03-2026</p>

                        <p>
                            Welcome to Pharmtech. By using our website or engaging our services, you agree to the following terms:
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Services</h2>
                        <p>We provide installation and supply of:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Solar power systems</li>
                            <li>Inverters and batteries</li>
                            <li>Starlink internet systems</li>
                            <li>Networking infrastructure</li>
                            <li>CCTV systems</li>
                            <li>Home automation solutions</li>
                        </ul>
                        <p className="mt-4">
                            All services are subject to site inspection and technical assessment.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Quotations & Payments</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All quotations are valid for a limited period stated in the invoice.</li>
                            <li>A deposit may be required before work begins.</li>
                            <li>Full payment terms will be clearly stated in your invoice.</li>
                            <li>Failure to complete payment may delay service delivery.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Installation</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Installation timelines depend on site conditions and equipment availability.</li>
                            <li>The client must provide safe and accessible working conditions.</li>
                            <li>Any additional work outside the agreed scope may incur extra charges.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Warranty</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Equipment warranty is subject to manufacturer terms.</li>
                            <li>Installation workmanship warranty (if applicable) will be stated in writing.</li>
                            <li>Warranty does not cover damage caused by misuse, accidents, power surges, or unauthorized modifications.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Limitation of Liability</h2>
                        <p>Pharmtech shall not be liable for:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Damages caused by external electrical faults</li>
                            <li>Internet service interruptions beyond our control</li>
                            <li>Customer misuse or tampering with installed systems</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Refund Policy</h2>
                        <p>
                            Deposits for completed procurement of equipment are non-refundable. Refunds, where applicable, will be handled at management discretion.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of the Federal Republic of Nigeria.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
