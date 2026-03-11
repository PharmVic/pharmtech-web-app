"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PaystackCheckout = dynamic(() => import("@/components/PaystackCheckout"), {
    ssr: false,
});

export default function CheckoutPage() {
    const { items, getTotalAmount } = useCartStore();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    // Default delivery date to 3 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    const [deliveryDate, setDeliveryDate] = useState(defaultDate.toISOString().split("T")[0]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && items.length === 0) {
            router.push("/cart");
        }
    }, [mounted, items, router]);

    if (!mounted || items.length === 0) return null; // Let the effect handle it

    const handlePaymentSuccess = (reference: string) => {
        // The backend handles saving to DB, now we just clear cart and redirect.
        // Wait, the backend currently doesn't know about items. We should use a different verify endpoint or update the current one.
        // For now, PaystackCheckout component calls `/api/paystack/verify`.
        // Let's rely on the PaystackCheckout component's success callback.
        useCartStore.getState().clearCart();
        alert(`Payment successful! Reference: ${reference}`);
        router.push("/");
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Information</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="08012345678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                <textarea 
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="123 Main Street, City, State"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery Date</label>
                                <input 
                                    type="date" 
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
                        
                        <div className="flex-1 overflow-y-auto max-h-64 pr-2 mb-6 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 font-medium text-gray-700">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                            {item.quantity}
                                        </span>
                                        <span className="line-clamp-1 flex-1">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900 shrink-0">₦{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900">Total to Pay</span>
                                <span className="font-bold text-2xl text-blue-600">₦{getTotalAmount().toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <PaystackCheckout 
                                amount={getTotalAmount()}
                                email={email}
                                phone={phone}
                                location={location}
                                deliveryDate={deliveryDate}
                                onSuccess={handlePaymentSuccess}
                                items={items} // We need to pass items so it can be sent to backend! Let's update PaystackCheckout next.
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
