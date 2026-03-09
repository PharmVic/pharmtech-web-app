
// Mocking the state logic to verify math
// In page.tsx:
// const activeBatteryUnits = manualBatteryCount ?? recommendedBattery.units;
// pricingTotal = ... + (recommendedBattery.battery?.price ?? 0) * activeBatteryUnits;

const BATTERY_PRICE = 250000; // Mock price
const DEFAULT_UNITS = 2;

function calcPrice(manualCount: number | null) {
    const units = manualCount ?? DEFAULT_UNITS;
    return units * BATTERY_PRICE;
}

console.log("--- Testing Battery Quantity Logic ---");
console.log(`Default (Auto) Units: ${DEFAULT_UNITS}`);
console.log(`Battery Price: ${BATTERY_PRICE}`);
console.log(`Default Total: ${calcPrice(null)}`);

// Simulate user clicking Plus (increments current units)
// If current is 2, becomes 3.
const plusOne = 2 + 1;
console.log(`After +1 (Manual=3): ${calcPrice(plusOne)}`);

// Simulate user clicking Minus (decrements current units)
// If current is 3, becomes 2.
const minusOne = 3 - 1;
console.log(`After -1 (Manual=2): ${calcPrice(minusOne)}`);

// Decrease below default
const minOne = 2 - 1;
console.log(`After -1 (Manual=1): ${calcPrice(minOne)}`);

// Ensure min is 1
const invalidZero = Math.max(1, 1 - 1);
console.log(`Limit test (1-1): ${calcPrice(invalidZero)}`);

if (calcPrice(3) > calcPrice(2)) {
    console.log("SUCCESS: Price increases with quantity.");
} else {
    console.log("FAIL: Price did not increase.");
}
