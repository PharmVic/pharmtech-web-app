
import { pickInverterForRequiredKva, type InverterCatalogItem } from "./pricing";

// Mock Data (matches your catalog structure)
const INVERTERS: InverterCatalogItem[] = [
    { kva: 1, voltage: 12, price: 170000, type: "normal" },
    { kva: 5, voltage: 48, price: 600000, type: "normal" },
    { kva: 10, voltage: 48, price: 1300000, type: "normal" },
];

// We need to overwrite the INVERTERS in pricing.ts or just rely on the real one?
// Since I can't easily mock the module's internal data without a proper test runner, 
// I will just rely on the real `pricing.ts` which I just modified.
// I will just call `pickInverterForRequiredKva` and check results.

console.log("--- Testing Multiple Inverter Logic ---");

function test(kva: number) {
    console.log(`\nTesting Load: ${kva}kVA`);
    const result = pickInverterForRequiredKva(kva, false, "normal");
    if (result.units.length === 0) {
        console.log("No result found!");
        console.log("Warnings:", result.warnings);
    } else {
        const u = result.units[0];
        console.log(`Result: ${result.units.length}x ${u.kva}kVA (${u.voltage}V)`);
        console.log("Total Capacity:", result.units.reduce((s, x) => s + x.kva, 0) + "kVA");
    }
}

// 1. Small Load (should be single)
test(2.5);

// 2. Large Load (should be multiple)
// Max single is 10kVA. Let's try 12kVA.
test(12);

// 3. Very Large Load
test(25);
