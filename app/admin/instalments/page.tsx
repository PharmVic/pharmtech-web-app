"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
    Loader2, Eye, X, CheckCircle, XCircle, FileText, Download, 
    Search, CreditCard, RotateCcw, AlertCircle, Phone, Mail, 
    Calendar, Check, ShieldAlert, Sparkles, ExternalLink
} from "lucide-react";
import { calculateInstalmentPenalty } from "@/lib/instalments";

export default function AdminInstalmentsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Modal state for Confirming Down Payment
    const [downPaymentModalApp, setDownPaymentModalApp] = useState<any | null>(null);
    const [dpMethod, setDpMethod] = useState("Bank Transfer");
    const [dpReference, setDpReference] = useState("");
    const [dpDate, setDpDate] = useState(() => new Date().toISOString().split("T")[0]);

    // Modal state for Confirming Monthly Payment
    const [monthlyPaymentModal, setMonthlyPaymentModal] = useState<{ app: any; schedule: any } | null>(null);
    const [mpMethod, setMpMethod] = useState("Bank Transfer");
    const [mpReference, setMpReference] = useState("");
    const [mpDate, setMpDate] = useState(() => new Date().toISOString().split("T")[0]);

    useEffect(() => {
        fetchApplications();
    }, []);

    async function getAuthHeader() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated. Please sign in as admin.");
        return {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        };
    }

    async function fetchApplications() {
        setLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", { headers, cache: "no-store" });
            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || "Failed to load instalment applications");
            }

            const apps = data.applications || [];
            setApplications(apps);

            // If selectedApp is open, refresh it with new data
            if (selectedApp) {
                const refreshed = apps.find((a: any) => a.id === selectedApp.id);
                if (refreshed) setSelectedApp(refreshed);
            }
        } catch (err: any) {
            console.error("Error fetching applications:", err);
            alert(err.message || "Failed to load instalment applications.");
        } finally {
            setLoading(false);
        }
    }

    // 1. APPROVE APPLICATION (Paused -> Approved)
    async function handleApprove(appId: string) {
        if (!confirm("Are you sure you want to APPROVE this applicant? They will then be eligible to pay their down payment.")) return;
        setActionLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", {
                method: "POST",
                headers,
                body: JSON.stringify({ action: "approve", applicationId: appId })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to approve application");

            alert("Application approved successfully! Customer can now proceed with down payment.");
            await fetchApplications();
        } catch (err: any) {
            console.error("Approve error:", err);
            alert(err.message || "Failed to approve application");
        } finally {
            setActionLoading(false);
        }
    }

    // 2. REJECT APPLICATION
    async function handleReject(appId: string) {
        if (!confirm("Are you sure you want to REJECT this application?")) return;
        setActionLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", {
                method: "POST",
                headers,
                body: JSON.stringify({ action: "reject", applicationId: appId })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to reject application");

            alert("Application marked as rejected.");
            await fetchApplications();
        } catch (err: any) {
            console.error("Reject error:", err);
            alert(err.message || "Failed to reject application");
        } finally {
            setActionLoading(false);
        }
    }

    // 3. CONFIRM DOWN PAYMENT
    async function handleConfirmDownPayment() {
        if (!downPaymentModalApp) return;
        setActionLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    action: "confirm_down_payment",
                    applicationId: downPaymentModalApp.id,
                    paymentMethod: dpMethod,
                    reference: dpReference || `MANUAL_${dpMethod.toUpperCase()}_${Date.now()}`,
                    paidAt: dpDate ? new Date(dpDate).toISOString() : new Date().toISOString()
                })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to confirm down payment");

            alert("Down payment confirmed successfully! Payment schedules generated and plan is now active.");
            setDownPaymentModalApp(null);
            setDpReference("");
            await fetchApplications();
        } catch (err: any) {
            console.error("Confirm down payment error:", err);
            alert(err.message || "Failed to confirm down payment");
        } finally {
            setActionLoading(false);
        }
    }

    // 4. REVERT DOWN PAYMENT
    async function handleRevertDownPayment(appId: string) {
        if (!confirm("Are you sure you want to revert this down payment? Status will return to 'approved' (awaiting down payment).")) return;
        setActionLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", {
                method: "POST",
                headers,
                body: JSON.stringify({ action: "revert_down_payment", applicationId: appId })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to revert down payment");

            alert("Down payment reverted successfully.");
            await fetchApplications();
        } catch (err: any) {
            console.error("Revert down payment error:", err);
            alert(err.message || "Failed to revert down payment");
        } finally {
            setActionLoading(false);
        }
    }

    // 5. CONFIRM MONTHLY PAYMENT
    async function handleConfirmMonthlyPayment() {
        if (!monthlyPaymentModal) return;
        setActionLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    action: "confirm_monthly_payment",
                    applicationId: monthlyPaymentModal.app.id,
                    scheduleId: monthlyPaymentModal.schedule.id,
                    paymentMethod: mpMethod,
                    reference: mpReference || `MANUAL_${mpMethod.toUpperCase()}_${Date.now()}`,
                    paidAt: mpDate ? new Date(mpDate).toISOString() : new Date().toISOString()
                })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to confirm monthly payment");

            alert(data.message || "Monthly payment confirmed successfully.");
            setMonthlyPaymentModal(null);
            setMpReference("");
            await fetchApplications();
        } catch (err: any) {
            console.error("Confirm monthly payment error:", err);
            alert(err.message || "Failed to confirm monthly payment");
        } finally {
            setActionLoading(false);
        }
    }

    // 6. REVERT MONTHLY PAYMENT
    async function handleRevertMonthlyPayment(appId: string, scheduleId: string) {
        if (!confirm("Are you sure you want to unmark this monthly payment? It will return to pending/unpaid.")) return;
        setActionLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    action: "revert_monthly_payment",
                    applicationId: appId,
                    scheduleId: scheduleId
                })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to revert monthly payment");

            alert("Monthly payment unmarked.");
            await fetchApplications();
        } catch (err: any) {
            console.error("Revert monthly payment error:", err);
            alert(err.message || "Failed to revert payment");
        } finally {
            setActionLoading(false);
        }
    }

    // 7. GENERATE SCHEDULES (Manual Fallback)
    async function handleGenerateSchedules(app: any) {
        if (!confirm(`Generate ${app.duration_months} monthly schedules for this application?`)) return;
        setActionLoading(true);
        try {
            const headers = await getAuthHeader();
            const res = await fetch("/api/admin/instalments", {
                method: "POST",
                headers,
                body: JSON.stringify({ action: "generate_schedules", applicationId: app.id })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Failed to generate schedules");

            alert("Schedules generated successfully.");
            await fetchApplications();
        } catch (err: any) {
            console.error("Generate schedules error:", err);
            alert(err.message || "Failed to generate schedules");
        } finally {
            setActionLoading(false);
        }
    }

    // Filter applications
    const filteredApplications = applications.filter((app) => {
        // Status filter
        if (filterStatus === "pending" && app.status !== "pending") return false;
        if (filterStatus === "approved" && app.status !== "approved") return false;
        if (filterStatus === "active" && app.status !== "active") return false;
        if (filterStatus === "completed" && app.status !== "completed") return false;
        if (filterStatus === "rejected" && app.status !== "rejected") return false;

        // Search query filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const nameMatch = app.name?.toLowerCase().includes(q);
            const phoneMatch = app.phone?.toLowerCase().includes(q);
            const emailMatch = app.email?.toLowerCase().includes(q);
            const ninMatch = app.nin_number?.toLowerCase().includes(q);
            const bvnMatch = app.bvn?.toLowerCase().includes(q);
            const prodMatch = (app.product_name_snapshot || app.products?.name || "").toLowerCase().includes(q);
            return nameMatch || phoneMatch || emailMatch || ninMatch || bvnMatch || prodMatch;
        }

        return true;
    });

    // Counts for tabs
    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === "pending").length,
        approved: applications.filter(a => a.status === "approved").length,
        active: applications.filter(a => a.status === "active").length,
        completed: applications.filter(a => a.status === "completed").length,
        rejected: applications.filter(a => a.status === "rejected").length,
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instalment Applications & Manual Payment Approvals</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Applicants are paused for admin review. Approve applications and manually confirm down payments & monthly repayments.
                    </p>
                </div>
                <button
                    onClick={fetchApplications}
                    className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <div 
                    onClick={() => setFilterStatus("pending")}
                    className={`cursor-pointer p-4 rounded-xl border transition ${
                        filterStatus === "pending" 
                            ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400" 
                            : "bg-white border-gray-200 hover:border-amber-300"
                    }`}
                >
                    <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Paused / Pending</span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{counts.pending}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Awaiting Approval</div>
                </div>

                <div 
                    onClick={() => setFilterStatus("approved")}
                    className={`cursor-pointer p-4 rounded-xl border transition ${
                        filterStatus === "approved" 
                            ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400" 
                            : "bg-white border-gray-200 hover:border-blue-300"
                    }`}
                >
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Awaiting Down Payment</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{counts.approved}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Approved by Admin</div>
                </div>

                <div 
                    onClick={() => setFilterStatus("active")}
                    className={`cursor-pointer p-4 rounded-xl border transition ${
                        filterStatus === "active" 
                            ? "bg-green-50 border-green-300 ring-2 ring-green-400" 
                            : "bg-white border-gray-200 hover:border-green-300"
                    }`}
                >
                    <div className="text-xs font-semibold text-green-700 uppercase tracking-wider">Active Plans</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{counts.active}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Down Payment Cleared</div>
                </div>

                <div 
                    onClick={() => setFilterStatus("completed")}
                    className={`cursor-pointer p-4 rounded-xl border transition ${
                        filterStatus === "completed" 
                            ? "bg-purple-50 border-purple-300 ring-2 ring-purple-400" 
                            : "bg-white border-gray-200 hover:border-purple-300"
                    }`}
                >
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Completed</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{counts.completed}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">All Months Cleared</div>
                </div>

                <div 
                    onClick={() => setFilterStatus("all")}
                    className={`cursor-pointer p-4 rounded-xl border transition ${
                        filterStatus === "all" 
                            ? "bg-gray-100 border-gray-400 ring-2 ring-gray-400" 
                            : "bg-white border-gray-200 hover:border-gray-400"
                    }`}
                >
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Records</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{counts.all}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">All Applications</div>
                </div>
            </div>

            {/* Controls: Search and Status Filters */}
            <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name, phone, NIN, BVN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50/50"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    {[
                        { key: "all", label: `All (${counts.all})` },
                        { key: "pending", label: `Paused / Under Review (${counts.pending})` },
                        { key: "approved", label: `Awaiting Down Payment (${counts.approved})` },
                        { key: "active", label: `Active (${counts.active})` },
                        { key: "completed", label: `Completed (${counts.completed})` },
                        { key: "rejected", label: `Rejected (${counts.rejected})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilterStatus(tab.key)}
                            className={`px-3 py-1.5 rounded-lg transition ${
                                filterStatus === tab.key
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl border">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                    <span className="text-sm text-gray-500">Loading instalment applications...</span>
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-700">No applications found</p>
                    <p className="text-sm mt-1">
                        {filterStatus !== "all" 
                            ? `No applications currently match the filter '${filterStatus}'.` 
                            : "When customers submit instalment forms, they will appear here."}
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Product & Plan</th>
                                    <th className="px-6 py-4 font-semibold">Down Payment</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredApplications.map((app) => {
                                    const isPending = app.status === "pending";
                                    const isApproved = app.status === "approved";
                                    const isActive = app.status === "active";
                                    const isCompleted = app.status === "completed";
                                    const isRejected = app.status === "rejected";

                                    const downPaymentAmount = Number(app.down_payment_amount != null 
                                        ? app.down_payment_amount 
                                        : (app.products?.instalment_down_payment || 0));

                                    const paidMonths = app.instalment_schedules?.filter((s: any) => s.status === 'paid').length || 0;
                                    const totalMonths = app.duration_months || 0;

                                    return (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{new Date(app.created_at).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-400">{new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{app.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3" /> {app.phone}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {app.email}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800 line-clamp-1">{app.product_name_snapshot || app.products?.name || "Product"}</div>
                                                <div className="text-xs text-blue-700 font-semibold mt-1">
                                                    {totalMonths} Mos @ ₦{Number(app.monthly_payment_amount || 0).toLocaleString()} / mo
                                                </div>
                                                {(isActive || isCompleted) && (
                                                    <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                                                        Monthly: {paidMonths} / {totalMonths} Mos Cleared
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">₦{downPaymentAmount.toLocaleString()}</div>
                                                {isActive || isCompleted ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 mt-1">
                                                        <Check className="w-3 h-3" /> Paid
                                                    </span>
                                                ) : isApproved ? (
                                                    <button
                                                        onClick={() => setDownPaymentModalApp(app)}
                                                        className="mt-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-0.5 rounded shadow-sm transition inline-flex items-center gap-1"
                                                    >
                                                        <CreditCard className="w-3 h-3" /> Confirm Down Payment
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 block mt-0.5">Awaiting Approval</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1 ${
                                                    isPending ? "bg-amber-100 text-amber-800 border border-amber-300" :
                                                    isApproved ? "bg-blue-100 text-blue-800 border border-blue-300" :
                                                    isActive ? "bg-green-100 text-green-800 border border-green-300" :
                                                    isCompleted ? "bg-purple-100 text-purple-800 border border-purple-300" :
                                                    "bg-red-100 text-red-800 border border-red-300"
                                                }`}>
                                                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>}
                                                    {isPending ? "PAUSED / UNDER REVIEW" :
                                                     isApproved ? "APPROVED (DOWN PAYMENT DUE)" :
                                                     isActive ? "ACTIVE (REPAYING)" :
                                                     isCompleted ? "COMPLETED" :
                                                     app.status.toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isPending && (
                                                        <button 
                                                            onClick={() => handleApprove(app.id)}
                                                            className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1"
                                                            title="Approve Applicant"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => setSelectedApp(app)}
                                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Application Detail Drawer / Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-60 overflow-hidden">
                    <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shadow-sm z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Application & Repayment Details</h2>
                                <p className="text-xs text-gray-500">ID: {selectedApp.id}</p>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-gray-800 p-2 bg-gray-200 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                            
                            {/* Primary Status Banner & Controls */}
                            <div className="bg-white p-5 rounded-xl border shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wider">Current Application Status</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1.5 text-xs font-extrabold rounded-full ${
                                                selectedApp.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                                selectedApp.status === 'approved' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                                selectedApp.status === 'active' ? 'bg-green-100 text-green-800 border border-green-300' :
                                                selectedApp.status === 'completed' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                                                'bg-red-100 text-red-800 border border-red-300'
                                            }`}>
                                                {selectedApp.status === 'pending' ? 'PAUSED - AWAITING ADMIN APPROVAL' :
                                                 selectedApp.status === 'approved' ? 'APPROVED - AWAITING DOWN PAYMENT' :
                                                 selectedApp.status === 'active' ? 'ACTIVE - REPAYMENTS IN PROGRESS' :
                                                 selectedApp.status === 'completed' ? 'FULLY COMPLETED' :
                                                 selectedApp.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons based on status */}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApp.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(selectedApp.id)} 
                                                    disabled={actionLoading}
                                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve Applicant
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(selectedApp.id)} 
                                                    disabled={actionLoading}
                                                    className="flex items-center gap-1.5 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </>
                                        )}

                                        {selectedApp.status === 'approved' && (
                                            <>
                                                <button 
                                                    onClick={() => setDownPaymentModalApp(selectedApp)} 
                                                    disabled={actionLoading}
                                                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
                                                >
                                                    <CreditCard className="w-4 h-4" /> Confirm Down Payment Manually
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(selectedApp.id)} 
                                                    disabled={actionLoading}
                                                    className="flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {selectedApp.status === 'active' && (
                                            <button 
                                                onClick={() => handleRevertDownPayment(selectedApp.id)} 
                                                disabled={actionLoading}
                                                className="flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                                title="Revert back to approved awaiting down payment"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Revert Down Payment
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Contextual helper description */}
                                <div className="mt-3 text-xs text-gray-600 pt-3 border-t">
                                    {selectedApp.status === 'pending' && (
                                        <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <span><strong>Application Paused:</strong> Please review the KYC documents and Guarantor info below before approving. Once approved, the customer can pay their down payment online or via direct transfer for you to confirm.</span>
                                        </p>
                                    )}
                                    {selectedApp.status === 'approved' && (
                                        <p className="text-blue-800 bg-blue-50 p-2.5 rounded-lg border border-blue-200 flex items-start gap-2">
                                            <CreditCard className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                            <span><strong>Approved (Awaiting Down Payment):</strong> The customer has been approved. Once they make their initial down payment of ₦{Number(selectedApp.down_payment_amount != null ? selectedApp.down_payment_amount : (selectedApp.products?.instalment_down_payment || 0)).toLocaleString()}, click <strong>"Confirm Down Payment Manually"</strong> to activate the plan and generate their repayment schedule.</span>
                                        </p>
                                    )}
                                    {selectedApp.status === 'active' && (
                                        <p className="text-green-800 bg-green-50 p-2.5 rounded-lg border border-green-200 flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                            <span><strong>Plan Active:</strong> Down payment has been received and confirmed. You can manually confirm each monthly instalment as the customer makes payment.</span>
                                        </p>
                                    )}
                                    {selectedApp.status === 'completed' && (
                                        <p className="text-purple-800 bg-purple-50 p-2.5 rounded-lg border border-purple-200 flex items-start gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                                            <span><strong>Completed Plan:</strong> All monthly repayments have been fully cleared!</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Section 1: Product & Payment Overview */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2.5 border-b font-semibold text-gray-700 text-xs uppercase tracking-wider">
                                    Product & Agreement Overview
                                </div>
                                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="col-span-2 sm:col-span-3">
                                        <span className="text-gray-500 block text-xs">Product Requested</span>
                                        <span className="font-bold text-gray-900 text-base">{selectedApp.product_name_snapshot || selectedApp.products?.name}</span>
                                    </div>

                                    <div>
                                        <span className="text-gray-500 block text-xs">Total Outright Price</span>
                                        <span className="font-semibold text-gray-900">₦{Number(selectedApp.products?.price || 0).toLocaleString()}</span>
                                    </div>

                                    <div>
                                        <span className="text-gray-500 block text-xs">Required Down Payment</span>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="font-bold text-green-600 text-base">
                                                ₦{Number(selectedApp.down_payment_amount != null ? selectedApp.down_payment_amount : (selectedApp.products?.instalment_down_payment || 0)).toLocaleString()}
                                            </span>
                                            {(selectedApp.status === 'active' || selectedApp.status === 'completed') ? (
                                                <span className="text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 rounded px-1.5 py-0.5">
                                                    PAID
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5">
                                                    DUE
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-gray-500 block text-xs">Repayment Term</span>
                                        <span className="font-bold text-blue-700">{selectedApp.duration_months} Months</span>
                                    </div>

                                    <div>
                                        <span className="text-gray-500 block text-xs">Monthly Repayment</span>
                                        <span className="font-bold text-blue-700">₦{Number(selectedApp.monthly_payment_amount || 0).toLocaleString()} / mo</span>
                                    </div>

                                    <div className="col-span-2">
                                        <span className="text-gray-500 block text-xs">Repayment Progress</span>
                                        <span className="font-bold text-green-700">
                                            {selectedApp.instalment_schedules?.filter((s: any) => s.status === 'paid').length || 0} of {selectedApp.duration_months} Months Cleared
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Repayment Schedule & Manual Monthly Confirmations */}
                            {selectedApp.duration_months && (
                                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                    <div className="bg-green-50 px-4 py-2.5 border-b font-semibold text-green-800 text-xs uppercase tracking-wider flex justify-between items-center">
                                        <span>Repayment Schedules & Manual Monthly Confirmations</span>
                                        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">
                                            {selectedApp.instalment_schedules?.filter((s: any) => s.status === 'paid').length || 0} / {selectedApp.duration_months} Paid
                                        </span>
                                    </div>

                                    <div className="p-4 text-sm divide-y divide-gray-100">
                                        {selectedApp.instalment_schedules && selectedApp.instalment_schedules.length > 0 ? (
                                            selectedApp.instalment_schedules
                                                .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                                                .map((schedule: any, idx: number) => {
                                                    const isPaid = schedule.status === 'paid';
                                                    const penalty = isPaid
                                                        ? { finalAmount: Number(schedule.amount_due), isPenaltyApplied: false, penaltyPercent: 0 }
                                                        : calculateInstalmentPenalty(schedule.due_date, schedule.amount_due);

                                                    return (
                                                        <div key={schedule.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                            <div>
                                                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                                                    <span>Month {idx + 1} Instalment</span>
                                                                    {isPaid && (
                                                                        <span className="text-[10px] bg-green-100 text-green-800 border border-green-200 font-extrabold px-1.5 py-0.2 rounded">
                                                                            PAID
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                                    <span>Due Date: {new Date(schedule.due_date).toLocaleDateString()}</span>
                                                                    {isPaid && schedule.paid_at && (
                                                                        <span className="text-emerald-700 font-medium">
                                                                            • Paid on {new Date(schedule.paid_at).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {schedule.paystack_reference && (
                                                                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                                                        Ref: {schedule.paystack_reference}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                                <div className="text-right">
                                                                    <div className="font-bold text-gray-900 text-base">
                                                                        ₦{penalty.finalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                                    </div>
                                                                    {penalty.isPenaltyApplied && (
                                                                        <div className="text-[10px] text-red-600 font-bold">
                                                                            Base: ₦{Number(schedule.amount_due).toLocaleString()} (+{penalty.penaltyPercent}% Late Fee)
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {isPaid ? (
                                                                    <button
                                                                        onClick={() => handleRevertMonthlyPayment(selectedApp.id, schedule.id)}
                                                                        disabled={actionLoading}
                                                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1.5 rounded border border-gray-200 transition font-medium"
                                                                        title="Revert back to unpaid"
                                                                    >
                                                                        Unmark
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setMonthlyPaymentModal({ app: selectedApp, schedule })}
                                                                        disabled={actionLoading}
                                                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1"
                                                                    >
                                                                        <Check className="w-3.5 h-3.5" /> Confirm Payment
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                <p className="text-xs italic">No repayment schedules generated yet.</p>
                                                {(selectedApp.status === 'approved' || selectedApp.status === 'active') && (
                                                    <button
                                                        onClick={() => handleGenerateSchedules(selectedApp)}
                                                        disabled={actionLoading}
                                                        className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition"
                                                    >
                                                        Generate Payment Schedules
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Client Info */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-blue-50 px-4 py-2 border-b font-semibold text-blue-800 text-xs uppercase tracking-wider">
                                    Applicant Personal Details
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs">Full Name</span>
                                        <span className="font-semibold text-gray-900">{selectedApp.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Phone Number</span>
                                        <a href={`tel:${selectedApp.phone}`} className="font-semibold text-blue-600 hover:underline flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {selectedApp.phone}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Email Address</span>
                                        <a href={`mailto:${selectedApp.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {selectedApp.email}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">BVN</span>
                                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600 tracking-wider font-bold text-xs">
                                            {selectedApp.bvn || "N/A"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Relationship Status</span>
                                        <span>{selectedApp.relationship_status || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Occupation</span>
                                        <span>{selectedApp.occupation || "N/A"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500 block text-xs">Residential Address</span>
                                        <span className="text-gray-800">{selectedApp.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Guarantor Info */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-orange-50 px-4 py-2 border-b font-semibold text-orange-800 text-xs uppercase tracking-wider">
                                    Guarantor Information
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs">Guarantor Name</span>
                                        <span className="font-semibold text-gray-900">{selectedApp.guarantor_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Guarantor Phone</span>
                                        <a href={`tel:${selectedApp.guarantor_phone}`} className="font-semibold text-orange-600 hover:underline flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {selectedApp.guarantor_phone}
                                        </a>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Guarantor Email</span>
                                        <span>{selectedApp.guarantor_email || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">Relationship to Client</span>
                                        <span>{selectedApp.guarantor_relationship || "N/A"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500 block text-xs">Guarantor Address</span>
                                        <span className="text-gray-800">{selectedApp.guarantor_address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Documents */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-purple-50 px-4 py-2 border-b font-semibold text-purple-800 text-xs uppercase tracking-wider">
                                    KYC Verification Documents
                                </div>
                                <div className="p-4 space-y-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs mb-1">NIN Number</span>
                                        <span className="font-mono bg-purple-50 border border-purple-200 px-2.5 py-1 rounded text-purple-800 tracking-wider font-bold text-xs inline-block">
                                            {selectedApp.nin_number || "N/A"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                                        <a 
                                            href={selectedApp.id_document_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center p-3 border rounded-lg hover:bg-purple-50/50 transition group"
                                        >
                                            <div className="bg-purple-100 p-2 rounded mr-3 text-purple-600 group-hover:bg-purple-200 transition">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-800 text-sm">Client ID Document (NIN)</div>
                                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                                    <Download className="w-3 h-3" /> View / Download
                                                </div>
                                            </div>
                                        </a>

                                        <a 
                                            href={selectedApp.proof_of_address_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center p-3 border rounded-lg hover:bg-purple-50/50 transition group"
                                        >
                                            <div className="bg-purple-100 p-2 rounded mr-3 text-purple-600 group-hover:bg-purple-200 transition">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-800 text-sm">Proof of Address</div>
                                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                                                    <Download className="w-3 h-3" /> View / Download
                                                </div>
                                            </div>
                                        </a>

                                        {selectedApp.guarantor_id_doc_url && (
                                            <a 
                                                href={selectedApp.guarantor_id_doc_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center p-3 border rounded-lg hover:bg-orange-50/50 border-orange-100 transition group col-span-1 sm:col-span-2"
                                            >
                                                <div className="bg-orange-100 p-2 rounded mr-3 text-orange-600 group-hover:bg-orange-200 transition">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-800 text-sm">Guarantor Identification Document</div>
                                                    <div className="text-xs text-orange-600 flex items-center gap-1 mt-0.5">
                                                        <Download className="w-3 h-3" /> View / Download
                                                    </div>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Manual Confirm Down Payment */}
            {downPaymentModalApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Down Payment</h3>
                                <p className="text-xs text-gray-500">Record customer's manual down payment</p>
                            </div>
                            <button onClick={() => setDownPaymentModalApp(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-sm">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-900">
                                <div className="text-xs text-blue-700 font-medium">Customer:</div>
                                <div className="font-bold">{downPaymentModalApp.name}</div>
                                <div className="text-xs text-blue-700 mt-1">Product:</div>
                                <div className="font-medium line-clamp-1">{downPaymentModalApp.product_name_snapshot || downPaymentModalApp.products?.name}</div>
                                <div className="text-base font-extrabold text-blue-800 mt-2">
                                    Amount: ₦{Number(downPaymentModalApp.down_payment_amount != null ? downPaymentModalApp.down_payment_amount : (downPaymentModalApp.products?.instalment_down_payment || 0)).toLocaleString()}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
                                <select 
                                    value={dpMethod} 
                                    onChange={(e) => setDpMethod(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg bg-white outline-none focus:border-blue-500"
                                >
                                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                                    <option value="Cash at Office">Cash at Office</option>
                                    <option value="POS Terminal">POS Terminal</option>
                                    <option value="Bank Cheque / Draft">Bank Cheque / Draft</option>
                                    <option value="Online / Paystack">Online / Paystack</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Payment Reference / Transaction Details
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. GTBank Transfer (0893666939) - Ref 984021"
                                    value={dpReference}
                                    onChange={(e) => setDpReference(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date</label>
                                <input
                                    type="date"
                                    value={dpDate}
                                    onChange={(e) => setDpDate(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500 bg-white"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDownPaymentModalApp(null)}
                                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDownPayment}
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Confirm & Activate Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Manual Confirm Monthly Payment */}
            {monthlyPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Monthly Instalment</h3>
                                <p className="text-xs text-gray-500">Record customer's manual monthly payment</p>
                            </div>
                            <button onClick={() => setMonthlyPaymentModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-sm">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-green-900">
                                <div className="text-xs text-green-700 font-medium">Customer:</div>
                                <div className="font-bold">{monthlyPaymentModal.app.name}</div>
                                <div className="text-xs text-green-700 mt-1">Due Date:</div>
                                <div className="font-medium">{new Date(monthlyPaymentModal.schedule.due_date).toLocaleDateString()}</div>
                                <div className="text-base font-extrabold text-green-800 mt-2">
                                    Amount Due: ₦{Number(monthlyPaymentModal.schedule.amount_due).toLocaleString()}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
                                <select 
                                    value={mpMethod} 
                                    onChange={(e) => setMpMethod(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg bg-white outline-none focus:border-blue-500"
                                >
                                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                                    <option value="Cash at Office">Cash at Office</option>
                                    <option value="POS Terminal">POS Terminal</option>
                                    <option value="Bank Cheque / Draft">Bank Cheque / Draft</option>
                                    <option value="Online / Paystack">Online / Paystack</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Payment Reference / Transaction Details
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. GTBank Transfer (0893666939) - Ref 302910"
                                    value={mpReference}
                                    onChange={(e) => setMpReference(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date</label>
                                <input
                                    type="date"
                                    value={mpDate}
                                    onChange={(e) => setMpDate(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-500 bg-white"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMonthlyPaymentModal(null)}
                                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmMonthlyPayment}
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
