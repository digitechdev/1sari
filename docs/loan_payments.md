# Loan Payments

## Description
The Loan Payments table records actual payments made by borrowers against their scheduled loan payments.

## Table Structure

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | SERIAL | Primary key for the payment entry |
| schedule_id | INTEGER | Foreign key linking to the specific payment schedule |
| loan_id | INTEGER | Redundant foreign key to help filter by loan |
| amount | NUMERIC(15, 2) | Amount paid by the borrower |
| total_amount | NUMERIC(15, 2) | Total payment amount including fees |
| payment_date | DATE | Date the payment was made (defaults to current date) |
| method | TEXT | Payment method (e.g., Cash, GCash, Bank Transfer) |
| reference | TEXT | Reference number (e.g., receipt or transaction ID) |
| notes | TEXT | Optional notes from user or collector |
| recorded_by | UUID | User who recorded the payment (references auth.users) |
| created_at | TIMESTAMPTZ | Timestamp when the record was created |
| payment_type | TEXT | Type of payment: regular, principal, interest, restructured, or other |

## Indexes

| Index Name | Columns | Purpose |
| ---------- | ------- | ------- |
| idx_loan_payments_schedule_id | schedule_id | Optimize lookups by payment schedule |
| idx_loan_payments_loan_id | loan_id | Optimize lookups by loan |
| idx_loan_payments_payment_type | payment_type | Optimize lookups by payment type |

## Constraints

| Constraint Name | Type | Description |
| --------------- | ---- | ----------- |
| chk_loan_payments_payment_type | Check | Ensures payment_type is one of: 'regular', 'principal', 'interest', 'restructured', 'other' |

## Relationships
- Each payment is associated with a specific payment schedule
- Each payment is associated with a specific loan
- A payment may have one or more charges associated with it
- A payment is recorded by a specific user 