import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Contact Us | Pharmtech Solutions',
    description: 'Get in touch with Pharmtech for solar, CCTV, networking, and automation solutions.',
};

export default function ContactPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="bg-blue-600 rounded-3xl p-10 md:p-16 text-center mb-16 shadow-xl text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Get in Touch</h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                        Have questions about our solar, security, or networking solutions? Reach out to us directly through any of the channels below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Our Location</h3>
                                    <a href="https://maps.app.goo.gl/6ZzqeSg8VU2oDZDA7?g_st=ic" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors block">
                                        7 Cedar Complex, Ibadan, Nigeria
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg shrink-0">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Phone & WhatsApp</h3>
                                    <p className="text-gray-600">
                                        <a href="https://wa.me/2348142111657" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 hover:underline">
                                            +234 814 211 1657
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email Address</h3>
                                    <div className="text-gray-700">
                                        <a href="mailto:support@pharmtechsolar.com" className="hover:text-purple-600 hover:underline">
                                            support@pharmtechsolar.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-6">Connect With Us</h2>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/share/1AYUsoo7zz/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white rounded-full transition-colors">
                                <Facebook className="w-6 h-6" />
                            </a>
                            <a href="https://www.instagram.com/pharmtechsolar?igsh=MnI2NHhpZHE5MzRj" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 text-gray-600 hover:bg-pink-600 hover:text-white rounded-full transition-colors">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href="https://youtube.com/@pharmtechsolar?si=AFklsVn-fZ3eEkx9" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 text-gray-600 hover:bg-red-600 hover:text-white rounded-full transition-colors">
                                <Youtube className="w-6 h-6" />
                            </a>
                            <a href="https://www.tiktok.com/@pharmtech_solar1?_r=1&_t=ZS-94PnSFavA3E" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 text-gray-600 hover:bg-black hover:text-white rounded-full transition-colors flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea rows={5} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="How can we help you?"></textarea>
                            </div>
                            <a href="https://wa.me/2348142111657?text=Hello,%20I'd%20like%20more%20information." target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors block text-center">
                                Send via WhatsApp
                            </a>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
