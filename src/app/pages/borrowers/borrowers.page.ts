import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonCheckbox,
  IonChip,
  IonAvatar,
  IonFooter,
  IonToolbar
} from '@ionic/angular/standalone';
import { BorrowerService } from '../../services/borrower.service';
import { AccountInformation } from '../../interfaces/account-information.interfaces';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  optionsOutline,
  addOutline,
  ellipsisHorizontal,
  starOutline,
  star,
  refreshOutline,
  personCircleOutline,
  mailOutline,
  chevronDownOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-borrowers',
  templateUrl: './borrowers.page.html',
  styleUrls: ['./borrowers.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonList,
    IonItem,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonCheckbox,
    IonChip,
    IonAvatar,
    IonFooter,
    IonToolbar
  ],
})
export class BorrowersPage implements OnInit {
  private borrowerService = inject(BorrowerService);

  borrowers = signal<AccountInformation[]>([]);
  isLoading = signal<boolean>(true);
  errorLoading = signal<string | null>(null);

  selectedBorrowers = signal<Set<number>>(new Set());
  isAllSelected = signal<boolean>(false);

  constructor() {
    addIcons({ searchOutline, optionsOutline, addOutline, ellipsisHorizontal, starOutline, star, refreshOutline, personCircleOutline, mailOutline, chevronDownOutline });
  }

  ngOnInit() {
    this.loadBorrowers();
  }

  async loadBorrowers() {
    this.isLoading.set(true);
    this.errorLoading.set(null);
    const { data, error } = await this.borrowerService.getAllBorrowers();
    if (error) {
      console.error('Error fetching borrowers:', error);
      this.errorLoading.set('Failed to load borrowers. Please try again.');
      this.borrowers.set([]);
    } else {
      this.borrowers.set(data || []);
    }
    this.isLoading.set(false);
    this.updateSelectionState();
  }

  toggleSelectAll(event: any) {
    const checked = event.detail.checked;
    this.isAllSelected.set(checked);
    const currentSelection = this.selectedBorrowers();
    if (checked) {
      this.borrowers().forEach(b => currentSelection.add(b.id));
    } else {
      currentSelection.clear();
    }
    this.selectedBorrowers.set(new Set(currentSelection));
  }

  toggleSelectBorrower(borrowerId: number, event: any) {
    const checked = event.detail.checked;
    const currentSelection = this.selectedBorrowers();
    if (checked) {
      currentSelection.add(borrowerId);
    } else {
      currentSelection.delete(borrowerId);
    }
    this.selectedBorrowers.set(new Set(currentSelection));
    this.updateSelectionState();
  }

  updateSelectionState() {
    const allBorrowers = this.borrowers();
    const selectedCount = this.selectedBorrowers().size;
    this.isAllSelected.set(allBorrowers.length > 0 && selectedCount === allBorrowers.length);
  }

  handleSearch(event: any) {
    console.log('Search term:', event.target.value);
    // Implement search
  }

  // Placeholder for filter chip clicks
  openFilter(type: string) {
    console.log('Open filter popover/modal for:', type);
    // Implement filter selection UI (popover, modal, etc.)
  }

  handleFilterChange(type: string, event: any) {
    console.log(`Filter ${type} changed:`, event.detail.value);
  }

  refreshData() {
    console.log('Refresh clicked');
    this.loadBorrowers();
  }

  addUser() {
    console.log('Add user clicked');
  }

  openUserActions(borrower: AccountInformation, event: MouseEvent) {
    event.stopPropagation();
    console.log('Open actions for user:', borrower.name_of_borrower);
  }
}
