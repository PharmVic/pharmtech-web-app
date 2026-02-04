"use client";

import { useEffect, useMemo, useState } from "react";
import { APPLIANCES } from "@/lib/appliances";
import {
    INVERTERS, PANELS, BATTERIES, ACCESSORIES_INSTALL,
    type LoadInput,
    type BatteryType,
    calcRunningWatts,
    calcPeakWatts,
    calcEnergyWh,
    roundUpKvaFromWatts,
    pickInverterForRequiredKva,
    minPanelWattForKva,
    pickBattery,
    calcSolarWattsRequired,
    calcBatteryAhRequired,
    calcMinPvWattsForBattery,
    accessoriesInstallFeeForUnits,
    surgeFactorFor
} from "@/lib/pricing";
import { supabase } from "@/lib/supabaseClient";

// Components
import Stepper from "./_components/Stepper";
import Step1Customer from "./_components/Step1Customer";
import Step2Appliances from "./_components/Step2Appliances";
import Step3SizingAndQuote from "./_components/Step3SizingAndQuote";

function generateQuoteNumber() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = String(Math.floor(Math.random() * 9000) + 1000);
    return `PT-${y}${m}${day}-${rand}`;
}

export default function SolarCalculator() {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // State
    const [loads, setLoads] = useState<LoadInput[]>([
        { name: "LED Bulb", watts: 10, qty: 6, motor: false, hoursNight: 6 },
        { name: "TV", watts: 150, qty: 1, motor: false, hoursNight: 6 },
        { name: "Fan", watts: 75, qty: 2, motor: false, hoursNight: 6 },
    ]);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [quoteNumber, setQuoteNumber] = useState("");

    const [defaultHoursAtNight, setDefaultHoursAtNight] = useState(6);
    const [batteryType, setBatteryType] = useState<BatteryType>("lithium");
    const [inverterType, setInverterType] = useState<"normal" | "hybrid">("normal");
    const [sunHours, setSunHours] = useState(5);
    const [manualPanelCount, setManualPanelCount] = useState<number | null>(null);
    const [manualBatteryCount, setManualBatteryCount] = useState<number | null>(null);
    const [preferredPanelWattage, setPreferredPanelWattage] = useState<number | null>(null);

    useEffect(() => {
        setQuoteNumber(generateQuoteNumber());
    }, []);

    // Validation
    const isCustomerValid =
        customerName.trim().length >= 2 &&
        customerPhone.trim().length >= 5 &&
        customerAddress.trim().length >= 5;

    // Handlers
    const updateLoad = (index: number, key: keyof LoadInput, value: any) => {
        setLoads((prev) => {
            const updated = [...prev];
            const next = { ...updated[index], [key]: value };
            // Ensure numbers
            if (key === "qty") next.qty = Math.max(1, Number(value) || 1);
            if (key === "watts") next.watts = Math.max(0, Number(value) || 0);
            if (key === "hoursNight") next.hoursNight = Math.max(0, Number(value) || 0);

            updated[index] = next;
            return updated;
        });
    };

    const applyIfKnownAppliance = (index: number, typedName: string) => {
        const match = APPLIANCES.find((a) => a.name.toLowerCase() === typedName.trim().toLowerCase());
        if (!match) return;
        setLoads((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                name: match.name,
                watts: match.runningWatts,
                motor: Boolean(match.surgeFactor), // mapping concept
                hoursNight: updated[index].hoursNight,
            };
            return updated;
        });
    };

    const addLoad = () => {
        setLoads((prev) => [...prev, { name: "", watts: 0, qty: 1, motor: false, hoursNight: defaultHoursAtNight }]);
    };

    const removeLoad = (index: number) => setLoads((prev) => prev.filter((_, i) => i !== index));

    const applyDefaultHoursToAll = () => {
        setLoads((prev) => prev.map((l) => ({ ...l, hoursNight: defaultHoursAtNight })));
    };

    // --- CALCULATIONS (New Logic) ---

    // 1. Load Stats
    const totalRunningWatts = useMemo(() => calcRunningWatts(loads), [loads]);
    const totalPeakWatts = useMemo(() => calcPeakWatts(loads), [loads]);
    const totalEnergyWh = useMemo(() => calcEnergyWh(loads), [loads]);
    const hasSurgeLoad = useMemo(() => loads.some(l => l.motor), [loads]);

    // 2. Inverter
    const requiredKva = useMemo(() => {
        const rawKva = totalPeakWatts / 1000;
        // Inverter sizing margin
        const margin = 1.2;
        return roundUpKvaFromWatts(totalPeakWatts * margin);
    }, [totalPeakWatts]);

    const recommendedInverter = useMemo(() => {
        return pickInverterForRequiredKva(requiredKva, hasSurgeLoad, inverterType);
    }, [requiredKva, hasSurgeLoad, inverterType]);

    // ... (Rest of derived logic cascades automatically from recommendedInverter) ...

    // 3. System Voltage
    const activeSystemVoltage = useMemo(() => {
        if (!recommendedInverter.units.length) return 24; // fallback
        return recommendedInverter.units[0].voltage;
    }, [recommendedInverter]);

    // 4. Battery
    const requiredBatteryAh = useMemo(() => {
        return calcBatteryAhRequired(totalEnergyWh, activeSystemVoltage, batteryType, requiredKva);
    }, [totalEnergyWh, activeSystemVoltage, batteryType, requiredKva]);

    const recommendedBattery = useMemo(() => {
        return pickBattery(activeSystemVoltage as 12 | 24 | 48, batteryType, requiredBatteryAh);
    }, [activeSystemVoltage, batteryType, requiredBatteryAh]);

    // Derived Battery Count
    const activeBatteryUnits = manualBatteryCount ?? recommendedBattery.units;

    // 5. Panels
    const minPanelW = useMemo(() => {
        if (preferredPanelWattage) return preferredPanelWattage;

        // use total kva of system for panel sizing rule (auto logic)
        const totalKva = recommendedInverter.units.reduce((s, u) => s + u.kva, 0);
        return minPanelWattForKva(totalKva);
    }, [recommendedInverter, preferredPanelWattage]);

    const requiredSolarWatts = useMemo(() => {
        const bat = recommendedBattery.battery;
        const minForCharging = bat
            ? calcMinPvWattsForBattery(bat.voltage, bat.ah, activeBatteryUnits, sunHours)
            : 0;

        return calcSolarWattsRequired(totalEnergyWh, sunHours, totalRunningWatts, minForCharging);
    }, [totalEnergyWh, sunHours, totalRunningWatts, recommendedBattery, activeBatteryUnits]);

    const recommendedPanelCount = Math.ceil(requiredSolarWatts / minPanelW);
    const activePanelCount = manualPanelCount ?? recommendedPanelCount;

    // 6. Pricing
    const pricingTotal = useMemo(() => {
        const invCost = recommendedInverter.units.reduce((s, u) => s + u.price, 0);
        const batCost = (recommendedBattery.battery?.price ?? 0) * activeBatteryUnits;
        const panelCost = activePanelCount * (PANELS.find(p => p.watt === minPanelW)?.price ?? 85000);
        const installCost = accessoriesInstallFeeForUnits(recommendedInverter.units);

        return invCost + batCost + panelCost + installCost;
    }, [recommendedInverter, recommendedBattery, activePanelCount, minPanelW, activeBatteryUnits]);

    // Save Logic
    const [isSaving, setIsSaving] = useState(false);
    async function saveQuoteToDb() {
        setIsSaving(true);
        try {
            const { error } = await supabase.from("quotes").insert({
                quote_number: quoteNumber,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress,
                total_load_watts: totalRunningWatts,
                total_surge_watts: totalPeakWatts,
                recommended_kva: requiredKva,
                system_voltage: activeSystemVoltage,
                estimated_price: pricingTotal,
                appliances: loads,
                // New Fields
                battery_type: batteryType,
                battery_count: activeBatteryUnits,
                battery_ah: recommendedBattery.battery?.ah ?? 0,
                panel_count: activePanelCount,
                panel_wattage: minPanelW,
                inverter_name: recommendedInverter.units.map(u => `${u.kva}kVA ${u.voltage}V`).join(", "),
            });

            if (error) {
                console.error("Save error details:", JSON.stringify(error, null, 2));
                alert(`Failed to save quote: ${error.message || "Unknown error"}`);
            } else {
                alert("Quote saved successfully!");
            }
        } catch (err) {
            console.error(err);
            alert("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-16">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold text-center mb-8 text-[#110000]">Solar Calculator</h1>

                <Stepper step={step} setStep={setStep} />

                {step === 1 && (
                    <Step1Customer
                        customerName={customerName}
                        setCustomerName={setCustomerName}
                        customerPhone={customerPhone}
                        setCustomerPhone={setCustomerPhone}
                        customerAddress={customerAddress}
                        setCustomerAddress={setCustomerAddress}
                        quoteNumber={quoteNumber}
                        isCustomerValid={isCustomerValid}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <Step2Appliances
                        loads={loads}
                        updateLoad={updateLoad}
                        applyIfKnownAppliance={applyIfKnownAppliance}
                        removeLoad={removeLoad}
                        addLoad={addLoad}
                        defaultHoursAtNight={defaultHoursAtNight}
                        setDefaultHoursAtNight={setDefaultHoursAtNight}
                        applyDefaultHoursToAll={applyDefaultHoursToAll}
                        // Adapter for step 2 old props if needed, or update Step 2?
                        // Step 2 seems to expect 'surgeFactorFor' which we imported.
                        // But Step 2 uses 'motor' boolean, our new type uses 'motor' boolean.
                        // Let's check imports.
                        surgeFactorFor={(l: any) => surgeFactorFor(l)}
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                    />
                )}

                {step === 3 && (
                    <Step3SizingAndQuote
                        customerName={customerName}
                        customerPhone={customerPhone}
                        customerAddress={customerAddress}
                        loads={loads}
                        totalRunningWatts={totalRunningWatts}
                        totalSurgeWatts={totalPeakWatts}
                        energyNeededWh={totalEnergyWh}

                        recommendedInverter={recommendedInverter}
                        inverterType={inverterType}
                        setInverterType={setInverterType}
                        recommendedPanelCount={activePanelCount}
                        setManualPanelCount={setManualPanelCount}

                        recommendedPanelWattage={minPanelW}
                        preferredPanelWattage={preferredPanelWattage}
                        setPreferredPanelWattage={setPreferredPanelWattage}

                        recommendedBattery={recommendedBattery}
                        activeBatteryType={batteryType}
                        setBatteryType={setBatteryType}
                        manualBatteryCount={activeBatteryUnits}
                        setManualBatteryCount={setManualBatteryCount}

                        batteryDisplay={recommendedBattery.battery
                            ? `${activeBatteryUnits}x ${recommendedBattery.battery.type} ${recommendedBattery.battery.ah}Ah (${recommendedBattery.battery.voltage}V) - System: ${activeSystemVoltage}V`
                            : "None"}

                        pricingTotal={pricingTotal}
                        onBack={() => setStep(2)}
                        onSave={saveQuoteToDb}
                        isSaving={isSaving}
                    />
                )}
            </div>
        </main>
    );
}
