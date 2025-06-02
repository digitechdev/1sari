# Loans

## Description
The Loans table stores information about loan transactions, including principal amounts, interest rates, tenure, and status information.

## Table Structure

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | BIGINT | Primary key for the loan entry |
| borrower_id | INTEGER | Foreign key linking to the borrower in account_information |
| co_borrower_id | INTEGER | Foreign key linking to the co-borrower, if any (nullable) |
| co_maker_id | INTEGER | Foreign key linking to the co-maker, if any (nullable) |
| store_name | TEXT | Name of the associated store |
| principal | NUMERIC(15, 2) | The principal amount of the loan |
| interest_rate | NUMERIC(8, 6) | Interest rate stored as a decimal (e.g., 0.03 for 3%) |
| tenure_in_months | INTEGER | The duration of the loan in months |
| loan_release_date | DATE | The date the loan was disbursed or started |
| interest_method | TEXT | Method used for interest calculation (e.g., straight, diminishing) |
| loan_period | TEXT | Frequency of loan period (e.g., Daily, Monthly) |
| repayment_period | INTEGER | Number of repayments expected |
| disbursement_method | TEXT | How the loan amount was disbursed (e.g., Gcash, Bank) |
| status | TEXT | Current status of the loan (e.g., Pending, Active, Paid, Defaulted) |
| application_date | DATE | Date the loan application was submitted |
| approval_date | DATE | Date the loan application was approved |
| purpose | TEXT | Purpose of the loan |
| notes | TEXT | Additional notes about the loan |
| created_at | TIMESTAMPTZ | Timestamp when the record was created |
| parent_loan_id | BIGINT | Foreign key reference to a parent loan (for restructured loans) |

## Indexes

| Index Name | Columns | Purpose |
| ---------- | ------- | ------- |
| idx_loans_borrower_id | borrower_id | Optimize lookups by borrower |
| idx_loans_status | status | Optimize lookups by loan status |
| idx_loans_loan_release_date | loan_release_date | Optimize lookups by release date |
| idx_loans_parent_loan_id | parent_loan_id | Optimize lookups for restructured loans |

## Relationships
- Each loan is associated with a borrower from the account_information table
- A loan may have a parent loan (for restructured loans)
- A loan may have multiple loan payment schedules
- A loan may have multiple loan payments
- A loan may have multiple sales items 