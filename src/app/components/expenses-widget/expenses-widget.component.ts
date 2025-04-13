import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonBadge, IonList, IonItem, IonAvatar, IonIcon, IonGrid, IonRow, IonCol, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingDownOutline, cardOutline, cashOutline } from 'ionicons/icons';

interface RecentExpense {
  name: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending';
  icon?: string;
  iconColor?: string;
}

@Component({
  selector: 'app-expenses-widget',
  templateUrl: './expenses-widget.component.html',
  styleUrls: ['./expenses-widget.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, 
    IonBadge, IonList, IonItem, IonAvatar, IonIcon, IonGrid, IonRow, IonCol, IonButton
  ]
})
export class ExpensesWidgetComponent implements OnInit {

  totalExpenses = signal<number>(2218.00);
  percentageChange = signal<number>(20.12);
  extraExpenses = signal<number>(1211.00);
  recentExpenses = signal<RecentExpense[]>([
    {
      name: 'Netflix',
      description: 'Business plan',
      amount: 14.99,
      status: 'Paid',
      icon: 'card-outline',
      iconColor: 'danger'
    },
    {
      name: 'Bibit',
      description: 'Invest',
      amount: 1222.00,
      status: 'Paid',
      icon: 'cash-outline',
      iconColor: 'success'
    }
  ]);

  constructor() {
    addIcons({ trendingDownOutline, cardOutline, cashOutline });
  }

  ngOnInit() {}

  viewAllTransactions() {
    console.log('View all expense transactions clicked');
  }

}
