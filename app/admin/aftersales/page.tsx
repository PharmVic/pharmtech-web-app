"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, 
  Search, 
  Filter, 
  Eye, 
  Trash2,
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  User
} from "lucide-react";

type AftersalesRegistration = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_purchased: string;
  purchase_date: string;
  status: string;
  created_at: string;
};

export default function AdminAftersalesPage() {
  const [registrations, setRegistrations] = useState<AftersalesRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail Modal
  const [selectedReg, setSelectedReg] = useState<AftersalesRegistration | null>(null);
  const [newStatus, setNewStatus] = useState("pending");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("aftersales_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error("Error fetching aftersales registrations:", err);
      alert("Failed to load aftersales registrations from database.");
    } finally {
      setLoading(false);
    }
  }

  // Handle open details modal
  const handleOpenDetails = (reg: AftersalesRegistration) => {
    setSelectedReg(reg);
    setNewStatus(reg.status);
  };

  // Handle save status update
  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("aftersales_registrations")
        .update({ status: newStatus })
        .eq("id", selectedReg.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state list
      setRegistrations(prev => prev.map(r => r.id === selectedReg.id ? data : r));
      setSelectedReg(data);
      alert("Registration status updated successfully!");
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(`Failed to save details: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete registration
  const handleDeleteRegistration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("aftersales_registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remove from local list
      setRegistrations(prev => prev.filter(r => r.id !== id));
      if (selectedReg?.id === id) {
        setSelectedReg(null);
      }
      alert("Registration deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting registration:", err);
      alert(`Failed to delete registration: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter registrations based on search term & status filter
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = 
      reg.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.product_purchased.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aftersales Support</h1>
          <p className="text-gray-600 text-sm">View, track, and update warranty and maintenance registrations submitted by customers.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-gray-55/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-48 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="active">Active Support</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Table or Loading View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm text-gray-500 font-medium">Loading registrations from database...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              No aftersales registrations found matching the filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-55/80 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Product Purchased</th>
                    <th className="p-4">Purchase Date</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRegistrations.map((reg) => {
                    let statusBadge = "bg-yellow-50 text-yellow-700 border-yellow-200";
                    if (reg.status === "active") statusBadge = "bg-blue-50 text-blue-700 border-blue-200";
                    if (reg.status === "resolved") statusBadge = "bg-green-50 text-green-700 border-green-200";

                    return (
                      <tr key={reg.id} className="hover:bg-gray-55/20 transition-colors group">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900 text-sm">{reg.customer_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5 flex flex-col gap-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {reg.customer_email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {reg.customer_phone}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-900">{reg.product_purchased}</td>
                        <td className="p-4 text-gray-600">{new Date(reg.purchase_date).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-500">{new Date(reg.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${statusBadge}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetails(reg)}
                              className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRegistration(reg.id)}
                              disabled={deletingId === reg.id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-55/20 rounded-lg transition-colors"
                              title="Delete Record"
                            >
                              {deletingId === reg.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details & Status Edit Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border max-w-lg w-full overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-yellow-300" /> Registration Details
              </h3>
              <button
                onClick={() => setSelectedReg(null)}
                className="text-white hover:text-yellow-100 font-medium text-sm transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">Customer Information</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500">Name</span>
                  <span className="col-span-2 font-semibold text-gray-800 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> {selectedReg.customer_name}</span>

                  <span className="text-gray-500">Email</span>
                  <span className="col-span-2 font-semibold text-gray-800 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedReg.customer_email}</span>

                  <span className="text-gray-500">Phone</span>
                  <span className="col-span-2 font-semibold text-gray-800 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedReg.customer_phone}</span>
                </div>
              </div>

              {/* Product Info Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">Product Information</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-gray-500">Product Name</span>
                  <span className="col-span-2 font-semibold text-gray-900">{selectedReg.product_purchased}</span>

                  <span className="text-gray-500">Purchase Date</span>
                  <span className="col-span-2 font-semibold text-gray-800 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(selectedReg.purchase_date).toLocaleDateString()}</span>

                  <span className="text-gray-500">Registered Date</span>
                  <span className="col-span-2 font-semibold text-gray-800 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(selectedReg.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Update Status Form */}
              <form onSubmit={handleSaveStatus} className="pt-4 border-t space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Registration Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="active">Active Support</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReg(null)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition text-sm font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-sm font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Status"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
