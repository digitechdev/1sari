import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonLabel, IonSelect, IonSelectOption, IonProgressBar } from '@ionic/angular/standalone';

interface ExpenseCategory {
  name: string;
  amount: number;
}

@Component({
  selector: 'app-balance-widget',
  templateUrl: './balance-widget.component.html',
  styleUrls: ['./balance-widget.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonButton, IonLabel, IonSelect, IonSelectOption, IonProgressBar
  ]
})
export class BalanceWidgetComponent implements OnInit {

  totalBalance = signal<number>(21328.00);
  selectedMonth = signal<string>('August');
  expensesAnalysis = signal<ExpenseCategory[]>([
    { name: 'Food & Drink', amount: 213.00 },
    { name: 'Top up', amount: 829.00 },
    { name: 'Invest', amount: 1222.00 },
  ]);

  // Calculate total expenses for progress bar calculation (optional)
  totalAnalyzedExpenses = computed(() => this.expensesAnalysis().reduce((sum, cat) => sum + cat.amount, 0));

  constructor() { }

  ngOnInit() {}

  requestMoney() {
    console.log('Request money clicked');
  }

  transferMoney() {
    console.log('Transfer money clicked');
  }

  monthChanged(event: any) {
    this.selectedMonth.set(event.detail.value);
    // TODO: Fetch new data based on selected month
    console.log('Selected month:', this.selectedMonth());
  }
}
