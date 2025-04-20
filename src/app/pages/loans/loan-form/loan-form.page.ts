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
import { LoanPaymentSchedule } from '../../../interfaces/loan-payment-schedule.interfaces';
import { PaymentStatus } from 'src/app/enums/payment-status.enum';

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

// --- Remove LoanPaymentSchedule Interface (moved to separate file) ---
/* 
interface LoanPaymentSchedule { ... } 
*/
// --- End Removal ---

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
  providers: [CurrencyPipe, DatePipe]
})

export class LoanFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private loanService = inject(LoanService);
  private borrowerService = inject(BorrowerService);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);
  private currencyPipe = inject(CurrencyPipe);
  private datePipe = inject(DatePipe);

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
  canCalculateSchedule = () => {
    const controls = this.loanForm?.controls;
    if (!controls) return false;
    return controls['principal'].valid && controls['principal'].value > 0 && controls['interest_method'].valid && controls['loan_period'].valid && controls['interest_rate'].valid && controls['tenure_in_months'].valid && controls['repayment_period'].valid && controls['loan_release_date'].valid;
  };
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

    // Ensure schedule is calculated (especially if needed for validation or saving)
    this.generateSchedule(); 
    const scheduleToSave = this.repaymentSchedule();

    // Optional: Add check if schedule calculation is required before saving
    if (this.loanForm.value.interest_method === 'diminishing' && scheduleToSave.length === 0) {
        this.presentToast('Could not calculate repayment schedule. Please check inputs.', 'danger');
        return;
    }

    this.isLoading.set(true);
    const formData = this.loanForm.value;
    console.log('Attempting to save loan:', formData);

    try {
      // 1. Save the main loan details
      const loanResponse = await this.loanService.addLoan(
        formData as Omit<Loan, 'id' | 'created_at' | 'updated_at'> // Ensure type matches service expectation
      );

      if (loanResponse.error || !loanResponse.data) {
        console.error('Error saving loan:', loanResponse.error);
        await this.presentToast(`Error saving loan: ${loanResponse.error?.message || 'Unknown error'}`, 'danger');
        this.isLoading.set(false);
        return; // Stop if loan saving failed
      }
      
      // --- Corrected Access: Get ID directly from data object ---
      const newLoanId = loanResponse.data.id; 
      if (!newLoanId) { // Add a check for the ID itself
         console.error('Error saving loan: Could not retrieve ID from response.');
         await this.presentToast('Error saving loan: Failed to get new loan ID.', 'danger');
         this.isLoading.set(false);
         return;
      }
      console.log('Loan saved successfully with ID:', newLoanId);

      // 2. Save the repayment schedule (if applicable)
      if (scheduleToSave.length > 0 && newLoanId) {
        console.log('Attempting to save repayment schedule for loan ID:', newLoanId);
        const formattedSchedule: LoanPaymentSchedule[] = scheduleToSave.map(item => ({
          loan_id: newLoanId,
          period_number: item.periodNumber,
          due_date: this.datePipe.transform(item.dueDate, 'yyyy-MM-dd') || '', // Format date
          amount_due: item.paymentAmount,
          principal_paid: item.principal,
          interest_paid: item.interest,
          outstanding_balance: item.balance,
          status: PaymentStatus.Pending // Align with expected PaymentStatus enum
        }));

        // Assume loanService has a method addLoanSchedule
        const scheduleResponse = await this.loanService.addLoanSchedule(formattedSchedule);

        if (scheduleResponse.error) {
           console.error('Error saving loan schedule:', scheduleResponse.error);
           // Decide on rollback strategy or just warn user
           await this.presentToast(`Loan saved (ID: ${newLoanId}), but failed to save schedule: ${scheduleResponse.error.message}`, 'warning');
           // Don't navigate back automatically if schedule fails, user might need to retry/fix
           this.isLoading.set(false);
           return; 
        }
        console.log('Loan schedule saved successfully.');
      } else {
         console.log('No repayment schedule to save for this loan type or ID missing.');
      }

      // 3. Success: Both loan and schedule (if applicable) saved
      await this.presentToast('Loan added successfully!', 'success');
      this.navCtrl.back();

    } catch (error: any) {
      console.error('Unexpected error during save operation:', error);
      await this.presentToast(
        `Save failed: ${error.message || 'An unexpected error occurred.'}`,
        'danger'
      );
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
      repayment_period, 
      loan_release_date,
      loan_period // Get the loan period from the form
    } = this.loanForm.value;

    let periodicInterestRate = 0;
    const monthlyRateDecimal = interest_rate / 100; // Monthly rate as decimal

    // --- Calculate Periodic Interest Rate based on Loan Period ---
    // TODO: Implement other cases (daily, weekly, bi-monthly)
    switch (loan_period.toLowerCase()) { 
      case 'monthly':
        periodicInterestRate = monthlyRateDecimal;
        break;
      case 'daily':
        // Example: Approximate daily rate (adjust as needed)
        periodicInterestRate = monthlyRateDecimal / 30; 
        break;
      case 'weekly':
        // Example: Approximate weekly rate (adjust as needed)
        periodicInterestRate = (monthlyRateDecimal * 12) / 52; 
        break;
      case 'bi-monthly': 
         // Example: Approximate rate per half-month (adjust as needed)
        periodicInterestRate = monthlyRateDecimal / 2;
        break;
      default:
        console.error('Unsupported loan period:', loan_period);
        this.repaymentSchedule.set([]);
        return; // Or handle error appropriately
    }
    // --- End Rate Calculation ---
    
    const startDate = new Date(loan_release_date);
    
    const schedule = this.calculateDiminishingSchedule(
      principal,
      periodicInterestRate, // Pass the calculated periodic rate
      repayment_period, 
      startDate,
      loan_period // Pass the loan period for date calculation
    );
    this.repaymentSchedule.set(schedule);
  }

  calculateDiminishingSchedule(
    principal: number,
    periodicRate: number, // Changed from monthlyRate
    numberOfPayments: number,
    startDate: Date,
    loanPeriod: string // Added loanPeriod
  ): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    let balance = principal;

    if (principal <= 0 || periodicRate < 0 || numberOfPayments <= 0) {
      return []; // Return empty if inputs are invalid
    }

    // Calculate periodic payment (PMT formula using periodic rate)
    const periodicPayment = periodicRate === 0 
      ? principal / numberOfPayments
      : principal * (periodicRate * Math.pow(1 + periodicRate, numberOfPayments)) / (Math.pow(1 + periodicRate, numberOfPayments) - 1);

    for (let i = 1; i <= numberOfPayments; i++) {
      const interestPayment = balance * periodicRate;
      let principalPayment = periodicPayment - interestPayment;
      let currentDueDate: Date;

      // --- Calculate Due Date based on Loan Period ---
      // TODO: Implement other cases (daily, weekly, bi-monthly)
       switch (loanPeriod.toLowerCase()) {
        case 'monthly':
          currentDueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
          break;
        case 'daily':
          // Example: Add i days
          currentDueDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
           // Example: Add i weeks (i * 7 days)
          currentDueDate = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          break;
         case 'bi-monthly':
            // Example: Add i * 15 days (approx half month)
           currentDueDate = new Date(startDate.getTime() + i * 15 * 24 * 60 * 60 * 1000);
           break;
        default:
          // Fallback or error - Should not happen if validated in generateSchedule
          currentDueDate = new Date(startDate);
          break;
      }
       // --- End Due Date Calculation ---
      
      // Adjust last payment to ensure balance is exactly 0
      if (i === numberOfPayments) {
        principalPayment = balance; 
        const adjustedPayment = principalPayment + interestPayment;
         balance = 0;
          schedule.push({
            periodNumber: i,
            dueDate: currentDueDate,
            paymentAmount: adjustedPayment, 
            interest: interestPayment,
            principal: principalPayment,
            balance: balance,
          });
      } else {
        balance -= principalPayment;
        if (balance < 0) balance = 0;
        schedule.push({
          periodNumber: i,
          dueDate: currentDueDate,
          paymentAmount: periodicPayment,
          interest: interestPayment,
          principal: principalPayment,
          balance: balance,
        });
      }
    }

    return schedule;
  }
  // --- End Schedule Logic ---

  // --- Add CSV Export Function ---
  exportToCsv() {
    const schedule = this.repaymentSchedule();
    if (schedule.length === 0) {
      console.warn('No schedule data to export.');
      this.presentToast('No schedule data to export.', 'warning');
      return;
    }

    // Define headers
    const headers = ['#', 'Due Date', 'Payment', 'Interest', 'Principal', 'Balance'];
    // Format data rows (using pipes for consistency, remove currency symbols)
    const rows = schedule.map(item => [
      item.periodNumber,
      this.datePipe.transform(item.dueDate, 'yyyy-MM-dd'), // Format date
      this.currencyPipe.transform(item.paymentAmount, '', '', '1.2-2'), // Format currency without symbol
      this.currencyPipe.transform(item.interest, '', '', '1.2-2'),
      this.currencyPipe.transform(item.principal, '', '', '1.2-2'),
      this.currencyPipe.transform(item.balance, '', '', '1.2-2')
    ].join(',')); // Join cells with comma

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n'); // Join rows with newline

    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for download attribute support
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'repayment-schedule.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      console.error('Browser does not support automatic download.');
      this.presentToast('CSV export failed: Browser lacks support.', 'danger');
      // Potential fallback: Display CSV content in a new window/textarea
    }
  }
  // --- End CSV Export Function ---
}
