"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Sparkles, SlidersHorizontal } from "lucide-react";
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
    const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null);

    const filteredServices = initialServices.filter((svc) => {
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            return (
                svc.title.toLowerCase().includes(query) ||
                svc.desc.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div id="services-search" className="py-16 bg-slate-50/70 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Featured Products
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                        Our Products
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                        Explore our high-performance solar energy systems, 24/7 CCTV surveillance, 
                        hybrid inverters, and enterprise networking equipment.
                    </p>

                    {/* Search Bar matching reference image */}
                    <div className="mt-8 max-w-md mx-auto flex items-center gap-2">
                        <div className="relative flex-1 flex items-center w-full h-12 rounded-2xl bg-white shadow-xs border border-gray-200/80 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20">
                            <div className="grid place-items-center h-full w-12 text-amber-500">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                className="h-full w-full outline-none text-xs md:text-sm text-gray-800 pr-4 placeholder-gray-300"
                                type="text"
                                placeholder="Search for anything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button 
                            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-amber-500 hover:bg-amber-50 shadow-xs flex items-center justify-center flex-shrink-0 transition-colors"
                            title="Filter Products"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                        {filteredServices.map((svc, idx) => {
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
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">No products match your search query.</p>
                    </div>
                )}

                {/* View All Store Products CTA */}
                <div className="mt-12 text-center">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95"
                    >
                        Explore Complete Store Catalog
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
