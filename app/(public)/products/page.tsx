import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {

    // Fetch categories
    const { data: categories, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching categories:", error);
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Product Categories</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore our wide range of high-quality solar, security, and networking solutions.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories?.map((category) => (
                        <Link
                            href={`/products/${category.slug}`}
                            key={category.id}
                            className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 bg-gray-200 overflow-hidden">
                                {/* 
                    Note: Using a placeholder or the category.image_url if you add that later.
                    For now, forcing a nice gradient or specific images based on slug would be cool,
                    but let's stick to a solid fallback for simplicity/robustness first.
                 */}
                                {category.image_url ? (
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-opacity-20">
                                        <span className="text-6xl font-black uppercase">{category.name[0]}</span>
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {category.name}
                                    </h3>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-gray-500 line-clamp-2">
                                    Browse our selection of {category.name.toLowerCase()} suitable for homes and businesses.
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {(!categories || categories.length === 0) && (
                    <div className="text-center py-20">
                        <h3 className="text-xl text-gray-500">No categories found.</h3>
                        <p className="text-gray-400 mt-2">Please check back later.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
