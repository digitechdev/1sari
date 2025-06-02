# User Roles and Permissions

This document describes the roles and permissions configured for the 1sari application.

## Roles

| Role | Description |
|------|-------------|
| admin | Full access to all features and settings, including user management. |
| loan_officer | Can create and manage loans, review applications, and generate reports. |
| collector | Can record payments, manage collection schedules, and update payment statuses. |
| borrower | Can view their own loans, payment schedules, and make online payments. |

## Permissions

### Loan Management
| Permission | Description |
|------------|-------------|
| loans:create | Allows creating new loans. |
| loans:read | Allows viewing loan details. |
| loans:update | Allows updating existing loans. |
| loans:delete | Allows deleting loans. |

### Borrower Management
| Permission | Description |
|------------|-------------|
| borrowers:create | Allows creating new borrower accounts. |
| borrowers:read | Allows viewing borrower details. |
| borrowers:update | Allows updating borrower information. |
| borrowers:delete | Allows deleting borrower accounts. |

### Payment Management
| Permission | Description |
|------------|-------------|
| payments:create | Allows recording new payments. |
| payments:read | Allows viewing payment details. |
| payments:update | Allows updating payment information. |
| payments:delete | Allows deleting payments. |

### Other Permissions
| Permission | Description |
|------------|-------------|
| reports:generate | Allows generating reports. |
| users:manage | Allows managing users and their roles. |
| settings:view | Allows viewing application settings. |
| settings:edit | Allows editing application settings. |

## Role-Permission Matrix

| Permission | admin | loan_officer | collector | borrower |
|------------|-------|--------------|-----------|----------|
| loans:create | ✅ | ✅ | ❌ | ❌ |
| loans:read | ✅ | ✅ | ✅ | ✅ |
| loans:update | ✅ | ✅ | ❌ | ❌ |
| loans:delete | ✅ | ❌ | ❌ | ❌ |
| borrowers:create | ✅ | ✅ | ❌ | ❌ |
| borrowers:read | ✅ | ✅ | ✅ | ❌ |
| borrowers:update | ✅ | ✅ | ❌ | ❌ |
| borrowers:delete | ✅ | ❌ | ❌ | ❌ |
| payments:create | ✅ | ❌ | ✅ | ✅ |
| payments:read | ✅ | ✅ | ✅ | ✅ |
| payments:update | ✅ | ❌ | ✅ | ❌ |
| payments:delete | ✅ | ❌ | ❌ | ❌ |
| reports:generate | ✅ | ✅ | ❌ | ❌ |
| users:manage | ✅ | ❌ | ❌ | ❌ |
| settings:view | ✅ | ✅ | ❌ | ❌ |
| settings:edit | ✅ | ❌ | ❌ | ❌ |

## Access Control Implementation

The role-permission system is implemented using a many-to-many relationship between roles and permissions. When a user is assigned a role, they automatically gain all permissions associated with that role.

### Role Assignment

Users are assigned roles through the `user_roles` table, which links users to their roles.

### Permission Checking

The application checks permissions before allowing access to features by:

1. Identifying the current user
2. Retrieving the user's assigned roles
3. Checking if any of those roles have the required permission
4. Granting or denying access accordingly

### Default Roles

New users are typically assigned the 'borrower' role by default, with admin users able to modify role assignments as needed. 