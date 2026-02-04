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
                                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold transition-colors ${isActive
                                        ? "bg-green-600 border-green-600 text-white"
                                        : "border-gray-300 text-gray-400"
                                    }`}
                            >
                                {i}
                            </div>
                            {i < 3 && (
                                <div
                                    className={`w-12 h-1 mx-2 transition-colors ${step > i ? "bg-green-600" : "bg-gray-200"
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
