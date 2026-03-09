import Link from 'next/link';
import { Calculator, Package, Phone, FileText } from 'lucide-react';

const actions = [
    { label: 'Products', icon: Package, href: '/products', color: 'bg-blue-100 text-blue-600' },
    { label: 'Get Quote', icon: FileText, href: 'https://wa.me/2348142111657?text=Hello,%20I%20would%20like%20to%20get%20a%20quote.', color: 'bg-green-100 text-green-600' },
    { label: 'Solar Calc', icon: Calculator, href: '/calculator', color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Contact', icon: Phone, href: '/contact', color: 'bg-purple-100 text-purple-600' },
];

export default function HomepageActionIcons() {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {actions.map((action) => {
                        const isExternal = action.href.startsWith("http");
                        return (
                            <Link
                                key={action.label}
                                href={action.href}
                                target={isExternal ? "_blank" : undefined}
                                rel={isExternal ? "noopener noreferrer" : undefined}
                                className="flex flex-col items-center justify-center p-6 rounded-xl border hover:shadow-lg transition-all group"
                            >
                                <div className={`p-4 rounded-full mb-4 ${action.color} group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-8 h-8" />
                                </div>
                                <span className="font-semibold text-gray-800">{action.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
