"use client";

import { Download, CheckCircle2, Sun, Battery as BatteryIcon, Zap, Share2, Plus, Minus, ShoppingCart } from "lucide-react";
import type { InverterCatalogItem, BatteryCatalogItem } from "@/lib/pricing";
import { useCartStore } from "@/lib/store/cartStore";
import { useRouter } from "next/navigation";

// Helper to format money
function formatMoney(n: number) {
    return new Intl.NumberFormat("en-NG").format(Math.round(n));
}

type Step3Props = {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    loads: any[];

    totalRunningWatts: number;
    totalSurgeWatts: number;
    energyNeededWh: number;

    // Updated props to match complex recommendation structure
    recommendedInverter: { units: InverterCatalogItem[]; warnings: string[] };
    inverterType: "normal" | "hybrid";
    setInverterType: (t: "normal" | "hybrid") => void;

    // Manual Inverter Props
    originalRecommendedKva?: number;
    availableInverters: InverterCatalogItem[];
    manualInverterId: string | null;
    setManualInverterId: (id: string | null) => void;

    recommendedPanelCount: number;
    setManualPanelCount: (n: number) => void;

    recommendedPanelWattage: number;
    preferredPanelWattage: number | null;
    setPreferredPanelWattage: (n: number | null) => void;

    recommendedBattery: { battery: BatteryCatalogItem | null; units: number };
    activeBatteryType: string;
    setBatteryType: (t: any) => void;

    // New Battery Props
    availableLithiumBatteries?: BatteryCatalogItem[];
    preferredBatteryAh?: number | null;
    setPreferredBatteryAh?: (n: number | null) => void;

    manualBatteryCount: number;
    setManualBatteryCount: (n: number) => void;

    batteryDisplay: string;
    pricingTotal: number;

    onBack: () => void;
    onSave: () => void;
    isSaving: boolean;
};

export default function Step3SizingAndQuote({
    customerName,
    customerPhone,
    customerAddress,
    loads,
    totalRunningWatts,
    totalSurgeWatts,
    energyNeededWh,
    recommendedInverter,
    inverterType,
    setInverterType,
    originalRecommendedKva,
    availableInverters,
    manualInverterId,
    setManualInverterId,
    recommendedPanelCount,
    setManualPanelCount,
    recommendedPanelWattage,
    preferredPanelWattage,
    setPreferredPanelWattage,
    recommendedBattery,
    activeBatteryType,
    setBatteryType,

    availableLithiumBatteries = [],
    preferredBatteryAh,
    setPreferredBatteryAh,

    manualBatteryCount,
    setManualBatteryCount,
    batteryDisplay,
    pricingTotal,
    onBack,
    onSave,
    isSaving,
}: Step3Props) {
    const addItem = useCartStore((state) => state.addItem);
    const router = useRouter();

    // Proceed to Checkout
    const handleProceedToCheckout = () => {
        addItem({
            id: `solar-quote-${Date.now()}`,
            name: `Solar System Installation (${recommendedInverter.units[0]?.kva || 'Custom'}kVA)`,
            price: pricingTotal,
            quantity: 1,
            isSolar: true
        });
        
        // Auto-save the quote just in case
        onSave();
        
        router.push("/checkout");
    };

    // PDF Download
    async function downloadPdfQuote() {
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        // Auto-save when downloading
        onSave();

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(17, 0, 0); // #110000
        doc.text("PHARMTECH SOLAR QUOTE", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 26);

        // Customer Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Customer Details:", 14, 36);
        doc.setFontSize(10);
        doc.text(`Name: ${customerName}`, 14, 42);
        doc.text(`Phone: ${customerPhone}`, 14, 47);
        doc.text(`Address: ${customerAddress}`, 14, 52);

        // System Summary
        doc.setFontSize(12);
        doc.text("System Requirements:", 110, 36);
        doc.setFontSize(10);
        doc.text(`Total Running Load: ${totalRunningWatts} W`, 110, 42);
        doc.text(`Total Surge Load: ${totalSurgeWatts} W`, 110, 47);
        doc.text(`Night Energy Need: ${energyNeededWh} Wh`, 110, 52);

        // Recommendations Table
        const invDisplay = recommendedInverter.units.length > 0
            ? `${recommendedInverter.units.length}x ${recommendedInverter.units[0].kva}kVA (${recommendedInverter.units[0].voltage}V)`
            : "Custom / Contact Support";

        const batDisplay = recommendedBattery.battery
            ? (recommendedBattery.battery.type === "lithium"
                ? `${recommendedBattery.units}x ${(recommendedBattery.battery.ah * recommendedBattery.battery.voltage / 1000).toFixed(2)}kWh ${recommendedBattery.battery.type.toUpperCase()} ${recommendedBattery.battery.ah}Ah (${recommendedBattery.battery.voltage}V)`
                : `${recommendedBattery.units}x ${recommendedBattery.battery.type.toUpperCase()} ${recommendedBattery.battery.ah}Ah (${recommendedBattery.battery.voltage}V)`)
            : "None";

        const panelDisplay = `${recommendedPanelCount}x ${recommendedPanelWattage}W Panels`;

        autoTable(doc, {
            startY: 60,
            head: [['Component', 'Recommendation']],
            body: [
                ['Inverter System', invDisplay],
                ['Solar Array', panelDisplay],
                ['Battery Bank', batDisplay],
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
        });

        // Appliances Table
        const appliancesBody = loads.map(l => [
            l.name,
            l.watts,
            l.qty,
            l.hoursNight,
            (l.watts * l.qty).toLocaleString()
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Appliance', 'Watts', 'Qty', 'Night Hrs', 'Total Watts']],
            body: appliancesBody,
            theme: 'striped',
            headStyles: { fillColor: [100, 100, 100] },
        });

        // Financials
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text(`Total Estimated Cost: N${formatMoney(pricingTotal)}`, 14, finalY);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Note: This is a generated estimate. Final price may vary based on site inspection.", 14, finalY + 10);

        doc.save(`solar-quote-${customerName.replace(/\s+/g, '-')}.pdf`);
    }

    // WhatsApp Function
    function sendToWhatsApp() {
        // Auto-save when sharing
        onSave();

        const supportNumber = "2348142111657";

        const invDisplay = recommendedInverter.units.length > 0
            ? `${recommendedInverter.units.length}x ${recommendedInverter.units[0].kva}kVA`
            : "Custom";

        const message = `*New Solar Quote Request*
        
Customer: ${customerName}
Phone: ${customerPhone}
Address: ${customerAddress}

*System Requirements:*
- Load: ${totalRunningWatts}W
- Surge: ${totalSurgeWatts}W
- Night Energy: ${energyNeededWh}Wh

*Proposed System:*
- Inverter: ${invDisplay}
- Panels: ${recommendedPanelCount}x ${recommendedPanelWattage}W
- Battery: ${batteryDisplay}

*Estimated Cost:* ₦${formatMoney(pricingTotal)}

Please review and confirm availability.`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${supportNumber}?text=${encodedMessage}`, '_blank');
    }

    // Helper for display
    const inverterText = recommendedInverter.units.length > 0
        ? `${recommendedInverter.units.length}x ${recommendedInverter.units[0].kva}kVA`
        : "Pending";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-x-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start w-full">

                {/* LEFT COLUMN: Data Summary (Input view) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-[#110000]">Load Inputs Summary</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Name</span>
                            <span className="font-medium text-gray-900">{customerName}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Phone</span>
                            <span className="font-medium text-gray-900">{customerPhone}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                            <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Address</span>
                            <span className="font-medium text-gray-900">{customerAddress}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Appliances</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="p-2 text-left rounded-l-md">Appliance</th>
                                        <th className="p-2 text-center">Watts</th>
                                        <th className="p-2 text-center">Qty</th>
                                        <th className="p-2 text-center">Motor</th>
                                        <th className="p-2 text-center">Night Hrs</th>
                                        <th className="p-2 text-right rounded-r-md">Total W</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {loads.map((l, i) => (
                                        <tr key={i}>
                                            <td className="p-2">{l.name}</td>
                                            <td className="p-2 text-center">{l.watts}</td>
                                            <td className="p-2 text-center">{l.qty}</td>
                                            <td className="p-2 text-center text-xs">{l.motor ? <span className="text-orange-500 font-bold">Yes</span> : "No"}</td>
                                            <td className="p-2 text-center">{l.hoursNight}</td>
                                            <td className="p-2 text-right font-medium">{l.watts * l.qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                        <div>
                            <p className="text-xs text-gray-500">Run Watts</p>
                            <p className="text-lg font-bold">{totalRunningWatts}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Surge Watts</p>
                            <p className="text-lg font-bold md:text-xl text-orange-600">{Math.ceil(totalSurgeWatts)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Night Energy</p>
                            <p className="text-lg font-bold md:text-xl text-blue-600">{Math.ceil(energyNeededWh)} Wh</p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button onClick={onBack} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors">
                            Edit Inputs
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Quote Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-50">
                            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Estimate
                            </span>
                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Computed</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">{customerName || "Customer"}</h3>
                                <p className="text-sm text-gray-500">{customerPhone}</p>
                            </div>

                            <div className="space-y-6 mb-8">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b pb-2">Recommendation</h4>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                        <Sun className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                            <p className="text-sm font-medium text-gray-900 whitespace-nowrap">Solar Panels</p>
                                            <select
                                                value={preferredPanelWattage || recommendedPanelWattage}
                                                onChange={(e) => setPreferredPanelWattage(Number(e.target.value))}
                                                className="text-xs border border-gray-200 rounded p-1.5 bg-gray-50 max-w-full focus:ring-2 focus:ring-orange-500 outline-none"
                                            >
                                                <option value={200}>200W</option>
                                                <option value={250}>250W</option>
                                                <option value={300}>300W</option>
                                                <option value={350}>350W</option>
                                                <option value={400}>400W</option>
                                                <option value={450}>450W</option>
                                                <option value={500}>500W</option>
                                                <option value={550}>550W</option>
                                                <option value={600}>600W</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setManualPanelCount(Math.max(0, recommendedPanelCount - 1))}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded transition"
                                                title="Decrease Panels"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>

                                            <p className="text-sm font-bold text-gray-900">{recommendedPanelCount}x <span className="text-gray-500 font-normal">{recommendedPanelWattage}W</span></p>

                                            <button
                                                onClick={() => setManualPanelCount(recommendedPanelCount + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded transition"
                                                title="Increase Panels"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <BatteryIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                            <p className="text-sm font-medium text-gray-900 whitespace-nowrap">Battery Bank</p>
                                            <div className="flex items-center flex-wrap gap-2">
                                                <select
                                                    value={activeBatteryType}
                                                onChange={(e) => setBatteryType(e.target.value)}
                                                className="text-xs border rounded p-1 bg-gray-50 capitalize"
                                            >
                                                <option value="lithium">Lithium</option>
                                                <option value="tubular">Tubular</option>
                                                <option value="drycell">Dry Cell</option>
                                            </select>

                                            {/* Capacity Selector (Lithium Only) */}
                                            {activeBatteryType === "lithium" && availableLithiumBatteries.length > 0 && setPreferredBatteryAh && (
                                                <select
                                                    value={preferredBatteryAh ?? recommendedBattery.battery?.ah ?? ""}
                                                    onChange={(e) => setPreferredBatteryAh(Number(e.target.value) || null)}
                                                    className="ml-2 text-xs border rounded p-1 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none"
                                                    title="Select Battery Capacity"
                                                >
                                                    {availableLithiumBatteries.map((b) => (
                                                        <option key={b.sku} value={b.ah}>
                                                            {b.ah}Ah
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 w-full">
                                            <button
                                                onClick={() => setManualBatteryCount(Math.max(1, manualBatteryCount - 1))}
                                                className="shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded transition"
                                                title="Decrease Batteries"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>

                                            <p className="text-sm text-gray-500 leading-tight flex-1 text-center">{batteryDisplay}</p>

                                            <button
                                                onClick={() => setManualBatteryCount(manualBatteryCount + 1)}
                                                className="shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded transition"
                                                title="Increase Batteries"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                            <p className="text-sm font-medium text-gray-900 whitespace-nowrap">Inverter</p>
                                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                                <select
                                                    value={manualInverterId ?? (recommendedInverter.units[0] ? `${recommendedInverter.units[0].kva}-${recommendedInverter.units[0].voltage}` : "")}
                                                    onChange={(e) => setManualInverterId(e.target.value)}
                                                    className="flex-1 sm:flex-none text-xs border border-gray-200 rounded p-1.5 bg-gray-50 max-w-full focus:ring-2 focus:ring-orange-500 outline-none"
                                                >
                                                    {availableInverters.map((inv) => (
                                                        <option key={`${inv.kva}-${inv.voltage}`} value={`${inv.kva}-${inv.voltage}`}>
                                                            {inv.kva}kVA ({inv.voltage}V) {inv.kva === originalRecommendedKva ? " (Rec)" : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={inverterType}
                                                    onChange={(e) => setInverterType(e.target.value as "normal" | "hybrid")}
                                                    className="text-xs border border-gray-200 rounded p-1 bg-gray-50 capitalize focus:ring-2 focus:ring-orange-500 outline-none"
                                                >
                                                    <option value="normal">Non-hybrid</option>
                                                    <option value="hybrid">Hybrid</option>
                                                </select>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">{inverterText}</p>
                                    </div>
                                </div>

                                {recommendedInverter.warnings.length > 0 && (
                                    <div className="bg-orange-50 p-3 rounded text-xs text-orange-700">
                                        {recommendedInverter.warnings.map((w, i) => (
                                            <p key={i}>• {w}</p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Estimated Cost</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ₦{formatMoney(pricingTotal)}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="w-full bg-gray-800 hover:bg-[#110000] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <span>Saving...</span>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Save Quote to System
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleProceedToCheckout}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={sendToWhatsApp}
                                    className="w-full bg-[#25D366] hover:bg-[#20b85c] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Send to WhatsApp
                                </button>

                                <button
                                    onClick={downloadPdfQuote}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
