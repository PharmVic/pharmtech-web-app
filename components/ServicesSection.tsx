"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type Service = {
    title: string;
    img: string;
    link: string;
    desc: string;
    isProduct?: boolean;
};

export default function ServicesSection({ initialServices }: { initialServices: Service[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredServices = initialServices.filter((svc) =>
        svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, searchQuery ? undefined : 10);

    return (
        <div className="container-fluid service pb-5">
            <div className="container pb-5">
                <div className="text-center mx-auto pb-5" style={{ maxWidth: "800px" }}>
                    <h1 className="display-5 text-primary font-bold uppercase mb-2 text-3xl md:text-5xl">Our Services & Products</h1>
                    <h4 className="mb-4 font-bold text-xl md:text-2xl text-dark">What We Offer</h4>
                    <p className="mb-4 text-gray-600 text-sm md:text-base">
                        We provide comprehensive, high-quality solutions across renewable energy, advanced security, and seamless automation—empowering you with reliability and efficiency for the future.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative mt-6">
                        <div className="relative flex items-center w-full h-12 rounded-full focus-within:shadow-lg bg-white overflow-hidden border border-gray-200">
                            <div className="grid place-items-center h-full w-12 text-gray-300">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                                type="text"
                                id="search"
                                placeholder="Search our services and products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {filteredServices.length > 0 ? (
                        filteredServices.map((svc, idx) => {
                            const itemLink = svc.isProduct ? `/product/${svc.link}` : `/products/${svc.link}`;

                            return (
                                <div key={idx} className="col-md-6 col-lg-4">
                                    <div className="service-item bg-light rounded shadow-sm hover:shadow-lg transition-all duration-300 h-100 flex-column d-flex">
                                        <div className="service-img overflow-hidden rounded-top" style={{ height: "250px" }}>
                                            <img src={`${svc.img}?w=500&auto=format`} className="img-fluid w-100 h-100 object-cover hover:scale-110 transition-transform duration-500" alt={svc.title} />
                                        </div>
                                        <div className="rounded-bottom p-4 flex-grow-1 d-flex flex-column">
                                            <div className="mb-2">
                                                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                    {svc.isProduct ? 'Product' : 'Service'}
                                                </span>
                                            </div>
                                            <Link href={itemLink} className="h4 d-inline-block mb-3 font-bold hover:text-primary transition-colors">{svc.title}</Link>
                                            <p className="mb-4 text-gray-600 flex-grow-1 line-clamp-3">{svc.desc}</p>
                                            <Link className="btn btn-primary rounded-pill py-2 px-4 text-white mt-auto align-self-start" href={itemLink}>
                                                {svc.isProduct ? 'View Details' : 'Shop Now'}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12 text-center py-5">
                            <h5 className="text-gray-500">No services match your search result.</h5>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
