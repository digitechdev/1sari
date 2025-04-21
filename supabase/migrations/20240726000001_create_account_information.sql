-- Section 1: Create the table structure based on seed.sql columns
CREATE TABLE public.account_information (
    id SERIAL PRIMARY KEY,
    name_of_borrower TEXT NULL,
    provider_subject_no TEXT NULL,
    gender TEXT NULL, -- Consider limiting values with CHECK constraint later if needed
    civil_status TEXT NULL,
    type_of_id TEXT NULL,
    birthday_borrower TEXT NULL, -- Consider DATE type if data format is consistent
    age TEXT NULL, -- Consider INTEGER type if data format is consistent
    mothers_maiden_name_borrower TEXT NULL,
    name_of_co_borrower_maker TEXT NULL,
    security_collateral TEXT NULL,
    mode_of_payment TEXT NULL,
    store_name TEXT NULL,
    residence_address TEXT NULL,
    length_of_stay_in_residence TEXT NULL,
    store_address TEXT NULL,
    area TEXT NULL,
    contact_no_borrower TEXT NULL,
    classification TEXT NULL,
    store_category TEXT NULL,
    account_relationship_officer TEXT NULL,
    retail_partner TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
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
-- Ensure index names are unique if they were created before
CREATE INDEX IF NOT EXISTS idx_ai_borrower_name ON public.account_information (name_of_borrower);
CREATE INDEX IF NOT EXISTS idx_ai_provider_subject_no ON public.account_information (provider_subject_no);
CREATE INDEX IF NOT EXISTS idx_ai_area ON public.account_information (area);
CREATE INDEX IF NOT EXISTS idx_ai_classification ON public.account_information (classification);
CREATE INDEX IF NOT EXISTS idx_ai_aro ON public.account_information (account_relationship_officer); 