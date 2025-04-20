import { Component, OnInit, signal, computed, inject, ViewEncapsulation, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { NgxDatatableModule, ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';

import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-loans',
  templateUrl: './loans.page.html',
  styleUrls: [
    './loans.page.scss',
    '../../../../node_modules/@swimlane/ngx-datatable/themes/material.scss'
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxDatatableModule,
    RouterLink
  ],
  providers: [DatePipe, CurrencyPipe],
  encapsulation: ViewEncapsulation.None
})
export class LoansPage implements OnInit, AfterViewInit {
  @ViewChild('loanActionsTemplate', { static: false }) loanActionsTemplate!: TemplateRef<any>;
  @ViewChild(DatatableComponent) table: DatatableComponent | undefined;

  private loanService = inject(LoanService);
  private currencyPipe = inject(CurrencyPipe);
  private cdRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  allLoans = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  errorLoading = signal<string | null>(null);
  searchTerm = signal<string>('');
  displayableLoans = signal<any[]>([]);
  private actionsTemplateAssigned = false;

  filteredLoans = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.allLoans();
    }
    return this.allLoans().filter(loan =>
      loan.id?.toString().includes(term) ||
      (loan.borrower?.name_of_borrower && loan.borrower.name_of_borrower.toLowerCase().includes(term)) ||
      loan.status?.toLowerCase().includes(term) ||
      loan.purpose?.toLowerCase().includes(term)
    );
  });

  ColumnMode = ColumnMode;
  tableColumns: any[] = [
    { prop: 'id', name: 'Loan ID', width: 80 },
    {
      prop: 'borrower.name_of_borrower',
      name: 'Borrower',
      width: 150
    },
    { 
      prop: 'principal', 
      name: 'Principal', 
      width: 120,
      pipe: { transform: (value: number) => this.currencyPipe.transform(value, 'PHP', 'symbol') } 
    },
    { prop: 'status', name: 'Status', width: 100 },
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
    effect(() => {
      console.log('Loans list updated:', this.allLoans().length);
      console.log('Filtered loan count:', this.filteredLoans().length);
      if (this.actionsTemplateAssigned) {
         this.displayableLoans.set(this.filteredLoans());
      }
    });
  }

  ngOnInit() {
    this.loadLoans();
  }

   ngAfterViewInit() {
    this.cdRef.detectChanges();
    this.tryAssignTemplateAndData();
  }

  async loadLoans(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading.set(true);
    }
    this.errorLoading.set(null);
    this.displayableLoans.set([]);
    this.actionsTemplateAssigned = false;
    this.searchTerm.set('');

    try {
      const response = await this.loanService.getAllLoans();
      if (response.error) {
        console.error('Error fetching loans:', response.error);
        this.errorLoading.set(`Failed to load loans: ${response.error.message}`);
        this.allLoans.set([]);
      } else {
        this.allLoans.set(response.data || []);
      }
    } catch (err: any) {
      console.error('Unexpected error loading loans:', err);
      this.errorLoading.set('An unexpected error occurred while loading loan data.');
      this.allLoans.set([]);
    } finally {
      this.isLoading.set(false);
      this.cdRef.detectChanges();
      this.tryAssignTemplateAndData();
    }
  }


  viewLoan(row: any) {
    if (!row || typeof row.id === 'undefined') {
      console.error('Cannot view borrower without valid data/ID');
      return;
    }
    console.log('View borrower request:', row);
    this.router.navigate(['/loans/detail', row.id]);
  }

  tryAssignTemplateAndData() {
    if (this.loanActionsTemplate && !this.actionsTemplateAssigned) {
      const actionsCol = this.tableColumns.find(col => col.name === 'Actions');
      if (actionsCol) { 
        actionsCol.cellTemplate = this.loanActionsTemplate;
        this.tableColumns = [...this.tableColumns];
        this.actionsTemplateAssigned = true;
        console.log('Loan actions template assigned.');
        this.displayableLoans.set(this.filteredLoans());
        this.cdRef.detectChanges();
      } else {
         console.warn('Could not find Actions column to assign template.');
      }
    } else if (this.actionsTemplateAssigned) {
      this.displayableLoans.set(this.filteredLoans());
      this.cdRef.detectChanges();
    }
     else {
         console.log('Loan actions template not ready yet.');
     }
  }

  handleSearch(event: any) {
    const term = event.target.value || '';
    this.searchTerm.set(term);
  }

  async refreshData() {
    await this.loadLoans(true);
    const toast = await this.toastCtrl.create({
      message: 'Loan data refreshed.',
      duration: 1500,
      position: 'bottom',
      color: 'medium',
    });
    await toast.present();
  }

  async addLoan() {
    console.log('Add Loan clicked - Navigating to form');
    this.router.navigate(['/loans/new']);
  }

  async editLoan(loan: any) {
    console.log('Edit Loan clicked - Placeholder:', loan);
    await this.presentToast('Edit Loan functionality not yet implemented.', 'warning');
  }

  async deleteLoan(loan: any) {
    console.log('Attempting to delete loan:', loan);
    if (!loan || typeof loan.id === 'undefined') {
      console.error('Invalid loan data provided for deletion.');
      await this.presentToast('Could not delete loan: Invalid data.', 'danger');
      return;
    }

    const alert = await this.alertCtrl.create({
        header: 'Confirm Deletion',
        message: `Are you sure you want to delete Loan ID ${loan.id} for ${loan.borrower?.name_of_borrower || 'Borrower'}? This will also delete its payment schedule.`,
        buttons: [
            { text: 'Cancel', role: 'cancel' },
            { 
                text: 'Delete', 
                role: 'destructive',
                handler: async () => { 
                    console.log('Delete confirmed for loan:', loan.id);
                    const result = await this.loanService.deleteLoan(loan.id);

                    if (result.error) {
                      console.error('Error deleting loan:', result.error);
                      await this.presentToast(`Failed to delete loan: ${result.error.message}`, 'danger');
                    } else {
                      console.log('Loan deleted successfully');
                      this.allLoans.update(loans => loans.filter(l => l.id !== loan.id));
                      await this.presentToast('Loan deleted successfully.', 'success');
                    }
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
