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
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

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
    NgxDatatableModule,
    RouterLink
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
  private supabaseService = inject(SupabaseService);

  // Using 'any' for loanDetail initially because Supabase join brings nested objects
  loanDetail = signal<any | null>(null); 
  loanSchedule = signal<LoanPaymentSchedule[] | null>(null);
  saleItems = signal<Sale[] | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  childLoans = signal<{id: number}[]>([]);

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
    this.childLoans.set([]); // Reset child loans

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
        // Fetch child loans (loans restructured from this one)
        this.loadChildLoans(id);
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

  /**
   * Loads any loans that were restructured from this loan (have this loan's ID as parent_loan_id)
   * @param loanId The ID of the current loan
   */
  async loadChildLoans(loanId: number) {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('loans')
        .select('id')
        .eq('parent_loan_id', loanId);
      
      if (error) {
        console.error('Error fetching child loans:', error);
        return;
      }
      
      this.childLoans.set(data || []);
      console.log(`Found ${data?.length || 0} restructured loans from loan #${loanId}`);
    } catch (error: any) {
      console.error('Unexpected error loading child loans:', error);
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
        // Calculate remaining principal
        const remainingPrincipal = (this.loanDetail()?.principal || 0) - (totalPrincipalPaid + (data.paymentData.amount || 0));

        const response = await this.loanPaymentService.recordPrincipalPayment(
          data.paymentData,
          data.newLoanTerms,
          remainingPrincipal
        );

        if (response.error) {
          await this.presentToast('Failed to record principal payment: ' + response.error.message, 'danger');
          return;
        }

        if (remainingPrincipal > 0 && data.newLoanTerms) {
          await this.presentToast('Principal payment recorded and loan restructured successfully', 'success');
        } else {
          await this.presentToast('Principal payment recorded successfully', 'success');
        }

        // Refresh the loan details which includes the schedule
        await this.loadLoanDetails(row.loan_id);
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

  /**
   * Exports the loan repayment schedule to a CSV file.
   * Creates a file that matches the layout from the reference image.
   */
  exportScheduleToCsv(): void {
    try {
      if (!this.loanDetail() || !this.loanSchedule()) {
        this.presentToast('Loan data not available for export', 'warning');
        return;
      }

      // Get the loan and schedule data
      const loan = this.loanDetail();
      const schedules = this.loanSchedule() || [] as any[]; // Use any[] to accommodate the enhanced fields
      
      // Prepare CSV content with headers
      let csvContent = '1SARI Financing Corp.\n';
      csvContent += '236 Pablo Dela Cruz Street,\n';
      csvContent += 'Novaliches, Quezon City\n\n';
      csvContent += `${loan.loan_period?.toUpperCase() || 'BI-MONTHLY'} AMORTIZATION\n\n`;
      
      // Add borrower information
      csvContent += `BORROWER,${loan.borrower?.name_of_borrower || 'N/A'}\n`;
      csvContent += `CO-BORROWER,${loan.borrower?.co_borrower_name || ''}\n`;
      csvContent += `STORE NAME,${loan.store_name || ''}\n`;
      csvContent += `HOME ADDRESS,${loan.borrower?.address || ''}\n`;
      csvContent += `STORE ADDRESS,${loan.store_address || ''}\n`;
      csvContent += `PRINCIPAL,${this.formatCurrency(loan.principal)}\n`;
      csvContent += `INTEREST RATE PER MONTH,${loan.interest_rate}%\n`;
      csvContent += `TENOR (BI-MONTHLY),${loan.tenure_in_months}\n`;
      csvContent += `VALUE DATE,${this.formatDate(loan.loan_release_date)}\n\n`;
      
      // Add table headers
      csvContent += 'Date of Amortization,Daily Amortization,Interest,Principal,Outstanding Balance,Status,Payment Date,Total Amount Paid,Cash Convenience Fee,Late Payment Fee,Mode of Payment\n';
      
      // Add row data
      schedules.forEach((schedule, index) => {
        // Format date as in the image: "Saturday, March 01, 2025"
        csvContent += `${this.formatDate(schedule.due_date)},`;
        csvContent += `${this.formatCurrency(schedule.amount_due)},`;
        csvContent += `${this.formatCurrency(schedule.interest_paid)},`;
        csvContent += `${this.formatCurrency(schedule.principal_paid)},`;
        csvContent += `${this.formatCurrency(schedule.outstanding_balance)},`;
        
        // Status
        csvContent += `${schedule.status},`;
        
        // Payment Date - format like "5-Mar-25" for paid items
        if (schedule.actual_payment_date) {
          const paymentDate = new Date(schedule.actual_payment_date);
          const formattedDate = this.datePipe.transform(paymentDate, 'd-MMM-yy') || '';
          csvContent += `${formattedDate},`;
        } else {
          csvContent += ',';
        }
        
        // Total Amount Paid
        csvContent += `${schedule.amount_paid ? this.formatCurrency(schedule.amount_paid) : ''},`;
        
        // Cash Convenience Fee - use '-' if not applicable
        csvContent += `${schedule.convenience_fee ? this.formatCurrency(schedule.convenience_fee) : '-'},`;
        
        // Late Payment Fee - use '-' if not applicable
        csvContent += `${schedule.late_fee ? this.formatCurrency(schedule.late_fee) : '-'},`;
        
        // Mode of Payment - "Post Dated Check" for paid items as shown in image
        if (schedule.status === 'Paid') {
          csvContent += `Post Dated Check\n`;
        } else {
          csvContent += `\n`;
        }
      });
      
      // Calculate totals
      const totalDailyAmortization = schedules.reduce((sum, item) => sum + (item.amount_due || 0), 0);
      const totalInterest = schedules.reduce((sum, item) => sum + (item.interest_paid || 0), 0);
      const totalPrincipal = schedules.reduce((sum, item) => sum + (item.principal_paid || 0), 0);
      const totalAmountPaid = schedules.reduce((sum, item) => {
        if (item.status === 'Paid') {
          return sum + (item.amount_paid || 0);
        }
        return sum;
      }, 0);
      
      // Add totals row
      csvContent += `\nTOTAL,${this.formatCurrency(totalDailyAmortization)},${this.formatCurrency(totalInterest)},${this.formatCurrency(totalPrincipal)},,,,,,,\n\n`;
      
      // Calculate remaining balance
      const remainingPrincipal = schedules.filter(s => s.status !== 'Paid').reduce((sum, item) => sum + (item.principal_paid || 0), 0);
      const remainingInterest = schedules.filter(s => s.status !== 'Paid').reduce((sum, item) => sum + (item.interest_paid || 0), 0);
      const remainingBalance = remainingPrincipal + remainingInterest;
      
      // Add total payments and remaining balance
      csvContent += `,,,,,,,,${this.formatCurrency(totalAmountPaid)},Total Payments Made (less cash convenience fee & late payment fee if applicable)\n`;
      csvContent += `,,,,,,,,${this.formatCurrency(remainingBalance)},Remaining Balance (Principal + Interest)\n\n`;
      
      // Add late payment information if applicable
      if (loan.status !== 'Paid') {
        // Get next unpaid schedule
        const nextUnpaid = schedules.find(s => s.status !== 'Paid');
        if (nextUnpaid) {
          const dueDate = new Date(nextUnpaid.due_date);
          const today = new Date();
          const daysLate = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          
          if (daysLate > 0) {
            // Calculate late payment charge at 300/week or fraction thereof
            const weeksLate = Math.ceil(daysLate / 7);
            const lateCharge = weeksLate * 300;
            
            // Format dates to match the image exactly
            const formattedDueDate = this.formatDate(nextUnpaid.due_date);
            const formattedToday = this.formatDate(today.toISOString());
            
            csvContent += `Late Payment Charges (300/week),PHP,${this.formatCurrency(lateCharge)},Note:(300 divided by 7 days multiply by number of arrears - ${formattedDueDate} - ${formattedToday} is ${daysLate} days)\n`;
            csvContent += `Total Principal Due,PHP,${this.formatCurrency(nextUnpaid.principal_paid)},${formattedDueDate}\n`;
            csvContent += `Total Interest Due,PHP,${this.formatCurrency(nextUnpaid.interest_paid)},${formattedDueDate}\n`;
            
            const totalDue = (nextUnpaid.principal_paid || 0) + (nextUnpaid.interest_paid || 0) + lateCharge;
            csvContent += `TOTAL AMOUNT DUE as of,PHP,${this.formatCurrency(totalDue)},${formattedToday}\n`;
          }
        }
      }
      
      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `Loan_${loan.id}_Amortization_${this.formatDateFileName(new Date().toISOString())}.csv`;
      
      // Set up download link
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      this.presentToast('Export successful! Downloading file...', 'success');
    } catch (error: any) {
      console.error('Error exporting loan schedule:', error);
      this.presentToast('Error exporting loan schedule: ' + (error.message || 'Unknown error'), 'danger');
    }
  }
  
  // Helper methods for CSV formatting
  private formatDate(dateString?: string): string {
    if (!dateString) return '';
    return this.datePipe.transform(dateString, 'EEEE, MMMM d, yyyy') || '';
  }
  
  private formatDateFileName(dateString: string): string {
    return this.datePipe.transform(dateString, 'yyyyMMdd') || '';
  }
  
  private formatCurrency(value?: number): string {
    if (value === undefined || value === null) return '';
    // Remove the PHP symbol when formatting for CSV
    const formatted = this.currencyPipe.transform(value, 'PHP', 'symbol', '1.2-2');
    return formatted ? formatted.replace('PHP', '').trim() : '';
  }
} 