"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import PaystackCheckout from "./PaystackCheckout";

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

            // Insert Application
            const { data, error } = await supabase.from("instalment_applications").insert({
                product_id: product.id,
                user_id: userId || null,
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
                                    <button 
                                        onClick={handleNext} 
                                        disabled={!name || !phone || !email || !address}
                                        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold disabled:bg-gray-300"
                                    >
                                        Next
                                    </button>
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
