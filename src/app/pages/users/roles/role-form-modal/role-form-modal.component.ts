import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonCheckbox,
  IonAccordionGroup,
  IonAccordion,
  IonIcon,
  ModalController,
  IonList, IonFooter } from '@ionic/angular/standalone';
import { Role, Permission, PermissionsService } from '../../../../services/permissions.service';
import { addIcons } from 'ionicons';
import {
  keyOutline,
  documentTextOutline,
  personOutline,
  cashOutline,
  shieldOutline,
  closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-role-form-modal',
  templateUrl: './role-form-modal.component.html',
  styleUrls: ['./role-form-modal.component.scss'],
  standalone: true,
  imports: [IonFooter, 
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonCheckbox,
    IonAccordionGroup,
    IonAccordion,
    IonIcon,
    IonList
  ]
})
export class RoleFormModalComponent implements OnInit {
  @Input() role: Role | null = null;
  
  private permissionsService = inject(PermissionsService);
  private modalController = inject(ModalController);
  
  roleName: string = '';
  roleDescription: string = '';
  selectedPermissions: string[] = [];
  permissionsByCategory: { [key: string]: Permission[] } = {};
  
  constructor() {
    addIcons({
      keyOutline,
      documentTextOutline,
      personOutline,
      cashOutline,
      shieldOutline,
      closeOutline
    });
  }
  
  ngOnInit() {
    this.permissionsByCategory = this.permissionsService.getPermissionsByCategory();
    
    // If editing an existing role, populate the form
    if (this.role) {
      this.roleName = this.role.name;
      this.roleDescription = this.role.description;
      this.selectedPermissions = [...this.role.permissions];
    }
  }
  
  togglePermission(permissionName: string, event: any) {
    const checked = event.detail.checked;
    
    if (checked) {
      // Add permission if it's not already in the list
      if (!this.selectedPermissions.includes(permissionName)) {
        this.selectedPermissions.push(permissionName);
      }
    } else {
      // Remove permission
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permissionName);
    }
  }
  
  hasPermission(permissionName: string): boolean {
    return this.selectedPermissions.includes(permissionName);
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
  
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Loan Management': 'primary',
      'Borrower Management': 'secondary',
      'Payment Management': 'success',
      'Other Permissions': 'tertiary'
    };
    
    return colors[category] || 'medium';
  }
  
  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }
  
  confirm() {
    if (!this.roleName || this.roleName.trim() === '') {
      return;
    }
    
    const role: Role = {
      name: this.roleName,
      description: this.roleDescription,
      permissions: this.selectedPermissions
    };
    
    return this.modalController.dismiss(role, 'confirm');
  }
} 