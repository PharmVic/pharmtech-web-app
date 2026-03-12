"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const categoryId = resolvedParams.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form State
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchCategory();
    }, [categoryId]);

    async function fetchCategory() {
        setFetching(true);
        try {
            const { data: categoryData, error: categoryError } = await supabase
                .from("product_categories")
                .select("*")
                .eq("id", categoryId)
                .single();

            if (categoryError) throw categoryError;

            if (categoryData) {
                setName(categoryData.name || "");
                setSlug(categoryData.slug || "");
                setDescription(categoryData.description || "");
                setCurrentImageUrl(categoryData.image_url || "");
                setPreviewUrl(categoryData.image_url || "");
            }
        } catch (err) {
            console.error("Error fetching category:", err);
            alert("Failed to load category details.");
            router.push("/admin/categories");
        } finally {
            setFetching(false);
        }
    }

    // Auto-generate slug from name
    useEffect(() => {
        if (!fetching && name) {
            const generatedSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
            setSlug(generatedSlug);
        }
    }, [name, fetching]);

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
            let finalImageUrl = currentImageUrl;

            // 1. Upload New Image (if selected)
            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `category-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("products") // Reusing products bucket for category images is fine
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("products")
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
            }

            // 2. Update Category
            const { error: updateError } = await supabase
                .from("product_categories")
                .update({
                    name,
                    slug,
                    description,
                    image_url: finalImageUrl,
                })
                .eq("id", categoryId);

            if (updateError) throw updateError;

            alert("Category updated successfully!");
            router.push("/admin/categories");
            router.refresh();

        } catch (err: any) {
            console.error("Error updating category:", err);
            const errorMessage = err?.message || err?.error_description || JSON.stringify(err) || "Unknown error occurred";
            alert(`Error updating category: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Link href="/admin/categories" className="flex items-center text-gray-600 hover:text-black mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Categories
            </Link>

            <div className="bg-white rounded-xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Category</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
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
                                Change Image
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
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Solar Panels"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-600"
                                placeholder="e.g. solar-panels"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Brief description of the category..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <Link
                            href="/admin/categories"
                            className="px-8 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
