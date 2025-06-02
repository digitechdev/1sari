# Database Schema Documentation

This folder contains documentation for the database schema of the 1sari application, based on the Supabase migration files.

## Entities

- [Account Information](./account_information.md) - Stores borrower details including personal information
- [Loans](./loans.md) - Records loan transactions with terms and conditions
- [Loan Payment Schedules](./loan_payment_schedules.md) - Tracks expected payment schedules for loans
- [Loan Payments](./loan_payments.md) - Records actual payments made by borrowers
- [Loan Payment Charges](./loan_payment_charges.md) - Tracks additional fees or charges for loan payments
- [Profiles](./profiles.md) - Stores user profile information linked to Supabase auth
- [Roles and Permissions](./roles_permissions.md) - Manages role-based access control
- [Sales](./sales.md) - Records items sold to borrowers
- [User Roles and Permissions](./user_roles_and_permissions.md) - Documents user roles and their permissions

## Entity Relationship Diagram

```
account_information  1 ────────┐
                               │
                               │ borrower_id
                               │
                               ▼
                            loans ◄─────────┐
                             │ │            │
                     loan_id │ │            │ parent_loan_id
                             │ │            │
                             ▼ └────────────┘
┌────────────────────────────┐
│                            │
│    loan_payment_schedules  │
│                            │
└─────────────┬──────────────┘
              │
     schedule_id
              │
              ▼
       loan_payments ──────────┐
              │                │
        payment_id             │ loan_id
              │                │
              ▼                │
   loan_payment_charges ◄──────┘
              
              
        auth.users
             │
             │ id
             │
             ▼
         profiles
             │
             │ user_id
             │
             ▼
        user_roles
             │
             │ role_id
             │
             ▼
           roles
             │
             │ role_id
             │
             ▼
      role_permissions
             │
             │ permission_id
             │
             ▼
        permissions


           loans
             │
             │ loan_id
             │
             ▼
           sales
```

## Migration History

The database schema has evolved through multiple migrations:

1. Initial creation of core tables (account_information, loans, loan_payment_schedules)
2. Addition of payment tracking (loan_payments, loan_payment_charges)
3. User management and authorization (profiles, roles, permissions)
4. Sales and item tracking
5. Refinements to support restructured loans and payment types

## Database Features

- Foreign key constraints ensure referential integrity
- Indexes on frequently queried columns optimize performance
- Row-level security policies protect sensitive data
- Triggers automate timestamp updates
- Role-based access control manages user permissions 