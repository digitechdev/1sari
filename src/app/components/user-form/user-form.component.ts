import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { UserProfile } from '../../interfaces/user-profile.interface';
import { UserService } from '../../services/user.service';

// Custom validator for password matching
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // If controls are not yet available or pristine, don't validate
  if (!password || !confirmPassword || password.pristine || confirmPassword.pristine) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class UserFormComponent implements OnInit {
  @Input() userProfile?: UserProfile;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Reactive Form
  userForm!: FormGroup;

  // Inject services
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);

  // Example roles (customize as needed)
  availableRoles = ['admin', 'agent', 'viewer'];

  // Getter for easy access to form controls in the template
  get f() { return this.userForm.controls; }

  ngOnInit() {
    this.isEditMode.set(!!this.userProfile);
    this.initializeForm();

    if (this.isEditMode() && this.userProfile) {
      this.populateFormForEdit();
    }
  }

  initializeForm() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // Password fields only required in create mode, handled dynamically or via form group validator
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditMode() ? [] : [Validators.required]],
      fullName: [''],
      role: ['viewer', [Validators.required]]
    }, {
      // Add the custom validator to the form group for create mode
      validators: this.isEditMode() ? [] : passwordsMatchValidator
    });

    // Disable email in edit mode
    if (this.isEditMode()) {
        this.f['email'].disable();
        // Remove password validators if they were added initially for edit mode (alternative approach)
        // this.f['password'].clearValidators();
        // this.f['confirmPassword'].clearValidators();
        // this.userForm.updateValueAndValidity();
    }
  }

  populateFormForEdit() {
    if (!this.userProfile) return;
    this.userForm.patchValue({
      email: this.userProfile.email,
      fullName: this.userProfile.full_name || '',
      role: this.userProfile.role || 'viewer',
      password: '', // Clear password fields for edit
      confirmPassword: ''
    });
    // Ensure password fields are not required for edit
    this.f['password'].clearValidators();
    this.f['confirmPassword'].clearValidators();
    this.userForm.removeValidators(passwordsMatchValidator);
    this.userForm.updateValueAndValidity();
  }

  async saveUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // Mark fields as touched to show errors
      this.showToast('Please check the form for errors.', 'warning');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.userForm.getRawValue(); // Use getRawValue to include disabled email

    const profileData = {
      full_name: formValue.fullName,
      role: formValue.role
    };

    try {
      if (this.isEditMode()) {
        if (!this.userProfile?.id) {
          throw new Error('User ID is missing for update.');
        }
        await this.userService.updateUserProfile(this.userProfile.id, profileData);
        this.showToast('User profile updated successfully.', 'success');
        this.modalCtrl.dismiss(profileData, 'confirm');
      } else {
        // Create new user
        const credentials = {
          email: formValue.email,
          password: formValue.password
        };
        const { profile, error } = await this.userService.createUserProfile(credentials, profileData);
        if (error || !profile) {
          throw error || new Error('Failed to create user or profile.');
        }
        this.showToast('User created successfully. Check email for confirmation if enabled.', 'success');
        this.modalCtrl.dismiss(profile, 'confirm');
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      this.showToast(error.message || 'Failed to save user.', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
} 