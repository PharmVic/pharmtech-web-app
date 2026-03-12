"use client";

import { useState } from "react";

type ProductGalleryProps = {
    images: string[];
    alt: string;
    isFeatured?: boolean;
};

export default function ProductGallery({ images, alt, isFeatured }: ProductGalleryProps) {
    const [mainImage, setMainImage] = useState(images.length > 0 ? images[0] : null);

    if (!images || images.length === 0) {
        return (
            <div className="relative h-96 md:h-[500px] bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center text-gray-500">
                <span>No Image Available</span>
                {isFeatured && (
                    <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full shadow-sm z-10">
                        Featured
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative h-96 md:h-[500px] bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={alt}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span>No Image Available</span>
                    </div>
                )}
                {isFeatured && (
                    <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full shadow-sm z-10">
                        Featured
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((url, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImage(url)}
                            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${mainImage === url ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img src={url} alt={`${alt} - view ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
