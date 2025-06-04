import { Injectable, inject, signal } from '@angular/core';
import { PermissionsService, Role } from './permissions.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private permissionsService = inject(PermissionsService);
  
  // Signals
  roles = signal<Role[]>([]);
  
  constructor() {
    this.loadRoles();
  }
  
  /**
   * Load roles from the permissions service
   */
  loadRoles(): void {
    this.roles.set(this.permissionsService.getRoles());
  }
  
  /**
   * Get all available roles
   */
  getRoles(): Role[] {
    return this.roles();
  }
  
  /**
   * Get a role by name
   */
  getRoleByName(name: string): Role | undefined {
    return this.roles().find(role => role.name === name);
  }
  
  /**
   * Add a new role
   */
  addRole(role: Role): void {
    this.permissionsService.addRole(role);
    this.loadRoles();
  }
  
  /**
   * Update an existing role
   */
  updateRole(originalName: string, role: Role): void {
    this.permissionsService.updateRole(originalName, role);
    this.loadRoles();
  }
  
  /**
   * Delete a role
   */
  deleteRole(name: string): void {
    this.permissionsService.deleteRole(name);
    this.loadRoles();
  }
} 