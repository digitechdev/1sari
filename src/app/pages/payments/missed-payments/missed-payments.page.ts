import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonMenuButton, 
  IonButton, 
  IonIcon, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  timeOutline,
  calendarOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-missed-payments',
  templateUrl: './missed-payments.page.html',
  styleUrls: ['./missed-payments.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonMenuButton, 
    IonButton, 
    IonIcon, 
    IonSegment, 
    IonSegmentButton, 
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent
  ]
})
export class MissedPaymentsPage implements OnInit {
  private router = inject(Router);

  constructor() {
    // Register icons
    addIcons({
      addOutline,
      timeOutline,
      calendarOutline,
      alertCircleOutline
    });
  }

  ngOnInit() {
  }

  navigateToPaymentSection(event: any) {
    const section = event.detail.value;
    switch (section) {
      case 'history':
        this.router.navigate(['/payments/history']);
        break;
      case 'upcoming':
        this.router.navigate(['/payments/upcoming']);
        break;
      case 'missed':
        this.router.navigate(['/payments/missed']);
        break;
      default:
        this.router.navigate(['/payments/history']);
    }
  }
}
