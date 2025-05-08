import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { SalesService } from '../../../services/sales.service'; // Adjust path if needed
import { Sale } from '../../../models/sale.interface'; // Adjust path if needed
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonSpinner,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonButton,
  IonCardSubtitle,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.page.html',
  styleUrls: ['./sale-detail.page.scss'],
  standalone: true,
  imports: [
    // IonicModule, // Remove IonicModule to avoid conflicts with explicit imports
    CommonModule,
    DatePipe,
    DecimalPipe,
    // Explicit standalone imports
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonText,
    IonSpinner,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonImg,
    IonButton,
    IonCardSubtitle
  ],
  providers: [DatePipe, DecimalPipe],
})
export class SaleDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private salesService = inject(SalesService);
  private toastCtrl = inject(ToastController);

  saleDetail = signal<Sale | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('Sale ID not found in route.');
      this.isLoading.set(false);
      this.presentToast('Error: Could not find Sale ID.', 'danger');
      return;
    }

    // --- IMPORTANT: getSaleById needs to be implemented in SalesService ---
    this.salesService
      .getSaleById(id)
      .then((response) => {
        if (response.error) {
          console.error('Error fetching sale detail:', response.error);
          this.errorMessage.set(
            `Failed to load sale details: ${response.error.message}`
          );
          this.presentToast(this.errorMessage()!, 'danger');
          this.saleDetail.set(null);
        } else if (response.data) {
          this.saleDetail.set(response.data);
        } else {
          this.errorMessage.set('Sale not found.');
          this.presentToast('Sale not found.', 'warning');
          this.saleDetail.set(null);
        }
      })
      .catch((err) => {
        console.error('Unexpected error fetching sale detail:', err);
        this.errorMessage.set('An unexpected error occurred.');
        this.presentToast(this.errorMessage()!, 'danger');
        this.saleDetail.set(null);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
    // --- End section requiring getSaleById ---
  }

  goBack(): void {
    this.navCtrl.back();
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'tertiary'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }
}
