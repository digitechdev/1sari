import { Injectable, signal, computed } from '@angular/core';

export interface Permission {
  name: string;
  description: string;
  category: string;
}

export interface Role {
  name: string;
  description: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  // Roles data from the markdown file
  private roles = signal<Role[]>([
    {
      name: 'admin',
      description: 'Full access to all features and settings, including user management.',
      permissions: [
        'loans:create', 'loans:read', 'loans:update', 'loans:delete',
        'borrowers:create', 'borrowers:read', 'borrowers:update', 'borrowers:delete',
        'payments:create', 'payments:read', 'payments:update', 'payments:delete',
        'reports:generate', 'users:manage', 'settings:view', 'settings:edit'
      ]
    },
    {
      name: 'loan_officer',
      description: 'Can create and manage loans, review applications, and generate reports.',
      permissions: [
        'loans:create', 'loans:read', 'loans:update',
        'borrowers:create', 'borrowers:read', 'borrowers:update',
        'reports:generate', 'settings:view'
      ]
    },
    {
      name: 'collector',
      description: 'Can record payments, manage collection schedules, and update payment statuses.',
      permissions: [
        'loans:read', 'borrowers:read',
        'payments:create', 'payments:read', 'payments:update'
      ]
    },
    {
      name: 'borrower',
      description: 'Can view their own loans, payment schedules, and make online payments.',
      permissions: [
        'loans:read', 'payments:create', 'payments:read'
      ]
    }
  ]);

  // Permissions data from the markdown file
  private permissions = signal<Permission[]>([
    { name: 'loans:create', description: 'Allows creating new loans.', category: 'Loan Management' },
    { name: 'loans:read', description: 'Allows viewing loan details.', category: 'Loan Management' },
    { name: 'loans:update', description: 'Allows updating existing loans.', category: 'Loan Management' },
    { name: 'loans:delete', description: 'Allows deleting loans.', category: 'Loan Management' },
    
    { name: 'borrowers:create', description: 'Allows creating new borrower accounts.', category: 'Borrower Management' },
    { name: 'borrowers:read', description: 'Allows viewing borrower details.', category: 'Borrower Management' },
    { name: 'borrowers:update', description: 'Allows updating borrower information.', category: 'Borrower Management' },
    { name: 'borrowers:delete', description: 'Allows deleting borrower accounts.', category: 'Borrower Management' },
    
    { name: 'payments:create', description: 'Allows recording new payments.', category: 'Payment Management' },
    { name: 'payments:read', description: 'Allows viewing payment details.', category: 'Payment Management' },
    { name: 'payments:update', description: 'Allows updating payment information.', category: 'Payment Management' },
    { name: 'payments:delete', description: 'Allows deleting payments.', category: 'Payment Management' },
    
    { name: 'reports:generate', description: 'Allows generating reports.', category: 'Other Permissions' },
    { name: 'users:manage', description: 'Allows managing users and their roles.', category: 'Other Permissions' },
    { name: 'settings:view', description: 'Allows viewing application settings.', category: 'Other Permissions' },
    { name: 'settings:edit', description: 'Allows editing application settings.', category: 'Other Permissions' }
  ]);

  // Computed signals for easier access
  allRoles = computed(() => this.roles());
  allPermissions = computed(() => this.permissions());
  
  // Group permissions by category
  permissionsByCategory = computed(() => {
    const result: { [key: string]: Permission[] } = {};
    
    this.permissions().forEach(permission => {
      if (!result[permission.category]) {
        result[permission.category] = [];
      }
      result[permission.category].push(permission);
    });
    
    return result;
  });

  constructor() {}

  /**
   * Get all defined roles
   */
  getRoles(): Role[] {
    return this.roles();
  }

  /**
   * Get all defined permissions
   */
  getPermissions(): Permission[] {
    return this.permissions();
  }

  /**
   * Get permissions grouped by category
   */
  getPermissionsByCategory(): { [key: string]: Permission[] } {
    return this.permissionsByCategory();
  }

  /**
   * Add a new role
   */
  addRole(role: Role): void {
    const currentRoles = this.roles();
    this.roles.set([...currentRoles, role]);
  }

  /**
   * Update an existing role
   */
  updateRole(roleName: string, updatedRole: Role): void {
    const currentRoles = this.roles();
    const index = currentRoles.findIndex(r => r.name === roleName);
    
    if (index !== -1) {
      const updatedRoles = [...currentRoles];
      updatedRoles[index] = updatedRole;
      this.roles.set(updatedRoles);
    }
  }

  /**
   * Delete a role
   */
  deleteRole(roleName: string): void {
    const currentRoles = this.roles();
    this.roles.set(currentRoles.filter(r => r.name !== roleName));
  }

  /**
   * Get a specific role by name
   */
  getRole(roleName: string): Role | undefined {
    return this.roles().find(role => role.name === roleName);
  }

  /**
   * Check if a permission exists in a role
   */
  hasPermission(role: Role | string, permissionName: string): boolean {
    if (typeof role === 'string') {
      const roleObj = this.getRole(role);
      return roleObj ? roleObj.permissions.includes(permissionName) : false;
    }
    return role.permissions.includes(permissionName);
  }
} 