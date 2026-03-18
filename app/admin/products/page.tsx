"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Plus, Package, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react";

type Product = {
    id: string;
    name: string;
    category_id: string;
    price: number;
    image_url: string;
    description: string;
    is_promo_active?: boolean;
    promo_price?: number;
    // We'll join category name later or just fetch raw
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching products:", error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
            alert("Failed to delete product");
        } else {
            setProducts(products.filter((p) => p.id !== id));
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600">Manage all products</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add New Product
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
                    <p className="text-gray-600 mb-6">Get started by adding your first product.</p>
                    <Link
                        href="/admin/products/new"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Create Product
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Image</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Price</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-12 h-12 rounded object-cover border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {product.name}
                                        {product.is_promo_active && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Promo: ₦{product.promo_price?.toLocaleString("en-NG")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.is_promo_active ? (
                                            <div>
                                                <span className="line-through text-gray-400 mr-2">₦{product.price.toLocaleString("en-NG")}</span>
                                                <span className="text-green-600 font-bold">₦{product.promo_price?.toLocaleString("en-NG")}</span>
                                            </div>
                                        ) : (
                                            <span>₦{product.price.toLocaleString("en-NG")}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <Link
                                            href={`/admin/products/edit/${product.id}`}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
