"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2, Star } from "lucide-react";

type Review = {
    id: string;
    name: string;
    role: string;
    text: string;
    image_url: string;
    created_at: string;
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    async function fetchReviews() {
        setLoading(true);
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setReviews(data);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        const { error } = await supabase.from("reviews").delete().match({ id });
        if (!error) {
            setReviews(reviews.filter((r) => r.id !== id));
        } else {
            alert("Error deleting review.");
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Reviews</h1>
                <Link
                    href="/admin/reviews/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> Add Review
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    No reviews found. Click "Add Review" to create one.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden text-black">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                    Review Snippet
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reviews.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 relative bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                                {review.image_url ? (
                                                    <img
                                                        src={review.image_url}
                                                        alt={review.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-sm font-bold">
                                                        {review.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {review.name}
                                                </div>
                                                <div className="flex text-yellow-400 text-xs mt-1">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <Star className="w-3 h-3 fill-current" />
                                                    <Star className="w-3 h-3 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {review.role}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">
                                        {review.text}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <Link
                                                href={`/admin/reviews/edit/${review.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
