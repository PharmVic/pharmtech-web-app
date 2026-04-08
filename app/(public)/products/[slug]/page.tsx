import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function CategoryProductsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // 1. Get Category ID using Slug
    console.log("Fetching category for slug:", slug);
    const { data: category, error: catError } = await supabase
        .from("product_categories")
        .select("id, name") // Remove description as it doesn't exist
        .eq("slug", slug)
        .maybeSingle(); // Safe for 0 rows

    if (catError) console.error("Supabase Error:", catError);
    if (!category) console.error("Category NOT found for slug:", slug);

    if (catError || !category) {
        notFound();
    }

    // 2. Fetch Products for this Category
    const { data: products, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", category.id)
        .order("is_available", { ascending: false, nullsFirst: true }) // Available first
        .order("is_featured", { ascending: false, nullsFirst: false }) // Featured first
        .order("created_at", { ascending: false });

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">

                {/* Breadcrumb / Back */}
                <div className="mb-8">
                    <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Categories
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
                    <p className="text-gray-600">Browse our selection of {category.name.toLowerCase()}.</p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products?.map((product) => (
                        <Link href={`/product/${product.id}`} key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full">

                            {/* Product Image */}
                            <div className="relative h-64 bg-gray-100 overflow-hidden">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url || "/placeholder-product.png"}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-contain bg-white transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                                        <span className="text-sm">No Image</span>
                                    </div>
                                )}

                                {/* Badge if featured */}
                                {product.is_featured && (
                                    <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                        Featured
                                    </div>
                                )}

                                {/* Out of Stock Overlay */}
                                {product.is_available === false && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 transition-opacity">
                                        <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg rotate-12 text-sm uppercase tracking-wider border-2 border-white">
                                            Out of Stock
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={product.name}>
                                    {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                                    {product.description || "No description available."}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase font-semibold">Price</span>
                                        {product.is_promo_active && product.promo_price ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm line-through text-gray-400">
                                                        ₦{product.price?.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                        -{Math.round(((product.price - product.promo_price) / product.price) * 100)}%
                                                    </span>
                                                </div>
                                                <span className="text-xl font-bold text-green-600">
                                                    ₦{product.promo_price.toLocaleString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xl font-bold text-blue-600">
                                                {product.price ? `₦${product.price.toLocaleString()}` : "Contact Us"}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative z-10">
                                        <AddToCartButton 
                                            product={{
                                                id: product.id,
                                                name: product.name,
                                                price: (product.is_promo_active && product.promo_price) ? product.promo_price : product.price,
                                                image_url: product.image_url,
                                                is_available: product.is_available,
                                            }}
                                            large={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {(!products || products.length === 0) && (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                            <ShoppingCart className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h2>
                        <p className="text-gray-600 mb-6">We haven't added any products to this category yet.</p>
                        <Link href="/products" className="btn btn-primary rounded-pill px-6 py-2">
                            Browse Other Categories
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
