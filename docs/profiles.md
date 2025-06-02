# Profiles

## Description
The Profiles table stores public profile information for each user, linking to the Supabase authentication system.

## Table Structure

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key linking to auth.users |
| email | TEXT | User's email address (unique) |
| full_name | TEXT | User's full name |
| role | TEXT | User role for authorization purposes (defaults to 'viewer') |
| created_at | TIMESTAMPTZ | Timestamp when the record was created |
| updated_at | TIMESTAMPTZ | Timestamp when the record was last updated |

## Row Level Security (RLS) Policies

| Policy Name | Operation | Description |
| ----------- | --------- | ----------- |
| Users can view their own profile | SELECT | Allows users to view their own profile |
| Users can update their own profile | UPDATE | Allows users to update their own profile |
| Authenticated users can view all profiles | SELECT | Allows authenticated users to view all profiles |
| Users can insert their own profile | INSERT | Allows users to insert their own profile |

## Triggers

| Trigger Name | Event | Function | Description |
| ------------ | ----- | -------- | ----------- |
| on_profile_update | BEFORE UPDATE | handle_profile_update() | Updates the updated_at timestamp |

## Relationships
- Each profile is linked to a specific user in the auth.users table
- A profile may be associated with multiple loan payments (as the recorder)
- A profile may be associated with multiple loan payment charges (as the adder) 