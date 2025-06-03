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
  LoadingController,
  ToastController,
  DatetimeCustomEvent
} from '@ionic/angular/standalone';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  downloadOutline,
  filterOutline,
  printOutline,
  refreshOutline,
  timeOutline,
  analyticsOutline,
  statsChartOutline,
  arrowUpOutline,
  arrowDownOutline,
  eyeOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { LoanPaymentService } from '../../../services/loan-payment.service';

interface CollectionSummary {
  totalCollected: number;
  totalTransactions: number;
  avgTransactionSize: number;
}

interface DailyCollection {
  date: string;
  total_amount: number;
  transaction_count: number;
}

@Component({
  selector: 'app-collection',
  templateUrl: './collection.page.html',
  styleUrls: ['./collection.page.scss'],
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
    NgxDatatableModule
  ],
  providers: [DatePipe]
})
export class CollectionPage implements OnInit {
  // Services
  private paymentService = inject(LoanPaymentService);
  private datePipe = inject(DatePipe);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // Datatable properties
  ColumnMode = ColumnMode;
  dailyColumns = [
    { name: 'Date', prop: 'date' },
    { name: 'Total Collected', prop: 'total_amount' },
    { name: 'Transactions', prop: 'transaction_count' }
  ];

  // State signals
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  startDate = signal<string>(this.getDefaultStartDate());
  endDate = signal<string>(this.getDefaultEndDate());
  
  // Data signals
  dailyCollections = signal<DailyCollection[]>([]);
  summary = signal<CollectionSummary>({
    totalCollected: 0,
    totalTransactions: 0,
    avgTransactionSize: 0
  });

  constructor() {
    addIcons({
      calendarOutline,
      downloadOutline,
      filterOutline,
      printOutline,
      refreshOutline,
      timeOutline,
      analyticsOutline,
      statsChartOutline,
      arrowUpOutline,
      arrowDownOutline,
      eyeOutline
    });
  }

  ngOnInit() {
    this.loadReportData();
  }

  /**
   * Load collection report data
   */
  async loadReportData() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Show loading indicator
    const loader = await this.loadingCtrl.create({
      message: 'Loading collection report data...',
      spinner: 'circles',
      duration: 15000 // Timeout after 15 seconds
    });
    await loader.present();

    try {
      console.log('Collection Report: Starting data load...');
      
      // Get start and end dates
      const startStr = this.formatDateForApi(this.startDate());
      const endStr = this.formatDateForApi(this.endDate());
      
      console.log('Collection Report: Date range:', startStr, 'to', endStr);
      
      // Load daily collection data
      console.log('Collection Report: Fetching daily data...');
      const dailyResponse = await this.paymentService.getDailyCollectionTotals(startStr, endStr);
      
      console.log('Collection Report: Daily data response:', dailyResponse);
      
      if (dailyResponse.error) {
        console.error('Collection Report: Error loading daily data:', dailyResponse.error);
        throw new Error(`Failed to load daily collection data: ${dailyResponse.error.message}`);
      }
      
      if (dailyResponse.data) {
        console.log('Collection Report: Daily data loaded successfully, count:', dailyResponse.data.length);
        this.dailyCollections.set(dailyResponse.data);
      } else {
        console.log('Collection Report: No daily data received');
        this.dailyCollections.set([]);
      }
      
      // Generate summary from daily data
      console.log('Collection Report: Generating summary...');
      this.generateSummary();
      console.log('Collection Report: Summary generated successfully');
      
    } catch (error) {
      console.error('Collection Report: Fatal error loading report data:', error);
      this.errorMessage.set((error as Error).message);
      await this.presentToast((error as Error).message, 'danger');
    } finally {
      this.isLoading.set(false);
      await loader.dismiss();
    }
  }

  /**
   * Generate summary statistics from the data
   */
  private generateSummary() {
    const dailyData = this.dailyCollections();
    
    // Calculate totals
    let totalAmount = 0;
    let totalTransactions = 0;
    
    for (const day of dailyData) {
      totalAmount += day.total_amount;
      totalTransactions += day.transaction_count;
    }
    
    // Calculate average transaction size
    const avgTransactionSize = totalTransactions > 0 
      ? totalAmount / totalTransactions 
      : 0;
    
    // Update summary signal
    this.summary.set({
      totalCollected: totalAmount,
      totalTransactions: totalTransactions,
      avgTransactionSize: avgTransactionSize
    });
  }

  /**
   * Handle start date change
   */
  onStartDateChange(event: Event) {
    const customEvent = event as DatetimeCustomEvent;
    this.startDate.set(customEvent.detail.value as string);
    this.loadReportData();
  }

  /**
   * Handle end date change
   */
  onEndDateChange(event: Event) {
    const customEvent = event as DatetimeCustomEvent;
    this.endDate.set(customEvent.detail.value as string);
    this.loadReportData();
  }

  /**
   * Get default start date (first day of current month)
   */
  private getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString();
  }

  /**
   * Get default end date (current day)
   */
  private getDefaultEndDate(): string {
    return new Date().toISOString();
  }

  /**
   * Format date for API requests
   */
  private formatDateForApi(dateString: string): string {
    try {
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
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
   * Export report as CSV
   */
  exportCSV() {
    try {
      // Prepare data
      const dailyData = this.dailyCollections();
      
      if (dailyData.length === 0) {
        this.presentToast('No data available to export', 'warning');
        return;
      }
      
      // Convert daily collections to CSV
      const headers = ['Date', 'Total Collected', 'Transactions'];
      const rows = dailyData.map(day => [
        this.formatDate(day.date),
        day.total_amount,
        day.transaction_count
      ]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      // Get date range for filename
      const startStr = this.formatDate(this.startDate());
      const endStr = this.formatDate(this.endDate());
      link.setAttribute('download', `collection_report_${startStr}_to_${endStr}.csv`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.presentToast('Report exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      this.presentToast('Failed to export report', 'danger');
    }
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
