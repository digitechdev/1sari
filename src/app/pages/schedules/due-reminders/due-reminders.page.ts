import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-due-reminders',
  templateUrl: './due-reminders.page.html',
  styleUrls: ['./due-reminders.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DueRemindersPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
