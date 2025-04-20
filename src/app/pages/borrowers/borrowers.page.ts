import { Component, OnInit, signal, computed, inject, ViewEncapsulation, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDatatableModule, ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonFooter, 
  IonRow, 
  IonGrid, 
  IonCol,
  ModalController,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { BorrowerService } from '../../services/borrower.service';
import { AccountInformation } from '../../interfaces/account-information.interfaces';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  addOutline,
  refreshOutline,
  ellipsisHorizontal,
  eyeOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { BorrowerFormComponent } from '../../components/borrower-form/borrower-form.component';

@Component({
  selector: 'app-borrowers',
  templateUrl: './borrowers.page.html',
  styleUrls: [
    './borrowers.page.scss',
    '../../../../node_modules/@swimlane/ngx-datatable/themes/material.scss'
  ],
  standalone: true,
  imports: [IonRow, 
    CommonModule,
    FormsModule,
    NgxDatatableModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonSpinner,
    IonText,
    IonFooter,
    IonCol,
    IonGrid,
  ],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None
})
export class BorrowersPage implements OnInit, AfterViewInit {
  @ViewChild('actionsTemplate', { static: false }) actionsTemplate!: TemplateRef<any>;

  private borrowerService = inject(BorrowerService);
  private datePipe = inject(DatePipe);
  private cdRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  borrowers = signal<AccountInformation[]>([]);
  displayableBorrowers = signal<AccountInformation[]>([]);
  isLoading = signal<boolean>(true);
  errorLoading = signal<string | null>(null);
  searchTerm = signal<string>('');
  
  private actionsTemplateAssigned = false;

  @ViewChild(DatatableComponent) table: DatatableComponent | undefined;

  filteredBorrowers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.borrowers();
    }
    return this.borrowers().filter(borrower => 
      borrower.name_of_borrower?.toLowerCase().includes(term) ||
      borrower.provider_subject_no?.toLowerCase().includes(term) ||
      borrower.store_name?.toLowerCase().includes(term) ||
      borrower.contact_no_borrower?.includes(term) 
    );
  });

  ColumnMode = ColumnMode;
  tableColumns: any[] = [
    { prop: 'id', name: 'ID', width: 70 },
    { prop: 'name_of_borrower', name: 'Name of Borrower', width: 250 },
    { prop: 'contact_no_borrower', name: 'Contact #', width: 150 },
    { 
      prop: 'created_at', 
      name: 'Created At', 
      width: 150,
       pipe: { transform: (value: string) => this.datePipe.transform(value, 'short') } 
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
    addIcons({ searchOutline, addOutline, refreshOutline, ellipsisHorizontal, eyeOutline, createOutline, trashOutline });
    effect(() => {
      console.log('Borrowers list updated:', this.borrowers().length);
      console.log('Filtered count:', this.filteredBorrowers().length);
    });
  }

  ngOnInit() {
    this.loadBorrowers();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
    this.tryAssignTemplateAndData();
  }

  async loadBorrowers(showLoading: boolean = true) {
    if (showLoading) {
      this.isLoading.set(true);
    }
    this.errorLoading.set(null);
    this.displayableBorrowers.set([]);
    this.actionsTemplateAssigned = false;
    this.searchTerm.set('');
    
    const { data, error } = await this.borrowerService.getAllBorrowers();
    
    if (error) {
      console.error('Error fetching borrowers:', error);
      this.errorLoading.set('Failed to load borrowers. Please try again.');
      this.borrowers.set([]);
    } else {
      this.borrowers.set(data || []);
    }
    this.isLoading.set(false);
    this.cdRef.detectChanges();
    this.tryAssignTemplateAndData();
  }

  tryAssignTemplateAndData() {
    if (this.actionsTemplate && !this.actionsTemplateAssigned) {
      const actionsCol = this.tableColumns.find(col => col.name === 'Actions');
      if (actionsCol) { 
        actionsCol.cellTemplate = this.actionsTemplate;
        this.actionsTemplateAssigned = true;
        this.tableColumns = [...this.tableColumns]; 
        console.log('Actions template assigned.');

        this.displayableBorrowers.set(this.filteredBorrowers());
        this.cdRef.detectChanges();
      }
    } else if (this.actionsTemplateAssigned) {
      this.displayableBorrowers.set(this.filteredBorrowers());
      this.cdRef.detectChanges();
    }
  }

  handleSearch(event: any) {
    const term = event.target.value || '';
    this.searchTerm.set(term);
    if (this.actionsTemplateAssigned) {
        this.displayableBorrowers.set(this.filteredBorrowers());
    }
  }

  async refreshData() {
    await this.loadBorrowers(true);
    const toast = await this.toastCtrl.create({
      message: 'Data refreshed.',
      duration: 1500,
      position: 'bottom',
      color: 'medium'
    });
    await toast.present();
  }

  async addUser() {
    this.router.navigate(['/borrowers/new']);
    console.log('Add borrower request:');
  }

  async editBorrower(borrower: AccountInformation) {
    if (!borrower || typeof borrower.id === 'undefined') {
      console.error('Cannot edit borrower without valid data/ID');
      return;
    }
    console.log('Edit borrower request:', borrower);
    this.router.navigate(['/borrowers/edit', borrower.id]);
  }

  async presentBorrowerModal(borrowerData: AccountInformation | null) {
    const modal = await this.modalCtrl.create({
      component: BorrowerFormComponent,
      componentProps: {
        borrower: borrowerData
      },
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (data?.saved) {
      console.log('Modal dismissed, saved data:', data);
      this.loadBorrowers(false);
    } else {
      console.log('Modal dismissed without saving:', role, data);
    }
  }

  async deleteBorrower(borrower: AccountInformation) {
    if (!borrower || typeof borrower.id === 'undefined') {
        console.error('Cannot delete borrower without valid data/ID');
        return;
    }
    console.log('Attempting to delete borrower:', borrower);

    const alert = await this.alertCtrl.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete borrower '${borrower.name_of_borrower}'? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            console.log('Deletion confirmed for:', borrower.id);
            const loading = await this.toastCtrl.create({ message: 'Deleting...', duration: 0 });
            await loading.present();

            try {
              const response = await this.borrowerService.deleteBorrower(borrower.id);
              await loading.dismiss();

              if (response.error) {
                console.error('Error deleting borrower:', response.error);
                await this.presentToast(`Error: ${response.error.message}`, 'danger');
              } else {
                await this.presentToast('Borrower deleted successfully!', 'success');
                this.loadBorrowers(false);
              }
            } catch (error: any) {
              await loading.dismiss();
              console.error('Unexpected error during delete:', error);
              const errorMessage = error.message || 'An unexpected error occurred.';
              await this.presentToast(`Error: ${errorMessage}`, 'danger');
            }
          },
        },
      ],
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

  viewBorrower(row: AccountInformation) {
    if (!row || typeof row.id === 'undefined') {
      console.error('Cannot view borrower without valid data/ID');
      return;
    }
    console.log('View borrower request:', row);
    this.router.navigate(['/borrowers/detail', row.id]);
  }

  toggleExpandRow(row: any) {
    console.log('Toggling row:', row);
    if (this.table) {
      this.table.rowDetail.toggleExpandRow(row);
    }
  }
}
