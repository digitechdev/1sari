import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonBadge,
  IonSkeletonText,
  IonSpinner,
  IonInput,
  IonSelect,
  IonSelectOption,
  LoadingController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { addIcons } from 'ionicons';
import {
  calculatorOutline,
  downloadOutline,
  documentOutline,
  printOutline,
  refreshOutline,
  chevronDownOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';

interface AmortizationEntry {
  period: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

@Component({
  selector: 'app-amortization',
  templateUrl: './amortization.page.html',
  styleUrls: ['./amortization.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    NgxDatatableModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonBadge,
    IonSkeletonText,
    IonSpinner,
    IonInput,
    IonSelect,
    IonSelectOption
  ],
  providers: [DatePipe, CurrencyPipe]
})
export class AmortizationPage implements OnInit {
  // Services
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  
  // Table configuration
  ColumnMode = ColumnMode;
  
  // Loan parameters
  loanAmount = signal<number>(100000);
  interestRate = signal<number>(12);
  loanTerm = signal<number>(12);
  paymentFrequency = signal<string>('monthly');
  
  // Calculated amortization schedule
  amortizationSchedule = signal<AmortizationEntry[]>([]);
  isCalculating = signal<boolean>(false);
  
  // Summary calculations
  totalPayment = computed(() => {
    return this.amortizationSchedule().reduce((sum, entry) => sum + entry.payment, 0);
  });
  
  totalInterest = computed(() => {
    return this.amortizationSchedule().reduce((sum, entry) => sum + entry.interest, 0);
  });
  
  // Table columns
  tableColumns = [
    { name: '#', prop: 'period', width: 50 },
    { 
      name: 'Date', 
      prop: 'date', 
      width: 120,
      pipe: {
        transform: (value: string) => this.datePipe.transform(value, 'mediumDate')
      }
    },
    { 
      name: 'Payment', 
      prop: 'payment', 
      width: 100,
      pipe: {
        transform: (value: number) => this.currencyPipe.transform(value, 'PHP')
      }
    },
    { 
      name: 'Principal', 
      prop: 'principal', 
      width: 100,
      pipe: {
        transform: (value: number) => this.currencyPipe.transform(value, 'PHP')
      }
    },
    { 
      name: 'Interest', 
      prop: 'interest', 
      width: 100,
      pipe: {
        transform: (value: number) => this.currencyPipe.transform(value, 'PHP')
      }
    },
    { 
      name: 'Balance', 
      prop: 'balance', 
      width: 100,
      pipe: {
        transform: (value: number) => this.currencyPipe.transform(value, 'PHP')
      }
    }
  ];

  constructor() {
    addIcons({
      calculatorOutline,
      downloadOutline,
      documentOutline,
      printOutline,
      refreshOutline,
      chevronDownOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    this.calculateAmortization();
  }

  calculateAmortization() {
    this.isCalculating.set(true);
    
    const principal = this.loanAmount();
    const annualRate = this.interestRate() / 100;
    const termMonths = this.loanTerm();
    const schedule: AmortizationEntry[] = [];
    
    // Calculate periodic interest rate based on payment frequency
    let periodicRate: number;
    let numberOfPayments: number;
    
    switch (this.paymentFrequency()) {
      case 'weekly':
        periodicRate = annualRate / 52;
        numberOfPayments = termMonths * (52 / 12);
        break;
      case 'biweekly':
        periodicRate = annualRate / 26;
        numberOfPayments = termMonths * (26 / 12);
        break;
      case 'monthly':
      default:
        periodicRate = annualRate / 12;
        numberOfPayments = termMonths;
        break;
    }
    
    // Calculate payment amount (PMT formula)
    const payment = principal * (periodicRate * Math.pow(1 + periodicRate, numberOfPayments)) / (Math.pow(1 + periodicRate, numberOfPayments) - 1);
    
    // Generate amortization schedule
    let balance = principal;
    let currentDate = new Date();
    
    for (let i = 1; i <= numberOfPayments; i++) {
      // Calculate interest for this period
      const interestPayment = balance * periodicRate;
      
      // Calculate principal for this period
      const principalPayment = payment - interestPayment;
      
      // Update balance
      balance -= principalPayment;
      
      // Adjust for final payment rounding
      const adjustedBalance = i === numberOfPayments ? 0 : balance;
      
      // Create schedule entry
      schedule.push({
        period: i,
        date: new Date(currentDate).toISOString(),
        payment: payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: adjustedBalance
      });
      
      // Advance date for next payment
      switch (this.paymentFrequency()) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
        default:
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }
    
    this.amortizationSchedule.set(schedule);
    this.isCalculating.set(false);
  }
  
  updateCalculation() {
    this.calculateAmortization();
  }
  
  async exportOptions() {
    const alert = await this.alertCtrl.create({
      header: 'Export Amortization Schedule',
      message: 'Choose export format:',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'CSV',
          handler: () => {
            this.exportToCSV();
          }
        },
        {
          text: 'PDF',
          handler: () => {
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

      // Get data
      const schedule = this.amortizationSchedule();
      
      if (schedule.length === 0) {
        this.presentToast('No data available to export', 'warning');
        await loading.dismiss();
        return;
      }

      // Create CSV content
      let csvContent = 'Payment #,Date,Payment,Principal,Interest,Balance\n';
      
      // Add row data
      schedule.forEach(item => {
        const date = this.datePipe.transform(item.date, 'yyyy-MM-dd') || '';
        const payment = item.payment.toFixed(2);
        const principal = item.principal.toFixed(2);
        const interest = item.interest.toFixed(2);
        const balance = item.balance.toFixed(2);
        
        csvContent += `${item.period},${date},${payment},${principal},${interest},${balance}\n`;
      });
      
      // Add summary row
      csvContent += `\nSummary,,,,,\n`;
      csvContent += `Total Payments,${schedule.length},${this.totalPayment().toFixed(2)},${(this.totalPayment() - this.totalInterest()).toFixed(2)},${this.totalInterest().toFixed(2)},\n`;
      
      // Filename
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const fileName = `amortization-schedule-${dateStr}.csv`;
      
      // Get device info
      const deviceInfo = await Device.getInfo();

      if (deviceInfo.platform === 'web') {
        // For web, create download
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
        this.presentToast('CSV file downloaded successfully', 'success');
      } else {
        // For mobile platforms
        const result = await Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        await loading.dismiss();
        this.presentToast('CSV file created successfully', 'success');
        
        try {
          await Share.share({
            title: 'Amortization Schedule',
            text: 'Amortization Schedule Export',
            url: result.uri,
            dialogTitle: 'Share CSV file'
          });
        } catch (error) {
          console.error('Error sharing the file:', error);
          this.presentToast('File created but sharing failed', 'warning');
        }
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      this.presentToast('Failed to export CSV file', 'danger');
      await this.loadingCtrl.dismiss();
    }
  }
  
  async exportToPDF() {
    try {
      const loading = await this.loadingCtrl.create({
        message: 'Generating PDF file...',
        spinner: 'circles'
      });
      await loading.present();

      // Get data
      const schedule = this.amortizationSchedule();
      
      if (schedule.length === 0) {
        this.presentToast('No data available to export', 'warning');
        await loading.dismiss();
        return;
      }

      // Create PDF document (A4 format)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title and metadata
      const title = 'Amortization Schedule';
      const date = new Date();
      const dateStr = this.datePipe.transform(date, 'medium') || date.toISOString();
      
      // Set PDF metadata
      doc.setProperties({
        title: title,
        subject: 'Loan Amortization Schedule',
        author: '1Sari Lending System',
        keywords: 'loan, amortization, schedule',
        creator: '1Sari Lending System'
      });
      
      // Add title
      doc.setFontSize(16);
      doc.text(title, 14, 20);
      
      // Add loan details
      doc.setFontSize(10);
      doc.text(`Loan Amount: ${this.currencyPipe.transform(this.loanAmount(), 'PHP')}`, 14, 30);
      doc.text(`Interest Rate: ${this.interestRate()}%`, 14, 35);
      doc.text(`Loan Term: ${this.loanTerm()} months`, 14, 40);
      doc.text(`Payment Frequency: ${this.paymentFrequency()}`, 14, 45);
      
      // Current date
      doc.text(`Generated on: ${dateStr}`, 14, 50);
      
      // Company info (top right)
      doc.setFontSize(12);
      doc.text('1Sari Lending System', 170, 20, { align: 'right' });
      
      // Format data for PDF table
      const tableData = schedule.map(item => [
        item.period,
        this.datePipe.transform(item.date, 'mediumDate'),
        this.currencyPipe.transform(item.payment, 'PHP', 'symbol'),
        this.currencyPipe.transform(item.principal, 'PHP', 'symbol'),
        this.currencyPipe.transform(item.interest, 'PHP', 'symbol'),
        this.currencyPipe.transform(item.balance, 'PHP', 'symbol')
      ]);
      
      // Add table to PDF
      autoTable(doc, {
        startY: 55,
        head: [['#', 'Date', 'Payment', 'Principal', 'Interest', 'Balance']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [71, 119, 140],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' }
        },
        styles: {
          fontSize: 8
        }
      });
      
      // Get the Y position after the table
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      
      // Add summary information
      doc.setFontSize(10);
      doc.text('Summary:', 14, finalY + 10);
      
      doc.setFontSize(9);
      doc.text(`Total Payments: ${schedule.length}`, 14, finalY + 15);
      doc.text(`Total Amount Paid: ${this.currencyPipe.transform(this.totalPayment(), 'PHP')}`, 14, finalY + 20);
      doc.text(`Total Principal: ${this.currencyPipe.transform(this.totalPayment() - this.totalInterest(), 'PHP')}`, 14, finalY + 25);
      doc.text(`Total Interest: ${this.currencyPipe.transform(this.totalInterest(), 'PHP')}`, 14, finalY + 30);
      
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
      
      // Filename
      const fileName = `amortization-schedule-${date.toISOString().split('T')[0]}.pdf`;
      
      // Get device info
      const deviceInfo = await Device.getInfo();

      if (deviceInfo.platform === 'web') {
        // For web, download the PDF
        doc.save(fileName);
        
        await loading.dismiss();
        this.presentToast('PDF file downloaded successfully', 'success');
      } else {
        // For mobile platforms
        const pdfOutput = doc.output('arraybuffer');
        const base64Data = this.arrayBufferToBase64(pdfOutput);
        
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        
        await loading.dismiss();
        this.presentToast('PDF file created successfully', 'success');
        
        try {
          await Share.share({
            title: 'Amortization Schedule',
            text: 'Amortization Schedule',
            url: result.uri,
            dialogTitle: 'Share PDF file'
          });
        } catch (error) {
          console.error('Error sharing the file:', error);
          this.presentToast('File created but sharing failed', 'warning');
        }
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      this.presentToast('Failed to export PDF file', 'danger');
      await this.loadingCtrl.dismiss();
    }
  }
  
  async printAmortization() {
    window.print();
  }
  
  // Helper function to convert ArrayBuffer to Base64 string
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
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

  // Methods to handle input changes
  handleLoanAmountChange(event: any) {
    const value = event.target.value || '0';
    this.loanAmount.set(parseFloat(value));
  }
  
  handleInterestRateChange(event: any) {
    const value = event.target.value || '0';
    this.interestRate.set(parseFloat(value));
  }
  
  handleLoanTermChange(event: any) {
    const value = event.target.value || '0';
    this.loanTerm.set(parseFloat(value));
  }
  
  handleFrequencyChange(event: any) {
    const value = event.detail.value;
    this.paymentFrequency.set(value);
  }
}
