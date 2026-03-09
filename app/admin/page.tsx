"use client";

import Link from "next/link";
import { Copy, Package, PlusSquare, FileText, Settings, Users, Folder, Star, Image as ImageIcon } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-[#110000]">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Categories Card */}
                <Link href="/admin/categories" className="group block">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Folder className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Categories</h3>
                        </div>
                        <p className="text-gray-500 mb-4">Manage product categories and organize your store.</p>
                        <span className="text-orange-600 font-medium text-sm group-hover:underline">Manage Categories &rarr;</span>
                    </div>
                </Link>

                {/* Quotes Card */}
                <Link href="/admin/quotes" className="group block">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Quotes</h3>
                        </div>
                        <p className="text-gray-500 mb-4">View and manage customer solar quotes generated from the calculator.</p>
                        <span className="text-blue-600 font-medium text-sm group-hover:underline">View Quotes &rarr;</span>
                    </div>
                </Link>

                {/* Products Card - Active */}
                <Link href="/admin/products" className="group block">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Package className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Products</h3>
                        </div>
                        <p className="text-gray-500 mb-4">Add, edit, or remove products</p>
                        <span className="text-purple-600 font-medium text-sm group-hover:underline">Manage Products &rarr;</span>
                    </div>
                </Link>

                {/* Reviews Card */}
                <Link href="/admin/reviews" className="group block">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-yellow-500 hover:shadow-md transition-all h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                                <Star className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                        </div>
                        <p className="text-gray-500 mb-4">Manage client testimonials shown on the homepage.</p>
                        <span className="text-yellow-600 font-medium text-sm group-hover:underline">Manage Reviews &rarr;</span>
                    </div>
                </Link>

                {/* About Images Card */}
                <Link href="/admin/about" className="group block">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">About Content</h3>
                        </div>
                        <p className="text-gray-500 mb-4">Manage the photos displayed on the About Us page.</p>
                        <span className="text-emerald-600 font-medium text-sm group-hover:underline">Manage Photos &rarr;</span>
                    </div>
                </Link>

                {/* Users Placeholder */}
                <div className="group block grayscale opacity-60">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Customers</h3>
                        </div>
                        <p className="text-gray-500 mb-4">View register users and their points/rewards.</p>
                        <span className="text-gray-400 font-medium text-sm">Coming Soon</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
