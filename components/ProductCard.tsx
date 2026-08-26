"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Star, Tag, ArrowRight } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { ProductType } from "./QuickViewModal";

interface ProductCardProps {
    product: ProductType;
    onQuickView?: (product: ProductType) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
    const imageUrl = (product.image_urls && product.image_urls.length > 0)
        ? product.image_urls[0]
        : (product.image_url || "/placeholder-product.png");

    const hasDiscount = product.is_promo_active && product.promo_price && product.price > product.promo_price;
    const activePrice = hasDiscount ? product.promo_price! : product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.promo_price!) / product.price) * 100)
        : 0;

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden transform hover:-translate-y-1">
            {/* Image & Overlay Frame */}
            <div className="relative h-40 sm:h-64 w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3 sm:p-6">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] sm:[background-size:16px_16px] opacity-40 group-hover:opacity-60 transition-opacity" />

                {imageUrl && imageUrl !== "/placeholder-product.png" ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-2 sm:p-4 transition-transform duration-500 ease-out group-hover:scale-105 z-10"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 z-10">
                        <Tag className="w-6 h-6 sm:w-10 sm:h-10 opacity-30 mb-1" />
                        <span className="text-[10px] sm:text-xs font-medium">Pharmtech Product</span>
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-start justify-between z-20 pointer-events-none">
                    <div className="flex flex-col gap-1 items-start">
                        {product.is_featured && (
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-sm">
                                ★ Featured
                            </span>
                        )}
                        {hasDiscount && (
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-black uppercase tracking-wider rounded-full bg-emerald-600 text-white shadow-sm">
                                -{discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {product.product_categories?.name && (
                        <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/90 backdrop-blur-md text-gray-700 shadow-sm border border-gray-100/80">
                            {product.product_categories.name}
                        </span>
                    )}
                </div>

                {/* Out of Stock Overlay */}
                {product.is_available === false && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] z-30 flex items-center justify-center p-2">
                        <span className="bg-red-600 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-md border-2 border-white transform -rotate-6">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Quick Action Floating Bar on Hover */}
                <div className="absolute inset-x-0 bottom-2 sm:bottom-4 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-30 px-2 sm:px-4">
                    {onQuickView && (
                        <button
                            onClick={() => onQuickView(product)}
                            className="flex-1 py-1.5 sm:py-2.5 px-2 sm:px-3 bg-white/95 backdrop-blur-md hover:bg-gray-900 hover:text-white text-gray-800 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-1"
                            title="Quick View"
                        >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Quick View</span>
                            <span className="sm:hidden">View</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-3 sm:p-5 flex flex-col flex-grow justify-between bg-white relative z-10">
                <div>
                    {/* Stars Rating Visual */}
                    <div className="flex items-center gap-1 mb-1 sm:mb-2">
                        <div className="flex text-amber-400">
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 opacity-80" />
                        </div>
                        <span className="text-[9px] sm:text-[11px] font-semibold text-gray-400 ml-0.5 hidden sm:inline">4.9 (High Quality)</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs sm:text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1 sm:mb-2" title={product.name}>
                        <Link href={`/product/${product.id}`}>
                            {product.name}
                        </Link>
                    </h3>

                    {/* Description preview - hidden on small screens for compact height */}
                    <p className="hidden sm:block text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {product.description || "Premium quality solution built for optimum efficiency and long-term durability."}
                    </p>
                </div>

                {/* Price & Action Footer */}
                <div className="pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5 sm:gap-3 mt-auto">
                    <div className="flex flex-col min-w-0">
                        {hasDiscount ? (
                            <>
                                <span className="text-[10px] sm:text-xs line-through text-gray-400 font-medium">
                                    ₦{product.price.toLocaleString("en-NG")}
                                </span>
                                <span className="text-sm sm:text-lg font-black text-emerald-600 leading-none truncate">
                                    ₦{product.promo_price!.toLocaleString("en-NG")}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase tracking-wider hidden sm:block">Price</span>
                                <span className="text-sm sm:text-lg font-black text-blue-600 leading-none truncate">
                                    {product.price ? `₦${product.price.toLocaleString("en-NG")}` : "Contact Us"}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <AddToCartButton
                            product={{
                                id: product.id,
                                name: product.name,
                                price: activePrice,
                                image_url: imageUrl,
                                is_available: product.is_available,
                            }}
                            showText={false}
                            className="w-8 h-8 sm:w-10 sm:h-10 text-xs"
                        />
                        <Link
                            href={`/product/${product.id}`}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 hover:bg-gray-900 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                            title="View product details"
                        >
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
