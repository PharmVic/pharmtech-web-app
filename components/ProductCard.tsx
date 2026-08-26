"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Star, Tag } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import { ProductType } from "./QuickViewModal";

interface ProductCardProps {
    product: ProductType;
    onQuickView?: (product: ProductType) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const imageUrl = (product.image_urls && product.image_urls.length > 0)
        ? product.image_urls[0]
        : (product.image_url || "/placeholder-product.png");

    const hasDiscount = product.is_promo_active && product.promo_price && product.price > product.promo_price;
    const activePrice = hasDiscount ? product.promo_price! : product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.promo_price!) / product.price) * 100)
        : 0;

    return (
        <div className="group relative bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full overflow-hidden">
            <div>
                {/* Top Image Frame - Landscape aspect ratio (reduces card vertical length) */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-50/80 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3">
                    {imageUrl && imageUrl !== "/placeholder-product.png" ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-1.5 transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <Tag className="w-8 h-8 opacity-40 mb-1" />
                            <span className="text-xs font-medium text-gray-400">Pharmtech</span>
                        </div>
                    )}

                    {/* Prominent Discount & Featured Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10 pointer-events-none">
                        {hasDiscount && (
                            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-extrabold uppercase rounded-full bg-emerald-600 text-white shadow-sm">
                                -{discountPercent}% OFF
                            </span>
                        )}
                        {product.is_featured && (
                            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase rounded-full bg-amber-500 text-white shadow-sm">
                                ★ Featured
                            </span>
                        )}
                    </div>

                    {/* Out of Stock Overlay */}
                    {product.is_available === false && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex items-center justify-center p-2">
                            <span className="bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-lg shadow-sm">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Quick View Trigger */}
                    {onQuickView && (
                        <button
                            onClick={() => onQuickView(product)}
                            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-gray-900 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                            title="Quick View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Star Ratings Visual */}
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 opacity-80" />
                    </div>
                    <span className="text-xs font-bold text-amber-600">4.9</span>
                    {product.product_categories?.name && (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
                            {product.product_categories.name}
                        </span>
                    )}
                </div>

                {/* Primary Product Name (Clear & Legible lettering) */}
                <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-1.5 group-hover:text-blue-600 transition-colors" title={product.name}>
                    <Link href={`/product/${product.id}`}>
                        {product.name}
                    </Link>
                </h3>

                {/* Primary Description / Specs */}
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {product.description || "High-quality, reliable solution for home & business."}
                </p>
            </div>

            {/* Price Breakdown & Actions */}
            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
                <div className="flex flex-col min-w-0">
                    {hasDiscount ? (
                        <>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs line-through text-gray-400 font-medium">
                                    ₦{product.price.toLocaleString("en-NG")}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                    Save ₦{(product.price - product.promo_price!).toLocaleString("en-NG")}
                                </span>
                            </div>
                            <span className="text-base sm:text-lg font-black text-emerald-600 leading-none truncate">
                                ₦{product.promo_price!.toLocaleString("en-NG")}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Price</span>
                            <span className="text-base sm:text-lg font-black text-blue-600 leading-none truncate">
                                {product.price ? `₦${product.price.toLocaleString("en-NG")}` : "Contact Us"}
                            </span>
                        </>
                    )}
                </div>

                {/* Actions: Wishlist + Add to Cart */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isWishlisted
                                ? "bg-red-50 text-red-500"
                                : "text-gray-400 hover:text-red-500 hover:bg-gray-50"
                        }`}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-red-500" : ""}`} />
                    </button>

                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            price: activePrice,
                            image_url: imageUrl,
                            is_available: product.is_available,
                        }}
                        showText={false}
                        className="w-8 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full p-0 flex items-center justify-center shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
}
