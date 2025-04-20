import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { LoanService } from '../../../services/loan.service';
import { Loan } from '../../../interfaces/loan.interfaces';
import { BorrowerService } from '../../../services/borrower.service';
import { AccountInformation } from '../../../interfaces/account-information.interfaces';

// --- Add ScheduleItem Interface ---
interface ScheduleItem {
  periodNumber: number;
  dueDate: Date; // Use Date object for easier manipulation
  paymentAmount: number;
  interest: number;
  principal: number;
  balance: number;
}
// --- End Interface ---

@Component({
  selector: 'app-loan-form',
  templateUrl: './loan-form.page.html',
  styleUrls: ['./loan-form.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    ReactiveFormsModule, 
    CurrencyPipe, // Add CurrencyPipe here
    DatePipe // Add DatePipe here
  ],
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

  // --- Add Signals for Schedule ---
  repaymentSchedule = signal<ScheduleItem[]>([]);
  isModalOpen = signal(false);
  // --- End Signals ---

  ngOnInit() {
    this.initForm();
    this.loadBorrowers();
  }

  // --- Add Computed Signal for Button Disabling ---
  canCalculateSchedule = computed(() => {
    const controls = this.loanForm?.controls;
    if (!controls) return false;
    // return (
    //   controls['principal']?.valid &&
    //   controls['interest_rate']?.valid &&
    //   controls['repayment_period']?.valid &&
    //   controls['loan_release_date']?.valid &&
    //   controls['interest_method']?.value === 'diminishing' && // Only for diminishing
    //   controls['principal']?.value > 0 && 
    //   controls['repayment_period']?.value > 0
    // );
    return true;
  });
  // --- End Computed Signal ---

  // --- Add Computed Signals for Totals ---
  totalPayment = computed(() => this.repaymentSchedule().reduce((sum, item) => sum + item.paymentAmount, 0));
  totalInterest = computed(() => this.repaymentSchedule().reduce((sum, item) => sum + item.interest, 0));
  totalPrincipal = computed(() => this.repaymentSchedule().reduce((sum, item) => sum + item.principal, 0));
  // --- End Computed Signals for Totals ---

  initForm() {
    this.loanForm = this.fb.group({
      borrower_id: [null, Validators.required],
      principal: [null, [Validators.required, Validators.min(0)]],
      interest_rate: [null, [Validators.required, Validators.min(0)]],
      status: ['Pending', Validators.required],
      loan_release_date: [null, Validators.required],
      purpose: [''],
      disbursement_method: [null, Validators.required],
      repayment_period: [null, [Validators.required, Validators.min(1)]],
      loan_period: [null, Validators.required],
      interest_method: [null, Validators.required],
      tenure_in_months: [null, [Validators.required, Validators.min(1)]],
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
      this.presentToast(
        'Please fill all required fields correctly.',
        'warning'
      );
      return;
    }

    this.isLoading.set(true);
    const formData = this.loanForm.value;
    console.log('Attempting to save loan:', formData);

    // try {
    //   const response = await this.loanService.addLoan(
    //     formData as Omit<Loan, 'id' | 'created_at'>
    //   );

    //   if (response.error) {
    //     console.error('Error saving loan:', response.error);
    //     await this.presentToast(`Error: ${response.error.message}`, 'danger');
    //   } else {
    //     console.log('Loan saved successfully:', response.data);
    //     await this.presentToast('Loan added successfully!', 'success');
    //     this.navCtrl.back();
    //   }
    // } catch (error: any) {
    //   console.error('Unexpected error during save:', error);
    //   await this.presentToast(
    //     `Error: ${error.message || 'An unexpected error occurred.'}`,
    //     'danger'
    //   );
    // } finally {
    //   this.isLoading.set(false);
    // }
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

  // --- Add Schedule Calculation and Modal Logic ---
  openScheduleModal() {
    this.generateSchedule();
    this.isModalOpen.set(true);
  }

  generateSchedule() {
    if (!this.canCalculateSchedule()) {
      this.repaymentSchedule.set([]);
      console.warn('Cannot generate schedule, form requirements not met.');
      return;
    }

    const { 
      principal, 
      interest_rate, 
      repayment_period, // Use this for number of payments
      loan_release_date,
      // tenure_in_months, // Use repayment_period for N
      // loan_period // Assuming monthly based on image/form
    } = this.loanForm.value;

    // Corrected: Treat interest_rate input as MONTHLY % rate
    const monthlyInterestRate = interest_rate / 100;
    const startDate = new Date(loan_release_date);
    
    const schedule = this.calculateDiminishingSchedule(
      principal,
      monthlyInterestRate, // Pass the correct monthly decimal rate
      repayment_period, // N = number of payments
      startDate
    );
    this.repaymentSchedule.set(schedule);
  }

  calculateDiminishingSchedule(
    principal: number,
    monthlyRate: number,
    numberOfPayments: number,
    startDate: Date
  ): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    let balance = principal;

    if (principal <= 0 || monthlyRate < 0 || numberOfPayments <= 0) {
      return []; // Return empty if inputs are invalid
    }

    // Calculate monthly payment (PMT formula)
    // Handle edge case where rate is 0
    const monthlyPayment = monthlyRate === 0 
      ? principal / numberOfPayments
      : principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    for (let i = 1; i <= numberOfPayments; i++) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      // Adjust last payment to ensure balance is exactly 0
      if (i === numberOfPayments) {
        principalPayment = balance; // Pay off remaining balance
        // Recalculate payment amount for the last period if principal was adjusted
        const adjustedPayment = principalPayment + interestPayment;
         balance = 0;
          schedule.push({
            periodNumber: i,
            // Calculate due date (simple month increment for now)
            dueDate: new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate()),
            paymentAmount: adjustedPayment, 
            interest: interestPayment,
            principal: principalPayment,
            balance: balance,
          });
      } else {
        balance -= principalPayment;
         // Ensure balance doesn't go negative due to floating point issues
        if (balance < 0) balance = 0;
        schedule.push({
          periodNumber: i,
          // Calculate due date (simple month increment for now)
          dueDate: new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate()),
          paymentAmount: monthlyPayment,
          interest: interestPayment,
          principal: principalPayment,
          balance: balance,
        });
      }

     
    }

    return schedule;
  }
  // --- End Schedule Logic ---
}
