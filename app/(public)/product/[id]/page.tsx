import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, CheckCircle, ShieldCheck } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const { data: product, error } = await supabase
        .from("products")
        .select(`
            *,
            product_categories (
                id,
                name,
                slug
            )
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) console.error("Supabase Error fetching product:", error);

    if (!product) {
        notFound();
    }

    const category = product.product_categories;

    // Resolve images
    const imageUrls = product.image_urls && product.image_urls.length > 0
        ? product.image_urls
        : (product.image_url ? [product.image_url] : []);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">

                {/* Breadcrumb */}
                <div className="mb-8 flex items-center text-sm text-gray-600">
                    <Link href="/products" className="hover:text-blue-600 transition-colors">
                        Products
                    </Link>
                    <span className="mx-2">/</span>
                    {category && (
                        <>
                            <Link href={`/products/${category.slug}`} className="hover:text-blue-600 transition-colors">
                                {category.name}
                            </Link>
                            <span className="mx-2">/</span>
                        </>
                    )}
                    <span className="text-gray-900">{product.name}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">

                        {/* Product Image Gallery */}
                        <ProductGallery
                            images={imageUrls}
                            alt={product.name}
                            isFeatured={product.is_featured}
                        />

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {product.name}
                            </h1>

                            <div className="text-3xl font-bold text-blue-600 mb-6">
                                {product.price ? `₦${product.price.toLocaleString()}` : "Contact Us for Price"}
                            </div>

                            <p className="text-gray-600 mb-8 whitespace-pre-wrap leading-relaxed text-lg">
                                {product.description || "No detailed description available for this product."}
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span>High Quality Guaranteed</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <ShieldCheck className="w-5 h-5 text-blue-500 mr-3" />
                                    <span>Reliable Support</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-gray-100 flex gap-4">
                                <AddToCartButton 
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image_url: imageUrls[0],
                                    }}
                                    large={true}
                                />
                                <Link
                                    href="/contact"
                                    className="px-8 py-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    Inquire
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
