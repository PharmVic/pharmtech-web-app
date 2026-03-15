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
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-[#110000]">
                        Appliances <span className="text-sm font-normal text-gray-600 md:ml-2 block md:inline mt-1 md:mt-0">(1hp = 750watts)</span>
                    </h2>
                    <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        <span className="text-sm text-gray-600">Default Night Hours:</span>
                        <input
                            type="number"
                            min="0"
                            max="24"
                            value={defaultHoursAtNight}
                            onChange={(e) => setDefaultHoursAtNight(Number(e.target.value))}
                            className="w-16 p-1 border rounded text-center focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                        <button
                            onClick={applyDefaultHoursToAll}
                            className="text-xs text-orange-600 hover:text-[#110000] hover:underline transition-colors whitespace-nowrap"
                        >
                            Apply to all
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 pb-2">
                    <table className="w-full min-w-[650px] text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase">
                            <tr>
                                <th className="px-3 py-2">Appliance Name</th>
                                <th className="px-3 py-2 w-32">Watts</th>
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
                                            className="w-full p-2 border border-gray-200 rounded hover:border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                                            min="0"
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
                                            className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
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
                    className="mt-4 flex items-center gap-2 text-orange-600 hover:text-[#110000] font-bold transition-colors"
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
                    className="px-8 py-3 rounded-full font-bold text-lg text-white bg-orange-600 hover:bg-[#110000] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
                >
                    Calculate System
                </button>
            </div>
        </div>
    );
}
