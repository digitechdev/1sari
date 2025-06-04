import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  ModalController,
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonCardTitle
} from '@ionic/angular/standalone';
import { Role, Permission, PermissionsService } from '../../../../services/permissions.service';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  keyOutline,
  documentTextOutline,
  personOutline,
  cashOutline,
  shieldOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-role-details-modal',
  templateUrl: './role-details-modal.component.html',
  styleUrls: ['./role-details-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonChip,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ]
})
export class RoleDetailsModalComponent implements OnInit {
  @Input() role!: Role;
  
  private permissionsService = inject(PermissionsService);
  private modalController = inject(ModalController);
  
  permissionsByCategory: { [key: string]: Permission[] } = {};
  
  constructor() {
    addIcons({
      closeOutline,
      keyOutline,
      documentTextOutline,
      personOutline,
      cashOutline,
      shieldOutline
    });
  }
  
  ngOnInit() {
    this.permissionsByCategory = this.permissionsService.getPermissionsByCategory();
  }
  
  getRolePermissionsByCategory(): { [key: string]: Permission[] } {
    const result: { [key: string]: Permission[] } = {};
    const allPermissions = this.permissionsService.getPermissions();
    
    // First, build a map of categories and their assigned permissions for this role
    this.role.permissions.forEach(permName => {
      const permission = allPermissions.find(p => p.name === permName);
      if (permission) {
        if (!result[permission.category]) {
          result[permission.category] = [];
        }
        result[permission.category].push(permission);
      }
    });
    
    return result;
  }
  
  close() {
    return this.modalController.dismiss();
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
} 