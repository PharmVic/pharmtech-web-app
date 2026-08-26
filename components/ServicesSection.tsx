"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, Sparkles, ShoppingBag, Layers } from "lucide-react";
import ProductCard from "./ProductCard";
import QuickViewModal, { ProductType } from "./QuickViewModal";

type Service = {
    title: string;
    img: string;
    link: string;
    desc: string;
    isProduct?: boolean;
    price?: number;
    is_promo_active?: boolean;
    promo_price?: number;
    is_available?: boolean;
    is_featured?: boolean;
};

export default function ServicesSection({ initialServices }: { initialServices: Service[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "products" | "services">("all");
    const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null);

    const filteredServices = initialServices.filter((svc) => {
        if (activeTab === "products" && !svc.isProduct) return false;
        if (activeTab === "services" && svc.isProduct) return false;

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            return (
                svc.title.toLowerCase().includes(query) ||
                svc.desc.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const productCount = initialServices.filter(s => s.isProduct).length;
    const categoryCount = initialServices.filter(s => !s.isProduct).length;

    return (
        <div id="services-search" className="py-16 bg-slate-50/70 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Solutions & Storefront
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                        Our Products & Services
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                        Explore our comprehensive solutions spanning high-capacity solar energy systems, 
                        24/7 CCTV surveillance, and enterprise networking hardware.
                    </p>

                    {/* Search & Tabs Container */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-3xl shadow-sm border border-gray-200/80">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                    activeTab === "all"
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                All ({initialServices.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("products")}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                    activeTab === "products"
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Products ({productCount})
                            </button>
                            <button
                                onClick={() => setActiveTab("services")}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                    activeTab === "services"
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                Categories ({categoryCount})
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                type="text"
                                placeholder="Search products or services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredServices.map((svc, idx) => {
                            if (svc.isProduct) {
                                const productObj: ProductType = {
                                    id: svc.link,
                                    name: svc.title,
                                    price: svc.price || 0,
                                    description: svc.desc,
                                    image_url: svc.img,
                                    is_available: svc.is_available,
                                    is_featured: svc.is_featured,
                                    is_promo_active: svc.is_promo_active,
                                    promo_price: svc.promo_price,
                                };

                                return (
                                    <ProductCard
                                        key={idx}
                                        product={productObj}
                                        onQuickView={(p) => setQuickViewProduct(p)}
                                    />
                                );
                            }

                            // Category Card
                            return (
                                <Link
                                    key={idx}
                                    href={`/products/${svc.link}`}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1.5"
                                >
                                    <div className="relative h-56 bg-slate-100 overflow-hidden">
                                        <Image
                                            src={svc.img}
                                            alt={svc.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                                        
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-600/90 backdrop-blur-md inline-block mb-1">
                                                Category
                                            </span>
                                            <h3 className="text-xl font-extrabold leading-tight text-white group-hover:text-blue-300 transition-colors">
                                                {svc.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow justify-between bg-white">
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                                            {svc.desc}
                                        </p>
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto text-xs font-bold text-blue-600 group-hover:text-blue-700">
                                            <span>Explore Products</span>
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">No products or categories match your search.</p>
                    </div>
                )}

                {/* View All Store Products CTA Banner */}
                <div className="mt-12 text-center">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95"
                    >
                        Browse All Store Products & Categories
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
}
