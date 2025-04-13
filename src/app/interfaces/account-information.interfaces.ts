import { Gender } from '../enums/gender.enum';
import { CivilStatus } from '../enums/civil-status.enum';
import { AccountClassification } from '../enums/account-classification.enum';

/**
 * Represents the structure of a record in the public.account_information table.
 */
export interface AccountInformation {
  id: number; // SERIAL PRIMARY KEY
  name_of_borrower: string | null; // TEXT
  provider_subject_no: string | null; // TEXT
  gender: Gender | null; // TEXT -> Mapped to Gender enum
  civil_status: CivilStatus | null; // TEXT -> Mapped to CivilStatus enum
  type_of_id: string | null; // TEXT
  birthday_borrower: string | null; // TEXT (Consider converting to Date object in application logic)
  age: string | null; // TEXT (Consider converting to number in application logic)
  mothers_maiden_name_borrower: string | null; // TEXT
  name_of_co_borrower_maker: string | null; // TEXT
  security_collateral: string | null; // TEXT
  mode_of_payment: string | null; // TEXT
  store_name: string | null; // TEXT
  residence_address: string | null; // TEXT
  length_of_stay_in_residence: string | null; // TEXT
  store_address: string | null; // TEXT
  area: string | null; // TEXT
  contact_no_borrower: string | null; // TEXT
  classification: AccountClassification | null; // TEXT -> Mapped to AccountClassification enum
  store_category: string | null; // TEXT
  account_relationship_officer: string | null; // TEXT
  retail_partner: string | null; // TEXT
  created_at?: string; // TIMESTAMPTZ DEFAULT NOW()
} 