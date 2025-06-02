import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-disbursement',
  templateUrl: './disbursement.page.html',
  styleUrls: ['./disbursement.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DisbursementPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
