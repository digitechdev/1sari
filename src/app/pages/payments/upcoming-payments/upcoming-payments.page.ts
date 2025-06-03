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
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { NgClass } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  timeOutline,
  calendarOutline,
  notificationsOutline,
  refreshOutline,
  cashOutline,
  downloadOutline,
  checkmarkOutline,
  documentOutline
} from 'ionicons/icons';
import { 
  LoanPaymentScheduleService, 
  UpcomingPayment, 
  DueDateFilterType 
} from '../../../services/loan-payment-schedule.service';
import { NgxDatatableModule, ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-upcoming-payments',
  templateUrl: './upcoming-payments.page.html',
  styleUrls: ['./upcoming-payments.page.scss', '../../../../../node_modules/@swimlane/ngx-datatable/themes/material.scss'],
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
export class UpcomingPaymentsPage implements OnInit, AfterViewInit {
  @ViewChild('paymentActionsTemplate', { static: false }) paymentActionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) table: DatatableComponent | undefined;

  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private cdRef = inject(ChangeDetectorRef);
  private paymentScheduleService = inject(LoanPaymentScheduleService);
  private loadingCtrl = inject(LoadingController);

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
      prop: 'daysUntilDue',
      name: 'Days Until Due',
      width: 120,
      cellClass: ({ value }: any) => this.getDueDateClass(value)
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
      downloadOutline,
      checkmarkOutline,
      documentOutline
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
    this.loadUpcomingPayments();
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
        console.log('Upcoming payment actions template assigned.');
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
    // Get the search term from the event
    const term = event.detail.value || '';
    
    // Only update and search if the term has actually changed
    if (term !== this.searchTerm()) {
      console.log('Search term changed to:', term);
      this.searchTerm.set(term);
      
      // Reset to page 1 when searching
      this.currentPage.set(1);
      
      // Reload with the search term (the debounce is handled by the ionInput event with debounce="300")
      this.loadUpcomingPayments(false);
    }
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
      
      // Try to assign the template after data is loaded
      setTimeout(() => {
        this.tryAssignTemplateAndData();
      }, 0);
    } catch (error) {
      console.error('Error loading upcoming payments:', error);
      this.errorLoading.set('Failed to load upcoming payments. Please try again.');
      this.isLoading.set(false);
    }
  }

  async refreshData() {
    // Reset to page 1 when refreshing
    this.currentPage.set(1);
    this.actionsTemplateAssigned = false;
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
            this.exportToCSV();
          }
        },
        {
          text: 'PDF',
          handler: async () => {
            this.exportToPDF();
          }
        }
      ]
    });
    
    await alert.present();
  }

  async exportToCSV() {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Generating CSV file...',
        spinner: 'circles'
      });
      await loading.present();

      // Get all payments for export - might need to fetch all data if pagination is active
      let paymentsToExport = this.upcomingPayments();
      
      // If we're only showing a subset of data, fetch all data for export
      if (this.totalCount() > paymentsToExport.length) {
        try {
          const allPayments = await this.paymentScheduleService.getUpcomingPayments(
            this.dueDateFilter(),
            1,
            this.totalCount(), // Request all payments
            this.searchTerm()
          );
          paymentsToExport = allPayments.data;
        } catch (error) {
          console.error('Error fetching all payments for export:', error);
          // Continue with what we have if we can't fetch all
        }
      }

      // Generate CSV content
      const headers = [
        'ID', 'Loan ID', 'Borrower', 'Amount Due', 'Due Date', 'Days Until Due'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      // Add data rows
      csvContent += paymentsToExport.map(payment => {
        const formattedAmount = payment.amount.toFixed(2);
        const formattedDate = this.datePipe.transform(payment.dueDate, 'yyyy-MM-dd') || payment.dueDate;
        
        // Escape any commas in the borrower name
        const escapedBorrowerName = payment.borrower.name_of_borrower.includes(',') 
          ? `"${payment.borrower.name_of_borrower}"` 
          : payment.borrower.name_of_borrower;
        
        return [
          payment.id,
          payment.loanId,
          escapedBorrowerName,
          formattedAmount,
          formattedDate,
          payment.daysUntilDue
        ].join(',');
      }).join('\n');

      // Get current date for filename
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const fileName = `upcoming-payments-${dateStr}.csv`;
      
      // Get device info to determine platform
      const deviceInfo = await Device.getInfo();

      // Save the file based on platform
      if (deviceInfo.platform === 'web') {
        // For web, create a download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        await loading.dismiss();
        this.presentToast('CSV file downloaded successfully.', 'success');
      } else {
        // For mobile platforms, save to filesystem and share
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        await loading.dismiss();
        
        // Show success toast
        this.presentToast('CSV file created successfully.', 'success');
        
        // Share the file
        try {
          await Share.share({
            title: 'Upcoming Payments',
            text: 'Upcoming Payments Export',
            url: result.uri,
            dialogTitle: 'Share CSV file'
          });
        } catch (shareError) {
          console.error('Error sharing the file:', shareError);
          this.presentToast('File created but sharing failed.', 'warning');
        }
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      this.presentToast('Failed to export CSV. Please try again.', 'danger');
    }
  }

  async exportToPDF() {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Generating PDF file...',
        spinner: 'circles'
      });
      await loading.present();

      // Get all payments for export - might need to fetch all data if pagination is active
      let paymentsToExport = this.upcomingPayments();
      
      // If we're only showing a subset of data, fetch all data for export
      if (this.totalCount() > paymentsToExport.length) {
        try {
          const allPayments = await this.paymentScheduleService.getUpcomingPayments(
            this.dueDateFilter(),
            1,
            this.totalCount(), // Request all payments
            this.searchTerm()
          );
          paymentsToExport = allPayments.data;
        } catch (error) {
          console.error('Error fetching all payments for export:', error);
          // Continue with what we have if we can't fetch all
        }
      }

      // Create PDF document (A4 format)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title and metadata
      const title = 'Upcoming Payments Schedule';
      const date = new Date();
      const dateStr = this.datePipe.transform(date, 'medium') || date.toISOString();
      
      // Set PDF metadata
      doc.setProperties({
        title: title,
        subject: 'Loan Payment Schedule',
        author: '1Sari Lending System',
        keywords: 'payments, loans, schedule',
        creator: '1Sari Lending System'
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      
      // Add date and filter info
      doc.setFontSize(10);
      doc.text(`Generated on: ${dateStr}`, 14, 28);
      doc.text(`Filter: ${this.getDueDateFilterName(this.dueDateFilter())}`, 14, 34);
      doc.text(`Total records: ${paymentsToExport.length}`, 14, 40);
      
      // Company info (top right)
      doc.setFontSize(12);
      doc.text('1Sari Lending System', 170, 20, { align: 'right' });
      
      // Format data for PDF table
      const tableData = paymentsToExport.map(payment => {
        const formattedAmount = this.currencyPipe.transform(payment.amount, 'PHP', 'symbol');
        const formattedDate = this.datePipe.transform(payment.dueDate, 'mediumDate');
        
        return [
          payment.id,
          payment.loanId,
          payment.borrower.name_of_borrower,
          formattedAmount,
          formattedDate,
          this.formatDaysUntilDue(payment.daysUntilDue)
        ];
      });
      
      // Add table to PDF
      autoTable(doc, {
        startY: 45,
        head: [['ID', 'Loan ID', 'Borrower', 'Amount Due', 'Due Date', 'Days Until Due']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [71, 119, 140],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 18 },
          2: { cellWidth: 60 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 }
        }
      });
      
      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }
      
      // File name for export
      const fileName = `upcoming-payments-${date.toISOString().split('T')[0]}.pdf`;
      
      // Get device info to determine platform
      const deviceInfo = await Device.getInfo();

      // Save or share the file based on platform
      if (deviceInfo.platform === 'web') {
        // For web, download the PDF
        doc.save(fileName);
        
        await loading.dismiss();
        this.presentToast('PDF file downloaded successfully.', 'success');
      } else {
        // For mobile platforms, save to filesystem and share
        const pdfOutput = doc.output('arraybuffer');
        const base64Data = this.arrayBufferToBase64(pdfOutput);
        
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        
        await loading.dismiss();
        
        // Show success toast
        this.presentToast('PDF file created successfully.', 'success');
        
        // Share the file
        try {
          await Share.share({
            title: 'Upcoming Payments',
            text: 'Upcoming Payments Schedule',
            url: result.uri,
            dialogTitle: 'Share PDF file'
          });
        } catch (shareError) {
          console.error('Error sharing the file:', shareError);
          this.presentToast('File created but sharing failed.', 'warning');
        }
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.presentToast('Failed to export PDF. Please try again.', 'danger');
    }
  }
  
  // Helper method to convert ArrayBuffer to Base64 string
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  }
  
  // Helper method to get a readable filter name
  private getDueDateFilterName(filter: DueDateFilterType): string {
    switch(filter) {
      case 'today': return 'Due Today';
      case 'this-week': return 'Due This Week';
      case 'this-month': return 'Due This Month';
      case 'all': return 'All Upcoming Payments';
      default: return 'Custom Filter';
    }
  }
  
  // Helper method to format days until due
  private formatDaysUntilDue(days: number): string {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
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
