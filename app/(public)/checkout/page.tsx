"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { sendTikTokEvent } from "@/lib/tiktok";

const PaystackCheckout = dynamic(() => import("@/components/PaystackCheckout"), {
    ssr: false,
});

export default function CheckoutPage() {
    const { items, getTotalAmount } = useCartStore();
    const router = useRouter();

    const [userId, setUserId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    // Default delivery date to 3 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    const [deliveryDate, setDeliveryDate] = useState(defaultDate.toISOString().split("T")[0]);

    const storageKey = 'checkout_draft';

    // Load draft
    useEffect(() => {
        if (typeof window !== "undefined") {
            const draft = localStorage.getItem(storageKey);
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    if (parsed.email) setEmail(parsed.email);
                    if (parsed.phone) setPhone(parsed.phone);
                    if (parsed.location) setLocation(parsed.location);
                    if (parsed.deliveryDate) setDeliveryDate(parsed.deliveryDate);
                } catch (e) {
                    console.error("Failed to parse checkout draft", e);
                }
            }
        }
    }, [storageKey]);

    // Save draft
    useEffect(() => {
        if (typeof window !== "undefined") {
            const draft = { email, phone, location, deliveryDate };
            // Only save if there's actually some data typed to prevent overwriting with empty defaults immediately
            if (email || phone || location) {
                localStorage.setItem(storageKey, JSON.stringify(draft));
            }
        }
    }, [email, phone, location, deliveryDate, storageKey]);

    const [mounted, setMounted] = useState(false);
    const [trackedCheckout, setTrackedCheckout] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Get user session for order linking
        supabase.auth.getSession().then(({ data }) => {
            if (data?.session?.user) {
                setUserId(data.session.user.id);
                if (!email) setEmail(data.session.user.email || "");
                if (!phone) setPhone(data.session.user.user_metadata?.phone || "");
            } else {
                // If they somehow got here without being logged in
                alert("You must be logged in to checkout.");
                router.push("/auth/sign-in");
            }
        });
    }, [router]);

    useEffect(() => {
        if (mounted && items.length === 0) {
            router.push("/cart");
        }
    }, [mounted, items, router]);

    useEffect(() => {
        if (mounted && items.length > 0 && userId && !trackedCheckout) {
            setTrackedCheckout(true);
            sendTikTokEvent({
                event: "InitiateCheckout",
                user: {
                    email: email || undefined,
                    phone: phone || undefined,
                },
                properties: {
                    content_type: "product_group",
                    content_id: items.map(item => item.id).join(','),
                    value: getTotalAmount(),
                    currency: "NGN",
                    contents: items.map(item => ({
                        content_id: item.id,
                        content_name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }).catch(console.error);
        }
    }, [mounted, items, userId, trackedCheckout, email, phone, getTotalAmount]);

    if (!mounted || items.length === 0 || !userId) return null; // Let the effect handle it

    const handlePaymentSuccess = (reference: string) => {
        useCartStore.getState().clearCart();
        localStorage.removeItem(storageKey); // Clear checkout draft
        alert(`Payment successful! Reference: ${reference}`);
        router.push("/dashboard"); // Redirect to dashboard to see their order!
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
                                    min={new Date().toISOString().split("T")[0]}
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
                                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
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
                                items={items}
                                userId={userId}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
