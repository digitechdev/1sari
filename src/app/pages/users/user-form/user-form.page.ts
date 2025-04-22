import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonSpinner,
  IonText,
  NavController,
  Platform,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { UserProfile } from '../../../interfaces/user-profile.interface';
import { UserService } from 'src/app/services/user.service';
import { passwordsMatchValidator } from 'src/app/components/user-form/user-form.component';
// import { User } from '../../../models/user.model'; // Assuming you have a User model
// import { UserService } from '../../../services/user.service'; // Assuming you have a UserService

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
    IonNote,
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonSpinner,
    IonText,
  ],
})
export class UserFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly navController = inject(NavController);
  private readonly platform = inject(Platform);
  private readonly userService = inject(UserService); // Inject your user service

  userForm!: FormGroup;
  userId = signal<string | null>(null);
  isLoading = signal(false);

  isEditMode = computed(() => !!this.userId());

  constructor() {
    // Initialize the form matching UserProfile
    // this.userForm = this.formBuilder.group({
    //   id: [''], // Keep for update logic
    //   full_name: ['', Validators.required], // Changed from name
    //   email: ['', [Validators.required, Validators.email]],
    //   role: ['User', Validators.required], // Default role
    //   password: ['', [Validators.required, Validators.minLength(6)]],
    //   confirmPassword: ['', [Validators.required]],
    //   // username removed
    //   // isActive removed
    // });

    // Log form value changes (optional)
    effect(() => {
      // console.log('User form value:', this.userForm.value);
    });
  }

  ngOnInit() {
    // const id = this.route.snapshot.paramMap.get('id');
    // if (id && id !== 'new') {
    //   this.userId.set(id);
    //   this.loadUserData(id);
    // } else {
    //   this.userId.set(null); // Ensure it's null for new users
    //   // Optional: Initialize form with defaults for 'new' mode if needed
    //   // this.userForm.reset({ role: 'User' }); // Example reset
    // }

    this.isEditMode.set(!!this.userProfile);
    this.initializeForm();

    if (this.isEditMode() && this.userProfile) {
      this.populateFormForEdit();
    }
  }

  initializeForm() {
    this.userForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          this.isEditMode()
            ? []
            : [Validators.required, Validators.minLength(6)],
        ],
        confirmPassword: ['', this.isEditMode() ? [] : [Validators.required]],
        fullName: [''],
        role: ['viewer', [Validators.required]],
      },
      {
        // Add the custom validator to the form group for create mode
        validators: this.isEditMode() ? [] : passwordsMatchValidator,
      }
    );

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

  async loadUserData(id: string) {
    this.isLoading.set(true);
    try {
      // TODO: Replace mock data with actual service call using UserService
      // const user = await this.userService.getUserById(id);
      // if (user) {
      //   // Map UserProfile fields to form controls if names differ, otherwise patch directly
      //   this.userForm.patchValue({
      //      id: user.id,
      //      full_name: user.full_name,
      //      email: user.email,
      //      role: user.role
      //   });
      // } else { ... }

      // Mock data updated to match UserProfile structure (partially)
      const mockUser: Partial<UserProfile> = {
        id: id,
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'Admin',
      };
      this.userForm.patchValue(mockUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      this.goBack();
    } finally {
      this.isLoading.set(false);
    }
  }

  async save() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      console.log(
        'Form is invalid:',
        this.userForm.errors,
        this.userForm.value
      );
      return;
    }

    this.isLoading.set(true);
    // Create payload matching UserProfile structure expected by the service
    const userData: Partial<UserProfile> = {
      full_name: this.f['full_name'].value,
      role: this.f['role'].value,
    };

    try {
      // TODO: Replace console.log with actual service calls using UserService
      if (this.isEditMode()) {
        console.log(
          'Updating user with ID:',
          this.userId()!,
          'Data:',
          userData
        );
        await this.userService.updateUserProfile(this.userId()!, userData);
      } else {
        const credentials = {
          email: this.f['email'].value,
          password: this.f['password'].value,
        };

        console.log('Adding user:', userData);
        await this.userService.createUserProfile(credentials, userData);
      }
      this.goBack();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    // Use NavController for potentially better back navigation handling within Ionic stack
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.navController.back();
    } else {
      // Fallback for web or if NavController doesn't work as expected
      this.router.navigate(['/users']); // Navigate back to the users list
    }
  }

  // Helper for easy access to form controls
  get f() {
    return this.userForm.controls;
  }
}

// Remove the local User interface definition if UserProfile is imported and used
// export interface User { ... }
