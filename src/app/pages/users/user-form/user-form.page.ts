import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  Platform, IonNote } from '@ionic/angular/standalone';
// import { User } from '../../../models/user.model'; // Assuming you have a User model
// import { UserService } from '../../../services/user.service'; // Assuming you have a UserService

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.page.html',
  styleUrls: ['./user-form.page.scss'],
  standalone: true,
  imports: [IonNote, 
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
  // private readonly userService = inject(UserService); // Inject your user service

  userForm!: FormGroup;
  userId = signal<string | null>(null);
  isLoading = signal(false);

  isEditMode = computed(() => !!this.userId());

  constructor() {
    // Initialize the form
    this.userForm = this.formBuilder.group({
      id: [''], // Hidden or not needed in form display, but useful for update
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['User', Validators.required], // Default role
      isActive: [true], // Default active state
      // Add password fields if needed, potentially conditionally
      // password: [''],
      // confirmPassword: [''],
    });

    // Log form value changes (optional)
    effect(() => {
      // console.log('User form value:', this.userForm.value);
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.userId.set(id);
      this.loadUserData(id);
    } else {
      this.userId.set(null); // Ensure it's null for new users
    }
  }

  async loadUserData(id: string) {
    this.isLoading.set(true);
    try {
      // const user = await this.userService.getUserById(id); // Fetch user data
      // if (user) {
      //   this.userForm.patchValue(user);
      // } else {
      //   console.error('User not found');
      //   this.goBack(); // Navigate back if user not found
      // }
      // Mock data for now
      const mockUser: User = { id: id, name: 'Test User', username: 'testuser', email: 'test@example.com', role: 'Admin', isActive: false };
       this.userForm.patchValue(mockUser);

    } catch (error) {
      console.error('Error loading user data:', error);
      // Handle error (e.g., show a toast)
      this.goBack();
    } finally {
      this.isLoading.set(false);
    }
  }

  async save() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // Mark all fields as touched to show errors
      console.log('Form is invalid:', this.userForm.errors);
      return;
    }

    this.isLoading.set(true);
    const userData: User = this.userForm.value;

    try {
      if (this.isEditMode()) {
        // await this.userService.updateUser(this.userId()!, userData);
        console.log('Updating user:', userData);
      } else {
        // await this.userService.addUser(userData);
         console.log('Adding user:', userData);
      }
      // Add success feedback (Toast) if needed
      this.goBack(); // Navigate back after successful save/update
    } catch (error) {
      console.error('Error saving user:', error);
      // Add error feedback (Toast/Alert)
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
       this.router.navigate(['/users']); // Adjust route as needed
    }
  }

   // Helper for easy access to form controls in the template (optional)
   get f() {
    return this.userForm.controls;
  }
}

// Define User interface if not already defined elsewhere
export interface User {
  id?: string;
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  // Add other relevant fields
} 