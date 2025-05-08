import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonItemGroup,
  IonItemDivider,
  IonItem,
  IonInput,
  IonTextarea,
  IonNote,
  IonLabel,
  IonText,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonThumbnail,
  IonModal,
  IonImg,
  IonSelect,
  IonSelectOption,
  IonDatetimeButton,
  IonDatetime, IonBackButton } from '@ionic/angular/standalone';
import { SalesService } from '../../../services/sales.service';
import { Sale } from '../../../models/sale.interface';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { SupabaseService } from '../../../services/supabase.service';
import { BorrowerService } from '../../../services/borrower.service';
import { AccountInformation } from '../../../interfaces/account-information.interfaces';
import { LoanService } from '../../../services/loan.service';
import { Loan } from '../../../interfaces/loan.interfaces';
import { LoanPaymentSchedule } from '../../../interfaces/loan-payment-schedule.interfaces';
import { PaymentStatus } from '../../../enums/payment-status.enum';
import { LoanStatus } from '../../../enums/loan-status.enum';

interface ScheduleItem {
  periodNumber: number;
  dueDate: Date;
  paymentAmount: number;
  interest: number;
  principal: number;
  balance: number;
}

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.page.html',
  styleUrls: ['./sale-form.page.scss'],
  standalone: true,
  imports: [IonBackButton, 
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonList,
    IonListHeader,
    IonItemGroup,
    IonItemDivider,
    IonItem,
    IonInput,
    IonTextarea,
    IonNote,
    IonLabel,
    IonText,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonThumbnail,
    IonModal,
    IonImg,
    IonSelect,
    IonSelectOption,
    IonDatetimeButton,
    IonDatetime,
    DatePipe,
  ],
  providers: [DatePipe],
})
export class SaleFormPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private salesService = inject(SalesService);
  private supabaseService = inject(SupabaseService);
  private navController = inject(NavController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private borrowerService = inject(BorrowerService);
  private loanService = inject(LoanService);
  private datePipe = inject(DatePipe);

  saleForm!: FormGroup;
  pageTitle = signal('Add Sale Items');
  isLoading = signal(false);
  imageToShowInModal = signal<string | null>(null);

  borrowers = signal<AccountInformation[]>([]);
  isBorrowersLoading = signal<boolean>(false);
  errorLoadingBorrowers = signal<string | null>(null);
  principalManuallySet = signal(false);

  get saleItems() {
    return this.saleForm.get('saleItems') as FormArray;
  }

  constructor() {}

  ngOnInit() {
    this.initForm();
    this.loadBorrowers();

    this.saleItems.valueChanges.subscribe(() => {
      if (!this.principalManuallySet()) {
        this.saleForm.get('principal')?.setValue(this.overallTransactionTotal());
      }
    });
  }

  initForm() {
    this.saleForm = this.formBuilder.group({
      saleItems: this.formBuilder.array([this.createSaleItemGroup()]),
      status: ['Pending', Validators.required],
      borrower_id: ['', Validators.required],
      disbursement_method: ['cash', Validators.required],
      purpose: [''],
      principal: [0, Validators.required],
      interest_method: ['straight', Validators.required],
      loan_period: ['monthly', Validators.required],
      interest_rate: [3, Validators.required],
      tenure_in_months: [4, Validators.required],
      repayment_period: [4, Validators.required],
      loan_release_date: [new Date().toISOString().split('T')[0], Validators.required],
    });

    this.saleForm.get('principal')?.setValue(this.overallTransactionTotal());
  }

  createSaleItemGroup(initialValue?: Partial<Sale & { image_timestamp: string | null }>): FormGroup {
    return this.formBuilder.group({
      borrower_name: [
        initialValue?.borrower_name || '',
        [Validators.required, Validators.minLength(3)],
      ],
      item_name: [
        initialValue?.item_name || '',
        [Validators.required, Validators.minLength(2)],
      ],
      description: [initialValue?.description || ''],
      price: [
        initialValue?.price || null,
        [Validators.required, Validators.min(0)],
      ],
      image_url: [initialValue?.image_url || null],
      image_preview: [initialValue?.image_preview || null],
      image_to_upload: [initialValue?.image_to_upload || null],
      image_timestamp: [initialValue?.image_timestamp || null],
    });
  }

  addItem(): void {
    this.saleItems.push(this.createSaleItemGroup());
  }

  removeItem(index: number): void {
    if (this.saleItems.length > 1) {
      this.saleItems.removeAt(index);
    }
  }

  duplicateItem(index: number): void {
    const itemToDuplicate = this.saleItems.at(index).value as Sale & { image_timestamp?: string | null };
    const duplicatedItemData: Partial<Sale & { image_timestamp: string | null }> = {
      ...itemToDuplicate,
      image_url: null,
      image_preview: null,
      image_to_upload: null,
      image_timestamp: null,
    };
    this.saleItems.insert(
      index + 1,
      this.createSaleItemGroup(duplicatedItemData)
    );
  }

  overallTransactionTotal(): number {
    return this.saleItems.controls.reduce((acc, control) => {
      const price = parseFloat(control.get('price')?.value?.toString() || '0');
      return acc + price;
    }, 0);
  }

  async takeItemPhoto(itemIndex: number) {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    if (image && image.dataUrl) {
      const itemControl = this.saleItems.at(itemIndex) as FormGroup;
      itemControl.patchValue({
        image_preview: image.dataUrl,
        image_to_upload: image, // Store the full Photo object for upload
        image_timestamp: new Date().toLocaleString(),
      });
    }
  }

  private async blobUrlToBlob(blobUrl: string): Promise<Blob> {
    const response = await fetch(blobUrl);
    return await response.blob();
  }

  async onSubmit() {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      this.presentToast(
        'Please fill all required fields for all items and loan details correctly.',
        'danger'
      );
      return;
    }

    const loadingIndicator = await this.presentLoading(
      'Processing Sale Items and Loan...'
    );
    this.isLoading.set(true);

    // 1. Prepare and Submit Sale Items
    const salesToSubmit: Sale[] = [];
    for (let i = 0; i < this.saleItems.length; i++) {
      const itemCtrl = this.saleItems.at(i) as FormGroup;
      const formValue = itemCtrl.value;
      let uploadedImageUrl: string | null = formValue.image_url;
      const photoToUpload = formValue.image_to_upload as Photo | undefined;

      if (photoToUpload && photoToUpload.webPath) {
        try {
          const photoBlob = await this.blobUrlToBlob(photoToUpload.webPath);
          const fileName = `sale_item_${Date.now()}_${i}.${photoToUpload.format || 'jpeg'}`;
          const { data: uploadData, error: uploadError } =
            await this.supabaseService.uploadFile('item_images', fileName, photoBlob, { contentType: photoBlob.type });
          if (uploadError) throw uploadError;
          uploadedImageUrl = this.supabaseService.getPublicUrl('item_images', fileName);
        } catch (uploadError: any) {
          console.error(`Error uploading image for item ${i + 1}:`, uploadError);
          this.presentToast(`Failed to upload image for item ${i + 1}. Submission aborted.`, 'danger');
          loadingIndicator.dismiss();
          this.isLoading.set(false);
          return;
        }
      }
      salesToSubmit.push({
        borrower_name: formValue.borrower_name,
        item_name: formValue.item_name,
        description: formValue.description || null,
        price: parseFloat(formValue.price),
        image_url: uploadedImageUrl,
        // created_by: userId, // If you have user tracking for who created the sale item
      });
    }

    if (salesToSubmit.length === 0) {
      this.presentToast('No items to submit for sale.', 'warning');
      loadingIndicator.dismiss();
      this.isLoading.set(false);
      return;
    }

    try {
      const salesResponse = await this.salesService.addSales(salesToSubmit);
      if (salesResponse.error) {
        throw new Error(`Sale items: ${salesResponse.error.message}`);
      }
      this.presentToast('Sale items added successfully! Proceeding to create loan...', 'success');

      // 2. Prepare and Submit Loan Data
      const loanFormData = this.saleForm.value;
      const loanData: Omit<Loan, 'id' | 'created_at' | 'updated_at'> = {
        borrower_id: parseInt(loanFormData.borrower_id, 10),
        principal: parseFloat(loanFormData.principal),
        interest_rate: parseFloat(loanFormData.interest_rate) / 100, // Store rate as decimal, e.g. 3% -> 0.03
        tenure_in_months: parseInt(loanFormData.tenure_in_months, 10),
        loan_release_date: this.datePipe.transform(loanFormData.loan_release_date, 'yyyy-MM-dd') || '',
        interest_method: loanFormData.interest_method,
        loan_period: loanFormData.loan_period,
        repayment_period: parseInt(loanFormData.repayment_period, 10),
        disbursement_method: loanFormData.disbursement_method,
        status: loanFormData.status as LoanStatus, // Cast to LoanStatus enum
        purpose: loanFormData.purpose || null,
        // store_name can be added if relevant from sale form
      };

      const newLoanResponse = await this.loanService.addLoan(loanData);
      if (newLoanResponse.error || !newLoanResponse.data || !newLoanResponse.data.id) {
        throw new Error(`Loan creation: ${newLoanResponse.error?.message || 'Failed to create loan or get new loan ID.'}`);
      }
      const newLoanId = newLoanResponse.data.id;
      this.presentToast(`Loan created successfully (ID: ${newLoanId})! Proceeding to save schedule...`, 'success');

      // 3. Generate and Submit Loan Schedule
      const calculatedScheduleItems = this.generateSchedule();
      if (calculatedScheduleItems.length > 0) {
        const formattedSchedule: LoanPaymentSchedule[] = calculatedScheduleItems.map(item => ({
          loan_id: newLoanId,
          period_number: item.periodNumber,
          due_date: this.datePipe.transform(item.dueDate, 'yyyy-MM-dd') || '',
          amount_due: item.paymentAmount,
          principal_paid: item.principal,
          interest_paid: item.interest,
          outstanding_balance: item.balance,
          status: PaymentStatus.Pending, // Default status for new schedule items
        }));

        const scheduleResponse = await this.loanService.addLoanSchedule(formattedSchedule);
        if (scheduleResponse.error) {
          // Log error but proceed, as loan was already created
          console.error('Error saving loan schedule:', scheduleResponse.error);
          this.presentToast(`Sale and Loan created (Loan ID: ${newLoanId}), but failed to save schedule: ${scheduleResponse.error.message}. Please check loan details.`, 'warning', 5000);
        } else {
          this.presentToast('Sale, Loan, and Schedule created successfully!', 'success');
        }
      } else {
        this.presentToast(`Sale and Loan created (Loan ID: ${newLoanId}). No schedule generated/saved (check inputs or method type).`, 'tertiary', 5000);
      }

      this.navController.navigateBack('/sales', { replaceUrl: true }); // Or navigate to a loan confirmation/detail page

    } catch (error: any) {
      const errorMessage =
        error.message || 'An unexpected error occurred during the submission process.';
      this.presentToast(errorMessage, 'danger', 5000);
      console.error('Error during submission process:', error);
    } finally {
      loadingIndicator.dismiss();
      this.isLoading.set(false);
    }
  }

  async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'tertiary',
    duration: number = 3000 // Default duration
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'top',
    });
    toast.present();
  }

  async presentLoading(message: string = 'Saving items...') {
    const loadingInstance = await this.loadingCtrl.create({
      message,
      spinner: 'crescent',
    });
    await loadingInstance.present();
    return loadingInstance;
  }

  cancel() {
    this.navController.navigateBack('/sales');
  }

  openImageModal(imageUrl: string | undefined | null): void {
    if (imageUrl) {
      this.imageToShowInModal.set(imageUrl);
    }
  }

  closeImageModal(): void {
    this.imageToShowInModal.set(null);
  }

  onPrincipalManuallyChanged(): void {
    this.principalManuallySet.set(true);
  }

  async loadBorrowers() {
    this.isBorrowersLoading.set(true);
    this.errorLoadingBorrowers.set(null);
    try {
      const response = await this.borrowerService.getAllBorrowers();
      if (response.error) {
        console.error('Error fetching borrowers:', response.error);
        this.errorLoadingBorrowers.set(`Failed to load borrowers: ${response.error.message}`);
        this.borrowers.set([]);
      } else {
        this.borrowers.set(response.data || []);
      }
    } catch (err: any) {
      console.error('Unexpected error loading borrowers:', err);
      this.errorLoadingBorrowers.set('An unexpected error occurred while loading borrowers.');
      this.borrowers.set([]);
    } finally {
      this.isBorrowersLoading.set(false);
    }
  }

  generateSchedule(): ScheduleItem[] {
    const formValue = this.saleForm.value;
    const canCalc = (
      this.saleForm.get('principal')?.valid &&
      this.saleForm.get('interest_rate')?.valid &&
      this.saleForm.get('repayment_period')?.valid &&
      this.saleForm.get('loan_release_date')?.valid &&
      this.saleForm.get('interest_method')?.valid &&
      this.saleForm.get('loan_period')?.valid &&
      formValue.principal > 0 &&
      formValue.repayment_period > 0
    );

    if (!canCalc) {
      console.warn('SaleForm: Cannot generate schedule, form requirements not met.');
      return [];
    }

    const {
      principal,
      interest_rate,
      repayment_period,
      loan_release_date,
      loan_period,
      interest_method,
    } = formValue;

    let periodicInterestRate = 0;
    const monthlyRateDecimal = interest_rate / 100;

    switch (loan_period.toLowerCase()) {
      case 'monthly': periodicInterestRate = monthlyRateDecimal; break;
      case 'daily': periodicInterestRate = monthlyRateDecimal / 30; break;
      case 'weekly': periodicInterestRate = (monthlyRateDecimal * 12) / 52; break;
      case 'bi-monthly': periodicInterestRate = monthlyRateDecimal / 2; break;
      default: console.error('SaleForm: Unsupported loan period:', loan_period); return [];
    }

    const startDate = new Date(loan_release_date);
    let calculatedSchedule: ScheduleItem[] = [];

    if (interest_method === 'diminishing') {
      calculatedSchedule = this.calculateDiminishingSchedule(
        principal,
        periodicInterestRate,
        repayment_period,
        startDate,
        loan_period
      );
    } else if (interest_method === 'straight') {
      calculatedSchedule = this.calculateStraightSchedule(
        principal,
        periodicInterestRate,
        repayment_period,
        startDate,
        loan_period
      );
    } else {
      console.warn('SaleForm: Unsupported interest method for schedule generation:', interest_method);
    }
    return calculatedSchedule;
  }

  calculateDiminishingSchedule(
    principal: number,
    periodicRate: number,
    numberOfPayments: number,
    startDate: Date,
    loanPeriod: string
  ): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    let balance = principal;
    if (principal <= 0 || periodicRate < 0 || numberOfPayments <= 0) return [];

    const periodicPayment = periodicRate === 0
      ? principal / numberOfPayments
      : principal * (periodicRate * Math.pow(1 + periodicRate, numberOfPayments)) / (Math.pow(1 + periodicRate, numberOfPayments) - 1);

    for (let i = 1; i <= numberOfPayments; i++) {
      const interestPayment = balance * periodicRate;
      let principalPayment = periodicPayment - interestPayment;
      let currentDueDate: Date;

      switch (loanPeriod.toLowerCase()) {
        case 'monthly': currentDueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate()); break;
        case 'daily': currentDueDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000); break;
        case 'weekly': currentDueDate = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000); break;
        case 'bi-monthly': currentDueDate = new Date(startDate.getTime() + i * 15 * 24 * 60 * 60 * 1000); break;
        default: currentDueDate = new Date(startDate); break;
      }

      if (i === numberOfPayments) {
        principalPayment = balance;
        const adjustedPayment = principalPayment + interestPayment;
        balance = 0;
        schedule.push({
          periodNumber: i, dueDate: currentDueDate, paymentAmount: adjustedPayment,
          interest: interestPayment, principal: principalPayment, balance: balance,
        });
      } else {
        balance -= principalPayment;
        if (balance < 0) balance = 0;
        schedule.push({
          periodNumber: i, dueDate: currentDueDate, paymentAmount: periodicPayment,
          interest: interestPayment, principal: principalPayment, balance: balance,
        });
      }
    }
    return schedule;
  }

  calculateStraightSchedule(
    principal: number,
    periodicRate: number,
    numberOfPayments: number,
    startDate: Date,
    loanPeriod: string
  ): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    if (principal <= 0 || periodicRate < 0 || numberOfPayments <= 0) return [];

    const totalInterest = principal * periodicRate * numberOfPayments;
    const principalPerPeriod = principal / numberOfPayments;
    const interestPerPeriod = totalInterest / numberOfPayments;
    const periodicPayment = principalPerPeriod + interestPerPeriod;
    let balance = principal;

    for (let i = 1; i <= numberOfPayments; i++) {
      balance -= principalPerPeriod;
      if (i === numberOfPayments) balance = 0;
      if (balance < 0) balance = 0;

      let currentDueDate: Date;
      switch (loanPeriod.toLowerCase()) {
        case 'monthly': currentDueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate()); break;
        case 'daily': currentDueDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000); break;
        case 'weekly': currentDueDate = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000); break;
        case 'bi-monthly': currentDueDate = new Date(startDate.getTime() + i * 15 * 24 * 60 * 60 * 1000); break;
        default: currentDueDate = new Date(startDate); break;
      }

      schedule.push({
        periodNumber: i, dueDate: currentDueDate, paymentAmount: periodicPayment,
        interest: interestPerPeriod, principal: principalPerPeriod, balance: balance,
      });
    }
    return schedule;
  }
}
