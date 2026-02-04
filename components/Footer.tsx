import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer bg-gray-900 text-white mt-auto">
            <div className="container mx-auto py-16 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="footer-item">
                        <h3 className="text-2xl font-bold mb-4 text-white">PHARMTECH</h3>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                            Your trusted partner in advanced CCTV, Solar Energy, Networking, and Automation solutions.
                        </p>
                        <div className="flex gap-2">
                            {/* Social Icons Placeholder using btn-square */}
                            <div className="btn btn-square btn-primary rounded-circle"><span className="font-bold">fb</span></div>
                            <div className="btn btn-square btn-primary rounded-circle"><span className="font-bold">tw</span></div>
                            <div className="btn btn-square btn-primary rounded-circle"><span className="font-bold">ig</span></div>
                        </div>
                    </div>
                    <div className="footer-item">
                        <h4 className="text-lg font-bold mb-4 text-white">Products</h4>
                        <Link href="/products/cctv" className="text-gray-400 hover:text-blue-500 mb-2 block">CCTV Systems</Link>
                        <Link href="/products/solar" className="text-gray-400 hover:text-blue-500 mb-2 block">Solar Energy</Link>
                        <Link href="/products/networking" className="text-gray-400 hover:text-blue-500 mb-2 block">Networking</Link>
                        <Link href="/products/automation" className="text-gray-400 hover:text-blue-500 mb-2 block">Automation</Link>
                    </div>
                    <div className="footer-item">
                        <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
                        <Link href="/about" className="text-gray-400 hover:text-blue-500 mb-2 block">About Us</Link>
                        <Link href="/contact" className="text-gray-400 hover:text-blue-500 mb-2 block">Contact Support</Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-blue-500 mb-2 block">Privacy Policy</Link>
                        <Link href="/terms" className="text-gray-400 hover:text-blue-500 mb-2 block">Terms & Conditions</Link>
                    </div>
                    <div className="footer-item">
                        <h4 className="text-lg font-bold mb-4 text-white">Contact Info</h4>
                        <p className="text-gray-400 mb-2">123 Street Name, City, Country</p>
                        <p className="text-gray-400 mb-2">+123 456 7890</p>
                        <p className="text-gray-400 mb-2">info@pharmtech.com</p>
                    </div>
                </div>
            </div>
            <div className="copyright bg-black py-6 text-center text-sm text-gray-500 border-t border-gray-800">
                &copy; {new Date().getFullYear()} Pharmtech. All rights reserved.
            </div>
        </footer>
    );
}
