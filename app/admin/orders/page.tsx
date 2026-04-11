"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Package, Search, MapPin, Phone, Mail, Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, Truck, Check } from "lucide-react";

type OrderItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

type Order = {
    id: string; // or number depending on db
    reference: string;
    amount: number;
    email: string;
    phone: string;
    location: string;
    delivery_date: string;
    items: OrderItem[];
    status: string; // usually 'success' from paystack
    user_id: string | null;
    created_at: string;
    fulfillment_status: string | null;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [updatingParams, setUpdatingParams] = useState<{ id: string, status: string } | null>(null);
    const [needsSchemaUpdate, setNeedsSchemaUpdate] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const toggleRow = (id: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedRows(newSet);
    };

    async function fetchOrders() {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                setError("Authentication required");
                return;
            }

            const response = await fetch('/api/admin/orders', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch orders. Ensure you have admin rights.");
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Supabase returns missing columns as undefined. If none have it, assume missing schema if we get errors updating later.
            setOrders(data.orders || []);
        } catch (err: any) {
            console.error("Error loading orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateFulfillmentStatus(id: string, newStatus: string) {
        setUpdatingParams({ id, status: newStatus });
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const response = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, fulfillment_status: newStatus })
            });

            const data = await response.json();
            
            // Check for missing column error
            if (data.error?.includes("Could not find the 'fulfillment_status' column")) {
                setNeedsSchemaUpdate(true);
                throw new Error("Missing column in database. Please see instructions below.");
            }

            if (!response.ok) {
                throw new Error(data.error || "Failed to update status");
            }

            // Successfully updated locally
            setOrders(orders.map(o => o.id === id ? { ...o, fulfillment_status: newStatus } : o));

        } catch (err: any) {
            console.error("Status update error:", err);
            setError(err.message);
        } finally {
            setUpdatingParams(null);
        }
    }

    const filteredOrders = orders.filter(order => 
        (order.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.reference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.phone || '').includes(searchQuery)
    );

    const getStatusColor = (status: string | null) => {
        const s = (status || 'Pending').toLowerCase();
        if (s === 'delivered') return 'bg-green-100 text-green-700';
        if (s === 'shipped') return 'bg-blue-100 text-blue-700';
        if (s === 'cancelled') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const getStatusIcon = (status: string | null) => {
        const s = (status || 'Pending').toLowerCase();
        if (s === 'delivered') return <CheckCircle className="w-4 h-4" />;
        if (s === 'shipped') return <Truck className="w-4 h-4" />;
        return <Clock className="w-4 h-4" />;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600 animate-pulse">Loading orders dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        Order Management
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">View user checkouts, addresses, and track fulfillment</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search by reference, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" />
                </div>
            </div>

            {error && !needsSchemaUpdate && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {needsSchemaUpdate && (
                <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 shadow-sm flex flex-col gap-2">
                    <div className="font-bold flex items-center gap-2">
                        <span className="text-xl">⚠️</span> Database Update Required
                    </div>
                    <p className="text-sm">
                        You need to add the `fulfillment_status` column to the `payments` table to enable status tracking.
                        Please run the following SQL query in your Supabase SQL Editor:
                    </p>
                    <code className="bg-white p-3 rounded border border-yellow-300 block text-xs overflow-x-auto text-gray-800 font-mono">
                        ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(50) DEFAULT 'Pending';
                    </code>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="self-start mt-2 px-4 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-medium rounded border border-yellow-300 transition-colors"
                    >
                        I have run the script, reload page
                    </button>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 rounded-tl-xl">Order Info</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Customer Details</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Amount</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Fulfillment</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-right rounded-tr-xl">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No orders found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const isExpanded = expandedRows.has(order.id);
                                    const currentFulfillment = order.fulfillment_status || 'Pending';
                                    const items = order.items || [];
                                    
                                    return (
                                        <React.Fragment key={order.id}>
                                            <tr className={`hover:bg-blue-50/20 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                            <Package className="w-5 h-5"/>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">
                                                                Ref: <span className="font-mono text-xs">{order.reference}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                <Calendar className="w-3 h-3" /> 
                                                                {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-gray-700 font-medium text-xs"><Mail className="w-3 h-3 text-gray-400"/> {order.email}</div>
                                                        <div className="flex items-center gap-2 text-gray-600 text-xs"><Phone className="w-3 h-3 text-gray-400"/> {order.phone}</div>
                                                        <div className="flex items-center gap-2 text-gray-600 text-xs truncate max-w-[200px]" title={order.location}>
                                                            <MapPin className="w-3 h-3 text-gray-400 shrink-0"/> {order.location}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">
                                                        ₦{Number(order.amount).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-green-600 font-medium bg-green-50 inline-block px-1.5 rounded mt-1 border border-green-100">
                                                        Paid
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {/* Fulfillment Dropdown */}
                                                    <div className="relative inline-block text-left group">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${getStatusColor(currentFulfillment)} ${updatingParams?.id === order.id ? 'opacity-50' : 'hover:opacity-80'}`}>
                                                            {updatingParams?.id === order.id ? (
                                                                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                                            ) : (
                                                                getStatusIcon(currentFulfillment)
                                                            )}
                                                            {currentFulfillment}
                                                        </span>
                                                        
                                                        {/* Tooltip style dropdown to change status */}
                                                        <div className="absolute z-10 hidden group-hover:block top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden transform -translate-x-1/4 left-1/2">
                                                            {['Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                                                <button
                                                                    key={status}
                                                                    disabled={currentFulfillment === status || updatingParams?.id === order.id}
                                                                    onClick={() => updateFulfillmentStatus(order.id, status)}
                                                                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 hover:text-blue-600 transition-colors ${currentFulfillment === status ? 'bg-gray-50 text-gray-400 cursor-not-allowed font-medium' : 'text-gray-700'}`}
                                                                >
                                                                    {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => toggleRow(order.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                                                    >
                                                        {items.length} Items {isExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Expanded details row */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <td colSpan={5} className="px-6 py-6">
                                                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {/* Delivery Info */}
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                        <Truck className="w-4 h-4" /> Logistics Details
                                                                    </h4>
                                                                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Preferred Delivery Date</span>
                                                                            <span className="text-sm font-medium text-gray-900 border-l-2 border-blue-500 pl-2 mt-1">
                                                                                {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Full Delivery Address</span>
                                                                            <span className="text-sm text-gray-800 bg-white p-2 border border-gray-200 rounded mt-1 leading-relaxed">
                                                                                {order.location}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Items List */}
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                                        <Package className="w-4 h-4" /> Purchased Items
                                                                    </h4>
                                                                    {items.length === 0 ? (
                                                                        <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">No items recorded securely via JSON payload.</p>
                                                                    ) : (
                                                                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
                                                                            {items.map((item, idx) => (
                                                                                <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                                                                                    <div className="flex gap-3 items-center">
                                                                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                                                                            {item.quantity}x
                                                                                        </div>
                                                                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={item.name}>{item.name}</span>
                                                                                    </div>
                                                                                    <span className="text-sm font-bold text-gray-700">₦{(item.price * item.quantity).toLocaleString()}</span>
                                                                                </div>
                                                                            ))}
                                                                            <div className="p-3 bg-gray-50 flex justify-between items-center">
                                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                                                                                <span className="text-sm font-black text-gray-900">₦{Number(order.amount).toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
