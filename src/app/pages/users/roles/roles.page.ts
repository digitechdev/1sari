import { Component, OnInit, inject, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonChip,
  IonAlert,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonFab,
  IonFabButton,
  AlertController,
  ModalController,
  IonCheckbox,
  IonAccordionGroup,
  IonAccordion,
  IonInput,
  IonTextarea,
  IonToggle,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline, 
  pencilOutline, 
  trashOutline, 
  informationCircleOutline,
  keyOutline,
  lockClosedOutline,
  checkmarkOutline,
  closeOutline,
  shieldOutline,
  peopleOutline,
  personOutline,
  documentTextOutline,
  cashOutline,
  eyeOutline
} from 'ionicons/icons';
import { PermissionsService, Role, Permission } from '../../../services/permissions.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RoleFormModalComponent } from './role-form-modal/role-form-modal.component';
import { RoleDetailsModalComponent } from './role-details-modal/role-details-modal.component';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    NgxDatatableModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonChip,
    IonAlert,
    IonSegment,
    IonSegmentButton,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonCheckbox,
    IonAccordionGroup,
    IonAccordion,
    IonInput,
    IonTextarea,
    IonToggle,
    RoleFormModalComponent,
    RoleDetailsModalComponent
  ]
})
export class RolesPage implements OnInit {
  private permissionsService = inject(PermissionsService);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private toastController = inject(ToastController);

  // Signals
  roles = signal<Role[]>([]);
  permissions = signal<Permission[]>([]);
  permissionsByCategory = signal<{ [key: string]: Permission[] }>({});
  selectedSegment = signal<string>('roles');
  searchTerm = signal<string>('');

  // Datatable specific properties
  tableRows = signal<any[]>([]);
  tableColumns = [
    { name: 'Role', prop: 'name' },
    { name: 'Description', prop: 'description' },
    { name: 'Permissions', prop: 'permissionCount' },
    { name: 'Actions', prop: 'actions' }
  ];

  constructor() {
    addIcons({
      addOutline,
      pencilOutline,
      trashOutline,
      informationCircleOutline,
      keyOutline,
      lockClosedOutline,
      checkmarkOutline,
      closeOutline,
      shieldOutline,
      peopleOutline,
      personOutline,
      documentTextOutline,
      cashOutline,
      eyeOutline
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.roles.set(this.permissionsService.getRoles());
    this.permissions.set(this.permissionsService.getPermissions());
    this.permissionsByCategory.set(this.permissionsService.getPermissionsByCategory());
    
    // Transform roles data for the table
    this.updateTableData();
  }

  updateTableData() {
    const tableData = this.roles().map(role => ({
      ...role,
      permissionCount: role.permissions.length,
    }));
    
    this.tableRows.set(tableData);
  }

  segmentChanged(event: any) {
    this.selectedSegment.set(event.detail.value);
  }

  searchChanged(event: any) {
    this.searchTerm.set(event.detail.value || '');
    this.filterTable();
  }

  filterTable() {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.updateTableData();
      return;
    }
    
    const filteredData = this.roles().filter(role => 
      role.name.toLowerCase().includes(term) || 
      role.description.toLowerCase().includes(term)
    );
    
    this.tableRows.set(filteredData);
  }

  getFilteredRoles(): Role[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.roles();
    
    return this.roles().filter(role => 
      role.name.toLowerCase().includes(term) || 
      role.description.toLowerCase().includes(term)
    );
  }

  getFilteredPermissions(): Permission[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.permissions();
    
    return this.permissions().filter(permission => 
      permission.name.toLowerCase().includes(term) || 
      permission.description.toLowerCase().includes(term) || 
      permission.category.toLowerCase().includes(term)
    );
  }

  async createRole() {
    const modal = await this.modalController.create({
      component: RoleFormModalComponent,
      componentProps: {
        role: null
      },
      cssClass: 'role-form-modal'
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    
    if (role === 'confirm' && data) {
      this.saveRole(data);
      
      const toast = await this.toastController.create({
        message: `Role "${data.name}" created successfully`,
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      
      await toast.present();
    }
  }

  async editRole(role: Role) {
    const modal = await this.modalController.create({
      component: RoleFormModalComponent,
      componentProps: {
        role: { ...role }
      },
      cssClass: 'role-form-modal'
    });

    await modal.present();

    const { data, role: resultRole } = await modal.onDidDismiss();
    
    if (resultRole === 'confirm' && data) {
      this.saveRole(data, role.name);
      
      const toast = await this.toastController.create({
        message: `Role "${data.name}" updated successfully`,
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      
      await toast.present();
    }
  }

  async viewRoleDetails(role: Role) {
    const modal = await this.modalController.create({
      component: RoleDetailsModalComponent,
      componentProps: {
        role: { ...role }
      },
      cssClass: 'role-details-modal'
    });

    await modal.present();
  }

  formatPermissionsForDisplay(permissions: string[]): string {
    if (permissions.length === 0) {
      return '<div class="permission-list"><p>No permissions assigned</p></div>';
    }

    // Group permissions by category
    const permissionsByCategory: { [key: string]: string[] } = {};
    
    permissions.forEach(permName => {
      const perm = this.permissions().find(p => p.name === permName);
      if (perm) {
        if (!permissionsByCategory[perm.category]) {
          permissionsByCategory[perm.category] = [];
        }
        permissionsByCategory[perm.category].push(perm.name);
      }
    });
    
    // Format the HTML
    let html = '<div class="permission-list">';
    
    Object.entries(permissionsByCategory).forEach(([category, perms]) => {
      html += `<h5>${category}</h5><ul>`;
      perms.forEach(perm => {
        html += `<li>${perm}</li>`;
      });
      html += '</ul>';
    });
    
    html += '</div>';
    return html;
  }

  async confirmDeleteRole(role: Role) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the role "${role.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteRole(role);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteRole(role: Role) {
    this.permissionsService.deleteRole(role.name);
    this.loadData();
  }

  saveRole(role: Role, originalName?: string) {
    if (originalName) {
      // Update existing role
      this.permissionsService.updateRole(originalName, role);
    } else {
      // Add new role
      this.permissionsService.addRole(role);
    }
    
    this.loadData();
  }

  hasPermission(role: Role, permission: string): boolean {
    return this.permissionsService.hasPermission(role, permission);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Loan Management': 'document-text-outline',
      'Borrower Management': 'person-outline',
      'Payment Management': 'cash-outline',
      'Other Permissions': 'shield-outline'
    };
    
    return icons[category] || 'key-outline';
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'admin': 'danger',
      'loan_officer': 'warning',
      'collector': 'success',
      'borrower': 'primary'
    };
    
    return colors[role] || 'medium';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Loan Management': 'primary',
      'Borrower Management': 'secondary',
      'Payment Management': 'success',
      'Other Permissions': 'tertiary'
    };
    
    return colors[category] || 'medium';
  }
}
