import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { BorrowerService } from '../../../services/borrower.service';
import { AccountInformation } from '../../../interfaces/account-information.interfaces';
import { Loan } from '../../../interfaces/loan.interfaces';

@Component({
  selector: 'app-borrower-detail',
  templateUrl: './borrower-detail.page.html',
  styleUrls: ['./borrower-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [DatePipe] // Add DatePipe if used in template
})
export class BorrowerDetailPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private borrowerService = inject(BorrowerService);
  private toastCtrl = inject(ToastController);
  public datePipe = inject(DatePipe); // Public if used directly in template

  borrowerId = signal<number | null>(null);
  borrower = signal<AccountInformation | null>(null);
  loans = signal<Loan[]>([]);
  isLoading = signal<boolean>(true);
  errorLoading = signal<string | null>(null);

  // Computed signal for title (optional)
  pageTitle = computed(() => {
    const name = this.borrower()?.name_of_borrower;
    return name ? `Details for ${name}` : 'Borrower Details';
  });

  constructor() { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    this.errorLoading.set(null);
    this.borrower.set(null);
    this.loans.set([]);

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;
    
    if (id === null || isNaN(id)) {
        this.handleError('Invalid Borrower ID provided.');
        return;
    }
    
    this.borrowerId.set(id);
    console.log('Loading data for borrower ID:', id);

    try {
        // Fetch borrower details and loans concurrently
        const [borrowerResponse, loansResponse] = await Promise.all([
            this.borrowerService.getBorrowerById(id),
            this.borrowerService.getLoansByBorrowerId(id)
        ]);

        // Check borrower response
        if (borrowerResponse.error) {
            throw new Error(`Failed to load borrower details: ${borrowerResponse.error.message}`);
        } 
        if (!borrowerResponse.data) {
             throw new Error(`Borrower with ID ${id} not found.`);
        }
        this.borrower.set(borrowerResponse.data);

        // Check loans response
        if (loansResponse.error) {
            // Log error but don't necessarily stop rendering borrower details
            console.error('Error fetching loans:', loansResponse.error);
            this.errorLoading.set('Failed to load associated loans.'); // Set a specific error for loans
            this.loans.set([]);
        } else {
            this.loans.set(loansResponse.data || []);
        }

    } catch (error: any) {
        this.handleError(error.message || 'An unexpected error occurred while loading data.');
    } finally {
        this.isLoading.set(false);
    }
  }

  handleError(message: string) {
      console.error('Error loading borrower details:', message);
      this.errorLoading.set(message);
      this.borrower.set(null);
      this.loans.set([]);
      this.isLoading.set(false);
      // Optionally navigate back or show a persistent error message
      this.presentToast(message, 'danger');
      // Consider navigating back after a delay
      // setTimeout(() => this.router.navigate(['/borrowers']), 3000);
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

  // Add methods for loan actions (e.g., view loan detail) if needed later
  viewLoanDetail(loan: Loan) {
    console.log('View loan detail:', loan);
    // Navigate to loan detail page (if one exists)
  }
}
