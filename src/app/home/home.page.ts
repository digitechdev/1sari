import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { HeaderComponent } from '../components/header/header.component';
import { IncomeWidgetComponent } from '../components/income-widget/income-widget.component';
import { ExpensesWidgetComponent } from '../components/expenses-widget/expenses-widget.component';
import { BalanceWidgetComponent } from '../components/balance-widget/balance-widget.component';
import { MyPocketWidgetComponent } from '../components/my-pocket-widget/my-pocket-widget.component';
import { TransactionsWidgetComponent } from '../components/transactions-widget/transactions-widget.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, // Ionic components
    HeaderComponent,
    IncomeWidgetComponent,
    ExpensesWidgetComponent,
    BalanceWidgetComponent,
    MyPocketWidgetComponent,
    TransactionsWidgetComponent // Custom widget components
  ],
})
export class HomePage {
  constructor() {}
}
