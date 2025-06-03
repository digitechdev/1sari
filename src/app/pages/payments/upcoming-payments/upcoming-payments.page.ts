import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonMenuButton, 
  IonButton, 
  IonIcon, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonText,
  IonSpinner,
  IonList,
  IonItem,
  IonBadge,
  ToastController,
  AlertController, IonCardSubtitle } from '@ionic/angular/standalone';
import { NgClass } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  timeOutline,
  calendarOutline,
  notificationsOutline,
  refreshOutline,
  cashOutline,
  downloadOutline
} from 'ionicons/icons';
import { 
  LoanPaymentScheduleService, 
  UpcomingPayment, 
  DueDateFilterType 
} from '../../../services/loan-payment-schedule.service';

@Component({
  selector: 'app-upcoming-payments',
  templateUrl: './upcoming-payments.page.html',
  styleUrls: ['./upcoming-payments.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, 
    CommonModule,
    FormsModule,
    RouterLink,
    NgClass,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonMenuButton, 
    IonButton, 
    IonIcon, 
    IonSegment, 
    IonSegmentButton, 
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar,
    IonText,
    IonSpinner,
    IonList,
    IonItem,
    IonBadge
  ],
  providers: [DatePipe, CurrencyPipe]
})
export class UpcomingPaymentsPage implements OnInit {
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private paymentScheduleService = inject(LoanPaymentScheduleService);

  // Data for the upcoming payments
  isLoading = signal<boolean>(true);
  errorLoading = signal<string | null>(null);
  searchTerm = signal<string>('');
  upcomingPayments = signal<UpcomingPayment[]>([]);
  dueDateFilter = signal<DueDateFilterType>('this-week');
  pageSize = 10;
  currentPage = signal(1);
  hasMore = signal(true);
  totalCount = signal(0);

  displayableUpcomingPayments = computed(() => {
    return this.upcomingPayments();
  });

  constructor() {
    // Register icons
    addIcons({
      addOutline,
      timeOutline,
      calendarOutline,
      notificationsOutline,
      refreshOutline,
      cashOutline,
      downloadOutline
    });
  }

  ngOnInit() {
    this.loadUpcomingPayments();
  }

  navigateToPaymentSection(event: any) {
    const section = event.detail.value;
    switch (section) {
      case 'history':
        this.router.navigate(['/payments/history']);
        break;
      case 'upcoming':
        this.router.navigate(['/payments/upcoming']);
        break;
      case 'missed':
        this.router.navigate(['/payments/missed']);
        break;
      default:
        this.router.navigate(['/payments/history']);
    }
  }

  handleSearch(event: any) {
    const term = event.target.value || '';
    this.searchTerm.set(term);
    
    // Reset to page 1 when searching
    this.currentPage.set(1);
    
    // Reload with search term
    this.loadUpcomingPayments(false);
  }

  setDueDateFilter(event: any) {
    const value = event.detail.value as DueDateFilterType;
    this.dueDateFilter.set(value);
    
    // Reset to page 1 when changing filter
    this.currentPage.set(1);
    
    // Reload with new filter
    this.loadUpcomingPayments(true);
  }

  async loadUpcomingPayments(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading.set(true);
    }
    
    this.errorLoading.set(null);
    
    try {
      // Use the loan payment schedule service
      const result = await this.paymentScheduleService.getUpcomingPayments(
        this.dueDateFilter(),
        this.currentPage(),
        this.pageSize,
        this.searchTerm()
      );
      
      // For page 1, replace the data. For other pages, append to existing data
      if (this.currentPage() === 1) {
        this.upcomingPayments.set(result.data);
      } else {
        this.upcomingPayments.update(existing => [...existing, ...result.data]);
      }
      
      this.totalCount.set(result.count);
      this.hasMore.set(result.hasMore);
      this.isLoading.set(false);
    } catch (error) {
      console.error('Error loading upcoming payments:', error);
      this.errorLoading.set('Failed to load upcoming payments. Please try again.');
      this.isLoading.set(false);
    }
  }

  async refreshData() {
    // Reset to page 1 when refreshing
    this.currentPage.set(1);
    await this.loadUpcomingPayments(true);
    
    const toast = await this.toastCtrl.create({
      message: 'Upcoming payments refreshed.',
      duration: 1500,
      position: 'bottom',
      color: 'medium',
    });
    await toast.present();
  }

  loadMore() {
    if (!this.hasMore()) return;
    
    this.currentPage.update(page => page + 1);
    this.loadUpcomingPayments(false);
  }

  hasMoreData() {
    return this.hasMore();
  }

  getDueDateClass(days: number): string {
    if (days === 0) return 'due-today';
    if (days <= 3) return 'due-soon';
    if (days <= 7) return 'due-this-week';
    return 'due-later';
  }

  getDueDateColor(days: number): string {
    if (days === 0) return 'danger';
    if (days <= 3) return 'warning';
    if (days <= 7) return 'tertiary';
    return 'medium';
  }

  async recordPayment(payment: UpcomingPayment) {
    // Navigate to payment form pre-filled with this payment's details
    this.router.navigate(['/payments/new'], { 
      queryParams: { 
        loanId: payment.loanId,
        scheduleId: payment.scheduleId,
        amount: payment.amount
      } 
    });
  }

  async viewSchedule(payment: UpcomingPayment) {
    // TODO: Implement view schedule functionality
    // For now, just show a message
    const toast = await this.toastCtrl.create({
      message: `Viewing payment schedule for Loan #${payment.loanId}`,
      duration: 2000,
      position: 'bottom',
      color: 'medium',
    });
    await toast.present();
  }

  async sendReminder(payment: UpcomingPayment) {
    const alert = await this.alertCtrl.create({
      header: 'Send Payment Reminder',
      message: `Are you sure you want to send a payment reminder to ${payment.borrower.name_of_borrower}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: async () => {
            // TODO: Implement sending reminder via API
            // For now, just show a success message
            const toast = await this.toastCtrl.create({
              message: `Payment reminder sent to ${payment.borrower.name_of_borrower}.`,
              duration: 2000,
              position: 'bottom',
              color: 'success',
            });
            await toast.present();
          }
        }
      ]
    });
    
    await alert.present();
  }

  async exportSchedule() {
    const alert = await this.alertCtrl.create({
      header: 'Export Payment Schedule',
      message: 'Select export format:',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'CSV',
          handler: async () => {
            // TODO: Implement CSV export functionality
            const toast = await this.toastCtrl.create({
              message: 'Payment schedule exported as CSV.',
              duration: 2000,
              position: 'bottom',
              color: 'success',
            });
            await toast.present();
          }
        },
        {
          text: 'PDF',
          handler: async () => {
            // TODO: Implement PDF export functionality
            const toast = await this.toastCtrl.create({
              message: 'Payment schedule exported as PDF.',
              duration: 2000,
              position: 'bottom',
              color: 'success',
            });
            await toast.present();
          }
        }
      ]
    });
    
    await alert.present();
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}
