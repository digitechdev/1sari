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

  loadData() {
    // Get ID from route, converting to number
    const idParam = this.route.snapshot.paramMap.get('id');
    const loanId = idParam ? +idParam : null;

    if (loanId) {
      this.loadLoanDetails(loanId);
    } else {
      console.error('Loan ID not found in route parameters');
      this.errorMessage.set('Loan ID is missing.');
      this.presentToast('Could not load loan details: ID missing.', 'danger');
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

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }

  async payPrincipal(row: LoanPaymentSchedule) {
    // TODO: Implement principal payment logic
    await this.presentToast(`Processing principal payment for period ${row.period_number}`, 'success');
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
      // Handle the payment data
      console.log('Payment data:', data);
      // TODO: Call your payment service to process the payment
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