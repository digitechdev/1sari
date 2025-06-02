# Loan Payment Charges

## Description
The Loan Payment Charges table tracks additional fees or charges associated with loan payments, such as late fees or service charges.

## Table Structure

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | SERIAL | Primary key for the charge entry |
| schedule_id | INTEGER | Foreign key linking to the specific payment schedule |
| charge_type | TEXT | Type of fee or charge (e.g., 'Late Fee', 'Service Fee') |
| amount | NUMERIC(15, 2) | Amount of this charge |
| description | TEXT | Why this charge was applied |
| added_by | UUID | User or admin who added the charge (references auth.users) |
| added_on | TIMESTAMPTZ | Timestamp when the charge was added |
| payment_id | INTEGER | Foreign key linking to the specific payment |
| loan_id | INTEGER | Redundant foreign key to help filter by loan |

## Indexes

| Index Name | Columns | Purpose |
| ---------- | ------- | ------- |
| idx_lpc_schedule_id | schedule_id | Optimize lookups by schedule |
| idx_loan_payment_charges_payment_id | payment_id | Optimize lookups by payment |
| idx_loan_payment_charges_loan_id | loan_id | Optimize lookups by loan |

## Relationships
- Each charge is associated with a specific payment schedule
- Each charge may be associated with a specific payment
- Each charge is associated with a specific loan
- Each charge is added by a specific user 