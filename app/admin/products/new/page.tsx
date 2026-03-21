"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

type Category = {
    id: string;
    name: string;
};

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Promo State
    const [isPromoActive, setIsPromoActive] = useState(false);
    const [promoPrice, setPromoPrice] = useState("");

    // Instalment State
    const [allowInstalments, setAllowInstalments] = useState(false);
    const [instalmentDownPayment, setInstalmentDownPayment] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        const { data } = await supabase.from("product_categories").select("*").order("name");
        setCategories(data || []);
        // Pre-select first category if available
        if (data && data.length > 0) setCategoryId(data[0].id);
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);

            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    }

    function removeImage(index: number) {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";
            let imageUrls: string[] = [];

            // 1. Upload Images (if selected)
            if (imageFiles.length > 0) {
                for (const file of imageFiles) {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("products")
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from("products")
                        .getPublicUrl(filePath);

                    imageUrls.push(publicUrl);
                }

                imageUrl = imageUrls[0]; // First image as main image
            }

            // 2. Insert Product
            const { error: insertError } = await supabase.from("products").insert({
                name,
                description,
                price: Number(price),
                category_id: categoryId || null, // Handle no category gracefully
                image_url: imageUrl,
                image_urls: imageUrls,
                is_promo_active: isPromoActive,
                promo_price: promoPrice ? Number(promoPrice) : null,
                allow_instalments: allowInstalments,
                instalment_down_payment: instalmentDownPayment ? Number(instalmentDownPayment) : 0,
            });

            if (insertError) throw insertError;

            alert("Product added successfully!");
            router.push("/admin/products");
            router.refresh();

        } catch (err: any) {
            console.error("Error adding product:", err);
            const errorMessage = err?.message || err?.error_description || JSON.stringify(err) || "Unknown error occurred";
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Link href="/admin/products" className="flex items-center text-gray-600 hover:text-black mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Products
            </Link>

            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                        <div className="flex flex-wrap gap-4 items-start">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative w-32 h-32 bg-gray-100 rounded-lg border-2 border-gray-300 overflow-hidden group">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 hidden group-hover:flex items-center justify-center">
                                        <button type="button" onClick={() => removeImage(index)} className="text-white bg-red-500 rounded-full p-2 hover:bg-red-600 transition shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <label className="cursor-pointer w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 hover:bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-600 transition">
                                <Upload className="w-6 h-6" />
                                <span className="text-xs font-medium text-center px-2">Add Images</span>
                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 5kVA Inverter"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                            <input
                                type="number"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Promotional Pricing</h3>
                                <p className="text-xs text-gray-500">Enable this to show a discounted price to customers.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isPromoActive}
                                    onChange={(e) => setIsPromoActive(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        {isPromoActive && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Promo Price (₦)</label>
                                <input
                                    type="number"
                                    required={isPromoActive}
                                    value={promoPrice}
                                    onChange={(e) => setPromoPrice(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Discounted Amount"
                                />
                            </div>
                        )}
                    </div>

                    {/* Instalment Settings */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Instalment Payments</h3>
                                <p className="text-xs text-gray-500">Enable this to allow customers to pay in instalments.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={allowInstalments}
                                    onChange={(e) => setAllowInstalments(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        {allowInstalments && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Down-payment Amount (₦)</label>
                                <input
                                    type="number"
                                    required={allowInstalments}
                                    value={instalmentDownPayment}
                                    onChange={(e) => setInstalmentDownPayment(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Initial required deposit"
                                />
                            </div>
                        )}
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="">Select a Category...</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="text-xs text-orange-500 mt-1">Warning: No categories found. Please run the SQL seed script for categories first.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Product details..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Saving..." : "Save Product"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
