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
        <div className="group relative bg-white rounded-2xl p-3 sm:p-4 border border-gray-100/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full overflow-hidden">
            <div>
                {/* Restored Normal Aspect Image Frame */}
                <div className="relative h-36 sm:h-48 w-full bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 mb-2.5">
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
                            <Tag className="w-7 h-7 opacity-40 mb-1" />
                            <span className="text-[10px] font-medium text-gray-400">Pharmtech</span>
                        </div>
                    )}

                    {/* Discount & Featured Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10 pointer-events-none">
                        {hasDiscount && (
                            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase rounded-full bg-emerald-600 text-white shadow-xs">
                                -{discountPercent}% OFF
                            </span>
                        )}
                        {product.is_featured && (
                            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded-full bg-amber-500 text-white shadow-xs">
                                ★ Featured
                            </span>
                        )}
                    </div>

                    {/* Out of Stock Overlay */}
                    {product.is_available === false && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex items-center justify-center p-2">
                            <span className="bg-red-600 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Quick View Button */}
                    {onQuickView && (
                        <button
                            onClick={() => onQuickView(product)}
                            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-md text-gray-700 hover:bg-gray-900 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
                            title="Quick View"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Rating Stars & Category */}
                <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400" />
                            <Star className="w-3 h-3 fill-amber-400 opacity-80" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-600">4.9</span>
                    </div>

                    {product.product_categories?.name && (
                        <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                            {product.product_categories.name}
                        </span>
                    )}
                </div>

                {/* Optimized Product Name Display - Mobile & Desktop */}
                <h3 className="text-[10.5px] sm:text-xs font-bold text-gray-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.25rem] leading-tight mb-1 hover:text-blue-600 transition-colors" title={product.name}>
                    <Link href={`/product/${product.id}`}>
                        {product.name}
                    </Link>
                </h3>

                {/* Specs / Short Description snippet */}
                <p className="text-[10px] sm:text-[11px] text-gray-400 line-clamp-1 font-normal mb-2 sm:mb-2.5">
                    {product.description || "High-quality solar & security solution."}
                </p>
            </div>

            {/* Prominent Price & Action Row (Guaranteed 100% Full Visible Price Before Clicking) */}
            <div className="pt-2 border-t border-gray-100 flex flex-wrap xs:flex-nowrap items-center justify-between gap-1 mt-auto">
                {/* Guaranteed Visible Full Price Box */}
                <div className="flex flex-col justify-center shrink-0 min-w-0 pr-0.5">
                    {hasDiscount ? (
                        <div className="flex flex-col">
                            <span className="text-[8.5px] sm:text-[9px] line-through text-gray-400 font-medium leading-none mb-0.5 whitespace-nowrap">
                                ₦{product.price.toLocaleString("en-NG")}
                            </span>
                            <span className="text-[11px] sm:text-sm font-extrabold text-emerald-600 leading-none whitespace-nowrap">
                                ₦{product.promo_price!.toLocaleString("en-NG")}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase font-semibold text-gray-400 leading-none mb-0.5">Price</span>
                            <span className="text-[11px] sm:text-sm font-extrabold text-gray-900 leading-none whitespace-nowrap">
                                {product.price ? `₦${product.price.toLocaleString("en-NG")}` : "Contact Us"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                    <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                            isWishlisted
                                ? "bg-red-50 text-red-500"
                                : "text-gray-400 hover:text-red-500 hover:bg-gray-50"
                        }`}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${isWishlisted ? "fill-red-500" : ""}`} />
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
                        className="w-6 h-6 sm:w-7 sm:h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full p-0 flex items-center justify-center shadow-xs"
                    />
                </div>
            </div>
        </div>
    );
}
