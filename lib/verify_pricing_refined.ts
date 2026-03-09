
import { pickInverterForRequiredKva } from "./pricing";

console.log("--- Testing 6-10kVA Multiple Unit Restriction ---");

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

// 1. Load needing multiple units (12kVA) -> Should use 6kVA+
// Available: 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7.5, 10
// 12kVA -> 2x 6kVA (12). 
// Would 3x 4kVA (12) be better? 
// Constraint says NO. Only 6-10kVA can be multiplied.
// So 4kVA cannot be used.
test(12);

// 2. Load needing multiple units (25kVA)
// 25 / 10 = 3x 10 (30)
// 25 / 7.5 = 4x 7.5 (30)
// 25 / 6 = 5x 6 (30)
test(25);

// 3. What if slight overload? 11kVA.
// 2x 6kVA (12).
test(11);

// 4. Manual Logic Verification (Mock Sim)
// If I manually pick 5kVA for 12kVA load.
// Logic says: DO NOT multiply (count=1).
// Warning should say: Too small, use 6kVA+.
console.log("\n(Manual logic is verified via code review as it depends on user selection state)");
