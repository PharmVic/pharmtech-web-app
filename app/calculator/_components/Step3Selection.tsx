"use client";

import { Sun, Battery as BatteryIcon, Zap, Plus, Minus, ChevronLeft, ChevronRight, Info } from "lucide-react";
import type { InverterCatalogItem, BatteryCatalogItem } from "@/lib/pricing";

type Step3SelectionProps = {
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

    // Battery Props
    availableLithiumBatteries?: BatteryCatalogItem[];
    preferredBatteryAh?: number | null;
    setPreferredBatteryAh?: (n: number | null) => void;

    manualBatteryCount: number;
    setManualBatteryCount: (n: number) => void;

    batteryDisplay: string;
    
    totalRunningWatts: number;
    totalSurgeWatts: number;
    energyNeededWh: number;

    onBack: () => void;
    onNext: () => void;
};

export default function Step3Selection({
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
    totalRunningWatts,
    totalSurgeWatts,
    energyNeededWh,
    onBack,
    onNext,
}: Step3SelectionProps) {

    // Helper for displaying inverter selection
    const activeInverterKva = recommendedInverter.units[0]?.kva || 0;
    const activeInverterVolt = recommendedInverter.units[0]?.voltage || 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {/* Quick Sizing Context Panel */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="font-bold text-[#110000] text-lg flex items-center gap-2">
                        <Info className="w-5 h-5 text-orange-600 shrink-0" />
                        Customizing Your System Components
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                        Based on your load requirements, we have computed a recommended system setup. You can fine-tune individual components below to suit your budget or specifications.
                    </p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <div className="bg-white px-3 py-2 rounded-lg border border-orange-100 text-center min-w-[70px]">
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">Load</span>
                        <span className="font-extrabold text-sm text-gray-800">{totalRunningWatts}W</span>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border border-orange-100 text-center min-w-[70px]">
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">Surge</span>
                        <span className="font-extrabold text-sm text-orange-600">{Math.ceil(totalSurgeWatts)}W</span>
                    </div>
                    <span className="bg-white px-3 py-2 rounded-lg border border-orange-100 text-center min-w-[80px]">
                        <span className="block text-[10px] text-gray-500 font-bold uppercase">Night Energy</span>
                        <span className="font-extrabold text-sm text-blue-600">{Math.ceil(energyNeededWh)}Wh</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* 1. SOLAR PANELS CARD */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-yellow-600 border-b border-gray-50 pb-3">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <Sun className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Solar Array</h3>
                                <p className="text-[10px] text-gray-400 font-medium">PV Generation</p>
                            </div>
                        </div>

                        {/* Panel Wattage Select */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Panel Type / Wattage</label>
                            <select
                                value={preferredPanelWattage || recommendedPanelWattage}
                                onChange={(e) => setPreferredPanelWattage(Number(e.target.value))}
                                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none font-semibold text-gray-700"
                            >
                                <option value={200}>200W Panels</option>
                                <option value={250}>250W Panels</option>
                                <option value={300}>300W Panels</option>
                                <option value={350}>350W Panels</option>
                                <option value={400}>400W Panels</option>
                                <option value={450}>450W Panels</option>
                                <option value={500}>500W Panels</option>
                                <option value={550}>550W Panels</option>
                                <option value={600}>600W Panels</option>
                            </select>
                        </div>

                        {/* Panel Count Control */}
                        <div className="space-y-1.5 pt-2">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Number of Panels</label>
                            <div className="flex items-center justify-between border rounded-lg p-1.5 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setManualPanelCount(Math.max(0, recommendedPanelCount - 1))}
                                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-md shadow-sm border transition"
                                    title="Decrease Panels"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-extrabold text-sm text-gray-800">{recommendedPanelCount} Panels</span>
                                <button
                                    type="button"
                                    onClick={() => setManualPanelCount(recommendedPanelCount + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-md shadow-sm border transition"
                                    title="Increase Panels"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Total Array Size:</span>
                        <span className="font-bold text-orange-600">{(recommendedPanelCount * (preferredPanelWattage || recommendedPanelWattage)) / 1000} kWp</span>
                    </div>
                </div>

                {/* 2. BATTERY BANK CARD */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-blue-600 border-b border-gray-50 pb-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <BatteryIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Battery Bank</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Backup Storage</p>
                            </div>
                        </div>

                        {/* Battery Chemistry */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Battery Chemistry</label>
                            <select
                                value={activeBatteryType}
                                onChange={(e) => setBatteryType(e.target.value)}
                                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none font-semibold text-gray-700 capitalize"
                            >
                                <option value="lithium">Lithium-ion</option>
                                <option value="tubular">Tubular (Wet cell)</option>
                                <option value="drycell">Dry Cell (AGM/Gel)</option>
                            </select>
                        </div>

                        {/* Battery Ah (Lithium Only) */}
                        {activeBatteryType === "lithium" && availableLithiumBatteries.length > 0 && setPreferredBatteryAh && (
                            <div className="space-y-1.5 pt-1">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Single Module Capacity</label>
                                <select
                                    value={preferredBatteryAh ?? recommendedBattery.battery?.ah ?? ""}
                                    onChange={(e) => setPreferredBatteryAh(Number(e.target.value) || null)}
                                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none font-semibold text-gray-700"
                                >
                                    {availableLithiumBatteries.map((b) => (
                                        <option key={b.sku} value={b.ah}>
                                            {b.ah}Ah Module ({b.voltage}V)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Battery Count Control */}
                        <div className="space-y-1.5 pt-1">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Number of Modules</label>
                            <div className="flex items-center justify-between border rounded-lg p-1.5 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setManualBatteryCount(Math.max(1, manualBatteryCount - 1))}
                                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-md shadow-sm border transition"
                                    title="Decrease Batteries"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-extrabold text-sm text-gray-800">{manualBatteryCount} Units</span>
                                <button
                                    type="button"
                                    onClick={() => setManualBatteryCount(manualBatteryCount + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-md shadow-sm border transition"
                                    title="Increase Batteries"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 text-center text-[10px] text-gray-500 font-medium leading-tight">
                        {batteryDisplay}
                    </div>
                </div>

                {/* 3. INVERTER SYSTEM CARD */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-purple-600 border-b border-gray-50 pb-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Inverter</h3>
                                <p className="text-[10px] text-gray-400 font-medium">Power Conversion</p>
                            </div>
                        </div>

                        {/* Inverter Hybrid Select */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inverter Type</label>
                            <select
                                value={inverterType}
                                onChange={(e) => setInverterType(e.target.value as "normal" | "hybrid")}
                                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none font-semibold text-gray-700 capitalize"
                            >
                                <option value="normal">Non-hybrid (Standard)</option>
                                <option value="hybrid">Hybrid Smart Inverter</option>
                            </select>
                        </div>

                        {/* Inverter Model / Sizing Select */}
                        <div className="space-y-1.5 pt-2">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inverter Capacity & Voltage</label>
                            <select
                                value={manualInverterId ?? (recommendedInverter.units[0] ? `${recommendedInverter.units[0].kva}-${recommendedInverter.units[0].voltage}` : "")}
                                onChange={(e) => setManualInverterId(e.target.value)}
                                className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none font-semibold text-gray-700"
                            >
                                {availableInverters.map((inv) => (
                                    <option key={`${inv.kva}-${inv.voltage}`} value={`${inv.kva}-${inv.voltage}`}>
                                        {inv.kva}kVA ({inv.voltage}V) {inv.kva === originalRecommendedKva ? " (Rec)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Selected Inverter Size:</span>
                        <span className="font-bold text-purple-700">
                            {recommendedInverter.units.length > 0
                                ? `${recommendedInverter.units.length}x ${recommendedInverter.units[0].kva}kVA`
                                : "Custom"}
                        </span>
                    </div>
                </div>

            </div>

            {/* Warnings Alert box */}
            {recommendedInverter.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-xs text-amber-700 space-y-1 shadow-sm">
                    <span className="font-bold block uppercase tracking-wider mb-1 text-[10px]">Sizing System Alert</span>
                    {recommendedInverter.warnings.map((w, i) => (
                        <p key={i}>• {w}</p>
                    ))}
                </div>
            )}

            {/* Bottom Actions Navigation */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 px-6 py-3 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Appliances
                </button>
                <button
                    onClick={onNext}
                    className="flex items-center gap-1.5 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                    Proceed to Sizing & Quote Results
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
