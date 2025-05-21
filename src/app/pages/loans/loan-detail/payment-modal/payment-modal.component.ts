import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanPaymentSchedule } from '../../../../interfaces/loan-payment-schedule.interfaces';
import { LoanPaymentService } from '../../../../services/loan-payment.service';
import { LoanPayment } from 'src/app/interfaces/loan-payment.interface';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class PaymentModalComponent implements OnInit {
  @Input() schedule!: LoanPaymentSchedule;
  
  paymentForm: FormGroup;
  latePaymentFee = signal<number>(0);
  showAdditionalFees = signal<boolean>(false);

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private loanPaymentService: LoanPaymentService,
    private toastCtrl: ToastController
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      referenceNumber: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      convenienceFee: [0, [Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.paymentForm.patchValue({
      amount: this.schedule.amount_due
    });
    this.calculateLatePaymentFee();
  }

  onPaymentMethodChange(method: string) {
    this.showAdditionalFees.set(method === 'Gcash' || method === 'Bank');
    if (!this.showAdditionalFees()) {
      this.paymentForm.patchValue({ convenienceFee: 0 });
    }
  }

  calculateLatePaymentFee() {
    const today = new Date();
    const dueDate = new Date(this.schedule.due_date);
    
    if (today > dueDate) {
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      this.latePaymentFee.set(this.paymentForm.get('amount')?.value * (daysLate * 0.01));
    } else {
      this.latePaymentFee.set(0);
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
        charges: [
          {
            charge_type: 'Late Payment Fee',
            amount: this.latePaymentFee()
          },
          {
            charge_type: 'Convenience Fee',
            amount: formValue.convenienceFee
          }
        ],
        total_amount: formValue.amount + this.latePaymentFee() + formValue.convenienceFee
      };

      this.modalCtrl.dismiss(paymentData, 'confirm');
    }
  }
}
