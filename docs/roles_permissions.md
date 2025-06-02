# Roles and Permissions

## Description
The roles and permissions system provides role-based access control (RBAC) for the application, allowing different user types to have different access levels.

## Tables

### Roles Table

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key for the role |
| name | TEXT | Unique name of the role |
| description | TEXT | Description of the role's purpose |

### Permissions Table

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key for the permission |
| name | TEXT | Unique name of the permission |
| description | TEXT | Description of what the permission allows |

### User Roles Table

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key for the user role assignment |
| user_id | UUID | Foreign key linking to auth.users |
| role_id | UUID | Foreign key linking to roles |

### Role Permissions Table

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key for the role permission assignment |
| role_id | UUID | Foreign key linking to roles |
| permission_id | UUID | Foreign key linking to permissions |

## Constraints

| Table | Constraint | Description |
| ----- | ---------- | ----------- |
| roles | name (UNIQUE) | Ensures role names are unique |
| permissions | name (UNIQUE) | Ensures permission names are unique |
| user_roles | (user_id, role_id) (UNIQUE) | Prevents duplicate user-role assignments |
| role_permissions | (role_id, permission_id) (UNIQUE) | Prevents duplicate role-permission assignments |

## Relationships
- Each user can have multiple roles
- Each role can have multiple permissions
- Each role can be assigned to multiple users
- Each permission can be assigned to multiple roles 