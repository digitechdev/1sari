-- Section 1: Create the table structure
CREATE TABLE public.account_information (
    id SERIAL PRIMARY KEY, -- Or use UUID: id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
    name_of_borrower TEXT,
    provider_subject_no TEXT,
    gender TEXT,
    civil_status TEXT,
    type_of_id TEXT,
    birthday_borrower TEXT, -- Consider DATE type if data exists and is needed
    age TEXT, -- Consider INTEGER type if data exists and is needed
    mothers_maiden_name_borrower TEXT,
    name_of_co_borrower_maker TEXT,
    security_collateral TEXT,
    mode_of_payment TEXT,
    store_name TEXT,
    residence_address TEXT,
    length_of_stay_in_residence TEXT,
    store_address TEXT,
    area TEXT,
    contact_no_borrower TEXT,
    classification TEXT,
    store_category TEXT,
    account_relationship_officer TEXT,
    retail_partner TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() -- Optional: track insertion time
);

-- Section 2: Optional - Add comments to columns for better schema understanding in Supabase UI
COMMENT ON COLUMN public.account_information.name_of_borrower IS 'Full name of the primary borrower';
COMMENT ON COLUMN public.account_information.provider_subject_no IS 'Provider-assigned subject number';
COMMENT ON COLUMN public.account_information.gender IS 'Gender of the borrower (e.g., M, F, Other)';
COMMENT ON COLUMN public.account_information.civil_status IS 'Civil status of the borrower (e.g., Single, Married, Widowed)';
COMMENT ON COLUMN public.account_information.type_of_id IS 'Type of identification document presented';
COMMENT ON COLUMN public.account_information.birthday_borrower IS 'Borrower''s date of birth (stored as text)';
COMMENT ON COLUMN public.account_information.age IS 'Borrower''s age (stored as text)';
COMMENT ON COLUMN public.account_information.mothers_maiden_name_borrower IS 'Mother''s maiden name for security/verification';
COMMENT ON COLUMN public.account_information.name_of_co_borrower_maker IS 'Full name of the co-borrower or co-maker, if any';
COMMENT ON COLUMN public.account_information.security_collateral IS 'Type of security or collateral provided';
COMMENT ON COLUMN public.account_information.mode_of_payment IS 'Preferred or actual mode of payment';
COMMENT ON COLUMN public.account_information.store_name IS 'Name of the associated store or business';
COMMENT ON COLUMN public.account_information.residence_address IS 'Full residence address of the borrower';
COMMENT ON COLUMN public.account_information.length_of_stay_in_residence IS 'Duration of stay at the current residence address';
COMMENT ON COLUMN public.account_information.store_address IS 'Full address of the store or business';
COMMENT ON COLUMN public.account_information.area IS 'Geographical area or region of the store/borrower';
COMMENT ON COLUMN public.account_information.contact_no_borrower IS 'Borrower''s contact phone number(s)';
COMMENT ON COLUMN public.account_information.classification IS 'Account tier or classification';
COMMENT ON COLUMN public.account_information.store_category IS 'Category of the store or business';
COMMENT ON COLUMN public.account_information.account_relationship_officer IS 'Name of the assigned Account Relationship Officer (ARO)';
COMMENT ON COLUMN public.account_information.retail_partner IS 'Associated retail partner, if any';
COMMENT ON COLUMN public.account_information.created_at IS 'Timestamp when the record was created';

-- Section 3: Optional - Add indexes for frequently queried columns to improve performance
CREATE INDEX IF NOT EXISTS idx_borrower_name ON public.account_information (name_of_borrower);
CREATE INDEX IF NOT EXISTS idx_provider_subject_no ON public.account_information (provider_subject_no);
CREATE INDEX IF NOT EXISTS idx_area ON public.account_information (area);
CREATE INDEX IF NOT EXISTS idx_classification ON public.account_information (classification);
CREATE INDEX IF NOT EXISTS idx_aro ON public.account_information (account_relationship_officer); 