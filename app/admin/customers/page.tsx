"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Search, ShoppingBag, MapPin, Phone, Mail, Award, User } from "lucide-react";

type AdminUser = {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    address: string;
    createdAt: string;
    lastSignIn: string;
    role: string;
    points: number;
    referralCode: string;
    totalSpent: number;
    orderCount: number;
};

export default function AdminCustomersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                setError("Authentication required");
                return;
            }

            const response = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users. Ensure you have admin rights.");
            }

            const data = await response.json();
            setUsers(data.users || []);
        } catch (err: any) {
            console.error("Error loading customers:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );

    if (loading) {
        return <div className="p-8 text-center text-gray-600 animate-pulse">Loading customer database...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Customers Directory
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">View all registered users and their activity</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
                </div>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 font-medium">Active Buyers</p>
                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.orderCount > 0).length}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 font-medium">Admins</p>
                        <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 rounded-tl-xl">Customer Info</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Contact Details</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Orders</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Points</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-right rounded-tr-xl">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                                        No customers found matching "{searchQuery}"
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {user.fullName !== 'N/A' ? user.fullName.charAt(0).toUpperCase() : <User className="w-5 h-5"/>}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                        {user.fullName}
                                                        {user.role === 'admin' && (
                                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Admin</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-600">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3 h-3"/> {user.email}</div>
                                                <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3 h-3"/> {user.phone}</div>
                                                <div className="flex items-center gap-2 text-gray-600 text-xs truncate max-w-[200px]" title={user.address}>
                                                    <MapPin className="w-3 h-3 shrink-0"/> {user.address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full font-bold ${user.orderCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {user.orderCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded">
                                                {user.points}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-gray-900">
                                                ₦{user.totalSpent.toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
