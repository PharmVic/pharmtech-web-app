
import { BATTERIES, calcBatteryAhRequired } from "./pricing";

// Mock Data
const activeSystemVoltage = 48;
const batteryType = "lithium";
const requiredBatteryAh = 400; // Calculated based on load

console.log("--- Testing Manual Lithium Selection ---");
console.log(`System: ${activeSystemVoltage}V, Req Ah: ${requiredBatteryAh}`);

// 1. Available Options
const available = BATTERIES
    .filter(b => b.type === "lithium" && b.nominalVoltage === activeSystemVoltage)
    .sort((a, b) => a.ah - b.ah);

console.log("Available Options:", available.map(b => `${b.ah}Ah`));

// 2. Default Selection (Logic: Pick largest normally)
// pickBattery logic -> if req > largest, pick largest. 
// If req <= largest, pick best fit.
// Here 400Ah > 300Ah (largest). So picks 300Ah? Or maybe 200Ah?
// Let's verify what 'pickBattery' does if we called it directly?
// Actually I implemented a simpler override logic in page.tsx:
// if (preferredBatteryAh) { find target; count = ceil(req / target.ah); }

function testOverride(preferredAh: number) {
    const target = available.find(b => b.ah === preferredAh);
    if (!target) {
        console.log(`Preferred ${preferredAh}Ah not found.`);
        return;
    }
    const count = Math.ceil(requiredBatteryAh / target.ah);
    console.log(`Selected ${preferredAh}Ah -> Units: ${count} (Total: ${count * target.ah}Ah)`);
}

// Test Case 1: Select 100Ah
testOverride(100);

// Test Case 2: Select 200Ah
testOverride(200);

// Test Case 3: Select 300Ah
testOverride(300);
