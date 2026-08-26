"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Star, Tag, ShoppingCart, ArrowRight } from "lucide-react";
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
        <div className="group relative bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden transform hover:-translate-y-1.5">
            {/* Image & Overlay Frame */}
            <div className="relative h-64 w-full bg-slate-50 overflow-hidden flex items-center justify-center p-6">
                {/* Background Grid Pattern for Luxury feel */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 group-hover:opacity-60 transition-opacity" />

                {imageUrl && imageUrl !== "/placeholder-product.png" ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-110 z-10"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 z-10">
                        <Tag className="w-10 h-10 opacity-30 mb-2" />
                        <span className="text-xs font-medium">Pharmtech Product</span>
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-20 pointer-events-none">
                    <div className="flex flex-col gap-1.5 items-start">
                        {product.is_featured && (
                            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20">
                                ★ Featured
                            </span>
                        )}
                        {hasDiscount && (
                            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                                -{discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {product.product_categories?.name && (
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-white/90 backdrop-blur-md text-gray-700 shadow-sm border border-gray-100/80">
                            {product.product_categories.name}
                        </span>
                    )}
                </div>

                {/* Out of Stock Overlay */}
                {product.is_available === false && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] z-30 flex items-center justify-center p-4">
                        <span className="bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg border-2 border-white transform -rotate-6">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Quick Action Floating Bar on Hover */}
                <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 z-30 px-4">
                    {onQuickView && (
                        <button
                            onClick={() => onQuickView(product)}
                            className="flex-1 py-2.5 px-3 bg-white/95 backdrop-blur-md hover:bg-gray-900 hover:text-white text-gray-800 text-xs font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5"
                            title="Quick View"
                        >
                            <Eye className="w-4 h-4" />
                            Quick View
                        </button>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex flex-col flex-grow justify-between bg-white relative z-10">
                <div>
                    {/* Stars Rating Visual */}
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-amber-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 opacity-80" />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-400 ml-1">4.9 (High Quality)</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2" title={product.name}>
                        <Link href={`/product/${product.id}`}>
                            {product.name}
                        </Link>
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {product.description || "Premium quality solution built for optimum efficiency and long-term durability."}
                    </p>
                </div>

                {/* Price & Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 mt-auto">
                    <div className="flex flex-col">
                        {hasDiscount ? (
                            <>
                                <span className="text-xs line-through text-gray-400 font-medium">
                                    ₦{product.price.toLocaleString("en-NG")}
                                </span>
                                <span className="text-lg font-black text-emerald-600 leading-none">
                                    ₦{product.promo_price!.toLocaleString("en-NG")}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Price</span>
                                <span className="text-lg font-black text-blue-600 leading-none">
                                    {product.price ? `₦${product.price.toLocaleString("en-NG")}` : "Contact Us"}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <AddToCartButton
                            product={{
                                id: product.id,
                                name: product.name,
                                price: activePrice,
                                image_url: imageUrl,
                                is_available: product.is_available,
                            }}
                            showText={false}
                        />
                        <Link
                            href={`/product/${product.id}`}
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-900 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200"
                            title="View product details"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
