import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonNote,
  NavController,
  ToastController,
  IonList,
  IonCheckbox,
  IonInputPasswordToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, personCircleOutline, logoGoogle } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonNote,
    IonSpinner,
    IonIcon,
    IonButton,
    IonInput,
    IonItem,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonCol,
    IonRow,
    IonGrid,
    IonContent,
    IonCheckbox,
    CommonModule,
    ReactiveFormsModule,
    IonInputPasswordToggle
  ]
})
export class LoginPage implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private fb = inject(FormBuilder);

  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    addIcons({ logInOutline, personCircleOutline, logoGoogle });
   }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  async login() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        this.errorMessage.set('Please enter valid email and password.');
        this.isLoading.set(false);
        return;
    }

    const { email, password } = this.loginForm.value;

    try {
      const { error } = await this.authService.signInWithEmail(email, password);

      if (error) {
        console.error('Login error:', error);
        this.errorMessage.set(error.message);
        this.presentToast(error.message, 'danger');
      } else {
        console.log('Login successful, navigating...');
        this.router.navigate(['/dashboard'], { replaceUrl: true }); 
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      const message = err.message || 'An unexpected error occurred during login.';
      this.errorMessage.set(message);
      this.presentToast(message, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  signInWithGoogle() {
      console.log('Sign in with Google clicked - Placeholder');
      this.presentToast('Google Sign-In not implemented yet.', 'warning');
  }

  forgotPassword() {
      console.log('Forgot Password clicked - Placeholder');
      this.presentToast('Forgot Password not implemented yet.', 'warning');
  }

   signUp() {
      console.log('Sign Up link clicked - Placeholder');
      this.presentToast('Sign Up page not implemented yet.', 'warning');
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3500,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }

} 