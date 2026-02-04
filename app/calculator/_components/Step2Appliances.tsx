"use client";

import { Trash, Plus } from "lucide-react";
import { APPLIANCES } from "@/lib/appliances";
import type { LoadInput } from "@/lib/pricing";

type Step2Props = {
    loads: LoadInput[];
    updateLoad: (index: number, key: keyof LoadInput, value: any) => void;
    applyIfKnownAppliance: (index: number, typedName: string) => void;
    removeLoad: (index: number) => void;
    addLoad: () => void;
    defaultHoursAtNight: number;
    setDefaultHoursAtNight: (val: number) => void;
    applyDefaultHoursToAll: () => void;
    surgeFactorFor: (load: LoadInput) => number;
    onBack: () => void;
    onNext: () => void;
};

export default function Step2Appliances({
    loads,
    updateLoad,
    applyIfKnownAppliance,
    removeLoad,
    addLoad,
    defaultHoursAtNight,
    setDefaultHoursAtNight,
    applyDefaultHoursToAll,
    surgeFactorFor,
    onBack,
    onNext,
}: Step2Props) {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#110000]">Appliances</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Default Night Hours:</span>
                        <input
                            type="number"
                            min="0"
                            max="24"
                            value={defaultHoursAtNight}
                            onChange={(e) => setDefaultHoursAtNight(Number(e.target.value))}
                            className="w-16 p-1 border rounded text-center"
                        />
                        <button
                            onClick={applyDefaultHoursToAll}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Apply to all
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase">
                            <tr>
                                <th className="px-3 py-2">Appliance Name</th>
                                <th className="px-3 py-2 w-20">Watts</th>
                                <th className="px-3 py-2 w-16">Qty</th>
                                <th className="px-3 py-2 w-16 text-center">Motor?</th>
                                <th className="px-3 py-2 w-20 text-center">Night Hrs</th>
                                <th className="px-3 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loads.map((load, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            list="appliance-list"
                                            value={load.name}
                                            onChange={(e) => updateLoad(i, "name", e.target.value)}
                                            onBlur={(e) => applyIfKnownAppliance(i, e.target.value)}
                                            placeholder="e.g. TV"
                                            className="w-full p-1 border rounded hover:border-blue-400 focus:border-green-500 outline-none"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            value={load.watts}
                                            onChange={(e) => updateLoad(i, "watts", e.target.value)}
                                            className="w-full p-1 border rounded text-center"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={load.qty}
                                            onChange={(e) => updateLoad(i, "qty", e.target.value)}
                                            className="w-full p-1 border rounded text-center"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={load.motor}
                                            onChange={(e) => updateLoad(i, "motor", e.target.checked)}
                                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                        />
                                        {load.motor && (
                                            <div className="text-[10px] text-red-500 mt-1">
                                                Surge x{surgeFactorFor(load)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            value={load.hoursNight}
                                            onChange={(e) => updateLoad(i, "hoursNight", e.target.value)}
                                            className="w-full p-1 border rounded text-center"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            onClick={() => removeLoad(i)}
                                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <datalist id="appliance-list">
                    {APPLIANCES.map((a) => (
                        <option key={a.name} value={a.name} />
                    ))}
                </datalist>

                <button
                    onClick={addLoad}
                    className="mt-4 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Appliance
                </button>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={onBack}
                    className="px-6 py-2 rounded-md font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                    Calculate System
                </button>
            </div>
        </div>
    );
}
