
import React from 'react';
import { supabase } from "@/lib/supabaseClient";

export default async function About() {

    // Fetch about images
    const { data: aboutImages } = await supabase
        .from("about_images")
        .select("*");

    // Helper to deeply map positions to their URLs or their default fallbacks
    const getImgUrl = (pos: number, fallback: string) => {
        const found = aboutImages?.find(img => img.position === pos);
        return found?.image_url || fallback;
    };
    return (
        <div className="container-fluid about py-5">
            <div className="container py-5">
                <div className="row g-5 align-items-center">
                    <div className="col-xl-7">
                        <div>
                            <h4 className="text-primary font-bold uppercase mb-2">About Us</h4>
                            <h1 className="display-5 mb-4 font-bold text-3xl md:text-5xl text-gray-900 leading-tight">
                                Powering Homes, Businesses, and Communities
                            </h1>

                            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    At <strong>Pharmtech</strong>, we are committed to powering homes, businesses, and communities with reliable energy and smart connectivity solutions. Based in Ibadan and serving clients across Nigeria, we specialize in solar power systems, inverters, Starlink internet installation, networking, CCTV surveillance, and home automation solutions.
                                </p>

                                <p>
                                    We understand the daily challenges of unstable electricity and poor internet connectivity. That is why our mission is simple — to provide dependable power and seamless connectivity that allow our clients to live comfortably and run their businesses without interruption.
                                </p>

                                <p>
                                    Our team combines technical expertise with practical experience to deliver clean, professional, and efficient installations. From residential solar systems and commercial inverter setups to structured networking, smart home integration, and enterprise-grade internet solutions, we ensure every project is handled with precision and care.
                                </p>

                                <p>
                                    What sets us apart is our commitment to quality, honesty, and long-term support. We use trusted products, provide expert guidance, and remain available even after installation because our clients&apos; satisfaction is our priority.
                                </p>

                                <p className="font-semibold text-gray-800 text-xl border-l-4 border-primary pl-4 my-8 p-4 bg-blue-50/50 rounded-r-lg">
                                    At Pharmtech, we are not just installing systems — we are building reliable power, smarter homes, and stronger businesses.
                                </p>

                                <p className="text-xl font-bold text-primary mt-8">
                                    Let us power your world and connect you to the future.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <img src={getImgUrl(1, "https://images.unsplash.com/photo-1509391366360-1e96f5b16e51?w=500&auto=format")} className="rounded-2xl shadow-lg w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-500" alt="About Position 1" />
                                <img src={getImgUrl(2, "https://images.unsplash.com/photo-1544197150-b99a580bbcbf?w=500&auto=format")} className="rounded-2xl shadow-lg w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500" alt="About Position 2" />
                            </div>
                            <div className="space-y-4 lg:mt-12">
                                <img src={getImgUrl(3, "https://images.unsplash.com/photo-1557064619-2169b476c535?w=500&auto=format")} className="rounded-2xl shadow-lg w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500" alt="About Position 3" />
                                <img src={getImgUrl(4, "https://images.unsplash.com/photo-1558002038-1091a086e98c?w=500&auto=format")} className="rounded-2xl shadow-lg w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-500" alt="About Position 4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
