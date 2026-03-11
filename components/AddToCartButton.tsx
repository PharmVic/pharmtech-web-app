"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

interface AddToCartButtonProps {
    product: {
        id: string;
        name: string;
        price: number;
        image_url?: string;
    };
    large?: boolean; // If true, renders a larger button with text (for product detail page). If false, renders just the icon (for product cards).
}

export default function AddToCartButton({ product, large = false }: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();
        
        // If price is 0 or null, it might be "Contact Us" so we don't allow adding to cart
        if (!product.price) {
            alert("This product is currently only available via inquiry.");
            return;
        }

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url,
        });
        
        alert("Added to cart!"); // Simple feedback for now
    };

    if (!product.price) {
        // Render a disabled or inquiry state button
        if (large) {
             return (
                 <button disabled className="flex-1 bg-gray-300 text-gray-500 font-semibold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart Unavailable
                </button>
             )
        }
        return (
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center cursor-not-allowed" title="Price not available">
                <ShoppingCart className="w-5 h-5" />
            </div>
        );
    }

    if (large) {
        return (
            <button 
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
            </button>
        );
    }

    return (
        <button 
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
            title="Add to Cart"
        >
            <ShoppingCart className="w-5 h-5" />
        </button>
    );
}
