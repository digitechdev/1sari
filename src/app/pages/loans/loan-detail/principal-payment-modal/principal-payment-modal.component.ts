import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanPaymentSchedule } from '../../../../interfaces/loan-payment-schedule.interfaces';
import { LoanPaymentService } from '../../../../services/loan-payment.service';
import { LoanPayment } from 'src/app/interfaces/loan-payment.interface';

@Component({
  selector: 'app-principal-payment-modal',
  templateUrl: './principal-payment-modal.component.html',
  styleUrls: ['./principal-payment-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  providers: [CurrencyPipe]
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

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private loanPaymentService: LoanPaymentService,
    private toastCtrl: ToastController,
    private currencyPipe: CurrencyPipe
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      referenceNumber: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      principalDue: [0, [Validators.required, Validators.min(0)]],
      interestMethod: ['', Validators.required],
      loanPeriod: ['', Validators.required],
      interestRate: [0, [Validators.required, Validators.min(0)]],
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
      principalDue: this.schedule.principal_paid,
      interestMethod: this.schedule.interest_method,
      loanPeriod: this.schedule.loan_period,
      interestRate: this.schedule.interest_rate,
      tenureInMonths: this.schedule.tenure_in_months,
      repaymentPeriod: this.schedule.repayment_period
    });

    // Subscribe to amount changes
    this.paymentForm.get('amount')?.valueChanges.subscribe(value => {
      this.paymentAmount.set(value || 0);
      this.validateAmount(value);
    });
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

  async confirmPayment() {
    if (this.paymentForm.valid) {
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
} 