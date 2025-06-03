import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  callOutline, 
  personOutline,
  cashOutline,
  calendarOutline,
  timeOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  arrowForwardOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { PaymentStatus } from '../../../enums/payment-status.enum';
import { PaymentSchedule } from '../../../services/loan-payment-schedule.service';

@Component({
  selector: 'app-payment-detail-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ formattedDate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismissModal()">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Payment Summary</ion-card-title>
          <ion-card-subtitle>{{ payments.length }} payments due</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <div class="summary-label">Total Due</div>
                <div class="summary-value">{{ formatAmount(getTotalAmount()) }}</div>
              </ion-col>
              <ion-col size="6">
                <div class="summary-label">Status</div>
                <div class="summary-badges">
                  <ion-badge *ngIf="getOverdueCount() > 0" color="danger">
                    {{ getOverdueCount() }} Overdue
                  </ion-badge>
                  <ion-badge *ngIf="getPendingCount() > 0" color="warning">
                    {{ getPendingCount() }} Pending
                  </ion-badge>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <ion-list lines="full">
        <ion-item *ngFor="let payment of payments">
          <ion-avatar slot="start" (click)="viewLoanDetails(payment.loan_id)">
            <div class="avatar-placeholder">
              <ng-container *ngIf="payment && payment.borrower_name && payment.borrower_name.length">
                {{ payment.borrower_name[0] }}
              </ng-container>
              <ng-container *ngIf="!payment || !payment.borrower_name || !payment.borrower_name.length">
                ?
              </ng-container>
            </div>
          </ion-avatar>
          
          <ion-label>
            <h2>{{ payment?.borrower_name || 'Unknown Borrower' }}</h2>
            <p>
              <ion-icon name="call-outline"></ion-icon>
              {{ payment?.borrower_contact || 'No contact info' }}
            </p>
            <p>
              <ion-icon name="cash-outline"></ion-icon>
              {{ formatAmount(payment?.amount_due || 0) }}
            </p>
          </ion-label>
          
          <div slot="end" class="payment-actions">
            <ion-badge [color]="getStatusColor(payment?.status || 'Open')">
              {{ payment?.status || 'Open' }}
            </ion-badge>
            <ion-button size="small" fill="clear" (click)="recordPayment(payment.id)">
              Record Payment
            </ion-button>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: var(--ion-color-primary);
      color: white;
      font-weight: bold;
      font-size: 18px;
      border-radius: 50%;
    }
    
    .summary-label {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin-bottom: 4px;
    }
    
    .summary-value {
      font-size: 20px;
      font-weight: bold;
      color: var(--ion-color-dark);
    }
    
    .summary-badges {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .payment-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol,
    IonChip
  ]
})
export class PaymentDetailModalComponent {
  @Input() date: Date = new Date();
  @Input() payments: PaymentSchedule[] = [];
  
  private modalCtrl = inject(ModalController);
  private router = inject(Router);
  
  constructor() {
    addIcons({
      closeOutline,
      callOutline,
      personOutline,
      cashOutline,
      calendarOutline,
      timeOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      arrowForwardOutline
    });
  }
  
  get formattedDate(): string {
    return this.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  getTotalAmount(): number {
    return this.payments.reduce((sum, payment) => {
      return sum + (payment?.amount_due || 0);
    }, 0);
  }
  
  getOverdueCount(): number {
    return this.payments.filter(payment => 
      payment?.status === PaymentStatus.Overdue
    ).length;
  }
  
  getPendingCount(): number {
    return this.payments.filter(payment => 
      payment?.status === PaymentStatus.Pending
    ).length;
  }
  
  formatAmount(amount: number): string {
    if (amount === undefined || amount === null) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }
  
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
  
  viewLoanDetails(loanId: number | undefined) {
    if (!loanId) return;
    this.dismissModal();
    this.router.navigate(['/loans/detail', loanId]);
  }
  
  recordPayment(scheduleId: number | undefined) {
    if (!scheduleId) return;
    this.dismissModal();
    this.router.navigate(['/payments/new'], { 
      queryParams: { scheduleId }
    });
  }
  
  dismissModal() {
    this.modalCtrl.dismiss();
  }
} 