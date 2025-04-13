import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonBadge, IonList, IonItem, IonAvatar, IonIcon, IonGrid, IonRow, IonCol, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUpOutline, personCircleOutline } from 'ionicons/icons';

interface RecentIncome {
  name: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending'; // Or use an enum if defined
  avatarUrl?: string; // Optional avatar URL
}

@Component({
  selector: 'app-income-widget',
  templateUrl: './income-widget.component.html',
  styleUrls: ['./income-widget.component.scss'],
  standalone: true,
  imports: [
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, 
    IonBadge, IonList, IonItem, IonAvatar, IonIcon, IonGrid, IonRow, IonCol, IonButton, CommonModule
  ]
})
export class IncomeWidgetComponent implements OnInit {

  totalIncome = signal<number>(21328.00);
  percentageChange = signal<number>(12.20);
  extraIncome = signal<number>(11219.00);
  recentIncome = signal<RecentIncome[]>([
    {
      name: 'Brandon Stanton',
      description: 'Sell takoyaki',
      amount: 2434.22,
      status: 'Paid',
      // avatarUrl: 'path/to/brandon.jpg' // Add actual URLs later
    },
    {
      name: 'Gustavo Schleifer',
      description: 'For you',
      amount: 5129.00,
      status: 'Pending',
      // avatarUrl: 'path/to/gustavo.jpg'
    }
  ]);

  constructor() {
    addIcons({ trendingUpOutline, personCircleOutline });
  }

  ngOnInit() {}

  viewAllTransactions() {
    // Placeholder for navigation/action
    console.log('View all income transactions clicked');
  }

}
