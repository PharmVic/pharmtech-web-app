"use client";

import { useState } from "react";
import { Send, Loader2, Mail, Image, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminEmailPage() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [singleEmail, setSingleEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [errorText, setErrorText] = useState("");

    // Image upload and compression states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [base64Image, setBase64Image] = useState<string>("");
    const [compressing, setCompressing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [imageSize, setImageSize] = useState("large"); // small, medium, large

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrorText("Please upload an image file (PNG, JPG, etc.).");
            return;
        }

        setCompressing(true);
        setErrorText("");
        try {
            const options = {
                maxSizeMB: 0.8, // keep under 1MB to avoid Vercel serverless request limits
                maxWidthOrHeight: 1200,
                useWebWorker: true,
            };

            const imageCompression = (await import("browser-image-compression")).default;
            const compressed = await imageCompression(file, options);
            
            const reader = new FileReader();
            reader.readAsDataURL(compressed);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                setBase64Image(base64data);
                setImagePreview(URL.createObjectURL(compressed));
                setImageFile(compressed);
            };
        } catch (err: any) {
            console.error("Compression error:", err);
            setErrorText("Failed to compress/optimize image. Please try a different file.");
        } finally {
            setCompressing(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");
        setBase64Image("");
        setImageSize("large");
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusText("");
        setErrorText("");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/send-bulk-email", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({
                    subject,
                    message,
                    singleEmail: singleEmail.trim() || undefined,
                    uploadedImage: base64Image || undefined,
                    imageSize: base64Image ? imageSize : undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send email");
            }

            setStatusText(data.message || "Emails sent successfully!");
            if (!singleEmail) {
                setSubject("");
                setMessage("");
                handleRemoveImage();
            }
        } catch (err: any) {
            setErrorText(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Email Broadcast</h1>
                    <p className="text-gray-600">Send bulk emails to all registered users or a single user for testing.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSend} className="p-6 space-y-6">
                    {statusText && (
                        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                            {statusText}
                        </div>
                    )}
                    
                    {errorText && (
                        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                            {errorText}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Single Email (Optional)
                        </label>
                        <input
                            type="email"
                            value={singleEmail}
                            onChange={(e) => setSingleEmail(e.target.value)}
                            placeholder="leave blank to send to ALL users..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">If provided, the email will ONLY be sent to this address.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email Subject"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Inline Image Attachment (Optional)
                        </label>
                        <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 text-center ${
                                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                            }`}
                        >
                            {imagePreview ? (
                                <div className="space-y-4">
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-48 rounded-lg shadow-sm mx-auto object-contain border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 shadow transition-all duration-200"
                                            title="Remove image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium break-all">
                                        {imageFile?.name} ({(imageFile ? imageFile.size / 1024 : 0).toFixed(1)} KB)
                                    </p>
                                </div>
                            ) : (
                                <label className="cursor-pointer block">
                                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                    <span className="text-sm font-semibold text-blue-600 hover:text-blue-700 block mb-1">
                                        Click to upload or drag & drop
                                    </span>
                                    <span className="text-xs text-gray-400 block">
                                        PNG, JPG, GIF or WEBP (Max 5MB - will be optimized client-side)
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={compressing}
                                    />
                                </label>
                            )}
                            {compressing && (
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm font-medium">Compressing & optimizing image...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            To place this image inline inside your message, type <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono font-bold">[IMAGE]</code>. If not specified, the image will be appended at the bottom of the email.
                        </p>
                        
                        {imagePreview && (
                            <div className="mt-3">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Display Size in Email
                                </label>
                                <select
                                    value={imageSize}
                                    onChange={(e) => setImageSize(e.target.value)}
                                    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                >
                                    <option value="large">Large (Full Width - 600px)</option>
                                    <option value="medium">Medium (Half Width - 350px)</option>
                                    <option value="small">Small (Logo size - 150px)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message (HTML Allowed) *
                        </label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            placeholder="<p>Write your message here... you can use HTML tags!</p>"
                            className="w-full px-4 py-2 flex-grow border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            The message will be automatically wrapped in a template with the Pharmtech Solar logo.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || compressing}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    {singleEmail ? "Send Test Email" : "Send to ALL Users"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
