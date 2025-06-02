import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.page.html',
  styleUrls: ['./activity-logs.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ActivityLogsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
