import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoanService } from '../../../services/loan.service';
import { Loan } from '../../../interfaces/loan.interfaces';
import { LoanPaymentSchedule } from '../../../interfaces/loan-payment-schedule.interfaces';
import { PaymentStatus } from 'src/app/enums/payment-status.enum';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.page.html',
  styleUrls: ['./loan-detail.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    CurrencyPipe, 
    DatePipe
  ],
  providers: [CurrencyPipe, DatePipe] // Provide pipes
})
export class LoanDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private loanService = inject(LoanService);
  private toastCtrl = inject(ToastController);

  // Using 'any' for loanDetail initially because Supabase join brings nested objects
  loanDetail = signal<any | null>(null); 
  loanSchedule = signal<LoanPaymentSchedule[] | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Get ID from route, converting to number
    const idParam = this.route.snapshot.paramMap.get('id');
    const loanId = idParam ? +idParam : null;

    if (loanId) {
      this.loadLoanDetails(loanId);
    } else {
      console.error('Loan ID not found in route parameters');
      this.errorMessage.set('Loan ID is missing.');
      this.presentToast('Could not load loan details: ID missing.', 'danger');
    }
  }

  async loadLoanDetails(id: number) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.loanDetail.set(null); // Reset previous data
    this.loanSchedule.set(null);

    try {
      const response = await this.loanService.getLoanById(id);
      if (response.error) {
        console.error('Error fetching loan details:', response.error);
        this.errorMessage.set(response.error.message || 'Failed to load loan data.');
        this.presentToast(this.errorMessage()!, 'danger');
      } else if (response.data) {
        console.log('Fetched Loan Detail:', response.data);
        this.loanDetail.set(response.data);
        // Extract schedule if it exists on the response data
        this.loanSchedule.set(response.data.schedule || []); 
      } else {
        this.errorMessage.set('Loan not found.');
        this.presentToast('Loan not found.', 'warning');
      }
    } catch (error: any) {
      console.error('Unexpected error loading loan details:', error);
      this.errorMessage.set('An unexpected error occurred.');
      this.presentToast(this.errorMessage()!, 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
} 