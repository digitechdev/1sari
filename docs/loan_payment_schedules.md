# Loan Payment Schedules

## Description
The Loan Payment Schedules table tracks the expected payment schedule for each loan, including due dates, amounts, and payment status.

## Table Structure

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | SERIAL | Primary key for the payment schedule entry |
| loan_id | INTEGER | Foreign key linking to the specific loan |
| period_number | INTEGER | The installment number (e.g., 1, 2, 3, ...) |
| due_date | DATE | The date the payment is due |
| amount_due | NUMERIC(15, 2) | The total amount scheduled to be paid for this period |
| principal_paid | NUMERIC(15, 2) | Portion of the payment allocated to principal for this period |
| interest_paid | NUMERIC(15, 2) | Portion of the payment allocated to interest for this period |
| outstanding_balance | NUMERIC(15, 2) | Remaining loan balance after this scheduled payment is applied |
| status | TEXT | Status of the payment installment (e.g., Pending, Paid, Overdue) |
| created_at | TIMESTAMPTZ | Timestamp when the record was created |

## Indexes

| Index Name | Columns | Purpose |
| ---------- | ------- | ------- |
| idx_lps_loan_id | loan_id | Optimize lookups by loan |
| idx_lps_due_date | due_date | Optimize lookups by due date |
| idx_lps_status | status | Optimize lookups by payment status |

## Relationships
- Each payment schedule is associated with a specific loan
- A payment schedule may have one or more actual loan payments
- A payment schedule may have one or more charges (like late fees) 