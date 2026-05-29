"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Upload, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  FileText,
  User,
  ShieldCheck
} from "lucide-react";

export default function ApprenticeshipPage() {
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    dob: "",
    age: "",
    gender: "",
    civilStatus: "",
    nationality: "Nigerian",
    religion: "",
    tin: "",
    homeAddress: "",
    cityMunicipality: "",
    zipCode: "",
    phone: "",
    email: "",

    // Emergency Contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyAddress: "",

    // Educational Background
    educationalQualification: "",
    educationalQualificationOther: "",
    schoolName: "",
    courseDepartment: "",
    yearGraduated: "",

    // Apprenticeship Position Applied For
    positionsApplied: [] as string[],
    positionAppliedOther: "",

    // Skills & Experience
    hasExperience: "no",
    experienceDescription: "",
    technicalSkills: [] as string[],
    technicalSkillsOther: "",
    computerLiteracy: "",

    // Signature
    signatureName: "",
    agreedToTerms: false,
  });

  // File Upload State
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [ninFile, setNinFile] = useState<File | null>(null);

  // Upload Statuses
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);

  // Services list matching mockup header
  const servicesList = [
    "Sales and Installation of Solar Wares",
    "Inverter Installation",
    "Battery Installations",
    "Solar Panel Installation",
    "CCTV & Security Systems",
    "Electric Fence Systems",
    "Street Light Installation",
    "Electrical Wiring & Maintenance",
    "Charge Controllers & Accessories",
    "Solar Fans & Appliances",
    "Maintenance & Repair Services",
    "General Solar Consultation"
  ];

  // Technical skills checkboxes
  const technicalSkillsList = [
    "Basic Electrical Knowledge",
    "Solar Panel Installation",
    "Inverter Installation",
    "Wiring / Cabling",
    "Battery Systems",
    "Troubleshooting",
    "CCTV Installation",
    "Security Systems"
  ];

  // Calculate age from DOB
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobValue = e.target.value;
    if (!dobValue) {
      setFormData(prev => ({ ...prev, dob: "", age: "" }));
      return;
    }

    const birthDate = new Date(dobValue);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }

    setFormData(prev => ({ 
      ...prev, 
      dob: dobValue, 
      age: computedAge >= 0 ? computedAge.toString() : "" 
    }));
  };

  // Handle simple changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle technical skills checkboxes
  const handleCheckboxChange = (skill: string) => {
    setFormData(prev => {
      const skills = [...prev.technicalSkills];
      if (skills.includes(skill)) {
        return { ...prev, technicalSkills: skills.filter(s => s !== skill) };
      } else {
        return { ...prev, technicalSkills: [...skills, skill] };
      }
    });
  };

  // Handle position applied checkboxes
  const handlePositionCheckboxChange = (pos: string) => {
    setFormData(prev => {
      const positions = [...prev.positionsApplied];
      if (positions.includes(pos)) {
        return { ...prev, positionsApplied: positions.filter(p => p !== pos) };
      } else {
        return { ...prev, positionsApplied: [...positions, pos] };
      }
    });
  };

  // File uploading helper
  const uploadFileToSupabase = async (file: File, folderName: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const fileName = `${Date.now()}_${uniqueId}.${fileExt}`;
    const filePath = `apprenticeships/${folderName}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(filePath, file, { cacheControl: "31536000", upsert: false });

    if (uploadError) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("kyc-documents")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setUploading(true);

    // Validations
    if (formData.positionsApplied.length === 0) {
      setErrorMsg("Please select at least one department/position you are applying for.");
      setUploading(false);
      return;
    }

    if (!formData.agreedToTerms) {
      setErrorMsg("You must read and agree to the terms and conditions.");
      setUploading(false);
      return;
    }

    if (!passportFile || !cvFile || !ninFile) {
      setErrorMsg("Please upload all three required documents: Passport Photograph, CV, and NIN Slip.");
      setUploading(false);
      return;
    }

    try {
      // 1. Upload files to storage bucket
      const passportUrl = await uploadFileToSupabase(passportFile, "passports");
      const cvUrl = await uploadFileToSupabase(cvFile, "cvs");
      const ninUrl = await uploadFileToSupabase(ninFile, "nins");

      // 2. Prepare payload
      const applicationPayload = {
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        suffix: formData.suffix || null,
        dob: formData.dob,
        age: parseInt(formData.age),
        gender: formData.gender,
        civil_status: formData.civilStatus,
        nationality: formData.nationality,
        religion: formData.religion,
        tin: formData.tin || null,
        home_address: formData.homeAddress,
        city_municipality: formData.cityMunicipality,
        zip_code: formData.zipCode || null,
        phone: formData.phone,
        email: formData.email,

        emergency_name: formData.emergencyName,
        emergency_relationship: formData.emergencyRelationship,
        emergency_phone: formData.emergencyPhone,
        emergency_address: formData.emergencyAddress,

        educational_qualification: formData.educationalQualification,
        educational_qualification_other: formData.educationalQualification === "Others" ? formData.educationalQualificationOther : null,
        school_name: formData.schoolName,
        course_department: formData.courseDepartment || null,
        year_graduated: formData.yearGraduated,

        positions_applied: formData.positionsApplied,
        position_applied_other: formData.positionsApplied.includes("Other") ? formData.positionAppliedOther : null,

        has_experience: formData.hasExperience === "yes",
        experience_description: formData.hasExperience === "yes" ? formData.experienceDescription : null,
        technical_skills: formData.technicalSkills,
        technical_skills_other: formData.technicalSkillsOther || null,
        computer_literacy: formData.computerLiteracy,

        passport_url: passportUrl,
        cv_url: cvUrl,
        nin_url: ninUrl,

        signature_name: formData.signatureName,
        agreed_to_terms: formData.agreedToTerms,
        status: "pending"
      };

      // 3. Save payload in DB
      const { data, error } = await supabase
        .from("apprenticeship_applications")
        .insert([applicationPayload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSuccessData(data);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(err.message || "An unexpected error occurred during submission. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Generate WhatsApp link
  const getWhatsAppLink = () => {
    if (!successData) return "";
    const phoneNum = "2348142111657";
    const displayPositions = successData.positions_applied?.map((p: string) => 
      p === "Other" && successData.position_applied_other 
        ? `Other (${successData.position_applied_other})` 
        : p
    ).join(", ") || "";
    const text = `Hello Pharmtech Inverter Multiconcept,

I have just completed my Apprenticeship Application Form online.
Here are my registration details:
• Name: ${successData.first_name} ${successData.last_name}
• Phone: ${successData.phone}
• Email: ${successData.email}
• Positions Applied: ${displayPositions}
• Age / Gender: ${successData.age} / ${successData.gender}

Please review my application. Thank you!`;
    return `https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
        
        {/* HEADER SECTION */}
        <div className="p-6 md:p-8 bg-white border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            
            {/* Logo and Branding */}
            <div className="flex items-center gap-4">
              <img 
                src="/logo.jpeg" 
                alt="PIM Logo" 
                className="h-20 w-auto object-contain shrink-0" 
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-green-800 tracking-tight leading-none">PHARMTECH</h1>
                <span className="text-xs md:text-sm font-semibold text-gray-500 tracking-widest block uppercase mt-1">INVERTER MULTICONCEPT</span>
              </div>
            </div>

            {/* Office Info card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs md:text-sm w-full md:w-auto shrink-0 space-y-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                <span>7, AlabiGold Shopping Complex, Arapaja Odo-Ona Kekere, Ibadan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-700 shrink-0" />
                <a href="tel:+2348142111657" className="hover:text-green-700">+234 814 211 1657</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-700 shrink-0" />
                <a href="mailto:info@pharmtechsolar.com" className="hover:text-green-700">info@pharmtechsolar.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-700 shrink-0" />
                <a href="https://www.pharmtechsolar.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-700">www.pharmtechsolar.com</a>
              </div>
            </div>

          </div>

          <div className="mt-8 border-t border-dashed border-gray-200 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 mb-3 text-center md:text-left">OUR SERVICES INCLUDE:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {servicesList.map((service, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-3.5 h-3.5 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">✓</span>
                  <span className="truncate" title={service}>{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TITLE BANNER */}
        <div className="bg-green-800 px-6 py-8 md:px-8 text-center text-white relative">
          <div className="absolute top-0 right-0 bottom-0 left-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-green-200 relative z-10" />
          <h2 className="text-3xl font-extrabold tracking-tight relative z-10">APPRENTICE APPLICATION FORM</h2>
          <p className="mt-2 text-green-100 text-sm max-w-2xl mx-auto relative z-10">
            Please fill out this form completely and accurately. All information provided will be treated confidentially and used strictly for apprentice selection and training purposes.
          </p>
        </div>

        {/* ERROR / WARNING ALERT */}
        {errorMsg && (
          <div className="m-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Registration Failed: </span>
              {errorMsg}
            </div>
          </div>
        )}

        {/* APPLICATION FORM */}
        {!successData ? (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
            
            {/* 1. PERSONAL INFORMATION */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-white text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-sm">1</span>
                PERSONAL INFORMATION
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="John" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Middle Name</label>
                  <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Alabi" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Doe" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Suffix</label>
                  <input type="text" name="suffix" value={formData.suffix} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="e.g. Jr., III" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dob" required value={formData.dob} onChange={handleDobChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Age (Auto)</label>
                  <input type="text" name="age" readOnly value={formData.age} className="w-full p-2.5 border rounded-lg bg-gray-100 text-gray-600 text-sm outline-none font-semibold cursor-not-allowed" placeholder="Select DOB" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Civil Status <span className="text-red-500">*</span></label>
                  <select name="civilStatus" required value={formData.civilStatus} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all">
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Nationality <span className="text-red-500">*</span></label>
                  <input type="text" name="nationality" required value={formData.nationality} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Religion <span className="text-red-500">*</span></label>
                  <input type="text" name="religion" required value={formData.religion} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Christianity / Islam" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">TIN (If Applicable)</label>
                  <input type="text" name="tin" value={formData.tin} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Taxpayer Identification No." />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Home Address <span className="text-red-500">*</span></label>
                  <input type="text" name="homeAddress" required value={formData.homeAddress} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Street Address, Block Name" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">City / Municipality <span className="text-red-500">*</span></label>
                    <input type="text" name="cityMunicipality" required value={formData.cityMunicipality} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Ibadan" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">ZIP Code</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="200213" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Mobile Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="e.g. 08142111657" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="john.doe@example.com" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. EMERGENCY CONTACT */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-white text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-sm">2</span>
                EMERGENCY CONTACT
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="emergencyName" required value={formData.emergencyName} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Guardian or Next of Kin Name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Relationship <span className="text-red-500">*</span></label>
                  <input type="text" name="emergencyRelationship" required value={formData.emergencyRelationship} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="e.g. Father, Mother, Spouse" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="emergencyPhone" required value={formData.emergencyPhone} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="e.g. 080XXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Home Address <span className="text-red-500">*</span></label>
                <input type="text" name="emergencyAddress" required value={formData.emergencyAddress} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Emergency Contact Full Address" />
              </div>
            </div>

            {/* 3. EDUCATIONAL BACKGROUND */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-white text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-sm">3</span>
                EDUCATIONAL BACKGROUND
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Highest Educational Qualification <span className="text-red-500">*</span></label>
                  <select name="educationalQualification" required value={formData.educationalQualification} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all">
                    <option value="">Select Qualification</option>
                    <option value="Primary School">Primary School</option>
                    <option value="Secondary School">Secondary School</option>
                    <option value="OND / HND">OND / HND</option>
                    <option value="B.Sc / B.Tech">B.Sc / B.Tech</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                {formData.educationalQualification === "Others" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Specify Other Qualification <span className="text-red-500">*</span></label>
                    <input type="text" name="educationalQualificationOther" required value={formData.educationalQualificationOther} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Enter qualification" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Name of School <span className="text-red-500">*</span></label>
                  <input type="text" name="schoolName" required value={formData.schoolName} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="University, Poly or High School" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Course / Department</label>
                  <input type="text" name="courseDepartment" value={formData.courseDepartment} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="e.g. Electrical Engineering" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Year Graduated / Level <span className="text-red-500">*</span></label>
                  <input type="text" name="yearGraduated" required value={formData.yearGraduated} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="e.g. 2024" />
                </div>
              </div>
            </div>

            {/* 4. APPRENTICESHIP POSITION APPLIED FOR */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-white text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-sm">4</span>
                APPRENTICESHIP POSITION APPLIED FOR
              </h3>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Please select the department(s) you are applying for: <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Solar Panel Installation Apprentice",
                    "Inverter Technician Apprentice",
                    "Electrical Installation Apprentice",
                    "Battery Systems Apprentice",
                    "CCTV / Security Systems Apprentice",
                    "Technical Support Apprentice",
                    "Other"
                  ].map((pos) => (
                    <label key={pos} className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-200 hover:bg-green-50 transition-all cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="positionsApplied" 
                        value={pos} 
                        checked={formData.positionsApplied.includes(pos)} 
                        onChange={() => handlePositionCheckboxChange(pos)} 
                        className="w-4 h-4 text-green-700 focus:ring-green-600 rounded" 
                      />
                      <span className="text-sm font-semibold text-gray-700">{pos}</span>
                    </label>
                  ))}
                </div>

                {formData.positionsApplied.includes("Other") && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Specify Other Position <span className="text-red-500">*</span></label>
                    <input type="text" name="positionAppliedOther" required value={formData.positionAppliedOther} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Enter department" />
                  </div>
                )}
              </div>
            </div>

            {/* 5. SKILLS & EXPERIENCE */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-white text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-sm">5</span>
                SKILLS & EXPERIENCE
              </h3>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Do you have any previous experience or training? <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-sm">
                    <input type="radio" name="hasExperience" value="yes" checked={formData.hasExperience === "yes"} onChange={handleChange} className="w-4 h-4 text-green-600 focus:ring-green-500" /> Yes
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-sm">
                    <input type="radio" name="hasExperience" value="no" checked={formData.hasExperience === "no"} onChange={handleChange} className="w-4 h-4 text-green-600 focus:ring-green-500" /> No
                  </label>
                </div>

                {formData.hasExperience === "yes" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Explain Briefly <span className="text-red-500">*</span></label>
                    <textarea name="experienceDescription" required rows={3} value={formData.experienceDescription} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Describe your previous experience or training..."></textarea>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Technical Skills (Tick all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {technicalSkillsList.map((skill) => (
                    <label key={skill} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input 
                        type="checkbox" 
                        checked={formData.technicalSkills.includes(skill)} 
                        onChange={() => handleCheckboxChange(skill)} 
                        className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="text-xs font-medium text-gray-600">{skill}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Other Technical Skills</label>
                  <input type="text" name="technicalSkillsOther" value={formData.technicalSkillsOther} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all" placeholder="Cabling, splicing, mechanical work, etc." />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Computer Literacy <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  {["Basic", "Intermediate", "Advanced"].map((level) => (
                    <label key={level} className="flex items-center gap-1.5 cursor-pointer font-semibold text-sm">
                      <input 
                        type="radio" 
                        name="computerLiteracy" 
                        value={level} 
                        checked={formData.computerLiteracy === level} 
                        onChange={handleChange} 
                        required
                        className="w-4 h-4 text-green-600 focus:ring-green-500" 
                      /> 
                      {level}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. DOCUMENTS UPLOAD */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-white text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-sm">6</span>
                DOCUMENTS UPLOAD
              </h3>
              <p className="text-xs text-gray-500 leading-normal -mt-2">
                Please upload clear copies of the following documents. Formats allowed: PDF, PNG, JPG, JPEG (Max size: 5MB per file).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Passport Upload */}
                <div className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-center">
                  <Upload className="w-8 h-8 text-green-700 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Passport Photograph <span className="text-red-500">*</span></h4>
                  <p className="text-[10px] text-gray-400 mb-3">Recent headshot</p>
                  <label className="inline-block bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                    {passportFile ? "Change File" : "Choose File"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      required
                      onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                  </label>
                  {passportFile && (
                    <div className="mt-2 text-xs font-semibold text-green-700 truncate max-w-full" title={passportFile.name}>
                      ✓ {passportFile.name}
                    </div>
                  )}
                </div>

                {/* CV Upload */}
                <div className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-center">
                  <FileText className="w-8 h-8 text-green-700 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Curriculum Vitae (CV) <span className="text-red-500">*</span></h4>
                  <p className="text-[10px] text-gray-400 mb-3">Resume or profile</p>
                  <label className="inline-block bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                    {cvFile ? "Change File" : "Choose File"}
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,image/*" 
                      required
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                  </label>
                  {cvFile && (
                    <div className="mt-2 text-xs font-semibold text-green-700 truncate max-w-full" title={cvFile.name}>
                      ✓ {cvFile.name}
                    </div>
                  )}
                </div>

                {/* NIN Upload */}
                <div className="p-4 border border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-all text-center">
                  <ShieldCheck className="w-8 h-8 text-green-700 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gray-700 mb-1">NIN Slip <span className="text-red-500">*</span></h4>
                  <p className="text-[10px] text-gray-400 mb-3">Front and Back</p>
                  <label className="inline-block bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                    {ninFile ? "Change File" : "Choose File"}
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      required
                      onChange={(e) => setNinFile(e.target.files?.[0] || null)}
                      className="hidden" 
                    />
                  </label>
                  {ninFile && (
                    <div className="mt-2 text-xs font-semibold text-green-700 truncate max-w-full" title={ninFile.name}>
                      ✓ {ninFile.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 7. AGREEMENT & CERTIFICATION */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-white text-green-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shadow-sm">7</span>
                AGREEMENT & CERTIFICATION
              </h3>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm text-gray-600 leading-relaxed space-y-3">
                <p>
                  I hereby certify that all information provided in this application form is true and complete to the best of my knowledge. I understand that any false information may disqualify me from this apprenticeship program.
                </p>
                <p>
                  I agree to abide by the rules and regulations of Pharmtech Inverter Multiconcept throughout the duration of the apprenticeship program.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    required
                    checked={formData.agreedToTerms} 
                    onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))} 
                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300 mt-1"
                  />
                  <span className="text-sm font-semibold text-gray-700 leading-tight">
                    I have read and agreed to the terms and conditions. <span className="text-red-500">*</span>
                  </span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Applicant's Signature (Type Full Name) <span className="text-red-500">*</span></label>
                    <input type="text" name="signatureName" required value={formData.signatureName} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-gray-50 focus:bg-white transition-all font-serif italic" placeholder="Your Digital Signature" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Date of Application</label>
                    <input type="text" readOnly value={new Date().toLocaleDateString()} className="w-full p-2.5 border rounded-lg bg-gray-100 text-gray-500 text-sm outline-none font-semibold cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-green-800 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application & Uploading Files...
                  </>
                ) : (
                  <>
                    Submit Application Form
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* SUCCESS STATE */
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-12 h-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-green-800">Application Submitted!</h2>
              <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
                Thank you, <span className="font-bold text-gray-800">{successData.first_name} {successData.last_name}</span>. Your application for <span className="font-bold text-gray-800">{successData.positions_applied?.map((p: string) => p === "Other" && successData.position_applied_other ? `Other (${successData.position_applied_other})` : p).join(", ")}</span> has been received and saved securely in our database.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 max-w-lg mx-auto text-left text-sm space-y-2">
              <h4 className="font-bold text-gray-800 mb-3 border-b pb-1">Application Details Snapshot:</h4>
              <div><span className="text-gray-500 font-medium">Application ID:</span> <span className="font-mono text-xs">{successData.id}</span></div>
              <div><span className="text-gray-500 font-medium">Email:</span> {successData.email}</div>
              <div><span className="text-gray-500 font-medium">Phone:</span> {successData.phone}</div>
              <div><span className="text-gray-500 font-medium">Date Received:</span> {new Date(successData.created_at).toLocaleDateString()}</div>
              <div><span className="text-gray-500 font-medium">Status:</span> <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 font-bold rounded-full text-xs uppercase">Pending Review</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto pt-4">
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Fast-Track via WhatsApp
              </a>
              <button 
                onClick={() => {
                  setSuccessData(null);
                  setFormData({
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    suffix: "",
                    dob: "",
                    age: "",
                    gender: "",
                    civilStatus: "",
                    nationality: "Nigerian",
                    religion: "",
                    tin: "",
                    homeAddress: "",
                    cityMunicipality: "",
                    zipCode: "",
                    phone: "",
                    email: "",
                    emergencyName: "",
                    emergencyRelationship: "",
                    emergencyPhone: "",
                    emergencyAddress: "",
                    educationalQualification: "",
                    educationalQualificationOther: "",
                    schoolName: "",
                    courseDepartment: "",
                    yearGraduated: "",
                    positionsApplied: [],
                    positionAppliedOther: "",
                    hasExperience: "no",
                    experienceDescription: "",
                    technicalSkills: [],
                    technicalSkillsOther: "",
                    computerLiteracy: "",
                    signatureName: "",
                    agreedToTerms: false,
                  });
                  setPassportFile(null);
                  setCvFile(null);
                  setNinFile(null);
                }}
                className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-3 rounded-xl transition-all"
              >
                Apply Another Person
              </button>
            </div>
          </div>
        )}

        {/* FOOTER SECTION */}
        <div className="bg-gray-900 px-6 py-6 text-center text-gray-400 text-xs border-t border-gray-800">
          <p className="font-bold text-gray-200 mb-1 tracking-wider">SAFE. RELIABLE. SUSTAINABLE.</p>
          <p className="mb-2">Your Partner in Clean and Intelligent Energy Solutions.</p>
          <p>&copy; {new Date().getFullYear()} Pharmtech Inverter Multiconcept. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
