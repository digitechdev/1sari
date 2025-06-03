import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, effect } from '@angular/core';
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
  IonCardSubtitle,
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
  AlertController
} from '@ionic/angular/standalone';
import { NgClass } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  timeOutline,
  calendarOutline,
  alertCircleOutline,
  refreshOutline,
  notificationsOutline,
  cashOutline,
  checkmarkCircle
} from 'ionicons/icons';
import { LoanPaymentScheduleService, MissedPayment } from '../../../services/loan-payment-schedule.service';
import { NgxDatatableModule, ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-missed-payments',
  templateUrl: './missed-payments.page.html',
  styleUrls: ['./missed-payments.page.scss', '../../../../../node_modules/@swimlane/ngx-datatable/themes/material.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgClass,
    NgxDatatableModule,
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
    IonCardSubtitle,
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
export class MissedPaymentsPage implements OnInit, AfterViewInit {
  @ViewChild('paymentActionsTemplate', { static: false }) paymentActionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) table: DatatableComponent | undefined;

  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private cdRef = inject(ChangeDetectorRef);
  private paymentScheduleService = inject(LoanPaymentScheduleService);

  // Data for the missed payments
  isLoading = signal<boolean>(true);
  errorLoading = signal<string | null>(null);
  searchTerm = signal<string>('');
  missedPayments = signal<MissedPayment[]>([]);
  pageSize = 10;
  currentPage = signal(1);
  hasMore = signal(true);
  totalCount = signal(0);
  private actionsTemplateAssigned = false;

  ColumnMode = ColumnMode;
  tableColumns: any[] = [
    { prop: 'id', name: 'ID', width: 60 },
    { prop: 'loanId', name: 'Loan ID', width: 80 },
    {
      prop: 'borrower.name_of_borrower',
      name: 'Borrower',
      width: 150
    },
    { 
      prop: 'amount', 
      name: 'Amount Due', 
      width: 120,
      pipe: { transform: (value: number) => this.currencyPipe.transform(value, 'PHP', 'symbol') } 
    },
    {
      prop: 'dueDate',
      name: 'Due Date',
      width: 120,
      pipe: {
        transform: (value: string) => this.datePipe.transform(value, 'mediumDate'),
      },
    },
    {
      prop: 'daysOverdue',
      name: 'Days Overdue',
      width: 120,
      cellClass: ({ value }: any) => this.getDaysOverdueClass(value)
    },
    {
      name: 'Actions',
      prop: 'id',
      sortable: false,
      canAutoResize: false,
      draggable: false,
      resizable: false,
      width: 120,
      cellTemplate: undefined
    }
  ];

  displayableMissedPayments = computed(() => {
    return this.missedPayments();
  });

  constructor() {
    // Register icons
    addIcons({
      addOutline,
      timeOutline,
      calendarOutline,
      alertCircleOutline,
      refreshOutline,
      notificationsOutline,
      cashOutline,
      checkmarkCircle
    });

    effect(() => {
      if (this.actionsTemplateAssigned) {
        // Refresh the table when data changes
        if (this.table) {
          this.table.recalculate();
        }
      }
    });
  }

  ngOnInit() {
    this.loadMissedPayments();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
    this.tryAssignTemplateAndData();
  }

  tryAssignTemplateAndData() {
    if (this.paymentActionsTemplate && !this.actionsTemplateAssigned) {
      const actionsCol = this.tableColumns.find(col => col.name === 'Actions');
      if (actionsCol) { 
        actionsCol.cellTemplate = this.paymentActionsTemplate;
        this.tableColumns = [...this.tableColumns];
        this.actionsTemplateAssigned = true;
        console.log('Missed payment actions template assigned.');
        this.cdRef.detectChanges();
      }
    }
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
    
    // Reset page to 1 when searching
    this.currentPage.set(1);
    
    // Reload with the search term
    this.loadMissedPayments(false);
  }

  async loadMissedPayments(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading.set(true);
    }
    
    this.errorLoading.set(null);
    
    try {
      // Use the dedicated loan payment schedule service
      const result = await this.paymentScheduleService.getMissedPayments(
        this.currentPage(), 
        this.pageSize, 
        this.searchTerm()
      );
      
      // For page 1, replace the data. For other pages, append to existing data
      if (this.currentPage() === 1) {
        this.missedPayments.set(result.data);
      } else {
        this.missedPayments.update(existing => [...existing, ...result.data]);
      }
      
      this.totalCount.set(result.count);
      this.hasMore.set(result.hasMore);
      this.isLoading.set(false);
      
      // Try to assign the template after data is loaded
      setTimeout(() => {
        this.tryAssignTemplateAndData();
      }, 0);
    } catch (error) {
      console.error('Error loading missed payments:', error);
      this.errorLoading.set('Failed to load missed payments. Please try again.');
      this.isLoading.set(false);
    }
  }

  async refreshData() {
    // Reset to page 1 when refreshing
    this.currentPage.set(1);
    this.actionsTemplateAssigned = false;
    await this.loadMissedPayments(true);
    
    const toast = await this.toastCtrl.create({
      message: 'Missed payments refreshed.',
      duration: 1500,
      position: 'bottom',
      color: 'medium',
    });
    await toast.present();
  }

  loadMore() {
    if (!this.hasMore()) return;
    
    this.currentPage.update(page => page + 1);
    this.loadMissedPayments(false);
  }

  hasMoreData() {
    return this.hasMore();
  }

  getDaysOverdueClass(days: number): string {
    if (days >= 30) return 'severe-overdue';
    if (days >= 14) return 'high-overdue';
    if (days >= 7) return 'medium-overdue';
    return 'low-overdue';
  }

  getDaysOverdueColor(days: number): string {
    if (days >= 30) return 'danger';
    if (days >= 14) return 'warning';
    if (days >= 7) return 'tertiary';
    return 'medium';
  }

  async recordPayment(payment: MissedPayment) {
    // Navigate to payment form pre-filled with this payment's details
    this.router.navigate(['/payments/new'], { 
      queryParams: { 
        loanId: payment.loanId,
        scheduleId: payment.scheduleId,
        amount: payment.amount
      } 
    });
  }

  async sendReminders() {
    const alert = await this.alertCtrl.create({
      header: 'Send Payment Reminders',
      message: 'Are you sure you want to send payment reminders to all borrowers with overdue payments?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: async () => {
            // TODO: Implement sending reminders via API
            // For now, just show a success message
            const toast = await this.toastCtrl.create({
              message: 'Payment reminders sent successfully.',
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

  async sendSingleReminder(payment: MissedPayment) {
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
            // TODO: Implement sending single reminder via API
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
