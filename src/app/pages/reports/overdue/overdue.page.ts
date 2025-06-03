import { Component, OnInit, inject, signal } from '@angular/core';
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
  IonCardSubtitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonList,
  IonDatetime,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonChip,
  IonBadge,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonNote,
  IonText,
  IonToggle,
  IonRange,
  IonProgressBar,
  IonSearchbar,
  LoadingController,
  ToastController,
  ActionSheetController,
  SearchbarCustomEvent
} from '@ionic/angular/standalone';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  downloadOutline,
  filterOutline,
  printOutline,
  searchOutline,
  refreshOutline,
  timeOutline,
  alertCircleOutline,
  cashOutline,
  personOutline,
  arrowForwardOutline,
  statsChartOutline,
  ellipsisVerticalOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { LoanPaymentScheduleService, MissedPayment } from '../../../services/loan-payment-schedule.service';
import { ReportExportService, ExportColumn } from '../../../services/report-export.service';

interface OverdueSummary {
  totalAmount: number;
  totalLoans: number;
  averageAmount: number;
  maxOverdueDays: number;
}

@Component({
  selector: 'app-overdue',
  templateUrl: './overdue.page.html',
  styleUrls: ['./overdue.page.scss'],
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
    IonCardSubtitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonLabel,
    IonItem,
    IonList,
    IonDatetime,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonChip,
    IonBadge,
    IonMenuButton,
    IonSelect,
    IonSelectOption,
    IonSkeletonText,
    IonNote,
    IonText,
    IonToggle,
    IonRange,
    IonProgressBar,
    IonSearchbar,
    NgxDatatableModule
  ],
  providers: [DatePipe]
})
export class OverduePage implements OnInit {
  // Services
  private scheduleService = inject(LoanPaymentScheduleService);
  private datePipe = inject(DatePipe);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private exportService = inject(ReportExportService);
  private actionSheetCtrl = inject(ActionSheetController);

  // Make Math available to the template
  protected Math = Math;

  // Datatable properties
  ColumnMode = ColumnMode;
  overdueColumns = [
    { name: 'Borrower', prop: 'borrower.name_of_borrower' },
    { name: 'Loan ID', prop: 'loanId' },
    { name: 'Amount Due', prop: 'amount' },
    { name: 'Due Date', prop: 'dueDate' },
    { name: 'Days Overdue', prop: 'daysOverdue' }
  ];

  // Export columns definition
  exportColumns: ExportColumn[] = [
    { header: 'Borrower', property: 'borrower.name_of_borrower' },
    { header: 'Loan ID', property: 'loanId' },
    { header: 'Amount Due', property: 'amount', formatter: (value) => this.formatCurrency(value) },
    { header: 'Due Date', property: 'dueDate', formatter: (value) => this.formatDate(value) },
    { header: 'Days Overdue', property: 'daysOverdue', formatter: (value) => `${value} days` }
  ];

  // State signals
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  searchTerm = signal<string>('');
  
  // Data signals
  overdueLoans = signal<MissedPayment[]>([]);
  totalCount = signal<number>(0);
  hasMore = signal<boolean>(false);
  summary = signal<OverdueSummary>({
    totalAmount: 0,
    totalLoans: 0,
    averageAmount: 0,
    maxOverdueDays: 0
  });

  constructor() {
    addIcons({
      calendarOutline,
      downloadOutline,
      filterOutline,
      printOutline,
      searchOutline,
      refreshOutline,
      timeOutline,
      alertCircleOutline,
      cashOutline,
      personOutline,
      arrowForwardOutline,
      statsChartOutline,
      ellipsisVerticalOutline
    });
  }

  ngOnInit() {
    this.loadOverdueLoans();
  }

  /**
   * Load overdue loans data
   */
  async loadOverdueLoans() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Show loading indicator
    const loader = await this.loadingCtrl.create({
      message: 'Loading overdue loans data...',
      spinner: 'circles',
      duration: 15000 // Timeout after 15 seconds
    });
    await loader.present();

    try {
      console.log('Overdue Report: Starting data load...');
      
      // Get current pagination
      const page = this.currentPage();
      const limit = this.itemsPerPage();
      const search = this.searchTerm();
      
      console.log('Overdue Report: Fetching data with params:', { page, limit, search });
      
      // Load overdue loans data
      const response = await this.scheduleService.getMissedPayments(page, limit, search);
      
      console.log('Overdue Report: Data received:', response);
      
      if (response && response.data) {
        console.log('Overdue Report: Overdue loans loaded successfully, count:', response.data.length);
        this.overdueLoans.set(response.data);
        this.totalCount.set(response.count);
        this.hasMore.set(response.hasMore);
      } else {
        console.log('Overdue Report: No overdue loans data received');
        this.overdueLoans.set([]);
        this.totalCount.set(0);
        this.hasMore.set(false);
      }
      
      // Generate summary
      console.log('Overdue Report: Generating summary...');
      this.generateSummary();
      console.log('Overdue Report: Summary generated successfully');
      
    } catch (error) {
      console.error('Overdue Report: Fatal error loading data:', error);
      this.errorMessage.set((error as Error).message);
      await this.presentToast((error as Error).message, 'danger');
    } finally {
      this.isLoading.set(false);
      await loader.dismiss();
    }
  }

  /**
   * Generate summary statistics from the overdue loans data
   */
  private generateSummary() {
    const overdueData = this.overdueLoans();
    
    if (!overdueData.length) {
      this.summary.set({
        totalAmount: 0,
        totalLoans: 0,
        averageAmount: 0,
        maxOverdueDays: 0
      });
      return;
    }
    
    // Calculate totals
    let totalAmount = 0;
    let maxOverdueDays = 0;
    
    for (const loan of overdueData) {
      totalAmount += loan.amount;
      maxOverdueDays = Math.max(maxOverdueDays, loan.daysOverdue);
    }
    
    // Calculate average
    const totalLoans = overdueData.length;
    const averageAmount = totalLoans > 0 ? totalAmount / totalLoans : 0;
    
    // Update summary signal
    this.summary.set({
      totalAmount,
      totalLoans,
      averageAmount,
      maxOverdueDays
    });
  }

  /**
   * Handle search input change
   */
  onSearchChange(event: Event) {
    const ev = event as SearchbarCustomEvent;
    this.searchTerm.set(ev.detail.value || '');
    this.currentPage.set(1); // Reset to first page on search
    this.loadOverdueLoans();
  }

  /**
   * Handle page change
   */
  onPageChange(event: any) {
    this.currentPage.set(event.page);
    this.loadOverdueLoans();
  }

  /**
   * Navigate to loan details
   */
  viewLoanDetails(loanId: number) {
    this.router.navigate(['/loans/detail', loanId]);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'MMM d, yyyy') || dateString;
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Show export options action sheet
   */
  async showExportOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Export Options',
      buttons: [
        {
          text: 'Export to CSV',
          icon: 'document-outline',
          handler: () => {
            this.exportData('csv');
          }
        },
        {
          text: 'Export to PDF',
          icon: 'document-text-outline',
          handler: () => {
            this.exportData('pdf');
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Export data to selected format
   */
  async exportData(format: 'csv' | 'pdf') {
    try {
      // Show loading indicator
      const loader = await this.loadingCtrl.create({
        message: `Preparing ${format.toUpperCase()} export...`,
        spinner: 'circles'
      });
      await loader.present();
      
      // Fetch all data for export (not just current page)
      const allData = await this.scheduleService.getMissedPayments(1, 1000);
      
      if (!allData || !allData.data || allData.data.length === 0) {
        await loader.dismiss();
        this.presentToast('No data available to export', 'warning');
        return;
      }
      
      const filename = `overdue_loans_report_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        this.exportService.exportToCSV(
          allData.data,
          this.exportColumns,
          filename
        );
      } else {
        this.exportService.exportToPDF(
          allData.data,
          this.exportColumns,
          filename,
          'Overdue Loans Report',
          'landscape' // Better for tables with many columns
        );
      }
      
      await loader.dismiss();
      this.presentToast(`Report exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      this.presentToast(`Failed to export report as ${format.toUpperCase()}`, 'danger');
    }
  }

  /**
   * Legacy export CSV method (redirects to new exportData method)
   */
  exportCSV() {
    this.exportData('csv');
  }

  /**
   * Refresh data
   */
  refreshData() {
    this.loadOverdueLoans();
  }

  /**
   * Display toast message
   */
  private async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [{
        text: 'Dismiss',
        role: 'cancel'
      }]
    });
    await toast.present();
  }
}
