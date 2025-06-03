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
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonText,
  IonSpinner,
  ToastController,
  AlertController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  timeOutline,
  calendarOutline,
  alertCircleOutline,
  refreshOutline,
  eyeOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { NgxDatatableModule, ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.page.html',
  styleUrls: ['./payment-history.page.scss', '../../../../../node_modules/@swimlane/ngx-datatable/themes/material.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar,
    IonText,
    IonSpinner
  ],
  providers: [DatePipe, CurrencyPipe]
})
export class PaymentHistoryPage implements OnInit, AfterViewInit {
  @ViewChild('paymentActionsTemplate', { static: false }) paymentActionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) table: DatatableComponent | undefined;

  private router = inject(Router);
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private cdRef = inject(ChangeDetectorRef);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);

  // Data for the payments table
  allPayments = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorLoading = signal<string | null>(null);
  searchTerm = signal<string>('');
  displayablePayments = signal<any[]>([]);
  private actionsTemplateAssigned = false;

  filteredPayments = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      return this.allPayments();
    }
    
    return this.allPayments().filter(payment =>
      payment.id?.toString().includes(term) ||
      (payment.borrower?.name_of_borrower && payment.borrower.name_of_borrower.toLowerCase().includes(term)) ||
      (payment.payment_date && this.datePipe.transform(payment.payment_date)?.toLowerCase().includes(term)) ||
      (payment.loan_id?.toString().includes(term))
    );
  });

  ColumnMode = ColumnMode;
  tableColumns: any[] = [
    { prop: 'id', name: 'Payment ID', width: 80 },
    { prop: 'loan_id', name: 'Loan ID', width: 80 },
    {
      prop: 'borrower.name_of_borrower',
      name: 'Borrower',
      width: 150
    },
    { 
      prop: 'amount', 
      name: 'Amount', 
      width: 120,
      pipe: { transform: (value: number) => this.currencyPipe.transform(value, 'PHP', 'symbol') } 
    },
    {
      prop: 'payment_date',
      name: 'Payment Date',
      width: 130,
      pipe: {
        transform: (value: string) => this.datePipe.transform(value, 'mediumDate'),
      },
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

  constructor() {
    // Register icons
    addIcons({
      addOutline,
      timeOutline,
      calendarOutline,
      alertCircleOutline,
      refreshOutline,
      eyeOutline,
      createOutline,
      trashOutline
    });
    
    effect(() => {
      console.log('Payments list updated:', this.allPayments().length);
      console.log('Filtered payment count:', this.filteredPayments().length);
      if (this.actionsTemplateAssigned) {
        this.displayablePayments.set(this.filteredPayments());
      }
    });
  }

  ngOnInit() {
    this.loadPayments();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
    this.tryAssignTemplateAndData();
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

  async loadPayments(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading.set(true);
    }
    this.errorLoading.set(null);
    this.displayablePayments.set([]);
    this.actionsTemplateAssigned = false;
    this.searchTerm.set('');

    // Mock data for now - replace with actual service call when available
    setTimeout(() => {
      const mockPayments = [
        {
          id: 1,
          loan_id: 101,
          borrower: { id: 1, name_of_borrower: 'John Doe' },
          amount: 5000,
          payment_date: '2023-10-15',
          payment_method: 'Cash'
        },
        {
          id: 2,
          loan_id: 102,
          borrower: { id: 2, name_of_borrower: 'Jane Smith' },
          amount: 7500,
          payment_date: '2023-10-18',
          payment_method: 'Bank Transfer'
        },
        {
          id: 3,
          loan_id: 103,
          borrower: { id: 3, name_of_borrower: 'Robert Johnson' },
          amount: 3000,
          payment_date: '2023-10-20',
          payment_method: 'Cash'
        }
      ];
      
      this.allPayments.set(mockPayments);
      this.isLoading.set(false);
      this.cdRef.detectChanges();
      this.tryAssignTemplateAndData();
    }, 1000);
  }

  tryAssignTemplateAndData() {
    if (this.paymentActionsTemplate && !this.actionsTemplateAssigned) {
      const actionsCol = this.tableColumns.find(col => col.name === 'Actions');
      if (actionsCol) { 
        actionsCol.cellTemplate = this.paymentActionsTemplate;
        this.tableColumns = [...this.tableColumns];
        this.actionsTemplateAssigned = true;
        console.log('Payment actions template assigned.');
        this.displayablePayments.set(this.filteredPayments());
        this.cdRef.detectChanges();
      } else {
        console.warn('Could not find Actions column to assign template.');
      }
    } else if (this.actionsTemplateAssigned) {
      this.displayablePayments.set(this.filteredPayments());
      this.cdRef.detectChanges();
    } else {
      console.log('Payment actions template not ready yet.');
    }
  }

  handleSearch(event: any) {
    const term = event.target.value || '';
    this.searchTerm.set(term);
  }

  async refreshData() {
    await this.loadPayments(true);
    const toast = await this.toastCtrl.create({
      message: 'Payment data refreshed.',
      duration: 1500,
      position: 'bottom',
      color: 'medium',
    });
    await toast.present();
  }

  async viewPayment(payment: any) {
    console.log('View Payment clicked:', payment);
    this.router.navigate(['/payments/detail', payment.id]);
  }

  async editPayment(payment: any) {
    console.log('Edit Payment clicked:', payment);
    await this.presentToast('Edit Payment functionality not yet implemented.', 'warning');
  }

  async deletePayment(payment: any) {
    console.log('Attempting to delete payment:', payment);
    if (!payment || typeof payment.id === 'undefined') {
      console.error('Invalid payment data provided for deletion.');
      await this.presentToast('Could not delete payment: Invalid data.', 'danger');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete Payment ID ${payment.id} for ${payment.borrower?.name_of_borrower || 'Unknown Borrower'}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Delete', 
          role: 'destructive',
          handler: async () => { 
            console.log('Delete confirmed for payment:', payment.id);
            // Replace with actual service call when available
            this.allPayments.update(payments => payments.filter(p => p.id !== payment.id));
            await this.presentToast('Payment deleted successfully.', 'success');
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
