"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Plus, Folder, Trash2, Edit, Loader2, Image as ImageIcon } from "lucide-react";

type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
};

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase
            .from("product_categories")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching categories:", error);
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this category? Products in this category might be affected.")) return;

        const { error } = await supabase.from("product_categories").delete().eq("id", id);
        if (error) {
            alert("Failed to delete category");
        } else {
            setCategories(categories.filter((c) => c.id !== id));
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600">Manage product categories</p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
                    <p className="text-gray-600 mb-6">Create a category to organize your products.</p>
                    <Link
                        href="/admin/categories/new"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Create Category
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Image</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Slug</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {category.image_url ? (
                                            <img
                                                src={category.image_url}
                                                alt={category.name}
                                                className="w-12 h-12 rounded object-cover border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-500">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {category.slug}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <Link
                                            href={`/admin/categories/edit/${category.id}`}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(category.id)}
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
