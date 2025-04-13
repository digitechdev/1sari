import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AccountInformation } from '../../interfaces/account-information.interfaces'; // Adjust path as needed
import { BorrowerService } from '../../services/borrower.service'; // Adjust path as needed

@Component({
  selector: 'app-borrower-form',
  templateUrl: './borrower-form.component.html',
  styleUrls: ['./borrower-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class BorrowerFormComponent implements OnInit {
  @Input() borrower: AccountInformation | null = null; // Input to receive borrower data for editing

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private borrowerService = inject(BorrowerService);
  private toastCtrl = inject(ToastController);

  borrowerForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.isEditMode.set(!!this.borrower); // Set edit mode based on input
    this.initForm();
    if (this.isEditMode() && this.borrower) {
        // Patch form if in edit mode
        this.borrowerForm.patchValue(this.borrower);
    }
  }

  initForm() {
    // Define form controls based on AccountInformation interface
    // Add Validators as needed (example: required)
    this.borrowerForm = this.fb.group({
      name_of_borrower: ['', Validators.required],
      provider_subject_no: [''],
      gender: [''],
      civil_status: [''],
      type_of_id: [''],
      birthday_borrower: [''], // Consider date picker
      age: [null],
      mothers_maiden_name_borrower: [''],
      name_of_co_borrower_maker: [''],
      security_collateral: [''],
      mode_of_payment: [''],
      store_name: [''],
      residence_address: [''],
      length_of_stay_in_residence: [''],
      store_address: [''],
      area: [''],
      contact_no_borrower: [''],
      classification: [''],
      store_category: [''],
      account_relationship_officer: [''],
      retail_partner: ['']
      // Exclude id and created_at as they are not typically part of the form
    });
  }

  // Getter for easier access in template (optional)
  get f() { return this.borrowerForm.controls; }

  async dismiss(data: any = null) {
    await this.modalCtrl.dismiss(data);
  }

  async save() {
    if (this.borrowerForm.invalid) {
      console.warn('Form is invalid');
      // Optionally mark all fields as touched to show errors
      this.borrowerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formData = this.borrowerForm.value;

    try {
      let response;
      if (this.isEditMode() && this.borrower?.id) {
        // Update existing borrower
        response = await this.borrowerService.updateBorrower(this.borrower.id, formData);
      } else {
        // Add new borrower
        response = await this.borrowerService.addBorrower(formData);
      }

      this.isLoading.set(false);

      if (response.error) {
        console.error('Error saving borrower:', response.error);
        await this.presentToast(`Error: ${response.error.message}`, 'danger');
      } else {
        await this.presentToast(`Borrower ${this.isEditMode() ? 'updated' : 'added'} successfully!`, 'success');
        this.dismiss({ saved: true, data: response.data }); // Dismiss with success flag and data
      }
    } catch (error: any) {
        this.isLoading.set(false);
        console.error('Unexpected error during save:', error);
        const errorMessage = error.message || 'An unexpected error occurred.';
        await this.presentToast(`Error: ${errorMessage}`, 'danger');
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
} 