"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload } from "lucide-react";

export default function EditReviewPage() {
    const router = useRouter();
    const params = useParams();
    const reviewId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [text, setText] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (reviewId) fetchReview();
    }, [reviewId]);

    async function fetchReview() {
        setLoading(true);
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("id", reviewId)
            .single();

        if (error || !data) {
            alert("Error fetching review.");
            router.push("/admin/reviews");
            return;
        }

        setName(data.name);
        setRole(data.role);
        setText(data.text);
        setCurrentImageUrl(data.image_url || "");
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            let imageUrl = currentImageUrl;

            if (imageFile) {
                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `reviews/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("products")
                    .upload(filePath, imageFile, { cacheControl: '31536000', upsert: false });

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from("products")
                    .getPublicUrl(filePath);

                imageUrl = data.publicUrl;
            }

            const { error: updateError } = await supabase
                .from("reviews")
                .update({
                    name,
                    role,
                    text,
                    image_url: imageUrl,
                })
                .eq("id", reviewId);

            if (updateError) throw updateError;

            router.push("/admin/reviews");
            router.refresh();
        } catch (error: any) {
            console.error("Review update error:", error);
            alert("An error occurred while updating the review. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/reviews" className="text-gray-600 hover:text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Edit Review</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 text-black">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role / Company *
                        </label>
                        <input
                            type="text"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Review Text *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client Photo (Optional)
                        </label>
                        <div className="mt-1 flex items-center gap-4">
                            {(imageFile || currentImageUrl) && (
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : currentImageUrl}
                                    alt="Preview"
                                    className="w-16 h-16 object-cover rounded-full border border-gray-200"
                                />
                            )}
                            <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                <span>{imageFile || currentImageUrl ? 'Change Photo' : 'Upload Photo'}</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImageFile(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-end">
                        <Link
                            href="/admin/reviews"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 mr-3"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Review'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
