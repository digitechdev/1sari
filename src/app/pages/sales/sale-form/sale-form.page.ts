import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
} from '@ionic/angular/standalone';
import { SalesService } from '../../../services/sales.service';
import { Sale } from '../../../models/sale.interface';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.page.html',
  styleUrls: ['./sale-form.page.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class SaleFormPage implements OnInit {
  private formBuilder = inject(FormBuilder);
  private salesService = inject(SalesService);
  private supabaseService = inject(SupabaseService);
  private navController = inject(NavController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  saleForm!: FormGroup;
  pageTitle = signal('Add Sale Items');
  isLoading = signal(false);
  imageToShowInModal = signal<string | null>(null);

  get saleItems() {
    return this.saleForm.get('saleItems') as FormArray;
  }

  constructor() {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.saleForm = this.formBuilder.group({
      saleItems: this.formBuilder.array([this.createSaleItemGroup()]),
    });
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
        'Please fill all required fields for all items correctly.',
        'danger'
      );
      return;
    }

    const loadingIndicator = await this.presentLoading(
      'Processing Sale Items...'
    );
    this.isLoading.set(true);

    const salesToSubmit: Sale[] = [];

    for (let i = 0; i < this.saleItems.length; i++) {
      const itemCtrl = this.saleItems.at(i) as FormGroup;
      const formValue = itemCtrl.value;
      let uploadedImageUrl: string | null = formValue.image_url;
      const photoToUpload = formValue.image_to_upload as Photo | undefined;

      if (photoToUpload && photoToUpload.webPath) {
        try {
          const photoBlob = await this.blobUrlToBlob(photoToUpload.webPath);
          const fileName = `sale_item_${Date.now()}_${i}.${
            photoToUpload.format || 'jpeg'
          }`;

          const { data: uploadData, error: uploadError } =
            await this.supabaseService.uploadFile(
              'item_images',
              fileName,
              photoBlob,
              { contentType: photoBlob.type }
            );
          if (uploadError) throw uploadError;

          uploadedImageUrl = this.supabaseService.getPublicUrl(
            'item_images',
            fileName
          );
        } catch (uploadError: any) {
          console.error(
            `Error uploading image for item ${i + 1}:`,
            uploadError
          );
          this.presentToast(
            `Failed to upload image for item ${i + 1}. Sale not submitted.`,
            'danger'
          );
          loadingIndicator.dismiss();
          this.isLoading.set(false);
          return;
        }
      }

      const saleEntry: Sale = {
        borrower_name: formValue.borrower_name,
        item_name: formValue.item_name,
        description: formValue.description || null,
        price: parseFloat(formValue.price),
        image_url: uploadedImageUrl,
      };
      salesToSubmit.push(saleEntry);
    }

    if (salesToSubmit.length === 0) {
      this.presentToast('No items to submit.', 'warning');
      loadingIndicator.dismiss();
      this.isLoading.set(false);
      return;
    }

    try {
      const response = await this.salesService.addSales(salesToSubmit);

      if (response.error) {
        throw new Error(response.error.message);
      }

      this.presentToast('All sale items added successfully!', 'success');
      this.navController.navigateBack('/sales', { replaceUrl: true });
    } catch (error: any) {
      const errorMessage =
        error.message ||
        'An unexpected error occurred while saving the sale items.';
      this.presentToast(errorMessage, 'danger');
      console.error('Error saving sale items:', error);
    } finally {
      loadingIndicator.dismiss();
      this.isLoading.set(false);
    }
  }

  async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'tertiary'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
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
}
