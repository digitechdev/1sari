import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonText,
  IonNote,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  saveOutline,
  closeOutline,
  addOutline,
  calendarOutline
} from 'ionicons/icons';

interface FormErrors {
  loanId: string | null;
  amount: string | null;
  paymentDate: string | null;
  paymentMethod: string | null;
}

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.page.html',
  styleUrls: ['./payment-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonText,
    IonNote,
    IonDatetime,
    IonDatetimeButton,
    IonModal
  ]
})
export class PaymentFormPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  paymentForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  paymentId = signal<number | null>(null);

  formErrors: FormErrors = {
    loanId: null,
    amount: null,
    paymentDate: null,
    paymentMethod: null
  };

  constructor() {
    // Register icons
    addIcons({
      saveOutline,
      closeOutline,
      addOutline,
      calendarOutline
    });

    this.initForm();
  }

  ngOnInit() {
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.paymentId.set(Number(id));
      this.loadPayment(Number(id));
    } else {
      // Set default date to today for new payments
      const today = new Date().toISOString();
      this.paymentForm.patchValue({
        paymentDate: today
      });
    }
  }

  initForm() {
    this.paymentForm = this.formBuilder.group({
      loanId: ['', [Validators.required, Validators.min(1)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      paymentDate: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      receiptNumber: [''],
      notes: ['']
    });
  }

  async loadPayment(id: number) {
    // TODO: Replace with actual service call to load payment by ID
    try {
      // Simulate API call
      setTimeout(() => {
        const mockPayment = {
          id: id,
          loanId: 101,
          amount: 5000,
          paymentDate: '2023-10-15T10:00:00.000Z',
          paymentMethod: 'Cash',
          receiptNumber: 'REC-001',
          notes: 'Payment received in full'
        };

        this.paymentForm.patchValue(mockPayment);
      }, 1000);
    } catch (error) {
      console.error('Error loading payment:', error);
      await this.presentToast('Failed to load payment details.', 'danger');
      this.router.navigate(['/payments/history']);
    }
  }

  validateForm(): boolean {
    this.resetFormErrors();

    const { loanId, amount, paymentDate, paymentMethod } = this.paymentForm.value;

    if (!loanId) {
      this.formErrors.loanId = 'Loan ID is required';
    } else if (loanId < 1) {
      this.formErrors.loanId = 'Invalid Loan ID';
    }

    if (!amount) {
      this.formErrors.amount = 'Amount is required';
    } else if (amount <= 0) {
      this.formErrors.amount = 'Amount must be greater than 0';
    }

    if (!paymentDate) {
      this.formErrors.paymentDate = 'Payment date is required';
    }

    if (!paymentMethod) {
      this.formErrors.paymentMethod = 'Payment method is required';
    }

    return !this.formErrors.loanId && 
           !this.formErrors.amount && 
           !this.formErrors.paymentDate && 
           !this.formErrors.paymentMethod;
  }

  resetFormErrors() {
    this.formErrors = {
      loanId: null,
      amount: null,
      paymentDate: null,
      paymentMethod: null
    };
  }

  async submitPayment() {
    if (!this.validateForm()) {
      await this.presentToast('Please correct the errors in the form.', 'danger');
      return;
    }

    this.isSubmitting.set(true);

    try {
      // TODO: Replace with actual service call
      console.log('Payment form submitted:', this.paymentForm.value);
      
      // Simulate API call
      setTimeout(async () => {
        this.isSubmitting.set(false);
        
        if (this.isEditMode()) {
          await this.presentToast('Payment updated successfully!', 'success');
        } else {
          await this.presentToast('Payment recorded successfully!', 'success');
        }
        
        this.router.navigate(['/payments/history']);
      }, 1500);
    } catch (error) {
      console.error('Error saving payment:', error);
      this.isSubmitting.set(false);
      await this.presentToast('Failed to save payment. Please try again.', 'danger');
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}
