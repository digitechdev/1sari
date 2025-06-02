import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonCardTitle,
  IonSpinner,
  IonBadge, IonItem, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filterOutline,
  walletOutline,
  hourglassOutline,
  refreshCircleOutline,
  checkmarkCircleOutline,
  cashOutline,
  calendarClearOutline,
  alertCircleOutline,
  peopleOutline,
  personAddOutline,
  informationCircleOutline,
  documentAttachOutline,
  checkmarkDoneCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { LoanService } from '../../services/loan.service';
import { Loan } from '../../interfaces/loan.interfaces';
import { LoanStatus } from 'src/app/enums/loan-status.enum';
import { BorrowerService } from '../../services/borrower.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, 
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardContent,
    IonCardTitle,
    IonSpinner,
    IonBadge,
    CommonModule,
    FormsModule
  ]
})
export class DashboardPage implements OnInit {
  private loanService = inject(LoanService);
  private borrowerService = inject(BorrowerService);
  private router = inject(Router);

  activeLoanCount = signal<number>(0);
  pendingLoanCount = signal<number>(0);
  defaultedLoanCount = signal<number>(0);
  paidOffLoanCount = signal<number>(0);
  totalPrincipalReleased = signal<number>(0);
  activePrincipal = signal<number>(0);
  dueTodayCount = signal<number>(0);
  overdueCount = signal<number>(0);
  totalBorrowerCount = signal<number>(0);
  activeBorrowerCount = signal<number>(0);
  isLoadingStats = signal<boolean>(false);
  errorLoadingStats = signal<string | null>(null);

  constructor() {
    addIcons({
      filterOutline,
      walletOutline,
      hourglassOutline,
      refreshCircleOutline,
      checkmarkCircleOutline,
      cashOutline,
      calendarClearOutline,
      alertCircleOutline,
      peopleOutline,
      personAddOutline,
      informationCircleOutline,
      documentAttachOutline,
      checkmarkDoneCircleOutline,
      closeCircleOutline
    });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoadingStats.set(true);
    this.errorLoadingStats.set(null);

    try {
      const [loanResponse, borrowerResponse] = await Promise.all([
        this.loanService.getAllLoans(),
        this.borrowerService.getAllBorrowers()
      ]);
      
      if (loanResponse.error) {
        console.error('Error fetching loans for dashboard:', loanResponse.error);
        throw new Error('Failed to load loan statistics.');
      } else {
        const loans = loanResponse.data || [];
        this.calculateLoanStats(loans);
      }

      if (borrowerResponse.error) {
        console.error('Error fetching borrowers for dashboard:', borrowerResponse.error);
        this.totalBorrowerCount.set(0);
        this.activeBorrowerCount.set(0);
      } else {
        const borrowers = borrowerResponse.data || [];
        this.calculateBorrowerStats(borrowers);
      }

      this.dueTodayCount.set(0);
      this.overdueCount.set(0);

    } catch (err: any) {
      console.error('Unexpected error loading dashboard data:', err);
      this.errorLoadingStats.set(err.message || 'An unexpected error occurred.');
      this.resetAllStats();
    } finally {
      this.isLoadingStats.set(false);
    }
  }

  calculateLoanStats(loans: Loan[]) {
    let activeCount = 0;
    let pendingCount = 0;
    let defaultedCount = 0;
    let paidOffCount = 0;
    let totalPrincipal = 0;
    let currentActivePrincipal = 0;

    loans.forEach((loan: Loan) => {
      totalPrincipal += loan.principal;
      switch (loan.status) {
        case LoanStatus.Active:
          activeCount++;
          currentActivePrincipal += loan.principal;
          break;
        case LoanStatus.Pending:
          pendingCount++;
          break;
        case LoanStatus.Defaulted:
          defaultedCount++;
          break;
        case LoanStatus.Paid: 
          paidOffCount++;
          break;
      }
    });

    this.activeLoanCount.set(activeCount);
    this.pendingLoanCount.set(pendingCount);
    this.defaultedLoanCount.set(defaultedCount);
    this.paidOffLoanCount.set(paidOffCount);
    this.totalPrincipalReleased.set(totalPrincipal);
    this.activePrincipal.set(currentActivePrincipal);
  }

  calculateBorrowerStats(borrowers: any[]) {
    this.totalBorrowerCount.set(borrowers.length);
    this.activeBorrowerCount.set(0);
  }

  resetAllStats() {
    this.activeLoanCount.set(0);
    this.pendingLoanCount.set(0);
    this.defaultedLoanCount.set(0);
    this.paidOffLoanCount.set(0);
    this.totalPrincipalReleased.set(0);
    this.activePrincipal.set(0);
    this.dueTodayCount.set(0);
    this.overdueCount.set(0);
    this.totalBorrowerCount.set(0);
    this.activeBorrowerCount.set(0);
  }

  viewDetails(type: string) {
    console.log(`Navigate to view details for: ${type}`);
    switch(type) {
        case 'loans':
        case 'active-loans':
        case 'pending-loans':
        case 'due-today':
        case 'fully-paid':
        case 'overdue':
        case 'defaulted':
        case 'requested-loans':
            this.router.navigate(['/loans']);
            break;
        case 'borrowers':
        case 'active-borrowers':
            this.router.navigate(['/borrowers']);
            break;
        default:
            console.warn('Unknown details type:', type);
            break;
    }
  }

  showInfo(widgetName: string) {
    alert(`Information about ${widgetName}`);
  }
}