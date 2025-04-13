import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonLabel, IonList, IonItem, IonAvatar, IonIcon, IonButton, IonSelect, IonSelectOption, IonSearchbar, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filterOutline, searchOutline, ellipseOutline, personCircleOutline } from 'ionicons/icons'; // Example icons

// Mock Interface (Could be refined based on actual data structure)
interface Transaction {
  date: string; // Store as ISO string or Date object
  time: string; // Derived from date or separate field
  name: string;
  description: string;
  type: string;
  status: 'Paid' | 'Pending';
  fees: number;
  amount: number;
  avatarUrl?: string; // Optional
}

@Component({
  selector: 'app-transactions-widget',
  templateUrl: './transactions-widget.component.html',
  styleUrls: ['./transactions-widget.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonLabel, IonList, IonItem, IonAvatar, IonIcon, IonButton, IonSelect, IonSelectOption, IonSearchbar, IonBadge
  ]
})
export class TransactionsWidgetComponent implements OnInit {

  transactionCount = signal<number>(21);
  searchTerm = signal<string>('');
  selectedFilter = signal<string>('all');

  // Static Transaction Data
  transactions = signal<Transaction[]>([
    { date: '2022-09-19', time: '8:20 PM', name: 'Upwork', description: 'Business plan', type: 'Membership', status: 'Paid', fees: -1.00, amount: -14.99, avatarUrl: 'assets/icon/upwork.png' }, // Example path
    { date: '2022-09-18', time: '5:40 PM', name: 'Brandon Stanton', description: 'Sell takoyaki', type: 'Giving', status: 'Paid', fees: 0.00, amount: 2434.22, avatarUrl: 'assets/icon/brandon.png' },
    { date: '2022-09-10', time: '2:28 AM', name: 'Gustavo Schleifer', description: 'For you', type: 'Income', status: 'Pending', fees: 0.00, amount: 5129.00, avatarUrl: 'assets/icon/gustavo.png' },
    { date: '2022-09-08', time: ' ', name: 'Bibit', description: 'Invest', type: 'Invest', status: 'Paid', fees: -1.00, amount: -1222.00, avatarUrl: 'assets/icon/bibit.png' }
  ]);

  // TODO: Computed signal for filtered transactions based on searchTerm and selectedFilter

  constructor() {
    addIcons({ filterOutline, searchOutline, ellipseOutline, personCircleOutline });
  }

  ngOnInit() {}

  handleInput(event: any) {
    this.searchTerm.set(event.target.value.toLowerCase());
    console.log('Search Term:', this.searchTerm());
  }

  filterChanged(event: any) {
    this.selectedFilter.set(event.detail.value);
    console.log('Filter Changed:', this.selectedFilter());
  }
}
