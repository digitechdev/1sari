import { Component, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { LoanPayment } from 'src/app/interfaces/loan-payment.interface';

@Component({
  selector: 'app-payment-details-modal',
  templateUrl: './payment-details-modal.component.html',
  styleUrls: ['./payment-details-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    CurrencyPipe,
    DatePipe
  ],
  providers: [CurrencyPipe, DatePipe]
})
export class PaymentDetailsModalComponent {
  @Input() payment!: LoanPayment;
  
  private modalCtrl = inject(ModalController);
  private currencyPipe = inject(CurrencyPipe);
  private datePipe = inject(DatePipe);

  dismiss() {
    this.modalCtrl.dismiss();
  }
} 