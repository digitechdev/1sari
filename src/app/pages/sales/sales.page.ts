import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, NavController, ToastController, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSearchbar, IonButton, IonIcon, IonSpinner, IonText } from '@ionic/angular/standalone';
import { SalesService } from '../../services/sales.service';
import { Sale } from '../../models/sale.interface';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxDatatableModule,
    DecimalPipe,
    DatePipe,
    IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSearchbar, IonButton, IonIcon, IonSpinner, IonText
  ],
  providers: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesPage implements OnInit {
  @ViewChild('salesActionsTemplate', { static: true }) salesActionsTemplate!: TemplateRef<any>;
  @ViewChild('createdAtDateTemplate', { static: true }) createdAtDateTemplate!: TemplateRef<any>;
  @ViewChild('priceTemplate', { static: true }) priceTemplate!: TemplateRef<any>;

  private salesService = inject(SalesService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);

  isLoading = signal<boolean>(false);
  errorLoading = signal<string | null>(null);
  allSales = signal<Sale[]>([]); 
  searchTerm = signal<string>('');

  tableColumns = signal<any[]>([]);
  readonly ColumnMode = ColumnMode;

  displayableSales = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.allSales();
    }
    return this.allSales().filter(sale => 
      (sale.borrower_name?.toLowerCase().includes(term)) ||
      (sale.item_name?.toLowerCase().includes(term)) ||
      (sale.description && sale.description.toLowerCase().includes(term)) ||
      (sale.id && sale.id.toLowerCase().includes(term))
    );
  });

  constructor() {}

  ngOnInit(): void {
    this.setupTableColumns();
    this.loadSales();
  }

  setupTableColumns(): void {
    this.tableColumns.set([
      { name: 'Sale ID', prop: 'id', width: 280, frozenLeft: true },
      { name: 'Borrower', prop: 'borrower_name', width: 180 },
      { name: 'Item Name', prop: 'item_name', width: 200 },
      { name: 'Price', prop: 'price', cellTemplate: this.priceTemplate, width: 120, headerClass: 'ion-text-end', cellClass: 'ion-text-end' },
      { name: 'Sale Date', prop: 'created_at', cellTemplate: this.createdAtDateTemplate, width: 220 },
      {
        name: 'Actions',
        prop: 'id',
        width: 120,
        cellTemplate: this.salesActionsTemplate,
        sortable: false,
        canAutoResize: false,
        resizeable: false,
        frozenRight: true,
      }
    ]);
  }

  async loadSales(showToast: boolean = false): Promise<void> {
    this.isLoading.set(true);
    this.errorLoading.set(null);
    try {
      const res = await this.salesService.getSales();
      if (res.error) {
        throw new Error(res.error.message);
      }
      this.allSales.set(res.data || []);
      if (showToast) {
        this.presentToast('Sales data refreshed successfully.', 'success');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load sales data. Please try again.';
      this.errorLoading.set(errorMessage);
      this.presentToast(errorMessage, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleSearch(event: any): void {
    this.searchTerm.set(event.target.value || '');
  }

  refreshData(): void {
    this.loadSales(true);
  }

  addSale(): void {
    this.navCtrl.navigateForward('/sales/new');
  }

  viewSale(sale: Sale): void {
    console.log('View Sale:', sale);
    this.presentToast(`Viewing sale for ${sale.item_name}. Details in console.`, 'tertiary');
  }

  async deleteSale(sale: Sale): Promise<void> {
    if (!sale.id) {
      this.presentToast('Cannot delete sale without an ID.', 'danger');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the sale for "${sale.item_name}" (Borrower: ${sale.borrower_name})? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            this.isLoading.set(true);
            try {
              const res = await this.salesService.deleteSale(sale.id!);
              if (res.error) {
                throw new Error(res.error.message);
              }
              this.allSales.set(this.allSales().filter(s => s.id !== sale.id));
              this.presentToast('Sale deleted successfully.', 'success');
            } catch (error: any) {
              const errorMessage = error.message || 'Failed to delete sale. Please try again.';
              this.presentToast(errorMessage, 'danger');
            } finally {
              this.isLoading.set(false);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'tertiary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: color,
      position: 'top',
      cssClass: 'custom-toast'
    });
    toast.present();
  }
} 