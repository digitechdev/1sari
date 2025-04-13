import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonLabel, IonChip, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { walletOutline, heartOutline, diamondOutline, trendingUpOutline, receiptOutline, flameOutline } from 'ionicons/icons'; // Placeholder icons

interface Pocket {
  name: string;
  amount: number;
  icon: string;
}

@Component({
  selector: 'app-my-pocket-widget',
  templateUrl: './my-pocket-widget.component.html',
  styleUrls: ['./my-pocket-widget.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonLabel, IonChip, IonIcon, IonButton
  ]
})
export class MyPocketWidgetComponent implements OnInit {

  selectedFilter = signal<string>('All');
  pockets = signal<Pocket[]>([
    { name: 'Pocket', amount: 1321.00, icon: 'wallet-outline' },
    { name: 'Parent', amount: 50.50, icon: 'heart-outline' },
    { name: 'Expenditure', amount: 100.00, icon: 'receipt-outline' },
    { name: 'Giving', amount: 20.00, icon: 'diamond-outline' },
    // Add more based on image if needed (emoji mapping might be tricky)
  ]);

  filters = ['All', 'Investation', 'Monthly fee', 'Expenditure']; // Match image

  constructor() {
     addIcons({ walletOutline, heartOutline, diamondOutline, trendingUpOutline, receiptOutline, flameOutline }); // Add all icons used
   }

  ngOnInit() {}

  selectFilter(filter: string) {
    this.selectedFilter.set(filter);
    // TODO: Filter pocket data based on selection
    console.log('Selected filter:', filter);
  }

  seeAll() {
    console.log('See All Pockets clicked');
  }
}
