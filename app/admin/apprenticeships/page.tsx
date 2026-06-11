"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Loader2, 
  Search, 
  Filter, 
  Eye, 
  FileDown, 
  ExternalLink,
  Calendar,
  UserCheck,
  ClipboardList,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function AdminApprenticeshipsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  // Selected application for detail modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  
  // Office use state for the editing pane inside the modal
  const [officeFields, setOfficeFields] = useState({
    office_date_received: "",
    office_received_by: "",
    office_interview_schedule: "",
    status: "pending",
    office_remarks: ""
  });
  
  const [savingOffice, setSavingOffice] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("apprenticeship_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      alert("Failed to load applications from database.");
    } finally {
      setLoading(false);
    }
  }

  // Handle open modal
  const handleOpenDetails = (app: any) => {
    setSelectedApp(app);
    // Pre-fill office use state
    setOfficeFields({
      office_date_received: app.office_date_received || new Date(app.created_at).toISOString().split('T')[0],
      office_received_by: app.office_received_by || "",
      office_interview_schedule: app.office_interview_schedule ? new Date(app.office_interview_schedule).toISOString().slice(0, 16) : "",
      status: app.status || "pending",
      office_remarks: app.office_remarks || ""
    });
  };

  // Handle save office verification fields
  const handleSaveOfficeFields = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSavingOffice(true);
    try {
      const { data, error } = await supabase
        .from("apprenticeship_applications")
        .update({
          office_date_received: officeFields.office_date_received || null,
          office_received_by: officeFields.office_received_by || null,
          office_interview_schedule: officeFields.office_interview_schedule ? new Date(officeFields.office_interview_schedule).toISOString() : null,
          status: officeFields.status,
          office_remarks: officeFields.office_remarks || null
        })
        .eq("id", selectedApp.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state list
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? data : a));
      setSelectedApp(data);
      alert("Office verification updated successfully!");
    } catch (err: any) {
      console.error("Error updating office fields:", err);
      alert(`Failed to save details: ${err.message}`);
    } finally {
      setSavingOffice(false);
    }
  };

  const handleQuickStatusUpdate = async (newStatus: string) => {
    if (!selectedApp) return;
    
    const statusLabel = newStatus === 'selected' ? 'Accept' : 'Reject';
    if (!confirm(`Are you sure you want to ${statusLabel} this applicant?`)) return;

    setSavingOffice(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const updateData: any = {
        status: newStatus,
        office_date_received: selectedApp.office_date_received || todayStr,
        office_received_by: selectedApp.office_received_by || "Admin"
      };

      const { data, error } = await supabase
        .from("apprenticeship_applications")
        .update(updateData)
        .eq("id", selectedApp.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state list
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? data : a));
      setSelectedApp(data);
      
      // Update form fields state
      setOfficeFields({
        office_date_received: data.office_date_received || todayStr,
        office_received_by: data.office_received_by || "Admin",
        office_interview_schedule: data.office_interview_schedule ? new Date(data.office_interview_schedule).toISOString().slice(0, 16) : "",
        status: data.status,
        office_remarks: data.office_remarks || ""
      });

      alert(`Applicant successfully ${newStatus === 'selected' ? 'Accepted' : 'Rejected'}!`);
    } catch (err: any) {
      console.error("Error doing quick status update:", err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setSavingOffice(false);
    }
  };

  // Filter application items
  const filteredApps = applications.filter(app => {
    const fullName = `${app.first_name} ${app.middle_name || ""} ${app.last_name}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) || 
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.phone.includes(searchTerm);

    const statusMatch = statusFilter === "all" || app.status === statusFilter;
    const positions = app.positions_applied || [];
    const positionMatch = positionFilter === "all" || positions.includes(positionFilter);

    return searchMatch && statusMatch && positionMatch;
  });

  // Calculate Metrics
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === "pending").length;
  const qualifiedApps = applications.filter(a => a.status === "qualified").length;
  const selectedApps = applications.filter(a => a.status === "selected").length;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-100 text-green-800 font-bold border border-green-200";
      case "qualified":
        return "bg-blue-100 text-blue-800 font-bold border border-blue-200";
      case "on_hold":
        return "bg-amber-100 text-amber-800 font-bold border border-amber-200";
      case "not_qualified":
        return "bg-red-100 text-red-800 font-bold border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 font-bold border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "selected":
        return "Selected / Training";
      case "qualified":
        return "Qualified";
      case "on_hold":
        return "On Hold";
      case "not_qualified":
        return "Not Qualified";
      default:
        return "Pending Review";
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-6">
      
      {/* HEADER TITLE */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apprenticeships & Internships</h1>
          <p className="text-sm text-gray-500">Manage and evaluate trainee registrations and documents.</p>
        </div>
        <button 
          onClick={fetchApplications} 
          className="bg-white hover:bg-gray-100 border border-gray-300 font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
        >
          Refresh List
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Total Applications</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalApps}</h3>
          </div>
          <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Pending Review</span>
            <h3 className="text-2xl font-bold text-yellow-600 mt-1">{pendingApps}</h3>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Qualified</span>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{qualifiedApps}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Selected for Training</span>
            <h3 className="text-2xl font-bold text-green-600 mt-1">{selectedApps}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search by candidate name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 bg-gray-50 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 bg-transparent text-sm text-gray-600 outline-none border-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="qualified">Qualified</option>
              <option value="on_hold">On Hold</option>
              <option value="not_qualified">Not Qualified</option>
              <option value="selected">Selected for Training</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 bg-gray-50 shrink-0">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select 
              value={positionFilter} 
              onChange={(e) => setPositionFilter(e.target.value)}
              className="py-2 bg-transparent text-sm text-gray-600 outline-none border-none cursor-pointer"
            >
              <option value="all">All Positions</option>
              <option value="Solar Panel Installation Apprentice">Solar Panel Installation</option>
              <option value="Inverter Technician Apprentice">Inverter Technician</option>
              <option value="Electrical Installation Apprentice">Electrical Installation</option>
              <option value="Battery Systems Apprentice">Battery Systems</option>
              <option value="CCTV / Security Systems Apprentice">CCTV / Security Systems</option>
              <option value="Technical Support Apprentice">Technical Support</option>
              <option value="Other">Other Positions</option>
            </select>
          </div>
        </div>

      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            Loading Applications...
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Candidate Name</th>
                  <th className="px-6 py-4">Position Applied For</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-bold">
                        {app.first_name} {app.last_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {app.age} years ({app.gender})
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {app.positions_applied && app.positions_applied.length > 0 ? (
                          app.positions_applied.map((pos: string) => (
                            pos === "Other" ? (
                              <span key={pos} className="text-purple-800 bg-purple-50 border border-purple-100 text-[10px] font-bold px-2 py-0.5 rounded" title={app.position_applied_other || "Other"}>
                                Other: {app.position_applied_other || "N/A"}
                              </span>
                            ) : (
                              <span key={pos} className="text-blue-800 bg-blue-50 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded" title={pos}>
                                {pos.replace(" Apprentice", "")}
                              </span>
                            )
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {app.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700 mt-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {app.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs uppercase ${getStatusBadgeClass(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleOpenDetails(app)} 
                        className="btn btn-sm btn-outline-primary rounded-lg flex items-center gap-1 inline-flex cursor-pointer text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            No applications match the filters or search.
          </div>
        )}
      </div>

      {/* DETAIL AND OFFICE VERIFICATION MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-green-800 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Apprenticeship Application Review</h3>
                <p className="text-xs text-green-100 mt-0.5">ID: {selectedApp.id}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)} 
                className="text-green-100 hover:text-white font-bold text-xl cursor-pointer bg-green-900 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-8">
              
              {/* Profile Overview */}
              <div className="flex flex-col md:flex-row gap-6 items-start border-b pb-6">
                <div className="shrink-0 w-24 h-24 bg-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  {selectedApp.passport_url ? (
                    <img 
                      src={selectedApp.passport_url} 
                      alt="Passport" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Photo</span>
                  )}
                </div>
                <div className="space-y-1.5 flex-grow">
                  <h2 className="text-2xl font-black text-gray-900">
                    {selectedApp.first_name} {selectedApp.middle_name ? `${selectedApp.middle_name} ` : ""}{selectedApp.last_name} {selectedApp.suffix || ""}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500">
                    <div>DOB: <span className="text-gray-800">{new Date(selectedApp.dob).toLocaleDateString()}</span></div>
                    <div>Age: <span className="text-gray-800">{selectedApp.age}</span></div>
                    <div>Gender: <span className="text-gray-800">{selectedApp.gender}</span></div>
                    <div>Status: <span className="text-gray-800">{selectedApp.civil_status}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${getStatusBadgeClass(selectedApp.status)}`}>
                      Current: {getStatusLabel(selectedApp.status)}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      Positions: {selectedApp.positions_applied && selectedApp.positions_applied.length > 0 
                        ? selectedApp.positions_applied.map((pos: string) => pos === "Other" && selectedApp.position_applied_other ? `Other (${selectedApp.position_applied_other})` : pos).join(", ")
                        : "None"
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Sections Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Column 1: Details */}
                <div className="space-y-6">
                  
                  {/* Personal & Contact Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-green-800 border-b pb-1">1. CONTACT & PERSONAL INFO</h4>
                    <div className="text-xs space-y-1.5">
                      <div><span className="text-gray-400 font-bold uppercase">Phone:</span> <span className="font-semibold text-gray-800">{selectedApp.phone}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">Email:</span> <span className="font-semibold text-gray-800">{selectedApp.email}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">Home Address:</span> <span className="font-semibold text-gray-800">{selectedApp.home_address}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">City/ZIP:</span> <span className="font-semibold text-gray-800">{selectedApp.city_municipality} / {selectedApp.zip_code || "N/A"}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">Nationality:</span> <span className="font-semibold text-gray-800">{selectedApp.nationality}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">Religion:</span> <span className="font-semibold text-gray-800">{selectedApp.religion}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">TIN Slip:</span> <span className="font-semibold text-gray-800">{selectedApp.tin || "None"}</span></div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-green-800 border-b pb-1">2. EMERGENCY CONTACT</h4>
                    <div className="text-xs space-y-1.5 bg-gray-50 p-3 rounded-lg border">
                      <div><span className="text-gray-500 font-semibold">Name:</span> <span className="font-bold text-gray-800">{selectedApp.emergency_name}</span></div>
                      <div><span className="text-gray-500 font-semibold">Relationship:</span> <span className="font-bold text-gray-800">{selectedApp.emergency_relationship}</span></div>
                      <div><span className="text-gray-500 font-semibold">Phone:</span> <span className="font-bold text-gray-800">{selectedApp.emergency_phone}</span></div>
                      <div><span className="text-gray-500 font-semibold">Address:</span> <span className="font-bold text-gray-800">{selectedApp.emergency_address}</span></div>
                    </div>
                  </div>

                  {/* Educational Background */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-green-800 border-b pb-1">3. EDUCATIONAL BACKGROUND</h4>
                    <div className="text-xs space-y-1.5">
                      <div><span className="text-gray-400 font-bold uppercase">Qualification:</span> <span className="font-bold text-gray-800">{selectedApp.educational_qualification === "Others" ? selectedApp.educational_qualification_other : selectedApp.educational_qualification}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">School:</span> <span className="font-semibold text-gray-800">{selectedApp.school_name}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">Course/Department:</span> <span className="font-semibold text-gray-800">{selectedApp.course_department || "N/A"}</span></div>
                      <div><span className="text-gray-400 font-bold uppercase">Year Graduated:</span> <span className="font-semibold text-gray-800">{selectedApp.year_graduated}</span></div>
                    </div>
                  </div>

                  {/* Experience & Skills */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-green-800 border-b pb-1">4. PRIOR TRAINING & SKILLS</h4>
                    <div className="text-xs space-y-2">
                      <div>
                        <span className="text-gray-400 font-bold uppercase">Prior Experience:</span>{" "}
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${selectedApp.has_experience ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                          {selectedApp.has_experience ? "Yes" : "No"}
                        </span>
                      </div>
                      {selectedApp.has_experience && selectedApp.experience_description && (
                        <div className="bg-gray-50 p-2.5 rounded border border-gray-100 italic text-gray-600">
                          "{selectedApp.experience_description}"
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400 font-bold uppercase block mb-1">Technical Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedApp.technical_skills && selectedApp.technical_skills.length > 0 ? (
                            selectedApp.technical_skills.map((s: string) => (
                              <span key={s} className="bg-green-50 text-green-800 border border-green-100 text-[10px] font-bold px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">None selected</span>
                          )}
                          {selectedApp.technical_skills_other && (
                            <span className="bg-purple-50 text-purple-800 border border-purple-100 text-[10px] font-bold px-2 py-0.5 rounded">
                              Other: {selectedApp.technical_skills_other}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase">Computer Literacy:</span>{" "}
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[10px]">{selectedApp.computer_literacy}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Column 2: Documents & Office Use */}
                <div className="space-y-6">
                  
                  {/* Uploaded Documents */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-green-800 border-b pb-1">5. UPLOADED DOCUMENTS</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <a 
                        href={selectedApp.passport_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 hover:bg-green-50 transition-all font-semibold text-xs text-green-800 group"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-700" /> View Passport Photograph
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-700" />
                      </a>

                      <a 
                        href={selectedApp.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 hover:bg-green-50 transition-all font-semibold text-xs text-green-800 group"
                      >
                        <span className="flex items-center gap-2">
                          <FileDown className="w-4 h-4 text-green-700" /> Download Curriculum Vitae (CV)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-700" />
                      </a>

                      <a 
                        href={selectedApp.nin_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between p-3 border rounded-xl bg-gray-50 hover:bg-green-50 transition-all font-semibold text-xs text-green-800 group"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-700" /> View NIN Slip (Front/Back)
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-700" />
                      </a>
                    </div>
                  </div>

                  {/* Signature Verification */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-green-800 border-b pb-1">6. CERTIFICATION & SIGNATURE</h4>
                    <div className="p-3 bg-gray-50 border rounded-lg text-xs">
                      <div><span className="text-gray-400 font-bold uppercase block mb-1">Applicant Signature (Signed Name):</span> <span className="font-serif italic font-bold text-gray-800 text-sm">/ {selectedApp.signature_name} /</span></div>
                      <div className="mt-2"><span className="text-gray-400 font-bold uppercase">Agreement Status:</span> <span className="text-green-700 font-bold">Read & Agreed</span></div>
                    </div>
                  </div>

                  {/* FOR OFFICE USE ONLY */}
                  <div className="bg-gray-100 p-5 rounded-2xl border border-gray-300 shadow-sm space-y-4">
                    <h4 className="text-sm font-black text-gray-800 border-b border-gray-300 pb-1 flex items-center gap-2 uppercase tracking-wide">
                      FOR OFFICE USE ONLY
                    </h4>

                    {/* Quick Evaluation Decisions */}
                    <div className="grid grid-cols-2 gap-3 border-b border-gray-300 pb-4">
                      <button
                        type="button"
                        onClick={() => handleQuickStatusUpdate('selected')}
                        disabled={savingOffice || selectedApp.status === 'selected'}
                        className={`font-bold py-2.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                          selectedApp.status === 'selected' 
                            ? 'bg-green-100 text-green-800 border border-green-300 opacity-80' 
                            : 'bg-green-800 hover:bg-green-700 text-white shadow hover:shadow-md'
                        }`}
                      >
                        {selectedApp.status === 'selected' ? '✓ Accepted' : 'Accept Candidate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusUpdate('not_qualified')}
                        disabled={savingOffice || selectedApp.status === 'not_qualified'}
                        className={`font-bold py-2.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                          selectedApp.status === 'not_qualified' 
                            ? 'bg-red-100 text-red-800 border border-red-300 opacity-80' 
                            : 'bg-red-600 hover:bg-red-700 text-white shadow hover:shadow-md'
                        }`}
                      >
                        {selectedApp.status === 'not_qualified' ? '✗ Rejected' : 'Reject Candidate'}
                      </button>
                    </div>
                    
                    <form onSubmit={handleSaveOfficeFields} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Date Received</label>
                          <input 
                            type="date" 
                            value={officeFields.office_date_received} 
                            onChange={(e) => setOfficeFields(prev => ({ ...prev, office_date_received: e.target.value }))}
                            className="w-full p-2 border rounded bg-white text-xs outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Received By</label>
                          <input 
                            type="text" 
                            placeholder="Reviewer Name"
                            value={officeFields.office_received_by} 
                            onChange={(e) => setOfficeFields(prev => ({ ...prev, office_received_by: e.target.value }))}
                            className="w-full p-2 border rounded bg-white text-xs outline-none" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Interview Schedule</label>
                        <input 
                          type="datetime-local" 
                          value={officeFields.office_interview_schedule} 
                          onChange={(e) => setOfficeFields(prev => ({ ...prev, office_interview_schedule: e.target.value }))}
                          className="w-full p-2 border rounded bg-white text-xs outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Evaluation / Status</label>
                        <select 
                          value={officeFields.status} 
                          onChange={(e) => setOfficeFields(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full p-2 border rounded bg-white text-xs font-semibold outline-none cursor-pointer text-gray-700"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="qualified">Qualified</option>
                          <option value="on_hold">On Hold</option>
                          <option value="not_qualified">Not Qualified</option>
                          <option value="selected">Selected for Training</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Review Remarks</label>
                        <textarea 
                          rows={3} 
                          placeholder="Enter interview evaluation results, ratings, or general remarks..."
                          value={officeFields.office_remarks} 
                          onChange={(e) => setOfficeFields(prev => ({ ...prev, office_remarks: e.target.value }))}
                          className="w-full p-2 border rounded bg-white text-xs outline-none text-gray-700 leading-normal"
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={savingOffice}
                        className="w-full bg-green-800 hover:bg-green-700 text-white font-bold py-2 rounded shadow text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-gray-400"
                      >
                        {savingOffice ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Evaluation...
                          </>
                        ) : (
                          "Save Evaluation details"
                        )}
                      </button>
                    </form>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
              <button 
                onClick={() => setSelectedApp(null)} 
                className="bg-white border hover:bg-gray-100 font-semibold px-5 py-2 rounded-lg text-sm transition-colors text-gray-700 cursor-pointer"
              >
                Close Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
