"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import imageCompression from 'browser-image-compression';

type InstallationImage = {
    id: string;
    image_url: string;
    title: string;
    created_at: string;
};

export default function PastInstallationsPage() {
    const [images, setImages] = useState<InstallationImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("past_installations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setImages(data || []);
        } catch (error) {
            console.error("Error fetching images:", error);
            alert("Failed to load past installations.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        try {
            setUploading(true);

            const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedFile = await imageCompression(selectedFile, options);

            // 1. Upload file to Supabase Storage
            const fileExt = compressedFile.name.split('.').pop() || 'jpg';
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('past-installations')
                .upload(filePath, compressedFile, { cacheControl: '31536000', upsert: false });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('past-installations')
                .getPublicUrl(filePath);

            const imageUrl = publicUrlData.publicUrl;

            // 3. Insert record into database
            const { error: dbError } = await supabase
                .from('past_installations')
                .insert([
                    { image_url: imageUrl, title: title || "" }
                ]);

            if (dbError) throw dbError;

            alert("Image uploaded successfully!");
            setSelectedFile(null);
            setTitle("");
            // Reset file input
            const fileInput = document.getElementById("file-upload") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            fetchImages();
        } catch (error: any) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            // 1. Delete from database
            const { error: dbError } = await supabase
                .from('past_installations')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // Optional: You could also delete the file from storage
            // const fileName = imageUrl.split('/').pop();
            // if (fileName) {
            //    await supabase.storage.from('past-installations').remove([fileName]);
            // }

            alert("Image deleted.");
            fetchImages();
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image.");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                    Past Installations
                </h1>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Upload New Image</h2>
                <form onSubmit={handleUpload} className="flex flex-col gap-4 max-w-xl">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                            id="file-upload"
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title/Description (Optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. 5KVA Solar Installation in Lagos"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!selectedFile || uploading}
                        className={`mt-2 flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            ${(!selectedFile || uploading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                </form>
            </div>

            {/* Images Grid */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Uploaded Images</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No installation images uploaded yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <div key={img.id} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col">
                                <div className="aspect-video w-full bg-gray-200 relative">
                                    <Image 
                                        src={img.image_url} 
                                        alt={img.title || "Installation"} 
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => handleDelete(img.id, img.image_url)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {(img.title) && (
                                    <div className="p-3 text-sm text-gray-700 bg-white border-t border-gray-200 truncate">
                                        {img.title}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
