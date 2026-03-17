"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash, Edit, Check, X } from "lucide-react";
import { type InverterCatalogItem, type BatteryCatalogItem, type PanelCatalogItem } from "@/lib/pricing";

type TabTypes = "inverters" | "batteries" | "panels" | "appliances" | "accessories";

export default function CalculatorItemsAdmin() {
    const [activeTab, setActiveTab] = useState<TabTypes>("inverters");
    
    // Data State
    const [inverters, setInverters] = useState<any[]>([]);
    const [batteries, setBatteries] = useState<any[]>([]);
    const [panels, setPanels] = useState<any[]>([]);
    const [appliances, setAppliances] = useState<any[]>([]);
    const [accessories, setAccessories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditingId, setIsEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    
    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [iRes, bRes, pRes, appRes, accRes] = await Promise.all([
                supabase.from('calc_inverters').select('*').order('kva', { ascending: true }),
                supabase.from('calc_batteries').select('*').order('voltage', { ascending: true }),
                supabase.from('calc_panels').select('*').order('watt', { ascending: true }),
                supabase.from('calc_appliances').select('*').order('name', { ascending: true }),
                supabase.from('calc_accessories').select('*').order('kva', { ascending: true })
            ]);
            
            if (iRes.data) setInverters(iRes.data);
            if (bRes.data) setBatteries(bRes.data);
            if (pRes.data) setPanels(pRes.data);
            if (appRes.data) setAppliances(appRes.data);
            if (accRes.data) setAccessories(accRes.data);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleDelete = async (table: string, id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        
        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            fetchAll();
        } catch (error: any) {
            alert("Failed to delete: " + error.message);
        }
    };

    const startEdit = (item: any) => {
        setIsEditingId(item.id);
        setEditForm({ ...item });
    };

    const cancelEdit = () => {
        setIsEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (table: string) => {
        try {
            const { id, created_at, ...updateData } = editForm;
            const { error } = await supabase.from(table).update(updateData).eq('id', id);
            if (error) throw error;
            
            setIsEditingId(null);
            fetchAll();
        } catch (error: any) {
            alert("Failed to update: " + error.message);
        }
    };
    
    // Quick Add New Form (Basic implementation to get started)
    // In a full implementation, you would have dedicated modal forms for each item type.
    // For MVp, we are focusing on editing existing items, but you can duplicate rows as new from DB or a basic form here.

    const renderTable = () => {
        if (isLoading) return <p className="p-4 text-gray-500">Loading...</p>;

        if (activeTab === "inverters") {
            return (
                <div className="overflow-x-auto bg-white rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">kVA</th>
                                <th className="px-4 py-3">Voltage</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Price (₦)</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {inverters.map(inv => isEditingId === inv.id ? (
                                <tr key={`edit-${inv.id}`} className="bg-orange-50">
                                    <td className="px-4 py-2"><input type="number" step="0.5" className="w-full p-1 border rounded" value={editForm.kva} onChange={e => setEditForm({...editForm, kva: e.target.value})} /></td>
                                    <td className="px-4 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.voltage} onChange={e => setEditForm({...editForm, voltage: e.target.value})} /></td>
                                    <td className="px-4 py-2">
                                        <select className="w-full p-1 border rounded" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                                            <option value="normal">Normal</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} /></td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => saveEdit('calc_inverters')} className="text-green-600 p-1 mr-2"><Check className="w-4 h-4"/></button>
                                        <button onClick={cancelEdit} className="text-gray-500 p-1"><X className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{inv.kva}</td>
                                    <td className="px-4 py-3">{inv.voltage}V</td>
                                    <td className="px-4 py-3 capitalize">{inv.type}</td>
                                    <td className="px-4 py-3">{inv.price.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => startEdit(inv)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete('calc_inverters', inv.id)} className="text-red-600 hover:text-red-800 p-1"><Trash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (activeTab === "panels") {
            return (
                <div className="overflow-x-auto bg-white rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Wattage</th>
                                <th className="px-4 py-3">Price (₦)</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {panels.map(pan => isEditingId === pan.id ? (
                                <tr key={`edit-${pan.id}`} className="bg-orange-50">
                                    <td className="px-4 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.watt} onChange={e => setEditForm({...editForm, watt: e.target.value})} /></td>
                                    <td className="px-4 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} /></td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => saveEdit('calc_panels')} className="text-green-600 p-1 mr-2"><Check className="w-4 h-4"/></button>
                                        <button onClick={cancelEdit} className="text-gray-500 p-1"><X className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={pan.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{pan.watt}W</td>
                                    <td className="px-4 py-3">{pan.price.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => startEdit(pan)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete('calc_panels', pan.id)} className="text-red-600 hover:text-red-800 p-1"><Trash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        
        if (activeTab === "batteries") {
            return (
                <div className="overflow-x-auto bg-white rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">SKU</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Volts/Nominal</th>
                                <th className="px-4 py-3">Ah</th>
                                <th className="px-4 py-3">Price (₦)</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {batteries.map(bat => isEditingId === bat.id ? (
                                <tr key={`edit-${bat.id}`} className="bg-orange-50">
                                    <td className="px-2 py-2"><input type="text" className="w-full p-1 border rounded" value={editForm.sku} onChange={e => setEditForm({...editForm, sku: e.target.value})} /></td>
                                    <td className="px-2 py-2">
                                        <select className="w-full p-1 border rounded cursor-pointer" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                                            <option value="lithium">Lithium</option>
                                            <option value="tubular">Tubular</option>
                                            <option value="drycell">Dry Cell</option>
                                        </select>
                                    </td>
                                    <td className="px-2 py-2 flex gap-1">
                                        <input type="number" step="0.1" className="w-16 p-1 border rounded" value={editForm.voltage} onChange={e => setEditForm({...editForm, voltage: e.target.value})} placeholder="V" />
                                        <input type="number" className="w-16 p-1 border rounded" value={editForm.nominal_voltage} onChange={e => setEditForm({...editForm, nominal_voltage: e.target.value})} placeholder="Nom V" />
                                    </td>
                                    <td className="px-2 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.ah} onChange={e => setEditForm({...editForm, ah: e.target.value})} /></td>
                                    <td className="px-2 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} /></td>
                                    <td className="px-2 py-2 text-right">
                                        <button onClick={() => saveEdit('calc_batteries')} className="text-green-600 p-1 mr-1"><Check className="w-4 h-4"/></button>
                                        <button onClick={cancelEdit} className="text-gray-500 p-1"><X className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={bat.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{bat.sku}</td>
                                    <td className="px-4 py-3 capitalize">{bat.type}</td>
                                    <td className="px-4 py-3">{bat.voltage}V / {bat.nominal_voltage}V</td>
                                    <td className="px-4 py-3">{bat.ah}Ah</td>
                                    <td className="px-4 py-3">{bat.price.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => startEdit(bat)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete('calc_batteries', bat.id)} className="text-red-600 hover:text-red-800 p-1"><Trash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (activeTab === "appliances") {
            return (
                <div className="overflow-x-auto bg-white rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Appliance Name</th>
                                <th className="px-4 py-3">Running Watts</th>
                                <th className="px-4 py-3">Surge Factor</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {appliances.map(app => isEditingId === app.id ? (
                                <tr key={`edit-${app.id}`} className="bg-orange-50">
                                    <td className="px-4 py-2"><input type="text" className="w-full p-1 border rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                                    <td className="px-4 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.running_watts} onChange={e => setEditForm({...editForm, running_watts: e.target.value})} /></td>
                                    <td className="px-4 py-2"><input type="number" step="0.1" className="w-full p-1 border rounded" value={editForm.surge_factor} onChange={e => setEditForm({...editForm, surge_factor: e.target.value})} /></td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => saveEdit('calc_appliances')} className="text-green-600 p-1 mr-2"><Check className="w-4 h-4"/></button>
                                        <button onClick={cancelEdit} className="text-gray-500 p-1"><X className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{app.name}</td>
                                    <td className="px-4 py-3">{app.running_watts}W</td>
                                    <td className="px-4 py-3">x{app.surge_factor}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => startEdit(app)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete('calc_appliances', app.id)} className="text-red-600 hover:text-red-800 p-1"><Trash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (activeTab === "accessories") {
            return (
                <div className="overflow-x-auto bg-white rounded-lg border">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Inverter kVA Class</th>
                                <th className="px-4 py-3">Install & Access. Fee (₦)</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {accessories.map(acc => isEditingId === acc.id ? (
                                <tr key={`edit-${acc.id}`} className="bg-orange-50">
                                    <td className="px-4 py-2"><input type="number" step="0.5" className="w-full p-1 border rounded" value={editForm.kva} onChange={e => setEditForm({...editForm, kva: e.target.value})} /></td>
                                    <td className="px-4 py-2"><input type="number" className="w-full p-1 border rounded" value={editForm.fee} onChange={e => setEditForm({...editForm, fee: e.target.value})} /></td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => saveEdit('calc_accessories')} className="text-green-600 p-1 mr-2"><Check className="w-4 h-4"/></button>
                                        <button onClick={cancelEdit} className="text-gray-500 p-1"><X className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={acc.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{acc.kva} kVA</td>
                                    <td className="px-4 py-3">{acc.fee.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => startEdit(acc)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete('calc_accessories', acc.id)} className="text-red-600 hover:text-red-800 p-1"><Trash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <main className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#110000]">Calculator Items Management</h1>
                <button
                    onClick={fetchAll}
                    className="px-4 py-2 border rounded text-sm bg-white hover:bg-gray-50"
                >
                    Refresh
                </button>
            </div>

            <div className="mb-6 flex border-b overflow-x-auto">
                {["inverters", "batteries", "panels", "appliances", "accessories"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as TabTypes); cancelEdit(); }}
                        className={`px-6 py-3 font-medium text-sm capitalize whitespace-nowrap ${
                            activeTab === tab
                                ? "border-b-2 border-orange-600 text-orange-600"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-500">
                    Important: If you delete or alter items heavily, ensure the changes don't break the calculator logic. 
                    Adding new items or changing prices is completely safe.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    To add new items, for now please create the row in your Supabase dashboard directly. The ability to edit any field in existing rows is supported here.
                </p>
            </div>

            {renderTable()}
        </main>
    );
}
