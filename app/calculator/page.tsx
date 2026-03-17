"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_APPLIANCES } from "@/lib/appliances";
import {
    DEFAULT_INVERTERS, DEFAULT_PANELS, DEFAULT_BATTERIES, DEFAULT_ACCESSORIES_INSTALL,
    type LoadInput,
    type BatteryType,
    type InverterCatalogItem,
    type PanelCatalogItem,
    type BatteryCatalogItem,
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
    const rand = String(Math.floor(Math.random() * 900000) + 100000);
    return `PT-${y}${m}${day}-${rand}`;
}

export default function SolarCalculator() {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // State
    const [loads, setLoads] = useState<LoadInput[]>([
        { name: "LED Bulb", watts: 10, qty: 0, motor: false, hoursNight: 0 },
        { name: "TV", watts: 150, qty: 0, motor: false, hoursNight: 0 },
        { name: "Fan", watts: 75, qty: 0, motor: false, hoursNight: 0 },
    ]);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [quoteNumber, setQuoteNumber] = useState("");

    const [defaultHoursAtNight, setDefaultHoursAtNight] = useState(0);
    const [batteryType, setBatteryType] = useState<BatteryType>("lithium");
    const [inverterType, setInverterType] = useState<"normal" | "hybrid">("normal");
    const [sunHours, setSunHours] = useState(5);
    const [manualPanelCount, setManualPanelCount] = useState<number | null>(null);
    const [manualBatteryCount, setManualBatteryCount] = useState<number | null>(null);
    const [manualInverterId, setManualInverterId] = useState<string | null>(null);
    const [preferredPanelWattage, setPreferredPanelWattage] = useState<number | null>(null);
    const [preferredBatteryAh, setPreferredBatteryAh] = useState<number | null>(null);

    const [userId, setUserId] = useState<string | null>(null);

    // Dynamic Catalogs State
    const [invertersCatalog, setInvertersCatalog] = useState<InverterCatalogItem[]>(DEFAULT_INVERTERS);
    const [panelsCatalog, setPanelsCatalog] = useState<PanelCatalogItem[]>(DEFAULT_PANELS);
    const [batteriesCatalog, setBatteriesCatalog] = useState<BatteryCatalogItem[]>(DEFAULT_BATTERIES);
    const [appliancesCatalog, setAppliancesCatalog] = useState(DEFAULT_APPLIANCES);
    const [accessoriesCatalog, setAccessoriesCatalog] = useState<Record<number, number>>(DEFAULT_ACCESSORIES_INSTALL);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

    useEffect(() => {
        setQuoteNumber(generateQuoteNumber());
        
        // Try to get the logged-in user to link the quote
        supabase.auth.getSession().then(({ data }) => {
            if (data?.session?.user) {
                setUserId(data.session.user.id);
                setCustomerName(data.session.user.user_metadata?.full_name || "");
                setCustomerPhone(data.session.user.user_metadata?.phone || "");
                setCustomerAddress(data.session.user.user_metadata?.address || "");
            }
        });

        // Fetch Catalogs
        async function fetchCatalogs() {
            try {
                const [invRes, panRes, batRes, appRes, accRes] = await Promise.all([
                    supabase.from('calc_inverters').select('*'),
                    supabase.from('calc_panels').select('*'),
                    supabase.from('calc_batteries').select('*'),
                    supabase.from('calc_appliances').select('*'),
                    supabase.from('calc_accessories').select('*')
                ]);

                if (invRes.data && invRes.data.length > 0) {
                    setInvertersCatalog(invRes.data.map(i => ({
                        kva: Number(i.kva), voltage: i.voltage, price: i.price, type: i.type as any
                    })));
                }
                
                if (panRes.data && panRes.data.length > 0) {
                    setPanelsCatalog(panRes.data.map(p => ({
                        watt: Number(p.watt), price: p.price
                    })));
                }

                if (batRes.data && batRes.data.length > 0) {
                    setBatteriesCatalog(batRes.data.map(b => ({
                        sku: b.sku, type: b.type as any, voltage: Number(b.voltage), nominalVoltage: b.nominal_voltage as any, ah: Number(b.ah), price: b.price
                    })));
                }

                if (appRes.data && appRes.data.length > 0) {
                    setAppliancesCatalog(appRes.data.map(a => ({
                        name: a.name, runningWatts: Number(a.running_watts), surgeFactor: Number(a.surge_factor)
                    })));
                }

                if (accRes.data && accRes.data.length > 0) {
                    const accMap: Record<number, number> = {};
                    accRes.data.forEach(a => {
                        accMap[Number(a.kva)] = a.fee;
                    });
                    setAccessoriesCatalog(accMap);
                }
            } catch (err) {
                console.error("Error fetching catalogs:", err);
            } finally {
                setIsLoadingCatalogs(false);
            }
        }
        fetchCatalogs();
    }, []);

    // Reset manual inverter when type changes
    useEffect(() => {
        setManualInverterId(null);
    }, [inverterType]);



    // Validation
    const isCustomerValid =
        customerName.trim().length >= 2 &&
        customerPhone.replace(/\D/g, '').length >= 11 &&
        customerAddress.trim().length >= 3;

    // Handlers
    const updateLoad = (index: number, key: keyof LoadInput, value: any) => {
        setLoads((prev) => {
            const updated = [...prev];
            const next = { ...updated[index], [key]: value };
            // Ensure numbers or allow empty string
            if (key === "qty") next.qty = value === "" ? "" : Math.max(0, Number(value) || 0);
            if (key === "watts") next.watts = value === "" ? "" : Math.max(0, Number(value) || 0);
            if (key === "hoursNight") next.hoursNight = value === "" ? "" : Math.max(0, Number(value) || 0);

            updated[index] = next;
            return updated;
        });
    };

    const applyIfKnownAppliance = (index: number, typedName: string) => {
        const match = appliancesCatalog.find((a: { name: string; runningWatts: number; surgeFactor: number }) => a.name.toLowerCase() === typedName.trim().toLowerCase());
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
        setLoads((prev) => [...prev, { name: "", watts: 0, qty: 0, motor: false, hoursNight: defaultHoursAtNight }]);
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
        const margin = 1.2;
        return roundUpKvaFromWatts(totalPeakWatts * margin);
    }, [totalPeakWatts]);

    // A. Computed Recommendation
    const recommendedInverter = useMemo(() => {
        const rec = pickInverterForRequiredKva(requiredKva, hasSurgeLoad, inverterType, invertersCatalog);
        // Reset manual if type mismatch? keeping simple for now.
        return rec;
    }, [requiredKva, hasSurgeLoad, inverterType]);

    // B. Available Options
    const availableInverters = useMemo(() => {
        return invertersCatalog.filter(i => i.type === inverterType).sort((a, b) => a.kva - b.kva);
    }, [inverterType, invertersCatalog]);

    // C. Active Inverter (Calculation Basis)
    const activeInverter = useMemo(() => {
        if (manualInverterId) {
            const [k, v] = manualInverterId.split("-").map(Number);
            const found = availableInverters.find(i => i.kva === k && i.voltage === v);
            if (found) {
                // If manual inverter is smaller than required, multiply it
                // Logic: If user specifically picked a small one, it likely means they want multiple of it to meet the load.
                // Or they might just want to see the price of one. 
                // But generally for a "system sizing" tool, we should meet the load.
                // count = ceil(requiredKva / found.kva)
                // However, we must be careful not to trigger this for slightly smaller units if it's just a margin issue.
                // But requiredKva includes margin.

                // Let's use requiredKva (which has 20% margin). 
                // If selected 5kVA for 12kVA load -> 3x 5kVA = 15kVA. Correct.

                // User Constraint: Only multiply if kva >= 6.
                let count = 1;
                if (found.kva >= 6) {
                    count = Math.ceil(requiredKva / found.kva);
                }

                const units = Array(Math.max(1, count)).fill(found);

                const warnings: string[] = [];
                if (count > 1) {
                    warnings.push(`Selected inverter (${found.kva}kVA) is too small for ${requiredKva}kVA load. Using ${count} units.`);
                } else if (found.kva < requiredKva && found.kva < 6) {
                    // If they picked a small one and we didn't multiply
                    warnings.push(`Selected inverter (${found.kva}kVA) is too small for ${requiredKva}kVA load. Recommendation: Select 6kVA+ for multi-unit systems.`);
                }

                return { units, warnings };
            }
        }
        return recommendedInverter;
    }, [manualInverterId, availableInverters, recommendedInverter, requiredKva]);

    // 3. System Voltage
    const activeSystemVoltage = useMemo(() => {
        if (!activeInverter.units.length) return 24; // fallback
        return activeInverter.units[0].voltage;
    }, [activeInverter]);

    // Reset preferred battery Ah when voltage/type changes
    useEffect(() => {
        setPreferredBatteryAh(null);
    }, [activeSystemVoltage, batteryType]);

    // 4. Battery
    const requiredBatteryAh = useMemo(() => {
        const effectiveKva = activeInverter.units.length > 0 ? activeInverter.units[0].kva : requiredKva;
        return calcBatteryAhRequired(totalEnergyWh, activeSystemVoltage, batteryType, effectiveKva);
    }, [totalEnergyWh, activeSystemVoltage, batteryType, requiredKva, activeInverter]);

    // Available Lithium Options for this voltage
    const availableLithiumBatteries = useMemo(() => {
        if (batteryType !== "lithium") return [];
        return batteriesCatalog
            .filter(b => b.type === "lithium" && b.nominalVoltage === activeSystemVoltage)
            .sort((a, b) => a.ah - b.ah);
    }, [activeSystemVoltage, batteryType, batteriesCatalog]);

    const recommendedBattery = useMemo(() => {
        if (batteryType === "lithium" && preferredBatteryAh) {
            const found = availableLithiumBatteries.find(b => b.ah === preferredBatteryAh);
            if (found) {
                // Re-calc units
                const count = Math.ceil(requiredBatteryAh / found.ah);
                return { battery: found, units: Math.max(1, count) };
            }
        }
        return pickBattery(activeSystemVoltage as 12 | 24 | 48, batteryType, requiredBatteryAh, batteriesCatalog);
    }, [activeSystemVoltage, batteryType, requiredBatteryAh, preferredBatteryAh, availableLithiumBatteries, batteriesCatalog]);

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
        const invCost = activeInverter.units.reduce((s, u) => s + u.price, 0);
        const batCost = (recommendedBattery.battery?.price ?? 0) * activeBatteryUnits;
        const panelCost = activePanelCount * (panelsCatalog.find(p => p.watt === minPanelW)?.price ?? 85000);
        const installCost = accessoriesInstallFeeForUnits(activeInverter.units, accessoriesCatalog);

        return invCost + batCost + panelCost + installCost;
    }, [activeInverter, recommendedBattery, activePanelCount, minPanelW, activeBatteryUnits, panelsCatalog, accessoriesCatalog]);

    // Save Logic
    const [isSaving, setIsSaving] = useState(false);
    async function saveQuoteToDb() {
        setIsSaving(true);
        try {
            const { error } = await supabase.from("quotes").upsert({
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
                user_id: userId || null,
            }, { onConflict: 'quote_number' });

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
        <main className="min-h-screen bg-[#FDFBF7] px-4 pt-40 pb-16">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-[#110000]">
                    Solar <span className="text-orange-600">Calculator</span>
                </h1>

                {isLoadingCatalogs ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading calculator catalog...</p>
                    </div>
                ) : (
                    <>
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
                        appliancesCatalog={appliancesCatalog}
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

                        recommendedInverter={activeInverter}
                        inverterType={inverterType}

                        // Manual Inverter Selection Props
                        originalRecommendedKva={recommendedInverter.units[0]?.kva}
                        availableInverters={availableInverters}
                        manualInverterId={manualInverterId}
                        setManualInverterId={setManualInverterId}

                        setInverterType={setInverterType}
                        recommendedPanelCount={activePanelCount}
                        setManualPanelCount={setManualPanelCount}

                        recommendedPanelWattage={minPanelW}
                        preferredPanelWattage={preferredPanelWattage}
                        setPreferredPanelWattage={setPreferredPanelWattage}

                        recommendedBattery={recommendedBattery}
                        activeBatteryType={batteryType}
                        setBatteryType={setBatteryType}

                        // New Battery Capacity Props
                        availableLithiumBatteries={availableLithiumBatteries}
                        preferredBatteryAh={preferredBatteryAh}
                        setPreferredBatteryAh={setPreferredBatteryAh}

                        manualBatteryCount={activeBatteryUnits}
                        setManualBatteryCount={setManualBatteryCount}

                        batteryDisplay={recommendedBattery.battery
                            ? (recommendedBattery.battery.type === "lithium"
                                ? `${activeBatteryUnits}x ${(recommendedBattery.battery.ah * recommendedBattery.battery.voltage / 1000).toFixed(2)}kWh ${recommendedBattery.battery.type} ${recommendedBattery.battery.ah}Ah (${recommendedBattery.battery.voltage}V) - System: ${activeSystemVoltage}V`
                                : `${activeBatteryUnits}x ${recommendedBattery.battery.type} ${recommendedBattery.battery.ah}Ah (${recommendedBattery.battery.voltage}V) - System: ${activeSystemVoltage}V`)
                            : "None"}

                        pricingTotal={pricingTotal}
                        onBack={() => setStep(2)}
                        onSave={saveQuoteToDb}
                        isSaving={isSaving}
                    />
                )}
                    </>
                )}
            </div>
        </main>
    );
}
