import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-missed-payments',
  templateUrl: './missed-payments.page.html',
  styleUrls: ['./missed-payments.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MissedPaymentsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
