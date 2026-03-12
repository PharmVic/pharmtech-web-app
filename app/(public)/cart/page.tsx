"use client";

import { useCartStore } from "@/lib/store/cartStore";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, getTotalAmount, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // Avoid hydration mismatch

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/products" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors w-full inline-block">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <div className="mb-8">
                    <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Cart Items ({items.length})</h2>
                                <button 
                                    onClick={clearCart}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 py-4 border-b border-gray-50 last:border-0 last:pb-0">
                                        
                                        {/* Image */}
                                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{item.name}</h3>
                                            <div className="text-blue-600 font-bold">₦{item.price.toLocaleString()}</div>
                                        </div>

                                        {/* Quantity & Actions */}
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 hover:bg-gray-200 rounded-l-lg text-gray-600 transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-medium text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 hover:bg-gray-200 rounded-r-lg text-gray-600 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">Order Summary</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">₦{getTotalAmount().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-gray-900">Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg text-gray-900">Total</span>
                                    <span className="font-bold text-2xl text-blue-600">₦{getTotalAmount().toLocaleString()}</span>
                                </div>
                            </div>

                            <Link 
                                href="/checkout" 
                                className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-xl flex justify-center items-center hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
