"use client";

type Step1Props = {
    customerName: string;
    setCustomerName: (val: string) => void;
    customerPhone: string;
    setCustomerPhone: (val: string) => void;
    customerAddress: string;
    setCustomerAddress: (val: string) => void;
    quoteNumber: string;
    isCustomerValid: boolean;
    onNext: () => void;
};

export default function Step1Customer({
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerAddress,
    setCustomerAddress,
    quoteNumber,
    isCustomerValid,
    onNext,
}: Step1Props) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-[#110000]">Customer Details</h2>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote Number</label>
                <input
                    type="text"
                    value={quoteNumber}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:shadow-md"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="080..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:shadow-md"
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Delivery address"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm hover:shadow-md"
                    rows={3}
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isCustomerValid}
                    className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 ${isCustomerValid
                        ? "bg-orange-600 text-white hover:bg-[#110000]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    Next: Appliances
                </button>
            </div>
        </div>
    );
}
