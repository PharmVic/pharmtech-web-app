type StepperProps = {
    step: 1 | 2 | 3;
    setStep: (step: 1 | 2 | 3) => void;
};

export default function Stepper({ step, setStep }: StepperProps) {
    return (
        <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
                {[1, 2, 3].map((i) => {
                    const isActive = step >= i;
                    const isCurrent = step === i;
                    return (
                        <div key={i} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold transition-all duration-300 ${isActive
                                    ? "bg-orange-600 border-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                                    : "border-gray-300 text-gray-400"
                                    }`}
                            >
                                {i}
                            </div>
                            {i < 3 && (
                                <div
                                    className={`w-12 h-1 mx-2 transition-colors duration-300 ${step > i ? "bg-orange-600" : "bg-gray-200"
                                        }`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
