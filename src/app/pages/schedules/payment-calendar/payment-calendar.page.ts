import { Component, OnInit, inject, signal, computed, effect, DestroyRef, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonList,
  IonSpinner,
  IonAvatar,
  LoadingController,
  ToastController,
  IonMenuButton,
  ModalController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  chevronBackOutline, 
  chevronForwardOutline,
  todayOutline,
  filterOutline,
  optionsOutline,
  callOutline,
  personOutline,
  cashOutline,
  timeOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  arrowForwardOutline
} from 'ionicons/icons';
import { LoanPaymentScheduleService, UpcomingPayment, PaymentSchedule } from '../../../services/loan-payment-schedule.service';
import { PaymentStatus } from '../../../enums/payment-status.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasPayments: boolean;
  payments?: PaymentSchedule[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

@Component({
  selector: 'app-payment-calendar',
  templateUrl: './payment-calendar.page.html',
  styleUrls: ['./payment-calendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonLabel,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonList,
    IonSpinner,
    IonAvatar,
    IonMenuButton
  ],
  providers: [DatePipe]
})
export class PaymentCalendarPage implements OnInit, OnDestroy {
  // Services
  private loanPaymentScheduleService = inject(LoanPaymentScheduleService);
  private datePipe = inject(DatePipe);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private modalCtrl = inject(ModalController);
  
  // Cleanup
  private destroy$ = new Subject<void>();

  // Calendar state - using traditional properties instead of signals for some values
  // to reduce reactivity overhead
  currentMonth = signal<Date>(new Date());
  selectedDate = signal<Date | null>(null);
  isLoading = signal<boolean>(false);
  calendarDays = signal<CalendarDay[]>([]);
  hasInitialized = signal<boolean>(false);
  
  // Cache for calendar weeks to prevent recalculation
  private _calendarWeeks: CalendarWeek[] = [];
  private _calendarWeeksNeedUpdate = true;
  
  // Payments data
  allPayments = signal<PaymentSchedule[]>([]);
  
  // Calendar UI helpers
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Use traditional properties for some computed values
  // to reduce signal read operations
  _currentMonthName = '';
  _totalPaymentsThisMonth = 0;
  _totalAmountDueThisMonth = 0;
  _selectedDatePayments: PaymentSchedule[] = [];
  
  // Flag to control showing the details in a modal
  useModalForDetails = true;
  
  constructor() {
    addIcons({
      calendarOutline,
      chevronBackOutline,
      chevronForwardOutline,
      todayOutline,
      filterOutline,
      optionsOutline,
      callOutline,
      personOutline,
      cashOutline,
      timeOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      arrowForwardOutline
    });
  }

  ngOnInit() {
    try {
      // Mark as not initialized to prevent effect from running prematurely
      this.hasInitialized.set(false);
      
      // Set today as the selected date
      const today = new Date();
      this.selectedDate.set(today);
      this.currentMonth.set(today);
      
      // Initialize the calendar
      this.generateCalendarDays(today);
      
      // Calculate values once
      this.updateDisplayValues();
      
      // Initial load of payments (only once)
      this.loadPaymentsForMonth(today).then(() => {
        // Mark initialization as complete
        this.hasInitialized.set(true);
        console.log('Calendar initialization complete');
      }).catch(error => {
        console.error('Error in initial payment load:', error);
        this.hasInitialized.set(true); // Still mark as initialized to allow recovery
      });
      
      // Subscribe to changes only after initialization
      effect(() => {
        // Skip if not initialized
        if (!this.hasInitialized()) return;
        
        const month = this.currentMonth();
        console.log('Month changed to:', month.toLocaleDateString());
        
        // Only generate days immediately
        this.generateCalendarDays(month);
        this._calendarWeeksNeedUpdate = true;
        
        // Delay data loading to prevent UI freezing
        setTimeout(() => {
          if (this.hasInitialized()) {
            this.loadPaymentsForMonth(month);
          }
        }, 100);
      });
    } catch (error) {
      console.error('Error initializing calendar:', error);
      // Attempt to recover by setting default values
      this.calendarDays.set([]);
      this.allPayments.set([]);
      this.isLoading.set(false);
      this.hasInitialized.set(true); // Mark as initialized to allow recovery
    }
  }
  
  ngOnDestroy() {
    // Clean up
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Navigate to the previous month
   */
  previousMonth() {
    const current = new Date(this.currentMonth());
    current.setMonth(current.getMonth() - 1);
    this.currentMonth.set(current);
    this.updateDisplayValues();
  }
  
  /**
   * Navigate to the next month
   */
  nextMonth() {
    const current = new Date(this.currentMonth());
    current.setMonth(current.getMonth() + 1);
    this.currentMonth.set(current);
    this.updateDisplayValues();
  }
  
  /**
   * Go to today's date
   */
  goToToday() {
    const today = new Date();
    this.currentMonth.set(today);
    this.selectedDate.set(today);
    this.updateDisplayValues();
    this._calendarWeeksNeedUpdate = true;
  }
  
  /**
   * Select a day in the calendar
   */
  async selectDate(day: CalendarDay) {
    if (!day || !day.date) {
      console.error('Attempted to select a day with no date');
      return;
    }

    try {
      // If the day is from another month, navigate to that month
      if (!day.isCurrentMonth) {
        this.currentMonth.set(new Date(day.date));
        this._calendarWeeksNeedUpdate = true;
      }
      
      this.selectedDate.set(new Date(day.date));
      this.updateSelectedDatePayments();
      
      // Show modal if the day has payments
      if (day.hasPayments && day.payments && day.payments.length > 0) {
        this.presentPaymentDetailModal(day.date, day.payments);
      }
    } catch (error) {
      console.error('Error selecting date:', error);
      // Fall back to today's date if there's an error
      this.selectedDate.set(new Date());
    }
  }
  
  /**
   * Update derived values when needed
   */
  private updateDisplayValues() {
    try {
      const month = this.currentMonth();
      this._currentMonthName = month.toLocaleString('default', { month: 'long', year: 'numeric' });
      this.updatePaymentStatistics();
      this.updateSelectedDatePayments();
    } catch (error) {
      console.error('Error updating display values:', error);
    }
  }
  
  /**
   * Update payment statistics for the current month
   */
  private updatePaymentStatistics() {
    try {
      const payments = this.allPayments();
      const currentMonth = this.currentMonth();
      
      // Filter payments for the current month
      const paymentsThisMonth = payments.filter(payment => {
        if (!payment || !payment.due_date) return false;
        try {
          const paymentDate = new Date(payment.due_date);
          return paymentDate.getMonth() === currentMonth.getMonth() && 
                 paymentDate.getFullYear() === currentMonth.getFullYear();
        } catch (e) {
          return false;
        }
      });
      
      // Calculate statistics
      this._totalPaymentsThisMonth = paymentsThisMonth.length;
      this._totalAmountDueThisMonth = paymentsThisMonth.reduce((sum, payment) => {
        return sum + (payment.amount_due || 0);
      }, 0);
    } catch (error) {
      console.error('Error updating payment statistics:', error);
      this._totalPaymentsThisMonth = 0;
      this._totalAmountDueThisMonth = 0;
    }
  }
  
  /**
   * Update payments for the selected date
   */
  private updateSelectedDatePayments() {
    try {
      const selected = this.selectedDate();
      if (!selected) {
        this._selectedDatePayments = [];
        return;
      }
      
      const selectedDateStr = selected.toISOString().split('T')[0];
      
      this._selectedDatePayments = this.allPayments().filter(payment => {
        if (!payment || !payment.due_date) return false;
        try {
          return payment.due_date.split('T')[0] === selectedDateStr;
        } catch (e) {
          return false;
        }
      });
    } catch (error) {
      console.error('Error updating selected date payments:', error);
      this._selectedDatePayments = [];
    }
  }
  
  /**
   * Generate the calendar days for the given month
   */
  private generateCalendarDays(month: Date) {
    try {
      const days: CalendarDay[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Clone the date to avoid modifying the original
      const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      
      // Find the first day to display (which might be from the previous month)
      const firstDayToDisplay = new Date(firstDayOfMonth);
      const dayOfWeek = firstDayOfMonth.getDay();
      firstDayToDisplay.setDate(firstDayToDisplay.getDate() - dayOfWeek);
      
      // Generate 42 days (6 weeks)
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(firstDayToDisplay);
        currentDate.setDate(firstDayToDisplay.getDate() + i);
        
        const isCurrentMonth = currentDate.getMonth() === month.getMonth();
        const isToday = currentDate.toDateString() === today.toDateString();
        const isSelected = this.selectedDate() !== null && 
                          currentDate.toDateString() === this.selectedDate()!.toDateString();
        
        days.push({
          date: currentDate,
          isCurrentMonth,
          isToday,
          isSelected,
          hasPayments: false, // Will be updated after loading payments
          payments: [] // Initialize with empty array
        });
      }
      
      this.calendarDays.set(days);
    } catch (error) {
      console.error('Error generating calendar days:', error);
      this.calendarDays.set([]);
    }
  }
  
  /**
   * Format the calendar days into weeks for display
   * This is optimized to avoid recalculating weeks on every access
   */
  getCalendarWeeks(): CalendarWeek[] {
    try {
      // Return cached weeks if available and not marked for update
      if (this._calendarWeeks.length > 0 && !this._calendarWeeksNeedUpdate) {
        return this._calendarWeeks;
      }
      
      const days = this.calendarDays();
      const weeks: CalendarWeek[] = [];
      
      if (!days || !days.length) {
        console.warn('No calendar days available to format into weeks');
        return [];
      }
      
      for (let i = 0; i < days.length; i += 7) {
        const weekDays = days.slice(i, i + 7);
        weeks.push({ days: weekDays });
      }
      
      // Cache the weeks
      this._calendarWeeks = weeks;
      this._calendarWeeksNeedUpdate = false;
      
      return weeks;
    } catch (error) {
      console.error('Error generating calendar weeks:', error);
      return [];
    }
  }
  
  /**
   * Load payments for the current month
   */
  async loadPaymentsForMonth(month: Date) {
    // Prevent multiple concurrent calls
    if (this.isLoading()) {
      console.log('Already loading payments, skipping duplicate request');
      return;
    }
    
    try {
      this.isLoading.set(true);
      console.log('Loading payments for month:', month.toLocaleDateString());
      
      // Get the first and last day of the month
      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Format dates for API call
      const firstDayStr = firstDay.toISOString().split('T')[0];
      const lastDayStr = lastDay.toISOString().split('T')[0];
      
      // Limit the data we load to improve performance
      let missedPayments: any[] = [];
      let upcomingPayments: any[] = [];
      
      try {
        const missedResult = await this.loanPaymentScheduleService.getMissedPayments(1, 100);
        missedPayments = missedResult.data || [];
        console.log('Missed payments loaded:', missedPayments.length);
      } catch (error) {
        console.error('Error fetching missed payments:', error);
        missedPayments = [];
      }
      
      try {
        const upcomingResult = await this.loanPaymentScheduleService.getUpcomingPayments('all', 1, 100);
        upcomingPayments = upcomingResult.data || [];
        console.log('Upcoming payments loaded:', upcomingPayments.length);
      } catch (error) {
        console.error('Error fetching upcoming payments:', error);
        upcomingPayments = [];
      }
      
      // Combine all payments
      const allScheduledPayments = [...missedPayments, ...upcomingPayments];
      
      // Filter to only include payments in the current month view
      const paymentsForMonth = allScheduledPayments.filter(payment => {
        if (!payment || !payment.dueDate) return false;
        
        try {
          const paymentDate = new Date(payment.dueDate);
          return paymentDate >= firstDay && paymentDate <= lastDay;
        } catch (e) {
          console.error('Error parsing payment date:', payment.dueDate, e);
          return false;
        }
      });
      
      console.log('Filtered payments for month:', paymentsForMonth.length);
      
      // Transform to PaymentSchedule format with safe defaults
      const payments: PaymentSchedule[] = paymentsForMonth.map(payment => {
        try {
          // Determine if it's a missed (overdue) payment
          const isMissedPayment = payment && 'daysOverdue' in payment;
          
          return {
            id: payment?.scheduleId || 0,
            loan_id: payment?.loanId || 0,
            period_number: 0, // Not available in the API response
            due_date: payment?.dueDate || new Date().toISOString(),
            amount_due: payment?.amount || 0,
            principal_paid: 0, // Not available in the API response
            interest_paid: 0, // Not available in the API response
            outstanding_balance: 0, // Not available in the API response
            status: isMissedPayment ? 'Overdue' : 'Open',
            created_at: new Date().toISOString(), // Not available in the API response
            borrower_name: payment?.borrower?.name_of_borrower || 'Unknown',
            borrower_id: payment?.borrower?.id || 0,
            borrower_contact: payment?.borrower?.contact_no_borrower || ''
          };
        } catch (e) {
          console.error('Error transforming payment:', payment, e);
          // Return a safe default payment object
          return {
            id: 0,
            loan_id: 0,
            period_number: 0,
            due_date: new Date().toISOString(),
            amount_due: 0,
            principal_paid: 0,
            interest_paid: 0,
            outstanding_balance: 0,
            status: 'Open',
            created_at: new Date().toISOString(),
            borrower_name: 'Error',
            borrower_id: 0,
            borrower_contact: ''
          };
        }
      });
      
      console.log('Transformed payments:', payments.length);
      
      // Set payments and update related displays
      this.allPayments.set(payments);
      this.updateCalendarWithPayments(payments);
      this.updateDisplayValues();
    } catch (error) {
      console.error('Error loading payments:', error);
      this.presentToast('Failed to load payment data', 'danger');
      this.allPayments.set([]);
    } finally {
      // Set a small delay before marking as not loading to prevent UI jank
      setTimeout(() => {
        this.isLoading.set(false);
      }, 100);
    }
  }
  
  /**
   * Update calendar days with payment information
   */
  private updateCalendarWithPayments(payments: PaymentSchedule[]) {
    try {
      const days = [...this.calendarDays()];
      
      // Reset hasPayments flag for all days
      days.forEach(day => {
        day.hasPayments = false;
        day.payments = [];
      });
      
      // Update days that have payments
      payments.forEach(payment => {
        if (!payment || !payment.due_date) return;
        
        try {
          const paymentDate = new Date(payment.due_date);
          const dayIndex = days.findIndex(day => 
            day.date.toDateString() === paymentDate.toDateString()
          );
          
          if (dayIndex !== -1) {
            days[dayIndex].hasPayments = true;
            if (!days[dayIndex].payments) {
              days[dayIndex].payments = [];
            }
            days[dayIndex].payments?.push(payment);
          }
        } catch (e) {
          console.error('Error processing payment date:', payment.due_date, e);
        }
      });
      
      this.calendarDays.set(days);
      this._calendarWeeksNeedUpdate = true;
    } catch (error) {
      console.error('Error updating calendar with payments:', error);
    }
  }
  
  /**
   * Get selected date payments (accessor method for template)
   */
  getSelectedDatePayments(): PaymentSchedule[] {
    return this._selectedDatePayments;
  }
  
  /**
   * Get current month name (accessor method for template)
   */
  getCurrentMonthName(): string {
    return this._currentMonthName;
  }
  
  /**
   * Get total payments this month (accessor method for template)
   */
  getTotalPaymentsThisMonth(): number {
    return this._totalPaymentsThisMonth;
  }
  
  /**
   * Get total amount due this month (accessor method for template)
   */
  getTotalAmountDueThisMonth(): number {
    return this._totalAmountDueThisMonth;
  }
  
  /**
   * View loan details
   */
  viewLoanDetails(loanId: number) {
    if (!loanId) return;
    this.router.navigate(['/loans/detail', loanId]);
  }
  
  /**
   * Navigate to record payment page
   */
  recordPayment(scheduleId: number) {
    if (!scheduleId) return;
    this.router.navigate(['/payments/new'], { 
      queryParams: { scheduleId }
    });
  }
  
  /**
   * Format payment amount
   */
  formatAmount(amount: number): string {
    if (amount === undefined || amount === null) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }
  
  /**
   * Get status color based on payment status
   */
  getStatusColor(status: string): string {
    if (!status) return 'primary';
    
    switch (status) {
      case PaymentStatus.Paid:
        return 'success';
      case PaymentStatus.Overdue:
        return 'danger';
      case PaymentStatus.Pending:
        return 'warning';
      case PaymentStatus.Open:
      default:
        return 'primary';
    }
  }
  
  /**
   * Present a toast message
   */
  async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
  
  /**
   * Present payment detail modal
   */
  async presentPaymentDetailModal(date: Date, payments: PaymentSchedule[]) {
    try {
      // Dynamically import the modal component
      const { PaymentDetailModalComponent } = await import('../payment-detail-modal/payment-detail-modal.component');
      
      const modal = await this.modalCtrl.create({
        component: PaymentDetailModalComponent,
        componentProps: {
          date: date,
          payments: payments
        },
        cssClass: 'payment-detail-modal',
        backdropDismiss: true,
        showBackdrop: true
      });
      
      await modal.present();
      
      const { data, role } = await modal.onWillDismiss();
      
      // Refresh data if needed based on modal result
      if (role === 'refresh') {
        this.loadPaymentsForMonth(this.currentMonth());
      }
    } catch (error) {
      console.error('Error presenting payment detail modal:', error);
      this.presentToast('Could not display payment details', 'danger');
    }
  }
  
  /**
   * Calculate the total payment amount for a specific day
   */
  getTotalAmountForDay(day: CalendarDay): number {
    if (!day || !day.payments || !day.payments.length) return 0;
    
    return day.payments.reduce((sum, payment) => {
      return sum + (payment?.amount_due || 0);
    }, 0);
  }
  
  /**
   * Format amount in a compact way for the calendar cell
   */
  formatCompactAmount(amount: number): string {
    if (amount === 0) return '';
    
    // Format for thousands
    if (amount >= 1000) {
      return '₱' + (amount / 1000).toFixed(1) + 'k';
    }
    
    // Format for regular amounts
    return '₱' + amount.toFixed(0);
  }
}
