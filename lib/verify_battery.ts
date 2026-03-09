
import { getMinBatteryPackAh } from "./pricing";

console.log("--- Testing Battery Defaults ---");

function test(kva: number, volts: number) {
    const ah = getMinBatteryPackAh(kva, volts, "lithium");
    console.log(`Inverter: ${kva}kVA (${volts}V) -> Min Battery: ${ah}Ah`);
}

// 5kVA (48V) -> Expect 100Ah
test(5, 48);

// 6kVA (48V) -> Expect 100Ah
test(6, 48);

// 7.5kVA (48V) -> Expect 200Ah (Target)
test(7.5, 48);

// 10kVA (48V) -> Expect 200Ah
test(10, 48);
