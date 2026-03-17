// lib/pricing.ts
// Server-only pricing rules for Pharmtech

export type LoadInput = {
    name: string;
    watts: number | string;
    qty: number | string;
    motor: boolean; // true = surge load
    hoursNight: number | string; // "hours at night" per load
};

export type BatteryType = "lithium" | "tubular" | "drycell";

export type InverterCatalogItem = {
    kva: number;
    voltage: 12 | 24 | 48;
    price: number;
    type: "normal" | "hybrid";
};

export type PanelCatalogItem = {
    watt: number;
    price: number; // per panel
};

export type BatteryCatalogItem = {
    sku: string; // unique
    type: BatteryType;
    voltage: number; // Actual voltage (12, 12.8, 24, 25.6, etc.)
    nominalVoltage: 12 | 24 | 48; // System compatibility
    ah: number;
    price: number; // per battery
};

// --------------------
// Catalogs (your data)
// --------------------
export const DEFAULT_INVERTERS: InverterCatalogItem[] = [
    // Standard (Normal)
    { kva: 1, voltage: 12, price: 170000, type: "normal" },
    { kva: 1.5, voltage: 12, price: 220000, type: "normal" },
    { kva: 1.5, voltage: 24, price: 300000, type: "normal" },
    { kva: 2, voltage: 12, price: 240000, type: "normal" },
    { kva: 2, voltage: 24, price: 320000, type: "normal" },
    { kva: 2.5, voltage: 24, price: 350000, type: "normal" },
    { kva: 3, voltage: 24, price: 400000, type: "normal" },
    { kva: 3.5, voltage: 24, price: 450000, type: "normal" },
    { kva: 4, voltage: 24, price: 470000, type: "normal" },
    { kva: 5, voltage: 48, price: 600000, type: "normal" },
    { kva: 6, voltage: 48, price: 650000, type: "normal" },
    { kva: 7.5, voltage: 48, price: 1000000, type: "normal" },
    { kva: 10, voltage: 48, price: 1300000, type: "normal" },

    // Hybrid
    { kva: 1.5, voltage: 12, price: 200000, type: "hybrid" },
    { kva: 2, voltage: 12, price: 230000, type: "hybrid" },
    { kva: 2.5, voltage: 24, price: 250000, type: "hybrid" },
    { kva: 3.5, voltage: 24, price: 310000, type: "hybrid" },
    { kva: 4, voltage: 24, price: 320000, type: "hybrid" },
    { kva: 5, voltage: 48, price: 500000, type: "hybrid" },
    { kva: 6, voltage: 48, price: 550000, type: "hybrid" },
    { kva: 7.5, voltage: 48, price: 800000, type: "hybrid" },
    { kva: 10, voltage: 48, price: 1100000, type: "hybrid" },
];

export const DEFAULT_PANELS: PanelCatalogItem[] = [
    { watt: 200, price: 45000 },
    { watt: 250, price: 55000 },
    { watt: 300, price: 68000 },
    { watt: 350, price: 75000 },
    { watt: 400, price: 80000 },
    { watt: 450, price: 85000 },
    { watt: 500, price: 90000 },
    { watt: 550, price: 95000 },
    { watt: 600, price: 105000 },
];

export const DEFAULT_BATTERIES: BatteryCatalogItem[] = [
    // Dry cell
    { sku: "dry-12v-200ah", type: "drycell", voltage: 12, nominalVoltage: 12, ah: 200, price: 260000 },

    // Tubular (wet cell)
    { sku: "tub-12v-220ah", type: "tubular", voltage: 12, nominalVoltage: 12, ah: 220, price: 250000 },

    // Lithium
    { sku: "li-12v-100ah", type: "lithium", voltage: 12.8, nominalVoltage: 12, ah: 100, price: 230000 },
    { sku: "li-12v-200ah", type: "lithium", voltage: 12.8, nominalVoltage: 12, ah: 200, price: 330000 },

    { sku: "li-24v-100ah", type: "lithium", voltage: 25.6, nominalVoltage: 24, ah: 100, price: 480000 },
    { sku: "li-24v-120ah", type: "lithium", voltage: 25.6, nominalVoltage: 24, ah: 120, price: 490000 },
    { sku: "li-24v-200ah", type: "lithium", voltage: 25.6, nominalVoltage: 24, ah: 200, price: 790000 },
    { sku: "li-24v-240ah", type: "lithium", voltage: 25.6, nominalVoltage: 24, ah: 240, price: 820000 },

    { sku: "li-48v-100ah", type: "lithium", voltage: 51.2, nominalVoltage: 48, ah: 100, price: 900000 },
    { sku: "li-48v-200ah", type: "lithium", voltage: 51.2, nominalVoltage: 48, ah: 200, price: 1600000 },
    { sku: "li-48v-300ah", type: "lithium", voltage: 51.2, nominalVoltage: 48, ah: 300, price: 1890000 },
];

// Accessories + Installation
export const DEFAULT_ACCESSORIES_INSTALL: Record<number, number> = {
    1: 295000,
    1.5: 300000,
    2: 300000,
    2.5: 350000,
    3: 350000,
    3.5: 350000,
    4: 350000,
    5: 490000,
    6: 500000,
    7.5: 620000,
    10: 650000,
};

// --------------------
// Rules helpers
// --------------------
export function naira(n: number) {
    return Math.round(n);
}

export function calcEnergyWh(loads: LoadInput[]) {
    // energy for "hours at night"
    return loads.reduce((sum, l) => {
        const watts = (Number(l.watts) || 0) * (Number(l.qty) || 0);
        const hrs = Number(l.hoursNight) || 0;
        return sum + watts * hrs;
    }, 0);
}

export function calcRunningWatts(loads: LoadInput[]) {
    return loads.reduce((sum, l) => {
        const watts = (Number(l.watts) || 0) * (Number(l.qty) || 0);
        return sum + watts;
    }, 0);
}

export function surgeFactorFor(load: LoadInput) {
    // Rule: other surge loads x2, only freezer/fridge x3
    if (!load.motor) return 1;

    const n = (load.name || "").toLowerCase();
    if (n.includes("freezer") || n.includes("fridge") || n.includes("refrigerator")) return 3;

    return 2;
}

export function calcPeakWatts(loads: LoadInput[]) {
    return loads.reduce((sum, l) => {
        const w = (Number(l.watts) || 0) * (Number(l.qty) || 0);
        return sum + w * surgeFactorFor(l);
    }, 0);
}

export function roundUpKvaFromWatts(watts: number) {
    // 1kVA ≈ 1000W, round check
    const kva = watts / 1000;
    return kva;
}

// Normalize inverter kVA into known classes
export function normalizeKva(rawKva: number): number {
    const classes = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7.5, 10];

    // Find first class >= rawKva
    const match = classes.find(c => c >= rawKva);
    return match || 10; // Cap at 10kVA or highest class
}

export function minPanelWattForKva(kva: number) {
    // Your rule set:
    // 1kVA -> 200W only
    // 1.5-2.5 -> 300W also allowed (you approved)
    // 2.5-3.5 -> 400W+
    // 3.5-4 -> 550W+
    if (kva <= 1) return 200;
    if (kva > 1 && kva <= 2.5) return 300;
    if (kva > 2.5 && kva <= 3.5) return 400;
    if (kva > 3.5 && kva <= 4) return 550;
    // above 4kVA: allow 550+ as sensible default
    return 550;
}

export function pickInverterForRequiredKva(rawKva: number, hasSurgeLoad: boolean, inverterType: "normal" | "hybrid" = "normal", catalog: InverterCatalogItem[] = DEFAULT_INVERTERS) {
    const warnings: string[] = [];
    // Use normalizeKva for standard sizes, but keep raw if larger than max catalog size (10)
    let targetKva = rawKva > 10 ? rawKva : normalizeKva(rawKva);

    // Rule: Minimum 2kVA for any surge load
    if (hasSurgeLoad && targetKva < 2) {
        targetKva = 2;
        warnings.push("Surge loads detected. Upgraded system to minimum 2kVA.");
    }

    // Force normalized steps again just in case (2.0 is valid), but only if within range
    if (targetKva <= 10) {
        targetKva = normalizeKva(targetKva);
    }

    // Voltage Rule Verification (Implied by catalog, but good to check)
    // 12V: 1, 1.5, 2
    // 24V: 1.5 - 4
    // 48V: 5+ 

    // Find Inverter
    // Special handling: For 1.5 and 2kVA, we have both 12V and 24V options.
    // The prompt says: "12V systems: for 1kVA, 1.5kVA (12V), 2kVA (12V)"
    // AND "24V systems: for 1.5kVA–4kVA". 
    // This implies overlap. We need a heuristic.
    // Let's prefer 24V for 1.5/2kVA if the load is high? 
    // Or just default to the "standard" which usually is 12V for small, 24V for mid.
    // However, the PROMPT strictly categorizes them.
    // "12V systems: for 1kVA, 1.5kVA (12V), 2kVA (12V)"
    // "24V systems: for 1.5kVA–4kVA"
    // Let's try to pick the best fit from INVERTERS based on voltage progression.

    // For specific kVA, if multiple voltages exist, which one to pick?
    // User text: "Use 12V for 1–2kVA, 24V for 1.5–4kVA, 48V for 5kVA+."
    // This implies 1.5 and 2 can be EITHER. 
    // Let's stick to the catalog order (lowest voltage first?) or prefer higher voltage for efficiency?
    // Let's prefer 24V for 2kVA if available, as it is better. But user rule says "12V... 2kVA(12V)".
    // Wait, the prompt lists "12V systems: ... 2kVA (12V)" explicitly.
    // And "24V systems: ... 2kVA".
    // I will return all matches and let the UI/Logic downstream decide? 
    // No, I must pick one "recommended".

    // Logic: 
    // If targetKva >= 5 -> 48V
    // If targetKva > 2 and < 5 -> 24V
    // If targetKva <= 2 -> Could be 12V or 24V. 
    // Let's default to 12V for <= 1.5, and 24V for 2? 
    // Actually, prompt says: "24V systems: for 1.5kVA–4kVA".
    // Let's pick 24V for 1.5 and up, UNLESS only 12V exists (1kVA).
    // EXCEPT the user explicitly listed "2kVA (12V)" under 12V systems.

    // Let's strictly follow the voltage implied by the found inverter in our catalog that matches the kVA.
    // Our INVERTERS list has:
    // 1kVA (12V)
    // 1.5kVA (12V), 1.5kVA (24V)
    // 2kVA (12V), 2kVA (24V)
    // 2.5... (24V)

    // I'll pick the HIGHER voltage option if duplicates exist (more efficient),
    // UNLESS the user prompt explicitly wants 12V focus.
    // Re-reading prompt warning: "Use 12V for 1–2kVA, 24V for 1.5–4kVA..."
    // This implies 1-2kVA *should* be 12V? Or that 12V is *valid* for 1-2kVA.
    // Let's pick the one that matches the kVA. If multiple, pick 24V for 2kVA+ for better efficiency.

    // Simplified logic: Find exact kVA match first, or next larger if missing (e.g. for hybrid gaps)
    // Filter by type
    const candidates = catalog.filter(i => i.type === inverterType);

    // Find unit >= targetKva
    const valid = candidates.filter(i => i.kva >= targetKva).sort((a, b) => a.kva - b.kva || b.voltage - a.voltage);

    if (valid.length > 0) {
        const selectedUnit = valid[0];
        // Check strict voltage boundaries and warn if needed (though we just picked from catalog)
        if (targetKva <= 2 && selectedUnit.voltage > 24) {
            // Should not happen with current catalog
        }
        return { units: [selectedUnit], warnings };
    }

    // If no single unit is large enough, we need multiple units.
    // User Constraint: Only kVA from 6kVA to 10kVA should be multiplied.

    // Sort candidates descending by kVA to try largest first
    // And filter for the range [6, 10]
    const sortedCandidates = candidates
        .filter(i => i.kva >= 6 && i.kva <= 10)
        .sort((a, b) => b.kva - a.kva);

    if (sortedCandidates.length === 0) {
        warnings.push(`No ${inverterType} inverters available in 6-10kVA range for multiple configuration.`);
        return { units: [], warnings };
    }

    // Find a unit where count * kva >= targetKva
    let bestOption: { unit: InverterCatalogItem, count: number, waste: number } | null = null;

    for (const unit of sortedCandidates) {
        const count = Math.ceil(targetKva / unit.kva);
        const totalCapacity = count * unit.kva;
        const waste = totalCapacity - targetKva;

        if (!bestOption || waste < bestOption.waste || (waste === bestOption.waste && count < bestOption.count)) {
            bestOption = { unit, count, waste };
        }
    }

    if (bestOption) {
        const { unit, count } = bestOption;
        const units = Array(count).fill(unit);
        warnings.push(`Load (${targetKva}kVA) exceeds single unit capacity. Using ${count}x ${unit.kva}kVA.`);
        return { units, warnings };
    }

    warnings.push(`Could not find a suitable configuration for ${targetKva}kVA.`);
    return { units: [], warnings };
}

// 2) Minimum battery pack required
export function getMinBatteryPackAh(inverterKva: number, systemVoltage: number, type: BatteryType) {
    // A) Dry-cell (12V 200Ah)
    if (type === "drycell") {
        // Small 12V (1-2kVA)
        if (inverterKva <= 2 && systemVoltage === 12) return 200;
        // Mid 24V (1.5-4kVA)
        if (inverterKva >= 1.5 && inverterKva <= 4 && systemVoltage === 24) return 200; // 2x12V 200Ah in series = 24V 200Ah
        // Big 48V (5kVA+)
        if (inverterKva >= 5 && systemVoltage === 48) return 200; // 4x12V 200Ah in series = 48V 200Ah
    }

    // B) Tubular (12V 220Ah)
    if (type === "tubular") {
        // Small 12V (1-2kVA)
        if (inverterKva <= 2 && systemVoltage === 12) return 220;
        // Mid 24V (1.5-4kVA)
        if (inverterKva >= 1.5 && inverterKva <= 4 && systemVoltage === 24) return 220;
        // Big 48V (5kVA+)
        if (inverterKva >= 5 && systemVoltage === 48) return 220;
    }

    // C) Lithium (voltage matched)
    if (type === "lithium") {
        // Small 12V (1-2kVA)
        if (inverterKva <= 2 && systemVoltage === 12) return 100;
        // Mid 24V (1.5-4kVA)
        if (inverterKva >= 1.5 && inverterKva <= 4 && systemVoltage === 24) return 120;
        // Big 48V (5kVA+)
        if (inverterKva >= 5) {
            // 7.5kVA+ -> 200Ah (approx 10kWh at 48V)
            if (inverterKva >= 7.5) return 200;
            // 5/6 -> 100Ah
            return 100;
        }
    }

    // Default fallback if no exact rule match (should not happen if catalog is aligned)
    return 100;
}

export function calcBatteryAhRequired(energyWh: number, systemVoltage: number, batteryType: BatteryType, inverterKva: number) {
    const systemEfficiency = 0.85;
    const dod = batteryType === "lithium" ? 0.8 : 0.5;

    if (!systemVoltage || systemVoltage <= 0) return 0;

    // Determine effective calculation voltage for Lithium
    let calcVoltage = systemVoltage;
    if (batteryType === "lithium") {
        if (systemVoltage === 12) calcVoltage = 12.8;
        if (systemVoltage === 24) calcVoltage = 25.6;
        if (systemVoltage === 48) calcVoltage = 51.2;
    }

    // 1. Calculate Ah based on Energy
    const energyAh = Math.ceil(energyWh / (calcVoltage * dod * systemEfficiency));

    // 2. Calculate Min Ah based on Inverter Rule
    const minAh = getMinBatteryPackAh(inverterKva, systemVoltage, batteryType);

    // 3. Final Requirement
    return Math.max(energyAh, minAh);
}

export function pickBattery(
    systemVoltage: 12 | 24 | 48,
    batteryType: BatteryType,
    requiredAh: number,
    catalog: BatteryCatalogItem[] = DEFAULT_BATTERIES
) {
    // Filter batteries matching the type and NOMINAL system voltage
    let options: BatteryCatalogItem[] = [];

    if (batteryType === "lithium") {
        options = catalog.filter((b) => b.type === "lithium" && b.nominalVoltage === systemVoltage);
    } else {
        options = catalog.filter((b) => b.type === batteryType);
    }

    if (!options.length) {
        // fallback
        const fallback = catalog.filter((b) => b.nominalVoltage === systemVoltage && b.type === "lithium");
        return { battery: fallback[0] ?? null, units: 1 };
    }

    // Sort options by Ah ASCENDING
    const sorted = options.sort((a, b) => a.ah - b.ah);
    const largest = sorted[sorted.length - 1];

    let chosen = largest;

    // Strategy:
    // If requiredAh <= largest.ah, find the smallest unit that satisfies the need (to avoid oversizing).
    // If requiredAh > largest.ah, stick with largest unit and multiply.
    if (requiredAh <= largest.ah) {
        const bestFit = sorted.find(b => b.ah >= requiredAh);
        if (bestFit) chosen = bestFit;
    }

    // fallback check
    if (!chosen) chosen = largest;

    // Calculate Series/Parallel counts
    let seriesUnits = 1;

    if (batteryType !== "lithium") {
        // Lead acid blocks are usually 12V. System might be 24V or 48V.
        // Check if battery voltage divides system voltage (12 divides 24, 48)
        if (chosen.voltage > 0 && systemVoltage >= chosen.voltage) {
            seriesUnits = Math.round(systemVoltage / chosen.voltage);
        }
    }
    // For Lithium, we assume the battery matches the system voltage (now using nominalVoltage to filter), 
    // so one unit is enough for voltage, we just stack for Ah.

    // Parallel strings to meet Ah requirement
    const parallelStrings = Math.max(1, Math.ceil(requiredAh / chosen.ah));

    const totalUnits = seriesUnits * parallelStrings;

    return { battery: chosen, units: totalUnits };
}

export function calcSolarWattsRequired(energyWh: number, sunHours: number, runningWatts: number = 0, minPvWatts: number = 0) {
    // same factor you used earlier
    const panelSystemFactor = 0.75;
    if (!sunHours || sunHours <= 0) return 0;

    const wattsForEnergy = energyWh / (sunHours * panelSystemFactor);
    const wattsForRunning = runningWatts / panelSystemFactor; // Ensure panels can power the load directly

    // We must satisfy the larger requirement:
    // 1. Refill the battery (if night usage > 0)
    // 2. Or power the active load during the day (if night usage is 0 or low)
    // 3. AND ensure the array is large enough to actually charge the battery bank in a reasonable time (avoid under-sizing for large banks)

    return Math.ceil(Math.max(wattsForEnergy, wattsForRunning, minPvWatts));
}

export function calcMinPvWattsForBattery(batteryVolts: number, batteryAh: number, batteryCount: number, sunHours: number) {
    if (!batteryCount || batteryCount <= 0) return 0;

    // Total Battery Capacity in Wh (approx)
    const totalWh = batteryVolts * batteryAh * batteryCount;

    // Rule: We should be able to charge the battery from 0% to 100% in "sunHours" ideal conditions?
    // Or at least bulk charge it. 
    // Let's say we want to be able to push at least C/10 current effectively.
    // Power = Volts * (Ah * 0.1). 
    // Example: 200Ah battery -> 20A charge current.
    // 12V * 20A = 240W.
    // 4x 200Ah 12V = 800Ah bank (parallel) or 48V 200Ah. 
    // Energy check:
    // A robust system should replace the battery energy in 1 full sun day max.
    // Factor: 1.3 to account for efficiency losses.

    // User requested to multiply by 1.5 (instead of 2) for robustness
    const requiredSourceWh = totalWh * 1.95; // 1.3 * 1.5
    const minPvWatts = requiredSourceWh / sunHours;

    return Math.ceil(minPvWatts);
}

export function accessoriesInstallFeeForUnits(units: InverterCatalogItem[], catalog: Record<number, number> = DEFAULT_ACCESSORIES_INSTALL) {
    if (!units.length) return 0;

    if (units.length === 1) {
        return catalog[units[0].kva] ?? 0;
    }

    // Your rule: for multi-unit, DO NOT multiply by units.
    // Instead: base fee (one unit) + 30% of base
    const base = catalog[units[0].kva] ?? 0;
    return Math.round(base * 1.3);
}

