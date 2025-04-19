import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { LoanService } from '../../services/loan.service';
import { Loan } from '../../interfaces/loan.interfaces';
import { BorrowerService } from '../../services/borrower.service';
import { AccountInformation } from '../../interfaces/account-information.interfaces';

@Component({
  selector: 'app-loan-form',
  templateUrl: './loan-form.page.html',
  styleUrls: ['./loan-form.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class LoanFormPage implements OnInit {

  private fb = inject(FormBuilder);
  private loanService = inject(LoanService);
  private borrowerService = inject(BorrowerService);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);

  loanForm!: FormGroup;
  borrowers = signal<AccountInformation[]>([]);
  isLoading = signal<boolean>(false);
  isBorrowersLoading = signal<boolean>(false);

  ngOnInit() {
    this.initForm();
    this.loadBorrowers();
  }

  initForm() {
    this.loanForm = this.fb.group({
      borrower_id: [null, Validators.required],
      loan_amount: [null, [Validators.required, Validators.min(0)]],
      loan_term: [null, [Validators.required, Validators.min(1)]],
      interest_rate: [null, [Validators.required, Validators.min(0)]],
      status: ['Pending', Validators.required],
      disbursement_date: [null],
      purpose: ['']
    });
  }

  async loadBorrowers() {
    this.isBorrowersLoading.set(true);
    try {
      const response = await this.borrowerService.getAllBorrowers();
      if (response.error) {
        console.error('Error fetching borrowers:', response.error);
        this.presentToast('Failed to load borrowers list.', 'danger');
        this.borrowers.set([]);
      } else {
        this.borrowers.set(response.data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching borrowers:', error);
      this.presentToast('An error occurred while loading borrowers.', 'danger');
      this.borrowers.set([]);
    } finally {
      this.isBorrowersLoading.set(false);
    }
  }

  async saveLoan() {
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      this.presentToast('Please fill all required fields correctly.', 'warning');
      return;
    }

    this.isLoading.set(true);
    const formData = this.loanForm.value;
    console.log('Attempting to save loan:', formData);

    try {
      const response = await this.loanService.addLoan(formData as Omit<Loan, 'id' | 'created_at'>);
      
      if (response.error) {
        console.error('Error saving loan:', response.error);
        await this.presentToast(`Error: ${response.error.message}`, 'danger');
      } else {
        console.log('Loan saved successfully:', response.data);
        await this.presentToast('Loan added successfully!', 'success');
        this.navCtrl.back();
      }
    } catch (error: any) {
      console.error('Unexpected error during save:', error);
      await this.presentToast(`Error: ${error.message || 'An unexpected error occurred.'}`, 'danger');
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
