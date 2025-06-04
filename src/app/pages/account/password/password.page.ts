import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonCardSubtitle,
  IonNote,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { keyOutline, eyeOutline, eyeOffOutline, lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { UserService } from '../../../services/user.service';

// Custom Validator for Passwords
export const passwordsMatchValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  
  // Clear error if they match or fields don't exist
  if (confirmPassword?.hasError('passwordMismatch')) {
    if (newPassword?.value === confirmPassword.value) {
      confirmPassword.setErrors(null);
    }
  }
  return null;
};

@Component({
  selector: 'app-password',
  templateUrl: './password.page.html',
  styleUrls: ['./password.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
    IonButtons,
    IonBackButton,
    IonCardSubtitle,
    IonNote,
    IonSpinner
  ]
})
export class PasswordPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private toastController = inject(ToastController);
  
  passwordForm!: FormGroup;
  isLoading = signal<boolean>(false);
  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  constructor() {
    addIcons({
      keyOutline,
      eyeOutline,
      eyeOffOutline,
      lockClosedOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  // Convenience getter for form fields
  get f() { 
    return this.passwordForm.controls; 
  }

  togglePasswordVisibility(field: 'currentPassword' | 'newPassword' | 'confirmPassword') {
    if (field === 'currentPassword') {
      this.showCurrentPassword.update(value => !value);
    } else if (field === 'newPassword') {
      this.showNewPassword.update(value => !value);
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword.update(value => !value);
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.showToast('Please fill all required fields correctly.', 'warning');
      return;
    }

    this.isLoading.set(true);
    
    try {
      // First check if current password is correct (this would be done by Supabase auth directly)
      // For now we'll just attempt to update with the new password
      
      const newPassword = this.f['newPassword'].value;
      await this.userService.updateUserPassword(newPassword);
      
      this.showToast('Password changed successfully!', 'success');
      this.passwordForm.reset();
    } catch (error: any) {
      console.error('Error changing password:', error);
      this.showToast(`Error changing password: ${error.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
