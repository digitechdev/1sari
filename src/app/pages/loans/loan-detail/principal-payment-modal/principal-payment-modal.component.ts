import { Component, Input, OnInit, signal, computed, inject } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanPaymentSchedule } from '../../../../interfaces/loan-payment-schedule.interfaces';
import { LoanPaymentService } from '../../../../services/loan-payment.service';
import { LoanPayment } from 'src/app/interfaces/loan-payment.interface';
import { LoanService } from '../../../../services/loan.service';

interface RepaymentScheduleItem {
  periodNumber: number;
  dueDate: Date;
  paymentAmount: number;
  interest: number;
  principal: number;
  balance: number;
}

@Component({
  selector: 'app-principal-payment-modal',
  templateUrl: './principal-payment-modal.component.html',
  styleUrls: ['./principal-payment-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  providers: [CurrencyPipe, DatePipe]
})
export class PrincipalPaymentModalComponent implements OnInit {
  @Input() schedule!: LoanPaymentSchedule;
  @Input() totalPrincipalPaid!: number;
  @Input() originalPrincipal!: number;
  
  paymentForm: FormGroup;
  title = signal<string>('Make Principal Payment');
  remainingPrincipal = signal<number>(0);
  amountError = signal<string>('');
  paymentAmount = signal<number>(0);
  
  newRemainingPrincipal = computed(() => {
    return Math.round((this.remainingPrincipal() - this.paymentAmount()) * 100) / 100;
  });

  isModalOpen = signal(false);
  repaymentSchedule = signal<RepaymentScheduleItem[]>([]);

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private loanPaymentService: LoanPaymentService,
    private toastCtrl: ToastController,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
    private loanService: LoanService
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      referenceNumber: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      principalDue: [0, [Validators.required, Validators.min(0)]],
      interestMethod: ['', Validators.required],
      loanPeriod: ['', Validators.required],
      interestRate: [0, [Validators.required, Validators.min(0.01)]],
      tenureInMonths: [0, [Validators.required, Validators.min(1)]],
      repaymentPeriod: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Calculate remaining principal
    this.remainingPrincipal.set(this.originalPrincipal - this.totalPrincipalPaid);

    // For principal payments, we start with 0 amount
    this.paymentForm.patchValue({
      amount: 0,
      principalDue: this.newRemainingPrincipal(),
      interestMethod: '',
      loanPeriod: '',
      interestRate: this.schedule.interest_rate || 0,
      tenureInMonths: this.schedule.tenure_in_months || 0,
      repaymentPeriod: this.schedule.repayment_period || 0
    });

    // Subscribe to amount changes
    this.paymentForm.get('amount')?.valueChanges.subscribe(value => {
      this.paymentAmount.set(value || 0);
      this.validateAmount(value);
      // Update principal due when amount changes
      this.paymentForm.patchValue({
        principalDue: this.newRemainingPrincipal()
      }, { emitEvent: false });
    });

    // Subscribe to form changes to update schedule
    this.paymentForm.valueChanges.subscribe(() => {
      if (this.canCalculateSchedule()) {
        this.calculateSchedule();
      }
    });

    // Calculate initial schedule
    this.calculateSchedule();
  }

  validateAmount(value: number) {
    if (value > this.remainingPrincipal()) {
      const formattedAmount = this.currencyPipe.transform(this.remainingPrincipal(), 'PHP');
      this.amountError.set(`Amount cannot exceed remaining principal of ${formattedAmount}`);
      this.paymentForm.get('amount')?.setErrors({ exceedsRemaining: true });
    } else {
      this.amountError.set('');
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
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

  isFormValid(): boolean {
    const formValue = this.paymentForm.value;
    return (
      this.paymentForm.valid &&
      formValue.paymentMethod &&
      formValue.referenceNumber &&
      formValue.amount > 0 &&
      formValue.interestRate > 0 &&
      formValue.tenureInMonths > 0 &&
      formValue.repaymentPeriod > 0 &&
      this.newRemainingPrincipal() > 0
    );
  }

  async confirmPayment() {
    if (this.isFormValid()) {
      const formValue = this.paymentForm.value;
      const paymentData = {
        schedule_id: this.schedule.id,
        loan_id: this.schedule.loan_id,
        amount: formValue.amount,
        payment_date: new Date(),
        method: formValue.paymentMethod,
        reference: formValue.referenceNumber,
        payment_type: 'principal',
        charges: [],
        total_amount: formValue.amount
      };

      this.modalCtrl.dismiss(paymentData, 'confirm');
    }
  }

  canCalculateSchedule(): boolean {
    const formValue = this.paymentForm.value;
    return !!(
      formValue.interestMethod &&
      formValue.loanPeriod &&
      formValue.interestRate > 0 &&
      formValue.tenureInMonths > 0 &&
      formValue.repaymentPeriod > 0 &&
      this.newRemainingPrincipal() > 0
    );
  }

  calculateSchedule() {
    const formValue = this.paymentForm.value;
    const principal = this.newRemainingPrincipal();
    const interestRate = formValue.interestRate || 0;
    const tenureInMonths = formValue.tenureInMonths || 0;
    const repaymentPeriod = formValue.repaymentPeriod || 0;

    // Calculate schedule based on interest method
    const schedule: RepaymentScheduleItem[] = [];
    let balance = principal;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = tenureInMonths;

    if (formValue.interestMethod === 'diminishing') {
      // Diminishing balance method
      const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      for (let i = 1; i <= numberOfPayments; i++) {
        const interest = balance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        balance -= principalPayment;

        schedule.push({
          periodNumber: i,
          dueDate: this.calculateDueDate(i, formValue.loanPeriod),
          paymentAmount: monthlyPayment,
          interest: interest,
          principal: principalPayment,
          balance: Math.max(0, balance)
        });
      }
    } else {
      // Straight line method
      const principalPayment = principal / numberOfPayments;
      const interestPayment = (principal * interestRate / 100) / numberOfPayments;
      const totalPayment = principalPayment + interestPayment;

      for (let i = 1; i <= numberOfPayments; i++) {
        balance -= principalPayment;

        schedule.push({
          periodNumber: i,
          dueDate: this.calculateDueDate(i, formValue.loanPeriod),
          paymentAmount: totalPayment,
          interest: interestPayment,
          principal: principalPayment,
          balance: Math.max(0, balance)
        });
      }
    }

    this.repaymentSchedule.set(schedule);
  }

  calculateDueDate(period: number, loanPeriod: string): Date {
    const today = new Date();
    const date = new Date(today);
    
    switch (loanPeriod) {
      case 'daily':
        date.setDate(today.getDate() + period);
        break;
      case 'weekly':
        date.setDate(today.getDate() + (period * 7));
        break;
      case 'monthly':
        date.setMonth(today.getMonth() + period);
        break;
      case 'bi-monthly':
        date.setMonth(today.getMonth() + (period * 2));
        break;
      default:
        date.setMonth(today.getMonth() + period);
    }
    
    return date;
  }

  totalPayment = computed(() => {
    return this.repaymentSchedule().reduce((sum, item) => sum + item.paymentAmount, 0);
  });

  totalInterest = computed(() => {
    return this.repaymentSchedule().reduce((sum, item) => sum + item.interest, 0);
  });

  totalPrincipal = computed(() => {
    return this.repaymentSchedule().reduce((sum, item) => sum + item.principal, 0);
  });

  openScheduleModal() {
    this.isModalOpen.set(true);
  }

  exportToCsv() {
    const headers = ['Period', 'Due Date', 'Payment', 'Interest', 'Principal', 'Balance'];
    const data = this.repaymentSchedule().map(item => [
      item.periodNumber,
      this.datePipe.transform(item.dueDate, 'yyyy-MM-dd'),
      this.csvSafe(this.formatNumber(item.paymentAmount)),
      this.csvSafe(this.formatNumber(item.interest)),
      this.csvSafe(this.formatNumber(item.principal)),
      this.csvSafe(this.formatNumber(item.balance))
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'repayment-schedule.csv';
    link.click();
  }

  // Helper to format numbers like the UI (with peso symbol, comma, 2 decimals)
  formatNumber(value: number): string {
    return '₱' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Helper to wrap values with commas in double quotes for CSV
  csvSafe(value: string): string {
    return value.includes(',') ? `"${value}"` : value;
  }
} 