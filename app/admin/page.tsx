"use client";

import Link from "next/link";
import { Copy, Package, PlusSquare, FileText, Settings, Users } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-[#110000]">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
                        <p className="text-gray-500 mb-4">Manage inventory, categories, and pricing catalogs.</p>
                        <span className="text-purple-600 font-medium text-sm group-hover:underline">Manage Products &rarr;</span>
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
