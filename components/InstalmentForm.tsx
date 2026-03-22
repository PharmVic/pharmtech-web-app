"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

const PaystackCheckout = dynamic(() => import("./PaystackCheckout"), { ssr: false });

interface InstalmentFormProps {
    product: any;
    userId?: string;
}

export default function InstalmentForm({ product, userId }: InstalmentFormProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [durationMonths, setDurationMonths] = useState<number | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const availableDurations = [
        { label: "3 Months", value: 3, price: product?.instalment_3m_price },
        { label: "6 Months", value: 6, price: product?.instalment_6m_price },
        { label: "9 Months", value: 9, price: product?.instalment_9m_price },
        { label: "12 Months", value: 12, price: product?.instalment_12m_price },
    ].filter(d => d.price != null && d.price > 0);

    // Step 1
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [bvn, setBvn] = useState("");
    const [relationshipStatus, setRelationshipStatus] = useState("");
    const [occupation, setOccupation] = useState("");
    const [address, setAddress] = useState("");

    // Step 2
    const [gName, setGName] = useState("");
    const [gPhone, setGPhone] = useState("");
    const [gEmail, setGEmail] = useState("");
    const [gRelationship, setGRelationship] = useState("");
    const [gAddress, setGAddress] = useState("");

    // Step 3
    const [ninNumber, setNinNumber] = useState("");
    const [idDoc, setIdDoc] = useState<File | null>(null);
    const [proofDoc, setProofDoc] = useState<File | null>(null);

    const closeModal = () => {
        if (!loading) {
            setIsOpen(false);
            setStep(1);
        }
    };

    const handleNext = () => setStep((s) => s + 1);
    const handlePrev = () => setStep((s) => s - 1);

    const handleOpenForm = async () => {
        if (!userId) {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            setLoading(false);
            if (!session) {
                alert("You must be logged in to apply for instalments.");
                router.push("/auth/sign-in");
                return;
            }
        }
        setIsOpen(true);
    };

    const handleSubmitApplication = async () => {
        setLoading(true);
        try {
            if (!idDoc || !proofDoc) {
                alert("Please upload both required documents.");
                setLoading(false);
                return;
            }

            // Upload ID
            const idExt = idDoc.name.split(".").pop();
            const idPath = `id_${Date.now()}.${idExt}`;
            const { error: idError } = await supabase.storage.from("kyc-documents").upload(idPath, idDoc);
            if (idError) throw idError;
            const { data: idUrl } = supabase.storage.from("kyc-documents").getPublicUrl(idPath);

            // Upload Proof
            const proofExt = proofDoc.name.split(".").pop();
            const proofPath = `proof_${Date.now()}.${proofExt}`;
            const { error: proofError } = await supabase.storage.from("kyc-documents").upload(proofPath, proofDoc);
            if (proofError) throw proofError;
            const { data: proofUrl } = supabase.storage.from("kyc-documents").getPublicUrl(proofPath);

            const monthlyPayment = availableDurations.find(d => d.value === durationMonths)?.price || 0;

            // Insert Application
            const { data, error } = await supabase.from("instalment_applications").insert({
                product_id: product.id,
                user_id: userId || null,
                duration_months: durationMonths,
                monthly_payment_amount: monthlyPayment,
                bvn,
                name,
                phone,
                email,
                relationship_status: relationshipStatus,
                occupation,
                address,
                guarantor_name: gName,
                guarantor_phone: gPhone,
                guarantor_email: gEmail,
                guarantor_relationship: gRelationship,
                guarantor_address: gAddress,
                nin_number: ninNumber,
                id_document_url: idUrl.publicUrl,
                proof_of_address_url: proofUrl.publicUrl,
                status: "pending"
            }).select();

            if (error) throw error;
            
            if (data && data.length > 0) {
                setApplicationId(data[0].id);
            }
            
            setStep(4); // Move to Payment Step
        } catch (error: any) {
            console.error(error);
            alert("Error submitting application: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleOpenForm}
                disabled={loading}
                className="px-8 py-4 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors flex items-center justify-center border border-blue-200 disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Buy on Instalment
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">
                                {step === 4 ? "Down Payment" : `Instalment Application - Step ${step} of 3`}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-800">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700 pb-2 border-b">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Full Name</label>
                                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email Address</label>
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">BVN (Bank Verification Number)</label>
                                            <input type="text" value={bvn} onChange={e => setBvn(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Occupation</label>
                                            <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Relationship Status</label>
                                            <select value={relationshipStatus} onChange={e => setRelationshipStatus(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500 bg-white">
                                                <option value="">Select...</option>
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Divorced">Divorced</option>
                                                <option value="Widowed">Widowed</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Residential Address</label>
                                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                    </div>

                                    {availableDurations.length > 0 && (
                                        <div className="mt-6 p-4 border border-blue-200 rounded-xl bg-blue-50 animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-base font-bold text-blue-900 mb-3">Select Instalment Duration Framework</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {availableDurations.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setDurationMonths(opt.value)}
                                                        className={`p-3 rounded-lg border text-left transition ${
                                                            durationMonths === opt.value 
                                                                ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-[1.02]' 
                                                                : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400'
                                                        }`}
                                                    >
                                                        <div className="font-bold text-lg">{opt.label}</div>
                                                        <div className={`text-sm mt-1 font-medium ${durationMonths === opt.value ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            ₦{Number(opt.price).toLocaleString()} / month
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
                                        <input 
                                            type="checkbox" 
                                            id="terms" 
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer select-none">
                                            By ticking this box, I confirm that I have read, understood, and agree to the 
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }} 
                                                className="text-blue-600 hover:text-blue-800 font-bold mx-1 underline"
                                            >
                                                Terms and Conditions
                                            </button>
                                            governing the Pharmtech Inverter Multiconcept installment payment plan.
                                        </label>
                                    </div>

                                    <button 
                                        onClick={handleNext} 
                                        disabled={!name || !phone || !email || !address || !durationMonths || !acceptedTerms}
                                        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-300 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}

                            {/* Terms Modal Overlay */}
                            {showTerms && (
                                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
                                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                                            <h3 className="font-bold text-gray-900 text-lg">Terms and Conditions</h3>
                                            <button onClick={() => setShowTerms(false)} className="text-gray-500 hover:text-gray-700 bg-gray-200 p-1 rounded-full"><X className="w-5 h-5"/></button>
                                        </div>
                                        <div className="p-6 overflow-y-auto flex-1 text-sm text-gray-700 space-y-5 leading-relaxed">
                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">1. Introduction</h4>
                                                <p>These Terms and Conditions govern the installment payment plan offered by Pharmtech Inverter Multiconcept (“the Company”) for the purchase and installation of solar systems and related products.</p>
                                                <p className="mt-2">By opting for installment payment, the customer (“Client”) agrees to be bound by these terms.</p>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">2. Eligibility</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Installment payment is available only to verified customers.</li>
                                                    <li>The Company reserves the right to approve or decline any installment request.</li>
                                                    <li>Valid identification and proof of address may be required.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">3. Payment Structure</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>A minimum upfront deposit of 27.28% of the total cost is required before installation begins.</li>
                                                    <li>The remaining balance shall be paid in agreed installments over a period of 3-12 months.</li>
                                                    <li>A detailed payment schedule will be provided and agreed upon before project commencement.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">4. Pricing & Interest</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Prices of solar packages may vary based on market conditions.</li>
                                                    <li>Installment plans may attract a service charge/interest fee which will be clearly communicated upfront.</li>
                                                    <li>Failure to complete payments may result in additional charges.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">5. Installation Policy</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Installation will only commence after the required initial deposit has been received.</li>
                                                    <li>The system remains the property of the Company until full payment is completed.</li>
                                                    <li>The Company reserves the right to delay installation if agreed payment terms are not met.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">6. Ownership & Title</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Ownership of all installed equipment remains with Pharmtech Solar Services until full payment is made.</li>
                                                    <li>Upon full payment, ownership is transferred to the Client.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">7. Default & Repossession</h4>
                                                <p className="mb-2">If a Client fails to meet payment obligations:</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>A grace period of 3–7 days may be granted.</li>
                                                    <li>After the grace period, a late payment penalty of 5% of the month's payment may apply.</li>
                                                    <li>Continued default may result in disconnection or repossession of the solar system without refund of previous payments.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">8. Maintenance & Warranty</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Warranty covers the installation for 6 months after installation.</li>
                                                    <li>Warranty covers materials at given duration by the manufacturer.</li>
                                                    <li>Any damage due to misuse, tampering, or unauthorized modifications voids warranty.</li>
                                                    <li>Maintenance services may be offered separately.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">9. Cancellation Policy</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Orders cannot be canceled after installation has commenced.</li>
                                                    <li>Deposits made are non-refundable, except at the Company’s discretion.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">10. Client Responsibilities</h4>
                                                <p className="mb-2">The Client agrees to:</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Provide safe and secure installation access.</li>
                                                    <li>Avoid tampering with installed equipment.</li>
                                                    <li>Make payments on time as agreed.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">11. Liability Limitation</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>The Company shall not be liable for power output variations due to weather conditions or environmental factors.</li>
                                                    <li>The Company is not responsible for damages caused by external factors (e.g., fire, flood, theft).</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">12. Dispute Resolution</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Any disputes shall first be resolved amicably.</li>
                                                    <li>If unresolved, disputes shall be subject to the laws of the Federal Republic of Nigeria.</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 border-b pb-1 mb-2">13. Amendments</h4>
                                                <p>Pharmtech Inverter Multiconcept reserves the right to modify these terms at any time. Clients will be notified of any changes.</p>
                                            </div>
                                        </div>
                                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                                            <button onClick={() => setShowTerms(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg">Close</button>
                                            <button 
                                                onClick={() => { setAcceptedTerms(true); setShowTerms(false); }} 
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors"
                                            >
                                                Accept Terms
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700 pb-2 border-b">Guarantor Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Guarantor's Full Name</label>
                                            <input type="text" value={gName} onChange={e => setGName(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                                            <input type="tel" value={gPhone} onChange={e => setGPhone(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email Address</label>
                                            <input type="email" value={gEmail} onChange={e => setGEmail(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Relationship to You</label>
                                            <input type="text" value={gRelationship} onChange={e => setGRelationship(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Guarantor's Residential Address</label>
                                            <input type="text" value={gAddress} onChange={e => setGAddress(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex gap-4">
                                        <button onClick={handlePrev} className="px-6 py-3 bg-gray-100 rounded-lg font-bold text-gray-700">Back</button>
                                        <button 
                                            onClick={handleNext} 
                                            disabled={!gName || !gPhone || !gAddress}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-300"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700 pb-2 border-b">Document Uploads</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">NIN Number</label>
                                        <input type="text" value={ninNumber} onChange={e => setNinNumber(e.target.value)} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                                    </div>

                                    <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <label className="font-semibold text-blue-600 cursor-pointer">
                                            Upload Means of Identification (NIN Slip)
                                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => setIdDoc(e.target.files?.[0] || null)} />
                                        </label>
                                        {idDoc && <p className="text-sm mt-2 text-gray-600 flex items-center bg-gray-200 px-3 py-1 rounded-full">{idDoc.name}</p>}
                                    </div>

                                    <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <label className="font-semibold text-blue-600 cursor-pointer">
                                            Upload Proof of Address (Utility Bill / Statement)
                                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => setProofDoc(e.target.files?.[0] || null)} />
                                        </label>
                                        {proofDoc && <p className="text-sm mt-2 text-gray-600 flex items-center bg-gray-200 px-3 py-1 rounded-full">{proofDoc.name}</p>}
                                    </div>

                                    <div className="mt-6 flex gap-4">
                                        <button onClick={handlePrev} disabled={loading} className="px-6 py-3 bg-gray-100 rounded-lg font-bold text-gray-700 disabled:opacity-50">Back</button>
                                        <button 
                                            onClick={handleSubmitApplication} 
                                            disabled={!ninNumber || !idDoc || !proofDoc || loading}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-300 flex items-center justify-center gap-2"
                                        >
                                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {loading ? "Uploading Documents..." : "Submit & Proceed to Payment"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6 text-center py-8">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Application Received!</h3>
                                    <p className="text-gray-600 px-4">
                                        Your KYC documents have been securely uploaded. To complete your instalment agreement, please make the required down payment.
                                    </p>
                                    
                                    <div className="bg-gray-50 p-6 rounded-xl border mb-6 text-left">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Product:</span>
                                            <span className="font-semibold">{product.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Initial Down Payment:</span>
                                            <span className="font-bold text-green-600">₦{Number(product.instalment_down_payment).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className="text-gray-600">Instalment Plan:</span>
                                            <span className="font-semibold text-blue-700">{durationMonths} Months</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Monthly Payment:</span>
                                            <span className="font-bold text-blue-700">₦{Number(availableDurations.find(d => d.value === durationMonths)?.price || 0).toLocaleString()} / month</span>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <PaystackCheckout 
                                            amount={Number(product.instalment_down_payment)}
                                            email={email}
                                            phone={phone}
                                            location={address}
                                            deliveryDate="N/A (Instalment)"
                                            items={[]}
                                            userId={userId || ""}
                                            applicationId={applicationId}
                                            onSuccess={() => {
                                                alert("Payment successfully recorded! We will process your order and contact you shortly.");
                                                closeModal();
                                            }}
                                            onClose={() => {}}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
