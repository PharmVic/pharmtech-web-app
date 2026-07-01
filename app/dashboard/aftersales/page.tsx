"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ShieldCheck, Calendar, ClipboardList, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

type AftersalesRegistration = {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    product_purchased: string;
    purchase_date: string;
    status: string;
    created_at: string;
};

export default function ClientAftersalesPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [successText, setSuccessText] = useState("");

    // Form inputs
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [customProduct, setCustomProduct] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");

    // Fetched data
    const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);
    const [registrations, setRegistrations] = useState<AftersalesRegistration[]>([]);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/auth/sign-in");
            return;
        }

        const currentUser = session.user;
        setUser(currentUser);

        // Pre-populate email
        setEmail(currentUser.email || "");

        try {
            // Fetch profiles to pre-populate name and phone
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, phone")
                .eq("id", currentUser.id)
                .single();

            if (profile) {
                setName(profile.full_name || "");
                setPhone(profile.phone || "");
            }

            // Fetch previous successful orders to extract products they bought
            const { data: payments } = await supabase
                .from("payments")
                .select("items")
                .eq("user_id", currentUser.id);

            const productsList: string[] = [];
            payments?.forEach((payment: any) => {
                const items = payment.items;
                if (Array.isArray(items)) {
                    items.forEach((item: any) => {
                        if (item?.name && !productsList.includes(item.name)) {
                            productsList.push(item.name);
                        }
                    });
                }
            });
            setPurchasedProducts(productsList);

            // Fetch existing aftersales registrations
            await fetchRegistrations(currentUser.id);

        } catch (err) {
            console.error("Error loading user profile or orders", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchRegistrations(userId: string) {
        const { data, error } = await supabase
            .from("aftersales_registrations")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setRegistrations(data);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setErrorText("");
        setSuccessText("");
        setSubmitting(true);

        const finalProduct = selectedProduct === "custom" || !selectedProduct ? customProduct : selectedProduct;

        if (!finalProduct.trim()) {
            setErrorText("Please specify the product purchased.");
            setSubmitting(false);
            return;
        }

        try {
            const { error } = await supabase
                .from("aftersales_registrations")
                .insert({
                    user_id: user.id,
                    customer_name: name,
                    customer_email: email,
                    customer_phone: phone,
                    product_purchased: finalProduct.trim(),
                    purchase_date: purchaseDate,
                });

            if (error) throw error;

            setSuccessText("Aftersales support registration submitted successfully!");
            // Reset form fields except profile defaults
            setSelectedProduct("");
            setCustomProduct("");
            setPurchaseDate("");
            
            // Refresh registrations list
            await fetchRegistrations(user.id);
        } catch (err: any) {
            console.error("Submission error:", err);
            setErrorText(err.message || "Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading your profile details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 py-8 md:py-12">
            {/* Header & Back Navigation */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-blue-600" /> Aftersales Support Registration
                    </h1>
                    <p className="text-gray-600 text-sm">Register your purchased product to activate warranty and maintenance support.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Container (Col Span 2) */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b">Fill Purchase Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errorText && (
                            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-start gap-2 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{errorText}</span>
                            </div>
                        )}

                        {successText && (
                            <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-start gap-2 text-sm">
                                <CheckCircle className="w-5 h-5 shrink-0" />
                                <span>{successText}</span>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                                placeholder="Your full name"
                            />
                        </div>

                        {/* Email & Phone grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                                    placeholder="yourname@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                                    placeholder="e.g. +2348000000000"
                                />
                            </div>
                        </div>

                        {/* Product Purchased Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Product Purchased *</label>
                            {purchasedProducts.length > 0 ? (
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all mb-3"
                                >
                                    <option value="">-- Select from your orders --</option>
                                    {purchasedProducts.map((prod, i) => (
                                        <option key={i} value={prod}>{prod}</option>
                                    ))}
                                    <option value="custom">Other / Custom product (specify below)</option>
                                </select>
                            ) : null}

                            {(purchasedProducts.length === 0 || selectedProduct === "custom") && (
                                <input
                                    type="text"
                                    required
                                    value={customProduct}
                                    onChange={(e) => setCustomProduct(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                                    placeholder="Specify product name (e.g. 5KVA Solar Hybrid Inverter)"
                                />
                            )}
                        </div>

                        {/* Purchased Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Date Purchased *</label>
                            <input
                                type="date"
                                required
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                            />
                        </div>

                        <div className="pt-3 border-t">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>Register Support</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Info Card (Col Span 1) */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-md flex flex-col justify-between h-fit gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardList className="w-6 h-6 text-yellow-300" />
                            <h3 className="font-bold text-lg">Aftersales Benefits</h3>
                        </div>
                        <ul className="text-xs space-y-3 leading-relaxed opacity-95">
                            <li className="flex gap-2">
                                <span className="text-yellow-300 font-bold">✓</span>
                                <span>**Extended Warranty:** Protect your products against factory defaults.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-yellow-300 font-bold">✓</span>
                                <span>**Free Maintenance Checks:** Scheduling cleanings and optimization tests.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-yellow-300 font-bold">✓</span>
                                <span>**Priority Assistance:** Speak to dedicated customer support agents.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="text-[10px] opacity-75 border-t border-white/20 pt-4 mt-2">
                        * Note: registrations must correspond to actual receipts or purchases. Admin reserves the right to review and verify all details.
                    </div>
                </div>
            </div>

            {/* List of submissions */}
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Your Aftersales Registrations</h2>
                    <p className="text-gray-600 text-xs mt-1">Track the status of your product support enrollments.</p>
                </div>

                {registrations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        You have not registered any products for aftersales support yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-gray-700 font-medium">
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Purchase Date</th>
                                    <th className="p-4">Registered On</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((reg) => {
                                    let badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-200";
                                    if (reg.status === "active") badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                                    if (reg.status === "resolved") badgeColor = "bg-green-50 text-green-700 border-green-200";

                                    return (
                                        <tr key={reg.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-semibold text-gray-900">{reg.product_purchased}</td>
                                            <td className="p-4 text-gray-600">{new Date(reg.purchase_date).toLocaleDateString()}</td>
                                            <td className="p-4 text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${badgeColor}`}>
                                                    {reg.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
