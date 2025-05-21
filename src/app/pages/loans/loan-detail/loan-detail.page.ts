import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonicModule, NavController, ToastController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoanService } from '../../../services/loan.service';
import { Loan } from '../../../interfaces/loan.interfaces';
import { LoanPaymentSchedule } from '../../../interfaces/loan-payment-schedule.interfaces';
import { PaymentStatus } from 'src/app/enums/payment-status.enum';
import { Sale } from '../../../models/sale.interface';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { PaymentModalComponent } from './payment-modal/payment-modal.component';
import { PrincipalPaymentModalComponent } from './principal-payment-modal/principal-payment-modal.component';
import { PaymentDetailsModalComponent } from './payment-details-modal/payment-details-modal.component';
import { LoanPaymentService } from '../../../services/loan-payment.service';
import { LoanPayment } from '../../../interfaces/loan-payment.interface';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.page.html',
  styleUrls: ['./loan-detail.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    CurrencyPipe, 
    DatePipe,
    NgxDatatableModule
  ],
  providers: [CurrencyPipe, DatePipe] // Provide pipes
})
export class LoanDetailPage implements OnInit {
  @ViewChild('dateTemplate') dateTemplate!: TemplateRef<any>;
  @ViewChild('currencyTemplate') currencyTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private loanService = inject(LoanService);
  private loanPaymentService = inject(LoanPaymentService);
  private toastCtrl = inject(ToastController);
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private modalCtrl = inject(ModalController);

  // Using 'any' for loanDetail initially because Supabase join brings nested objects
  loanDetail = signal<any | null>(null); 
  loanSchedule = signal<LoanPaymentSchedule[] | null>(null);
  saleItems = signal<Sale[] | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // ngx-datatable configuration
  ColumnMode = ColumnMode;
  scheduleColumns = [
    { name: '#', prop: 'period_number', width: 50 },
    { name: 'Due Date', prop: 'due_date', width: 120 },
    { name: 'Payment', prop: 'amount_due', width: 120 },
    { name: 'Interest', prop: 'interest_paid', width: 120 },
    { name: 'Principal', prop: 'principal_paid', width: 120 },
    { name: 'Balance', prop: 'outstanding_balance', width: 120 },
    { name: 'Status', prop: 'status', width: 100 },
    { 
      name: 'Actions', 
      prop: 'actions',
      width: 150,
      sortable: false,
      canAutoResize: false,
      cellClass: 'actions-cell'
    }
  ];

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadLoanDetails(parseInt(id, 10));
    } else {
      this.errorMessage.set('No loan ID provided');
      this.presentToast('No loan ID provided', 'warning');
    }
  }

  async loadLoanDetails(id: number) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.loanDetail.set(null); // Reset previous data
    this.loanSchedule.set(null);
    this.saleItems.set(null);

    try {
      const response = await this.loanService.getLoanById(id);
      if (response.error) {
        console.error('Error fetching loan details:', response.error);
        this.errorMessage.set(response.error.message || 'Failed to load loan data.');
        this.presentToast(this.errorMessage()!, 'danger');
      } else if (response.data) {
        console.log('Fetched Loan Detail:', response.data);
        this.loanDetail.set(response.data);
        // Extract schedule if it exists on the response data
        this.loanSchedule.set(response.data.schedule || []);
        // Extract sales items if they exist on the response data
        this.saleItems.set(response.data.sales || []);
      } else {
        this.errorMessage.set('Loan not found.');
        this.presentToast('Loan not found.', 'warning');
      }
    } catch (error: any) {
      console.error('Unexpected error loading loan details:', error);
      this.errorMessage.set('An unexpected error occurred.');
      this.presentToast(this.errorMessage()!, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  async payPrincipal(row: LoanPaymentSchedule) {
    // Calculate total principal paid from all paid schedules
    const totalPrincipalPaid = this.loanSchedule()?.reduce((sum, schedule) => {
      if (schedule.status === 'Paid') {
        return sum + (schedule.principal_paid || 0);
      }
      return sum;
    }, 0) || 0;

    const modal = await this.modalCtrl.create({
      component: PrincipalPaymentModalComponent,
      componentProps: {
        schedule: row,
        totalPrincipalPaid: totalPrincipalPaid,
        originalPrincipal: this.loanDetail()?.principal || 0
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data) {
      try {
        const response = await this.loanPaymentService.recordPayment(data as LoanPayment);
        
        if (response.error) {
          await this.presentToast('Failed to record payment: ' + response.error.message, 'danger');
          return;
        }

        // Refresh the loan details which includes the schedule
        await this.loadLoanDetails(row.loan_id);
        await this.presentToast('Principal payment recorded successfully', 'success');
      } catch (error: any) {
        await this.presentToast('An unexpected error occurred: ' + error.message, 'danger');
      }
    }
  }

  async payInterest(row: LoanPaymentSchedule) {
    // TODO: Implement interest payment logic
    await this.presentToast(`Processing interest payment for period ${row.period_number}`, 'success');
  }

  async payAmortization(schedule: LoanPaymentSchedule) {
    const modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
      componentProps: {
        schedule: schedule
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data) {
      try {
        const response = await this.loanPaymentService.recordPayment(data as LoanPayment);
        
        if (response.error) {
          await this.presentToast('Failed to record payment: ' + response.error.message, 'danger');
          return;
        }

        // Refresh the loan details which includes the schedule
        await this.loadLoanDetails(schedule.loan_id);
        await this.presentToast('Payment recorded successfully', 'success');
      } catch (error: any) {
        await this.presentToast('An unexpected error occurred: ' + error.message, 'danger');
      }
    }
  }

  async viewPaymentDetails(schedule: LoanPaymentSchedule) {
    try {
      // Fetch payment details for this schedule
      const response = await this.loanPaymentService.getLoanPayments(schedule.loan_id);
      
      if (response.error) {
        console.error('Error fetching payment details:', response.error);
        await this.presentToast('Error fetching payment details: ' + response.error.message, 'danger');
        return;
      }

      if (!response.data || response.data.length === 0) {
        await this.presentToast('No payment records found for this loan', 'warning');
        return;
      }

      // Find the payment for this specific schedule
      const payment = response.data.find(p => p.schedule_id === schedule.id);
      
      if (!payment) {
        await this.presentToast('No payment details found for this schedule', 'warning');
        return;
      }

      // Open payment details modal
      const modal = await this.modalCtrl.create({
        component: PaymentDetailsModalComponent,
        componentProps: {
          payment: payment
        }
      });

      await modal.present();
    } catch (error: any) {
      console.error('Error viewing payment details:', error);
      await this.presentToast('Error viewing payment details: ' + (error.message || 'Unknown error'), 'danger');
    }
  }

  onActivate(event: any) {
    if (event.type === 'click' && event.column.prop === 'actions') {
      const row = event.row;
      const target = event.event.target as HTMLElement;
      
      if (target.closest('.pay-principal')) {
        this.payPrincipal(row);
      } else if (target.closest('.pay-interest')) {
        this.payInterest(row);
      } else if (target.closest('.pay-amortization')) {
        this.payAmortization(row);
      }
    }
  }
} 