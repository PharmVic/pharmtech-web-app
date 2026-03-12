"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface AboutImage {
    id: string;
    position: number;
    image_url: string;
    alt_text: string;
}

export default function AdminAboutImagesPage() {
    const router = useRouter();
    const [images, setImages] = useState<AboutImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingPos, setUploadingPos] = useState<number | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    async function fetchImages() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("about_images")
                .select("*")
                .order("position", { ascending: true });

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error("Error fetching about images:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, position: number, existingId?: string) {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploadingPos(position);

        try {
            // 1. Upload to Storage
            const fileExt = file.name.split(".").pop();
            const fileName = `about-pos-${position}-${Date.now()}.${fileExt}`;
            const filePath = `about/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("products")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from("products")
                .getPublicUrl(filePath);

            // 3. Upsert into database
            if (existingId) {
                const { error: updateError } = await supabase
                    .from("about_images")
                    .update({ image_url: publicUrl })
                    .eq("id", existingId);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("about_images")
                    .insert({ position, image_url: publicUrl, alt_text: `About Image ${position}` });

                if (insertError) throw insertError;
            }

            // Refresh list
            fetchImages();
            alert(`Image for Position ${position} updated successfully!`);

        } catch (error: any) {
            console.error("Error uploading image:", error);
            alert(`Error updating image: ${error.message}`);
        } finally {
            setUploadingPos(null);
            // reset input
            e.target.value = '';
        }
    }

    // Helper to get image for a specific position
    const getImageForPosition = (pos: number) => {
        return images.find(img => img.position === pos);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link href="/admin" className="flex items-center text-gray-600 hover:text-black mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">About Us Images</h1>
                    <p className="text-gray-600 mt-1">Manage the 4 images displayed in the mosaic grid on the About Us page.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((position) => {
                    const imgData = getImageForPosition(position);
                    const isUploading = uploadingPos === position;

                    return (
                        <div key={position} className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900">Grid Position {position}</h3>
                                {position === 1 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Top Left (Small)</span>}
                                {position === 2 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Bottom Left (Large)</span>}
                                {position === 3 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Top Right (Large)</span>}
                                {position === 4 && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Bottom Right (Small)</span>}
                            </div>

                            <div className="relative group rounded-lg overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 h-64 flex items-center justify-center">
                                {isUploading ? (
                                    <div className="flex flex-col items-center text-blue-600">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <span className="text-sm font-medium">Uploading...</span>
                                    </div>
                                ) : imgData ? (
                                    <>
                                        <img src={imgData.image_url} alt={`Position ${position}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg">
                                                <Upload className="w-4 h-4" />
                                                Replace Image
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, position, imgData.id)}
                                                />
                                            </label>
                                        </div>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                        <ImageIcon className="w-10 h-10 mb-2" />
                                        <span className="font-medium">Upload Image</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, position)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
