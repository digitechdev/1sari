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
  IonButtons,
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonList,
  IonDatetime,
  IonPopover,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonChip,
  IonBadge,
  IonSearchbar,
  IonModal,
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
  RangeCustomEvent,
  DatetimeCustomEvent,
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
  chevronDownOutline,
  funnel,
  statsChart,
  personOutline,
  cashOutline,
  timeOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  calendarClearOutline,
  shareOutline,
  arrowUpOutline,
  arrowDownOutline,
  eyeOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { LoanService } from '../../../services/loan.service';

interface LoanDisbursement {
  id: number;
  loanNumber: string;
  borrowerName: string;
  borrowerId: number;
  disbursementDate: string;
  loanAmount: number;
  interestRate: number;
  term: number;
  termUnit: string;
  loanType: string;
  collateral?: string;
  status: string;
  collateralItems?: string[];
}

interface ReportSummary {
  totalLoans: number;
  totalAmount: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  loanTypeDistribution: {[key: string]: number};
}

interface DistributionItem {
  key: string;
  value: number;
}

// Add missing interface for collateral items
interface CollateralItem {
  item_description: string;
  item_value?: number;
  loan_id?: number;
}

@Component({
  selector: 'app-disbursement-report',
  templateUrl: './disbursement-report.page.html',
  styleUrls: ['./disbursement-report.page.scss'],
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
    IonItem,
    IonList,
    IonDatetime,
    IonPopover,
    IonGrid,
    IonRow,
    IonCol,
    IonSpinner,
    IonChip,
    IonBadge,
    IonSearchbar,
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
export class DisbursementReportPage implements OnInit {
  // Services
  private loanService = inject(LoanService);
  private datePipe = inject(DatePipe);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  // Datatable properties
  ColumnMode = ColumnMode;
  tableColumns = [
    { name: 'Loan #', prop: 'loanNumber' },
    { name: 'Borrower', prop: 'borrowerName' },
    { name: 'Date', prop: 'disbursementDate' },
    { name: 'Amount', prop: 'loanAmount' },
    { name: 'Interest', prop: 'interestRate' },
    { name: 'Term', prop: 'term' },
    { name: 'Type', prop: 'loanType' },
    { name: 'Actions', prop: 'id', sortable: false }
  ];

  // Signals for reactive state
  isLoading = signal<boolean>(false);
  loans = signal<LoanDisbursement[]>([]);
  filteredLoans = signal<LoanDisbursement[]>([]);
  reportSummary = signal<ReportSummary>({
    totalLoans: 0,
    totalAmount: 0,
    avgAmount: 0,
    minAmount: 0,
    maxAmount: 0,
    loanTypeDistribution: {}
  });
  
  // Filter properties
  startDate = signal<string>(this.getDefaultStartDate());
  endDate = signal<string>(this.getDefaultEndDate());
  searchTerm = signal<string>('');
  filterLoanType = signal<string>('all');
  minAmount = signal<number>(0);
  maxAmount = signal<number>(999999999);
  
  // Sort options
  sortBy = signal<string>('disbursementDate');
  sortDirection = signal<'asc' | 'desc'>('desc');
  
  // Available loan types
  loanTypes = ['Personal', 'Business', 'Education', 'Emergency', 'Housing', 'Vehicle'];
  
  // Type colors
  typeColors: { [key: string]: string } = {
    'Personal': 'primary',
    'Business': 'success',
    'Education': 'tertiary',
    'Emergency': 'danger',
    'Housing': 'warning',
    'Vehicle': 'secondary',
    'Other': 'medium'
  };
  
  // For performance optimization
  private debounceTimer: any;
  
  constructor() {
    addIcons({
      calendarOutline,
      downloadOutline,
      filterOutline,
      printOutline,
      searchOutline,
      refreshOutline,
      chevronDownOutline,
      funnel,
      statsChart,
      personOutline,
      cashOutline,
      timeOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      arrowForwardOutline,
      calendarClearOutline,
      shareOutline,
      arrowUpOutline,
      arrowDownOutline,
      eyeOutline
    });
  }

  ngOnInit() {
    // Delay initial load to prevent UI freezing
    setTimeout(() => {
      this.loadDisbursementData();
    }, 100);
  }
  
  /**
   * Handle start date change
   */
  onStartDateChange(event: Event) {
    const ev = event as DatetimeCustomEvent;
    if (ev.detail.value) {
      this.startDate.set(ev.detail.value.toString());
      this.debounceAction(() => this.dateRangeChanged());
    }
  }
  
  /**
   * Handle end date change
   */
  onEndDateChange(event: Event) {
    const ev = event as DatetimeCustomEvent;
    if (ev.detail.value) {
      this.endDate.set(ev.detail.value.toString());
      this.debounceAction(() => this.dateRangeChanged());
    }
  }
  
  /**
   * Handle search input change
   */
  onSearchChange(event: Event) {
    const ev = event as SearchbarCustomEvent;
    this.searchTerm.set(ev.detail.value || '');
    this.debounceAction(() => this.applyFilters());
  }
  
  /**
   * Handle amount range change
   */
  onAmountRangeChange(event: Event) {
    const ev = event as RangeCustomEvent;
    if (typeof ev.detail.value === 'number') {
      this.maxAmount.set(ev.detail.value);
      this.debounceAction(() => this.applyFilters());
    }
  }
  
  /**
   * Debounce an action to prevent too many rapid updates
   */
  private debounceAction(action: () => void, delay = 300) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      action();
    }, delay);
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
   * Get default end date (current date)
   */
  private getDefaultEndDate(): string {
    return new Date().toISOString();
  }
  
  /**
   * Get maximum range value for the amount filter
   */
  getMaxRangeValue(): number {
    // Use the maximum loan amount or a default value if no loans
    const maxInData = this.reportSummary().maxAmount;
    if (maxInData > 0) {
      // Round up to the nearest 10,000 for a cleaner UI
      return Math.ceil(maxInData / 10000) * 10000;
    }
    return 1000000; // Default 1 million if no data
  }
  
  /**
   * Get distribution items for the UI
   */
  getDistributionItems(): DistributionItem[] {
    const distribution = this.reportSummary().loanTypeDistribution;
    // Limit to top 5 for better performance
    return Object.entries(distribution)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }
  
  /**
   * Get color for loan type badge
   */
  getLoanTypeColor(loanType: string): string {
    return this.typeColors[loanType] || 'medium';
  }
  
  /**
   * Load loan disbursement data with loading indicator
   */
  async loadDisbursementData() {
    if (this.isLoading()) return; // Prevent multiple concurrent loads
    
    try {
      this.isLoading.set(true);
      
      // Show loading indicator
      const loader = await this.loadingCtrl.create({
        message: 'Loading disbursement data...',
        spinner: 'circles',
        duration: 15000 // Timeout after 15 seconds
      });
      await loader.present();
      
      // Get start and end dates for the query
      const start = new Date(this.startDate());
      const end = new Date(this.endDate());
      
      // Format dates for API call
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      
      try {
        // Mock data for demonstration
        // Use a smaller count to improve performance
        const mockLoans = this.getMockLoanData(startStr, endStr, 50);
        
        // Perform data transformation off the main thread
        setTimeout(() => {
          const loanData: LoanDisbursement[] = mockLoans.map(loan => ({
            id: loan.id,
            loanNumber: loan.loan_number || `LOAN-${loan.id}`,
            borrowerName: loan.borrower?.name_of_borrower || 'Unknown',
            borrowerId: loan.borrower_id || 0,
            disbursementDate: loan.disbursement_date || '',
            loanAmount: loan.loan_amount || 0,
            interestRate: loan.interest_rate || 0,
            term: loan.terms || 0,
            termUnit: loan.term_unit || 'months',
            loanType: loan.loan_type || 'Personal',
            collateral: loan.collateral || '',
            status: loan.status || 'Active',
            collateralItems: loan.collateral_items?.map((item: CollateralItem) => item.item_description) || []
          }));
          
          // Store loans
          this.loans.set(loanData);
          
          // Apply filters
          this.applyFilters();
          
          // Generate report summary using the filtered data
          this.generateReportSummary(this.filteredLoans());
          
          // Dismiss loader
          loader.dismiss();
          this.isLoading.set(false);
        }, 100);
      } catch (error) {
        console.error('Error fetching loan disbursements:', error);
        this.presentToast('Failed to load disbursement data', 'danger');
        this.loans.set([]);
        this.filteredLoans.set([]);
        this.resetReportSummary();
        loader.dismiss();
        this.isLoading.set(false);
      }
    } catch (error) {
      console.error('Error in loadDisbursementData:', error);
      this.isLoading.set(false);
      this.presentToast('An error occurred while loading data', 'danger');
    }
  }
  
  /**
   * Generate mock loan data for demonstration with limited size
   */
  private getMockLoanData(startDate: string, endDate: string, count = 20): any[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const mockLoans = [];
    const loanTypes = this.loanTypes;
    
    // Generate a limited number of random loans
    const loanCount = Math.min(count, 50); // Cap at 50 loans for performance
    
    for (let i = 1; i <= loanCount; i++) {
      // Random date between start and end
      const disbursementDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      
      // Random loan type
      const loanType = loanTypes[Math.floor(Math.random() * loanTypes.length)];
      
      // Random loan amount based on type
      let baseAmount = 10000;
      switch (loanType) {
        case 'Business': baseAmount = 50000; break;
        case 'Housing': baseAmount = 100000; break;
        case 'Vehicle': baseAmount = 30000; break;
        case 'Education': baseAmount = 20000; break;
        case 'Emergency': baseAmount = 5000; break;
      }
      
      const variance = baseAmount * 0.5; // 50% variance
      const loanAmount = baseAmount + (Math.random() * variance * 2) - variance;
      
      // Create a mock loan - simplified to improve performance
      mockLoans.push({
        id: i,
        loan_number: `LOAN-${new Date().getFullYear()}-${i.toString().padStart(4, '0')}`,
        borrower: {
          name_of_borrower: this.getRandomBorrowerName(),
          id: i * 10,
          contact_no_borrower: `09${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
        },
        borrower_id: i * 10,
        disbursement_date: disbursementDate.toISOString(),
        loan_amount: Math.round(loanAmount),
        interest_rate: 5 + (Math.random() * 10),
        terms: Math.floor(Math.random() * 24) + 6,
        term_unit: 'months',
        loan_type: loanType,
        collateral: loanType === 'Personal' ? '' : this.getRandomCollateral(loanType),
        status: 'Active',
        collateral_items: loanType === 'Personal' ? [] : [
          { item_description: this.getRandomCollateral(loanType) }
        ]
      });
    }
    
    return mockLoans;
  }
  
  /**
   * Get a random borrower name for mock data
   */
  private getRandomBorrowerName(): string {
    const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro'];
    const lastNames = ['Garcia', 'Santos', 'Reyes', 'Lim', 'Cruz'];
    
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }
  
  /**
   * Get random collateral based on loan type
   */
  private getRandomCollateral(loanType: string): string {
    switch (loanType) {
      case 'Business':
        return ['Business Equipment', 'Commercial Property'][Math.floor(Math.random() * 2)];
      case 'Housing':
        return ['Residential Property', 'Land Title'][Math.floor(Math.random() * 2)];
      case 'Vehicle':
        return ['Car', 'Motorcycle'][Math.floor(Math.random() * 2)];
      default:
        return 'Personal Guarantee';
    }
  }
  
  /**
   * Reset report summary to default values
   */
  private resetReportSummary() {
    this.reportSummary.set({
      totalLoans: 0,
      totalAmount: 0,
      avgAmount: 0,
      minAmount: 0,
      maxAmount: 0,
      loanTypeDistribution: {}
    });
  }
  
  /**
   * Generate report summary from loan data
   */
  private generateReportSummary(loans: LoanDisbursement[]) {
    if (!loans.length) {
      this.resetReportSummary();
      return;
    }
    
    // Calculate summary using a more efficient approach
    let totalAmount = 0;
    let minAmount = Infinity;
    let maxAmount = 0;
    const loanTypeDistribution: {[key: string]: number} = {};
    
    // Single loop for better performance
    for (const loan of loans) {
      // Update total
      totalAmount += loan.loanAmount;
      
      // Update min/max
      if (loan.loanAmount < minAmount) minAmount = loan.loanAmount;
      if (loan.loanAmount > maxAmount) maxAmount = loan.loanAmount;
      
      // Update distribution
      const loanType = loan.loanType || 'Other';
      loanTypeDistribution[loanType] = (loanTypeDistribution[loanType] || 0) + 1;
    }
    
    // Update the report summary
    this.reportSummary.set({
      totalLoans: loans.length,
      totalAmount,
      avgAmount: totalAmount / loans.length,
      minAmount: minAmount === Infinity ? 0 : minAmount,
      maxAmount,
      loanTypeDistribution
    });
  }
  
  /**
   * Apply all filters and sorting to loan data
   */
  applyFilters() {
    let filtered = [...this.loans()];
    
    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(loan => 
        loan.borrowerName.toLowerCase().includes(search) ||
        loan.loanNumber.toLowerCase().includes(search)
      );
    }
    
    // Filter by loan type
    const loanType = this.filterLoanType();
    if (loanType && loanType !== 'all') {
      filtered = filtered.filter(loan => loan.loanType === loanType);
    }
    
    // Filter by amount range
    filtered = filtered.filter(loan => 
      loan.loanAmount >= this.minAmount() && 
      loan.loanAmount <= this.maxAmount()
    );
    
    // Sort the data
    const sortBy = this.sortBy();
    const sortDir = this.sortDirection();
    
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof LoanDisbursement];
      let bValue: any = b[sortBy as keyof LoanDisbursement];
      
      // Handle date sorting
      if (sortBy === 'disbursementDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDir === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Handle number sorting
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    this.filteredLoans.set(filtered);
    this.generateReportSummary(filtered);
  }
  
  /**
   * Handle date range changes
   */
  dateRangeChanged() {
    this.loadDisbursementData();
  }
  
  /**
   * Toggle sort direction
   */
  toggleSortDirection() {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    this.applyFilters();
  }
  
  /**
   * Change sort field
   */
  changeSortBy(field: string) {
    this.sortBy.set(field);
    this.applyFilters();
  }
  
  /**
   * Reset all filters to default values
   */
  resetFilters() {
    this.searchTerm.set('');
    this.filterLoanType.set('all');
    this.minAmount.set(0);
    this.maxAmount.set(999999999);
    this.applyFilters();
  }
  
  /**
   * Navigate to loan details
   */
  viewLoanDetails(loanId: number) {
    this.router.navigate(['/loans/detail', loanId]);
  }
  
  /**
   * Export report as CSV
   */
  exportCSV() {
    try {
      const loans = this.filteredLoans();
      if (!loans.length) {
        this.presentToast('No data to export', 'warning');
        return;
      }
      
      // Create CSV header
      const headers = [
        'Loan Number', 
        'Borrower Name', 
        'Disbursement Date', 
        'Loan Amount', 
        'Interest Rate', 
        'Term',
        'Loan Type',
        'Status'
      ];
      
      // Create CSV rows - process in batches for better performance
      const batchSize = 100;
      let csvRows = [headers.join(',')];
      
      for (let i = 0; i < loans.length; i += batchSize) {
        const batch = loans.slice(i, i + batchSize);
        const batchRows = batch.map(loan => {
          const row = [
            `"${loan.loanNumber}"`,
            `"${loan.borrowerName}"`,
            `"${this.formatDate(loan.disbursementDate)}"`,
            loan.loanAmount,
            `${loan.interestRate}%`,
            `${loan.term} ${loan.termUnit}`,
            `"${loan.loanType}"`,
            `"${loan.status}"`
          ];
          return row.join(',');
        });
        csvRows = csvRows.concat(batchRows);
      }
      
      // Create the CSV content
      const csvContent = csvRows.join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `loan_disbursement_report_${this.formatDateFilename(new Date())}.csv`);
      link.style.visibility = 'hidden';
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
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return this.datePipe.transform(date, 'MMM dd, yyyy') || 'Invalid Date';
    } catch (e) {
      return 'Invalid Date';
    }
  }
  
  /**
   * Format date for filename
   */
  formatDateFilename(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Format currency for display - with caching for performance
   */
  private formattedAmountCache = new Map<number, string>();
  
  formatAmount(amount: number): string {
    // Check cache first
    if (this.formattedAmountCache.has(amount)) {
      return this.formattedAmountCache.get(amount)!;
    }
    
    // Format and cache the result
    const formatted = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
    
    this.formattedAmountCache.set(amount, formatted);
    return formatted;
  }
  
  /**
   * Display a toast message
   */
  private async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [{ text: 'Dismiss', role: 'cancel' }]
    });
    
    await toast.present();
  }
} 