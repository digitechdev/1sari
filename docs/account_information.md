# Account Information

## Description
The Account Information table stores borrower details including personal information, contact details, and business information.

## Table Structure

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | SERIAL | Primary key for the account information entry |
| name_of_borrower | TEXT | Full name of the primary borrower |
| provider_subject_no | TEXT | Provider-assigned subject number |
| gender | TEXT | Gender of the borrower (e.g., M, F, Other) |
| civil_status | TEXT | Civil status of the borrower (e.g., Single, Married, Widowed) |
| type_of_id | TEXT | Type of identification document presented |
| birthday_borrower | TEXT | Borrower's date of birth (stored as text) |
| age | TEXT | Borrower's age (stored as text) |
| mothers_maiden_name_borrower | TEXT | Mother's maiden name for security/verification |
| name_of_co_borrower_maker | TEXT | Full name of the co-borrower or co-maker, if any |
| security_collateral | TEXT | Type of security or collateral provided |
| mode_of_payment | TEXT | Preferred or actual mode of payment |
| store_name | TEXT | Name of the associated store or business |
| residence_address | TEXT | Full residence address of the borrower |
| length_of_stay_in_residence | TEXT | Duration of stay at the current residence address |
| store_address | TEXT | Full address of the store or business |
| area | TEXT | Geographical area or region of the store/borrower |
| contact_no_borrower | TEXT | Borrower's contact phone number(s) |
| classification | TEXT | Account tier or classification |
| store_category | TEXT | Category of the store or business |
| account_relationship_officer | TEXT | Name of the assigned Account Relationship Officer (ARO) |
| retail_partner | TEXT | Associated retail partner, if any |
| created_at | TIMESTAMPTZ | Timestamp when the record was created |

## Indexes

| Index Name | Columns | Purpose |
| ---------- | ------- | ------- |
| idx_ai_borrower_name | name_of_borrower | Optimize lookups by borrower name |
| idx_ai_provider_subject_no | provider_subject_no | Optimize lookups by provider subject number |
| idx_ai_area | area | Optimize lookups by geographical area |
| idx_ai_classification | classification | Optimize lookups by account classification |
| idx_ai_aro | account_relationship_officer | Optimize lookups by relationship officer |

## Relationships
- This table serves as the foundation for loans, with each loan being associated with a borrower from this table. 