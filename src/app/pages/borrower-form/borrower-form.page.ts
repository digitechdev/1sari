import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFooter,
  IonLoading,
  ToastController
} from '@ionic/angular/standalone';
import { BorrowerService } from '../../services/borrower.service';
import { AccountInformation } from '../../interfaces/account-information.interfaces';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-borrower-form',
  templateUrl: './borrower-form.page.html',
  styleUrls: ['./borrower-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonFooter,
    IonLoading
  ]
})
export class BorrowerFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private borrowerService = inject(BorrowerService);
  private router = inject(Router);
  private location = inject(Location);
  private toastCtrl = inject(ToastController);
  private cdRef = inject(ChangeDetectorRef);

  borrowerForm!: FormGroup;
  isEditMode = signal(false);
  borrowerId: number | null = null;
  isSaving = signal(false);

  constructor() { }

  ngOnInit() {
    this.borrowerForm = this.fb.group({
      name_of_borrower: [null, Validators.required],
      provider_subject_no: [null],
      gender: [null],
      civil_status: [null],
      type_of_id: [null],
      birthday_borrower: [null],
      age: [null],
      mothers_maiden_name_borrower: [null],
      name_of_co_borrower_maker: [null],
      security_collateral: [null],
      mode_of_payment: [null],
      store_name: [null],
      residence_address: [null],
      length_of_stay_in_residence: [null],
      store_address: [null],
      area: [null],
      contact_no_borrower: [null, Validators.required],
      classification: [null],
      store_category: [null],
      account_relationship_officer: [null],
      retail_partner: [null],
    });

    // TODO: Add logic here if it's an edit form (get borrower ID from route, load data)
  }

  async saveBorrower() {
    if (this.borrowerForm.invalid) {
      this.showToast('Please fill all required fields.', 'danger');
      this.borrowerForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formData = this.borrowerForm.value as Partial<AccountInformation>;

    try {
        const { data, error } = await this.borrowerService.addBorrower(formData);

        if (error) {
            console.error('Error saving borrower:', error);
            this.showToast(`Error: ${error.message}`, 'danger');
        } else {
            console.log('Saved successfully:', data);
            this.showToast('Borrower saved successfully!', 'success');
            this.borrowerForm.reset();
            this.router.navigateByUrl('/borrowers');
        }
    } catch (err) {
        console.error('Unexpected error during save:', err);
        this.showToast('An unexpected error occurred. Please try again.', 'danger');
    } finally {
        this.isSaving.set(false);
        this.cdRef.detectChanges();
    }
  }

  goBack() {
    this.location.back();
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
      const toast = await this.toastCtrl.create({
          message: message,
          duration: 3000,
          color: color,
          position: 'bottom'
      });
      toast.present();
  }
}
