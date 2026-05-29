"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Eye, X, CheckCircle, XCircle, FileText, Download } from "lucide-react";

export default function AdminInstalmentsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    async function fetchApplications() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("instalment_applications")
                .select(`
                    *,
                    products (
                        id,
                        name,
                        price,
                        instalment_down_payment
                    ),
                    instalment_schedules (
                        id,
                        status,
                        due_date,
                        amount_due,
                        paid_at,
                        paystack_reference
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (err: any) {
            console.error("Error fetching applications:", err);
            alert("Failed to load instalment applications.");
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: string, newStatus: string) {
        if (!confirm(`Are you sure you want to mark this application as ${newStatus}?`)) return;
        
        try {
            const { error } = await supabase
                .from("instalment_applications")
                .update({ status: newStatus })
                .eq("id", id);
                
            if (error) throw error;
            
            // Update local state
            setApplications(apps => apps.map(app => 
                app.id === id ? { ...app, status: newStatus } : app
            ));
            
            if (selectedApp && selectedApp.id === id) {
                setSelectedApp({ ...selectedApp, status: newStatus });
            }
            
        } catch (err: any) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        }
    }

    async function markScheduleAsPaid(scheduleId: string, appId: string) {
        if (!confirm("Are you sure you want to mark this instalment month as paid?")) return;
        
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from("instalment_schedules")
                .update({ 
                    status: "paid",
                    paid_at: now,
                    paystack_reference: "OFFLINE_PAYMENT_" + Date.now()
                })
                .eq("id", scheduleId)
                .select()
                .single();
                
            if (error) throw error;
            
            // Update local state for schedules nested inside applications
            setApplications(apps => apps.map(app => {
                if (app.id === appId) {
                    const updatedSchedules = app.instalment_schedules?.map((s: any) => 
                        s.id === scheduleId ? data : s
                    ) || [data];
                    return { ...app, instalment_schedules: updatedSchedules };
                }
                return app;
            }));
            
            // Also update selectedApp if it matches
            if (selectedApp && selectedApp.id === appId) {
                const updatedSchedules = selectedApp.instalment_schedules?.map((s: any) => 
                    s.id === scheduleId ? data : s
                ) || [data];
                setSelectedApp({ ...selectedApp, instalment_schedules: updatedSchedules });
            }
            
            alert("Payment schedule marked as paid successfully.");
        } catch (err: any) {
            console.error("Error marking schedule as paid:", err);
            alert("Failed to update payment status.");
        }
    }

    async function generateSchedules(app: any) {
        if (!confirm(`Are you sure you want to generate ${app.duration_months} month payment schedules for this application?`)) return;
        
        try {
            const durationMonths = app.duration_months;
            const monthlyPayment = app.monthly_payment_amount;

            if (!durationMonths || !monthlyPayment) {
                alert("This application does not have a duration or monthly payment amount set.");
                return;
            }

            const schedules = [];
            for (let i = 1; i <= durationMonths; i++) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (30 * i));
                
                schedules.push({
                    application_id: app.id,
                    user_id: app.user_id,
                    amount_due: monthlyPayment,
                    due_date: dueDate.toISOString(),
                    status: 'pending'
                });
            }

            const { data, error } = await supabase
                .from('instalment_schedules')
                .insert(schedules)
                .select();
                
            if (error) throw error;

            // Update local state
            setApplications(apps => apps.map(a => 
                a.id === app.id ? { ...a, instalment_schedules: data } : a
            ));
            
            if (selectedApp && selectedApp.id === app.id) {
                setSelectedApp({ ...selectedApp, instalment_schedules: data });
            }
            
            alert("Schedules generated successfully.");
        } catch (err: any) {
            console.error("Error generating schedules:", err);
            alert("Failed to generate payment schedules.");
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instalment Applications</h1>
                    <p className="text-gray-500 text-sm mt-1">Review customer KYC details and approve instalment payments.</p>
                </div>
                <button onClick={fetchApplications} className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                    Refresh List
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-700">No applications found</p>
                    <p className="text-sm mt-1">When customers submit instalment forms, they will appear here.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(app.created_at).toLocaleDateString()}
                                            <div className="text-xs text-gray-400">{new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{app.name}</div>
                                            <div className="text-xs text-gray-500">{app.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800 line-clamp-1">{app.products?.name || "Unknown Product"}</div>
                                            <div className="text-xs text-green-600 font-medium">Down: ₦{app.products?.instalment_down_payment?.toLocaleString()}</div>
                                            {app.duration_months && (
                                                <div className="text-xs text-blue-600 font-medium flex flex-col gap-0.5 mt-1">
                                                    <div>Plan: {app.duration_months} Mos @ ₦{Number(app.monthly_payment_amount).toLocaleString()}/mo</div>
                                                    <div className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-100 rounded px-1.5 py-0.5 w-max font-bold">
                                                        Paid: {app.instalment_schedules?.filter((s: any) => s.status === 'paid').length || 0} / {app.duration_months} Mos
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {app.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedApp(app)}
                                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 w-full"
                                            >
                                                <Eye className="w-4 h-4" /> View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-60 overflow-hidden">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shadow-sm z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
                                <p className="text-xs text-gray-500">ID: {selectedApp.id}</p>
                            </div>
                            <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-gray-800 p-2 bg-gray-200 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
                            
                            {/* Status Actions */}
                            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-gray-500 block mb-1">Current Status</span>
                                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                                        selectedApp.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        selectedApp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {selectedApp.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {selectedApp.status !== 'approved' && (
                                        <button onClick={() => updateStatus(selectedApp.id, 'approved')} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                    )}
                                    {selectedApp.status !== 'rejected' && (
                                        <button onClick={() => updateStatus(selectedApp.id, 'rejected')} className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium transition">
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Section 1: Product & Payment */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 border-b font-semibold text-gray-700 text-sm uppercase tracking-wider">Product & Payment</div>
                                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="col-span-2"><span className="text-gray-500 block text-xs">Product Requested</span> <span className="font-medium text-base">{selectedApp.products?.name}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Total Price (Outright)</span> <span className="font-medium">₦{selectedApp.products?.price?.toLocaleString()}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Required Down Payment</span> <span className="font-bold text-green-600">₦{selectedApp.products?.instalment_down_payment?.toLocaleString()}</span></div>
                                    
                                    {selectedApp.duration_months && (
                                        <div className="col-span-2 grid grid-cols-3 gap-4 mt-2 pt-4 border-t border-gray-100">
                                            <div><span className="text-gray-500 block text-xs">Agreed Term</span> <span className="font-bold text-blue-700">{selectedApp.duration_months} Months</span></div>
                                            <div><span className="text-gray-500 block text-xs">Monthly Repayment</span> <span className="font-bold text-blue-700">₦{Number(selectedApp.monthly_payment_amount).toLocaleString()} / mo</span></div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Repayment Progress</span>
                                                <span className="font-bold text-green-700 block">
                                                    {selectedApp.instalment_schedules?.filter((s: any) => s.status === 'paid').length || 0} / {selectedApp.duration_months} Months Paid
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Client Info */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-blue-50 px-4 py-2 border-b font-semibold text-blue-800 text-sm uppercase tracking-wider">Client Information</div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div><span className="text-gray-500 block text-xs">Full Name</span> <span className="font-medium">{selectedApp.name}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Phone Number</span> <span className="font-medium">{selectedApp.phone}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Email Address</span> <span className="font-medium">{selectedApp.email}</span></div>
                                    <div><span className="text-gray-500 block text-xs">BVN</span> <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-red-600 tracking-wider font-bold">{selectedApp.bvn || 'N/A'}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Relationship Status</span> <span>{selectedApp.relationship_status}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Occupation</span> <span>{selectedApp.occupation}</span></div>
                                    <div className="col-span-2"><span className="text-gray-500 block text-xs">Residential Address</span> <span>{selectedApp.address}</span></div>
                                </div>
                            </div>

                            {/* Section 3: Guarantor Info */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-orange-50 px-4 py-2 border-b font-semibold text-orange-800 text-sm uppercase tracking-wider">Guarantor Information</div>
                                <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div><span className="text-gray-500 block text-xs">Guarantor Name</span> <span className="font-medium">{selectedApp.guarantor_name}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Guarantor Phone</span> <span className="font-medium">{selectedApp.guarantor_phone}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Guarantor Email</span> <span>{selectedApp.guarantor_email || 'N/A'}</span></div>
                                    <div><span className="text-gray-500 block text-xs">Relationship to Client</span> <span>{selectedApp.guarantor_relationship}</span></div>
                                    <div className="col-span-2"><span className="text-gray-500 block text-xs">Guarantor Address</span> <span>{selectedApp.guarantor_address}</span></div>
                                </div>
                            </div>

                            {/* Section 4: Documents */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="bg-purple-50 px-4 py-2 border-b font-semibold text-purple-800 text-sm uppercase tracking-wider">KYC Documents</div>
                                <div className="p-4 space-y-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs mb-1">NIN Number</span>
                                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-purple-700 tracking-wider font-bold">{selectedApp.nin_number || 'N/A'}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                                        <a href={selectedApp.id_document_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition group">
                                            <div className="bg-purple-100 p-2 rounded mr-3 text-purple-600 group-hover:bg-purple-200 transition">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 text-sm">ID Document (NIN)</div>
                                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5"><Download className="w-3 h-3" /> View / Download</div>
                                            </div>
                                        </a>

                                        <a href={selectedApp.proof_of_address_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition group">
                                            <div className="bg-purple-100 p-2 rounded mr-3 text-purple-600 group-hover:bg-purple-200 transition">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 text-sm">Proof of Address</div>
                                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5"><Download className="w-3 h-3" /> View / Download</div>
                                            </div>
                                        </a>

                                        {selectedApp.guarantor_id_doc_url && (
                                            <a href={selectedApp.guarantor_id_doc_url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border rounded-lg hover:bg-orange-50 border-orange-100 transition group">
                                                <div className="bg-orange-100 p-2 rounded mr-3 text-orange-600 group-hover:bg-orange-200 transition">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800 text-sm">Guarantor ID</div>
                                                    <div className="text-xs text-orange-600 flex items-center gap-1 mt-0.5"><Download className="w-3 h-3" /> View / Download</div>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Payment Schedule */}
                            {selectedApp.duration_months && (
                                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                    <div className="bg-green-50 px-4 py-2.5 border-b font-semibold text-green-800 text-sm uppercase tracking-wider flex justify-between items-center">
                                        <span>Repayment Schedule</span>
                                        <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">
                                            {selectedApp.instalment_schedules?.filter((s: any) => s.status === 'paid').length || 0} of {selectedApp.duration_months} Months Cleared
                                        </span>
                                    </div>
                                    <div className="p-4 text-sm space-y-3 divide-y divide-gray-100">
                                        {selectedApp.instalment_schedules && selectedApp.instalment_schedules.length > 0 ? (
                                            selectedApp.instalment_schedules
                                                .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                                                .map((schedule: any, idx: number) => (
                                                    <div key={schedule.id} className="pt-3 first:pt-0 flex justify-between items-center gap-4">
                                                        <div>
                                                            <div className="font-semibold text-gray-800">Month {idx + 1} Payment</div>
                                                            <div className="text-xs text-gray-400">Due: {new Date(schedule.due_date).toLocaleDateString()}</div>
                                                            {schedule.paid_at && (
                                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                                    Paid on: {new Date(schedule.paid_at).toLocaleDateString()} {schedule.paystack_reference && `(Ref: ${schedule.paystack_reference})`}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-gray-700">₦{Number(schedule.amount_due).toLocaleString()}</span>
                                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                                                schedule.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                schedule.status === 'late' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {schedule.status}
                                                            </span>
                                                            {schedule.status !== 'paid' && (
                                                                <button
                                                                    onClick={() => markScheduleAsPaid(schedule.id, selectedApp.id)}
                                                                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded border border-blue-200 transition cursor-pointer"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-center py-6 text-gray-505">
                                                <p className="text-xs italic">No schedules generated yet.</p>
                                                {selectedApp.status === 'approved' && (
                                                    <button
                                                        onClick={() => generateSchedules(selectedApp)}
                                                        className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition cursor-pointer"
                                                    >
                                                        Generate Payment Schedules
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
