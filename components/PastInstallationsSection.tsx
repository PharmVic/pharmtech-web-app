"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type InstallationImage = {
    id: string;
    image_url: string;
    title: string;
};

export default function PastInstallationsSection() {
    const [images, setImages] = useState<InstallationImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const { data, error } = await supabase
                    .from("past_installations")
                    .select("id, image_url, title")
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Error fetching past installations:", error);
                    return;
                }
                
                if (data) {
                    setImages(data);
                }
            } catch (err) {
                console.error("Unexpected error fetching past installations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (loading || images.length === 0) {
        return null; // Do not render section if loading or no images
    }

    return (
        <div className="container-fluid py-5 bg-light overflow-hidden">
            <style>
                {`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(calc(-250px * ${images.length} - 1.5rem * ${images.length})); }
                    }
                    .animate-scroll {
                        animation: scroll ${images.length * 4}s linear infinite;
                    }
                    .animate-scroll:hover {
                        animation-play-state: paused;
                    }
                `}
            </style>
            <div className="container pb-5">
                <div className="text-center mx-auto pb-5 mt-10" style={{ maxWidth: "800px" }}>
                    <h4 className="text-primary font-bold uppercase mb-2">Our Work</h4>
                    <h1 className="display-5 mb-4 font-bold">Past Installations</h1>
                    <p className="mb-0 text-gray-600">
                        Take a look at some of our successful installations and projects.
                    </p>
                </div>
            </div>
            
            {/* Scrolling Track */}
            <div className="relative w-full overflow-hidden bg-white py-8 shadow-sm">
                <div className="flex w-max animate-scroll gap-6 px-6">
                    {/* Render the images twice to create an infinite seamless loop effect */}
                    {[...images, ...images].map((img, idx) => (
                        <div key={`${img.id}-${idx}`} className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-[250px] shrink-0">
                            <div className="relative h-[320px] w-full overflow-hidden bg-white flex items-center justify-center">
                                <Image 
                                    src={img.image_url} 
                                    alt={img.title || "Installation Project"} 
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            {img.title && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white font-medium text-sm line-clamp-2">
                                        {img.title}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
