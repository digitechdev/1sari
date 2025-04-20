import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { BorrowerService } from 'src/app/services/borrower.service';

@Component({
  selector: 'app-borrower-form-page',
  templateUrl: './borrower-form-page.page.html',
  styleUrls: ['./borrower-form-page.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    ReactiveFormsModule
  ]
})
export class BorrowerFormPagePage implements OnInit {

  private fb = inject(FormBuilder);
  private borrowerService = inject(BorrowerService);
  private toastCtrl = inject(ToastController);
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);

  borrowerForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  pageTitle = signal<string>('Add Borrower');
  private borrowerId: number | null = null;

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.borrowerId = +idParam;
      if (!isNaN(this.borrowerId)) {
        this.isEditMode.set(true);
        this.pageTitle.set('Edit Borrower');
        this.loadBorrowerData(this.borrowerId);
      } else {
        console.error('Invalid Borrower ID in URL');
        this.presentToast('Invalid Borrower ID.', 'danger');
        this.navCtrl.back();
      }
    } else {
      this.isEditMode.set(false);
      this.pageTitle.set('Add Borrower');
    }
  }

  async loadBorrowerData(id: number) {
    this.isLoading.set(true);
    try {
        const response = await this.borrowerService.getBorrowerById(id);
        if (response.error || !response.data) {
            console.error('Error fetching borrower for edit:', response.error);
            this.presentToast('Failed to load borrower data.', 'danger');
            this.navCtrl.back();
        } else {
            this.borrowerForm.patchValue(response.data);
        }
    } catch (error) {
        console.error('Unexpected error loading borrower data:', error);
        this.presentToast('An error occurred loading borrower data.', 'danger');
        this.navCtrl.back();
    } finally {
        this.isLoading.set(false);
    }
  }

  initForm() {
    this.borrowerForm = this.fb.group({
      name_of_borrower: ['', Validators.required],
      provider_subject_no: [''],
      gender: [''],
      civil_status: [''],
      type_of_id: [''],
      birthday_borrower: [''], 
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
    });
  }

  async save() {
    if (this.borrowerForm.invalid) {
      this.borrowerForm.markAllAsTouched();
      this.presentToast('Please fill all required fields correctly.', 'warning');
      return;
    }

    this.isLoading.set(true);
    const formData = this.borrowerForm.value;

    try {
      let response;
      if (this.isEditMode() && this.borrowerId !== null) {
        response = await this.borrowerService.updateBorrower(this.borrowerId, formData);
      } else {
        response = await this.borrowerService.addBorrower(formData);
      }

      if (response.error) {
        console.error('Error saving borrower:', response.error);
        await this.presentToast(`Error: ${response.error.message}`, 'danger');
      } else {
        await this.presentToast(`Borrower ${this.isEditMode() ? 'updated' : 'added'} successfully!`, 'success');
        this.navCtrl.navigateBack('/borrowers');
      }
    } catch (error: any) {
        console.error('Unexpected error during save:', error);
        const errorMessage = error.message || 'An unexpected error occurred.';
        await this.presentToast(`Error: ${errorMessage}`, 'danger');
    } finally {
        this.isLoading.set(false);
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
