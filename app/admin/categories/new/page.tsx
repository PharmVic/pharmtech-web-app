"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    };

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";

            // 1. Upload Image to Supabase (if selected)
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `category-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("products") // Reusing the same public products bucket for simplicity
                    .upload(filePath, imageFile, { cacheControl: '31536000', upsert: false });

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("products")
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // 2. Insert Category
            const { error: insertError } = await supabase.from("product_categories").insert({
                name,
                slug,
                description,
                image_url: imageUrl || null,
            });

            if (insertError) throw insertError;

            alert("Category added successfully!");
            router.push("/admin/categories");
            router.refresh();

        } catch (err: any) {
            console.error("Error adding category:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Link href="/admin/categories" className="flex items-center text-gray-600 hover:text-black mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Categories
            </Link>

            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Category</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Image (Optional)</label>
                        <div className="flex items-center gap-6">
                            <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-500" />
                                )}
                            </div>
                            <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Choose Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={handleNameChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. CCTV Security"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug URL</label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                placeholder="cctv-security"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Category overview..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Saving..." : "Save Category"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
