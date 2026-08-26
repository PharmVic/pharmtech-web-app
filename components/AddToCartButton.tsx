"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useToastStore } from "@/lib/store/toastStore";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { sendTikTokEvent } from "@/lib/tiktok";

interface AddToCartButtonProps {
    product: {
        id: string;
        name: string;
        price: number;
        image_url?: string;
        is_available?: boolean;
    };
    large?: boolean; // Large button with text
    showText?: boolean; // Show icon + text on smaller cards
    className?: string;
}

export default function AddToCartButton({ product, large = false, showText = false, className = "" }: AddToCartButtonProps) {
    const addItem = useCartStore((state) => state.addItem);
    const showToast = useToastStore((state) => state.showToast);
    const router = useRouter();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();
        
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
            showToast("Sign In Required", "Please sign in to add products to your cart.", "info");
            router.push("/auth/sign-in");
            return;
        }

        // If price is 0 or null, it might be "Contact Us" so we don't allow adding to cart
        if (!product.price) {
            showToast("Inquiry Only", "This product is currently available by inquiry.", "info");
            return;
        }

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url,
        });
        
        // Track AddToCart TikTok Event
        sendTikTokEvent({
            event: "AddToCart",
            user: {
                email: data.session?.user?.email,
            },
            properties: {
                content_type: "product",
                content_id: product.id,
                content_name: product.name,
                value: product.price,
                currency: "NGN",
                contents: [{
                    content_id: product.id,
                    content_name: product.name,
                    quantity: 1,
                    price: product.price,
                }]
            }
        }).catch(console.error);

        showToast(
            "Added to Cart!",
            `"${product.name}" has been added to your shopping cart.`,
            "success"
        );
    };

    if (!product.price) {
        if (large) {
             return (
                 <button disabled className="flex-1 bg-gray-200 text-gray-500 font-semibold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Inquiry Only
                </button>
             )
        }
        return (
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center cursor-not-allowed" title="Price not available">
                <ShoppingCart className="w-5 h-5" />
            </div>
        );
    }

    if (product.is_available === false) {
        if (large) {
             return (
                 <button disabled className="flex-1 bg-gray-200 text-gray-400 font-semibold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Out of Stock
                </button>
             )
        }
        return (
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-300 flex items-center justify-center cursor-not-allowed" title="Out of Stock">
                <ShoppingCart className="w-5 h-5" />
            </div>
        );
    }

    if (large) {
        return (
            <button 
                onClick={handleAddToCart}
                className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform active:scale-95 ${className}`}
            >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
            </button>
        );
    }

    if (showText) {
        return (
            <button
                onClick={handleAddToCart}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 ${className}`}
            >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
            </button>
        );
    }

    return (
        <button 
            onClick={handleAddToCart}
            className={`w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${className}`}
            title="Add to Cart"
        >
            <ShoppingCart className="w-5 h-5" />
        </button>
    );
}
