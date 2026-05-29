-- Create apprenticeship_applications table matching the PDF form
CREATE TABLE IF NOT EXISTS public.apprenticeship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Application Metadata
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- 1. Personal Information
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    suffix TEXT, -- Jr., Sr., III, etc.
    dob DATE NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL, -- Male, Female, Other
    civil_status TEXT NOT NULL, -- Single, Married, Divorced, Widowed, etc.
    nationality TEXT NOT NULL,
    religion TEXT NOT NULL,
    tin TEXT, -- TIN (if applicable)
    home_address TEXT NOT NULL,
    city_municipality TEXT NOT NULL,
    zip_code TEXT,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    
    -- 2. Emergency Contact
    emergency_name TEXT NOT NULL,
    emergency_relationship TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    emergency_address TEXT NOT NULL,
    
    -- 3. Educational Background
    educational_qualification TEXT NOT NULL, -- Primary School, Secondary School, OND / HND, B.Sc / B.Tech, Others
    educational_qualification_other TEXT,
    school_name TEXT NOT NULL,
    course_department TEXT,
    year_graduated TEXT NOT NULL,
    
    -- 4. Apprenticeship Positions Applied For
    positions_applied TEXT[] DEFAULT '{}'::TEXT[] NOT NULL, -- Array of positions: Solar Panel Installation, Inverter Technician, Electrical Installation, Battery Systems, CCTV / Security Systems, Technical Support, Other
    position_applied_other TEXT,
    
    -- 5. Skills & Experience
    has_experience BOOLEAN DEFAULT false NOT NULL,
    experience_description TEXT,
    technical_skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL, -- Array of skills
    technical_skills_other TEXT,
    computer_literacy TEXT NOT NULL, -- Basic, Intermediate, Advanced
    
    -- 6. Documents Upload (URLs from Supabase Storage)
    passport_url TEXT NOT NULL,
    cv_url TEXT NOT NULL,
    nin_url TEXT NOT NULL,
    
    -- 7. Agreement & Certification
    signature_name TEXT NOT NULL,
    agreed_to_terms BOOLEAN DEFAULT false NOT NULL,
    
    -- FOR OFFICE USE ONLY (Admin only editable)
    office_date_received DATE,
    office_received_by TEXT,
    office_interview_schedule TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'qualified', 'not_qualified', 'on_hold', 'selected'
    office_remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.apprenticeship_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (clean setup)
DROP POLICY IF EXISTS "Allow public inserts" ON public.apprenticeship_applications;
DROP POLICY IF EXISTS "Allow admins full access" ON public.apprenticeship_applications;

-- Policy: Allow public users to submit applications
CREATE POLICY "Allow public inserts" 
ON public.apprenticeship_applications 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy: Allow admins full access to applications
CREATE POLICY "Allow admins full access" 
ON public.apprenticeship_applications 
FOR ALL 
TO authenticated 
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- MIGRATION PATH FOR EXISTING TABLES:
-- If you have already created the table, run the following SQL commands to update the schema:
-- ALTER TABLE public.apprenticeship_applications DROP COLUMN IF EXISTS position_applied;
-- ALTER TABLE public.apprenticeship_applications ADD COLUMN IF NOT EXISTS positions_applied TEXT[] DEFAULT '{}'::TEXT[] NOT NULL;
