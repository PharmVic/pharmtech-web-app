"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Tag } from "lucide-react";
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

    // Subtitle preview (short description or category)
    const subtitle = product.product_categories?.name 
        ? product.product_categories.name 
        : (product.description ? product.description : "High Quality Product");

    return (
        <div className="group relative bg-white rounded-[22px] p-3 sm:p-4 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full overflow-hidden">
            <div>
                {/* Top Image Frame */}
                <div className="relative h-36 sm:h-52 w-full bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3">
                    {imageUrl && imageUrl !== "/placeholder-product.png" ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-1 transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                            <Tag className="w-8 h-8 opacity-40 mb-1" />
                            <span className="text-[10px] font-medium text-gray-400">Pharmtech</span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
                        {product.is_featured && (
                            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded-full bg-amber-500 text-white shadow-xs">
                                Featured
                            </span>
                        )}
                        {hasDiscount && (
                            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase rounded-full bg-emerald-600 text-white shadow-xs">
                                -{discountPercent}%
                            </span>
                        )}
                    </div>

                    {/* Out of Stock */}
                    {product.is_available === false && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex items-center justify-center p-2">
                            <span className="bg-red-600 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3 py-1 rounded-lg shadow-sm">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Quick View Floating Button */}
                    {onQuickView && (
                        <button
                            onClick={() => onQuickView(product)}
                            className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-gray-900 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                            title="Quick View"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Product Info */}
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1 leading-snug mb-0.5 hover:text-blue-600 transition-colors" title={product.name}>
                    <Link href={`/product/${product.id}`}>
                        {product.name}
                    </Link>
                </h3>

                {/* Subtitle / Spec */}
                <p className="text-[11px] sm:text-xs text-gray-400 line-clamp-1 font-normal mb-3">
                    {subtitle}
                </p>
            </div>

            {/* Price & Action Row (Matching reference layout) */}
            <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2 mt-auto">
                <div className="flex flex-col min-w-0">
                    {hasDiscount ? (
                        <>
                            <span className="text-[10px] line-through text-gray-300 font-medium">
                                ₦{product.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs sm:text-base font-bold text-gray-900 leading-none truncate">
                                ₦{product.promo_price!.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs sm:text-base font-bold text-gray-900 leading-none truncate">
                            {product.price ? `₦${product.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}` : "Contact Us"}
                        </span>
                    )}
                </div>

                {/* Wishlist Heart & Add to Cart */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                            isWishlisted
                                ? "bg-amber-50 text-amber-500"
                                : "text-amber-500 hover:bg-amber-50/80"
                        }`}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isWishlisted ? "fill-amber-500" : ""}`} />
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
                        className="w-7 h-7 sm:w-8 sm:h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full p-0 flex items-center justify-center shadow-xs"
                    />
                </div>
            </div>
        </div>
    );
}
