import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonList, IonItem, IonInput, IonTextarea, IonNote, IonLabel, IonText, IonSpinner, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { SalesService } from '../../../services/sales.service';
import { Sale } from '../../../models/sale.interface';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.page.html',
  styleUrls: ['./sale-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    // Ionic Standalone Components:
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonContent, IonList, IonItem, IonInput, IonTextarea, IonNote, IonLabel, IonText, IonSpinner, IonGrid, IonRow, IonCol,
    // CurrencyPipe // Explicit import not strictly needed if CommonModule is present, but doesn't hurt
  ],
  // providers: [CurrencyPipe] // Removed: Pipes are not typically provided here for template usage
})
export class SaleFormPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private salesService = inject(SalesService);
  private navController = inject(NavController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  // private alertCtrl = inject(AlertController); // Not used currently, can be removed or kept for future
  // private route = inject(ActivatedRoute); // If we need to handle editing in the future

  saleForm!: FormGroup;
  isEditMode = signal(false); // For future edit functionality
  pageTitle = signal('Add New Sale');
  isLoading = signal(false);

  // We can get current user ID from AuthService if needed for 'created_by'
  // private authService = inject(AuthService);

  constructor() { }

  ngOnInit() {
    this.initForm();
    // In a real edit mode, you would fetch sale data by ID here
  }

  initForm() {
    this.saleForm = this.formBuilder.group({
      borrower_name: ['', [Validators.required, Validators.minLength(3)]],
      item_name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      raw_price: [null, [Validators.required, Validators.min(0)]],
      interest: [null, [Validators.required, Validators.min(0)]],
      // total_price will be calculated or validated against raw_price + interest
      // created_by: [null] // Handled by service or backend
    });
  }

  get totalPrice(): number {
    const rawPrice = this.saleForm.get('raw_price')?.value || 0;
    const interest = this.saleForm.get('interest')?.value || 0;
    return parseFloat(rawPrice) + parseFloat(interest);
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }

  async presentLoading(message: string = 'Saving sale...') {
    const loadingInstance = await this.loadingCtrl.create({ message, spinner: 'crescent' });
    await loadingInstance.present();
    return loadingInstance;
  }

  async onSubmit() {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      this.presentToast('Please fill all required fields correctly.', 'danger');
      return;
    }

    const loadingIndicator = await this.presentLoading(); 
    this.isLoading.set(true);

    const formValue = this.saleForm.value;
    const saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'> = {
      borrower_name: formValue.borrower_name,
      item_name: formValue.item_name,
      description: formValue.description || null, // Ensure empty string becomes null if desired by DB
      raw_price: parseFloat(formValue.raw_price),
      interest: parseFloat(formValue.interest),
      total_price: this.totalPrice,
      // created_by: this.authService.currentUser()?.id // Example if authService provides user ID
    };

    try {
      const response = await this.salesService.addSale(saleData);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        this.presentToast('Sale added successfully!', 'success');
        this.navController.navigateBack('/sales', { replaceUrl: true }); 
      } else {
        // This case should ideally not happen if error is null but data is also null/empty
        throw new Error('Sale data was not returned after creation.'); 
      }

    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred while saving the sale.';
      this.presentToast(errorMessage, 'danger');
      console.error('Error saving sale:', error);
    } finally {
      loadingIndicator.dismiss();
      this.isLoading.set(false);
    }
  }

  cancel() {
    this.navController.navigateBack('/sales');
  }
} 