"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, FileText, Search, User, Phone, MapPin, X, Zap, Battery, Sun, Cpu } from "lucide-react";

function formatMoney(n: number) {
    return new Intl.NumberFormat("en-NG").format(Math.round(n));
}

type Quote = {
    id: string;
    quote_number: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;

    // System Specs
    recommended_kva: number;
    system_voltage: number;
    estimated_price: number;

    // Detailed Specs (New)
    inverter_name?: string;
    battery_type?: string;
    battery_count?: number;
    battery_ah?: number;
    panel_count?: number;
    panel_wattage?: number;

    // Load
    total_load_watts: number;
    total_surge_watts: number;
    appliances: any[]; // JSON

    created_at: string;
};

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

    useEffect(() => {
        fetchQuotes();
    }, []);

    async function fetchQuotes() {
        setLoading(true);
        const { data, error } = await supabase
            .from("quotes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching quotes:", error);
        } else {
            setQuotes(data || []);
        }
        setLoading(false);
    }

    const filteredQuotes = quotes.filter(q =>
        (q.customer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (q.quote_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (q.customer_phone?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold text-[#110000]">Customer Quotes</h1>
                </div>
                <button
                    onClick={fetchQuotes}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        {filteredQuotes.length} record{filteredQuotes.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Quote #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">System Size</th>
                                <th className="px-6 py-4">Est. Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Loading quotes...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQuotes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                                        No quotes found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredQuotes.map((quote) => (
                                    <tr key={quote.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {new Date(quote.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600 font-medium group-hover:text-blue-600 transition-colors">
                                            {quote.quote_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{quote.customer_name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {quote.customer_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {quote.recommended_kva} kVA
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">{quote.system_voltage}V</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ₦{formatMoney(quote.estimated_price)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedQuote(quote)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-md transition-all bg-white"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 scrollbar-hide">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Quote Details</h2>
                                <p className="text-sm text-gray-600 font-mono mt-1">{selectedQuote.quote_number}</p>
                            </div>
                            <button
                                onClick={() => setSelectedQuote(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Customer Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-600" /> Customer Info
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-600">Name:</span> <span className="font-medium text-gray-900">{selectedQuote.customer_name}</span></p>
                                        <p><span className="text-gray-600">Phone:</span> <span className="font-medium text-gray-900">{selectedQuote.customer_phone}</span></p>
                                        <p><span className="text-gray-600">Address:</span> <span className="font-medium text-gray-900">{selectedQuote.customer_address}</span></p>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-blue-600" /> System Summary
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p className="flex justify-between"><span className="text-blue-700">Size:</span> <span className="font-bold text-blue-900">{selectedQuote.recommended_kva} kVA</span></p>
                                        <p className="flex justify-between"><span className="text-blue-700">Voltage:</span> <span className="font-bold text-blue-900">{selectedQuote.system_voltage}V</span></p>
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="flex justify-between items-center">
                                                <span className="text-blue-700">Total Price:</span>
                                                <span className="text-lg font-bold text-blue-900">₦{formatMoney(selectedQuote.estimated_price)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Components Breakdown */}
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-4 px-1">System Components</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Inverter */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2 text-purple-600">
                                            <Cpu className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Inverter</span>
                                        </div>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {selectedQuote.inverter_name || `${selectedQuote.recommended_kva}kVA Inverter`}
                                        </p>
                                    </div>

                                    {/* Panels */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2 text-orange-500">
                                            <Sun className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Solar Panels</span>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{selectedQuote.panel_count || 0}x Panels</p>
                                            <p className="text-gray-600 text-xs mt-0.5">Rating: {selectedQuote.panel_wattage || 0}W</p>
                                        </div>
                                    </div>

                                    {/* Battery */}
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2 text-green-600">
                                            <Battery className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Battery Bank</span>
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{selectedQuote.battery_count || 0}x Batteries</p>
                                            <p className="text-gray-600 text-xs mt-0.5 capitalize">
                                                {selectedQuote.battery_type || "Standard"} • {selectedQuote.battery_ah || 0}Ah
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Load Breakdown */}
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-4 px-1 flex justify-between items-center">
                                    <span>Appliances Load</span>
                                    <span className="text-xs font-normal text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                        Total Run: {selectedQuote.total_load_watts}W
                                    </span>
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3">Item</th>
                                                <th className="px-4 py-3 text-center">Qty</th>
                                                <th className="px-4 py-3 text-center">Watts</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedQuote.appliances && Array.isArray(selectedQuote.appliances) ? (
                                                selectedQuote.appliances.map((app: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2.5 text-gray-900 font-medium">{app.name}</td>
                                                        <td className="px-4 py-2.5 text-center text-gray-600">{app.qty}</td>
                                                        <td className="px-4 py-2.5 text-center text-gray-600">{app.watts}W</td>
                                                        <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{app.qty * app.watts}W</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-4 text-center text-gray-600 italic">No appliance data recorded</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedQuote(null)}
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
