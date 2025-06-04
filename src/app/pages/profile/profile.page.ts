import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  IonLabel,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonAvatar,
  IonText,
  IonSpinner,
  ToastController,
  IonCardSubtitle, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, saveOutline, createOutline, lockClosedOutline, mailOutline, calendarOutline } from 'ionicons/icons';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../interfaces/user-profile.interface';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonChip, 
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonInput,
    IonLabel,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
    IonList,
    IonAvatar,
    IonText,
    IonSpinner
  ]
})
export class ProfilePage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private toastController = inject(ToastController);

  profileForm!: FormGroup;
  userProfile = signal<UserProfile | null>(null);
  isLoading = signal<boolean>(true);
  isEditing = signal<boolean>(false);
  roleName = signal<string>('');

  constructor() {
    addIcons({
      personCircleOutline,
      saveOutline,
      createOutline,
      lockClosedOutline,
      mailOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadUserProfile();
  }

  initializeForm() {
    this.profileForm = this.formBuilder.group({
      full_name: ['', Validators.required]
    });
  }

  async loadUserProfile() {
    this.isLoading.set(true);
    try {
      // Get the current user's profile
      const currentUser = await this.userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }

      // Load the profile data
      const profile = await this.userService.getUserProfile(currentUser.id);
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      this.userProfile.set(profile);
      
      // Get role details if available
      if (profile.role) {
        const role = this.roleService.getRoleByName(profile.role);
        this.roleName.set(role?.name || profile.role);
      }

      // Update the form with the profile data
      this.profileForm.patchValue({
        full_name: profile.full_name || ''
      });
    } catch (error: any) {
      console.error('Error loading profile:', error);
      this.showToast(`Error loading profile: ${error.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleEdit() {
    if (this.isEditing()) {
      // If currently editing, then clicking the save icon should save the profile
      this.saveProfile();
    } else {
      // If not editing, then enable edit mode
      this.isEditing.set(true);
    }
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showToast('Please fill all required fields correctly.', 'warning');
      return;
    }

    this.isLoading.set(true);
    try {
      const userId = this.userProfile()?.id;
      if (!userId) {
        throw new Error('User ID is missing');
      }

      const updateData: Partial<UserProfile> = {
        full_name: this.profileForm.get('full_name')?.value
      };

      await this.userService.updateUserProfile(userId, updateData);
      
      // Update the local state
      this.userProfile.update(profile => {
        if (profile) {
          return { ...profile, ...updateData };
        }
        return profile;
      });
      
      this.isEditing.set(false);
      this.showToast('Profile updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      this.showToast(`Error updating profile: ${error.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelEdit() {
    // Reset form values to original data
    this.profileForm.patchValue({
      full_name: this.userProfile()?.full_name || ''
    });
    // Exit edit mode
    this.isEditing.set(false);
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 