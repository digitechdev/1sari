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
import { PostgrestResponse } from '@supabase/supabase-js';

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
          status: PaymentStatus.Open // Align with expected PaymentStatus enum
        }));

        // Assume loanService has a method addLoanSchedule
        const scheduleResponse: PostgrestResponse<LoanPaymentSchedule> = 
          await this.loanService.addLoanSchedule(formattedSchedule);

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
    // Regenerate and set the schedule for the modal
    this.generateSchedule(); // This now updates the signal internally
    
    // Check if generation succeeded (it sets the signal internally)
    if (this.repaymentSchedule().length > 0) { 
       this.isModalOpen.set(true);
    } else {
       // Show error only if calculation failed for valid inputs
       if(this.canCalculateSchedule()) { // Check if inputs were valid
          this.presentToast('Could not generate schedule. Check inputs.', 'danger');
       } else {
          this.presentToast('Please fill required fields to view schedule.', 'warning');
       }
    }
  }

  generateSchedule(): ScheduleItem[] { // Return the calculated schedule
    // Reset the signal used by the modal initially
    this.repaymentSchedule.set([]);

    // Use a computed signal or local check for required fields
    const canCalc = (
      this.loanForm.controls['principal']?.valid &&
      this.loanForm.controls['interest_rate']?.valid &&
      this.loanForm.controls['repayment_period']?.valid &&
      this.loanForm.controls['loan_release_date']?.valid &&
      this.loanForm.controls['interest_method']?.valid && // Check interest method validity
      this.loanForm.controls['loan_period']?.valid && // Check loan period validity
      this.loanForm.controls['principal']?.value > 0 && 
      this.loanForm.controls['repayment_period']?.value > 0
    );

    if (!canCalc) {
      console.warn('Cannot generate schedule, form requirements not met.');
      return []; // Return empty schedule
    }

    const { 
      principal, 
      interest_rate, 
      repayment_period, 
      loan_release_date,
      loan_period,
      interest_method // Get interest method
    } = this.loanForm.value;

    let periodicInterestRate = 0;
    const monthlyRateDecimal = interest_rate / 100; 

    switch (loan_period.toLowerCase()) { 
      case 'monthly': periodicInterestRate = monthlyRateDecimal; break;
      case 'daily': periodicInterestRate = monthlyRateDecimal / 30; break; // Approx
      case 'weekly': periodicInterestRate = (monthlyRateDecimal * 12) / 52; break; // Approx
      case 'bi-monthly': periodicInterestRate = monthlyRateDecimal / 2; break; // Approx
      default: console.error('Unsupported loan period:', loan_period); return [];
    }
        
    const startDate = new Date(loan_release_date);
    let calculatedSchedule: ScheduleItem[] = [];

    // --- Call appropriate calculation based on interest method ---
    if (interest_method === 'diminishing') {
        calculatedSchedule = this.calculateDiminishingSchedule(
          principal,
          periodicInterestRate, 
          repayment_period, 
          startDate,
          loan_period 
        );
        console.log('Diminishing schedule calculated:', calculatedSchedule);

    } else if (interest_method === 'straight') {
         calculatedSchedule = this.calculateStraightSchedule(
          principal,
          periodicInterestRate, 
          repayment_period, 
          startDate,
          loan_period 
        );
         console.log('Straight schedule calculated:', calculatedSchedule);
    } else {
        console.warn('Unsupported interest method for schedule generation:', interest_method);
    }
    // --- End Method Call Logic ---

    // --- Always update the signal for the modal --- 
    this.repaymentSchedule.set(calculatedSchedule);
    // --- End Signal Update ---

    return calculatedSchedule; // Return the schedule for potential use elsewhere (e.g., saving)
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

  // --- Add Straight Interest Calculation Method ---
  calculateStraightSchedule(
    principal: number,
    periodicRate: number, // The rate for the chosen period (e.g., monthly)
    numberOfPayments: number,
    startDate: Date,
    loanPeriod: string // e.g., 'monthly', 'daily'
  ): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    if (principal <= 0 || periodicRate < 0 || numberOfPayments <= 0) {
      return [];
    }

    // Straight Interest Calculations
    const totalInterest = principal * periodicRate * numberOfPayments;
    const principalPerPeriod = principal / numberOfPayments;
    const interestPerPeriod = totalInterest / numberOfPayments;
    const periodicPayment = principalPerPeriod + interestPerPeriod;

    let balance = principal;

    for (let i = 1; i <= numberOfPayments; i++) {
      balance -= principalPerPeriod;
      if (i === numberOfPayments) {
          // Ensure balance is exactly 0 on the last payment due to potential floating point issues
          balance = 0; 
      }
      if (balance < 0) balance = 0; // Prevent negative balance display

      let currentDueDate: Date;
      // --- Calculate Due Date based on Loan Period ---
      // TODO: Refine date calculations for other periods
       switch (loanPeriod.toLowerCase()) {
        case 'monthly':
          currentDueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
          break;
        case 'daily':
          currentDueDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          currentDueDate = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          break;
         case 'bi-monthly':
           currentDueDate = new Date(startDate.getTime() + i * 15 * 24 * 60 * 60 * 1000); // Approx
           break;
        default:
          currentDueDate = new Date(startDate);
          break;
      }
       // --- End Due Date Calculation ---

      schedule.push({
        periodNumber: i,
        dueDate: currentDueDate,
        paymentAmount: periodicPayment,
        interest: interestPerPeriod,
        principal: principalPerPeriod,
        balance: balance,
      });
    }
    return schedule;
  }
  // --- End Straight Interest Method ---

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
