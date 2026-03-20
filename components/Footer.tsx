import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer bg-gray-900 text-white mt-auto">
            <div className="container mx-auto py-16 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="footer-item">
                        <h3 className="text-2xl font-bold mb-4 text-white">PHARMTECH</h3>
                        <p className="text-white mb-4 leading-relaxed">
                            Your trusted partner in advanced CCTV, Solar Energy, Networking, and Automation solutions.
                        </p>
                        <div className="flex gap-2">
                            {/* Social Icons Placeholder using btn-square */}
                            <a href="https://www.facebook.com/share/1AYUsoo7zz/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="btn btn-square btn-primary rounded-circle hover:bg-blue-600 transition-colors flex items-center justify-center p-2"><Facebook className="w-5 h-5" /></a>
                            <a href="https://www.instagram.com/pharmtechsolar?igsh=MnI2NHhpZHE5MzRj" target="_blank" rel="noopener noreferrer" className="btn btn-square btn-primary rounded-circle hover:bg-pink-600 transition-colors flex items-center justify-center p-2"><Instagram className="w-5 h-5" /></a>
                            <a href="https://youtube.com/@pharmtechsolar?si=AFklsVn-fZ3eEkx9" target="_blank" rel="noopener noreferrer" className="btn btn-square btn-primary rounded-circle hover:bg-red-600 transition-colors flex items-center justify-center p-2"><Youtube className="w-5 h-5" /></a>
                            <a href="https://www.tiktok.com/@pharmtech_solar1?_r=1&_t=ZS-94PnSFavA3E" target="_blank" rel="noopener noreferrer" className="btn btn-square btn-primary rounded-circle hover:bg-gray-800 transition-colors flex items-center justify-center p-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="footer-item">
                        <h4 className="text-lg font-bold mb-4 text-white">Products</h4>
                        <Link href="/products/cctv-systems" className="text-white hover:text-blue-400 mb-2 block">CCTV Systems</Link>
                        <Link href="/products/solar-shop" className="text-white hover:text-blue-400 mb-2 block">Solar Energy</Link>
                        <Link href="/products/networking" className="text-white hover:text-blue-400 mb-2 block">Networking</Link>
                        <Link href="/products/automation" className="text-white hover:text-blue-400 mb-2 block">Automation</Link>
                    </div>
                    <div className="footer-item">
                        <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
                        <Link href="/about" className="text-white hover:text-blue-400 mb-2 block">About Us</Link>
                        <Link href="/contact" className="text-white hover:text-blue-400 mb-2 block">Contact Support</Link>
                        <Link href="/privacy" className="text-white hover:text-blue-400 mb-2 block">Privacy Policy</Link>
                        <Link href="/terms" className="text-white hover:text-blue-400 mb-2 block">Terms & Conditions</Link>
                    </div>
                    <div className="footer-item">
                        <h4 className="text-lg font-bold mb-4 text-white">Contact Info</h4>
                        <a href="https://maps.app.goo.gl/6ZzqeSg8VU2oDZDA7?g_st=ic" target="_blank" rel="noopener noreferrer" className="text-gray-300 block mb-2 hover:text-white transition-colors">
                            7 Cedar Complex, Ibadan, Nigeria
                        </a>
                        <p className="text-gray-300 mb-2">+234 814 211 1657</p>
                        <p className="text-gray-300 mb-2">support@pharmtechsolar.com</p>
                    </div>
                </div>
            </div>
            <div className="copyright bg-black py-6 text-center text-sm text-gray-400 border-t border-gray-800">
                &copy; {new Date().getFullYear()} Pharmtech. All rights reserved.
            </div>
        </footer>
    );
}
