import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  WritableSignal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  IonText,
  NavController,
  Platform,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
} from '@ionic/angular/standalone';
import { UserProfile } from '../../../interfaces/user-profile.interface';
import { UserService } from 'src/app/services/user.service';

// Custom Validator for Passwords (keep it here or move to a shared validators file)
export const passwordsMatchValidator = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  // Clear error if they match or fields don't exist
  if (confirmPassword?.hasError('passwordMismatch')) {
      // Check if the specific error is passwordMismatch before clearing
      if (password?.value === confirmPassword.value) {
          confirmPassword.setErrors(null);
      }
  }
  return null;
};

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.page.html',
  styleUrls: ['./user-form.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonGrid,
    IonCardContent,
    IonIcon,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonText,
    IonSpinner,
    IonButton,
    IonSelectOption,
    IonSelect,
    IonInput,
    IonContent,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly navController = inject(NavController);
  private readonly platform = inject(Platform);
  private readonly userService = inject(UserService);
  private readonly toastCtrl = inject(ToastController);

  userForm!: FormGroup;
  userId: WritableSignal<string | null> = signal(null);
  isLoading = signal(false);

  // Computed signal determines mode based on userId signal
  isEditMode = computed(() => !!this.userId());

  // No constructor needed for initialization if done in ngOnInit

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.initializeForm(); // Initialize first

    if (id && id !== 'new') {
      this.userId.set(id);
      // Form validators/structure might change based on mode, re-initialize or adjust
      this.initializeForm(); // Re-initialize to ensure correct validators for edit mode
      this.loadUserData(id);
    } else {
      this.userId.set(null);
      // Form is already initialized for create mode
    }
  }

  initializeForm() {
    const isEditing = this.isEditMode();

    const formConfig: { [key: string]: any } = {
        // id is not needed in the form itself, managed by userId signal
        full_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        role: ['viewer', Validators.required], // Default role, adjust as needed
    };

    // Add password fields only if creating a new user
    if (!isEditing) {
        formConfig['password'] = ['', [Validators.required, Validators.minLength(6)]];
        formConfig['confirmPassword'] = ['', Validators.required];
    }

    this.userForm = this.formBuilder.group(formConfig, {
        // Apply the passwordsMatchValidator only when creating
        validators: isEditing ? [] : passwordsMatchValidator,
    });

    // Disable email input in edit mode after form is created
    if (isEditing && this.userForm.controls['email']) {
        this.userForm.controls['email'].disable();
    }
  }

  async loadUserData(id: string) {
    if (!this.userForm) this.initializeForm(); // Ensure form exists
    this.isLoading.set(true);
    try {
      const user = await this.userService.getUserProfile(id);
      if (user) {
        this.userForm.patchValue({
            full_name: user.full_name || '',
            email: user.email, // Email will be disabled, but good to patch value
            role: user.role || 'viewer',
        });
         // Email is already disabled in initializeForm for edit mode
      } else {
        console.error('User not found');
        this.showToast('User not found.', 'danger');
        this.goBack();
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      this.showToast(`Error loading user: ${error.message || 'Unknown error'}`, 'danger');
      this.goBack();
    } finally {
      this.isLoading.set(false);
    }
  }

  async save() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      console.warn('Form is invalid:', this.userForm.value, this.userForm.errors);
      this.showToast('Please fill all required fields correctly.', 'warning');
      return;
    }

    this.isLoading.set(true);

    try {
      if (this.isEditMode()) {
        // --- UPDATE USER --- //
        const userIdToUpdate = this.userId();
        if (!userIdToUpdate) {
            throw new Error('User ID is missing for update.');
        }
        const updateData: Partial<UserProfile> = {
            // Email is disabled and should not be sent for update
            full_name: this.f['full_name'].value,
            role: this.f['role'].value,
        };
        console.log('Updating user with ID:', userIdToUpdate, 'Data:', updateData);
        await this.userService.updateUserProfile(userIdToUpdate, updateData);
        this.showToast('User updated successfully.', 'success');

      } else {
        // --- CREATE USER --- //
        const credentials = {
            email: this.f['email'].value,
            password: this.f['password'].value,
        };
        const profileData: Partial<UserProfile> = {
            full_name: this.f['full_name'].value,
            role: this.f['role'].value,
            // Email will be part of credentials / auth user, not profile usually
        };

        console.log('Creating user with credentials:', credentials, 'Profile Data:', profileData);
        await this.userService.createUserProfile(credentials, profileData);
        this.showToast('User created successfully.', 'success');
      }
      this.goBack(); // Navigate back after successful save/update
    } catch (error: any) {
      console.error('Error saving user:', error);
      this.showToast(`Error saving user: ${error.message || 'Unknown error'}`, 'danger');
    } finally {
      this.isLoading.set(false);
    }
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

  goBack() {
    this.router.navigate(['/users']);
  }

  // Helper for easy access to form controls in the template
  get f() {
    return this.userForm.controls;
  }
}
