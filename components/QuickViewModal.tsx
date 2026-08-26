"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, CheckCircle, ShieldCheck, ArrowRight, Eye, Tag } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import ShareButton from "./ShareButton";

export interface ProductType {
    id: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    image_urls?: string[];
    is_available?: boolean;
    is_featured?: boolean;
    is_promo_active?: boolean;
    promo_price?: number;
    allow_instalments?: boolean;
    instalment_down_payment?: number;
    category_id?: string;
    product_categories?: {
        id: string;
        name: string;
        slug: string;
    };
}

interface QuickViewModalProps {
    product: ProductType | null;
    onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
    if (!product) return null;

    const imageUrls = (product.image_urls && product.image_urls.length > 0)
        ? product.image_urls
        : (product.image_url ? [product.image_url] : ["/placeholder-product.png"]);

    const [selectedImage, setSelectedImage] = useState(imageUrls[0]);

    const activePrice = (product.is_promo_active && product.promo_price)
        ? product.promo_price
        : product.price;

    const hasDiscount = product.is_promo_active && product.promo_price && product.price > product.promo_price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.promo_price!) / product.price) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
            {/* Modal Box */}
            <div 
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 transform transition-all animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left: Gallery */}
                    <div className="bg-gray-50 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
                        {/* Main Image Display */}
                        <div className="relative h-72 sm:h-80 w-full rounded-2xl bg-white p-4 shadow-sm overflow-hidden flex items-center justify-center group">
                            {selectedImage && selectedImage !== "/placeholder-product.png" ? (
                                <Image
                                    src={selectedImage}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <span className="text-xs">No image available</span>
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                {product.is_featured && (
                                    <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                                        ★ Featured
                                    </span>
                                )}
                                {hasDiscount && (
                                    <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                                        -{discountPercent}% OFF
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Image Thumbnails */}
                        {imageUrls.length > 1 && (
                            <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                                {imageUrls.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-16 h-16 rounded-xl overflow-hidden bg-white border-2 flex-shrink-0 transition-all ${
                                            selectedImage === img
                                                ? "border-blue-600 ring-2 ring-blue-600/30 scale-105"
                                                : "border-gray-200 opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} ${idx + 1}`}
                                            fill
                                            sizes="64px"
                                            className="object-contain p-1"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="p-6 md:p-8 flex flex-col justify-between bg-white">
                        <div>
                            {/* Category Pill & Stock */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                                {product.product_categories && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                        <Tag className="w-3.5 h-3.5" />
                                        {product.product_categories.name}
                                    </span>
                                )}
                                {product.is_available === false ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                        Out of Stock
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                        In Stock & Ready
                                    </span>
                                )}
                            </div>

                            {/* Product Title */}
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
                                {product.name}
                            </h2>

                            {/* Price */}
                            <div className="mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-baseline gap-3">
                                {hasDiscount ? (
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm line-through text-gray-400">
                                                ₦{product.price.toLocaleString("en-NG")}
                                            </span>
                                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                Save ₦{(product.price - product.promo_price!).toLocaleString("en-NG")}
                                            </span>
                                        </div>
                                        <span className="text-3xl font-black text-emerald-600">
                                            ₦{product.promo_price!.toLocaleString("en-NG")}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-black text-blue-600">
                                        {product.price ? `₦${product.price.toLocaleString("en-NG")}` : "Contact for Price"}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">
                                {product.description || "High-quality, reliable solution designed for optimum performance, safety, and longevity."}
                            </p>

                            {/* Highlights */}
                            <div className="space-y-2 mb-6 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Genuine Brand & Industry-Tested Performance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    <span>Official Warranty & Expert Technical Support</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex items-center gap-3">
                                <AddToCartButton
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        price: activePrice,
                                        image_url: imageUrls[0],
                                        is_available: product.is_available,
                                    }}
                                    large={true}
                                />
                                <ShareButton title={product.name} />
                            </div>

                            <Link
                                href={`/product/${product.id}`}
                                onClick={onClose}
                                className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                View Full Product Details
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
