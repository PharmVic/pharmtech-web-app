"use client";

import { Download, CheckCircle2, Sun, Battery as BatteryIcon, Zap, Share2, ShoppingCart, ChevronLeft } from "lucide-react";
import type { InverterCatalogItem, BatteryCatalogItem } from "@/lib/pricing";
import { useCartStore } from "@/lib/store/cartStore";
import { useRouter } from "next/navigation";

// Helper to format money
function formatMoney(n: number) {
    return new Intl.NumberFormat("en-NG").format(Math.round(n));
}

type Step4Props = {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    loads: any[];

    totalRunningWatts: number;
    totalSurgeWatts: number;
    energyNeededWh: number;

    recommendedInverter: { units: InverterCatalogItem[]; warnings: string[] };
    inverterType: "normal" | "hybrid";

    recommendedPanelCount: number;
    recommendedPanelWattage: number;
    preferredPanelWattage: number | null;

    recommendedBattery: { battery: BatteryCatalogItem | null; units: number };
    activeBatteryType: string;

    manualBatteryCount: number;
    batteryDisplay: string;
    pricingTotal: number;

    onBack: () => void;
    onSave: () => void;
    isSaving: boolean;
};

export default function Step4Quote({
    customerName,
    customerPhone,
    customerAddress,
    loads,
    totalRunningWatts,
    totalSurgeWatts,
    energyNeededWh,
    recommendedInverter,
    inverterType,
    recommendedPanelCount,
    recommendedPanelWattage,
    preferredPanelWattage,
    recommendedBattery,
    activeBatteryType,
    manualBatteryCount,
    batteryDisplay,
    pricingTotal,
    onBack,
    onSave,
    isSaving,
}: Step4Props) {
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

        // --- Watermark ---
        doc.setFontSize(60);
        doc.setTextColor(230, 230, 230); // Very light gray
        doc.text("PHARMTECH", 105, 150, { angle: 45, align: "center" });
        doc.text("PHARMTECH", 105, 50, { angle: 45, align: "center" });
        doc.text("PHARMTECH", 105, 250, { angle: 45, align: "center" });

        // --- Logo / Header ---
        try {
            const logoImg = new Image();
            logoImg.src = '/logo.jpeg'; 
            await new Promise((resolve, reject) => {
                logoImg.onload = resolve;
                logoImg.onerror = reject;
            });
            const imgWidth = 40; 
            const imgHeight = (logoImg.height * imgWidth) / logoImg.width;
            
            const rightMarginX = 210 - 14 - imgWidth;
            doc.addImage(logoImg, 'JPEG', rightMarginX, 5, imgWidth, imgHeight);
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(28);
            doc.setTextColor(242, 114, 28);
            doc.text("PHARMTECH", 14, 22);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(16);
            doc.setTextColor(17, 0, 0);
            doc.text("SOLAR QUOTE", 14, 32);
        } catch (e) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(28);
            doc.setTextColor(242, 114, 28);
            doc.text("PHARMTECH", 14, 22);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(16);
            doc.setTextColor(17, 0, 0);
            doc.text("SOLAR QUOTE", 14, 32);
        }

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 40);

        // Customer Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Customer Details:", 14, 52);
        doc.setFontSize(10);
        doc.text(`Name: ${customerName}`, 14, 58);
        doc.text(`Phone: ${customerPhone}`, 14, 63);
        doc.text(`Address: ${customerAddress}`, 14, 68);

        // System Summary
        doc.setFontSize(12);
        doc.text("System Requirements:", 110, 52);
        doc.setFontSize(10);
        doc.text(`Total Running Load: ${totalRunningWatts} W`, 110, 58);
        doc.text(`Total Surge Load: ${totalSurgeWatts} W`, 110, 63);
        doc.text(`Night Energy Need: ${energyNeededWh} Wh`, 110, 68);

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
            startY: 76,
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
        doc.setTextColor(0);
        doc.text(`Total Estimated Cost: N${formatMoney(pricingTotal)}`, 14, finalY);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Note: This is a generated estimate. Final price may vary based on site inspection.", 14, finalY + 10);

        doc.save(`solar-quote-${customerName.replace(/\s+/g, '-')}.pdf`);
    }

    // WhatsApp Function
    function sendToWhatsApp() {
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
- Inverter: ${invDisplay} (${inverterType})
- Panels: ${recommendedPanelCount}x ${recommendedPanelWattage}W
- Battery: ${batteryDisplay}

*Estimated Cost:* ₦${formatMoney(pricingTotal)}

Please review and confirm availability.`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${supportNumber}?text=${encodedMessage}`, '_blank');
    }

    // Inverter label
    const inverterText = recommendedInverter.units.length > 0
        ? `${recommendedInverter.units.length}x ${recommendedInverter.units[0].kva}kVA ${inverterType === 'hybrid' ? 'Hybrid' : 'Non-hybrid'} Inverter (${recommendedInverter.units[0].voltage}V)`
        : "Pending";

    // Panel label
    const activePanelWatt = preferredPanelWattage || recommendedPanelWattage;
    const panelText = `${recommendedPanelCount}x ${activePanelWatt}W Solar Panels (Total: ${((recommendedPanelCount * activePanelWatt) / 1000).toFixed(2)} kWp)`;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-x-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start w-full">

                {/* LEFT COLUMN: Data Summary (Input view) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-[#110000]">Load Inputs Summary</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="block text-xs uppercase text-gray-500 font-bold mb-1">Name</span>
                            <span className="font-medium text-gray-900">{customerName}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="block text-xs uppercase text-gray-500 font-bold mb-1">Phone</span>
                            <span className="font-medium text-gray-900">{customerPhone}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                            <span className="block text-xs uppercase text-gray-500 font-bold mb-1">Address</span>
                            <span className="font-medium text-gray-900">{customerAddress}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-600 uppercase mb-3">Appliances</h3>
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
                            <p className="text-xs text-gray-600">Run Watts</p>
                            <p className="text-lg font-bold">{totalRunningWatts}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Surge Watts</p>
                            <p className="text-lg font-bold md:text-xl text-orange-600">{Math.ceil(totalSurgeWatts)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Night Energy</p>
                            <p className="text-lg font-bold md:text-xl text-blue-600">{Math.ceil(energyNeededWh)} Wh</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Quote & Pricing Details */}
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
                            <div className="mb-6 border-b pb-4">
                                <h3 className="text-2xl font-bold text-gray-900">{customerName || "Customer"}</h3>
                                <p className="text-sm text-gray-600">{customerPhone}</p>
                            </div>

                            {/* READ-ONLY CONFIGURATION SUMMARY */}
                            <div className="space-y-6 mb-8">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b pb-2">
                                    System Specifications
                                </h4>

                                {/* Inverter */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inverter</span>
                                        <p className="text-sm font-semibold text-gray-800">{inverterText}</p>
                                    </div>
                                </div>

                                {/* Solar Panels */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                        <Sun className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Solar Array</span>
                                        <p className="text-sm font-semibold text-gray-800">{panelText}</p>
                                    </div>
                                </div>

                                {/* Battery Bank */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <BatteryIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Battery Bank</span>
                                        <p className="text-sm font-semibold text-gray-800 capitalize">{activeBatteryType} Storage</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{batteryDisplay}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Estimated Cost</p>
                                <p className="text-3xl font-extrabold text-gray-900">
                                    ₦{formatMoney(pricingTotal)}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={onSave}
                                    disabled={isSaving}
                                    className="w-full bg-gray-800 hover:bg-[#110000] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
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
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={sendToWhatsApp}
                                    className="w-full bg-[#25D366] hover:bg-[#20b85c] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Send to WhatsApp
                                </button>

                                <button
                                    onClick={downloadPdfQuote}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="mt-8 flex justify-start">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Selection
                </button>
            </div>
        </div>
    );
}
